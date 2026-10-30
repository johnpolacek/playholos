import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { buildColor } from "@/components/marks";
import { toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { span, tenths } from "@/lib/game/clock";
import {
  buildOf,
  ceiling,
  HELD,
  kt,
  LAUNCH_LIFT,
  computeAt,
  needOf,
  openAt,
  ordered,
  orderLater,
  type moves,
  searchOf,
  sharesAt,
  SPARE_LIFT,
} from "@/lib/game/plan";
import { combedAt } from "@/lib/sim/works";
import { prefersReducedMotion } from "@/lib/motion";

// What our order costs, drawn on Build: all our compute as a ring, the matter we hold in orbit as blocks, and the
// ceiling energy sets on our compute. Pointing at a build we could start shows it queued. Chosen from
// explorations/build-costs.html, 02, with the ceilings shown, 2026-10-22.

const pct = (x: number) => `${Math.round(x * 100)}%`;
const tenth = (n: number) => `${Math.round(n * 10) / 10} kt`;
const the = (name: string) => (name === "Thought Fields" ? name : `the ${name}`);

/** The build pointed at in a list, which the ring shows queued. */
const Preview = createContext<[string | null, (name: string | null) => void]>([null, () => {}]);
export const usePreview = () => useContext(Preview);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const state = useState<string | null>(null);
  return <Preview.Provider value={state}>{children}</Preview.Provider>;
}

/** A row's pointer and focus, which preview its build. */
export function previews(name: string, set: (name: string | null) => void): React.HTMLAttributes<HTMLElement> {
  return {
    onPointerEnter: (e) => void (e.pointerType === "mouse" && set(name)),
    onPointerLeave: (e) => void (e.pointerType === "mouse" && set(null)),
    onFocus: (e) => void (e.currentTarget.matches(":focus-visible") && set(name)),
    onBlur: () => set(null),
  };
}

type Kind = "studies" | "fields" | "need" | "spare" | "idle" | "short";
interface Seg {
  x: number;
  w: number;
  kind: Kind;
  c: string;
}

/** Keyed arcs, eased from where they are to where they go. One entering grows from nothing at its place, and one
 *  leaving shrinks where it is. */
function useTweened(target: Map<string, Seg>) {
  const [shown, setShown] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const keys = new Set([...from.keys(), ...target.keys()]);
    const dur = prefersReducedMotion() ? 0 : 520;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      const e = 1 - (1 - p) ** 3;
      const out = new Map<string, Seg>();
      for (const k of keys) {
        const z = target.get(k) ?? { ...from.get(k)!, w: 0 };
        const a = from.get(k) ?? { ...z, w: 0 };
        out.set(k, { ...z, x: a.x + (z.x - a.x) * e, w: a.w + (z.w - a.w) * e });
      }
      cur.current = p < 1 ? out : target;
      setShown(cur.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

/** An arc on the ring from one share of the way round to another, from the top, clockwise. */
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) =>
    `${(80 + r * Math.sin(a * 2 * Math.PI)).toFixed(2)} ${(80 - r * Math.cos(a * 2 * Math.PI)).toFixed(2)}`;
  a1 = Math.min(a1, a0 + 0.9999);
  return `M${p(a0)}A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${p(a1)}`;
}

/** All our compute, round: our Mind's studies, a campus under way, what each build needs, solid, and the spare
 *  pushing it, flowing. What we're short runs a second lap outside, dashed. */
function Ring({ share, hot, searching }: { share: ReturnType<typeof sharesAt>; hot: string | null; searching: boolean }) {
  const target = useMemo(() => {
    const segs = new Map<string, Seg>();
    let x = 0;
    const put = (k: string, w: number, c: string, kind: Kind) => {
      if (w > 0.0005) segs.set(k, { x, w, c, kind });
      x += w;
    };
    put("studies", share.studies, "var(--muted)", "studies");
    put("fields", share.fields, "var(--think)", "fields");
    for (const p of share.parts) put(`n:${p.name}`, p.need, buildColor(p.name), "need");
    for (const p of share.parts) put(`s:${p.name}`, p.spare, buildColor(p.name), "spare");
    // What builds can't use closes the ring: combing old recordings while the search runs, else idle. 2026-10-29.
    put("idle", share.idle, searching ? "var(--you)" : "var(--faint)", "idle");
    x = 0;
    for (const p of share.parts) put(`h:${p.name}`, p.short, buildColor(p.name), "short");
    return segs;
  }, [share, searching]);
  const segs = useTweened(target);
  return (
    <svg viewBox="0 0 160 160" className="absolute inset-0 overflow-visible" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="none" stroke="var(--track)" strokeWidth="12" />
      {[...segs].map(([k, s]) => {
        if (s.w < 0.002) return null;
        const gap = s.w > 0.02 ? 0.004 : 0;
        const d = arc(s.kind === "short" ? 75 : 62, s.x + gap, s.x + s.w - gap);
        if (s.kind === "need")
          return <path key={k} d={d} fill="none" stroke={s.c} strokeWidth={hot === k.slice(2) ? 15 : 12} />;
        if (s.kind === "idle")
          return <path key={k} d={d} fill="none" stroke={s.c} strokeOpacity={searching ? ".3" : "1"} strokeWidth="12" />;
        if (s.kind === "studies") return <path key={k} d={d} fill="none" stroke={s.c} strokeOpacity=".45" strokeWidth="12" />;
        if (s.kind === "fields")
          return <path key={k} d={d} fill="none" stroke={s.c} strokeWidth="12" strokeDasharray="1.5 1.5" />;
        if (s.kind === "spare")
          return (
            <g key={k}>
              <path d={d} fill="none" stroke={s.c} strokeOpacity=".22" strokeWidth="12" />
              <path
                d={d}
                fill="none"
                stroke={s.c}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="0.1 7.9"
                className="animate-flow motion-reduce:animate-none"
              />
            </g>
          );
        return <path key={k} d={d} fill="none" stroke={s.c} strokeWidth="5" strokeDasharray="3 3" />;
      })}
    </svg>
  );
}

