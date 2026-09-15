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

export function createApiHandler({ maxRequestBytes }) {
  return async function handleApi(request, response, url) {
    if (request.method === "GET" && url.pathname === "/api/bootstrap") {
      return sendJson(response, 200, bootstrapData());
    }

    if (request.method === "GET" && url.pathname === "/api/questions") {
      return sendJson(response, 200, listQuestions(url));
    }

    if (request.method === "GET" && url.pathname === "/api/media") {
      return sendJson(response, 200, listMedia());
    }

    if (request.method === "POST" && url.pathname === "/api/questions/import") {
      return sendResult(response, importQuestions(await readJsonBody(request, maxRequestBytes), url));
    }

    const questionMatch = url.pathname.match(/^\/api\/questions\/([^/]+)$/);
    if (questionMatch && request.method === "GET") {
      return sendResult(response, getQuestion(decodeURIComponent(questionMatch[1])));
    }

    if (request.method === "POST" && url.pathname === "/api/slides/export") {
      return sendJson(response, 201, exportSlides(await readJsonBody(request, maxRequestBytes)));
    }

    if (request.method === "POST" && url.pathname === "/api/media") {
      return sendJson(response, 201, createMedia(await readJsonBody(request, maxRequestBytes)));
    }

    if (request.method === "POST" && url.pathname === "/api/questions") {
      return sendJson(response, 201, createQuestionRecord(await readJsonBody(request, maxRequestBytes)));
    }

    if (questionMatch && request.method === "PUT") {
      return sendResult(response, updateQuestionRecord(
        decodeURIComponent(questionMatch[1]),
        await readJsonBody(request, maxRequestBytes)
      ));
    }

    if (request.method === "POST" && url.pathname === "/api/check") {
      return sendJson(response, 200, await runMaintenance());
    }

    if (request.method === "POST" && url.pathname === "/api/feedback/import") {
      return sendJson(response, 200, importFeedback(await readJsonBody(request, maxRequestBytes)));
    }

    return sendJson(response, 404, { error: "API route not found." });
  };
}
