const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const STORAGE_DIR = path.join(__dirname, "storage");
const EVENTS_FILE = path.join(STORAGE_DIR, "usage-events.json");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);

const ROLE_LABELS = {
  resident: "研修医",
  senior_resident: "専攻医",
  doctor: "医師",
  nurse: "看護師",
  other: "その他",
  unknown: "未選択",
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    await route(req, res, url);
  } catch (error) {
    console.error(error);
    sendJson(res, error.status || 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Quiz-TKHER backend: http://${HOST}:${PORT}/admin`);
  console.log(`Quiz-TKHER app:     http://${HOST}:${PORT}/`);
});

async function route(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/categories") {
    sendJson(res, 200, await loadCategoriesWithCounts());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/stats") {
    const [categories, events] = await Promise.all([loadCategoriesWithCounts(), readEvents()]);
    sendJson(res, 200, buildStats(categories, events));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/events") {
    const event = await readJsonBody(req);
    const saved = await saveUsageEvent(event);
    sendJson(res, 201, saved);
    return;
  }

  const questionMatch = url.pathname.match(/^\/api\/questions\/([a-zA-Z0-9_-]+)$/);
  if (questionMatch && req.method === "GET") {
    const data = await getCategoryQuestions(questionMatch[1]);
    sendJson(res, 200, data);
    return;
  }

  if (questionMatch && req.method === "POST") {
    const category = await findCategory(questionMatch[1]);
    const payload = await readJsonBody(req);
    const result = await updateQuestions(category, payload);
    sendJson(res, 200, result);
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin") {
    await sendFile(res, path.join(__dirname, "admin.html"));
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.css") {
    await sendFile(res, path.join(__dirname, "admin.css"));
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.js") {
    await sendFile(res, path.join(__dirname, "admin.js"));
    return;
  }

  if (req.method === "GET") {
    await sendPublicFile(res, url.pathname);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

async function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const content = await fs.readFile(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  res.end(content);
}

async function sendPublicFile(res, requestPath) {
  const cleanPath = requestPath === "/" ? "/index.html" : decodeURIComponent(requestPath);
  const resolved = path.resolve(ROOT_DIR, `.${cleanPath}`);
  if (!resolved.startsWith(ROOT_DIR) || resolved.startsWith(__dirname)) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }
  try {
    await sendFile(res, resolved);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1024 * 1024 * 5) throw new Error("Request body too large");
  }
  try {
    return JSON.parse(body || "{}");
  } catch {
    const error = new Error("Invalid JSON");
    error.status = 400;
    throw error;
  }
}

async function buildQuestionIndex() {
  const categoriesRaw = JSON.parse(await fs.readFile(path.join(DATA_DIR, "categories.json"), "utf8"));
  const validCategoryIds = new Set(categoriesRaw.map((c) => c.id));

  const primaryByFile = new Map();
  for (const cat of categoriesRaw) {
    if (!primaryByFile.has(cat.file)) primaryByFile.set(cat.file, cat.id);
  }

  const fileData = new Map();
  await Promise.all(
    Array.from(primaryByFile.keys()).map(async (file) => {
      const data = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8"));
      fileData.set(file, data);
    }),
  );

  const aggregated = new Map(categoriesRaw.map((c) => [c.id, []]));
  for (const [file, primaryId] of primaryByFile) {
    const data = fileData.get(file);
    for (const q of data.questions) {
      const targets = resolveQuestionCategories(q, primaryId, validCategoryIds, file);
      for (const t of targets) aggregated.get(t).push(q);
    }
  }

  return { categoriesRaw, aggregated, validCategoryIds, primaryByFile };
}

function resolveQuestionCategories(question, primaryId, validCategoryIds, fileLabel) {
  if (!Array.isArray(question.categories) || question.categories.length === 0) {
    return [primaryId];
  }
  const targets = [];
  for (const t of question.categories) {
    if (typeof t !== "string" || !validCategoryIds.has(t)) {
      console.warn(`[questions] ${fileLabel} ${question.id}: unknown category "${t}" — skipped`);
      continue;
    }
    if (!targets.includes(t)) targets.push(t);
  }
  if (!targets.includes(primaryId)) targets.push(primaryId);
  return targets;
}

