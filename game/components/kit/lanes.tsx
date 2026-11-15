import {
  visibleWaterfallRows,
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallColumnHeader,
  type WaterfallData,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallMark,
  WaterfallRow,
  WaterfallRowHeader,
  WaterfallTick,
} from "@ui-sdk/react/waterfall";
import { useState } from "react";
import { Events, type Happens } from "@/components/kit/events";
import { Scrub } from "@/components/kit/scrub";
import type { Aim } from "@/components/picks";
import { Tip } from "@/components/tip";

// The Light cone layout's lanes, 2026-11-15: everything of ours on one axis of Years, each thing a lane, on ui-sdk's
// Waterfall. In this game light-time is everything, so the layout is time: a lane's bar is its legs end to end, what
// we build, what waits, what flies, and the light that brings its word home. Under a craft's flight runs the light that
// left with it, so the eye sees that the craft is behind it and that nothing is ahead of it.
// The Waterfall is a tree grid: one tab stop, Up and Down move between lanes, Right opens a lane into its legs, each a
// row of its own with its name and Years, and Enter or Space picks a lane, which aims the map at it as a pressed row
// does. A screen reader hears each bar's legs and their Years. The scrubber over the lanes moves "now" along the axis
// with the Left and Right keys. In a narrow box, as on a phone, the lanes fold into one line of events, kit/events.tsx.

export interface Leg {
  key: string;
  /** What this stretch is, as "Flies out". */
  name: string;
  /** The Years it starts and ends. */
  from: number;
  to: number;
  /** What its end is called, as "Arrives": the fold lists each leg by its end. */
  end: string;
  /** How it is drawn: work is a build, wait is a craft held for its fuel, craft is a flight slower than light, and
   *  light is a message or a craft's word, at light's speed. */
  by: "work" | "wait" | "craft" | "light";
  /** Its end has no Year yet: drawn open, and never called done. */
  open?: boolean;
  /** Its color, where it isn't the lane's: as a reply that may never come. */
  tone?: string;
}

export interface Lane {
  id: string;
  name: string;
  /** What its first leg's start is called, as "Ordered". */
  begins: string;
  /** Under its name: where it stands, as "Word home, Year 165". */
  line?: string;
  mark?: React.ReactNode;
  /** Its color: a CSS color, as var(--reach). */
  tone?: string;
  legs: Leg[];
  /** The light that left with a craft: from the Year it leaves to the Year light gets there. */
  light?: { from: number; to: number };
  /** Picks it for the map, and points at it. */
  aim?: Aim;
}

const DRAW: Record<Leg["by"], { box: string; fill: string }> = {
  work: { box: "h-2.5 rounded-[2px] border border-(--tone)/45", fill: "bg-(--tone)/45" },
  wait: { box: "h-px border-t border-dashed border-(--tone)/60", fill: "" },
  craft: { box: "h-[5px] rounded-full bg-(--tone)/25", fill: "rounded-full bg-(--tone)" },
  light: { box: "h-[2px] bg-(--tone)/30", fill: "bg-(--tone) shadow-[0_0_6px_var(--tone)]" },
};

const GRID = "grid grid-cols-[minmax(7.5rem,12rem)_minmax(0,1fr)] gap-x-3";

