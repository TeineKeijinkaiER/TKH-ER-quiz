# 難易度レベル・クリア記録 設計仕様

## 概要

Quiz-TKHERに3段階の難易度レベル（Basic / Advanced / Master）を追加し、カテゴリー×レベルの組み合わせを独立したクイズ単位として管理する。全問正解を「Clear」と定義し、クリア済みカテゴリーを履歴として記録・表示する。

---

## データ構造

### `data/levels.json`（新設）

```json
[
  { "id": "basic",    "name": "Basic" },
  { "id": "advanced", "name": "Advanced" },
  { "id": "master",   "name": "Master" }
]
```

### `data/categories.json`（変更）

各エントリーに `level` フィールドを追加。3レベル対応カテゴリーは同じカテゴリーを別IDで3エントリー登録する。準備中のエントリーには `"comingSoon": true` を付与する。

```json
[
  {
    "id": "sepsis_basic",
    "name": "敗血症",
    "level": "basic",
    "description": "初期認識、qSOFA、抗菌薬の基本",
    "file": "questions/sepsis_basic.json",
    "accent": "#087f8c"
  },
  {
    "id": "sepsis_advanced",
    "name": "敗血症",
    "level": "advanced",
    "description": "循環管理、乳酸値、ソースコントロール",
    "file": "questions/sepsis_advanced.json",
    "accent": "#087f8c"
  },
  {
    "id": "sepsis_master",
    "name": "敗血症",
    "level": "master",
    "description": "ステロイド、CRRT、集中治療戦略",
    "file": "questions/sepsis_master.json",
    "accent": "#087f8c"
  }
]
```

### 問題ファイル（`data/questions/`）

- **3レベル対応の5カテゴリー**：既存ファイル（例：`sepsis.json`）を `sepsis_basic.json` にリネームし、`sepsis_advanced.json` / `sepsis_master.json` を新規作成する
- **Basicのみの6カテゴリー**：既存ファイル名はそのまま変更しない（例：`infection.json` のまま）。`categories.json` のエントリーでカテゴリーIDに `_basic` サフィックスを付与し、`level: "basic"` を追加するだけでよい

---

## カテゴリー構成

### 3レベル全対応（5カテゴリー）

| カテゴリー名 | Basic | Advanced | Master |
|---|---|---|---|
| 救急外来まずはここから | 初期評価ABCDEの基本 | トリアージ判断・優先順位 | 複合外傷・多臓器不全の初期対応 |
| 敗血症 | qSOFA・早期認識 | 乳酸値・循環管理 | ステロイド・CRRT・集中治療 |
| 重症外傷 | Primary survey基本 | 出血制御・輸血戦略 | damage control・骨盤骨折 |
| 心肺蘇生 | 高品質CPR・除細動 | 薬剤・可逆的原因(4H4T) | ECPR・蘇生後管理 |
| 意識障害/意識消失 | 低血糖・失神の鑑別 | AIUEOTIPS・初期対応 | 脳症・中枢性病変の精査 |

各10問、5択固定。

### Basicのみ（6カテゴリー）

めまい/脳卒中・整形外傷・感染症・消化器症状・救急外来薬剤投与・内分泌救急。
現在の問題ファイルをそのまま流用し、`level: "basic"` を付与する。

---

## 画面フロー

```
レベル選択画面 → カテゴリー選択画面 → 問題数選択 → クイズ → 結果画面
      ↑                                                        |
      └─────────────────── クリア記録画面（ボタンから常時アクセス可）
```

### レベル選択画面（ホーム画面を置き換え）

- Basic / Advanced / Master の3カードを縦に表示
- 各カードにそのレベルのクリア済みカテゴリー数を表示（例：「3 / 11 クリア済み」）
- 前回選択したレベルを記憶し次回起動時に引き継ぐ

### カテゴリー選択画面

- 選択したレベルのカテゴリーのみ表示
- クリア済みカテゴリーには「CLEAR」バッジ（王冠アイコン）を表示
- `comingSoon: true` のカテゴリーは「準備中」グレー表示でタップ不可

### クリア記録画面（新設）

- Basic / Advanced / Master の横タブで切り替え
- 各レベルのカテゴリーを一覧表示
- クリア済みに ✓ とクリア日時を表示
- 未クリアは空欄

---

## ClearロジックとlocalStorage

### Clear判定

- クイズ終了時に `score === questionCount`（全問正解）であればClear
- 同じ `level + categoryId` の組み合わせで複数回Clearしても、最初のClear日時のみ保持

### localStorageデータ構造

```json
{
  "learnerRoleId": "resident",
  "muted": false,
  "selectedLevel": "basic",
  "rankings": [...],
  "clears": {
    "basic:sepsis_basic": "2026-04-29T10:30:00.000Z",
    "advanced:sepsis_advanced": "2026-04-30T09:15:00.000Z"
  }
}
```

- `clears` のキーは `"level:categoryId"` 形式
- 値はISO形式のClear日時（最初にClearした日時のみ記録）
- `selectedLevel` は最後に選んだレベルを記憶

---

## 実装スコープ（対象外）

- レベル間のロック機能（例：BasicをクリアしないとAdvanced不可）は実装しない
- オンラインランキング・他ユーザーとの比較は実装しない
- レベル表示ラベル（「研修医1年目」など）は表示しない
