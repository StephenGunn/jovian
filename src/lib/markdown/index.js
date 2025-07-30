/*
 * This file has been strongly influenced by the Joy Of Code blog by Matt Croak.
 * If you are looking for info on how to use SvelteKit with Markdown,
 * I highly recommend checking out his blog.
 * https://joyofcode.xyz/
 */

import matter from "gray-matter";
import { unified } from "unified";
import toMarkdownAST from "remark-parse";
import toHtmlAST from "remark-rehype";
import toHtmlString from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCodeTitles from "rehype-code-titles";
import rehypeHighlight from "rehype-highlight";
import rehypeHighlightCodeLines from "rehype-highlight-code-lines";
import rehypeShiki from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import {
  rehypeCopyCode,
  rehypeUnwrapImages,
  rehypeDiffHighlight,
  rehypeTableContainer
} from "./plugins.js";

const images = `https://raw.githubusercontent.com/stephengunn/jovian/main/posts`;

const markdownProcessor = unified()
  .use(toMarkdownAST)
  .use([remarkGfm, remarkSmartypants])
  .use(toHtmlAST, { allowDangerousHtml: true })
  .use([rehypeSlug, rehypeAutolinkHeadings])
  .use(rehypeCodeTitles)
  .use(rehypeShiki, {
    theme: "catppuccin-macchiato",
    transformers: [
      transformerMetaHighlight({
        // @ts-ignore
        diffAdd: { color: "#a6da95" }, // Green for additions (from Catppuccin theme)
        diffDelete: { color: "#ed8796" } // Red for deletions (from Catppuccin theme)
      })
    ]
  })
  .use(rehypeHighlight)
  .use(rehypeHighlightCodeLines, {
    showLineNumbers: true
  })
  .use(rehypeDiffHighlight) // Our custom diff highlighter
  .use(rehypeTableContainer) // Add table container wrapper
  .use(rehypeUnwrapImages)
  .use(rehypeCopyCode)
  .use(toHtmlString, { allowDangerousHtml: true });

/**
 * Returns post slug.
 * @param {string} filename
 */
function getSlug(filename) {
  return filename.split("/").at(-1)?.replace(".md", "") ?? "";
}

/**
 * Search and replace Markdown.
 * @param {string} content
 * @param {string} slug
 */
function searchAndReplace(content, slug) {
  const image = /{% img src="(.*?)" alt="(.*?)" %}/g;
  return content.replace(image, (_, src, alt) => {
    return `
      <img
        src="${images}/${slug}/images/${src}"
        alt="${alt}"
        loading="lazy"
      />
  `.trim();
  });
}

/**
 * Markdown preprocessor.
 * @param {string} content
 * @param {string} slug
 */
async function parseMarkdown(content, slug) {
  const replacedContent = searchAndReplace(content, slug);
  const parsedMarkdown = await markdownProcessor.process(replacedContent);
  return parsedMarkdown.toString();
}

/**
 * Replace special Svelte characters.
 * @param {string} content
 */
function escapeHtml(content) {
  content = content.replace(/{/g, "&#123;").replace(/}/g, "&#125;");
  const componentRegex = /<[A-Z].*/g;
  const components = content.match(componentRegex);
  components?.forEach((component) => {
    const replaced = component.replace("&#123;", "{").replace("&#125;", "}");
    content = content.replace(component, replaced);
  });
  return content;
}

/**
 * Exports post metadata.
 * @param {string} content
 */
function frontmatter(content) {
  const { content: markdown, data } = matter(content);
  const meta = `
		<script context="module">
			export const metadata = ${JSON.stringify(data)}
		</script>
	`;
  return { markdown, meta };
}

/**
 * Preprocessor for Markdown files which converts
 * Markdown to HTML before it's compiled by Svelte
 * so we can use Svelte components inside Markdown.
 */
function markdown() {
  return {
    name: "markdown",
    /**
     * Convert Markdown to HTML.
     * @param {Object} params
     * @param {string} params.content
     * @param {string} params.filename
     */
    async markup({ content, filename }) {
      if (filename.endsWith(".md")) {
        const slug = getSlug(filename);
        const { markdown, meta } = frontmatter(content);
        const html = await parseMarkdown(markdown, slug);
        const code = escapeHtml(html);
        return { code: meta + code };
      }
    }
  };
}

export default markdown;