export function Lanes({
  label,
  head,
  lanes,
  range,
  now,
  onNow,
  format,
  className = "",
}: {
  /** What the lanes are, for a screen reader. */
  label: string;
  /** The name column's head, as "Craft · 4". */
  head: string;
  lanes: Lane[];
  /** The axis's first and last Year. */
  range: [number, number];
  now: number;
  /** With it, a scrubber over the lanes moves now. */
  onNow?(year: number): void;
  /** How a Year reads, as "Year 41.0". */
  format(year: number): string;
  className?: string;
}) {
  const [open, setOpen] = useState<string[]>([]);
  const byId = new Map(lanes.map((l) => [l.id, l]));
  const at = (y: number) => Math.min(100, Math.max(0, ((y - range[0]) / (range[1] - range[0])) * 100));
  const years = (g: Leg) => (g.open ? `from ${format(g.from)}, with no end we can give yet` : `${format(g.from)} to ${format(g.to)}`);

  // Each lane is a span from its first leg to its last, and its legs are the spans under it.
  const items: WaterfallData = lanes.map((l) => {
    const from = Math.min(...l.legs.map((g) => g.from));
    const to = Math.max(...l.legs.map((g) => g.to));
    return {
      value: l.id,
      label: l.name,
      start: from,
      duration: to - from,
      children: l.legs.map((g) => ({ value: `${l.id}/${g.key}`, label: g.name, start: g.from, duration: g.to - g.from })),
    };
  });
  const laneOf = (value: string) => byId.get(value.split("/")[0])!;
  const picked = lanes.find((l) => l.aim?.shown)?.id ?? null;

  // One event for each leg's end, and the first leg's start, for the fold.
  const events: Happens[] = lanes.flatMap((l) => [
    { key: `${l.id}/start`, at: l.legs[0].from, title: l.begins, line: l.name, tone: l.tone, aim: l.aim },
    ...l.legs
      .filter((g) => !g.open)
      .map((g) => ({ key: `${l.id}/${g.key}`, at: g.to, title: g.end, line: g.by === "light" ? `${l.name}. At light’s speed: nothing brings it sooner.` : l.name, tone: g.tone ?? l.tone, aim: l.aim })),
  ]);

  return (
    <div className={`@container ${className}`}>
      {/* Narrow: one line of events, in the order of their Years. */}
      <div className="@xl:hidden">
        {onNow && <Scrub value={now} onChange={onNow} range={range} format={format} className="mb-2" />}
        <Events label={label} events={events} now={now} format={format} />
      </div>

      {/* Wide: the lanes. */}
      <div className="hidden @xl:block">
        {onNow && (
          <div className={GRID}>
            <span />
            <Scrub value={now} onChange={onNow} range={range} format={format} />
          </div>
        )}
        <Waterfall
          aria-label={label}
          items={items}
          range={range}
          format={format}
          expanded={open}
          onExpandedChange={setOpen}
          value={picked}
          onValueChange={(v) => {
            // A pick aims the map at its lane, and picking it again lets go, as a pressed row does.
            const to = v ? laneOf(v) : picked ? byId.get(picked) : undefined;
            if (to && to.id !== picked && picked) byId.get(picked)?.aim?.toggle();
            to?.aim?.toggle();
          }}
          getBarLabel={(item) => {
            const lane = laneOf(item.value);
            const leg = lane.legs.find((g) => `${lane.id}/${g.key}` === item.value);
            return leg ? years(leg) : lane.legs.map((g) => `${g.name}, ${years(g)}`).join(". ");
          }}
          className="text-[13px]"
        >
          <WaterfallHeaderRow className={`${GRID} items-end border-b border-faint pb-1 font-mono text-[10px] tracking-[.1em] text-muted uppercase`}>
            <WaterfallColumnHeader className="engrave text-left font-normal">{head}</WaterfallColumnHeader>
            <WaterfallColumnHeader aria-label="Years" className="relative h-4 font-normal">
              <WaterfallAxis maxTicks={5} className="absolute inset-0">
                {({ ticks }) =>
                  ticks.map((t) => (
                    <WaterfallTick key={t.time} time={t.time} // A tick at either end stays inside the axis.
                      className={`absolute left-(--waterfall-tick) tracking-normal whitespace-nowrap normal-case ${t.position < 4 ? "" : t.position > 96 ? "-translate-x-full" : "-translate-x-1/2"}`}
                    >
                      {t.label}
                    </WaterfallTick>
                  ))
                }
              </WaterfallAxis>
              <WaterfallMark time={now} className="sr-only">
                Now, {format(now)}
              </WaterfallMark>
            </WaterfallColumnHeader>
          </WaterfallHeaderRow>
          {visibleWaterfallRows(items, open).map(({ item, parent }) => {
            const lane = laneOf(item.value);
            const legs = parent ? lane.legs.filter((g) => `${lane.id}/${g.key}` === item.value) : lane.legs;
            return (
              <WaterfallRow
                key={item.value}
                value={item.value}
                style={{ "--tone": lane.tone ?? "var(--you)" } as React.CSSProperties}
                // Pressed again, a picked lane lets go: the Waterfall itself keeps a pick until another is made.
                onClick={() => picked === lane.id && lane.aim?.toggle()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && picked === lane.id && lane.aim?.toggle()}
                onPointerEnter={(e) => e.pointerType === "mouse" && lane.aim?.point(true)}
                onPointerLeave={(e) => e.pointerType === "mouse" && lane.aim?.point(false)}
                className={`${GRID} cursor-pointer items-center border-b border-faint/60 outline-offset-[-2px] hover:bg-ink/[.03] data-selected:bg-ink/[.06] ${lane.aim?.lit && !lane.aim.shown ? "bg-ink/[.03]" : ""}`}
              >
                <WaterfallRowHeader className={`flex min-w-0 items-center gap-2 py-2 text-left font-normal ${parent ? "pl-7 text-[12px] text-page-ink2" : ""}`}>
                  {!parent && (
                    <>
                      {/* The chevron turns as the lane opens into its legs. */}
                      <WaterfallIndicator className="w-2 shrink-0 text-muted transition-transform duration-200 in-data-expanded:rotate-90 motion-reduce:transition-none">›</WaterfallIndicator>
                      {lane.mark && <span className="shrink-0 text-(--tone)">{lane.mark}</span>}
                    </>
                  )}
                  <span className="min-w-0">
                    <span className={`block truncate ${parent ? "" : "font-semibold"}`}>{item.label}</span>
                    {!parent && lane.line && <span className="block truncate font-mono text-[10.5px] text-muted">{lane.line}</span>}
                  </span>
                </WaterfallRowHeader>
                <WaterfallBar className="relative h-full min-h-10">
                  {legs.map((g) => {
                    const d = DRAW[g.by];
                    const [a, b] = [at(g.from), at(g.to)];
                    // How much of this leg is behind now.
                    const done = g.to > g.from ? Math.min(1, Math.max(0, (now - g.from) / (g.to - g.from))) : now >= g.to ? 1 : 0;
                    return (
                      <Tip
                        key={g.key}
                        toggleable
                        text={`${g.name}: ${years(g)}.${g.by === "light" ? " At light’s speed." : ""}`}
                        trigger={
                          <span
                            style={{ left: `${a}%`, width: `max(${b - a}%, 3px)`, ...(g.tone ? { "--tone": g.tone } : {}) } as React.CSSProperties}
                            className={`absolute top-1/2 -translate-y-1/2 ${d.box} ${g.open ? "[mask-image:linear-gradient(90deg,black_60%,transparent)]" : ""}`}
                          >
                            {/* The part behind now is lit. It grows as now moves, in a fifth of a second, or at
                                once under reduced motion. */}
                            {d.fill && <i className={`absolute inset-y-0 left-0 transition-[width] duration-200 motion-reduce:transition-none ${d.fill}`} style={{ width: `${done * 100}%` }} />}
                            {/* Before and after its hit box: a thin leg is hard to point at. */}
                            <i className="absolute -inset-y-2 inset-x-0" />
                          </span>
                        }
                      />
                    );
                  })}
                  {/* The light that left with the craft, under its flight: a dotted run to the Year light is there. */}
                  {!parent && lane.light && (
                    <Tip
                      toggleable
                      text={`Light that left with it is there by ${format(lane.light.to)}. Nothing gets there sooner.`}
                      trigger={
                        <span style={{ left: `${at(lane.light.from)}%`, width: `${at(lane.light.to) - at(lane.light.from)}%` }} className="absolute top-[calc(50%+7px)] h-2 border-t border-dotted border-wait/70">
                          <i className="absolute -top-[3px] right-0 h-[5px] w-px bg-wait" />
                        </span>
                      }
                    />
                  )}
                  {/* Now, down every lane. It moves with the scrubber, at once. */}
                  <i aria-hidden style={{ left: `${at(now)}%` }} className="pointer-events-none absolute inset-y-0 w-px bg-ink/50" />
                </WaterfallBar>
              </WaterfallRow>
            );
          })}
        </Waterfall>
      </div>
    </div>
  );
}
