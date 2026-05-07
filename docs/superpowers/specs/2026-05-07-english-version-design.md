# Quiz-TKHER 英語版対応 設計書

- 作成日: 2026-05-07
- 対象ブランチ: `claude/practical-pike-eb8ef1`
- ステータス: Draft（実装計画化前）

## 1. 目的と背景

Quiz-TKHER は救急医学クイズの静的 Web アプリ（HTML+CSS+JS、ビルドステップなし）。現状は全 UI・問題・解説が日本語のみ。
英語学習者にも対応するため、**ホーム画面のトグル1つで日本語/英語を切替えられる**よう国際化（i18n）対応を行う。

新たに別アプリを作る案は採用せず、**既存アプリに i18n を組み込む**方針とする。

### 採用しない案

- 別アプリ複製: ロジック（タイマー・採点・履歴・音楽）が言語非依存のため、複製はバグ修正と機能追加のコストが2倍化する。
- 同一 JSON 内多言語フィールド (`{"question": {"ja": "...", "en": "..."}}`): 既存ファイルすべての全面書換が必要で、翻訳作業の並行管理がしにくい。
- ファイル名サフィックス方式 (`cpr.en.json`): ディレクトリが言語混在し見通しが悪い。

採用案: **言語別ディレクトリ構造 + ホーム画面切替 + AI 非依存の翻訳手順書**。

## 2. 要求事項

| # | 要求 |
|---|---|
| R1 | ホーム画面に「JP / EN」セグメントトグルを設置し、ワンクリックで全 UI と問題データが切替わる |
| R2 | クイズ進行中は言語切替ボタンを非表示または無効化（途中切替で問題不整合を防ぐ） |
| R3 | 言語選択は localStorage に永続化し、次回起動時も維持される |
| R4 | 初回アクセス時は `navigator.language` で英語ブラウザなら EN、それ以外は JA をデフォルトとする |
| R5 | 履歴・クリア記録は言語をまたいで保持（同一 categoryId）、表示時は現在の言語のカテゴリー名を使う |
| R6 | 全カテゴリー・全問題の英語版が揃ってから公開（段階公開はしない） |
| R7 | 日本語の問題を追加・修正する際、英語版も追従できる仕組みを提供する |
| R8 | 翻訳作業は Claude 以外の AI（ChatGPT, Gemini 等）でも実施可能な手順書を整備する |

## 3. アーキテクチャ

### 3.1 ディレクトリ構造

```
data/
  app-config.json
  levels.json
  categories.ja.json          ← 既存 categories.json をリネーム
  categories.en.json          ← 新規（同じ id・accent、name/description のみ英語）
  questions/
    ja/                       ← 既存 questions/ を ja/ にリネーム
      basic/cpr.json ...
      advanced/...
      master/...
    en/                       ← 新規（ja/ と完全に同じディレクトリ・ファイル名・問題ID）
      basic/cpr.json ...
docs/
  i18n-translation-guide.md   ← 新規（AI 非依存の翻訳・同期手順書）
tools/
  check-i18n.ps1              ← 新規（JA/EN 差分検出スクリプト）
js/
  i18n.js                     ← 新規（UI 文字列辞書）
  app.js                      ← 既存（i18n 対応に改修）
```

### 3.2 不変ルール

- 問題 ID（例 `cpr_basic_001`）は JA/EN で完全一致
- カテゴリー ID（例 `cpr_basic`）は JA/EN で完全一致
- `categories.{lang}.json` の `file` フィールドは言語 prefix を含まない相対パス（例 `"questions/basic/cpr.json"`）。ローダーが `data/questions/{lang}/{file}` で組み立てる
- `accent` カラーや `selectCount` 等の非テキスト値は両言語で同一

## 4. UI / 動作仕様

### 4.1 言語切替トグル

- 配置: ホーム画面（`#levelScreen`）の `level-intro` ブロック直下、`level-grid` の上
- 形態: 既存の `.segmented-control` と同じスタイルの2セグメント（JP / EN）
- 表示: ホーム画面（`#levelScreen`）と設定画面（`#setupScreen`）でのみ表示
- 非表示: クイズ進行中（`#quizScreen`）と結果画面（`#resultScreen`）では DOM ごと非表示
- 設定画面で切替時は `categoryGrid` を再描画（選択中カテゴリー ID は保持）

### 4.2 状態管理