/** The ring's key: each build with what it needs, the spare pushing it and what it's short, a campus under way, our
 *  Mind's studies, and what is left, searching or idle, so the key adds up to the whole ring. Many share a line each,
 *  so the ring stays in view. */
function Key({ share, searching }: { share: ReturnType<typeof sharesAt>; searching: boolean }) {
  const idle = share.idle > 0.005;
  const tight = share.parts.length + (share.fields ? 1 : 0) + (idle ? 1 : 0) > 4;
  const item = (c: string, name: string, line: React.ReactNode) => (
    <div
      key={name}
      className={`grid grid-cols-[9px_1fr] items-baseline gap-x-[7px] ${tight ? "text-[11px] leading-tight" : "text-xs leading-snug"}`}
    >
      <i className="size-2 rounded-full" style={{ background: c }} />
      <div className={tight ? "truncate" : ""}>
        {name}
        {tight ? " " : <br />}
        <span className="text-muted">{line}</span>
      </div>
    </div>
  );
  const em = (x: number, late = false) => (
    <em className={`font-mono text-[11px] not-italic ${late ? "text-other" : "text-ink"}`}>{pct(x)}</em>
  );
  return (
    <div className={`flex min-w-0 flex-col ${tight ? "gap-[3px]" : "gap-1.5"}`}>
      {share.parts.map((p) =>
        item(
          buildColor(p.name),
          p.name,
          <>
            needs {em(p.need + p.short)}
            {p.spare > 0.005 && <>, sped by {em(p.spare)}</>}
            {p.fastest && <>, at its fastest</>}
            {p.short > 0.005 && <>, {em(p.short, true)} short</>}
          </>,
        ),
      )}
      {share.fields > 0 && item("var(--think)", "Thought Fields", <>{em(share.fields)} while a campus builds</>)}
      {item("var(--muted)", "Our Mind’s studies", em(share.studies))}
      {idle &&
        (searching
          ? item("color-mix(in srgb, var(--you) 45%, transparent)", "Combing old recordings", <>{em(share.idle)}, for signals no one caught</>)
          : item("var(--faint)", "Idle", <>{em(share.idle)}, more than our builds can use</>))}
    </div>
  );
}

/** The matter we hold at Year 0, as 20 blocks of 1 kt, each our builds take in its color. One a build we point at
 *  would take blinks. Past 20, lift brings the rest. */
