# Pause Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pause (⏸) button to the quiz screen that freezes the 20-second timer; using it forfeits all clear-related progress for that session.

**Architecture:** Four files change independently (i18n → HTML → CSS → JS). JS changes are the core: two new state flags (`isPaused`, `pauseUsed`) drive a `togglePause()` function; `handleAnswer()` skips `recordCorrectQuestion()` when `pauseUsed`; `finishQuiz()` suppresses the CLEAR banner when `pauseUsed`. No build step — verify in browser after each task.

**Tech Stack:** Vanilla JS, static HTML, CSS custom properties. No test framework — manual browser verification replaces automated tests.

---

## File Map

| File | Change |
|---|---|
| `js/i18n.js` | Add `quizPause` / `quizResume` keys to both `ja` and `en` |
| `index.html` | Wrap Quit button + new Pause button in `.quiz-topline__left` |
| `css/style.css` | Add `.quiz-topline__left`, `.timer.is-paused`, `.choice-list.is-paused` rules |
| `js/app.js` | State flags, `timerPauseRemainingMs`, `cacheElements`, `bindEvents`, `togglePause()`, `startQuiz()` reset, `renderCurrentQuestion()` reset, `handleAnswer()` guard, `finishQuiz()` guard |

---

## Task 1: i18n keys

**Files:**
- Modify: `js/i18n.js:34` (after `quizQuit` in `ja`)
- Modify: `js/i18n.js:112` (after `quizQuit` in `en`)

- [ ] **Step 1: Add keys to `ja` block**

In `js/i18n.js`, find `quizQuit: "中断",` (line 34) and add two lines after it:

```js
    quizQuit: "中断",
    quizPause: "⏸",
    quizResume: "▶ 再開",
```

- [ ] **Step 2: Add keys to `en` block**

Find `quizQuit: "Quit",` (line 112) and add two lines after it:

```js
    quizQuit: "Quit",
    quizPause: "⏸",
    quizResume: "▶ Resume",
```

- [ ] **Step 3: Verify in browser**

Open `index.html` in a browser (via local HTTP server). Open DevTools console and run:

```js
console.log(t("quizPause", "ja"), t("quizResume", "ja"));
console.log(t("quizPause", "en"), t("quizResume", "en"));
```

Expected output:
```
⏸  ▶ 再開
⏸  ▶ Resume
```

- [ ] **Step 4: Commit**

```
git add js/i18n.js
git commit -m "feat: add quizPause/quizResume i18n keys"
```

---

## Task 2: HTML — quiz-topline restructure

**Files:**
- Modify: `index.html:119-121`

- [ ] **Step 1: Wrap Quit + add Pause button**

Replace the current `quiz-topline` opening section (lines 118–132). The existing markup is:

```html
<section id="quizScreen" class="screen" aria-labelledby="quizCategory" hidden>
  <div class="quiz-topline">
    <button id="quitQuizButton" class="text-button" type="button" data-i18n="quizQuit">中断</button>
    <div class="quiz-meta">
```

Change to:

```html
<section id="quizScreen" class="screen" aria-labelledby="quizCategory" hidden>
  <div class="quiz-topline">
    <div class="quiz-topline__left">
      <button id="quitQuizButton" class="text-button" type="button" data-i18n="quizQuit">中断</button>
      <button id="pauseQuizButton" class="text-button" type="button">⏸</button>
    </div>
    <div class="quiz-meta">
```

The closing `</div>` for `quiz-topline` is already present further down — do not add an extra one.

- [ ] **Step 2: Verify in browser**

Start a quiz. Confirm:
- "中断" (Quit) button is still visible on the left
- "⏸" button appears immediately to its right
- Timer appears on the right as before
- Layout is not broken

- [ ] **Step 3: Commit**

```
git add index.html
git commit -m "feat: add pauseQuizButton to quiz-topline"
```

---

## Task 3: CSS — pause styles

**Files:**
- Modify: `css/style.css` (after `.quiz-topline` block, ~line 470)

- [ ] **Step 1: Add `.quiz-topline__left` rule**

After the `.quiz-topline` block (ends around line 470), insert:

