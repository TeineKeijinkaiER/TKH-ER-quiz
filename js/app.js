const STORAGE_KEY = "qqq_state_v1";
const STORAGE_SCHEMA_VERSION = 2;
const LOCAL_BACKEND_EVENT_URL = "http://127.0.0.1:8787/api/events";
const QUESTION_SECONDS = 30;
const CERT_QUESTION_COUNT = 20;
const CERT_SECONDS = 20;
const CERT_PASS_THRESHOLD = 18;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 52;
const NEXT_QUESTION_DELAY_MS = 950;

// ──────────────────────────────────────────────────────────────────────────────
// Quiz music: level × urgency
// interval = ms per step (lower = faster/more tense)
// ──────────────────────────────────────────────────────────────────────────────
const QUIZ_MUSIC = {
  // ENTRY — very gentle (triangle, slowest intervals, lowest gain)
  entry: {
    normal: { pattern: [523, 0, 659, 0, 784, 0, 659, 0], interval: 250, wave: "triangle", gain: 0.017 },
    medium: { pattern: [523, 659, 784, 659, 523, 440, 523, 659], interval: 165, wave: "triangle", gain: 0.021 },
    high:   { pattern: [523, 659, 784, 880, 784, 659, 784, 880], interval: 95,  wave: "triangle", gain: 0.026 },
  },
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
  // ENTRY — gentle lullaby (C major, ~62bpm), flowing stepwise melody, no drums
  entry: {
    intervalMs: 240,
    barSteps: 32,
    melody:  [523, 0, 659, 0, 784, 0, 659, 0,  523, 0, 440, 0, 392, 0, 0, 0,
              523, 0, 587, 0, 659, 0, 698, 0,  659, 0, 587, 0, 523, 0, 0, 0],
    melodyWave: "triangle",
    melodyGain: 0.019,
    counter: [262, 0, 0, 0, 330, 0, 0, 0,  262, 0, 0, 0, 196, 0, 0, 0,
              262, 0, 0, 0, 294, 0, 0, 0,  330, 0, 0, 0, 262, 0, 0, 0],
    counterWave: "triangle",
    counterGain: 0.009,
    bass:    [ 65, 0, 0, 0,  98, 0, 0, 0,   65, 0, 0, 0,  98, 0, 0, 0,
               65, 0, 0, 0,  87, 0, 0, 0,   82, 0, 0, 0,  65, 0, 0, 0],
    bassWave: "triangle",
    bassGain: 0.020,
    drums: null,
  },
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
  preferredQuestionCount: 5,
  quizQuestions: [],
  currentIndex: 0,
  score: 0,
  reviewItems: [],
  startedAt: 0,
  timerId: 0,
  timerDeadline: 0,
  isLocked: false,
  isPaused: false,
  pauseUsed: false,
  timerPauseRemainingMs: 0,
  lastTickSecond: null,
  lastScreen: "level",
  audioContext: null,
  musicLoopId: 0,
  musicStep: 0,
  musicGeneration: 0,
  musicMode: "",
  musicUrgency: "normal",
  certBeatStep: 0,
  wasCategoryClearAtStart: false,
  googleSheetsWebAppUrl: "",
  sendToLocalBackend: false,
  lang: "ja",
  certMode: false,
  certPassed: false,
  certName: "",
  certLevelId: "",
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  loadStoredState();
  bindEvents();
  bindAudioResume();
  setupTimerArc();

  try {
    await loadAppConfig();
    await loadQuestionData();
    checkAndInvalidateStaleClears();
    renderLevelScreen();
    renderRankingTabs();
    applyI18n(state.lang);
    document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
      seg.classList.toggle("is-active", seg.dataset.lang === state.lang);
    });
    const initData = readStore();
    if (!initData.noticeAcknowledged) openNotice();
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
    "levelScreen", "levelGrid", "levelRoleStatus",
    "setupScreen", "quizScreen", "resultScreen", "rankingScreen", "clearScreen",
    "clearBanner", "clearTabs", "clearList",
    "categoryGrid", "selectedCategoryLabel", "setupStatus",
    "backToLevelButton",
    "noticeButton", "rankingButton", "muteButton",
    "clearButton", "closeClearButton",
    "quitQuizButton", "pauseQuizButton", "quizCategory", "quizProgress",
    "timerArc", "timerText", "questionText", "choiceList",
    "resultScore", "resultPercent", "resultTime", "resultComment", "syncStatus", "resultProgress",
    "retryButton", "backToSetupButton", "resultRankingButton",
    "toggleReviewButton", "reviewList",
    "rankingTabs", "rankingList", "rankingEmpty", "closeRankingButton",
    "resetRankingButton", "resetClearButton", "resetCertButton",
    "noticeModal", "noticeBody", "noticeUpdateList", "noticeCloseButton",
  ].forEach((id) => { els[id] = document.getElementById(id); });
}