function Blocks({ builds, adding }: { builds: string[]; adding: string | null }) {
  const blocks = builds.flatMap((n) =>
    Array.from({ length: Math.ceil(buildOf(n)?.kt ?? 0) }, () => ({ c: buildColor(n), blink: n === adding })),
  );
  const spent = builds.reduce((s, n) => s + (buildOf(n)?.kt ?? 0), 0);
  return (
    <div className="mt-4">
      <div className="flex justify-between font-mono text-[10px] tracking-[.1em] text-muted">
        <span>MATTER IN ORBIT AT YEAR 0</span>
        {spent > HELD ? <span className="text-other">{tenth(spent - HELD)} MORE FROM LIFT</span> : <span>{tenth(HELD - spent)} FREE</span>}
      </div>
      <div className="mt-1.5 grid grid-cols-[repeat(20,1fr)] gap-[3px]">
        {Array.from({ length: HELD }, (_, i) => {
          const b = blocks[i];
          return (
            <i
              key={i}
              style={b && ({ "--c": b.c } as React.CSSProperties)}
              className={`aspect-square rounded-[1.5px] border transition-colors duration-300 ${!b ? "border-faint" : b.blink ? "animate-blink border-(--c) motion-reduce:animate-none motion-reduce:bg-(--c)/45" : "border-(--c) bg-(--c)"}`}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-xs leading-snug text-muted">
        Lift brings {SPARE_LIFT} kt a Year, and the Launch Complex {LAUNCH_LIFT} kt more. Megatonnes must come from the Moon.
      </p>
    </div>
  );
}

/** The ceiling energy sets: our compute over the Years, as a share of Earth's grid. Each campus of Thought Fields adds
 *  half again, until no more fit. Without it, our compute stays where it is, and the climb it would make is dashed. */
function Ceiling({ queued, now, began }: { queued: boolean; now: number; began: boolean }) {
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const { campuses, step, room } = useMemo(() => ceiling(plan, scale), [plan, scale]);
  const last = campuses.at(-1) ?? 0;
  const end = Math.max(12, Math.ceil(last) + 2);
  const X = (y: number) => (y / end) * 300;
  const Y = (e: number) => 60 - e * 52;
  const at = (k: number) => step ** k / room;
  let climb = `M0 ${Y(at(0))}`;
  campuses.forEach((y, k) => (climb += `H${X(y)}V${Y(at(k + 1))}`));
  climb += `H300`;
  const grown = campuses.filter((y) => y <= now).length;
  const times = Math.round(step ** campuses.length);
  const c = queued ? "var(--think)" : "var(--muted)";
  return (
    <div className="mt-4">
      <div className="flex justify-between font-mono text-[10px] tracking-[.1em] text-muted">
        <span>ENERGY CAPS OUR COMPUTE</span>
        <span>EARTH’S GRID</span>
      </div>
      <div className="relative mt-1.5 h-16">
        <svg viewBox="0 0 300 64" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <path d={`M0 ${Y(1)}H300`} stroke="var(--muted)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          <path d="M0 60H300" stroke="var(--faint)" vectorEffect="non-scaling-stroke" />
          {!queued && <path d={`M0 ${Y(at(0))}H300`} stroke="var(--think)" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
          <path
            d={climb}
            fill="none"
            stroke={c}
            strokeWidth={queued ? 2 : 1}
            strokeDasharray={queued ? undefined : "3 3"}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {began && (
          <span
            className="absolute size-[7px] -translate-1/2 rounded-full bg-think shadow-[0_0_10px_var(--think)]"
            style={{ left: `${(Math.min(now, end) / end) * 100}%`, top: `${Y(queued ? at(grown) : at(0)) / 0.64}%` }}
          />
        )}
        <span
          className={`absolute left-0 pt-1 font-mono text-[10px] whitespace-nowrap ${queued ? "text-think" : "text-muted"}`}
          style={{ top: `${Y(at(campuses.length)) / 0.64}%` }}
        >
          {times}× by Year {Math.round(last)}
        </span>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9.5px] text-muted">
        <span>Year 0</span>
        <span>Year {end}</span>
      </div>
      <p className="mt-1.5 text-xs leading-snug text-muted">
        {queued && began && grown === campuses.length
          ? `Thought Fields filled Earth’s grid at Year ${Math.round(last)}. Our compute draws ${pct(at(campuses.length))} of it, ${times}× what it was at Year 0.`
          : queued && began
            ? `${grown ? `Thought Fields is growing our compute, ${Math.round(step ** grown * 10) / 10}× Year 0’s now.` : "Thought Fields is building its first campus."} Each campus adds half again, to ${times}× by Year ${Math.round(last)}, when the grid is full.`
            : queued
              ? `Each campus adds half again. By Year ${Math.round(last)} our compute draws ${pct(at(campuses.length))} of Earth’s grid, and no more fit.`
              : `Our compute stays at its Year 0 level, ${pct(at(0))} of Earth’s grid. Thought Fields would grow it ${times}× by Year ${Math.round(last)}, until the grid is full.`}
      </p>
    </div>
  );
}

/** What Build shows queued: our order, and the build pointed at in a list, added last before Begin, or ordered now
 *  in play once open. A queued build pointed at is picked out instead. The top bar shows it too, 2026-10-22. */
export function useShown() {
  const { year, orderAt } = useGame();
  const { plan } = usePlan();
  const { done } = useSchedule();
  const [pv] = usePreview();
  const now = orderAt === null ? 0 : tenths(orderAt);
  const adding =
    !pv || plan.builds.includes(pv) ? null : year === null || openAt(plan, done, now).some((b) => b.name === pv) ? pv : null;
  const shown = useMemo(
    () => (!adding ? plan : year === null ? toggleBuild(adding)(plan) : orderLater(adding, now)(plan)),
    [adding, plan, year, now],
  );
  const picked = pv && ordered(plan).includes(pv) ? pv : null;
  return { shown, adding, picked, began: year !== null, now };
}

/** Build's head: all our compute as a ring, and its key. On a wide screen it stays in view while the list scrolls
 *  under it, so pointing at a build shows what it would take. */
export function Costs() {
  const { scale } = useSchedule();
  const { shown, adding, picked, began, now } = useShown();
  const share = useMemo(() => sharesAt(shown, scale, now), [shown, scale, now]);
  // In play, what builds can't use combs old recordings until it catches up with the present, as the top bar says.
  const searched = useMemo(() => searchOf(shown, scale), [shown, scale]);
  const searching = began && combedAt(searched, now) < now - 0.05;
  const over = share.short > 0.005;
  const pick = picked && share.parts.find((p) => p.name === picked);
  return (
    <section className="-mx-4 border-b border-rowline bg-panel px-4 pb-3 wide:sticky wide:-top-3 wide:z-10 wide:pt-3">
      <div className="flex min-h-[18px] items-center justify-between font-mono text-[10px] tracking-[.1em] text-muted">
        <span>OUR COMPUTE</span>
        {adding && <span className="tracking-[.12em] text-you uppercase">If we queue {adding}</span>}
        {picked && (
          <span className="tracking-[.12em] text-ink uppercase">
            {picked}
            {pick && ` · ${pct(pick.need + pick.spare)}`}
            {pick && pick.short > 0.005 && <span className="text-other"> · {pct(pick.short)} short</span>}
          </span>
        )}
      </div>
      <div className="mt-2.5 grid grid-cols-[148px_1fr] items-center gap-3.5">
        <div className="relative size-[148px]">
          <Ring share={share} hot={adding ?? picked} searching={searching} />
          <div className="absolute inset-0 grid place-content-center text-center">
            <b className={`font-mono text-[22px] font-semibold tracking-[-.02em] ${over ? "text-other" : ""}`}>
              {pct(over ? 1 + share.short : 1 - share.idle)}
            </b>
            <span className="mx-auto max-w-[78px] text-[11px] leading-tight text-muted">
              {over
                ? "of our compute needed"
                : share.idle > 0.005
                  ? `at work, ${pct(share.idle)} ${searching ? "searching" : "idle"}`
                  : "of our compute at work"}
            </span>
          </div>
        </div>
        <Key share={share} searching={searching} />
      </div>
    </section>
  );
}

/** Under the ring, what holds our order up: before Begin the matter it takes, then the ceiling energy sets. */
export function Ceilings() {
  const { shown, adding, began, now } = useShown();
  return (
    <section className="mb-3 border-b border-rowline pb-3">
      {!began && <Blocks builds={shown.builds} adding={adding} />}
      <Ceiling queued={ordered(shown).includes("Thought Fields")} now={now} began={began} />
    </section>
  );
}

/** Under a build we could start: its share of our compute at Year `at`, drawn as a wedge, any matter it takes, and
 *  the queued build it would slow most, or speed. */
export function CostLine({ name, move, at = 0 }: { name: string; move: ReturnType<typeof moves>; at?: number }) {
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const all = useMemo(() => computeAt(plan, scale, at), [plan, scale, at]);
  const s = needOf(name, all, scale);
  const c = buildColor(name);
  const matter = buildOf(name)?.kt;
  const sweep = (x: number) => `${(7 + 6 * Math.sin(x * 2 * Math.PI)).toFixed(2)} ${(7 - 6 * Math.cos(x * 2 * Math.PI)).toFixed(2)}`;
  return (
    <span className="mt-1.5 flex flex-col gap-1 pl-7">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <circle cx="7" cy="7" r="6" fill="none" stroke="var(--faint)" />
            {s >= 1 ? (
              <circle cx="7" cy="7" r="6" fill={c} />
            ) : (
              s > 0 && <path d={`M7 7L7 1A6 6 0 ${s > 0.5 ? 1 : 0} 1 ${sweep(s)}Z`} fill={c} />
            )}
            {s > 1 && <circle cx="7" cy="7" r="6.6" fill="none" stroke={c} strokeDasharray="1.5 1.5" />}
          </svg>
          {pct(s)} of our compute{name === "Thought Fields" ? ", while a campus builds" : ""}
        </span>
        {matter && <span>{kt(matter)}</span>}
      </span>
      <span className="text-xs leading-snug">
        {move.late && (
          <span className="text-other">
            Slows {the(move.late.name)} {span(move.late.by)}
          </span>
        )}
        {move.late && move.soon && <span className="text-muted"> · </span>}
        {move.soon && (
          <span className="text-see">
            Speeds {the(move.soon.name)} {span(move.soon.by)}
          </span>
        )}
        {!move.late && !move.soon && <span className="text-muted">Slows nothing we’ve queued</span>}
      </span>
    </span>
  );
}

