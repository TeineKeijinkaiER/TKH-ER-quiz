// js/i18n.js
// UI string dictionary and i18n helpers.

const I18N = {
  ja: {
    appSubtitle: "救急医学クイズ",
    eyebrow: "Emergency Medicine Training",
    levelTitle: "レベル選択",
    levelEyebrow: "難易度を選んでください",
    btnClearLog: "クリア記録",
    btnHistory: "履歴",
    btnSoundOff: "音OFF",
    btnSoundOn: "音ON",
    titleSoundOff: "効果音と音楽をOFFにする",
    titleSoundOn: "効果音と音楽をONにする",
    setupTitle: "クイズ設定",
    roleLegend: "職種",
    roleRequired: "必須",
    roleResident: "研修医",
    roleSeniorResident: "専攻医",
    roleDoctor: "医師",
    roleNurse: "看護師",
    roleOther: "その他",
    levelLegend: "レベル",
    levelBasic: "Basic",
    levelAdvanced: "Advanced",
    levelMaster: "Master",
    countLegend: "出題数",
    countSuffix: "問",
    summaryCategory: "カテゴリー",
    summaryCategoryLoading: "読み込み中",
    summaryTimeLimit: "制限時間",
    summaryTimeLimitValue: "1問 30秒",
    quizQuit: "ホームへ戻る",
    btnNotice: "使い方",
    noticeTitle: "このクイズについて",
    noticeUpdatesTitle: "アップデート履歴",
    noticeClose: "閉じる",
    noticeBody: `<p>このクイズアプリは、手稲渓仁会病院 救命救急センターにおける若手医師の学習支援を目的として、非営利で作成したものです。</p>
<h3>学習目的について</h3>
<p>本クイズは、日常的な医学学習を目的としたものです。実際の診療における診断・治療方針を直接示すものではありません。</p>
<p>内容は、作成時点で参照可能な医学ガイドラインや医学論文などに基づくよう努めています。ただし、一部の診療方針、薬剤の使用方法、院内対応などは、当施設の運用に準じています。</p>
<p>実際の診療では、本クイズの内容だけで判断せず、最新の公式ガイドライン、患者さん個別の状況、上級医・指導医の助言などを踏まえて判断してください。</p>
<h3>免責事項</h3>
<p>本アプリの利用、または内容を参考にしたことにより生じた結果について、当施設および作成者は責任を負いかねます。診療に関する最終判断は、現場の医療者の責任において行ってください。</p>
<h3>回答形式とクリア条件</h3>
<p>各問題は、30秒以内に回答する形式です。時間が短い場合は、一時停止ボタン（⏸）をご利用ください。一時停止中は、問題文をゆっくり確認できます。</p>
<p>カテゴリー内のすべての問題に正解すると、クリアとなります。ただし、一時停止機能を使用した場合は、クリア判定の対象外となります。</p>
<h3>データ収集について</h3>
<p>教育内容の改善のため、回答結果を匿名で収集しています。収集する情報は、職種、カテゴリー、点数、所要時間などです。氏名、職員番号、メールアドレスなど、個人を特定できる情報は収集していません。</p>
<h3>動作環境</h3>
<p>推奨ブラウザは、Chrome、Edge、Safari の最新バージョンです。古いブラウザや一部の端末では、正常に動作しない場合があります。</p>
<h3>著作権</h3>
<p>本アプリ内の問題文、画像、解説などの無断転載、複製、配布、改変、二次利用はご遠慮ください。</p>
<h3>更新について</h3>
<p>問題内容は、必要に応じて修正・追加されます。更新が行われたカテゴリーはクリア状態がリセットされますので、ぜひ再挑戦してください。</p>`,
    quizPause: "⏸",
    quizResume: "▶ 再開",
    resultEyebrow: "Result",
    resultTitle: "演習結果",
    finishLabel: "Finish",
    clearLabel: "CLEAR!",
    btnRetry: "再挑戦",
    btnHome: "メイン画面",
    btnReviewToggleCollapse: "折りたたむ",
    btnReviewToggleExpand: "表示する",
    reviewHeading: "解答レビュー",
    rankingEyebrow: "Local History",
    rankingTitle: "履歴",
    rankingEmpty: "記録はまだありません。",
    btnResetHistory: "履歴を全削除",
    clearEyebrow: "Clear History",
    clearTitle: "クリア記録",
    btnResetClear: "クリア記録を全削除",
    disclaimer: "⚠️ このクイズは学習目的のコンテンツです。実際の臨床現場で患者を診療する際は、必ず最新のガイドラインや医療情報をご確認ください。",
    langToggleJa: "JP",
    langToggleEn: "EN",
    errorLoadOffline: "問題データを読み込めません。ローカルHTTPサーバーで開いてください。",
    errorCategoryLoad: "カテゴリーを読み込めていません。",
    errorInsufficientQuestions: "選択した出題数に対して問題数が不足しています。",
    roleSelectPrompt: "職種を選択してください。",
    levelClearSuffix: "クリア済み",
    selectedCategorySuffix: "問",
    noSelection: "未選択",
    answerSubmitLabel: "回答する",
    answerSelected: "選択",
    userAnswerTimedOut: "時間切れ",
    userAnswerLabel: "あなたの回答: ",
    correctAnswerLabel: "正解: ",
    resultTimePrefix: "所要時間 ",
    resultProgressFull: "問正解済み",
    resultProgressPartialSuffix: "問でクリア",
    resultProgressPrefix: "カテゴリ進捗: ",
    resultProgressAnd: "（あと ",
    dateLocale: "ja-JP",
    timeSuffixSec: "秒",
    timeSuffixMin: "分",
    clearBadge: "✓ CLEAR",
    clearBadgeIcon: "✓ CLEAR",
    choiceSeparator: "、",
    cardProgressLabel: "正解",
    cardTimeLimitLabel: "秒/問",
    confirmResetHistory: "履歴を全て削除します。よろしいですか？",
    confirmResetClear: "クリア記録と全問題の正解履歴を削除します。よろしいですか？",
    rankingAllTab: "全体",
  },
  en: {
    appSubtitle: "Emergency Medicine Quiz",
    eyebrow: "Emergency Medicine Training",
    levelTitle: "Select Level",
    levelEyebrow: "Choose a difficulty",
    btnClearLog: "Cleared",
    btnHistory: "History",
    btnSoundOff: "Sound OFF",
    btnSoundOn: "Sound ON",
    titleSoundOff: "Mute sounds and music",
    titleSoundOn: "Unmute sounds and music",
    setupTitle: "Quiz Setup",
    roleLegend: "Role",
    roleRequired: "Required",
    roleResident: "Resident",
    roleSeniorResident: "Senior Resident",
    roleDoctor: "Doctor",
    roleNurse: "Nurse",
    roleOther: "Other",
    levelLegend: "Level",
    levelBasic: "Basic",
    levelAdvanced: "Advanced",
    levelMaster: "Master",
    countLegend: "Questions",
    countSuffix: " Q",
    summaryCategory: "Category",
    summaryCategoryLoading: "Loading...",
    summaryTimeLimit: "Time limit",
    summaryTimeLimitValue: "30 sec / question",
    quizQuit: "Home",
    btnNotice: "About",
    noticeTitle: "About This Quiz",
    noticeUpdatesTitle: "Update History",
    noticeClose: "Close",
    noticeBody: `<p>This quiz was created for educational purposes by the Emergency and Critical Care Center at Teine Keijinkai Hospital.</p>
<p>Quiz content is primarily based on clinical guidelines, but some procedures (such as medication dosing) reflect our institution's practices. These may differ from other facilities — please consult your supervising physician for guidance.</p>
<p>Each question must be answered within 30 seconds. If you feel rushed, use the pause button (⏸) to take your time reading the question.</p>
<p>Completing all questions in a category correctly earns a CLEAR. However, using the pause button disqualifies that session from clearing — you must answer within the time limit.</p>
<p>Questions are updated regularly with corrections and additions. When a category's questions are updated, its CLEAR status will be reset — please try again!</p>`,
    quizPause: "⏸",
    quizResume: "▶ Resume",
    resultEyebrow: "Result",
    resultTitle: "Result",
    finishLabel: "Finish",
    clearLabel: "CLEAR!",
    btnRetry: "Retry",
    btnHome: "Home",
    btnReviewToggleCollapse: "Collapse",
    btnReviewToggleExpand: "Expand",
    reviewHeading: "Review",
    rankingEyebrow: "Local History",
    rankingTitle: "History",
    rankingEmpty: "No records yet.",
    btnResetHistory: "Clear all history",
    clearEyebrow: "Clear History",
    clearTitle: "Clear Records",
    btnResetClear: "Reset all clear records",
    disclaimer: "⚠️ This quiz is for educational purposes only. When treating patients in actual clinical settings, please refer to the latest guidelines and medical information.",
    langToggleJa: "JP",
    langToggleEn: "EN",
    errorLoadOffline: "Cannot load question data. Please open with a local HTTP server.",
    errorCategoryLoad: "Categories could not be loaded.",
    errorInsufficientQuestions: "Not enough questions for the selected count.",
    roleSelectPrompt: "Please select your role.",
    levelClearSuffix: "Cleared",
    selectedCategorySuffix: " Q",
    noSelection: "Not selected",
    answerSubmitLabel: "Submit",
    answerSelected: "selected",
    userAnswerTimedOut: "Timed out",
    userAnswerLabel: "Your answer: ",
    correctAnswerLabel: "Correct: ",
    resultTimePrefix: "Time: ",
    resultProgressFull: "correct",
    resultProgressPartialSuffix: "more to clear",
    resultProgressPrefix: "Progress: ",
    resultProgressAnd: " (",
    dateLocale: "en-US",
    timeSuffixSec: "s",
    timeSuffixMin: "m",
    clearBadge: "✓ CLEAR",
    clearBadgeIcon: "✓ CLEAR",
    choiceSeparator: ", ",
    cardProgressLabel: "correct",
    cardTimeLimitLabel: "s/Q",
    confirmResetHistory: "Delete all history. Are you sure?",
    confirmResetClear: "Delete all clear records and answer history. Are you sure?",
    rankingAllTab: "All",
  },
};

// Look up a translation key. Falls back to ja, then the key itself.
function t(key, lang) {
  return (I18N[lang] && I18N[lang][key]) ?? I18N.ja[key] ?? key;
}

// Apply all data-i18n and data-i18n-attr translations to the DOM.
function applyI18n(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "ja";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key, lang);
    if (value !== undefined) el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr");
    spec.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key, lang));
    });
  });
}
