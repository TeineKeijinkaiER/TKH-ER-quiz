# エントリーレベル新設 — 設計仕様書

**日付:** 2026-05-16  
**対象リポジトリ:** TKH-ER-Quiz  

---

## 1. 概要

ベーシックレベルが難しすぎるという意見を受け、より易しい **エントリーレベル** を新設する。  
あわせて、ベーシックレベルの「救急外来まずはここから（ed_first_steps_basic）」カテゴリーを廃止し、含まれる10問をエントリーレベルへ移行する。

---

## 2. レベル構造の変更

### levels.json（変更後）

```json
[
  { "id": "entry",    "name": "Entry"    },
  { "id": "basic",    "name": "Basic"    },
  { "id": "advanced", "name": "Advanced" },
  { "id": "master",   "name": "Master"   }
]
```

エントリーは最も易しいレベルとして先頭に配置する。

---

## 3. エントリーレベルのカテゴリー構成

### 3-1. カテゴリー一覧（15カテゴリー × 各5問）

| カテゴリーID（entry） | 日本語名 | 英語名 | accent |
|---|---|---|---|
| ed_first_steps_entry | 救急外来まずはここから | ER First Steps | #087f8c |
| altered_mental_status_entry | 意識障害/意識消失 | Altered Mental Status / Syncope | #4f46e5 |
| vertigo_stroke_entry | めまい/脳卒中 | Vertigo / Stroke | #0f766e |
| orthopedic_trauma_entry | 整形外傷 | Orthopedic Trauma | #b45309 |
| infection_entry | 感染症 | Infectious Diseases | #15803d |
| gi_symptoms_entry | 消化器症状 | GI Symptoms | #be123c |
| emergency_medications_entry | 救急外来薬剤投与 | Emergency Medications | #7c2d12 |
| sepsis_entry | 敗血症 | Sepsis | #087f8c |
| trauma_entry | 重症外傷 | Major Trauma | #b45309 |
| endocrine_entry | 内分泌救急 | Endocrine Emergencies | #6d5bd0 |
| cpr_entry | 心肺蘇生 | CPR / Cardiac Arrest | #c2413b |
| pediatric_entry | 小児救急 | Pediatric Emergencies | #c2413b |
| cardiology_entry | 循環器救急 | Cardiology Emergencies | #c2413b |
| toxicology_entry | 中毒 | Toxicology | #5f2d91 |
| general_em_entry | 救急医学全般 | General Emergency Medicine | #1d4ed8 |

### 3-2. description（日本語）

| カテゴリーID | description |
|---|---|
| ed_first_steps_entry | ERの基本姿勢とコミュニケーション |
| altered_mental_status_entry | 意識障害の基本的な原因と初期アプローチ |
| vertigo_stroke_entry | めまい・脳卒中の基本概念と初期対応 |
| orthopedic_trauma_entry | 骨折・外傷の基本評価 |
| infection_entry | 感染症の基本概念と抗菌薬の考え方 |
| gi_symptoms_entry | 腹痛・消化器症状の基本的な鑑別 |
| emergency_medications_entry | 救急でよく使う薬剤の基本知識 |
| sepsis_entry | 敗血症の基本的な認識と初期対応 |
| trauma_entry | 外傷初期評価の基本（ABCDE） |
| endocrine_entry | DKA・低血糖など内分泌救急の基本 |
| cpr_entry | 心肺蘇生の基本手順と優先順位 |
| pediatric_entry | 小児救急の基本的な特徴と対応 |
| cardiology_entry | 不整脈・ACSの基本概念 |
| toxicology_entry | 主要な中毒と基本的な対応 |
| general_em_entry | 救急外来の基本的な評価と対応 |

### 3-3. description（英語）

| カテゴリーID | description |
|---|---|
| ed_first_steps_entry | Basic ER approach and communication |
| altered_mental_status_entry | Basic causes and initial approach to altered mental status |
| vertigo_stroke_entry | Fundamentals of vertigo and stroke management |
| orthopedic_trauma_entry | Basic assessment of fractures and trauma |
| infection_entry | Infection fundamentals and antibiotic principles |
| gi_symptoms_entry | Basic differential for abdominal pain and GI symptoms |
| emergency_medications_entry | Essential knowledge of common emergency medications |
| sepsis_entry | Basic recognition and initial management of sepsis |
| trauma_entry | Fundamentals of trauma primary survey (ABCDE) |
| endocrine_entry | DKA, hypoglycemia, and basic endocrine emergencies |
| cpr_entry | CPR fundamentals and priorities |
| pediatric_entry | Basic features and management of pediatric emergencies |
| cardiology_entry | Fundamentals of arrhythmias and ACS |
| toxicology_entry | Common toxidromes and basic management |
| general_em_entry | Basic evaluation and management in the ED |

