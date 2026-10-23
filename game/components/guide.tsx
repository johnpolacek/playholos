import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Link } from "react-router";
import { useNext } from "@/components/begin";
import { Ceilings, useShown } from "@/components/costs";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildColor } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { toggleBuild, useCompute, usePlan, useSchedule } from "@/components/picks";
import { span } from "@/lib/game/clock";
import { ceiling, inUse, moves, schedule, sharesAt } from "@/lib/game/plan";
import type { Plan } from "@/lib/game/types";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Build before Begin, with the Mind as our guide: our Mind drawn at the center, its compute flowing out to each build
// we queue, a wider stream for a bigger share, and what has no work circling it, idle. Under it the Mind explains
// each idea once, the first time it happens, drawn from our own numbers, and the ideas we've met gather to read
// again. The way on shows once all our compute has work. What holds our order up, matter and energy, waits behind
// More. Chosen from explorations/build-mind.html, 08 and 12 together, 2026-10-22. The Mind's lines here are written
// ahead, so they need no key, and it queues nothing.

const pct = (x: number) => `${Math.round(x * 100)}%`;
const the = (name: string) => (name === "Thought Fields" ? name : `the ${name}`);
const The = (name: string) => (name === "Thought Fields" ? name : `The ${name}`);
const doneIn = (y: number | null | undefined) => (y == null ? "past Year 40" : `in ${span(y)}`);

/** Our compute at Year 0: how much has work, and each build's share of what our studies and a campus under way
 *  leave, what it needs, what it takes beyond to finish sooner, and what it's short. */
function readOf(plan: Plan, scale: number) {
  const s = sharesAt(plan, scale, 0);
  const room = 1 - s.studies - s.fields;
  const used = inUse(plan, scale);
  return {
    used,
    full: used > 0.995,
    over: s.short > 0.005,
    parts: s.parts.map((p) => ({ name: p.name, need: p.need / room, more: p.spare / room, short: p.short / room })),
  };
}
type Read = ReturnType<typeof readOf>;

type Moved = { name: string; by: number } | null;
/** A build in or out of our order, and what it did to the rest. */
interface Change {
  name: string;
  adding: boolean;
  at: number | null | undefined;
  late: Moved;
  soon: Moved;
}

const IDEAS = {
  intro: "our compute",
  more: "more is sooner",
  idle: "idle",
  share: "sharing",
  speed: "speeding up",
  grow: "growing",
  full: "done",
  over: "too much",
  out: "giving back",
};
type Key = keyof typeof IDEAS;

type Fig =
  | { kind: "more"; name: string; need: number; more: number }
  | { kind: "moved"; name: string; was: number; now: number; tone: "late" | "soon" }
  | { kind: "grow"; campuses: number[]; step: number }
  | { kind: "short"; names: string[] };

interface Idea {
  say: string;
  fig?: Fig;
  /** The change that brought it. */
  at: number;
}

/** What the Mind has explained this game, and our order as it last saw it. Kept across tabs, since a build is queued
 *  on its own page, until the page reloads. */
interface Talk {
  plan: Plan;
  seen: Key[];
  now: Key;
  ideas: Partial<Record<Key, Idea>>;
  last: Change | null;
  changes: number;
}
const talks = new Map<number, Talk>();

/** The first idea a change shows that the Mind hasn't explained yet, if any. */
function pick(seen: Key[], c: Change, r: Read): Key | null {
  const p = r.parts.find((x) => x.name === c.name);
  const tries: [Key, boolean][] = c.adding
    ? [
        ["over", r.over],
        ["grow", c.name === "Thought Fields"],
        ["share", !!c.late],
        ["speed", !!c.soon],
        ["more", !!p && p.more > 0.01],
        ["idle", !r.full],
        ["full", r.full],
      ]
    : [
        ["out", true],
        ["idle", !r.full && r.used > 0],
        ["full", r.full],
      ];
  return tries.find(([k, ok]) => ok && !seen.includes(k))?.[0] ?? null;
}

