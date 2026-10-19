import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildBlue, buildTone, LeadMark, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { axis, says, sooner, Thread, useReach, year, Years } from "@/components/reach";
import { useLeads } from "@/components/scan";
import { skyId } from "@/lib/game/leads";
import { Face, ListHead } from "@/components/tab-head";
import { HISTORY } from "@/lib/game/charter";
import { span } from "@/lib/game/clock";
import { buildSlug } from "@/lib/game/plan";
import { LOCKED, roads, slows, toward } from "@/lib/game/reach";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One destination, opened from Reach: a lead's star, and every way we could go there. The two roads open at Year 0,
// by sail and by probe, are drawn on the Years they would take, each with the build it needs and, before Begin, the
// button that queues it. The rest are listed locked, each with the builds it needs, every one a link to its page to
// start it, so the way ahead shows. Reach's map stays, and flies out to the star, its ruler stretched to it. Settled
// 2026-10-19.

/** A build a way needs: its mark in its color, its name, and how it stands, opening its page to start it. */
function Need({ name, queued, done }: { name: string; queued: boolean; done: boolean }) {
  return (
    <Link
      to={`/build/${buildSlug(name)}`}
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-faint pr-2.5 pl-2 text-[12.5px] text-ink transition-colors hover:border-muted"
    >
      <span className={buildTone(name, queued || done)}>
        <BuildMark name={name} size={13} />
      </span>
      {name}
      {(queued || done) && <span className="text-muted">· {done ? "done" : "queued"}</span>}
      <span aria-hidden className="text-muted">
        ›
      </span>
    </Link>
  );
}

const WHAT: Record<string, string> = {
  "Laser Sail Array": "Sails a few grams heavy, pushed by light from the ground, pass at a fifth of light speed.",
  "Probe Yard": "A probe built and fueled in orbit passes at an eighth of light speed, 12 Years after its yard.",
};

export function DestinationPage({ slug }: { slug: string }) {
  const { leads } = useLeads();
  const { aim } = useReach();
  const { save, year: clock } = useGame();
  const { plan, change } = usePlan();
  const { scale, done: doneBy } = useSchedule();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const i = leads.findIndex((l) => l.slug === slug);
  const lead = leads[i];

  // Begun now: Year 0 before Begin, and after it the tenth of a Year.
  const before = clock === null;
  const from = before ? 0 : Math.floor(clock * 10) / 10;
  const ly = lead?.ly ?? 0;
  const ways = useMemo(() => roads(plan, scale, from).map((r) => toward(r, ly)), [plan, scale, from, ly]);
  const tip = useMemo(() => sooner(plan, scale, from, ways[1].home, ly), [plan, scale, from, ways, ly]);
  const slow = useMemo(() => (before ? slows(plan, scale, "Probe Yard") : null), [before, plan, scale]);
  const { to, step } = axis(ways);

  // Reach's map flies out to the star while the page is open, and back to the nearest star when we leave.
  const star = lead?.star;
  useEffect(() => {
    if (!star) return;
    aim({ id: skyId(star), name: star, ly });
    return () => aim(null);
  }, [aim, star, ly]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate("/reach");
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [navigate]);

  useGSAP(
    () => {
      if (!lead || prefersReducedMotion()) return;
      gsap.fromTo("[data-m]", riseFrom, { ...rise, stagger: 0.05 });
      // Each road draws out along its Years.
      const draw = { attr: { width: 360 }, duration: 1.4, stagger: 0.3, delay: 0.4, ease: "power2.inOut" };
      gsap.fromTo('[data-reach="road"]', { attr: { width: 0 } }, draw);
    },
    { scope: root, dependencies: [lead?.slug] },
  );

  if (!leads.length || !save) return null;
  if (!lead)
    return (
      <p className="mt-2 text-sm text-muted">
        We have no destination by that name.{" "}
        <Link to="/reach" className="text-ink underline underline-offset-2">
          Back to Reach
        </Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <Link
          to="/reach"
          data-m
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink bg-paper pr-4 pl-3 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <span aria-hidden className="text-[18px] leading-none">‹</span>
          All destinations
        </Link>
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className={`mt-[4px] shrink-0 ${lead.reply ? "text-other" : "text-you"}`}>
          <LeadMark art={lead.art} size={18} />
        </span>
        <h1 className="text-[19px] leading-snug font-medium">{lead.star}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.what} · {lead.ly.toFixed(1)} ly · a message takes{" "}
        <span className="font-mono tabular-nums">{span(lead.ly)}</span> ·{" "}
        <Link to={`/lead/${lead.slug}`} className="whitespace-nowrap text-you">
          Its lead ›
        </Link>
      </p>

      <ListHead data-m left={`Ways to go · ${ways.length + LOCKED.length}`} right="Arrives" className="mt-5" />
      <ul className="mt-1">
        {ways.map((road, k) => {
          const queued = road.n !== null;
          const done = !before && road.done !== null && clock >= road.done;
          return (
            // The road's lines take its build's color, as on Build.
            <li key={road.name} data-m style={buildBlue(road.build)} className="border-t border-faint py-2.5">
              <Face
                mark={<BuildMark name={road.build} />}
                tone={buildTone(road.build, queued)}
                name={<b className="font-semibold">{road.name}</b>}
                line={WHAT[road.build]}
                right={road.arrives === null ? "Not yet" : `Year ${year(road.arrives)}`}
                more={false}
              />
              <div className="pl-7">
                <Thread road={road} i={k} to={to} />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                    Needs <Need name={road.build} queued={queued} done={done} />
                  </span>
                  {before && (
                    <button
                      onClick={() => change(toggleBuild(road.build))}
                      className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ${queued ? "border border-ink" : "bg-ink text-paper"}`}
                    >
                      {queued ? "Remove from Queue" : "Add to Queue"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        <li data-m className="pl-7">
          <Years to={to} step={step} />
          <div className="mt-1 mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
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
        </li>
        {LOCKED.map((w) => (
          <li key={w.key} data-m className="border-t border-faint py-2.5">
            <Face
              mark={<LockMark />}
              tone="text-muted"
              name={<b className="font-semibold text-page-ink2">{w.name}</b>}
              line={w.line}
              right="Not yet"
              more={false}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-7 text-[12.5px] text-muted">
              Needs
              {w.needs.map((n) => (
                <Need
                  key={n}
                  name={n}
                  queued={plan.builds.includes(n)}
                  done={!before && (doneBy[n] ?? Infinity) <= clock}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div data-m className="mt-4">
        <MindNote className="text-[14.5px] leading-snug">
          {says(lead.star, plan, save.charter?.dials ?? HISTORY, ways, tip, slow, before)}
        </MindNote>
      </div>
    </div>
  );
}
