import { requestJson } from "../shared/api.js";
import { localized } from "../shared/i18n.js";
import { createQuestionSlide, isChoiceQuestion } from "../shared/question-view.js";
import { mountAppShell } from "../shared/app-shell.js";

const state = {
  questions: [],
  media: [],
  selectedIds: new Set(JSON.parse(localStorage.getItem("wtw:selectedSlideIds") || "[]")),
  slideQuestions: [],
  currentSlide: 0,
  revealVisible: false,
  guessQuestionMode: false,
  questionVisible: true,
  previewSelections: new Map(),
  focusedOptions: new Map()
};

const elements = {
  deckTitle: document.querySelector("#deckTitle"),
  slideSource: document.querySelector("#slideSource"),
  slideSearch: document.querySelector("#slideSearch"),
  slideCount: document.querySelector("#slideCount"),
  slideLocale: document.querySelector("#slideLocale"),
  slideRevealMode: document.querySelector("#slideRevealMode"),
  guessQuestionMode: document.querySelector("#guessQuestionMode"),
  pickerStatus: document.querySelector("#pickerStatus"),
  slideQuestionPicker: document.querySelector("#slideQuestionPicker"),
  slideDeck: document.querySelector("#slideDeck"),
  slideStatus: document.querySelector("#slideStatus"),
  toggleGuessModeButton: document.querySelector("#toggleGuessModeButton"),
  toggleQuestionButton: document.querySelector("#toggleQuestionButton"),
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
  const revealMode = elements.slideRevealMode.value;
  elements.slideDeck.replaceChildren();
  if (state.slideQuestions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "emptySlide";
    empty.textContent = "Choose questions and build slides. 选择题目后生成幻灯片。";
    elements.slideDeck.append(empty);
    elements.slideStatus.textContent = "No slides yet.";
    elements.toggleGuessModeButton.disabled = true;
    elements.toggleQuestionButton.disabled = true;
    return;
  }

  state.currentSlide = Math.max(0, Math.min(state.currentSlide, state.slideQuestions.length - 1));
  const question = state.slideQuestions[state.currentSlide];
  const canToggleQuestion = state.guessQuestionMode && isChoiceQuestion(question);
  const questionVisible = !canToggleQuestion || state.questionVisible;
  const slide = createQuestionSlide({
    question,
    media: state.media,
    locale: elements.slideLocale.value,
    index: state.currentSlide,
    total: state.slideQuestions.length,
    revealVisible: state.revealVisible,
    revealMode,
    selectedOptionIds: selectedOptionIdsForCurrentSlide(),
    focusedOptionId: focusedOptionIdForCurrentSlide(),
    guessQuestionMode: state.guessQuestionMode,
    questionVisible,
    onOptionFocus: focusCurrentOption,
    onOptionToggle: toggleCurrentOption
  });
  slide.classList.add("activeSlide");
  elements.slideDeck.append(slide);
  elements.slideStatus.textContent = `${state.currentSlide + 1} / ${state.slideQuestions.length}`;
  const revealButton = document.querySelector("#toggleRevealButton");
  revealButton.disabled = revealMode === "inline";
  revealButton.textContent = revealMode === "inline" ? "Reveal Inline" : state.revealVisible ? "Hide Reveal" : "Show Reveal";
  elements.toggleGuessModeButton.disabled = false;
  elements.toggleGuessModeButton.textContent = state.guessQuestionMode ? "Disable Guess Mode" : "Enable Guess Mode";
  elements.toggleQuestionButton.disabled = !canToggleQuestion;
  elements.toggleQuestionButton.textContent = canToggleQuestion && questionVisible ? "Hide Question" : "Show Question";
}

function currentQuestion() {
  return state.slideQuestions[state.currentSlide];
}

function selectedOptionIdsForCurrentSlide() {
  const question = currentQuestion();
  return new Set(state.previewSelections.get(question?.id) || []);
}

function focusedOptionIdForCurrentSlide() {
  const question = currentQuestion();
  return state.focusedOptions.get(question?.id) || "";
}

function setCurrentSelection(selected) {
  const question = currentQuestion();
  if (!question) return;
  state.previewSelections.set(question.id, [...selected]);
}

function focusCurrentOption(optionId) {
  const question = currentQuestion();
  if (!question || !optionId) return;
  state.focusedOptions.set(question.id, optionId);
}

