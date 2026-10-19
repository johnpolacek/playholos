import { useEffect, useMemo, useRef, useState } from "react";
import { type Beam, useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { events } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Our messages on Reach: what we beamed at nearby stars from 1983 to 2018, still on their way. Each row is on its whole
// journey, arriving at its star or with the soonest a reply could come. Picking one takes the map out to its star, to
// show where its light is now, and opens its story. Pointing at another while the map is out turns to it. Leaving Reach
// brings the map home. Moved here from Build 2026-10-18.

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

export function Messages() {
  const { year } = useGame();
  const root = useRef<HTMLElement>(null);
  const { pick, peek, picked } = useBeams();
  const list: Beam[] = useMemo(
    () => ROWS.map((r) => ({ key: r.key, star: r.name, sent: r.sent!, ly: r.ly!, reply: r.kind === "reply" })),
    [],
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

  // The rows rise in after the roads have drawn.
  useGSAP(
    () => {
      if (!prefersReducedMotion()) gsap.fromTo('[data-q="row"]', riseFrom, { ...rise, stagger: 0.05, delay: 1.2 });
    },
    { scope: root },
  );

  return (
    <section ref={root} onKeyDown={(e) => e.key === "Escape" && pick(list, null)}>
      <h2 className="mt-6 text-[19px] leading-snug font-medium">Our messages, still on their way</h2>
      <p className="mt-0.5 text-[13.5px] text-page-ink2">
        Beamed at nearby stars from 1983 to 2018. Light is our farthest reach.
      </p>
      <ul className="mt-2">
        {ROWS.map((r, i) => (
          <Item key={r.key} row={r} now={year ?? 0} began={year !== null} aim={aim(i)} />
        ))}
      </ul>
    </section>
  );
}
