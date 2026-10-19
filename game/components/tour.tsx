import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { buildStory, Mark, Story, toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { Thread } from "@/components/review";
import { placedOf, useWorks } from "@/components/works";
import { HISTORY } from "@/lib/game/charter";
import { tenths } from "@/lib/game/clock";
import { advice, BUILDS, schedule } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Queuing our first builds with the Mind, the second of the three things we would do before Begin. The Mind takes us
// through what it would start with, from the charter's strongest lean, one build at a time, and the map flies to each
// one's place when it has one. Each stop offers its build: the Mind advises, and we queue. The last stop is our order,
// and when each is done. Queuing a build counts as done, here or in the list. Settled 2026-10-18.

/** What the Mind says of each build, whichever lean picks it. */
const SAYS: Record<string, string> = {
  "All-sky watch":
    "Our sky watch sees each star about ten minutes a day, and a knock lasts hours. This would hear the whole sky, all the time.",
  "Deep flash watch":
    "A laser knock could last a billionth of a second. Only a watch built for flashes that short would ever see one.",
  "Data center": "Half again as much thought, for good. Every build after it goes faster, and so do our studies.",
  "Infrared telescope":
    "It would read the air of the nearest worlds. Oxygen and methane together would be hard to explain without life.",
  "Launch complex": "It doubles what we lift to orbit. Everything we build up there waits on lift.",
  "Orbital yard": "It builds in orbit a quarter faster. It pays most if we mean to build a lot up there.",
  "Moon vault": "A copy of us, out of reach of anything that hits Earth. It takes half the matter we hold in orbit.",
  "Laser sail array":
    "Our soonest road to the nearest star, and it takes no matter. Last in line, it barely slows what is before it.",
  "Probe yard":
    "It builds and fuels probes in orbit. Its want is large: even last in line, it slows every build before it.",
};

const ORDINAL = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"];
const when = (d: number | null | undefined) => (d == null ? "past Year 40" : `Year ${tenths(d)}`);
const and = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export function Tour({ onClose }: { onClose(): void }) {
  const { save, year } = useGame();
  const { plan, change } = usePlan();
  const { scale, done } = useSchedule();
  const { set: place, pick } = useWorks();
  const root = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  // A swipe across the words moves a stop, as on a phone.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [at, setAt] = useState(0);

  const mind = advice(save?.charter?.dials ?? HISTORY);
  const picks = mind.builds;
  const last = picks.length + 1;
  const name = at > 0 && at < last ? picks[at - 1] : null;
  const build = BUILDS.find((b) => b.name === name);

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
  const queued = !!name && plan.builds.includes(name);
  // A build's Year: where it stands in our order, or last in line if we queue it now.
  const by = !name ? null : queued ? done[name] : schedule({ ...plan, builds: [...plan.builds, name] }, scale)[name];
  const missing = picks.filter((b) => !plan.builds.includes(b));
  const span = Math.min(16, Math.max(5, Math.ceil(Math.max(0, ...plan.builds.map((b) => done[b] ?? 16)))));

  return (
    <div ref={root} className="flex grow flex-col">
      {/* In place of the tab's head, held at the top as the page scrolls. Tall, as on a phone, the way on is here too,
          so the Mind's words clear the fold. */}
      <div className="sticky top-0 z-10 -mx-4 -mt-3 bg-panel px-4 pt-3 pb-1">
        <div className="flex items-center justify-between pt-1 pb-0.5 text-[11px] tracking-[.08em] text-muted">
          <span className="grow">
            {at === last ? "PROJECTS · OUR ORDER" : at ? `PROJECTS · PLAN ${at} OF ${picks.length}` : "PROJECTS · PLAN"}
            {at === last && plan.builds.length > 0 && <span className="text-you"> · DONE</span>}
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
            onClick={() => go(at + 1)}
            disabled={at === last}
            aria-label="Next"
            className="-my-3 size-11 text-xl leading-none text-you disabled:text-faint wide:hidden"
          >
            ›
          </button>
          <button onClick={onClose} aria-label="Close the plan" className="-my-3 -mr-3 size-11 text-xl leading-none">
            ×
          </button>
        </div>
        <Thread
          stops={[{ name: "What we would start with" }, ...picks.map((b) => ({ name: b })), { name: "Our order" }]}
          at={at}
          go={go}
        />
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
        className="mt-2 flex touch-pan-y flex-col"
      >
        {build ? (
          <>
            <div data-r className="flex items-baseline gap-2.5">
              <span className="size-2.5 shrink-0 translate-y-[-1px] rounded-full bg-you" />
              <h2 className="text-[19px] leading-snug font-medium">{build.name}</h2>
            </div>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {build.what}
              {build.kt ? ` ${build.kt} kt of our 20.` : ""}
            </p>
            {open && (
              <button
                data-r
                onClick={() => change(toggleBuild(build.name))}
                aria-pressed={queued}
                className={`group mt-2.5 flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${queued ? "border-you bg-you/10" : "border-you/50 hover:bg-you/5"}`}
              >
                <Mark n={queued ? plan.builds.indexOf(build.name) + 1 : null} />
                <span className="min-w-0 grow text-[14px] leading-snug">
                  {queued
                    ? `Queued, ${ORDINAL[plan.builds.indexOf(build.name)]} in our order`
                    : `Queue the ${build.name}`}
                  <span className="block text-[12px] text-muted">
                    {queued ? "Tap again to take it out." : "It starts at Year 0, the moment we begin."}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">{when(by)}</span>
              </button>
            )}
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">{SAYS[build.name]}</MindNote>
            </div>
            {SITES[build.name] && (
              <div data-r>
                <Story lines={buildStory(build.name)} tone="you" open />
              </div>
            )}
          </>
        ) : at === last ? (
          <>
            <h2 data-r className="text-[19px] leading-snug font-medium">
              Our order
            </h2>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {plan.builds.length
                ? `${plan.builds.length} queued. All start at Year 0, and share our thought.`
                : "Nothing queued yet."}
            </p>
            {plan.builds.length > 0 && (
              <ol data-r className="mt-3 flex flex-col gap-2.5">
                {plan.builds.map((b, k) => (
                  <li key={b} className="grid grid-cols-[18px_1fr_auto] items-start gap-x-2.5">
                    <Mark n={k + 1} />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] leading-snug">{b}</span>
                      <span className="relative mt-1.5 block h-[2px] rounded-full bg-track">
                        <span
                          data-run
                          className="absolute inset-y-0 left-0 origin-left rounded-full bg-you"
                          style={{ width: `${Math.min(1, (done[b] ?? span) / span) * 100}%` }}
                        />
                      </span>
                    </span>
                    <span className="pt-0.5 font-mono text-[11px] text-page-ink2 tabular-nums">{when(done[b])}</span>
                  </li>
                ))}
              </ol>
            )}
            {open && missing.length > 0 && (
              <button
                data-r
                onClick={() =>
                  change((p) => ({
                    ...p,
                    builds: [...p.builds, ...picks.filter((b) => !p.builds.includes(b))],
                    studies: mind.studies ?? p.studies,
                  }))
                }
                className="mt-3 h-11 rounded-full border border-you/50 text-[14px] text-you transition-colors hover:bg-you/10"
              >
                {missing.length === picks.length ? "Queue what we would start with" : `Queue the ${and(missing)}`}
              </button>
            )}
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">
                {missing.length
                  ? `We would add the ${and(missing)}.`
                  : "That’s what we would start with. The order can still change, until we begin."}
              </MindNote>
            </div>
          </>
        ) : (
          <>
            <h2 data-r className="text-[19px] leading-snug font-medium">
              What we would start with
            </h2>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {and(picks)}
            </p>
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">{mind.words}</MindNote>
            </div>
          </>
        )}
      </div>

      {/* Wide, the way on stays in reach under the words. */}
      <div className="sticky bottom-0 mt-auto hidden grid-cols-[1fr_1.4fr] gap-2 bg-panel pt-3 pb-3 wide:grid">
        <button
          onClick={() => (at ? go(at - 1) : onClose())}
          className="h-11 rounded-full border border-ink text-[15px] font-medium"
        >
          {at ? "Back" : "Not now"}
        </button>
        <button
          ref={next}
          onClick={() => (at === last ? onClose() : go(at + 1))}
          className="h-11 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          {at === last
            ? "Back to Projects"
            : at === picks.length
              ? "Next · Our order"
              : `${at ? "Next" : "First"} · ${picks[at]}`}
        </button>
      </div>
    </div>
  );
}