function setLanguage(lang) {
  if (lang !== "ja" && lang !== "en") return;
  state.lang = lang;
  const data = readStore();
  data.lang = lang;
  writeStore(data);
  applyI18n(lang);
  if (els.noticeModal && !els.noticeModal.hidden) {
    els.noticeBody.innerHTML = t("noticeBody", lang);
    renderNoticeUpdates();
  }
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
  document.querySelectorAll("[data-count]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.questionCount = Number(button.dataset.count);
      state.preferredQuestionCount = state.questionCount;
      renderQuestionCountControls();
      updateSetupSummary();
    });
  });

  els.rankingButton.addEventListener("click", () => openRanking("all"));
  els.resultRankingButton.addEventListener("click", () => openRanking("all"));
  els.closeRankingButton.addEventListener("click", () => showScreen("level"));
  els.quitQuizButton.addEventListener("click", () => { stopTimer(); state.certMode = false; showScreen("level"); });
  els.pauseQuizButton.addEventListener("click", togglePause);
  els.retryButton.addEventListener("click", () => {
    if (state.certMode) {
      openCertModal(state.certLevelId);
    } else {
      startQuiz();
    }
  });
  els.backToSetupButton.addEventListener("click", () => { state.certMode = false; showScreen("level"); });
  document.getElementById("certStartButton").addEventListener("click", submitCertModal);
  document.getElementById("certCancelButton").addEventListener("click", () => {
    document.getElementById("certModal").hidden = true;
  });
  document.getElementById("certModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("certModal")) document.getElementById("certModal").hidden = true;
  });
  document.getElementById("certCelebCloseButton").addEventListener("click", closeCertCelebration);
  els.toggleReviewButton.addEventListener("click", toggleReview);
  els.clearButton.addEventListener("click", () => { renderClearScreen(); showScreen("clear"); });
  els.closeClearButton.addEventListener("click", () => showScreen("level"));
  els.backToLevelButton.addEventListener("click", () => showScreen("level"));
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
  els.noticeButton.addEventListener("click", openNotice);
  els.noticeCloseButton.addEventListener("click", closeNotice);
  els.noticeModal.addEventListener("click", (e) => { if (e.target === els.noticeModal) closeNotice(); });
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
  els.resetCertButton.addEventListener("click", () => {
    if (!window.confirm(t("confirmResetCert", state.lang))) return;
    resetCertPasses();
  });
}

function getActiveRankingTabId() {
  const active = document.querySelector("#rankingTabs .tab-button.is-active");
  return active?.dataset.tabId || "all";
}

