import { sendJson, readJsonBody } from "../http.mjs";
import { runMaintenance } from "../maintenance.mjs";
import { bootstrapData } from "./bootstrap.mjs";
import { importFeedback } from "./feedback.mjs";
import { createMedia, listMedia } from "./media.mjs";
import { createQuestionRecord, getQuestion, importQuestions, listQuestions, updateQuestionRecord } from "./questions.mjs";
import { exportSlides } from "./slides.mjs";

function sendResult(response, result, fallbackStatus = 200) {
  if (result && typeof result === "object" && "status" in result && "body" in result) {
    return sendJson(response, result.status, result.body);
  }
  return sendJson(response, fallbackStatus, result);
}

function route(method, path, handler, status) {
  return { method, path, handler, status };
}

const routes = [
  route("GET", "/api/bootstrap", () => bootstrapData()),
  route("GET", "/api/questions", ({ url }) => listQuestions(url)),
  route("GET", "/api/media", () => listMedia()),
  route("POST", "/api/questions/import", ({ body, url }) => importQuestions(body, url)),
  route("GET", /^\/api\/questions\/([^/]+)$/, ({ params }) => getQuestion(decodeURIComponent(params[1]))),
  route("POST", "/api/slides/export", ({ body }) => exportSlides(body)),
  route("POST", "/api/media", ({ body }) => createMedia(body)),
  route("POST", "/api/questions", ({ body }) => createQuestionRecord(body)),
  route("PUT", /^\/api\/questions\/([^/]+)$/, ({ body, params }) => updateQuestionRecord(
    decodeURIComponent(params[1]),
    body
  )),
  route("POST", "/api/check", () => runMaintenance(), 200),
  route("POST", "/api/feedback/import", ({ body }) => importFeedback(body), 200)
];

function matchRoute(request, url) {
  return routes.find((item) => {
    if (item.method !== request.method) return false;
    return typeof item.path === "string" ? item.path === url.pathname : item.path.test(url.pathname);
  });
}

export function createApiHandler({ maxRequestBytes }) {
  return async function handleApi(request, response, url) {
    const selected = matchRoute(request, url);
    if (!selected) return sendJson(response, 404, { error: "API route not found." });

    const params = typeof selected.path === "string" ? [] : url.pathname.match(selected.path);
    const body = ["POST", "PUT", "PATCH"].includes(request.method)
      ? await readJsonBody(request, maxRequestBytes)
      : undefined;
    const result = await selected.handler({ body, params, request, response, url });
    const status = selected.status ?? (selected.method === "POST" ? 201 : 200);
    return sendResult(response, result, status);
  };
}
