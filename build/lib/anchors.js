import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
export function applyStableAnchors(tree) {
    const slugger = new GithubSlugger();
    visit(tree, "heading", (node, index, parent) => {
        if (!parent || typeof index !== "number")
            return;
        const text = toString(node);
        if (!text.trim())
            return;
        const slug = slugger.slug(text);
        const anchorNode = {
            type: "html",
            value: `<a id="${slug}"></a>`,
        };
        parent.children.splice(index, 0, anchorNode);
        return index + 2;
    });
}
