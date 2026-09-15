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
    onOptionToggle: toggleOption
  });
  slide.classList.add("activeSlide");
  deck.append(slide);
  revealButton.disabled = revealMode === "inline";
  revealButton.textContent = revealMode === "inline" ? "Reveal Inline" : revealVisible ? "Hide Reveal" : "Show Reveal";
}

function toggleOption(optionId) {
  if (!question || !optionId) return;
  if (selectedOptionIds.has(optionId)) {
    selectedOptionIds.delete(optionId);
  } else {
    if (question.type !== "multiple_choice") selectedOptionIds.clear();
    selectedOptionIds.add(optionId);
  }
  render();
}

function toggleOptionByShortcut(key) {
  if (!question) return false;
  const normalized = key.toLowerCase();
  const byId = (question.options || []).find((option) => option.id.toLowerCase() === normalized);
  const byIndex = /^[1-9]$/.test(key) ? question.options?.[Number(key) - 1] : null;
  const option = byId || byIndex;
  if (!option) return false;
  toggleOption(option.id);
  return true;
}

function canToggleReveal() {
  return revealModeSelect.value !== "inline";
}

function toggleReveal() {
  if (!canToggleReveal()) return;
  revealVisible = !revealVisible;
  render();
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
  if (toggleOptionByShortcut(key)) {
    event.preventDefault();
  }
});

function isEditingTarget(target) {
  return Boolean(target?.closest?.("input, textarea, select, button, [contenteditable='true'], audio, video"));
}

init().catch((error) => {
  deck.innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