```css
.quiz-topline__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

- [ ] **Step 2: Add `.timer.is-paused` rule**

After the `.timer.is-danger span` block (ends around line 524), insert:

```css
.timer.is-paused .timer-arc {
  stroke: var(--line);
}
```

- [ ] **Step 3: Add `.choice-list.is-paused` rule**

After the `.question-panel` rule (around line 543), insert:

```css
.choice-list.is-paused .choice-button {
  opacity: 0.45;
  pointer-events: none;
}
```

- [ ] **Step 4: Verify in browser**

Open DevTools. In the quiz screen, manually toggle classes:

```js
document.querySelector(".timer").classList.add("is-paused");
document.querySelector(".choice-list").classList.add("is-paused");
```

Expected:
- Timer arc becomes grey (same as the track color)
- Choice buttons become semi-transparent

Remove them again:

```js
document.querySelector(".timer").classList.remove("is-paused");
document.querySelector(".choice-list").classList.remove("is-paused");
```

- [ ] **Step 5: Commit**

```
git add css/style.css
git commit -m "feat: add pause CSS classes for timer and choice list"
```

---

## Task 4: JS — state, cacheElements, startQuiz reset

**Files:**
- Modify: `js/app.js:98-126` (state object)
- Modify: `js/app.js:172-188` (cacheElements)
- Modify: `js/app.js:550-576` (startQuiz)

- [ ] **Step 1: Add new state fields**

In the `state` object (around line 110, after `isLocked`), add three fields:

```js
  isLocked: false,
  isPaused: false,
  pauseUsed: false,
  timerPauseRemainingMs: 0,
  lastTickSecond: null,
```

- [ ] **Step 2: Add `pauseQuizButton` to cacheElements**

In `cacheElements()`, add `"pauseQuizButton"` to the array. Find `"quitQuizButton"` and add it alongside:

```js
    "quitQuizButton", "pauseQuizButton", "quizCategory", "quizProgress",
```

- [ ] **Step 3: Reset pause flags in startQuiz()**

In `startQuiz()`, find the block that resets `isLocked` and `lastTickSecond` (around line 570) and add the three new fields:

```js
  state.isLocked = false;
  state.isPaused = false;
  state.pauseUsed = false;
  state.timerPauseRemainingMs = 0;
  state.lastTickSecond = null;
```

- [ ] **Step 4: Verify in browser (DevTools)**

After starting a quiz, run in console:

```js
console.log(state.isPaused, state.pauseUsed, state.timerPauseRemainingMs);
// Expected: false false 0
console.log(els.pauseQuizButton);
// Expected: <button id="pauseQuizButton" …>
```

- [ ] **Step 5: Commit**

```
git add js/app.js
git commit -m "feat: add pause state fields and cache pauseQuizButton"
```

---

## Task 5: JS — togglePause() and bindEvents()

**Files:**
- Modify: `js/app.js:215-278` (bindEvents)
- Modify: `js/app.js` (new function after stopTimer)

- [ ] **Step 1: Add click handler in bindEvents()**

In `bindEvents()`, find the line:

```js
  els.quitQuizButton.addEventListener("click", () => { stopTimer(); showScreen("level"); });
```

Add the pause button handler directly after it:

```js
  els.pauseQuizButton.addEventListener("click", togglePause);
