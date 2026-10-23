import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Queueing } from "@/components/build-page";
import { useNext } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { Told, useTalk } from "@/components/guide";
import { MindNote } from "@/components/mind-note";
import { Opens } from "@/components/opens";
import { BuildMark, buildTone, LockMark } from "@/components/marks";
import { buildStory, Mark, Story, toggleBuild, usePlan, useSchedule, useCompute } from "@/components/picks";
import { Thread } from "@/components/review";
import { ListHead } from "@/components/tab-head";
import { Welcome } from "@/components/welcome";
import { placedOf, useWorks } from "@/components/works";
import { tenths } from "@/lib/game/clock";
import { BUILDS, lacks, matter, moves, needs, SAYS, STARTS } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Queuing our first builds, the second of the four things we would do before Begin. It opens at dawn on what we could
// start, in welcome.tsx, then takes us through each build open at Year 0 but the longest roads', one at a time, and the map flies to each
// one's place when it has one. Each stop offers its build to queue. The last stop is our order, chosen from all of
// them, each saying when it would be done and which of ours it would delay or speed up most, by name. The Mind
// advises on each, and names what it would start with only when asked. Settled 2026-10-19. What we queue or take out
// at a stop brings up the Mind's ideas, as on Build, in guide.tsx, kept in the same talk. 2026-10-23.
//
// Enough is all our compute in use at Year 0: what the queue leaves sits idle. A bar in the head fills as we queue,
// and once full the step is done and the next of the four leads, with the walk still open beside it.

const when = (d: number | null | undefined) => (d == null ? "past Year 40" : `Year ${tenths(d)}`);
/** A change in Years, as a row says it: 0.3 Years, 1 Year. */
const years = (d: number) => `${tenths(d)} Year${tenths(d) === 1 ? "" : "s"}`;

/** Every build open at Year 0, a tap to queue it last or take it out. A queued build runs out to its Year. Another
 *  shows its Year if queued now, and the one of ours it would delay most, and speed up most: all share our compute,
 *  and some builds speed others, as the Orbital Yard does what is built in orbit. After Begin, only
 *  what we queued. */
