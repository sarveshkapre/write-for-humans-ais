import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import { visit } from "unist-util-visit";
import { applyStableAnchors } from "./anchors.js";
function stripUnsafeHtml(tree) {
    const removableTags = new Set(["script", "style", "noscript"]);
    visit(tree, "element", (node, index, parent) => {
        if (!parent || typeof index !== "number")
            return;
        if (removableTags.has(node.tagName)) {
            parent.children.splice(index, 1);
            return index;
        }
        return undefined;
    });
}
export async function toMarkdownFromHtml(html) {
    const processor = unified()
        .use(rehypeParse, { fragment: false })
        .use(() => (tree) => {
        stripUnsafeHtml(tree);
    })
        .use(rehypeRemark);
    const hastTree = processor.parse(html);
    const mdastTree = (await processor.run(hastTree));
    return mdastTree;
}
export async function toMarkdownFromMd(md) {
    const processor = unified().use(remarkParse);
    return processor.parse(md);
}
export async function renderMarkdown(tree) {
    applyStableAnchors(tree);
    const remarkStringifyPlugin = remarkStringify;
    const processor = unified().use(remarkStringifyPlugin);
    const settings = {
        bullet: "-",
        fences: true,
        fence: "`",
        listItemIndent: "one",
        allowDangerousHtml: true,
    };
    processor.data("settings", settings);
    const output = processor.stringify(tree);
    return String(output).trim() + "\n";
}