/** The Mind's words for an idea, from our order just after the change, and what to draw with them. */
function explain(key: Key, c: Change | null, r: Read, plan: Plan, scale: number): Omit<Idea, "at"> {
  const done = schedule(plan, scale);
  switch (key) {
    case "intro":
      return {
        say: "This is us, our Mind. Our compute flows to what we build, and a wider stream finishes sooner. What circles us is idle. We’ll explain each idea once, as it comes up.",
      };
    case "more": {
      const p = r.parts.find((x) => x.name === c!.name)!;
      return {
        say: `${The(p.name)} needs ${pct(p.need)} of our compute. Given more, it finishes sooner, so it takes ${pct(p.need + p.more)} while we have compute to spare.`,
        fig: { kind: "more", name: p.name, need: p.need, more: p.more },
      };
    }
    case "idle":
      return { say: `${pct(1 - r.used)} of our compute circles us idle, and idle compute builds nothing. Another build would put it to work.` };
    case "share": {
      const { name, by } = c!.late!;
      const now = done[name] ?? 40;
      return {
        say: `Builds share our compute. ${The(c!.name)} took a share, so ${the(name)} gets less and finishes ${span(by)} later.`,
        fig: { kind: "moved", name, was: now - by, now, tone: "late" },
      };
    }
    case "speed": {
      const { name, by } = c!.soon!;
      const now = done[name] ?? 40;
      return {
        say: `${The(c!.name)} speeds ${the(name)} by ${span(by)}. Some builds make others faster.`,
        fig: { kind: "moved", name, was: now + by, now, tone: "soon" },
      };
    }
    case "grow": {
      const { campuses, step } = ceiling(plan, scale);
      return {
        say: `Thought Fields adds half again to our compute each Year, until it draws the whole grid. By Year ${Math.round(campuses.at(-1) ?? 0)} that’s about ${Math.round(step ** campuses.length)} times what we have, and all we build later comes sooner.`,
        fig: { kind: "grow", campuses, step },
      };
    }
    case "full":
      return { say: "Nothing circles us now. All our compute has work, so this step is done. We can still change the order until Begin." };
    case "over":
      return {
        say: "We’ve queued more than our compute carries. Builds take their share in the order queued, so the last get less than they need. Dragging one higher gives it its share first.",
        fig: { kind: "short", names: r.parts.filter((p) => p.short > 0.001).map((p) => p.name) },
      };
    case "out": {
      const { late, soon } = c!;
      if (!late && soon) {
        const now = done[soon.name] ?? 40;
        return {
          say: `Without ${the(c!.name)}, ${the(soon.name)} finishes ${span(soon.by)} later. Some builds speed others.`,
          fig: { kind: "moved", name: soon.name, was: now - soon.by, now, tone: "late" },
        };
      }
      return {
        say: `Taking out ${the(c!.name)} gives its share back${late ? `, so ${the(late.name)} finishes ${span(late.by)} sooner` : ""}.`,
        fig: late ? { kind: "moved", name: late.name, was: (done[late.name] ?? 40) + late.by, now: done[late.name] ?? 40, tone: "soon" } : undefined,
      };
    }
  }
}

/** The Mind's talk for this game, brought up to date with every build queued or taken out since it last looked, each
 *  against our order as it was just before. Waits until this game's Earth is known, so the numbers are its own. */
function useTalk() {
  const { save } = useGame();
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const { known } = useCompute();
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined || !known) return;
    const t = talks.get(seed);
    if (!t) {
      const intro = explain("intro", null, readOf(plan, scale), plan, scale);
      talks.set(seed, { plan, seen: ["intro"], now: "intro", ideas: { intro: { ...intro, at: 0 } }, last: null, changes: 0 });
      return bump();
    }
    let was = t.plan;
    const changes = [
      ...was.builds.filter((b) => !plan.builds.includes(b)).map((name) => ({ name, adding: false })),
      ...plan.builds.filter((b) => !was.builds.includes(b)).map((name) => ({ name, adding: true })),
    ];
    for (const { name, adding } of changes) {
      const c: Change = { name, adding, ...moves(was, scale, name) };
      const next = toggleBuild(name)(was);
      const r = readOf(next, scale);
      const key = pick(t.seen, c, r);
      t.changes++;
      t.last = c;
      if (key) {
        t.ideas[key] = { ...explain(key, c, r, next, scale), at: t.changes };
        t.seen.push(key);
        t.now = key;
      }
      was = next;
    }
    t.plan = plan;
    if (changes.length) bump();
  }, [seed, plan, scale, known]);
  const talk = seed === undefined ? undefined : talks.get(seed);
  return { talk, reread: (k: Key) => talk && ((talk.now = k), bump()) };
}

