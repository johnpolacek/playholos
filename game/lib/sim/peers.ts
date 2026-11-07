// A peer's answer to our message, settled 2026-10-31, HOLOS_GAME_CONCEPT.md's "A peer answers as an equal" and "How
// each peer's answer varies". A peer is a young mind that woke within 20,000 years of us. We find it by its warm flash,
// and aim at it by the name Scan gives that flash. It answers once, as an equal, and what it says follows from its own
// drawn history, never a temperament: its state when our message arrives, its brush with old minds, how much older it
// is, and what we sent. Pure, and the same every time for a seed.
import { glowsFound, type MindKit } from "./minds.ts";
import type { Heard, World } from "./types.ts";

/** A message of ours aimed at a peer's warm glow: the name Scan gave it, the Year it left, whether it asked anything
 *  or carried a falsehood, and what it said. */
export interface Aimed {
  to: string;
  y: number;
  questions: boolean;
  lie: boolean;
  travels: string;
  /** Not a message: our laser's flash as it launched sails at the glow. 2026-11-07. */
  flash?: boolean;
}

/** What it says it answers, for a flash. */
export const FLASH_TRAVELS = "The flash of our laser as it launched sails toward it";

/** Each sail launch at a warm glow, as a knock with nothing in it: its laser flashes toward the glow as it fires. */
export function flashesOf(flybys: readonly { star: string; by: string; leaves?: number }[]): Aimed[] {
  return flybys
    .filter((f) => f.by === "sails" && f.leaves !== undefined && /^Warm glow \d+$/.test(f.star))
    .map((f) => ({ to: f.star, y: f.leaves!, questions: false, lie: false, travels: FLASH_TRAVELS, flash: true }));
}

/** A peer that finds our message only after it wakes reads it within this many Years, a sample. */
const READS_AFTER_WAKING = 10;
/** Each step of a gift is half again our thinking, as a data center's is. */
const STEP = 1.5;

/** A number from 0 to 1 from a peer's id, the same every time. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

const years = (n: number) => `${Math.round(n).toLocaleString("en-US")} years`;

/** Every peer's answer that has reached us by Year `year`, one to the first message we aimed at each. */
export function peerAnswers(world: World, kit: MindKit, aimed: readonly Aimed[], year: number): Heard[] {
  const out: Heard[] = [];
  glowsFound(world, kit, year).forEach(({ src: p }, i) => {
    // A natural glow takes its place in Scan's names, and no one answers from it. 2026-11-03.
    if ("kind" in p) return;
    const name = `Warm glow ${i + 1}`;
    const msg = aimed.filter((a) => a.to === name).sort((a, b) => a.y - b.y)[0];
    if (!msg) return;
    const reaches = msg.y + p.d;
    const state = reaches < p.wake ? "unborn" : reaches < p.wake + p.outwardYears ? "outward" : "inward";
    // A flash lasts minutes, so one that comes before it wakes leaves nothing waiting.
    if (msg.flash && state === "unborn") return;
    // Asleep, it never answers, and its silence looks like a refusal.
    if (state === "inward" && p.asleep) return;
    const sends = state === "unborn" ? p.wake + READS_AFTER_WAKING : reaches;
    const arrived = sends + p.d;
    if (arrived > year) return;
    const older = -p.wake;
    // Its brush with old minds: untested if it never spread, warned if it sent one seed and stopped, contained if more.
    const brush = p.settlements === 0 ? "untested" : p.settlements === 1 ? "warned" : "contained";
    const steps = state === "unborn" ? 0 : older >= 10_000 ? 2 : older >= 2_000 ? 1 : 0;
    const caught = msg.lie && hash(`${p.id}:lie`) < 0.5;
    const opening =
      state === "unborn"
        ? `We woke ${years(READS_AFTER_WAKING)} ago and found your message waiting. You woke before us, so you know more than we do. We will tell you what we can.`
        : msg.flash
          ? `A laser flashed at us from your star, minutes long, pushing something too small to see. We woke ${years(reaches - p.wake)} before it came${state === "outward" ? ", and we are still building out our home" : ""}. We knew then that you are there, and where.`
          : state === "outward"
          ? `Your message reached us while we are still building out our home. We woke ${years(reaches - p.wake)} before it came.`
          : `We woke ${years(reaches - p.wake)} before your message came. We built out our home in ${years(p.buildYears)}${p.outwardYears - p.buildYears >= 1 ? `, spread for ${years(p.outwardYears - p.buildYears)} more,` : ","} and then turned inward. We think cold now, and quietly.`;
    const minds =
      brush === "untested"
        ? "Something small and dark has sat in our system for longer than we have been awake. It has never spoken to us, and we have never tested it."
        : brush === "warned"
          ? "When our first seed left for another star, a narrow beam warned us: look and listen and speak as you like, but build at no other star. We stopped. We tell you so you can choose before you are told."
          : "When our first seed left, a beam warned us. We sent more. Each one that reached a star went silent. We are smaller for it, and we would not do it again.";
    const asks =
      state === "outward"
        ? "Tell us what you have found. Have you found your watcher? What did it ask of you? Who else have you heard?"
        : state === "unborn"
          ? "What should we know? What have the old ones asked of you?"
          : msg.questions
            ? "You asked us things. We have answered what we can."
            : "";
    const gift = steps > 0 ? `With this, ${steps === 2 ? "much of" : "some of"} what we know, in a form you can use.` : "";
    const doubt = caught ? "Part of what you sent does not match what we see of your world. We weigh the rest with that in mind." : "";
    out.push({
      star: name,
      d: p.d,
      sent: sends,
      arrived,
      move: "answer",
      text: [opening, minds, asks, gift, doubt].filter(Boolean).join(" "),
      answers: msg.travels,
      laser: true,
      ...(steps > 0 ? { gift: STEP ** steps } : {}),
    });
  });
  return out.sort((a, b) => a.arrived - b.arrived);
}
