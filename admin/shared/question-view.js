import { displayText, formatAnswer } from "./i18n.js";

function mediaById(media, id) {
  return media.find((item) => item.id === id);
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
  mediaPrefix = "/"
}) {
  const slide = document.createElement("article");
  slide.className = "questionSlide";
  if ((question.options || []).some((option) => (option.media || []).length > 0)) {
    slide.classList.add("mediaOptionSlide");
  }

  const kicker = document.createElement("div");
  kicker.className = "slideKicker";
  kicker.textContent = `${index + 1} / ${total} · ${question.category} · ${question.type}`;

  const title = document.createElement(headingTag);
  title.textContent = displayText(question.title, locale);

  const prompt = document.createElement("p");
  prompt.className = "slidePrompt";
  prompt.textContent = displayText(question.prompt, locale);

  const options = document.createElement("ol");
  options.className = "slideOptions";
  for (const item of question.options || []) {
    const node = document.createElement("li");
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

  slide.append(kicker, title, prompt, createQuestionMedia(question, media, locale, mediaPrefix));
  if ((question.options || []).length > 0) slide.append(options);
  slide.append(reveal);
  return slide;
}
