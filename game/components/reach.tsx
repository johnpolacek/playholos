import { useMemo, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { Mark, toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { HISTORY } from "@/lib/game/charter";
import { lean } from "@/lib/game/plan";
import { LIGHT, LIGHT_HOUR_AU, LY_AU, MARKS, NEAREST, type Road, roads, slows, VOYAGER_AU_PER_YEAR } from "@/lib/game/reach";
import type { Plan } from "@/lib/game/types";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// Reach at Year 0: how far we have gone, drawn on one line out from Earth where each step is ten times farther, and
// the two roads to the nearest star on the Years they would take. Before Begin, a tap queues a road last in our
// order, or takes it out, as on Projects. The Mind advises from the charter, and queues nothing. Each line travels out
// from its start as the tab opens.

const W = 360;
const L = 14;
const R = W - 14;
const FAR = NEAREST.ly * LY_AU;
const at = (au: number) => L + (Math.log10(au) / Math.log10(FAR)) * (R - L);
const year = (y: number) => (Math.round(y * 10) / 10).toString();

/** The gap: Earth to the nearest star, each step ten times farther. What we have sent is lit, the rest is dashed. */
function Gap() {
  const far = MARKS.at(-1)!;
  // Labels climb as the marks crowd toward our farthest craft.
  const lift = [0, 0, 16, 32];
  return (
    <svg viewBox={`0 0 ${W} 112`} className="mt-2 w-full overflow-visible" role="img" aria-label={`From Earth to ${NEAREST.name}`}>
      <defs>
        <clipPath id="reach-gap">
          <rect data-reach="reveal" x={0} y={0} width={W} height={112} />
        </clipPath>
      </defs>
      <g clipPath="url(#reach-gap)">
        {[1, 10, 100, 1e3, 1e4, 1e5].map((au) => (
          <line key={au} x1={at(au)} x2={at(au)} y1={58} y2={66} className="stroke-faint" />
        ))}
        <line x1={at(far.au)} x2={R} y1={62} y2={62} strokeDasharray="2 4" className="stroke-muted" />
        <line x1={L} x2={at(far.au)} y1={62} y2={62} strokeWidth={2} className="stroke-you" />
        {LIGHT.map(([label, au]) => (
          <g key={label}>
            <line x1={at(au)} x2={at(au)} y1={66} y2={74} className="stroke-muted" />
            <text x={at(au)} y={86} textAnchor="middle" className="fill-muted font-mono text-[8px]">
              {label}
            </text>
          </g>
        ))}
        {MARKS.map((m, i) => (
          <g key={m.name}>
            {lift[i] > 0 && <line x1={at(m.au)} x2={at(m.au)} y1={58} y2={50 - lift[i]} className="stroke-faint" />}
            <circle cx={at(m.au)} cy={62} r={m.craft ? 3 : 2.5} className={m.craft ? "fill-you" : "fill-ink"} />
            <text
              x={at(m.au) + (i === 0 ? -3 : 0)}
              y={46 - lift[i]}
              textAnchor={i === 0 ? "start" : "middle"}
              className={`font-mono text-[8.5px] ${m.craft ? "fill-you" : "fill-page-ink2"}`}
            >
              {m.name}
            </text>
          </g>
        ))}
        <circle cx={R} cy={62} r={4} className="fill-ink" />
        <circle cx={R} cy={62} r={8} className="fill-ink/15" />
        <text x={R + 4} y={46} textAnchor="end" className="fill-ink font-mono text-[8.5px]">
          {NEAREST.name}
        </text>
        <text x={L - 3} y={104} className="fill-muted font-mono text-[8px]">
          each tick ten times farther
        </text>
        <text x={R} y={104} textAnchor="end" className="fill-muted font-mono text-[8px]">
          {NEAREST.ly.toFixed(1)} ly
        </text>
      </g>
    </svg>
  );
}

/** One road as a thread on the Years: the build, solid, the craft's wait, its flight, dashed, and its word home, dotted. */
function Thread({ road, i, to }: { road: Road; i: number; to: number }) {
  const x = (y: number) => L + (Math.min(y, to) / to) * (R - L);
  const { done, leaves, arrives, home } = road;
  return (
    <svg viewBox={`0 0 ${W} 40`} className="w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={`reach-road-${i}`}>
          <rect data-reach="road" x={0} y={0} width={W} height={40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#reach-road-${i})`} opacity={road.n ? 1 : 0.6}>
        <line x1={L} x2={R} y1={20} y2={20} className="stroke-track" />
        {done !== null && <line x1={L} x2={x(done)} y1={20} y2={20} strokeWidth={3} className="stroke-you" />}
        {done !== null && leaves !== null && leaves > done && (
          <line x1={x(done)} x2={x(leaves)} y1={20} y2={20} strokeWidth={3} className="stroke-you/45" />
        )}
        {leaves !== null && arrives !== null && (
          <line x1={x(leaves)} x2={x(arrives)} y1={20} y2={20} strokeWidth={2} strokeDasharray="5 3" className="stroke-you" />
        )}
        {arrives !== null && home !== null && (
          <line x1={x(arrives)} x2={x(home)} y1={20} y2={20} strokeWidth={2} strokeDasharray="1.5 3" className="stroke-other" />
        )}
        {done !== null && <circle cx={x(done)} cy={20} r={3} className="fill-you" />}
        {arrives !== null && (
          <>
            <circle cx={x(arrives)} cy={20} r={3.5} className="fill-ink" />
            <text x={x(arrives)} y={10} textAnchor="middle" className="fill-ink font-mono text-[8.5px]">
              arrives {year(arrives)}
            </text>
          </>
        )}
        {home !== null && (
          <>
            <circle cx={x(home)} cy={20} r={3} className="fill-other" />
            <text x={x(home)} y={36} textAnchor="middle" className="fill-other font-mono text-[8.5px]">
              home {year(home)}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** Years along the bottom of the roads. */
function Years({ to }: { to: number }) {
  const ticks = Array.from({ length: Math.floor(to / 20) + 1 }, (_, k) => k * 20);
  return (
    <svg viewBox={`0 0 ${W} 18`} className="w-full overflow-visible" aria-hidden>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L + (t / to) * (R - L)} x2={L + (t / to) * (R - L)} y1={0} y2={4} className="stroke-muted" />
          <text x={L + (t / to) * (R - L)} y={14} textAnchor="middle" className="fill-muted font-mono text-[8px]">
            {t ? t : "Year 0"}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** What could join the plan to bring the probe's word home soonest, if anything would by a Year or more. */
function sooner(plan: Plan, scale: number, from: number, now: number | null) {
  if (now === null) return null;
  let best: { name: string; by: number } | null = null;
  for (const name of ["Orbital yard", "Data center"]) {
    if (plan.builds.includes(name)) continue;
    const home = roads({ ...plan, builds: [...plan.builds, name] }, scale, from)[1].home;
    if (home !== null && now - home >= 1 && (!best || now - home > best.by)) best = { name, by: now - home };
  }
  return best;
}

/** The Mind's word on the roads, from the charter and the plan. It advises, and queues nothing. */
function says(
  plan: Plan,
  dials: number[],
  [sail, probe]: Road[],
  tip: ReturnType<typeof sooner>,
  slow: ReturnType<typeof slows>,
  before: boolean,
) {
  if (sail.home === null) return `Neither road reaches ${NEAREST.name} within two centuries at our pace.`;
  const out = [`By sail, the soonest word from ${NEAREST.name} comes home at Year ${year(sail.home)}.`];
  if (before) {
    const { i, low } = lean(dials);
    if (i === 1 && low && !sail.n) out.push("Our charter leans to reach. The sail array takes no matter, so we would queue it.");
    else if (!(i === 1 && low)) out.push("We would wait on both. Our first builds pay back sooner.");
    if (slow)
      out.push(`The probe yard ${probe.n ? "slows" : "would slow"} our ${slow.name.toLowerCase()} by ${year(slow.by)} Years.`);
    if (probe.n && plan.builds.includes("Moon vault")) out.push("With the vault, it takes all 20 kt we hold in orbit.");
  }
  if (probe.n && tip)
    out.push(`Queuing ${tip.name === "Orbital yard" ? "an orbital yard" : "a data center"} would bring the probe’s word home ${Math.round(tip.by)} Years sooner.`);
  return out.join(" ");
}

export function Reach() {
  const { save, year: clock } = useGame();
  const { plan, change } = usePlan();
  const { scale } = useSchedule();
  const root = useRef<HTMLDivElement>(null);

  // Begun now: Year 0 before Begin, and after it the tenth of a Year, so the dates move at most every thirty seconds.
  const before = clock === null;
  const from = before ? 0 : Math.floor(clock * 10) / 10;
  const list = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  const tip = useMemo(() => sooner(plan, scale, from, list[1].home), [plan, scale, from, list]);
  const slow = useMemo(() => (before ? slows(plan, scale, "Probe yard") : null), [before, plan, scale]);
  // The Years run to the last word home, in steps of twenty.
  const to = Math.max(60, Math.ceil(Math.max(...list.map((r) => r.home ?? 0)) / 20) * 20);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power2.inOut" } })
        .fromTo('[data-reach="reveal"]', { attr: { width: 0 } }, { attr: { width: W }, duration: 1.6 }, 0.1)
        .fromTo('[data-reach="road"]', { attr: { width: 0 } }, { attr: { width: W }, duration: 1.4, stagger: 0.3 }, 0.6)
        .fromTo('[data-reach="say"]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.2);
    },
    { scope: root },
  );

  if (!save) return null;
  const far = MARKS.at(-1)!;
  const hours = Math.round(far.au / LIGHT_HOUR_AU);
  const crawl = Math.round((NEAREST.ly * LY_AU - far.au) / VOYAGER_AU_PER_YEAR / 1000);

  return (
    <div ref={root} className="flex flex-col pb-4">
      <h2 className="mt-1 text-[19px] leading-snug font-medium">How far we’ve gone</h2>
      <p className="mt-0.5 text-[13.5px] text-page-ink2">
        {far.name}, our farthest, is {hours} light-hours out. At its speed, {NEAREST.name} is {crawl},000 years away.
      </p>
      <Gap />

      <h2 className="mt-5 text-[19px] leading-snug font-medium">Two roads to {NEAREST.name}</h2>
      <p className="mt-0.5 text-[13.5px] text-page-ink2">
        {before ? "Either can start at Year 0, last in our order." : "Begun now, last in line."}
      </p>
      <div className="mt-2 flex flex-col">
        {list.map((road, i) => {
          const head = (
            <>
              {before && <Mark n={road.n} />}
              <span className="flex min-w-0 grow flex-col">
                <span className="text-[14.5px] leading-snug font-medium">{road.name}</span>
                <span className="text-[12px] leading-snug text-muted">
                  {road.build}, then {road.craft.toLowerCase()}
                  {road.build === "Probe yard" ? ". 10 kt of our 20." : ". No matter."}
                </span>
              </span>
              {before && (
                <span className={`shrink-0 font-mono text-[10px] tracking-[.06em] ${road.n ? "text-you" : "text-muted"}`}>
                  {road.n ? "QUEUED" : "IF QUEUED"}
                </span>
              )}
            </>
          );
          return (
            <div key={road.name} className="border-t border-rowline pt-2">
              {before ? (
                <button
                  onClick={() => change(toggleBuild(road.build))}
                  aria-pressed={!!road.n}
                  className="group flex w-full items-start gap-2.5 text-left"
                >
                  {head}
                </button>
              ) : (
                <div className="flex items-start gap-2.5">{head}</div>
              )}
              <Thread road={road} i={i} to={to} />
            </div>
          );
        })}
        <Years to={to} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-4 bg-you" />
          building
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-you" />
          flight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dotted border-other" />
          its word home
        </span>
      </div>

      <div data-reach="say" className="mt-4">
        <MindNote className="text-[14.5px] leading-snug">
          {says(plan, save.charter?.dials ?? HISTORY, list, tip, slow, before)}
        </MindNote>
      </div>
    </div>
  );
}
