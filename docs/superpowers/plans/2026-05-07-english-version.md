# Quiz-TKHER 英語版対応 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quiz-TKHER に英語版を追加し、ホーム画面のトグル1つで日本語/英語を切替えられるようにする。日本語問題の追加・修正に英語版を追従させる仕組み（検証スクリプト + AI 非依存の翻訳手順書）も整備する。

**Architecture:** 既存アプリに i18n 層を追加する単一アプリ方式。問題データは `data/questions/{lang}/...` の言語別ディレクトリで管理し、UI 文字列は `js/i18n.js` の辞書に集約。問題 ID とカテゴリー ID は両言語で完全一致させ、検証スクリプトで差分検出する。

**Tech Stack:** 静的 HTML / CSS / JavaScript（ビルドステップなし）、PowerShell（検証スクリプト）、localStorage（永続化）。新規依存は追加しない。

**実装制約（プロジェクト規約）:**
- Claude / 実装者は git コマンドを実行しない。各 Phase 末尾の「コミット checkpoint」はユーザーが手動で実施する
- ビルドステップなし。テストフレームワークなし。検証は (a) `tools/check-i18n.ps1` の出力、(b) `preview_*` ツールによるブラウザ動作確認、で行う
- 既存の `localStorage` キー `qqq_state_v1` / `schemaVersion: 2` は変更しない

**仕様書:** [docs/superpowers/specs/2026-05-07-english-version-design.md](../specs/2026-05-07-english-version-design.md)

---

## ファイル構成（最終形）

| パス | 種別 | 責務 |
|---|---|---|
| `data/categories.ja.json` | 移動 | 日本語カテゴリーメタデータ（旧 `categories.json` のリネーム） |
| `data/categories.en.json` | 新規 | 英語カテゴリーメタデータ（同 id, accent, file） |
| `data/questions/ja/**/*.json` | 移動 | 既存日本語問題（旧 `data/questions/**/*.json`） |
| `data/questions/en/**/*.json` | 新規 | 英語問題（同ファイル名・同ID） |
| `js/i18n.js` | 新規 | UI 文字列辞書 + `applyI18n(lang)` |
| `js/app.js` | 改修 | 言語別 fetch、`state.lang` 管理、トグルハンドラ |
| `index.html` | 改修 | `data-i18n` 属性、言語トグル DOM、`js/i18n.js` 読込 |
| `css/style.css` | 軽微改修 | 言語トグルの装飾（既存スタイルを流用） |
| `backend/server.js:159` | 1行修正 | `categories.json` → `categories.ja.json` |
| `tools/check-i18n.ps1` | 新規 | JA/EN 整合性チェックスクリプト |
| `docs/i18n-translation-guide.md` | 新規 | AI 非依存の翻訳・同期手順書 |

---

## Phase 1: ディレクトリ再構成（互換性維持で日本語版が動き続けることを保証）

このフェーズの目標: 既存の日本語アプリが新しいパスで動くようになる。英語機能はまだ追加しない。

### Task 1.1: ディレクトリ構造を変更

**Files:**
- Rename: `data/categories.json` → `data/categories.ja.json`
- Move: `data/questions/basic/` → `data/questions/ja/basic/`
- Move: `data/questions/advanced/` → `data/questions/ja/advanced/`
- Move: `data/questions/master/` → `data/questions/ja/master/`

- [ ] **Step 1: 現状確認**

```powershell
ls data\questions
```

期待: `basic/`, `advanced/`, `master/` の3ディレクトリが見える。

- [ ] **Step 2: ja サブディレクトリを作成し既存ディレクトリを移動**

```powershell
New-Item -ItemType Directory -Path "data\questions\ja"
Move-Item "data\questions\basic" "data\questions\ja\basic"
Move-Item "data\questions\advanced" "data\questions\ja\advanced"
Move-Item "data\questions\master" "data\questions\ja\master"
```

- [ ] **Step 3: categories.json をリネーム**

```powershell
Move-Item "data\categories.json" "data\categories.ja.json"
```

- [ ] **Step 4: 構造確認**

```powershell
ls data
ls data\questions\ja
```

期待: `data/` 直下に `categories.ja.json`、`data/questions/ja/` 直下に `basic`, `advanced`, `master`。

### Task 1.2: app.js の fetch パスを言語対応に変更

**Files:**
- Modify: `js/app.js:276-333`（`loadQuestionData` 関数）

- [ ] **Step 1: state 初期化に lang を追加**

`js/app.js` で `const state = { ... }` ブロックを探し、初期値に `lang: "ja"` を追加。後続タスクで永続化と切替を実装するが、まずは固定値で動かす。

- [ ] **Step 2: loadQuestionData の fetch パスを書換**

`js/app.js:276-333` の `loadQuestionData` 関数内：

