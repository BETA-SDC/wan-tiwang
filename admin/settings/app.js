import { requestJson } from "../shared/api.js";
import { startPage } from "../shared/page.js";

function renderList(target, items) {
  target.replaceChildren();
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "taxonomyItem";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const id = document.createElement("code");
    id.textContent = item.id;
    row.append(name, id);
    target.append(row);
  }
}

async function init() {
  const data = await requestJson("/api/bootstrap");
  const categoryTree = document.querySelector("#categoryTree");
  categoryTree.replaceChildren();
  for (const category of data.categories) {
    const row = document.createElement("div");
    row.className = `taxonomyItem${category.parent ? " taxonomyChild" : ""}`;
    const name = document.createElement("strong");
    name.textContent = category.name;
    const id = document.createElement("code");
    id.textContent = category.id;
    row.append(name, id);
    categoryTree.append(row);
  }
  renderList(document.querySelector("#formatList"), data.formats);
  renderList(document.querySelector("#difficultyList"), data.difficulties);
  renderList(document.querySelector("#moodList"), data.moods);
  renderList(document.querySelector("#occasionList"), data.occasions);
}

startPage(init);
