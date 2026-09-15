import { mountAppShell } from "./app-shell.js";
import { showPageError } from "./dom.js";

export function startPage(init) {
  try {
    mountAppShell();
    Promise.resolve(init()).catch(showPageError);
  } catch (error) {
    showPageError(error);
  }
}
