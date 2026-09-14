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

function formatAnswer(question, locale) {
  const answers = question.answer || [];
  if (!question.options) return answers.join(", ");
  return answers.map((answer) => {
    const item = question.options.find((option) => option.id === answer);
    return item ? `${answer}. ${displayText(item.text, locale).replace(/\n/g, " / ")}` : answer;
  }).join(", ");
}

function slideMediaHtml(question, mediaById, locale, relativePrefix) {
  return (question.media || []).map((ref) => {
    const item = mediaById.get(ref.id);
    if (!item) return "";
    const kind = ref.kind || item.type;
    const src = `${relativePrefix}${item.path}`;
    const label = escapeHtml(displayText(ref.hint, locale) || item.alt || item.title || ref.id);
    if (kind === "image" || kind === "thumbnail") return `<img src="${escapeHtml(src)}" alt="${label}">`;
    if (kind === "audio") return `<audio controls src="${escapeHtml(src)}"></audio>`;
    if (kind === "video") return `<video controls src="${escapeHtml(src)}"></video>`;
    return "";
  }).join("");
}

function slideHtml(question, index, total, options, mediaById, relativePrefix = "../../") {
  const locale = options.locale || "zh-CN";
  const revealInline = options.revealMode === "inline";
  const optionItems = (question.options || []).map((item) => `
    <li><span>${escapeHtml(item.id)}</span><strong>${escapeHtml(displayText(item.text, locale))}</strong></li>
  `).join("");
  return `
    <article class="questionSlide">
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
    .slideOptions strong { white-space: pre-line; overflow-wrap: anywhere; font-size: 22px; }
    .slideMedia:empty { display: none; }
    .slideMedia img, .slideMedia video { max-height: 240px; max-width: 100%; object-fit: contain; border-radius: 8px; background: #101828; }
    .slideMedia audio { width: min(100%, 620px); }
    .slideReveal { display: grid; gap: 8px; margin-top: auto; padding-top: 14px; border-top: 1px solid #d9dee7; color: #344054; }
    .slideReveal.hidden { display: none; }
    .slideReveal strong { color: #115e59; }
    .slideReveal p { margin: 0; white-space: pre-line; }
    .controls { position: fixed; left: 24px; right: 24px; bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #e4e7ec; }
    .controls div { display: flex; gap: 8px; }
    button { min-height: 38px; border: 1px solid #d9dee7; border-radius: 6px; background: #fff; color: #18212f; padding: 0 12px; cursor: pointer; font: inherit; }
    @media print { body { background: white; } .deck { display: block; padding: 0; } .questionSlide, .questionSlide.active { display: grid; width: 100%; height: 100vh; border-radius: 0; page-break-after: always; } .controls { display: none; } }
  </style>
</head>
<body>
  <main class="deck">${slides}</main>
  <footer class="controls"><div><button id="prev">Previous</button><button id="next">Next</button><button id="reveal">Show Reveal</button></div><span id="status"></span></footer>
  <script>
    const slides = [...document.querySelectorAll(".questionSlide")];
    let current = 0;
    let reveal = ${options.revealMode === "inline" ? "true" : "false"};
    function render() {
      slides.forEach((slide, index) => slide.classList.toggle("active", index === current));
      document.querySelector("#status").textContent = slides.length ? String(current + 1) + " / " + slides.length : "0 / 0";
      document.querySelector("#reveal").textContent = reveal ? "Hide Reveal" : "Show Reveal";
      const activeReveal = slides[current]?.querySelector(".slideReveal");
      if (activeReveal && ${options.revealMode === "inline" ? "false" : "true"}) activeReveal.classList.toggle("hidden", !reveal);
    }
    document.querySelector("#prev").addEventListener("click", () => { current = Math.max(0, current - 1); render(); });
    document.querySelector("#next").addEventListener("click", () => { current = Math.min(slides.length - 1, current + 1); render(); });
    document.querySelector("#reveal").addEventListener("click", () => { reveal = !reveal; render(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { current = Math.max(0, current - 1); render(); }
      if (event.key === "ArrowRight") { current = Math.min(slides.length - 1, current + 1); render(); }
      if (event.key.toLowerCase() === "r") { reveal = !reveal; render(); }
    });
    render();
  </script>
</body>
</html>`;
}
