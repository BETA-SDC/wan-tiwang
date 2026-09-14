import { requestJson } from "../shared/api.js";
import { localized } from "../shared/i18n.js";
import { createQuestionSlide } from "../shared/question-view.js";
import { mountAppShell } from "../shared/app-shell.js";

const state = {
  questions: [],
  media: [],
  selectedIds: new Set(JSON.parse(localStorage.getItem("wtw:selectedSlideIds") || "[]")),
  slideQuestions: [],
  currentSlide: 0,
  revealVisible: false
};

const elements = {
  deckTitle: document.querySelector("#deckTitle"),
  slideSource: document.querySelector("#slideSource"),
  slideSearch: document.querySelector("#slideSearch"),
  slideCount: document.querySelector("#slideCount"),
  slideLocale: document.querySelector("#slideLocale"),
  slideRevealMode: document.querySelector("#slideRevealMode"),
  pickerStatus: document.querySelector("#pickerStatus"),
  slideQuestionPicker: document.querySelector("#slideQuestionPicker"),
  slideDeck: document.querySelector("#slideDeck"),
  slideStatus: document.querySelector("#slideStatus"),
  exportStatus: document.querySelector("#exportStatus")
};

function saveSelection() {
  localStorage.setItem("wtw:selectedSlideIds", JSON.stringify([...state.selectedIds]));
}

function matchesSearch(question) {
  const query = elements.slideSearch.value.trim().toLowerCase();
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

function shownQuestions() {
  return state.questions.filter(matchesSearch);
}

function renderPicker() {
  const questions = shownQuestions();
  elements.pickerStatus.textContent = `${questions.length} shown · ${state.selectedIds.size} selected`;
  elements.slideQuestionPicker.replaceChildren();

  for (const question of questions.slice(0, 300)) {
    const row = document.createElement("label");
    row.className = "pickerItem";
    row.classList.toggle("selected", state.selectedIds.has(question.id));

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedIds.has(question.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedIds.add(question.id);
      else state.selectedIds.delete(question.id);
      saveSelection();
      renderPicker();
    });

    const text = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = localized(question.title);
    const meta = document.createElement("small");
    meta.textContent = `${question.id} · ${question.category}`;
    text.append(title, meta);

    row.append(checkbox, text);
    elements.slideQuestionPicker.append(row);
  }

  if (questions.length > 300) {
    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = "Showing first 300 matches. Use search to narrow the picker. 当前只显示前 300 条，请搜索缩小范围。";
    elements.slideQuestionPicker.append(note);
  }
}

function renderSlides() {
  elements.slideDeck.replaceChildren();
  if (state.slideQuestions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptySlide";
    empty.textContent = "Choose questions and build slides. 选择题目后生成幻灯片。";
    elements.slideDeck.append(empty);
    elements.slideStatus.textContent = "No slides yet.";
    return;
  }

  state.currentSlide = Math.max(0, Math.min(state.currentSlide, state.slideQuestions.length - 1));
  const slide = createQuestionSlide({
    question: state.slideQuestions[state.currentSlide],
    media: state.media,
    locale: elements.slideLocale.value,
    index: state.currentSlide,
    total: state.slideQuestions.length,
    revealVisible: state.revealVisible,
    revealMode: elements.slideRevealMode.value
  });
  slide.classList.add("activeSlide");
  elements.slideDeck.append(slide);
  elements.slideStatus.textContent = `${state.currentSlide + 1} / ${state.slideQuestions.length}`;
  document.querySelector("#toggleRevealButton").textContent = state.revealVisible ? "Hide Reveal" : "Show Reveal";
}

function shuffleItems(items) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function sourceQuestions() {
  if (elements.slideSource.value === "selected") return state.questions.filter((question) => state.selectedIds.has(question.id));
  if (elements.slideSource.value === "filtered") return shownQuestions();
  return state.questions;
}

