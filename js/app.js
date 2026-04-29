const STORAGE_KEY = "qqq_state_v1";
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

// Opening music interval per level (ms per step)
const OPENING_INTERVAL = { basic: 175, advanced: 150, master: 140 };

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
  googleSheetsWebAppUrl: "",
  sendToLocalBackend: false,
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
    updateStartButtonState();
  } catch (error) {
    els.setupStatus.textContent = "問題データを読み込めません。ローカルHTTPサーバーで開いてください。";
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
    "startQuizButton", "rankingButton", "muteButton",
    "clearButton", "backToLevelButton", "closeClearButton",
    "quitQuizButton", "quizCategory", "quizProgress",
    "timerArc", "timerText", "questionText", "choiceList",
    "resultScore", "resultPercent", "resultTime", "resultComment", "syncStatus",
    "retryButton", "backToSetupButton", "resultRankingButton",
    "toggleReviewButton", "reviewList",
    "rankingTabs", "rankingList", "rankingEmpty", "closeRankingButton",
  ].forEach((id) => { els[id] = document.getElementById(id); });
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

  els.startQuizButton.addEventListener("click", startQuiz);
  els.rankingButton.addEventListener("click", () => openRanking("all"));
  els.resultRankingButton.addEventListener("click", () => openRanking("all"));
  els.closeRankingButton.addEventListener("click", () =>
    showScreen(state.lastScreen === "quiz" ? "setup" : state.lastScreen));
  els.quitQuizButton.addEventListener("click", () => { stopTimer(); showScreen("setup"); });
  els.retryButton.addEventListener("click", startQuiz);
  els.backToSetupButton.addEventListener("click", () => showScreen("setup"));
  els.toggleReviewButton.addEventListener("click", toggleReview);
  els.backToLevelButton.addEventListener("click", () => showScreen("level"));
  els.clearButton.addEventListener("click", () => { renderClearScreen(); showScreen("clear"); });
  els.closeClearButton.addEventListener("click", () => {
    const prev = state.lastScreen;
    showScreen(prev === "clear" || !prev ? "level" : prev);
  });
  document.querySelectorAll('input[name="learnerRole"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.learnerRoleId = input.value;
      const data = readStore();
      data.learnerRoleId = input.value;
      data.learnerRoleName = getLearnerRoleName();
      writeStore(data);
      updateStartButtonState();
      updateSetupSummary();
    });
  });
  els.muteButton.addEventListener("click", toggleMute);
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
    fetch("data/categories.json", { cache: "no-store" }),
  ]);
  if (!levelsRes.ok) throw new Error(`levels.json ${levelsRes.status}`);
  if (!categoriesRes.ok) throw new Error(`categories.json ${categoriesRes.status}`);
  state.levels = await levelsRes.json();
  state.categories = await categoriesRes.json();
  await Promise.all(
    state.categories.map(async (category) => {
      const res = await fetch(`data/${category.file}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${category.file} ${res.status}`);
      const data = await res.json();
      state.questionBank.set(category.id, data.questions);
      category.questionTotal = data.questions.length;
    }),
  );
}

// ─── Level helpers ────────────────────────────────────────────────────────────

function updateLevelButtons() {
  document.querySelectorAll("[data-level]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.level === state.selectedLevel);
  });
}

