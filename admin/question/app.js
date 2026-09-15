import { requestJson } from "../shared/api.js";
import { localized } from "../shared/i18n.js";
import { createQuestionSlide } from "../shared/question-view.js";
import { mountAppShell } from "../shared/app-shell.js";

const params = new URLSearchParams(location.search);
const questionId = params.get("id");
let revealVisible = false;
let question = null;
let media = [];
let selectedOptionIds = new Set();
let focusedOptionId = "";

const deck = document.querySelector("#questionPreviewDeck");
const meta = document.querySelector("#questionMeta");
const revealButton = document.querySelector("#toggleRevealButton");
const localeSelect = document.querySelector("#questionLocale");
const revealModeSelect = document.querySelector("#questionRevealMode");
const editLink = document.querySelector("#editQuestionLink");

function render() {
  const revealMode = revealModeSelect.value;
  deck.replaceChildren();
  if (!question) return;
  const slide = createQuestionSlide({
    question,
    media,
    locale: localeSelect.value,
    revealVisible,
    revealMode,
    selectedOptionIds,
    focusedOptionId,
    onOptionFocus: focusOption,
    onOptionToggle: toggleOption
  });
  slide.classList.add("activeSlide");
  deck.append(slide);
  revealButton.disabled = revealMode === "inline";
  revealButton.textContent = revealMode === "inline" ? "Reveal Inline" : revealVisible ? "Hide Reveal" : "Show Reveal";
}

function focusOption(optionId) {
  if (!question || !optionId) return;
  focusedOptionId = optionId;
}

function toggleOption(optionId) {
  if (!question || !optionId) return;
  focusOption(optionId);
  if (selectedOptionIds.has(optionId)) {
    selectedOptionIds.delete(optionId);
  } else {
    if (question.type !== "multiple_choice") selectedOptionIds.clear();
    selectedOptionIds.add(optionId);
  }
  render();
}

function canToggleReveal() {
  return revealModeSelect.value !== "inline";
}

function toggleReveal() {
  if (!canToggleReveal()) return;
  revealVisible = !revealVisible;
  render();
}

function optionElements() {
  return [...deck.querySelectorAll(".slideOptions li[data-option-id]")];
}

function moveOptionFocus(direction) {
  const options = optionElements();
  if (options.length === 0) return false;
  const currentElement = options.find((item) => item.dataset.optionId === focusedOptionId) || options.find((item) => item.classList.contains("selected")) || options[0];
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
  focusOption(next.dataset.optionId);
  render();
  deck.querySelector(`[data-option-id="${CSS.escape(next.dataset.optionId)}"]`)?.focus();
  return true;
}

function selectFocusedOption() {
  const optionId = focusedOptionId || question?.options?.[0]?.id;
  if (!optionId) return false;
  toggleOption(optionId);
  return true;
}

function selectOptionByNumber(key) {
  if (!/^[1-9]$/.test(key)) return false;
  const option = question?.options?.[Number(key) - 1];
  if (!option) return false;
  toggleOption(option.id);
  return true;
}

async function init() {
  mountAppShell();
  if (!questionId) throw new Error("Missing question id.");
  const [questionResult, mediaResult] = await Promise.all([
    requestJson(`/api/questions/${encodeURIComponent(questionId)}`),
    requestJson("/api/media")
  ]);
  question = questionResult.question;
  media = mediaResult.media;
  document.title = `${localized(question.title)} - Wan Ti Wang`;
  const feedback = question.feedback
    ? ` · answered ${question.feedback.answered_count || 0} · correct ${question.feedback.correct_count || 0}`
    : "";
  meta.textContent = `${question.id} · ${question.category}${feedback}`;
  editLink.href = `/editor/?id=${encodeURIComponent(question.id)}`;
  render();
}

revealButton.addEventListener("click", () => {
  toggleReveal();
});
localeSelect.addEventListener("change", render);
revealModeSelect.addEventListener("change", () => {
  revealVisible = revealModeSelect.value === "inline";
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || isEditingTarget(event.target)) return;
  const key = event.key;
  const lower = key.toLowerCase();
  if (lower === "f" || lower === "r") {
    event.preventDefault();
    toggleReveal();
    return;
  }
  if (key === "Escape" && revealVisible && canToggleReveal()) {
    event.preventDefault();
    toggleReveal();
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

init().catch((error) => {
  deck.innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
