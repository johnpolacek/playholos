import { useState } from "react";
import { type Lane, Lanes, type Leg } from "@/components/kit/lanes";
import type { Row } from "@/components/journey";
import { BeamMark, BuildMark, buildColor } from "@/components/marks";
import type { Aim } from "@/components/picks";
import { YEAR_0, yearText } from "@/lib/game/clock";
import type { Road } from "@/lib/game/reach";
import { dates } from "@/lib/game/sends";
import type { Sent } from "@/lib/game/types";

// The Light cone layout's feeders, 2026-11-15: what turns the game's own shapes into lanes for components/kit/lanes.tsx.
// A craft's Road, a message we Sent, a real message from before Year 0, a signal heard, and a queued build's Row each
// become one lane of legs on the axis of Years. No trip's time is worked out here: every Year comes from the Road, from
// lib/game/sends.ts's dates, or from light's own pace, a light-year a Year, which is a sum and never a speed.

/** A Year on the axis: "Year 41.2", and a calendar year before Year 0, as "1983". */
export const coneYear = (y: number) => (y < 0 ? String(Math.floor(YEAR_0 + y)) : `Year ${yearText(y)}`);

const leg = (key: string, name: string, end: string, from: number, to: number, by: Leg["by"], more: Partial<Leg> = {}): Leg[] => (to > from || more.open ? [{ key, name, end, from, to, by, ...more }] : []);

/** A craft on its Road: built, held for its fuel, flying out, and its word coming home at light's speed. The light
 *  that left with it takes as long to get there as its word takes to come back, which the Road already has. */
export function laneOfRoad(id: string, name: string, road: Road, o: { ordered?: number; aim?: Aim; now?: number } = {}): Lane | null {
  const { done, leaves, arrives, home } = road;
  if (leaves === null || arrives === null || home === null) return null;
  const built = road.fuelWait?.built ?? done ?? leaves;
  const now = o.now ?? 0;
  return {
    id,
    name,
    begins: "Ordered",
    line: now >= home ? `Word home, ${coneYear(home)}` : now >= arrives ? `There. Word home ${coneYear(home)}` : now >= leaves ? `Arrives ${coneYear(arrives)}` : `Leaves ${coneYear(leaves)}`,
    mark: <BuildMark name={road.build} size={16} />,
    tone: buildColor(road.build),
    legs: [
      ...leg("built", "Being built", "Built", o.ordered ?? Math.min(built, leaves), built, "work"),
      ...leg("waits", road.fuelWait ? `Waits for ${road.fuelWait.fuel}` : "Waits to leave", "Leaves", built, leaves, "wait"),
      ...leg("flies", "Flies out", "Arrives", leaves, arrives, "craft"),
      ...leg("word", "Word on its way home", "Word home", arrives, home, "light"),
    ],
    light: { from: leaves, to: leaves + (home - arrives) },
    aim: o.aim,
  };
}

/** A message we sent in play: the sending, its light on the way, and the soonest an answer could be home. An answer
 *  nobody has sent is drawn in the waiting color. Every way at once, it spreads as far as it can be read. */
export function laneOfSent(s: Sent, aim?: Aim): Lane {
  const to = s.to === "everywhere" ? "Every way at once" : `To ${s.to}`;
  const base = { id: s.id, name: to, begins: "We begin to send", mark: <BeamMark back={false} size={16} />, tone: "var(--you)", aim };
  if (s.d === undefined) {
    const far = s.reach ?? 0;
    return { ...base, line: `Read out to ${far} ly by ${coneYear(s.y + far)}`, legs: leg("spreads", "Spreads", `Read out to ${far} ly`, s.y, s.y + far, "light") };
  }
  const { sendYears, lands, back } = dates(s.y, s.d, s.size);
  return {
    ...base,
    line: `Lands ${coneYear(lands)}`,
    legs: [
      ...leg("sends", "Sending", "Sent", s.y, s.y + sendYears, "work"),
      ...leg("travels", "Travels", "Lands", s.y + sendYears, lands, "light"),
      ...leg("answer", "An answer, if one comes", "Soonest answer home", lands, back, "light", { tone: "var(--wait)" }),
    ],
  };
}

/** A real message from before Year 0, as lib/game/knocks.ts lists them: its light out, a light-year a Year, and the
 *  soonest an answer could follow it home. */
