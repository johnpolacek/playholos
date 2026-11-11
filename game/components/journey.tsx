import { Link } from "react-router";
import { type Aim, focusable, pointer, Story, WASH } from "@/components/picks";
import { BeamMark, BuildMark, buildBlue, RecordMark } from "@/components/marks";
import { OpensLine } from "@/components/opens";
import { Face } from "@/components/tab-head";
import { span, yearText, YEAR_0, lyOf } from "@/lib/game/clock";
import { SENDS } from "@/lib/game/knocks";
import { buildSlug, PAST } from "@/lib/game/plan";
import { starName } from "@/lib/game/leads";

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
  /** A craft is a message carried, not beamed: Voyager 1's Golden Record. Heard is a signal from another star, caught.
   *  A flight is our sails or probe, from leaving to their word home, under its build's mark: its key. */
  kind: "build" | "send" | "reply" | "craft" | "heard" | "flight";
  /** A build ordered in play: the Year we ordered it, where its thread starts. */
  from?: number;
  /** What opening the row shows, as terms and their lines, when it isn't one of our messages. */
  story?: [string, string | undefined][];
  /** Marked new until opened. */
  fresh?: boolean;
  /** A message's name, the decimal year we sent it, and its star's distance in light-years. */
  msg?: string;
  sent?: number;
  ly?: number;
  /** Only a range, for a far warm glow: shown in place of ly. Playtest 2026-11-01. */
  range?: [number, number];
  /** A bullet at a tenth of light speed, ours or theirs: its star's real distance, since `ly` is its Years of flight.
   *  2026-10-28. */
  bullet?: { d: number; theirs?: boolean };
}

const over = (row: Row, now: number) => row.at !== null && now >= row.at;

/** One row's whole journey, from the year we sent it or from Year 0. The head glows where the light is now. */
function Journey({ row, now, shown }: { row: Row; now: number; shown: boolean }) {
  const start = row.sent ?? YEAR_0 + (row.from ?? 0);
  const total = YEAR_0 + (row.at ?? 40) - start;
  const p = Math.min(1, (YEAR_0 + now - start) / total);
  const zero = (YEAR_0 - start) / total;
  const done = over(row, now);
  const reply = row.kind === "reply";
  const theirs = row.kind === "heard";
  // A reply's first leg is ours going out, the second the soonest one could come home. Amber is for word truly heard,
  // so a reply nobody sent stays ours, its leg home faint. Playtest 2026-11-02: amber made an empty window read as news.
  const head = theirs ? "other" : reply ? "wait" : "you";
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
            {run(0, Math.min(p, 0.5), "from-wait/5 to-wait/95")}
            {run(0.5, p, "from-muted/5 to-muted/60")}
            <span
              className="absolute top-[6.5px] size-[7px] -translate-1/2 rounded-full bg-ink"
              style={{ left: "50%" }}
            />
          </>
        ) : (
          run(0, p, row.kind === "build" ? "from-you/20 to-you/95" : theirs ? "from-other/5 to-other/95" : "from-you/5 to-you/95")
        )}
        {row.sent !== undefined && (
          <span className="absolute top-px h-[11px] border-l border-muted" style={{ left: `${zero * 100}%` }} />
        )}
        {row.at !== null && (
          <span
            className={`absolute top-[6.5px] left-full size-[9px] -translate-1/2 rotate-45 border transition-colors duration-700 ${done ? (theirs ? "border-other bg-other" : reply ? "border-muted bg-panel" : "border-you bg-you") : "border-muted bg-panel"}`}
          />
        )}
        {!done && (
          <span className="absolute top-[6.5px] -translate-1/2" style={{ left: `${p * 100}%` }}>
            <span
              className={`absolute top-1/2 left-1/2 size-[15px] -translate-1/2 animate-pulse rounded-full ${{ you: "bg-you/25", wait: "bg-wait/25", other: "bg-other/25" }[head]}`}
            />
            <span
              className={`relative block size-[7px] rounded-full ${{ you: "bg-you shadow-[0_0_10px_var(--you)]", wait: "bg-wait shadow-[0_0_10px_var(--wait)]", other: "bg-other shadow-[0_0_10px_var(--other)]" }[head]}`}
            />
          </span>
        )}
      </div>
      <div className="mt-[3px] flex justify-between gap-2.5 font-mono text-[9.5px] text-muted">
        <span>
          {row.bullet ? row.msg : row.sent !== undefined ? `${row.sent > YEAR_0 + now ? "leaves" : row.kind === "flight" ? "left" : "sent"} ${row.kind === "flight" ? `Year ${yearText(row.sent - YEAR_0)}` : Math.floor(row.sent)} · ${row.msg}` : `from Year ${yearText(row.from ?? 0)}`}
        </span>
        {row.bullet ? (
          <span>
            {`${lyOf(row.bullet.d)} ly at a tenth of light speed`}
            {!row.bullet.theirs && <span className={shown ? "text-you" : ""}> ↗</span>}
          </span>
        ) : row.ly !== undefined && (
          <span>
            {`${row.range ? `${lyOf(row.range[0])} to ${lyOf(row.range[1])}` : lyOf(row.ly)} ly${reply ? " there and back" : ""}`}
            {!theirs && <span className={shown ? "text-you" : ""}> ↗</span>}
          </span>
        )}
      </div>
    </>
  );
}

