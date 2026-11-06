import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useMindPick } from "@/components/catalog";
import { readingStands, useOpenReadings } from "@/components/close-reading";
import { useGame } from "@/components/game-provider";
import { Arrived, setLeap, useLeap } from "@/components/jump";
import { useAhead, useIdleNow } from "@/components/hud";
import { useJumpWords } from "@/components/mind-news";
import { MindNote } from "@/components/mind-note";
import { usePlan, useSchedule } from "@/components/picks";
import { Quiet } from "@/components/quiet";
import { watcherWords } from "@/lib/game/watcher-words";
import { usePath } from "@/components/path";
import { useLeads } from "@/components/scan";
import { starName } from "@/lib/game/leads";
import { tenths, yearText } from "@/lib/game/clock";
import { buildSlug, drawAt, orderLater, searchOf } from "@/lib/game/plan";
import { flybyRoad } from "@/lib/game/reach";
import { READ_YEARS } from "@/lib/sim/minds";
import { combedAt } from "@/lib/sim/works";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Nothing building: the Mind says so on the map, in gold, and names the build it would start, with a button to start
// it and go to its page. The Mind only advises: the tap is the Will's order. It sat in Build's panel above the
// Catalog until 2026-11-02, when the Will asked for it on the map as the Mind's word, and a way to start the build.
// And when something builds but nothing needs us, it says what comes next and offers the jump there, and names a build
// for compute sitting idle: a reload into a quiet screen gave no clue what to do. Playtest 2026-11-02.

/** Idle compute worth a word: less than this at work. */
const SPARE = 0.8;