function renderLevelScreen() {
  els.levelGrid.innerHTML = "";
  const clears = readStore().clears;
  state.levels.forEach((level) => {
    const levelCats = state.categories.filter((c) => c.level === level.id);
    const clearedCount = levelCats.filter((c) => Boolean(clears[`${level.id}:${c.id}`])).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "level-card" + (level.id === state.selectedLevel ? " is-selected-level" : "");
    const nameEl = document.createElement("span");
    nameEl.className = "level-card__name";
    nameEl.textContent = level.name;
    const clearEl = document.createElement("span");
    clearEl.className = "level-card__clear";
    clearEl.textContent = `${clearedCount} / ${levelCats.length} クリア済み`;
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
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-card" + (cleared ? " is-cleared" : "");
      button.style.borderTopColor = category.accent || "var(--primary)";
      button.setAttribute("aria-pressed", String(category.id === state.selectedCategoryId));
      button.dataset.categoryId = category.id;
      const title = document.createElement("h3");
      title.textContent = category.name;
      const desc = document.createElement("p");
      desc.textContent = category.description;
      const meta = document.createElement("div");
      meta.className = "card-meta";
      meta.innerHTML = `<span>${category.questionTotal}問</span><span>20秒/問</span>`;
      if (cleared) {
        const badge = document.createElement("span");
        badge.className = "clear-badge";
        badge.textContent = "✓ CLEAR";
        meta.appendChild(badge);
      }
      button.append(title, desc, meta);
      button.addEventListener("click", () => {
        state.selectedCategoryId = category.id;
        renderCategories();
        renderQuestionCountControls();
        updateSetupSummary();
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
  document.querySelectorAll("[data-count]").forEach((button) => {
    const count = Number(button.dataset.count);
    button.disabled = total > 0 && count > total;
    button.classList.toggle("is-active", count === state.questionCount);
  });
  if (total > 0 && state.questionCount > total) {
    state.questionCount = total >= 10 ? 10 : 5;
    renderQuestionCountControls();
  }
}

function updateSetupSummary() {
  const category = getSelectedCategory();
  els.selectedCategoryLabel.textContent = category ? `${category.name} / ${state.questionCount}問` : "未選択";
  els.setupStatus.textContent = state.learnerRoleId ? "" : "職種を選択してください。";
}

function updateStartButtonState() {
  els.startQuizButton.disabled = state.categories.length === 0 || !state.learnerRoleId;
}

function getSelectedCategory() {
  return state.categories.find((c) => c.id === state.selectedCategoryId);
}

function getSelectedQuestions() {
  return state.questionBank.get(state.selectedCategoryId) || [];
}

// ─── Clear tracking ───────────────────────────────────────────────────────────

function isClear(categoryId) {
  return Boolean(readStore().clears[`${state.selectedLevel}:${categoryId}`]);
}

function saveClear(categoryId) {
  const key = `${state.selectedLevel}:${categoryId}`;
  const data = readStore();
  if (!data.clears[key]) {
    data.clears[key] = new Date().toISOString();
    writeStore(data);
  }
}

// ─── Quiz flow ────────────────────────────────────────────────────────────────

function startQuiz() {
  const category = getSelectedCategory();
  const sourceQuestions = getSelectedQuestions();
  if (!category || sourceQuestions.length === 0) {
    els.setupStatus.textContent = "カテゴリーを読み込めていません。"; return;
  }
  if (state.questionCount > sourceQuestions.length) {
    els.setupStatus.textContent = "選択した出題数に対して問題数が不足しています。"; return;
  }
  if (!state.learnerRoleId) {
    els.setupStatus.textContent = "職種を選択してください。"; return;
  }
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
  return {
    id: question.id,
    question: question.question,
    explanation: question.explanation,
    choices: shuffled.map((c) => c.text),
    correctIndex: shuffled.findIndex((c) => c.originalIndex === question.answer),
  };
}

function renderCurrentQuestion() {
  stopTimer();
  state.isLocked = false;
  state.lastTickSecond = null;
  const question = state.quizQuestions[state.currentIndex];
  els.quizProgress.textContent = `${state.currentIndex + 1} / ${state.quizQuestions.length}`;
  els.questionText.textContent = question.question;
  els.choiceList.innerHTML = "";
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.addEventListener("click", () => handleAnswer(index, false));
    const key = document.createElement("span");
    key.className = "choice-key";
    key.textContent = String(index + 1);
    const text = document.createElement("span");
    text.textContent = choice;
    button.append(key, text);
    els.choiceList.appendChild(button);
  });
  startTimer();
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

function handleAnswer(choiceIndex, timedOut) {
  if (state.isLocked) return;
  state.isLocked = true;
  stopTimer();
  const question = state.quizQuestions[state.currentIndex];
  const correct = choiceIndex === question.correctIndex;
  if (correct) state.score += 1;
  state.reviewItems.push({
    question: question.question,
    choices: question.choices.slice(),
    selectedIndex: choiceIndex,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    isCorrect: correct,
    timedOut,
  });
  renderChoiceFeedback(choiceIndex, question.correctIndex);
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

function renderChoiceFeedback(selectedIndex, correctIndex) {
  els.choiceList.querySelectorAll(".choice-button").forEach((button, index) => {
    button.disabled = true;
    if (index === correctIndex) button.classList.add("is-correct");
    if (selectedIndex !== null && index === selectedIndex && index !== correctIndex) {
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
  const isCleared = state.score === state.quizQuestions.length;
  if (isCleared) saveClear(category.id);
  renderResult(result, isCleared);
  showScreen("result");
  sendResultToBackend(result);
  playTone("finish");
}

function renderResult(result, isCleared) {
  const percent = Math.round((result.score / result.questionCount) * 100);
  els.resultScore.textContent = `${result.score} / ${result.questionCount}`;
  els.resultPercent.textContent = `${percent}%`;
  els.resultTime.textContent = `所要時間 ${formatTime(result.totalTimeMs)}`;
  els.resultComment.textContent = getResultComment(percent);
  els.clearBanner.hidden = !isCleared;
  setSyncStatus("", "");
  renderReview();
  els.reviewList.hidden = false;
  els.toggleReviewButton.textContent = "折りたたむ";
  els.toggleReviewButton.setAttribute("aria-expanded", "true");
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
      ? "あなたの回答: 時間切れ"
      : `あなたの回答: ${labelChoice(item.selectedIndex, item.choices[item.selectedIndex])}`;
    const correct = document.createElement("p");
    correct.className = "answer-line";
    correct.textContent = `正解: ${labelChoice(item.correctIndex, item.choices[item.correctIndex])}`;
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

function toggleReview() {
  const willShow = els.reviewList.hidden;
  els.reviewList.hidden = !willShow;
  els.toggleReviewButton.textContent = willShow ? "折りたたむ" : "表示する";
  els.toggleReviewButton.setAttribute("aria-expanded", String(willShow));
}

function openRanking(tabId) { renderRanking(tabId); showScreen("ranking"); }

function renderRankingTabs() {
  els.rankingTabs.innerHTML = "";
  const tabs = [{ id: "all", name: "全体" }, ...state.categories.map((c) => ({ id: c.id, name: c.name }))];
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
    name.textContent = record.roleName || record.name || "未選択";
    const meta = document.createElement("span");
    meta.className = "rank-meta";
    meta.textContent = `${record.categoryName} / ${record.questionCount}問 / ${formatTime(record.totalTimeMs)} / ${formatDate(record.timestamp)}`;
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
      const clearDate = clears[`${levelId}:${cat.id}`] || null;
      const item = document.createElement("div");
      item.className = "clear-item";
      const name = document.createElement("span");
      name.className = "clear-item__name";
      name.textContent = cat.name;
      const right = document.createElement("span");
      if (clearDate) {
        const status = document.createElement("span");
        status.className = "clear-item__status";
        status.textContent = "✓ CLEAR";
        const date = document.createElement("span");
        date.className = "clear-item__date";
        date.textContent = new Intl.DateTimeFormat("ja-JP", {
          month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
        }).format(new Date(clearDate));
        right.append(status, document.createTextNode(" "), date);
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

function getLearnerRoleName() {
  const selected = document.querySelector('input[name="learnerRole"]:checked');
  return selected?.dataset.roleLabel || "未選択";
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
  els.muteButton.textContent = muted ? "効果音ON" : "効果音OFF";
  els.muteButton.setAttribute("aria-pressed", String(!muted));
  els.muteButton.title = muted ? "効果音と音楽をONにする" : "効果音と音楽をOFFにする";
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      learnerRoleId:  parsed.learnerRoleId  || "",
      learnerRoleName: parsed.learnerRoleName || "",
      muted:          Boolean(parsed.muted),
      selectedLevel:  parsed.selectedLevel  || "basic",
      rankings:       Array.isArray(parsed.rankings) ? parsed.rankings : [],
      clears:         (parsed.clears && typeof parsed.clears === "object") ? parsed.clears : {},
    };
  } catch {
    return { learnerRoleId: "", learnerRoleName: "", muted: false, selectedLevel: "basic", rankings: [], clears: {} };
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
// AUDIO: Opening music — three distinct themes per level
// ══════════════════════════════════════════════════════════════════════════════

function startOpeningMusic() {
  if (readStore().muted || !isSetupScreenVisible()) return;
  // Always stop then restart — picks up any level change cleanly
  stopMusicLoop();
  const level = state.selectedLevel || "basic";
  const interval = OPENING_INTERVAL[level] || 150;
  const generation = ++state.musicGeneration;
  state.musicMode = "opening";
  state.musicStep = 0;
  playOpeningMusicStep(generation);
  state.musicLoopId = window.setInterval(() => playOpeningMusicStep(generation), interval);
}

function playOpeningMusicStep(generation) {
  if (generation !== state.musicGeneration) return;
  if (readStore().muted || !isSetupScreenVisible()) { stopMusicLoop(); return; }
  const step = state.musicStep;
  const level = state.selectedLevel || "basic";
  if      (level === "master")   playMasterOpeningStep(step);
  else if (level === "advanced") playAdvancedOpeningStep(step);
  else                           playBasicOpeningStep(step);
  state.musicStep += 1;
}

// ── Basic: calm, warm, C-major arpeggio, triangle waves, no drums ─────────────
// 16-step bar at 175 ms/step = ~86 bpm (gentle)
function playBasicOpeningStep(step) {
  const s = step % 16;
  // Soft bass pulse every 4 steps (C-E-G-E walking bass)
  const bassLine = [131, 165, 196, 165]; // C3, E3, G3, E3
  if (s % 4 === 0) {
    playSynthNote(bassLine[Math.floor(s / 4) % 4], 0.22, "triangle", 0.016);
  }
  // Warm lead arpeggio (C major pentatonic with octave reach)
  const arp = [523, 659, 784, 880, 784, 659, 523, 440,
               523, 659, 784, 1047, 880, 784, 659, 784];
  const gain = s % 8 === 0 ? 0.020 : s % 4 === 0 ? 0.016 : 0.012;
  playSynthNote(arp[s], 0.14, "triangle", gain);
}

// ── Advanced: driving techno-pop, 4/4 kick+snare, Cm pentatonic ──────────────
// 16-step bar at 150 ms/step = ~100 bpm
function playAdvancedOpeningStep(step) {
  const s = step % 16;
  // Kick on beats 1 & 3 (steps 0, 8)
  if (s === 0 || s === 8) {
    playSynthNote(65,  0.10, "square",   0.055);
    playSynthNote(131, 0.14, "triangle", 0.030);
  }
  // Snare on beats 2 & 4 (steps 4, 12)
  if (s === 4 || s === 12) { playSynthNote(220, 0.06, "sawtooth", 0.020); }
  // Bass riff accents
  if (s === 2 || s === 10) { playSynthNote(131, 0.08, "triangle", 0.016); }
  if (s === 6 || s === 14) { playSynthNote(196, 0.08, "triangle", 0.016); }
  // Lead synth arpeggio (Cm pentatonic)
  const arp = [523, 622, 784, 932, 784, 622, 523, 466,
               523, 698, 784, 932, 784, 698, 622, 523];
  playSynthNote(arp[s], 0.09, "square", s % 4 === 0 ? 0.022 : 0.015);
  // Hi-hat shimmer on odd steps
  if (s % 2 === 1) { playSynthNote(3136, 0.025, "square", 0.004); }
}

// ── Master: heartbeat techno, lub-dub sub-bass, hard sawtooth lead ────────────
// 12-step bar at 140 ms/step → heartbeat ogni 6 steps = 840 ms ≈ 71 bpm
// Heartbeat "lub" at step 0, "dub" at step 1; again "lub" at step 6, "dub" at 7
function playMasterOpeningStep(step) {
  const s = step % 12;
  // Heartbeat lub-dub
  if (s === 0 || s === 6) {
    playSynthNote(55,  0.13, "square",   0.062); // deep sub (lub — strong)
    playSynthNote(110, 0.10, "sawtooth", 0.028); // overtone
  }
  if (s === 1 || s === 7) {
    playSynthNote(73,  0.11, "square",   0.040); // dub (softer, slightly higher)
  }
  // Hard mid accent (like a snare crack between heartbeats)
  if (s === 3 || s === 9) {
    playSynthNote(196, 0.07, "sawtooth", 0.022); // G3
  }
  // Tense chromatic lead (rests at heartbeat steps 0,1,6,7)
  const lead = [0, 0, 294, 311, 349, 311, 0, 0, 349, 392, 415, 349];
  if (lead[s] > 0) {
    const gain = s % 3 === 2 ? 0.032 : 0.024;
    playSynthNote(lead[s], 0.10, "sawtooth", gain);
  }
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
  return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(timestamp));
}
