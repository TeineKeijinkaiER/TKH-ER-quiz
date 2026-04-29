# 引き継ぎドキュメント — Quiz-TKHER 難易度レベル機能実装

**作成日**: 2026-04-29  
**プロジェクト**: `C:/Users/shin0/Documents/GitHub/APPT`  
**GitHubリポジトリ**: `https://github.com/TeineKeijinkaiER/TKH-ER-quiz`

---

## 現状サマリー

### 完了済み
- ローカルGitのoriginは `TeineKeijinkaiER/TKH-ER-quiz` に向いている（接続済み）
- 起動スクリプト `tools/open-local.ps1` のバグ修正済み（"Quiz-ER" → "Quiz-TKHER"）
- `index.html` のフッター免責記載削除済み
- **設計仕様書**: `docs/superpowers/specs/2026-04-29-difficulty-levels-design.md` 作成・コミット済み

### 未完了（次セッションで行う作業）
1. **実装計画書の作成** (`docs/superpowers/plans/` に保存）
2. **実装計画に沿ったコーディング**（以下に詳細）
3. **GitHubへのpushとGitHub Pagesへの反映**

---

## 実装する機能の全体像

ユーザーが承認した設計：

### 画面フロー
```
レベル選択画面（NEW・ホーム）→ カテゴリー選択（既存setupScreen・レベルで絞り込み）
→ クイズ → 結果（CLEARバナー追加）
クリア記録画面（NEW・常時アクセス可）
```

### 難易度レベル
| ID | 名前 |
|---|---|
| basic | Basic |
| advanced | Advanced |
| master | Master |

ラベル（「研修医1年目」等）は**表示しない**（ユーザー指示）

### Clear定義
- `score === questionCount`（全問正解）= Clear
- localStorage の `clears` オブジェクトに `"level:categoryId": "ISO日時"` で記録
- 同一カテゴリーを複数回Clearしても最初の日時のみ保持

### カテゴリー構成
**3レベル全対応（5カテゴリー）**:
- 救急外来まずはここから（`ed_first_steps`）
- 敗血症（`sepsis`）
- 重症外傷（`trauma`）
- 心肺蘇生（`cpr`）
- 意識障害/意識消失（`altered_mental_status`）

**Basicのみ（6カテゴリー）**:
- めまい/脳卒中, 整形外傷, 感染症, 消化器症状, 救急外来薬剤投与, 内分泌救急

---

## 実装タスク詳細

### Task 1: 問題データファイルの作成

#### 1-a: Basicレベル補完が必要なファイル（既存5問→10問）

**`data/questions/ed_first_steps_basic.json`** を新規作成（既存 `ed_first_steps.json` の5問 + 下記5問追加）

追加する5問（`ed_first_steps_006`〜`010`）:

```json
{
  "id": "ed_first_steps_006",
  "question": "気道閉塞を示唆する所見として最も適切なのはどれか。",
  "choices": ["嚥下困難のみある", "嗄声・吸気性喘鳴・会話困難・シーソー呼吸を認める", "鼻汁がある", "食欲がない", "慢性的な咳のみある"],
  "answer": 1,
  "explanation": "気道閉塞の徴候は嗄声、吸気性喘鳴、会話困難、シーソー呼吸などです。これらが急速に悪化する場合は早期の気道確保を判断します。"
},
{
  "id": "ed_first_steps_007",
  "question": "ショックの4分類に含まれないものはどれか。",
  "choices": ["循環血液量減少性", "心原性", "血管拡張性（分布異常性）", "閉塞性", "神経変性性"],
  "answer": 4,
  "explanation": "ショックは循環血液量減少性、心原性、血管拡張性（分布異常性：敗血症・アナフィラキシー・神経原性）、閉塞性（緊張性気胸・心タンポナーデ）の4分類です。神経変性性という分類はありません。"
},
{
  "id": "ed_first_steps_008",
  "question": "末梢静脈路確保が困難な緊急時に検討すべきルートとして適切なのはどれか。",
  "choices": ["必ず上腕静脈のみを試みる", "骨髄内ルート（IO）を検討する", "静脈路は1本のみでよい", "採血が終わるまで静脈路は取らない", "緊急時は静脈路不要である"],
  "answer": 1,
  "explanation": "末梢静脈路確保が困難な緊急時には骨髄内ルート（IO）を早期に検討します。胸骨、大腿骨近位、脛骨など複数部位が使用可能で、ほぼすべての薬剤・輸液を投与できます。"
},
{
  "id": "ed_first_steps_009",
  "question": "JCS（Japan Coma Scale）で300が示す意識レベルはどれか。",
  "choices": ["呼びかけで開眼する", "痛み刺激でも反応なし（深昏睡）", "軽度の混乱がある", "自発的に行動できる", "会話は可能"],
  "answer": 1,
  "explanation": "JCS 300は「痛み刺激でまったく反応しない」深昏睡を示します。JCSはIが刺激なし覚醒（1・2・3）、IIが刺激で覚醒（10・20・30）、IIIが刺激でも覚醒しない（100・200・300）の3段階9分類です。"
},
{
  "id": "ed_first_steps_010",
  "question": "問診でSAMPLEを用いる場合のSが示すものはどれか。",
  "choices": ["主訴と症状（Signs and Symptoms）", "手術歴", "血糖値（Sugar）", "SpO2", "皮膚の状態（Skin）"],
  "answer": 0,
  "explanation": "SAMPLEはS：症状、A：アレルギー、M：薬歴、P：既往歴、L：最終食事、E：受傷・発症状況の頭文字です。迅速な病歴聴取に役立てます。"
}
```

**`data/questions/altered_mental_status_basic.json`** を新規作成（既存 `altered_mental_status.json` の5問 + 下記5問追加）

追加する5問（`altered_mental_status_006`〜`010`）:

```json
{
  "id": "altered_mental_status_006",
  "question": "意識障害患者への初期投与「DONT」に含まれないものはどれか。",
  "choices": ["ブドウ糖（Dextrose）", "酸素（Oxygen）", "ナロキソン（Naloxone）", "チアミン（Thiamine）", "ステロイド（Steroid）"],
  "answer": 4,
  "explanation": "DONTはDextrose（低血糖補正）、Oxygen（低酸素補正）、Naloxone（オピオイド拮抗）、Thiamine（Wernicke予防）の頭文字です。ステロイドはDONTに含まれません。"
},
{
  "id": "altered_mental_status_007",
  "question": "失神と意識障害の違いとして正しいのはどれか。",
  "choices": ["失神は短時間で完全回復し前後の記憶が保たれることが多い", "失神は必ず30分以上続く", "失神は脳圧迫が主な原因である", "失神では必ず挿管が必要である", "失神と心停止は同義である"],
  "answer": 0,
  "explanation": "失神は一過性の脳低灌流による短時間の意識消失で、多くは自然回復し前後の記憶が保たれます。持続する意識障害や神経局在症状を伴う場合は構造的・代謝的原因を検索します。"
},
{
  "id": "altered_mental_status_008",
  "question": "アルコール多飲患者で意識障害がある場合に必ず考慮すべき可逆的原因はどれか。",
  "choices": ["低血糖とWernicke脳症", "花粉症", "消化性潰瘍", "変形性関節症", "白内障"],
  "answer": 0,
  "explanation": "アルコール多飲患者の意識障害では低血糖（肝グリコーゲン枯渇）とWernicke脳症（チアミン欠乏）を常に念頭に置きます。ブドウ糖投与前にチアミン投与が推奨されます。"
},
{
  "id": "altered_mental_status_009",
  "question": "高齢者で急性の意識変容（せん妄）を引き起こしやすい身体的誘因として最も適切なのはどれか。",
  "choices": ["感染症・脱水・薬物・低酸素などの身体的誘因", "定期的な運動", "規則正しい睡眠", "十分な水分摂取", "安定した家庭環境"],
  "answer": 0,
  "explanation": "高齢者のせん妄は感染症・脱水・電解質異常・薬物（特に抗コリン薬・ベンゾジアゼピン）・低酸素・術後などが誘因となります。可逆的原因の検索と治療が最優先です。"
},
{
  "id": "altered_mental_status_010",
  "question": "意識障害患者へのブドウ糖投与前にチアミンを先に投与する理由として正しいのはどれか。",
  "choices": ["ブドウ糖単独投与でWernicke脳症を誘発・悪化させるリスクがあるため", "チアミンがブドウ糖を分解するため", "ブドウ糖は単独では吸収されないため", "チアミンが意識を急速に改善させるため", "両者は必ず同時点滴でなければならないため"],
  "answer": 0,
  "explanation": "チアミン（ビタミンB1）欠乏状態でブドウ糖を投与するとピルビン酸代謝が滞りWernicke脳症が誘発・悪化します。アルコール多飲・低栄養患者では必ずブドウ糖前にチアミン100mgを投与します。"
}
```

---

#### 1-b: Advanced・Masterレベルの新規問題ファイル

以下10ファイルを新規作成。各ファイル10問。

**`data/questions/sepsis_advanced.json`** — 乳酸値・循環管理
- sepsis_adv_001: 輸液反応性評価（PLR）
- sepsis_adv_002: 乳酸値4mmol/Lの意義
- sepsis_adv_003: バソプレシン追加の目的
- sepsis_adv_004: SOFAスコアの6臓器
- sepsis_adv_005: 腹腔内膿瘍のソースコントロール
- sepsis_adv_006: ヒドロコルチゾン200mg/日の適応
- sepsis_adv_007: バランス晶質液の優位性（高Cl性アシドーシス予防）
- sepsis_adv_008: 乳酸クリアランス20%低下の意義
- sepsis_adv_009: 輸液・抗菌薬・感染源精査の並行対応
- sepsis_adv_010: 早期経腸栄養の意義（腸管バリア維持）

**`data/questions/sepsis_master.json`** — ステロイド・CRRT・集中治療
- sepsis_mas_001: ヒドロコルチゾンのエビデンス（ショック離脱）
- sepsis_mas_002: CRRT適応（高K・肺水腫）
- sepsis_mas_003: ICU管理バンドル（鎮痛・鎮静・離床）
- sepsis_mas_004: 輸血閾値 Hb7g/dL
- sepsis_mas_005: ARDSの肺保護換気（TV6mL/kg、Pplat≤30）
- sepsis_mas_006: 血糖管理180mg/dL以下
- sepsis_mas_007: DICの初期対応（感染源治療優先）
- sepsis_mas_008: 抗菌薬デエスカレーションの原則
- sepsis_mas_009: POCUS（ポイントオブケア超音波）の活用
- sepsis_mas_010: VTE予防（低分子ヘパリン＋機械的予防）

**`data/questions/trauma_advanced.json`** — 出血制御・輸血戦略
- trauma_adv_001: 大量輸血プロトコル（MTP）起動基準
- trauma_adv_002: 止血輸液蘇生（赤血球:血漿:血小板バランス）
- trauma_adv_003: 死の三徴（低体温・アシドーシス・凝固障害）
- trauma_adv_004: REBOA（大動脈内バルーン閉塞）の目的
- trauma_adv_005: 外傷性血胸のドレナージ適応
- trauma_adv_006: 頭部外傷のMAP管理
- trauma_adv_007: コンパートメント症候群の確定治療（筋膜切開）
- trauma_adv_008: TEG/ROTEMによる凝固評価
- trauma_adv_009: 頭部外傷+腹腔内出血の輸液戦略
- trauma_adv_010: 外傷性凝固障害のメカニズム（プロテインC活性化）

**`data/questions/trauma_master.json`** — damage control・骨盤骨折
- trauma_mas_001: damage control surgery（DCS）の概念
- trauma_mas_002: 骨盤TAE（血管造影塞栓術）の適応
- trauma_mas_003: 腹部コンパートメント症候群（膀胱内圧≥20mmHg）
- trauma_mas_004: 頭蓋内圧管理の段階的アプローチ
- trauma_mas_005: 外傷後MOF予防（出血・感染制御・早期離床）
- trauma_mas_006: 横紋筋融解症（輸液・尿量モニタリング）
- trauma_mas_007: 外傷性ARDSの肺保護換気
- trauma_mas_008: 脊髄損傷のMAP目標（85〜90mmHg）
- trauma_mas_009: 外傷センター転院基準（GCS14以下等）
- trauma_mas_010: TRALI予防（白血球除去製剤）

**`data/questions/cpr_advanced.json`** — 薬剤・可逆的原因
- cpr_adv_001: 非ショック波形へのアドレナリン投与タイミング
- cpr_adv_002: アミオダロン初回量300mg IV
- cpr_adv_003: 低体温による心停止（体外加温継続）
- cpr_adv_004: 肺塞栓心停止への血栓溶解（60〜90分CPR継続）
- cpr_adv_005: 心タンポナーデPEAへの心嚢穿刺
- cpr_adv_006: 高K血症心停止へのカルシウム製剤
- cpr_adv_007: ROSCの徴候（ETco2急上昇）
- cpr_adv_008: ECPR適応（目撃あり・VF・若年）
- cpr_adv_009: 妊婦心停止の胸骨圧迫（左子宮変位）
- cpr_adv_010: 除細動後の即時CPR再開

**`data/questions/cpr_master.json`** — ECPR・蘇生後管理
- cpr_mas_001: ECPRの適応（目撃・短いno-flow・可逆性・ECMO即応体制）
- cpr_mas_002: PCAS（心停止後症候群）の4要素
- cpr_mas_003: TTM（体温管理）—高体温回避・37度台前半維持
- cpr_mas_004: ROSC後血圧管理（SBP90以上/MAP65以上）
- cpr_mas_005: ROSC後酸素管理（SpO2 94〜99%、正常換気）
- cpr_mas_006: ROSC後冠動脈造影の個別化判断
- cpr_mas_007: 神経予後予測のタイミング（最低72時間以降）
- cpr_mas_008: 持続脳波モニタリング（NCSE検出）
- cpr_mas_009: ウツタイン様式の目的
- cpr_mas_010: ROSC後血糖管理（144〜180mg/dL）

**`data/questions/ed_first_steps_advanced.json`** — トリアージ判断・優先順位
- ed_adv_001: JTASレベル1（蘇生）の定義
- ed_adv_002: Sick or Not Sick（第一印象評価）
- ed_adv_003: 胸痛の緊急5鑑別（ACS・大動脈解離・肺塞栓・緊張性気胸・食道破裂）
- ed_adv_004: 急性腹症のレッドフラッグ（腹膜刺激症状・バイタル不安定）
- ed_adv_005: 気道緊急の状況（声帯浮腫・咽頭膿瘍等）
- ed_adv_006: 敗血症スクリーニング（バイタル＋感染源推定）
- ed_adv_007: 失神の緊急性（運動中・臥位・心疾患既往）
- ed_adv_008: 頭痛のレッドフラッグ（突発最強・神経症状・髄膜刺激）
- ed_adv_009: アナフィラキシーの診断基準（誘因・皮膚粘膜・循環呼吸）
- ed_adv_010: 高齢者救急の特徴（非典型・ポリファーマシー）

**`data/questions/ed_first_steps_master.json`** — 複合外傷・多臓器不全の初期対応
- ed_mas_001: 多発外傷の並行初期対応（気道・出血・神経同時評価）
- ed_mas_002: RSI（迅速導入気管挿管）の準備（薬剤・器材・バックアップ）
- ed_mas_003: ICU転送基準（バイタル不安定・昇圧薬・人工呼吸器）
- ed_mas_004: 救急での鎮痛（診断精度を下げない・患者協力向上）
- ed_mas_005: ECMO前確認事項（可逆性・禁忌・施設能力・インフォームド）
- ed_mas_006: 蘇生室チームコミュニケーション（クローズドループ）
- ed_mas_007: 大量晶質液のみの蘇生を避ける理由（凝固希釈・低体温）
- ed_mas_008: 早期リハビリテーションの根拠（廃用・せん妄予防）
- ed_mas_009: 止血後の目標指向型蘇生指標（乳酸・BE・凝固・尿量）
- ed_mas_010: 終末期患者への蘇生方針（事前指示書・本人意思確認）

**`data/questions/altered_mental_status_advanced.json`** — AIUEOTIPS・初期対応
- alt_adv_001: AIUEOTIPSのT（頭部外傷・体温異常）
- alt_adv_002: チアミン先行投与の理由（Wernicke脳症誘発防止）
- alt_adv_003: GCS8以下の気道管理適応（防御反射消失・誤嚥リスク）
- alt_adv_004: テント切痕ヘルニアの早期徴候（同側瞳孔散大）
- alt_adv_005: 非痙攣性てんかん重積（NCSE）の疑い方
- alt_adv_006: 細菌性髄膜炎の初期対応順序（培養→抗菌薬→CT→腰椎穿刺）
- alt_adv_007: ベンゾジアゼピン過量へのフルマゼニル（依存・痙攣リスクに慎重）
- alt_adv_008: 代謝性脳症の頻度高い原因（低血糖・肝・尿毒症・電解質・薬物）
- alt_adv_009: Wernicke脳症の三徴（意識障害・眼球運動障害・失調）
- alt_adv_010: 緊急頭部CTの適応（突発・外傷・局所神経症状・抗凝固薬）

**`data/questions/altered_mental_status_master.json`** — 脳症・中枢性病変の精査
- alt_mas_001: 自己免疫性脳炎の疑い方（若年・急性精神症状・不随意運動）
- alt_mas_002: 肝性脳症の管理（誘因除去・ラクツロース・リファキシミン）
- alt_mas_003: 急性低Na血症補正の注意点（急速補正→浸透圧性脱髄症候群）
- alt_mas_004: ICUせん妄の管理（非薬物療法優先）
- alt_mas_005: プリオン病の疑い（急速進行認知症・ミオクローヌス・DWI異常）
- alt_mas_006: 脳静脈洞血栓症の診断（MRV/造影MRI）
- alt_mas_007: 橋本脳症の特徴（精神症状・けいれん・ステロイド反応性）
- alt_mas_008: てんかん重積の第一選択薬（ベンゾジアゼピン系）
- alt_mas_009: 持続脳波モニタリングの適応（NCSE診断・治療効果確認）
- alt_mas_010: 意識障害と意識消失の違い（持続vs短時間完全回復）

---

### Task 2: データ設定ファイルの作成・更新

**新規作成: `data/levels.json`**
```json
[
  { "id": "basic",    "name": "Basic" },
  { "id": "advanced", "name": "Advanced" },
  { "id": "master",   "name": "Master" }
]
```

**更新: `data/categories.json`** — 全21エントリーに再構成
- 各エントリーに `"level": "basic"` / `"advanced"` / `"master"` を追加
- 3レベル対応5カテゴリーのIDは `sepsis_basic`, `sepsis_advanced`, `sepsis_master` 形式
- 6カテゴリー（Basicのみ）のIDは `vertigo_stroke_basic` 等に変更、ファイルパスは既存のまま
- `ed_first_steps_basic` → file: `questions/ed_first_steps_basic.json`（新規）
- `altered_mental_status_basic` → file: `questions/altered_mental_status_basic.json`（新規）
- `sepsis_basic` → file: `questions/sepsis.json`（既存ファイルそのまま）
- `trauma_basic` → file: `questions/trauma.json`（既存ファイルそのまま）
- `cpr_basic` → file: `questions/cpr.json`（既存ファイルそのまま）

---

### Task 3: index.html の変更

追加・変更する主要要素:

```html
<!-- 既存topbar-actionsに追加 -->
<button id="clearButton" class="icon-text-button" type="button">クリア記録</button>

<!-- 新規追加: レベル選択画面（最初に表示） -->
<section id="levelScreen" class="screen is-active" aria-labelledby="levelTitle">
  <div class="level-intro">
    <p class="eyebrow">難易度を選んでください</p>
    <h2 id="levelTitle">レベル選択</h2>
  </div>
  <div id="levelGrid" class="level-grid"></div>
</section>

<!-- setupScreen の is-active を外し hidden を追加 -->
<!-- setupScreen 内の category-section 上部に「戻る」ボタンを追加 -->
<button id="backToLevelButton" class="text-button" type="button">← レベル選択へ</button>

<!-- 結果画面 result-panel 内に CLEAR バナー追加（score表示の直後） -->
<div id="clearBanner" class="clear-banner" hidden>
  <span>👑 CLEAR!</span>
</div>

<!-- 新規追加: クリア記録画面 -->
<section id="clearScreen" class="screen" aria-labelledby="clearTitle" hidden>
  <div class="section-heading">
    <div>
      <p class="eyebrow">Clear History</p>
      <h2 id="clearTitle">クリア記録</h2>
    </div>
    <button id="closeClearButton" class="text-button" type="button">閉じる</button>
  </div>
  <div id="clearTabs" class="tab-row" role="tablist"></div>
  <div id="clearList" class="clear-list"></div>
</section>
```

---

### Task 4: js/app.js の変更

#### 4-a: state・定数の追加
```javascript
const state = {
  // 既存フィールドはそのまま...
  levels: [],            // data/levels.json から読み込む
  selectedLevel: "basic", // 選択中のレベル
};
```

#### 4-b: readStore / writeStore の更新
```javascript
function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      learnerRoleId: parsed.learnerRoleId || "",
      learnerRoleName: parsed.learnerRoleName || "",
      muted: Boolean(parsed.muted),
      selectedLevel: parsed.selectedLevel || "basic",
      rankings: Array.isArray(parsed.rankings) ? parsed.rankings : [],
      clears: (parsed.clears && typeof parsed.clears === "object") ? parsed.clears : {},
    };
  } catch {
    return { learnerRoleId: "", learnerRoleName: "", muted: false, selectedLevel: "basic", rankings: [], clears: {} };
  }
}
```

#### 4-c: loadQuestionData の更新（levels.jsonも読む）
```javascript
async function loadQuestionData() {
  const [levelsRes, categoriesRes] = await Promise.all([
    fetch("data/levels.json", { cache: "no-store" }),
    fetch("data/categories.json", { cache: "no-store" }),
  ]);
  state.levels = await levelsRes.json();
  state.categories = await categoriesRes.json();

  await Promise.all(
    state.categories
      .filter((c) => !c.comingSoon)
      .map(async (category) => {
        const res = await fetch(`data/${category.file}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${category.file} ${res.status}`);
        const data = await res.json();
        state.questionBank.set(category.id, data.questions);
        category.questionTotal = data.questions.length;
      }),
  );
}
```

#### 4-d: init() の変更（最初にlevelScreenを表示）
```javascript
async function init() {
  cacheElements();
  loadStoredState(); // selectedLevel も復元
  bindEvents();
  bindFirstAudioGesture();
  setupTimerArc();

  try {
    await loadAppConfig();
    await loadQuestionData();
    renderLevelScreen();        // ← 新規
    renderRankingTabs();
    updateStartButtonState();
  } catch (error) {
    els.setupStatus.textContent = "問題データを読み込めません。ローカルHTTPサーバーで開いてください。";
    console.error(error);
  }
}
```

#### 4-e: 新規関数

**renderLevelScreen()** — レベルカードを生成
- 各レベルのクリア済みカテゴリー数を表示（例: `3 / 11 クリア済み`）
- カードクリック → `state.selectedLevel = level.id` → `showScreen("setup")` → `renderCategories()` → `updateSetupSummary()`

**renderCategories()** の変更
- `state.categories.filter(c => c.level === state.selectedLevel)` で絞り込み
- `c.comingSoon === true` のカードは disabled + "準備中" グレー表示
- `isClear(category.id)` が true のカードに `is-cleared` クラス + 「CLEAR」バッジを追加

**isClear(categoryId)** — Clear判定
```javascript
function isClear(categoryId) {
  const key = `${state.selectedLevel}:${categoryId}`;
  return Boolean(readStore().clears[key]);
}
```

**saveClear(categoryId)** — Clear記録保存
```javascript
function saveClear(categoryId) {
  const key = `${state.selectedLevel}:${categoryId}`;
  const data = readStore();
  if (!data.clears[key]) {
    data.clears[key] = new Date().toISOString();
    writeStore(data);
  }
}
```

**finishQuiz()** の変更
```javascript
function finishQuiz() {
  // 既存処理...
  const isCleared = state.score === state.quizQuestions.length;
  if (isCleared) saveClear(category.id);
  renderResult(result, isCleared);
  // ...
}
```

**renderResult(result, isCleared)** の変更
- `els.clearBanner.hidden = !isCleared` を追加

**renderClearScreen()** — クリア記録画面を生成
- `clearTabs` にBasic/Advanced/Masterのタブを生成
- 選択タブのカテゴリー一覧を `clearList` に表示
- クリア済みに ✓ と日時、未クリアは空欄

**showScreen()** の変更
- `["setup", "quiz", "result", "ranking", "level", "clear"]` の6画面に対応
- `"level"` の場合は `startOpeningMusic()` も呼ぶ

**isSetupScreenVisible()** の変更
- setupScreen だけでなく levelScreen も含めて音楽継続

**bindEvents()** への追加
```javascript
els.backToLevelButton.addEventListener("click", () => showScreen("level"));
els.clearButton.addEventListener("click", () => { renderClearScreen(); showScreen("clear"); });
els.closeClearButton.addEventListener("click", () => showScreen(state.lastScreen === "clear" ? "level" : state.lastScreen));
```

**loadStoredState()** への追加
```javascript
state.selectedLevel = data.selectedLevel || "basic";
```

**cacheElements()** に追加するID一覧:
- `levelScreen`, `levelGrid`, `clearBanner`, `clearScreen`, `clearTabs`, `clearList`, `backToLevelButton`, `clearButton`, `closeClearButton`

---

### Task 5: css/style.css の追加スタイル

```css
/* レベル選択画面 */
.level-intro { margin-bottom: 20px; }
.level-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 480px;
  margin: 0 auto;
}
.level-card {
  background: var(--surface);
  border: 2px solid var(--line);
  border-radius: 12px;
  padding: 20px 24px;
  cursor: pointer;
  text-align: left;
  transition: border-color 180ms, box-shadow 180ms;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.level-card:hover { border-color: var(--primary); box-shadow: var(--shadow-sharp); }
.level-card__name { font-size: 1.3rem; font-weight: 700; color: var(--primary); }
.level-card__clear { font-size: 0.85rem; color: var(--muted); }

/* CLEARバッジ */
.category-card.is-cleared { border-top-width: 3px; }
.clear-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--success);
  background: rgba(24, 122, 72, 0.1);
  border-radius: 4px;
  padding: 2px 6px;
  margin-top: 4px;
}

/* CLEARバナー（結果画面） */
.clear-banner {
  background: linear-gradient(135deg, #187a48, #0f5c37);
  color: white;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  margin: 12px 0;
  letter-spacing: 0.05em;
}

/* クリア記録画面 */
.clear-list { margin-top: 16px; }
.clear-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid var(--line);
  font-size: 0.9rem;
}
.clear-item__name { color: var(--text); }
.clear-item__status { color: var(--success); font-weight: 600; }
.clear-item__date { color: var(--muted); font-size: 0.8rem; }

/* 準備中カード */
.category-card.is-coming-soon {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## ファイル変更一覧（完全リスト）

| 操作 | ファイルパス |
|---|---|
| 新規作成 | `data/levels.json` |
| 更新 | `data/categories.json`（全面再構成） |
| 新規作成 | `data/questions/ed_first_steps_basic.json` |
| 新規作成 | `data/questions/ed_first_steps_advanced.json` |
| 新規作成 | `data/questions/ed_first_steps_master.json` |
| 新規作成 | `data/questions/altered_mental_status_basic.json` |
| 新規作成 | `data/questions/altered_mental_status_advanced.json` |
| 新規作成 | `data/questions/altered_mental_status_master.json` |
| 新規作成 | `data/questions/sepsis_advanced.json` |
| 新規作成 | `data/questions/sepsis_master.json` |
| 新規作成 | `data/questions/trauma_advanced.json` |
| 新規作成 | `data/questions/trauma_master.json` |
| 新規作成 | `data/questions/cpr_advanced.json` |
| 新規作成 | `data/questions/cpr_master.json` |
| 更新 | `index.html` |
| 更新 | `js/app.js` |
| 更新 | `css/style.css` |
| 変更なし | `data/questions/sepsis.json`（→ sepsis_basic として参照） |
| 変更なし | `data/questions/trauma.json`（→ trauma_basic として参照） |
| 変更なし | `data/questions/cpr.json`（→ cpr_basic として参照） |
| 変更なし | `data/questions/vertigo_stroke.json` 他6ファイル |

---

## 次セッションでの作業手順

1. このファイル（`docs/superpowers/HANDOFF.md`）を読む
2. 設計仕様書（`docs/superpowers/specs/2026-04-29-difficulty-levels-design.md`）を確認
3. 上記タスクに従って実装計画書を作成（`docs/superpowers/plans/` に保存）
4. `superpowers:subagent-driven-development` スキルで実装を実行
5. ローカルで動作確認後、`git push origin main` でGitHub Pagesに反映

---

## 補足情報

### よく使うコマンド
```powershell
# ローカルサーバー起動（ブラウザも自動で開く）
.\Quiz-TKHER起動.cmd

# GitHubにpush
cd C:\Users\shin0\Documents\GitHub\APPT
git push origin main
```

### localStorage のキー
- キー名: `qqq_state_v1`
- Clearキー形式: `"basic:sepsis_basic"`, `"advanced:trauma_advanced"` など

### ブランチ
- メインブランチ: `main`（直接コミット可）
- GitHub Pages: `main` ブランチのルートを配信中
