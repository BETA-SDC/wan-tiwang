import path from "node:path";
import { mediaMetaRoot, questionsRoot, readJson, readJsonl, relativePath, taxonomyRoot, walkFiles } from "./lib.mjs";

const errors = [];
const questionFiles = walkFiles(questionsRoot, (file) => file.endsWith(".jsonl"));
const mediaFiles = walkFiles(mediaMetaRoot, (file) => file.endsWith(".jsonl"));

const categories = new Set(readJson(path.join(taxonomyRoot, "categories.json")).categories.map((item) => item.id));
const formats = new Set(readJson(path.join(taxonomyRoot, "formats.json")).formats.map((item) => item.id));
const moods = new Set(readJson(path.join(taxonomyRoot, "moods.json")).moods.map((item) => item.id));
const occasions = new Set(readJson(path.join(taxonomyRoot, "occasions.json")).occasions.map((item) => item.id));

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

function validateMediaRef(file, line, media, fieldName = "media reference") {
  if (!media.id) addError(file, line, `${fieldName} is missing id`);
  if (!media.role) addError(file, line, `${fieldName} is missing role`);
  if (media.id && !mediaIds.has(media.id)) addError(file, line, `unknown media reference: ${media.id}`);
  if (media.kind && media.id && mediaTypes.has(media.id) && media.kind !== mediaTypes.get(media.id)) {
    addError(file, line, `${fieldName} kind ${media.kind} does not match metadata type ${mediaTypes.get(media.id)} for ${media.id}`);
  }
  if (media.hint !== undefined) validateLocalizedText(file, line, media.hint, `${fieldName} ${media.id ?? ""} hint`.trim());
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
    if (!question.status) addError(file, line, "question is missing status");

    for (const option of question.options ?? []) {
      if (!option.id) addError(file, line, "option is missing id");
      if (option.text === undefined && (option.media ?? []).length === 0) {
        addError(file, line, `option ${option.id ?? ""} must include text or media`.trim());
      }
      if (option.text !== undefined) validateLocalizedText(file, line, option.text, `option ${option.id ?? ""} text`.trim());
      for (const media of option.media ?? []) validateMediaRef(file, line, media, `option ${option.id ?? ""} media`.trim());
    }

    if (question.reveal !== undefined) validateLocalizedText(file, line, question.reveal, "reveal");
    if (question.fun_fact !== undefined) validateLocalizedText(file, line, question.fun_fact, "fun_fact");

    for (const mood of question.mood ?? []) {
      if (!moods.has(mood)) addError(file, line, `unknown mood: ${mood}`);
    }

    for (const occasion of question.occasion ?? []) {
      if (!occasions.has(occasion)) addError(file, line, `unknown occasion: ${occasion}`);
    }

    for (const media of question.media ?? []) validateMediaRef(file, line, media);
  }
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed. Questions: ${questionIds.size}. Media items: ${mediaIds.size}.`);
