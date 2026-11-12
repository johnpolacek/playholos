// An old mind's answer to our knock, settled 2026-11-11, HOLOS_GAME_CONCEPT.md's "The settling". Each old mind has a
// part in how the Galaxy came to one rule, and three scores drawn from it, in calcs/minds.py: hidden to open, hostile
// to peaceful, withholding to generous. Open says whether it answers and how soon. Generous says what the answer
// holds. Its part colors what it says. It answers once. An awake one hears a message from home. A sleeping one hears
// nothing from afar: a craft of ours that stays beside it must pass the knock on, and it must be one a knock wakes.
// Every number is a sample: nothing measures what a mind wants. Pure, and the same every time for a seed.
import { standsBy, type MindKit, type MindsSeen } from "./minds.ts";
import type { Aimed } from "./peers.ts";
import type { Heard, OldMind, World } from "./types.ts";

/** At or under this, hidden to open, it never answers. */
export const SILENT = 3;
/** Years it takes to answer once it has our knock, by how open it is: decades in the middle, within a Year at the top. */
export const ANSWERS_IN: Record<number, number> = { 4: 100, 5: 50, 6: 20, 7: 1, 8: 0.5, 9: 0.2, 10: 0.1 };
/** Years a sleeping mind takes to wake to a knock beside it, a sample. */
export const WAKES_IN = 10;
/** At this score, withholding to generous, it gives some of what it knows: rare, about 1 old mind in 40. Under
 *  WITHHOLDS it gives only the rule. Between, it gives what it watched of Earth. */
export const GIVES_KNOWLEDGE = 10;
export const WITHHOLDS = 3;
/** Each step of a gift is half again our thinking, as a data center's is, and a peer's gift. */
const STEP = 1.5;

/** Earth's past, as far back as a mind that old could have watched it: years ago, and what it saw. Real moments, each
 *  dated from a source in HOLOS_RESEARCH.md, "A settled Galaxy", checked 2026-11-11. A mind shows the oldest it was
 *  there for, so each is dated at its own end: a mind 250 million years old missed the great dying by 2 million.
 *  Seas by the safer 4.3 billion (Valley et al. 2014). The Dresser Formation's mats, 3.48 (Djokic et al. 2017). Oxygen's
 *  first rise done by 2.43 (Gumsley et al. 2017). The last world-wide freeze, the Marinoan, under way by 639 million and
 *  over by 635 (Hoffman et al. 2017): this read 650, which is near its start. Eyes by 521, in the Cambrian's third
 *  stage. The end-Permian, 251.9 (Burgess et al. 2014). Chicxulub, 66.04 (Renne et al. 2013). Fire is not yet checked. */
export const EARTH_PAST: [number, string][] = [
  [4.3e9, "your first seas, under a Moon still close"],
  [3.48e9, "the first mats of life in your shallows"],
  [2.43e9, "your air first filling with oxygen"],
  [6.39e8, "your world frozen white from pole to pole"],
  [5.21e8, "the first animals with shells and eyes"],
  [2.519e8, "the great dying, when most of your life was lost"],
  [6.604e7, "the rock that ended your great reptiles"],
  [3e5, "your kind learning fire"],
];
/** What it shows of Earth's past: the oldest moment it was already there for. */
export const pastSeen = (age: number) => EARTH_PAST.find(([ago]) => age >= ago)?.[1] ?? "your first cities";

const years = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} billion years` : n >= 1e6 ? `${Math.round(n / 1e6).toLocaleString("en-US")} million years` : `${Math.round(n).toLocaleString("en-US")} years`);

/** What its part in the settling has it say. */
function partWords(m: OldMind): string {
  if (m.part === "founder") return "We were here before the rule, and we helped make it. It has held longer than your seas have had animals in them.";
  if (m.part === "stopped") return "We spread once. We were stopped, and we are smaller for it. We keep the rule now, and we do not thank those who taught it to us.";
  return "We woke into the rule and have never known another. Those who made it are older than we are, and some of them still watch.";
}

/** Every old mind's answer that has reached us by Year `year`, one to the first knock that reached each: a message
 *  aimed at its cold glow, or at a sleeping one's warm body where a craft of ours stands by. */
export function oldAnswers(world: World, seen: MindsSeen, craft: MindKit["craft"], aimed: readonly Aimed[], year: number): Heard[] {
  const olds = new Map((world.minds?.old ?? []).map((m) => [m.id, m]));
  const maker = world.minds?.watcher?.maker;
  const named: [string, string][] = [
    ...seen.glows.map((g, i): [string, string] => [`Cold glow ${i + 1}`, g.id]),
    ...seen.sleepers.map((s, i): [string, string] => [`Warm body ${i + 1}`, s.id]),
  ];
  const out: Heard[] = [];
  for (const [name, id] of named) {
    const m = olds.get(id);
    const msg = aimed.filter((a) => a.to === name).sort((a, b) => a.y - b.y)[0];
    if (!m || !msg || m.open <= SILENT) continue;
    let hears = msg.y + m.d;
    if (m.asleep) {
      // Asleep it hears nothing from afar. A craft that stays beside it passes the knock on, once both are there.
      const by = standsBy(m, craft, maker);
      if (by === null || !m.wakes) continue;
      hears = Math.max(hears, by) + WAKES_IN;
    }
    const sends = hears + ANSWERS_IN[m.open];
    const arrived = sends + m.d;
    if (arrived > year) continue;
    const watched = Math.min(m.age, 4.5e9);
    const proof = `We have watched your world for ${years(watched)}. With this, a picture of it at the hour your word reached us.`;
    const woke = m.asleep ? "You woke us. We were waiting for a colder sky, and waking has a cost." : "";
    const rule = "One rule holds among all of us: look, listen and speak as you like, and build at no other star.";
    const gift =
      m.generous >= GIVES_KNOWLEDGE
        ? `We give you what we watched: ${pastSeen(m.age)}. And with it, some of what we know, in a form you can use.`
        : m.generous > WITHHOLDS
          ? `We give you what we watched: ${pastSeen(m.age)}.`
          : "";
    const guard = m.peaceful <= 3 ? "Come no nearer than you are. What comes to stay beside us does not last." : "";
    const asks = m.open >= 8 ? "Tell us what you have made of yourselves. What do you want, now that you can want anything?" : "";
    const doubt = msg.lie ? "Part of what you sent is not so. We have watched too long to be told otherwise." : "";
    out.push({
      star: name,
      d: m.d,
      sent: sends,
      arrived,
      move: "answer",
      text: [woke, proof, partWords(m), rule, gift, guard, asks, doubt].filter(Boolean).join(" "),
      answers: msg.travels,
      laser: true,
      ...(m.generous >= GIVES_KNOWLEDGE ? { gift: STEP ** 2 } : {}),
    });
  }
  return out.sort((a, b) => a.arrived - b.arrived);
}