```js
// Before
fetch("data/categories.json", { cache: "no-store" }),
// ...
const res = await fetch(`data/${file}`, { cache: "no-store" });

// After
fetch(`data/categories.${state.lang}.json`, { cache: "no-store" }),
// ...
const res = await fetch(`data/questions/${state.lang}/${file.replace(/^questions\//, "")}`, { cache: "no-store" });
```

注: `categories.ja.json` の `file` フィールド（例 `"questions/basic/cpr.json"`）から先頭の `questions/` を取り除いて `data/questions/{lang}/` プレフィックスに繋げる。`file` フィールドの値は今後も触らない（次タスクで `categories.en.json` を作る時もパスは `"questions/basic/cpr.json"` 形式で揃える）。

エラーメッセージも更新：
```js
if (!categoriesRes.ok) throw new Error(`categories.${state.lang}.json ${categoriesRes.status}`);
```

- [ ] **Step 3: ブラウザで日本語版が動くか確認**

`mcp__Claude_Preview__preview_start` でローカルサーバを立ち上げ、ホーム→レベル選択→カテゴリー選択→クイズ開始まで動作することを確認。`preview_console_logs` でエラー無しを確認。

期待: 日本語版が以前と同じ動作。

### Task 1.3: backend/server.js のパスを更新

**Files:**
- Modify: `backend/server.js:159`

- [ ] **Step 1: 1行修正**

```js
// Before
const categoriesRaw = JSON.parse(await fs.readFile(path.join(DATA_DIR, "categories.json"), "utf8"));

// After
const categoriesRaw = JSON.parse(await fs.readFile(path.join(DATA_DIR, "categories.ja.json"), "utf8"));
```

注: backend admin は JA 固定でスコープ外。EN 追加時もこのファイルは触らない。

### ✅ Phase 1 コミット checkpoint（ユーザー手動）

ユーザーが `git status` を確認し、以下のメッセージ案でコミット：
```
refactor: restructure data dir for i18n (ja-only, behavior unchanged)
```

---

## Phase 2: i18n インフラ構築（言語トグルは UI のみ、英語データはまだ存在しないので無効化状態）

### Task 2.1: UI 文字列辞書 `js/i18n.js` を作成

**Files:**
- Create: `js/i18n.js`

- [ ] **Step 1: 既存 HTML から翻訳対象文字列を洗い出す**

`index.html` を読み、以下のキーを抽出する（全項目を辞書に含める）：

```
appSubtitle, eyebrow, levelTitle, levelEyebrow,
btnClearLog, btnHistory, btnSoundOff, btnSoundOn,
setupTitle, roleLegend, roleRequired,
roleResident, roleSeniorResident, roleDoctor, roleNurse, roleOther,
levelLegend, levelBasic, levelAdvanced, levelMaster,
countLegend, countSuffix,
summaryCategory, summaryCategoryLoading, summaryTimeLimit, summaryTimeLimitValue,
quizQuit, resultEyebrow, resultTitle, finishLabel,
btnRetry, btnHome, btnReviewToggleCollapse, btnReviewToggleExpand, reviewHeading,
rankingEyebrow, rankingTitle, rankingEmpty, btnResetHistory,
clearEyebrow, clearTitle, btnResetClear,
disclaimer,
langToggleJa, langToggleEn,
```

- [ ] **Step 2: i18n.js を作成**

```js
const I18N = {
  ja: {
    appSubtitle: "救急医学クイズ",
    eyebrow: "Emergency Medicine Training",
    levelTitle: "レベル選択",
    levelEyebrow: "難易度を選んでください",
    btnClearLog: "クリア記録",
    btnHistory: "履歴",
    btnSoundOff: "効果音OFF",
    btnSoundOn: "効果音ON",
    setupTitle: "クイズ設定",
    roleLegend: "職種",
    roleRequired: "必須",
    roleResident: "研修医",
    roleSeniorResident: "専攻医",
    roleDoctor: "医師",
    roleNurse: "看護師",
    roleOther: "その他",
    levelLegend: "レベル",
    levelBasic: "Basic",
    levelAdvanced: "Advanced",
    levelMaster: "Master",
    countLegend: "出題数",
    countSuffix: "問",
    summaryCategory: "カテゴリー",
    summaryCategoryLoading: "読み込み中",
    summaryTimeLimit: "制限時間",
    summaryTimeLimitValue: "1問 20秒",
    quizQuit: "中断",
    resultEyebrow: "Result",
    resultTitle: "演習結果",
    finishLabel: "Finish",
    btnRetry: "再挑戦",
    btnHome: "メイン画面",
    btnReviewToggleCollapse: "折りたたむ",
    btnReviewToggleExpand: "展開",
    reviewHeading: "解答レビュー",
    rankingEyebrow: "Local History",
    rankingTitle: "履歴",
    rankingEmpty: "記録はまだありません。",
    btnResetHistory: "履歴を全削除",
    clearEyebrow: "Clear History",
    clearTitle: "クリア記録",
    btnResetClear: "クリア記録を全削除",
    disclaimer: "⚠️ このクイズは学習目的のコンテンツです。実際の臨床現場で患者を診療する際は、必ず最新のガイドラインや医療情報をご確認ください。",
    langToggleJa: "JP",
    langToggleEn: "EN",
  },
  en: {
    appSubtitle: "Emergency Medicine Quiz",
    eyebrow: "Emergency Medicine Training",
    levelTitle: "Select Level",
    levelEyebrow: "Choose a difficulty",
    btnClearLog: "Cleared",
    btnHistory: "History",
    btnSoundOff: "Sound OFF",
    btnSoundOn: "Sound ON",
    setupTitle: "Quiz Setup",
    roleLegend: "Role",
    roleRequired: "Required",
    roleResident: "Resident",
    roleSeniorResident: "Senior Resident",
    roleDoctor: "Doctor",
    roleNurse: "Nurse",
    roleOther: "Other",
    levelLegend: "Level",
    levelBasic: "Basic",
    levelAdvanced: "Advanced",
    levelMaster: "Master",
    countLegend: "Questions",
    countSuffix: " Q",
    summaryCategory: "Category",
    summaryCategoryLoading: "Loading...",
    summaryTimeLimit: "Time limit",
    summaryTimeLimitValue: "20 sec / question",
    quizQuit: "Quit",
    resultEyebrow: "Result",
    resultTitle: "Result",
    finishLabel: "Finish",
    btnRetry: "Retry",
    btnHome: "Home",
    btnReviewToggleCollapse: "Collapse",
    btnReviewToggleExpand: "Expand",
    reviewHeading: "Review",
    rankingEyebrow: "Local History",
    rankingTitle: "History",
    rankingEmpty: "No records yet.",
    btnResetHistory: "Clear all history",
    clearEyebrow: "Clear History",
    clearTitle: "Clear Records",
    btnResetClear: "Reset all clear records",
    disclaimer: "⚠️ This quiz is for educational purposes only. When treating patients in actual clinical settings, please refer to the latest guidelines and medical information.",
    langToggleJa: "JP",
    langToggleEn: "EN",
  },
};

function t(key, lang) {
  return (I18N[lang] && I18N[lang][key]) ?? I18N.ja[key] ?? key;
}

function applyI18n(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "ja";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key, lang);
    if (value !== undefined) el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr");
    spec.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key, lang));
    });
  });
}
```

注: グローバル関数 `t` / `applyI18n` を `app.js` から参照する。`I18N` も同様。後で必要なら window 名前空間を整理する。

### Task 2.2: index.html に data-i18n 属性を付与

**Files:**
- Modify: `index.html`

- [ ] **Step 1: `<script src="js/i18n.js">` を `app.js` の前に挿入**

```html
<script src="js/i18n.js?v=20260507-1" defer></script>
<script src="js/app.js?v=20260507-1" defer></script>
```

`app.js` の version クエリも更新する。

- [ ] **Step 2: 静的テキストに data-i18n 属性を付与**

`index.html` の各要素を以下のように書き換える（既存テキストは表示初期値として残す。`applyI18n()` 実行時に置換される）：

```html
<!-- 例 -->
<p class="eyebrow" data-i18n="eyebrow">Emergency Medicine Training</p>
<h1 class="brand-title">
  <span class="brand-title__quiz">Quiz-</span>
  <span class="brand-title__tkher">TKHER</span>
  <span class="brand-title__sub" data-i18n="appSubtitle">救急医学クイズ</span>