export function IdleNote() {
  const { save, year, orderAt, playOn } = useGame();
  const { idle, held, last } = useIdleNow();
  const { plan, change } = usePlan();
  const { scale } = useSchedule();
  const { standing, leads, minds, readings } = useLeads();
  // The watcher found, and its word not yet read: the biggest news there is, so it holds the note until we open it.
  // It reached us as a small label on the map until a playtest, 2026-11-05.
  const watchLead = leads.find((l) => l.slug === "small-dark-body");
  // Unread however long ago it came: Scan's NEW fades after 50 Years, and this mustn't.
  const watchNew = !!watchLead && (readings[watchLead.slug] ?? []).some((r) => !(save?.seen ?? []).includes(r.id));
  const ahead = useAhead();
  const open = useOpenReadings();
  const glow = open[0];
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const nextStep = usePath().next;
  const now = tenths(year ?? 0);
  const { compute } = useMemo(() => drawAt(plan, scale, now), [plan, scale, now]);
  // Compute combing old recordings isn't idle.
  const searching = useMemo(() => combedAt(searchOf(plan, scale), now) < now - 0.05, [plan, scale, now]);
  const spare = !idle && !searching && compute < SPARE;
  // A glow waiting on a Close Reading stands under Needs us, and this note is what points to it, so it doesn't hide.
  const needs = Object.entries(standing).some(([slug, s]) => s === "needs" && !open.some((l) => l.slug === slug));
  const quiet = !idle && !needs && (spare || ahead !== null);
  // Put away until the next time nothing builds, or the next stop.
  const key = watchNew ? "watcher" : idle ? `idle ${last}` : `next ${ahead?.to ?? ""}`;
  const [away, setAway] = useState<string | null>(null);
  // A jump is told here too, ahead of the note's usual word, on every tab: the Mind says what reached us, in one note,
  // with its own words on it. On the Mind tab the talk shows those. 2026-11-04.
  const leap = useLeap();
  const told = useJumpWords(leap?.snap.said);
  const shown = year !== null && (idle || quiet || watchNew) && away !== key && path !== "/play/mind";
  const pick = useMindPick(shown && (idle || spare));
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if ((shown || leap) && !prefersReducedMotion()) gsap.fromTo(root.current, riseFrom, rise);
    },
    { dependencies: [shown, idle, leap?.to] },
  );
  if (leap)
    return (
      <div
        ref={root}
        role="status"
        className="absolute top-10 left-2.5 z-20 max-h-[calc(100%-3.5rem)] w-[min(400px,calc(100%-20px))] overflow-y-auto rounded-xl border border-faint bg-paper/90 pt-2 pr-2 backdrop-blur-sm"
      >
        <MindNote still={!told.busy} edge={false} className="text-[13.5px] leading-[1.45]">
          <Quiet
            key={leap.to}
            from={leap.from}
            to={leap.to}
            onClose={() => {
              told.read();
              setLeap(null);
            }}
          >
            {told.fresh && path !== "/play/mind" && (
              <p aria-live="polite">
                {told.words || "…"}{" "}
                <Link to="/play/mind" onClick={told.read} className="text-[12.5px] whitespace-nowrap text-you hover:underline">
                  Reply ›
                </Link>
              </p>
            )}
            <Arrived from={leap.from} to={leap.to} snap={leap.snap} />
          </Quiet>
        </MindNote>
      </div>
    );
  if (!shown) return null;
  const start = () => {
    if (!pick || orderAt === null) return;
    change(orderLater(pick.build.name, tenths(orderAt)));
    navigate(`/play/build/${buildSlug(pick.build.name)}`);
  };
  // Every build we can start is ours already: the Mind offers the next move, in the order we can act on it. "We have
  // built all we can" was a dead end. Playtest 2026-11-04. First a shining glow we read as plain heat and haven't called.
  const spent = idle && !pick;
  const reads = plan.closeReads ?? [];
  // One we have sent a craft to is answered too: it kept asking us to go after a probe was on its way. 2026-11-05.
  const engaged = new Set([...(plan.flybys ?? []), ...(plan.sentinels ?? []), ...(plan.lenses ?? []), ...(plan.seeds ?? []), ...(plan.strikes ?? [])].map((o) => o.name));
  const heat = !spent || glow
    ? undefined
    : leads.find((l) => {
        const flash = minds?.flashes[Number(l.slug.replace("warm-glow-", "")) - 1];
        return readingStands(l, minds, reads) === "done" && flash?.read?.saw === "smooth" && flash.faded === undefined && !save?.sent?.some((m) => m.to === l.star) && !engaged.has(l.star);
      });
  // Then the reading under way, then our latest sail or probe on its way, then a word with the Mind on where to turn.
  const reading = spent && !glow && !heat ? reads.find((o) => o.y + READ_YEARS > now) : undefined;
  // Then our path's next step, so the note never leaves us with nowhere to turn. Playtest 2026-11-05.
  const step = spent && !glow && !heat && !reading ? nextStep : null;
  const flight = spent && !glow && !heat && !reading && !step
    ? (plan.flybys ?? [])
        .map((o) => ({ o, r: flybyRoad(plan, scale, o.y, o) }))
        .filter(({ r }) => r.home !== null && r.home > now)
        .sort((a, b) => b.o.y - a.o.y)[0]
    : undefined;
  const openSky = spent && !glow && !heat && !reading && !step && !flight;
  const clock = held && <span className="text-page-ink2"> The clock waits.</span>;
  const what = pick ? `${pick.build.what.charAt(0).toLowerCase()}${pick.build.what.slice(1)}` : "";
  return (
    <div
      ref={root}
      role="status"
      className="absolute top-10 left-2.5 z-20 w-[min(400px,calc(100%-20px))] rounded-xl border border-other/50 bg-paper/90 pt-2 pr-2 backdrop-blur-sm"
    >
      <button onClick={() => setAway(key)} aria-label="Put away" className="absolute top-0 right-0 z-10 flex size-9 items-center justify-center text-muted hover:text-ink">
        <svg aria-hidden width="10" height="10" viewBox="0 0 12 12">
          <path d="M1.5 1.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <MindNote edge={false} className="pr-6 text-[13.5px] leading-[1.45]">
        {watchNew && watchLead ? (
          <p>
            <span className="font-medium text-other">{watcherWords(watchLead, !!minds?.watcher?.warned).head}</span>{" "}
            <span className="text-page-ink2">{watcherWords(watchLead, !!minds?.watcher?.warned).tail}</span>
          </p>
        ) : idle && pick ? (
          <p>
            <span className="font-medium text-other">Our compute sits idle.</span>{" "}
            <span className="text-page-ink2">{held ? "Nothing is building, so the clock waits." : "Nothing is building."}</span>
          </p>
        ) : heat ? (
          <p>
            <span className="font-medium text-other">{starName(heat.star)} still shines, and its light is plain heat.</span>{" "}
            <span className="text-page-ink2">No dust explains it. We can call out to it, or go.</span>
            {clock}
          </p>
        ) : reading ? (
          <p>
            <span className="font-medium text-other">Our telescope is reading {starName(reading.name)}.</span>{" "}
            <span className="text-page-ink2">We will know its light by Year {yearText(reading.y + READ_YEARS)}.</span>
            {clock}
          </p>
        ) : step ? (
          <p>
            <span className="font-medium text-other">Our next step: {step.label.charAt(0).toLowerCase() + step.label.slice(1)}.</span>{" "}
            <span className="text-page-ink2">We look for life, make contact, and spread. Scan shows where we stand.</span>
            {clock}
          </p>
        ) : flight ? (
          <p>
            <span className="font-medium text-other">
              {flight.o.by === "sails" ? "Our sails are" : "Our probe is"} on {flight.o.by === "sails" ? "their" : "its"} way to {starName(flight.o.name)}.
            </span>{" "}
            <span className="text-page-ink2">
              {flight.r.leaves !== null && flight.r.leaves > now ? `${flight.o.by === "sails" ? "They leave" : "It leaves"} in Year ${yearText(flight.r.leaves)}. ` : ""}
              {flight.o.by === "sails" ? "They pass" : "It passes"} in Year {yearText(flight.r.arrives!)}, and {flight.o.by === "sails" ? "their" : "its"} pictures reach us by Year{" "}
              {yearText(flight.r.home!)}.
            </span>
            {clock}
          </p>
        ) : openSky ? (
          <p>
            <span className="font-medium text-other">Our builds stand ready. The sky is next.</span>{" "}
            <span className="text-page-ink2">We can call out to a star, or talk over where to turn.</span>
            {clock}
          </p>
        ) : (
          <p>
            {/* Said plainly, the reading first and the next stop apart: "A Close Reading is waiting on us. Next, at Year
                579.5" read as the reading coming then. Playtest 2026-11-04. */}
            <span className="font-medium text-other">{glow ? `We can read ${starName(glow.star)} now.` : "Nothing needs us now."}</span>{" "}
            <span className="text-page-ink2">
              {glow && `Our telescope is free, and the glow could fade before we look. A Close Reading takes ${READ_YEARS} Years. `}
              {spare && `${Math.round((1 - compute) * 100)}% of our compute sits idle.`}
            </span>
            {clock}
          </p>
        )}
        {!watchNew && pick && (
          <p className="mt-1 text-page-ink2">
            {pick.fit ? `For our ${pick.strategy} strategy, we would start ` : "We would start "}
            <b className="font-medium text-ink">{pick.build.name}</b>: {what}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          {!watchNew && pick && orderAt !== null && (
            <button
              onClick={start}
              className="h-8 rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
            >
              Start {pick.build.name}
            </button>
          )}
          {watchNew && watchLead && (
            <>
              <Link
                to={`/play/lead/${watchLead.slug}`}
                className="inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
              >
                Read it ›
              </Link>
              <Link
                to={`/play/mind?ask=${encodeURIComponent("We want to answer the watcher. What should we say to it, and what does it risk?")}`}
                className="text-[12.5px] text-you hover:underline"
              >
                Answer it ›
              </Link>
            </>
          )}
          {!watchNew && glow && path !== `/play/lead/${glow.slug}` && (
            <Link to={`/play/lead/${glow.slug}#close-reading`} className="inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110">
              See {starName(glow.star)} ›
            </Link>
          )}
          {!watchNew && heat && (
            <>
              <Link
                to={`/play/reach/${heat.slug}`}
                className="inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
              >
                Engage {starName(heat.star)}
              </Link>
              <Link
                to={`/play/mind?ask=${encodeURIComponent(`We want to send a message to ${heat.star}. What should it say, and what does it risk?`)}`}
                className="text-[12.5px] text-you hover:underline"
              >
                Send it a message ›
              </Link>
            </>
          )}
          {!watchNew && step?.to && (
            <Link
              to={step.to}
              className="inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
            >
              {step.label} ›
            </Link>
          )}
          {!watchNew && flight && path !== "/play/reach" && (
            <Link to="/play/reach" className="text-[12.5px] text-you hover:underline">
              See it on Reach ›
            </Link>
          )}
          {!watchNew && openSky && (
            <>
              <Link
                to={`/play/mind?ask=${encodeURIComponent("Our builds are done. Where should we turn next?")}`}
                className="inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
              >
                Talk it over
              </Link>
              <Link to="/play/reach" className="text-[12.5px] text-you hover:underline">
                Call out to a star ›
              </Link>
            </>
          )}
          {(!idle || !pick) && ahead && (
            <button
              onClick={ahead.go}
              className={`h-8 rounded-full px-4 text-[13px] font-medium transition-[filter] hover:brightness-110 ${pick || glow || heat || openSky || flight || step ? "border border-you/60 text-you" : "bg-you text-paper"}`}
            >
              Jump to {ahead.why ?? "what comes next"} ›
            </button>
          )}
          {(!idle || pick) && (
            <Link to="/play/build" className="text-[12.5px] text-you hover:underline">
              See the Catalog ›
            </Link>
          )}
          {held && (
            <button
              onClick={playOn}
              // Waiting on a reading, the clock is the one thing to move.
              className={reading ? "h-8 rounded-full bg-you px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110" : "text-[12.5px] text-muted hover:text-ink"}
            >
              Play on
            </button>
          )}
        </div>
      </MindNote>
    </div>
  );
}
