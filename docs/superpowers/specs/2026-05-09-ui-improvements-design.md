# UI Improvements & README Popup Design

**Date:** 2026-05-09  
**Status:** Approved

## Overview

Six independent improvements to the quiz app:
1. Move Pause button adjacent to timer
2. Rename "中断" → "ホームへ戻る" / "Home"
3. Remove 20-question option
4. Back from Ranking/Clear screens → Setup screen (Basic level)
5. Reset category clear when questions are added
6. README notice popup (auto-show on first visit + button to reopen)

---

## 1. Pause Button Relocation

**Current layout:**
```
[ホームへ戻る ⏸]   [Category / 1/5]   [Timer]
```

**New layout:**
```
[ホームへ戻る]   [Category / 1/5]   [⏸  Timer]
```

**HTML change (`index.html`):**

Remove `pauseQuizButton` from `.quiz-topline__left`. Wrap `pauseQuizButton` + `.timer` in a new `.quiz-topline__right` div:

```html
<div class="quiz-topline">
  <button id="quitQuizButton" class="text-button" type="button" data-i18n="quizQuit">ホームへ戻る</button>
  <div class="quiz-meta">
    <span id="quizCategory">カテゴリー</span>
    <span id="quizProgress">1 / 5</span>
  </div>
  <div class="quiz-topline__right">
    <button id="pauseQuizButton" class="text-button" type="button">⏸</button>
    <div class="timer" aria-label="残り時間">…</div>
  </div>
</div>
```

**CSS change (`css/style.css`):**

Replace `.quiz-topline__left` rule with `.quiz-topline__right`:
```css
.quiz-topline__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

Remove `.quiz-topline__left` rule entirely.

---

## 2. Rename "中断" → "ホームへ戻る" / "Home"

**i18n change (`js/i18n.js`):**

```js
// ja
quizQuit: "ホームへ戻る",

// en
quizQuit: "Home",
```

---

## 3. Remove 20-Question Option

**HTML change (`index.html`):**

Remove the button with `data-count="20"`:
```html
<!-- DELETE THIS LINE: -->
<button type="button" class="segment" data-count="20">20<span …></span></button>
```

No JS change needed — the button count logic already handles fewer buttons.

---

## 4. Back from Ranking/Clear → Setup Screen (Basic)

**JS change (`js/app.js`):**

`closeRankingButton` and `closeClearButton` click handlers change from `showScreen("level")` to:

```js
function goToSetupBasic() {
  state.selectedLevel = "basic";
  const data = readStore();
  data.selectedLevel = "basic";
  writeStore(data);
  updateLevelButtons();
  showScreen("setup");
  renderCategories();
  renderQuestionCountControls();
  updateSetupSummary();
}

els.closeRankingButton.addEventListener("click", goToSetupBasic);
els.closeClearButton.addEventListener("click", goToSetupBasic);
```

---

## 5. Category Clear Reset When Questions Added

### Storage

Add `questionFingerprints` to `qqq_state_v1` localStorage schema (no version bump needed — new optional field):

```js
questionFingerprints: {}  // { [categoryId]: "sorted,comma,joined,ids" }
```

Update `readStore()` to include:
```js
questionFingerprints: isCurrentSchema && typeof parsed.questionFingerprints === "object" ? parsed.questionFingerprints : {},
```

### Detection Function

New function `checkAndInvalidateStaleClears()` called after `loadQuestionData()`:

```js
function checkAndInvalidateStaleClears() {
  const data = readStore();
  let changed = false;

  state.categories.forEach((cat) => {
    const questions = state.questionBank.get(cat.id) || [];
    const currentIds = new Set(questions.map((q) => q.id));
    const storedFingerprint = data.questionFingerprints[cat.id] || "";
    const storedIds = new Set(storedFingerprint ? storedFingerprint.split(",") : []);

    // Only invalidate if NEW question IDs appeared (additions only, not deletions)
    const hasNewIds = [...currentIds].some((id) => !storedIds.has(id));
    if (hasNewIds && storedFingerprint !== "") {
      // Delete clear timestamp for this category across all levels
      state.levels.forEach((level) => {
        const key = `${level.id}:${cat.id}`;
        delete data.clears[key];
      });
      // Delete correctQuestions entries for this category's questions
      questions.forEach((q) => {
        delete data.correctQuestions[q.id];
      });
      changed = true;
    }

    // Always update fingerprint to current state
    const sortedIds = [...currentIds].sort().join(",");
    data.questionFingerprints[cat.id] = sortedIds;
  });

  if (changed || Object.keys(data.questionFingerprints).length !== state.categories.length) {
    writeStore(data);
  }
}
```

Called in `init()` after `loadQuestionData()`:
```js
await loadQuestionData();
checkAndInvalidateStaleClears();
```

Note: `storedFingerprint !== ""` guard ensures first-run (no fingerprint yet) does NOT invalidate existing clears.

---

## 6. README Notice Popup

### New File: `data/updates.json`

```json
{
  "updates": [
    { "date": "2026-05-09", "ja": "初回リリース", "en": "Initial release" }
  ]
}
```

Add entries (newest first) when questions are updated. Example:
```json
{ "date": "2026-06-01", "ja": "CPRカテゴリーに問題を3件追加", "en": "Added 3 questions to CPR category" }
```

### HTML Modal (`index.html`)

Add a notice button in the level screen header and a modal overlay:

```html
<!-- Button: in the level screen header area, near muteButton -->
<button id="noticeButton" class="text-button" type="button" data-i18n="btnNotice">使い方</button>