</h1>
<button id="clearButton" data-i18n="btnClearLog" data-i18n-attr="title:btnClearLog">クリア記録</button>
<button id="rankingButton" data-i18n="btnHistory" data-i18n-attr="title:btnHistory">履歴</button>
<button id="muteButton" data-i18n="btnSoundOff" data-i18n-attr="title:btnSoundOff">効果音OFF</button>

<p class="eyebrow" data-i18n="levelEyebrow">難易度を選んでください</p>
<h2 id="levelTitle" data-i18n="levelTitle">レベル選択</h2>
<p class="disclaimer" data-i18n="disclaimer">⚠️ ...</p>

<h2 id="setupTitle" data-i18n="setupTitle">クイズ設定</h2>
<legend><span data-i18n="roleLegend">職種</span> <span data-i18n="roleRequired">必須</span></legend>
<span data-i18n="roleResident">研修医</span>
<span data-i18n="roleSeniorResident">専攻医</span>
<span data-i18n="roleDoctor">医師</span>
<span data-i18n="roleNurse">看護師</span>
<span data-i18n="roleOther">その他</span>
<legend data-i18n="levelLegend">レベル</legend>
<button class="segment" data-level="basic" data-i18n="levelBasic">Basic</button>
<button class="segment" data-level="advanced" data-i18n="levelAdvanced">Advanced</button>
<button class="segment" data-level="master" data-i18n="levelMaster">Master</button>
<legend data-i18n="countLegend">出題数</legend>

