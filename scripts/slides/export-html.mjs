function localized(value, locale = "zh-CN") {
  if (!value || typeof value !== "object") return "";
  return value[locale] || value["en-US"] || "";
}

function displayText(value, locale = "zh-CN") {
  if (locale !== "bilingual") return localized(value, locale);
  const zh = localized(value, "zh-CN");
  const en = localized(value, "en-US");
  if (!zh) return en;
  if (!en || en === zh) return zh;
  return `${zh}\n${en}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeScriptJson(value) {
  return JSON.stringify(value, null, 2).replaceAll("</", "<\\/");
}

function formatAnswer(question, locale) {
  const answers = question.answer || [];
  const formatRaw = (answer) => {
    if (answer && typeof answer === "object") {
      if (answer.left && answer.right) return `${answer.left} -> ${answer.right}`;
      return JSON.stringify(answer);
    }
    return String(answer);
  };
  if (!question.options) return answers.map(formatRaw).join(", ");
  return answers.map((answer) => {
    if (answer && typeof answer === "object") return formatRaw(answer);
    const item = question.options.find((option) => option.id === answer);
    const label = displayText(item?.text, locale).replace(/\n/g, " / ") || (item?.media?.length ? "media option" : "");
    return item ? `${answer}${label ? `. ${label}` : ""}` : answer;
  }).join(", ");
}

function mediaRefHtml(ref, mediaById, locale, relativePrefix) {
    const item = mediaById.get(ref.id);
    if (!item) return "";
    const kind = ref.kind || item.type;
    const src = `${relativePrefix}${item.path}`;
    const label = escapeHtml(displayText(ref.hint, locale) || item.alt || item.title || ref.id);
    if (kind === "image" || kind === "thumbnail") return `<img src="${escapeHtml(src)}" alt="${label}">`;
    if (kind === "audio") return `<audio controls src="${escapeHtml(src)}"></audio>`;
    if (kind === "video") return `<video controls src="${escapeHtml(src)}"></video>`;
    return "";
}

function slideMediaHtml(question, mediaById, locale, relativePrefix) {
  return (question.media || []).map((ref) => mediaRefHtml(ref, mediaById, locale, relativePrefix)).join("");
}

function optionHtml(item, mediaById, locale, relativePrefix) {
  const media = (item.media || []).map((ref) => mediaRefHtml(ref, mediaById, locale, relativePrefix)).join("");
  const text = displayText(item.text, locale);
  return `
    <li>
      <span>${escapeHtml(item.id)}</span>
      <div class="optionBody">${media}${text ? `<strong>${escapeHtml(text)}</strong>` : ""}</div>
    </li>
  `;
}

function slideHtml(question, index, total, options, mediaById, relativePrefix = "../../") {
  const locale = options.locale || "zh-CN";
  const revealInline = options.revealMode === "inline";
  const optionItems = (question.options || []).map((item) => optionHtml(item, mediaById, locale, relativePrefix)).join("");
  const slideClass = (question.options || []).some((item) => (item.media || []).length > 0)
    ? "questionSlide mediaOptionSlide"
    : "questionSlide";
  return `
    <article class="${slideClass}">
      <div class="slideKicker">${index + 1} / ${total} · ${escapeHtml(question.category)} · ${escapeHtml(question.type)}</div>
      <h1>${escapeHtml(displayText(question.title, locale))}</h1>
      <p class="slidePrompt">${escapeHtml(displayText(question.prompt, locale))}</p>
      <div class="slideMedia">${slideMediaHtml(question, mediaById, locale, relativePrefix)}</div>
      ${optionItems ? `<ol class="slideOptions">${optionItems}</ol>` : ""}
      <div class="slideReveal ${revealInline ? "" : "hidden"}">
        <strong>Answer: ${escapeHtml(formatAnswer(question, locale))}</strong>
        <p>${escapeHtml(displayText(question.reveal, locale))}</p>
      </div>
    </article>
  `;
}

export function standaloneDeckHtml(questions, media, options = {}) {
  const title = options.title || "Wan Ti Wang Slides";
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const slides = questions.map((question, index) => slideHtml(question, index, questions.length, options, mediaById)).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #101828; color: #18212f; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .deck { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .questionSlide { width: min(100%, calc((100vh - 120px) * 16 / 9)); aspect-ratio: 16 / 9; display: none; align-content: start; gap: 18px; padding: 48px; overflow: hidden; border-radius: 8px; background: #fffdf8; }
    .questionSlide.active { display: grid; }
    .slideKicker { color: #0f766e; font-size: 14px; font-weight: 800; text-transform: uppercase; }
    h1 { margin: 0; white-space: pre-line; font-size: 40px; line-height: 1.12; }
    .slidePrompt { margin: 0; white-space: pre-line; color: #344054; font-size: 28px; line-height: 1.35; }
    .slideOptions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 0; margin: 0; list-style: none; }
    .slideOptions li { display: grid; grid-template-columns: 42px minmax(0, 1fr); align-items: center; gap: 12px; min-height: 58px; padding: 10px 14px; border: 1px solid #d9dee7; border-radius: 8px; background: #f8fafc; }
    .slideOptions span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #0f766e; color: #fff; font-weight: 800; }
    .optionBody { display: grid; gap: 8px; min-width: 0; }
    .optionBody img, .optionBody video { max-height: 160px; max-width: 100%; object-fit: contain; border-radius: 6px; background: #101828; }
    .optionBody audio { width: 100%; }
    .slideOptions strong { white-space: pre-line; overflow-wrap: anywhere; font-size: 22px; }
    .mediaOptionSlide { gap: 12px; padding: 34px; }
    .mediaOptionSlide h1 { font-size: 34px; }
    .mediaOptionSlide .slidePrompt { font-size: 22px; line-height: 1.25; }
    .mediaOptionSlide .slideOptions { grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: stretch; gap: 10px; }
    .mediaOptionSlide .slideOptions li { grid-template-columns: 34px minmax(0, 1fr); align-items: start; padding: 8px; min-height: 0; }
    .mediaOptionSlide .slideOptions span { width: 28px; height: 28px; }
    .mediaOptionSlide .optionBody { justify-items: center; align-content: start; }
    .mediaOptionSlide .optionBody img, .mediaOptionSlide .optionBody video { width: 100%; max-height: 190px; }
    .mediaOptionSlide .slideOptions strong { font-size: 16px; text-align: center; }
    .slideMedia:empty { display: none; }
    .slideMedia img, .slideMedia video { max-height: 240px; max-width: 100%; object-fit: contain; border-radius: 8px; background: #101828; }
    .slideMedia audio { width: min(100%, 620px); }
    .slideReveal { display: grid; gap: 8px; margin-top: auto; padding-top: 14px; border-top: 1px solid #d9dee7; color: #344054; }
    .slideReveal.hidden { display: none; }
    .slideReveal strong { color: #115e59; }
    .slideReveal p { margin: 0; white-space: pre-line; }
    .controls { position: fixed; left: 24px; right: 24px; bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #e4e7ec; }
    .controls div { display: flex; gap: 8px; }
    .shortcutHint { color: #b8c1ce; font-size: 12px; }
    button { min-height: 38px; border: 1px solid #d9dee7; border-radius: 6px; background: #fff; color: #18212f; padding: 0 12px; cursor: pointer; font: inherit; }
    @media (max-width: 820px) { .mediaOptionSlide .slideOptions { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media print { body { background: white; } .deck { display: block; padding: 0; } .questionSlide, .questionSlide.active { display: grid; width: 100%; height: 100vh; border-radius: 0; page-break-after: always; } .controls { display: none; } }
  </style>
</head>
<body>
  <main class="deck">${slides}</main>
  <footer class="controls"><div><button id="prev">Previous</button><button id="next">Next</button><button id="reveal">Show Reveal</button></div><span><span id="status"></span><span class="shortcutHint"> · ←/→ Space F ?</span></span></footer>
  <script>
    const slides = [...document.querySelectorAll(".questionSlide")];
    let current = 0;
    let reveal = ${options.revealMode === "inline" ? "true" : "false"};
    const revealMode = ${JSON.stringify(options.revealMode || "hidden")};
    function move(delta) {
      const next = Math.max(0, Math.min(slides.length - 1, current + delta));
      if (next !== current && revealMode !== "inline") reveal = false;
      current = next;
      render();
    }
    function render() {
      slides.forEach((slide, index) => slide.classList.toggle("active", index === current));
      document.querySelector("#status").textContent = slides.length ? String(current + 1) + " / " + slides.length : "0 / 0";
      document.querySelector("#reveal").disabled = revealMode === "inline";
      document.querySelector("#reveal").textContent = revealMode === "inline" ? "Reveal Inline" : reveal ? "Hide Reveal" : "Show Reveal";
      const activeReveal = slides[current]?.querySelector(".slideReveal");
      if (activeReveal && ${options.revealMode === "inline" ? "false" : "true"}) activeReveal.classList.toggle("hidden", !reveal);
    }
    document.querySelector("#prev").addEventListener("click", () => move(-1));
    document.querySelector("#next").addEventListener("click", () => move(1));
    document.querySelector("#reveal").addEventListener("click", () => { reveal = !reveal; render(); });
    function toggleReveal() {
      if (revealMode === "inline") return;
      reveal = !reveal;
      render();
    }
    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.target.closest("input, textarea, select, button, audio, video, [contenteditable='true']")) return;
      const key = event.key;
      const lower = key.toLowerCase();
      if (["ArrowLeft", "PageUp", "Backspace"].includes(key) || lower === "p") { event.preventDefault(); move(-1); return; }
      if (["ArrowRight", "PageDown", " "].includes(key) || lower === "n") { event.preventDefault(); move(1); return; }
      if (lower === "f" || lower === "r") { event.preventDefault(); toggleReveal(); return; }
      if (key === "Escape" && reveal && revealMode !== "inline") { event.preventDefault(); toggleReveal(); return; }
      if (key === "?") {
        event.preventDefault();
        window.alert("Shortcuts\\n\\nNext: Right / PageDown / Space / N\\nPrevious: Left / PageUp / P / Backspace\\nShow or hide answer: F or R\\nHide answer: Esc\\nHelp: ?");
      }
    });
    render();
  </script>
</body>
</html>`;
}

