import path from "node:path";
import { readJsonl, relativePath, repoRoot, walkFiles, writeJson } from "./lib.mjs";

const questionFiles = walkFiles(path.join(repoRoot, "questions"), (file) => file.endsWith(".jsonl"));

const byId = {};
const byCategory = {};
const byTag = {};
const byMood = {};
const byOccasion = {};
const byFormat = {};
const stats = {
  total: 0,
  by_status: {},
  by_type: {},
  by_category: {}
};

function pushIndex(index, key, questionId) {
  if (!key) return;
  index[key] ??= [];
  index[key].push(questionId);
}

for (const file of questionFiles) {
  for (const { value: question, line } of readJsonl(file)) {
    byId[question.id] = {
      file: relativePath(file),
      line
    };

    pushIndex(byCategory, question.category, question.id);
    pushIndex(byFormat, question.type, question.id);

    for (const tag of question.tags ?? []) pushIndex(byTag, tag, question.id);
    for (const mood of question.mood ?? []) pushIndex(byMood, mood, question.id);
    for (const occasion of question.occasion ?? []) pushIndex(byOccasion, occasion, question.id);

    stats.total += 1;
    stats.by_status[question.status] = (stats.by_status[question.status] ?? 0) + 1;
    stats.by_type[question.type] = (stats.by_type[question.type] ?? 0) + 1;
    stats.by_category[question.category] = (stats.by_category[question.category] ?? 0) + 1;
  }
}

writeJson(path.join(repoRoot, "indexes/by-id.json"), byId);
writeJson(path.join(repoRoot, "indexes/by-category.json"), byCategory);
writeJson(path.join(repoRoot, "indexes/by-tag.json"), byTag);
writeJson(path.join(repoRoot, "indexes/by-mood.json"), byMood);
writeJson(path.join(repoRoot, "indexes/by-occasion.json"), byOccasion);
writeJson(path.join(repoRoot, "indexes/by-format.json"), byFormat);
writeJson(path.join(repoRoot, "indexes/stats.json"), stats);

console.log(`Built indexes for ${stats.total} question(s).`);
