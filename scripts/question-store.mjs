import fs from "node:fs";
import path from "node:path";
import { normalizeSlug, questionsRoot, readJson, readJsonl, relativePath, repoRoot, safePath, taxonomyRoot, walkFiles } from "./lib.mjs";

export function loadQuestions() {
  const questionFiles = walkFiles(questionsRoot, (file) => file.endsWith(".jsonl"));
  const questions = [];

  for (const file of questionFiles) {
    for (const { value, line } of readJsonl(file)) {
      questions.push({ ...value, _file: relativePath(file), _line: line });
    }
  }

  return questions.sort((a, b) => a.id.localeCompare(b.id));
}

export function localizedText(value) {
  if (!value || typeof value !== "object") return "";
  return `${value["zh-CN"] ?? ""} ${value["en-US"] ?? ""}`;
}

export function questionIds(questions = loadQuestions()) {
  return new Set(questions.map((question) => question.id).filter(Boolean));
}

export function nextQuestionId(categoryId, idsOrQuestions = loadQuestions()) {
  const ids = idsOrQuestions instanceof Set
    ? idsOrQuestions
    : new Set(idsOrQuestions.map((item) => typeof item === "string" ? item : item.id).filter(Boolean));
  const prefix = categoryId.replace(/\./g, "-");
  let max = 0;

  for (const id of ids) {
    if (!id.startsWith(`${prefix}-`)) continue;
    const suffix = id.slice(prefix.length + 1);
    if (/^[0-9]{6}$/.test(suffix)) max = Math.max(max, Number(suffix));
  }

  return `${prefix}-${String(max + 1).padStart(6, "0")}`;
}

export function defaultQuestionFile(questionOrCategory, topic = "mixed") {
  const category = typeof questionOrCategory === "string" ? questionOrCategory : questionOrCategory.category;
  const topicSlug = normalizeSlug(typeof questionOrCategory === "string" ? topic : questionOrCategory.topic || "mixed") || "mixed";
  return path.join(questionsRoot, ...category.split("."), `${topicSlug}.jsonl`);
}

export function importPayloadQuestions(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.questions)) return body.questions;
  if (Array.isArray(body?.questions?.questions)) return body.questions.questions;
  if (body?.questions && typeof body.questions === "object") return [body.questions];
  if (body && typeof body === "object") return [body];
  return [];
}

export function normalizeImportQuestion(inputQuestion, ids = questionIds()) {
  const categories = readJson(path.join(taxonomyRoot, "categories.json")).categories;
  const formats = readJson(path.join(taxonomyRoot, "formats.json")).formats;

  if (!inputQuestion || typeof inputQuestion !== "object" || Array.isArray(inputQuestion)) {
    throw new Error("Each imported question must be a JSON object.");
  }

  const question = { ...inputQuestion };
  if (!question.category) throw new Error("Question is missing category.");
  if (!categories.some((category) => category.id === question.category)) {
    throw new Error(`Unknown category: ${question.category}`);
  }

  if (!question.type) throw new Error("Question is missing type.");
  if (!formats.some((format) => format.id === question.type)) {
    throw new Error(`Unknown question type: ${question.type}`);
  }

  if (question.id && ids.has(question.id)) {
    throw new Error(`Question id already exists: ${question.id}`);
  }

  question.id ||= nextQuestionId(question.category, ids);
  ids.add(question.id);
  delete question._file;
  delete question._line;
  delete question.targetFile;
  delete question.topic;
  return question;
}

export function resolveQuestionTarget(inputQuestion, targetRelative) {
  const targetFile = targetRelative ? safePath(repoRoot, targetRelative) : defaultQuestionFile(inputQuestion);
  if (!targetFile) throw new Error(`Unsafe target file: ${targetRelative}`);
  if (!targetFile.startsWith(questionsRoot)) {
    throw new Error(`Target file must stay under data/questions: ${targetRelative}`);
  }
  return targetFile;
}

export function prepareQuestionImport(body, options = {}) {
  const ids = questionIds(loadQuestions());
  const inputQuestions = importPayloadQuestions(body);
  if (inputQuestions.length === 0) throw new Error("No question objects found.");

  return inputQuestions.map((inputQuestion, index) => {
    const question = normalizeImportQuestion(inputQuestion, ids);
    const targetRelative = inputQuestion.targetFile || options.targetFile || body?.targetFile;
    const targetFile = resolveQuestionTarget(inputQuestion, targetRelative);
    return {
      index,
      question,
      targetFile,
      file: relativePath(targetFile)
    };
  });
}

export function importSummary(prepared, dryRun) {
  const filesByPath = new Map();
  for (const item of prepared) {
    const current = filesByPath.get(item.file) || { file: item.file, count: 0, ids: [] };
    current.count += 1;
    current.ids.push(item.question.id);
    filesByPath.set(item.file, current);
  }

  return {
    ok: true,
    dryRun,
    count: prepared.length,
    files: [...filesByPath.values()],
    questions: prepared.map((item) => ({
      id: item.question.id,
      category: item.question.category,
      type: item.question.type,
      file: item.file
    }))
  };
}

export function appendPreparedQuestions(prepared) {
  for (const item of prepared) {
    fs.mkdirSync(path.dirname(item.targetFile), { recursive: true });
    fs.appendFileSync(item.targetFile, `${JSON.stringify(item.question)}\n`);
  }
}

export function createQuestion(inputQuestion, targetRelative) {
  const prepared = prepareQuestionImport(inputQuestion, { targetFile: targetRelative });
  appendPreparedQuestions(prepared);
  return prepared[0];
}

export function rewriteJsonlLine(relativeFile, line, nextValue) {
  const file = path.join(repoRoot, relativeFile);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const jsonLineIndexes = [];

  lines.forEach((lineText, index) => {
    if (lineText.trim()) jsonLineIndexes.push(index);
  });

  const physicalIndex = jsonLineIndexes[line - 1];
  if (physicalIndex === undefined) throw new Error(`Cannot find JSONL line ${line} in ${relativeFile}.`);

  lines[physicalIndex] = JSON.stringify(nextValue);
  fs.writeFileSync(file, lines.join("\n").replace(/\n*$/, "\n"));
}
