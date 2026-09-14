import path from "node:path";
import { readJson, repoRoot } from "./lib.mjs";

const stats = readJson(path.join(repoRoot, "indexes/stats.json"));

function printSection(title, values) {
  console.log(`\n${title}`);
  const entries = Object.entries(values ?? {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    console.log("  none");
    return;
  }

  for (const [key, value] of entries) {
    console.log(`  ${key}: ${value}`);
  }
}

console.log("Wan Ti Wang Stats");
console.log("万题王统计");
console.log(`\nTotal questions: ${stats.total}`);
console.log(`Questions with media: ${stats.with_media ?? 0}`);
printSection("By status", stats.by_status);
printSection("By type", stats.by_type);
printSection("By category", stats.by_category);
