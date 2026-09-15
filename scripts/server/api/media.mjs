import fs from "node:fs";
import path from "node:path";
import { normalizeSlug, repoRoot } from "../../lib.mjs";
import { appendMediaMeta, loadMedia, mediaDirectory, nextMediaId } from "../../media-store.mjs";

export function listMedia() {
  const media = loadMedia();
  return { total: media.length, media };
}

export function createMedia(body) {
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

  return { ok: true, media: appendMediaMeta(item) };
}
