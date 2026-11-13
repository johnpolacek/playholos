import { Fragment, useMemo } from "react";
import { Link } from "react-router";
import { useLeads } from "@/components/scan";
import type { Lead } from "@/lib/game/leads";
import { namesOf } from "@/lib/game/named-leads";
import { BUILDS, buildSlug, LATER } from "@/lib/game/plan";

// The Mind's words, with each build and lead they name a way to its page. Names were plain text, so a thing the Mind
// spoke of had to be found again on Build or Scan. 2026-11-13.

const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[’']/g, "['’]");
const BUILD_NAMES = [...BUILDS, ...LATER].map((b) => b.name);

type Name = { name: string; to: string; anyCase: boolean };

function namesFor(leads: Lead[]): Name[] {
  const builds = BUILD_NAMES.map((name) => ({ name, to: `/play/build/${buildSlug(name)}`, anyCase: false }));
  const named = leads.flatMap((lead) => namesOf(lead).map((name) => ({ name, to: `/play/lead/${lead.slug}`, anyCase: true })));
  // Longest first, so "Deep Ice Watch" wins over any shorter name inside it.
  return [...builds, ...named].sort((a, b) => b.name.length - a.name.length);
}

/** Where in these words each name falls, none overlapping. Until `done`, a name at the very end may still be growing,
 *  as "Warm glow 1" into "Warm glow 12", so it waits. */
function spans(words: string, names: Name[], done: boolean) {
  const found: { at: number; end: number; to: string }[] = [];
  for (const n of names) {
    const re = new RegExp(`(?<![\\w-])${escaped(n.name)}(?![\\w-]|[,.]?\\d)`, n.anyCase ? "gi" : "g");
    for (const m of words.matchAll(re)) {
      const at = m.index;
      const end = at + m[0].length;
      if (!done && end >= words.length) continue;
      if (found.some((f) => at < f.end && end > f.at)) continue;
      found.push({ at, end, to: n.to });
    }
  }
  return found.sort((a, b) => a.at - b.at);
}

export const WORD_LINK = "cursor-pointer underline decoration-dashed decoration-1 decoration-you underline-offset-[3px] transition-colors duration-300 hover:text-you";

/** `onFollow` runs as a link is taken, as a note marking itself read. */
export function LinkedWords({ words, done = true, onFollow }: { words: string; done?: boolean; onFollow?: () => void }) {
  const { leads } = useLeads();
  const names = useMemo(() => namesFor(leads), [leads]);
  const found = useMemo(() => spans(words, names, done), [words, names, done]);
  if (!found.length) return <>{words}</>;
  const out: React.ReactNode[] = [];
  let i = 0;
  for (const f of found) {
    if (f.at > i) out.push(<Fragment key={`t${i}`}>{words.slice(i, f.at)}</Fragment>);
    out.push(
      <Link key={`l${f.at}`} to={f.to} onClick={onFollow} className={WORD_LINK}>
        {words.slice(f.at, f.end)}
      </Link>,
    );
    i = f.end;
  }
  if (i < words.length) out.push(<Fragment key={`t${i}`}>{words.slice(i)}</Fragment>);
  return <>{out}</>;
}