<dt data-i18n="summaryCategory">カテゴリー</dt>
<dd id="selectedCategoryLabel" data-i18n="summaryCategoryLoading">読み込み中</dd>
<dt data-i18n="summaryTimeLimit">制限時間</dt>
<dd data-i18n="summaryTimeLimitValue">1問 20秒</dd>

<button id="quitQuizButton" data-i18n="quizQuit">中断</button>

<p class="eyebrow" data-i18n="resultEyebrow">Result</p>
<h2 id="resultTitle" data-i18n="resultTitle">演習結果</h2>
<span data-i18n="finishLabel">Finish</span>
<button id="retryButton" data-i18n="btnRetry">再挑戦</button>
<button id="backToSetupButton" data-i18n="btnHome">メイン画面</button>
<button id="resultRankingButton" data-i18n="btnHistory">履歴</button>
<h3 data-i18n="reviewHeading">解答レビュー</h3>
<button id="toggleReviewButton" data-i18n="btnReviewToggleCollapse">折りたたむ</button>

<p class="eyebrow" data-i18n="rankingEyebrow">Local History</p>
<h2 id="rankingTitle" data-i18n="rankingTitle">履歴</h2>
<button id="resetRankingButton" data-i18n="btnResetHistory">履歴を全削除</button>
<button id="closeRankingButton" data-i18n="btnHome">メイン画面</button>
<p id="rankingEmpty" data-i18n="rankingEmpty">記録はまだありません。</p>

<p class="eyebrow" data-i18n="clearEyebrow">Clear History</p>
<h2 id="clearTitle" data-i18n="clearTitle">クリア記録</h2>
<button id="resetClearButton" data-i18n="btnResetClear">クリア記録を全削除</button>
<button id="closeClearButton" data-i18n="btnHome">メイン画面</button>
```

注: `count="5"`, `count="10"`, `count="20"` のボタンは「5問」「10問」「20問」と数字+suffix で構成されているため、JS 側で `<数字> + t("countSuffix", lang)` を組み立てて再描画する。HTML には `data-i18n="countSuffix"` を付けず、JS で動的描画する（次タスクで対応）。

- [ ] **Step 3: 動作確認**

`preview_eval` で `applyI18n("ja")` と `applyI18n("en")` を順に呼び、UI が切替わることを確認。問題データ未準備のため、英語にしてもクイズは動かない（カテゴリーロードがエラー）。UI 文字列のみ切替を確認する。

### Task 2.3: 言語トグル UI を追加し、ハンドラを実装

**Files:**
- Modify: `index.html`（`#levelScreen` 内）
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: HTML にトグルを追加**

`#levelScreen` の `level-intro` ブロック直下、`level-grid` の上に挿入：

```html
<div class="lang-toggle" role="group" aria-label="Language / 言語">
  <button type="button" class="segment" data-lang="ja" data-i18n="langToggleJa">JP</button>
  <button type="button" class="segment" data-lang="en" data-i18n="langToggleEn">EN</button>
</div>
```

同じトグルを `#setupScreen` の `setup-panel` 上部にも複製する（クイズ画面・結果画面には置かない）。

- [ ] **Step 2: CSS で装飾**

`css/style.css` の末尾に追加（既存 `.segmented-control` を流用しつつ、より小さなサイズに）：

```css
.lang-toggle {
  display: inline-flex;
  gap: 4px;
  margin: 12px 0;
  padding: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}
.lang-toggle .segment {
  padding: 4px 14px;
  font-size: 0.85rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}
.lang-toggle .segment.is-active {
  background: #fff;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 3: app.js にハンドラを実装**

初期化部（DOMContentLoaded ハンドラ等）に以下を追加：

```js
function setLanguage(lang, { reload = true } = {}) {
  if (lang !== "ja" && lang !== "en") return;
  state.lang = lang;
  persistState();
  applyI18n(lang);
  document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
    seg.classList.toggle("is-active", seg.dataset.lang === lang);
  });
  // 出題数ボタンの "5問" / "5 Q" を再描画
  document.querySelectorAll('.segmented-control .segment[data-count]').forEach((btn) => {
    const n = btn.dataset.count;
    btn.textContent = `${n}${t("countSuffix", lang)}`;
  });
  if (reload) {
    // データを再ロードし、現在の画面を再描画
    loadQuestionData().then(() => {
      if (state.currentScreen === "setup") rerenderCategoryGrid();
      if (state.currentScreen === "level")  renderLevelGrid();
    }).catch((err) => console.error("[lang-switch] reload failed", err));
  }
}

