import path from "node:path";
import { readJsonl, relativePath, repoRoot, walkFiles } from "./lib.mjs";

const questionFiles = walkFiles(path.join(repoRoot, "questions"), (file) => file.endsWith(".jsonl"));
const tagPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const issues = [];
const tagCounts = new Map();
const caseGroups = new Map();

function addIssue(file, line, message) {
  issues.push(`${relativePath(file)}:${line} ${message}`);
}

for (const file of questionFiles) {
  for (const { value: question, line } of readJsonl(file)) {
    const tags = question.tags ?? [];
    const seenInQuestion = new Set();

    for (const tag of tags) {
      if (typeof tag !== "string" || tag.trim() !== tag || tag.length === 0) {
        addIssue(file, line, `invalid tag value: ${JSON.stringify(tag)}`);
        continue;
      }

      if (!tagPattern.test(tag)) {
        addIssue(file, line, `tag should be a lowercase English slug: ${tag}`);
      }

      if (seenInQuestion.has(tag)) {
        addIssue(file, line, `duplicate tag in question: ${tag}`);
      }

      seenInQuestion.add(tag);
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);

      const lower = tag.toLowerCase();
      caseGroups.set(lower, new Set([...(caseGroups.get(lower) ?? []), tag]));
    }
  }
}

for (const [lower, variants] of caseGroups) {
  if (variants.size > 1) {
    issues.push(`tag case variants for ${lower}: ${[...variants].join(", ")}`);
  }
}

if (issues.length > 0) {
  console.error(`Tag lint failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

const topTags = [...tagCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 10);

console.log(`Tag lint passed. Unique tags: ${tagCounts.size}.`);
if (topTags.length > 0) {
  console.log("Top tags:");
  for (const [tag, count] of topTags) console.log(`- ${tag}: ${count}`);
}
