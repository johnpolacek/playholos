import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { tenths, YEAR_0 } from "@/lib/game/clock";
import type { Dials, Mark } from "@/lib/drift";
import { placeLabel } from "@/components/place-label";

// Our messages on the map. Picking one in Reach flies the map out to its star, where its path runs from Sol, lit as
// far as its light has come. Pointing at another while the map is out turns to it. Picking it again, or Back to Earth,
// brings the map home.

/** One of our messages on its way, as the map draws it. */
export interface Beam {
  key: string;
  star: string;
  /** The decimal year we sent it. */
  sent: number;
  /** Light-years to its star. */
  ly: number;
  /** The reply that could come back, at the soonest. */
  reply: boolean;
  /** A bullet, ours going out or theirs come in, at a tenth of light speed: its `ly` is the Years it flies, so the map
   *  draws it a tenth as fast as light. 2026-10-28. */
  bullet?: "out" | "in";
}

interface Beams {
  list: Beam[];
  /** The message picked, counted from 0, which holds the map on it. Null with the map at its stops. */
  picked: number | null;
  dials: Dials;
  /** Picks a message from these, or none, which brings the map home. */
  pick(list: Beam[], i: number | null): void;
  /** Points at a message while the map is out, or stops pointing. */
  peek(i: number | null): void;
}

const BeamsContext = createContext<Beams>({ list: [], picked: null, dials: {}, pick() {}, peek() {} });
export const useBeams = () => use(BeamsContext);

export function BeamsProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Beam[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [dials] = useState<Dials>(() => ({ focus: 0, year: YEAR_0 }));
  const held = useRef<number | null>(null);
  const pick = useCallback(
    (next: Beam[], i: number | null) => {
      held.current = i;
      setList(next);
      setPicked(i);
      Object.assign(dials, { focus: (i ?? -1) + 1 });
    },
    [dials],
  );
  // The message in view: the one pointed at, or else the one picked.
  const peek = useCallback(
    (i: number | null) => void Object.assign(dials, { focus: (i ?? held.current ?? -1) + 1 }),
    [dials],
  );
  const value = useMemo(() => ({ list, picked, dials, pick, peek }), [list, picked, dials, pick, peek]);
  return <BeamsContext value={value}>{children}</BeamsContext>;
}

/** Where the light in view is now, in words: how far it has left to go, or how far out a reply could be. A light-year
 *  is a Year, so these read to the tenth below, as the queue's dates do. */
function whereNow(b: Beam, year: number) {
  if (b.bullet) {
    if (b.bullet === "in") {
      const lands = b.sent + 2 * b.ly - year;
      return lands <= 0 ? "it struck Earth" : `lands in ${tenths(lands).toFixed(1)} Years`;
    }
    const left = b.sent + b.ly - year;
    return year < b.sent ? "readying" : left <= 0 ? "it struck" : `lands in ${tenths(left).toFixed(1)} Years`;
  }
  if (!b.reply) {
    const left = b.sent + b.ly - year;
    return left <= 0 ? "arrived" : `${left < 0.1 ? "under 0.1" : tenths(left).toFixed(1)} ly to go`;
  }
  const home = b.sent + 2 * b.ly - year;
  return home <= 0 ? "if they answered, it is here" : `if they answered: ${tenths(home).toFixed(1)} ly away`;
}

/** The map on our messages: Sol, each message's star, and words for where the light in view is now. */
export function BeamsMap({ className }: { className: string }) {
  const { list, dials } = useBeams();
  const { year } = useGame();
  const now = YEAR_0 + (year ?? 0);
  useEffect(() => void Object.assign(dials, { year: now }), [dials, now]);
  const stars = useMemo(() => [...new Set(list.map((b) => b.star))], [list]);
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback(
    (marks: Mark[]) => {
      const focus = list[(dials.focus ?? 0) - 1];
      for (const b of list) {
        const n = names.current[`head:${b.key}`];
        if (n && b !== focus) n.style.opacity = "0";
      }
      for (const { id, x, y, a } of marks) {
        const head = id === "head";
        const n = names.current[head ? `head:${focus?.key}` : id];
        if (!n) continue;
        // A star's name beside it, out from the middle. The light's words under it.
        placeLabel(n, x, y, head ? 10 : null);
        n.style.opacity = String(a);
      }
    },
    [dials, list],
  );
  const label = "pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0";
  return (
    <SkyArt mode="beams" dials={dials} beams={list} onMarks={onMarks} className={className}>
      {[...stars, "Sol"].map((id) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`${label} ${id === "Sol" ? "text-muted" : list.some((b) => b.star === id && b.reply) ? "text-other" : "text-you"}`}
        >
          {id}
        </span>
      ))}
      {list.map((b) => (
        <span
          key={b.key}
          ref={(n) => {
            names.current[`head:${b.key}`] = n;
          }}
          className={`${label} text-ink`}
        >
          {whereNow(b, now)}
        </span>
      ))}
    </SkyArt>
  );
}
