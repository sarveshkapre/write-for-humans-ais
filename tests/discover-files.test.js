import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { discoverFiles } from "../build/lib/fs.js";

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}

test("discoverFiles ignores node_modules/build/dist/.git by default", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-discover-"));
  await writeFile(path.join(root, "index.md"), "# Hello\n");
  await writeFile(path.join(root, "node_modules", "dep", "readme.md"), "# Should be ignored\n");
  await writeFile(path.join(root, "build", "out.md"), "# Should be ignored\n");
  await writeFile(path.join(root, "dist", "out.md"), "# Should be ignored\n");
  await writeFile(path.join(root, ".git", "HEAD"), "ref: refs/heads/main\n");

  const files = await discoverFiles(root);
  assert.deepEqual(files.map((f) => path.relative(root, f).replace(/\\\\/g, "/")), ["index.md"]);
});

test("discoverFiles can include ignored dirs with noIgnore", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-discover-"));
  await writeFile(path.join(root, "index.md"), "# Hello\n");
  await writeFile(path.join(root, "node_modules", "dep", "readme.md"), "# Included\n");

  const files = await discoverFiles(root, { noIgnore: true });
  const rels = files.map((f) => path.relative(root, f).replace(/\\\\/g, "/")).sort();
  assert.deepEqual(rels, ["index.md", "node_modules/dep/readme.md"]);
});

