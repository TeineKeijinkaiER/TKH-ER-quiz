const STORAGE_KEY = "qqq_state_v1";
const STORAGE_SCHEMA_VERSION = 2;
const LOCAL_BACKEND_EVENT_URL = "http://127.0.0.1:8787/api/events";
const QUESTION_SECONDS = 20;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 52;
const NEXT_QUESTION_DELAY_MS = 950;

// ──────────────────────────────────────────────────────────────────────────────
// Quiz music: level × urgency
// interval = ms per step (lower = faster/more tense)
// ──────────────────────────────────────────────────────────────────────────────
const QUIZ_MUSIC = {
  basic: {
    normal: { pattern: [523, 659, 784, 659, 523, 440, 523, 659], interval: 200, wave: "square",   gain: 0.022 },
    medium: { pattern: [523, 659, 784, 880, 784, 659, 523, 659], interval: 140, wave: "square",   gain: 0.026 },
    high:   { pattern: [784, 880, 988, 880, 784, 880, 784, 988], interval: 90,  wave: "square",   gain: 0.034 },
  },
  advanced: {
    normal: { pattern: [440, 523, 622, 698, 622, 523, 466, 523], interval: 185, wave: "sawtooth", gain: 0.020 },
    medium: { pattern: [440, 622, 784, 622, 440, 523, 622, 784], interval: 130, wave: "sawtooth", gain: 0.025 },
    high:   { pattern: [622, 784, 880, 784, 622, 784, 622, 880], interval: 85,  wave: "sawtooth", gain: 0.031 },
  },
  master: {
    // bass[] = freq per 4-step cycle; 0 = silent
    normal: { pattern: [220, 262, 294, 330, 294, 262, 247, 262], interval: 190, wave: "triangle", gain: 0.028, bass: [73, 0, 98,  0]  },
    medium: { pattern: [262, 294, 349, 294, 262, 294, 392, 349], interval: 145, wave: "sawtooth", gain: 0.034, bass: [73, 0, 98,  73] },
    high:   { pattern: [294, 349, 392, 440, 392, 349, 370, 392], interval: 85,  wave: "sawtooth", gain: 0.042, bass: [98, 73, 98, 110] },
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Opening music: DQ-inspired 3-voice arrangements (melody + counter + bass)
// Each level has its own key, tempo, chord progression, and drum pattern.
// 0 = rest. Step index loops through `barSteps`.
// ──────────────────────────────────────────────────────────────────────────────
const OPENING_MUSIC = {
  // BASIC — peaceful village (C major, ~86bpm), I-vi-IV-V progression
  basic: {
    intervalMs: 175,
    barSteps: 32,
    melody:      [523,0,659,0, 784,0,659,0,  440,0,523,0, 659,0,523,0,
                  440,0,523,0, 698,0,587,0,  494,0,587,0, 784,0,587,0],
    melodyWave: "triangle",
    melodyGain: 0.022,
    counter:     [262,0,0,0,   330,0,0,0,    220,0,0,0,   262,0,0,0,
                  175,0,0,0,   262,0,0,0,    196,0,0,0,   247,0,0,0],
    counterWave: "triangle",
    counterGain: 0.012,
    bass:        [65,0,0,0,    98,0,0,0,     110,0,0,0,   82,0,0,0,
                  87,0,0,0,    131,0,0,0,    98,0,0,0,    147,0,0,0],
    bassWave: "triangle",
    bassGain: 0.026,
    drums: null,
  },
  // ADVANCED — heroic adventure (A minor, ~107bpm), i-VI-III-VII progression
  advanced: {
    intervalMs: 140,
    barSteps: 32,
    melody:      [880,0,659,0, 523,0,440,0,  698,0,523,0, 440,0,523,0,
                  523,0,659,0, 784,0,659,0,  587,0,784,0, 587,0,494,0],
    melodyWave: "square",
    melodyGain: 0.022,
    counter:     [330,0,0,0,   262,0,0,0,    349,0,0,0,   262,0,0,0,
                  392,0,0,0,   330,0,0,0,    294,0,0,0,   247,0,0,0],
    counterWave: "triangle",
    counterGain: 0.014,
    bass:        [110,0,0,0,   82,0,0,0,     87,0,0,0,    131,0,0,0,
                  65,0,0,0,    98,0,0,0,     98,0,0,0,    147,0,0,0],
    bassWave: "triangle",
    bassGain: 0.028,
    drums: {
      kick:  new Set([0, 8, 16, 24]),
      snare: new Set([4, 12, 20, 28]),
      hihat: new Set([1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31]),
    },
  },
  // MASTER — battle theme (E minor, ~136bpm), i-VII-VI-V chromatic
  master: {
    intervalMs: 110,
    barSteps: 16,
    melody:      [659,784,494,784,  587,740,440,740,  523,659,392,659,  494,587,740,587],
    melodyWave: "sawtooth",
    melodyGain: 0.030,
    counter:     [330,0,392,0,      294,0,370,0,      262,0,330,0,      247,0,294,0],
    counterWave: "square",
    counterGain: 0.016,
    bass:        [82,0,82,0,        73,0,73,0,        65,0,65,0,        62,0,62,0],
    bassWave: "triangle",
    bassGain: 0.038,
    drums: {
      kick:  new Set([0, 8]),
      snare: new Set([4, 12]),
      hihat: new Set([2, 6, 10, 14]),
    },
  },
};

const state = {
  levels: [],
  selectedLevel: "basic",
  categories: [],
  questionBank: new Map(),
  selectedCategoryId: "",
  learnerRoleId: "",
  questionCount: 5,
  quizQuestions: [],
  currentIndex: 0,
  score: 0,
  reviewItems: [],
  startedAt: 0,
  timerId: 0,
  timerDeadline: 0,
  isLocked: false,
  lastTickSecond: null,
  lastScreen: "level",
  audioContext: null,
  musicLoopId: 0,
  musicStep: 0,
  musicGeneration: 0,
  musicMode: "",
  musicUrgency: "normal",
  wasCategoryClearAtStart: false,
  googleSheetsWebAppUrl: "",
  sendToLocalBackend: false,
  lang: "ja",
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  loadStoredState();
  bindEvents();
  bindFirstAudioGesture();
  setupTimerArc();

  try {
    await loadAppConfig();
    await loadQuestionData();
    renderLevelScreen();
    renderRankingTabs();
    applyI18n(state.lang);
    document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
      seg.classList.toggle("is-active", seg.dataset.lang === state.lang);
    });
  } catch (error) {
    els.setupStatus.textContent = t("errorLoadOffline", state.lang);
    console.error(error);
  }
}

