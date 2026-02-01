import fs from "node:fs/promises";
import path from "node:path";
import { UserError } from "./errors.js";

const allowedExtensions = new Set([".md", ".markdown", ".html", ".htm"]);
const defaultIgnoredDirNames = new Set(["node_modules", "build", "dist", ".git"]);

export type DiscoverFilesOptions = {
  noIgnore?: boolean;
  ignoredDirNames?: string[];
};

type EnsureEmptyDirOptions = {
  inputDir?: string;
  safetyRoot?: string;
  force?: boolean;
};

function isPathInside(parentDir: string, candidatePath: string): boolean {
  const parent = path.resolve(parentDir);
  const candidate = path.resolve(candidatePath);
  const rel = path.relative(parent, candidate);
  if (rel === "") return true;
  return !(rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel));
}

function isFsRoot(dirPath: string): boolean {
  const resolved = path.resolve(dirPath);
  return resolved === path.parse(resolved).root;
}

export async function discoverFiles(rootDir: string, options: DiscoverFilesOptions = {}): Promise<string[]> {
  const results: string[] = [];
  const rootResolved = path.resolve(rootDir);
  const ignored = options.noIgnore
    ? new Set<string>()
    : new Set([...(options.ignoredDirNames ?? []), ...defaultIgnoredDirNames]);

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const resolved = path.resolve(fullPath);
      if (!isPathInside(rootResolved, resolved)) {
        continue;
      }
      if (entry.isDirectory()) {
        if (ignored.has(entry.name)) continue;
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

export async function ensureEmptyDir(dirPath: string, options: EnsureEmptyDirOptions = {}): Promise<void> {
  const resolvedOutDir = path.resolve(dirPath);
  if (isFsRoot(resolvedOutDir)) {
    throw new UserError(`Refusing to delete filesystem root: ${resolvedOutDir}`);
  }

  if (options.inputDir) {
    const resolvedInputDir = path.resolve(options.inputDir);
    if (isPathInside(resolvedInputDir, resolvedOutDir)) {
      throw new UserError(
        [
          "Refusing to use an output directory inside the input directory.",
          `out:   ${resolvedOutDir}`,
          `input: ${resolvedInputDir}`,
          "Choose an output directory outside the input directory.",
        ].join("\n"),
      );
    }
    if (isPathInside(resolvedOutDir, resolvedInputDir)) {
      throw new UserError(
        [
          "Refusing to delete an output directory that contains the input directory.",
          `out:   ${resolvedOutDir}`,
          `input: ${resolvedInputDir}`,
          "Choose an output directory outside the input directory.",
        ].join("\n"),
      );
    }
  }

  if (options.safetyRoot) {
    const resolvedSafetyRoot = path.resolve(options.safetyRoot);
    if (!options.force && !isPathInside(resolvedSafetyRoot, resolvedOutDir)) {
      throw new UserError(
        [
          "Refusing to delete an output directory outside the safety root.",
          `out:         ${resolvedOutDir}`,
          `safety root: ${resolvedSafetyRoot}`,
          "Pick an output directory inside the safety root, or pass --force.",
        ].join("\n"),
      );
    }
    if (!options.force && resolvedOutDir === resolvedSafetyRoot) {
      throw new UserError(
        [
          "Refusing to delete the safety root directory.",
          `out:         ${resolvedOutDir}`,
          `safety root: ${resolvedSafetyRoot}`,
          "Pick a subdirectory (e.g. dist/), or pass --force.",
        ].join("\n"),
      );
    }
  }

  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}
