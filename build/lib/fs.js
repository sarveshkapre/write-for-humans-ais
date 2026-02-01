import fs from "node:fs/promises";
import path from "node:path";
const allowedExtensions = new Set([".md", ".markdown", ".html", ".htm"]);
export async function discoverFiles(rootDir) {
    const results = [];
    async function walk(current) {
        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            const resolved = path.resolve(fullPath);
            if (!resolved.startsWith(path.resolve(rootDir))) {
                continue;
            }
            if (entry.isDirectory()) {
                await walk(fullPath);
                continue;
            }
            const ext = path.extname(entry.name).toLowerCase();
            if (allowedExtensions.has(ext)) {
                results.push(fullPath);
            }
        }
    }
    await walk(rootDir);
    return results.sort();
}
export async function ensureEmptyDir(dirPath) {
    await fs.rm(dirPath, { recursive: true, force: true });
    await fs.mkdir(dirPath, { recursive: true });
}
