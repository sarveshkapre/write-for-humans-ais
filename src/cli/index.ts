#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSite } from "../lib/pipeline.js";
import { UserError } from "../lib/errors.js";

async function readVersion(): Promise<string | null> {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(here, "../../package.json");
    const raw = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as { version?: unknown };
    return typeof pkg.version === "string" ? pkg.version : null;
  } catch {
    return null;
  }
}

function parseArgs(argv: string[]): {
  inputDir: string;
  outDir: string;
  runEval: boolean;
  force: boolean;
  timestamps: boolean;
  noIgnore: boolean;
} {
  const args = new Map<string, string | boolean>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, true);
    }
  }

  const inputDir = String(args.get("input") ?? ".");
  const outDir = String(args.get("out") ?? "dist");
  const runEval = !args.has("no-eval");
  const force = Boolean(args.get("force"));
  const timestamps = Boolean(args.get("timestamps"));
  const noIgnore = Boolean(args.get("no-ignore"));

  return { inputDir, outDir, runEval, force, timestamps, noIgnore };
}

async function printHelp(): Promise<void> {
  const version = await readVersion();
  process.stdout.write(
    [
      `Write for Humans + AIs${version ? ` v${version}` : ""}`,
      "",
      "Usage:",
      "  wfha --input <dir> --out <dir> [--no-eval] [--force]",
      "",
      "Options:",
      "  --input <dir>   Input directory (default: .)",
      "  --out <dir>     Output directory (default: dist)",
      "  --no-eval       Skip eval report generation",
      "  --force         Allow deleting out dir outside cwd (dangerous)",
      "  --timestamps    Include wall-clock timestamps in outputs (non-deterministic)",
      "  --no-ignore     Do not ignore common dirs (node_modules/build/dist/.git)",
      "  --version, -v   Print version and exit",
      "  --help, -h      Print help and exit",
      "",
      "Notes:",
      "  - The output directory must be outside the input directory.",
      "",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--version") || args.includes("-v")) {
    const version = await readVersion();
    process.stdout.write(`${version ?? "unknown"}\n`);
    return;
  }
  if (args.includes("--help") || args.includes("-h")) {
    await printHelp();
    return;
  }

  const { inputDir, outDir, runEval, force, timestamps, noIgnore } = parseArgs(args);
  const resolvedInput = path.resolve(process.cwd(), inputDir);
  const resolvedOut = path.resolve(process.cwd(), outDir);

  await buildSite({
    inputDir: resolvedInput,
    outDir: resolvedOut,
    runEval,
    safetyRoot: process.cwd(),
    force,
    generatedAt: timestamps ? new Date().toISOString() : undefined,
    noIgnore,
  });
  process.stdout.write(`Build complete: ${resolvedOut}\n`);
}

main().catch((error: unknown) => {
  if (error instanceof UserError) {
    console.error(error.message);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
