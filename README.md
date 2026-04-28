# Quiz-TKHER - 救急医学クイズ

救急外来の初期対応を確認する、静的HTML/CSS/JavaScriptのクイズアプリです。ビルド不要で、GitHub Pagesにそのまま配置できます。

## 起動

`fetch`でJSONを読むため、ローカルではHTTPサーバー経由で開いてください。

Windowsでは、プロジェクト直下の`Quiz-TKHER 起動.cmd`をダブルクリックすると、ローカルサーバーを起動してブラウザでアプリを開けます。

```powershell
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。

## GitHub Pagesの結果をGoogleスプレッドシートへ集める

GitHub Pagesは静的サイトなので、それだけでは全員の結果を保存できません。結果収集には24時間アクセスできる受信先が必要です。このリポジトリでは、Google Apps Scriptを使ってGoogleスプレッドシートへ結果を追記する構成にしています。

### 1. スプレッドシートを作る

Googleスプレッドシートで新しいファイルを作り、任意の名前を付けます。例: `Quiz-TKHER Results`

### 2. Apps Scriptを貼り付ける

スプレッドシートで `拡張機能` → `Apps Script` を開き、`integrations/google-sheets/Code.gs` の内容を貼り付けて保存します。

### 3. Webアプリとしてデプロイする

Apps Script画面右上の `デプロイ` → `新しいデプロイ` を選びます。

- 種類: `ウェブアプリ`
- 実行ユーザー: `自分`
- アクセスできるユーザー: `全員`

`自分のみ` や `Google アカウントを持つ全員` では、GitHub Pagesからの匿名POSTがログイン画面へ飛ばされ、結果が保存されません。必ずログイン不要の `全員` にします。

初回は権限承認が必要です。デプロイ後に表示されるWebアプリURLをコピーします。

コピーするURLは、必ず次の形です。スプレッドシート自体のURLではありません。

```text
https://script.google.com/macros/s/....../exec
```

ブラウザのシークレットウィンドウでこのURLを直接開いて、`"ok":true` と `spreadsheetUrl` が表示されればApps Script側の準備はできています。Googleログイン画面が出る場合はアクセス権限が違います。デプロイ設定を `全員` に直し、変更後は `デプロイ` → `デプロイを管理` → 対象デプロイを編集し、新しいバージョンとして再デプロイしてください。

### 4. フロントエンドへURLを設定する

`data/app-config.json` の `googleSheetsWebAppUrl` に、コピーしたWebアプリURLを入れます。

```json
{
  "googleSheetsWebAppUrl": "https://script.google.com/macros/s/....../exec",
  "sendToLocalBackend": "auto"
}
```

この変更をGitHubへpushすると、GitHub Pagesで解かれた結果がスプレッドシート内の `quiz_results` タブに追記されます。最初の `シート1` ではなく、画面下部のタブ名を確認してください。収集されるのは、職種、カテゴリー、問題数、点数、所要時間、日時、利用ページURLです。名前は収集しません。

うまく記録されない場合は、Apps Script画面で `testAppendSample` 関数を選んで実行してください。スプレッドシートに「疎通テスト」の行が追加されれば、シートへの書き込み権限は正常です。アプリからの送信だけ失敗している場合は、`data/app-config.json` がGitHub Pagesへ反映されているか、WebアプリURLが `/exec` で終わっているか、シークレットウィンドウで `/exec` URLを開いてログイン画面にならないかを確認してください。

## 非公開バックエンドを使う

問題追加とローカルでの使用状況確認を行う非公開バックエンドもあります。これは公開サーバーではなく、既定では`127.0.0.1`にだけ立つため、GitHub Pages利用者の結果を24時間収集する用途には使えません。全員の結果収集には上のGoogleスプレッドシート連携を使ってください。

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
- `data/app-config.json`: 結果送信先設定
- `data/questions/*.json`: 問題データ
- `integrations/google-sheets/Code.gs`: Googleスプレッドシート収集用Apps Script
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
