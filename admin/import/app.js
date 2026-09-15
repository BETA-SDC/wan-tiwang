import { requestJson } from "../shared/api.js";
import { byId } from "../shared/dom.js";
import { readTextFile } from "../shared/files.js";
import { mountAppShell } from "../shared/app-shell.js";

const draftInput = byId("draftInput");
const draftFile = byId("draftFile");
const clearDraftButton = byId("clearDraftButton");
const validateDraftButton = byId("validateDraftButton");
const importDraftButton = byId("importDraftButton");
const importOutput = byId("importOutput");
const resultSummary = byId("resultSummary");

let lastValidatedSource = "";

function parseDraft() {
  const raw = draftInput.value.trim();
  if (!raw) throw new Error("Paste or upload a question JSON draft first.");
  return JSON.parse(raw);
}

function importPayload(dryRun) {
  const draft = parseDraft();
  if (Array.isArray(draft)) return { dryRun, questions: draft };
  if (Array.isArray(draft?.questions)) return { ...draft, dryRun };
  return { dryRun, questions: [draft] };
}

function formatResult(result) {
  const files = result.files || [];
  const lines = [
    `${result.dryRun ? "Validated" : "Imported"} ${result.count} question(s).`,
    files.length ? `Target files: ${files.map((file) => `${file.file} (${file.count})`).join(", ")}` : ""
  ].filter(Boolean);

  return `${lines.join("\n")}\n\n${JSON.stringify(result, null, 2)}`;
}

function setBusy(isBusy) {
  validateDraftButton.disabled = isBusy;
  importDraftButton.disabled = isBusy || lastValidatedSource !== draftInput.value.trim();
}

async function validateDraft() {
  setBusy(true);
  resultSummary.textContent = "Checking draft...";
  importOutput.textContent = "Validating JSON and target files...";
  try {
    const result = await requestJson("/api/questions/import", {
      method: "POST",
      body: JSON.stringify(importPayload(true))
    });
    lastValidatedSource = draftInput.value.trim();
    resultSummary.textContent = `Ready to import ${result.count} question(s).`;
    importOutput.textContent = formatResult(result);
  } catch (error) {
    lastValidatedSource = "";
    resultSummary.textContent = "Draft needs changes.";
    importOutput.textContent = `Validation failed: ${error.message}`;
  } finally {
    setBusy(false);
  }
}

async function importDraft() {
  if (lastValidatedSource !== draftInput.value.trim()) {
    resultSummary.textContent = "Validate the current draft before importing.";
    importOutput.textContent = "The pasted JSON changed after validation.";
    return;
  }

  setBusy(true);
  resultSummary.textContent = "Importing draft...";
  importOutput.textContent = "Writing questions to JSONL files...";
  try {
    const result = await requestJson("/api/questions/import", {
      method: "POST",
      body: JSON.stringify(importPayload(false))
    });
    lastValidatedSource = "";
    resultSummary.textContent = `Imported ${result.count} question(s). Run Maintenance Check next.`;
    importOutput.textContent = formatResult(result);
  } catch (error) {
    resultSummary.textContent = "Import failed.";
    importOutput.textContent = `Import failed: ${error.message}`;
  } finally {
    setBusy(false);
  }
}

mountAppShell();

draftInput.addEventListener("input", () => {
  if (draftInput.value.trim() !== lastValidatedSource) importDraftButton.disabled = true;
});

draftFile.addEventListener("change", async () => {
  const file = draftFile.files[0];
  if (!file) return;
  draftInput.value = await readTextFile(file);
  lastValidatedSource = "";
  importDraftButton.disabled = true;
  resultSummary.textContent = `Loaded ${file.name}.`;
  importOutput.textContent = "Review the JSON, then click Validate Draft.";
});

clearDraftButton.addEventListener("click", () => {
  draftInput.value = "";
  draftFile.value = "";
  lastValidatedSource = "";
  importDraftButton.disabled = true;
  resultSummary.textContent = "No draft checked yet.";
  importOutput.textContent = "Paste JSON, then click Validate Draft.";
});

validateDraftButton.addEventListener("click", validateDraft);
importDraftButton.addEventListener("click", importDraft);
