import { requestJson } from "../shared/api.js";
import { loadBootstrap } from "../shared/bootstrap.js";
import { byId, createOption as option } from "../shared/dom.js";
import { readDataUrlFile } from "../shared/files.js";
import { localized } from "../shared/i18n.js";
import { startPage } from "../shared/page.js";

const params = new URLSearchParams(location.search);
const questionId = params.get("id");
const state = { bootstrap: null, media: [], selectedQuestion: null, baseQuestion: null, mode: "form" };
const elements = {
  form: byId("questionForm"),
  type: byId("formType"),
  category: byId("formCategory"),
  difficulty: byId("formDifficulty"),
  mood: byId("formMood"),
  occasion: byId("formOccasion"),
  options: byId("optionsEditor"),
  mediaEditors: byId("mediaEditors"),
  json: byId("jsonEditor"),
  meta: byId("editorMeta"),
  saveStatus: byId("saveStatus"),
  imageToggle: byId("useImageMedia"),
  audioToggle: byId("useAudioMedia"),
  videoToggle: byId("useVideoMedia")
};

function localizedObject(zh, en) {
  return { "zh-CN": zh.trim(), "en-US": en.trim() };
}

function list(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function selectedValues(container) {
  return [...container.querySelectorAll("input:checked")].map((item) => item.value);
}

function setSelectedValues(container, values = []) {
  const selected = new Set(values);
  [...container.querySelectorAll("input")].forEach((item) => { item.checked = selected.has(item.value); });
}

function renderCheckboxGroup(container, items) {
  container.replaceChildren();
  for (const item of items) {
    const label = document.createElement("label");
    label.className = "checkLabel";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = item.id;
    label.append(input, `${item.name} (${item.id})`);
    container.append(label);
  }
}

function renderTaxonomy() {
  elements.type.replaceChildren();
  for (const item of state.bootstrap.formats) elements.type.append(option(item.id, `${item.name} (${item.id})`));
  elements.category.replaceChildren();
  for (const item of state.bootstrap.categories) {
    const indent = item.parent ? "↳ " : "";
    elements.category.append(option(item.id, `${indent}${item.name} (${item.id})`));
  }
  elements.difficulty.replaceChildren();
  for (const item of state.bootstrap.difficulties) elements.difficulty.append(option(item.id, `${item.name} (${item.id})`));
  renderCheckboxGroup(elements.mood, state.bootstrap.moods);
  renderCheckboxGroup(elements.occasion, state.bootstrap.occasions);
}

function addOptionRow(value = {}) {
  const row = document.createElement("div");
  row.className = "optionRow";
  for (const [label, field, text] of [
    ["ID", "id", value.id || ""],
    ["zh-CN", "zh", localized(value.text, "zh-CN")],
    ["en-US", "en", localized(value.text, "en-US")]
  ]) {
    const labelNode = document.createElement("label");
    const input = document.createElement("input");
    input.dataset.optionField = field;
    input.value = text;
    labelNode.append(label, input);
    row.append(labelNode);
  }
  const image = document.createElement("label");
  image.append("Image", mediaOptions("image", (value.media || []).find((item) => item.kind === "image" || state.media.find((media) => media.id === item.id)?.type === "image")?.id || ""));
  image.querySelector("select").dataset.optionField = "media_image";
  row.append(image);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => row.remove());
  row.append(remove);
  elements.options.append(row);
}

function setOptions(values = []) {
  elements.options.replaceChildren();
  const defaults = values.length ? values : [
    { id: "A", text: localizedObject("选项 A", "Option A") },
    { id: "B", text: localizedObject("选项 B", "Option B") },
    { id: "C", text: localizedObject("选项 C", "Option C") },
    { id: "D", text: localizedObject("选项 D", "Option D") }
  ];
  defaults.forEach(addOptionRow);
}

