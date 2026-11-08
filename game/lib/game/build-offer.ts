// A build the Mind offers, 2026-10-28. Asked what to build, the Mind ends its answer with one line naming the build it
// advises, and the chat draws that build's card under its words, as it draws the send card. Only the Will's tap queues
// it. A name that isn't a build draws no card. Kept apart from plan.ts, so the eval scripts can read it in Node.

/** The line the Mind ends a build offer with: its name, and the place in our queue it advises, 1 for first, after a
 *  bar. With no place, it goes last. A build already queued moves to that place. 2026-11-08. */
const LINE = /\n*\[\[build ([^\]\n|]+?)(?:\s*\|\s*(\d+))?\s*\]\]\s*$/;

/** A build's name as the Mind may write it: any case, with or without "the". */
export const plainBuild = (s: string) => s.toLowerCase().replace(/^the\s+/, "").replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

/** A Mind's answer split into its words and, if it ends with one, the name of the build it offers. A line still
 *  streaming in is hidden. */
export function readBuildOffer(text: string): { words: string; name: string | null; place?: number } {
  const m = text.match(LINE);
  if (!m) return { words: text.replace(/\n*\[\[b(u(i(l(d[^\]]*)?)?)?)?\]?$/, ""), name: null };
  return { words: text.slice(0, m.index).trimEnd(), name: m[1].trim(), ...(m[2] && { place: Number(m[2]) }) };
}
