import path from "node:path";
import { readJson, readJsonl, relativePath, repoRoot, walkFiles } from "./lib.mjs";

const errors = [];
const questionFiles = walkFiles(path.join(repoRoot, "questions"), (file) => file.endsWith(".jsonl"));
const mediaFiles = walkFiles(path.join(repoRoot, "media-meta"), (file) => file.endsWith(".jsonl"));

const categoryItems = readJson(path.join(repoRoot, "taxonomy/categories.json")).categories;
const categories = new Set(categoryItems.map((item) => item.id));
const questionCategories = new Set(categoryItems.filter((item) => item.parent).map((item) => item.id));
const formats = new Set(readJson(path.join(repoRoot, "taxonomy/formats.json")).formats.map((item) => item.id));
const moods = new Set(readJson(path.join(repoRoot, "taxonomy/moods.json")).moods.map((item) => item.id));
const occasions = new Set(readJson(path.join(repoRoot, "taxonomy/occasions.json")).occasions.map((item) => item.id));

const questionIds = new Set();
const mediaIds = new Set();
const mediaTypes = new Map();

function addError(file, line, message) {
  errors.push(`${relativePath(file)}:${line} ${message}`);
}

function isLocalizedText(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value["zh-CN"] === "string" &&
    value["zh-CN"].trim().length > 0 &&
    typeof value["en-US"] === "string" &&
    value["en-US"].trim().length > 0
  );
}

function validateLocalizedText(file, line, value, fieldName) {
  if (!isLocalizedText(value)) {
    addError(file, line, `${fieldName} must include non-empty zh-CN and en-US text`);
  }
}

for (const file of mediaFiles) {
  for (const { value: item, line } of readJsonl(file)) {
    if (!item.id) addError(file, line, "media item is missing id");
    if (item.id && mediaIds.has(item.id)) addError(file, line, `duplicate media id: ${item.id}`);
    if (item.id) mediaIds.add(item.id);
    if (item.id && item.type) mediaTypes.set(item.id, item.type);
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
    validateLocalizedText(file, line, question.title, "title");
    validateLocalizedText(file, line, question.prompt, "prompt");
    if (!Array.isArray(question.answer) || question.answer.length === 0) addError(file, line, "question answer must be a non-empty array");
    if (!question.category || !categories.has(question.category)) addError(file, line, `unknown category: ${question.category}`);
    if (question.category && !questionCategories.has(question.category)) {
      addError(file, line, `question category must be at least second-level: ${question.category}`);
    }
    if (!question.status) addError(file, line, "question is missing status");

    for (const option of question.options ?? []) {
      if (!option.id) addError(file, line, "option is missing id");
      validateLocalizedText(file, line, option.text, `option ${option.id ?? ""} text`.trim());
    }

    if (question.reveal !== undefined) validateLocalizedText(file, line, question.reveal, "reveal");
    if (question.fun_fact !== undefined) validateLocalizedText(file, line, question.fun_fact, "fun_fact");

    for (const mood of question.mood ?? []) {
      if (!moods.has(mood)) addError(file, line, `unknown mood: ${mood}`);
    }

    for (const occasion of question.occasion ?? []) {
      if (!occasions.has(occasion)) addError(file, line, `unknown occasion: ${occasion}`);
    }

    for (const media of question.media ?? []) {
      if (!media.id) addError(file, line, "media reference is missing id");
      if (media.id && !mediaIds.has(media.id)) addError(file, line, `unknown media reference: ${media.id}`);
      if (media.kind && media.id && mediaTypes.has(media.id) && media.kind !== mediaTypes.get(media.id)) {
        addError(file, line, `media reference kind ${media.kind} does not match metadata type ${mediaTypes.get(media.id)} for ${media.id}`);
      }
      if (media.hint !== undefined) validateLocalizedText(file, line, media.hint, `media ${media.id ?? ""} hint`.trim());
    }
  }
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed. Questions: ${questionIds.size}. Media items: ${mediaIds.size}.`);