function readOptions() {
  return [...elements.options.querySelectorAll(".optionRow")].map((row) => {
    const id = row.querySelector('[data-option-field="id"]').value.trim();
    const text = localizedObject(
      row.querySelector('[data-option-field="zh"]').value,
      row.querySelector('[data-option-field="en"]').value
    );
    const imageId = row.querySelector('[data-option-field="media_image"]').value;
    return {
      id,
      ...(text["zh-CN"] || text["en-US"] ? { text } : {}),
      ...(imageId ? { media: [{ id: imageId, role: "option", kind: "image" }] } : {})
    };
  }).filter((item) => item.id || item.text?.["zh-CN"] || item.text?.["en-US"] || item.media?.length);
}

function showOptions(type) {
  const visible = ["single_choice", "multiple_choice", "true_false", "ordering"].includes(type);
  elements.options.closest(".formBlock").classList.toggle("hidden", !visible);
  if (type === "true_false") {
    setOptions([
      { id: "T", text: localizedObject("正确", "True") },
      { id: "F", text: localizedObject("错误", "False") }
    ]);
    elements.form.answer.placeholder = "T or F";
  } else if (type === "multiple_choice") {
    elements.form.answer.placeholder = "A,B";
  } else if (type === "ordering") {
    if (!elements.options.children.length) setOptions();
    elements.form.answer.placeholder = "A,B,C,D";
  } else if (visible && !elements.options.children.length) {
    setOptions();
    elements.form.answer.placeholder = "A";
  } else {
    elements.form.answer.placeholder = type === "numeric" ? "42 or 42.0" : type === "fill_blank" ? "答案 / answer" : "Short answer";
  }
}

function mediaLabel(kind) {
  return { image: "Image 图片", audio: "Audio 音频", video: "Video 视频" }[kind];
}

function mediaAccept(kind) {
  return { image: "image/*", audio: "audio/*", video: "video/*" }[kind];
}

function mediaOptions(kind, selectedId = "") {
  const select = document.createElement("select");
  select.dataset.mediaField = "existing";
  select.append(option("", "No existing media"));
  for (const item of state.media.filter((entry) => entry.type === kind)) {
    select.append(option(item.id, `${item.id} - ${item.title || item.path}`));
  }
  select.value = selectedId;
  return select;
}

function mediaEditor(kind, ref = {}) {
  const block = document.createElement("div");
  block.className = "mediaEditor";
  block.dataset.kind = kind;
  const heading = document.createElement("h3");
  heading.textContent = mediaLabel(kind);
  block.append(heading);
  const existing = document.createElement("label");
  existing.append("Use existing media", mediaOptions(kind, ref.id || ""));
  block.append(existing);
  for (const [label, field, value] of [
    ["Hint zh-CN", "hint_zh", localized(ref.hint, "zh-CN")],
    ["Hint en-US", "hint_en", localized(ref.hint, "en-US")],
    ["Upload title", "title", ""],
    ["Upload alt/description", "alt", ""],
    ["Upload tags", "tags", ""]
  ]) {
    const labelNode = document.createElement("label");
    const input = document.createElement("input");
    input.dataset.mediaField = field;
    input.value = value;
    labelNode.append(label, input);
    block.append(labelNode);
  }
  const fileLabel = document.createElement("label");
  const file = document.createElement("input");
  file.type = "file";
  file.accept = mediaAccept(kind);
  file.dataset.mediaField = "file";
  fileLabel.append("Upload new file", file);
  block.append(fileLabel);
  return block;
}

function toggleFor(kind) {
  return { image: elements.imageToggle, audio: elements.audioToggle, video: elements.videoToggle }[kind];
}

function renderMedia(values = []) {
  elements.mediaEditors.replaceChildren();
  for (const kind of ["image", "audio", "video"]) {
    const ref = values.find((item) => item.kind === kind || state.media.find((media) => media.id === item.id)?.type === kind);
    toggleFor(kind).checked = Boolean(ref);
    if (ref) elements.mediaEditors.append(mediaEditor(kind, ref));
  }
}

