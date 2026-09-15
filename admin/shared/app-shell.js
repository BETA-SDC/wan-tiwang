import { loadBootstrap } from "./bootstrap.js";

const routes = [
  ["home", "Home", "/", "任务总览"],
  ["library", "Question Library", "/questions/", "搜索、筛选和选择题目"],
  ["editor", "Question Editor", "/editor/", "新建或编辑中英文题目"],
  ["import", "Import Questions", "/import/", "导入 AI 或人工整理的题目草稿"],
  ["slides", "Slide Generator", "/slides/", "组装并导出演示文件"],
  ["media", "Media Library", "/media/", "管理本地媒体元数据"],
  ["settings", "Settings", "/settings/", "查看分类和受控词表"],
  ["maintenance", "Maintenance", "/maintenance/", "检查数据并重建索引"]
];

function createLink(label, href, active = false) {
  const link = document.createElement("a");
  link.className = "navItem navLink";
  link.href = href;
  link.textContent = label;
  link.classList.toggle("active", active);
  return link;
}

function createStat(label, value) {
  const node = document.createElement("div");
  node.className = "stat";
  const strong = document.createElement("strong");
  strong.textContent = value;
  const text = document.createElement("span");
  text.textContent = label;
  node.append(strong, text);
  return node;
}

export function mountAppShell() {
  const body = document.body;
  const page = body.dataset.page || "home";
  const title = body.dataset.title || routes.find(([id]) => id === page)?.[1] || "Wan Ti Wang";
  const subtitle = body.dataset.subtitle || routes.find(([id]) => id === page)?.[3] || "";
  const backHref = body.dataset.back || "/";
  const backLabel = body.dataset.backLabel || "Back to Home";
  const content = document.querySelector("#pageContent");
  const actions = document.querySelector("#pageActions");
  if (!content) throw new Error("Missing #pageContent.");

  const shell = document.createElement("main");
  shell.className = "appShell";

  const nav = document.createElement("aside");
  nav.className = "appNav";
  const brand = document.createElement("div");
  brand.className = "brandBlock";
  const brandTitle = document.createElement("h1");
  brandTitle.textContent = "Wan Ti Wang";
  const brandSubtitle = document.createElement("p");
  brandSubtitle.textContent = "万题王本地管理台";
  brand.append(brandTitle, brandSubtitle);

  const navStack = document.createElement("nav");
  navStack.className = "navStack";
  navStack.setAttribute("aria-label", "Main navigation");
  for (const [id, label, href] of routes) navStack.append(createLink(label, href, id === page));

  const statusPanel = document.createElement("section");
  statusPanel.className = "navPanel";
  const statusTitle = document.createElement("h2");
  statusTitle.textContent = "Bank Status";
  const stats = document.createElement("div");
  stats.id = "stats";
  stats.className = "stats";
  statusPanel.append(statusTitle, stats);

  const selectionPanel = document.createElement("section");
  selectionPanel.className = "navPanel selectionPanel";
  const selectionTitle = document.createElement("h2");
  selectionTitle.textContent = "Slide Selection";
  const selectionSummary = document.createElement("p");
  selectionSummary.id = "selectionSummary";
  const selectionLink = createLink("Open Generator", "/slides/");
  selectionLink.className = "buttonLink";
  const clearButton = document.createElement("button");
  clearButton.id = "clearSlideSelectionButton";
  clearButton.type = "button";
  clearButton.textContent = "Clear Selection";
  selectionPanel.append(selectionTitle, selectionSummary, selectionLink, clearButton);

  nav.append(brand, navStack, statusPanel, selectionPanel);

  const workspace = document.createElement("section");
  workspace.className = "workspace";
  const header = document.createElement("header");
  header.className = "workspaceHeader";
  const heading = document.createElement("div");
  const headingTitle = document.createElement("h2");
  headingTitle.textContent = title;
  const headingSubtitle = document.createElement("p");
  headingSubtitle.textContent = subtitle;
  const breadcrumb = document.createElement("small");
  breadcrumb.className = "breadcrumb";
  breadcrumb.textContent = page === "home" ? "Home" : `Home / ${title}`;
  heading.append(headingTitle, headingSubtitle, breadcrumb);

  const headerActions = document.createElement("div");
  headerActions.className = "actions";
  if (page !== "home") {
    const back = document.createElement("a");
    back.className = "buttonLink backLink";
    back.href = backHref;
    back.textContent = backLabel;
    headerActions.append(back);
  }
  if (actions) headerActions.append(...actions.childNodes);
  header.append(heading, headerActions);
  workspace.append(header, content);
  shell.append(nav, workspace);
  body.replaceChildren(shell);

  clearButton.addEventListener("click", () => {
    localStorage.removeItem("wtw:selectedSlideIds");
    document.dispatchEvent(new CustomEvent("wtw:selection-cleared"));
  });

  loadBootstrap().then((data) => {
    const bankStats = data.stats || {};
    stats.append(
      createStat("Questions", bankStats.total ?? 0),
      createStat("Media", bankStats.with_media ?? 0),
      createStat("Published", bankStats.by_status?.published ?? 0),
      createStat("Draft", bankStats.by_status?.draft ?? 0)
    );
  }).catch(() => {
    stats.append(createStat("Status", "Offline"));
  });

  const selected = JSON.parse(localStorage.getItem("wtw:selectedSlideIds") || "[]");
  selectionSummary.textContent = `${selected.length} selected for slides.`;
  document.addEventListener("wtw:selection-changed", (event) => {
    selectionSummary.textContent = `${event.detail.count} selected for slides.`;
  });
}
