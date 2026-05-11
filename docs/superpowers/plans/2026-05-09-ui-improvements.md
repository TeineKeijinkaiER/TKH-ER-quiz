# UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 independent UI improvements: pause button relocation, quit button rename, remove 20Q option, back-to-setup navigation, stale clear invalidation, and README notice popup.

**Architecture:** Five files change across 6 tasks. Tasks 1–3 are pure markup/style/i18n with no JS dependency. Task 4 (navigation) and Task 5 (stale clears) are independent JS changes. Task 6 (notice popup) touches all layers. No build step — verify in browser after each task.

**Tech Stack:** Vanilla JS, static HTML, CSS custom properties. No test framework — manual browser verification replaces automated tests.

**IMPORTANT — No git operations:** Per project rules, Claude does NOT run any git commands. Do not include `git add`, `git commit`, or any other git operations in steps.

---

## File Map

| File | Changes |
|---|---|
| `index.html` | Quiz-topline restructure, remove 20Q button, add notice button + modal |
| `css/style.css` | Rename `.quiz-topline__left` → `.quiz-topline__right`, add modal CSS |
| `js/i18n.js` | `quizQuit` rename, 5 notice popup keys with full content |
| `js/app.js` | `goToSetupBasic()`, `readStore()` additions, `checkAndInvalidateStaleClears()`, notice functions, `bindEvents()` updates, `init()` update, `applyI18n()` update |
| `data/updates.json` | New file — update history entries |

---

## Task 1: HTML — quiz-topline restructure + remove 20Q button

**Files:**
- Modify: `index.html:119-135` (quiz-topline)
- Modify: `index.html:95` (20Q button)

Current quiz-topline (lines 119–135):
```html
<section id="quizScreen" class="screen" aria-labelledby="quizCategory" hidden>
  <div class="quiz-topline">
    <div class="quiz-topline__left">
      <button id="quitQuizButton" class="text-button" type="button" data-i18n="quizQuit">中断</button>
      <button id="pauseQuizButton" class="text-button" type="button">⏸</button>
    </div>
    <div class="quiz-meta">
      <span id="quizCategory">カテゴリー</span>
      <span id="quizProgress">1 / 5</span>
    </div>
    <div class="timer" aria-label="残り時間">
```

Current 20Q button (line 95):
```html
<button class="segment" type="button" data-count="20">20問</button>
```

- [ ] **Step 1: Restructure quiz-topline**

In `index.html`, replace:

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
          <div class="timer" aria-label="残り時間">
```

With:

```html
        <div class="quiz-topline">
          <button id="quitQuizButton" class="text-button" type="button" data-i18n="quizQuit">中断</button>
          <div class="quiz-meta">
            <span id="quizCategory">カテゴリー</span>
            <span id="quizProgress">1 / 5</span>
          </div>
          <div class="quiz-topline__right">
            <button id="pauseQuizButton" class="text-button" type="button">⏸</button>
            <div class="timer" aria-label="残り時間">
```

Also add a closing `</div>` for `.quiz-topline__right` after the timer's closing `</div>`. The timer block ends with:
```html
            </div>
          </div>
        </div>
```
where the second `</div>` is the new `.quiz-topline__right` and the third is `.quiz-topline`.

The full replacement for the timer area at the end of quiz-topline should be:
```html
            <div class="timer" aria-label="残り時間">
              <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
                <circle class="timer-track" cx="60" cy="60" r="52"></circle>
                <circle id="timerArc" class="timer-arc" cx="60" cy="60" r="52"></circle>
              </svg>
              <span id="timerText">30</span>
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Remove the 20Q button**

In `index.html`, remove this line entirely (line 95):
```html
              <button class="segment" type="button" data-count="20">20問</button>
```

- [ ] **Step 3: Verify in browser**

Open the app. Start a quiz. Confirm:
- "中断" button is on the far left, alone
- Pause ⏸ button appears immediately left of the timer circle
- Timer circle is on the right
- Back on setup screen: only "5問" and "10問" buttons appear, no "20問"

---

## Task 2: CSS — rename `.quiz-topline__left` → `.quiz-topline__right`

**Files:**
- Modify: `css/style.css:472-476`

