import fs from "node:fs";
import path from "node:path";

export const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);

export function walkFiles(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
    } else if (!predicate || predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

export function readJsonl(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const items = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      items.push({ value: JSON.parse(trimmed), line: index + 1 });
    } catch (error) {
      throw new Error(`${filePath}:${index + 1} contains invalid JSON: ${error.message}`);
    }
  });

  return items;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function relativePath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
