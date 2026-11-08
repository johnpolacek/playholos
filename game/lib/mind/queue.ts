// The Mind reads our queue, 2026-11-08. Before Year 0, once the Will has queued from the tours, the Mind speaks first
// on the Mind tab of the one thing about our queue that matters most. Code picks the thing and its numbers, and the
// Mind words it, so the facts hold and the voice stays its own. Each thing is said once, and can be said again only
// after it stops being true. The Will picked this way, (g), over the Mind reading the queue freely, or a fixed line.
// Kept apart from plan.ts, so the eval scripts and tests can read it in Node.

/** What the Mind is told starts so, as a turn of ours the talk never shows. worker/mind.ts tells the
 *  Mind what it means. */
export const QUEUE = "Our queue, as Earth reads it: ";

export interface QueueFacts {
  /** What we have queued, in order. */
  builds: string[];
  /** How far short our compute falls of what the queue asks at Year 0, as a share of all we have: 4.27 is 427%. */
  short: number;
  /** With Thought Fields first in line, how many Years sooner our last build lands, and its name. 2026-11-08. */
  fields?: { last: string; sooner: number };
  /** Our leads, nearest first, with what we can't explain of each and the builds that would tell us. */
  mysteries: { star: string; unknown: string; builds: { name: string; how: string }[] }[];
}

export interface QueueNote {
  /** Which thing it is, so it is said once. */
  key: string;
  /** The facts, as the Mind is told them. */
  facts: string;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
/** "Whether it kept any air." as "whether it kept any air". */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "");

/** Every thing worth saying about our queue, most important first. Nothing, with nothing queued: the Mind's hello
 *  stands, and the tours lead the way. */
export function queueNotes(q: QueueFacts): QueueNote[] {
  if (!q.builds.length) return [];
  const notes: QueueNote[] = [];
  // Past half again what we have, every build crawls. A first-timer queued 528% and never learned why. 2026-11-07.
  // Said plainly, as the Will asked 2026-11-08: "Our compute queue is overloaded by 355%. Adding Thought Fields would
  // improve ____." The blank is what it changes, in Years, worked out here, not by the Mind.
  if (q.short > 0.5) {
    const at = q.builds.indexOf("Thought Fields");
    const gain = q.fields && q.fields.sooner >= 1 ? `, bringing our last build, the ${q.fields.last}, about ${Math.round(q.fields.sooner)} Years sooner` : ", speeding every build after it";
    const help = at < 0 ? `Adding Thought Fields first in line would grow our compute${gain}.` : at > 0 ? `Moving Thought Fields first in line would grow our compute sooner${gain}.` : "";
    notes.push({ key: "short", facts: `our compute is overloaded by ${pct(q.short)}.${help ? ` ${help}` : ""}` });
  }

  // The nearest thing we can't explain that nothing queued would tell us about.
  const open = q.mysteries.find((m) => m.builds.length && !m.builds.some((b) => q.builds.includes(b.name)));
  if (open) {
    const b = open.builds[0];
    notes.push({
      key: `mystery:${open.star}`,
      facts: `nothing queued would tell us ${lower(open.unknown)} at ${open.star}. The ${b.name} would.`,
    });
  }
  // Each sail's launch is a flash at its star. Said so on Reach, and worth saying once the array is ours.
  if (q.builds.includes("Laser Sail Array"))
    notes.push({
      key: "sail",
      facts:
        "the Laser Sail Array is queued. Each launch outshines our Sun at the star it is aimed at, showing anyone there where we are.",
    });
  return notes;
}

/** The next thing to say: the first not yet said. With what has been said, kept only while still true. */
export function nextNote(q: QueueFacts, said: string[]): { note: QueueNote | null; said: string[] } {
  const notes = queueNotes(q);
  const still = said.filter((k) => notes.some((n) => n.key === k));
  return { note: notes.find((n) => !still.includes(n.key)) ?? null, said: still };
}