async function loadAppConfig() {
  state.googleSheetsWebAppUrl = "";
  state.sendToLocalBackend = isLocalOrigin();
  try {
    const response = await fetch("data/app-config.json", { cache: "no-store" });
    if (!response.ok) return;
    const config = await response.json();
    const url = typeof config.googleSheetsWebAppUrl === "string" ? config.googleSheetsWebAppUrl.trim() : "";
    if (url && isGoogleAppsScriptWebAppUrl(url)) {
      state.googleSheetsWebAppUrl = url;
    }
    if (config.sendToLocalBackend === true) state.sendToLocalBackend = true;
    else if (config.sendToLocalBackend === false) state.sendToLocalBackend = false;
  } catch (error) {
    console.warn("app-config.json could not be loaded.", error);
  }
}

function cacheElements() {
  [
    "levelScreen", "levelGrid",
    "setupScreen", "quizScreen", "resultScreen", "rankingScreen", "clearScreen",
    "clearBanner", "clearTabs", "clearList",
    "categoryGrid", "selectedCategoryLabel", "setupStatus",
    "rankingButton", "muteButton",
    "clearButton", "closeClearButton",
    "quitQuizButton", "quizCategory", "quizProgress",
    "timerArc", "timerText", "questionText", "choiceList",
    "resultScore", "resultPercent", "resultTime", "resultComment", "syncStatus", "resultProgress",
    "retryButton", "backToSetupButton", "resultRankingButton",
    "toggleReviewButton", "reviewList",
    "rankingTabs", "rankingList", "rankingEmpty", "closeRankingButton",
    "resetRankingButton", "resetClearButton",
  ].forEach((id) => { els[id] = document.getElementById(id); });
}

function setLanguage(lang) {
  if (lang !== "ja" && lang !== "en") return;
  state.lang = lang;
  const data = readStore();
  data.lang = lang;
  writeStore(data);
  applyI18n(lang);
  updateMuteButton(readStore().muted);
  document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
    seg.classList.toggle("is-active", seg.dataset.lang === lang);
  });
  document.querySelectorAll("[data-count]").forEach((btn) => {
    btn.textContent = `${btn.dataset.count}${t("countSuffix", lang)}`;
  });
  loadQuestionData().then(() => {
    renderLevelScreen();
    renderRankingTabs();
    if (state.lastScreen === "setup") {
      renderCategories();
      renderQuestionCountControls();
      updateSetupSummary();
    }
  }).catch(console.error);
}

function bindEvents() {
  // Level buttons in setup panel
  document.querySelectorAll("[data-level]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLevel = button.dataset.level;
      const data = readStore();
      data.selectedLevel = state.selectedLevel;
      writeStore(data);
      updateLevelButtons();
      const levelCats = state.categories.filter((c) => c.level === state.selectedLevel);
      state.selectedCategoryId = levelCats[0]?.id || "";
      renderCategories();
      renderQuestionCountControls();
      updateSetupSummary();
      // Restart opening music with the new level's theme
      startOpeningMusic();
    });
  });

  document.querySelectorAll("[data-count]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.questionCount = Number(button.dataset.count);
      renderQuestionCountControls();
      updateSetupSummary();
    });
  });

  els.rankingButton.addEventListener("click", () => openRanking("all"));
  els.resultRankingButton.addEventListener("click", () => openRanking("all"));
  els.closeRankingButton.addEventListener("click", () => showScreen("level"));
  els.quitQuizButton.addEventListener("click", () => { stopTimer(); showScreen("level"); });
  els.retryButton.addEventListener("click", startQuiz);
  els.backToSetupButton.addEventListener("click", () => showScreen("level"));
  els.toggleReviewButton.addEventListener("click", toggleReview);
  els.clearButton.addEventListener("click", () => { renderClearScreen(); showScreen("clear"); });
  els.closeClearButton.addEventListener("click", () => showScreen("level"));
  document.querySelectorAll('input[name="learnerRole"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.learnerRoleId = input.value;
      const data = readStore();
      data.learnerRoleId = input.value;
      data.learnerRoleName = getLearnerRoleName();
      writeStore(data);
      updateSetupSummary();
    });
  });
  els.muteButton.addEventListener("click", toggleMute);
  document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
    seg.addEventListener("click", () => setLanguage(seg.dataset.lang));
  });
  els.resetRankingButton.addEventListener("click", () => {
    if (!window.confirm(t("confirmResetHistory", state.lang))) return;
    resetRankings();
    renderRanking(getActiveRankingTabId());
  });
  els.resetClearButton.addEventListener("click", () => {
    if (!window.confirm(t("confirmResetClear", state.lang))) return;
    resetClearProgress();
    renderClearScreen();
    renderLevelScreen();
    if (state.selectedLevel) renderCategories();
  });
}

function getActiveRankingTabId() {
  const active = document.querySelector("#rankingTabs .tab-button.is-active");
  return active?.dataset.tabId || "all";
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS audio unlock: create + resume AudioContext within the user gesture
// (iOS Safari blocks AudioContext until a gesture; touchstart fires before
//  pointerdown on iOS, so we register both for maximum compatibility)
// ──────────────────────────────────────────────────────────────────────────────
function bindFirstAudioGesture() {
  const unlock = () => {
    // Create the AudioContext synchronously inside the gesture handler
    if (!state.audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) state.audioContext = new Ctx();
    }
    if (state.audioContext) {
      // resume() must be called within the gesture on iOS
      state.audioContext.resume()
        .then(() => { if (!state.musicLoopId) startOpeningMusic(); })
        .catch(() => {});
    }
  };
  document.addEventListener("touchstart", unlock, { once: true, passive: true });
  document.addEventListener("pointerdown", unlock, { once: true, passive: true });
  document.addEventListener("keydown",     unlock, { once: true });
}

