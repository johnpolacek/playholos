// Our messages: what the Mind offers to send, and what we sent. Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's What Earth
// sends. The Will says what to send, and the Mind ends its answer with one line the card is drawn from. Only the Will's
// tap on Send sends it. The Mind can't press buttons, so the line is how it hands the card over, on the API and the
// Claude login alike.
import { glowIdOf } from "./glow-names.ts";
import targets from "../../data/targets.json" with { type: "json" };
import { aimedYears, SIZES } from "../sim/messages.ts";
import { yearText } from "./clock.ts";
import type { Kind, Sent, Size } from "./types.ts";

const KINDS: Kind[] = ["words", "pictures", "questions", "knowledge"];
const SIZE_NAMES = Object.keys(SIZES) as Size[];

/** What the Mind offers: where it goes, what travels, and its label. */
export type Draft = Pick<Sent, "to" | "travels" | "holds" | "size" | "lie">;

/** The line the Mind ends an offer with. */
const LINE = /\n*\[\[send (\{[\s\S]*?\})\]\]\s*$/;

/** A Mind's answer split into its words and, if it ends with one, its offer. A line still streaming in is hidden. */
export function readOffer(text: string): { words: string; draft: Draft | null } {
  const m = text.match(LINE);
  if (!m) return { words: text.replace(/\n*\[\[send[\s\S]*$/, ""), draft: null };
  return { words: text.slice(0, m.index).trimEnd(), draft: readDraft(safe(m[1])) };
}

const safe = (s: string) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

/** A draft, checked, since it comes from the model or the browser. */
export function readDraft(d: unknown): Draft | null {
  const { to, travels, holds, size, lie } = (d ?? {}) as Record<string, unknown>;
  if (typeof to !== "string" || typeof travels !== "string" || !travels.trim()) return null;
  return {
    to: to.trim().toLowerCase() === "everywhere" ? "everywhere" : to.trim(),
    travels: travels.trim().slice(0, 600),
    holds: Array.isArray(holds) ? KINDS.filter((k) => holds.includes(k)) : ["words"],
    size: SIZE_NAMES.includes(size as Size) ? (size as Size) : "page",
    ...(typeof lie === "string" && lie.trim() ? { lie: lie.trim().slice(0, 200) } : {}),
  };
}

const plain = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
const TARGETS = targets as { name: string; ra: number; dec: number; d: number }[];

/** The watcher, once found: a knock aimed at it lands within seconds, from the Moon's L5. 2026-10-30. */
export const WATCHER = { name: "The watcher", ra: 0, dec: 0, d: 1.3 / 3.156e7 };

/** How far the watcher sits from Earth, as light-time, by where it sits: the Moon's L4 or L5 at 1.3 light-seconds, the
 *  Sun–Earth L4 or L5 at 1 AU, 8.3 light-minutes, and a co-orbital rock minutes off. A knock card read 1.3
 *  light-seconds for every place until a playtest, 2026-11-01. */
export function watcherAway(place: string | undefined) {
  if (!place || place.startsWith("Earth–Moon")) return { far: "1.3 light-seconds", lands: "in seconds", ls: 1.3 };
  if (place.startsWith("Sun–Earth")) return { far: "8.3 light-minutes", lands: "in 8 minutes", ls: 499 };
  return { far: "a few light-minutes", lands: "in minutes", ls: 500 };
}

/** How far a message can be aimed: any lead's direction in our Galaxy, a warm glow thousands of light-years off
 *  included. Light needs no star catalog, only a direction. 2026-10-31. */
export const REACH_LY = 200_000;
/** A star, and for a warm glow too far for parallax, the range we know in place of its distance. The sim keeps the
 *  true distance, and no screen or Mind line shows it. Playtest 2026-11-01: a send card read 10178.408519999579 ly. */
type Star = { name: string; ra: number; dec: number; d: number; range?: [number, number] };
/** Places on this game's leads past the 50 ly census: a cold glow, a warm body, a warm glow far off, set by Scan as
 *  its leads come. 2026-10-31. */
const KNOWN = new Map<string, Star>();
export function knowStars(stars: Star[]) {
  for (const s of stars) if (s.d > 0 && s.d <= REACH_LY) KNOWN.set(plain(s.name), s);
}

/** A star we can aim at by the name the Mind gave: every star to 50 ly, any place on one of our leads, or the
 *  watcher. */
export function target(name: string): Star | null {
  // The Mind may draft to the name Scan shows, as Prometheus. Orders keep the id. 2026-11-04.
  const n = plain(glowIdOf(name));
  if (["the watcher", "watcher"].includes(n)) return WATCHER;
  return TARGETS.find((t) => plain(t.name) === n) ?? KNOWN.get(n) ?? null;
}

/** When an aimed message is done sending, lands, and the soonest its answer could be home: a tenth of a Year to answer,
 *  the boldest star's pace. */
export function dates(y: number, d: number, size: Size) {
  const done = y + aimedYears(SIZES[size], d);
  return { sendYears: done - y, lands: done + d, back: done + 2 * d + 0.1 };
}

/** Time to send, in words: seconds to Years. */
export function sendTime(years: number) {
  const s = years * 3.156e7;
  const n = (x: number) => (x < 10 ? Number(x.toFixed(1)) : Math.round(x));
  if (s < 60) return `${n(Math.max(s, 1))} second${n(Math.max(s, 1)) === 1 ? "" : "s"}`;
  if (s < 3600) return `${n(s / 60)} minutes`;
  if (s < 86400 * 2) return `${n(s / 3600)} hours`;
  if (years < 0.5) return `${n(s / 86400)} days`;
  return `${n(years)} Years`;
}

/** Our messages, checked, from the save. */
export function readSent(list: unknown): Sent[] {
  if (!Array.isArray(list)) return [];
  return list
    .flatMap((x) => {
      const draft = readDraft(x);
      const { id, y, asked, reach, repeat, stopped } = (x ?? {}) as Record<string, unknown>;
      if (!draft || typeof id !== "string" || typeof y !== "number" || !Number.isFinite(y) || y < 0) return [];
      const { ra, dec, d } = (x ?? {}) as Record<string, unknown>;
      // A lead's star past the census keeps its place in the save. 2026-10-31.
      const kept =
        typeof ra === "number" && typeof dec === "number" && typeof d === "number" && d > 0 && d <= REACH_LY && Math.abs(dec) <= 90
          ? { name: draft.to, ra, dec, d }
          : null;
      const star = draft.to === "everywhere" ? null : (target(draft.to) ?? kept);
      if (draft.to !== "everywhere" && !star) return [];
      const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
      return [{
        ...draft,
        id: id.slice(0, 64),
        y,
        asked: typeof asked === "string" ? asked.slice(0, 600) : "",
        ...(star ? { to: star.name, d: star.d, ...(star === kept ? { ra: star.ra, dec: star.dec } : {}) } : { reach: Math.min(50, Math.max(1, num(reach) ?? 10)), repeat: repeat === true }),
        ...(num(stopped) !== undefined ? { stopped: num(stopped) } : {}),
      } satisfies Sent];
    })
    .slice(0, 64);
}

const one = (x: number) => x.toFixed(1);
const lyText = (x: number) => x.toLocaleString("en-US", { maximumFractionDigits: x >= 1000 ? 0 : 1 });

/** How far a star is, as we know it: its range where we have only that, else its distance. */
export function farText(s: { d: number; range?: [number, number] }) {
  return s.range ? `${lyText(s.range[0])} to ${lyText(s.range[1])} ly` : `${lyText(s.d)} ly`;
}

/** Our messages in words, for the Mind: each one's star, when it left and lands, what it holds, and any lie. */
export function describeSent(sent: Sent[], year: number | null, ranges: Record<string, [number, number]> = {}): string {
  if (!sent.length) return "";
  const now = year ?? 0;
  const lines = sent.map((s) => {
    const lie = s.lie ? ` It carries a lie, which they will take as true: ${s.lie}` : "";
    if (s.to === "everywhere") {
      const run = s.repeat ? (s.stopped !== undefined ? `, repeated until we stopped it at Year ${yearText(s.stopped)}` : ", repeating until the Will stops it") : ", once";
      return `- Every way at once, from Year ${yearText(s.y)}${run}, readable to ${s.reach} ly: ${s.travels}${lie}`;
    }
    const range = ranges[s.to] ?? target(s.to)?.range;
    if (range) {
      // Only a range: it lands, and an answer could come, somewhere across it, never at a Year we can name.
      const [a, b] = [dates(s.y, range[0], s.size), dates(s.y, range[1], s.size)];
      return `- To ${s.to}, ${farText({ d: s.d!, range })}, a range, not a distance, sent from Year ${yearText(s.y)}. It lands somewhere from Year ${yearText(a.lands)} to Year ${yearText(b.lands)}, we can't say when. The soonest an answer could be home is somewhere from Year ${yearText(a.back)} to Year ${yearText(b.back)}. It holds: ${s.travels}${lie}`;
    }
    const { sendYears, lands, back } = dates(s.y, s.d!, s.size);
    // A big message takes Years to send, at our dishes' pace, and lands over as long. Said, since the Mind took a
    // 15-Year send for one long gone, 2026-10-26.
    const first = s.y + s.d!;
    const long = sendYears >= 0.05;
    const sending = long ? (s.y + sendYears > now ? ` Our dishes are still sending it, until Year ${yearText(s.y + sendYears)}.` : ` Our dishes sent it until Year ${yearText(s.y + sendYears)}.`) : "";
    const where = long
      ? `${lands <= now ? "it landed" : "it lands"} from Year ${yearText(first)} to Year ${yearText(lands)}`
      : lands <= now ? `landed at Year ${yearText(lands)}` : `lands at Year ${yearText(lands)}`;
    return `- To ${s.to}, ${one(s.d!)} ly, sent from Year ${yearText(s.y)}, ${where}.${sending} The soonest an answer to all of it could be home is Year ${yearText(back)}. It holds: ${s.travels}${lie}`;
  });
  return `What we have sent since Year 0, and nothing else has gone. A star learns of it only once it lands:\n${lines.join("\n")}`;
}

/** What a gift does for our thinking, in words. */
export function giftWords(times: number) {
  if (times <= 1) return "It holds nothing for our thinking: no methods we can use.";
  const far = times < 2 ? "half again as far" : `${times.toFixed(1)} times as far`;
  return `Our thinking goes ${far}, so any build short of thought runs faster.`;
}
