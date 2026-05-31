# データメンテナンス・ワークフロー

問題データ（`data/` 以下）の追加・修正・翻訳・医学的検証を、本人または他の AI（ChatGPT・Claude・Gemini など）に依頼するときの統一手順書。

> **このドキュメントの目的**
> - 文字化け（mojibake）を絶対に起こさない
> - JSON 構造を壊さない
> - 医学的内容が最新のガイドラインから乖離していないか定期的に検証する
> - 上記を他の AI に投げても再現できるようにする

関連ドキュメント:
- `docs/question-management.md` — JSON 仕様の詳細
- `docs/i18n-translation-guide.md` — 既存の翻訳ルール
- `tools/check-i18n.ps1` — JA/EN 整合性チェッカー

---

## 0. 大原則：文字化け（mojibake）を絶対に起こさない

これが最頻発の事故源。**必ず UTF-8（BOM なし）+ LF/CRLF どちらでも可** に統一する。

### 文字化けが起きる典型ケース

| ケース | 原因 | 対策 |
|---|---|---|
| PowerShell で `>` リダイレクト | 既定が UTF-16 LE | `Out-File -Encoding utf8NoBOM`（PS 7+）または `Set-Content -Encoding utf8 -NoNewline` 後にBOM除去 |
| メモ帳で保存 | BOM付きUTF-8になる | VS Code・別エディタを使う、または保存後にBOM除去 |
| ChatGPT/Gemini からコピペ | Unicode 正規化差・全角記号置換 | 「**UTF-8 のまま、JSON エスケープせず、全角記号も置換しないで**」と明示 |
| AIが `こん...` で返す | Unicode エスケープ出力 | 「**Unicode エスケープしないで生の日本語のまま出力**」と明示 |
| Windows でファイル比較時の差分 | CR LF vs LF | プロジェクトは CRLF で統一（`.gitattributes` 任せ） |

### AI に依頼するとき必ず先頭に貼る「文字コード指示文」

```
【重要・文字コード指示】
- 出力は UTF-8（BOM なし）
- 日本語は \uXXXX エスケープせず、そのままの文字で出力すること
- 全角記号（「」、。：）はそのまま、半角に置換しないこと
- JSON は構造を壊さず、キーの順序・スペースも極力保つこと
- 出力はコードフェンス ```json ... ``` の中にすべて入れて、前後に説明文を入れないこと
```

### 安全に書き込むコマンド

**PowerShell 7+（推奨）**
```powershell
$content | Set-Content -Path "data\questions\ja\entry\new.json" -Encoding utf8NoBOM
```

**PowerShell 5.1（Windows標準）** — `utf8NoBOM` が無いので Python 経由が安全
```powershell
python -c "open(r'data\questions\ja\entry\new.json','w',encoding='utf-8',newline='\n').write('''...''')"
```

**Python（OS問わず、最も安全）**
```python
import json, pathlib
data = {...}  # parsed JSON
pathlib.Path("data/questions/ja/entry/new.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=2),
    encoding="utf-8"
)
```
`ensure_ascii=False` が **絶対必要**。これを忘れると日本語が `こ...` になる。

**Node.js**
```js
const fs = require("fs");
fs.writeFileSync("data/questions/ja/entry/new.json",
  JSON.stringify(data, null, 2), { encoding: "utf-8" });
```

### 文字化けチェック（書き込み後の確認）

```powershell
# BOMの有無を確認（先頭が EF BB BF だとBOM付き）
[BitConverter]::ToString((Get-Content -Encoding Byte -ReadCount 3 -Path "data\questions\ja\entry\new.json" -TotalCount 3))

# 簡易：先頭の文字を出してみる
Get-Content -Raw -Encoding UTF8 "data\questions\ja\entry\new.json" | Select-Object -First 1
```

```bash
# BOM 検出
file data/questions/ja/entry/new.json
head -c 3 data/questions/ja/entry/new.json | xxd
```

---

## 1. ディレクトリ構造（現状）

```
data/
├── app-config.json
├── levels.json                        ← entry / basic / advanced / master
├── categories.ja.json
├── categories.en.json
├── updates.json                       ← アップデート履歴
└── questions/
    ├── ja/
    │   ├── entry/   *.json
    │   ├── basic/   *.json
    │   ├── advanced/*.json
    │   └── master/  *.json
    └── en/
        ├── entry/   *.json
        ├── basic/   *.json
        ├── advanced/*.json
        └── master/  *.json
```