async function loadQuestionData() {
  const [levelsRes, categoriesRes] = await Promise.all([
    fetch("data/levels.json", { cache: "no-store" }),
    fetch(`data/categories.${state.lang}.json`, { cache: "no-store" }),
  ]);
  if (!levelsRes.ok) throw new Error(`levels.json ${levelsRes.status}`);
  if (!categoriesRes.ok) throw new Error(`categories.${state.lang}.json ${categoriesRes.status}`);
  state.levels = await levelsRes.json();
  const categories = await categoriesRes.json();

  const validCategoryIds = new Set(categories.map((c) => c.id));
  state.questionBank = new Map(categories.map((c) => [c.id, []]));

  const primaryByFile = new Map();
  categories.forEach((cat) => {
    if (!primaryByFile.has(cat.file)) primaryByFile.set(cat.file, cat.id);
  });

  const unavailableFiles = new Set();
  await Promise.all(
    Array.from(primaryByFile.entries()).map(async ([file, primaryId]) => {
      const res = await fetch(`data/${file}`, { cache: "no-store" });
      if (!res.ok) {
        unavailableFiles.add(file);
        console.warn(`[questions] ${file} could not be loaded (${res.status}). Category skipped.`);
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch (error) {
        unavailableFiles.add(file);
        console.warn(`[questions] ${file} contains invalid JSON. Category skipped.`, error);
        return;
      }
      if (!Array.isArray(data.questions)) {
        unavailableFiles.add(file);
        console.warn(`[questions] ${file} does not contain a questions array. Category skipped.`);
        return;
      }
      for (const q of data.questions) {
        const targets = resolveQuestionCategories(q, primaryId, validCategoryIds, file);
        for (const t of targets) state.questionBank.get(t).push(q);
      }
    }),
  );

  state.categories = categories.filter((cat) => !unavailableFiles.has(cat.file));
  unavailableFiles.forEach((file) => {
    categories
      .filter((cat) => cat.file === file)
      .forEach((cat) => state.questionBank.delete(cat.id));
  });

  state.categories.forEach((cat) => {
    cat.questionTotal = state.questionBank.get(cat.id).length;
  });
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

// ─── Level helpers ────────────────────────────────────────────────────────────

function updateLevelButtons() {
  document.querySelectorAll("[data-level]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.level === state.selectedLevel);
  });
}

function renderLevelScreen() {
  els.levelGrid.innerHTML = "";
  state.levels.forEach((level) => {
    const levelCats = state.categories.filter((c) => c.level === level.id);
    const clearedCount = levelCats.filter((c) => isClear(c.id)).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "level-card" + (level.id === state.selectedLevel ? " is-selected-level" : "");
    const nameEl = document.createElement("span");
    nameEl.className = "level-card__name";
    nameEl.textContent = level.name;
    const clearEl = document.createElement("span");
    clearEl.className = "level-card__clear";
    clearEl.textContent = `${clearedCount} / ${levelCats.length} ${t("levelClearSuffix", state.lang)}`;
    card.append(nameEl, clearEl);
    card.addEventListener("click", () => {
      state.selectedLevel = level.id;
      const data = readStore();
      data.selectedLevel = level.id;
      writeStore(data);
      updateLevelButtons();
      const cats = state.categories.filter((c) => c.level === level.id);
      state.selectedCategoryId = cats[0]?.id || "";
      renderCategories();
      renderQuestionCountControls();
      updateSetupSummary();
      showScreen("setup");
    });
    els.levelGrid.appendChild(card);
  });
}

// ─── Category rendering ───────────────────────────────────────────────────────

function renderCategories() {
  els.categoryGrid.innerHTML = "";
  state.categories
    .filter((c) => c.level === state.selectedLevel)
    .forEach((category) => {
      const cleared = isClear(category.id);
      const progress = getCategoryProgress(category.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-card" + (cleared ? " is-cleared" : "");
      button.style.borderTopColor = category.accent || "var(--primary)";
      button.setAttribute("aria-pressed", String(category.id === state.selectedCategoryId));
      button.dataset.categoryId = category.id;
      const title = document.createElement("h3");
      title.textContent = category.name;
      const meta = document.createElement("div");
      meta.className = "card-meta";
      const progressLabel = progress.total > 0
        ? `<span class="card-progress">${progress.answered} / ${progress.total} ${t("cardProgressLabel", state.lang)}</span>`
        : "";
      meta.innerHTML = `<span>${category.questionTotal}${t("countSuffix", state.lang)}</span><span>20${t("cardTimeLimitLabel", state.lang)}</span>${progressLabel}`;
      if (cleared) {
        const badge = document.createElement("span");
        badge.className = "clear-badge";
        badge.textContent = t("clearBadge", state.lang);
        meta.appendChild(badge);
      }
      button.append(title, meta);
      button.addEventListener("click", () => {
        state.selectedCategoryId = category.id;
        renderQuestionCountControls();
        updateSetupSummary();
        startQuiz();
      });
      els.categoryGrid.appendChild(button);
    });
  updateSelectedCard();
}

function updateSelectedCard() {
  document.querySelectorAll(".category-card").forEach((card) => {
    const sel = card.dataset.categoryId === state.selectedCategoryId;
    card.classList.toggle("is-selected", sel);
    card.setAttribute("aria-pressed", String(sel));
  });
}

function renderQuestionCountControls() {
  const total = getSelectedQuestions().length;
  const buttons = [...document.querySelectorAll("[data-count]")];
  const counts = buttons.map((button) => Number(button.dataset.count)).sort((a, b) => a - b);
  if (total > 0 && state.questionCount > total) {
    state.questionCount = counts.filter((count) => count <= total).pop() || total;
  }
  buttons.forEach((button) => {
    const count = Number(button.dataset.count);
    button.disabled = total > 0 && count > total;
    button.classList.toggle("is-active", count === state.questionCount);
  });
}

function updateSetupSummary() {
  const category = getSelectedCategory();
  els.selectedCategoryLabel.textContent = category ? `${category.name} / ${state.questionCount}${t("countSuffix", state.lang)}` : t("noSelection", state.lang);
  els.setupStatus.textContent = state.learnerRoleId ? "" : t("roleSelectPrompt", state.lang);
}

function getSelectedCategory() {
  return state.categories.find((c) => c.id === state.selectedCategoryId);
}

function getSelectedQuestions() {
  return state.questionBank.get(state.selectedCategoryId) || [];
}

// ─── Clear tracking ───────────────────────────────────────────────────────────
// v2: a category counts as "cleared" only when every question in it has been
// answered correctly at least once across all sessions (cumulative). Once a
// question is correct, it stays correct until the user resets progress.

function getCategoryProgress(categoryId) {
  const questions = state.questionBank.get(categoryId) || [];
  const correct = readStore().correctQuestions || {};
  const answered = questions.reduce((acc, q) => acc + (correct[q.id] ? 1 : 0), 0);
  return { answered, total: questions.length };
}

function isClear(categoryId) {
  const { answered, total } = getCategoryProgress(categoryId);
  return total > 0 && answered === total;
}

function recordCorrectQuestion(questionId) {
  if (!questionId) return;
  const data = readStore();
  if (data.correctQuestions[questionId]) return;
  data.correctQuestions[questionId] = new Date().toISOString();
  writeStore(data);
}

function recordClearTimestamp(categoryId, levelId) {
  const key = `${levelId}:${categoryId}`;
  const data = readStore();
  if (data.clears[key]) return false;
  data.clears[key] = new Date().toISOString();
  writeStore(data);
  return true;
}

function resetRankings() {
  const data = readStore();
  data.rankings = [];
  writeStore(data);
}

function resetClearProgress() {
  const data = readStore();
  data.clears = {};
  data.correctQuestions = {};
  writeStore(data);
}

// ─── Quiz flow ────────────────────────────────────────────────────────────────

function startQuiz() {
  const category = getSelectedCategory();
  const sourceQuestions = getSelectedQuestions();
  if (!category || sourceQuestions.length === 0) {
    els.setupStatus.textContent = t("errorCategoryLoad", state.lang); return;
  }
  if (state.questionCount > sourceQuestions.length) {
    els.setupStatus.textContent = t("errorInsufficientQuestions", state.lang); return;
  }
  if (!state.learnerRoleId) {
    els.setupStatus.textContent = t("roleSelectPrompt", state.lang); return;
  }
  state.wasCategoryClearAtStart = isClear(category.id);
  ensureAudioContext();
  persistLearnerRole();
  state.quizQuestions = shuffle(sourceQuestions).slice(0, state.questionCount).map(prepareQuestion);
  state.currentIndex = 0;
  state.score = 0;
  state.reviewItems = [];
  state.startedAt = Date.now();
  state.isLocked = false;
  state.lastTickSecond = null;
  state.musicUrgency = "normal";
  els.quizCategory.textContent = category.name;
  showScreen("quiz");
  renderCurrentQuestion();
}

function prepareQuestion(question) {
  const choices = question.choices.map((text, index) => ({ text, originalIndex: index }));
  const shuffled = shuffle(choices);
  const originalCorrectIndexes = getQuestionAnswerIndexes(question);
  const correctIndexes = shuffled
    .map((choice, index) => (originalCorrectIndexes.includes(choice.originalIndex) ? index : -1))
    .filter((index) => index >= 0);
  const selectionLimit = Number.isInteger(question.selectCount) && question.selectCount > 0
    ? question.selectCount
    : null;
  return {
    id: question.id,
    question: question.question,
    explanation: question.explanation,
    choices: shuffled.map((c) => c.text),
    correctIndexes,
    selectionLimit,
    selectedIndexes: [],
    isMultiple: correctIndexes.length > 1,
  };
}

function getQuestionAnswerIndexes(question) {
  return normalizeIndexList(question.answers);
}

function renderCurrentQuestion() {
  stopTimer();
  state.isLocked = false;
  state.lastTickSecond = null;
  const question = state.quizQuestions[state.currentIndex];
  question.selectedIndexes = [];
  els.quizProgress.textContent = `${state.currentIndex + 1} / ${state.quizQuestions.length}`;
  els.questionText.textContent = question.question;
  els.choiceList.innerHTML = "";
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    if (question.isMultiple) {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => toggleMultipleChoice(index));
    } else {
      button.addEventListener("click", () => handleAnswer(index, false));
    }
    const key = document.createElement("span");
    key.className = "choice-key";
    key.textContent = String(index + 1);
    const text = document.createElement("span");
    text.textContent = choice;
    button.append(key, text);
    els.choiceList.appendChild(button);
  });
  if (question.isMultiple) {
    const actions = document.createElement("div");
    actions.className = "choice-actions";
    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "primary-button answer-submit-button";
    submit.addEventListener("click", () => handleAnswer(question.selectedIndexes.slice(), false));
    actions.appendChild(submit);
    els.choiceList.appendChild(actions);
    updateMultipleChoiceState();
  }
  startTimer();
}

