import PLACED from "./leads.json";
import { type Lead, skyId, starName } from "./leads";

// Which of our leads the Mind's words name, 2026-11-04, so the map can open on one and the words can lead to its page.
// Read from the words by code, so the prompt stays as it is and a name the Mind never said can't be drawn.

const plain = (s: string) => s.replace(/[’']/g, "'");
const escaped = (s: string) => plain(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A lead's names as words may give them: its own, as Scan shortens it, and its worlds'. A world alone is only a letter,
 *  so it goes with its star, whole or by its first word: 82 Eridani d, Proxima b, Luyten b. */
export function namesOf(lead: Lead) {
  const star = plain(lead.star);
  const short = star.split(" ")[0].replace(/'s$/, "");
  const worlds = (lead.system?.worlds ?? []).flatMap((w) => (w.name ? [`${star} ${w.name}`, `${short} ${w.name}`] : []));
  return [lead.star, starName(lead.star), ...worlds];
}

/** The leads named in these words, first named first. Until `done`, a name at the very end may still be growing, as
 *  "Warm glow 1" into "Warm glow 12", so it waits for the next character. */
export function leadsNamed(words: string, leads: Lead[], done: boolean) {
  const text = plain(words) + (done ? " " : "");
  const found: { lead: Lead; at: number }[] = [];
  for (const lead of leads) {
    const ats = namesOf(lead).map((name) => text.search(new RegExp(`(?<![\\w-])${escaped(name)}(?![\\w-]|[,.]?\\d)(?=.)`, "is")));
    const at = Math.min(...ats.filter((a) => a >= 0));
    if (Number.isFinite(at)) found.push({ lead, at });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.lead);
}

/** Whether the map can show this lead: one here at home, as a rock coming, has no place among the stars. */
export const onMap = (lead: Lead) => !!lead.at || skyId(lead.star) in PLACED;