<!-- Modal: added at bottom of body, hidden by default -->
<div id="noticeModal" class="modal-overlay" hidden>
  <div class="modal-panel">
    <h2 data-i18n="noticeTitle">このクイズについて</h2>
    <div id="noticeBody" class="notice-body"></div>
    <section class="notice-updates">
      <h3 data-i18n="noticeUpdatesTitle">アップデート履歴</h3>
      <ul id="noticeUpdateList"></ul>
    </section>
    <button id="noticeCloseButton" class="primary-button" type="button" data-i18n="noticeClose">閉じる</button>
  </div>
</div>
```

### CSS (`css/style.css`)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-overlay[hidden] { display: none; }

.modal-panel {
  background: var(--surface);
  border-radius: 12px;
  padding: 28px 24px;
  max-width: 560px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-body p {
  margin: 0 0 12px;
  line-height: 1.7;
  font-size: 0.9rem;
}

.notice-updates h3 {
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 8px;
}

.notice-updates li {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--muted);
}
```

### i18n Keys (`js/i18n.js`)

```js
// ja
btnNotice: "使い方",
noticeTitle: "このクイズについて",
noticeUpdatesTitle: "アップデート履歴",
noticeClose: "閉じる",
noticeBody: `<p>このクイズは、手稲渓仁会病院 救命救急センターが教育目的で作成しています。</p>
<p>クイズの内容はガイドラインに基づいていますが、投薬方法など一部は当施設のやり方を採用しています。施設によって異なる場合がありますので、実際の診療では必ず自施設の指導医にご確認ください。</p>
<p>各問題は30秒以内に答える形式です。時間が短いと感じる場合は、一時停止ボタン（⏸）をご利用ください。一時停止中はゆっくり問題を読むことができます。</p>
<p>カテゴリー内の全問題に正解するとクリアになります。ただし、一時停止を使用した場合はクリア条件を満たしません。制限時間内に答えることがクリアの条件です。</p>
<p>問題内容は随時修正・追加されます。問題が更新されたカテゴリーはクリアが解除されますので、ぜひ再挑戦してください。</p>`,

// en
btnNotice: "About",
noticeTitle: "About This Quiz",
noticeUpdatesTitle: "Update History",
noticeClose: "Close",
noticeBody: `<p>This quiz was created for educational purposes by the Emergency and Critical Care Center at Teine Keijinkai Hospital.</p>
<p>Quiz content is primarily based on clinical guidelines, but some procedures (such as medication dosing) reflect our institution's practices. These may differ from other facilities — please consult your supervising physician for guidance.</p>
<p>Each question must be answered within 30 seconds. If you feel rushed, use the pause button (⏸) to take your time reading the question.</p>
<p>Completing all questions in a category correctly earns a CLEAR. However, using the pause button disqualifies that session from clearing — you must answer within the time limit.</p>
<p>Questions are updated regularly with corrections and additions. When a category's questions are updated, its CLEAR status will be reset — please try again!</p>`,
```

### JS Logic (`js/app.js`)

**New state field:**
```js
noticeAcknowledged: false,  // not stored in localStorage — read from store on init
```

Actually stored in `readStore()`:
```js
noticeAcknowledged: Boolean(parsed.noticeAcknowledged),
```

**`cacheElements()`:** add `noticeButton`, `noticeModal`, `noticeBody`, `noticeUpdateList`, `noticeCloseButton`

**`bindEvents()`:** add handlers:
```js
els.noticeButton.addEventListener("click", openNotice);
els.noticeCloseButton.addEventListener("click", closeNotice);
els.noticeModal.addEventListener("click", (e) => { if (e.target === els.noticeModal) closeNotice(); });
```

**New `openNotice()` / `closeNotice()` functions:**
```js
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
    const { updates } = await res.json();
    els.noticeUpdateList.innerHTML = "";
    updates.forEach(({ date, ja, en }) => {
      const li = document.createElement("li");
      li.textContent = `${date}　${state.lang === "en" ? en : ja}`;
      els.noticeUpdateList.appendChild(li);
    });
  } catch { /* silently skip if file missing */ }
}
```

**Auto-show on first visit** in `init()` after rendering:
```js
const data = readStore();
if (!data.noticeAcknowledged) openNotice();
```

**`applyI18n()`** update: after language change, refresh `noticeBody` if modal is visible:
```js
if (!els.noticeModal.hidden) {
  els.noticeBody.innerHTML = t("noticeBody", state.lang);
}
```

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | Restructure quiz-topline, remove 20Q button, add notice button + modal |
| `css/style.css` | Rename `.quiz-topline__left` → `.quiz-topline__right`, add modal CSS |
| `js/i18n.js` | `quizQuit`, `btnNotice`, notice content keys |
| `js/app.js` | Navigation handlers, `checkAndInvalidateStaleClears()`, notice open/close logic, `readStore()` update |
| `data/updates.json` | New file — update history entries |
