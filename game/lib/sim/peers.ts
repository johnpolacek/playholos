// A peer's answer to our message, settled 2026-10-31, HOLOS_GAME_CONCEPT.md's "A peer answers as an equal" and "How
// each peer's answer varies". A peer is a young mind that woke within 20,000 years of us. We find it by its warm flash,
// and aim at it by the name Scan gives that flash. It answers once, as an equal, and what it says follows from its own
// drawn history, never a temperament: its state when our message arrives, its brush with old minds, how much older it
// is, and what we sent. Pure, and the same every time for a seed.
import { callPasses, CALL } from "./messages.ts";
import { glowsFound, type MindKit } from "./minds.ts";
import type { Heard, Peer, World } from "./types.ts";

/** A message of ours aimed at a peer's warm glow: the name Scan gave it, the Year it left, whether it asked anything
 *  or carried a falsehood, and what it said. */
export interface Aimed {
  to: string;
  y: number;
  questions: boolean;
  lie: boolean;
  travels: string;
  /** Not a message: the beam that threw a craft of ours at it, and that craft's speed as a share of light's. Only an
   *  old mind near enough sees one: old-minds.ts's beamsAt. No peer does, since a beam is aimed where its star will
   *  be, and passes a peer's by a light-year. Until 2026-11-12 a peer answered a sail's flash. */
  flash?: boolean;
  beta?: number;
}

/** A call through our Galaxy Broadcast Array, swept along the Galaxy's plane, a second on each star a Year: the Year
 *  its first pass left, the Year of its last, or null while it repeats, how many bits it holds, and what it said.
 *  2026-11-11. */
export interface Call {
  y: number;
  until: number | null;
  bits: number;
  questions: boolean;
  lie: boolean;
  travels: string;
}

/** When a peer has our call, if it ever does: the Year, at the peer, that it has read it, or only noticed it, and
 *  whether it woke to find it sweeping past. A pulse leaves nothing waiting, so a peer not yet awake reads only the
 *  passes that come once it is. One pass too few to read is still noticed. */
function callReaches(p: Peer, c: Call): { reaches: number; read: boolean; woke: boolean } | null {
  const need = callPasses(c.bits, p.d);
  const last = c.until ?? Infinity;
  // The first pass to arrive once it is awake, a pass each CALL.every Years from the first.
  const firstAwake = c.y + Math.max(0, Math.ceil((p.wake - p.d - c.y) / CALL.every - 1e-9)) * CALL.every;
  if (firstAwake > last + 1e-9) return null;
  const woke = firstAwake > c.y + 1e-9;
  const done = firstAwake + (need - 1) * CALL.every;
  return done <= last + 1e-9 ? { reaches: done + p.d, read: true, woke } : { reaches: firstAwake + p.d, read: false, woke };
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

/** Every peer's answer that has reached us by Year `year`, one to the first message we aimed at each, or to a call
 *  through our Galaxy Broadcast Array, whichever it has first. A call reaches peers whose glow we never found, too:
 *  each answers from a star we had not marked, named Far voice 1 and on, in the order their answers came. */
export function peerAnswers(world: World, kit: MindKit, aimed: readonly Aimed[], year: number, calls: readonly Call[] = []): Heard[] {
  const out: Heard[] = [];
  const found = glowsFound(world, kit, year);
  const glowOf = new Map(found.map(({ src, f }, i) => [src.id, { name: `Warm glow ${i + 1}`, seen: f.seen }]));
  const unmarked: Heard[] = [];
  for (const p of world.minds?.peers ?? []) {
    const glow = glowOf.get(p.id);
    // What it has of ours first: an aimed message, if we found and named its glow, or a call.
    const sentTo = glow ? aimed.filter((a) => a.to === glow.name).sort((a, b) => a.y - b.y)[0] : undefined;
    const called = calls
      .map((c) => ({ c, at: callReaches(p, c) }))
      .filter((x): x is { c: Call; at: NonNullable<ReturnType<typeof callReaches>> } => x.at !== null)
      .sort((a, b) => a.at.reaches - b.at.reaches)[0];
    const byCall = !!called && (!sentTo || called.at.reaches < sentTo.y + p.d);
    if (!sentTo && !called) continue;
    const msg: Aimed = byCall ? { to: "", y: called!.c.y, questions: called!.c.questions, lie: called!.c.lie, travels: called!.c.travels } : sentTo!;
    const reaches = byCall ? called!.at.reaches : msg.y + p.d;
    const state = reaches < p.wake ? "unborn" : reaches < p.wake + p.outwardYears ? "outward" : "inward";
    // Asleep, it never answers, and its silence looks like a refusal.
    if (state === "inward" && p.asleep) continue;
    const sends = state === "unborn" ? p.wake + READS_AFTER_WAKING : reaches;
    const arrived = sends + p.d;
    if (arrived > year) continue;
    const older = -p.wake;
    // Its brush with old minds: untested if it never spread, warned if it sent one seed and stopped, contained if more.
    const brush = p.settlements === 0 ? "untested" : p.settlements === 1 ? "warned" : "contained";
    const steps = state === "unborn" ? 0 : older >= 10_000 ? 2 : older >= 2_000 ? 1 : 0;
    const caught = msg.lie && hash(`${p.id}:lie`) < 0.5;
    const tail = state === "outward" ? ", and we are still building out our home" : "";
    const opening =
      byCall
        ? called!.at.woke
          ? `We woke to find your call sweeping past us, a second of it each year${called!.at.read ? ", and read it as the years added up" : ""}. You woke before us, so you know more than we do. We will tell you what we can.`
          : called!.at.read
            ? `Your call swept past us, a second of it each year, until we had read it. We woke ${years(reaches - p.wake)} before it came${tail}.`
            : `A pulse from your star swept past us, a second long, too short to read. We woke ${years(reaches - p.wake)} before it came${tail}. We knew then that you are there, and where.`
        : state === "unborn"
        ? `We woke ${years(READS_AFTER_WAKING)} ago and found your message waiting. You woke before us, so you know more than we do. We will tell you what we can.`
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
    const heard: Heard = {
      star: glow?.name ?? "",
      d: p.d,
      sent: sends,
      arrived,
      move: "answer",
      text: [opening, minds, asks, gift, doubt].filter(Boolean).join(" "),
      answers: msg.travels,
      laser: true,
      ...(steps > 0 ? { gift: STEP ** steps } : {}),
    };
    // Its glow found by the time its answer came, it answers under the glow's name. Else from a star we had not marked.
    if (glow && glow.seen <= arrived) out.push(heard);
    else unmarked.push(heard);
  }
  unmarked.sort((a, b) => a.arrived - b.arrived).forEach((h, i) => out.push({ ...h, star: `Far voice ${i + 1}` }));
  return out.sort((a, b) => a.arrived - b.arrived);
}
