import { requestJson } from "../shared/api.js";
import { mountAppShell } from "../shared/app-shell.js";

const output = document.querySelector("#checkOutput");
const button = document.querySelector("#runCheckButton");

async function runCheck() {
  button.disabled = true;
  output.textContent = "Running checks...";
  try {
    const result = await requestJson("/api/check", { method: "POST", body: "{}" });
    output.textContent = result.output || "No output.";
  } catch (error) {
    output.textContent = `Check failed: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

mountAppShell();
button.addEventListener("click", runCheck);
