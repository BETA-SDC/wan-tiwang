import fs from "node:fs";
import path from "node:path";
import { normalizeSlug, relativePath, repoRoot, safePath } from "../../lib.mjs";
import { loadMedia } from "../../media-store.mjs";
import { loadQuestions } from "../../question-store.mjs";
import { folderDeckFiles, usedMediaForQuestions } from "../../slides/export-html.mjs";

export function exportSlides(body) {
  const requestedIds = Array.isArray(body.ids) ? body.ids : [];
  const byId = new Map(loadQuestions().map((question) => [question.id, question]));
  const questions = requestedIds.map((id) => byId.get(id)).filter(Boolean);
  if (questions.length === 0) throw new Error("No valid question IDs provided for export.");

  const title = body.title || `wan-ti-wang-slides-${new Date().toISOString().slice(0, 10)}`;
  const slug = normalizeSlug(title) || "wan-ti-wang-slides";
  const folderName = `${slug}-${Date.now()}`;
  const relativeFolder = path.join("exports", "slides", folderName);
  const targetFolder = path.join(repoRoot, relativeFolder);
  const media = usedMediaForQuestions(questions, loadMedia());
  const files = folderDeckFiles(questions, media, {
    title,
    locale: body.locale || "zh-CN",
    revealMode: body.revealMode || "hidden"
  });

  for (const [relativeFile, content] of Object.entries(files)) {
    const targetFile = safePath(targetFolder, relativeFile);
    if (!targetFile) throw new Error(`Unsafe export path: ${relativeFile}`);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, content);
  }

  const copiedMedia = [];
  const missingMedia = [];
  for (const item of media) {
    const sourceFile = safePath(repoRoot, item.path);
    const targetFile = safePath(targetFolder, item.path);
    if (!sourceFile || !targetFile) throw new Error(`Unsafe media path: ${item.path}`);
    if (!fs.existsSync(sourceFile)) {
      missingMedia.push(item.path);
      continue;
    }
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.copyFileSync(sourceFile, targetFile);
    copiedMedia.push(item.path);
  }

  const relativeIndex = path.join(relativeFolder, "index.html");
  return {
    ok: true,
    folder: relativePath(targetFolder),
    file: relativePath(path.join(targetFolder, "index.html")),
    url: `/${relativeIndex.replaceAll(path.sep, "/")}`,
    count: questions.length,
    media: {
      total: media.length,
      copied: copiedMedia.length,
      missing: missingMedia
    }
  };
}
