# Pause Button Design

**Date:** 2026-05-09  
**Status:** Approved

## Overview

Add a Pause (⏸) button to the quiz screen that temporarily freezes the 20-second countdown timer. If Pause is used at any point in a quiz session, all clear-related progress for that session is forfeit: no correct questions are recorded, category progress does not increase, and the CLEAR banner/timestamp are suppressed.

## State Management

Two new flags added to `state`:

| Flag | Type | Reset | Description |
|---|---|---|---|
| `isPaused` | `boolean` | `startQuiz()` | Currently paused |
| `pauseUsed` | `boolean` | `startQuiz()` | Pause was used at least once this session |

Remaining time is preserved across pause/resume via re-calculation of `timerDeadline`:
- **Pause:** `clearInterval(timerId)` + `stopMusicLoop()` + store `remainingMs = timerDeadline - Date.now()` + set `isPaused = true`, `pauseUsed = true`
- **Resume:** `timerDeadline = Date.now() + remainingMs` + call `startTimer()`

## UI Changes

### HTML (`index.html`)

Wrap the existing Quit button and new Pause button in a left-group div:

```html
<div class="quiz-topline">
  <div class="quiz-topline__left">
    <button id="quitQuizButton" class="text-button" type="button" data-i18n="quizQuit">中断</button>
    <button id="pauseQuizButton" class="text-button" type="button">⏸</button>
  </div>
  <div class="quiz-meta">
    <span id="quizCategory">カテゴリー</span>
    <span id="quizProgress">1 / 5</span>
  </div>
  <div class="timer" aria-label="残り時間">…</div>
</div>
```

Button text toggles: `⏸` (running) ↔ `▶` (paused). Both states use i18n keys `quizPause` / `quizResume`.

### CSS (`css/style.css`)

- `.quiz-topline__left { display: flex; align-items: center; gap: 8px; }`
- `.timer.is-paused .timer-arc { stroke: var(--line); }` — arc goes grey when frozen
- `.choice-button:disabled.is-paused { opacity: 0.5; cursor: not-allowed; }` — choices visually dimmed

### JS (`js/app.js`)

- `cacheElements()`: add `pauseQuizButton`
- `bindEvents()`: attach click handler to `pauseQuizButton` → calls `togglePause()`
- New `togglePause()` function handles pause/resume logic
- `renderCurrentQuestion()`: reset `isPaused = false` on each new question (pause does not carry over between questions)

## Clear Condition Changes

### `handleAnswer()` — skip progress recording when paused was used

```js
if (correct) {
  state.score += 1;
  if (!state.pauseUsed) recordCorrectQuestion(question.id);
}
```

### `finishQuiz()` — suppress clear when paused was used

```js
const categoryClearedThisSession =
  !state.wasCategoryClearAtStart && isClear(category.id) && !state.pauseUsed;
```

## Behaviour Summary

| Item | No Pause | Pause Used |
|---|---|---|
| Session score | Counted | Counted |
| `correctQuestions` record | Updated | **Not updated** |
| Category progress (`answered/total`) | Increases | **Does not increase** |
| `✓ CLEAR` badge | Shows when all answered | **Will not appear** |
| CLEAR banner | Shows on new clear | **Suppressed** |
| Clear timestamp | Recorded | **Not recorded** |

## i18n Keys to Add

| Key | ja | en |
|---|---|---|
| `quizPause` | `⏸` | `⏸` |
| `quizResume` | `▶` | `▶` |

## Files Changed

- `index.html` — quiz-topline structure + pause button
- `css/style.css` — `.quiz-topline__left`, `.timer.is-paused`, `.choice-button.is-paused`
- `js/app.js` — state flags, `togglePause()`, `handleAnswer()`, `finishQuiz()`, `cacheElements()`, `bindEvents()`, `renderCurrentQuestion()`
- `js/i18n.js` — two new i18n keys
