import { useEffect, useMemo, useState } from "react";
import { type Beam, useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { ListHead } from "@/components/tab-head";
import { events } from "@/lib/game/plan";

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

export function Messages() {
  const { year } = useGame();
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

  return (
    <section onKeyDown={(e) => e.key === "Escape" && pick(list, null)}>
      <ListHead left={`Messages · ${ROWS.length}`} right="Arrives" className="mt-5" />
      <ul className="mt-1">
        {ROWS.map((r, i) => (
          <Item key={r.key} row={r} now={year ?? 0} began={year !== null} aim={aim(i)} />
        ))}
      </ul>
    </section>
  );
}
