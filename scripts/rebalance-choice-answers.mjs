import fs from "node:fs";
import { questionsRoot, readJsonl, walkFiles } from "./lib.mjs";

const writeChanges = process.argv.includes("--write");
const choiceFiles = walkFiles(questionsRoot, (file) => file.endsWith(".jsonl")).sort();
const positionLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const records = [];

function hash(value) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function replaceOptionLabel(value, from, to) {
  if (typeof value !== "string" || from === to) return value;
  return value
    .replace(new RegExp(`(选项\\s*)${from}\\b`, "g"), `$1${to}`)
    .replace(new RegExp(`(\\bOption\\s+)${from}\\b`, "gi"), `$1${to}`);
}

function updateLocalizedOptionLabels(value, from, to) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([locale, text]) => [locale, replaceOptionLabel(text, from, to)])
  );
}

function updateRevealLetter(value, from, to) {
  if (typeof value !== "string" || from === to) return value;
  const patterns = [
    /((?:答案(?:暂定)?(?:是|为)|答案)\s*[:：]?\s*)([A-Z])\b/gi,
    /((?:the\s+)?(?:provisional\s+)?answer\s+(?:is|:)\s*)([A-Z])\b/gi
  ];
  return patterns.reduce((text, pattern) => text.replace(pattern, (match, prefix, letter) => {
    return letter.toUpperCase() === from ? `${prefix}${to}` : match;
  }), value);
}

function updateLocalizedReveal(value, from, to) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([locale, text]) => [locale, updateRevealLetter(text, from, to)])
  );
}

function normalizeRevealOptionReference(value, answer) {
  if (typeof value !== "string") return value;
  return value
    .replace(/([；;]\s*)[A-Z](?=\s*(?:最符合|最匹配))/g, `$1${answer}`)
    .replace(/(\boption\s+)[A-Z](?=\s+(?:best matches|best fits))/gi, `$1${answer}`);
}

function normalizeLocalizedRevealOptionReference(value, answer) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([locale, text]) => [locale, normalizeRevealOptionReference(text, answer)])
  );
}

function targetLabels(count) {
  const total = records.filter((record) => record.optionCount === count).length;
  return positionLabels.slice(0, count).flatMap((label, index) => Array.from({
    length: Math.floor(total / count) + (index < total % count ? 1 : 0)
  }, () => label));
}

for (const file of choiceFiles) {
  for (const { value: question, line } of readJsonl(file)) {
    if (question.type !== "single_choice" || !Array.isArray(question.options)) continue;
    const optionIds = question.options.map((option) => option.id);
    const expectedIds = positionLabels.slice(0, optionIds.length);
    if (optionIds.length < 2 || optionIds.some((id, index) => id !== expectedIds[index])) continue;
    if (question.answer?.length !== 1 || typeof question.answer[0] !== "string") continue;
    if (!optionIds.includes(question.answer[0])) continue;
    records.push({ file, line, question, optionCount: optionIds.length });
  }
}

const targetsByCount = new Map();
for (const count of new Set(records.map((record) => record.optionCount))) {
  const targets = targetLabels(count);
  const sorted = records
    .filter((record) => record.optionCount === count)
    .sort((a, b) => hash(a.question.id) - hash(b.question.id) || a.question.id.localeCompare(b.question.id));
  targetsByCount.set(count, new Map(sorted.map((record, index) => [record.question.id, targets[index]])));
}

const changedFiles = new Map();
const beforeCounts = {};
const afterCounts = {};
let changedQuestions = 0;

for (const record of records) {
  const question = record.question;
  const oldAnswer = question.answer[0];
  const target = targetsByCount.get(record.optionCount).get(question.id);
  const oldPosition = positionLabels.indexOf(oldAnswer);
  beforeCounts[oldAnswer] = (beforeCounts[oldAnswer] || 0) + 1;
  afterCounts[target] = (afterCounts[target] || 0) + 1;
  const positionChanged = oldPosition !== positionLabels.indexOf(target);
  const originalReveal = JSON.stringify(question.reveal);
  if (!positionChanged) {
    question.reveal = normalizeLocalizedRevealOptionReference(question.reveal, oldAnswer);
    if (JSON.stringify(question.reveal) === originalReveal) continue;
    changedQuestions += 1;
    if (!changedFiles.has(record.file)) changedFiles.set(record.file, new Map());
    changedFiles.get(record.file).set(record.line, question);
    continue;
  }

  const correctOption = question.options.find((option) => option.id === oldAnswer);
  const distractors = question.options.filter((option) => option.id !== oldAnswer);
  const reordered = [...distractors];
  reordered.splice(positionLabels.indexOf(target), 0, correctOption);
  const idMap = new Map(reordered.map((option, index) => [option.id, positionLabels[index]]));

  question.options = reordered.map((option, index) => {
    const oldId = option.id;
    const newId = positionLabels[index];
    return {
      ...option,
      id: newId,
      ...(option.text ? { text: updateLocalizedOptionLabels(option.text, oldId, newId) } : {}),
      ...(option.media ? {
        media: option.media.map((media) => ({
          ...media,
          ...(media.hint ? { hint: updateLocalizedOptionLabels(media.hint, oldId, newId) } : {})
        }))
      } : {})
    };
  });
  question.answer = question.answer.map((answer) => idMap.get(answer) || answer);
  question.reveal = normalizeLocalizedRevealOptionReference(
    updateLocalizedReveal(question.reveal, oldAnswer, target),
    target
  );
  changedQuestions += 1;
  if (!changedFiles.has(record.file)) changedFiles.set(record.file, new Map());
  changedFiles.get(record.file).set(record.line, question);
}

if (writeChanges) {
  for (const [file, changes] of changedFiles) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const [line, question] of changes) lines[line - 1] = JSON.stringify(question);
    fs.writeFileSync(file, lines.join("\n"));
  }
}

console.log(`${writeChanges ? "Rebalanced" : "Would rebalance"} ${changedQuestions} question(s) across ${changedFiles.size} file(s).`);
console.log(`Before: ${Object.entries(beforeCounts).sort().map(([label, count]) => `${label}=${count}`).join(", ")}`);
console.log(`After:  ${Object.entries(afterCounts).sort().map(([label, count]) => `${label}=${count}`).join(", ")}`);
if (!writeChanges) console.log("Use --write to update question files.");
