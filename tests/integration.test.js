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
  assert.ok(Object.prototype.hasOwnProperty.call(JSON.parse(manifest), "build.fingerprint"));
  assert.equal(JSON.parse(report).totalQuestions, 1);
});

test("produces a deterministic build fingerprint for identical inputs", async () => {
  const outDirA = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-a-"));
  const outDirB = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-b-"));

  await buildSite({ inputDir: fixtureDir, outDir: outDirA, runEval: true });
  await buildSite({ inputDir: fixtureDir, outDir: outDirB, runEval: true });

  const fpA = await fs.readFile(path.join(outDirA, "build.fingerprint"), "utf-8");
  const fpB = await fs.readFile(path.join(outDirB, "build.fingerprint"), "utf-8");
  assert.equal(fpA, fpB);
});