async function loadCategoriesWithCounts() {
  const { categoriesRaw, aggregated } = await buildQuestionIndex();
  return categoriesRaw.map((cat) => ({
    ...cat,
    questionTotal: aggregated.get(cat.id).length,
  }));
}

async function findCategory(categoryId) {
  const categories = await loadCategoriesWithCounts();
  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    const error = new Error(`Unknown category: ${categoryId}`);
    error.status = 404;
    throw error;
  }
  return category;
}

async function readQuestionData(category) {
  return JSON.parse(await fs.readFile(path.join(DATA_DIR, category.file), "utf8"));
}

async function getCategoryQuestions(categoryId) {
  const { categoriesRaw, aggregated } = await buildQuestionIndex();
  const cat = categoriesRaw.find((c) => c.id === categoryId);
  if (!cat) {
    const error = new Error(`Unknown category: ${categoryId}`);
    error.status = 404;
    throw error;
  }
  return { category: cat.name, questions: aggregated.get(categoryId) };
}

async function updateQuestions(category, payload) {
  const { mode, questions } = normalizeQuestionPayload(payload);
  const { validCategoryIds } = await buildQuestionIndex();
  questions.forEach((q, i) => validateQuestion(q, i, category.id, validCategoryIds));

  const current = await readQuestionData(category);
  const nextQuestions = mode === "replace" ? questions : current.questions.concat(questions);
  const nextData = {
    category: current.category || category.name,
    questions: nextQuestions,
  };
  await fs.writeFile(path.join(DATA_DIR, category.file), `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  return {
    categoryId: category.id,
    mode,
    added: questions.length,
    total: nextQuestions.length,
  };
}

function normalizeQuestionPayload(payload) {
  const mode = payload.mode === "replace" ? "replace" : "append";
  let questions = payload.questions;
  if (Array.isArray(payload)) questions = payload;
  if (payload.question) questions = [payload.question];
  if (!Array.isArray(questions)) {
    const error = new Error("Paste an array, { questions: [...] }, or { question: {...} }");
    error.status = 400;
    throw error;
  }
  return { mode, questions };
}

function validateQuestion(question, index, primaryCategoryId, validCategoryIds) {
  const prefix = `Question ${index + 1}`;
  if (!question || typeof question !== "object") throw new Error(`${prefix}: object required`);
  if (!question.id || typeof question.id !== "string") throw new Error(`${prefix}: id required`);
  if (!question.question || typeof question.question !== "string") throw new Error(`${prefix}: question required`);
  if (!Array.isArray(question.choices) || question.choices.length !== 5) {
    throw new Error(`${prefix}: choices must have exactly 5 items`);
  }
  const answerIndexes = getQuestionAnswerIndexes(question);
  if (!answerIndexes.length) {
    throw new Error(`${prefix}: answer must be 0-4 or answers must contain 0-4 indexes`);
  }
  const uniqueAnswers = new Set(answerIndexes);
  if (uniqueAnswers.size !== answerIndexes.length) {
    throw new Error(`${prefix}: answers must not contain duplicates`);
  }
  if (answerIndexes.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 4)) {
    throw new Error(`${prefix}: answer must be 0-4 or answers must contain 0-4 indexes`);
  }
  if (question.selectCount !== undefined) {
    if (!Number.isInteger(question.selectCount) || question.selectCount < 1 || question.selectCount > 5) {
      throw new Error(`${prefix}: selectCount must be 1-5`);
    }
    if (question.selectCount !== answerIndexes.length) {
      throw new Error(`${prefix}: selectCount must match the number of correct answers`);
    }
  }
  if (question.categories !== undefined) {
    if (!Array.isArray(question.categories) || question.categories.length === 0) {
      throw new Error(`${prefix}: categories must be a non-empty array of category IDs`);
    }
    for (const c of question.categories) {
      if (typeof c !== "string") {
        throw new Error(`${prefix}: categories must contain strings`);
      }
      if (validCategoryIds && !validCategoryIds.has(c)) {
        throw new Error(`${prefix}: unknown category "${c}"`);
      }
    }
    if (primaryCategoryId && !question.categories.includes(primaryCategoryId)) {
      throw new Error(`${prefix}: categories must include the primary category "${primaryCategoryId}"`);
    }
  }
  if (!question.explanation || typeof question.explanation !== "string") {
    throw new Error(`${prefix}: explanation required`);
  }
}

function getQuestionAnswerIndexes(question) {
  const raw = Object.prototype.hasOwnProperty.call(question, "answers")
    ? question.answers
    : question.answer;
  return Array.isArray(raw) ? raw : [raw];
}

async function ensureStorage() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  try {
    await fs.access(EVENTS_FILE);
  } catch {
    await fs.writeFile(EVENTS_FILE, "[]\n", "utf8");
  }
}

async function readEvents() {
  await ensureStorage();
  return JSON.parse(await fs.readFile(EVENTS_FILE, "utf8"));
}

async function writeEvents(events) {
  await ensureStorage();
  await fs.writeFile(EVENTS_FILE, `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

async function saveUsageEvent(event) {
  const events = await readEvents();
  const saved = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    roleId: event.roleId || "unknown",
    roleName: ROLE_LABELS[event.roleId] || event.roleName || ROLE_LABELS.unknown,
    categoryId: event.categoryId || "unknown",
    categoryName: event.categoryName || "不明",
    questionCount: Number(event.questionCount || 0),
    score: Number(event.score || 0),
    totalTimeMs: Number(event.totalTimeMs || 0),
    timestamp: Number(event.timestamp || Date.now()),
    completedAt: event.completedAt || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    appVersion: event.appVersion || "unknown",
  };
  events.push(saved);
  await writeEvents(events.slice(-5000));
  return saved;
}

function buildStats(categories, events) {
  const byCategory = new Map(categories.map((category) => [category.id, {
    categoryId: category.id,
    categoryName: category.name,
    attempts: 0,
    totalScore: 0,
    totalQuestions: 0,
    totalTimeMs: 0,
    roles: {},
  }]));
  const byRole = new Map(Object.entries(ROLE_LABELS).map(([roleId, roleName]) => [roleId, {
    roleId,
    roleName,
    attempts: 0,
    totalScore: 0,
    totalQuestions: 0,
    totalTimeMs: 0,
  }]));

  events.forEach((event) => {
    const categoryStats = byCategory.get(event.categoryId) || {
      categoryId: event.categoryId,
      categoryName: event.categoryName,
      attempts: 0,
      totalScore: 0,
      totalQuestions: 0,
      totalTimeMs: 0,
      roles: {},
    };
    const roleId = event.roleId || "unknown";
    const roleName = ROLE_LABELS[roleId] || event.roleName || ROLE_LABELS.unknown;
    const score = Number(event.score || 0);
    const questionCount = Number(event.questionCount || 0);

    categoryStats.attempts += 1;
    categoryStats.totalScore += score;
    categoryStats.totalQuestions += questionCount;
    categoryStats.totalTimeMs += Number(event.totalTimeMs || 0);
    categoryStats.roles[roleId] = categoryStats.roles[roleId] || { roleId, roleName, attempts: 0 };
    categoryStats.roles[roleId].attempts += 1;
    byCategory.set(event.categoryId, categoryStats);

    const roleStats = byRole.get(roleId) || { roleId, roleName, attempts: 0, totalScore: 0, totalQuestions: 0, totalTimeMs: 0 };
    roleStats.attempts += 1;
    roleStats.totalScore += score;
    roleStats.totalQuestions += questionCount;
    roleStats.totalTimeMs += Number(event.totalTimeMs || 0);
    byRole.set(roleId, roleStats);
  });

  const decorate = (item) => ({
    ...item,
    accuracy: item.totalQuestions ? item.totalScore / item.totalQuestions : 0,
    averageTimeMs: item.attempts ? Math.round((item.totalTimeMs || 0) / item.attempts) : 0,
  });

  return {
    totalAttempts: events.length,
    byCategory: Array.from(byCategory.values()).map(decorate),
    byRole: Array.from(byRole.values()).map(decorate),
    recent: events.slice(-30).reverse(),
  };
}
