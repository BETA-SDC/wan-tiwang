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
  if (!question.options) return answers.join(", ");
  return answers.map((answer) => {
    const item = question.options.find((option) => option.id === answer);
    return item ? `${answer}. ${displayText(item.text, locale).replace(/\n/g, " / ")}` : answer;
  }).join(", ");
}