function toggleMultipleChoice(choiceIndex) {
  if (state.isLocked) return;
  const question = state.quizQuestions[state.currentIndex];
  if (!question?.isMultiple) return;
  const selected = new Set(question.selectedIndexes);
  if (selected.has(choiceIndex)) {
    selected.delete(choiceIndex);
  } else if (!question.selectionLimit || selected.size < question.selectionLimit) {
    selected.add(choiceIndex);
  }
  question.selectedIndexes = [...selected].sort((a, b) => a - b);
  updateMultipleChoiceState();
}

function updateMultipleChoiceState() {
  const question = state.quizQuestions[state.currentIndex];
  if (!question?.isMultiple) return;
  const selected = new Set(question.selectedIndexes);
  const limitReached = Boolean(question.selectionLimit && selected.size >= question.selectionLimit);
  els.choiceList.querySelectorAll(".choice-button").forEach((button, index) => {
    const isSelected = selected.has(index);
    const limitDisabled = limitReached && !isSelected;
    button.classList.toggle("is-selected", isSelected);
    button.classList.toggle("is-limit-disabled", limitDisabled);
    button.setAttribute("aria-pressed", String(isSelected));
    button.disabled = limitDisabled;
  });
  const submit = els.choiceList.querySelector(".answer-submit-button");
  if (!submit) return;
  const selectedCount = question.selectedIndexes.length;
  const requiredCount = question.selectionLimit || 0;
  submit.disabled = requiredCount > 0 ? selectedCount !== requiredCount : selectedCount === 0;
  submit.textContent = requiredCount > 0
    ? `${t("answerSubmitLabel", state.lang)} (${selectedCount}/${requiredCount})`
    : `${t("answerSubmitLabel", state.lang)} (${selectedCount} ${t("answerSelected", state.lang)})`;
}

