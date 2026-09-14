const state = { bootstrap: null, questions: [], media: [], selectedQuestion: null };

const elements = {
  stats: document.querySelector("#stats"),
  categoryFilter: document.querySelector("#categoryFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  searchInput: document.querySelector("#searchInput"),
  questionList: document.querySelector("#questionList"),
  questionCount: document.querySelector("#questionCount"),
  jsonEditor: document.querySelector("#jsonEditor"),
  editorMeta: document.querySelector("#editorMeta"),
  mediaList: document.querySelector("#mediaList"),
  checkOutput: document.querySelector("#checkOutput")
};

function localized(value, locale = "zh-CN") {
  if (!value || typeof value !== "object") return "";
  return value[locale] || value["en-US"] || "";
}

function option(value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  return node;
}

function pill(text) {
  const node = document.createElement("span");
  node.className = "pill";
  node.textContent = text;
  return node;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || response.statusText);
  return data;
}

function renderStats() {
  const stats = state.bootstrap?.stats || {};
  elements.stats.replaceChildren();
  for (const [label, value] of [
    ["Questions", stats.total ?? 0],
    ["With media", stats.with_media ?? 0],
    ["Published", stats.by_status?.published ?? 0],
    ["Draft", stats.by_status?.draft ?? 0]
  ]) {
    const node = document.createElement("div");
    node.className = "stat";
    node.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    elements.stats.append(node);
  }
}

function renderFilters() {
  elements.categoryFilter.replaceChildren(option("", "All categories"));
  for (const category of state.bootstrap.categories) {
    if (category.parent) elements.categoryFilter.append(option(category.id, category.id));
  }
  elements.typeFilter.replaceChildren(option("", "All types"));
  for (const format of state.bootstrap.formats) elements.typeFilter.append(option(format.id, format.id));
}

function renderQuestions() {
  elements.questionCount.textContent = `${state.questions.length} shown`;
  elements.questionList.replaceChildren();
  for (const question of state.questions) {
    const node = document.createElement("button");
    node.className = "questionItem";
    node.type = "button";
    node.innerHTML = `
      <div class="questionTitle"><strong>${localized(question.title)}</strong><span>${question.status}</span></div>
      <div>${localized(question.prompt)}</div>
      <div class="meta"><span>${question.id}</span><span>${question.category}</span><span>${question.type}</span><span>${question._file}:${question._line}</span></div>
    `;
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const tag of question.tags || []) tags.append(pill(tag));
    node.append(tags);
    node.addEventListener("click", () => editQuestion(question));
    elements.questionList.append(node);
  }
}

function renderMedia() {
  elements.mediaList.replaceChildren();
  if (state.media.length === 0) {
    const node = document.createElement("p");
    node.textContent = "No media metadata yet. 暂无媒体元数据。";
    elements.mediaList.append(node);
    return;
  }
  for (const item of state.media) {
    const node = document.createElement("div");
    node.className = "mediaItem";
    node.innerHTML = `<strong>${item.id}</strong><span>${item.type} · ${item.status}</span><span>${item.path}</span><span>${item._file}:${item._line}</span>`;
    elements.mediaList.append(node);
  }
}

function switchView(name) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
}

function editQuestion(question) {
  state.selectedQuestion = question;
  elements.editorMeta.textContent = `${question.id} · ${question._file}:${question._line}`;
  elements.jsonEditor.value = JSON.stringify(question, null, 2);
  switchView("editor");
}

function newDraft() {
  const category = elements.categoryFilter.value || "general.weird-facts";
  state.selectedQuestion = null;
  elements.editorMeta.textContent = "New draft. ID will be generated when saved.";
  elements.jsonEditor.value = JSON.stringify({
    type: "single_choice",
    category,
    topic: "mixed",
    title: { "zh-CN": "中文卡片标题", "en-US": "English card title" },
    prompt: { "zh-CN": "中文题干？", "en-US": "English prompt?" },
    options: [
      { id: "A", text: { "zh-CN": "选项 A", "en-US": "Option A" } },
      { id: "B", text: { "zh-CN": "选项 B", "en-US": "Option B" } },
      { id: "C", text: { "zh-CN": "选项 C", "en-US": "Option C" } },
      { id: "D", text: { "zh-CN": "选项 D", "en-US": "Option D" } }
    ],
    answer: ["A"],
    reveal: { "zh-CN": "中文答案揭晓说明。", "en-US": "English reveal text." },
    fun_fact: { "zh-CN": "中文趣味补充。", "en-US": "English fun fact." },
    tags: ["draft"],
    mood: ["easygoing"],
    occasion: ["daily"],
    play_time_sec: 20,
    status: "draft"
  }, null, 2);
  switchView("editor");
}

async function loadBootstrap() {
  state.bootstrap = await requestJson("/api/bootstrap");
  renderStats();
  renderFilters();
}

async function loadQuestions() {
  const params = new URLSearchParams();
  if (elements.searchInput.value) params.set("q", elements.searchInput.value);
  if (elements.categoryFilter.value) params.set("category", elements.categoryFilter.value);
  if (elements.typeFilter.value) params.set("type", elements.typeFilter.value);
  if (elements.statusFilter.value) params.set("status", elements.statusFilter.value);
  const data = await requestJson(`/api/questions?${params}`);
  state.questions = data.questions;
  renderQuestions();
}

async function loadMedia() {
  const data = await requestJson("/api/media");
  state.media = data.media;
  renderMedia();
}

async function refreshAll() {
  await loadBootstrap();
  await loadQuestions();
  await loadMedia();
}

async function saveEditor() {
  let question;
  try {
    question = JSON.parse(elements.jsonEditor.value);
  } catch (error) {
    alert(`Invalid JSON: ${error.message}`);
    return;
  }
  const isExisting = Boolean(state.selectedQuestion?.id);
  const url = isExisting ? `/api/questions/${encodeURIComponent(state.selectedQuestion.id)}` : "/api/questions";
  const method = isExisting ? "PUT" : "POST";
  const result = await requestJson(url, { method, body: JSON.stringify(question) });
  elements.editorMeta.textContent = `${result.id} · ${result.file}`;
  await refreshAll();
}

async function runCheck() {
  switchView("check");
  elements.checkOutput.textContent = "Running checks...";
  const result = await requestJson("/api/check", { method: "POST", body: "{}" });
  elements.checkOutput.textContent = result.output || "No output.";
  await loadBootstrap();
  renderStats();
}

document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
document.querySelector("#applyFiltersButton").addEventListener("click", loadQuestions);
document.querySelector("#refreshButton").addEventListener("click", refreshAll);
document.querySelector("#newQuestionButton").addEventListener("click", newDraft);
document.querySelector("#formatButton").addEventListener("click", () => {
  try {
    elements.jsonEditor.value = JSON.stringify(JSON.parse(elements.jsonEditor.value), null, 2);
  } catch (error) {
    alert(`Invalid JSON: ${error.message}`);
  }
});
document.querySelector("#saveButton").addEventListener("click", saveEditor);
document.querySelector("#checkButton").addEventListener("click", runCheck);

refreshAll().catch((error) => {
  document.body.innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
