import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { type Beam, useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { ListHead } from "@/components/tab-head";
import { tenths, yearText, YEAR_0 } from "@/lib/game/clock";
import { events } from "@/lib/game/plan";
import { dates, target } from "@/lib/game/sends";
import type { Sent } from "@/lib/game/types";
import { useSchedule } from "@/components/picks";
import { strikesOf } from "@/lib/game/reach";
import { BULLET } from "@/lib/sim/conflict";

// Our messages on Scan, under the leads: what we beamed at nearby stars from 1983 to 2018, still on their way. Light
// crosses the same sky the leads sit in, and a reply would be a lead. Each row is on its whole journey, arriving at its
// star or with the soonest a reply could come. Picking one takes the map out to its star, to show where its light is
// now, and opens its story. Pointing at another while the map is out turns to it. Leaving brings the map home. Moved
// from Build to Reach 2026-10-18, and on to Scan 2026-10-19, so Reach holds what we launch.

/** How far ahead we look, in Years from Year 0. */
const AHEAD = 16;

const ROWS: Row[] = events(AHEAD).map((e) => ({
  key: `${e.star}${e.at}`,
  name: e.star,
  note: e.reply ? "A reply could come, at the soonest" : "Our message arrives",
  at: e.at,
  kind: e.reply ? "reply" : "send",
  msg: e.msg,
  sent: e.sent,
  ly: e.ly,
}));

const EVERYWHERE = "Every way at once";

/** What we sent in play, after the old sends: each aimed one arriving, then the soonest its answer could come, and each
 *  sent every way at once reaching as far as it can be read. Scan's map draws them as they go, and picking an aimed one
 *  flies the map out to its star, as an old send does. 2026-10-26. */
function sentRows(sent: Sent[]): Row[] {
  return sent.flatMap((s, i): Row[] => {
    // In tenths, as the Year and the send card say it: a send at Year 0.95 read "Year 1.0" here, and 0.9 on the card.
    const msg = `Year ${yearText(s.y)}`;
    if (s.to === "everywhere")
      return [{
        key: `sent${i}`, name: EVERYWHERE, at: s.y + s.reach!, kind: "send", msg, sent: YEAR_0 + s.y, ly: s.reach,
        note: s.repeat && s.stopped === undefined ? `Calling, readable to ${s.reach} ly` : `Readable to ${s.reach} ly`,
      }];
    // A far warm glow has only a range, so its rows count to the near end, at the soonest. Playtest 2026-11-01.
    const range = s.range ?? target(s.to)?.range;
    const { lands, back } = dates(s.y, range?.[0] ?? s.d!, s.size);
    const base = { name: s.to, kind: "send" as const, msg, sent: YEAR_0 + s.y, ly: s.d, ...(range ? { range } : {}) };
    return [
      { ...base, key: `sent${i}`, note: range ? "Our message arrives, at the soonest" : "Our message arrives", at: lands },
      { ...base, key: `sent${i}back`, note: "An answer could come, at the soonest", at: back, kind: "reply" },
    ];
  });
}

/** Our bullets: each from the Year we order it, flown at a tenth of light speed once readied. The map draws each along
 *  its track. 2026-10-28. Theirs went with the neighbors, 2026-10-29. */
function bulletRows(fired: { star: string; fired: number | null; d?: number }[]): Row[] {
  return fired.flatMap((b, i): Row[] => {
    if (b.d === undefined || b.fired === null) return [];
    const flies = b.d / BULLET.v;
    return [{ key: `bullet${i}`, name: b.star, kind: "send", note: "Our bullet lands", at: b.fired + flies, msg: `fired Year ${b.fired.toFixed(1)}`, sent: YEAR_0 + b.fired, ly: flies, bullet: { d: b.d } }];
  });
}

/** A message's line at a Year, counting: how long until it lands or its soonest reply, or how long since. A window gone
 *  by read "A reply could come, at the soonest", as though one might still be due. Playtest 2026-11-02. */
function noteAt(r: Row, now: number | null): string {
  if (now === null || r.at === null || r.bullet || r.name === EVERYWHERE || (r.kind !== "send" && r.kind !== "reply")) return r.note;
  const left = r.at - now;
  // Thousands of Years read whole, with commas: "15485.9 Years" read as raw. Playtest 2026-11-07.
  // Under a tenth, in days: "arrives in 0.0 Years" read as already here. Playtest 2026-11-07.
  const days = Math.max(1, Math.round(Math.abs(left) * 365.25));
  const n = Math.abs(left) < 0.1
    ? `${days} day${days === 1 ? "" : "s"}`
    : `${Math.abs(left) >= 100 ? Math.round(Math.abs(left)).toLocaleString("en-US") : tenths(Math.abs(left)).toFixed(1)} Years`;
  if (r.kind === "reply") return left > 0 ? `Soonest reply in ${n}` : `No reply for ${n}`;
  return left > 0 ? `Our message arrives in ${n}${r.range ? ", at the soonest" : ""}` : `Our message arrived ${n} ago`;
}

export function Messages() {
  const { year, save } = useGame();
  const { scale } = useSchedule();
  const plan = save?.plan;
  const fired = useMemo(() => {
    const d = new Map((plan?.strikes ?? []).map((o) => [o.name, o.d]));
    return plan ? strikesOf(plan, scale).map((s) => ({ ...s, d: d.get(s.star) })) : [];
  }, [plan, scale]);
  const bullets = useMemo(() => bulletRows(fired), [fired]);
  const ours = useMemo(() => [...sentRows(save?.sent ?? []), ...bullets], [save?.sent, bullets]);
  const { pick, peek, picked } = useBeams();
  // Every row aimed at a star can be shown on the map: Earth's old messages, then ours. Not a call sent every way.
  const aimable = useMemo(() => [...ROWS, ...ours.filter((r) => r.name !== EVERYWHERE)], [ours]);
  const list: Beam[] = useMemo(
    () => aimable.map((r) => ({ key: r.key, star: r.name, sent: r.sent!, ly: r.ly!, reply: r.kind === "reply", bullet: r.bullet && (r.bullet.theirs ? ("in" as const) : ("out" as const)) }))
      // Theirs comes in from its star: drawn as the leg home, so the map's head runs from their star to Sol.
      .map((b) => (b.bullet === "in" ? { ...b, reply: true, sent: b.sent - b.ly } : b)),
    [aimable],
  );
  useEffect(() => () => pick([], null), [pick]);
  const [hover, setHover] = useState<string | null>(null);
  const aim = (i: number): Aim => ({
    shown: picked === i,
    lit: picked === i || hover === list[i].key,
    toggle: () => pick(list, picked === i ? null : i),
    point: (on) => {
      setHover(on ? list[i].key : null);
      peek(on ? i : null);
    },
  });

  // Landed, or past its soonest reply: nothing to watch for, so folded, as Quiet leads are. Nine old sends filled Scan
  // long after they landed. Playtest 2026-11-02.
  const [pastOpen, setPastOpen] = useState(false);
  const item = (r: Row) => {
    const i = list.findIndex((b) => b.key === r.key);
    return <Item key={r.key} row={{ ...r, note: noteAt(r, year) }} now={year ?? 0} began={year !== null} counted={year !== null && noteAt(r, year) !== r.note} aim={i < 0 ? undefined : aim(i)} />;
  };
  const all = [...ROWS, ...ours];
  const gone = (r: Row) => year !== null && r.at !== null && r.at <= year;
  const live = all.filter((r) => !gone(r));
  const past = all.filter(gone);

  // Reach's Sent points here, where our messages are. 2026-11-07.
  const here = useRef<HTMLElement>(null);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#messages") here.current?.scrollIntoView({ block: "start" });
  }, [hash]);
  return (
    <section ref={here} id="messages" className="scroll-mt-4" onKeyDown={(e) => e.key === "Escape" && pick(list, null)}>
      {live.length > 0 && (
        <>
          <ListHead left={`Messages · ${live.length}`} right="Arrives" className="mt-5" />
          <ul className="mt-1">{live.map(item)}</ul>
        </>
      )}
      {/* A way to send from here: a blind first-timer came to our messages to send one, found none, and asked the Mind.
          2026-11-07. */}
      <Link
        to={`/play/mind?ask=${encodeURIComponent("We want to send a message of our own. Which star should hear from us, what should it say, and what does it risk?")}`}
        className="block border-t border-faint py-2.5 text-[13px] text-page-ink2 hover:text-ink"
      >
        Send a message of our own <span className="text-you">›</span>
      </Link>
      {past.length > 0 && (
        <>
          <button
            onClick={() => setPastOpen(!pastOpen)}
            aria-expanded={pastOpen}
            className="mt-5 flex w-full items-baseline justify-between pr-5 text-left font-mono text-[10px] tracking-[.1em] text-muted uppercase hover:text-ink"
          >
            <span>Past messages · {past.length}</span>
            <span className={`transition-transform duration-300 ${pastOpen ? "rotate-90" : ""}`}>›</span>
          </button>
          {pastOpen ? (
            <ul className="mt-1">{past.map(item)}</ul>
          ) : (
            <p className="mt-1 border-t border-faint py-2.5 text-[13.5px] text-page-ink2">
              All landed, or past their soonest reply. Nothing to watch for.
            </p>
          )}
        </>
      )}
    </section>
  );
}