- `localStorage` の既存キー `qqq_state_v1`（`schemaVersion: 2`）に `lang: "ja" | "en"` フィールドを追加
- `schemaVersion` は据え置き。`lang` 未定義時の読み込みでは `"ja"` を既定値として補完
- HTML の `<html lang>` 属性も切替時に同期 (`"ja"` ↔ `"en"`)

### 4.3 履歴・クリア記録

- 履歴データは categoryId のみで識別。言語をまたいで保持
- 表示時のカテゴリー名は現在の表示言語の `categories.{lang}.json` から解決
- 過去に日本語で記録した履歴を英語表示時に開いても、英語のカテゴリー名で表示される

## 5. 実装詳細

### 5.1 UI 文字列辞書 (`js/i18n.js`)

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
    countLegend: "出題数",
    countSuffix: "問",
    summaryCategory: "カテゴリー",
    summaryTimeLimit: "制限時間",
    summaryTimeLimitValue: "1問 20秒",
    quitConfirm: "中断",
    resultTitle: "演習結果",
    finishLabel: "Finish",
    btnRetry: "再挑戦",
    btnHome: "メイン画面",
    btnReviewToggleCollapse: "折りたたむ",
    btnReviewToggleExpand: "展開",
    rankingTitle: "履歴",
    rankingEmpty: "記録はまだありません。",
    btnResetHistory: "履歴を全削除",
    clearHistoryTitle: "クリア記録",
    btnResetClear: "クリア記録を全削除",
    disclaimer: "⚠️ このクイズは学習目的のコンテンツです。実際の臨床現場で患者を診療する際は、必ず最新のガイドラインや医療情報をご確認ください。",
    // ... 他の文字列もすべて列挙
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
    countLegend: "Questions",
    countSuffix: " Q",
    summaryCategory: "Category",
    summaryTimeLimit: "Time limit",
    summaryTimeLimitValue: "20 sec / question",
    quitConfirm: "Quit",
    resultTitle: "Result",
    finishLabel: "Finish",
    btnRetry: "Retry",
    btnHome: "Home",
    btnReviewToggleCollapse: "Collapse",
    btnReviewToggleExpand: "Expand",
    rankingTitle: "History",
    rankingEmpty: "No records yet.",
    btnResetHistory: "Clear all history",
    clearHistoryTitle: "Clear Records",
    btnResetClear: "Reset all clear records",
    disclaimer: "⚠️ This quiz is for educational purposes only. When treating patients in actual clinical settings, please refer to the latest guidelines and medical information.",
  },
};
```

### 5.2 HTML 側マークアップ規約

静的テキストは `data-i18n` 属性で識別：

```html
<h2 data-i18n="setupTitle">クイズ設定</h2>
<button data-i18n="btnRetry">再挑戦</button>
<input data-i18n-attr="placeholder:searchHint" placeholder="...">
```

`applyI18n(lang)` は以下を実行：

1. `document.documentElement.lang = lang === "en" ? "en" : "ja"`
2. `document.querySelectorAll('[data-i18n]')` を走査し、`textContent` を `I18N[lang][key]` に置換
3. `document.querySelectorAll('[data-i18n-attr]')` を走査し、`attr:key` 形式の指定属性を更新
4. JS から動的生成される文字列（カテゴリー名、結果コメント、レビュー画面等）は描画関数内で `I18N[state.lang][...]` を参照

### 5.3 データローダー変更

```js
// Before
fetch("data/categories.json")
fetch(`data/${cat.file}`)

