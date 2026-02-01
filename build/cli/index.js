#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSite } from "../lib/pipeline.js";
import { UserError } from "../lib/errors.js";
async function readVersion() {
    try {
        const here = path.dirname(fileURLToPath(import.meta.url));
        const pkgPath = path.resolve(here, "../../package.json");
        const raw = await fs.readFile(pkgPath, "utf-8");
        const pkg = JSON.parse(raw);
        return typeof pkg.version === "string" ? pkg.version : null;
    }
    catch {
        return null;
    }
}
function parseArgs(argv) {
    const args = new Map();
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith("--"))
            continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
            args.set(key, next);
            i += 1;
        }
        else {
            args.set(key, true);
        }
    }
    const inputDir = String(args.get("input") ?? ".");
    const outDir = String(args.get("out") ?? "dist");
    const runEval = !args.has("no-eval");
    const force = Boolean(args.get("force"));
    const timestamps = Boolean(args.get("timestamps"));
    const noIgnore = Boolean(args.get("no-ignore"));
    const followSymlinks = Boolean(args.get("follow-symlinks"));
    return { inputDir, outDir, runEval, force, timestamps, noIgnore, followSymlinks };
}
async function printHelp() {
    const version = await readVersion();
    process.stdout.write([
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
        "  --follow-symlinks  Traverse symlinked directories during discovery",
        "  --version, -v   Print version and exit",
        "  --help, -h      Print help and exit",
        "",
        "Notes:",
        "  - The output directory must be outside the input directory.",
        "",
    ].join("\n"));
}
async function main() {
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
    const { inputDir, outDir, runEval, force, timestamps, noIgnore, followSymlinks } = parseArgs(args);
    const resolvedInput = path.resolve(process.cwd(), inputDir);
    const resolvedOut = path.resolve(process.cwd(), outDir);
    const summary = await buildSite({
        inputDir: resolvedInput,
        outDir: resolvedOut,
        runEval,
        safetyRoot: process.cwd(),
        force,
        generatedAt: timestamps ? new Date().toISOString() : undefined,
        noIgnore,
        followSymlinks,
    });
    const lines = [
        `Build complete: ${resolvedOut}`,
        `Pages: ${summary.pages}`,
        `Eval: ${summary.evalEnabled ? "on" : "off"}`,
        `Outputs (${summary.outputs.length}):`,
        ...summary.outputs.map((output) => `- ${output}`),
    ];
    process.stdout.write(`${lines.join("\n")}\n`);
}
main().catch((error) => {
    if (error instanceof UserError) {
        console.error(error.message);
        process.exit(1);
    }
    console.error(error);
    process.exit(1);
});
