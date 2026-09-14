import { requestJson } from "./shared/api.js";
import { localized } from "./shared/i18n.js";

const state = {
  bootstrap: null,
  questions: [],
  media: [],
  selectedQuestion: null,
  formBaseQuestion: null,
  categoryPath: [],
  editorMode: "form",
  selectedSlideIds: new Set(JSON.parse(localStorage.getItem("wtw:selectedSlideIds") || "[]"))
};

const elements = {
  stats: document.querySelector("#stats"),
  categoryLevels: document.querySelector("#categoryLevels"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  searchInput: document.querySelector("#searchInput"),
  questionList: document.querySelector("#questionList"),
  questionCount: document.querySelector("#questionCount"),
  selectionSummary: document.querySelector("#selectionSummary"),
  clearSlideSelectionButton: document.querySelector("#clearSlideSelectionButton"),
  questionForm: document.querySelector("#questionForm"),
  formType: document.querySelector("#formType"),
  formCategory: document.querySelector("#formCategory"),
  formMood: document.querySelector("#formMood"),
  formOccasion: document.querySelector("#formOccasion"),
  optionsEditor: document.querySelector("#optionsEditor"),
  answerLabel: document.querySelector("#answerLabel"),
  useImageMedia: document.querySelector("#useImageMedia"),
  useAudioMedia: document.querySelector("#useAudioMedia"),
  useVideoMedia: document.querySelector("#useVideoMedia"),
  mediaEditors: document.querySelector("#mediaEditors"),
  jsonEditor: document.querySelector("#jsonEditor"),
  editorMeta: document.querySelector("#editorMeta"),
  mediaList: document.querySelector("#mediaList"),
  categoryTree: document.querySelector("#categoryTree"),
  formatList: document.querySelector("#formatList"),
  moodList: document.querySelector("#moodList"),
  occasionList: document.querySelector("#occasionList"),
  checkOutput: document.querySelector("#checkOutput")
};

const viewMeta = {
  home: ["Home", "Choose the task you want to do next."],
  browse: ["Question Library", "Find, preview, edit, and select questions for a slide deck."],
  editor: ["Question Editor", "Create or edit one bilingual question. Nothing is saved until Save is clicked."],
  media: ["Media Library", "Inspect local media metadata. Uploaded files stay outside Git."],
  settings: ["Settings", "Review categories, answer types, moods, and occasions."],
  check: ["Maintenance", "Validate data, lint tags, detect duplicates, and rebuild indexes."]
};

function saveSlideSelection() {
  localStorage.setItem("wtw:selectedSlideIds", JSON.stringify([...state.selectedSlideIds]));
  renderSelectionSummary();
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
    const strong = document.createElement("strong");
    strong.textContent = value;
    const text = document.createElement("span");
    text.textContent = label;
    node.append(strong, text);
    elements.stats.append(node);
  }
}

function renderSelectionSummary() {
  if (!elements.selectionSummary) return;
  elements.selectionSummary.textContent = `${state.selectedSlideIds.size} selected for slides.`;
}

function categoryLabel(category) {
  const parts = category.id.split(".");
  const depth = Math.max(0, parts.length - 1);
  const prefix = depth ? `${"  ".repeat(depth)}↳ ` : "";
  return `${prefix}${category.name} (${category.id})`;
}

function taxonomyLabel(item) {
  return `${item.name} (${item.id})`;
}

function renderFilters() {
  renderCategoryLevels();
  elements.typeFilter.replaceChildren(option("", "All types"));
  for (const format of state.bootstrap.formats) elements.typeFilter.append(option(format.id, taxonomyLabel(format)));
  elements.formType.replaceChildren();
  for (const format of state.bootstrap.formats) elements.formType.append(option(format.id, taxonomyLabel(format)));
  elements.formCategory.replaceChildren();
  for (const category of state.bootstrap.categories) elements.formCategory.append(option(category.id, categoryLabel(category)));
  elements.formMood.replaceChildren();
  for (const mood of state.bootstrap.moods) elements.formMood.append(option(mood.id, taxonomyLabel(mood)));
  elements.formOccasion.replaceChildren();
  for (const occasion of state.bootstrap.occasions) elements.formOccasion.append(option(occasion.id, taxonomyLabel(occasion)));
  renderSettings();
}

