const STORAGE_KEY = "qqq_state_v1";
const BACKEND_EVENT_URL = "http://127.0.0.1:8787/api/events";
const QUESTION_SECONDS = 20;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 52;
const NEXT_QUESTION_DELAY_MS = 950;

const state = {
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
  lastScreen: "setup",
  audioContext: null,
  musicLoopId: 0,
  musicStep: 0,
  musicGeneration: 0,
  musicMode: "",
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
    await loadQuestionData();
    state.selectedCategoryId = state.categories[0]?.id || "";
    renderCategories();
    renderQuestionCountControls();
    renderRankingTabs();
    updateSetupSummary();
    updateStartButtonState();
  } catch (error) {
    els.setupStatus.textContent = "問題データを読み込めません。ローカルHTTPサーバーで開いてください。";
    console.error(error);
  }
}

function cacheElements() {
  [
    "setupScreen",
    "quizScreen",
    "resultScreen",
    "rankingScreen",
    "categoryGrid",
    "selectedCategoryLabel",
    "setupStatus",
    "startQuizButton",
    "rankingButton",
    "muteButton",
    "quitQuizButton",
    "quizCategory",
    "quizProgress",
    "timerArc",
    "timerText",
    "questionText",
    "choiceList",
    "resultScore",
    "resultPercent",
    "resultTime",
    "resultComment",
    "retryButton",
    "backToSetupButton",
    "resultRankingButton",
    "toggleReviewButton",
    "reviewList",
    "rankingTabs",
    "rankingList",
    "rankingEmpty",
    "closeRankingButton",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
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
  els.closeRankingButton.addEventListener("click", () => showScreen(state.lastScreen === "quiz" ? "setup" : state.lastScreen));
  els.quitQuizButton.addEventListener("click", () => {
    stopTimer();
    showScreen("setup");
  });
  els.retryButton.addEventListener("click", startQuiz);
  els.backToSetupButton.addEventListener("click", () => showScreen("setup"));
  els.toggleReviewButton.addEventListener("click", toggleReview);
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

function bindFirstAudioGesture() {
  document.addEventListener(
    "pointerdown",
    () => startOpeningMusic(),
    { once: true, passive: true },
  );
  document.addEventListener(
    "keydown",
    () => startOpeningMusic(),
    { once: true },
  );
}

async function loadQuestionData() {
  const categoriesResponse = await fetch("data/categories.json", { cache: "no-store" });
  if (!categoriesResponse.ok) throw new Error(`categories.json ${categoriesResponse.status}`);
  state.categories = await categoriesResponse.json();

  await Promise.all(
    state.categories.map(async (category) => {
      const response = await fetch(`data/${category.file}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`${category.file} ${response.status}`);
      const data = await response.json();
      state.questionBank.set(category.id, data.questions);
      category.questionTotal = data.questions.length;
    }),
  );
}

function renderCategories() {
  els.categoryGrid.innerHTML = "";
  state.categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-card";
    button.style.borderTopColor = category.accent || "var(--primary)";
    button.setAttribute("aria-pressed", String(category.id === state.selectedCategoryId));
    button.dataset.categoryId = category.id;

    const title = document.createElement("h3");
    title.textContent = category.name;
    const description = document.createElement("p");
    description.textContent = category.description;
    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.innerHTML = `<span>${category.questionTotal}問</span><span>20秒/問</span>`;

    button.append(title, description, meta);
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
    const selected = card.dataset.categoryId === state.selectedCategoryId;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
}

function renderQuestionCountControls() {
  const questionTotal = getSelectedQuestions().length;
  document.querySelectorAll("[data-count]").forEach((button) => {
    const count = Number(button.dataset.count);
    button.disabled = questionTotal > 0 && count > questionTotal;
    button.classList.toggle("is-active", count === state.questionCount);
  });

  if (questionTotal > 0 && state.questionCount > questionTotal) {
    state.questionCount = questionTotal >= 10 ? 10 : 5;
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
  return state.categories.find((category) => category.id === state.selectedCategoryId);
}

function getSelectedQuestions() {
  return state.questionBank.get(state.selectedCategoryId) || [];
}

function startQuiz() {
  const category = getSelectedCategory();
  const sourceQuestions = getSelectedQuestions();
  if (!category || sourceQuestions.length === 0) {
    els.setupStatus.textContent = "カテゴリーを読み込めていません。";
    return;
  }
  if (state.questionCount > sourceQuestions.length) {
    els.setupStatus.textContent = "選択した出題数に対して問題数が不足しています。";
    return;
  }
  if (!state.learnerRoleId) {
    els.setupStatus.textContent = "職種を選択してください。";
    return;
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

  els.quizCategory.textContent = category.name;
  showScreen("quiz");
  renderCurrentQuestion();
}

function prepareQuestion(question) {
  const choices = question.choices.map((text, index) => ({ text, originalIndex: index }));
  const shuffledChoices = shuffle(choices);
  return {
    id: question.id,
    question: question.question,
    explanation: question.explanation,
    choices: shuffledChoices.map((choice) => choice.text),
    correctIndex: shuffledChoices.findIndex((choice) => choice.originalIndex === question.answer),
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
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = 0;
  }
  stopMusicLoop();
}

function setupTimerArc() {
  els.timerArc.style.strokeDasharray = String(TIMER_CIRCUMFERENCE);
  els.timerArc.style.strokeDashoffset = "0";
}

function updateTimerDisplay() {
  const remainingMs = Math.max(0, state.timerDeadline - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const elapsedRatio = 1 - remainingMs / (QUESTION_SECONDS * 1000);
  const offset = TIMER_CIRCUMFERENCE * elapsedRatio;
  const timer = els.timerText.closest(".timer");

  els.timerText.textContent = String(remainingSeconds);
  els.timerArc.style.strokeDashoffset = String(offset);
  timer.classList.toggle("is-warning", remainingSeconds <= 5 && remainingSeconds > 3);
  timer.classList.toggle("is-danger", remainingSeconds <= 3);

  if (remainingSeconds > 0 && remainingSeconds <= 3 && remainingSeconds !== state.lastTickSecond) {
    state.lastTickSecond = remainingSeconds;
    playTone("tick");
  }

  if (remainingMs <= 0) {
    handleAnswer(null, true);
  }
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
      renderCurrentQuestion();
    }
  }, NEXT_QUESTION_DELAY_MS);
}

function renderChoiceFeedback(selectedIndex, correctIndex) {
  const buttons = els.choiceList.querySelectorAll(".choice-button");
  buttons.forEach((button, index) => {
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
  sendResultToBackend(result);
  renderResult(result);
  playTone("finish");
  showScreen("result");
}

function renderResult(result) {
  const percent = Math.round((result.score / result.questionCount) * 100);
  els.resultScore.textContent = `${result.score} / ${result.questionCount}`;
  els.resultPercent.textContent = `${percent}%`;
  els.resultTime.textContent = `所要時間 ${formatTime(result.totalTimeMs)}`;
  els.resultComment.textContent = getResultComment(percent);
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

function openRanking(tabId) {
  renderRanking(tabId);
  showScreen("ranking");
}

function renderRankingTabs() {
  els.rankingTabs.innerHTML = "";
  const tabs = [{ id: "all", name: "全体" }, ...state.categories.map((category) => ({ id: category.id, name: category.name }))];
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
  const filtered = activeTab === "all" ? rankings : rankings.filter((record) => record.categoryId === activeTab);
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

function showScreen(name) {
  stopTimer();
  ["setup", "quiz", "result", "ranking"].forEach((screenName) => {
    const element = els[`${screenName}Screen`];
    element.hidden = screenName !== name;
    element.classList.toggle("is-active", screenName === name);
  });
  if (name !== "ranking") state.lastScreen = name;
  if (name === "setup") startOpeningMusic();
}

function loadStoredState() {
  const data = readStore();
  state.learnerRoleId = data.learnerRoleId || "";
  if (state.learnerRoleId) {
    const input = document.querySelector(`input[name="learnerRole"][value="${state.learnerRoleId}"]`);
    if (input) input.checked = true;
  }
  updateMuteButton(data.muted);
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
  if (data.muted) {
    stopMusicLoop();
  } else {
    startOpeningMusic();
  }
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
      learnerRoleId: parsed.learnerRoleId || "",
      learnerRoleName: parsed.learnerRoleName || "",
      muted: Boolean(parsed.muted),
      rankings: Array.isArray(parsed.rankings) ? parsed.rankings : [],
    };
  } catch {
    return { learnerRoleId: "", learnerRoleName: "", muted: false, rankings: [] };
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  };
  const body = JSON.stringify(event);

  if (navigator.sendBeacon) {
    const ok = navigator.sendBeacon(BACKEND_EVENT_URL, new Blob([body], { type: "application/json" }));
    if (ok) return;
  }

  fetch(BACKEND_EVENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function ensureAudioContext() {
  if (!state.audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    state.audioContext = new AudioContextClass();
  }
  if (state.audioContext.state === "suspended") {
    state.audioContext.resume().catch(() => {});
  }
  return state.audioContext;
}

function playTone(type) {
  if (readStore().muted) return;
  if (type === "correct") {
    playCorrectSound();
    return;
  }

  const presets = {
    wrong: [170, 0.18, "sawtooth", 0.06],
    tick: [880, 0.05, "square", 0.035],
    finish: [523, 0.22, "triangle", 0.08],
  };
  const [frequency, duration, typeName, gainValue] = presets[type] || presets.tick;
  playSynthNote(frequency, duration, typeName, gainValue);

  if (type === "finish") {
    window.setTimeout(() => playTone("correct"), 120);
  }
}

function playCorrectSound() {
  const notes = [
    [659, 0],
    [784, 75],
    [988, 150],
    [1319, 240],
  ];
  notes.forEach(([frequency, delay]) => {
    window.setTimeout(() => playSynthNote(frequency, 0.12, "triangle", 0.075), delay);
  });
}

function startOpeningMusic() {
  if (readStore().muted || !isSetupScreenVisible()) return;
  if (state.musicMode === "opening" && state.musicLoopId) return;
  stopMusicLoop();
  const generation = ++state.musicGeneration;
  state.musicMode = "opening";
  state.musicStep = 0;
  playOpeningMusicStep(generation);
  state.musicLoopId = window.setInterval(() => playOpeningMusicStep(generation), 230);
}

function playOpeningMusicStep(generation) {
  if (generation !== state.musicGeneration) return;
  if (readStore().muted || !isSetupScreenVisible()) {
    stopMusicLoop();
    return;
  }

  const melody = [
    523, 659, 784, 1047, 988, 784, 659, 784,
    587, 740, 880, 1175, 1047, 880, 740, 880,
    659, 784, 988, 1319, 1175, 988, 784, 988,
    698, 880, 1047, 1397, 1319, 1047, 880, 1047,
  ];
  const bass = [131, 131, 196, 196, 147, 147, 196, 196, 165, 165, 220, 220, 196, 196, 247, 247];
  const step = state.musicStep % melody.length;

  playSynthNote(melody[step], step % 4 === 3 ? 0.18 : 0.12, step % 8 < 4 ? "square" : "triangle", 0.028);
  if (step % 2 === 0) playSynthNote(bass[step % bass.length], 0.18, "triangle", 0.018);
  if (step % 8 === 0) playSynthNote(melody[step] * 1.5, 0.08, "triangle", 0.014);
  state.musicStep += 1;
}

function startQuizMusic() {
  if (readStore().muted) return;
  stopMusicLoop();
  const pattern = [196, 220, 247, 220, 196, 175, 196, 294];
  const generation = ++state.musicGeneration;
  state.musicMode = "quiz";
  state.musicStep = 0;
  playQuizMusicStep(pattern, generation);
  state.musicLoopId = window.setInterval(() => playQuizMusicStep(pattern, generation), 190);
}

function playQuizMusicStep(pattern, generation) {
  if (generation !== state.musicGeneration || readStore().muted) return;
  const frequency = pattern[state.musicStep % pattern.length];
  const gain = state.musicStep % 4 === 3 ? 0.026 : 0.018;
  playSynthNote(frequency, 0.08, "square", gain);
  state.musicStep += 1;
}

function stopMusicLoop() {
  state.musicGeneration += 1;
  if (state.musicLoopId) {
    window.clearInterval(state.musicLoopId);
    state.musicLoopId = 0;
  }
  state.musicMode = "";
}

function isSetupScreenVisible() {
  return els.setupScreen && !els.setupScreen.hidden;
}

function playSynthNote(frequency, duration, typeName, gainValue) {
  const audio = ensureAudioContext();
  if (!audio) return;

  const play = () => {
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = typeName;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  };

  if (audio.state === "suspended") {
    audio.resume().then(play).catch(() => {});
    return;
  }
  play();
}

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
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