function syncMedia(kind) {
  const existing = elements.mediaEditors.querySelector(`[data-kind="${kind}"]`);
  if (toggleFor(kind).checked && !existing) elements.mediaEditors.append(mediaEditor(kind));
  if (!toggleFor(kind).checked && existing) existing.remove();
}

async function mediaRefs(upload = false) {
  const refs = [];
  for (const block of elements.mediaEditors.querySelectorAll(".mediaEditor")) {
    const file = block.querySelector('[data-media-field="file"]').files[0];
    let uploaded = null;
    if (upload && file) {
      uploaded = (await requestJson("/api/media", {
        method: "POST",
        body: JSON.stringify({
          type: block.dataset.kind,
          filename: file.name,
          title: block.querySelector('[data-media-field="title"]').value.trim(),
          alt: block.querySelector('[data-media-field="alt"]').value.trim(),
          tags: list(block.querySelector('[data-media-field="tags"]').value),
          dataUrl: await readDataUrlFile(file)
        })
      })).media;
    }
    const id = uploaded?.id || block.querySelector('[data-media-field="existing"]').value;
    if (!id) continue;
    const hintZh = block.querySelector('[data-media-field="hint_zh"]').value;
    const hintEn = block.querySelector('[data-media-field="hint_en"]').value;
    refs.push({
      id,
      kind: uploaded?.type || block.dataset.kind,
      role: "question",
      ...(hintZh.trim() && hintEn.trim() ? { hint: localizedObject(hintZh, hintEn) } : {})
    });
  }
  return refs;
}

function questionFromForm(uploadMedia = false) {
  const base = structuredClone(state.baseQuestion || {});
  for (const field of ["_file", "_line", "type", "category", "difficulty", "topic", "title", "prompt", "options", "answer", "reveal", "fun_fact", "tags", "mood", "occasion", "media", "play_time_sec", "status"]) delete base[field];
  return mediaRefs(uploadMedia).then((media) => {
    const question = {
      ...base,
      ...(state.selectedQuestion?.id ? { id: state.selectedQuestion.id } : {}),
      type: elements.form.type.value,
      category: elements.form.category.value,
      difficulty: elements.form.difficulty.value,
      ...(elements.form.topic.value.trim() ? { topic: elements.form.topic.value.trim() } : {}),
      title: localizedObject(elements.form.title_zh.value, elements.form.title_en.value),
      prompt: localizedObject(elements.form.prompt_zh.value, elements.form.prompt_en.value),
      answer: list(elements.form.answer.value),
      reveal: localizedObject(elements.form.reveal_zh.value, elements.form.reveal_en.value),
      ...(elements.form.fun_fact_zh.value.trim() || elements.form.fun_fact_en.value.trim()
        ? { fun_fact: localizedObject(elements.form.fun_fact_zh.value, elements.form.fun_fact_en.value) } : {}),
      tags: list(elements.form.tags.value),
      mood: selectedValues(elements.mood),
      occasion: selectedValues(elements.occasion),
      ...(media.length ? { media } : {}),
      play_time_sec: Number(elements.form.play_time_sec.value || 20),
      status: elements.form.status.value
    };
    if (["single_choice", "multiple_choice", "true_false", "ordering"].includes(question.type)) question.options = readOptions();
    return question;
  });
}

function fillForm(question) {
  state.baseQuestion = structuredClone(question);
  const form = elements.form;
  form.type.value = question.type || "single_choice";
  form.category.value = question.category || "general.weird-facts";
  form.difficulty.value = question.difficulty || "easy";
  form.status.value = question.status || "draft";
  form.topic.value = question.topic || "";
  form.play_time_sec.value = question.play_time_sec || 20;
  form.answer.value = (question.answer || []).join(",");
  for (const [field, value] of [
    ["title_zh", localized(question.title, "zh-CN")], ["title_en", localized(question.title, "en-US")],
    ["prompt_zh", localized(question.prompt, "zh-CN")], ["prompt_en", localized(question.prompt, "en-US")],
    ["reveal_zh", localized(question.reveal, "zh-CN")], ["reveal_en", localized(question.reveal, "en-US")],
    ["fun_fact_zh", localized(question.fun_fact, "zh-CN")], ["fun_fact_en", localized(question.fun_fact, "en-US")]
  ]) form[field].value = value;
  form.tags.value = (question.tags || []).join(",");
  setSelectedValues(elements.mood, question.mood || ["easygoing"]);
  setSelectedValues(elements.occasion, question.occasion || ["daily"]);
  setOptions(question.options || []);
  showOptions(form.type.value);
  renderMedia(question.media || []);
}