function renderTaxonomyItems(target, items, label = taxonomyLabel) {
  target.replaceChildren();
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "taxonomyItem";
    const name = document.createElement("strong");
    name.textContent = label(item);
    row.append(name);
    target.append(row);
  }
}

function renderSettings() {
  if (!state.bootstrap) return;
  elements.categoryTree.replaceChildren();
  for (const category of state.bootstrap.categories) {
    const row = document.createElement("div");
    row.className = "taxonomyItem";
    row.classList.toggle("taxonomyChild", Boolean(category.parent));
    const name = document.createElement("strong");
    name.textContent = category.name;
    const id = document.createElement("code");
    id.textContent = category.id;
    row.append(name, id);
    elements.categoryTree.append(row);
  }
  renderTaxonomyItems(elements.formatList, state.bootstrap.formats);
  renderTaxonomyItems(elements.moodList, state.bootstrap.moods);
  renderTaxonomyItems(elements.occasionList, state.bootstrap.occasions);
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
  elements.questionCount.textContent = `${state.questions.length} shown · ${state.selectedSlideIds.size} selected`;
  renderSelectionSummary();
  elements.questionList.replaceChildren();
  for (const question of state.questions) {
    const node = document.createElement("div");
    node.className = "questionItem";
    node.classList.toggle("selected", state.selectedSlideIds.has(question.id));
    const titleRow = document.createElement("div");
    titleRow.className = "questionTitle";
    const checkLabel = document.createElement("label");
    checkLabel.className = "checkLabel";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedSlideIds.has(question.id);
    const title = document.createElement("strong");
    title.textContent = localized(question.title);
    checkLabel.append(checkbox, title);
    const status = document.createElement("span");
    status.textContent = question.status;
    titleRow.append(checkLabel, status);

    const prompt = document.createElement("div");
    prompt.textContent = localized(question.prompt);

    const meta = document.createElement("div");
    meta.className = "meta";
    for (const value of [question.id, question.category, question.type, `${question._file}:${question._line}`]) {
      const item = document.createElement("span");
      item.textContent = value;
      meta.append(item);
    }

    const tags = document.createElement("div");
    tags.className = "tags";
    for (const tag of question.tags || []) tags.append(pill(tag));
    const actions = document.createElement("div");
    actions.className = "actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editQuestion(question));
    const previewLink = document.createElement("a");
    previewLink.className = "buttonLink";
    previewLink.href = `/question/?id=${encodeURIComponent(question.id)}`;
    previewLink.textContent = "Preview";
    actions.append(previewLink, editButton);
    node.append(titleRow, prompt, meta, tags, actions);
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) state.selectedSlideIds.add(question.id);
      else state.selectedSlideIds.delete(question.id);
      saveSlideSelection();
      renderQuestions();
    });
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
    const id = document.createElement("strong");
    id.textContent = item.id;
    node.append(id);
    for (const value of [`${item.type} · ${item.status}`, item.path, `${item._file}:${item._line}`]) {
      const span = document.createElement("span");
      span.textContent = value;
      node.append(span);
    }
    elements.mediaList.append(node);
  }
}

