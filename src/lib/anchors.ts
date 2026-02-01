import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Html, Root } from "mdast";

export function applyStableAnchors(tree: Root): void {
  const slugger = new GithubSlugger();

  visit(tree, "heading", (node, index, parent) => {
    if (!parent || typeof index !== "number") return;
    const text = toString(node);
    if (!text.trim()) return;
    const slug = slugger.slug(text);
    const anchorNode: Html = {
      type: "html",
      value: `<a id="${slug}"></a>`,
    };
    parent.children.splice(index, 0, anchorNode);
    return index + 2;
  });
}