Current rule (lines 472–476):
```css
.quiz-topline__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

- [ ] **Step 1: Rename the CSS class**

In `css/style.css`, replace:

```css
.quiz-topline__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

With:

```css
.quiz-topline__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

- [ ] **Step 2: Add modal CSS**

After the `.choice-list.is-paused .choice-button` block (lines 561–564), add:

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

- [ ] **Step 3: Verify in browser**

Start a quiz. Pause with ⏸. Confirm:
- Timer arc goes grey (`.is-paused` still works with renamed class)
- Choice buttons dim
- Layout of pause button adjacent to timer is unchanged from Task 1

---

## Task 3: i18n — rename quizQuit + add notice keys

**Files:**
- Modify: `js/i18n.js:34` (ja block)
- Modify: `js/i18n.js:114` (en block)

Current i18n.js ja (line 34): `quizQuit: "中断",`
Current i18n.js en (line 114): `quizQuit: "Quit",`

- [ ] **Step 1: Update ja block**

In `js/i18n.js`, replace:

```js
    quizQuit: "中断",
```

With:

```js
    quizQuit: "ホームへ戻る",
    btnNotice: "使い方",
    noticeTitle: "このクイズについて",
    noticeUpdatesTitle: "アップデート履歴",
    noticeClose: "閉じる",
    noticeBody: `<p>このクイズは、手稲渓仁会病院 救命救急センターが教育目的で作成しています。</p>
<p>クイズの内容はガイドラインに基づいていますが、投薬方法など一部は当施設のやり方を採用しています。施設によって異なる場合がありますので、実際の診療では必ず自施設の指導医にご確認ください。</p>
<p>各問題は30秒以内に答える形式です。時間が短いと感じる場合は、一時停止ボタン（⏸）をご利用ください。一時停止中はゆっくり問題を読むことができます。</p>
<p>カテゴリー内の全問題に正解するとクリアになります。ただし、一時停止を使用した場合はクリア条件を満たしません。制限時間内に答えることがクリアの条件です。</p>
<p>問題内容は随時修正・追加されます。問題が更新されたカテゴリーはクリアが解除されますので、ぜひ再挑戦してください。</p>`,
```

- [ ] **Step 2: Update en block**

In `js/i18n.js`, replace:

```js
    quizQuit: "Quit",
```

With:

```js
    quizQuit: "Home",
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

- [ ] **Step 3: Verify in browser**

Start a quiz. Confirm:
- Quit button now reads "ホームへ戻る" (ja) or "Home" (en)
- Clicking it still returns to home screen

Open DevTools console and run:
```js
console.log(t("btnNotice", "ja"), t("noticeTitle", "ja"));
// Expected: 使い方  このクイズについて
console.log(t("btnNotice", "en"), t("noticeTitle", "en"));
// Expected: About  About This Quiz
```

---

## Task 4: JS — goToSetupBasic() + update close button handlers

**Files:**
- Modify: `js/app.js:246-255` (bindEvents — closeRankingButton and closeClearButton handlers)
- Modify: `js/app.js` (new function after existing navigation helpers)

Current handlers in `bindEvents()` (lines 248, 255):
```js
  els.closeRankingButton.addEventListener("click", () => showScreen("level"));
  ...
  els.closeClearButton.addEventListener("click", () => showScreen("level"));
```

- [ ] **Step 1: Add goToSetupBasic() function**

Add this function after `loadStoredState()` (around line 1069, before `persistLearnerRole`):

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
```

- [ ] **Step 2: Update bindEvents() handlers**

In `bindEvents()`, replace:

```js
  els.closeRankingButton.addEventListener("click", () => showScreen("level"));
```

With:

```js
  els.closeRankingButton.addEventListener("click", goToSetupBasic);
```

And replace:

```js
  els.closeClearButton.addEventListener("click", () => showScreen("level"));
```

With:

```js
  els.closeClearButton.addEventListener("click", goToSetupBasic);
