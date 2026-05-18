# i18n 翻訳・同期ガイド

> **総合ワークフロー（文字化け対策・AI 依頼テンプレ含む）は
> `docs/data-maintenance-workflow.md` を参照。**
> このドキュメントは **訳語ルール** に特化したリファレンス。

Quiz-TKHER は日本語 (`ja`) と英語 (`en`) の2言語に対応している。
日本語問題を追加・修正する場合は、必ず英語版も同期する。

## ディレクトリ規約

```
data/
  categories.ja.json          ← 日本語カテゴリーメタデータ
  categories.en.json          ← 英語カテゴリーメタデータ（同 id, accent, level）
  questions/
    ja/{level}/{file}.json    ← 日本語問題
    en/{level}/{file}.json    ← 英語問題（同ファイル名・同問題ID）
```

**不変ルール:**
- 問題 ID（例 `cpr_basic_001`）は JA/EN で完全一致
- カテゴリー ID は JA/EN で完全一致
- ファイル名・ディレクトリ構造は JA/EN で同一
- `id`, `level`, `accent`, `selectCount`, `answers`（インデックス値）は変更しない

## 整合性チェック

```powershell
.\tools\check-i18n.ps1
```

すべての行が `[OK]` になることを確認。`[MISSING]` や `[DIFF]` が出たら該当ファイルを修正する。

## 新規日本語問題を追加する場合

1. `data/questions/ja/{level}/{file}.json` の `questions` 配列に問題を追加
2. 同じ ID で `data/questions/en/{level}/{file}.json` にも追加（英語翻訳済み）
3. `.\tools\check-i18n.ps1` を実行してエラー 0 を確認

## 既存日本語問題を修正する場合

1. JA ファイルを修正
2. 同じ ID の EN エントリも修正
3. `.\tools\check-i18n.ps1` を実行

## 新規カテゴリーを追加する場合

1. `data/categories.ja.json` に追加（`file` フィールドは `"questions/ja/..."` 形式）
2. `data/categories.en.json` に **同じ id, level, file, accent** で追加（`file` は `"questions/en/..."` 形式、`name`/`description` は英訳）
3. JA/EN 両方の問題ファイルを作成
4. `.\tools\check-i18n.ps1` を実行

## AI 翻訳依頼テンプレート（Claude / ChatGPT / Gemini 共通）

```
以下の救急医学クイズの日本語問題 JSON を、医学的正確性を保ちながら自然な英語に翻訳してください。

ルール:
- 医学用語は標準的な英語表記（敗血症 → sepsis, 除細動 → defibrillation, 心肺蘇生 → CPR 等）
- JSON 構造を完全保持（id, answers 配列の数値, selectCount, categories, accent 等の非テキスト値はそのまま）
- choices 配列の順序は変更不可（answers のインデックスが意味を失うため）
- category フィールド（カテゴリー名文字列）は categories.en.json の対応 id の name に揃える
- explanation も翻訳対象

[ここに JA の JSON を貼付]
```

単一問題だけ修正する場合は、その問題オブジェクトだけ貼付すればよい。

## 標準訳語表

| 日本語 | 英語 |
|---|---|
| 救急外来 / ER | Emergency Department / ER |
| 意識障害 | Altered mental status |
| めまい | Vertigo |
| 脳卒中 | Stroke |
| 敗血症 | Sepsis |
| 重症外傷 | Major trauma |
| 心肺蘇生 / CPR | CPR / Cardiopulmonary resuscitation |
| 除細動 | Defibrillation |
| 抗菌薬 | Antibiotics / Antimicrobials |
| 髄膜炎 | Meningitis |
| 蘇生 | Resuscitation |
| 輸液 | IV fluids / Fluid resuscitation |
| 換気 | Ventilation |
| 気道管理 | Airway management |
| 鑑別診断 | Differential diagnosis |
| 研修医 | Resident |
| 専攻医 | Senior resident |

## リリース前チェックリスト

- [ ] `.\tools\check-i18n.ps1` がエラー 0
- [ ] JA/EN 両言語でホーム → 設定 → クイズ → 結果 → 履歴 を end-to-end 確認
- [ ] JA で記録した履歴が EN 切替後も正しく表示される
- [ ] localStorage を消した状態で初回起動時に `navigator.language` が反映される
