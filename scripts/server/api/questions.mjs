import { appendPreparedQuestions, createQuestion, importSummary, loadQuestions, localizedText, prepareQuestionImport, rewriteJsonlLine } from "../../question-store.mjs";

function questionMatchesFilters(question, filters) {
  if (filters.category && question.category !== filters.category) return false;
  if (filters.categoryPrefix && question.category !== filters.categoryPrefix && !question.category.startsWith(`${filters.categoryPrefix}.`)) return false;
  if (filters.type && question.type !== filters.type) return false;
  if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
  if (filters.status && question.status !== filters.status) return false;
  if (filters.tag && !(question.tags ?? []).includes(filters.tag)) return false;
  if (!filters.query) return true;

  return [
    question.id,
    question.category,
    question.type,
    localizedText(question.title),
    localizedText(question.prompt),
    localizedText(question.reveal),
    ...(question.tags ?? [])
  ].join(" ").toLowerCase().includes(filters.query);
}

export function listQuestions(url) {
  const filters = {
    query: (url.searchParams.get("q") ?? "").toLowerCase(),
    category: url.searchParams.get("category") ?? "",
    categoryPrefix: url.searchParams.get("categoryPrefix") ?? "",
    type: url.searchParams.get("type") ?? "",
    difficulty: url.searchParams.get("difficulty") ?? "",
    status: url.searchParams.get("status") ?? "",
    tag: url.searchParams.get("tag") ?? ""
  };
  const limit = Number(url.searchParams.get("limit") ?? 500);
  const questions = loadQuestions().filter((question) => questionMatchesFilters(question, filters));
  return { total: questions.length, questions: questions.slice(0, limit) };
}

export function getQuestion(id) {
  const found = loadQuestions().find((question) => question.id === id);
  if (!found) return { status: 404, body: { error: `Question not found: ${id}` } };
  return { status: 200, body: { question: found } };
}

export function importQuestions(body, url) {
  const dryRun = Boolean(body?.dryRun || url.searchParams.get("dryRun") === "true");
  const prepared = prepareQuestionImport(body);
  if (!dryRun) appendPreparedQuestions(prepared);
  return {
    status: dryRun ? 200 : 201,
    body: importSummary(prepared, dryRun)
  };
}

export function createQuestionRecord(body) {
  const item = createQuestion(body, body.targetFile);
  return { ok: true, id: item.question.id, file: item.file };
}

export function updateQuestionRecord(id, body) {
  const found = loadQuestions().find((question) => question.id === id);
  if (!found) return { status: 404, body: { error: `Question not found: ${id}` } };

  const nextValue = { ...body };
  delete nextValue._file;
  delete nextValue._line;
  rewriteJsonlLine(found._file, found._line, nextValue);
  return { status: 200, body: { ok: true, id, file: found._file } };
}