function toggleCurrentOption(optionId) {
  const question = currentQuestion();
  if (!question || !optionId) return;
  focusCurrentOption(optionId);
  const selected = selectedOptionIdsForCurrentSlide();
  if (selected.has(optionId)) {
    selected.delete(optionId);
  } else {
    if (question.type !== "multiple_choice") selected.clear();
    selected.add(optionId);
  }
  setCurrentSelection(selected);
  renderSlides();
}

function optionElements() {
  return [...elements.slideDeck.querySelectorAll(".slideOptions li[data-option-id]")];
}

function moveOptionFocus(direction) {
  const options = optionElements();
  if (options.length === 0) return false;
  const currentId = focusedOptionIdForCurrentSlide();
  const currentElement = options.find((item) => item.dataset.optionId === currentId) || options.find((item) => item.classList.contains("selected")) || options[0];
  const currentRect = currentElement.getBoundingClientRect();
  const centerX = currentRect.left + currentRect.width / 2;
  const centerY = currentRect.top + currentRect.height / 2;
  const candidates = options
    .filter((item) => item !== currentElement)
    .map((item) => {
      const rect = item.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      return { item, dx, dy, distance: Math.hypot(dx, dy) };
    })
    .filter(({ dx, dy }) => {
      if (direction === "left") return dx < -8;
      if (direction === "right") return dx > 8;
      if (direction === "up") return dy < -8;
      if (direction === "down") return dy > 8;
      return false;
    })
    .sort((a, b) => {
      const primaryA = direction === "left" || direction === "right" ? Math.abs(a.dx) : Math.abs(a.dy);
      const primaryB = direction === "left" || direction === "right" ? Math.abs(b.dx) : Math.abs(b.dy);
      const crossA = direction === "left" || direction === "right" ? Math.abs(a.dy) : Math.abs(a.dx);
      const crossB = direction === "left" || direction === "right" ? Math.abs(b.dy) : Math.abs(b.dx);
      return primaryA - primaryB || crossA - crossB || a.distance - b.distance;
    });
  const next = candidates[0]?.item || currentElement;
  focusCurrentOption(next.dataset.optionId);
  renderSlides();
  elements.slideDeck.querySelector(`[data-option-id="${CSS.escape(next.dataset.optionId)}"]`)?.focus();
  return true;
}

function selectFocusedOption() {
  const question = currentQuestion();
  if (!question) return false;
  const optionId = focusedOptionIdForCurrentSlide() || question.options?.[0]?.id;
  if (!optionId) return false;
  toggleCurrentOption(optionId);
  return true;
}

function selectOptionByNumber(key) {
  if (!/^[1-9]$/.test(key)) return false;
  const option = currentQuestion()?.options?.[Number(key) - 1];
  if (!option) return false;
  toggleCurrentOption(option.id);
  return true;
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
  const count = Number(elements.slideCount.value || 100);
  let questions = sourceQuestions();
  if (shuffle) questions = shuffleItems(questions);
  state.slideQuestions = questions.slice(0, count);
  state.currentSlide = 0;
  state.revealVisible = elements.slideRevealMode.value === "inline";
  state.questionVisible = !state.guessQuestionMode;
  renderSlides();
}

function syncRevealForMode() {
  state.revealVisible = elements.slideRevealMode.value === "inline";
  renderSlides();
}

function canToggleReveal() {
  return elements.slideRevealMode.value !== "inline";
}

function toggleReveal() {
  if (!canToggleReveal()) return;
  state.revealVisible = !state.revealVisible;
  renderSlides();
}

function canToggleQuestion() {
  return state.guessQuestionMode && isChoiceQuestion(currentQuestion());
}

function toggleQuestion() {
  if (!canToggleQuestion()) return;
  state.questionVisible = !state.questionVisible;
  renderSlides();
}

function setGuessQuestionMode(enabled) {
  state.guessQuestionMode = enabled;
  elements.guessQuestionMode.checked = enabled;
  state.questionVisible = !enabled;
  renderSlides();
}

function toggleGuessQuestionMode() {
  if (state.slideQuestions.length === 0) return;
  setGuessQuestionMode(!state.guessQuestionMode);
}