// ──────────────────────────────────────────────────────────────────────────────
// iOS audio unlock: create + resume AudioContext within the user gesture.
// Listeners are PERSISTENT (no { once: true }) so the context can be
// re-unlocked after the browser auto-suspends it (backgrounding, tab switch,
// screen lock, etc.).  touchstart fires before pointerdown on iOS, so we
// register both for maximum compatibility.
// ──────────────────────────────────────────────────────────────────────────────
function bindAudioResume() {
  const tryResume = () => {
    // Create AudioContext synchronously inside the gesture handler (iOS req.)
    if (!state.audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) state.audioContext = new Ctx();
    }
    if (state.audioContext?.state === "suspended") {
      state.audioContext.resume()
        .then(() => {
          // After the context is resumed, restart opening music if we're on a
          // screen that should have it — regardless of whether the old loop
          // interval is still registered, because suspended contexts silently
          // drop all scheduled audio and the loop needs a fresh start.
          if (!readStore().muted && isSetupScreenVisible()) {
            stopMusicLoop();
            startOpeningMusic();
          }
        })
        .catch(() => {});
    }
  };
  document.addEventListener("touchstart", tryResume, { passive: true });
  document.addEventListener("pointerdown", tryResume, { passive: true });
  document.addEventListener("keydown",     tryResume);
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

    // Cert button — three states: locked / unlocked (blue) / passed (orange)
    const allCleared = levelCats.length > 0 && levelCats.every((c) => isClear(c.id));
    const hasPassed = readStore().certPasses.some((p) => p.levelId === level.id);
    const certBtn = document.createElement("button");
    certBtn.type = "button";
    if (!allCleared) {
      certBtn.disabled = true;
      certBtn.className = "cert-challenge-button is-locked";
      certBtn.textContent = `🔒 ${level.name} ${t("certChallengeButton", state.lang)}  ${clearedCount} / ${levelCats.length}`;
    } else if (hasPassed) {
      certBtn.className = "cert-challenge-button is-passed";
      certBtn.textContent = `🏆 ${level.name} ${t("certPassedLabel", state.lang)}`;
      certBtn.addEventListener("click", () => openCertModal(level.id));
    } else {
      certBtn.className = "cert-challenge-button";
      certBtn.textContent = `🔓 ${level.name} ${t("certChallengeButton", state.lang)}`;
      certBtn.addEventListener("click", () => openCertModal(level.id));
    }
    els.levelGrid.appendChild(certBtn);
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
  if (total === 0 || state.preferredQuestionCount <= total) {
    state.questionCount = state.preferredQuestionCount;
  } else if (state.questionCount > total) {
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
  // Role status lives on the main (level) screen
  if (els.levelRoleStatus) {
    els.levelRoleStatus.textContent = state.learnerRoleId ? "" : t("roleSelectPrompt", state.lang);
  }
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
  const checkedRole = document.querySelector('input[name="learnerRole"]:checked');
  if (!checkedRole) {
    state.learnerRoleId = "";
    // Role selector is on the main screen — go back there and highlight the prompt
    if (els.levelRoleStatus) els.levelRoleStatus.textContent = t("roleSelectPrompt", state.lang);
    showScreen("level");
    return;
  }
  state.learnerRoleId = checkedRole.value;
  state.wasCategoryClearAtStart = isClear(category.id);
  ensureAudioContext();
  persistLearnerRole();
  state.quizQuestions = shuffle(sourceQuestions).slice(0, state.questionCount).map(prepareQuestion);
  state.currentIndex = 0;
  state.score = 0;
  state.reviewItems = [];
  state.startedAt = Date.now();
  state.isLocked = false;
  state.isPaused = false;
  state.pauseUsed = false;
  state.timerPauseRemainingMs = 0;
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
  state.isPaused = false;
  state.timerPauseRemainingMs = 0;
  if (els.pauseQuizButton) {
    els.pauseQuizButton.textContent = t("quizPause", state.lang);
  }
  els.timerText.closest(".timer").classList.remove("is-paused");
  els.choiceList.classList.remove("is-paused");
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
  if (state.isLocked || state.isPaused) return;
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

function currentQuestionSeconds() {
  return state.certMode ? CERT_SECONDS : QUESTION_SECONDS;
}

function startTimer() {
  state.timerDeadline = Date.now() + currentQuestionSeconds() * 1000;
  updateTimerDisplay();
  state.timerId = window.setInterval(updateTimerDisplay, 100);
  startQuizMusic();
}

function stopTimer() {
  if (state.timerId) { window.clearInterval(state.timerId); state.timerId = 0; }
  stopMusicLoop();
}

function togglePause() {
  if (state.isLocked) return;

  if (!state.isPaused) {
    state.isPaused = true;
    state.pauseUsed = true;
    state.timerPauseRemainingMs = Math.max(0, state.timerDeadline - Date.now());
    window.clearInterval(state.timerId);
    state.timerId = 0;
    stopMusicLoop();
    els.pauseQuizButton.textContent = t("quizResume", state.lang);
    els.timerText.closest(".timer").classList.add("is-paused");
    els.choiceList.classList.add("is-paused");
  } else {
    state.isPaused = false;
    state.timerDeadline = Date.now() + state.timerPauseRemainingMs;
    state.timerPauseRemainingMs = 0;
    state.timerId = window.setInterval(updateTimerDisplay, 100);
    startQuizMusic();
    els.pauseQuizButton.textContent = t("quizPause", state.lang);
    els.timerText.closest(".timer").classList.remove("is-paused");
    els.choiceList.classList.remove("is-paused");
  }
}

function setupTimerArc() {
  els.timerArc.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);
  els.timerArc.style.strokeDashoffset = "0";
}

