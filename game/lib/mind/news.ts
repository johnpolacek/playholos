// What the Mind tells us unasked starts so, as a turn of ours that the talk hides. worker/mind.ts tells the Mind what
// it means. 2026-10-31.
export const NEWS = "News from Earth: ";

/** A piece of news: when it landed, what it says, and how much it matters, 0 most. */
export interface NewsItem {
  at: number;
  say: string;
  rank: number;
}

/** The news told at once, as after a night away or a skip: the `most` that matter most, told in time order, and how
 *  many more there are. Kept by time alone, six messages reaching their stars could crowd out word from our colony,
 *  and the Mind could only say "And 2 more since". 2026-11-08. */
export function pickNews(items: NewsItem[], most: number) {
  const kept = [...items].sort((a, b) => a.rank - b.rank || a.at - b.at).slice(0, most);
  return { told: kept.sort((a, b) => a.at - b.at), more: items.length - kept.length };
}

/** The news with what a signal says blanked out, the same length, so links are read from Earth's words, never a
 *  stranger's. A signal's words naming a star linked to that star. 2026-11-08. */
export const unquoted = (news: string) => news.replace(/“[^”]*”/g, (q) => " ".repeat(q.length));
