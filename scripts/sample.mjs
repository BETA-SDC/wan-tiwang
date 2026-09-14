import path from "node:path";
import { readJson, repoRoot } from "./lib.mjs";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const count = Number(args.get("--count") ?? 10);
const category = args.get("--category");
const type = args.get("--type");

const byId = readJson(path.join(repoRoot, "indexes/by-id.json"));
let ids = Object.keys(byId);

if (category) {
  const byCategory = readJson(path.join(repoRoot, "indexes/by-category.json"));
  ids = ids.filter((id) => (byCategory[category] ?? []).includes(id));
}

if (type) {
  const byFormat = readJson(path.join(repoRoot, "indexes/by-format.json"));
  ids = ids.filter((id) => (byFormat[type] ?? []).includes(id));
}

const shuffled = ids
  .map((id) => ({ id, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .slice(0, count)
  .map((item) => item.id);

console.log(JSON.stringify({ count: shuffled.length, question_ids: shuffled }, null, 2));
