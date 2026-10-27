// The design docs at the repo root, rendered for the about pages as the client is built. vite.config.ts reads them
// from disk, never copied, so the pages say what the docs say. A page imports HOLOS_*.md?doc for the doc rendered, or
// ?stats for its counts.
import { Marked, type Token, type Tokens } from "marked";

/** The docs published at /about, by file. A link to any other file in the repo is private, so it shows as text. */
export const DOCS = {
  "HOLOS_RESEARCH.md": "/about/research",
  "HOLOS_GAME_CONCEPT.md": "/about/design",
} as const;

type Doc = keyof typeof DOCS;

export interface Rendered {
  /** The doc's title, its h1, which the page draws itself. */
  title: string;
  /** Its h2s, for the contents. */
  toc: { id: string; text: string }[];
  html: string;
}

const plain = (tokens: Token[]): string =>
  tokens.map((t) => ("tokens" in t && t.tokens ? plain(t.tokens) : "text" in t ? t.text : "")).join("");

/** GitHub's heading ids, so the docs' own anchors land. A repeated heading gets -1, -2. */
function slugger() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const slug = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
      .replace(/ /g, "-");
    const n = seen.get(slug);
    seen.set(slug, (n ?? -1) + 1);
    return n === undefined ? slug : `${slug}-${n + 1}`;
  };
}

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const marked = new Marked({
  gfm: true,
  renderer: {
    heading(token) {
      const { depth, id } = token as Tokens.Heading & { id: string };
      return `<h${depth} id="${id}"><a href="#${id}">${this.parser.parseInline(token.tokens)}</a></h${depth}>\n`;
    },
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (/^https?:/.test(href)) return `<a href="${attr(href)}" target="_blank" rel="noreferrer">${text}</a>`;
      if (href.startsWith("#")) return `<a href="${attr(href)}">${text}</a>`;
      const [file, hash] = href.split("#");
      const page = DOCS[file as Doc];
      if (page) return `<a href="${page}${hash ? `#${attr(hash)}` : ""}">${text}</a>`;
      return `<span class="private">${text}</span>`;
    },
  },
});

export function renderDoc(markdown: string): Rendered {
  const tokens = marked.lexer(markdown);
  const slug = slugger();
  let title = "";
  const toc: Rendered["toc"] = [];
  marked.walkTokens(tokens, (t) => {
    if (t.type !== "heading") return;
    const text = plain(t.tokens ?? []);
    const id = slug(text);
    (t as Tokens.Heading & { id: string }).id = id;
    if (t.depth === 1) title = text;
    if (t.depth === 2) toc.push({ id, text });
  });
  // The page draws the title, so the doc's own h1 goes.
  const body = tokens.filter((t) => !(t.type === "heading" && t.depth === 1)) as typeof tokens;
  return { title, toc, html: marked.parser(body) };
}

/** A doc's counts: the research log's sources, one top-level entry each, and its h2 sections. */
export const countDoc = (markdown: string) => ({
  sources: markdown.match(/^- \*\*\[/gm)?.length ?? 0,
  sections: markdown.match(/^## /gm)?.length ?? 0,
});