**不変ルール（壊すと整合性チェックが落ちる）：**
- 問題 ID は JA / EN で完全一致（例 `cpr_basic_001`）
- カテゴリ ID は JA / EN で完全一致
- ファイル名・サブディレクトリ構成は JA / EN で同一
- `id`, `level`, `accent`, `selectCount`, `answers`（数値配列）は両言語で揃える

---

## 2. JSON 構造のチェック

### 標準フォーマット

```json
{
  "category": "感染症",
  "questions": [
    {
      "id": "infection_entry_001",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "answers": [2],
      "selectCount": 1,
      "categories": ["infection_entry"],
      "explanation": "解説文"
    }
  ]
}
```

| フィールド | 必須 | 説明 |
|---|---|---|
| `id` | ✓ | ファイル内ユニーク。`<categoryid>_<連番>` 推奨 |
| `question` | ✓ | 問題文 |
| `choices` | ✓ | 4〜5要素配列 |
| `answers` | ✓ | 正答インデックス配列（0始まり） |
| `selectCount` | ✓ | 何個選ばせるか。単一選択は `1`、N個選択は `answers.length` と一致、「すべて選べ」は必ず `0` |
| `explanation` | ✓ | 解説文 |
| `categories` | 任意 | クロスカテゴリ表示用。所属ファイルのIDは自動付与 |

### バリデーション

```powershell
# JA/EN 整合性チェック
.\tools\check-i18n.ps1
```

```powershell
# JSON パース確認（PowerShell 7+）
Get-ChildItem -Recurse data\questions -Filter *.json | ForEach-Object {
  try { Get-Content $_ -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null; "[OK] $($_.Name)" }
  catch { "[FAIL] $($_.Name): $_" }
}
```

```bash
# Linux/Mac
find data/questions -name "*.json" | while read f; do
  python -c "import json; json.load(open('$f', encoding='utf-8'))" && echo "[OK] $f" || echo "[FAIL] $f"
done
```

---

## 3. ワークフロー：新しい日本語問題を追加する

1. **対象カテゴリのファイルを開く**
   例: `data/questions/ja/entry/infection_entry.json`

2. **末尾に問題オブジェクトを追加**（末尾要素の `,` 付け忘れに注意）

3. **JSON パース確認** → セクション 2 のコマンド

4. **英語版にも同じ ID で追加** → セクション 4 のワークフロー

5. **整合性チェック** → `.\tools\check-i18n.ps1` がエラー 0

6. **動作確認** → `python -m http.server 8765` でローカル起動

---

## 4. ワークフロー：日本語→英語版を作成する

### AI に投げるプロンプトテンプレート

```
【重要・文字コード指示】
- 出力は UTF-8（BOM なし）
- Unicode エスケープ（\uXXXX）は禁止。生の文字で出力
- 出力は ```json ... ``` のコードフェンスに JSON 全体だけ入れること
- 説明文や前置きは一切付けないこと

【翻訳タスク】
以下の救急医学クイズ JSON を英語に翻訳してください。

ルール:
1. JSON 構造を完全保持（id, answers の数値, selectCount, categories は触らない）。「すべて選べ / Select all」は `selectCount: 0` を必ず保持し、削除しない
2. choices の順序は変更不可（answers のインデックスが意味を失う）
3. 医学用語は標準英語表記（敗血症→sepsis, 除細動→defibrillation など）
4. category フィールド（カテゴリ名表示文字列）は `categories.en.json` の対応 ID の `name` と一致させる
5. explanation も翻訳

参考用 categories.en.json の対応エントリ:
[ここに categories.en.json から該当 id のオブジェクトを抜粋して貼付]

翻訳対象:
[ここに ja の JSON 全体を貼付]
```

### 受け取った英語 JSON の保存手順

```powershell
# 1. AI出力を文字化けゼロで保存（Pythonで一発、推奨）
python -c "
import sys, json, pathlib
text = pathlib.Path('clipboard.json').read_text(encoding='utf-8')
data = json.loads(text)  # パース確認も兼ねる
pathlib.Path('data/questions/en/entry/infection_entry.json').write_text(
    json.dumps(data, ensure_ascii=False, indent=2),
    encoding='utf-8'
)
"

# 2. 整合性チェック
.\tools\check-i18n.ps1
```

### よく使う標準訳語表（`docs/i18n-translation-guide.md` を参照）

主要訳語の確認は `docs/i18n-translation-guide.md` の「標準訳語表」を参照。

---

## 5. ワークフロー：医学的内容の検証（定期 / リリース前）

問題内容は時間経過とともにガイドライン改訂で陳腐化する。**少なくとも年1回、および主要ガイドライン改訂時** に検証する。

### 検証対象の優先順位