function switchView(name) {
  document.querySelectorAll(".navItem[data-view]").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  const [title, subtitle] = viewMeta[name] || viewMeta.home;
  document.querySelector("#viewTitle").textContent = title;
  document.querySelector("#viewSubtitle").textContent = subtitle;
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

function mediaLabel(kind) {
  return { image: "Image 图片", audio: "Audio 音频", video: "Video 视频" }[kind] || kind;
}

function mediaAccept(kind) {
  return { image: "image/*", audio: "audio/*", video: "video/*" }[kind] || "";
}

function mediaRole(kind) {
  return { image: "question", audio: "question", video: "question" }[kind] || "question";
}

function mediaToggle(kind) {
  return {
    image: elements.useImageMedia,
    audio: elements.useAudioMedia,
    video: elements.useVideoMedia
  }[kind];
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
  const answerInput = elements.questionForm.answer;
  if (type === "true_false") {
    setOptions([
      { id: "T", text: localizedObject("真的", "True") },
      { id: "F", text: localizedObject("假的", "False") }
    ]);
    answerInput.placeholder = "T or F";
  } else if (type === "multiple_choice") {
    answerInput.placeholder = "A,B";
  } else if (shouldShow && elements.optionsEditor.children.length === 0) {
    setOptions();
    answerInput.placeholder = "A";
  } else if (type === "fill_blank") {
    answerInput.placeholder = "答案 / answer";
  } else {
    answerInput.placeholder = "Short answer";
  }
}

function mediaOptions(kind, selectedId = "") {
  const options = [option("", "No existing media")];
  let hasSelected = !selectedId;
  for (const item of state.media.filter((media) => media.type === kind)) {
    options.push(option(item.id, `${item.id} - ${item.title || item.path}`));
    if (item.id === selectedId) hasSelected = true;
  }
  if (!hasSelected) options.push(option(selectedId, selectedId));
  const select = document.createElement("select");
  select.dataset.mediaField = "existing";
  select.append(...options);
  select.value = selectedId;
  return select;
}

function mediaEditor(kind, mediaRef = {}) {
  const block = document.createElement("div");
  block.className = "mediaEditor";
  block.dataset.kind = kind;

  const heading = document.createElement("h3");
  heading.textContent = mediaLabel(kind);
  block.append(heading);

  const existingLabel = document.createElement("label");
  existingLabel.append("Use existing media", mediaOptions(kind, mediaRef.id || ""));
  block.append(existingLabel);

  for (const [labelText, field, value] of [
    ["Hint zh-CN", "hint_zh", localized(mediaRef.hint, "zh-CN")],
    ["Hint en-US", "hint_en", localized(mediaRef.hint, "en-US")],
    ["Upload title", "title", ""],
    ["Upload alt/description", "alt", ""],
    ["Upload tags", "tags", ""]
  ]) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.dataset.mediaField = field;
    input.value = value;
    if (field === "tags") input.placeholder = "moon,space,image-guess";
    label.append(labelText, input);
    block.append(label);
  }

  const fileLabel = document.createElement("label");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = mediaAccept(kind);
  fileInput.dataset.mediaField = "file";
  fileLabel.append("Upload new file", fileInput);
  block.append(fileLabel);

  return block;
}

function renderMediaEditors(mediaRefs = []) {
  elements.mediaEditors.replaceChildren();
  for (const kind of ["image", "audio", "video"]) {
    const ref = mediaRefs.find((item) => item.kind === kind || state.media.find((media) => media.id === item.id)?.type === kind);
    mediaToggle(kind).checked = Boolean(ref);
    if (ref) elements.mediaEditors.append(mediaEditor(kind, ref));
  }
}