/** What the last change did, in a line. */
function LastLine({ c }: { c: Change }) {
  if (c.adding)
    return (
      <>
        Adding {the(c.name)}: done {doneIn(c.at)}
        {c.late && (
          <>
            , and it <span className="text-other">slows {the(c.late.name)} {span(c.late.by)}</span>
          </>
        )}
        {c.soon && (
          <>
            , and it <span className="text-see">speeds {the(c.soon.name)} {span(c.soon.by)}</span>
          </>
        )}
        {!c.late && !c.soon && ", and it slows nothing else"}.
      </>
    );
  return (
    <>
      Without {the(c.name)},{" "}
      {c.late && (
        <span className="text-see">
          {the(c.late.name)} finishes {span(c.late.by)} sooner
        </span>
      )}
      {c.late && c.soon && ", and "}
      {c.soon && (
        <span className="text-other">
          {the(c.soon.name)} finishes {span(c.soon.by)} later
        </span>
      )}
      {!c.late && !c.soon && "nothing else moves"}.
    </>
  );
}

/** What the Mind draws beside an idea. */
function Figure({ fig }: { fig: Fig }) {
  const mono = "font-mono text-[10.5px] text-muted";
  if (fig.kind === "more")
    return (
      <div style={{ "--c": buildColor(fig.name) } as React.CSSProperties}>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-track">
          <i className="bg-(--c) shadow-[inset_-2px_0_0_var(--panel)]" style={{ width: `${fig.need * 100}%` }} />
          <i className="bg-(--c)/40" style={{ width: `${fig.more * 100}%` }} />
        </div>
        <div className={`mt-1.5 flex gap-2 ${mono}`}>
          <span className="text-(--c)">needs {pct(fig.need)}</span>
          <span>takes {pct(fig.more)} more, to finish sooner</span>
        </div>
      </div>
    );
  if (fig.kind === "moved") {
    const max = Math.max(fig.was, fig.now);
    const line = (y: number, label: string, tone?: string) => (
      <div className={`grid h-[17px] grid-cols-[44px_1fr_52px] items-center gap-2 ${mono}`}>
        <span>{label}</span>
        <span className="relative h-0.5">
          <i className={`absolute inset-y-0 left-0 rounded-full ${tone ?? "bg-muted"}`} style={{ width: `${(y / max) * 100}%` }} />
        </span>
        <span className="text-right text-page-ink2">{span(y)}</span>
      </div>
    );
    return (
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-[12.5px]" style={{ color: buildColor(fig.name) }}>
          <BuildMark name={fig.name} size={13} still />
          <span className="text-ink">{fig.name}</span>
        </div>
        {line(fig.was, "before")}
        {line(fig.now, "now", fig.tone === "late" ? "bg-other" : "bg-see")}
      </div>
    );
  }
  if (fig.kind === "grow") {
    const { campuses, step } = fig;
    const end = (campuses.at(-1) ?? 0) + 1;
    const X = (y: number) => (y / end) * 330;
    const Y = (k: number) => 50 - (step ** k / step ** campuses.length) * 50;
    let d = `M0 ${Y(0)}`;
    campuses.forEach((y, k) => (d += `H${X(y)}V${Y(k + 1)}`));
    d += "H330";
    return (
      <svg viewBox="0 0 330 64" preserveAspectRatio="none" className="h-16 w-full overflow-visible" aria-hidden>
        <path d={`${d}V50H0Z`} fill="var(--think)" opacity=".12" />
        <path d={d} fill="none" stroke="var(--think)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d="M0 50H330" stroke="var(--faint)" vectorEffect="non-scaling-stroke" />
        <text x="0" y="63" className="fill-muted font-mono text-[9.5px]">
          now
        </text>
        <text x="330" y="63" textAnchor="end" className="fill-muted font-mono text-[9.5px]">
          Year {Math.round(campuses.at(-1) ?? 0)}, about {Math.round(step ** campuses.length)} times
        </text>
      </svg>
    );
  }
  return fig.names.length ? <p className={mono}>Short of what {fig.names.length > 1 ? "they need" : "it needs"}: {fig.names.join(", ")}</p> : null;
}

const W = 400;
const CX = 200;
const CY = 56;
interface Node {
  x: number;
  y: number;
  w: number;
  o: number;
}

/** Keyed nodes, eased from where they are to where they go. One entering flows out of our Mind, and one leaving flows
 *  back in. */
