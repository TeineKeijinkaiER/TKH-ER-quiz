# 問題データの追加・管理手順書

ER研修クイズの問題データを追加・編集する際の手順書。フォルダ構造、JSONフォーマット、複数選択・複数カテゴリ対応、検証方法をまとめる。

## ディレクトリ構成

```
data/
├── levels.json          ← 難易度レベル定義 (basic / advanced / master)
├── categories.json      ← カテゴリ一覧（id, level, name, file パス）
└── questions/
    ├── basic/           ← Basic レベルの問題ファイル
    ├── advanced/        ← Advanced レベルの問題ファイル
    └── master/          ← Master レベルの問題ファイル
```

各カテゴリは1つの JSON ファイルに対応する。`categories.json` の `file` フィールドが参照先パス（`questions/<level>/<filename>.json`）。

---

## 問題ファイルのフォーマット

```json
{
  "category": "カテゴリ名（表示用）",
  "questions": [
    {
      "id": "<unique_id>",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"],
      "answer": 0,
      "categories": ["primary_id", "additional_id"],
      "explanation": "解説文"
    }
  ]
}
```

**必須フィールド**:
- `id`: ファイル内ユニークなID（カテゴリ名_連番が慣例。例: `ed_first_steps_006`）
- `question`: 問題文
- `choices`: 必ず**5要素**の配列
- `answer` または `answers`: 正答インデックス（0〜4、後述）
- `explanation`: 解説文（必須）

**任意フィールド**:
- `categories`: 複数カテゴリで表示する場合（後述）
- `selectCount`: N個選択型のみ使用（後述）

---

## 単一選択 / 複数選択

### 単一選択（最も多いパターン）

```json
"answer": 2
```

選択肢のインデックス（0始まり）を整数で指定。

### 複数選択：「N個選べ」型（個数指定あり）

```json
"answer": [1, 2, 4],
"selectCount": 3
```

- `answer` は正答インデックスの配列
- `selectCount` を設定すると、UI上で**N個まで**しか選べなくなる（上限到達で他選択肢が無効化）
- `selectCount` の値は `answer` の長さと一致している必要あり

### 複数選択：「すべて選べ」型（個数指定なし）

```json
"answer": [1, 3]
```

- `answer` は正答インデックスの配列
- **`selectCount` を書かない**（書かないことが「すべて選べ」型の合図）
- ユーザーは何個でも選択でき、採点は集合の完全一致で判定

> 注意: `answers` というキーも `answer` と同じ意味で使える（既存資産との互換）。新規は `answer` で統一推奨。

---

## 複数カテゴリでの表示（クロスカテゴリ機能）

同じ問題を複数のカテゴリで出題できる。例: 「CPAホットラインで確認すべき情報」の問題を、`ed_first_steps_basic` と `cpr_basic` の両方に表示。

### 設定方法

問題に `categories` フィールドを追加するだけ:

```json
{
  "id": "ed_first_steps_007",
  "question": "心肺停止患者のホットラインで確認すべき項目を3つ選べ。",
  "choices": [...],
  "answer": [1, 2, 4],
  "selectCount": 3,
  "categories": ["ed_first_steps_basic", "cpr_basic"],
  "explanation": "..."
}
```

### ルール

- `categories` 配列に書かれた**すべてのカテゴリ**で表示される
- **所属ファイルのカテゴリ（プライマリ）は自動で含まれる** ので、書き忘れても安全
- 書く場合はプライマリも明示する方がエディタ視点で読みやすい（推奨）
- `categories` を**省略**した場合は、所属ファイルのカテゴリのみで表示（従来通り）
- 不明なカテゴリIDが含まれているとフロント側で `console.warn` を出してスキップ

### 編集の注意

- 問題本体は**所属ファイル1か所**で管理する（コピー禁止）
- 例: `ed_first_steps_007` は `data/questions/basic/ed_first_steps_basic.json` のみに記述
- `cpr_basic` 側のファイル（`data/questions/basic/cpr.json`）には書かない

### admin.html からの追加

管理画面 (`http://127.0.0.1:8787/admin`) から問題を追加した場合、その問題は POST 先カテゴリ（プライマリ）の JSON ファイルに保存される。複数カテゴリへの反映は、追加後にファイルを直接編集して `categories` フィールドを足す。

---

## 新しいカテゴリを追加する

