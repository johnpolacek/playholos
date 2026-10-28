import { Link, useLocation, useNavigate } from "react-router";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { Lens } from "@/components/icons";
import { BuildMark, buildTone, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { BackBar } from "@/components/back-bar";
import { Opens } from "@/components/opens";
import { buildStory, Story, toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { placedOf, useWorks } from "@/components/works";
import { span, tenths } from "@/lib/game/clock";
import { CLOSE } from "@/lib/game/close";
import {
  BUILDS,
  buildSlug,
  keptOf,
  lacks,
  LATER,
  type Later,
  matter,
  orderLater,
  ordered,
  SAYS,
  schedule,
  takeBack,
  takenAt,
  takes,
  PAST,
} from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import { FOUND, harm, rockAt, rockOf } from "@/lib/game/rocks";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One build, opened from Build: what it gives us, when it would be done, the Mind's word on it, and its story. The map
// flies to where it would stand while it is open, and home when we leave. Before Begin, its button adds it to the
// queue, last in our order, or takes it out, as in the Mind's tour. Last, Close View takes the map down to the ground
// there, as the map's own button and the place's name on it do. Settled 2026-10-18. Asking the Mind is the last step,
// as on a lead's page, 2026-10-19. After its story, what it opens once done. A build that waits has a page too,
// saying what it waits on in place of the queue's button, 2026-10-20. Once it is open in play, its button orders it,
// last in line from that Year, 2026-10-22. In play, one under way can be taken back, keeping its work, and one taken
// back ordered again, picking up there, last in line, 2026-10-23.

const ORDINAL = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];

/** Where the build stands: in our order or not, and when it is done, in Years and in play time, as the list counts. */
function status(open: boolean, at: number, by: number | null | undefined, year: number) {
  const when = by == null ? "after Year 1,000" : `by Year ${tenths(by)}, ${span(by)} after we begin`;
  if (open)
    return at < 0 ? `Last in our order, it would be done ${when}.` : `Queued, ${ORDINAL[at]} in our order. Done ${when}.`;
  if (at < 0) return "Not in our order yet.";
  if (by == null) return "Under way. Done after Year 1,000.";
  return year >= by ? "Done." : `Under way. Done in ${span(by - year)}.`;
}

/** In play, a build under way and the button that takes it back, or one taken back, the work it kept, and the button
 *  that orders it again, last in line. Its work is what it had left when taken back. Thought Fields keeps none: the
 *  campus under way is finished, and no more begin. 2026-10-23. */
function InPlay({ name, scale, done }: { name: string; scale: number; done: Record<string, number | null> }) {
  const { orderAt } = useGame();
  const { plan, change } = usePlan();
  // An order lands on Earth a light-time late while the Will lives at a hole.
  const now = orderAt === null ? null : tenths(orderAt);
  const back = takenAt(plan, name);
  // Left out at Begin, it can be ordered in play, last in line, 2026-10-28.
  const fresh = back === null && !ordered(plan).includes(name);
  const lacking = lacks(plan, name);
  const again = useMemo(() => {
    if (now === null || (back === null && !fresh)) return null;
    return { at: schedule(orderLater(name, now)(plan), scale)[name], left: back === null ? null : keptOf(plan, scale, name, now) };
  }, [now, back, fresh, name, plan, scale]);
  if (now === null) return null;
  if (fresh && again && !lacking.length)
    return (
      <div className="flex flex-col">
        <p className="mt-2.5 text-[13px] leading-snug text-page-ink2">
          {again.at == null
            ? "Ordered now, it would be done after Year 1,000."
            : `Ordered now, it would be done by Year ${tenths(again.at)}, in ${span(again.at - now)}.`}
        </p>
        <button
          onClick={() => change(orderLater(name, now))}
          className="mt-2.5 h-11 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Add to Queue
        </button>
      </div>
    );
  if (back !== null && again) {
    const kept =
      name === "Thought Fields"
        ? ": the campus under way was finished, and no more begin."
        : again.left !== null
          ? `, its work kept: ${Math.floor(100 * again.left.built)}% built, ${tenths(again.left.left)} Years left at standard pace.`
          : ", its work kept.";
    return (
      <div className="flex flex-col">
        <p className="mt-2.5 text-[13px] leading-snug text-page-ink2">
          Taken back at Year {tenths(back)}
          {kept}{" "}
          {again.at == null
            ? "Ordered again now, it would be done after Year 1,000."
            : `Ordered again now, it would be done by Year ${tenths(again.at)}, in ${span(again.at - now)}.`}
        </p>
        <button
          onClick={() => change(orderLater(name, now))}
          className="mt-2.5 h-11 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Add to Queue
        </button>
      </div>
    );
  }
  const at = done[name];
  if (!ordered(plan).includes(name) || (at != null && at <= now)) return null;
  return (
    <button onClick={() => change(takeBack(name, now))} className="mt-2.5 h-11 rounded-full border border-ink text-[15px] font-medium">
      Take back
    </button>
  );
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
  // Taken back in play, it says so below, in place of where it stands.
  const back = !open && takenAt(plan, name) !== null;
  const queued = at >= 0;
  // Its Year: where it stands in our order, or last in line if we add it now.
  const by = queued ? done[name] : schedule({ ...plan, builds: [...plan.builds, name] }, scale)[name];
  // A Seed Ship is queued only once its drive and fuel are, and says which it waits on.
  const lacking = !back ? lacks(plan, name) : [];
  return (
    <div ref={root} className="flex flex-col">
      {!back && (
        <p data-s className={`mt-2.5 text-[13px] leading-snug ${queued ? "text-you" : "text-page-ink2"}`}>
          {lacking.length ? (
            <span className="flex items-start gap-1.5">
              <span className="mt-[2px] text-muted">
                <LockMark size={13} />
              </span>
              <span>
                {queued ? "Queued, but it can’t leave without " : "Needs "}
                <Lacking names={lacking} />
                {queued ? " in our order." : " in our order first."}
              </span>
            </span>
          ) : (
            status(open, at, by, year ?? 0)
          )}
        </p>
      )}
      {open && (queued || !lacking.length) && (
        <button
          onClick={() => change(toggleBuild(name))}
          className={`mt-2.5 h-11 rounded-full text-[15px] font-medium ${queued ? "border border-ink" : "bg-ink text-paper"}`}
        >
          {queued ? "Remove from Queue" : "Add to Queue"}
        </button>
      )}
      {!open && <InPlay name={name} scale={scale} done={done} />}
    </div>
  );
}

/** Builds our order lacks, each a link to its page. */
function Lacking({ names }: { names: string[] }) {
  // The way back goes along from build to build.
  const state = useLocation().state;
  return names.map((n, i) => (
    <Fragment key={n}>
      {i ? " and " : ""}the{" "}
      <Link to={`/build/${buildSlug(n)}`} state={state} className="text-ink underline underline-offset-2">
        {n}
      </Link>
    </Fragment>
  ));
}

/** The rock the deflector is for: how wide, when it strikes, by when the push must land, and how it ended. */
function RockLine({ done }: { done: Record<string, number | null> }) {
  const { save, year } = useGame();
  const { plan } = usePlan();
  const rock = save ? rockAt(rockOf(save.seed), plan, done, year ?? 0) : null;
  if (!rock || rock.found === null) return null;
  const line =
    rock.state === "pushed"
      ? `Our impactors pushed it aside at Year ${tenths(rock.lands!)}. It passes Earth at Year ${tenths(rock.strikes)}.`
      : rock.state === "struck"
        ? `It struck Earth at Year ${tenths(rock.strikes)}: ${harm(rock.m)}.`
        : `A rock ${rock.m} m wide strikes Earth at Year ${tenths(rock.strikes)}. To move it, our push must land by Year ${tenths(rock.strikes - rock.lead)}.`;
  return <p className="mt-2.5 text-[13px] leading-snug text-ink">{line}</p>;
}

/** Where a build that waits stands: what it waits on, when that is done in our order, and how long it takes. Once it
 *  is open in play, the button that orders it now, and once ordered, when it is done. */
export function Waits({ build, scale, done }: { build: Later; scale: number; done: Record<string, number | null> }) {
  const { year, orderAt } = useGame();
  const { plan, change } = usePlan();
  const state = useLocation().state;
  // An order lands on Earth a light-time late while the Will lives at a hole.
  const now = orderAt === null ? null : tenths(orderAt);
  // Its last order, while it stands in our order.
  const order = ordered(plan).includes(build.name) ? plan.later?.filter((o) => o.name === build.name).at(-1) : undefined;
  const by = ordered(plan).includes(build.after) || build.after === FOUND ? done[build.after] : undefined;
  const open = now !== null && by != null && now >= by;
  // Its Year if we order it now, last in line.
  const when = useMemo(
    () => (open && !order ? schedule(orderLater(build.name, now)(plan), scale)[build.name] : undefined),
    [open, order, build.name, now, plan, scale],
  );
  if (order) {
    const at = done[build.name];
    return (
      <div className="flex flex-col">
        {build.after === FOUND && <RockLine done={done} />}
        <p className="mt-2.5 text-[13px] leading-snug text-you">
          Ordered at Year {tenths(order.y)}.{" "}
          {at == null ? "Done after Year 1,000." : now! >= at ? "Done." : `Done in ${span(at - now!)}, by Year ${tenths(at)}.`}
        </p>
        <InPlay name={build.name} scale={scale} done={done} />
      </div>
    );
  }
  if (now !== null && takenAt(plan, build.name) !== null) return <InPlay name={build.name} scale={scale} done={done} />;
  if (open)
    return (
      <div className="flex flex-col">
        {build.after === FOUND && <RockLine done={done} />}
        <p className="mt-2.5 text-[13px] leading-snug text-page-ink2">
          Open since Year {tenths(by)}, {build.after === FOUND ? "when we found a rock coming" : `after the ${build.after}`}.{" "}
          {when == null ? "Ordered now, it would be done after Year 1,000." : `Ordered now, it would be done by Year ${tenths(when)}, in ${span(when - now)}.`}
        </p>
        <button
          onClick={() => change(orderLater(build.name, now))}
          className="mt-2.5 h-11 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Add to Queue
        </button>
      </div>
    );
  // Only a rock found opens the deflector, and most games never see one.
  if (build.after === FOUND)
    return (
      <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-snug text-page-ink2">
        <span className="mt-[2px] text-muted">
          <LockMark size={13} />
        </span>
        <span>Opens only if our surveys find a rock coming at Earth.</span>
      </p>
    );
  const after = (
    <Link to={`/build/${buildSlug(build.after)}`} state={state} className="text-ink underline underline-offset-2">
      {build.after}
    </Link>
  );
  const { years, rock } = takes(build.name);
  const long =
    rock !== undefined
      ? ` Done once ${rock / 1000} Mt of rock has come in.`
      : years !== undefined
        ? ` About ${years} Years to build.`
        : "";
  return (
    <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-snug text-page-ink2">
      <span className="mt-[2px] text-muted">
        <LockMark size={13} />
      </span>
      <span>
        {by === undefined ? (
          BUILDS.some((b) => b.name === build.after) ? (
            <>Opens after the {after}, which isn’t in our order yet.</>
          ) : (
            <>Opens after the {after}.</>
          )
        ) : by === null ? (
          <>Opens after the {after}, {PAST}.</>
        ) : year !== null && year >= by ? (
          <>Open since Year {tenths(by)}, after the {after}.</>
        ) : (
          <>Opens at Year {tenths(by)}, after the {after}.</>
        )}
        {long}
      </span>
    </p>
  );
}

/** Where a build page goes back to, when not to all builds. */
export interface Back {
  to: string;
  label: string;
  state?: unknown;
  /** From the walk on Reach, whose own head stands over the page. */
  walk?: boolean;
  /** The walk's stops, drawn small on the way back, and the one it goes back to. */
  stops?: { n: number; at: number };
}

/** Where the build page open now came from, if somewhere with its own way back. */
export const useBack = () => (useLocation().state as { back?: Back } | null)?.back;

export function BuildPage({ slug }: { slug: string }) {
  const { plan } = usePlan();
  const { scale, done } = useSchedule();
  const { set: place, pick, close, setClose } = useWorks();
  const navigate = useNavigate();
  // Opened from somewhere with its own way back, as the walk on Reach, the button goes back there. 2026-10-28.
  const from = useBack();
  const root = useRef<HTMLDivElement>(null);
  const build = [...BUILDS, ...LATER].find((b) => buildSlug(b.name) === slug);
  const later = LATER.find((b) => b.name === build?.name);
  const name = build?.name ?? null;

  // The map: our builds with places, and this one where it would stand.
  const placed = useMemo(() => placedOf(plan, done, scale), [plan, done, scale]);
  useEffect(() => place(placed), [place, placed]);
  useEffect(() => pick(name && SITES[name] ? name : null), [pick, name]);
  useEffect(() => () => pick(null), [pick]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate(from?.to ?? "/build", { state: from?.state });
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [navigate, from]);

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
      {/* The way back stays in reach while the page scrolls. From the walk on Reach, its head stays instead, and the
          way back sits under it, above the title. 2026-10-28. */}
      <div className={from?.walk ? "pt-2 pb-2" : "sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2"}>
        <BackBar to={from?.to ?? "/build"} state={from?.state} label={from?.label ?? "All builds"} stops={from?.stops} />
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className={`mt-[4px] shrink-0 ${buildTone(build.name, ordered(plan).includes(build.name))}`}>
          <BuildMark name={build.name} size={18} />
        </span>
        <h1 className="text-[19px] leading-snug font-medium">{build.name}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {build.what}
        {matter(plan, build.name)}
      </p>
      <div data-m>
        {later ? <Waits build={later} scale={scale} done={done} /> : <Queueing name={build.name} scale={scale} done={done} />}
      </div>
      <div data-m className="mt-3">
        <MindNote className="text-[14.5px] leading-snug">{SAYS[build.name]}</MindNote>
      </div>
      {SITES[build.name] && (
        <div data-m>
          <Story lines={buildStory(build.name)} tone="you" open />
        </div>
      )}
      <div data-m>
        <Opens name={build.name} />
      </div>
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
        onClick={() =>
          navigate(
            `/mind?ask=${encodeURIComponent(`What would the ${build.name} give us, and what ${later ? "does it wait on" : "would it slow"}?`)}`,
          )
        }
        className={`${CLOSE[build.name] ? "mt-2.5" : "mt-6"} h-[46px] shrink-0 rounded-full border border-ink text-[15px] font-medium`}
      >
        Ask the Mind about it
      </button>
    </div>
  );
}