async function exportSlides() {
  elements.exportStatus.textContent = "Generating export folder...";
  if (state.slideQuestions.length === 0) buildSlides();
  const ids = state.slideQuestions.map((question) => question.id);
  const result = await requestJson("/api/slides/export", {
    method: "POST",
    body: JSON.stringify({
      ids,
      title: elements.deckTitle.value.trim() || "Wan Ti Wang Slides",
      locale: elements.slideLocale.value,
      revealMode: elements.slideRevealMode.value,
      guessQuestionMode: state.guessQuestionMode
    })
  });

  elements.exportStatus.replaceChildren();
  const label = document.createElement("strong");
  label.textContent = `Export complete: ${result.count} slide(s)`;
  const download = document.createElement("a");
  download.href = result.url;
  download.textContent = "Open Deck";
  const open = document.createElement("a");
  open.href = result.url;
  open.target = "_blank";
  open.rel = "noreferrer";
  open.textContent = "Open in New Tab";
  const file = document.createElement("small");
  const missing = result.media?.missing?.length ? ` · missing media: ${result.media.missing.length}` : "";
  file.textContent = `${result.folder} · media copied: ${result.media?.copied ?? 0}/${result.media?.total ?? 0}${missing}`;
  elements.exportStatus.append(label, download, open, file);
  window.alert(`Export complete.\n\nFolder: ${result.folder}`);
}

function moveSlide(delta) {
  if (state.slideQuestions.length === 0) return;
  const nextSlide = Math.max(0, Math.min(state.slideQuestions.length - 1, state.currentSlide + delta));
  const changed = nextSlide !== state.currentSlide;
  state.currentSlide = nextSlide;
  if (changed && elements.slideRevealMode.value !== "inline") state.revealVisible = false;
  if (changed) state.questionVisible = !state.guessQuestionMode;
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
  toggleReveal();
});
elements.toggleQuestionButton.addEventListener("click", toggleQuestion);
elements.toggleGuessModeButton.addEventListener("click", toggleGuessQuestionMode);
document.querySelector("#exitPresentButton").addEventListener("click", () => togglePresentation(false));
document.querySelector("#presentSlidesButton").addEventListener("click", () => togglePresentation());
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
elements.slideRevealMode.addEventListener("change", syncRevealForMode);
elements.guessQuestionMode.addEventListener("change", () => {
  setGuessQuestionMode(elements.guessQuestionMode.checked);
});
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || isEditingTarget(event.target)) return;
  const key = event.key;
  const lower = key.toLowerCase();
  if (["ArrowLeft", "PageUp", "p", "Backspace"].includes(key) || lower === "p") {
    event.preventDefault();
    moveSlide(-1);
    return;
  }
  if (["ArrowRight", "PageDown", " ", "n"].includes(key) || lower === "n") {
    event.preventDefault();
    moveSlide(1);
    return;
  }
  if (lower === "f" || lower === "r") {
    event.preventDefault();
    toggleReveal();
    return;
  }
  if (lower === "h") {
    event.preventDefault();
    toggleQuestion();
    return;
  }
  if (lower === "g") {
    event.preventDefault();
    toggleGuessQuestionMode();
    return;
  }
  if (key === "Escape") {
    event.preventDefault();
    if (state.revealVisible && canToggleReveal()) toggleReveal();
    else togglePresentation(false);
    return;
  }
  if (lower === "w" && moveOptionFocus("up")) {
    event.preventDefault();
    return;
  }
  if (lower === "a" && moveOptionFocus("left")) {
    event.preventDefault();
    return;
  }
  if (lower === "s" && moveOptionFocus("down")) {
    event.preventDefault();
    return;
  }
  if (lower === "d" && moveOptionFocus("right")) {
    event.preventDefault();
    return;
  }
  if (key === "Enter" && selectFocusedOption()) {
    event.preventDefault();
    return;
  }
  if (selectOptionByNumber(key)) {
    event.preventDefault();
  }
});

function isEditingTarget(target) {
  return Boolean(target?.closest?.("input, textarea, select, button, [contenteditable='true'], audio, video"));
}
document.addEventListener("wtw:selection-cleared", () => {
  state.selectedIds.clear();
  elements.slideSource.value = "filtered";
  renderPicker();
  buildSlides();
});

init().catch((error) => {
  document.body.innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
