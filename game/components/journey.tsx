import { Link } from "react-router";
import { type Aim, focusable, pointer, Story, WASH } from "@/components/picks";
import { realTime, tenths, YEAR_0 } from "@/lib/game/clock";
import { SENDS } from "@/lib/game/knocks";
import { buildSlug } from "@/lib/game/plan";

// A row on its whole journey, for our builds on Build and our messages on Reach. A message's thread starts the year we
// sent it, decades back, with a notch at Year 0, and a reply runs out and back. A build's starts at Year 0. Before
// Begin now waits at Year 0. After, it moves at 5 real minutes a Year, and what it passes is done. Chosen from
// explorations/projects-timeline.html, 04.

export interface Row {
  key: string;
  name: string;
  note: string;
  /** Years from Year 0. Null past 40 Years. */
  at: number | null;
  kind: "build" | "send" | "reply";
  /** A build's place in the order, from 1. */
  n?: number;
  /** A message's name, the decimal year we sent it, and its star's distance in light-years. */
  msg?: string;
  sent?: number;
  ly?: number;
}

const over = (row: Row, now: number) => row.at !== null && now >= row.at;

/** One row's whole journey, from the year we sent it or from Year 0. The head glows where the light is now. */
function Journey({ row, now, shown }: { row: Row; now: number; shown: boolean }) {
  const start = row.sent ?? YEAR_0;
  const total = YEAR_0 + (row.at ?? 40) - start;
  const p = Math.min(1, (YEAR_0 + now - start) / total);
  const zero = (YEAR_0 - start) / total;
  const done = over(row, now);
  const reply = row.kind === "reply";
  // A reply's first leg is ours going out, the second theirs coming home.
  const head = reply && p < 0.5 ? "you" : reply ? "other" : "you";
  const run = (from: number, to: number, c: string) => (
    <span
      className={`absolute top-[5.5px] h-[2px] rounded-full bg-linear-to-r ${c}`}
      style={{ left: `${from * 100}%`, width: `${Math.max(0, to - from) * 100}%` }}
    />
  );
  return (
    <>
      <div data-q="track" className="relative mt-[7px] h-[13px]">
        <span
          className={`absolute inset-x-0 top-1.5 border-t border-dashed ${row.at === null ? "border-muted/60" : "border-muted/30"}`}
        />
        {reply ? (
          <>
            {run(0, Math.min(p, 0.5), "from-you/5 to-you/95")}
            {run(0.5, p, "from-other/5 to-other/95")}
            <span
              className="absolute top-[6.5px] size-[7px] -translate-1/2 rounded-full bg-ink"
              style={{ left: "50%" }}
            />
          </>
        ) : (
          run(0, p, row.kind === "send" ? "from-you/5 to-you/95" : "from-you/20 to-you/95")
        )}
        {row.sent !== undefined && (
          <span className="absolute top-px h-[11px] border-l border-muted" style={{ left: `${zero * 100}%` }} />
        )}
        {row.at !== null && (
          <span
            className={`absolute top-[6.5px] left-full size-[9px] -translate-1/2 rotate-45 border transition-colors duration-700 ${done ? (reply ? "border-other bg-other" : "border-you bg-you") : "border-muted bg-panel"}`}
          />
        )}
        {!done && (
          <span className="absolute top-[6.5px] -translate-1/2" style={{ left: `${p * 100}%` }}>
            <span
              className={`absolute top-1/2 left-1/2 size-[15px] -translate-1/2 animate-pulse rounded-full ${head === "you" ? "bg-you/25" : "bg-other/25"}`}
            />
            <span
              className={`relative block size-[7px] rounded-full ${head === "you" ? "bg-you shadow-[0_0_10px_var(--you)]" : "bg-other shadow-[0_0_10px_var(--other)]"}`}
            />
          </span>
        )}
      </div>
      <div className="mt-[3px] flex justify-between gap-2.5 font-mono text-[9.5px] text-muted">
        <span>{row.sent !== undefined ? `sent ${Math.floor(row.sent)} · ${row.msg}` : "from Year 0"}</span>
        {row.ly !== undefined && (
          <span>
            {`${row.ly.toFixed(1)} ly${reply ? " there and back" : ""} `}
            <span className={shown ? "text-you" : ""}>↗</span>
          </span>
        )}
      </div>
    </>
  );
}

/** A row: a build's tap opens its page, and a message's shows it on the map and opens its story. */
export function Item({ row, now, began, aim }: { row: Row; now: number; began: boolean; aim?: Aim }) {
  const done = over(row, now);
  const build = row.kind === "build";
  const when =
    row.at === null
      ? "past Year 40"
      : done
        ? build
          ? "done"
          : "landed"
        : began
          ? `in ${realTime(row.at - now)}`
          : `Year ${tenths(row.at)}`;
  const head = (
    <div className="flex min-w-0 items-baseline justify-between gap-3">
      <span className="min-w-0 text-[13.5px] leading-snug">
        <b className={`font-medium ${row.kind === "reply" ? "text-other" : ""}`}>
          {row.n ? `${row.n} · ${row.name}` : row.name}
        </b>
        <span className="block text-[12px] text-muted">{row.note}</span>
      </span>
      <span className={`shrink-0 text-right font-mono text-[11px] tabular-nums ${done ? "text-you" : "text-page-ink2"}`}>
        {when}
      </span>
      {build && (
        <span aria-hidden className="shrink-0 self-center text-muted">
          ›
        </span>
      )}
    </div>
  );
  if (build)
    return (
      <li data-q="row" data-key={row.key} className="border-t border-rowline">
        <Link to={`/build/${buildSlug(row.name)}`} className="block py-2">
          {head}
          <Journey row={row} now={now} shown={false} />
        </Link>
      </li>
    );
  return (
    <li
      data-q="row"
      data-key={row.key}
      {...(aim && pointer(aim))}
      {...(aim && focusable(aim))}
      className={`group border-t border-rowline py-2 outline-none transition-[background-color,box-shadow] duration-200 ${aim ? "cursor-pointer" : ""} ${aim?.lit ? WASH : ""}`}
    >
      {head}
      <Journey row={row} now={now} shown={!!aim?.shown} />
      {row.msg && SENDS[row.msg] && (
        <Story
          lines={[
            ["HOLDS", SENDS[row.msg].holds],
            ["WHY", SENDS[row.msg].why],
            ["FROM", SENDS[row.msg].from],
            ["SINCE", SENDS[row.msg].since],
          ]}
          tone={row.kind === "reply" ? "other" : "you"}
          open={!!aim?.shown}
        />
      )}
    </li>
  );
}
