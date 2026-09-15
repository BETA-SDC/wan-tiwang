import { displayText, formatAnswer } from "./i18n.js";

function mediaById(media, id) {
  return media.find((item) => item.id === id);
}

export function isChoiceQuestion(question) {
  return ["single_choice", "multiple_choice", "true_false", "ordering"].includes(question?.type)
    && Array.isArray(question?.options)
    && question.options.length > 0;
}

export function createQuestionMedia(question, media, locale = "zh-CN", mediaPrefix = "/") {
  const wrap = document.createElement("div");
  wrap.className = "slideMedia";

  for (const ref of question.media || []) {
    const node = createMediaElement(ref, media, locale, mediaPrefix);
    if (node) wrap.append(node);
  }

  return wrap;
}

function createMediaElement(ref, media, locale = "zh-CN", mediaPrefix = "/") {
  const item = mediaById(media, ref.id);
  if (!item) return null;
  const kind = ref.kind || item.type;
  const src = `${mediaPrefix}${item.path}`;
  const label = displayText(ref.hint, locale) || item.alt || item.title || ref.id;

  if (kind === "image" || kind === "thumbnail") {
    const image = document.createElement("img");
    image.src = src;
    image.alt = label;
    return image;
  }
  if (kind === "audio") {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = src;
    return audio;
  }
  if (kind === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.src = src;
    return video;
  }
  return null;
}

export function createQuestionSlide({
  question,
  media = [],
  locale = "zh-CN",
  index = 0,
  total = 1,
  revealVisible = false,
  revealMode = "hidden",
  headingTag = "h3",
  mediaPrefix = "/",
  selectedOptionIds = new Set(),
  focusedOptionId = "",
  guessQuestionMode = false,
  questionVisible = true,
  onOptionFocus,
  onOptionToggle
}) {
  const slide = document.createElement("article");
  slide.className = "questionSlide";
  const hideQuestion = guessQuestionMode && isChoiceQuestion(question) && !questionVisible;
  if ((question.options || []).some((option) => (option.media || []).length > 0)) {
    slide.classList.add("mediaOptionSlide");
  }

  const kicker = document.createElement("div");
  kicker.className = "slideKicker";
  kicker.textContent = `${index + 1} / ${total} · ${question.category} · ${question.type}`;

  const title = document.createElement(headingTag);
  title.textContent = displayText(question.title, locale);
  title.classList.toggle("questionTextHidden", hideQuestion);

  const prompt = document.createElement("p");
  prompt.className = "slidePrompt";
  prompt.textContent = displayText(question.prompt, locale);
  prompt.classList.toggle("questionTextHidden", hideQuestion);

  const questionMedia = createQuestionMedia(question, media, locale, mediaPrefix);
  questionMedia.classList.toggle("questionTextHidden", hideQuestion);

  const options = document.createElement("ol");
  options.className = "slideOptions";
  for (const [optionIndex, item] of (question.options || []).entries()) {
    const node = document.createElement("li");
    node.dataset.optionId = item.id;
    node.dataset.optionIndex = String(optionIndex + 1);
    node.tabIndex = 0;
    node.setAttribute("role", "button");
    node.setAttribute("aria-pressed", String(selectedOptionIds.has(item.id)));
    node.classList.toggle("selected", selectedOptionIds.has(item.id));
    node.classList.toggle("focused", focusedOptionId === item.id);
    const marker = document.createElement("span");
    marker.textContent = item.id;
    const body = document.createElement("div");
    body.className = "optionBody";
    for (const ref of item.media || []) {
      const mediaNode = createMediaElement(ref, media, locale, mediaPrefix);
      if (mediaNode) body.append(mediaNode);
    }
    const text = document.createElement("strong");
    text.textContent = displayText(item.text, locale);
    if (text.textContent) body.append(text);
    node.append(marker, body);
    node.addEventListener("focus", () => onOptionFocus?.(item.id));
    node.addEventListener("click", () => {
      onOptionFocus?.(item.id);
      onOptionToggle?.(item.id);
    });
    node.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onOptionToggle?.(item.id);
    });
    options.append(node);
  }

  const reveal = document.createElement("div");
  reveal.className = "slideReveal";
  reveal.classList.toggle("hidden", revealMode !== "inline" && !revealVisible);
  const answer = document.createElement("strong");
  answer.textContent = `Answer: ${formatAnswer(question, locale)}`;
  const explanation = document.createElement("p");
  explanation.textContent = displayText(question.reveal, locale);
  reveal.append(answer, explanation);

  slide.append(kicker, title, prompt, questionMedia);
  if ((question.options || []).length > 0) slide.append(options);
  slide.append(reveal);
  return slide;
}
