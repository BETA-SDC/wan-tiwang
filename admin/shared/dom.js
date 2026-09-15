export function byId(id) {
  const node = document.querySelector(`#${id}`);
  if (!node) throw new Error(`Missing #${id}.`);
  return node;
}

export function optionalById(id) {
  return document.querySelector(`#${id}`);
}

export function createOption(value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  return node;
}

export function showPageError(error) {
  const content = document.querySelector("#pageContent");
  if (!content) throw error;
  const pre = document.createElement("pre");
  pre.className = "error";
  pre.textContent = error.stack || error.message;
  content.replaceChildren(pre);
}
