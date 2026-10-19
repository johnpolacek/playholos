import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { Lens } from "@/components/icons";
import { MindNote } from "@/components/mind-note";
import { buildStory, Story, toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { placedOf, useWorks } from "@/components/works";
import { realTime, tenths } from "@/lib/game/clock";
import { CLOSE } from "@/lib/game/close";
import { BUILDS, buildSlug, SAYS, schedule } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One build, opened from Build: what it gives us, when it would be done, the Mind's word on it, and its story. The map
// flies to where it would stand while it is open, and home when we leave. Before Begin, its button adds it to the
// queue, last in our order, or takes it out, as in the Mind's tour. Last, Close View takes the map down to the ground
// there, as the map's own button and the place's name on it do. Settled 2026-10-18. Asking the Mind is the last step,
// as on a lead's page, 2026-10-19.

const ORDINAL = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];

/** Where the build stands: in our order or not, and when it is done, in Years and in play time, as the list counts. */
function status(open: boolean, at: number, by: number | null | undefined, year: number) {
  const when = by == null ? "after Year 40" : `by Year ${tenths(by)}, ${realTime(by)} after we begin`;
  if (open)
    return at < 0 ? `Last in our order, it would be done ${when}.` : `Queued, ${ORDINAL[at]} in our order. Done ${when}.`;
  if (at < 0) return "Not in our order.";
  if (by == null) return "Under way. Done after Year 40.";
  return year >= by ? "Done." : `Under way. Done in ${realTime(by - year)}.`;
}

/** A build's place in our order, and before Begin, the button that adds it or takes it out. When it is added or taken
 *  out, its new place rises in. */
export function Queueing({ name, scale, done }: { name: string; scale: number; done: Record<string, number | null> }) {
  const { year } = useGame();
  const { plan, change } = usePlan();
  const root = useRef<HTMLDivElement>(null);
  const at = plan.builds.indexOf(name);
  const was = useRef(at);
  useGSAP(
    () => {
      if (was.current === at) return;
      was.current = at;
      if (!prefersReducedMotion()) gsap.fromTo("[data-s]", riseFrom, rise);
    },
    { scope: root, dependencies: [at] },
  );

  const open = year === null;
  const queued = at >= 0;
  // Its Year: where it stands in our order, or last in line if we add it now.
  const by = queued ? done[name] : schedule({ ...plan, builds: [...plan.builds, name] }, scale)[name];
  return (
    <div ref={root} className="flex flex-col">
      <p data-s className={`mt-2.5 text-[13px] leading-snug ${queued ? "text-you" : "text-page-ink2"}`}>
        {status(open, at, by, year ?? 0)}
      </p>
      {open && (
        <button
          onClick={() => change(toggleBuild(name))}
          className={`mt-2.5 h-11 rounded-full text-[15px] font-medium ${queued ? "border border-ink" : "bg-ink text-paper"}`}
        >
          {queued ? "Remove from Queue" : "Add to Queue"}
        </button>
      )}
    </div>
  );
}

export function BuildPage({ slug }: { slug: string }) {
  const { plan } = usePlan();
  const { scale, done } = useSchedule();
  const { set: place, pick, close, setClose } = useWorks();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const build = BUILDS.find((b) => buildSlug(b.name) === slug);
  const name = build?.name ?? null;

  // The map: our builds with places, and this one where it would stand.
  const placed = useMemo(() => placedOf(plan, done), [plan, done]);
  useEffect(() => place(placed), [place, placed]);
  useEffect(() => pick(name && SITES[name] ? name : null), [pick, name]);
  useEffect(() => () => pick(null), [pick]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate("/build");
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [navigate]);

  useGSAP(
    () => {
      if (!build || prefersReducedMotion()) return;
      gsap.fromTo("[data-m]", riseFrom, { ...rise, stagger: 0.05 });
    },
    { scope: root, dependencies: [slug] },
  );

  if (!build)
    return (
      <p className="mt-2 text-sm text-muted">
        We have no build by that name.{" "}
        <Link to="/build" className="text-ink underline underline-offset-2">
          Back to Build
        </Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <Link
          to="/build"
          data-m
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink bg-paper pr-4 pl-3 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <span aria-hidden className="text-[18px] leading-none">‹</span>
          All builds
        </Link>
      </div>
      <div data-m className="mt-1 flex items-baseline gap-2.5">
        <span className="size-2.5 shrink-0 translate-y-[-1px] rounded-full bg-you" />
        <h1 className="text-[19px] leading-snug font-medium">{build.name}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {build.what}
        {build.kt ? ` ${build.kt} kt of our 20.` : ""}
      </p>
      <div data-m>
        <Queueing name={build.name} scale={scale} done={done} />
      </div>
      <div data-m className="mt-3">
        <MindNote className="text-[14.5px] leading-snug">{SAYS[build.name]}</MindNote>
      </div>
      {SITES[build.name] && (
        <div data-m>
          <Story lines={buildStory(build.name)} tone="you" open />
        </div>
      )}
      {CLOSE[build.name] && (
        <button
          data-m
          onClick={() => setClose(!close)}
          className="mt-6 flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-full border border-ink text-[15px] font-medium"
        >
          <Lens closer={!close} size={17} />
          {close ? "Pull Back" : "Close View"}
        </button>
      )}
      <button
        data-m
        onClick={() => navigate(`/mind?ask=${encodeURIComponent(`What would the ${build.name} give us, and what would it slow?`)}`)}
        className={`${CLOSE[build.name] ? "mt-2.5" : "mt-6"} h-[46px] shrink-0 rounded-full border border-ink text-[15px] font-medium`}
      >
        Ask the Mind about it
      </button>
    </div>
  );
}
