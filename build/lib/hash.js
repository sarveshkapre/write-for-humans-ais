import crypto from "node:crypto";
import fs from "node:fs/promises";
export async function sha256File(filePath) {
    const data = await fs.readFile(filePath);
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    return hash;
}
export function sha256String(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}