function Choose({ scale, done }: { scale: number; done: Record<string, number | null> }) {
  const { year } = useGame();
  const { plan, change } = usePlan();
  const { pick } = useWorks();
  const open = year === null;
  const added = useMemo(
    () =>
      Object.fromEntries(
        BUILDS.filter((b) => !plan.builds.includes(b.name)).map((b) => {
          const { at, late, soon } = moves(plan, scale, b.name);
          return [b.name, { by: at, late, soon }];
        }),
      ),
    [plan, scale],
  );
  const rows = open ? BUILDS : BUILDS.filter((b) => plan.builds.includes(b.name));
  const by = (name: string) => (plan.builds.includes(name) ? done[name] : added[name]?.by) ?? null;
  const span = Math.min(16, Math.max(5, Math.ceil(Math.max(0, ...rows.map((b) => by(b.name) ?? 16)))));

  return (
    <>
      <ListHead
        data-r
        left={open ? `Open at Year 0 · ${rows.length}` : `Under way · ${rows.length}`}
        right="Done"
        className="mt-4"
      />
      <ul data-r className="mt-1">
        {rows.map((b) => {
          const n = plan.builds.indexOf(b.name);
          const { late, soon } = (n < 0 && added[b.name]) || {};
          // A Seed Ship waits for its drive and fuel in our order, and says which.
          const lacking = lacks(plan, b.name);
          const locked = n < 0 && lacking.length > 0;
          return (
            <li key={b.name}>
              <button
                disabled={!open || locked}
                aria-pressed={n >= 0}
                onClick={() => change(toggleBuild(b.name))}
                // Pointed at, the map flies to where it would stand.
                onPointerEnter={(e) => void (e.pointerType === "mouse" && pick(SITES[b.name] ? b.name : null))}
                onPointerLeave={(e) => void (e.pointerType === "mouse" && pick(null))}
                className={`grid w-full grid-cols-[18px_1fr_5.5em] items-start gap-x-2.5 border-t border-faint py-2.5 text-left ${open && !locked ? "group" : ""}`}
              >
                {locked ? (
                  <span className="translate-y-[2px] text-muted">
                    <LockMark size={16} />
                  </span>
                ) : (
                  <Mark n={n >= 0 ? n + 1 : null} />
                )}
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-1.5 text-[13.5px] leading-snug">
                    <span className={buildTone(b.name, n >= 0)}>
                      <BuildMark name={b.name} size={14} still />
                    </span>
                    {b.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-page-ink2">
                    {b.what}
                    {matter(plan, b.name)}
                    {lacking.length > 0 && (
                      <span className="text-other"> Needs {needs(lacking)} in our order first.</span>
                    )}
                    {!locked && late && (
                      <span className="text-other">
                        {" "}
                        Delays the {late.name} by {years(late.by)}.
                      </span>
                    )}
                    {!locked && soon && (
                      <span className="text-you">
                        {" "}
                        Speeds up the {soon.name} by {years(soon.by)}.
                      </span>
                    )}
                  </span>
                  {!locked && (
                    <span className="relative mt-1.5 block h-[2px] rounded-full bg-track">
                      <span
                        data-run
                        className={`absolute inset-y-0 left-0 origin-left rounded-full transition-[width,background-color] duration-700 ease-out ${n >= 0 ? "bg-you" : "bg-muted/40"}`}
                        style={{ width: `${Math.min(1, (by(b.name) ?? span) / span) * 100}%` }}
                      />
                    </span>
                  )}
                </span>
                <span className="pt-0.5 text-right font-mono text-[11px] text-page-ink2 tabular-nums">
                  {locked ? "" : when(by(b.name))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Our compute at Year 0, drawn: how much of it the queue would use. Full is enough, and says so. Over, it says how
 *  much our order needs, as the top bar does, and what we have is drawn as part of it. */
function ComputeBar({ used, short, full }: { used: number; short: number; full: boolean }) {
  const over = short > 0.005;
  return (
    <div className="mt-2.5 flex items-center gap-2.5 font-mono text-[10px] tracking-[.1em] text-muted">
      <span className="shrink-0">{over ? "COMPUTE NEEDED" : "COMPUTE IN USE"}</span>
      <span className="relative h-[3px] grow overflow-hidden rounded-full bg-track">
        {over && <span className="absolute inset-0 rounded-full bg-other" />}
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-you transition-[width] duration-700 ease-out"
          style={{ width: `${(over ? 1 / (1 + short) : used) * 100}%` }}
        />
      </span>
      <span className={`w-[3em] shrink-0 text-right tabular-nums ${full ? "text-you" : over ? "text-other" : ""}`}>
        {full ? "ALL" : over ? `${Math.round((1 + short) * 100)}%` : `${Math.floor(used * 100)}%`}
      </span>
    </div>
  );
}

export function Tour({ onClose }: { onClose(): void }) {
  const { year } = useGame();
  const { plan } = usePlan();
  const { scale, done } = useSchedule();
  const { used, short, over, full } = useCompute();
  const { set: place, pick } = useWorks();
  const { talk } = useTalk();
  const root = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  // The next of the four things we would do first, or back to the tab once all are done.
  const then = useNext("/build?tour");
  // A swipe across the words moves a stop, as on a phone.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [at, setAt] = useState(0);

  const last = STARTS.length + 1;
  const build = at > 0 && at < last ? STARTS[at - 1] : undefined;
  const name = build?.name ?? null;

  // The map: our builds with places, and the one in view where it would stand. Earth for the rest, and when we leave.
  const placed = useMemo(() => placedOf(plan, done), [plan, done]);
  useEffect(() => place(placed), [place, placed]);
  useEffect(() => pick(name && SITES[name] ? name : null), [pick, name]);
  useEffect(() => () => pick(null), [pick]);

  const go = (k: number) => setAt(Math.max(0, Math.min(last, k)));
  // Each stop opens at its top: on a phone the page scrolls, and the last stop's place would hide this one's head.
  useEffect(() => void root.current?.closest("main")?.scrollTo({ top: 0 }), [at]);
  useEffect(() => next.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      // Typing, or a sheet open over the tour, keeps the keys.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (document.querySelector("dialog[open]")) return;
      const by = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (e.key === "Escape") onClose();
      else if (by) setAt((a) => Math.max(0, Math.min(last, a + by)));
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [last, onClose]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-r]", riseFrom, { ...rise, stagger: 0.05 });
      // Our order: each build's run out to its Year draws in.
      gsap.fromTo(
        "[data-run]",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power2.out", stagger: 0.08, delay: 0.2 },
      );
    },
    { scope: root, dependencies: [at] },
  );

  const open = year === null;
  // Once all our compute is in use, the next of the four leads, on a phone too, and the walk goes on beside it.
  const lead = open && full ? then : null;
  const onward = at === 0 ? "Explore Builds" :at + 1 >= last ? "Next · Our order" : `Next · ${STARTS[at].name}`;
  const outline = "h-11 rounded-full border border-ink text-[15px] font-medium";

  return (
    <div ref={root} className="flex grow flex-col">
      {/* In place of the tab's head, held at the top as the page scrolls. Tall, as on a phone, the way on is here too,
          so the Mind's words clear the fold. */}
      <div className="sticky -top-3 z-10 -mx-4 -mt-3 bg-panel px-4 pt-3 pb-1">
        <div className="flex items-center justify-between pt-1 pb-0.5 text-[11px] tracking-[.08em] text-muted">
          <span className="grow">
            {at === last ? "BUILD · OUR ORDER" : at ? `BUILD · ${at} OF ${STARTS.length}` : "BUILD"}
            {open && full && <span className="text-you"> · DONE</span>}
          </span>
          <button
            onClick={() => go(at - 1)}
            disabled={!at}
            aria-label="Back"
            className="-my-3 size-11 text-xl leading-none text-ink disabled:text-faint wide:hidden"
          >
            ‹
          </button>
          <button
            onClick={() => (at === last ? then && navigate(then.to) : go(at + 1))}
            disabled={at === last && !then}
            aria-label={at === last && then ? then.name : "Next"}
            className="-my-3 size-11 text-xl leading-none text-you disabled:text-faint wide:hidden"
          >
            ›
          </button>
          <button onClick={onClose} aria-label="Close the builds" className="-my-3 -mr-3 size-11 text-xl leading-none">
            ×
          </button>
        </div>
        <Thread
          stops={[{ name: "What we could start" }, ...STARTS.map((b) => ({ name: b.name })), { name: "Our order" }]}
          at={at}
          go={go}
        />
        {open && <ComputeBar used={used} short={short} full={full} />}
      </div>

      <div
        key={at}
        aria-live="polite"
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const from = swipe.current;
          swipe.current = null;
          if (!from) return;
          const dx = e.clientX - from.x;
          if (Math.abs(dx) > 48 && Math.abs(dx) > 2 * Math.abs(e.clientY - from.y)) go(at + (dx < 0 ? 1 : -1));
        }}
        className={`mt-2 flex touch-pan-y flex-col ${at ? "" : "grow"}`}
      >
        {build ? (
          <>
            <div data-r className="flex items-start gap-2.5">
              <span className={`mt-[4px] shrink-0 ${buildTone(build.name, plan.builds.includes(build.name))}`}>
                <BuildMark name={build.name} size={18} />
              </span>
              <h2 className="text-[19px] leading-snug font-medium">{build.name}</h2>
            </div>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {build.what}
              {matter(plan, build.name)}
            </p>
            <div data-r>
              <Queueing name={build.name} scale={scale} done={done} />
            </div>
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">
                <p>{SAYS[build.name]}</p>
                <Told talk={talk} />
              </MindNote>
            </div>
            {SITES[build.name] && (
              <div data-r>
                <Story lines={buildStory(build.name)} tone="you" open />
              </div>
            )}
            <div data-r>
              <Opens name={build.name} />
            </div>
          </>
        ) : at === last ? (
          <>
            <h2 data-r className="text-[19px] leading-snug font-medium">
              Our order
            </h2>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {plan.builds.length
                ? `${plan.builds.length} queued. All start at Year 0, and share our compute.`
                : "Nothing queued yet."}
            </p>
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">
                <p>
                  {!open
                    ? "That’s our order, under way since Year 0."
                    : full
                      ? "All our compute is in use from Year 0. The order can still change, until we begin."
                      : over
                        ? `Our order needs ${Math.round(short * 100)}% more compute than we have, so the last in line get less than they need. Taking one out would give the rest more.`
                        : plan.builds.length
                        ? `${Math.floor(used * 100)}% of our compute would be in use. The rest would sit idle until we queue more.`
                        : "All our compute would sit idle. We would queue enough to use it all."}
                </p>
                <Told talk={talk} />
              </MindNote>
            </div>
            <Choose scale={scale} done={done} />
          </>
        ) : (
          <Welcome go={go} />
        )}
      </div>

      {/* Wide, the way on stays in reach under the words. On the welcome, on a phone too, and alone. */}
      <div
        className={`sticky bottom-0 mt-auto grid-cols-[1fr_1.4fr] gap-2 bg-panel pt-3 pb-3 ${lead || !at ? "grid" : "hidden wide:grid"}`}
      >
        {lead && at < last ? (
          <button onClick={() => go(at + 1)} className={outline}>
            Keep looking
          </button>
        ) : (
          at > 0 && (
            <button onClick={() => go(at - 1)} className={outline}>
              Back
            </button>
          )
        )}
        <button
          ref={next}
          onClick={() =>
            lead ? navigate(lead.to) : at === last ? (then ? navigate(then.to) : onClose()) : go(at + 1)
          }
          className={`h-11 rounded-full bg-ink text-[15px] font-medium text-paper ${!at && !lead ? "col-span-2" : ""}`}
        >
          {lead ? lead.name : at === last ? (then?.name ?? "Back to Build") : onward}
        </button>
      </div>
    </div>
  );
}