function updateTimerDisplay() {
  const remainingMs = Math.max(0, state.timerDeadline - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const totalSecs = currentQuestionSeconds();
  const offset = TIMER_CIRCUMFERENCE * (1 - remainingMs / (totalSecs * 1000));
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
  if (state.isLocked || state.isPaused) return;
  state.isLocked = true;
  stopTimer();
  const question = state.quizQuestions[state.currentIndex];
  const selectedIndexes = normalizeIndexList(Array.isArray(choiceIndexes) ? choiceIndexes : [choiceIndexes]);
  const correct = hasSameIndexes(selectedIndexes, question.correctIndexes);
  if (correct) {
    state.score += 1;
    if (!state.pauseUsed) recordCorrectQuestion(question.id);
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

  // ── Certification exam path ───────────────────────────────────────────────
  if (state.certMode) {
    const passed = state.score >= CERT_PASS_THRESHOLD;
    state.certPassed = passed;
    const certLevel = state.levels.find((l) => l.id === state.certLevelId);
    const certLevelName = certLevel ? certLevel.name : state.certLevelId;
    if (passed) {
      saveCertPass({
        levelId: state.certLevelId,
        roleId: state.learnerRoleId,
        roleName: getLearnerRoleName(),
        score: state.score,
        totalTimeMs,
        timestamp: Date.now(),
      });
    }
    // Send to Google Spreadsheet / local backend (same sheet, extra columns)
    const certResult = {
      roleId: state.learnerRoleId,
      roleName: getLearnerRoleName(),
      categoryId: `cert_${state.certLevelId}`,
      categoryName: `${certLevelName} ${t("certQuizLabel", state.lang)}`,
      questionCount: CERT_QUESTION_COUNT,
      score: state.score,
      totalTimeMs,
      timestamp: Date.now(),
      isCert: true,
      certPassed: passed,
    };
    sendResultToBackend(certResult);
    renderCertResult(passed, totalTimeMs);
    showScreen("result");
    playTone("finish");
    if (passed) {
      window.setTimeout(() => {
        playCertFanfare();
        showCertCelebration(state.certLevelId, state.score);
      }, 600);
    }
    return;
  }

  // ── Regular quiz path ─────────────────────────────────────────────────────
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
    isCert: false,
    certPassed: null,
  };
  addRanking(result);
  // correctQuestions has already been updated incrementally in handleAnswer.
  // Now check if this session pushed the category over the clear threshold.
  const categoryClearedThisSession = !state.wasCategoryClearAtStart && isClear(category.id) && !state.pauseUsed;
  const showClearBanner = categoryClearedThisSession && result.score === result.questionCount;
  if (categoryClearedThisSession) recordClearTimestamp(category.id, state.selectedLevel);
  const progress = getCategoryProgress(category.id);
  renderResult(result, { showClearBanner, progress });
  showScreen("result");
  sendResultToBackend(result);
  playTone("finish");
  if (showClearBanner) window.setTimeout(() => { playClearSound(); showFireworks(); }, 450);
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
  // Re-render level screen every time it becomes visible so clear counts
  // and cert button states reflect the latest localStorage data.
  if (name === "level") renderLevelScreen();
  if (name === "level" || name === "setup") startOpeningMusic();
}

function loadStoredState() {
  const data = readStore();
  state.selectedLevel = data.selectedLevel || "basic";
  state.lang = resolveInitialLang(data.lang);
  const storedRole = data.learnerRoleId || "";
  if (storedRole) {
    const input = document.querySelector(`input[name="learnerRole"][value="${storedRole}"]`);
    if (input) {
      input.checked = true;
      state.learnerRoleId = storedRole;
    } else {
      // Stale value from old schema — no matching radio button exists, clear it
      state.learnerRoleId = "";
    }
  } else {
    state.learnerRoleId = "";
  }
  updateMuteButton(data.muted);
  updateLevelButtons();
  // Show role prompt on main screen if no role stored
  if (els.levelRoleStatus) {
    els.levelRoleStatus.textContent = state.learnerRoleId ? "" : t("roleSelectPrompt", state.lang);
  }
}

function goToSetupBasic() {
  showScreen("level");
}

function checkAndInvalidateStaleClears() {
  const data = readStore();
  let changed = false;

  state.categories.forEach((cat) => {
    const questions = state.questionBank.get(cat.id) || [];
    const currentIds = new Set(questions.map((q) => q.id));
    const storedFingerprint = data.questionFingerprints[cat.id] || "";
    const storedIds = new Set(storedFingerprint ? storedFingerprint.split(",") : []);

    const hasNewIds = [...currentIds].some((id) => !storedIds.has(id));
    if (hasNewIds && storedFingerprint !== "") {
      state.levels.forEach((level) => {
        const key = `${level.id}:${cat.id}`;
        delete data.clears[key];
      });
      questions.forEach((q) => {
        delete data.correctQuestions[q.id];
      });
      changed = true;
    }

    const sortedIds = [...currentIds].sort().join(",");
    data.questionFingerprints[cat.id] = sortedIds;
  });

  if (changed || Object.keys(data.questionFingerprints).length !== state.categories.length) {
    writeStore(data);
  }
}

function persistLearnerRole() {
  const data = readStore();
  data.learnerRoleId = state.learnerRoleId;
  data.learnerRoleName = getLearnerRoleName();
  writeStore(data);
}

const ROLE_I18N_KEY = {
  resident_1y: "roleResident1Y",
  resident_2y: "roleResident2Y",
  senior_resident: "roleSeniorResident",
  er_doctor: "roleErDoctor",
  other_doctor: "roleOtherDoctor",
  nurse: "roleNurse",
  student: "roleStudent",
  other: "roleOther",
  // Legacy values kept for backward display of old records
  resident: "roleResident",
  doctor: "roleDoctor",
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

async function openNotice() {
  els.noticeBody.innerHTML = t("noticeBody", state.lang);
  await renderNoticeUpdates();
  els.noticeModal.hidden = false;
}

function closeNotice() {
  els.noticeModal.hidden = true;
  const data = readStore();
  data.noticeAcknowledged = true;
  writeStore(data);
}

async function renderNoticeUpdates() {
  try {
    const res = await fetch("data/updates.json", { cache: "no-store" });
    if (!res.ok) return;
    const { updates = [] } = await res.json();
    els.noticeUpdateList.innerHTML = "";
    updates.forEach(({ date, ja, en }) => {
      const li = document.createElement("li");
      li.textContent = `${date}　${state.lang === "en" ? en : ja}`;
      els.noticeUpdateList.appendChild(li);
    });
  } catch { /* silently skip if file missing */ }
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
      questionFingerprints: isCurrentSchema && parsed.questionFingerprints && typeof parsed.questionFingerprints === "object" ? parsed.questionFingerprints : {},
      noticeAcknowledged: Boolean(parsed.noticeAcknowledged),
      certPasses: Array.isArray(parsed.certPasses) ? parsed.certPasses : [],
    };
  } catch {
    return {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      learnerRoleId: "", learnerRoleName: "", muted: false, lang: "", selectedLevel: "basic",
      rankings: [], clears: {}, correctQuestions: {}, questionFingerprints: {}, noticeAcknowledged: false,
      certPasses: [],
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
  // If AudioContext is suspended (backgrounded, locked screen, etc.) wait for
  // the user gesture in bindAudioResume to resume it — don't try to play now.
  if (state.audioContext && state.audioContext.state === "suspended") return;
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
  if (state.audioContext && state.audioContext.state === "suspended") return;
  stopMusicLoop();
  // Certification exam uses heartbeat instead of melodic quiz music
  if (state.certMode) { startCertHeartbeat(); return; }
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
  return state.audioContext ?? null;
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

function playClearSound() {
  if (readStore().muted) return;
  // 上昇アルペジオ → 高音で和音 → 頂点でスパークル
  [
    [523,  0,   0.12, "triangle", 0.08],  // C5
    [659,  100, 0.12, "triangle", 0.08],  // E5
    [784,  200, 0.12, "triangle", 0.09],  // G5
    [1047, 310, 0.14, "triangle", 0.10],  // C6
    [1319, 430, 0.45, "triangle", 0.09],  // E6 — 長め保持
    [1047, 445, 0.35, "triangle", 0.055], // C6 ハーモニー
    [784,  460, 0.28, "triangle", 0.04],  // G5 ハーモニー
    [2093, 510, 0.22, "triangle", 0.030], // C7 スパークル
    [2637, 580, 0.15, "triangle", 0.018], // E7 高音シマー
  ].forEach(([freq, delay, dur, wave, gain]) => {
    window.setTimeout(() => playSynthNote(freq, dur, wave, gain), delay);
  });
}

function showFireworks() {
  const canvas = document.getElementById("fireworksCanvas");
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const COLORS = [
    "#ff4d6d", "#ff9f1c", "#ffde21", "#44cf6c",
    "#00c2e0", "#7b5ea7", "#ff79a8", "#ffffff",
  ];

  const particles = [];

  function spawnBurst(x, y) {
    const count = 64 + Math.floor(Math.random() * 32);
    for (let i = 0; i < count; i++) {
      const angle  = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed  = 2.5 + Math.random() * 4.5;
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size   = 2.5 + Math.random() * 2.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size,
        trail: [],
      });
    }
  }

  // Schedule 6 bursts at staggered times and random positions
  const burstTimes = [0, 180, 350, 520, 700, 900];
  burstTimes.forEach((delay) => {
    window.setTimeout(() => {
      const x = canvas.width  * (0.15 + Math.random() * 0.70);
      const y = canvas.height * (0.10 + Math.random() * 0.55);
      spawnBurst(x, y);
    }, delay);
  });

  let rafId;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Save short trail point
      p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
      if (p.trail.length > 5) p.trail.shift();

      // Draw trail
      p.trail.forEach((pt, ti) => {
        const trailAlpha = (pt.alpha * (ti + 1)) / (p.trail.length * 3);
        ctx.globalAlpha = trailAlpha;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw particle
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Update physics
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.09;       // gravity
      p.vx    *= 0.98;       // air resistance
      p.alpha -= 0.016;

      if (p.alpha <= 0) particles.splice(i, 1);
    }

    ctx.globalAlpha = 1;

    if (particles.length > 0) {
      rafId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Start after a very short delay so first burst is already spawned
  window.setTimeout(() => { rafId = requestAnimationFrame(loop); }, 20);
}

function playSynthNote(frequency, duration, typeName, gainValue) {
  if (readStore().muted) return;
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

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATION EXAM
// ══════════════════════════════════════════════════════════════════════════════

function openCertModal(levelId) {
  state.certLevelId = levelId;
  const level = state.levels.find((l) => l.id === levelId);
  const label = document.getElementById("certModalLevelLabel");
  if (label) label.textContent = `${level ? level.name : levelId} ${t("certLevelSuffix", state.lang)}`;
  // Pre-select role if already set
  if (state.learnerRoleId) {
    const input = document.querySelector(`input[name="certRole"][value="${state.learnerRoleId}"]`);
    if (input) input.checked = true;
  }
  document.getElementById("certModalStatus").textContent = "";
  document.getElementById("certModal").hidden = false;
}

function submitCertModal() {
  const roleInput = document.querySelector("input[name=\"certRole\"]:checked");
  const statusEl = document.getElementById("certModalStatus");
  if (!roleInput) {
    statusEl.textContent = t("roleSelectPrompt", state.lang);
    return;
  }
  document.getElementById("certModal").hidden = true;
  startCertExam(roleInput.value);
}

function startCertExam(roleId) {
  // Gather all unique questions from every category in this level
  const levelCats = state.categories.filter((c) => c.level === state.certLevelId);
  const seen = new Set();
  const allQuestions = [];
  levelCats.forEach((cat) => {
    (state.questionBank.get(cat.id) || []).forEach((q) => {
      if (!seen.has(q.id)) { seen.add(q.id); allQuestions.push(q); }
    });
  });
  if (allQuestions.length < CERT_QUESTION_COUNT) {
    document.getElementById("certModalStatus").textContent = t("errorInsufficientQuestions", state.lang);
    document.getElementById("certModal").hidden = false;
    return;
  }

  state.certMode = true;
  state.certPassed = false;
  state.certName = "";
  state.learnerRoleId = roleId;

  ensureAudioContext();
  state.quizQuestions = shuffle(allQuestions).slice(0, CERT_QUESTION_COUNT).map(prepareQuestion);
  state.currentIndex = 0;
  state.score = 0;
  state.reviewItems = [];
  state.startedAt = Date.now();
  state.isLocked = false;
  state.isPaused = false;
  state.pauseUsed = false;
  state.timerPauseRemainingMs = 0;
  state.lastTickSecond = null;
  state.musicUrgency = "normal";
  state.wasCategoryClearAtStart = false;

  const level = state.levels.find((l) => l.id === state.certLevelId);
  els.quizCategory.textContent = `${level ? level.name : state.certLevelId} ${t("certQuizLabel", state.lang)}`;
  showScreen("quiz");
  renderCurrentQuestion();
}

function renderCertResult(passed, totalTimeMs) {
  const percent = Math.round((state.score / CERT_QUESTION_COUNT) * 100);
  els.resultScore.textContent = `${state.score} / ${CERT_QUESTION_COUNT}`;
  els.resultPercent.textContent = `${percent}%`;
  els.resultTime.textContent = `${t("resultTimePrefix", state.lang)}${formatTime(totalTimeMs)}`;
  els.resultComment.textContent = passed ? `🏆 ${t("certCelebTitle", state.lang)}` : t("certFailLabel", state.lang);

  const heli = els.clearBanner.querySelector(".clear-banner__heli");
  const label = els.clearBanner.querySelector("span");
  els.clearBanner.hidden = false;
  els.clearBanner.classList.toggle("is-clear", passed);
  els.clearBanner.classList.toggle("is-finish", !passed);
  if (heli) heli.hidden = !passed;
  if (label) label.textContent = passed ? `🏆 ${t("certCelebTitle", state.lang)}` : t("certFailLabel", state.lang);

  if (els.resultProgress) els.resultProgress.hidden = true;
  setSyncStatus("", "");

  els.retryButton.textContent = t("certRetryButton", state.lang);

  renderReview();
  els.reviewList.hidden = false;
  els.toggleReviewButton.textContent = t("btnReviewToggleCollapse", state.lang);
  els.toggleReviewButton.setAttribute("aria-expanded", "true");
}

function saveCertPass(record) {
  const data = readStore();
  data.certPasses.push(record);
  writeStore(data);
}

function resetCertPasses() {
  const data = readStore();
  data.certPasses = [];
  writeStore(data);
}

// ── Cert celebration overlay ──────────────────────────────────────────────────

function showCertCelebration(levelId, score) {
  const overlay = document.getElementById("certCelebration");
  if (!overlay) return;
  const level = state.levels.find((l) => l.id === levelId);
  const levelName = level ? level.name : levelId;
  document.getElementById("certCelebTitle").textContent = t("certCelebTitle", state.lang);
  document.getElementById("certCelebLevel").textContent = `${levelName} ${t("certCelebLevelSuffix", state.lang)}`;
  document.getElementById("certCelebScore").textContent = `${score} / ${CERT_QUESTION_COUNT}`;
  document.getElementById("certCelebDate").textContent = new Intl.DateTimeFormat(
    t("dateLocale", state.lang), { year: "numeric", month: "2-digit", day: "2-digit" },
  ).format(new Date());
  overlay.hidden = false;
  const canvas = document.getElementById("certCanvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    runCertParticles(canvas);
  }
}

function closeCertCelebration() {
  const overlay = document.getElementById("certCelebration");
  if (!overlay) return;
  overlay.hidden = true;
  const canvas = document.getElementById("certCanvas");
  if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function runCertParticles(canvas) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const COLORS = [
    "#ffd700", "#ffa500", "#ff6b6b", "#ff4d4d",
    "#4ecdc4", "#45b7d1", "#96ceb4", "#ffffff",
    "#ff9ff3", "#a29bfe", "#fd79a8", "#00cec9",
  ];

  const particles = [];
  let frameCount = 0;

  function spawnFirework(x, y) {
    const count = 100 + Math.floor(Math.random() * 60);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 3 + Math.random() * 6;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = Math.random() > 0.7 ? 4 : 2.5;
      const type = Math.random() > 0.82 ? "star" : "circle";
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color, size, trail: [], type });
    }
  }

  function spawnConfetti() {
    const x = Math.random() * W;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      x, y: -10, vx: (Math.random() - 0.5) * 2, vy: 1.5 + Math.random() * 2,
      alpha: 1, color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      type: "confetti", w: 9 + Math.random() * 6, h: 4 + Math.random() * 3,
      trail: [],
    });
  }

  // 16 firework bursts at staggered intervals
  [0, 150, 320, 500, 700, 920, 1150, 1420, 1750, 2100, 2500, 3000, 3600, 4400, 5400, 6600].forEach((delay) => {
    window.setTimeout(() => {
      const x = W * (0.1 + Math.random() * 0.8);
      const y = H * (0.05 + Math.random() * 0.55);
      spawnFirework(x, y);
    }, delay);
  });

  function drawStar(x, y, size, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerA = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const innerA = outerA + Math.PI / 5;
      if (i === 0) ctx.moveTo(x + size * Math.cos(outerA), y + size * Math.sin(outerA));
      else ctx.lineTo(x + size * Math.cos(outerA), y + size * Math.sin(outerA));
      ctx.lineTo(x + size * 0.4 * Math.cos(innerA), y + size * 0.4 * Math.sin(innerA));
    }
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    frameCount += 1;

    // Confetti rain for the first ~8 s
    if (frameCount < 480 && frameCount % 4 === 0) spawnConfetti();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.type === "confetti") {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.007;
        if (p.alpha <= 0 || p.y > H + 20) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      } else {
        // Firework / star
        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trail.length > 5) p.trail.shift();
        p.trail.forEach((pt, ti) => {
          const tAlpha = (pt.alpha * (ti + 1)) / (p.trail.length * 3);
          ctx.globalAlpha = tAlpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        if (p.type === "star") {
          drawStar(p.x, p.y, p.size * 1.5, p.color, p.alpha);
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.alpha -= 0.013;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      }
    }

    ctx.globalAlpha = 1;
    if (frameCount < 700 || particles.length > 0) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, W, H);
  }

  window.setTimeout(() => requestAnimationFrame(loop), 20);
}

