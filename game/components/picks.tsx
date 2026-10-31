import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { CostLine, previews, usePreview } from "@/components/costs";
import { BuildMark, buildTone } from "@/components/marks";
import { OpensLine } from "@/components/opens";
import { Face, ListHead } from "@/components/tab-head";
import { span, tenths } from "@/lib/game/clock";
import { FOUND, rockOf } from "@/lib/game/rocks";
import { WATCHED } from "@/lib/sim/minds";
import { colonyOf, harmOrders, hitsAt, restoreOf, survivorAt } from "@/lib/game/hits";
import { target } from "@/lib/game/sends";
import type { EarthPast } from "@/lib/game/past";
import { BUILDS, buildSlug, EMPTY, inUse, lacks, moves, needs, openAt, PAST, schedule, sharesAt, takenAt } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import type { Plan } from "@/lib/game/types";

// Planning our waking, on the Build tab: what starts at Year 0. The Mind's walk through what it would start with
// queues nothing unless we say. A tap on a build opens its page, where we add it to the queue, and the queue above
// draws it. Every change is saved as it is made.

/** The plan, and a change to it, saved at once. */
export function usePlan() {
  const { save, setPlan } = useGame();
  const plan = save?.plan ?? EMPTY;
  return { plan, change: (f: (p: Plan) => Plan) => setPlan(f(plan)) };
}

// This game's Earth, fetched once a seed and shared: the top bar's count needs it too, on every tab. A failed fetch
// is tried again on the next screen that asks.
const earths = new Map<number, Promise<EarthPast | undefined>>();

function useEarth() {
  const { save } = useGame();
  const [past, setPast] = useState<EarthPast>();
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    let live = true;
    if (!earths.has(seed))
      earths.set(
        seed,
        fetch(`/api/earth?seed=${seed}`)
          .then((r) => (r.ok ? r.json() : undefined))
          .catch(() => undefined)
          .then((p) => (p ? p : void earths.delete(seed))),
      );
    earths.get(seed)!.then((p) => live && setPast(p));
    return () => void (live = false);
  }, [seed]);
  return past;
}

// The Year we found the watcher where a craft can reach it, as Scan hears it from the server: it opens the Close Look,
// as a rock found opens the deflector. Kept here, since Scan's leads read the schedule too. 2026-10-30.
let watched: number | null = null;
const hearing = new Set<() => void>();
export function setWatched(at: number | null) {
  if (at === watched) return;
  watched = at;
  hearing.forEach((f) => f());
}
const hear = (f: () => void) => (hearing.add(f), () => void hearing.delete(f));
// And the ladder's strike once it has landed, as Scan hears it: only the server's world knows who fires. 2026-10-30.
let struck: { lands: number; mt: number } | null = null;
export function setStruck(at: { lands: number; mt: number } | null) {
  if (at?.lands === struck?.lands) return;
  struck = at;
  hearing.forEach((f) => f());
}

/** This game's Earth, from the server, and when each queued build is done with the compute it has. Until the Earth
 *  comes, the dates are at today's compute. */
export function useSchedule() {
  const { save } = useGame();
  const past = useEarth();
  const plan = save?.plan ?? EMPTY;
  const scale = past?.compute ?? 1;
  // A rock coming opens the Rock Deflector the Year a survey finds it, as a build opens once another is done.
  const seed = save?.seed;
  const found = seed === undefined ? null : (rockOf(seed)?.found ?? null);
  const seenAt = useSyncExternalStore(hear, () => watched);
  const bullet = useSyncExternalStore(hear, () => struck);
  const base = useMemo(
    (): Record<string, number | null> => ({ ...schedule(plan, scale), [FOUND]: found, [WATCHED]: seenAt }),
    [plan, scale, found, seenAt],
  );
  // Strikes landed on us by now cut our thought from the Year each landed, and only from then. 2026-10-28.
  const { year } = useGame();
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  const hits = useMemo(
    () => (tenth === null ? [] : hitsAt(plan, seed, base, tenth, bullet)),
    [plan, seed, base, tenth, bullet],
  );
  // Earth lost: our backup wakes where something can run it, and regrows. 2026-10-28.
  const { lives, restore } = useMemo(() => {
    const end = hits.find((h) => !h.screened && h.harm.ends);
    const lives = end ? survivorAt(base, end.lands, colonyOf(plan, scale, (n) => target(n)?.d)) : null;
    return { lives: lives?.name ?? null, restore: end && lives ? restoreOf(lives.name, base, end.lands) : null };
  }, [hits, base, plan, scale]);
  const harm = useMemo(() => harmOrders(hits, restore), [hits, restore]);
  const done = useMemo(
    (): Record<string, number | null> => (harm.length ? { ...schedule(plan, scale, harm), [FOUND]: found, [WATCHED]: seenAt } : base),
    [harm, plan, scale, found, seenAt, base],
  );
  return { past, scale, done, hits, lives, restore };
}

