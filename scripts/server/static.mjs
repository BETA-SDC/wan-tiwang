import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "../lib.mjs";
import { sendText } from "./http.mjs";

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

function safeJoin(root, urlPath) {
  const joined = path.normalize(path.join(root, decodeURIComponent(urlPath)));
  if (joined !== root && !joined.startsWith(`${root}${path.sep}`)) return null;
  return joined;
}

export function createStaticHandler({ adminRoot, exportsRoot }) {
  return function serveStatic(response, url) {
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
  };
}