// After
fetch(`data/categories.${state.lang}.json`)
fetch(`data/questions/${state.lang}/${cat.file}`)
```

言語切替ハンドラの責務：

1. `state.lang` を更新し localStorage 永続化
2. `applyI18n(state.lang)` を呼ぶ
3. categories と必要に応じて表示中画面のデータを再 fetch
4. setupScreen でカテゴリー選択中なら ID を保持して `categoryGrid` を再描画

### 5.4 初期言語決定ロジック

```js
function resolveInitialLang(saved) {
  if (saved === "ja" || saved === "en") return saved;
  const browser = (navigator.language || "ja").toLowerCase();
  return browser.startsWith("en") ? "en" : "ja";
}
```

## 6. 翻訳・同期ワークフロー

### 6.1 検証スクリプト `tools/check-i18n.ps1`

責務（読取専用、書込なし）：

1. ファイル整合性: `data/questions/ja/**/*.json` に存在して `en/` に欠けるファイル、または逆を出力
2. 問題 ID 整合性: 対応する JA/EN ファイル間で `questions[].id` の集合が一致するかチェック。差分があれば出力
3. カテゴリー整合性: `categories.ja.json` と `categories.en.json` の `id` 集合差分を出力

出力フォーマット例：

```
[OK]      ja/basic/cpr.json <-> en/basic/cpr.json (15 questions matched)
[MISSING] en/basic/cardiology.json - exists only in JA
[DIFF]    ja/basic/sepsis.json: id "sepsis_basic_007" missing in EN
[DIFF]    categories: id "pediatric_basic" missing in EN
```

異常検出時は終了コード 1 を返す。

### 6.2 翻訳手順書 `docs/i18n-translation-guide.md`

以下のセクションを含む（AI ベンダーに依存しない）：

1. ディレクトリ規約とファイル命名ルール
2. 新規日本語問題追加時の手順（JA 追加 → EN 追加 → check-i18n 実行）
3. 既存問題修正時の手順（JA 修正 → EN 該当 ID 修正 → check-i18n 実行）
4. 新規カテゴリー追加時の手順（両 categories.{lang}.json に同 id で追加）
5. **AI 翻訳依頼テンプレート**（Claude / ChatGPT / Gemini 等で共通利用可能）：
   - 医学用語は標準的英語表記（敗血症 → sepsis, 除細動 → defibrillation 等）
   - JSON 構造・ID・answers 配列・selectCount は完全保持
   - choices の順序は不変（answers インデックスが意味を失う）
   - explanation も翻訳対象
6. リリース前チェックリスト（check-i18n パス、両言語で end-to-end 動作確認、履歴の言語切替表示確認）

## 7. 影響範囲

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `index.html` | 改修 | `data-i18n` 属性付与、言語トグル追加、`js/i18n.js` 読込 |
| `js/app.js` | 改修 | fetch パスに lang プレフィックス、`applyI18n()` 呼出、`state.lang` 管理 |
| `js/i18n.js` | 新規 | UI 文字列辞書 |
| `css/style.css` | 軽微改修 | 言語トグルの装飾（既存 segmented-control を流用） |
| `data/categories.json` | リネーム | → `data/categories.ja.json` |
| `data/categories.en.json` | 新規 | 英語版カテゴリーメタデータ |
| `data/questions/` | 移動 | → `data/questions/ja/` |
| `data/questions/en/` | 新規 | 全問題の英語訳（21 カテゴリー分） |
| `tools/check-i18n.ps1` | 新規 | 同期検証スクリプト |
| `docs/i18n-translation-guide.md` | 新規 | 翻訳・同期手順書 |

## 8. スコープ外

- `backend/` 配下の管理画面の英語化（学習者向けではない）
- 音楽パターンの言語別差別化
- 言語自動検出の高度化（タイムゾーン等を加味する等は不要）
- 中国語・韓国語等、英語以外の追加言語（将来拡張時に同じ仕組みで `ko/`, `zh/` ディレクトリを追加可能な構造にはなっている）

## 9. リスクと緩和策

| リスク | 緩和策 |
|---|---|
| 翻訳忘れによる JA/EN 不整合 | `check-i18n.ps1` を運用フローに組込み |
| 医学用語の誤訳 | 翻訳手順書に標準訳語例を掲載、AI への明示的指示 |
| 言語切替時の状態壊れ（クイズ途中等） | クイズ進行中は切替不可（UI から非表示） |
| 履歴データの後方互換性 | `lang` 未定義時 `"ja"` フォールバック、schemaVersion は据置 |

## 10. 完了条件

- [ ] 21 カテゴリーすべての英語版問題データが `data/questions/en/` に配置済み
- [ ] `categories.en.json` に全カテゴリーの英訳メタデータが揃っている
- [ ] `tools/check-i18n.ps1` がエラー 0 で完了する
- [ ] ホーム画面で JP/EN を切替えると UI と問題データの両方が切替わる
- [ ] localStorage で言語選択が永続化される
- [ ] 履歴が言語切替後も正しく表示される
- [ ] `docs/i18n-translation-guide.md` に AI 非依存の手順が記載されている
- [ ] 両言語で end-to-end の動作確認（ホーム → 設定 → クイズ → 結果 → 履歴）完了
