import { loadMedia, saveUploadedMedia } from "../../media-store.mjs";

export function listMedia() {
  const media = loadMedia();
  return { total: media.length, media };
}

export function createMedia(body) {
  return { ok: true, media: saveUploadedMedia(body) };
}