function startTimer() {
  state.timerDeadline = Date.now() + QUESTION_SECONDS * 1000;
  updateTimerDisplay();
  state.timerId = window.setInterval(updateTimerDisplay, 100);
  startQuizMusic();
}

function stopTimer() {
  if (state.timerId) { window.clearInterval(state.timerId); state.timerId = 0; }
  stopMusicLoop();
}

function setupTimerArc() {
  els.timerArc.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);
  els.timerArc.style.strokeDashoffset = "0";
}

function updateTimerDisplay() {
  const remainingMs = Math.max(0, state.timerDeadline - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const offset = TIMER_CIRCUMFERENCE * (1 - remainingMs / (QUESTION_SECONDS * 1000));
  const timer = els.timerText.closest(".timer");

  els.timerText.textContent = String(remainingSeconds);
  els.timerArc.style.strokeDashoffset = String(offset);
  timer.classList.toggle("is-warning", remainingSeconds <= 5 && remainingSeconds > 3);
  timer.classList.toggle("is-danger", remainingSeconds <= 3);

  if (remainingSeconds > 0 && remainingSeconds <= 3 && remainingSeconds !== state.lastTickSecond) {
    state.lastTickSecond = remainingSeconds;
    playTone("tick");
  }

  // Escalate quiz music urgency as time runs out
  if (remainingMs > 0 && state.musicMode === "quiz") {
    const secs = Math.floor(remainingMs / 1000);
    if (secs < 5 && state.musicUrgency !== "high") {
      state.musicUrgency = "high";
      startQuizMusic();
    } else if (secs < 10 && state.musicUrgency === "normal") {
      state.musicUrgency = "medium";
      startQuizMusic();
    }
  }

  if (remainingMs <= 0) handleAnswer(null, true);
}

function handleAnswer(choiceIndexes, timedOut) {
  if (state.isLocked) return;
  state.isLocked = true;
  stopTimer();
  const question = state.quizQuestions[state.currentIndex];
  const selectedIndexes = normalizeIndexList(Array.isArray(choiceIndexes) ? choiceIndexes : [choiceIndexes]);
  const correct = hasSameIndexes(selectedIndexes, question.correctIndexes);
  if (correct) {
    state.score += 1;
    recordCorrectQuestion(question.id);
  }
  state.reviewItems.push({
    question: question.question,
    choices: question.choices.slice(),
    selectedIndexes,
    correctIndexes: question.correctIndexes.slice(),
    explanation: question.explanation,
    isCorrect: correct,
    timedOut,
  });
  renderChoiceFeedback(selectedIndexes, question.correctIndexes);
  playTone(correct ? "correct" : "wrong");
  window.setTimeout(() => {
    state.currentIndex += 1;
    if (state.currentIndex >= state.quizQuestions.length) {
      finishQuiz();
    } else {
      state.musicUrgency = "normal";
      renderCurrentQuestion();
    }
  }, NEXT_QUESTION_DELAY_MS);
}

function renderChoiceFeedback(selectedIndexes, correctIndexes) {
  const selectedSet = new Set(normalizeIndexList(selectedIndexes));
  const correctSet = new Set(normalizeIndexList(correctIndexes));
  els.choiceList.querySelectorAll(".choice-button").forEach((button, index) => {
    button.disabled = true;
    button.classList.remove("is-limit-disabled");
    if (correctSet.has(index)) button.classList.add("is-correct");
    if (selectedSet.has(index) && !correctSet.has(index)) {
      button.classList.add("is-wrong");
    }
  });
}

function finishQuiz() {
  stopTimer();
  const totalTimeMs = Date.now() - state.startedAt;
  const category = getSelectedCategory();
  const result = {
    roleId: state.learnerRoleId,
    roleName: getLearnerRoleName(),
    categoryId: category.id,
    categoryName: category.name,
    questionCount: state.quizQuestions.length,
    score: state.score,
    totalTimeMs,
    timestamp: Date.now(),
  };
  addRanking(result);
  // correctQuestions has already been updated incrementally in handleAnswer.
  // Now check if this session pushed the category over the clear threshold.
  const categoryClearedThisSession = !state.wasCategoryClearAtStart && isClear(category.id);
  const showClearBanner = categoryClearedThisSession && result.score === result.questionCount;
  if (categoryClearedThisSession) recordClearTimestamp(category.id, state.selectedLevel);
  const progress = getCategoryProgress(category.id);
  renderResult(result, { showClearBanner, progress });
  showScreen("result");
  sendResultToBackend(result);
  playTone("finish");
}

function renderResult(result, { showClearBanner, progress }) {
  const percent = Math.round((result.score / result.questionCount) * 100);
  els.resultScore.textContent = `${result.score} / ${result.questionCount}`;
  els.resultPercent.textContent = `${percent}%`;
  els.resultTime.textContent = `${t("resultTimePrefix", state.lang)}${formatTime(result.totalTimeMs)}`;
  els.resultComment.textContent = getResultComment(percent);
  renderResultStatus(showClearBanner);
  if (els.resultProgress) {
    if (progress && progress.total > 0) {
      const remaining = progress.total - progress.answered;
      els.resultProgress.hidden = false;
      els.resultProgress.textContent = remaining === 0
        ? `${t("resultProgressPrefix", state.lang)}${progress.answered} / ${progress.total} ${t("resultProgressFull", state.lang)}`
        : `${t("resultProgressPrefix", state.lang)}${progress.answered} / ${progress.total} ${t("resultProgressFull", state.lang)}${t("resultProgressAnd", state.lang)}${remaining} ${t("resultProgressPartialSuffix", state.lang)})`;
    } else {
      els.resultProgress.hidden = true;
    }
  }
  setSyncStatus("", "");
  renderReview();
  els.reviewList.hidden = false;
  els.toggleReviewButton.textContent = t("btnReviewToggleCollapse", state.lang);
  els.toggleReviewButton.setAttribute("aria-expanded", "true");
}

function renderResultStatus(showClearBanner) {
  const isClearResult = Boolean(showClearBanner);
  const heli = els.clearBanner.querySelector(".clear-banner__heli");
  const label = els.clearBanner.querySelector("span");
  els.clearBanner.hidden = false;
  els.clearBanner.classList.toggle("is-clear", isClearResult);
  els.clearBanner.classList.toggle("is-finish", !isClearResult);
  if (heli) heli.hidden = !isClearResult;
  if (label) label.textContent = isClearResult ? t("clearLabel", state.lang) : t("finishLabel", state.lang);
}

function renderReview() {
  els.reviewList.innerHTML = "";
  state.reviewItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = `review-card${item.isCorrect ? " is-correct" : ""}`;
    const title = document.createElement("h4");
    title.textContent = `Q${index + 1}. ${item.question}`;
    const user = document.createElement("p");
    user.className = "answer-line";
    user.textContent = item.timedOut
      ? `${t("userAnswerLabel", state.lang)}${t("userAnswerTimedOut", state.lang)}`
      : `${t("userAnswerLabel", state.lang)}${labelChoices(item.selectedIndexes, item.choices) || t("noSelection", state.lang)}`;
    const correct = document.createElement("p");
    correct.className = "answer-line";
    correct.textContent = `${t("correctAnswerLabel", state.lang)}${labelChoices(item.correctIndexes, item.choices)}`;
    const explanation = document.createElement("p");
    explanation.className = "explanation";
    explanation.textContent = item.explanation;
    card.append(title, user, correct, explanation);
    els.reviewList.appendChild(card);
  });
}

