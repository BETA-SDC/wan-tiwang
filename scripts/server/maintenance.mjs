import { spawn } from "node:child_process";
import { repoRoot } from "../lib.mjs";

export function runMaintenance() {
  const steps = ["validate.mjs", "lint-tags.mjs", "dedupe.mjs", "build-index.mjs"];
  let output = "";

  return steps.reduce((previous, script) => {
    return previous.then((state) => {
      if (!state.ok) return state;

      return new Promise((resolve) => {
        const child = spawn(process.execPath, [`scripts/${script}`], { cwd: repoRoot });
        child.stdout.on("data", (chunk) => { output += chunk.toString(); });
        child.stderr.on("data", (chunk) => { output += chunk.toString(); });
        child.on("close", (code) => {
          resolve({ ok: code === 0, code, output });
        });
      });
    });
  }, Promise.resolve({ ok: true, code: 0, output }));
}