document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
  seg.addEventListener("click", () => setLanguage(seg.dataset.lang));
});
```

注: `persistState`, `rerenderCategoryGrid`, `renderLevelGrid`, `state.currentScreen` は既存実装を確認しつつ命名を合わせる。`state.currentScreen` が無ければ追加する（screen 切替関数で `state.currentScreen = "level"` 等を設定）。

- [ ] **Step 4: 初期化時に applyI18n を呼ぶ**

`loadQuestionData()` 完了直後、または DOMContentLoaded で：

```js
applyI18n(state.lang);
document.querySelectorAll(".lang-toggle .segment").forEach((seg) => {
  seg.classList.toggle("is-active", seg.dataset.lang === state.lang);
});
```

### Task 2.4: 初期言語決定 + localStorage 永続化

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 初期言語解決関数を追加**

```js
function resolveInitialLang(saved) {
  if (saved === "ja" || saved === "en") return saved;
  const browser = (navigator.language || "ja").toLowerCase();
  return browser.startsWith("en") ? "en" : "ja";
}
```

- [ ] **Step 2: localStorage 読込時に lang を反映**

`STORAGE_KEY` から state を復元する関数（既存）の中で：

```js
const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
state.lang = resolveInitialLang(stored.lang);
```

- [ ] **Step 3: 永続化時に lang を含める**

`persistState`（既存）が `JSON.stringify` する対象オブジェクトに `lang: state.lang` を含める。`schemaVersion` は `2` のまま据置。

- [ ] **Step 4: 動作確認**

`preview_eval` で：
```js
localStorage.removeItem("qqq_state_v1");
location.reload();
```

ブラウザ言語が日本語なら JA、英語なら EN で起動することを確認。`localStorage.getItem("qqq_state_v1")` に `lang` フィールドが含まれることを確認。

### ✅ Phase 2 コミット checkpoint（ユーザー手動）

```
feat(i18n): add language toggle UI and i18n infrastructure (en data not yet present)
```

この時点では英語に切替えるとカテゴリー・問題データの fetch が 404 になる。次フェーズで英語データを追加する。

---

## Phase 3: 英語コンテンツ作成（翻訳作業）

このフェーズは技術作業ではなく、翻訳コンテンツの作成。1ファイルずつ翻訳→検証→次のファイルへ進める。

### Task 3.1: 英語版カテゴリーメタデータを作成

**Files:**
- Create: `data/categories.en.json`

- [ ] **Step 1: categories.ja.json を読み、英語版を作成**

`data/categories.ja.json` の各エントリの `id`, `level`, `file`, `accent` はそのまま、`name` と `description` のみ英訳する。例：

```json
[
  {
    "id": "ed_first_steps_basic",
    "level": "basic",
    "name": "ER First Steps",
    "description": "ER fundamentals",
    "file": "questions/basic/ed_first_steps_basic.json",
    "accent": "#087f8c"
  },
  {
    "id": "altered_mental_status_basic",
    "level": "basic",
    "name": "Altered Mental Status / Syncope",
    "description": "Hypoglycemia, seizures, syncope, initial differentials",
    "file": "questions/basic/altered_mental_status_basic.json",
    "accent": "#4f46e5"
  }
  // ... 全 21 エントリ
]
```

医学用語の標準訳：
- 救急外来 → Emergency Department / ER
- 意識障害 → Altered Mental Status
- めまい → Vertigo
- 脳卒中 → Stroke
- 整形外傷 → Orthopedic Trauma
- 感染症 → Infectious Diseases
- 消化器症状 → GI Symptoms
- 救急外来薬剤投与 → Emergency Medications
- 敗血症 → Sepsis
- 重症外傷 → Major Trauma
- 内分泌救急 → Endocrine Emergencies
- 心肺蘇生 → CPR / Cardiopulmonary Resuscitation
- 小児救急 → Pediatric Emergencies
- 循環器救急 → Cardiology Emergencies

- [ ] **Step 2: ID 整合性確認**

```powershell
$ja = Get-Content data\categories.ja.json -Raw | ConvertFrom-Json
$en = Get-Content data\categories.en.json -Raw | ConvertFrom-Json
Compare-Object ($ja | ForEach-Object id) ($en | ForEach-Object id)
```

期待: 出力なし（差分ゼロ）。

### Task 3.2: 英語問題ディレクトリを作成

- [ ] **Step 1: ディレクトリ作成**

```powershell
New-Item -ItemType Directory -Path "data\questions\en\basic"
New-Item -ItemType Directory -Path "data\questions\en\advanced"
New-Item -ItemType Directory -Path "data\questions\en\master"
```

### Task 3.3: AI 翻訳テンプレートで全 21 ファイルを翻訳

**翻訳対象ファイル一覧:**

basic (13ファイル):
- `ed_first_steps_basic.json`
- `altered_mental_status_basic.json`
- `vertigo_stroke.json`
- `orthopedic_trauma.json`
- `infection.json`
- `gi_symptoms.json`
- `emergency_medications.json`
- `sepsis.json`
- `trauma.json`
- `endocrine.json`
- `cpr.json`
- `pediatric.json`
- `cardiology.json`

advanced (4ファイル):
- `altered_mental_status_advanced.json`
- `sepsis_advanced.json`
- `trauma_advanced.json`
- `cpr_advanced.json`

master (4ファイル):
- `altered_mental_status_master.json`
- `sepsis_master.json`
- `trauma_master.json`
- `cpr_master.json`

各ファイルに対して以下を1ファイルずつ繰り返す：

- [ ] **Step 1: 日本語ファイルを読む**

例: `data/questions/ja/basic/cpr.json`

- [ ] **Step 2: AI 翻訳テンプレートを使って翻訳**

```
以下の救急医学クイズの日本語問題 JSON を、医学的正確性を保ちながら自然な英語に翻訳してください。

