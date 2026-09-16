import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const hasDirectCommand = Boolean(process.argv[2]);
const queuedInput = input.isTTY || hasDirectCommand ? [] : fs.readFileSync(0, "utf8").split(/\r?\n/);
let inputEnded = false;

const commands = {
  new: {
    description: "Create a bilingual question interactively",
    run: () => runNode(["scripts/new-question.mjs"])
  },
  import: {
    description: "Validate and import question JSON drafts",
    run: (args) => importQuestions(args)
  },
  check: {
    description: "Run maintenance checks and rebuild indexes",
    run: () => runCheck()
  },
  "lint-tags": {
    description: "Check tag naming and consistency",
    run: () => runNode(["scripts/lint-tags.mjs"])
  },
  dedupe: {
    description: "Find exact and near-duplicate questions",
    run: () => runNode(["scripts/dedupe.mjs"])
  },
  "rebalance-answers": {
    description: "Evenly distribute correct option positions",
    run: (args) => runNode(["scripts/rebalance-choice-answers.mjs", ...args])
  },
  sample: {
    description: "Randomly sample question IDs",
    run: async () => {
      const count = await ask("Count", "10");
      const category = await ask("Category filter, optional");
      const type = await ask("Type filter, optional");
      const args = ["scripts/sample.mjs", "--count", count];
      if (category) args.push("--category", category);
      if (type) args.push("--type", type);
      runNode(args);
    }
  },
  stats: {
    description: "Show question bank stats",
    run: () => runNode(["scripts/stats.mjs"])
  },
  help: {
    description: "Show command help",
    run: () => printHelp()
  }
};

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    return false;
  }

  return true;
}

function runCheck() {
  if (!runNode(["scripts/validate.mjs"])) return false;
  if (!runNode(["scripts/lint-tags.mjs"])) return false;
  if (!runNode(["scripts/dedupe.mjs"])) return false;
  return runNode(["scripts/build-index.mjs"]);
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
    console.log("Required. Please enter a value.");
  }
}

function commandOptions(args = []) {
  const options = {
    dryRun: args.includes("--dry-run"),
    yes: args.includes("--yes") || args.includes("-y"),
    check: args.includes("--check"),
    target: undefined,
    file: undefined
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--target") {
      options.target = args[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--") || arg === "-y") continue;
    options.file ||= arg;
  }

  return options;
}

function importArgs(file, options, dryRun) {
  const args = ["scripts/new-question.mjs", "--from-json", file];
  if (options.target) args.push("--target", options.target);
  if (dryRun) args.push("--dry-run");
  return args;
}

function stdinDraftFile() {
  const raw = fs.readFileSync(0, "utf8");
  if (!raw.trim()) throw new Error("No JSON draft was received from stdin.");
  const file = path.join(os.tmpdir(), `wan-ti-wang-import-${Date.now()}.json`);
  fs.writeFileSync(file, raw);
  return file;
}

async function importQuestions(args = []) {
  const options = commandOptions(args);
  let file = options.file || await askRequired("Draft JSON path");
  let tempFile;

  if (file === "-") {
    tempFile = stdinDraftFile();
    file = tempFile;
  }

  try {
    console.log("\nValidating question draft...");
    const dryRunOk = runNode(importArgs(file, options, true));
    if (!dryRunOk || options.dryRun) return;

    let shouldImport = options.yes;
    if (!shouldImport && input.isTTY) {
      const answer = await ask("Import this draft now?", "yes");
      shouldImport = ["y", "yes"].includes(answer.toLowerCase());
    } else if (!input.isTTY) {
      shouldImport = true;
    }

    if (!shouldImport) {
      console.log("Import cancelled. No question files were changed.");
      return;
    }

    console.log("\nImporting question draft...");
    if (!runNode(importArgs(file, options, false))) return;

    if (options.check) {
      console.log("\nRunning maintenance check...");
      runCheck();
    } else {
      console.log("\nNext step: npm run wtw -- check");
    }
  } finally {
    if (tempFile) fs.rmSync(tempFile, { force: true });
  }
}

async function chooseMenu() {
  console.log("\nWan Ti Wang Console");
  console.log("万题王控制台\n");
  console.log("1. Add question        新增题目");
  console.log("2. Import JSON draft   导入 JSON 草稿");
  console.log("3. Check and index     校验并生成索引");
  console.log("4. Sample questions    随机抽题");
  console.log("5. Show stats          查看统计");
  console.log("6. Lint tags           检查标签");
  console.log("7. Find duplicates     检查重复题");
  console.log("8. Help                查看帮助");
  console.log("0. Exit                退出\n");

  const choice = await ask("Choose");
  if (!choice && inputEnded) return "exit";
  const map = {
    "1": "new",
    "2": "import",
    "3": "check",
    "4": "sample",
    "5": "stats",
    "6": "lint-tags",
    "7": "dedupe",
    "8": "help",
    "0": "exit"
  };

  return map[choice] ?? choice;
}

function printHelp() {
  console.log(`
Wan Ti Wang command entry
万题王命令入口

Daily use:
  npm run wtw

Direct commands:
  npm run wtw -- new      Create a bilingual question
  npm run wtw -- import draft.json --dry-run
                             Validate a question draft without writing
  npm run wtw -- import draft.json --yes --check
                             Import a reviewed draft, then run checks
  npm run wtw -- check    Validate and rebuild indexes
  npm run wtw -- sample   Randomly sample question IDs
  npm run wtw -- stats    Show question bank stats
  npm run wtw -- lint-tags  Check tag naming and consistency
  npm run wtw -- dedupe     Find exact and near-duplicate questions
  npm run wtw -- rebalance-answers --write
                             Evenly distribute correct option positions
  npm run wtw -- help     Show this help

Lower-level scripts still exist for automation:
  npm run import:questions -- draft.json --yes --check
  npm run new:question
  npm run validate
  npm run lint:tags
  npm run dedupe
  npm run build:index
  npm run sample
  npm run stats
`);
}

async function main() {
  const commandName = process.argv[2];

  if (commandName) {
    const command = commands[commandName];
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      printHelp();
      process.exitCode = 1;
      return;
    }

    await command.run(process.argv.slice(3));
    return;
  }

  while (true) {
    const selected = await chooseMenu();
    if (selected === "exit") return;

    const command = commands[selected];
    if (!command) {
      console.log("Unknown choice. Please try again.");
      continue;
    }

    await command.run();
  }
}

try {
  await main();
} finally {
  rl.close();
}
