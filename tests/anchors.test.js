import test from "node:test";
import assert from "node:assert/strict";
import { toMarkdownFromMd, renderMarkdown } from "../build/lib/markdown.js";

test("inserts deterministic anchors for headings", async () => {
  const tree = await toMarkdownFromMd("# Welcome\n\n## Welcome\n");
  const output = await renderMarkdown(tree);
  assert.ok(output.includes('<a id="welcome"></a>'));
  assert.ok(output.includes('<a id="welcome-1"></a>'));
});
