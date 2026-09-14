import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { readJson, readJsonl, relativePath, repoRoot, walkFiles } from "./lib.mjs";

const port = Number(process.env.PORT ?? 5177);
const adminRoot = path.join(repoRoot, "admin");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
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
  if (!joined.startsWith(root)) return null;
  return joined;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function loadQuestions() {
  const questionFiles = walkFiles(path.join(repoRoot, "questions"), (file) => file.endsWith(".jsonl"));
  const questions = [];

  for (const file of questionFiles) {
    for (const { value, line } of readJsonl(file)) {
      questions.push({ ...value, _file: relativePath(file), _line: line });
    }
  }

  return questions.sort((a, b) => a.id.localeCompare(b.id));
}

function loadMedia() {
  const mediaFiles = walkFiles(path.join(repoRoot, "media-meta"), (file) => file.endsWith(".jsonl"));
  const media = [];

  for (const file of mediaFiles) {
    for (const { value, line } of readJsonl(file)) {
      media.push({ ...value, _file: relativePath(file), _line: line });
    }
  }

  return media.sort((a, b) => a.id.localeCompare(b.id));
}

function localizedText(value) {
  if (!value || typeof value !== "object") return "";
  return `${value["zh-CN"] ?? ""} ${value["en-US"] ?? ""}`;
}

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextQuestionId(categoryId, questions) {
  const prefix = categoryId.replace(/\./g, "-");
  let max = 0;

  for (const question of questions) {
    if (!question.id?.startsWith(`${prefix}-`)) continue;
    const suffix = question.id.slice(prefix.length + 1);
    if (/^[0-9]{6}$/.test(suffix)) max = Math.max(max, Number(suffix));
  }

  return `${prefix}-${String(max + 1).padStart(6, "0")}`;
}

function defaultQuestionFile(question) {
  const parts = question.category.split(".");
  return path.join(repoRoot, "questions", ...parts, `${normalizeSlug(question.topic || "mixed")}.jsonl`);
}

function rewriteJsonlLine(relativeFile, line, nextValue) {
  const file = path.join(repoRoot, relativeFile);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const jsonLineIndexes = [];

  lines.forEach((lineText, index) => {
    if (lineText.trim()) jsonLineIndexes.push(index);
  });

  const physicalIndex = jsonLineIndexes[line - 1];
  if (physicalIndex === undefined) throw new Error(`Cannot find JSONL line ${line} in ${relativeFile}.`);

  lines[physicalIndex] = JSON.stringify(nextValue);
  fs.writeFileSync(file, lines.join("\n").replace(/\n*$/, "\n"));
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
      categories: readJson(path.join(repoRoot, "taxonomy/categories.json")).categories,
      formats: readJson(path.join(repoRoot, "taxonomy/formats.json")).formats,
      moods: readJson(path.join(repoRoot, "taxonomy/moods.json")).moods,
      occasions: readJson(path.join(repoRoot, "taxonomy/occasions.json")).occasions,
      stats: readJson(path.join(repoRoot, "indexes/stats.json"))
    });
  }

  if (request.method === "GET" && url.pathname === "/api/questions") {
    const query = (url.searchParams.get("q") ?? "").toLowerCase();
    const category = url.searchParams.get("category") ?? "";
    const type = url.searchParams.get("type") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const tag = url.searchParams.get("tag") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? 500);
    const questions = loadQuestions().filter((question) => {
      if (category && question.category !== category) return false;
      if (type && question.type !== type) return false;
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

  if (request.method === "POST" && url.pathname === "/api/questions") {
    const body = JSON.parse(await readBody(request));
    const question = { ...body };
    question.id ||= nextQuestionId(question.category, loadQuestions());
    const targetFile = body.targetFile ? path.join(repoRoot, body.targetFile) : defaultQuestionFile(body);
    delete question.topic;
    delete question.targetFile;

    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.appendFileSync(targetFile, `${JSON.stringify(question)}\n`);
    return sendJson(response, 201, { ok: true, id: question.id, file: relativePath(targetFile) });
  }

  const questionMatch = url.pathname.match(/^\/api\/questions\/([^/]+)$/);
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

  return sendJson(response, 404, { error: "API route not found." });
}

function serveStatic(response, url) {
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  let root = adminRoot;

  if (pathname.startsWith("/media/")) {
    root = repoRoot;
    pathname = pathname.slice(1);
  }

  const file = safeJoin(root, pathname.replace(/^\//, ""));
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
