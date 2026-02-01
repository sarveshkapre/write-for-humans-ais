import { unified } from "unified";
import type { Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import { visit } from "unist-util-visit";
import type { Root as MdastRoot } from "mdast";
import type { Root as HastRoot } from "hast";
import { applyStableAnchors } from "./anchors.js";

function stripUnsafeHtml(tree: HastRoot): void {
  const removableTags = new Set(["script", "style", "noscript"]);
  visit(tree, "element", (node, index, parent) => {
    if (!parent || typeof index !== "number") return;
    if (removableTags.has(node.tagName)) {
      parent.children.splice(index, 1);
      return index;
    }
    return undefined;
  });
}

export async function toMarkdownFromHtml(html: string): Promise<MdastRoot> {
  const processor = unified()
    .use(rehypeParse, { fragment: false })
    .use(() => (tree: HastRoot) => {
      stripUnsafeHtml(tree);
    })
    .use(rehypeRemark);

  const hastTree = processor.parse(html) as HastRoot;
  const mdastTree = (await processor.run(hastTree)) as MdastRoot;
  return mdastTree;
}

export async function toMarkdownFromMd(md: string): Promise<MdastRoot> {
  const processor = unified().use(remarkParse);
  return processor.parse(md) as MdastRoot;
}

export async function renderMarkdown(tree: MdastRoot): Promise<string> {
  applyStableAnchors(tree);
  const remarkStringifyPlugin = remarkStringify as unknown as Plugin<[], MdastRoot, string>;
  const processor = unified().use(remarkStringifyPlugin);
  const settings: Record<string, unknown> = {
    bullet: "-",
    fences: true,
    fence: "`",
    listItemIndent: "one",
    allowDangerousHtml: true,
  };
  processor.data("settings", settings);
  const output = processor.stringify(tree as Parameters<typeof processor.stringify>[0]);
  return String(output).trim() + "\n";
}