ルール:
- 医学用語は標準的な英語表記を使う（敗血症 → sepsis, 除細動 → defibrillation, 意識障害 → altered mental status, 心肺蘇生 → CPR 等）
- JSON 構造は完全保持（id, answers 配列の数値, selectCount, categories 配列, accent 等の非テキスト値はそのまま）
- choices 配列の順序は変更しない（answers のインデックスが意味を失うため）
- category フィールド（カテゴリー名）は categories.en.json の対応する name と一致させる
- explanation も翻訳

[元の日本語 JSON をここに貼付]
```

- [ ] **Step 3: 出力 JSON を `data/questions/en/<level>/<filename>` に保存**

- [ ] **Step 4: 検証**

```powershell
.\tools\check-i18n.ps1 -File data\questions\en\<level>\<filename>
```

（`check-i18n.ps1` は次フェーズの Task 4.1 で作成。それ以前に作りたい場合は本タスクと Task 4.1 を入れ替えてもよい）

### ✅ Phase 3 コミット checkpoint（ユーザー手動）

ファイル単位 or レベル単位でコミット推奨：
```
feat(i18n): add English translations for basic level questions
feat(i18n): add English translations for advanced level questions
feat(i18n): add English translations for master level questions
feat(i18n): add categories.en.json
```

---

## Phase 4: 同期検証ツール + 翻訳手順書

### Task 4.1: `tools/check-i18n.ps1` を作成

**Files:**
- Create: `tools/check-i18n.ps1`

- [ ] **Step 1: スクリプト本体を作成**

```powershell
# tools/check-i18n.ps1
# JA/EN コンテンツの整合性を検証する。
# Usage:
#   .\tools\check-i18n.ps1                  # 全体チェック
#   .\tools\check-i18n.ps1 -File <path>     # 特定ファイルだけチェック
#
# 異常があれば exit code 1。

