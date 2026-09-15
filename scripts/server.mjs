import http from "node:http";
import path from "node:path";
import { repoRoot } from "./lib.mjs";
import { createApiHandler } from "./server/api/index.mjs";
import { sendJson } from "./server/http.mjs";
import { createStaticHandler } from "./server/static.mjs";

const port = Number(process.env.PORT ?? 5177);
const maxRequestBytes = Number(process.env.MAX_REQUEST_BYTES ?? 200_000_000);
const adminRoot = path.join(repoRoot, "admin");
const exportsRoot = path.join(repoRoot, "exports");

const handleApi = createApiHandler({ maxRequestBytes });
const serveStatic = createStaticHandler({ adminRoot, exportsRoot });

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
    } else {
      serveStatic(response, url);
    }
  } catch (error) {
    sendJson(response, error.status ?? 500, {
      error: error.message,
      ...(error.status ? {} : { stack: error.stack })
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Wan Ti Wang Admin UI: http://127.0.0.1:${port}`);
});