export function mediaRefsForQuestions(questions) {
  const refs = [];
  for (const question of questions) {
    refs.push(...(question.media || []));
    for (const option of question.options || []) refs.push(...(option.media || []));
  }
  return refs;
}

export function usedMediaForQuestions(questions, media) {
  const ids = new Set(mediaRefsForQuestions(questions).map((ref) => ref.id).filter(Boolean));
  return media.filter((item) => ids.has(item.id));
}

export function folderDeckFiles(questions, media, options = {}) {
  const title = options.title || "Wan Ti Wang Slides";
  const manifest = {
    title,
    locale: options.locale || "zh-CN",
    revealMode: options.revealMode || "hidden",
    question_count: questions.length,
    media_count: media.length,
    exported_at: new Date().toISOString(),
    format: "wan-ti-wang-folder-deck-v1"
  };

  return {
    "index.html": folderIndexHtml(title),
    "assets/deck.css": folderDeckCss(),
    "assets/deck.js": folderDeckJs(),
    "data/manifest.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "data/questions.json": `${JSON.stringify(questions.map(stripRuntimeFields), null, 2)}\n`,
    "data/media.json": `${JSON.stringify(media.map(stripRuntimeFields), null, 2)}\n`,
    "data/deck-data.js": `window.WTW_DECK_DATA = ${escapeScriptJson({
      manifest,
      questions: questions.map(stripRuntimeFields),
      media: media.map(stripRuntimeFields)
    })};\n`
  };
}