function setMode(mode) {
  state.mode = mode;
  elements.form.classList.toggle("hidden", mode !== "form");
  elements.json.classList.toggle("hidden", mode !== "json");
  byId("formatButton").classList.toggle("hidden", mode !== "json");
  byId("formModeButton").classList.toggle("active", mode === "form");
  byId("jsonModeButton").classList.toggle("active", mode === "json");
}

function newDraft() {
  state.selectedQuestion = null;
  elements.meta.textContent = "New draft. ID will be generated when saved.";
  fillForm({
    type: "single_choice",
    category: "general.weird-facts",
    difficulty: "easy",
    topic: "mixed",
    title: { "zh-CN": "", "en-US": "" },
    prompt: { "zh-CN": "", "en-US": "" },
    options: [],
    answer: [],
    reveal: { "zh-CN": "", "en-US": "" },
    tags: [],
    mood: ["easygoing"],
    occasion: ["daily"],
    play_time_sec: 20,
    status: "draft"
  });
  elements.json.value = "{}";
}

async function save() {
  try {
    const question = state.mode === "form" ? await questionFromForm(true) : JSON.parse(elements.json.value);
    const existing = Boolean(state.selectedQuestion?.id);
    const result = await requestJson(existing ? `/api/questions/${encodeURIComponent(state.selectedQuestion.id)}` : "/api/questions", {
      method: existing ? "PUT" : "POST",
      body: JSON.stringify(question)
    });
    elements.saveStatus.textContent = `Saved ${result.id} · ${result.file}`;
    if (!existing) {
      state.selectedQuestion = { id: result.id };
      history.replaceState(null, "", `/editor/?id=${encodeURIComponent(result.id)}`);
    }
  } catch (error) {
    elements.saveStatus.textContent = `Save failed: ${error.message}`;
  }
}

async function init() {
  const [bootstrap, media] = await Promise.all([loadBootstrap(), requestJson("/api/media")]);
  state.bootstrap = bootstrap;
  state.media = media.media;
  renderTaxonomy();
  if (questionId) {
    const result = await requestJson(`/api/questions/${encodeURIComponent(questionId)}`);
    state.selectedQuestion = result.question;
    elements.meta.textContent = `${result.question.id} · ${result.question._file}:${result.question._line}`;
    fillForm(result.question);
  } else newDraft();
  setMode("form");
}

byId("saveButton").addEventListener("click", save);
byId("formModeButton").addEventListener("click", async () => {
  if (state.mode === "json") fillForm(JSON.parse(elements.json.value || "{}"));
  setMode("form");
});
byId("jsonModeButton").addEventListener("click", async () => {
  elements.json.value = JSON.stringify(await questionFromForm(), null, 2);
  setMode("json");
});
byId("formatButton").addEventListener("click", () => {
  try { elements.json.value = JSON.stringify(JSON.parse(elements.json.value), null, 2); }
  catch (error) { elements.saveStatus.textContent = `Invalid JSON: ${error.message}`; }
});
byId("addOptionButton").addEventListener("click", () => {
  addOptionRow({ id: String.fromCharCode(65 + elements.options.children.length), text: localizedObject("", "") });
});
elements.type.addEventListener("change", () => showOptions(elements.type.value));
for (const [kind, toggle] of [["image", elements.imageToggle], ["audio", elements.audioToggle], ["video", elements.videoToggle]]) {
  toggle.addEventListener("change", () => syncMedia(kind));
}

startPage(init);
