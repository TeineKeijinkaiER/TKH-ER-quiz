# Quiz-TKHER 設計思想

## 目的

Quiz-TKHERは、研修医が救急外来の初期対応を短時間で反復するためのモバイルファーストなクイズアプリです。主眼は「知識を網羅すること」よりも、救急外来で最初の数分に迷いやすい判断を素早く確認することです。

## 画面設計

- スマホで片手操作しやすいよう、初期画面は「クイズ設定」と「カテゴリー選択」を縦に流します。
- カテゴリーはカード型ですが、装飾を強くしすぎず、15カテゴリ程度まで増えても一覧として破綻しない密度にしています。
- クイズ中は1問、5択、タイマーだけに情報を絞り、解答後に正誤を明確に表示します。
- 結果画面では点数よりもレビューを重視し、誤答と時間切れを復習しやすくしています。
- 名前は入力させず、研修医/専攻医/医師/看護師/その他の職種だけを必須入力にします。個人識別よりも教育設計に必要な集計を優先します。

## データ設計

- カテゴリーは`data/categories.json`で管理します。
- 問題は`data/questions/<category>.json`に分離し、カテゴリー追加時にJavaScriptを変更しなくてよい構造にしています。
- 各問は5択固定、`answer`は0始まりの正解インデックスです。
- 出題順と選択肢順は毎回ランダム化します。
- クイズ完了時の結果には、カテゴリー、点数、時間、挑戦者の職種を含めます。

## 非公開バックエンド

- `backend/server.js`はNode標準ライブラリだけで動くローカル専用サーバーです。
- 既定では`127.0.0.1:8787`にバインドし、公開ネットワークへ出さない運用を前提にしています。
- `/admin`で管理画面を開き、カテゴリーごとの使用状況、職種ごとの使用状況、最近の結果を確認できます。
- 問題追加は、管理画面でカテゴリーを選び、JSON配列または`{ "questions": [...] }`を貼り付けます。
- 使用状況は`backend/storage/usage-events.json`に保存します。このファイルはGit管理対象外です。

## 音の設計

- 外部MP3を持たず、Web Audioで単音源の簡単な音を生成します。
- オープニングは最初のユーザー操作後、ホーム画面を開いている間だけ簡単なRPG風ループを鳴らします。ブラウザの自動再生制限に合わせた設計です。
- 回答中は短い単音ループを鳴らし、残り時間への軽い緊張感を作ります。
- ボタン表示は現在の状態ではなく次の操作を示します。音がONの時は「効果音OFF」、音がOFFの時は「効果音ON」です。

## 医学コンテンツ方針

- 問題は初学者向けの「初期対応」「危険所見」「禁忌」「次の一手」を優先します。
- 薬剤量や施設差の大きい細部は、院内プロトコルに依存しすぎない表現にします。
- 公開前には必ず指導医レビューを通し、地域・施設の運用に合わせて調整します。

## 追加予定カテゴリへの備え

現在は11カテゴリですが、15カテゴリ程度まで増やす想定です。新規カテゴリを追加するときは、既存カテゴリと粒度を揃えます。

- カテゴリー名は臨床場面で探せる名前にする
- 説明文は20から35字程度にする
- まず5問で作り、レビュー後に10問へ増やす
- 1問1テーマにして、解説は次の行動につながる文章にする

## 参考にした主な資料

- Surviving Sepsis Campaign 2026 Adult Guidelines: https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines
- American Heart Association 2025 CPR and ECC Guidelines: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines
- NICE transient loss of consciousness guideline CG109: https://www.nice.org.uk/guidance/cg109
- NICE stroke and TIA guideline NG128: https://www.nice.org.uk/guidance/ng128
- NICE fractures guidance NG37/NG38: https://www.nice.org.uk/guidance/ng37 and https://www.nice.org.uk/guidance/ng38
- NICE anaphylaxis guideline CG134: https://www.nice.org.uk/guidance/cg134
- CDC adult outpatient antibiotic prescribing guidance: https://www.cdc.gov/antibiotic-use/hcp/clinical-care/adult-outpatient.html
