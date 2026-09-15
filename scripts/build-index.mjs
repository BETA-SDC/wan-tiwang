import path from "node:path";
import { indexesRoot, questionsRoot, readJsonl, relativePath, walkFiles, writeJson } from "./lib.mjs";

const questionFiles = walkFiles(questionsRoot, (file) => file.endsWith(".jsonl"));

const byId = {};
const byCategory = {};
const byTag = {};
const byMood = {};
const byOccasion = {};
const byFormat = {};
const byMedia = {};
const stats = {
  total: 0,
  with_media: 0,
  by_status: {},
  by_type: {},
  by_category: {}
};

function pushIndex(index, key, questionId) {
  if (!key) return;
  index[key] ??= [];
  if (!index[key].includes(questionId)) index[key].push(questionId);
}

function mediaRefs(question) {
  return [
    ...(question.media ?? []),
    ...(question.options ?? []).flatMap((option) => option.media ?? [])
  ];
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
    for (const media of mediaRefs(question)) pushIndex(byMedia, media.id, question.id);

    stats.total += 1;
    if (mediaRefs(question).length > 0) stats.with_media += 1;
    stats.by_status[question.status] = (stats.by_status[question.status] ?? 0) + 1;
    stats.by_type[question.type] = (stats.by_type[question.type] ?? 0) + 1;
    stats.by_category[question.category] = (stats.by_category[question.category] ?? 0) + 1;
  }
}

writeJson(path.join(indexesRoot, "by-id.json"), byId);
writeJson(path.join(indexesRoot, "by-category.json"), byCategory);
writeJson(path.join(indexesRoot, "by-tag.json"), byTag);
writeJson(path.join(indexesRoot, "by-mood.json"), byMood);
writeJson(path.join(indexesRoot, "by-occasion.json"), byOccasion);
writeJson(path.join(indexesRoot, "by-format.json"), byFormat);
writeJson(path.join(indexesRoot, "by-media.json"), byMedia);
writeJson(path.join(indexesRoot, "stats.json"), stats);

console.log(`Built indexes for ${stats.total} question(s).`);