function stripRuntimeFields(value) {
  const next = { ...value };
  delete next._file;
  delete next._line;
  return next;
}

function folderIndexHtml(title) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="assets/deck.css">
</head>
<body>
  <main id="deck" class="deck" aria-live="polite"></main>
  <footer class="controls">
    <div>
      <button id="prev" type="button">Previous</button>
      <button id="next" type="button">Next</button>
      <button id="reveal" type="button">Show Reveal</button>
      <button id="downloadFeedback" type="button">Download Feedback</button>
    </div>
    <span><span id="status"></span><span id="feedbackStatus"></span><span class="shortcutHint"> · ←/→ Space F WASD 1-9 Enter ?</span></span>
  </footer>
  <script src="data/deck-data.js"></script>
  <script src="assets/deck.js"></script>
</body>
</html>
`;
}

function folderDeckCss() {
  return `* { box-sizing: border-box; }
body { margin: 0; background: #101828; color: #18212f; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.deck { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.questionSlide { width: min(100%, calc((100vh - 120px) * 16 / 9)); aspect-ratio: 16 / 9; display: none; align-content: start; gap: 18px; padding: 48px; overflow: hidden; border-radius: 8px; background: #fffdf8; }
.questionSlide.active { display: grid; }
.slideKicker { color: #0f766e; font-size: 14px; font-weight: 800; text-transform: uppercase; }
h1 { margin: 0; white-space: pre-line; font-size: 40px; line-height: 1.12; }
.slidePrompt { margin: 0; white-space: pre-line; color: #344054; font-size: 28px; line-height: 1.35; }
.slideOptions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 0; margin: 0; list-style: none; }
.slideOptions li { display: grid; grid-template-columns: 42px minmax(0, 1fr); align-items: center; gap: 12px; min-height: 58px; padding: 10px 14px; border: 1px solid #d9dee7; border-radius: 8px; background: #f8fafc; cursor: pointer; }
.slideOptions li.focused { border-color: #0f766e; box-shadow: inset 0 0 0 2px rgba(15, 118, 110, 0.45); }
.slideOptions li.selected { border-color: #0f766e; box-shadow: inset 0 0 0 2px #0f766e; }
.slideOptions li.correct { border-color: #15803d; background: #f0fdf4; }
.slideOptions li.incorrect { border-color: #b91c1c; background: #fef2f2; }
.slideOptions span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #0f766e; color: #fff; font-weight: 800; }
.optionBody { display: grid; gap: 8px; min-width: 0; }
.optionBody img, .optionBody video { max-height: 160px; max-width: 100%; object-fit: contain; border-radius: 6px; background: #101828; }
.optionBody audio { width: 100%; }
.slideOptions strong { white-space: pre-line; overflow-wrap: anywhere; font-size: 22px; }
.mediaOptionSlide { gap: 12px; padding: 34px; }
.mediaOptionSlide h1 { font-size: 34px; }
.mediaOptionSlide .slidePrompt { font-size: 22px; line-height: 1.25; }
.mediaOptionSlide .slideOptions { grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: stretch; gap: 10px; }
.mediaOptionSlide .slideOptions li { grid-template-columns: 34px minmax(0, 1fr); align-items: start; padding: 8px; min-height: 0; }
.mediaOptionSlide .slideOptions span { width: 28px; height: 28px; }
.mediaOptionSlide .optionBody { justify-items: center; align-content: start; }
.mediaOptionSlide .optionBody img, .mediaOptionSlide .optionBody video { width: 100%; max-height: 190px; }
.mediaOptionSlide .slideOptions strong { font-size: 16px; text-align: center; }
.slideMedia:empty { display: none; }
.slideMedia img, .slideMedia video { max-height: 240px; max-width: 100%; object-fit: contain; border-radius: 8px; background: #101828; }
.slideMedia audio { width: min(100%, 620px); }
.slideReveal { display: grid; gap: 8px; margin-top: auto; padding-top: 14px; border-top: 1px solid #d9dee7; color: #344054; }
.slideReveal.hidden { display: none; }
.slideReveal strong { color: #115e59; }
.slideReveal p { margin: 0; white-space: pre-line; }
.answerPanel { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; color: #344054; }
.answerPanel:empty { display: none; }
.answerPanel button { background: #0f766e; color: #fff; border-color: #0f766e; }
.answerPanel button:disabled { background: #e4e7ec; border-color: #d0d5dd; color: #667085; cursor: not-allowed; }
.answerPanel small { font-weight: 700; }
.controls { position: fixed; left: 24px; right: 24px; bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #e4e7ec; }
.controls div { display: flex; gap: 8px; }
.shortcutHint { color: #b8c1ce; font-size: 12px; }
button { min-height: 38px; border: 1px solid #d9dee7; border-radius: 6px; background: #fff; color: #18212f; padding: 0 12px; cursor: pointer; font: inherit; }
@media (max-width: 820px) {
  .mediaOptionSlide .slideOptions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media print {
  body { background: white; }
  .deck { display: block; padding: 0; }
  .questionSlide, .questionSlide.active { display: grid; width: 100%; height: 100vh; border-radius: 0; page-break-after: always; }
  .controls { display: none; }
}
`;
}

function folderDeckJs() {
  return `const data = window.WTW_DECK_DATA;
const manifest = data.manifest || {};
const questions = data.questions || [];
const mediaById = new Map((data.media || []).map((item) => [item.id, item]));
const storageKey = "wtw-feedback:" + (manifest.exported_at || manifest.title || location.pathname);
const feedbackState = loadFeedbackState();
let current = 0;
let reveal = manifest.revealMode === "inline";

function loadFeedbackState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || { events: [] };
  } catch {
    return { events: [] };
  }
}

function saveFeedbackState() {
  localStorage.setItem(storageKey, JSON.stringify(feedbackState));
}

function localized(value, locale = "zh-CN") {
  if (!value || typeof value !== "object") return "";
  return value[locale] || value["en-US"] || "";
}

function displayText(value, locale = "zh-CN") {
  if (locale !== "bilingual") return localized(value, locale);
  const zh = localized(value, "zh-CN");
  const en = localized(value, "en-US");
  if (!zh) return en;
  if (!en || en === zh) return zh;
  return zh + "\\n" + en;
}

function mediaElement(ref) {
  const item = mediaById.get(ref.id);
  if (!item) return null;
  const kind = ref.kind || item.type;
  const label = displayText(ref.hint, manifest.locale) || item.alt || item.title || ref.id;
  if (kind === "image" || kind === "thumbnail") {
    const image = document.createElement("img");
    image.src = item.path;
    image.alt = label;
    return image;
  }
  if (kind === "audio") {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = item.path;
    return audio;
  }
  if (kind === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.src = item.path;
    return video;
  }
  return null;
}

function formatAnswer(question) {
  const answers = question.answer || [];
  const formatRaw = (answer) => {
    if (answer && typeof answer === "object") {
      if (answer.left && answer.right) return answer.left + " -> " + answer.right;
      return JSON.stringify(answer);
    }
    return String(answer);
  };
  if (!question.options) return answers.map(formatRaw).join(", ");
  return answers.map((answer) => {
    if (answer && typeof answer === "object") return formatRaw(answer);
    const item = question.options.find((option) => option.id === answer);
    const label = displayText(item?.text, manifest.locale).replace(/\\n/g, " / ") || (item?.media?.length ? "media option" : "");
    return item ? answer + (label ? ". " + label : "") : answer;
  }).join(", ");
}

function answerIds(question) {
  return (question.answer || []).filter((answer) => typeof answer === "string").sort();
}

function sameAnswer(left, right) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

function feedbackForQuestion(questionId) {
  return feedbackState.events.find((event) => event.question_id === questionId);
}

function feedbackSummary() {
  const questionsById = {};
  for (const question of questions) {
    questionsById[question.id] = {
      answered_count: 0,
      correct_count: 0
    };
  }
  for (const event of feedbackState.events) {
    questionsById[event.question_id] ??= { answered_count: 0, correct_count: 0 };
    questionsById[event.question_id].answered_count += 1;
    if (event.correct) questionsById[event.question_id].correct_count += 1;
  }
  const answered = feedbackState.events.length;
  const correct = feedbackState.events.filter((event) => event.correct).length;
  return {
    format: "wan-ti-wang-answer-feedback-v1",
    deck_title: manifest.title || "",
    deck_exported_at: manifest.exported_at || "",
    generated_at: new Date().toISOString(),
    summary: {
      answered_count: answered,
      correct_count: correct
    },
    questions: questionsById,
    events: feedbackState.events
  };
}

function updateFeedbackStatus() {
  const summary = feedbackSummary().summary;
  document.querySelector("#feedbackStatus").textContent = " · answered " + summary.answered_count + ", correct " + summary.correct_count;
}

function downloadFeedback() {
  const data = JSON.stringify(feedbackSummary(), null, 2);
  const blob = new Blob([data + "\\n"], { type: "application/json" });
  const link = document.createElement("a");
  const slug = (manifest.title || "wan-ti-wang").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "wan-ti-wang";
  link.href = URL.createObjectURL(blob);
  link.download = slug + "-answer-feedback.json";
  document.body.append(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

function activeQuestion() {
  return questions[current];
}

function activeSlide() {
  return document.querySelectorAll(".questionSlide")[current];
}

function activeSelectedIds() {
  const slide = activeSlide();
  if (!slide) return [];
  return [...slide.querySelectorAll(".slideOptions li.selected")]
    .map((item) => item.dataset.optionId)
    .filter(Boolean)
    .sort();
}

function questionSlide(question, index) {
  const slide = document.createElement("article");
  slide.className = "questionSlide";
  if ((question.options || []).some((option) => (option.media || []).length > 0)) {
    slide.classList.add("mediaOptionSlide");
  }

  const kicker = document.createElement("div");
  kicker.className = "slideKicker";
  kicker.textContent = (index + 1) + " / " + questions.length + " · " + question.category + " · " + question.type;

  const title = document.createElement("h1");
  title.textContent = displayText(question.title, manifest.locale);

  const prompt = document.createElement("p");
  prompt.className = "slidePrompt";
  prompt.textContent = displayText(question.prompt, manifest.locale);

  const slideMedia = document.createElement("div");
  slideMedia.className = "slideMedia";
  for (const ref of question.media || []) {
    const node = mediaElement(ref);
    if (node) slideMedia.append(node);
  }

  const options = document.createElement("ol");
  options.className = "slideOptions";
  for (const option of question.options || []) {
    const item = document.createElement("li");
    item.dataset.optionId = option.id;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-pressed", "false");
    const marker = document.createElement("span");
    marker.textContent = option.id;
    const body = document.createElement("div");
    body.className = "optionBody";
    for (const ref of option.media || []) {
      const node = mediaElement(ref);
      if (node) body.append(node);
    }
    const text = document.createElement("strong");
    text.textContent = displayText(option.text, manifest.locale);
    if (text.textContent) body.append(text);
    item.append(marker, body);
    options.append(item);
  }

  const answerPanel = document.createElement("div");
  answerPanel.className = "answerPanel";
  if ((question.options || []).length > 0 && answerIds(question).length > 0) {
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.textContent = "Confirm Answer";
    const result = document.createElement("small");
    const existing = feedbackForQuestion(question.id);
    const selected = new Set(existing?.selected || []);

    function syncOptionState() {
      for (const item of options.querySelectorAll("li")) {
        const active = selected.has(item.dataset.optionId);
        item.classList.toggle("selected", active);
        item.setAttribute("aria-pressed", String(active));
      }
      confirm.disabled = selected.size === 0 || Boolean(feedbackForQuestion(question.id));
    }

    function markResult(event) {
      if (!event) return;
      const correctIds = new Set(answerIds(question));
      for (const item of options.querySelectorAll("li")) {
        const optionId = item.dataset.optionId;
        item.classList.toggle("correct", correctIds.has(optionId));
        item.classList.toggle("incorrect", event.selected.includes(optionId) && !correctIds.has(optionId));
      }
      result.textContent = event.correct ? "Correct recorded" : "Incorrect recorded";
    }

    function toggleOption(optionId) {
      if (feedbackForQuestion(question.id)) return;
      if (selected.has(optionId)) {
        selected.delete(optionId);
      } else {
        if (question.type !== "multiple_choice") {
          selected.clear();
        }
        selected.add(optionId);
      }
      syncOptionState();
    }

    function focusOption(item) {
      for (const optionItem of options.querySelectorAll("li")) optionItem.classList.toggle("focused", optionItem === item);
      item?.focus();
    }

    options.addEventListener("click", (event) => {
      const item = event.target.closest("li[data-option-id]");
      if (item) {
        focusOption(item);
        toggleOption(item.dataset.optionId);
      }
    });
    options.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const item = event.target.closest("li[data-option-id]");
      if (!item) return;
      event.preventDefault();
      focusOption(item);
      toggleOption(item.dataset.optionId);
    });
    confirm.addEventListener("click", () => {
      const submitted = [...selected].sort();
      const correct = sameAnswer(submitted, answerIds(question));
      const event = {
        question_id: question.id,
        selected: submitted,
        correct,
        answered_at: new Date().toISOString()
      };
      feedbackState.events = feedbackState.events.filter((item) => item.question_id !== question.id);
      feedbackState.events.push(event);
      saveFeedbackState();
      syncOptionState();
      markResult(event);
      updateFeedbackStatus();
      reveal = true;
      render();
    });
    answerPanel.append(confirm, result);
    syncOptionState();
    markResult(existing);
  }

  const revealBlock = document.createElement("div");
  revealBlock.className = "slideReveal";
  const answer = document.createElement("strong");
  answer.textContent = "Answer: " + formatAnswer(question);
  const explanation = document.createElement("p");
  explanation.textContent = displayText(question.reveal, manifest.locale);
  revealBlock.append(answer, explanation);

  slide.append(kicker, title, prompt, slideMedia);
  if ((question.options || []).length > 0) slide.append(options);
  slide.append(answerPanel);
  slide.append(revealBlock);
  return slide;
}

function render() {
  const slides = [...document.querySelectorAll(".questionSlide")];
  slides.forEach((slide, index) => slide.classList.toggle("active", index === current));
  document.querySelector("#status").textContent = slides.length ? String(current + 1) + " / " + slides.length : "0 / 0";
  document.querySelector("#reveal").disabled = manifest.revealMode === "inline";
  document.querySelector("#reveal").textContent = manifest.revealMode === "inline" ? "Reveal Inline" : reveal ? "Hide Reveal" : "Show Reveal";
  const activeReveal = slides[current]?.querySelector(".slideReveal");
  if (activeReveal && manifest.revealMode !== "inline") activeReveal.classList.toggle("hidden", !reveal);
  updateFeedbackStatus();
}

function move(delta) {
  const next = Math.max(0, Math.min(questions.length - 1, current + delta));
  if (next !== current && manifest.revealMode !== "inline") reveal = false;
  current = next;
  render();
}

function toggleReveal() {
  if (manifest.revealMode === "inline") return;
  reveal = !reveal;
  render();
}

function optionElements() {
  return [...(activeSlide()?.querySelectorAll(".slideOptions li[data-option-id]") || [])];
}

function focusedOptionElement() {
  const options = optionElements();
  return options.find((item) => item.classList.contains("focused")) || options.find((item) => item.classList.contains("selected")) || options[0];
}

function focusOptionElement(item) {
  if (!item) return false;
  for (const option of optionElements()) option.classList.toggle("focused", option === item);
  item.focus();
  return true;
}

function moveOptionFocus(direction) {
  const options = optionElements();
  if (options.length === 0) return false;
  const currentElement = focusedOptionElement();
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
  return focusOptionElement(candidates[0]?.item || currentElement);
}

function selectFocusedOption() {
  const item = focusedOptionElement();
  if (!item) return false;
  item.click();
  return true;
}

function selectOptionByNumber(key) {
  if (!/^[1-9]$/.test(key)) return false;
  const item = optionElements()[Number(key) - 1];
  if (!item) return false;
  focusOptionElement(item);
  item.click();
  return true;
}

function confirmActiveAnswer() {
  const question = activeQuestion();
  if (!question || !question.options?.length) return false;
  const button = activeSlide()?.querySelector(".answerPanel button");
  if (!button || button.disabled || activeSelectedIds().length === 0) return false;
  button.click();
  return true;
}

function showShortcutHelp() {
  window.alert("Shortcuts\\n\\nNext: Right / PageDown / Space / N\\nPrevious: Left / PageUp / P / Backspace\\nShow or hide answer: F or R\\nMove option focus: W/A/S/D\\nSelect option by number: 1-9\\nSelect focused option: Enter\\nConfirm selected answer: Enter again or Confirm Answer\\nHide answer: Esc\\nHelp: ?");
}

document.querySelector("#deck").replaceChildren(...questions.map(questionSlide));
document.querySelector("#prev").addEventListener("click", () => move(-1));
document.querySelector("#next").addEventListener("click", () => move(1));
document.querySelector("#reveal").addEventListener("click", toggleReveal);
document.querySelector("#downloadFeedback").addEventListener("click", downloadFeedback);
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.target.closest("input, textarea, select, button, audio, video, [contenteditable='true']")) return;
  const key = event.key;
  const lower = key.toLowerCase();
  if (["ArrowLeft", "PageUp", "Backspace"].includes(key) || lower === "p") {
    event.preventDefault();
    move(-1);
    return;
  }
  if (["ArrowRight", "PageDown", " "].includes(key) || lower === "n") {
    event.preventDefault();
    move(1);
    return;
  }
  if (lower === "f" || lower === "r") {
    event.preventDefault();
    toggleReveal();
    return;
  }
  if (key === "Enter") {
    const focused = focusedOptionElement();
    if (focused && !focused.classList.contains("selected")) {
      event.preventDefault();
      selectFocusedOption();
      return;
    }
    if (confirmActiveAnswer()) event.preventDefault();
    return;
  }
  if (key === "Escape" && reveal && manifest.revealMode !== "inline") {
    event.preventDefault();
    toggleReveal();
    return;
  }
  if (key === "?") {
    event.preventDefault();
    showShortcutHelp();
    return;
  }
  if (selectOptionByNumber(key)) {
    event.preventDefault();
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
  }
});
render();
`;
}
