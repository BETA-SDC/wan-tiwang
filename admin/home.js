import { mountAppShell } from "./shared/app-shell.js";

mountAppShell();
document.querySelector("#refreshButton")?.addEventListener("click", () => location.reload());