param(
  [string]$File = "",
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Stop"
$dataDir = Join-Path $Root "data"
$jaQDir  = Join-Path $dataDir "questions\ja"
$enQDir  = Join-Path $dataDir "questions\en"
$catJa   = Join-Path $dataDir "categories.ja.json"
$catEn   = Join-Path $dataDir "categories.en.json"

$exitCode = 0
function Report-Ok($msg)   { Write-Host "[OK]      $msg" }
function Report-Miss($msg) { Write-Host "[MISSING] $msg" -ForegroundColor Yellow; $script:exitCode = 1 }
function Report-Diff($msg) { Write-Host "[DIFF]    $msg" -ForegroundColor Red;    $script:exitCode = 1 }

# 1. categories.ja.json と categories.en.json の id 集合を比較
function Check-Categories {
  if (-not (Test-Path $catJa)) { Report-Miss "categories.ja.json not found"; return }
  if (-not (Test-Path $catEn)) { Report-Miss "categories.en.json not found"; return }
  $ja = (Get-Content $catJa -Raw | ConvertFrom-Json) | ForEach-Object id
  $en = (Get-Content $catEn -Raw | ConvertFrom-Json) | ForEach-Object id
  $onlyJa = $ja | Where-Object { $_ -notin $en }
  $onlyEn = $en | Where-Object { $_ -notin $ja }
  foreach ($i in $onlyJa) { Report-Diff "categories: id `"$i`" missing in EN" }
  foreach ($i in $onlyEn) { Report-Diff "categories: id `"$i`" missing in JA" }
  if (-not $onlyJa -and -not $onlyEn) {
    Report-Ok "categories.ja.json <-> categories.en.json ($($ja.Count) ids matched)"
  }
}

# 2. ja/ と en/ のファイル整合 + 各ファイル内の問題 ID 整合
function Check-QuestionFile($jaPath) {
  $rel = $jaPath.Substring($jaQDir.Length).TrimStart("\","/")
  $enPath = Join-Path $enQDir $rel
  if (-not (Test-Path $enPath)) {
    Report-Miss "en/$rel - exists only in JA"
    return
  }
  try { $jaJson = Get-Content $jaPath -Raw | ConvertFrom-Json } catch { Report-Diff "ja/$rel - invalid JSON: $_"; return }
  try { $enJson = Get-Content $enPath -Raw | ConvertFrom-Json } catch { Report-Diff "en/$rel - invalid JSON: $_"; return }
  $jaIds = @($jaJson.questions | ForEach-Object id)
  $enIds = @($enJson.questions | ForEach-Object id)
  $onlyJa = $jaIds | Where-Object { $_ -notin $enIds }
  $onlyEn = $enIds | Where-Object { $_ -notin $jaIds }
  foreach ($i in $onlyJa) { Report-Diff "ja/$rel <-> en/$rel: id `"$i`" missing in EN" }
  foreach ($i in $onlyEn) { Report-Diff "ja/$rel <-> en/$rel: id `"$i`" missing in JA" }
  if (-not $onlyJa -and -not $onlyEn) {
    Report-Ok "ja/$rel <-> en/$rel ($($jaIds.Count) questions matched)"
  }
}

# 3. EN にしかないファイル
function Check-OrphanEn {
  if (-not (Test-Path $enQDir)) { return }
  Get-ChildItem -Recurse -Filter *.json $enQDir | ForEach-Object {
    $rel = $_.FullName.Substring($enQDir.Length).TrimStart("\","/")
    $jaPath = Join-Path $jaQDir $rel
    if (-not (Test-Path $jaPath)) { Report-Miss "ja/$rel - exists only in EN" }
  }
}

if ($File) {
  $abs = Resolve-Path $File
  Check-QuestionFile $abs.Path
} else {
  Check-Categories
  if (Test-Path $jaQDir) {
    Get-ChildItem -Recurse -Filter *.json $jaQDir | ForEach-Object { Check-QuestionFile $_.FullName }
  }
  Check-OrphanEn
}

exit $exitCode
```

- [ ] **Step 2: スクリプトを実行して全体検証**

```powershell
.\tools\check-i18n.ps1
```

期待: すべて `[OK]` 行、終了コード 0。`[MISSING]` や `[DIFF]` が出れば該当ファイルを修正。

- [ ] **Step 3: 故意に差分を作って異常検出を確認（オプション）**

例: `data/questions/en/basic/cpr.json` の任意の問題 ID を一時的に変更し、`[DIFF]` が出ることを確認。終わったら元に戻す。

### Task 4.2: 翻訳手順書 `docs/i18n-translation-guide.md` を作成

**Files:**
- Create: `docs/i18n-translation-guide.md`

- [ ] **Step 1: 手順書を作成**

```markdown
# i18n 翻訳・同期ガイド

Quiz-TKHER は日本語 (`ja`) と英語 (`en`) の2言語に対応している。日本語問題を追加・修正する場合は、必ず英語版も同期する。

## ディレクトリ規約

\`\`\`
data/
  categories.ja.json
  categories.en.json
  questions/
    ja/{level}/{file}.json
    en/{level}/{file}.json
\`\`\`

- 問題 ID（例 `cpr_basic_001`）は両言語で完全一致
- カテゴリー ID（例 `cpr_basic`）は両言語で完全一致
- ファイル名・ディレクトリ構造は両言語で同一
- `categories.{lang}.json` の `file`, `accent`, `id`, `level` は両言語で同一値

## 新規日本語問題を追加する場合

1. `data/questions/ja/{level}/{file}.json` の `questions` 配列に追加
2. **同じ ID** で `data/questions/en/{level}/{file}.json` にも追加（翻訳済み英語で）
3. `tools/check-i18n.ps1` を実行し、エラー 0 を確認

## 既存日本語問題を修正する場合

1. JA を修正
2. **同じ ID** の EN エントリも修正（翻訳の質を保つため AI 翻訳テンプレート参照）
3. `tools/check-i18n.ps1` を実行し、エラー 0 を確認

## 新規カテゴリーを追加する場合

1. `data/categories.ja.json` に追加
2. `data/categories.en.json` に **同じ id, level, file, accent** で追加（`name`/`description` は英訳）
3. JA/EN 両方の `data/questions/{lang}/{level}/{file}.json` を作成
4. `tools/check-i18n.ps1` を実行

## AI 翻訳依頼テンプレート（Claude / ChatGPT / Gemini 共通）

問題ファイル単位で翻訳する場合：

\`\`\`
以下の救急医学クイズの日本語問題 JSON を、医学的正確性を保ちながら自然な英語に翻訳してください。

ルール:
- 医学用語は標準的な英語表記（敗血症 → sepsis, 除細動 → defibrillation, 心肺蘇生 → CPR 等）
- JSON 構造を完全保持（id, answers 配列, selectCount, categories, accent 等の非テキストはそのまま）
- choices 配列の順序は変更不可（answers のインデックスが意味を失うため）
- category フィールド（カテゴリー名）は categories.en.json の対応 id の name に揃える
- explanation も翻訳

[ここに JA の JSON を貼付]
\`\`\`

単一問題のみ修正する場合は、問題オブジェクト1つだけを貼付すれば良い。

## 標準訳語表（参考）

| 日本語 | 英語 |
|---|---|
| 救急外来 / ER | Emergency Department / ER |
| 意識障害 | altered mental status |
| めまい | vertigo |
| 脳卒中 | stroke |
| 敗血症 | sepsis |
| 重症外傷 | major trauma |
| 心肺蘇生 / CPR | CPR / cardiopulmonary resuscitation |
| 除細動 | defibrillation |
| 抗菌薬 | antibiotics / antimicrobials |
| 髄膜炎 | meningitis |
| 蘇生 | resuscitation |
| 輸液 | fluid resuscitation / IV fluids |
| 換気 | ventilation |
| 気道管理 | airway management |
| 鑑別 | differential diagnosis |
| 研修医 | resident |
| 専攻医 | senior resident |

## リリース前チェックリスト

- [ ] `tools\check-i18n.ps1` がエラー 0
- [ ] ブラウザでホーム→設定→クイズ→結果→履歴を JA / EN 両方で動作確認
- [ ] 履歴を JA で記録 → EN に切替 → カテゴリー名が EN で表示されることを確認
- [ ] localStorage を消した状態で初回起動時に `navigator.language` が反映されること
```

- [ ] **Step 2: 手順書のリンクを README.md に追記（任意）**

`README.md` の適切な箇所に：

```markdown
- [i18n 翻訳・同期ガイド](docs/i18n-translation-guide.md)
```

### ✅ Phase 4 コミット checkpoint（ユーザー手動）

```
feat(i18n): add check-i18n.ps1 validator and translation guide
```

---

## Phase 5: End-to-End 検証

### Task 5.1: 両言語で全画面動作確認

- [ ] **Step 1: ローカルサーバ起動**

`mcp__Claude_Preview__preview_start` でサーバ起動。

- [ ] **Step 2: 日本語フロー**

1. localStorage クリアして起動 → 言語が JA であること（または `navigator.language` 依存）
2. レベル選択 → カテゴリー選択 → クイズ開始 → 全問解答 → 結果 → 履歴 まで動作
3. `preview_console_logs` でエラー無し
4. `preview_screenshot` で結果画面を保存

- [ ] **Step 3: 英語切替フロー**

1. ホーム画面で EN トグルクリック
2. UI 全体が英語化されることを確認
3. レベル → カテゴリー → クイズ → 結果まで全英語で動作
4. クイズ進行中は言語トグルが非表示であることを確認
5. `preview_screenshot` で結果画面を保存

- [ ] **Step 4: 永続化確認**

1. EN の状態でブラウザリロード → EN のまま起動すること
2. `preview_eval` で `localStorage.getItem("qqq_state_v1")` が `"lang":"en"` を含むこと

- [ ] **Step 5: 履歴の言語切替表示**

1. JA で何問か解いて履歴を作る
2. EN に切替 → 履歴画面でカテゴリー名が EN で表示されること

- [ ] **Step 6: 検証スクリプト最終実行**

```powershell
.\tools\check-i18n.ps1
```

エラー 0 で終了。

### ✅ Phase 5 コミット checkpoint（ユーザー手動）

ここまで来れば仕様書 §10 の完了条件すべてを満たしているはず。最終コミット案：
```
chore: complete i18n end-to-end verification
```

---

## 完了条件チェック（仕様書 §10 と照合）

- [ ] 21 カテゴリーすべての英語版問題データが `data/questions/en/` に配置済み
- [ ] `categories.en.json` に全カテゴリーの英訳メタデータが揃っている
- [ ] `tools/check-i18n.ps1` がエラー 0 で完了する
- [ ] ホーム画面で JP/EN を切替えると UI と問題データの両方が切替わる
- [ ] localStorage で言語選択が永続化される
- [ ] 履歴が言語切替後も正しく表示される
- [ ] `docs/i18n-translation-guide.md` に AI 非依存の手順が記載されている
- [ ] 両言語で end-to-end の動作確認完了
