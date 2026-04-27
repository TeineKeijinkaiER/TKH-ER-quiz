# Quiz-ER - 救急医学クイズ

救急外来の初期対応を短時間で確認する、静的HTML/CSS/JavaScriptのクイズアプリです。ビルド不要で、GitHub Pagesにそのまま配置できます。

## 起動

`fetch`でJSONを読むため、ローカルではHTTPサーバー経由で開いてください。

Windowsでは、プロジェクト直下の`Quiz-ER 起動.cmd`をダブルクリックすると、ローカルサーバーを起動してブラウザでアプリを開けます。

```powershell
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。

## 非公開バックエンドを使う

問題追加と使用状況確認を行うローカル専用バックエンドもあります。公開サーバーではなく、既定では`127.0.0.1`にだけ立ちます。

```powershell
node backend/server.js
```

- アプリ: `http://127.0.0.1:8787/`
- 管理画面: `http://127.0.0.1:8787/admin`

管理画面では、カテゴリー別・職種別の使用状況を確認できます。また、カテゴリーを選んで問題JSONを貼り付け、既存問題へ追加または置き換えできます。

## 構成

- `index.html`: 画面構造
- `css/style.css`: レイアウトとUI
- `js/app.js`: 画面遷移、タイマー、採点、ランキング保存
- `data/categories.json`: カテゴリー一覧
- `data/questions/*.json`: 問題データ
- `backend/server.js`: 非公開バックエンド
- `backend/admin.html`: 問題追加と統計確認の管理画面
- `docs/design-philosophy.md`: 設計思想と拡張方針

履歴、挑戦者の職種、効果音設定はブラウザの`localStorage`に保存されます。名前は収集しません。効果音と音楽は外部音源なしのWeb Audio単音源で生成しています。

バックエンド起動中にクイズを完了すると、結果は`backend/storage/usage-events.json`へ保存されます。このファイルは`.gitignore`対象です。

## 問題の追加

各JSONの`questions`配列に次の形式で追加します。`answer`は0始まりの選択肢番号です。

```json
{
  "id": "sepsis_011",
  "question": "問題文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"],
  "answer": 0,
  "explanation": "解説文"
}
```

新しいカテゴリーを増やす場合は、`data/questions/<id>.json`を作成し、`data/categories.json`に`id`、`name`、`description`、`file`、`accent`を追加します。

## 医学内容の注意

同梱問題はスターター教材です。臨床判断、院内プロトコル、地域の救急医療体制、薬剤添付文書、最新版ガイドラインを置き換えるものではありません。公開・配布前に、救急・集中治療・各専門領域の指導医レビューを行ってください。

主な参照元:

- Surviving Sepsis Campaign 2026 Adult Guidelines: https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines
- American Heart Association 2025 Adult BLS/ALS Guidelines: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines
- NICE Major trauma assessment and initial management: https://www.nice.org.uk/guidance/ng39/chapter/Recommendations
- Hyperglycemic Crises in Adults With Diabetes, 2024 Consensus Report: https://pmc.ncbi.nlm.nih.gov/articles/PMC11272983/
- Society for Endocrinology Adrenal Crisis Guidance: https://www.endocrinology.org/clinical-practice/clinical-guidance/adrenal-crisis/