```

- [ ] **Step 3: Verify in browser**

1. Open the app. Click "履歴" (ranking button). Confirm ranking screen appears.
2. Click "メイン画面" button. Confirm:
   - Setup screen appears (not level-select screen)
   - Level selector shows "Basic" as active
3. Do the same from the clear records screen: click "クリア記録", then "メイン画面".
   - Same result: setup screen at Basic level.

---

## Task 5: JS — checkAndInvalidateStaleClears() + readStore() addition

**Files:**
- Modify: `js/app.js:1112-1136` (readStore)
- Modify: `js/app.js:135-155` (init)
- Modify: `js/app.js` (new function)

Current readStore() return object (lines 1116–1128):
```js
    return {
      schemaVersion:   STORAGE_SCHEMA_VERSION,
      learnerRoleId:   parsed.learnerRoleId  || "",
      learnerRoleName: parsed.learnerRoleName || "",
      muted:           Boolean(parsed.muted),
      lang:            parsed.lang || "",
      selectedLevel:   parsed.selectedLevel  || "basic",
      rankings:        Array.isArray(parsed.rankings) ? parsed.rankings : [],
      clears:          isCurrentSchema && parsed.clears && typeof parsed.clears === "object" ? parsed.clears : {},
      correctQuestions: isCurrentSchema && parsed.correctQuestions && typeof parsed.correctQuestions === "object" ? parsed.correctQuestions : {},
    };
```

- [ ] **Step 1: Add questionFingerprints to readStore()**

In `js/app.js`, replace the readStore return object:

```js
    return {
      schemaVersion:   STORAGE_SCHEMA_VERSION,
      learnerRoleId:   parsed.learnerRoleId  || "",
      learnerRoleName: parsed.learnerRoleName || "",
      muted:           Boolean(parsed.muted),
      lang:            parsed.lang || "",
      selectedLevel:   parsed.selectedLevel  || "basic",
      rankings:        Array.isArray(parsed.rankings) ? parsed.rankings : [],
      clears:          isCurrentSchema && parsed.clears && typeof parsed.clears === "object" ? parsed.clears : {},
      correctQuestions: isCurrentSchema && parsed.correctQuestions && typeof parsed.correctQuestions === "object" ? parsed.correctQuestions : {},
    };
```

With:

```js
    return {
      schemaVersion:    STORAGE_SCHEMA_VERSION,
      learnerRoleId:    parsed.learnerRoleId  || "",
      learnerRoleName:  parsed.learnerRoleName || "",
      muted:            Boolean(parsed.muted),
      lang:             parsed.lang || "",
      selectedLevel:    parsed.selectedLevel  || "basic",
      rankings:         Array.isArray(parsed.rankings) ? parsed.rankings : [],
      clears:           isCurrentSchema && parsed.clears && typeof parsed.clears === "object" ? parsed.clears : {},
      correctQuestions: isCurrentSchema && parsed.correctQuestions && typeof parsed.correctQuestions === "object" ? parsed.correctQuestions : {},
      questionFingerprints: isCurrentSchema && typeof parsed.questionFingerprints === "object" ? parsed.questionFingerprints : {},
    };
```

Also update the catch branch's return object. Replace:

```js
      rankings: [], clears: {}, correctQuestions: {},
```

With:

```js
      rankings: [], clears: {}, correctQuestions: {}, questionFingerprints: {},
```

- [ ] **Step 2: Add checkAndInvalidateStaleClears() function**

Add this function after `goToSetupBasic()`:

```js
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
```

- [ ] **Step 3: Call checkAndInvalidateStaleClears() in init()**

In `init()`, replace:

```js
    await loadQuestionData();
    renderLevelScreen();
```

With:

```js
    await loadQuestionData();
    checkAndInvalidateStaleClears();
    renderLevelScreen();