// ── Cert heartbeat quiz music ─────────────────────────────────────────────────
// Recursive setTimeout loop so the interval can accelerate as time runs out.

function startCertHeartbeat() {
  // stopMusicLoop() was already called by startQuizMusic()
  state.musicMode = "certHeartbeat";
  state.certBeatStep = 0;
  const generation = ++state.musicGeneration;
  scheduleCertBeat(generation, true); // true = isLub (first beat of the pair)
}

// Techno-pop layered over a LUB-DUB heartbeat foundation.
// - S1/S2 thumps preserve the cardiac feel
// - Sawtooth bass + square arpeggio give the techno-pop character
// - A short bright "tick" on every off-beat acts as a hi-hat
// - BPM accelerates quadratically as the timer runs out, dragging everything
//   else with it (the entire pattern just plays faster)
//
// A minor pentatonic / dorian-ish arpeggio so the urgency feels dark.
const CERT_ARP_HI    = [659, 784, 880, 988, 880, 784, 659, 587]; // A minor-ish lead, 8 steps
const CERT_BASS_LINE = [110, 110, 110, 165, 110, 110, 147, 165]; // bass groove, 8 steps

function scheduleCertBeat(generation, isLub) {
  if (generation !== state.musicGeneration || state.musicMode !== "certHeartbeat") return;
  if (readStore().muted) return;

  const remainingMs = Math.max(0, state.timerDeadline - Date.now());
  if (remainingMs <= 0) return;

  // BPM accelerates from 92 (full time) to 200 (≤1 s left), quadratic
  const ratio = Math.max(0, Math.min(1, 1 - (remainingMs / 1000 - 1) / (CERT_SECONDS - 1)));
  const bpm   = 92 + (200 - 92) * (ratio * ratio);
  const rrMs  = 60000 / bpm; // full RR (LUB→LUB) interval
  // Intensity rises with the timer — louder leads/hats near the end.
  const intensity = 0.55 + 0.45 * ratio;

  const step = state.certBeatStep % CERT_ARP_HI.length;
  const lead = CERT_ARP_HI[step];
  const bass = CERT_BASS_LINE[step];

  if (isLub) {
    // ── S1 (downbeat): kick + sub + bass note + bright lead ──
    playSynthNote(110, 0.11, "sine",     0.10);          // body of the kick
    playSynthNote( 65, 0.16, "triangle", 0.07);          // sub
    playSynthNote(bass, 0.10, "sawtooth", 0.055 * intensity); // techno bass
    playSynthNote(lead, 0.13, "square",   0.045 * intensity); // lead synth
    // 16th-note "tick" mid-way to next beat for a hi-hat feel
    window.setTimeout(() => {
      playSynthNote(7200, 0.018, "sawtooth", 0.025 * intensity);
    }, rrMs * 0.19);
  } else {
    // ── S2 (upbeat): softer kick + bass note + lead + offbeat tick ──
    playSynthNote(140, 0.07, "sine",     0.063);
    playSynthNote( 85, 0.10, "triangle", 0.044);
    playSynthNote(bass, 0.08, "sawtooth", 0.045 * intensity);
    playSynthNote(lead, 0.10, "square",   0.040 * intensity);
    // Brighter tick on the off-beat (classic techno hat placement)
    window.setTimeout(() => {
      playSynthNote(9000, 0.020, "sawtooth", 0.030 * intensity);
    }, rrMs * 0.31);
  }

  state.certBeatStep = (state.certBeatStep + 1) % CERT_ARP_HI.length;

  // S1→S2 ≈ 38% of RR, S2→S1 ≈ 62% (preserves the LUB-DUB asymmetry)
  const gapMs = isLub ? rrMs * 0.38 : rrMs * 0.62;
  window.setTimeout(() => scheduleCertBeat(generation, !isLub), gapMs);
}

