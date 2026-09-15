import { requestJson } from "../shared/api.js";
import { localized } from "../shared/i18n.js";
import { createQuestionSlide } from "../shared/question-view.js";
import { mountAppShell } from "../shared/app-shell.js";

const params = new URLSearchParams(location.search);
const questionId = params.get("id");
let revealVisible = false;
let question = null;
let media = [];

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
    revealMode
  });
  slide.classList.add("activeSlide");
  deck.append(slide);
  revealButton.disabled = revealMode === "inline";
  revealButton.textContent = revealMode === "inline" ? "Reveal Inline" : revealVisible ? "Hide Reveal" : "Show Reveal";
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
  meta.textContent = `${question.id} · ${question.category}`;
  editLink.href = `/editor/?id=${encodeURIComponent(question.id)}`;
  render();
}

revealButton.addEventListener("click", () => {
  revealVisible = !revealVisible;
  render();
});
localeSelect.addEventListener("change", render);
revealModeSelect.addEventListener("change", () => {
  revealVisible = revealModeSelect.value === "inline";
  render();
});

init().catch((error) => {
  deck.innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