/** How much of our compute the plan would use at Year 0, how much more it would need than we have, and whether it is
 *  all in use with none short, which is enough. Over isn't enough: the last in line get less than they need.
 *  2026-10-23. Unknown until this game's Earth comes. */
export function useCompute() {
  const { save } = useGame();
  const past = useEarth();
  const plan = save?.plan ?? EMPTY;
  const { used, short } = useMemo(
    () => (past ? { used: inUse(plan, past.compute), short: sharesAt(plan, past.compute, 0).short } : { used: 0, short: 0 }),
    [plan, past],
  );
  const over = short > 0.005;
  return { known: !!past, used, short, over, full: used > 0.995 && !over };
}

/** A build in or out of the queue. In, it goes last. */
export const toggleBuild = (name: string) => (p: Plan) => ({
  ...p,
  builds: p.builds.includes(name) ? p.builds.filter((b) => b !== name) : [...p.builds, name],
});

/** A row's mark: its place in the order, or an open circle. Pointed at, the row shows what a tap does. */
export function Mark({ n, look = false }: { n: number | null; look?: boolean }) {
  const on = n !== null;
  const fill = look ? "bg-other" : "bg-you";
  return (
    <span
      aria-hidden
      className={`relative flex size-[18px] shrink-0 translate-y-[2px] items-center justify-center rounded-full font-mono text-[10px] ${on ? `${fill} text-paper` : "border border-faint text-muted"}`}
    >
      <span className="transition-opacity group-hover:opacity-0">{on ? (look ? "" : n) : ""}</span>
      <span className="absolute opacity-0 transition-opacity group-hover:opacity-100">{on ? "−" : "+"}</span>
    </span>
  );
}

/** A row that shows on the map: whether it is the one shown, or lit, and what picks it and points at it. */
export interface Aim {
  shown: boolean;
  lit: boolean;
  toggle(): void;
  point(on: boolean): void;
}

/** A lit row's wash reaches past its edges without moving them. */
export const WASH = "bg-ink/[.04] shadow-[-10px_0_0_rgb(230_227_219/.04),10px_0_0_rgb(230_227_219/.04)]";

/** A row's tap and mouse, which pick it and point at it. */
export const pointer = (aim: Aim): React.HTMLAttributes<HTMLElement> => ({
  onClick: aim.toggle,
  onPointerEnter: (e) => void (e.pointerType === "mouse" && aim.point(true)),
  onPointerLeave: (e) => void (e.pointerType === "mouse" && aim.point(false)),
});

/** A row's keys, for whatever in it takes the focus. */
export const focusable = (aim: Aim): React.HTMLAttributes<HTMLElement> => ({
  role: "button",
  tabIndex: 0,
  "aria-pressed": aim.shown,
  onKeyDown: (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    aim.toggle();
  },
  onFocus: (e) => void (e.currentTarget.matches(":focus-visible") && aim.point(true)),
  onBlur: () => aim.point(false),
});

