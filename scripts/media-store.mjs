import fs from "node:fs";
import path from "node:path";
import { mediaMetaRoot, readJsonl, relativePath, walkFiles } from "./lib.mjs";

export function loadMedia() {
  const mediaFiles = walkFiles(mediaMetaRoot, (file) => file.endsWith(".jsonl"));
  const media = [];

  for (const file of mediaFiles) {
    for (const { value, line } of readJsonl(file)) {
      media.push({ ...value, _file: relativePath(file), _line: line });
    }
  }

  return media.sort((a, b) => a.id.localeCompare(b.id));
}

export function nextMediaId(type, slug, media = loadMedia()) {
  const prefixByType = { image: "img", audio: "aud", video: "vid", thumbnail: "thumb" };
  const prefix = `${prefixByType[type]}-${slug || type}`;
  let max = 0;

  for (const item of media) {
    if (!item.id?.startsWith(`${prefix}-`)) continue;
    const suffix = item.id.slice(prefix.length + 1);
    if (/^[0-9]{3}$/.test(suffix)) max = Math.max(max, Number(suffix));
  }

  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function mediaDirectory(type) {
  if (type === "image" || type === "thumbnail") return "images";
  if (type === "audio") return "audio";
  if (type === "video") return "video";
  throw new Error(`Unsupported media type: ${type}`);
}

export function mediaMetaFile(type) {
  if (type === "image" || type === "thumbnail") return "images.jsonl";
  if (type === "audio") return "audio.jsonl";
  if (type === "video") return "video.jsonl";
  throw new Error(`Unsupported media type: ${type}`);
}

export function appendMediaMeta(item) {
  const metaFile = path.join(mediaMetaRoot, mediaMetaFile(item.type));
  fs.mkdirSync(path.dirname(metaFile), { recursive: true });
  fs.appendFileSync(metaFile, `${JSON.stringify(item)}\n`);
  return item;
}
