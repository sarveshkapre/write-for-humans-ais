import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSite } from "../build/lib/pipeline.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures", "site");

test("builds outputs from a local directory", async () => {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-"));
  await buildSite({ inputDir: fixtureDir, outDir, runEval: true });

  const llms = await fs.readFile(path.join(outDir, "llms.txt"), "utf-8");
  const manifest = await fs.readFile(path.join(outDir, "manifest.json"), "utf-8");
  const report = await fs.readFile(path.join(outDir, "eval", "report.json"), "utf-8");

  assert.ok(llms.includes("llms.txt"));
  assert.ok(Object.prototype.hasOwnProperty.call(JSON.parse(manifest), "llms.txt"));
  assert.equal(JSON.parse(report).totalQuestions, 1);
});
