import path from "node:path";
import { mediaMetaRoot, questionsRoot, readJson, readJsonl, relativePath, taxonomyRoot, walkFiles } from "./lib.mjs";

const errors = [];
const questionFiles = walkFiles(questionsRoot, (file) => file.endsWith(".jsonl"));
const mediaFiles = walkFiles(mediaMetaRoot, (file) => file.endsWith(".jsonl"));

const categories = new Set(readJson(path.join(taxonomyRoot, "categories.json")).categories.map((item) => item.id));
const formats = new Set(readJson(path.join(taxonomyRoot, "formats.json")).formats.map((item) => item.id));
const moods = new Set(readJson(path.join(taxonomyRoot, "moods.json")).moods.map((item) => item.id));
const occasions = new Set(readJson(path.join(taxonomyRoot, "occasions.json")).occasions.map((item) => item.id));
const difficulties = new Set(readJson(path.join(taxonomyRoot, "difficulties.json")).difficulties.map((item) => item.id));

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

function validateOptionLike(file, line, option, fieldName = "option") {
  if (!option.id) addError(file, line, `${fieldName} is missing id`);
  if (option.text === undefined && (option.media ?? []).length === 0) {
    addError(file, line, `${fieldName} must include text or media`);
  }
  if (option.text !== undefined) validateLocalizedText(file, line, option.text, `${fieldName} text`);
  for (const media of option.media ?? []) validateMediaRef(file, line, media, `${fieldName} media`);
}

function answerStrings(question) {
  return (question.answer ?? []).filter((answer) => typeof answer === "string");
}

function validateAnswerIds(file, line, question, validIds, fieldName = "answer") {
  for (const answer of answerStrings(question)) {
    if (!validIds.has(answer)) addError(file, line, `${fieldName} references unknown id: ${answer}`);
  }
}

function validateQuestionTypeShape(file, line, question) {
  const options = question.options ?? [];
  const optionIds = new Set(options.map((option) => option.id).filter(Boolean));

  if (["single_choice", "multiple_choice", "true_false", "ordering"].includes(question.type)) {
    if (options.length === 0) addError(file, line, `${question.type} requires options`);
    validateAnswerIds(file, line, question, optionIds);
  }

  if (question.type === "single_choice" && question.answer.length !== 1) {
    addError(file, line, "single_choice answer should contain exactly one option id");
  }

  if (question.type === "true_false") {
    const expected = new Set(["T", "F"]);
    for (const id of optionIds) {
      if (!expected.has(id)) addError(file, line, `true_false option id should be T or F, got ${id}`);
    }
    if (question.answer.length !== 1 || !expected.has(question.answer[0])) addError(file, line, "true_false answer should be T or F");
  }

  if (question.type === "ordering") {
    const ordered = answerStrings(question);
    if (ordered.length !== optionIds.size) addError(file, line, "ordering answer should list every option id in order");
  }

  if (question.type === "matching") {
    const left = question.pairs?.left ?? [];
    const right = question.pairs?.right ?? [];
    if (left.length === 0 || right.length === 0) addError(file, line, "matching requires pairs.left and pairs.right");
    const leftIds = new Set(left.map((item) => item.id).filter(Boolean));
    const rightIds = new Set(right.map((item) => item.id).filter(Boolean));
    for (const answer of question.answer) {
      if (!answer || typeof answer !== "object") {
        addError(file, line, "matching answer items should be objects with left and right ids");
        continue;
      }
      if (!leftIds.has(answer.left)) addError(file, line, `matching answer references unknown left id: ${answer.left}`);
      if (!rightIds.has(answer.right)) addError(file, line, `matching answer references unknown right id: ${answer.right}`);
    }
  }

  if (question.type === "hotspot") {
    const hotspotIds = new Set((question.hotspots ?? []).map((item) => item.id).filter(Boolean));
    if ((question.media ?? []).length === 0) addError(file, line, "hotspot requires question-level media");
    if (hotspotIds.size === 0) addError(file, line, "hotspot requires hotspots");
    validateAnswerIds(file, line, question, hotspotIds, "hotspot answer");
  }

  if (question.type === "numeric") {
    const hasNumericAnswer = (question.answer ?? []).some((answer) => typeof answer === "number" || /^-?\d+(?:\.\d+)?$/.test(String(answer)));
    if (!hasNumericAnswer && question.answer_rules?.numeric?.value === undefined) {
      addError(file, line, "numeric question should include a numeric answer or answer_rules.numeric.value");
    }
  }
}

function validateFeedback(file, line, feedback) {
  if (feedback === undefined) return;
  if (!feedback || typeof feedback !== "object" || Array.isArray(feedback)) {
    addError(file, line, "feedback should be an object");
    return;
  }
  for (const field of ["answered_count", "correct_count"]) {
    if (!Number.isInteger(feedback[field]) || feedback[field] < 0) addError(file, line, `feedback.${field} should be a non-negative integer`);
  }
  if (feedback.correct_count > feedback.answered_count) addError(file, line, "feedback.correct_count cannot exceed feedback.answered_count");
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
    if (question.difficulty !== undefined && !difficulties.has(question.difficulty)) addError(file, line, `unknown difficulty: ${question.difficulty}`);
    if (!question.status) addError(file, line, "question is missing status");

    for (const option of question.options ?? []) {
      validateOptionLike(file, line, option, `option ${option.id ?? ""}`.trim());
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
    validateFeedback(file, line, question.feedback);
    for (const item of question.pairs?.left ?? []) validateOptionLike(file, line, item, `matching left ${item.id ?? ""}`.trim());
    for (const item of question.pairs?.right ?? []) validateOptionLike(file, line, item, `matching right ${item.id ?? ""}`.trim());
    for (const hotspot of question.hotspots ?? []) {
      if (!hotspot.id) addError(file, line, "hotspot is missing id");
      if (!hotspot.shape) addError(file, line, `hotspot ${hotspot.id ?? ""} is missing shape`.trim());
      if (hotspot.label !== undefined) validateLocalizedText(file, line, hotspot.label, `hotspot ${hotspot.id ?? ""} label`.trim());
    }
    validateQuestionTypeShape(file, line, question);
  }
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed. Questions: ${questionIds.size}. Media items: ${mediaIds.size}.`);
