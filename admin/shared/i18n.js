export function localized(value, locale = "zh-CN") {
  if (!value || typeof value !== "object") return "";
  return value[locale] || value["en-US"] || "";
}

export function displayText(value, locale = "zh-CN") {
  if (locale !== "bilingual") return localized(value, locale);
  const zh = localized(value, "zh-CN");
  const en = localized(value, "en-US");
  if (!zh) return en;
  if (!en || en === zh) return zh;
  return `${zh}\n${en}`;
}

export function formatAnswer(question, locale = "zh-CN") {
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