function labelChoice(index, text) {
  if (index === null || index === undefined || index < 0) return "";
  return `${index + 1}. ${text}`;
}

function labelChoices(indexes, choices) {
  return normalizeIndexList(indexes)
    .map((index) => labelChoice(index, choices[index]))
    .filter(Boolean)
    .join(t("choiceSeparator", state.lang));
}

function normalizeIndexList(indexes) {
  return [...new Set((indexes || []).filter(Number.isInteger))].sort((a, b) => a - b);
}

function hasSameIndexes(left, right) {
  const a = normalizeIndexList(left);
  const b = normalizeIndexList(right);
  return a.length === b.length && a.every((index, position) => index === b[position]);
}

function toggleReview() {
  const willShow = els.reviewList.hidden;
  els.reviewList.hidden = !willShow;
  els.toggleReviewButton.textContent = willShow ? t("btnReviewToggleCollapse", state.lang) : t("btnReviewToggleExpand", state.lang);
  els.toggleReviewButton.setAttribute("aria-expanded", String(willShow));
}

function openRanking(tabId) { renderRanking(tabId); showScreen("ranking"); }

function renderRankingTabs() {
  els.rankingTabs.innerHTML = "";
  const tabs = [{ id: "all", name: t("rankingAllTab", state.lang) }, ...state.categories.map((c) => ({ id: c.id, name: c.name }))];
  tabs.forEach((tab) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-button";
    button.role = "tab";
    button.dataset.tabId = tab.id;
    button.textContent = tab.name;
    button.addEventListener("click", () => renderRanking(tab.id));
    els.rankingTabs.appendChild(button);
  });
}

