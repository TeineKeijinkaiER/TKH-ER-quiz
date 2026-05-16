# Entry Level Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Entry" difficulty level with 15 categories × 5 questions each (JA + EN), migrating 10 existing ed_first_steps_basic questions into appropriate entry categories and removing the ed_first_steps_basic category from basic level.

**Architecture:** Pure data changes — new JSON files under `data/questions/{ja,en}/entry/`, updates to `data/levels.json` and both `categories.*.json` files. No JS changes required.

**Tech Stack:** JSON data files, static site.

---

## Task 1: Create directories + update levels.json

**Files:**
- Modify: `data/levels.json`
- Create dirs: `data/questions/ja/entry/`, `data/questions/en/entry/`

- [ ] **Step 1: Create entry question directories**

```
data/questions/ja/entry/   (new directory)
data/questions/en/entry/   (new directory)
```

- [ ] **Step 2: Overwrite data/levels.json**

```json
[
  {
    "id": "entry",
    "name": "Entry"
  },
  {
    "id": "basic",
    "name": "Basic"
  },
  {
    "id": "advanced",
    "name": "Advanced"
  },
  {
    "id": "master",
    "name": "Master"
  }
]
```

- [ ] **Step 3: Verify**

Open the app in a browser. The level selector should now show Entry / Basic / Advanced / Master. Entry will have no categories yet — that's expected.

---

## Task 2: Update data/categories.ja.json

**Files:**
- Modify: `data/categories.ja.json`

Remove the `ed_first_steps_basic` object and prepend 15 entry-level category objects.

- [ ] **Step 1: Replace full file content**

```json
[
  {
    "id": "ed_first_steps_entry",
    "level": "entry",
    "name": "救急外来まずはここから",
    "description": "ERの基本姿勢とコミュニケーション",
    "file": "questions/ja/entry/ed_first_steps_entry.json",
    "accent": "#087f8c"
  },
  {
    "id": "altered_mental_status_entry",
    "level": "entry",
    "name": "意識障害/意識消失",
    "description": "意識障害の基本的な原因と初期アプローチ",
    "file": "questions/ja/entry/altered_mental_status_entry.json",
    "accent": "#4f46e5"
  },
  {
    "id": "vertigo_stroke_entry",
    "level": "entry",
    "name": "めまい/脳卒中",
    "description": "めまい・脳卒中の基本概念と初期対応",
    "file": "questions/ja/entry/vertigo_stroke_entry.json",
    "accent": "#0f766e"
  },
  {
    "id": "orthopedic_trauma_entry",
    "level": "entry",
    "name": "整形外傷",
    "description": "骨折・外傷の基本評価",
    "file": "questions/ja/entry/orthopedic_trauma_entry.json",
    "accent": "#b45309"
  },
  {
    "id": "infection_entry",
    "level": "entry",
    "name": "感染症",
    "description": "感染症の基本概念と抗菌薬の考え方",
    "file": "questions/ja/entry/infection_entry.json",
    "accent": "#15803d"
  },
  {
    "id": "gi_symptoms_entry",
    "level": "entry",
    "name": "消化器症状",
    "description": "腹痛・消化器症状の基本的な鑑別",
    "file": "questions/ja/entry/gi_symptoms_entry.json",
    "accent": "#be123c"
  },
  {
    "id": "emergency_medications_entry",
    "level": "entry",
    "name": "救急外来薬剤投与",
    "description": "救急でよく使う薬剤の基本知識",
    "file": "questions/ja/entry/emergency_medications_entry.json",
    "accent": "#7c2d12"
  },
  {
    "id": "sepsis_entry",
    "level": "entry",
    "name": "敗血症",
    "description": "敗血症の基本的な認識と初期対応",
    "file": "questions/ja/entry/sepsis_entry.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_entry",
    "level": "entry",
    "name": "重症外傷",
    "description": "外傷初期評価の基本（ABCDE）",
    "file": "questions/ja/entry/trauma_entry.json",
    "accent": "#b45309"
  },
  {
    "id": "endocrine_entry",
    "level": "entry",
    "name": "内分泌救急",
    "description": "DKA・低血糖など内分泌救急の基本",
    "file": "questions/ja/entry/endocrine_entry.json",
    "accent": "#6d5bd0"
  },
  {
    "id": "cpr_entry",
    "level": "entry",
    "name": "心肺蘇生",
    "description": "心肺蘇生の基本手順と優先順位",
    "file": "questions/ja/entry/cpr_entry.json",
    "accent": "#c2413b"
  },
  {
    "id": "pediatric_entry",
    "level": "entry",
    "name": "小児救急",
    "description": "小児救急の基本的な特徴と対応",
    "file": "questions/ja/entry/pediatric_entry.json",
    "accent": "#c2413b"
  },
  {
    "id": "cardiology_entry",
    "level": "entry",
    "name": "循環器救急",
    "description": "不整脈・ACSの基本概念",
    "file": "questions/ja/entry/cardiology_entry.json",
    "accent": "#c2413b"
  },
  {
    "id": "toxicology_entry",
    "level": "entry",
    "name": "中毒",
    "description": "主要な中毒と基本的な対応",
    "file": "questions/ja/entry/toxicology_entry.json",
    "accent": "#5f2d91"
  },
  {
    "id": "general_em_entry",
    "level": "entry",
    "name": "救急医学全般",
    "description": "救急外来の基本的な評価と対応",
    "file": "questions/ja/entry/general_em_entry.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "altered_mental_status_basic",
    "level": "basic",
    "name": "意識障害/意識消失",
    "description": "低血糖、けいれん、失神、初期鑑別",
    "file": "questions/ja/basic/altered_mental_status_basic.json",
    "accent": "#4f46e5"
  },
  {
    "id": "vertigo_stroke_basic",
    "level": "basic",
    "name": "めまい/脳卒中",
    "description": "中枢性めまい、脳卒中初期対応、HINTS",
    "file": "questions/ja/basic/vertigo_stroke_basic.json",
    "accent": "#0f766e"
  },
  {
    "id": "orthopedic_trauma_basic",
    "level": "basic",
    "name": "整形外傷",
    "description": "開放骨折、コンパートメント、神経血管評価",
    "file": "questions/ja/basic/orthopedic_trauma_basic.json",
    "accent": "#b45309"
  },
  {
    "id": "infection_basic",
    "level": "basic",
    "name": "感染症",
    "description": "抗菌薬適正使用、髄膜炎、尿路感染、壊死性筋膜炎",
    "file": "questions/ja/basic/infection_basic.json",
    "accent": "#15803d"
  },
  {
    "id": "gi_symptoms_basic",
    "level": "basic",
    "name": "消化器症状",
    "description": "腹痛、消化管出血、胆道感染、膵炎",
    "file": "questions/ja/basic/gi_symptoms_basic.json",
    "accent": "#be123c"
  },
  {
    "id": "emergency_medications_basic",
    "level": "basic",
    "name": "救急外来薬剤投与",
    "description": "アドレナリン、ベンゾジアゼピン、解毒、電解質補正",
    "file": "questions/ja/basic/emergency_medications_basic.json",
    "accent": "#7c2d12"
  },
  {
    "id": "sepsis_basic",
    "level": "basic",
    "name": "敗血症",
    "description": "初期認識、抗菌薬、循環管理、ソースコントロール",
    "file": "questions/ja/basic/sepsis_basic.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_basic",
    "level": "basic",
    "name": "重症外傷",
    "description": "Primary survey、出血制御、胸腹部外傷、蘇生戦略",
    "file": "questions/ja/basic/trauma_basic.json",
    "accent": "#b45309"
  },
  {
    "id": "endocrine_basic",
    "level": "basic",
    "name": "内分泌救急",
    "description": "DKA/HHS、副腎クリーゼ、甲状腺クリーゼ、電解質",
    "file": "questions/ja/basic/endocrine_basic.json",
    "accent": "#6d5bd0"
  },
  {
    "id": "cpr_basic",
    "level": "basic",
    "name": "心肺蘇生",
    "description": "高品質CPR、除細動、薬剤、可逆的原因",
    "file": "questions/ja/basic/cpr_basic.json",
    "accent": "#c2413b"
  },
  {
    "id": "pediatric_basic",
    "level": "basic",
    "name": "小児救急",
    "description": "小児の緊急医療対応、薬剤投与、蘇生戦略",
    "file": "questions/ja/basic/pediatric_basic.json",
    "accent": "#c2413b"
  },
  {
    "id": "cardiology_basic",
    "level": "basic",
    "name": "循環器救急",
    "description": "循環器疾患の救急対応",
    "file": "questions/ja/basic/cardiology_basic.json",
    "accent": "#c2413b"
  },
  {
    "id": "toxicology_basic",
    "level": "basic",
    "name": "中毒",
    "description": "中毒の初期対応、解毒薬、主要中毒物質",
    "file": "questions/ja/basic/toxicology_basic.json",
    "accent": "#5f2d91"
  },
  {
    "id": "general_em_basic",
    "level": "basic",
    "name": "救急医学全般",
    "description": "BLS、一次評価、トリアージ、基本的ER対応",
    "file": "questions/ja/basic/general_em_basic.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "altered_mental_status_advanced",
    "level": "advanced",
    "name": "意識障害/意識消失",
    "description": "AIUEOTIPS、気道管理適応、Wernicke脳症、NCSE",
    "file": "questions/ja/advanced/altered_mental_status_advanced.json",
    "accent": "#4f46e5"
  },
  {
    "id": "sepsis_advanced",
    "level": "advanced",
    "name": "敗血症",
    "description": "輸液反応性、乳酸値、バソプレシン、SOFA",
    "file": "questions/ja/advanced/sepsis_advanced.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_advanced",
    "level": "advanced",
    "name": "重症外傷",
    "description": "MTP、止血蘇生、死の三徴、REBOA、TEG",
    "file": "questions/ja/advanced/trauma_advanced.json",
    "accent": "#b45309"
  },
  {
    "id": "cpr_advanced",
    "level": "advanced",
    "name": "心肺蘇生",
    "description": "アドレナリン、アミオダロン、可逆的原因、ECPR適応",
    "file": "questions/ja/advanced/cpr_advanced.json",
    "accent": "#c2413b"
  },
  {
    "id": "toxicology_advanced",
    "level": "advanced",
    "name": "中毒",
    "description": "三環系抗うつ薬、カルシウム拮抗薬、有機リン中毒の高度管理",
    "file": "questions/ja/advanced/toxicology_advanced.json",
    "accent": "#5f2d91"
  },
  {
    "id": "general_em_advanced",
    "level": "advanced",
    "name": "救急医学全般",
    "description": "RSI、ショック管理、急性期対応の応用",
    "file": "questions/ja/advanced/general_em_advanced.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "cardiology_advanced",
    "level": "advanced",
    "name": "循環器救急",
    "description": "頻脈、徐脈、QT延長、ペーシングなどの応用対応",
    "file": "questions/ja/advanced/cardiology_advanced.json",
    "accent": "#c2413b"
  },
  {
    "id": "infection_advanced",
    "level": "advanced",
    "name": "感染症",
    "description": "髄膜炎、帯状疱疹、公衆衛生対応などの応用",
    "file": "questions/ja/advanced/infection_advanced.json",
    "accent": "#15803d"
  },
  {
    "id": "pediatric_advanced",
    "level": "advanced",
    "name": "小児救急",
    "description": "小児アナフィラキシーなどの応用対応",
    "file": "questions/ja/advanced/pediatric_advanced.json",
    "accent": "#c2413b"
  },
  {
    "id": "obstetrics_advanced",
    "level": "advanced",
    "name": "産婦人科救急",
    "description": "分娩後出血、産科救急薬剤、母体急変対応",
    "file": "questions/ja/advanced/obstetrics_advanced.json",
    "accent": "#be123c"
  },
  {
    "id": "vertigo_stroke_advanced",
    "level": "advanced",
    "name": "めまい/脳卒中",
    "description": "中枢性めまい、脳幹病変、HINTSの応用",
    "file": "questions/ja/advanced/vertigo_stroke_advanced.json",
    "accent": "#0f766e"
  },
  {
    "id": "sepsis_master",
    "level": "master",
    "name": "敗血症",
    "description": "ステロイド、CRRT、肺保護換気、DIC、VTE予防",
    "file": "questions/ja/master/sepsis_master.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_master",
    "level": "master",
    "name": "重症外傷",
    "description": "DCS、骨盤TAE、腹部ACS、ICP管理、TRALI",
    "file": "questions/ja/master/trauma_master.json",
    "accent": "#b45309"
  },
  {
    "id": "cpr_master",
    "level": "master",
    "name": "心肺蘇生",
    "description": "ECPR、PCAS、TTM、神経予後予測、持続脳波",
    "file": "questions/ja/master/cpr_master.json",
    "accent": "#c2413b"
  },
  {
    "id": "general_em_master",
    "level": "master",
    "name": "救急医学全般",
    "description": "肺保護換気、ECPR、超急性期集中治療",
    "file": "questions/ja/master/general_em_master.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "critical_care_master",
    "level": "master",
    "name": "集中治療",
    "description": "ARDS、人工呼吸、SBT、腹腔内圧などの専門管理",
    "file": "questions/ja/master/critical_care_master.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "toxicology_master",
    "level": "master",
    "name": "中毒",
    "description": "腐食性物質、咬刺傷、化学曝露、解毒薬の専門対応",
    "file": "questions/ja/master/toxicology_master.json",
    "accent": "#5f2d91"
  },
  {
    "id": "disaster_master",
    "level": "master",
    "name": "災害医療",
    "description": "化学災害、ゾーニング、除染、爆傷対応",
    "file": "questions/ja/master/disaster_master.json",
    "accent": "#7c2d12"
  },
  {
    "id": "environmental_master",
    "level": "master",
    "name": "環境救急",
    "description": "潜水障害、低体温症などの特殊環境救急",
    "file": "questions/ja/master/environmental_master.json",
    "accent": "#087f8c"
  }
]
```

