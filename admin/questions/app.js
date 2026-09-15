import { requestJson } from "../shared/api.js";
import { localized } from "../shared/i18n.js";
import { mountAppShell } from "../shared/app-shell.js";

const state = {
  bootstrap: null,
  questions: [],
  categoryPath: [],
  selectedIds: new Set(JSON.parse(localStorage.getItem("wtw:selectedSlideIds") || "[]"))
};

const elements = {
  categoryLevels: document.querySelector("#categoryLevels"),
  typeFilter: document.querySelector("#typeFilter"),
  difficultyFilter: document.querySelector("#difficultyFilter"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  questionList: document.querySelector("#questionList"),
  questionCount: document.querySelector("#questionCount")
};

function option(value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  return node;
}

function saveSelection() {
  localStorage.setItem("wtw:selectedSlideIds", JSON.stringify([...state.selectedIds]));
  document.dispatchEvent(new CustomEvent("wtw:selection-changed", { detail: { count: state.selectedIds.size } }));
}

function childCategories(parentId) {
  return state.bootstrap.categories
    .filter((category) => (parentId ? category.parent === parentId : !category.parent))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function categoryLabel(category) {
  return `${category.name} (${category.id})`;
}

function renderCategoryLevels() {
  elements.categoryLevels.replaceChildren();
  let parentId = "";
  let depth = 0;
  while (true) {
    const children = childCategories(parentId);
    if (!children.length) break;
    const currentDepth = depth;
    const select = document.createElement("select");
    select.id = `categoryLevel${currentDepth}`;
    select.setAttribute("aria-label", currentDepth ? `Subcategory level ${currentDepth}` : "Top-level category");
    select.append(option("", currentDepth ? "All subcategories" : "All categories"));
    for (const category of children) select.append(option(category.id, categoryLabel(category)));
    select.value = state.categoryPath[currentDepth] || "";
    select.addEventListener("change", () => {
      state.categoryPath = state.categoryPath.slice(0, currentDepth);
      if (select.value) state.categoryPath.push(select.value);
      renderCategoryLevels();
      loadQuestions();
    });
    elements.categoryLevels.append(select);
    if (!select.value) break;
    parentId = select.value;
    depth += 1;
  }
}

function selectedCategoryPrefix() {
  return state.categoryPath.at(-1) || "";
}

function renderFilters() {
  renderCategoryLevels();
  elements.typeFilter.replaceChildren(option("", "All answer types"));
  for (const format of state.bootstrap.formats) elements.typeFilter.append(option(format.id, `${format.name} (${format.id})`));
  elements.difficultyFilter.replaceChildren(option("", "All difficulties"));
  for (const difficulty of state.bootstrap.difficulties) elements.difficultyFilter.append(option(difficulty.id, `${difficulty.name} (${difficulty.id})`));
}

function questionMatches(question) {
  const query = elements.searchInput.value.trim().toLowerCase();
  if (!query) return true;
  return [
    question.id,
    question.category,
    question.type,
    localized(question.title, "zh-CN"),
    localized(question.title, "en-US"),
    localized(question.prompt, "zh-CN"),
    localized(question.prompt, "en-US"),
    ...(question.tags || [])
  ].join(" ").toLowerCase().includes(query);
}

function pill(text) {
  const node = document.createElement("span");
  node.className = "pill";
  node.textContent = text;
  return node;
}

function renderQuestions() {
  elements.questionCount.textContent = `${state.questions.length} shown · ${state.selectedIds.size} selected for slides`;
  elements.questionList.replaceChildren();
  if (!state.questions.length) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No questions match these filters. 没有符合条件的题目。";
    elements.questionList.append(empty);
    return;
  }
  for (const question of state.questions) {
    const node = document.createElement("article");
    node.className = "questionItem";
    node.classList.toggle("selected", state.selectedIds.has(question.id));
    const titleRow = document.createElement("div");
    titleRow.className = "questionTitle";
    const selectLabel = document.createElement("label");
    selectLabel.className = "checkLabel";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedIds.has(question.id);
    const titleLink = document.createElement("a");
    titleLink.href = `/question/?id=${encodeURIComponent(question.id)}`;
    titleLink.textContent = localized(question.title);
    titleLink.className = "questionTitleLink";
    selectLabel.append(checkbox, titleLink);
    const status = document.createElement("span");
    status.className = "statusText";
    status.textContent = question.status;
    titleRow.append(selectLabel, status);
    const prompt = document.createElement("p");
    prompt.textContent = localized(question.prompt);
    const meta = document.createElement("div");
    meta.className = "meta";
    for (const value of [question.id, question.category, question.type, question.difficulty].filter(Boolean)) {
      const item = document.createElement("span");
      item.textContent = value;
      meta.append(item);
    }
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const tag of question.tags || []) tags.append(pill(tag));
    const actions = document.createElement("div");
    actions.className = "actions";
    const preview = document.createElement("a");
    preview.className = "buttonLink";
    preview.href = `/question/?id=${encodeURIComponent(question.id)}`;
    preview.textContent = "Preview";
    const edit = document.createElement("a");
    edit.className = "buttonLink";
    edit.href = `/editor/?id=${encodeURIComponent(question.id)}`;
    edit.textContent = "Edit";
    actions.append(preview, edit);
    node.append(titleRow, prompt, meta, tags, actions);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedIds.add(question.id);
      else state.selectedIds.delete(question.id);
      saveSelection();
      renderQuestions();
    });
    elements.questionList.append(node);
  }
}

async function loadQuestions() {
  const params = new URLSearchParams();
  if (elements.searchInput.value) params.set("q", elements.searchInput.value);
  if (selectedCategoryPrefix()) params.set("categoryPrefix", selectedCategoryPrefix());
  if (elements.typeFilter.value) params.set("type", elements.typeFilter.value);
  if (elements.difficultyFilter.value) params.set("difficulty", elements.difficultyFilter.value);
  if (elements.statusFilter.value) params.set("status", elements.statusFilter.value);
  const data = await requestJson(`/api/questions?${params}`);
  state.questions = data.questions;
  renderQuestions();
}

async function init() {
  mountAppShell();
  state.bootstrap = await requestJson("/api/bootstrap");
  renderFilters();
  await loadQuestions();
}

document.querySelector("#applyFiltersButton").addEventListener("click", loadQuestions);
elements.typeFilter.addEventListener("change", loadQuestions);
elements.difficultyFilter.addEventListener("change", loadQuestions);
elements.statusFilter.addEventListener("change", loadQuestions);
elements.searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loadQuestions();
});
document.querySelector("#selectShownButton").addEventListener("click", () => {
  for (const question of state.questions) state.selectedIds.add(question.id);
  saveSelection();
  renderQuestions();
});
document.querySelector("#clearShownButton").addEventListener("click", () => {
  for (const question of state.questions) state.selectedIds.delete(question.id);
  saveSelection();
  renderQuestions();
});
document.addEventListener("wtw:selection-cleared", () => {
  state.selectedIds.clear();
  renderQuestions();
});

init().catch((error) => {
  document.querySelector("#pageContent").innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