```

- [ ] **Step 2: Add togglePause() function**

Add this function after `stopTimer()` (around line 692):

```js
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
```

- [ ] **Step 3: Verify pause/resume in browser**

Start a quiz. Note the timer countdown. Click ⏸:
- Timer freezes
- Button shows "▶ 再開" (ja) or "▶ Resume" (en)
- Timer arc turns grey
- Choice buttons become semi-transparent
- Music stops

Click ▶ 再開:
- Timer resumes from where it froze (not from 20s)
- Button shows ⏸
- Arc color restores
- Choices are interactive again
- Music restarts

- [ ] **Step 4: Commit**

```
git add js/app.js
git commit -m "feat: implement togglePause() with timer freeze and music stop"
```

---

## Task 6: JS — quiz logic guards

**Files:**
- Modify: `js/app.js:604-643` (renderCurrentQuestion)
- Modify: `js/app.js:645-657` (toggleMultipleChoice)
- Modify: `js/app.js:730-761` (handleAnswer)
- Modify: `js/app.js:776-801` (finishQuiz)

- [ ] **Step 1: Reset pause UI in renderCurrentQuestion()**

In `renderCurrentQuestion()`, find `stopTimer();` at the top and add the reset block after it:

```js
function renderCurrentQuestion() {
  stopTimer();
  state.isPaused = false;
  state.timerPauseRemainingMs = 0;
  if (els.pauseQuizButton) {
    els.pauseQuizButton.textContent = t("quizPause", state.lang);
  }
  els.timerText.closest(".timer").classList.remove("is-paused");
  // els.choiceList is rebuilt below so its class is reset automatically
  state.isLocked = false;
  state.lastTickSecond = null;
```

(The existing `state.isLocked = false;` and `state.lastTickSecond = null;` lines that follow should be removed to avoid duplication — they are now in the block above.)

- [ ] **Step 2: Guard toggleMultipleChoice against isPaused**

Find `toggleMultipleChoice()` and change the first guard line:

```js
function toggleMultipleChoice(choiceIndex) {
  if (state.isLocked || state.isPaused) return;
```

- [ ] **Step 3: Guard handleAnswer against isPaused**

In `handleAnswer()`, find the guard at the top:

```js
function handleAnswer(choiceIndexes, timedOut) {
  if (state.isLocked) return;
```

Change to:

```js
function handleAnswer(choiceIndexes, timedOut) {
  if (state.isLocked || state.isPaused) return;
```

This is a defensive safety net — `pointer-events: none` already blocks clicks from the CSS, but this ensures no JS path can slip through.

- [ ] **Step 4: Skip recordCorrectQuestion when pauseUsed**

In the same `handleAnswer()`, find:

```js
  if (correct) {
    state.score += 1;
    recordCorrectQuestion(question.id);
  }
```

Change to:

```js
  if (correct) {
    state.score += 1;
    if (!state.pauseUsed) recordCorrectQuestion(question.id);
  }
```

- [ ] **Step 5: Suppress clear when pauseUsed**

In `finishQuiz()`, find:

```js
  const categoryClearedThisSession = !state.wasCategoryClearAtStart && isClear(category.id);
```

Change to:

```js
  const categoryClearedThisSession = !state.wasCategoryClearAtStart && isClear(category.id) && !state.pauseUsed;
```

- [ ] **Step 6: Verify clear suppression in browser**

Run a short quiz (5 Q) on a category that is not yet cleared:
1. Pause at least once during the quiz
2. Answer all questions correctly
3. Confirm on result screen: no CLEAR banner appears, result shows "Finish" not "CLEAR!"
4. Open clear records screen: no timestamp for that category

Run the same category again without pausing and answer all correctly:
5. CLEAR banner should NOT appear (because correct questions were not recorded in step 2, the category is not yet `isClear()`)

Re-run and answer all correctly without pausing:
6. Each correct answer adds to `correctQuestions` — once all are answered across sessions (without pause), CLEAR triggers normally

- [ ] **Step 7: Commit**

```
git add js/app.js
git commit -m "feat: pause forfeits clear progress; suppress CLEAR banner when pauseUsed"
```

---

## Task 7: Final integration test

No code changes — manual end-to-end verification only.

- [ ] **Step 1: Pause mid-quiz and resume — check timer accuracy**

Start a 5Q quiz. Note time remaining (e.g. 15s). Pause for ~5 seconds. Resume. Verify timer continues from ~15s (not reset, not jumped).

- [ ] **Step 2: Pause after answering is blocked**

Answer a question. Immediately (during the 950ms delay before next question) click ⏸. Verify nothing happens (button click ignored because `isLocked = true`).

- [ ] **Step 3: Quit while paused**

Pause mid-question. Click "中断" (Quit). Verify app returns to level screen cleanly with no stuck state.

- [ ] **Step 4: Language switch — button label**

In the quiz screen (paused), toggle language (ja ↔ en) is not available during quiz — confirm no issues. Resume, note ⏸ button remains correctly labeled.

- [ ] **Step 5: Pause on last question**

On the final question, pause and resume. Complete the quiz. Verify result screen renders correctly.

- [ ] **Step 6: No-pause clear flow still works**

Complete a quiz on an uncleared category, with all questions correct, no pause. Confirm CLEAR banner appears and clear timestamp is recorded in the clear screen.
