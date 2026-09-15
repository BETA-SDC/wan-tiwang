import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { normalizeSlug, readJson, relativePath, repoRoot, taxonomyRoot } from "./lib.mjs";
import { appendPreparedQuestions, defaultQuestionFile, nextQuestionId, prepareQuestionImport, questionIds } from "./question-store.mjs";

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const fromJsonSource = argValue("--from-json");
const rl = readline.createInterface({ input, output });
const queuedInput = !input.isTTY && fromJsonSource !== "-" ? fs.readFileSync(0, "utf8").split(/\r?\n/) : [];
let inputEnded = false;

const categories = readJson(path.join(taxonomyRoot, "categories.json")).categories;
const formats = readJson(path.join(taxonomyRoot, "formats.json")).formats;
const moods = readJson(path.join(taxonomyRoot, "moods.json")).moods;
const occasions = readJson(path.join(taxonomyRoot, "occasions.json")).occasions;
const isDryRun = process.argv.includes("--dry-run");

function localized(zh, en) {
  return {
    "zh-CN": zh.trim(),
    "en-US": en.trim()
  };
}

async function ask(message, fallback = "") {
  const suffix = fallback ? ` (${fallback})` : "";
  if (queuedInput.length > 0) {
    const answer = queuedInput.shift().trim();
    console.log(`${message}${suffix}: ${answer}`);
    return answer || fallback;
  }
  if (!input.isTTY) {
    inputEnded = true;
    return fallback;
  }
  const answer = await rl.question(`${message}${suffix}: `);
  return answer.trim() || fallback;
}

async function askRequired(message) {
  while (true) {
    const answer = await ask(message);
    if (answer) return answer;
    if (inputEnded) {
      throw new Error(`${message} is required, but input ended.`);
    }
    console.log("Required. Please enter a value.");
  }
}

async function chooseFromList(title, items, fallbackIndex = 1) {
  console.log(`\n${title}`);
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.id} - ${item.name}`);
  });

  while (true) {
    const raw = await ask("Choose number or exact ID", String(fallbackIndex));
    const index = Number(raw);
    if (Number.isInteger(index) && index >= 1 && index <= items.length) {
      return items[index - 1];
    }

    const exact = items.find((item) => item.id === raw);
    if (exact) return exact;
    console.log("Invalid choice. Enter a number or exact ID.");
  }
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function askMultiSelect(title, items, fallbackIds = []) {
  console.log(`\n${title}`);
  console.log(items.map((item) => item.id).join(", "));
  const raw = await ask("Enter comma-separated IDs", fallbackIds.join(","));
  const selected = parseList(raw);
  const validIds = new Set(items.map((item) => item.id));
  const invalid = selected.filter((id) => !validIds.has(id));

  if (invalid.length > 0) {
    console.log(`Ignored unknown IDs: ${invalid.join(", ")}`);
  }

  return selected.filter((id) => validIds.has(id));
}

function writeQuestion(item) {
  if (isDryRun) {
    console.log("\nDry run. No file was changed.");
    console.log(JSON.stringify(item.question, null, 2));
    console.log(`Target would be: ${item.file}`);
    return;
  }

  appendPreparedQuestions([item]);
  console.log(`\nAdded ${item.question.id} to ${item.file}`);
  console.log("Next steps:");
  console.log("- npm run validate");
  console.log("- npm run build:index");
}

function readQuestionFromJson(source) {
  const raw = source === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(source, "utf8");
  return JSON.parse(raw);
}

async function askOptions(type) {
  if (!["single_choice", "multiple_choice", "true_false", "ordering"].includes(type)) return undefined;

  if (type === "true_false") {
    return [
      { id: "T", text: localized("真的", "True") },
      { id: "F", text: localized("假的", "False") }
    ];
  }

  const count = Number(await ask("How many options", "4"));
  const options = [];

  for (let index = 0; index < count; index += 1) {
    const id = String.fromCharCode(65 + index);
    const zh = await askRequired(`Option ${id} zh-CN`);
    const en = await askRequired(`Option ${id} en-US`);
    options.push({ id, text: localized(zh, en) });
  }

  return options;
}

async function main() {
  const targetFromArgs = argValue("--target");

  if (fromJsonSource) {
    const input = readQuestionFromJson(fromJsonSource);
    const prepared = prepareQuestionImport(input, { targetFile: targetFromArgs });
    for (const item of prepared) writeQuestion(item);
    return;
  }

  console.log("Wan Ti Wang question authoring helper");
  console.log("All player-facing fields require zh-CN and en-US.\n");

  const category = await chooseFromList("Categories", categories);
  const format = await chooseFromList("Question types", formats);
  const ids = questionIds();
  const id = nextQuestionId(category.id, ids);

  const titleZh = await askRequired("Title zh-CN");
  const titleEn = await askRequired("Title en-US");
  const promptZh = await askRequired("Prompt zh-CN");
  const promptEn = await askRequired("Prompt en-US");
  const options = await askOptions(format.id);
  const answer = parseList(await askRequired("Answer IDs or accepted answers, comma-separated"));
  const revealZh = await askRequired("Reveal zh-CN");
  const revealEn = await askRequired("Reveal en-US");
  const funFactZh = await ask("Fun fact zh-CN");
  const funFactEn = await ask("Fun fact en-US");
  const tags = parseList(await ask("Tags, comma-separated"));
  const selectedMoods = await askMultiSelect("Moods", moods, ["easygoing"]);
  const selectedOccasions = await askMultiSelect("Occasions", occasions, ["daily"]);
  const playTime = Number(await ask("Play time in seconds", "20"));
  const status = await ask("Status", "draft");
  const topicSlug = normalizeSlug(await ask("Topic file name without .jsonl", "mixed"));
  const defaultFile = relativePath(defaultQuestionFile(category.id, topicSlug));
  const targetRelative = await ask("Target JSONL path", defaultFile);
  const targetPath = path.join(repoRoot, targetRelative);

  const question = {
    id,
    type: format.id,
    title: localized(titleZh, titleEn),
    prompt: localized(promptZh, promptEn),
    ...(options ? { options } : {}),
    answer,
    reveal: localized(revealZh, revealEn),
    ...(funFactZh || funFactEn ? { fun_fact: localized(funFactZh || revealZh, funFactEn || revealEn) } : {}),
    category: category.id,
    tags,
    mood: selectedMoods,
    occasion: selectedOccasions,
    play_time_sec: Number.isFinite(playTime) ? playTime : 20,
    status
  };

  writeQuestion({ question, targetPath, file: relativePath(targetPath) });
}

try {
  await main();
} finally {
  rl.close();
}
