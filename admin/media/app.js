import { requestJson } from "../shared/api.js";
import { mountAppShell } from "../shared/app-shell.js";

const list = document.querySelector("#mediaList");
const count = document.querySelector("#mediaCount");

function render(items) {
  count.textContent = `${items.length} media item(s)`;
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "emptyState";
    empty.textContent = "No media metadata yet. 暂无媒体元数据。";
    list.append(empty);
    return;
  }
  for (const item of items) {
    const node = document.createElement("article");
    node.className = "mediaItem";
    const title = document.createElement("strong");
    title.textContent = item.id;
    const type = document.createElement("span");
    type.textContent = `${item.type} · ${item.status}`;
    const path = document.createElement("code");
    path.textContent = item.path;
    const source = document.createElement("span");
    source.textContent = `${item._file}:${item._line}`;
    node.append(title, type, path, source);
    list.append(node);
  }
}

async function init() {
  mountAppShell();
  render((await requestJson("/api/media")).media);
}

init().catch((error) => {
  document.querySelector("#pageContent").innerHTML = `<pre class="error">${error.stack || error.message}</pre>`;
});