function syncMediaEditor(kind) {
  const existing = elements.mediaEditors.querySelector(`[data-kind="${kind}"]`);
  if (mediaToggle(kind).checked && !existing) {
    elements.mediaEditors.append(mediaEditor(kind));
  } else if (!mediaToggle(kind).checked && existing) {
    existing.remove();
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function uploadMediaFromBlock(block) {
  const file = block.querySelector('[data-media-field="file"]').files[0];
  if (!file) return null;
  const kind = block.dataset.kind;
  const title = block.querySelector('[data-media-field="title"]').value.trim() || file.name.replace(/\.[^.]+$/, "");
  const dataUrl = await readFileAsDataUrl(file);
  const result = await requestJson("/api/media", {
    method: "POST",
    body: JSON.stringify({
      type: kind,
      filename: file.name,
      title,
      alt: block.querySelector('[data-media-field="alt"]').value.trim(),
      tags: parseList(block.querySelector('[data-media-field="tags"]').value),
      status: "draft",
      dataUrl
    })
  });
  return result.media;
}

async function readMediaRefsFromForm({ uploadMedia = false } = {}) {
  const refs = [];
  for (const block of elements.mediaEditors.querySelectorAll(".mediaEditor")) {
    const file = block.querySelector('[data-media-field="file"]').files[0];
    const uploaded = uploadMedia && file ? await uploadMediaFromBlock(block) : null;
    const selectedId = block.querySelector('[data-media-field="existing"]').value.trim();
    const id = uploaded?.id || selectedId;
    if (!id) continue;
    const kind = uploaded?.type || block.dataset.kind;
    const hintZh = block.querySelector('[data-media-field="hint_zh"]').value.trim();
    const hintEn = block.querySelector('[data-media-field="hint_en"]').value.trim();
    const ref = {
      id,
      role: mediaRole(kind),
      kind
    };
    if (hintZh && hintEn) ref.hint = localizedObject(hintZh, hintEn);
    refs.push(ref);
  }
  return refs;
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
  renderMediaEditors(question.media || []);
}

async function formToQuestion({ uploadMedia = false } = {}) {
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
    "media",
    "play_time_sec",
    "status"
  ]) {
    delete baseQuestion[field];
  }
  const media = await readMediaRefsFromForm({ uploadMedia });
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
    ...(media.length > 0 ? { media } : {}),
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
    question = state.editorMode === "form" ? await formToQuestion({ uploadMedia: true }) : JSON.parse(elements.jsonEditor.value);
  } catch (error) {
    alert(`Cannot save: ${error.message}`);
    return;
  }
  const isExisting = Boolean(state.selectedQuestion?.id);
  const url = isExisting ? `/api/questions/${encodeURIComponent(state.selectedQuestion.id)}` : "/api/questions";
  const method = isExisting ? "PUT" : "POST";
  const result = await requestJson(url, { method, body: JSON.stringify(question) });
  elements.editorMeta.textContent = `${result.id} · ${result.file}`;
  await refreshAll();
  const savedQuestion = state.questions.find((item) => item.id === result.id);
  if (savedQuestion) editQuestion(savedQuestion);
}

async function runCheck() {
  switchView("check");
  elements.checkOutput.textContent = "Running checks...";
  const result = await requestJson("/api/check", { method: "POST", body: "{}" });
  elements.checkOutput.textContent = result.output || "No output.";
  await loadBootstrap();
  renderStats();
}

document.querySelectorAll(".navItem[data-view]").forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));
document.querySelector("#applyFiltersButton").addEventListener("click", loadQuestions);
document.querySelector("#refreshButton").addEventListener("click", refreshAll);
document.querySelector("#newQuestionButton").addEventListener("click", newDraft);
document.querySelector("#homeNewQuestionButton").addEventListener("click", newDraft);
document.querySelector("#homeBrowseButton").addEventListener("click", () => switchView("browse"));
document.querySelector("#homeMediaButton").addEventListener("click", () => switchView("media"));
elements.clearSlideSelectionButton.addEventListener("click", () => {
  state.selectedSlideIds.clear();
  saveSlideSelection();
  renderQuestions();
});
document.querySelector("#formModeButton").addEventListener("click", () => {
  try {
    questionToForm(JSON.parse(elements.jsonEditor.value || "{}"));
    setEditorMode("form");
  } catch (error) {
    alert(`Cannot switch to form: ${error.message}`);
  }
});
document.querySelector("#jsonModeButton").addEventListener("click", async () => {
  try {
    const question = await formToQuestion();
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
elements.useImageMedia.addEventListener("change", () => syncMediaEditor("image"));
elements.useAudioMedia.addEventListener("change", () => syncMediaEditor("audio"));
elements.useVideoMedia.addEventListener("change", () => syncMediaEditor("video"));
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
