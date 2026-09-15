import { requestJson } from "./api.js";

let bootstrapPromise;

export function loadBootstrap() {
  bootstrapPromise ||= requestJson("/api/bootstrap");
  return bootstrapPromise;
}
