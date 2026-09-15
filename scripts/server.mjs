import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { indexesRoot, normalizeSlug, readJson, relativePath, repoRoot, safePath, taxonomyRoot } from "./lib.mjs";
import { appendMediaMeta, loadMedia, mediaDirectory, nextMediaId } from "./media-store.mjs";
import { appendPreparedQuestions, createQuestion, importSummary, loadQuestions, localizedText, prepareQuestionImport, rewriteJsonlLine } from "./question-store.mjs";
import { folderDeckFiles, usedMediaForQuestions } from "./slides/export-html.mjs";

const port = Number(process.env.PORT ?? 5177);
const maxRequestBytes = Number(process.env.MAX_REQUEST_BYTES ?? 200_000_000);
const adminRoot = path.join(repoRoot, "admin");
const exportsRoot = path.join(repoRoot, "exports");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4"
};

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value, null, 2));
}

function sendText(response, status, text) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(text);
}

function safeJoin(root, urlPath) {
  const joined = path.normalize(path.join(root, decodeURIComponent(urlPath)));
  if (joined !== root && !joined.startsWith(`${root}${path.sep}`)) return null;
  return joined;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxRequestBytes) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function feedbackEntries(body) {
  const totals = new Map();
  const add = (id, answered, correct) => {
    if (!id) return;
    const current = totals.get(id) || { answered_count: 0, correct_count: 0 };
    current.answered_count += Number(answered || 0);
    current.correct_count += Number(correct || 0);
    totals.set(id, current);
  };

  if (body?.questions && typeof body.questions === "object") {
    for (const [id, value] of Object.entries(body.questions)) {
      add(id, value?.answered_count, value?.correct_count);
    }
  }

  if (Array.isArray(body?.events)) {
    for (const event of body.events) {
      add(event.question_id, 1, event.correct ? 1 : 0);
    }
  }

  return [...totals.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .filter((item) => item.answered_count > 0);
}

function runMaintenance() {
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

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    return sendJson(response, 200, {
      categories: readJson(path.join(taxonomyRoot, "categories.json")).categories,
      formats: readJson(path.join(taxonomyRoot, "formats.json")).formats,
      difficulties: readJson(path.join(taxonomyRoot, "difficulties.json")).difficulties,
      moods: readJson(path.join(taxonomyRoot, "moods.json")).moods,
      occasions: readJson(path.join(taxonomyRoot, "occasions.json")).occasions,
      stats: readJson(path.join(indexesRoot, "stats.json"))
    });
  }

  if (request.method === "GET" && url.pathname === "/api/questions") {
    const query = (url.searchParams.get("q") ?? "").toLowerCase();
    const category = url.searchParams.get("category") ?? "";
    const categoryPrefix = url.searchParams.get("categoryPrefix") ?? "";
    const type = url.searchParams.get("type") ?? "";
    const difficulty = url.searchParams.get("difficulty") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const tag = url.searchParams.get("tag") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? 500);
    const questions = loadQuestions().filter((question) => {
      if (category && question.category !== category) return false;
      if (categoryPrefix && question.category !== categoryPrefix && !question.category.startsWith(`${categoryPrefix}.`)) return false;
      if (type && question.type !== type) return false;
      if (difficulty && question.difficulty !== difficulty) return false;
      if (status && question.status !== status) return false;
      if (tag && !(question.tags ?? []).includes(tag)) return false;
      if (!query) return true;
      return [
        question.id,
        question.category,
        question.type,
        localizedText(question.title),
        localizedText(question.prompt),
        localizedText(question.reveal),
        ...(question.tags ?? [])
      ].join(" ").toLowerCase().includes(query);
    });

    return sendJson(response, 200, { total: questions.length, questions: questions.slice(0, limit) });
  }

  if (request.method === "GET" && url.pathname === "/api/media") {
    const media = loadMedia();
    return sendJson(response, 200, { total: media.length, media });
  }

  if (request.method === "POST" && url.pathname === "/api/questions/import") {
    const body = JSON.parse(await readBody(request));
    const dryRun = Boolean(body?.dryRun || url.searchParams.get("dryRun") === "true");
    const prepared = prepareQuestionImport(body);

    if (!dryRun) {
      appendPreparedQuestions(prepared);
    }

    return sendJson(response, dryRun ? 200 : 201, importSummary(prepared, dryRun));
  }

  const questionMatch = url.pathname.match(/^\/api\/questions\/([^/]+)$/);
  if (questionMatch && request.method === "GET") {
    const id = decodeURIComponent(questionMatch[1]);
    const found = loadQuestions().find((question) => question.id === id);
    if (!found) return sendJson(response, 404, { error: `Question not found: ${id}` });
    return sendJson(response, 200, { question: found });
  }

  if (request.method === "POST" && url.pathname === "/api/slides/export") {
    const body = JSON.parse(await readBody(request));
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
    return sendJson(response, 201, {
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
    });
  }

  if (request.method === "POST" && url.pathname === "/api/media") {
    const body = JSON.parse(await readBody(request));
    const type = body.type;
    const filename = path.basename(body.filename || "");
    const extension = path.extname(filename).toLowerCase();
    if (!["image", "audio", "video"].includes(type)) throw new Error(`Unsupported media type: ${type}`);
    if (!extension) throw new Error("Uploaded media needs a file extension.");
    if (!body.dataUrl || !body.dataUrl.includes(",")) throw new Error("Uploaded media is missing data.");

    const title = (body.title || filename.replace(extension, "")).trim();
    const slug = normalizeSlug(body.slug || title || filename.replace(extension, ""));
    const id = nextMediaId(type, slug, loadMedia());
    const relativeMediaPath = path.join("media", mediaDirectory(type), `${id}${extension}`);
    const targetFile = path.join(repoRoot, relativeMediaPath);
    const encoded = body.dataUrl.split(",").pop();

    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, Buffer.from(encoded, "base64"));

    const item = {
      id,
      type,
      path: relativeMediaPath.replaceAll(path.sep, "/"),
      title,
      ...(body.alt ? { alt: body.alt } : {}),
      source: { type: "local", note: "Uploaded from the local admin UI." },
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: body.status || "draft"
    };
    return sendJson(response, 201, { ok: true, media: appendMediaMeta(item) });
  }

  if (request.method === "POST" && url.pathname === "/api/questions") {
    const body = JSON.parse(await readBody(request));
    const item = createQuestion(body, body.targetFile);
    return sendJson(response, 201, { ok: true, id: item.question.id, file: item.file });
  }

  if (questionMatch && request.method === "PUT") {
    const id = decodeURIComponent(questionMatch[1]);
    const body = JSON.parse(await readBody(request));
    const found = loadQuestions().find((question) => question.id === id);
    if (!found) return sendJson(response, 404, { error: `Question not found: ${id}` });

    const nextValue = { ...body };
    delete nextValue._file;
    delete nextValue._line;
    rewriteJsonlLine(found._file, found._line, nextValue);
    return sendJson(response, 200, { ok: true, id, file: found._file });
  }

  if (request.method === "POST" && url.pathname === "/api/check") {
    return sendJson(response, 200, await runMaintenance());
  }

  if (request.method === "POST" && url.pathname === "/api/feedback/import") {
    const body = JSON.parse(await readBody(request));
    const entries = feedbackEntries(body);
    if (entries.length === 0) throw new Error("No feedback entries found.");

    const byId = new Map(loadQuestions().map((question) => [question.id, question]));
    const updated = [];
    const missing = [];

    for (const entry of entries) {
      const question = byId.get(entry.id);
      if (!question) {
        missing.push(entry.id);
        continue;
      }
      const nextValue = { ...question };
      delete nextValue._file;
      delete nextValue._line;
      const existing = nextValue.feedback || {};
      nextValue.feedback = {
        answered_count: Number(existing.answered_count || 0) + entry.answered_count,
        correct_count: Number(existing.correct_count || 0) + entry.correct_count
      };
      rewriteJsonlLine(question._file, question._line, nextValue);
      updated.push({
        id: question.id,
        answered_count: nextValue.feedback.answered_count,
        correct_count: nextValue.feedback.correct_count
      });
    }

    return sendJson(response, 200, {
      ok: true,
      updated_count: updated.length,
      missing_count: missing.length,
      updated,
      missing
    });
  }

  return sendJson(response, 404, { error: "API route not found." });
}

function serveStatic(response, url) {
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  let root = adminRoot;

  if (pathname === "/media" || pathname === "/media/") {
    root = adminRoot;
    pathname = "/media/";
  } else if (pathname.startsWith("/media/")) {
    root = repoRoot;
    pathname = pathname.slice(1);
  } else if (pathname.startsWith("/docs/")) {
    root = repoRoot;
    pathname = pathname.slice(1);
  } else if (pathname.startsWith("/exports/")) {
    root = exportsRoot;
    pathname = pathname.replace(/^\/exports\//, "");
  }

  let file = safeJoin(root, pathname.replace(/^\//, ""));
  if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return sendText(response, 404, "Not found");

  response.writeHead(200, { "Content-Type": contentTypes[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
    } else {
      serveStatic(response, url);
    }
  } catch (error) {
    sendJson(response, 500, { error: error.message, stack: error.stack });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Wan Ti Wang Admin UI: http://127.0.0.1:${port}`);
});
