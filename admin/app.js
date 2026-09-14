const state = {
  bootstrap: null,
  questions: [],
  media: [],
  selectedQuestion: null,
  formBaseQuestion: null,
  categoryPath: [],
  editorMode: "form"
};

const elements = {
  stats: document.querySelector("#stats"),
  categoryLevels: document.querySelector("#categoryLevels"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  searchInput: document.querySelector("#searchInput"),
  questionList: document.querySelector("#questionList"),
  questionCount: document.querySelector("#questionCount"),
  questionForm: document.querySelector("#questionForm"),
  formType: document.querySelector("#formType"),
  formCategory: document.querySelector("#formCategory"),
  formMood: document.querySelector("#formMood"),
  formOccasion: document.querySelector("#formOccasion"),
  optionsEditor: document.querySelector("#optionsEditor"),
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
  renderCategoryLevels();
  elements.typeFilter.replaceChildren(option("", "All types"));
  for (const format of state.bootstrap.formats) elements.typeFilter.append(option(format.id, format.id));
  elements.formType.replaceChildren();
  for (const format of state.bootstrap.formats) elements.formType.append(option(format.id, format.id));
  elements.formCategory.replaceChildren();
  for (const category of state.bootstrap.categories) elements.formCategory.append(option(category.id, `${category.id} - ${category.name}`));
  elements.formMood.replaceChildren();
  for (const mood of state.bootstrap.moods) elements.formMood.append(option(mood.id, mood.id));
  elements.formOccasion.replaceChildren();
  for (const occasion of state.bootstrap.occasions) elements.formOccasion.append(option(occasion.id, occasion.id));
}

function childCategories(parentId) {
  return state.bootstrap.categories
    .filter((category) => (parentId ? category.parent === parentId : !category.parent))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function selectedCategoryPrefix() {
  return state.categoryPath[state.categoryPath.length - 1] || "";
}

function renderCategoryLevels() {
  elements.categoryLevels.replaceChildren();

  let parentId = "";
  let depth = 0;

  while (true) {
    const children = childCategories(parentId);
    if (children.length === 0) break;

    const selected = state.categoryPath[depth] || "";
    const select = document.createElement("select");
    select.dataset.depth = String(depth);
    select.append(option("", depth === 0 ? "All categories" : "All subcategories"));

    for (const category of children) {
      select.append(option(category.id, `${category.id} - ${category.name}`));
    }

    select.value = selected;
    select.addEventListener("change", () => {
      const nextDepth = Number(select.dataset.depth);
      state.categoryPath = state.categoryPath.slice(0, nextDepth);
      if (select.value) state.categoryPath.push(select.value);
      renderCategoryLevels();
      loadQuestions();
    });
    elements.categoryLevels.append(select);

    if (!selected) break;
    parentId = selected;
    depth += 1;
  }
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

function setEditorMode(mode) {
  state.editorMode = mode;
  document.querySelector("#formModeButton").classList.toggle("active", mode === "form");
  document.querySelector("#jsonModeButton").classList.toggle("active", mode === "json");
  elements.questionForm.classList.toggle("hidden", mode !== "form");
  elements.jsonEditor.classList.toggle("hidden", mode !== "json");
  document.querySelector("#formatButton").classList.toggle("hidden", mode !== "json");
}

function parseList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function localizedObject(zh, en) {
  return { "zh-CN": zh.trim(), "en-US": en.trim() };
}

function selectedValues(select) {
  return [...select.selectedOptions].map((item) => item.value);
}

function setSelectedValues(select, values = []) {
  const selected = new Set(values);
  [...select.options].forEach((item) => {
    item.selected = selected.has(item.value);
  });
}

function addOptionRow(optionValue = {}) {
  const row = document.createElement("div");
  row.className = "optionRow";

  for (const [labelText, field, value] of [
    ["ID", "id", optionValue.id || ""],
    ["zh-CN", "zh", localized(optionValue.text, "zh-CN")],
    ["en-US", "en", localized(optionValue.text, "en-US")]
  ]) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.dataset.optionField = field;
    input.value = value;
    label.append(labelText, input);
    row.append(label);
  }

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => row.remove());
  row.append(removeButton);
  elements.optionsEditor.append(row);
}

function setOptions(options = []) {
  elements.optionsEditor.replaceChildren();
  const nextOptions = options.length > 0 ? options : [
    { id: "A", text: localizedObject("选项 A", "Option A") },
    { id: "B", text: localizedObject("选项 B", "Option B") },
    { id: "C", text: localizedObject("选项 C", "Option C") },
    { id: "D", text: localizedObject("选项 D", "Option D") }
  ];
  for (const item of nextOptions) addOptionRow(item);
}

function readOptionsFromForm() {
  return [...elements.optionsEditor.querySelectorAll(".optionRow")]
    .map((row) => {
      const id = row.querySelector('[data-option-field="id"]').value.trim();
      const zh = row.querySelector('[data-option-field="zh"]').value.trim();
      const en = row.querySelector('[data-option-field="en"]').value.trim();
      if (!id && !zh && !en) return null;
      return { id, text: localizedObject(zh, en) };
    })
    .filter(Boolean);
}

function showOptionsForType(type) {
  const shouldShow = ["single_choice", "multiple_choice", "true_false"].includes(type);
  elements.optionsEditor.closest(".formBlock").classList.toggle("hidden", !shouldShow);
  if (type === "true_false") {
    setOptions([
      { id: "T", text: localizedObject("真的", "True") },
      { id: "F", text: localizedObject("假的", "False") }
    ]);
  } else if (shouldShow && elements.optionsEditor.children.length === 0) {
    setOptions();
  }
}

function questionToForm(question) {
  state.formBaseQuestion = structuredClone(question);
  const form = elements.questionForm;
  form.type.value = question.type || "single_choice";
  form.category.value = question.category || "general.weird-facts";
  form.status.value = question.status || "draft";
  form.topic.value = question.topic || "";
  form.play_time_sec.value = question.play_time_sec || 20;
  form.answer.value = (question.answer || []).join(",");
  form.title_zh.value = localized(question.title, "zh-CN");
  form.title_en.value = localized(question.title, "en-US");
  form.prompt_zh.value = localized(question.prompt, "zh-CN");
  form.prompt_en.value = localized(question.prompt, "en-US");
  form.reveal_zh.value = localized(question.reveal, "zh-CN");
  form.reveal_en.value = localized(question.reveal, "en-US");
  form.fun_fact_zh.value = localized(question.fun_fact, "zh-CN");
  form.fun_fact_en.value = localized(question.fun_fact, "en-US");
  form.tags.value = (question.tags || []).join(",");
  setSelectedValues(elements.formMood, question.mood || ["easygoing"]);
  setSelectedValues(elements.formOccasion, question.occasion || ["daily"]);
  setOptions(question.options || []);
  showOptionsForType(form.type.value);
}

function formToQuestion() {
  const form = elements.questionForm;
  const { _file, _line, ...baseQuestion } = state.formBaseQuestion || state.selectedQuestion || {};
  for (const field of [
    "type",
    "category",
    "topic",
    "title",
    "prompt",
    "options",
    "answer",
    "reveal",
    "fun_fact",
    "tags",
    "mood",
    "occasion",
    "play_time_sec",
    "status"
  ]) {
    delete baseQuestion[field];
  }
  const question = {
    ...baseQuestion,
    ...(baseQuestion.id || state.selectedQuestion?.id ? { id: baseQuestion.id || state.selectedQuestion.id } : {}),
    type: form.type.value,
    category: form.category.value,
    ...(form.topic.value.trim() ? { topic: form.topic.value.trim() } : {}),
    title: localizedObject(form.title_zh.value, form.title_en.value),
    prompt: localizedObject(form.prompt_zh.value, form.prompt_en.value),
    answer: parseList(form.answer.value),
    reveal: localizedObject(form.reveal_zh.value, form.reveal_en.value),
    ...(form.fun_fact_zh.value.trim() || form.fun_fact_en.value.trim()
      ? { fun_fact: localizedObject(form.fun_fact_zh.value, form.fun_fact_en.value) }
      : {}),
    tags: parseList(form.tags.value),
    mood: selectedValues(elements.formMood),
    occasion: selectedValues(elements.formOccasion),
    play_time_sec: Number(form.play_time_sec.value || 20),
    status: form.status.value
  };
  const options = readOptionsFromForm();
  if (["single_choice", "multiple_choice", "true_false"].includes(question.type)) question.options = options;
  return question;
}

function editQuestion(question) {
  state.selectedQuestion = question;
  elements.editorMeta.textContent = `${question.id} · ${question._file}:${question._line}`;
  elements.jsonEditor.value = JSON.stringify(question, null, 2);
  questionToForm(question);
  setEditorMode("form");
  switchView("editor");
}

function newDraft() {
  const selected = selectedCategoryPrefix();
  const category = state.bootstrap.categories.find((item) => item.id === selected && item.parent)
    ? selected
    : childCategories(selected || "general")[0]?.id || "general.weird-facts";
  state.selectedQuestion = null;
  elements.editorMeta.textContent = "New draft. ID will be generated when saved.";
  const draft = {
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
  };
  elements.jsonEditor.value = JSON.stringify(draft, null, 2);
  questionToForm(draft);
  setEditorMode("form");
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
  if (selectedCategoryPrefix()) params.set("categoryPrefix", selectedCategoryPrefix());
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
    question = state.editorMode === "form" ? formToQuestion() : JSON.parse(elements.jsonEditor.value);
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
document.querySelector("#formModeButton").addEventListener("click", () => {
  try {
    questionToForm(JSON.parse(elements.jsonEditor.value || "{}"));
    setEditorMode("form");
  } catch (error) {
    alert(`Cannot switch to form: ${error.message}`);
  }
});
document.querySelector("#jsonModeButton").addEventListener("click", () => {
  try {
    const question = formToQuestion();
    elements.jsonEditor.value = JSON.stringify(question, null, 2);
    setEditorMode("json");
  } catch (error) {
    alert(`Cannot switch to JSON: ${error.message}`);
  }
});
document.querySelector("#addOptionButton").addEventListener("click", () => {
  const id = String.fromCharCode(65 + elements.optionsEditor.children.length);
  addOptionRow({ id, text: localizedObject("", "") });
});
elements.formType.addEventListener("change", () => showOptionsForType(elements.formType.value));
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

setEditorMode("form");
