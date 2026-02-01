#!/usr/bin/env node
import path from "node:path";
import { buildSite } from "../lib/pipeline.js";

function parseArgs(argv: string[]): { inputDir: string; outDir: string; runEval: boolean } {
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

  return { inputDir, outDir, runEval };
}

function printHelp(): void {
  process.stdout.write(
    [
      "Write for Humans + AIs",
      "",
      "Usage:",
      "  wfha --input <dir> --out <dir> [--no-eval]",
      "",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const { inputDir, outDir, runEval } = parseArgs(args);
  const resolvedInput = path.resolve(process.cwd(), inputDir);
  const resolvedOut = path.resolve(process.cwd(), outDir);

  await buildSite({ inputDir: resolvedInput, outDir: resolvedOut, runEval });
  process.stdout.write(`Build complete: ${resolvedOut}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
