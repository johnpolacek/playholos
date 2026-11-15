import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@ui-sdk/react/timeline";
import { Toggle } from "@ui-sdk/react/toggle";
import { type Aim, aimed } from "@/components/picks";

// What happens, in the order of its Years, down one line, on ui-sdk's Timeline: the arrow keys move from one to the
// next, Home and End go to the ends, and a screen reader hears each one's name, its Year and its line. What is behind
// "now" is lit, what is ahead is faint, and "now" sits between them. Readings and news read this way, and on a phone
// the lanes of components/kit/lanes.tsx fold into it. 2026-11-15.

export interface Happens {
  key: string;
  /** Its Year, from Year 0. */
  at: number;
  /** What happens, as "Word home". */
  title: React.ReactNode;
  /** Whose it is, or what it means, under the title. */
  line?: React.ReactNode;
  /** Its color: a CSS color, as var(--other). */
  tone?: string;
  /** With an aim, the whole event is pressed to aim the map at it, as a row is. */
  aim?: Aim;
}

export function Events({
  label,
  events,
  now,
  format,
  className = "",
}: {
  /** What the list is, for a screen reader. */
  label: string;
  events: Happens[];
  /** The Year now. Without it, nothing is marked ahead or behind. */
  now?: number;
  format(year: number): string;
  className?: string;
}) {
  const sorted = [...events].sort((a, b) => a.at - b.at);
  // "Now" goes in after the last thing behind it.
  const split = now === undefined ? -1 : sorted.filter((e) => e.at <= now).length;
  const rows: (Happens | null)[] = split < 0 ? sorted : [...sorted.slice(0, split), null, ...sorted.slice(split)];
  return (
    <Timeline aria-label={label} orientation="vertical" loop={false} className={`flex flex-col ${className}`}>
      {rows.map((e) =>
        e === null ? (
          <TimelineItem key="now" value="now" status="current" className="group relative grid grid-cols-[14px_1fr] gap-x-3 pb-3 outline-offset-2">
            <TimelineMarker className="mt-[3px] size-3 rotate-45 justify-self-center rounded-[2px] bg-ink" />
            <TimelineConnector className="absolute top-5 bottom-0 left-[6.5px] w-px bg-faint group-last:hidden" />
            <TimelineTitle className="font-mono text-[10.5px] tracking-[.06em] text-ink">NOW · {format(now!)}</TimelineTitle>
          </TimelineItem>
        ) : (
          <TimelineItem
            key={e.key}
            value={e.key}
            status={now === undefined || e.at <= now ? "complete" : "upcoming"}
            style={{ "--tone": e.tone ?? "var(--you)" } as React.CSSProperties}
            className="group relative grid grid-cols-[14px_1fr] gap-x-3 pb-3 outline-offset-2 data-upcoming:text-page-ink2"
          >
            {/* Behind us, its dot is filled. Ahead, it is a ring. */}
            <TimelineMarker className="mt-[5px] size-2 justify-self-center rounded-full border border-(--tone) group-data-complete:bg-(--tone)" />
            <TimelineConnector className="absolute top-5 bottom-0 left-[6.5px] w-px bg-faint group-last:hidden" />
            <Face e={e} format={format} />
          </TimelineItem>
        ),
      )}
    </Timeline>
  );
}

/** One event's words. With an aim it is ui-sdk's Toggle, pressed while the map shows it. */
function Face({ e, format }: { e: Happens; format(year: number): string }) {
  const words = (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <TimelineTitle className="text-[14px] leading-snug font-medium">{e.title}</TimelineTitle>
        <TimelineTime className="shrink-0 font-mono text-[11px] text-muted tabular-nums">{format(e.at)}</TimelineTime>
      </span>
      {e.line && <TimelineDescription className="text-[12.5px] leading-snug text-page-ink2">{e.line}</TimelineDescription>}
    </>
  );
  if (!e.aim) return <div className="min-w-0">{words}</div>;
  return (
    <Toggle {...aimed(e.aim)} className={`-mx-1.5 -my-0.5 min-w-0 rounded-md px-1.5 py-0.5 text-left ${e.aim.shown || e.aim.lit ? "bg-ink/[.06]" : "hover:bg-ink/[.03]"}`}>
      {words}
    </Toggle>
  );
}