function renderRanking(activeTab) {
  const rankings = readStore().rankings || [];
  const filtered = activeTab === "all" ? rankings : rankings.filter((r) => r.categoryId === activeTab);
  const top = filtered.slice(0, 10);
  els.rankingList.innerHTML = "";
  els.rankingEmpty.hidden = top.length > 0;
  document.querySelectorAll(".tab-button").forEach((button) => {
    const active = button.dataset.tabId === activeTab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  top.forEach((record, index) => {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    rank.className = "rank-index";
    rank.textContent = String(index + 1);
    const body = document.createElement("span");
    const name = document.createElement("span");
    name.className = "rank-name";
    const roleKey = ROLE_I18N_KEY[record.roleId];
    name.textContent = (roleKey ? t(roleKey, state.lang) : record.roleName) || t("noSelection", state.lang);
    const meta = document.createElement("span");
    meta.className = "rank-meta";
    meta.textContent = `${record.categoryName} / ${record.questionCount}${t("countSuffix", state.lang)} / ${formatTime(record.totalTimeMs)} / ${formatDate(record.timestamp)}`;
    const score = document.createElement("span");
    score.className = "rank-score";
    score.textContent = `${record.score}/${record.questionCount}`;
    body.append(name, meta);
    item.append(rank, body, score);
    els.rankingList.appendChild(item);
  });
}

function renderClearScreen() {
  els.clearTabs.innerHTML = "";
  const clears = readStore().clears;
  let activeLevel = state.selectedLevel || (state.levels[0]?.id) || "basic";

  const renderClearList = (levelId) => {
    els.clearList.innerHTML = "";
    state.categories.filter((c) => c.level === levelId).forEach((cat) => {
      const cleared = isClear(cat.id);
      const progress = getCategoryProgress(cat.id);
      const clearDate = cleared ? (clears[`${levelId}:${cat.id}`] || null) : null;
      const item = document.createElement("div");
      item.className = "clear-item";
      const name = document.createElement("span");
      name.className = "clear-item__name";
      name.textContent = cat.name;
      const right = document.createElement("span");
      if (cleared) {
        const status = document.createElement("span");
        status.className = "clear-item__status";
        status.textContent = t("clearBadge", state.lang);
        right.appendChild(status);
        if (clearDate) {
          const date = document.createElement("span");
          date.className = "clear-item__date";
          date.textContent = new Intl.DateTimeFormat(t("dateLocale", state.lang), {
            month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
          }).format(new Date(clearDate));
          right.append(document.createTextNode(" "), date);
        }
      } else if (progress.total > 0) {
        right.className = "clear-item__progress";
        right.textContent = `${progress.answered} / ${progress.total} ${t("resultProgressFull", state.lang)}`;
      } else {
        right.className = "clear-item__empty";
        right.textContent = "－";
      }
      item.append(name, right);
      els.clearList.appendChild(item);
    });
  };

  state.levels.forEach((level) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-button";
    button.role = "tab";
    button.dataset.levelId = level.id;
    button.textContent = level.name;
    button.addEventListener("click", () => {
      activeLevel = level.id;
      document.querySelectorAll("#clearTabs .tab-button").forEach((b) => {
        const active = b.dataset.levelId === level.id;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      renderClearList(level.id);
    });
    const isActive = level.id === activeLevel;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    els.clearTabs.appendChild(button);
  });
  renderClearList(activeLevel);
}

function showScreen(name) {
  stopTimer(); // also stops music via stopMusicLoop()
  ["level", "setup", "quiz", "result", "ranking", "clear"].forEach((screenName) => {
    const element = els[`${screenName}Screen`];
    if (!element) return;
    element.hidden = screenName !== name;
    element.classList.toggle("is-active", screenName === name);
  });
  if (name !== "ranking" && name !== "clear") state.lastScreen = name;
  if (name === "level" || name === "setup") startOpeningMusic();
}

function loadStoredState() {
  const data = readStore();
  state.learnerRoleId = data.learnerRoleId || "";
  state.selectedLevel = data.selectedLevel || "basic";
  state.lang = resolveInitialLang(data.lang);
  if (state.learnerRoleId) {
    const input = document.querySelector(`input[name="learnerRole"][value="${state.learnerRoleId}"]`);
    if (input) input.checked = true;
  }
  updateMuteButton(data.muted);
  updateLevelButtons();
}

function persistLearnerRole() {
  const data = readStore();
  data.learnerRoleId = state.learnerRoleId;
  data.learnerRoleName = getLearnerRoleName();
  writeStore(data);
}

const ROLE_I18N_KEY = {
  resident: "roleResident",
  senior_resident: "roleSeniorResident",
  doctor: "roleDoctor",
  nurse: "roleNurse",
  other: "roleOther",
};

function getLearnerRoleName() {
  const selected = document.querySelector('input[name="learnerRole"]:checked');
  if (!selected) return t("noSelection", state.lang);
  return t(ROLE_I18N_KEY[selected.value] || "noSelection", state.lang);
}

function toggleMute() {
  const data = readStore();
  data.muted = !data.muted;
  writeStore(data);
  updateMuteButton(data.muted);
  if (data.muted) stopMusicLoop();
  else startOpeningMusic();
}

function updateMuteButton(muted) {
  els.muteButton.textContent = muted ? t("btnSoundOn", state.lang) : t("btnSoundOff", state.lang);
  els.muteButton.setAttribute("aria-pressed", String(!muted));
  els.muteButton.title = muted ? t("titleSoundOn", state.lang) : t("titleSoundOff", state.lang);
}

function resolveInitialLang(saved) {
  if (saved === "ja" || saved === "en") return saved;
  return (navigator.language || "ja").toLowerCase().startsWith("en") ? "en" : "ja";
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const isCurrentSchema = parsed.schemaVersion === STORAGE_SCHEMA_VERSION;
    return {
      schemaVersion:   STORAGE_SCHEMA_VERSION,
      learnerRoleId:   parsed.learnerRoleId  || "",
      learnerRoleName: parsed.learnerRoleName || "",
      muted:           Boolean(parsed.muted),
      lang:            parsed.lang || "",
      selectedLevel:   parsed.selectedLevel  || "basic",
      rankings:        Array.isArray(parsed.rankings) ? parsed.rankings : [],
      // v2 migration: pre-v2 clears were granted on per-session perfect score, not
      // cumulative correctness. Drop them so they only show under the new criterion.
      clears:          isCurrentSchema && parsed.clears && typeof parsed.clears === "object" ? parsed.clears : {},
      correctQuestions: isCurrentSchema && parsed.correctQuestions && typeof parsed.correctQuestions === "object" ? parsed.correctQuestions : {},
    };
  } catch {
    return {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      learnerRoleId: "", learnerRoleName: "", muted: false, lang: "", selectedLevel: "basic",
      rankings: [], clears: {}, correctQuestions: {},
    };
  }
}

function writeStore(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function isLocalOrigin() {
  const h = window.location.hostname;
  return h === "127.0.0.1" || h === "localhost" || h === "";
}

function isGoogleAppsScriptWebAppUrl(url) {
  return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/.test(url);
}

function addRanking(result) {
  const data = readStore();
  data.rankings.push(result);
  data.rankings.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.totalTimeMs !== b.totalTimeMs) return a.totalTimeMs - b.totalTimeMs;
    return b.timestamp - a.timestamp;
  });
  data.rankings = data.rankings.slice(0, 50);
  writeStore(data);
}

function sendResultToBackend(result) {
  const event = {
    ...result,
    completedAt: new Date(result.timestamp).toISOString(),
    appVersion: "quiz-er-static-v1",
    pageUrl: window.location.href,
  };
  if (state.googleSheetsWebAppUrl) {
    sendResultToGoogleSheets(event).catch((error) => {
      console.error("Google Sheets send failed.", error);
      setSyncStatus("スプレッドシート送信に失敗しました。設定URLとデプロイ権限を確認してください。", "error");
    });
  }
  if (state.sendToLocalBackend) sendResultToLocalBackend(event);
}

function sendResultToGoogleSheets(event) {
  const body = JSON.stringify(event);
  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon(
      state.googleSheetsWebAppUrl, new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    if (queued) return Promise.resolve("queued");
  }
  return fetch(state.googleSheetsWebAppUrl, {
    method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body,
  });
}