/** A message's or a build's story, opened while the map shows it, as terms and their lines. */
export function Story({
  lines,
  tone,
  open,
}: {
  lines: [string, string | undefined][];
  tone: "you" | "other";
  open: boolean;
}) {
  const term = "pt-[3px] font-mono text-[9.5px] tracking-[.08em] text-muted";
  return (
    <div
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <dl
          className={`mt-2.5 mb-0.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-l pl-3 text-[12.5px] leading-snug ${tone === "other" ? "border-other/50" : "border-you/50"}`}
        >
          {lines
            .filter((l): l is [string, string] => !!l[1])
            .map(([dt, dd], i) => (
              <div key={dt} className="contents">
                <dt className={term}>{dt}</dt>
                <dd className={i > 1 ? "text-page-ink2" : ""}>{dd}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}

/** A build's story, in its terms. */
export const buildStory = (name: string): [string, string | undefined][] => {
  const s = SITES[name]?.story;
  return s
    ? [
        ["WE HAVE", s.have],
        ["WHERE", s.where],
        ["WHY", s.why],
        ["TAKES", s.takes],
        ["BEFORE US", s.before],
      ]
    : [];
};

/** What we could start and haven't queued, each mark in its color, dimmer, and when it would be done if we queued it
 *  now, last in line, with its share of our compute, its matter and what it would slow, and what it opens under it.
 *  Pointed at, the ring above shows it queued. A tap on a build opens its page. */
export function Unqueued({ scale, className = "" }: { scale: number; className?: string }) {
  const { plan } = usePlan();
  const [, preview] = usePreview();
  const builds = BUILDS.filter((b) => !plan.builds.includes(b.name));
  const by = useMemo(
    () =>
      Object.fromEntries(
        BUILDS.filter((b) => !plan.builds.includes(b.name)).map((b) => [b.name, moves(plan, scale, b.name)]),
      ),
    [plan, scale],
  );
  if (!builds.length) return null;

  return (
    <>
      <ListHead
        data-q="row"
        left={`${plan.builds.length ? "We could also start" : "We could start"} · ${builds.length}`}
        right="Done in"
        className={className}
      />
      <ul data-q="row" className="mt-1">
        {builds.map((b) => {
          // A Seed Ship waits for its drive and fuel in our order, and says which.
          const lacking = lacks(plan, b.name);
          return (
            <li key={b.name} className="border-t border-faint">
              <Link
                to={`/build/${buildSlug(b.name)}`}
                className="block py-2.5"
                {...(!lacking.length && previews(b.name, preview))}
              >
                <Face
                  mark={<BuildMark name={b.name} />}
                  tone={buildTone(b.name, false)}
                  name={<b className="font-semibold">{b.name}</b>}
                  line={`${b.what}${lacking.length ? ` Needs ${needs(lacking)} in our order first.` : ""}`}
                  right={lacking.length ? "" : by[b.name].at == null ? PAST : span(by[b.name].at!)}
                />
                {!lacking.length && <CostLine name={b.name} move={by[b.name]} />}
              </Link>
              <OpensLine name={b.name} />
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** In play, what our builds have opened and we haven't ordered, as Unqueued has them: when each would be done if we
 *  ordered it now, last in line, what it would take and slow, and what it opens. Pointed at, the ring shows it
 *  ordered. A tap opens its page, where we order it. 2026-10-22. */
export function Opened({ scale, now, className = "" }: { scale: number; now: number; className?: string }) {
  const { plan } = usePlan();
  const { done } = useSchedule();
  const [, preview] = usePreview();
  const at = tenths(now);
  const open = useMemo(() => openAt(plan, done, at), [plan, done, at]);
  const by = useMemo(
    () => Object.fromEntries(open.map((b) => [b.name, moves(plan, scale, b.name, at)])),
    [open, plan, scale, at],
  );
  if (!open.length) return null;
  return (
    <>
      <ListHead left={`Open to start · ${open.length}`} right="Done in" className={className} />
      <ul className="mt-1">
        {open.map((b) => (
          <li key={b.name} className="border-t border-faint">
            <Link to={`/build/${buildSlug(b.name)}`} className="block py-2.5" {...previews(b.name, preview)}>
              <Face
                mark={<BuildMark name={b.name} />}
                tone={buildTone(b.name, false)}
                name={<b className="font-semibold">{b.name}</b>}
                line={takenAt(plan, b.name) === null ? b.what : `${b.what} Taken back at Year ${takenAt(plan, b.name)}, its work kept.`}
                right={by[b.name].at == null ? PAST : span(by[b.name].at! - at)}
              />
              <CostLine name={b.name} move={by[b.name]} at={at} />
            </Link>
            <OpensLine name={b.name} />
          </li>
        ))}
      </ul>
    </>
  );
}
