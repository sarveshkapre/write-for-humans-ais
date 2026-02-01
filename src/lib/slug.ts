import path from "node:path";

export function slugFromPath(inputPath: string, baseDir: string): string {
  const relative = path.relative(baseDir, inputPath);
  const noExt = relative.replace(path.extname(relative), "");
  return noExt
    .split(path.sep)
    .filter(Boolean)
    .map((segment) => segment.trim())
    .join("-")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