function sendResultToLocalBackend(event) {
  const body = JSON.stringify(event);
  if (navigator.sendBeacon) {
    const ok = navigator.sendBeacon(LOCAL_BACKEND_EVENT_URL, new Blob([body], { type: "application/json" }));
    if (ok) return;
  }
  fetch(LOCAL_BACKEND_EVENT_URL, {
    method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true,
  }).catch(() => {});
}

function setSyncStatus(text, status) {
  if (!els.syncStatus) return;
  els.syncStatus.textContent = text;
  els.syncStatus.dataset.status = status || "";
  els.syncStatus.hidden = !text;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIO: Opening music — DQ-style 3-voice arrangements per level
// ══════════════════════════════════════════════════════════════════════════════

function startOpeningMusic() {
  if (readStore().muted || !isSetupScreenVisible()) return;
  stopMusicLoop();
  const level = state.selectedLevel || "basic";
  const config = OPENING_MUSIC[level] || OPENING_MUSIC.basic;
  const generation = ++state.musicGeneration;
  state.musicMode = "opening";
  state.musicStep = 0;
  playOpeningMusicStep(config, generation);
  state.musicLoopId = window.setInterval(
    () => playOpeningMusicStep(config, generation),
    config.intervalMs
  );
}

function playOpeningMusicStep(config, generation) {
  if (generation !== state.musicGeneration) return;
  if (readStore().muted || !isSetupScreenVisible()) { stopMusicLoop(); return; }
  const s = state.musicStep % config.barSteps;

  // Melody — accent first beat of each quarter (every 4 steps)
  const m = config.melody[s];
  if (m > 0) {
    const accent = (s % 4 === 0) ? 1.4 : (s % 2 === 0) ? 1.0 : 0.7;
    playSynthNote(m, 0.16, config.melodyWave, config.melodyGain * accent);
  }
  // Counter-melody — softer harmonic line
  const c = config.counter[s];
  if (c > 0) playSynthNote(c, 0.13, config.counterWave, config.counterGain);
  // Bass — root/fifth pattern, longer envelope
  const b = config.bass[s];
  if (b > 0) playSynthNote(b, 0.22, config.bassWave, config.bassGain);

  // Drums (optional per level)
  if (config.drums) {
    if (config.drums.kick.has(s))  playSynthNote(55,   0.12, "square",   0.060);
    if (config.drums.snare.has(s)) playSynthNote(220,  0.07, "sawtooth", 0.024);
    if (config.drums.hihat.has(s)) playSynthNote(3136, 0.025, "square",  0.005);
  }

  state.musicStep += 1;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIO: Quiz music — level × urgency aware
// ══════════════════════════════════════════════════════════════════════════════

function startQuizMusic() {
  if (readStore().muted) return;
  stopMusicLoop();
  const level = state.selectedLevel || "basic";
  const urgency = state.musicUrgency || "normal";
  const config = (QUIZ_MUSIC[level] || QUIZ_MUSIC.basic)[urgency] || QUIZ_MUSIC.basic.normal;
  const generation = ++state.musicGeneration;
  state.musicMode = "quiz";
  state.musicStep = 0;
  playQuizMusicStep(config, generation);
  state.musicLoopId = window.setInterval(() => playQuizMusicStep(config, generation), config.interval);
}

function playQuizMusicStep(config, generation) {
  if (generation !== state.musicGeneration || readStore().muted) return;
  const step = state.musicStep % config.pattern.length;
  const gain = step % 4 === 0 ? config.gain * 1.25 : config.gain;
  playSynthNote(config.pattern[step], 0.09, config.wave, gain);
  if (config.bass) {
    const bassFreq = config.bass[step % config.bass.length];
    if (bassFreq > 0) playSynthNote(bassFreq, 0.14, "triangle", config.gain * 0.55);
  }
  state.musicStep += 1;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUDIO: shared utilities
// ══════════════════════════════════════════════════════════════════════════════

function stopMusicLoop() {
  state.musicGeneration += 1;
  if (state.musicLoopId) { window.clearInterval(state.musicLoopId); state.musicLoopId = 0; }
  state.musicMode = "";
}

function isSetupScreenVisible() {
  return (els.levelScreen && !els.levelScreen.hidden) || (els.setupScreen && !els.setupScreen.hidden);
}

function ensureAudioContext() {
  if (!state.audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) state.audioContext = new Ctx();
  }
  if (state.audioContext?.state === "suspended") {
    state.audioContext.resume().catch(() => {});
  }
  return state.audioContext;
}

function playTone(type) {
  if (readStore().muted) return;
  if (type === "correct") { playCorrectSound(); return; }
  const presets = {
    wrong:  [170, 0.18, "sawtooth", 0.06],
    tick:   [880, 0.05, "square",   0.035],
    finish: [523, 0.22, "triangle", 0.08],
  };
  const [freq, dur, wave, gain] = presets[type] || presets.tick;
  playSynthNote(freq, dur, wave, gain);
  if (type === "finish") window.setTimeout(() => playTone("correct"), 120);
}

function playCorrectSound() {
  [[659, 0], [784, 75], [988, 150], [1319, 240]].forEach(([freq, delay]) => {
    window.setTimeout(() => playSynthNote(freq, 0.12, "triangle", 0.075), delay);
  });
}

function playSynthNote(frequency, duration, typeName, gainValue) {
  const audio = ensureAudioContext();
  if (!audio) return;
  const play = () => {
    const now = audio.currentTime;
    const osc  = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = typeName;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };
  if (audio.state === "suspended") { audio.resume().then(play).catch(() => {}); return; }
  play();
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

function shuffle(items) {
  const array = items.slice();
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getResultComment(percent) {
  if (percent >= 90) return "Excellent!";
  if (percent >= 70) return "Great job!";
  if (percent >= 50) return "Good effort!";
  return "Keep going!";
}

function formatTime(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const m = t("timeSuffixMin", state.lang);
  const s = t("timeSuffixSec", state.lang);
  return minutes > 0 ? `${minutes}${m}${seconds}${s}` : `${seconds}${s}`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat(t("dateLocale", state.lang), {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(timestamp));
}