/** A row, with Scan's face: a build's tap opens its page, and a message's shows it on the map and opens its story. A
 *  build counts down to done in play time, as Scan's leads count light's time. */
export function Item({
  row,
  now,
  began,
  aim,
  grip,
  point,
  style,
  counted,
  children,
}: {
  row: Row;
  now: number;
  began: boolean;
  aim?: Aim;
  /** A build's pointer and focus, which preview it. */
  point?: React.HTMLAttributes<HTMLElement>;
  /** A build's handle for reordering, under its mark, outside its link. */
  grip?: React.ReactNode;
  style?: React.CSSProperties;
  /** Its line counts the Years itself, so the right says only once it's done. 2026-11-02. */
  counted?: boolean;
  /** What sits under its journey, as a craft's call back. */
  children?: React.ReactNode;
}) {
  const done = over(row, now);
  const theirs = row.kind === "heard";
  const build = row.kind === "build";
  const when =
    row.kind === "heard" && row.at !== null
      ? `Year ${yearText(row.at)}`
      : row.kind === "craft" && row.at !== null
      ? `a star in ${Math.round(row.at / 1000)},000 Years`
      : row.at === null
        ? PAST
        : done
          ? build
            ? "done"
            : row.kind === "flight"
              ? "home"
              : row.kind === "reply"
                // The soonest a reply could come, gone by. It read "landed" after an empty window. Playtest 2026-11-01.
                ? "passed"
                : "landed"
          : counted
            ? ""
          : build
            ? span(row.at - now)
            : began
              ? `in ${span(row.at - now)}`
              : `Year ${yearText(row.at)}`;
  const head = (
    <Face
      mark={
        build ? (
          <BuildMark name={row.name} />
        ) : row.kind === "flight" ? (
          <BuildMark name={row.key} />
        ) : row.kind === "craft" ? (
          <RecordMark still={!aim?.lit} />
        ) : (
          // A message moves only while it is pointed at or shown, so the list stays calm.
          <BeamMark back={row.kind === "reply" || theirs} still={!aim?.lit} />
        )
      }
      tone={theirs ? "text-other" : row.kind === "reply" ? "text-wait" : "text-you"}
      name={<b className="font-semibold">{starName(row.name)}</b>}
      line={
        row.fresh ? (
          <span className="text-ink">
            <span className="mr-1.5 rounded-full bg-other px-1.5 py-px font-mono text-[9px] tracking-[.08em] text-paper">NEW</span>
            {row.note}
          </span>
        ) : (
          row.note
        )
      }
      right={<span className={done ? (theirs ? "text-other" : row.kind === "reply" ? "text-muted" : "text-you") : ""}>{when}</span>}
      more={build}
    />
  );
  // The thread runs under the words, clear of the mark. A build's color stands in for our blue, so its mark, thread
  // and done take it.
  if (build)
    return (
      <li data-q="row" data-key={row.key} style={{ ...buildBlue(row.name), ...style }} className="relative border-t border-faint bg-panel">
        <Link to={`/play/build/${buildSlug(row.name)}`} className="block py-2.5" {...point}>
          {head}
          <div className="pl-7">
            <Journey row={row} now={now} shown={false} />
          </div>
        </Link>
        <OpensLine name={row.name} />
        {grip}
      </li>
    );
  return (
    <li
      data-q="row"
      data-key={row.key}
      {...(aim && pointer(aim))}
      {...(aim && focusable(aim))}
      className={`group border-t border-faint py-2.5 outline-none transition-[background-color,box-shadow] duration-200 ${aim ? "cursor-pointer" : ""} ${aim?.lit ? WASH : ""}`}
    >
      {head}
      <div className="pl-7">
        <Journey row={row} now={now} shown={!!aim?.shown} />
      </div>
      {children}
      {row.story && (
        <div className="pl-7">
          <Story lines={row.story} tone="other" open={!!aim?.shown} />
        </div>
      )}
      {row.msg && SENDS[row.msg] && (
        <div className="pl-7">
          <Story
            lines={[
              ["HOLDS", SENDS[row.msg].holds],
              ["WHY", SENDS[row.msg].why],
              ["FROM", SENDS[row.msg].from],
              ["SINCE", SENDS[row.msg].since],
            ]}
            tone="you"
            open={!!aim?.shown}
          />
        </div>
      )}
    </li>
  );
}
