import { loadQuestions, rewriteJsonlLine } from "../../question-store.mjs";

function feedbackEntries(body) {
  const totals = new Map();
  const add = (id, answered, correct) => {
    if (!id) return;
    const current = totals.get(id) || { answered_count: 0, correct_count: 0 };
    current.answered_count += Number(answered || 0);
    current.correct_count += Number(correct || 0);
    totals.set(id, current);
  };

  if (body?.questions && typeof body.questions === "object") {
    for (const [id, value] of Object.entries(body.questions)) {
      add(id, value?.answered_count, value?.correct_count);
    }
  }

  if (Array.isArray(body?.events)) {
    for (const event of body.events) {
      add(event.question_id, 1, event.correct ? 1 : 0);
    }
  }

  return [...totals.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .filter((item) => item.answered_count > 0);
}

export function importFeedback(body) {
  const entries = feedbackEntries(body);
  if (entries.length === 0) throw new Error("No feedback entries found.");

  const byId = new Map(loadQuestions().map((question) => [question.id, question]));
  const updated = [];
  const missing = [];

  for (const entry of entries) {
    const question = byId.get(entry.id);
    if (!question) {
      missing.push(entry.id);
      continue;
    }
    const nextValue = { ...question };
    delete nextValue._file;
    delete nextValue._line;
    const existing = nextValue.feedback || {};
    nextValue.feedback = {
      answered_count: Number(existing.answered_count || 0) + entry.answered_count,
      correct_count: Number(existing.correct_count || 0) + entry.correct_count
    };
    rewriteJsonlLine(question._file, question._line, nextValue);
    updated.push({
      id: question.id,
      answered_count: nextValue.feedback.answered_count,
      correct_count: nextValue.feedback.correct_count
    });
  }

  return {
    ok: true,
    updated_count: updated.length,
    missing_count: missing.length,
    updated,
    missing
  };
}
