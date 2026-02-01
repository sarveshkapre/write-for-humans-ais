import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSite } from "../build/lib/pipeline.js";
import { UserError } from "../build/lib/errors.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures", "site");

test("refuses to delete outDir outside safetyRoot unless forced", async () => {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-out-"));
  await assert.rejects(
    () => buildSite({ inputDir: fixtureDir, outDir, runEval: false, safetyRoot: process.cwd(), force: false }),
    (error) => error instanceof UserError && error.message.includes("outside the safety root"),
  );
});

test("allows outDir outside safetyRoot when forced", async () => {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-out-"));
  await buildSite({ inputDir: fixtureDir, outDir, runEval: false, safetyRoot: process.cwd(), force: true });
  const llms = await fs.readFile(path.join(outDir, "llms.txt"), "utf-8");
  assert.ok(llms.includes("# llms.txt"));
});

test("refuses to delete an outDir that contains inputDir", async () => {
  const outDir = path.join(process.cwd(), "tests", "fixtures");
  await assert.rejects(
    () => buildSite({ inputDir: fixtureDir, outDir, runEval: false }),
    (error) => error instanceof UserError && error.message.includes("contains the input directory"),
  );
});

test("refuses to use an outDir inside inputDir", async () => {
  const outDir = path.join(fixtureDir, "dist");
  await assert.rejects(
    () => buildSite({ inputDir: fixtureDir, outDir, runEval: false }),
    (error) => error instanceof UserError && error.message.includes("inside the input directory"),
  );
});

test("refuses to delete the safetyRoot itself unless forced", async () => {
  const inputDir = await fs.mkdtemp(path.join(os.tmpdir(), "wfha-input-"));
  await fs.writeFile(path.join(inputDir, "index.md"), "# Hello\n", "utf-8");
  const outDir = process.cwd();
  await assert.rejects(
    () => buildSite({ inputDir, outDir, runEval: false, safetyRoot: process.cwd(), force: false }),
    (error) => error instanceof UserError && error.message.includes("safety root directory"),
  );
});