---

## 4. ed_first_steps_basic 10問の移行先

既存の `ed_first_steps_basic.json` に含まれる10問を以下の通りエントリーカテゴリーへ移行する。  
移行した問題は各カテゴリーの5問枠にカウントされる。

| 既存問題ID | 内容概要 | 移行先エントリーカテゴリー |
|---|---|---|
| ed_first_steps_001 | ERチームワーク・コミュニケーション | ed_first_steps_entry |
| ed_first_steps_002 | 超音波検査のマナー・注意事項 | ed_first_steps_entry |
| ed_first_steps_003 | 喘息小発作の初期治療 | general_em_entry |
| ed_first_steps_004 | ノルアドレナリン希釈・投与計算 | emergency_medications_entry |
| ed_first_steps_005 | 高齢者肺炎・家族説明・ACP | ed_first_steps_entry |
| ed_first_steps_006 | 挿管の準備（チューブサイズ） | cpr_entry |
| ed_first_steps_007 | 心停止ホットライン確認事項 | cpr_entry |
| ed_first_steps_008 | ROSC後の対応 | cpr_entry |
| ed_first_steps_009 | 外傷一次評価・FAST の限界 | trauma_entry |
| ed_first_steps_010 | 薬剤処方（ST合剤の妊婦禁忌） | emergency_medications_entry |

**問題IDの扱い:**  
- 移行時に問題IDを変更しない（`ed_first_steps_001` のまま使用）  
- 各問題のJSONに `"level": "entry"` 相当の分類はファイル配置で示す

### 移行後の各カテゴリーの内訳

| カテゴリー | 移行問題数 | 新規作成数 | 合計 |
|---|---|---|---|
| ed_first_steps_entry | 3問（001,002,005） | 2問 | 5問 |
| cpr_entry | 3問（006,007,008） | 2問 | 5問 |
| emergency_medications_entry | 2問（004,010） | 3問 | 5問 |
| trauma_entry | 1問（009） | 4問 | 5問 |
| general_em_entry | 1問（003） | 4問 | 5問 |
| その他10カテゴリー | 0問 | 5問 | 5問 |

---

## 5. ファイル構成

### 新規作成ファイル

```
data/questions/ja/entry/
  altered_mental_status_entry.json
  cardiology_entry.json
  cpr_entry.json
  ed_first_steps_entry.json
  emergency_medications_entry.json
  endocrine_entry.json
  general_em_entry.json
  gi_symptoms_entry.json
  infection_entry.json
  orthopedic_trauma_entry.json
  pediatric_entry.json
  sepsis_entry.json
  toxicology_entry.json
  trauma_entry.json
  vertigo_stroke_entry.json

data/questions/en/entry/
  （上記と同名の15ファイル）
```

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `data/levels.json` | `entry` を先頭に追加 |
| `data/categories.ja.json` | エントリーカテゴリー15件を追加、`ed_first_steps_basic` エントリーを削除 |
| `data/categories.en.json` | 同上 |

### ユーザーが手動で実施（git操作）

- `data/questions/ja/basic/ed_first_steps_basic.json` の削除
- `data/questions/en/basic/ed_first_steps_basic.json` の削除

---

## 6. 問題フォーマット（既存に準拠）

```json
{
  "category": "カテゴリー名",
  "questions": [
    {
      "id": "{category_name}_entry_{3桁番号}",
      "question": "問題文",
      "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "answers": [0],
      "explanation": "解説文",
      "selectCount": 1
    }
  ]
}
```

---

## 7. エントリーレベル問題の難易度指針

ベーシックレベルから **一段階イージー** にした基準：

| 項目 | ベーシック | エントリー |
|---|---|---|
| 選択肢数 | 5択が多い | **4択固定** |
| 正解数 | 1問または複数選択あり | **1問のみ（single answer）** |
| 薬剤計算 | あり（希釈・投与速度） | **なし** |
| 臨床シナリオ | 具体的な数値・状況設定 | **簡潔な状況設定 or 概念問題** |
| 選択肢の質 | 鑑別を要するトリッキーな選択肢あり | **どれも臨床的に妥当に見えるが明確な正解がある** |
| 問われる内容 | 判断・計算・適応 | **概念・原則・基本手順** |

---

## 8. ベーシックレベルの変更

- `categories.ja.json` / `categories.en.json` から `ed_first_steps_basic` を削除
- `levels.json` の `basic` 定義は変更なし
- ベーシックレベルのカテゴリー数：15 → 14

---

## 9. スコープ外（今回対象外）

- `localStorage` スキーマの変更（既存の `schemaVersion: 2` を維持）
- UIでのレベル説明文・アイコンの追加
- エントリーレベル専用のUI調整
- `data/updates.json` へのリリースノート追記