export function laneOfBeam(b: { key: string; name: string; star: string; sent: number; ly: number; reply: boolean }, aim?: Aim): Lane {
  const y = b.sent - YEAR_0;
  return {
    id: b.key,
    name: b.name.includes(b.star) ? b.name : `${b.name}, to ${b.star}`,
    begins: "Sent",
    line: `Sent ${Math.floor(b.sent)} · lands ${coneYear(y + b.ly)}`,
    mark: <BeamMark back={b.reply} size={16} />,
    tone: "var(--you)",
    legs: [...leg("travels", "Travels", "Lands", y, y + b.ly, "light"), ...(b.reply ? leg("answer", "An answer, if one comes", "Soonest answer home", y + b.ly, y + 2 * b.ly, "light", { tone: "var(--wait)" }) : [])],
    aim,
  };
}

/** A signal heard from another star: it left as many Years before we heard it as its star is light-years off. */
export function laneOfHeard(h: { key: string; star: string; at: number; ly: number }, aim?: Aim): Lane {
  return {
    id: h.key,
    name: `Heard from ${h.star}`,
    begins: "It leaves their star",
    line: `It left there in ${coneYear(h.at - h.ly)}`,
    mark: <BeamMark back size={16} />,
    tone: "var(--other)",
    legs: leg("travels", "Their signal travels", "Heard", h.at - h.ly, h.at, "light"),
    aim,
  };
}

/** A queued build, as the queue's own Row: from the Year we ordered it to the Year it is done. Past the horizon it has
 *  no Year, and its bar is left open. */
export function laneOfBuild(row: Row, horizon: number, aim?: Aim): Lane {
  const from = row.from ?? 0;
  return {
    id: row.key,
    name: row.name,
    begins: "Ordered",
    line: row.at === null ? "Past what we can plan" : `Done ${coneYear(row.at)}`,
    mark: <BuildMark name={row.key} size={16} />,
    tone: buildColor(row.key),
    legs: leg("built", "Being built", "Done", from, row.at ?? horizon, "work", { open: row.at === null }),
    aim,
  };
}

/** The key under the lanes: how each kind of leg is drawn. */
const KEY: [string, string][] = [
  ["h-2.5 w-4 rounded-[2px] border border-muted/60 bg-muted/30", "built"],
  ["h-px w-4 border-t border-dashed border-muted", "waits"],
  ["h-[5px] w-4 rounded-full bg-ink", "flies, slower than light"],
  ["h-[2px] w-4 bg-ink shadow-[0_0_6px_var(--ink)]", "light"],
  ["h-px w-4 border-t border-dotted border-wait", "light that left with a craft"],
];

/** One Light cone page, drawn: its lanes under a Year scrubber, with the key to their legs. It keeps "now" itself,
 *  starting from the Year it is given: the scrubber looks along the axis and changes nothing. A view on /ui feeds it
 *  fixed lanes, and the game its own. `lanes` takes now, so a lane's line can say where it stands then. */
export function ConeLanes({ label, head, lanes, range, start, className = "" }: { label: string; head: string; lanes(now: number): Lane[]; range: [number, number]; start: number; className?: string }) {
  const [now, setNow] = useState(start);
  return (
    <div className={`@container ${className}`}>
      <Lanes label={label} head={head} lanes={lanes(now)} range={range} now={now} onNow={setNow} format={coneYear} />
      {/* The key is to the lanes: the fold draws no legs. */}
      <p className="mt-3 hidden flex-wrap items-center @xl:flex gap-x-4 gap-y-1.5 font-mono text-[10px] tracking-[.04em] text-muted">
        {KEY.map(([draw, name]) => (
          <span key={name} className="flex items-center gap-1.5">
            <i className={draw} />
            {name}
          </span>
        ))}
      </p>
    </div>
  );
}

/** An axis's end: a little past the last Year on it, on a round number. */
export function coneEnd(last: number) {
  const step = last > 200 ? 50 : last > 40 ? 10 : 5;
  return Math.ceil((last * 1.04) / step) * step;
}

/** One pick among lanes, for a page that keeps its own: pressed and lit together, as the map would show it. */
export function useConePick(): (id: string) => Aim {
  const [picked, setPicked] = useState<string | null>(null);
  return (id) => ({ shown: picked === id, lit: picked === id, toggle: () => setPicked((p) => (p === id ? null : id)), point: () => {} });
}
