import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { heardId, useLeads } from "@/components/scan";
import { ListHead } from "@/components/tab-head";
import { yearText, YEAR_0 } from "@/lib/game/clock";
import { giftWords } from "@/lib/game/sends";

// What our watches have caught, on Scan, above the leads: each signal on its whole journey, from the year its sender
// sent it to the Year it reached us, in their color. Opening one shows what it holds, read at once, who sent it, and
// which watch caught it. Each is marked new until opened. 2026-10-22. The banner over the map opens one here, at the
// top of the tab whatever its scroll, 2026-10-29.

const A = (move: string) => `${/^[aeiou]/.test(move) ? "An" : "A"} ${move}`;

export function Heard() {
  const { year, see } = useGame();
  const { heard, fresh } = useLeads();
  const [params, setParams] = useSearchParams();
  const asked = params.get("heard");
  const [open, setOpen] = useState<string | null>(asked);
  const [lit, setLit] = useState<string | null>(null);
  const top = useRef<HTMLElement>(null);
  // Brought here for one signal: open it, mark it seen, bring the tab's top into view, and drop it from the address.
  const [was, setWas] = useState(asked);
  if (asked && asked !== was) {
    setWas(asked);
    setOpen(asked);
  }
  useEffect(() => {
    if (!asked) return;
    if (fresh.has(asked)) see([asked]);
    top.current?.closest("main")?.scrollTo({ top: 0 });
    setParams((p) => (p.delete("heard"), p), { replace: true });
  }, [asked, fresh, see, setParams]);
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
      ...(h.overheard ? ([["SENT TO", "Every way at once, on news from another world. We overheard it."]] as [string, string][]) : []),
      ...(h.warning ? ([["SENT TO", "Us, a warning about another world they know of"]] as [string, string][]) : []),
      ...(h.about ? ([["ON NEWS OF", h.about], ["CAUGHT BY", "Our dishes, which keep listening to every craft we send"]] as [string, string][]) : []),
      ...(h.answers !== undefined
        ? ([
            ["ANSWERS OURS", h.answers ? `“${h.answers}”` : undefined],
            ...(h.gift ? ([["GAVE US", `Their knowledge. ${giftWords(h.gift)}`]] as [string, string][]) : []),
            ["CAUGHT BY", "Our dishes, which keep listening to every star we send to"],
          ] as [string, string | undefined][])
        : h.about ? [] : h.found !== undefined
          // Missed when it came, and dug out of old recordings by our idle thought. 2026-10-28.
          ? ([["FOUND BY", `Our search of old recordings, at Year ${yearText(h.found)}. No one saw it when it came.`]] as [string, string][])
          : ([[
            "CAUGHT BY",
            h.by
              ? `Our ${h.by}. Year 0’s sky watch would have missed it.${h.laser ? " It alone sees flashes. No radio watch hears them." : ""}`
              : "Year 0’s sky watch",
          ]] as [string, string | undefined][])),
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
    <section ref={top}>
      <ListHead left={`Heard · ${rows.length}`} right="Arrived" className="mt-1" />
      <ul className="mt-1">
        {rows.map((r) => (
          <Item key={r.key} row={r} now={year ?? 0} began={year !== null} aim={aim(r.key)} />
        ))}
      </ul>
    </section>
  );
}