1. 問題ファイルを `data/questions/<level>/<filename>.json` に作成
2. `data/categories.json` にエントリを追加:
   ```json
   {
     "id": "new_category_basic",
     "level": "basic",
     "name": "表示名",
     "description": "短い説明文",
     "file": "questions/basic/new_category.json",
     "accent": "#xxxxxx"
   }
   ```
3. `accent` はカテゴリのアクセントカラー（hex）

---

## 検証コマンド

問題追加後にバリデーションを通す。プロジェクトルートで実行:

```bash
node -e "
const fs = require('fs');
const path = require('path');
process.chdir('backend');
const code = fs.readFileSync('server.js', 'utf8');
eval(code.match(/function validateQuestion[\\s\\S]*?\\n\\}/)[0]);
eval(code.match(/function getQuestionAnswerIndexes[\\s\\S]*?\\n\\}/)[0]);
const cats = JSON.parse(fs.readFileSync('../data/categories.json', 'utf8'));
const validIds = new Set(cats.map(c => c.id));
const seen = new Set();
let total = 0, ok = 0, errs = [];
for (const c of cats) {
  if (seen.has(c.file)) continue; seen.add(c.file);
  const data = JSON.parse(fs.readFileSync(path.join('../data', c.file), 'utf8'));
  data.questions.forEach((q, i) => {
    total++;
    try { validateQuestion(q, i, c.id, validIds); ok++; }
    catch (e) { errs.push(c.file + ' ' + q.id + ': ' + e.message); }
  });
}
console.log('Validated:', ok, '/', total);
errs.forEach(e => console.log('NG', e));
"
```

カテゴリ別問題数（クロスカテゴリ反映後）の確認:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const cats = JSON.parse(fs.readFileSync('data/categories.json', 'utf8'));
const validIds = new Set(cats.map(c => c.id));
const primaryByFile = new Map();
for (const c of cats) if (!primaryByFile.has(c.file)) primaryByFile.set(c.file, c.id);
const aggregated = new Map(cats.map(c => [c.id, []]));
for (const [file, primaryId] of primaryByFile) {
  const data = JSON.parse(fs.readFileSync(path.join('data', file), 'utf8'));
  for (const q of data.questions) {
    let targets = [primaryId];
    if (Array.isArray(q.categories) && q.categories.length) {
      targets = q.categories.filter(t => validIds.has(t));
      if (!targets.includes(primaryId)) targets.push(primaryId);
    }
    for (const t of targets) aggregated.get(t).push(q);
  }
}
for (const c of cats) {
  console.log('  ' + c.id.padEnd(35), aggregated.get(c.id).length);
}
"
```

---

## 動作確認手順

1. ローカルサーバ起動: `python -m http.server 8000`
2. ブラウザで `http://localhost:8000/` を開く
3. 対象カテゴリを選んで、追加した問題が表示されること、採点が正しいことを確認
4. 複数カテゴリ反映した問題は、各反映先カテゴリでも表示されること
5. バックエンド経由の admin 確認: `node backend/server.js` → `http://127.0.0.1:8787/admin`

---

## トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| 問題が表示されない | `choices` が5要素ない | 必ず5要素にする |
| 「答え合わせ」が常に不正解 | `answer` のインデックスがズレている | 0始まりの配列インデックスを再確認 |
| `selectCount` でエラー | 正答数と一致していない | 揃えるか、`selectCount` を削除 |
| 「3つ選べ」なのに4個選べてしまう | `selectCount` 未設定 | `selectCount: 3` を追加 |
| クロスカテゴリ反映されない | カテゴリIDのタイプミス | `categories.json` の id と完全一致させる |
| admin から POST 失敗 | バリデーションエラー | サーバログのエラーメッセージを確認 |

---

## 例: ed_first_steps の問題を他カテゴリへ展開

1. 対象問題を選定（例: `ed_first_steps_007` CPA ホットライン → `cpr_basic` にも該当）
2. `data/questions/basic/ed_first_steps_basic.json` を開き、対象問題に追加:
   ```json
   "categories": ["ed_first_steps_basic", "cpr_basic"]
   ```
3. ファイル保存
4. 検証コマンドで集約数を確認
5. ブラウザで `cpr_basic` カテゴリを選び、表示されることを確認

`cpr.json` 側のファイルは編集しない。タグだけで集約される。