```

- [ ] **Step 4: Verify in browser**

Open DevTools. Run a quiz and clear a category (all correct, no pause).

Then open the console and simulate adding a new question ID to the fingerprint mismatch:

```js
// Read current state
const s = JSON.parse(localStorage.getItem("qqq_state_v1"));
// Pick a category that was cleared
const clearedKeys = Object.keys(s.clears);
console.log("Cleared keys:", clearedKeys);
// Delete one fingerprint to simulate first run for that category
const catId = clearedKeys[0]?.split(":")[1];
if (catId) {
  delete s.questionFingerprints[catId];
  localStorage.setItem("qqq_state_v1", JSON.stringify(s));
  console.log("Deleted fingerprint for", catId);
}
```

Reload the page. Confirm:
- The clear for that category is NOT wiped (because `storedFingerprint === ""` when missing, the guard skips invalidation on first run)

Now simulate an actual addition: set the stored fingerprint to a subset (missing one real ID):
```js
const s = JSON.parse(localStorage.getItem("qqq_state_v1"));
const catId = Object.keys(s.clears)[0]?.split(":")[1];
if (catId && s.questionFingerprints[catId]) {
  const ids = s.questionFingerprints[catId].split(",");
  s.questionFingerprints[catId] = ids.slice(0, ids.length - 1).join(",");
  localStorage.setItem("qqq_state_v1", JSON.stringify(s));
  console.log("Removed last id from fingerprint for", catId);
}
```

Reload. Confirm:
- Clear for that category is now gone from the clear records screen
- Category no longer shows a clear badge

---

## Task 6: Notice popup — HTML + JS wiring

**Files:**
- Modify: `index.html:27-31` (topbar-actions — add notice button)
- Modify: `index.html:210` (end of main — add modal overlay)
- Modify: `js/app.js:175-191` (cacheElements)
- Modify: `js/app.js:218-282` (bindEvents)
- Modify: `js/app.js:1112-1136` (readStore — add noticeAcknowledged)
- Modify: `js/app.js:135-155` (init — auto-show on first visit)
- Modify: `js/app.js` (applyI18n — refresh notice body on lang switch)
- Create: `data/updates.json`

Current topbar-actions block (lines 27-31):
```html
      <div class="topbar-actions" aria-label="アプリ操作">
        <button id="clearButton" class="icon-text-button" type="button" title="クリア記録を表示" data-i18n="btnClearLog" data-i18n-attr="title:btnClearLog">クリア記録</button>
        <button id="rankingButton" class="icon-text-button" type="button" title="履歴を表示" data-i18n="btnHistory" data-i18n-attr="title:btnHistory">履歴</button>
        <button id="muteButton" class="icon-text-button sound-toggle" type="button" aria-pressed="false" title="効果音と音楽を切り替え">効果音OFF</button>
      </div>
```

- [ ] **Step 1: Add notice button to topbar-actions**

In `index.html`, replace:

```html
      <div class="topbar-actions" aria-label="アプリ操作">
        <button id="clearButton" class="icon-text-button" type="button" title="クリア記録を表示" data-i18n="btnClearLog" data-i18n-attr="title:btnClearLog">クリア記録</button>
        <button id="rankingButton" class="icon-text-button" type="button" title="履歴を表示" data-i18n="btnHistory" data-i18n-attr="title:btnHistory">履歴</button>
        <button id="muteButton" class="icon-text-button sound-toggle" type="button" aria-pressed="false" title="効果音と音楽を切り替え">効果音OFF</button>
      </div>
```

With:

```html
      <div class="topbar-actions" aria-label="アプリ操作">
        <button id="noticeButton" class="icon-text-button" type="button" data-i18n="btnNotice">使い方</button>
        <button id="clearButton" class="icon-text-button" type="button" title="クリア記録を表示" data-i18n="btnClearLog" data-i18n-attr="title:btnClearLog">クリア記録</button>
        <button id="rankingButton" class="icon-text-button" type="button" title="履歴を表示" data-i18n="btnHistory" data-i18n-attr="title:btnHistory">履歴</button>
        <button id="muteButton" class="icon-text-button sound-toggle" type="button" aria-pressed="false" title="効果音と音楽を切り替え">効果音OFF</button>
      </div>
```

- [ ] **Step 2: Add modal overlay HTML**

In `index.html`, replace:

```html
  </div>

  <script src="js/i18n.js?v=20260507-1" defer></script>
```

With:

```html
  </div>

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

  <script src="js/i18n.js?v=20260507-1" defer></script>
