// Our messages: what the Mind offers to send, and what we sent. Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's What Earth
// sends. The Will says what to send, and the Mind ends its answer with one line the card is drawn from. Only the Will's
// tap on Send sends it. The Mind can't press buttons, so the line is how it hands the card over, on the API and the
// Claude login alike.
import targets from "../../data/targets.json" with { type: "json" };
import { aimedYears, GIFT_STEPS, SIZES } from "../sim/messages.ts";
import { giftTimes } from "../sim/works.ts";
import type { Heard } from "../sim/types.ts";
import type { Kind, Reaction, Sent, Size } from "./types.ts";

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

/** A star we can aim at by the name the Mind gave, from every star to 50 ly. The same list in every game. */
export function target(name: string) {
  const n = plain(name);
  return TARGETS.find((t) => plain(t.name) === n) ?? null;
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
      const star = draft.to === "everywhere" ? null : target(draft.to);
      if (draft.to !== "everywhere" && !star) return [];
      const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
      return [{
        ...draft,
        id: id.slice(0, 64),
        y,
        asked: typeof asked === "string" ? asked.slice(0, 600) : "",
        ...(star ? { to: star.name, d: star.d } : { reach: Math.min(50, Math.max(1, num(reach) ?? 10)), repeat: repeat === true }),
        ...(num(stopped) !== undefined ? { stopped: num(stopped) } : {}),
      } satisfies Sent];
    })
    .slice(0, 64);
}

const one = (x: number) => x.toFixed(1);

/** Our messages in words, for the Mind: each one's star, when it left and lands, what it holds, and any lie. */
export function describeSent(sent: Sent[], year: number | null): string {
  if (!sent.length) return "";
  const now = year ?? 0;
  const lines = sent.map((s) => {
    const lie = s.lie ? ` It carries a lie, which they will take as true: ${s.lie}` : "";
    if (s.to === "everywhere") {
      const run = s.repeat ? (s.stopped !== undefined ? `, repeated until we stopped it at Year ${one(s.stopped)}` : ", repeating until the Will stops it") : ", once";
      return `- Every way at once, from Year ${one(s.y)}${run}, readable to ${s.reach} ly: ${s.travels}${lie}`;
    }
    const { sendYears, lands, back } = dates(s.y, s.d!, s.size);
    // A big message takes Years to send, at our dishes' pace, and lands over as long. Said, since the Mind took a
    // 15-Year send for one long gone, 2026-10-26.
    const first = s.y + s.d!;
    const long = sendYears >= 0.05;
    const sending = long ? (s.y + sendYears > now ? ` Our dishes are still sending it, until Year ${one(s.y + sendYears)}.` : ` Our dishes sent it until Year ${one(s.y + sendYears)}.`) : "";
    const where = long
      ? `${lands <= now ? "it landed" : "it lands"} from Year ${one(first)} to Year ${one(lands)}`
      : lands <= now ? `landed at Year ${one(lands)}` : `lands at Year ${one(lands)}`;
    return `- To ${s.to}, ${one(s.d!)} ly, sent from Year ${one(s.y)}, ${where}.${sending} The soonest an answer to all of it could be home is Year ${one(back)}. It holds: ${s.travels}${lie}`;
  });
  return `What we have sent since Year 0, and nothing else has gone. A star learns of it only once it lands:\n${lines.join("\n")}`;
}

/** Neighbors' answers to our messages that have reached Earth by Year `year`, as signals heard. We keep listening at
 *  every star we sent to, so none is missed, settled 2026-10-26. A call every way at once is heard too, even one on
 *  another world's news. */
export function answersHeard(sent: Sent[], reactions: Reaction[], year: number | null): Heard[] {
  if (year === null) return [];
  // Our colony reports every choice home, with or without words. 2026-10-28.
  const home = reactions.flatMap((r): Heard[] =>
    r.ours && r.move !== "unheard" && r.arrives !== undefined && r.arrives <= year
      ? [{ star: r.ours, d: r.d, sent: r.arrives - r.d, arrived: r.arrives, move: "report", text: r.text ?? null, ours: { chose: r.move, on: r.from } }]
      : [],
  );
  return reactions
    .filter((r) => !r.ours && r.text && r.arrives !== undefined && r.arrives <= year)
    .map((r): Heard => ({
      star: r.star, d: r.d, sent: r.arrives! - r.d, arrived: r.arrives!, move: r.move, text: r.text!,
      // A call every way at once, on another world's news, is overheard: it answers no message of ours.
      // Sent on news of our craft at a hole: from the hole, if their Mind stands there.
      ...(r.via ? { star: r.via.star, d: r.via.d, sent: r.arrives! - r.via.d } : {}),
      ...(r.from ? { overheard: true } : r.about ? { about: r.about } : { answers: sent.find((s) => s.id === r.sent)?.travels ?? "" }),
      ...(r.move === "gift" ? { gift: giftTimes(GIFT_STEPS[r.size ?? "collection"]) } : {}),
    }))
    .concat(home);
}

/** What a gift does for our thinking, in words. */
export function giftWords(times: number) {
  if (times <= 1) return "It holds nothing for our thinking: no methods we can use.";
  const far = times < 2 ? "half again as far" : `${times.toFixed(1)} times as far`;
  return `Our thinking goes ${far}, so any build short of thought runs faster.`;
}
