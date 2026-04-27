const els = {
  refreshButton: document.getElementById("refreshButton"),
  summaryText: document.getElementById("summaryText"),
  categoryStatsBody: document.getElementById("categoryStatsBody"),
  roleStatsBody: document.getElementById("roleStatsBody"),
  categorySelect: document.getElementById("categorySelect"),
  modeSelect: document.getElementById("modeSelect"),
  questionJson: document.getElementById("questionJson"),
  sampleButton: document.getElementById("sampleButton"),
  submitQuestionsButton: document.getElementById("submitQuestionsButton"),
  questionMessage: document.getElementById("questionMessage"),
  recentList: document.getElementById("recentList"),
};

let categories = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
  els.refreshButton.addEventListener("click", loadAll);
  els.sampleButton.addEventListener("click", insertSample);
  els.submitQuestionsButton.addEventListener("click", submitQuestions);
  loadAll();
}

async function loadAll() {
  const [categoryData, stats] = await Promise.all([
    fetchJson("/api/categories"),
    fetchJson("/api/stats"),
  ]);
  categories = categoryData;
  renderCategorySelect();
  renderStats(stats);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || response.statusText);
  return data;
}

function renderCategorySelect() {
  const selected = els.categorySelect.value;
  els.categorySelect.innerHTML = "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = `${category.name} (${category.questionTotal}問)`;
    els.categorySelect.appendChild(option);
  });
  if (selected) els.categorySelect.value = selected;
}

function renderStats(stats) {
  els.summaryText.textContent = `総実施回数: ${stats.totalAttempts}回`;
  els.categoryStatsBody.innerHTML = "";
  stats.byCategory.forEach((item) => {
    const tr = document.createElement("tr");
    const roleText = Object.values(item.roles || {})
      .sort((a, b) => b.attempts - a.attempts)
      .map((role) => `${role.roleName}: ${role.attempts}`)
      .join(" / ") || "-";
    tr.innerHTML = `
      <td>${escapeHtml(item.categoryName)}</td>
      <td>${item.attempts}</td>
      <td>${formatPercent(item.accuracy)}</td>
      <td>${escapeHtml(roleText)}</td>
    `;
    els.categoryStatsBody.appendChild(tr);
  });

  els.roleStatsBody.innerHTML = "";
  stats.byRole.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.roleName)}</td>
      <td>${item.attempts}</td>
      <td>${formatPercent(item.accuracy)}</td>
    `;
    els.roleStatsBody.appendChild(tr);
  });

  els.recentList.innerHTML = "";
  stats.recent.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.categoryName} / ${item.roleName} / ${item.score}/${item.questionCount} / ${new Date(item.timestamp).toLocaleString("ja-JP")}`;
    els.recentList.appendChild(li);
  });
}

function insertSample() {
  const categoryId = els.categorySelect.value || "sample";
  els.questionJson.value = JSON.stringify([
    {
      id: `${categoryId}_new_001`,
      question: "ここに問題文を入力",
      choices: ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"],
      answer: 0,
      explanation: "ここに解説を入力"
    }
  ], null, 2);
}

async function submitQuestions() {
  setMessage("保存中...", false);
  try {
    const pasted = JSON.parse(els.questionJson.value);
    const questions = Array.isArray(pasted) ? pasted : pasted.questions || (pasted.question ? [pasted.question] : null);
    if (!Array.isArray(questions)) throw new Error("配列、{ questions: [...] }、または { question: {...} } を貼り付けてください。");
    const result = await fetchJson(`/api/questions/${els.categorySelect.value}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: els.modeSelect.value,
        questions,
      }),
    });
    setMessage(`保存しました: ${result.added}問 / 合計${result.total}問`, false);
    await loadAll();
  } catch (error) {
    setMessage(error.message, true);
  }
}

function setMessage(text, isError) {
  els.questionMessage.textContent = text;
  els.questionMessage.classList.toggle("error", isError);
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
