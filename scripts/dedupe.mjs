import { questionsRoot, readJsonl, relativePath, walkFiles } from "./lib.mjs";

const questionFiles = walkFiles(questionsRoot, (file) => file.endsWith(".jsonl"));
const exactKeys = new Map();
const questions = [];
const exactDuplicates = [];
const similarPairs = [];
const similarityThreshold = Number(process.env.WTW_SIMILARITY_THRESHOLD ?? 0.86);

function text(value) {
  if (!value || typeof value !== "object") return "";
  return `${value["zh-CN"] ?? ""} ${value["en-US"] ?? ""}`;
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value) {
  const normalized = normalize(value);
  if (!normalized) return new Set();

  const words = normalized.split(" ");
  const chars = [...normalized.replace(/\s+/g, "")];
  return new Set([...words, ...chars]);
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }

  return intersection / (a.size + b.size - intersection);
}

function location(question) {
  return `${question.file}:${question.line} ${question.id}`;
}

for (const file of questionFiles) {
  for (const { value: question, line } of readJsonl(file)) {
    const searchableText = `${text(question.title)} ${text(question.prompt)} ${text(question.reveal)}`;
    const exactKey = normalize(`${question.category} ${question.type} ${text(question.prompt)} ${JSON.stringify(question.answer ?? [])}`);
    const record = {
      id: question.id,
      category: question.category,
      type: question.type,
      file: relativePath(file),
      line,
      text: searchableText,
      tokens: tokens(searchableText)
    };

    if (exactKeys.has(exactKey)) {
      exactDuplicates.push([exactKeys.get(exactKey), record]);
    } else {
      exactKeys.set(exactKey, record);
    }

    questions.push(record);
  }
}

for (let left = 0; left < questions.length; left += 1) {
  for (let right = left + 1; right < questions.length; right += 1) {
    const a = questions[left];
    const b = questions[right];
    if (a.category !== b.category) continue;

    const score = jaccard(a.tokens, b.tokens);
    if (score >= similarityThreshold) {
      similarPairs.push({ a, b, score });
    }
  }
}

if (exactDuplicates.length > 0) {
  console.error(`Possible exact duplicates found: ${exactDuplicates.length}`);
  for (const [a, b] of exactDuplicates) {
    console.error(`- ${location(a)} <-> ${location(b)}`);
  }
  process.exit(1);
}

console.log(`Duplicate check passed. Questions scanned: ${questions.length}.`);

if (similarPairs.length > 0) {
  console.log(`Possible similar questions: ${similarPairs.length}`);
  for (const { a, b, score } of similarPairs.slice(0, 20)) {
    console.log(`- ${score.toFixed(2)} ${location(a)} <-> ${location(b)}`);
  }
  if (similarPairs.length > 20) {
    console.log(`- and ${similarPairs.length - 20} more`);
  }
} else {
  console.log("No near-duplicate candidates found.");
}
