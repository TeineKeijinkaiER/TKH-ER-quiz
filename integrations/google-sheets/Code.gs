const SHEET_NAME = "quiz_results";
const SPREADSHEET_ID = "";
const HEADERS = [
  "receivedAt",
  "completedAt",
  "categoryId",
  "categoryName",
  "roleId",
  "roleName",
  "questionCount",
  "score",
  "accuracy",
  "totalTimeMs",
  "totalSeconds",
  "timestamp",
  "appVersion",
  "pageUrl",
];

function doGet() {
  const sheet = getResultSheet_();
  ensureHeaders_(sheet);
  return jsonOutput_({
    ok: true,
    app: "Quiz-TKHER Google Sheets collector",
    sheetName: SHEET_NAME,
    spreadsheetUrl: sheet.getParent().getUrl(),
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);

    try {
      const sheet = getResultSheet_();
      ensureHeaders_(sheet);
      sheet.appendRow(toResultRow_(payload));
    } finally {
      lock.releaseLock();
    }

    return jsonOutput_({ ok: true });
  } catch (error) {
    return jsonOutput_({
      ok: false,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function parsePayload_(e) {
  const content = e && e.parameter && e.parameter.payload
    ? e.parameter.payload
    : e && e.postData && e.postData.contents
      ? e.postData.contents
      : "{}";
  const payload = JSON.parse(content);
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a JSON object.");
  }
  return payload;
}

function getResultSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("Create this Apps Script from a Google Spreadsheet or set SPREADSHEET_ID.");
  }
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function testAppendSample() {
  const sheet = getResultSheet_();
  ensureHeaders_(sheet);
  sheet.appendRow(toResultRow_({
    completedAt: new Date().toISOString(),
    categoryId: "sample",
    categoryName: "疎通テスト",
    roleId: "doctor",
    roleName: "医師",
    questionCount: 5,
    score: 5,
    totalTimeMs: 123000,
    timestamp: Date.now(),
    appVersion: "manual-test",
    pageUrl: "Apps Script testAppendSample",
  }));
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const current = range.getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    range.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function toResultRow_(payload) {
  const questionCount = toNumber_(payload.questionCount);
  const score = toNumber_(payload.score);
  const timestamp = toNumber_(payload.timestamp) || Date.now();
  const totalTimeMs = toNumber_(payload.totalTimeMs);
  const accuracy = questionCount > 0 ? score / questionCount : "";

  return [
    new Date(),
    payload.completedAt ? new Date(payload.completedAt) : new Date(timestamp),
    text_(payload.categoryId),
    text_(payload.categoryName),
    text_(payload.roleId),
    text_(payload.roleName),
    questionCount,
    score,
    accuracy,
    totalTimeMs,
    totalTimeMs ? Math.round(totalTimeMs / 1000) : "",
    timestamp,
    text_(payload.appVersion),
    text_(payload.pageUrl),
  ];
}

function text_(value) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, 500);
}

function toNumber_(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function jsonOutput_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
