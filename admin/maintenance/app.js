import { requestJson } from "../shared/api.js";
import { byId } from "../shared/dom.js";
import { readTextFile } from "../shared/files.js";
import { mountAppShell } from "../shared/app-shell.js";

const output = byId("checkOutput");
const button = byId("runCheckButton");
const feedbackFile = byId("feedbackFile");
const feedbackButton = byId("importFeedbackButton");
const feedbackOutput = byId("feedbackOutput");

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

async function importFeedback() {
  const file = feedbackFile.files[0];
  if (!file) {
    feedbackOutput.textContent = "Choose a feedback JSON file first.";
    return;
  }
  feedbackButton.disabled = true;
  feedbackOutput.textContent = "Importing feedback...";
  try {
    const payload = await readTextFile(file);
    const result = await requestJson("/api/feedback/import", {
      method: "POST",
      body: payload
    });
    feedbackOutput.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    feedbackOutput.textContent = `Import failed: ${error.message}`;
  } finally {
    feedbackButton.disabled = false;
  }
}

mountAppShell();
button.addEventListener("click", runCheck);
feedbackButton.addEventListener("click", importFeedback);
