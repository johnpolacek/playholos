import { useState } from "react";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { heardId, useLeads } from "@/components/scan";
import { ListHead } from "@/components/tab-head";
import { YEAR_0 } from "@/lib/game/clock";

// What our watches have caught, on Scan, above the leads: each signal on its whole journey, from the year its sender
// sent it to the Year it reached us, in their color. Opening one shows what it holds, read at once, who sent it, and
// which watch caught it. Each is marked new until opened. 2026-10-22.

const A = (move: string) => `${/^[aeiou]/.test(move) ? "An" : "A"} ${move}`;

export function Heard() {
  const { year, see } = useGame();
  const { heard, fresh } = useLeads();
  const [open, setOpen] = useState<string | null>(null);
  const [lit, setLit] = useState<string | null>(null);
  const rows: Row[] = heard.map((h) => ({
    key: heardId(h),
    name: h.star,
    note: `${A(h.move)}${h.laser ? ", in laser flashes" : ""}, sent in ${Math.floor(YEAR_0 + h.sent)}.`,
    at: h.arrived,
    kind: "heard",
    msg: h.move,
    sent: YEAR_0 + h.sent,
    ly: h.d,
    fresh: fresh.has(heardId(h)),
    story: [
      ["HOLDS", h.text ? `“${h.text}”` : "A pattern no star makes. We can’t read it yet."],
      ["FROM", `${h.star}, ${h.d.toFixed(1)} light-years away`],
      [
        "CAUGHT BY",
        h.by
          ? `Our ${h.by}. Year 0’s sky watch would have missed it.${h.laser ? " Only it sees flashes. No radio watch hears them." : ""}`
          : "Year 0’s sky watch",
      ],
    ],
  }));
  const aim = (key: string): Aim => ({
    shown: open === key,
    lit: open === key || lit === key,
    toggle: () => {
      setOpen(open === key ? null : key);
      if (fresh.has(key)) see([key]);
    },
    point: (on) => setLit(on ? key : null),
  });
  return (
    <section>
      <ListHead left={`Heard · ${rows.length}`} right="Arrived" className="mt-1" />
      <ul className="mt-1">
        {rows.map((r) => (
          <Item key={r.key} row={r} now={year ?? 0} began={year !== null} aim={aim(r.key)} />
        ))}
      </ul>
    </section>
  );
}