function useEased(target: Map<string, Node>) {
  const [shown, setShown] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const keys = new Set([...from.keys(), ...target.keys()]);
    const home = { x: CX, y: CY, w: 0, o: 0 };
    const dur = prefersReducedMotion() ? 0 : 600;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      const e = 1 - (1 - p) ** 3;
      const out = new Map<string, Node>();
      for (const k of keys) {
        const a = from.get(k) ?? home;
        const z = target.get(k) ?? home;
        out.set(k, { x: a.x + (z.x - a.x) * e, y: a.y + (z.y - a.y) * e, w: a.w + (z.w - a.w) * e, o: a.o + (z.o - a.o) * e });
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

/** Our Mind at the center, as its mark draws it, its compute flowing out to each build in our order, wider for a bigger
 *  share, and what has no work circling it. Thought Fields' stream is the campus under way. */
function Streams({ plan, scale }: { plan: Plan; scale: number }) {
  const root = useRef<HTMLDivElement>(null);
  const r = useMemo(() => readOf(plan, scale), [plan, scale]);
  const done = useMemo(() => schedule(plan, scale), [plan, scale]);
  const k = plan.builds.length;
  const two = k > 7;
  const H = k ? 196 : 112;
  const target = useMemo(() => {
    const out = new Map<string, Node>();
    const half = Math.min(CX - 34, 58 * (k - 1));
    plan.builds.forEach((name, i) => {
      const x = k === 1 ? CX : CX - half + (i * 2 * half) / (k - 1);
      const y = 158 - 30 * ((x - CX) / (CX - 34)) ** 2 + (two ? (i % 2 ? 14 : -14) : 0);
      const p = r.parts.find((q) => q.name === name);
      out.set(name, { x, y, w: name === "Thought Fields" ? 0.05 : p ? p.need + p.more : 0, o: 1 });
    });
    return out;
  }, [plan.builds, r, k, two]);
  const nodes = useEased(target);
  const idle = Math.max(0, 1 - r.used);
  const dots = Math.round(idle * 28);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to('[data-s="sol"]', { rotation: 360, svgOrigin: `${CX} ${CY}`, duration: 9, ease: "none", repeat: -1 });
      gsap.to('[data-s="idle"]', { rotation: 360, svgOrigin: `${CX} ${CY}`, duration: 16, ease: "none", repeat: -1 });
    },
    { scope: root, dependencies: [dots > 0] },
  );

  return (
    <div ref={root} className="relative mx-auto mt-1 w-full max-w-[400px]" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <filter id="streams-glow" x="-1" y="-1" width="3" height="3">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {[...nodes].map(([name, n]) => {
          if (n.o < 0.01) return null;
          const d = `M${CX} ${CY + 12}C${CX} ${CY + 0.6 * (n.y - CY)} ${n.x} ${CY + 0.3 * (n.y - CY)} ${n.x} ${n.y - 13}`;
          return (
            <g key={name} opacity={n.o}>
              <path d={d} fill="none" stroke={buildColor(name)} strokeOpacity=".32" strokeWidth={1 + n.w * 9} />
              <path
                d={d}
                fill="none"
                stroke="var(--ink)"
                strokeOpacity=".8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="0.1 7.9"
                className="animate-flow motion-reduce:animate-none"
              />
            </g>
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r="24"
          fill="var(--you)"
          filter="url(#streams-glow)"
          className="transition-opacity duration-700"
          opacity={r.full ? 0.35 : 0.12}
        />
        <circle cx={CX} cy={CY} r="24" fill="none" stroke="var(--faint)" />
        <circle cx={CX} cy={CY} r="11" fill="var(--you)" opacity=".22" />
        <circle cx={CX} cy={CY} r="6.5" fill="var(--you)" />
        <g data-s="sol">
          <circle cx={CX + 24} cy={CY} r="2.6" fill="var(--ink)" />
        </g>
        {dots > 0 && (
          <>
            <g data-s="idle" opacity=".75">
              {Array.from({ length: dots }, (_, i) => {
                const a = (i / 28) * 2 * Math.PI;
                return <circle key={i} cx={CX + Math.cos(a) * 36} cy={CY + Math.sin(a) * 36} r="1.6" fill="var(--fill2)" />;
              })}
            </g>
            <text x={CX + 48} y={CY + 3} className="fill-muted font-mono text-[10px]">
              {pct(idle)} idle
            </text>
          </>
        )}
      </svg>
      {[...nodes].map(([name, n]) => {
        if (n.o < 0.01) return null;
        const short = (r.parts.find((p) => p.name === name)?.short ?? 0) > 0.001;
        return (
          <span
            key={name}
            className="absolute grid size-6 -translate-1/2 place-items-center rounded-full border bg-panel"
            style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, opacity: n.o, color: buildColor(name), borderColor: buildColor(name) }}
          >
            <BuildMark name={name} size={13} still />
            {!two && target.has(name) && (
              <span
                className={`absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 font-mono text-[9.5px] whitespace-nowrap ${short ? "text-other" : "text-muted"}`}
              >
                {short ? "short" : span(done[name] ?? 40)}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 stroke-see" aria-hidden>
    <circle cx="8" cy="8" r="7" strokeWidth="1.2" />
    <path d="M4.8 8.2l2.2 2.2 4.2-4.6" />
  </svg>
);
const OPEN = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" strokeWidth="1.2" className="shrink-0 stroke-muted" aria-hidden>
    <circle cx="8" cy="8" r="7" strokeDasharray="2 2" />
  </svg>
);

export function Guide() {
  const root = useRef<HTMLElement>(null);
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const { shown, adding } = useShown();
  const { used, full, known } = useCompute();
  const { talk, reread } = useTalk();
  const next = useNext("/build?tour");
  const [more, setMore] = useState(false);
  const idea = talk?.ideas[talk.now];

  // A new idea, or one read again, rises in.
  const first = useRef(true);
  useGSAP(
    () => {
      if (first.current || !idea) return void (idea && (first.current = false));
      if (!prefersReducedMotion()) gsap.fromTo('[data-g="idea"]', riseFrom, rise);
    },
    { scope: root, dependencies: [talk?.now, idea?.at] },
  );

  // The drawing stays in view on a wide screen as Costs' ring does, so it is the tab's own child, not wrapped.
  return (
    <>
      <section className="-mx-4 border-b border-rowline bg-panel px-4 pb-3 wide:sticky wide:-top-3 wide:z-10 wide:pt-3">
        <div className="flex min-h-[18px] items-center justify-between font-mono text-[10px] tracking-[.1em] text-muted">
          <span>OUR COMPUTE</span>
          {adding && <span className="tracking-[.12em] text-you uppercase">If we queue {adding}</span>}
        </div>
        <Streams plan={shown} scale={scale} />
      </section>

      <section ref={root} className="border-b border-rowline pt-3 pb-3">
        {idea && (
          <MindNote className="text-[14.5px] leading-snug">
            <div data-g="idea">
              <p>{idea.say}</p>
              {idea.fig && (
                <div className="mt-2.5">
                  <Figure fig={idea.fig} />
                </div>
              )}
            </div>
            {talk.last && idea.at !== talk.changes && (
              <p className="mt-2.5 text-[12.5px] text-page-ink2">
                <LastLine c={talk.last} />
              </p>
            )}
          </MindNote>
        )}
        {talk && talk.seen.length > 1 && (
          <div className="mt-1 flex flex-wrap items-center gap-[5px] font-mono text-[9.5px] tracking-[.08em] text-muted">
            <span className="mr-0.5">
              IDEAS MET · {talk.seen.length} OF {Object.keys(IDEAS).length}
            </span>
            {talk.seen.map((k) => (
              <button
                key={k}
                onClick={() => reread(k)}
                aria-pressed={k === talk.now}
                className={`rounded-full border px-2 py-[3px] text-[10.5px] tracking-normal ${k === talk.now ? "border-you/70 text-you" : "border-faint text-page-ink2 hover:border-muted"}`}
              >
                {IDEAS[k]}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex min-h-[34px] items-center justify-between gap-2.5">
          <span className={`inline-flex items-center gap-[7px] text-[13px] ${full ? "text-ink" : "text-muted"}`}>
            {full ? CHECK : OPEN}
            {!known ? "Reading our compute" : full ? "Done. All our compute has work." : plan.builds.length ? `${pct(1 - used)} of our compute idle` : "Nothing queued yet"}
          </span>
          {full && next && (
            <Link to={next.to} className="flex h-[34px] shrink-0 items-center rounded-full bg-ink px-3.5 text-[13.5px] font-medium text-paper">
              Next: {next.short} ›
            </Link>
          )}
        </div>
        <button
          onClick={() => setMore(!more)}
          aria-expanded={more}
          className="mt-2.5 font-mono text-[10.5px] tracking-[.08em] text-muted uppercase hover:text-ink"
        >
          More: matter and energy {more ? "▾" : "›"}
        </button>
      </section>
      {more && <Ceilings />}
    </>
  );
}
