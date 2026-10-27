import { useEffect, useMemo, useState } from "react";
import { type Beam, useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { ListHead } from "@/components/tab-head";
import { YEAR_0 } from "@/lib/game/clock";
import { events } from "@/lib/game/plan";
import { dates } from "@/lib/game/sends";
import type { Sent } from "@/lib/game/types";

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
    const msg = `Year ${s.y.toFixed(1)}`;
    if (s.to === "everywhere")
      return [{
        key: `sent${i}`, name: EVERYWHERE, at: s.y + s.reach!, kind: "send", msg, sent: YEAR_0 + s.y, ly: s.reach,
        note: s.repeat && s.stopped === undefined ? `Calling, readable to ${s.reach} ly` : `Readable to ${s.reach} ly`,
      }];
    const { lands, back } = dates(s.y, s.d!, s.size);
    const base = { name: s.to, kind: "send" as const, msg, sent: YEAR_0 + s.y, ly: s.d };
    return [
      { ...base, key: `sent${i}`, note: "Our message arrives", at: lands },
      { ...base, key: `sent${i}back`, note: "An answer could come, at the soonest", at: back, kind: "reply" },
    ];
  });
}

export function Messages() {
  const { year, save } = useGame();
  const ours = useMemo(() => sentRows(save?.sent ?? []), [save?.sent]);
  const { pick, peek, picked } = useBeams();
  // Every row aimed at a star can be shown on the map: Earth's old messages, then ours. Not a call sent every way.
  const aimable = useMemo(() => [...ROWS, ...ours.filter((r) => r.name !== EVERYWHERE)], [ours]);
  const list: Beam[] = useMemo(
    () => aimable.map((r) => ({ key: r.key, star: r.name, sent: r.sent!, ly: r.ly!, reply: r.kind === "reply" })),
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

  return (
    <section onKeyDown={(e) => e.key === "Escape" && pick(list, null)}>
      <ListHead left={`Messages · ${ROWS.length + ours.length}`} right="Arrives" className="mt-5" />
      <ul className="mt-1">
        {ROWS.map((r, i) => (
          <Item key={r.key} row={r} now={year ?? 0} began={year !== null} aim={aim(i)} />
        ))}
        {ours.map((r) => {
          const i = list.findIndex((b) => b.key === r.key);
          return <Item key={r.key} row={r} now={year ?? 0} began={year !== null} aim={i < 0 ? undefined : aim(i)} />;
        })}
      </ul>
    </section>
  );
}