```

- [ ] **Step 3: Create data/updates.json**

Create file `data/updates.json`:

```json
{
  "updates": [
    { "date": "2026-05-09", "ja": "初回リリース", "en": "Initial release" }
  ]
}
```

- [ ] **Step 4: Add noticeAcknowledged to readStore()**

In `js/app.js`, in the `readStore()` return object, add `noticeAcknowledged` after `questionFingerprints`:

Replace:

```js
      questionFingerprints: isCurrentSchema && typeof parsed.questionFingerprints === "object" ? parsed.questionFingerprints : {},
    };
```

With:

```js
      questionFingerprints: isCurrentSchema && typeof parsed.questionFingerprints === "object" ? parsed.questionFingerprints : {},
      noticeAcknowledged: Boolean(parsed.noticeAcknowledged),
    };
```

Also update the catch branch. Replace:

```js
      rankings: [], clears: {}, correctQuestions: {}, questionFingerprints: {},
```

With:

```js
      rankings: [], clears: {}, correctQuestions: {}, questionFingerprints: {}, noticeAcknowledged: false,
```

- [ ] **Step 5: Add notice elements to cacheElements()**

In `cacheElements()`, in the array passed to `forEach`, add `"noticeButton"`, `"noticeModal"`, `"noticeBody"`, `"noticeUpdateList"`, `"noticeCloseButton"` to the list. Replace:

```js
    "rankingButton", "muteButton",
```

With:

```js
    "noticeButton", "rankingButton", "muteButton",
```

And replace:

```js
    "resetRankingButton", "resetClearButton",
```

With:

```js
    "resetRankingButton", "resetClearButton",
    "noticeModal", "noticeBody", "noticeUpdateList", "noticeCloseButton",
```

- [ ] **Step 6: Add notice open/close/render functions**

Add these three functions after `toggleMute()` (after line 1099):

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

- [ ] **Step 7: Add bindEvents() handlers for notice**

In `bindEvents()`, after:

```js
  els.muteButton.addEventListener("click", toggleMute);
```

Add:

```js
  els.noticeButton.addEventListener("click", openNotice);
  els.noticeCloseButton.addEventListener("click", closeNotice);
  els.noticeModal.addEventListener("click", (e) => { if (e.target === els.noticeModal) closeNotice(); });
```

- [ ] **Step 8: Auto-show on first visit in init()**

In `init()`, replace:

```js
    await loadQuestionData();
    checkAndInvalidateStaleClears();
    renderLevelScreen();
    renderRankingTabs();
    applyI18n(state.lang);
    document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
      seg.classList.toggle("is-active", seg.dataset.lang === state.lang);
    });
```

With:

```js
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
```

- [ ] **Step 9: Refresh notice body on language switch**

Find the `applyI18n()` function. It should call `document.querySelectorAll("[data-i18n]")` and apply translations. At the end of `applyI18n()`, before the closing `}`, add:

```js
  if (els.noticeModal && !els.noticeModal.hidden) {
    els.noticeBody.innerHTML = t("noticeBody", lang);
  }
```

- [ ] **Step 10: Verify in browser**

1. Clear localStorage: `localStorage.clear()` in DevTools, then reload.
2. Confirm notice modal auto-appears on first load.
3. Read the modal content — confirm ja text is shown.
4. Click outside the modal (on the dark overlay). Confirm modal closes.
5. Reload without clearing localStorage. Confirm modal does NOT auto-appear.
6. Click the "使い方" button in the header. Confirm modal opens again.
7. Switch language to EN. Confirm modal body text switches to English.
8. Click "閉じる". Confirm modal closes.
9. Confirm `localStorage.getItem("qqq_state_v1")` has `"noticeAcknowledged":true`.

---

## Files Changed Summary

| File | Tasks |
|---|---|
| `index.html` | Task 1 (quiz-topline, 20Q removal), Task 6 (notice button, modal) |
| `css/style.css` | Task 2 (rename left→right, modal CSS) |
| `js/i18n.js` | Task 3 (quizQuit rename, notice keys) |
| `js/app.js` | Task 4 (goToSetupBasic), Task 5 (readStore, checkAndInvalidateStaleClears, init call), Task 6 (readStore, cacheElements, notice functions, bindEvents, init, applyI18n) |
| `data/updates.json` | Task 6 (new file) |