function buildSlides({ shuffle = false } = {}) {
  const count = Number(elements.slideCount.value || 10);
  let questions = sourceQuestions();
  if (shuffle) questions = shuffleItems(questions);
  state.slideQuestions = questions.slice(0, count);
  state.currentSlide = 0;
  state.revealVisible = elements.slideRevealMode.value === "inline";
  renderSlides();
}

async function exportSlides() {
  elements.exportStatus.textContent = "Generating exported HTML...";
  if (state.slideQuestions.length === 0) buildSlides();
  const ids = state.slideQuestions.map((question) => question.id);
  const result = await requestJson("/api/slides/export", {
    method: "POST",
    body: JSON.stringify({
      ids,
      title: elements.deckTitle.value.trim() || "Wan Ti Wang Slides",
      locale: elements.slideLocale.value,
      revealMode: elements.slideRevealMode.value
    })
  });

  elements.exportStatus.replaceChildren();
  const label = document.createElement("strong");
  label.textContent = `Generated ${result.count} slide(s)`;
  const download = document.createElement("a");
  download.href = result.url;
  download.download = "";
  download.textContent = "Download HTML";
  const open = document.createElement("a");
  open.href = result.url;
  open.target = "_blank";
  open.rel = "noreferrer";
  open.textContent = "Open";
  const file = document.createElement("small");
  file.textContent = result.file;
  elements.exportStatus.append(label, download, open, file);
}

function moveSlide(delta) {
  if (state.slideQuestions.length === 0) return;
  state.currentSlide = Math.max(0, Math.min(state.slideQuestions.length - 1, state.currentSlide + delta));
  renderSlides();
}

function togglePresentation(force) {
  const enabled = force ?? !document.body.classList.contains("presenting");
  document.body.classList.toggle("presenting", enabled);
  document.querySelector("#presentSlidesButton").textContent = enabled ? "Exit" : "Present";
}

async function init() {
  mountAppShell();
  const [questions, media] = await Promise.all([
    requestJson("/api/questions?limit=10000"),
    requestJson("/api/media")
  ]);
  state.questions = questions.questions;
  state.media = media.media;
  if (state.selectedIds.size === 0) elements.slideSource.value = "filtered";
  renderPicker();
  buildSlides();
}

document.querySelector("#buildSlidesButton").addEventListener("click", () => buildSlides());
document.querySelector("#shuffleSlidesButton").addEventListener("click", () => buildSlides({ shuffle: true }));
document.querySelector("#exportSlidesButton").addEventListener("click", () => {
  exportSlides().catch((error) => {
    elements.exportStatus.textContent = `Export failed: ${error.message}`;
  });
});
document.querySelector("#prevSlideButton").addEventListener("click", () => moveSlide(-1));
document.querySelector("#nextSlideButton").addEventListener("click", () => moveSlide(1));
document.querySelector("#toggleRevealButton").addEventListener("click", () => {
  state.revealVisible = !state.revealVisible;
  renderSlides();
});
document.querySelector("#presentSlidesButton").addEventListener("click", () => togglePresentation());
document.querySelector("#printSlidesButton").addEventListener("click", () => window.print());
document.querySelector("#selectAllButton").addEventListener("click", () => {
  for (const question of shownQuestions()) state.selectedIds.add(question.id);
  saveSelection();
  renderPicker();
});
document.querySelector("#clearSelectionButton").addEventListener("click", () => {
  state.selectedIds.clear();
  saveSelection();
  renderPicker();
});
elements.slideSearch.addEventListener("input", renderPicker);
elements.slideLocale.addEventListener("change", renderSlides);
elements.slideRevealMode.addEventListener("change", renderSlides);
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveSlide(-1);
  if (event.key === "ArrowRight") moveSlide(1);
  if (event.key.toLowerCase() === "r") {
    state.revealVisible = !state.revealVisible;
    renderSlides();
  }
  if (event.key === "Escape") togglePresentation(false);
});
document.addEventListener("wtw:selection-cleared", () => {
  state.selectedIds.clear();
  elements.slideSource.value = "filtered";
  renderPicker();
  buildSlides();
});

init().catch((error) => {
  document.body.innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