// ── Cert fanfare music ────────────────────────────────────────────────────────

function playCertFanfare() {
  if (readStore().muted) return;
  // Triumphant 3-bar fanfare: rising arpeggio → sustained chord → resolution
  [
    // Bar 1 — rising arpeggio
    [523,   0,   0.14, "triangle", 0.09],  // C5
    [659,  110,  0.14, "triangle", 0.09],  // E5
    [784,  220,  0.14, "triangle", 0.10],  // G5
    [1047, 345,  0.16, "triangle", 0.11],  // C6
    [1319, 480,  0.18, "triangle", 0.10],  // E6
    // Bar 2 — triumphant chord
    [523,  700,  0.55, "triangle", 0.11],  // C5
    [659,  710,  0.55, "triangle", 0.10],  // E5
    [784,  720,  0.55, "triangle", 0.09],  // G5
    [1047, 730,  0.65, "triangle", 0.10],  // C6
    [131,  700,  0.55, "triangle", 0.09],  // C3 bass
    // Passing chord
    [587,  1280, 0.35, "triangle", 0.09],  // D5
    [740,  1290, 0.35, "triangle", 0.09],  // F#5
    [880,  1300, 0.35, "triangle", 0.09],  // A5
    [1175, 1310, 0.40, "triangle", 0.10],  // D6
    [147,  1280, 0.35, "triangle", 0.08],  // D3 bass
    // Third chord
    [440,  1650, 0.35, "triangle", 0.09],  // A4
    [659,  1660, 0.35, "triangle", 0.09],  // E5
    [880,  1670, 0.35, "triangle", 0.09],  // A5
    [1319, 1680, 0.40, "triangle", 0.10],  // E6
    [110,  1650, 0.35, "triangle", 0.08],  // A2 bass
    // Bar 3 — final resolution
    [523,  2050, 0.90, "triangle", 0.11],  // C5
    [659,  2060, 0.90, "triangle", 0.10],  // E5
    [784,  2070, 0.90, "triangle", 0.10],  // G5
    [1047, 2080, 1.10, "triangle", 0.11],  // C6
    [131,  2050, 0.90, "triangle", 0.10],  // C3 bass
    // High sparkle
    [2093, 2400, 0.30, "triangle", 0.040], // C7
    [2637, 2520, 0.20, "triangle", 0.022], // E7
    [3136, 2620, 0.15, "triangle", 0.012], // G7
  ].forEach(([freq, delay, dur, wave, gain]) => {
    window.setTimeout(() => playSynthNote(freq, dur, wave, gain), delay);
  });
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
