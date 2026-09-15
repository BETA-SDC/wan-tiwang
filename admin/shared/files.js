function readFile(file, mode) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    if (mode === "dataUrl") reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
}

export function readTextFile(file) {
  return readFile(file, "text");
}

export function readDataUrlFile(file) {
  return readFile(file, "dataUrl");
}