- [ ] **Step 2: Verify** — open the app, click Entry level, confirm 15 category cards appear (all show 0/5 since files don't exist yet).

---

## Task 3: Update data/categories.en.json

**Files:**
- Modify: `data/categories.en.json`

- [ ] **Step 1: Replace full file content**

```json
[
  {
    "id": "ed_first_steps_entry",
    "level": "entry",
    "name": "ER First Steps",
    "description": "Basic ER approach and communication",
    "file": "questions/en/entry/ed_first_steps_entry.json",
    "accent": "#087f8c"
  },
  {
    "id": "altered_mental_status_entry",
    "level": "entry",
    "name": "Altered Mental Status / Syncope",
    "description": "Basic causes and initial approach to altered mental status",
    "file": "questions/en/entry/altered_mental_status_entry.json",
    "accent": "#4f46e5"
  },
  {
    "id": "vertigo_stroke_entry",
    "level": "entry",
    "name": "Vertigo / Stroke",
    "description": "Fundamentals of vertigo and stroke management",
    "file": "questions/en/entry/vertigo_stroke_entry.json",
    "accent": "#0f766e"
  },
  {
    "id": "orthopedic_trauma_entry",
    "level": "entry",
    "name": "Orthopedic Trauma",
    "description": "Basic assessment of fractures and trauma",
    "file": "questions/en/entry/orthopedic_trauma_entry.json",
    "accent": "#b45309"
  },
  {
    "id": "infection_entry",
    "level": "entry",
    "name": "Infectious Diseases",
    "description": "Infection fundamentals and antibiotic principles",
    "file": "questions/en/entry/infection_entry.json",
    "accent": "#15803d"
  },
  {
    "id": "gi_symptoms_entry",
    "level": "entry",
    "name": "GI Symptoms",
    "description": "Basic differential for abdominal pain and GI symptoms",
    "file": "questions/en/entry/gi_symptoms_entry.json",
    "accent": "#be123c"
  },
  {
    "id": "emergency_medications_entry",
    "level": "entry",
    "name": "Emergency Medications",
    "description": "Essential knowledge of common emergency medications",
    "file": "questions/en/entry/emergency_medications_entry.json",
    "accent": "#7c2d12"
  },
  {
    "id": "sepsis_entry",
    "level": "entry",
    "name": "Sepsis",
    "description": "Basic recognition and initial management of sepsis",
    "file": "questions/en/entry/sepsis_entry.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_entry",
    "level": "entry",
    "name": "Major Trauma",
    "description": "Fundamentals of trauma primary survey (ABCDE)",
    "file": "questions/en/entry/trauma_entry.json",
    "accent": "#b45309"
  },
  {
    "id": "endocrine_entry",
    "level": "entry",
    "name": "Endocrine Emergencies",
    "description": "DKA, hypoglycemia, and basic endocrine emergencies",
    "file": "questions/en/entry/endocrine_entry.json",
    "accent": "#6d5bd0"
  },
  {
    "id": "cpr_entry",
    "level": "entry",
    "name": "CPR / Cardiac Arrest",
    "description": "CPR fundamentals and priorities",
    "file": "questions/en/entry/cpr_entry.json",
    "accent": "#c2413b"
  },
  {
    "id": "pediatric_entry",
    "level": "entry",
    "name": "Pediatric Emergencies",
    "description": "Basic features and management of pediatric emergencies",
    "file": "questions/en/entry/pediatric_entry.json",
    "accent": "#c2413b"
  },
  {
    "id": "cardiology_entry",
    "level": "entry",
    "name": "Cardiology Emergencies",
    "description": "Fundamentals of arrhythmias and ACS",
    "file": "questions/en/entry/cardiology_entry.json",
    "accent": "#c2413b"
  },
  {
    "id": "toxicology_entry",
    "level": "entry",
    "name": "Toxicology",
    "description": "Common toxidromes and basic management",
    "file": "questions/en/entry/toxicology_entry.json",
    "accent": "#5f2d91"
  },
  {
    "id": "general_em_entry",
    "level": "entry",
    "name": "General Emergency Medicine",
    "description": "Basic evaluation and management in the ED",
    "file": "questions/en/entry/general_em_entry.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "altered_mental_status_basic",
    "level": "basic",
    "name": "Altered Mental Status / Syncope",
    "description": "Hypoglycemia, seizures, syncope, initial differentials",
    "file": "questions/en/basic/altered_mental_status_basic.json",
    "accent": "#4f46e5"
  },
  {
    "id": "vertigo_stroke_basic",
    "level": "basic",
    "name": "Vertigo / Stroke",
    "description": "Central vertigo, stroke initial management, HINTS",
    "file": "questions/en/basic/vertigo_stroke_basic.json",
    "accent": "#0f766e"
  },
  {
    "id": "orthopedic_trauma_basic",
    "level": "basic",
    "name": "Orthopedic Trauma",
    "description": "Open fractures, compartment syndrome, neurovascular assessment",
    "file": "questions/en/basic/orthopedic_trauma_basic.json",
    "accent": "#b45309"
  },
  {
    "id": "infection_basic",
    "level": "basic",
    "name": "Infectious Diseases",
    "description": "Antibiotic stewardship, meningitis, UTI, necrotizing fasciitis",
    "file": "questions/en/basic/infection_basic.json",
    "accent": "#15803d"
  },
  {
    "id": "gi_symptoms_basic",
    "level": "basic",
    "name": "GI Symptoms",
    "description": "Abdominal pain, GI bleeding, biliary infection, pancreatitis",
    "file": "questions/en/basic/gi_symptoms_basic.json",
    "accent": "#be123c"
  },
  {
    "id": "emergency_medications_basic",
    "level": "basic",
    "name": "Emergency Medications",
    "description": "Epinephrine, benzodiazepines, antidotes, electrolyte correction",
    "file": "questions/en/basic/emergency_medications_basic.json",
    "accent": "#7c2d12"
  },
  {
    "id": "sepsis_basic",
    "level": "basic",
    "name": "Sepsis",
    "description": "Initial recognition, antibiotics, circulatory management, source control",
    "file": "questions/en/basic/sepsis_basic.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_basic",
    "level": "basic",
    "name": "Major Trauma",
    "description": "Primary survey, hemorrhage control, thoracoabdominal trauma, resuscitation",
    "file": "questions/en/basic/trauma_basic.json",
    "accent": "#b45309"
  },
  {
    "id": "endocrine_basic",
    "level": "basic",
    "name": "Endocrine Emergencies",
    "description": "DKA/HHS, adrenal crisis, thyroid storm, electrolytes",
    "file": "questions/en/basic/endocrine_basic.json",
    "accent": "#6d5bd0"
  },
  {
    "id": "cpr_basic",
    "level": "basic",
    "name": "CPR / Cardiac Arrest",
    "description": "High-quality CPR, defibrillation, medications, reversible causes",
    "file": "questions/en/basic/cpr_basic.json",
    "accent": "#c2413b"
  },
  {
    "id": "pediatric_basic",
    "level": "basic",
    "name": "Pediatric Emergencies",
    "description": "Pediatric emergency medicine, drug dosing, resuscitation",
    "file": "questions/en/basic/pediatric_basic.json",
    "accent": "#c2413b"
  },
  {
    "id": "cardiology_basic",
    "level": "basic",
    "name": "Cardiology Emergencies",
    "description": "Cardiac emergency management",
    "file": "questions/en/basic/cardiology_basic.json",
    "accent": "#c2413b"
  },
  {
    "id": "toxicology_basic",
    "level": "basic",
    "name": "Toxicology",
    "description": "Initial management of poisoning, antidotes, major toxins",
    "file": "questions/en/basic/toxicology_basic.json",
    "accent": "#5f2d91"
  },
  {
    "id": "general_em_basic",
    "level": "basic",
    "name": "General Emergency Medicine",
    "description": "BLS, primary survey, triage, basic ER management",
    "file": "questions/en/basic/general_em_basic.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "altered_mental_status_advanced",
    "level": "advanced",
    "name": "Altered Mental Status / Syncope",
    "description": "AIUEO-TIPS, airway indications, Wernicke encephalopathy, NCSE",
    "file": "questions/en/advanced/altered_mental_status_advanced.json",
    "accent": "#4f46e5"
  },
  {
    "id": "sepsis_advanced",
    "level": "advanced",
    "name": "Sepsis",
    "description": "Fluid responsiveness, lactate, vasopressin, SOFA",
    "file": "questions/en/advanced/sepsis_advanced.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_advanced",
    "level": "advanced",
    "name": "Major Trauma",
    "description": "MTP, hemostatic resuscitation, lethal triad, REBOA, TEG",
    "file": "questions/en/advanced/trauma_advanced.json",
    "accent": "#b45309"
  },
  {
    "id": "cpr_advanced",
    "level": "advanced",
    "name": "CPR / Cardiac Arrest",
    "description": "Epinephrine, amiodarone, reversible causes, ECPR indications",
    "file": "questions/en/advanced/cpr_advanced.json",
    "accent": "#c2413b"
  },
  {
    "id": "toxicology_advanced",
    "level": "advanced",
    "name": "Toxicology",
    "description": "Advanced management of TCAs, calcium channel blockers, organophosphates",
    "file": "questions/en/advanced/toxicology_advanced.json",
    "accent": "#5f2d91"
  },
  {
    "id": "general_em_advanced",
    "level": "advanced",
    "name": "General Emergency Medicine",
    "description": "RSI, shock management, applied acute care",
    "file": "questions/en/advanced/general_em_advanced.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "cardiology_advanced",
    "level": "advanced",
    "name": "Cardiology Emergencies",
    "description": "Tachyarrhythmias, bradyarrhythmias, QT prolongation, pacing",
    "file": "questions/en/advanced/cardiology_advanced.json",
    "accent": "#c2413b"
  },
  {
    "id": "infection_advanced",
    "level": "advanced",
    "name": "Infectious Diseases",
    "description": "Meningitis, herpes zoster, public health response",
    "file": "questions/en/advanced/infection_advanced.json",
    "accent": "#15803d"
  },
  {
    "id": "pediatric_advanced",
    "level": "advanced",
    "name": "Pediatric Emergencies",
    "description": "Pediatric anaphylaxis and advanced pediatric care",
    "file": "questions/en/advanced/pediatric_advanced.json",
    "accent": "#c2413b"
  },
  {
    "id": "obstetrics_advanced",
    "level": "advanced",
    "name": "Obstetric Emergencies",
    "description": "Postpartum hemorrhage, obstetric drugs, maternal resuscitation",
    "file": "questions/en/advanced/obstetrics_advanced.json",
    "accent": "#be123c"
  },
  {
    "id": "vertigo_stroke_advanced",
    "level": "advanced",
    "name": "Vertigo / Stroke",
    "description": "Central vertigo, brainstem lesions, applied HINTS",
    "file": "questions/en/advanced/vertigo_stroke_advanced.json",
    "accent": "#0f766e"
  },
  {
    "id": "sepsis_master",
    "level": "master",
    "name": "Sepsis",
    "description": "Steroids, CRRT, lung-protective ventilation, DIC, VTE prophylaxis",
    "file": "questions/en/master/sepsis_master.json",
    "accent": "#087f8c"
  },
  {
    "id": "trauma_master",
    "level": "master",
    "name": "Major Trauma",
    "description": "DCS, pelvic TAE, abdominal ACS, ICP management, TRALI",
    "file": "questions/en/master/trauma_master.json",
    "accent": "#b45309"
  },
  {
    "id": "cpr_master",
    "level": "master",
    "name": "CPR / Cardiac Arrest",
    "description": "ECPR, PCAS, TTM, neurological prognostication, continuous EEG",
    "file": "questions/en/master/cpr_master.json",
    "accent": "#c2413b"
  },
  {
    "id": "general_em_master",
    "level": "master",
    "name": "General Emergency Medicine",
    "description": "Lung-protective ventilation, ECPR, ultra-acute critical care",
    "file": "questions/en/master/general_em_master.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "critical_care_master",
    "level": "master",
    "name": "Critical Care",
    "description": "ARDS, mechanical ventilation, SBT, intraabdominal pressure",
    "file": "questions/en/master/critical_care_master.json",
    "accent": "#1d4ed8"
  },
  {
    "id": "toxicology_master",
    "level": "master",
    "name": "Toxicology",
    "description": "Caustic ingestion, envenomation, chemical exposure, antidotes",
    "file": "questions/en/master/toxicology_master.json",
    "accent": "#5f2d91"
  },
  {
    "id": "disaster_master",
    "level": "master",
    "name": "Disaster Medicine",
    "description": "Chemical disasters, zoning, decontamination, blast injuries",
    "file": "questions/en/master/disaster_master.json",
    "accent": "#7c2d12"
  },
  {
    "id": "environmental_master",
    "level": "master",
    "name": "Environmental Emergencies",
    "description": "Diving injuries, hypothermia, and special environmental emergencies",
    "file": "questions/en/master/environmental_master.json",
    "accent": "#087f8c"
  }
]
```

- [ ] **Step 2: Verify** — switch language to EN in app, check Entry level shows 15 categories.

---

## Task 4: Create ed_first_steps_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/ed_first_steps_entry.json`
- Create: `data/questions/en/entry/ed_first_steps_entry.json`

Contains: moved questions 001, 002, 005 (as-is, keeping original IDs) + 2 new questions.
Note: `categories` field removed from moved questions to prevent cross-level bleed.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "救急外来まずはここから",
  "questions": [
    {
      "id": "ed_first_steps_001",
      "question": "研修医のER業務において正しい記述はどれか。",
      "choices": [
        "他の医師が診療している患者を手伝うことは慎む",
        "家族には診断が確定するまで問診以外の接触は不要である",
        "家族説明は時間節約のためベッドサイドで行うべきである",
        "少しでも相談した上級医はカルテに併診医師として記載する",
        "チーム医療では分業しても情報を統合し、全員で共有する"
      ],
      "answers": [4],
      "selectCount": 1,
      "explanation": "不安を抱える家族とのコミュニケーションは非常に重要であり、診療中も可能な限り現状を共有する。説明は診察室など落ち着いた環境で行い、検査結果を供覧しながら質問しやすいように心がける。カルテに「併診、コンサルト医師」として記載するのは、その症例の判断に責任のある上級医のみとする。"
    },
    {
      "id": "ed_first_steps_002",
      "question": "超音波検査を行う場合に注意すべきことをすべて選べ。",
      "choices": [
        "患者の服にゼリーが付かないようにペーパータオルなどで予防する",
        "男性医師が女性患者を検査する際は女性スタッフ立ち合いを依頼する",
        "検査終了後に「ゼリーのふき取り」と「着衣の修正」を忘れない",
        "出血患者や血管穿刺ではカバー等でプローブの血液汚染を防ぐ",
        "超音波の減衰を防ぐためにゼリーは冷却しておく"
      ],
      "answers": [0, 1, 2, 3],
      "selectCount": 0,
      "explanation": "緊急性の高い現場でも、患者への配慮、プライバシー、感染対策を意識し、適切なマナーで検査を行うことが重要である。"
    },
    {
      "id": "ed_first_steps_005",
      "question": "85歳男性が肺炎の診断で入院となった。家族へ検査結果、診断、治療法について説明した。加えて説明しておくべき内容をすべて選択せよ。",
      "choices": [
        "入院期間の見込みを説明する",
        "病状悪化や命の危険性の可能性について説明する",
        "入院中の合併症（せん妄、DVT、ADL低下など）について説明する",
        "挿管（人工呼吸管理）・心肺蘇生の方針について説明・相談する",
        "75歳以上ではせん妄前から予防的身体拘束が必要と説明する"
      ],
      "answers": [0, 1, 2, 3],
      "selectCount": 0,
      "explanation": "高齢者の肺炎では、診断や治療だけでなく、入院期間の見込み、病状悪化の可能性、入院中合併症、人工呼吸管理や心肺蘇生の方針についても説明・相談しておくことが望ましい。身体拘束は「切迫性」「非代替性」、「一時性」の三要件を満たす場合のみ"
    },
    {
      "id": "ed_first_steps_entry_001",
      "question": "ERで患者が急変した際の初動として最も優先されるのはどれか。",
      "choices": [
        "担当看護師に状況説明を求める",
        "応援要請（ヘルプコール）しながら気道・呼吸・循環を評価する",
        "電子カルテで既往歴を確認する",
        "主治医に電話で報告する"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "急変時は応援を呼びながら同時にABC（気道・呼吸・循環）を評価することが最優先である。一人で対応しようとせず、チームを早期に集めることが患者の転帰を改善する。"
    },
    {
      "id": "ed_first_steps_entry_002",
      "question": "SBARコミュニケーションの「A」が示す内容はどれか。",
      "choices": [
        "患者の既往歴（Past medical history）",
        "現在の状況（Situation）",
        "医療者としての評価・判断（Assessment）",
        "薬剤アレルギー（Allergy）"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "SBARはS（状況）・B（背景）・A（評価）・R（提案）の順に報告する構造化コミュニケーション手法である。「A」は医療者が患者の状態をどう評価・解釈しているかを伝える部分で、単なる事実の羅列でなく判断を含む。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "ER First Steps",
  "questions": [
    {
      "id": "ed_first_steps_001",
      "question": "Which of the following statements is correct regarding a resident's work in the ER?",
      "choices": [
        "Avoid assisting with patients being treated by other physicians",
        "Contact with family members beyond history-taking is unnecessary until a diagnosis is confirmed",
        "Family updates should be given at the bedside to save time",
        "Any senior physician consulted should be documented in the chart as a co-attending physician",
        "In team-based care, tasks such as examination, history-taking, and procedures may be divided, but all information must be integrated and shared by the entire team"
      ],
      "answers": [4],
      "selectCount": 1,
      "explanation": "Communication with anxious family members is extremely important, and updates on the current situation should be shared as much as possible during care. Explanations should be given in a quiet setting such as a consultation room, sharing test results and encouraging questions. Only senior physicians who bear responsibility for clinical decisions in the case should be documented in the chart as co-attending or consulting physicians."
    },
    {
      "id": "ed_first_steps_002",
      "question": "Select all precautions to observe when performing an ultrasound examination.",
      "choices": [
        "Use paper towels or similar materials to protect the patient's clothing from gel",
        "When a male physician examines a female patient, request that a female staff member be present",
        "After the examination, do not forget to wipe off the gel and help the patient adjust their clothing",
        "When using ultrasound for bleeding patients or vascular puncture, use a probe cover or wrap to prevent blood contamination",
        "Keep the gel refrigerated to prevent ultrasound attenuation"
      ],
      "answers": [0, 1, 2, 3],
      "selectCount": 0,
      "explanation": "Even in high-acuity settings, it is essential to show consideration for the patient, respect privacy, and follow appropriate infection control practices during examinations."
    },
    {
      "id": "ed_first_steps_005",
      "question": "An 85-year-old man is admitted with a diagnosis of pneumonia. Test results, the diagnosis, and treatment have been explained to the family. Select all additional topics that should be discussed.",
      "choices": [
        "Expected length of hospital stay",
        "Possibility of clinical deterioration and risk of death",
        "Potential in-hospital complications (delirium, DVT, functional decline, etc.)",
        "Discussion of preferences and goals of care regarding intubation (mechanical ventilation) and CPR",
        "Explain that prophylactic physical restraint is required in patients over 75 years old before obvious delirium develops"
      ],
      "answers": [0, 1, 2, 3],
      "selectCount": 0,
      "explanation": "In elderly patients with pneumonia, it is advisable to discuss and document, in addition to diagnosis and treatment, the expected hospital stay, possibility of deterioration, potential in-hospital complications, and goals of care regarding mechanical ventilation and CPR. Physical restraint is only permitted when the three criteria of imminent risk, lack of alternative, and temporary necessity are all met."
    },
    {
      "id": "ed_first_steps_entry_001",
      "question": "When a patient deteriorates in the ER, what is the highest priority initial action?",
      "choices": [
        "Ask the bedside nurse to explain the situation",
        "Call for help while simultaneously assessing airway, breathing, and circulation",
        "Check the electronic medical record for past medical history",
        "Phone the attending physician to report"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Calling for help while simultaneously assessing ABC (airway, breathing, circulation) is the top priority during a deterioration. Assembling the team early improves patient outcomes."
    },
    {
      "id": "ed_first_steps_entry_002",
      "question": "In SBAR communication, what does the \"A\" stand for?",
      "choices": [
        "Past medical history (Anamnesis)",
        "Current situation (Situation)",
        "The clinician's evaluation and interpretation (Assessment)",
        "Drug allergy (Allergy)"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "SBAR stands for Situation, Background, Assessment, and Recommendation. The \"A\" component is where the clinician communicates their interpretation and clinical judgment about the patient's condition — not just facts, but a reasoned evaluation."
    }
  ]
}
```

---

## Task 5: Create cpr_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/cpr_entry.json`
- Create: `data/questions/en/entry/cpr_entry.json`

Contains: moved questions 006, 007, 008 (original IDs, `categories` field removed) + 2 new questions.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "心肺蘇生",
  "questions": [
    {
      "id": "ed_first_steps_006",
      "question": "挿管の準備において、間違っている選択肢を一つ選べ。",
      "choices": [
        "喉頭鏡はまずブレード3を用意する",
        "挿管チューブは男性で9mm、女性で8mmを選択する",
        "ER挿管では分泌物除去に備え16Frサクションを準備する",
        "麻酔器使用時はリークテストを行い、ETCO2を使えるようにする",
        "スニッフィング位のため折りたたみバスタオル2枚を枕にする"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "日本人成人では男性7.5〜8.0mm、女性7.0〜7.5mmが標準的なサイズである。9mmは過大で挿入困難や声帯損傷の原因となるため不適切。"
    },
    {
      "id": "ed_first_steps_007",
      "question": "心肺停止患者のホットライン（救急隊からの電話連絡）において確認しておくべきことは何か。3つ選択せよ。",
      "choices": [
        "糖尿病の既往",
        "心肺停止発症目撃の有無",
        "来院までの時間",
        "宗教や本人の死生観",
        "心電図の初期波形"
      ],
      "answers": [1, 2, 4],
      "selectCount": 3,
      "explanation": "目撃の有無、来院までの時間、初期波形（VF/VT/PEA/Asystole）はいずれも予後と治療方針に直結する重要情報であり、ホットラインで初期確認すべき項目である。既往歴や死生観は来院後の確認で対応可能。"
    },
    {
      "id": "ed_first_steps_008",
      "question": "心肺停止患者がROSC（心拍再開）した場合にすべきことのうち、間違っている項目はどれか。",
      "choices": [
        "血圧などバイタル測定",
        "CPAの原因検索として12誘導心電図",
        "CPAの原因検索としてCT検査（頭部は単純、体幹部は造影）",
        "脳保護目的で24時間100%酸素の継続",
        "血圧低下に備えて昇圧剤の準備"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "ROSC後は低酸素と高酸素の両方を避ける。SpO2またはPaO2を信頼して測定できるまでは100%酸素を用いるが、確認後はSpO2 90〜98%程度を目標にFiO2を速やかに調整する。100%酸素を漫然と継続するのは不適切。"
    },
    {
      "id": "cpr_entry_001",
      "question": "成人に対する胸骨圧迫の適切な速さはどれか。",
      "choices": [
        "60〜80回/分",
        "80〜100回/分",
        "100〜120回/分",
        "120〜140回/分"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "AHAおよびJRCガイドラインでは、成人の胸骨圧迫は100〜120回/分が推奨されている。速すぎると不完全なリコイルになりやすく、遅すぎると心拍出量が低下する。"
    },
    {
      "id": "cpr_entry_002",
      "question": "心室細動（VF）に対する最も優先される初期治療はどれか。",
      "choices": [
        "アドレナリン静脈内投与",
        "気管挿管",
        "除細動（電気ショック）",
        "アミオダロン静脈内投与"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "VFに対しては除細動が最優先である。除細動を早期に行うほど生存率が向上する。薬剤投与（アドレナリン・アミオダロン）は除細動不成功後に検討する。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "CPR / Cardiac Arrest",
  "questions": [
    {
      "id": "ed_first_steps_006",
      "question": "Select the ONE incorrect option in preparing for intubation.",
      "choices": [
        "Prepare a size 3 blade for the laryngoscope first",
        "Select a 9 mm tube for males and an 8 mm tube for females",
        "Since oral secretions often need to be cleared during ER intubation, prepare a 16 Fr suction catheter",
        "If using an anesthesia machine, perform a leak test beforehand and set up the ETCO₂ monitor",
        "Use two folded bath towels as a pillow to achieve the sniffing position"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "For Japanese adults, 7.5–8.0 mm is the standard size for males and 7.0–7.5 mm for females. A 9 mm tube is oversized, making insertion difficult and risking vocal cord injury, and is therefore inappropriate."
    },
    {
      "id": "ed_first_steps_007",
      "question": "When receiving a pre-arrival notification call (hotline) from EMS for a cardiac arrest patient, what information should be confirmed? Select three.",
      "choices": [
        "History of diabetes",
        "Whether the arrest was witnessed",
        "Estimated time of arrival",
        "Religious beliefs or the patient's views on death",
        "Initial cardiac rhythm on ECG"
      ],
      "answers": [1, 2, 4],
      "selectCount": 3,
      "explanation": "Whether the arrest was witnessed, estimated arrival time, and initial rhythm (VF/VT/PEA/asystole) are all critical information directly linked to prognosis and treatment decisions, and should be confirmed during the initial hotline call. Past medical history and views on death can be addressed after arrival."
    },
    {
      "id": "ed_first_steps_008",
      "question": "After a cardiac arrest patient achieves ROSC, select the ONE incorrect action.",
      "choices": [
        "Measure vital signs including blood pressure",
        "Obtain a 12-lead ECG to investigate the cause of the cardiac arrest",
        "Perform CT to investigate the cause of the cardiac arrest (non-contrast for head, contrast for trunk)",
        "Continue 100% oxygen for 24 hours for cerebral protection",
        "Prepare vasopressors in anticipation of hypotension"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "Hyperoxia after ROSC worsens brain injury. FiO₂ should be titrated promptly to target SpO₂ 94–98% once reliable monitoring is available. Continuing 100% oxygen without adjustment is inappropriate."
    },
    {
      "id": "cpr_entry_001",
      "question": "What is the recommended rate for chest compressions in adults?",
      "choices": [
        "60–80 per minute",
        "80–100 per minute",
        "100–120 per minute",
        "120–140 per minute"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "AHA and JRC guidelines recommend a chest compression rate of 100–120 per minute for adults. Too fast risks incomplete recoil; too slow reduces cardiac output."
    },
    {
      "id": "cpr_entry_002",
      "question": "For ventricular fibrillation (VF), what is the highest priority initial treatment?",
      "choices": [
        "IV epinephrine",
        "Endotracheal intubation",
        "Defibrillation (electric shock)",
        "IV amiodarone"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "Defibrillation is the highest priority for VF — earlier defibrillation improves survival. Drug therapy (epinephrine, amiodarone) is considered after defibrillation attempts fail."
    }
  ]
}
```

---

## Task 6: Create emergency_medications_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/emergency_medications_entry.json`
- Create: `data/questions/en/entry/emergency_medications_entry.json`

Contains: moved questions 004, 010 (original IDs, `categories` field removed) + 3 new questions.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "救急外来薬剤投与",
  "questions": [
    {
      "id": "ed_first_steps_004",
      "question": "65歳女性、体重50kg。尿路感染患者の血圧が70/35mmHgまで低下し、脈拍数85/分であった。ノルアドレナリン（1mg/1mL）を0.1μg/kg/minで開始したい。正しい記述はどれか。",
      "choices": [
        "ノルアドレナリン 1A＋生食49mLを1mL/hで投与開始",
        "ノルアドレナリン 1A＋生食49mLを3mL/hで投与開始",
        "ノルアドレナリン 3A＋生食47mLを1mL/hで投与開始",
        "ノルアドレナリン 3A＋生食47mLを3mL/hで投与開始",
        "ノルアドレナリン 5A＋生食45mLを3mL/hで投与開始"
      ],
      "answers": [4],
      "selectCount": 1,
      "explanation": "体重50kgで0.1μg/kg/minは5μg/min、すなわち300μg/h（0.3mg/h）である。ノルアドレナリン5mgを総量50mLに希釈すると0.1mg/mLとなり、3mL/hで0.3mg/hとなる。"
    },
    {
      "id": "ed_first_steps_010",
      "question": "以下の治療において誤っているものをひとつ選択せよ。",
      "choices": [
        "妊婦の膀胱炎に対し、ダイフェン（ST合剤）4T2×を処方した",
        "30代男性の尿管結石症に対し、ロキソプロフェンを処方した",
        "猫咬傷12時間後で発赤あり。オーグメンチン3T3×＋アモキシシリン3C3×",
        "18歳女性の溶連菌感染症にアモキシシリン4C2×を10日間処方した",
        "軽症の急性副鼻腔炎患者に対し、抗生剤を処方せず経過観察とした"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "ST合剤（スルファメトキサゾール・トリメトプリム）は妊婦に禁忌。妊娠初期には葉酸代謝拮抗による催奇形性、後期には核黄疸のリスクがあるため使用不可。妊婦の膀胱炎にはセフェム系（セファレキシン等）が第一選択となる。"
    },
    {
      "id": "emergency_medications_entry_001",
      "question": "アナフィラキシーショックに対する第一選択薬はどれか。",
      "choices": [
        "ジフェンヒドラミン（抗ヒスタミン薬）静脈内投与",
        "アドレナリン（エピネフリン）大腿外側への筋肉内注射",
        "ヒドロコルチゾン静脈内投与",
        "サルブタモール吸入"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "アナフィラキシーの第一選択はアドレナリン（0.3〜0.5mg）の大腿外側筋注である。抗ヒスタミン薬やステロイドは補助薬であり、単独では生命を救えない。迅速な投与が予後を決定する。"
    },
    {
      "id": "emergency_medications_entry_002",
      "question": "急性けいれんの初期薬物治療として最初に使用されるのはどれか。",
      "choices": [
        "フェノバルビタール静脈内投与",
        "フェニトイン静脈内投与",
        "ジアゼパムまたはミダゾラムなどのベンゾジアゼピン系薬",
        "バルプロ酸静脈内投与"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "けいれんの初期治療はベンゾジアゼピン系薬（ジアゼパム・ミダゾラム・ロラゼパム）が第一選択である。即効性があり、投与経路も多様（静注・筋注・鼻腔・直腸）。フェニトインやフェノバルビタールは第二・第三選択薬。"
    },
    {
      "id": "emergency_medications_entry_003",
      "question": "アセトアミノフェンとNSAIDs（ロキソプロフェン等）の比較として正しいのはどれか。",
      "choices": [
        "NSAIDsは腎機能障害患者に安全に使用できる",
        "アセトアミノフェンは消化管障害のリスクが低い",
        "NSAIDsはアセトアミノフェンより肝毒性が高い",
        "アセトアミノフェンは抗炎症作用が強い"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "アセトアミノフェンはプロスタグランジン合成阻害をほとんど起こさないため、消化管粘膜障害のリスクが低い。NSAIDsは腎機能障害・消化管出血・高齢者では慎重投与が必要。アセトアミノフェンの過量摂取では肝毒性が問題となる。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Emergency Medications",
  "questions": [
    {
      "id": "ed_first_steps_004",
      "question": "A 65-year-old woman, weight 50 kg, with a urinary tract infection has a blood pressure drop to 70/35 mmHg and heart rate of 85/min. You want to start norepinephrine (1 mg/1 mL) at 0.1 μg/kg/min. Which is the correct description?",
      "choices": [
        "Norepinephrine 1 amp + normal saline 49 mL, start at 1 mL/h",
        "Norepinephrine 1 amp + normal saline 49 mL, start at 3 mL/h",
        "Norepinephrine 3 amps + normal saline 47 mL, start at 1 mL/h",
        "Norepinephrine 3 amps + normal saline 47 mL, start at 3 mL/h",
        "Norepinephrine 5 amps + normal saline 45 mL, start at 3 mL/h"
      ],
      "answers": [4],
      "selectCount": 1,
      "explanation": "At 50 kg and 0.1 μg/kg/min, the dose is 5 μg/min = 300 μg/h (0.3 mg/h). Diluting 5 mg norepinephrine to 50 mL total gives 0.1 mg/mL; at 3 mL/h the rate is 0.3 mg/h."
    },
    {
      "id": "ed_first_steps_010",
      "question": "Select the ONE incorrect treatment from the following.",
      "choices": [
        "Prescribed ST compound (sulfamethoxazole-trimethoprim) 4 tablets twice daily for a pregnant patient with cystitis",
        "Prescribed loxoprofen for a male patient in his 30s with ureteral calculi",
        "Prescribed augmentin combination tablets 3 tablets three times daily plus amoxicillin 3 capsules three times daily for a 20-year-old male with redness around a cat bite wound 12 hours prior",
        "Prescribed amoxicillin capsules 4 capsules twice daily for 10 days for an 18-year-old female with streptococcal infection",
        "Did not prescribe antibiotics and observed an outpatient with mild acute sinusitis"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "ST compound (sulfamethoxazole-trimethoprim) is contraindicated in pregnancy due to teratogenicity from folate antagonism in the first trimester and risk of kernicterus in the third trimester. A cephalosporin (e.g., cephalexin) is first-line for cystitis in pregnancy."
    },
    {
      "id": "emergency_medications_entry_001",
      "question": "What is the first-line treatment for anaphylactic shock?",
      "choices": [
        "IV diphenhydramine (antihistamine)",
        "Intramuscular epinephrine (adrenaline) into the lateral thigh",
        "IV hydrocortisone",
        "Inhaled salbutamol"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Epinephrine 0.3–0.5 mg IM into the lateral thigh is the first-line treatment for anaphylaxis. Antihistamines and corticosteroids are adjuncts and cannot save a life on their own. Prompt administration determines outcome."
    },
    {
      "id": "emergency_medications_entry_002",
      "question": "Which drug class is used first in the acute pharmacological treatment of seizures?",
      "choices": [
        "IV phenobarbital",
        "IV phenytoin",
        "Benzodiazepines (e.g., diazepam or midazolam)",
        "IV valproate"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "Benzodiazepines (diazepam, midazolam, lorazepam) are first-line for acute seizures. They have rapid onset and can be given by multiple routes (IV, IM, intranasal, rectal). Phenytoin and phenobarbital are second- and third-line agents."
    },
    {
      "id": "emergency_medications_entry_003",
      "question": "Which statement comparing acetaminophen and NSAIDs (e.g., loxoprofen) is correct?",
      "choices": [
        "NSAIDs can be used safely in patients with renal impairment",
        "Acetaminophen carries a lower risk of gastrointestinal side effects",
        "NSAIDs have greater hepatotoxicity than acetaminophen",
        "Acetaminophen has stronger anti-inflammatory effects"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Acetaminophen has minimal effect on prostaglandin synthesis in the GI tract, resulting in lower GI mucosal damage risk. NSAIDs require caution in patients with renal impairment, GI bleeding risk, and elderly patients. Hepatotoxicity is the main concern with acetaminophen overdose."
    }
  ]
}
```

---

## Task 7: Create general_em_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/general_em_entry.json`
- Create: `data/questions/en/entry/general_em_entry.json`

Contains: moved question 003 (original ID, `categories` field removed) + 4 new questions.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "救急医学全般",
  "questions": [
    {
      "id": "ed_first_steps_003",
      "question": "18歳の喘息既往患者。朝から喘鳴があり、SpO2 96%、呼吸数20/分、呼吸様式は軽度努力呼吸、両肺にwheezingを認める。まず行うべき治療はどれか。",
      "choices": [
        "ソルメドロール 125mg 点滴投与",
        "ボスミン 0.1mL＋生理食塩水 1mL 吸入",
        "ソルメドロール 40mg 点滴投与",
        "ベネトリン 0.5mL＋生理食塩水 1mL 吸入",
        "ボスミン 0.5mL＋生理食塩水 1mL 吸入"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "喘息小発作では、まず短時間作用性β2刺激薬であるベネトリン（サルブタモール）の吸入治療を行う。全身性ステロイド投与は通常、中発作以上や増悪リスクが高い場合に考慮する。"
    },
    {
      "id": "general_em_entry_001",
      "question": "ショックの定義として最も適切なのはどれか。",
      "choices": [
        "収縮期血圧が90mmHg未満の状態",
        "組織への酸素供給が需要を満たせない状態",
        "脈拍が100回/分以上の状態",
        "意識レベルが低下した状態"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "ショックとは組織灌流不全による細胞障害の状態であり、血圧低下は一指標に過ぎない。血圧が正常でも組織酸素供給が不十分ならショックと判断する（代償性ショック）。"
    },
    {
      "id": "general_em_entry_002",
      "question": "パルスオキシメーター（SpO2）の正常値として適切なのはどれか。",
      "choices": [
        "85〜90%",
        "88〜93%",
        "92〜95%",
        "95〜100%"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "健常成人のSpO2正常値は95〜100%である。90%未満は低酸素血症と定義され、酸素投与の適応となる。COPDなど慢性疾患では88〜92%を目標とする場合もある。"
    },
    {
      "id": "general_em_entry_003",
      "question": "成人BLSにおける胸骨圧迫と人工呼吸の比率として正しいのはどれか。",
      "choices": [
        "15:1",
        "20:2",
        "30:2",
        "30:1"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "成人BLSでは胸骨圧迫30回：人工呼吸2回（30:2）が標準である。気道確保デバイスが挿入された場合は非同期（圧迫を止めずに換気）となる。"
    },
    {
      "id": "general_em_entry_004",
      "question": "START法トリアージで「最優先（赤タグ）」と判断される基準として正しいのはどれか。",
      "choices": [
        "自力歩行不能・呼吸数異常・橈骨動脈触知不能・意識変容のいずれかを満たす",
        "自力歩行できないが、バイタルサインが安定している",
        "意識なく呼吸停止している",
        "骨折が複数あり外傷の程度が重度である"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "START法では、自力歩行不能かつ呼吸・循環・意識のいずれかに異常があれば赤（最優先）と判断する。呼吸停止で用手的な気道確保後も無呼吸であれば黒（死亡）とする。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "General Emergency Medicine",
  "questions": [
    {
      "id": "ed_first_steps_003",
      "question": "An 18-year-old patient with a history of asthma presents with wheezing since this morning. SpO₂ is 96%, respiratory rate 20/min, mildly labored breathing, and bilateral wheezing on auscultation. What is the first treatment to administer?",
      "choices": [
        "Solu-Medrol 125 mg IV infusion",
        "Bosmin 0.1 mL + normal saline 1 mL nebulization",
        "Solu-Medrol 40 mg IV infusion",
        "Ventolin 0.5 mL + normal saline 1 mL nebulization",
        "Bosmin 0.5 mL + normal saline 1 mL nebulization"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "For a mild asthma exacerbation, the first treatment is inhaled short-acting beta-2 agonist (salbutamol/Ventolin). Systemic corticosteroids are considered for moderate or worse exacerbations or high-risk patients."
    },
    {
      "id": "general_em_entry_001",
      "question": "Which definition of shock is most accurate?",
      "choices": [
        "Systolic blood pressure below 90 mmHg",
        "A state in which oxygen delivery to tissues fails to meet demand",
        "Heart rate above 100 beats per minute",
        "A state of reduced level of consciousness"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Shock is a state of cellular injury from inadequate tissue perfusion; hypotension is only one indicator. Blood pressure can be normal in compensated shock, where tissue oxygen delivery is still insufficient."
    },
    {
      "id": "general_em_entry_002",
      "question": "What is a normal SpO₂ reading on pulse oximetry?",
      "choices": [
        "85–90%",
        "88–93%",
        "92–95%",
        "95–100%"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "Normal SpO₂ in healthy adults is 95–100%. Below 90% is defined as hypoxemia and is an indication for supplemental oxygen. A target of 88–92% may be appropriate in COPD and other chronic conditions."
    },
    {
      "id": "general_em_entry_003",
      "question": "What is the correct compression-to-ventilation ratio in adult BLS?",
      "choices": [
        "15:1",
        "20:2",
        "30:2",
        "30:1"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "Adult BLS uses a 30:2 ratio (30 chest compressions to 2 rescue breaths). Once an advanced airway is in place, ventilation is asynchronous (compressions are not interrupted for breaths)."
    },
    {
      "id": "general_em_entry_004",
      "question": "In the START triage method, which criteria classify a patient as highest priority (red tag)?",
      "choices": [
        "Unable to walk AND any of: abnormal respiratory rate, absent radial pulse, or altered mental status",
        "Unable to walk but with stable vital signs",
        "Unconscious with no breathing",
        "Severe trauma with multiple fractures"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "In START triage, a patient who cannot walk and has an abnormal respiratory rate, absent radial pulse, or altered mental status is categorized as red (immediate). A patient with no breathing even after manual airway opening is categorized as black (deceased/expectant)."
    }
  ]
}
```

---

## Task 8: Create trauma_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/trauma_entry.json`
- Create: `data/questions/en/entry/trauma_entry.json`

Contains: moved question 009 + 4 new questions.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "重症外傷",
  "questions": [
    {
      "id": "ed_first_steps_009",
      "question": "外傷患者対応において誤っている項目をひとつ選択せよ。",
      "choices": [
        "E評価で体温測定・保温を行うのは低体温が凝固障害を招くため",
        "A評価で発声を確認し、口腔内と前頸部をざっと確認した",
        "B評価でSpO2正常でも右前胸部に強い圧痛があり異常とした",
        "Cの評価としてFASTを行い後腹膜出血の有無を迅速に判断した",
        "Dの評価としてGCSが6点であったので切迫するDと判断した"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "FAST（Focused Assessment with Sonography for Trauma）は腹腔内・心嚢・胸腔の遊離液体の有無を評価する検査であり、後腹膜腔は描出できない。後腹膜出血の評価には造影CTが必要。"
    },
    {
      "id": "trauma_entry_001",
      "question": "外傷初期評価（ABCDE）において「A」で評価するのはどれか。",
      "choices": [
        "意識レベル（Alertness）",
        "気道（Airway）",
        "腹部（Abdomen）",
        "不整脈（Arrhythmia）"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "ABCDEアプローチではA＝気道（Airway）、B＝呼吸（Breathing）、C＝循環（Circulation）、D＝意識（Disability/Neurological）、E＝脱衣・体温（Exposure/Environment）の順に評価する。"
    },
    {
      "id": "trauma_entry_002",
      "question": "緊張性気胸の特徴的な身体所見として正しいのはどれか。",
      "choices": [
        "患側の過共鳴音と気管の患側への偏位",
        "患側の過共鳴音と気管の健側への偏位",
        "患側の濁音と気管の健側への偏位",
        "両側性の呼吸音消失"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "緊張性気胸では患側に空気が貯留するため患側の打診で過共鳴音を認め、縦隔が健側に圧迫されるため気管は健側へ偏位する。低血圧・頸静脈怒張も特徴的所見である。"
    },
    {
      "id": "trauma_entry_003",
      "question": "骨盤骨折を疑う外傷患者でショックを呈している場合の初期対応として適切なのはどれか。",
      "choices": [
        "骨盤を左右に揺さぶって不安定性を確認する",
        "骨盤ベルトやシーツで骨盤を固定して骨盤内出血を減少させる",
        "骨盤X線を撮影してから治療方針を決定する",
        "輸液2L投与後に血圧が改善しなければ手術室へ搬送する"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "骨盤ベルトやシーツによる骨盤固定は骨盤容積を減少させ、骨盤内出血（後腹膜出血）を抑制する効果がある。骨盤を揺さぶる操作は出血を助長するため禁忌。"
    },
    {
      "id": "trauma_entry_004",
      "question": "Damage Control Resuscitation（DCR）の基本概念として正しいのはどれか。",
      "choices": [
        "大量晶質液（生食・乳酸リンゲル液）を積極的に投与する",
        "収縮期血圧120mmHg以上を目標とする",
        "赤血球・新鮮凍結血漿・血小板をバランスよく輸血する",
        "凝固異常は術後に是正する"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "DCRは大量出血外傷に対し、晶質液を制限して血液製剤（RBC:FFP:PLT＝1:1:1）をバランスよく投与する戦略である。許容的低血圧と止血を優先し、凝固障害の進行を防ぐ。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Major Trauma",
  "questions": [
    {
      "id": "ed_first_steps_009",
      "question": "Select the ONE incorrect item in the management of a trauma patient.",
      "choices": [
        "The reason for measuring temperature and warming the patient as part of E assessment is that hypothermia causes coagulopathy",
        "As part of A assessment, confirmed a clear voice, and briefly inspected the oral cavity and anterior neck",
        "As part of B assessment, SpO₂ was normal, but strong tenderness over the right anterior chest was present, so assessed as abnormal",
        "As part of C assessment, performed FAST to rapidly determine the presence of retroperitoneal hemorrhage",
        "As part of D assessment, GCS of 6 was present, so judged as impending D"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "FAST evaluates for free fluid in the peritoneal cavity, pericardium, and pleural space, but cannot visualize the retroperitoneal space. Contrast CT is required to evaluate retroperitoneal hemorrhage."
    },
    {
      "id": "trauma_entry_001",
      "question": "In the trauma primary survey (ABCDE), what does \"A\" stand for?",
      "choices": [
        "Alertness (level of consciousness)",
        "Airway",
        "Abdomen",
        "Arrhythmia"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "ABCDE stands for Airway, Breathing, Circulation, Disability (neurological), and Exposure/Environment. Airway is always assessed and secured first."
    },
    {
      "id": "trauma_entry_002",
      "question": "Which physical finding is characteristic of tension pneumothorax?",
      "choices": [
        "Hyperresonance on the affected side with tracheal deviation toward the affected side",
        "Hyperresonance on the affected side with tracheal deviation away from the affected side",
        "Dullness on the affected side with tracheal deviation away from the affected side",
        "Bilateral absence of breath sounds"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "In tension pneumothorax, trapped air on the affected side produces hyperresonance, while mediastinal compression pushes the trachea toward the opposite side. Hypotension and JVD are also characteristic."
    },
    {
      "id": "trauma_entry_003",
      "question": "For a trauma patient with suspected pelvic fracture in shock, which initial management is most appropriate?",
      "choices": [
        "Rock the pelvis side to side to assess for instability",
        "Apply a pelvic binder or sheet wrap to stabilize the pelvis and reduce pelvic hemorrhage",
        "Obtain a pelvic X-ray before deciding on treatment",
        "Give 2 L of IV fluid; if blood pressure does not improve, transfer to OR"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "A pelvic binder or sheet wrap reduces pelvic volume and tamponades retroperitoneal hemorrhage. Manipulating the pelvis by rocking is contraindicated as it worsens bleeding."
    },
    {
      "id": "trauma_entry_004",
      "question": "Which statement best describes Damage Control Resuscitation (DCR)?",
      "choices": [
        "Aggressively administer crystalloid fluids (normal saline or lactated Ringer's)",
        "Target a systolic blood pressure of 120 mmHg or higher",
        "Transfuse red blood cells, fresh frozen plasma, and platelets in a balanced ratio",
        "Correct coagulopathy after surgery"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "DCR for massive hemorrhage limits crystalloid and uses balanced blood products (RBC:FFP:PLT = 1:1:1). It prioritizes permissive hypotension and hemostasis to prevent progression of the lethal triad."
    }
  ]
}
```

---

## Task 9: Create altered_mental_status_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/altered_mental_status_entry.json`
- Create: `data/questions/en/entry/altered_mental_status_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "意識障害/意識消失",
  "questions": [
    {
      "id": "altered_mental_status_entry_001",
      "question": "意識障害患者への初期対応で、最初に確認・治療すべきなのはどれか。",
      "choices": [
        "血糖値の測定と低血糖の補正",
        "頭部CTの撮影",
        "家族からの詳細な病歴聴取",
        "神経学的診察（瞳孔・反射）"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "低血糖は意識障害の原因として頻度が高く、治療が容易で、未治療では不可逆的な神経障害をきたす。意識障害では「まず血糖を測定し、低血糖であれば直ちに補正する」が鉄則である。"
    },
    {
      "id": "altered_mental_status_entry_002",
      "question": "意識障害の原因を想起する際のAIUEO-TIPSで「I」が示す原因はどれか。",
      "choices": [
        "感染症（Infection）",
        "インスリン/代謝性障害（Insulin/metabolic）",
        "炎症（Inflammation）",
        "梗塞（Infarction）"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "AIUEO-TIPSのIはInsulin（低血糖・高血糖・電解質異常など代謝性障害）を指す。感染症はI（infection）の別の解釈とされることもあるが、代謝性障害を代表させるのが一般的。語呂としてAIUEO（代謝系）とTIPS（神経系・構造的・薬物）に大別できる。"
    },
    {
      "id": "altered_mental_status_entry_003",
      "question": "Glasgow Coma Scale（GCS）で「開眼しない（E1）・発語しない（V1）・四肢伸展（M2）」の合計点はどれか。",
      "choices": [
        "3点",
        "4点",
        "5点",
        "6点"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "GCSはE（開眼1〜4点）＋V（発語1〜5点）＋M（運動1〜6点）の合計。E1＋V1＋M2＝4点。最低は3点（全項目1点）、最高は15点。"
    },
    {
      "id": "altered_mental_status_entry_004",
      "question": "失神と痙攣の鑑別において、痙攣をより示唆する所見はどれか。",
      "choices": [
        "発作前に立ちくらみ・発汗・気分不快がある",
        "発作後に筋肉痛・舌咬傷・尿失禁がある",
        "立位から急に意識を失い、数秒で回復した",
        "心電図に異常がある"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "発作後の筋肉痛・舌咬傷・尿失禁は強直間代発作に特徴的な後遺症候群（post-ictal期）であり、痙攣を強く示唆する。失神は通常、前駆症状があり回復が速い。"
    },
    {
      "id": "altered_mental_status_entry_005",
      "question": "Wernicke脳症の三徴として正しい組み合わせはどれか。",
      "choices": [
        "眼球運動障害・運動失調・意識障害",
        "頭痛・発熱・項部硬直",
        "低血糖・痙攣・昏睡",
        "散瞳・徐脈・高血圧"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "Wernicke脳症はビタミンB1（チアミン）欠乏による急性神経障害で、眼球運動障害・運動失調・意識障害（混乱）が三徴。アルコール依存症・栄養障害患者で疑い、チアミンを早期投与する。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Altered Mental Status / Syncope",
  "questions": [
    {
      "id": "altered_mental_status_entry_001",
      "question": "When evaluating a patient with altered mental status, what should be assessed and treated first?",
      "choices": [
        "Check blood glucose and correct hypoglycemia",
        "Obtain a head CT",
        "Take a detailed history from the family",
        "Perform a neurological exam (pupils and reflexes)"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "Hypoglycemia is a common, easily reversible cause of altered mental status that can cause irreversible neurological damage if left untreated. The rule is: check glucose first, and correct immediately if low."
    },
    {
      "id": "altered_mental_status_entry_002",
      "question": "In the AEIOU-TIPS mnemonic for altered mental status, what does \"I\" stand for?",
      "choices": [
        "Infection",
        "Insulin / metabolic disorder",
        "Inflammation",
        "Infarction"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "In AEIOU-TIPS, \"I\" stands for Insulin — representing metabolic disorders including hypoglycemia, hyperglycemia, and electrolyte abnormalities. The mnemonic helps systematically recall causes of altered mental status."
    },
    {
      "id": "altered_mental_status_entry_003",
      "question": "A patient has no eye opening (E1), no verbal response (V1), and extensor posturing (M2). What is the GCS total?",
      "choices": [
        "3",
        "4",
        "5",
        "6"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "GCS = E + V + M = 1 + 1 + 2 = 4. The minimum GCS is 3 (all components scored 1) and maximum is 15."
    },
    {
      "id": "altered_mental_status_entry_004",
      "question": "Which finding is more suggestive of a seizure rather than syncope?",
      "choices": [
        "Pre-event lightheadedness, diaphoresis, and nausea",
        "Post-event muscle soreness, tongue laceration, and urinary incontinence",
        "Sudden loss of consciousness from standing position with rapid recovery within seconds",
        "Abnormal ECG findings"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Muscle soreness, tongue laceration, and urinary incontinence after an event are characteristic of the post-ictal period following a tonic-clonic seizure. Syncope typically has prodromal symptoms and rapid full recovery."
    },
    {
      "id": "altered_mental_status_entry_005",
      "question": "Which combination of findings represents the classic triad of Wernicke's encephalopathy?",
      "choices": [
        "Ophthalmoplegia, ataxia, and confusion",
        "Headache, fever, and nuchal rigidity",
        "Hypoglycemia, seizures, and coma",
        "Mydriasis, bradycardia, and hypertension"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "Wernicke's encephalopathy is caused by thiamine (B1) deficiency and presents with the classic triad of ophthalmoplegia, ataxia, and confusion. Suspect in alcoholics and malnourished patients; administer thiamine promptly."
    }
  ]
}
```

---

## Task 10: Create vertigo_stroke_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/vertigo_stroke_entry.json`
- Create: `data/questions/en/entry/vertigo_stroke_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "めまい/脳卒中",
  "questions": [
    {
      "id": "vertigo_stroke_entry_001",
      "question": "末梢性めまいと比較して中枢性めまいを示唆する所見はどれか。",
      "choices": [
        "難聴や耳鳴りを伴うめまい",
        "体位変換で誘発されるめまい",
        "固視抑制が効かない眼振",
        "Dix-Hallpike試験で疲労性の回旋眼振がある"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "固視抑制が効かない眼振は中枢神経病変を示唆する重要な所見である。末梢性めまいでは固視によって眼振が抑制される。難聴・耳鳴り・体位誘発性めまい・疲労性眼振は末梢性を示唆する。"
    },
    {
      "id": "vertigo_stroke_entry_002",
      "question": "脳卒中を院外で疑うためのFASTにおいて「S」が示す症状はどれか。",
      "choices": [
        "突然の視力低下（Sight）",
        "ろれつが回らない・言語障害（Speech）",
        "失神（Syncope）",
        "感覚障害（Sensory）"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "FASTはFace（顔のゆがみ）・Arm（腕の脱力）・Speech（言語障害）・Time（発症時刻の確認＋119番通報）の頭文字。Sは言語障害（ろれつが回らない・言葉が出ない）を指す。"
    },
    {
      "id": "vertigo_stroke_entry_003",
      "question": "脳梗塞に対するrt-PA静注療法の適応となる発症からの時間窓として正しいのはどれか。",
      "choices": [
        "1時間以内",
        "4.5時間以内",
        "6時間以内",
        "12時間以内"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "rt-PA（アルテプラーゼ）静注血栓溶解療法は発症4.5時間以内が適応（日本脳卒中学会ガイドライン）。発症時刻が不明な場合は適応外となることが多い。治療開始が早いほど予後が良い（Time is brain）。"
    },
    {
      "id": "vertigo_stroke_entry_004",
      "question": "良性発作性頭位性めまい（BPPV）に対して最も有効な治療はどれか。",
      "choices": [
        "抗めまい薬（ベタヒスチン等）の長期内服",
        "耳石置換法（Epley法等）",
        "入院安静",
        "MRI検査で原因を確認してから治療"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "BPPVは半規管内に迷い込んだ耳石が原因であり、Epley法などの耳石置換法が第一選択治療。薬物療法は補助的。病歴・Dix-Hallpike試験で診断し、理学療法を実施することで多くが改善する。"
    },
    {
      "id": "vertigo_stroke_entry_005",
      "question": "小脳梗塞を疑う場合に特徴的な症候の組み合わせはどれか。",
      "choices": [
        "片側の顔面感覚障害のみ",
        "運動失調・構音障害・激しい頭痛・嘔吐",
        "片側上下肢の筋力低下のみ",
        "複視のみ"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "小脳梗塞では運動失調（歩行・四肢）・構音障害・激しい頭痛・嘔吐が特徴的。小脳浮腫による脳幹圧迫が急速に進行することがあり、見落としは危険。めまいと嘔吐だけで末梢性と決めつけずに中枢性を除外する。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Vertigo / Stroke",
  "questions": [
    {
      "id": "vertigo_stroke_entry_001",
      "question": "Compared with peripheral vertigo, which finding suggests a central cause?",
      "choices": [
        "Vertigo accompanied by hearing loss and tinnitus",
        "Vertigo triggered by positional changes",
        "Nystagmus that cannot be suppressed by visual fixation",
        "Fatigable rotational nystagmus on Dix-Hallpike test"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "Nystagmus that persists despite visual fixation is a key sign of central nervous system pathology. In peripheral vertigo, fixation suppresses nystagmus. Hearing loss, tinnitus, positional triggering, and fatigable nystagmus suggest peripheral causes."
    },
    {
      "id": "vertigo_stroke_entry_002",
      "question": "In the FAST mnemonic for prehospital stroke recognition, what does \"S\" represent?",
      "choices": [
        "Sudden vision loss (Sight)",
        "Slurred speech or language difficulty (Speech)",
        "Syncope",
        "Sensory loss"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "FAST stands for Face drooping, Arm weakness, Speech difficulty, and Time to call emergency services. \"S\" refers to Speech — slurred speech or inability to speak or understand."
    },
    {
      "id": "vertigo_stroke_entry_003",
      "question": "What is the time window for IV rt-PA (alteplase) thrombolysis in acute ischemic stroke?",
      "choices": [
        "Within 1 hour",
        "Within 4.5 hours",
        "Within 6 hours",
        "Within 12 hours"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "IV rt-PA is indicated within 4.5 hours of symptom onset (per Japanese Stroke Society and international guidelines). Earlier treatment is better — \"Time is brain.\" When onset time is unknown, IV tPA is generally contraindicated."
    },
    {
      "id": "vertigo_stroke_entry_004",
      "question": "What is the most effective treatment for benign paroxysmal positional vertigo (BPPV)?",
      "choices": [
        "Long-term antivertigo medication (e.g., betahistine)",
        "Canalith repositioning maneuver (e.g., Epley maneuver)",
        "Bed rest and hospital admission",
        "MRI to confirm the cause before treatment"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "BPPV is caused by displaced otoliths in the semicircular canals. Canalith repositioning (Epley maneuver) is first-line treatment. Diagnosis is made by history and Dix-Hallpike test; most patients improve with a single maneuver."
    },
    {
      "id": "vertigo_stroke_entry_005",
      "question": "Which combination of findings is characteristic of cerebellar infarction?",
      "choices": [
        "Isolated unilateral facial sensory loss",
        "Ataxia, dysarthria, severe headache, and vomiting",
        "Isolated unilateral limb weakness",
        "Diplopia alone"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Cerebellar infarction typically presents with gait and limb ataxia, dysarthria, severe headache, and vomiting. Cerebellar edema can cause rapid brainstem compression — missing this diagnosis is dangerous. Do not attribute vertigo and vomiting to a peripheral cause without ruling out central pathology."
    }
  ]
}
```

---

## Task 11: Create orthopedic_trauma_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/orthopedic_trauma_entry.json`
- Create: `data/questions/en/entry/orthopedic_trauma_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "整形外傷",
  "questions": [
    {
      "id": "orthopedic_trauma_entry_001",
      "question": "コンパートメント症候群の早期症状として最も特徴的なのはどれか。",
      "choices": [
        "患部の皮下出血と腫脹",
        "受動的伸展で著明に増悪する疼痛",
        "患部の冷感と蒼白",
        "骨折部の圧痛"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "受動的伸展で増悪する疼痛（passive stretch pain）はコンパートメント症候群の最も早期かつ鋭敏な所見である。脈拍消失・皮膚変色・麻痺は進行した所見であり、これらを待ってはならない。"
    },
    {
      "id": "orthopedic_trauma_entry_002",
      "question": "開放骨折の初期対応として最も重要な処置はどれか。",
      "choices": [
        "骨折端を整復して骨を創内に戻す",
        "創部の洗浄・デブリードマン・早期抗菌薬投与および手術",
        "石膏ギプスで固定して経過観察",
        "X線撮影後に処置を開始する"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "開放骨折（Gustilo分類問わず）は感染リスクが高く、創部洗浄・デブリードマン・早期抗菌薬投与が必須。骨折端を無菌的でない環境で戻してはならない。"
    },
    {
      "id": "orthopedic_trauma_entry_003",
      "question": "足関節捻挫後、Ottawa Ankle Rulesに従いX線撮影が不要と判断できる条件はどれか。",
      "choices": [
        "受傷直後から体重をかけられる",
        "外果後縁・内果後縁の圧痛がなく、かつ受傷後に4歩以上自力歩行できた",
        "腫脹と皮下出血がない",
        "疼痛がVAS 3以下である"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Ottawa Ankle Rulesでは、外果後縁6cm・内果後縁6cmの圧痛がなく、かつERでの体重負荷歩行（4歩以上）ができれば骨折の可能性は低くX線不要と判断できる。感度は約98%。"
    },
    {
      "id": "orthopedic_trauma_entry_004",
      "question": "骨折に対する暫定固定（シーネ固定）の主な目的として最も適切なのはどれか。",
      "choices": [
        "骨折を完全に整復して治癒を促進する",
        "疼痛軽減・二次損傷予防・搬送の安定化",
        "腫脹を防ぐために患肢を強く圧迫する",
        "骨折端を皮膚から露出させて観察する"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "シーネ固定は骨折部を動かないようにすることで疼痛を軽減し、周囲の神経・血管・軟部組織への二次損傷を防ぎ、搬送時の安全を確保することが目的。完全な整復は専門医が行う。"
    },
    {
      "id": "orthopedic_trauma_entry_005",
      "question": "前腕骨折のギプス固定後に手指を受動的に伸展させると著明な疼痛が生じた。次に行うべき対応はどれか。",
      "choices": [
        "鎮痛薬を追加して経過観察",
        "ギプスを除去してコンパートメント内圧を測定",
        "患肢を高挙上してアイシング",
        "翌朝の整形外科外来受診を指示"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "受動的伸展で増悪する疼痛はコンパートメント症候群を示唆する緊急所見であり、直ちにギプスを除去し（禁忌の除外を確認後）コンパートメント内圧を測定する。30mmHg以上または拡張期血圧−30mmHg未満で筋膜切開の適応。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Orthopedic Trauma",
  "questions": [
    {
      "id": "orthopedic_trauma_entry_001",
      "question": "What is the earliest and most characteristic sign of compartment syndrome?",
      "choices": [
        "Ecchymosis and swelling over the affected area",
        "Pain dramatically worsened by passive stretching of the affected muscles",
        "Coolness and pallor of the affected limb",
        "Tenderness directly over the fracture site"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Pain with passive stretch is the earliest and most sensitive sign of compartment syndrome. Absent pulse, skin discoloration, and paralysis are late findings — do not wait for them before acting."
    },
    {
      "id": "orthopedic_trauma_entry_002",
      "question": "What is the most important initial management of an open fracture?",
      "choices": [
        "Manually reduce the fracture and push the bone back into the wound",
        "Wound irrigation, debridement, early antibiotic therapy, and urgent surgery",
        "Apply a plaster cast and observe",
        "Wait for X-ray results before any intervention"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Open fractures carry a high infection risk regardless of Gustilo grade. Wound irrigation, debridement, early antibiotics, and surgical management are mandatory. Never push exposed bone back into an unsterile wound."
    },
    {
      "id": "orthopedic_trauma_entry_003",
      "question": "After an ankle sprain, under the Ottawa Ankle Rules, which condition allows X-ray to be omitted?",
      "choices": [
        "Patient can bear weight immediately after injury",
        "No tenderness over the posterior fibula or posterior tibia AND patient walked 4 steps in the ED",
        "No swelling or bruising",
        "Pain is VAS 3 or below"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Ottawa Ankle Rules: X-ray can be omitted if there is no tenderness over the 6 cm posterior edge of the fibula or tibia AND the patient can take 4 steps in the ED. Sensitivity is approximately 98%."
    },
    {
      "id": "orthopedic_trauma_entry_004",
      "question": "What is the primary purpose of temporary splinting of a fracture?",
      "choices": [
        "Achieve complete fracture reduction to accelerate healing",
        "Reduce pain, prevent secondary injury, and stabilize for transport",
        "Compress the limb tightly to reduce swelling",
        "Expose the fracture ends for monitoring"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Splinting immobilizes the fracture to reduce pain and prevent secondary damage to surrounding nerves, vessels, and soft tissue. It also ensures safe transport. Definitive reduction is performed by specialists."
    },
    {
      "id": "orthopedic_trauma_entry_005",
      "question": "After a cast is applied for a forearm fracture, passive finger extension produces severe pain. What is the next step?",
      "choices": [
        "Add analgesics and monitor",
        "Remove the cast and measure compartment pressure",
        "Elevate the limb and apply ice",
        "Schedule orthopedic follow-up the next morning"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Pain with passive stretch after casting is an emergency sign of compartment syndrome. Remove the cast immediately and measure compartment pressure. A pressure above 30 mmHg or within 30 mmHg of diastolic BP is an indication for fasciotomy."
    }
  ]
}
```

---

## Task 12: Create infection_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/infection_entry.json`
- Create: `data/questions/en/entry/infection_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "感染症",
  "questions": [
    {
      "id": "infection_entry_001",
      "question": "細菌感染症に対する抗菌薬選択の基本原則として正しいのはどれか。",
      "choices": [
        "広域抗菌薬を選択すれば治療失敗を防げる",
        "感染フォーカスと起因菌を推定し、適切な（できるだけナローな）抗菌薬を選択する",
        "発熱があれば直ちに抗菌薬を開始する",
        "症状が改善したら抗菌薬は即日中止してよい"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "抗菌薬適正使用（AMS）の原則は、感染フォーカスと起因菌を推定し、最も有効でスペクトラムが狭い薬剤を選択することである。広域抗菌薬の乱用は耐性菌を増やし、費用・副作用も増大させる。"
    },
    {
      "id": "infection_entry_002",
      "question": "細菌性髄膜炎の典型的な三徴として正しいのはどれか。",
      "choices": [
        "発熱・頭痛・項部硬直",
        "発熱・嘔吐・下痢",
        "意識障害・痙攣・高血圧",
        "頭痛・複視・眼球突出"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "細菌性髄膜炎の典型的な三徴は発熱・頭痛・項部硬直である。ただし三徴が揃うのは約40〜50%であり、疑いがあれば血液培養後に速やかに抗菌薬を開始する（腰椎穿刺待ちで抗菌薬を遅らせない）。"
    },
    {
      "id": "infection_entry_003",
      "question": "尿路感染症の診断で最も重要な検体はどれか。",
      "choices": [
        "血液培養",
        "中間尿の尿培養",
        "喀痰培養",
        "便培養"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "尿路感染症では中間尿の尿培養が診断と起因菌同定に最も重要。採取前に清潔操作を行い、排尿中間部分を採取する。血液培養は腎盂腎炎や尿路感染症に伴う菌血症が疑われる場合に追加する。"
    },
    {
      "id": "infection_entry_004",
      "question": "β-ラクタム系抗菌薬にアレルギー歴がある患者への別のβ-ラクタム系薬使用時の交差反応率として最も適切なのはどれか。",
      "choices": [
        "ほぼ100%（使用不可）",
        "約1〜2%（比較的低い）",
        "約30〜40%",
        "約60〜70%"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "β-ラクタム間の交差反応率は以前より高く言われていたが（10%）、現在は約1〜2%と報告されている。アレルギー歴の詳細（アナフィラキシーか軽度の発疹か等）を確認し、重篤なアナフィラキシー歴があれば別系統の抗菌薬を検討する。"
    },
    {
      "id": "infection_entry_005",
      "question": "壊死性筋膜炎を強く疑う所見はどれか。",
      "choices": [
        "表面の軽度な発赤と浮腫",
        "体表所見に不釣り合いな激しい疼痛・皮膚の変色（鉛色/紫色）・ガス産生",
        "境界明瞭な皮膚の発赤（蜂窩織炎典型像）",
        "発熱を伴わない局所の腫脹"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "壊死性筋膜炎の特徴は体表所見に不釣り合いな激しい疼痛、皮膚の鉛色・紫色への変色、皮下ガス産生、急速な進行である。早期外科的デブリードマンが予後を決定する緊急外科疾患。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Infectious Diseases",
  "questions": [
    {
      "id": "infection_entry_001",
      "question": "Which statement best describes the basic principle of antibiotic selection for bacterial infections?",
      "choices": [
        "Choosing a broad-spectrum antibiotic prevents treatment failure",
        "Estimate the infection source and likely pathogen, then select the most targeted effective antibiotic",
        "Start antibiotics immediately whenever a patient has fever",
        "Antibiotics can be stopped as soon as symptoms improve"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Antimicrobial stewardship (AMS) calls for identifying the infection source and likely pathogen, then choosing the narrowest effective antibiotic. Overuse of broad-spectrum agents promotes resistance and increases cost and side effects."
    },
    {
      "id": "infection_entry_002",
      "question": "What is the classic triad of bacterial meningitis?",
      "choices": [
        "Fever, headache, and nuchal rigidity",
        "Fever, vomiting, and diarrhea",
        "Altered mental status, seizures, and hypertension",
        "Headache, diplopia, and proptosis"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "The classic triad of bacterial meningitis is fever, headache, and nuchal rigidity. However, all three are present in only about 40–50% of cases. If meningitis is suspected, draw blood cultures and start antibiotics promptly — do not delay for lumbar puncture."
    },
    {
      "id": "infection_entry_003",
      "question": "What is the most important specimen for diagnosing a urinary tract infection?",
      "choices": [
        "Blood culture",
        "Midstream clean-catch urine culture",
        "Sputum culture",
        "Stool culture"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Midstream clean-catch urine culture is the key specimen for diagnosing UTI and identifying the causative organism. Blood cultures should be added when pyelonephritis or bacteremia is suspected."
    },
    {
      "id": "infection_entry_004",
      "question": "What is the approximate cross-reactivity rate when using another beta-lactam in a patient with a reported beta-lactam allergy?",
      "choices": [
        "Nearly 100% (contraindicated)",
        "Approximately 1–2% (relatively low)",
        "Approximately 30–40%",
        "Approximately 60–70%"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Cross-reactivity between beta-lactam classes is approximately 1–2%, lower than the previously cited 10%. Clarify allergy details (anaphylaxis vs. mild rash). For serious prior anaphylaxis, choose a non-beta-lactam antibiotic."
    },
    {
      "id": "infection_entry_005",
      "question": "Which finding strongly suggests necrotizing fasciitis?",
      "choices": [
        "Mild surface redness and edema",
        "Severe pain disproportionate to skin findings, skin discoloration (gray/purple), and gas in tissue",
        "Well-demarcated skin erythema typical of cellulitis",
        "Local swelling without fever"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Necrotizing fasciitis is characterized by pain out of proportion to appearance, skin turning gray or purple, subcutaneous gas, and rapid progression. Prompt surgical debridement is the key to survival — this is a surgical emergency."
    }
  ]
}
```

---

## Task 13: Create gi_symptoms_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/gi_symptoms_entry.json`
- Create: `data/questions/en/entry/gi_symptoms_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "消化器症状",
  "questions": [
    {
      "id": "gi_symptoms_entry_001",
      "question": "腹痛患者の評価において最初に除外すべき状態はどれか。",
      "choices": [
        "機能性消化管障害（過敏性腸症候群）",
        "腸管穿孔・腸閉塞・腹部大動脈瘤破裂・異所性妊娠などの外科的緊急疾患",
        "急性胃炎",
        "便秘"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "腹痛患者ではまず生命を脅かす外科的緊急疾患（腸穿孔・腸閉塞・AAA破裂・異所性妊娠など）を除外することが最優先。見落としは致命的となるため、バイタルサイン・身体診察・妊娠の可能性を迅速に評価する。"
    },
    {
      "id": "gi_symptoms_entry_002",
      "question": "消化管出血においてメレナ（黒色便）が示唆する出血部位はどれか。",
      "choices": [
        "肛門・直腸",
        "Treitz靭帯より口側（上部消化管）",
        "S状結腸",
        "横行結腸"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "メレナ（タール便）は腸内通過時間が長い上部消化管（食道・胃・十二指腸〜Treitz靭帯まで）からの出血で生じる。便が黒色でタール様・悪臭を呈するのは血液がHClや腸内細菌により変性するため。"
    },
    {
      "id": "gi_symptoms_entry_003",
      "question": "急性虫垂炎の典型的な圧痛部位はどれか。",
      "choices": [
        "右季肋部",
        "右下腹部（McBurney点）",
        "左下腹部",
        "臍周囲"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "急性虫垂炎の典型的な圧痛は右下腹部のMcBurney点（臍と右上前腸骨棘を結ぶ線の外側1/3）に生じる。痛みは臍周囲から始まり右下腹部に移動することが多い（移動性疼痛）。"
    },
    {
      "id": "gi_symptoms_entry_004",
      "question": "急性膵炎の最も一般的な原因の組み合わせはどれか。",
      "choices": [
        "糖尿病と高血圧",
        "アルコールと胆石",
        "ウイルス感染と薬剤",
        "外傷と悪性腫瘍"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "急性膵炎の原因の約80%をアルコール（過剰摂取）と胆石（胆管閉塞）が占める。他に薬剤・高中性脂肪血症・外傷・自己免疫などがある。"
    },
    {
      "id": "gi_symptoms_entry_005",
      "question": "腸閉塞（イレウス）の典型的な腹部X線所見はどれか。",
      "choices": [
        "石灰化像",
        "小腸のガス拡張像と鏡面像（ニボー）",
        "腸管壁外の遊離ガス像（free air）",
        "腫瘤影"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "腸閉塞では閉塞より口側の腸管内にガスと液体が貯留し、X線での鏡面像（ニボー：液体と空気の境界面）と腸管のガス拡張像が特徴的。遊離ガス像は消化管穿孔を示す所見。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "GI Symptoms",
  "questions": [
    {
      "id": "gi_symptoms_entry_001",
      "question": "When evaluating a patient with abdominal pain, what must be ruled out first?",
      "choices": [
        "Functional GI disorder (irritable bowel syndrome)",
        "Surgical emergencies such as bowel perforation, bowel obstruction, ruptured AAA, or ectopic pregnancy",
        "Acute gastritis",
        "Constipation"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "The top priority in abdominal pain is ruling out life-threatening surgical emergencies (bowel perforation, obstruction, ruptured AAA, ectopic pregnancy). Missing these is potentially fatal — assess vital signs, perform a physical exam, and check for possible pregnancy promptly."
    },
    {
      "id": "gi_symptoms_entry_002",
      "question": "In GI bleeding, what source does melena (black tarry stool) suggest?",
      "choices": [
        "Anus or rectum",
        "Upper GI tract (proximal to the ligament of Treitz)",
        "Sigmoid colon",
        "Transverse colon"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Melena (black, tarry, foul-smelling stool) results from blood that has undergone degradation during its slow transit through the upper GI tract (esophagus, stomach, duodenum up to the ligament of Treitz)."
    },
    {
      "id": "gi_symptoms_entry_003",
      "question": "What is the classic location of maximal tenderness in acute appendicitis?",
      "choices": [
        "Right upper quadrant",
        "Right lower quadrant (McBurney's point)",
        "Left lower quadrant",
        "Periumbilical"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Acute appendicitis typically produces maximal tenderness at McBurney's point — the junction of the lateral and middle thirds of a line from the umbilicus to the right anterior superior iliac spine. Pain often migrates from periumbilical to right lower quadrant."
    },
    {
      "id": "gi_symptoms_entry_004",
      "question": "What are the two most common causes of acute pancreatitis?",
      "choices": [
        "Diabetes and hypertension",
        "Alcohol and gallstones",
        "Viral infection and medications",
        "Trauma and malignancy"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Alcohol (excess consumption) and gallstones (biliary obstruction) account for approximately 80% of acute pancreatitis cases. Other causes include medications, hypertriglyceridemia, trauma, and autoimmune disease."
    },
    {
      "id": "gi_symptoms_entry_005",
      "question": "What is the classic plain abdominal X-ray finding in bowel obstruction?",
      "choices": [
        "Calcification",
        "Dilated loops of small bowel with air-fluid levels",
        "Free air under the diaphragm",
        "Mass shadow"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Bowel obstruction causes accumulation of gas and fluid proximal to the obstruction, resulting in dilated bowel loops and air-fluid levels (step-ladder pattern) on plain X-ray. Free air indicates bowel perforation, a different diagnosis."
    }
  ]
}
```

---

## Task 14: Create sepsis_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/sepsis_entry.json`
- Create: `data/questions/en/entry/sepsis_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "敗血症",
  "questions": [
    {
      "id": "sepsis_entry_001",
      "question": "Sepsis-3の定義において「臓器障害」を示す指標として用いられるのはどれか。",
      "choices": [
        "体温38℃以上",
        "SOFAスコアの2点以上の上昇",
        "白血球数10,000/μL以上",
        "収縮期血圧100mmHg未満"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Sepsis-3（2016年）では敗血症を「感染に対する宿主反応の調節不全による生命を脅かす臓器障害」と定義し、SOFAスコアの2点以上の急性上昇を臓器障害の指標とする。従来のSIRS基準は削除された。"
    },
    {
      "id": "sepsis_entry_002",
      "question": "敗血症が疑われる患者への初期対応として最も重要なのはどれか。",
      "choices": [
        "CRPが正常化するまで経過観察",
        "血液培養を採取後、速やかに（1時間以内に）抗菌薬を投与する",
        "尿培養を採取してから抗菌薬を開始する",
        "感染科コンサルト後に抗菌薬を開始する"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "敗血症では血液培養採取後、1時間以内の抗菌薬投与が予後改善に直結する。培養採取のために抗菌薬投与を遅らせてはならない。\"Hour-1 Bundle\"（初期1時間以内の対応束）が推奨されている。"
    },
    {
      "id": "sepsis_entry_003",
      "question": "敗血症性ショックの初期輸液として推奨されているのはどれか。",
      "choices": [
        "5%ブドウ糖液",
        "晶質液（生食または乳酸リンゲル液）30mL/kgを3時間以内に投与",
        "4〜5%アルブミン製剤 1000mL",
        "デキストラン等コロイド液"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "SSCガイドラインでは敗血症性ショックの初期輸液として晶質液（生食または乳酸リンゲル液）30mL/kgを3時間以内に投与することを推奨。輸液反応性を評価しながら投与量を調整する。"
    },
    {
      "id": "sepsis_entry_004",
      "question": "quick SOFA（qSOFA）スコアの評価項目として正しいのはどれか。",
      "choices": [
        "体温・白血球数・血圧",
        "呼吸数≥22回/分・意識変容・収縮期血圧≤100mmHg",
        "乳酸値・クレアチニン・ビリルビン",
        "尿量・体温・脈拍数"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "qSOFAは院外・初期評価向けの簡易スクリーニングツールで、①呼吸数≥22回/分、②意識変容（GCS<15）、③収縮期血圧≤100mmHg の3項目を評価。2点以上で敗血症の可能性が高い。"
    },
    {
      "id": "sepsis_entry_005",
      "question": "敗血症における乳酸値（血中乳酸）上昇が示す意味として最も適切なのはどれか。",
      "choices": [
        "筋肉量が多いことを示す",
        "組織の嫌気性代謝（組織低酸素）が起きていることを示す",
        "肝機能が正常であることを示す",
        "心拍出量が増加していることを示す"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "乳酸値上昇は組織への酸素供給が不十分で嫌気性代謝が生じていることを示す。敗血症では≥2mmol/Lで予後不良、≥4mmol/LはSeptic shockの定義の一部。血圧が正常でも乳酸高値はショックの存在を示唆する。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Sepsis",
  "questions": [
    {
      "id": "sepsis_entry_001",
      "question": "In the Sepsis-3 definition, which measure is used to identify organ dysfunction?",
      "choices": [
        "Temperature ≥ 38°C",
        "An acute increase in SOFA score of 2 points or more",
        "WBC count ≥ 10,000/μL",
        "Systolic blood pressure < 100 mmHg"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Sepsis-3 (2016) defines sepsis as 'life-threatening organ dysfunction caused by a dysregulated host response to infection,' operationalized as an acute SOFA increase of ≥ 2 points. The previous SIRS criteria were removed."
    },
    {
      "id": "sepsis_entry_002",
      "question": "Which is the most important initial action in a patient with suspected sepsis?",
      "choices": [
        "Observe until CRP normalizes",
        "Draw blood cultures and administer antibiotics within 1 hour",
        "Wait for urine culture results before starting antibiotics",
        "Consult infectious disease before starting antibiotics"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "In sepsis, drawing blood cultures and administering antibiotics within 1 hour of recognition significantly improves outcomes. Never delay antibiotics to wait for culture results. The Hour-1 Bundle includes early antibiotics as a core element."
    },
    {
      "id": "sepsis_entry_003",
      "question": "Which is the recommended initial fluid resuscitation for septic shock?",
      "choices": [
        "5% dextrose in water",
        "Crystalloid (normal saline or lactated Ringer's) 30 mL/kg within 3 hours",
        "4–5% albumin 1000 mL",
        "Colloid (e.g., dextran)"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "SSC guidelines recommend 30 mL/kg of crystalloid (normal saline or lactated Ringer's) within 3 hours for septic shock. Fluid responsiveness should be assessed and fluid titrated accordingly."
    },
    {
      "id": "sepsis_entry_004",
      "question": "Which items are assessed in the quick SOFA (qSOFA) score?",
      "choices": [
        "Temperature, WBC count, blood pressure",
        "Respiratory rate ≥ 22/min, altered mentation, systolic BP ≤ 100 mmHg",
        "Lactate, creatinine, bilirubin",
        "Urine output, temperature, heart rate"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "qSOFA is a quick bedside screening tool with three criteria: (1) RR ≥ 22/min, (2) altered mentation (GCS < 15), and (3) SBP ≤ 100 mmHg. A score of 2 or more suggests possible sepsis."
    },
    {
      "id": "sepsis_entry_005",
      "question": "What does an elevated blood lactate level indicate in sepsis?",
      "choices": [
        "High muscle mass",
        "Anaerobic metabolism due to inadequate tissue oxygen delivery",
        "Normal liver function",
        "Increased cardiac output"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Elevated lactate (≥ 2 mmol/L) signals anaerobic metabolism from insufficient tissue oxygenation. In sepsis, lactate ≥ 4 mmol/L is part of the septic shock definition. Even with normal blood pressure, high lactate indicates occult shock."
    }
  ]
}
```

---

## Task 15: Create endocrine_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/endocrine_entry.json`
- Create: `data/questions/en/entry/endocrine_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "内分泌救急",
  "questions": [
    {
      "id": "endocrine_entry_001",
      "question": "低血糖の交感神経興奮症状（発汗・動悸・振戦）が出現し始める血糖値として最も適切なのはどれか。",
      "choices": [
        "血糖 50mg/dL未満",
        "血糖 70mg/dL前後",
        "血糖 100mg/dL未満",
        "血糖 120mg/dL未満"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "健常者では血糖約70mg/dLで交感神経が賦活され、発汗・動悸・振戦・不安などの警告症状が出現する。さらに低下（約50mg/dL以下）すると中枢神経症状（意識障害・痙攣）が現れる。"
    },
    {
      "id": "endocrine_entry_002",
      "question": "意識障害を伴う重症低血糖の初期治療として適切なのはどれか。",
      "choices": [
        "インスリン追加投与",
        "50%ブドウ糖液 20〜40mL の静脈内投与",
        "生理食塩水 500mL 急速投与",
        "5%ブドウ糖液 500mL 点滴"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "意識障害を伴う重症低血糖では経口補給が不可能なため、50%ブドウ糖液 20〜40mLを静脈内投与する。意識回復後も再低血糖を防ぐため持続点滴（10%ブドウ糖等）を行い、原因（インスリン過量・スルホニル尿素薬等）を検索する。"
    },
    {
      "id": "endocrine_entry_003",
      "question": "糖尿病性ケトアシドーシス（DKA）の典型的な症状として正しい組み合わせはどれか。",
      "choices": [
        "体重増加・徐脈・低体温",
        "多尿・多飲・悪心嘔吐・クスマウル大呼吸",
        "低血糖・冷汗・振戦",
        "高血圧・浮腫・尿量減少"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "DKAは1型糖尿病で多く、インスリン欠乏による高血糖・ケトン体産生・代謝性アシドーシスが生じる。多尿・多飲・倦怠感に加え、悪心嘔吐、アシドーシスを代償するクスマウル大呼吸（深く速い呼吸）が特徴。"
    },
    {
      "id": "endocrine_entry_004",
      "question": "甲状腺クリーゼの初期対応として適切でないのはどれか。",
      "choices": [
        "輸液と全身管理",
        "β遮断薬による頻脈コントロール",
        "チアマゾール等の甲状腺ホルモン合成阻害薬の投与",
        "甲状腺ホルモン製剤（レボチロキシン）の追加投与"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "甲状腺クリーゼは甲状腺ホルモン過剰状態の急性増悪であり、甲状腺ホルモン製剤の追加は禁忌。治療は①合成阻害薬（チアマゾール/PTU）→②ルゴール液（放出抑制）→③β遮断薬（頻脈コントロール）→④ステロイド→全身管理。"
    },
    {
      "id": "endocrine_entry_005",
      "question": "副腎クリーゼを疑った場合の初期対応として正しいのはどれか。",
      "choices": [
        "ステロイド投与を控え、まず下垂体MRIで原因を確認する",
        "速やかにヒドロコルチゾンを静脈内投与する",
        "経口ステロイドに切り替えて経過観察する",
        "血液検査結果が出るまで治療を保留する"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "副腎クリーゼ（急性副腎不全）はショック・低血糖・電解質異常を伴う緊急状態。診断が確定する前でも疑いが強ければヒドロコルチゾン100mgを静注し、治療を優先する。採血はするが結果を待たずに投与開始。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Endocrine Emergencies",
  "questions": [
    {
      "id": "endocrine_entry_001",
      "question": "At approximately what blood glucose level do adrenergic warning symptoms of hypoglycemia (sweating, palpitations, tremor) begin?",
      "choices": [
        "Below 50 mg/dL",
        "Around 70 mg/dL",
        "Below 100 mg/dL",
        "Below 120 mg/dL"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "In healthy individuals, the sympathetic nervous system is activated at approximately 70 mg/dL, producing warning symptoms (sweating, palpitations, tremor, anxiety). Neuroglycopenic symptoms (confusion, seizures) appear as glucose falls further, typically below 50 mg/dL."
    },
    {
      "id": "endocrine_entry_002",
      "question": "What is the appropriate initial treatment for severe hypoglycemia with altered mental status?",
      "choices": [
        "Additional insulin administration",
        "50% dextrose solution 20–40 mL IV push",
        "Normal saline 500 mL rapid infusion",
        "5% dextrose 500 mL IV drip"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Oral intake is not possible when the patient is obtunded, so 50% dextrose 20–40 mL IV is given. After recovery, a continuous dextrose infusion prevents recurrence. Identify and address the underlying cause (excess insulin, sulfonylurea, etc.)."
    },
    {
      "id": "endocrine_entry_003",
      "question": "Which combination of findings is typical of diabetic ketoacidosis (DKA)?",
      "choices": [
        "Weight gain, bradycardia, and hypothermia",
        "Polyuria, polydipsia, nausea/vomiting, and Kussmaul breathing",
        "Hypoglycemia, cold sweats, and tremor",
        "Hypertension, edema, and decreased urine output"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "DKA (common in type 1 diabetes) is caused by insulin deficiency leading to hyperglycemia, ketone production, and metabolic acidosis. Classic features include polyuria, polydipsia, nausea/vomiting, and Kussmaul breathing (deep, rapid respirations as respiratory compensation for acidosis)."
    },
    {
      "id": "endocrine_entry_004",
      "question": "Which intervention is NOT appropriate in the initial management of thyroid storm?",
      "choices": [
        "IV fluids and supportive care",
        "Beta-blockers to control tachycardia",
        "Thionamide (e.g., methimazole) to block thyroid hormone synthesis",
        "Administration of levothyroxine (thyroid hormone supplementation)"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "Thyroid storm is an acute exacerbation of thyroid hormone excess. Giving additional thyroid hormone is contraindicated. Treatment includes (1) thionamides to block synthesis, (2) Lugol's iodine to block release (given after thionamides), (3) beta-blockers for tachycardia, (4) corticosteroids, and supportive care."
    },
    {
      "id": "endocrine_entry_005",
      "question": "When adrenal crisis is suspected, what is the correct initial management?",
      "choices": [
        "Withhold steroids and confirm the cause with pituitary MRI first",
        "Administer IV hydrocortisone promptly",
        "Switch to oral steroids and observe",
        "Hold treatment until lab results are available"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Adrenal crisis (acute adrenal insufficiency) is a life-threatening emergency with shock, hypoglycemia, and electrolyte disturbances. IV hydrocortisone 100 mg should be given immediately when the diagnosis is strongly suspected — draw blood for cortisol first, but do not wait for results before treating."
    }
  ]
}
```

---

## Task 16: Create pediatric_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/pediatric_entry.json`
- Create: `data/questions/en/entry/pediatric_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "小児救急",
  "questions": [
    {
      "id": "pediatric_entry_001",
      "question": "1〜3歳小児の正常呼吸数として適切なのはどれか。",
      "choices": [
        "12〜15回/分",
        "20〜30回/分",
        "35〜45回/分",
        "50〜60回/分"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "小児は年齢が若いほど正常呼吸数が多い。1〜3歳では20〜30回/分が正常。新生児（30〜60回/分）→乳児（25〜50回/分）→幼児（20〜30回/分）→学童（15〜20回/分）→成人（12〜20回/分）と変化する。"
    },
    {
      "id": "pediatric_entry_002",
      "question": "小児の気道の特徴として正しいのはどれか。",
      "choices": [
        "咽頭が広く舌が成人と同等の大きさである",
        "気管が成人より長い",
        "声門の位置が成人より尾側にある",
        "後頭部が大きく、仰臥位では頸部屈曲位になりやすい"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "小児（特に乳幼児）は後頭部が大きく仰臥位にすると頸部が屈曲しやすい。気道確保の際は肩の下にパッドを入れて頭部を中立位に保つ必要がある。また舌が相対的に大きく気道閉塞を起こしやすい。"
    },
    {
      "id": "pediatric_entry_003",
      "question": "小児の発熱において最も緊急性が高いと判断すべき状況はどれか。",
      "choices": [
        "38℃未満の微熱",
        "3歳以上で活気があり哺乳・食事が良好",
        "38℃以上かつ生後28日未満の新生児",
        "発熱が3日以内で解熱薬に反応している"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "生後28日未満の新生児が38℃以上の発熱を示す場合は、細菌性敗血症・髄膜炎・尿路感染等の重篤な細菌感染症（SBI）を強く疑い、全例で血液・尿・髄液培養を行い入院加療を検討する。"
    },
    {
      "id": "pediatric_entry_004",
      "question": "クループ（急性喉頭気管支炎）の特徴的な症状はどれか。",
      "choices": [
        "吸気性喘鳴と犬吠様咳嗽",
        "呼気性喘鳴と発作性の咳",
        "突然の嚥下困難・流涎・高熱",
        "発疹を伴う発熱"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "クループは声門下の炎症による上気道閉塞で、吸気性喘鳴（stridor）と犬吠様咳嗽（バークのような咳）が特徴。呼気性喘鳴は気管支喘息に特徴的。急な嚥下困難・流涎は急性喉頭蓋炎を示唆する。"
    },
    {
      "id": "pediatric_entry_005",
      "question": "小児に対する除細動エネルギーの初期量として推奨されているのはどれか。",
      "choices": [
        "0.5J/kg",
        "2J/kg",
        "5J/kg",
        "10J/kg"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "小児の除細動初期エネルギーは2J/kgが推奨（JRCおよびAHAガイドライン）。効果がなければ4J/kgに増量する。成人では単相性360J/二相性120〜200Jとは異なることに注意。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Pediatric Emergencies",
  "questions": [
    {
      "id": "pediatric_entry_001",
      "question": "What is the normal respiratory rate for a child aged 1–3 years?",
      "choices": [
        "12–15 breaths/min",
        "20–30 breaths/min",
        "35–45 breaths/min",
        "50–60 breaths/min"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Normal respiratory rates are higher in younger children. For ages 1–3, 20–30/min is normal. Ranges by age: newborn (30–60) → infant (25–50) → toddler (20–30) → school-age (15–20) → adult (12–20)."
    },
    {
      "id": "pediatric_entry_002",
      "question": "Which statement correctly describes the pediatric airway?",
      "choices": [
        "The pharynx is wide and the tongue is proportionally similar to adults",
        "The trachea is longer than in adults",
        "The glottis is positioned more caudally than in adults",
        "The large occiput causes neck flexion in the supine position"
      ],
      "answers": [3],
      "selectCount": 1,
      "explanation": "Infants and young children have a prominent occiput that causes neck flexion when supine. A shoulder roll is needed to maintain a neutral airway position. The tongue is also proportionally large, making airway obstruction more likely."
    },
    {
      "id": "pediatric_entry_003",
      "question": "Which situation requires the most urgent evaluation for fever in a child?",
      "choices": [
        "Temperature below 38°C",
        "A child over 3 years old who is active and feeding well",
        "Fever ≥ 38°C in a neonate younger than 28 days",
        "Fever within 3 days that responds to antipyretics"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "Fever ≥ 38°C in a neonate under 28 days of age requires urgent evaluation for serious bacterial infection (SBI) including sepsis, meningitis, and UTI. Full sepsis workup (blood, urine, CSF cultures) and hospital admission are indicated."
    },
    {
      "id": "pediatric_entry_004",
      "question": "What are the characteristic symptoms of croup (acute laryngotracheobronchitis)?",
      "choices": [
        "Inspiratory stridor and a barking cough",
        "Expiratory wheezing and paroxysmal cough",
        "Sudden dysphagia, drooling, and high fever",
        "Fever with rash"
      ],
      "answers": [0],
      "selectCount": 1,
      "explanation": "Croup is caused by subglottic inflammation producing upper airway narrowing. Classic features are inspiratory stridor and a seal-like (barking) cough. Expiratory wheeze is typical of asthma. Sudden dysphagia and drooling suggest acute epiglottitis."
    },
    {
      "id": "pediatric_entry_005",
      "question": "What is the recommended initial defibrillation energy dose for children?",
      "choices": [
        "0.5 J/kg",
        "2 J/kg",
        "5 J/kg",
        "10 J/kg"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "The initial defibrillation dose for children is 2 J/kg (JRC and AHA guidelines). If unsuccessful, increase to 4 J/kg for subsequent shocks. This differs from adult dosing (monophasic 360 J or biphasic 120–200 J)."
    }
  ]
}
```

---

## Task 17: Create cardiology_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/cardiology_entry.json`
- Create: `data/questions/en/entry/cardiology_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "循環器救急",
  "questions": [
    {
      "id": "cardiology_entry_001",
      "question": "ST上昇型心筋梗塞（STEMI）と診断した場合の最優先対応はどれか。",
      "choices": [
        "冠動脈バイパス術（CABG）の手配",
        "経皮的冠動脈インターベンション（PCI）への迅速な移行",
        "抗凝固療法開始後にCT撮影",
        "カテーテル検査の待機予約"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "STEMIの治療目標は「Door-to-Balloon time 90分以内」の緊急PCIである。早期の冠動脈再灌流が心筋救済と予後改善に直結する（Time is muscle）。"
    },
    {
      "id": "cardiology_entry_002",
      "question": "心電図で心房細動が確認された場合の対応として最初に確認すべきことはどれか。",
      "choices": [
        "甲状腺機能の確認",
        "バイタルサインの安定性と血行動態への影響",
        "echocardiographyによる心機能評価",
        "ホルター心電図の施行"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "心房細動が発見されたらまずバイタルサインと血行動態（低血圧・ショック・急性心不全の有無）を確認する。血行動態不安定であれば緊急電気的除細動の適応となる。安定していれば脈拍数コントロールや抗凝固療法を検討する。"
    },
    {
      "id": "cardiology_entry_003",
      "question": "心房細動における血栓塞栓症リスク評価に用いるスコアはどれか。",
      "choices": [
        "TIMIスコア",
        "CHA₂DS₂-VAScスコア",
        "GRACEスコア",
        "Wellsスコア"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "CHA₂DS₂-VAScは心房細動患者の脳卒中リスクを評価するスコア（心不全・高血圧・高齢・糖尿病・脳卒中/TIA既往・血管疾患・年齢・性別）。スコアに基づいて抗凝固療法の適応を判断する。"
    },
    {
      "id": "cardiology_entry_004",
      "question": "完全房室ブロック（第3度AVブロック）の特徴的な心電図所見はどれか。",
      "choices": [
        "PR間隔が徐々に延長しQRS脱落がある",
        "QRS脱落があるがPR間隔は一定",
        "P波とQRSが無関連（房室解離）に出現する",
        "PR間隔が0.20秒以上だが全P波にQRSが続く"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "第3度（完全）房室ブロックは心房と心室の興奮が全く独立した房室解離状態。P波とQRSに無関連な律動が見られる。緊急ペーシングの適応となることが多い。"
    },
    {
      "id": "cardiology_entry_005",
      "question": "無脈性心室頻拍（Pulseless VT）に対する初期対応はどれか。",
      "choices": [
        "アミオダロンの静脈内投与",
        "β遮断薬の静脈内投与",
        "即時除細動",
        "12誘導心電図撮影後に治療を決定"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "無脈性VTは心停止リズムであり、除細動が最優先。CPRを継続しながら可及的速やかに除細動を行う。薬剤（アミオダロン等）は除細動不成功後に検討する。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Cardiology Emergencies",
  "questions": [
    {
      "id": "cardiology_entry_001",
      "question": "When ST-elevation myocardial infarction (STEMI) is diagnosed, what is the highest priority action?",
      "choices": [
        "Arrange coronary artery bypass grafting (CABG)",
        "Activate the cath lab for urgent percutaneous coronary intervention (PCI)",
        "Start anticoagulation and obtain CT imaging",
        "Schedule an elective catheterization"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "The goal in STEMI is door-to-balloon time within 90 minutes with urgent PCI. Early coronary reperfusion directly saves myocardium and improves outcomes — \"Time is muscle.\""
    },
    {
      "id": "cardiology_entry_002",
      "question": "When atrial fibrillation is found on ECG, what should be assessed first?",
      "choices": [
        "Thyroid function tests",
        "Hemodynamic stability (vital signs, signs of hypotension or acute heart failure)",
        "Echocardiogram for cardiac function",
        "Holter monitor"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "When AF is identified, immediately assess hemodynamic stability. Hypotension, shock, or acute pulmonary edema indicate urgent electrical cardioversion. If stable, rate control and anticoagulation can be planned."
    },
    {
      "id": "cardiology_entry_003",
      "question": "Which scoring system is used to assess thromboembolic risk in atrial fibrillation?",
      "choices": [
        "TIMI score",
        "CHA₂DS₂-VASc score",
        "GRACE score",
        "Wells score"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "CHA₂DS₂-VASc scores stroke risk in AF patients based on heart failure, hypertension, age, diabetes, prior stroke/TIA, vascular disease, and sex. It guides the decision to start anticoagulation therapy."
    },
    {
      "id": "cardiology_entry_004",
      "question": "What is the characteristic ECG finding in complete (third-degree) atrioventricular block?",
      "choices": [
        "Progressive PR prolongation with occasional dropped QRS",
        "Dropped QRS complexes with constant PR interval",
        "P waves and QRS complexes completely independent (AV dissociation)",
        "PR interval > 0.20 s but every P wave is followed by a QRS"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "In third-degree (complete) AV block, the atria and ventricles beat independently — P waves and QRS complexes have no relationship to each other. This is a common indication for emergency pacing."
    },
    {
      "id": "cardiology_entry_005",
      "question": "What is the immediate treatment for pulseless ventricular tachycardia (pulseless VT)?",
      "choices": [
        "IV amiodarone",
        "IV beta-blocker",
        "Immediate defibrillation",
        "Obtain a 12-lead ECG before deciding on treatment"
      ],
      "answers": [2],
      "selectCount": 1,
      "explanation": "Pulseless VT is a shockable cardiac arrest rhythm — immediate defibrillation is the priority. Continue CPR and defibrillate as quickly as possible. Antiarrhythmics (e.g., amiodarone) are considered after failed defibrillation attempts."
    }
  ]
}
```

---

## Task 18: Create toxicology_entry (JA + EN)

**Files:**
- Create: `data/questions/ja/entry/toxicology_entry.json`
- Create: `data/questions/en/entry/toxicology_entry.json`

All 5 questions are new.

- [ ] **Step 1: Create JA file**

```json
{
  "category": "中毒",
  "questions": [
    {
      "id": "toxicology_entry_001",
      "question": "有機リン農薬中毒の特徴的なムスカリン様症状として正しいのはどれか。",
      "choices": [
        "散瞳・頻脈・口腔乾燥（抗コリン症状）",
        "縮瞳・流涎・気管支痙攣・徐脈",
        "発熱・高血圧・筋硬直",
        "黄疸・肝腫大・凝固障害"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "有機リン中毒はコリンエステラーゼ阻害によりアセチルコリンが蓄積する。ムスカリン様症状（DUMBELS：下痢・尿失禁・縮瞳・徐脈・気管支痙攣・嘔吐・流涎）が特徴。解毒薬はアトロピン（ムスカリン拮抗）とPAM（コリンエステラーゼ再活性化）。"
    },
    {
      "id": "toxicology_entry_002",
      "question": "アセトアミノフェン過量摂取で最も問題となる臓器障害はどれか。",
      "choices": [
        "腎障害",
        "肝障害",
        "心毒性（QT延長・不整脈）",
        "神経毒性（痙攣・意識障害）"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "アセトアミノフェン過量摂取では肝毒性が最大の問題。代謝産物NAPQIがグルタチオンを枯渇させ肝細胞障害をきたす。急性肝不全に至ることがある。解毒薬はN-アセチルシステイン（NAC）で、摂取後8時間以内が最も効果的。"
    },
    {
      "id": "toxicology_entry_003",
      "question": "アセトアミノフェン過量摂取に対する解毒薬はどれか。",
      "choices": [
        "フルマゼニル",
        "N-アセチルシステイン（NAC）",
        "アトロピン",
        "ナロキソン"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "NACはグルタチオンの前駆体として肝臓内でグルタチオンを補充し、NAPQIを解毒する。経口・静注いずれも有効。摂取量をRumack-Matthew nomogramで評価し投与適応を判断する。"
    },
    {
      "id": "toxicology_entry_004",
      "question": "オピオイド中毒の典型的な三徴はどれか。",
      "choices": [
        "散瞳・頻脈・高血圧",
        "縮瞳・意識障害・呼吸抑制",
        "発熱・発汗・下痢",
        "口腔乾燥・尿閉・幻覚"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "オピオイド中毒の三徴は縮瞳（針状瞳孔）・意識障害（昏睡）・呼吸抑制である。解毒薬はナロキソン（オピオイド拮抗薬）。効果は短時間のため再投与または持続投与が必要なことがある。"
    },
    {
      "id": "toxicology_entry_005",
      "question": "ベンゾジアゼピン系薬過量摂取に対する解毒薬はどれか。",
      "choices": [
        "ナロキソン",
        "フルマゼニル",
        "N-アセチルシステイン",
        "アトロピン"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "フルマゼニルはGABA-A受容体のベンゾジアゼピン結合部位に競合的に拮抗し、鎮静・呼吸抑制を回復させる。ただし効果持続時間が短い（30〜60分）こと、てんかん患者では痙攣を誘発するリスクがあることに注意。"
    }
  ]
}
```

- [ ] **Step 2: Create EN file**

```json
{
  "category": "Toxicology",
  "questions": [
    {
      "id": "toxicology_entry_001",
      "question": "Which symptoms are characteristic muscarinic effects of organophosphate poisoning?",
      "choices": [
        "Mydriasis, tachycardia, and dry mouth (anticholinergic symptoms)",
        "Miosis, salivation, bronchospasm, and bradycardia",
        "Fever, hypertension, and muscle rigidity",
        "Jaundice, hepatomegaly, and coagulopathy"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Organophosphate poisoning inhibits acetylcholinesterase, causing acetylcholine accumulation. Muscarinic effects (DUMBELS: diarrhea, urination, miosis, bradycardia, bronchospasm/emesis, lacrimation, salivation) are characteristic. Antidotes are atropine (antimuscarinic) and pralidoxime/PAM (reactivates cholinesterase)."
    },
    {
      "id": "toxicology_entry_002",
      "question": "What is the primary organ damage from acetaminophen overdose?",
      "choices": [
        "Kidney injury",
        "Liver injury",
        "Cardiac toxicity (QT prolongation, arrhythmias)",
        "Neurotoxicity (seizures, altered mental status)"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Acetaminophen overdose produces hepatotoxicity via the metabolite NAPQI, which depletes glutathione and damages hepatocytes. It can progress to acute liver failure. N-acetylcysteine (NAC) is the antidote, most effective within 8 hours of ingestion."
    },
    {
      "id": "toxicology_entry_003",
      "question": "What is the antidote for acetaminophen overdose?",
      "choices": [
        "Flumazenil",
        "N-acetylcysteine (NAC)",
        "Atropine",
        "Naloxone"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "NAC replenishes glutathione stores in the liver, enabling detoxification of NAPQI. It can be given orally or IV. Ingestion dose is plotted on the Rumack-Matthew nomogram to guide treatment decisions."
    },
    {
      "id": "toxicology_entry_004",
      "question": "What is the classic triad of opioid toxidrome?",
      "choices": [
        "Mydriasis, tachycardia, and hypertension",
        "Miosis, altered mental status, and respiratory depression",
        "Fever, diaphoresis, and diarrhea",
        "Dry mouth, urinary retention, and hallucinations"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "The opioid toxidrome triad is pinpoint miosis, depressed consciousness, and respiratory depression. Naloxone is the antidote (opioid receptor antagonist). Repeat dosing or infusion may be needed due to naloxone's short duration of action."
    },
    {
      "id": "toxicology_entry_005",
      "question": "What is the antidote for benzodiazepine overdose?",
      "choices": [
        "Naloxone",
        "Flumazenil",
        "N-acetylcysteine",
        "Atropine"
      ],
      "answers": [1],
      "selectCount": 1,
      "explanation": "Flumazenil competitively antagonizes benzodiazepine binding at the GABA-A receptor, reversing sedation and respiratory depression. Note: its duration is short (30–60 min) and it can precipitate seizures in patients with benzodiazepine dependence or epilepsy."
    }
  ]
}
```

---

## Final Verification

- [ ] **Verify all 30 question files exist** (15 JA + 15 EN in `data/questions/{ja,en}/entry/`)
- [ ] **Verify data/levels.json** has entry first: `["entry","basic","advanced","master"]`
- [ ] **Verify data/categories.ja.json** has 15 entry categories prepended and `ed_first_steps_basic` removed
- [ ] **Verify data/categories.en.json** same as above
- [ ] **Open app → Entry level** — confirm 15 category cards appear
- [ ] **Start a quiz** from one entry category — confirm questions load, 4 choices, single answer
- [ ] **Switch language to EN** — confirm EN questions load for entry categories
- [ ] **Check Basic level** — confirm `ed_first_steps_basic` no longer appears as a category
- [ ] **User git action:** Delete the obsolete files manually (Claude will not run git):
  ```
  git rm data/questions/ja/basic/ed_first_steps_basic.json
  git rm data/questions/en/basic/ed_first_steps_basic.json
  git add -A
  git commit -m "feat: add entry level with 15 categories x 5 questions (JA+EN); retire ed_first_steps_basic"
  ```

