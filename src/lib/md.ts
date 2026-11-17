import { marked } from 'marked';

marked.use({ gfm: true, breaks: false });

const external = (html: string) =>
  html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');

/** Inline markdown (links, bold, italic) → HTML, no wrapping <p>. */
export const inline = (src?: string | null) => (src ? external(marked.parseInline(src) as string) : '');

/** Block markdown (paragraphs, lists) → HTML. */
export const block = (src?: string | null) => (src ? external(marked.parse(src) as string) : '');

/** Split text into paragraphs on blank lines, each rendered as inline markdown. */
export const paragraphs = (src?: string | null) =>
  (src ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => inline(p.replace(/\n/g, ' ')));