1. **救急一般・蘇生**: AHA / ERC / JRC ガイドライン（2020・2025）
2. **敗血症**: SSC ガイドライン（最新版）、日本版敗血症診療ガイドライン（J-SSCG）
3. **外傷**: ATLS、JATEC
4. **脳卒中**: 日本脳卒中学会ガイドライン、AHA/ASA Guidelines for Stroke
5. **小児**: PALS、日本小児救急医学会
6. **感染症**: JAID/JSC 抗微生物薬適正使用ガイドライン、CDC、サンフォード
7. **中毒**: 日本中毒情報センター、UpToDate
8. **薬剤**: 日本病院薬剤師会、添付文書（PMDA）

### AI に検証を依頼するときのプロンプト（Web 検索ツール付き AI 向け）

```
【重要・文字コード指示】
- 出力は UTF-8（BOM なし）、Unicode エスケープ禁止、生の日本語で

【医学的検証タスク】
あなたは救急医学の指導医です。以下の救急医学クイズ問題が「2026年5月時点で参照可能な医学ガイドライン・学会指針」から逸脱していないかをチェックしてください。

必須の検証手順:
1. 各問題について、関連する以下のソースを **Web 検索ツールで実際にあたる** こと:
   - 日本救急医学会・関連学会の最新ガイドライン
   - AHA/ERC/ATLS/JRC/SSC など国際ガイドライン
   - UpToDate（アクセスできる範囲で）、PubMed の最新総説
   - 日本のPMDA添付文書（薬剤関連）
2. 問題文・選択肢・解説のいずれかに **古い記載 / 誤り / 曖昧な点** があれば指摘
3. 指摘ごとに **出典 URL・ガイドライン名・該当ページ／セクション** を必ず明記
4. 改訂提案は「原文」「修正案」「修正理由（出典付き）」の3列で出す
5. 検証 OK のものは「OK」と短く印を付け、わざわざ書き直さない

出力フォーマット:
```
## 問題ID: <id>
- 判定: [OK / 要修正 / 議論あり]
- 出典: <ガイドライン名・URL・ページ>
- 原文: <該当箇所>
- 修正案: <あれば>
- 理由: <簡潔に>
```

検証対象 JSON:
[ここに対象 JSON を貼付]
```

### 検証結果の記録

検証ログを `docs/medical-review-log/` 配下に日付付きで残す:

```
docs/medical-review-log/
├── 2026-05-17-infection-entry.md
├── 2026-05-17-sepsis-basic.md
└── ...
```

各ログには:
- 検証日
- 対象ファイル
- 使用 AI（Claude/ChatGPT/Gemini）+ モデル名
- 参照したガイドライン（バージョン・年）
- 指摘事項と対応（修正済み/保留）

---

## 6. ワークフロー：問題の修正

1. JA ファイルを修正
2. **同じ ID** の EN エントリも修正
3. `.\tools\check-i18n.ps1` でエラー 0
4. 必要なら `data/updates.json` に履歴を追加（カテゴリのクリア記録がリセットされる）

> **重要:** 問題の `id` は **絶対に変えない**。学習者のクリア記録は ID 単位で保存されているため。

---

## 7. AI 別の細かい注意点

### ChatGPT
- 日本語の長文 JSON を出すと、稀に末尾で省略される。出力後に必ず `}` で閉じているか確認
- Code Interpreter 経由で UTF-8 書き出しを依頼すると安全

### Claude（このプロジェクト向き）
- `ensure_ascii=False` を明示しなくても日本語のまま返してくれることが多い
- 大きな JSON は Artifact で受け取ると確実

### Gemini
- 全角記号を半角に置換する癖がある。プロンプトで明示的に禁止
- 「、」「。」を ", "  ". " に変えがちなので注意

### 共通
- AI に渡す前に対象 JSON の **冒頭5行を Hex で確認** すれば BOM・エスケープの混入を発見できる
- 受け取った JSON は `JSON.parse` / `json.loads` を通してから書き込む（壊れていれば即発見）

---

## 8. リリース前の最終チェックリスト

- [ ] `.\tools\check-i18n.ps1` がエラー 0
- [ ] 全 JSON ファイルがパース可能（セクション 2 のコマンド）
- [ ] BOM 付き / Shift-JIS 等の混入が無い（grep で `\xef\xbb\xbf` を探す等）
- [ ] 直近1年以内に医学的検証ログがある
- [ ] 修正したカテゴリは `updates.json` に履歴追加（クリア記録リセットを意図的に行う場合）
- [ ] JA / EN 両方でローカル起動して end-to-end 動作確認
