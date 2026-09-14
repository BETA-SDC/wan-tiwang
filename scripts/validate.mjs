import path from "node:path";
import { readJson, readJsonl, relativePath, repoRoot, walkFiles } from "./lib.mjs";

const errors = [];
const questionFiles = walkFiles(path.join(repoRoot, "questions"), (file) => file.endsWith(".jsonl"));
const mediaFiles = walkFiles(path.join(repoRoot, "media-meta"), (file) => file.endsWith(".jsonl"));

const categories = new Set(readJson(path.join(repoRoot, "taxonomy/categories.json")).categories.map((item) => item.id));
const formats = new Set(readJson(path.join(repoRoot, "taxonomy/formats.json")).formats.map((item) => item.id));
const moods = new Set(readJson(path.join(repoRoot, "taxonomy/moods.json")).moods.map((item) => item.id));
const occasions = new Set(readJson(path.join(repoRoot, "taxonomy/occasions.json")).occasions.map((item) => item.id));

const questionIds = new Set();
const mediaIds = new Set();

function addError(file, line, message) {
  errors.push(`${relativePath(file)}:${line} ${message}`);
}

for (const file of mediaFiles) {
  for (const { value: item, line } of readJsonl(file)) {
    if (!item.id) addError(file, line, "media item is missing id");
    if (item.id && mediaIds.has(item.id)) addError(file, line, `duplicate media id: ${item.id}`);
    if (item.id) mediaIds.add(item.id);
    if (!item.type) addError(file, line, "media item is missing type");
    if (!item.path) addError(file, line, "media item is missing relative path");
    if (item.path && path.isAbsolute(item.path)) addError(file, line, "media path must be relative");
    if (!item.status) addError(file, line, "media item is missing status");
  }
}

for (const file of questionFiles) {
  for (const { value: question, line } of readJsonl(file)) {
    if (!question.id) addError(file, line, "question is missing id");
    if (question.id && questionIds.has(question.id)) addError(file, line, `duplicate question id: ${question.id}`);
    if (question.id) questionIds.add(question.id);

    if (!question.type || !formats.has(question.type)) addError(file, line, `unknown question type: ${question.type}`);
    if (!question.title) addError(file, line, "question is missing title");
    if (!question.prompt) addError(file, line, "question is missing prompt");
    if (!Array.isArray(question.answer) || question.answer.length === 0) addError(file, line, "question answer must be a non-empty array");
    if (!question.category || !categories.has(question.category)) addError(file, line, `unknown category: ${question.category}`);
    if (!question.status) addError(file, line, "question is missing status");

    for (const mood of question.mood ?? []) {
      if (!moods.has(mood)) addError(file, line, `unknown mood: ${mood}`);
    }

    for (const occasion of question.occasion ?? []) {
      if (!occasions.has(occasion)) addError(file, line, `unknown occasion: ${occasion}`);
    }

    for (const media of question.media ?? []) {
      if (!media.id) addError(file, line, "media reference is missing id");
      if (media.id && !mediaIds.has(media.id)) addError(file, line, `unknown media reference: ${media.id}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed. Questions: ${questionIds.size}. Media items: ${mediaIds.size}.`);
