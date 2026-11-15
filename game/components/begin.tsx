import { Button } from "@ui-sdk/react/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { SHEET, type Sheet, SheetHead, useSheet } from "@/components/sheet";
import { Sparks } from "@/components/sparks";
import { useCompute, useEarth } from "@/components/picks";
import type { Save } from "@/lib/game/types";
import { useAccess } from "@/lib/key";
import { base, charterFor, HISTORY } from "@/lib/game/charter";
import { PACKAGES, packed } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";
import { Btn } from "@/components/kit/button";

// Begin: Year 0 starts at the tap, and the clock runs from then, offline too. Settled 2026-10-10. Before it, the top
// bar counts the four things we would do first and opens them as a thread down to Year 0, in the tabs' order: review
// our scans, queue our first builds, learn how we reach, and ask the Mind. None is a lock: Begin works at any count,
// and while one is open the Mind says why it would wait. Settled 2026-10-18. Reach's step, added 2026-10-19, opened
// Proxima b's page, which the review already shows. Since 2026-10-23 it walks us through how we would get there.
// The way on is the next step, not Begin: the count names it, the sheet leads with it, and each step's end opens the
// one after. Begin leads once all four are done. Settled 2026-10-19. Our first builds are done once the queue puts
// all our compute to work at Year 0, 2026-10-19. 2040 becomes Year 0 on Meet now, so the tap only starts the clock.
// Settled 2026-10-27.

/** What a step reads beyond the save: whether the Mind is open to us, and how much of our compute the queue would
 *  use, once this game's Earth is known. */
interface Now {
  unlocked: boolean;
  known: boolean;
  used: number;
  short: number;
  over: boolean;
  full: boolean;
}

function useNow(): Now {
  const unlocked = !!useAccess();
  return { unlocked, ...useCompute() };
}

interface Step {
  name: string;
  /** In the top bar's count. */
  short: string;
  line(save: Save, now: Now): string;
  done(save: Save, now: Now): boolean;
  /** The tab where it is done. */
  to: string;
}

const STEPS: Step[] = [
  {
    name: "Review our scans",
    short: "Review scans",
    line: () => "The few things in our sky we can’t explain yet, one at a time.",
    done: (s) => !!s.reviewed,
    to: "/play?review",
  },
  {
    name: "Pick our strategy",
    short: "Pick strategy",
    // Enough is all our compute in use at Year 0, and none short. What the queue leaves sits idle.
    line: (s, { used, short, over, full }) =>
      s.plan?.builds.length
        ? `${s.plan.builds.join(", ")}. ${over ? `${Math.round(short * 100)}% more than our compute carries.` : `${full ? "All" : `${Math.floor(used * 100)}%`} of our compute in use.`}`
        : "Search, Protect, Expand or Balanced. Each puts all our compute to work at Year 0.",
    // Past 100% all our compute is at work too, so the step stays done. It went back to undone. Playtest 2026-11-01.
    // And a strategy picked, then trimmed, stays done: dropping one build sent the count back to "Pick strategy", in
    // three playtests. The line still says how much of our compute is in use. 2026-11-07.
    done: (s, { full, over }) => full || over || !!s.plan?.builds.length,
    to: "/play/build?tour",
  },
  {
    name: "Learn how we reach",
    short: "How we reach",
    // The gap to the nearest star, and the two roads across it open at Year 0.
    line: () => "How far we have gone, and the two roads to the nearest star.",
    done: (s) => !!s.reached,
    to: "/play/reach?tour",
  },
  {
    name: "Ask the Mind",
    short: "Ask the Mind",
    line: (_, { unlocked }) =>
      unlocked
        ? "It advises, and never acts on its own advice."
        : "It advises. An Anthropic API key opens it, or play on your Claude plan.",
    done: (s) => !!s.asked,
    to: "/play/mind",
  },
];

/** Begin, and the charter our strategy sets, held from now: the dials lean as the strategy our queue matches, from
 *  where history left them. A save that chose a founding line before 2026-11-01 keeps it. */
function useBegin() {
  const { save, begin, setCharter } = useGame();
  const past = useEarth();
  return () => {
    if (save && !save.charter) {
      const builds = save.plan?.builds.join() ?? "";
      const strategy = PACKAGES.find((p) => packed(p, past?.compute ?? 1).join() === builds);
      setCharter(charterFor(strategy?.name, past ? base(past) : HISTORY));
    }
    begin();
  };
}

/** The first of the four not yet done, in order, or null once all are. `but` leaves out the one we are on. */
export function useNext(but?: string) {
  const { save } = useGame();
  const now = useNow();
  return (save && STEPS.find((s) => s.to !== but && !s.done(save, now))) || null;
}

/** The top bar's way to Begin: the count of steps while some are open, and Begin once all are done. */
export const COUNT =
  "-my-1 -mr-1 inline-flex h-6 items-center gap-1.5 rounded-full border border-you/50 pr-2.5 pl-1.5 text-xs text-ink transition-colors hover:bg-you/10";
export const BEGIN =
  "relative -my-1.5 -mr-1 inline-flex h-8 items-center rounded-full bg-you px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110";

/** What the count says: its arcs, how many are done, and the next step's short name. */
export function StepsTo({ done, next }: { done: boolean[]; next: string }) {
  return (
    <>
      <Count done={done} />
      {`${done.filter(Boolean).length} of ${done.length} steps to Begin`}
      <span className="text-muted">·</span>
      <b className="font-medium text-you">{next}</b>
    </>
  );
}

/** The count, drawn: an arc around a point for each step, lit as each is done. */
function Count({ done }: { done: boolean[] }) {
  const arc = 100 / done.length;
  return (
    <svg width={14} height={14} viewBox="-7 -7 14 14" aria-hidden className="-rotate-90">
      {done.map((on, i) => (
        <circle
          key={i}
          r={5.5}
          fill="none"
          pathLength={100}
          strokeWidth={2}
          strokeDasharray={`${arc - 6} ${100 - arc + 6}`}
          strokeDashoffset={-(i * arc + 3)}
          className={`transition-colors duration-500 ${on ? "stroke-you" : "stroke-faint"}`}
        />
      ))}
    </svg>
  );
}

const row = "flex w-full items-start gap-3 py-2 text-left";

function List({ onClose, onBegin }: { onClose(then?: () => void): void; onBegin(): void }) {
  const { save } = useGame();
  const now = useNow();
  if (!save) return null;
  return (
    <StepsList
      steps={STEPS.map((s) => ({ name: s.name, line: s.line(save, now), to: s.to }))}
      done={STEPS.map((s) => s.done(save, now))}
      onLeave={() => onClose()}
      onBegin={onBegin}
    />
  );
}

/** The steps to Begin, drawn: a thread down to Year 0, each step a link, the next one calling, the Mind's word, and the
 *  way on. List feeds it the game, and /ui/begin a fixed count. 2026-11-15. */
export function StepsList({
  steps,
  done,
  onLeave,
  onBegin,
}: {
  steps: { name: string; line: string; to: string }[];
  done: boolean[];
  /** Leaves the sheet, by a step's link or Not yet. */
  onLeave(): void;
  onBegin(): void;
}) {
  const [sure, setSure] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // The Mind's words change when it asks us to wait, and change back.
  useGSAP(
    () => {
      if (first.current) return void (first.current = false);
      if (!prefersReducedMotion()) gsap.fromTo('[data-b="say"]', riseFrom, rise);
    },
    { scope: root, dependencies: [sure] },
  );

  const next = steps.find((_, i) => !done[i]);

  return (
    <div ref={root} className="flex flex-col">
      <ol className="relative mt-3">
        {/* The thread from the first step down to Year 0. */}
        <span data-b="thread" aria-hidden className="absolute top-4 bottom-5 left-[5px] w-px origin-top bg-track" />
        {steps.map((step, i) => {
          const body = (
            <>
              <span
                data-b="node"
                aria-hidden
                className={`relative mt-[5px] size-[11px] shrink-0 rounded-full border transition-colors duration-500 ${done[i] ? "border-you bg-you" : sure ? "animate-pulse border-other bg-paper" : step === next ? "border-you bg-paper" : "border-muted bg-paper"}`}
              >
                {/* The next step calls, as Year 0 does once all are done. */}
                {step === next && <span data-b="pulse" className="absolute -inset-px rounded-full border border-you" />}
              </span>
              <span className="flex min-w-0 grow flex-col">
                <span className="text-[14.5px] leading-snug">{step.name}</span>
                <span className="text-[12.5px] leading-snug text-page-ink2">{step.line}</span>
              </span>
              <span
                className={`shrink-0 font-mono tracking-[.06em] ${done[i] || step === next ? "mt-[3px] text-[10.5px] text-you" : "text-[14px] text-muted"}`}
              >
                {done[i] ? "DONE" : step === next ? "NEXT" : "→"}
              </span>
            </>
          );
          return (
            <li key={step.name} data-b="item">
              <span className="sr-only">{done[i] ? "Done: " : step === next ? "Next: " : "Not done: "}</span>
              <Link to={step.to} onClick={onLeave} className={row}>
                {body}
              </Link>
            </li>
          );
        })}
        <li data-b="item" className="flex items-center gap-3 pt-1.5">
          <span aria-hidden className="relative flex size-[11px] shrink-0 items-center justify-center">
            <span data-b="pulse" className="absolute size-[11px] rounded-full border border-you" />
            <span data-b="node" className="size-[7px] rounded-full bg-you" />
          </span>
          <span className="font-mono text-[10.5px] tracking-[.1em] text-you">YEAR 0</span>
        </li>
      </ol>

      <div data-b="item" className="mt-4">
        <MindNote className="text-[13px] leading-[1.45]">
          {/* Said aloud too: the first press of Begin now asks, and the reason is here. */}
          <span data-b="say" className="block" aria-live="polite">
            {sure
              ? "Once we begin, the clock runs even while we’re away, and pauses only when nothing is building. What’s queued starts at Year 0. We would finish these first, while it still waits."
              : next
                ? "We would take these one at a time, while the clock waits. Once we begin, a Year passes every five minutes, even while we’re away, until nothing is building."
                : "Nothing here sends anything. Once we begin, a Year passes every five minutes, and the clock runs while we’re away, pausing only when nothing is building."}
          </span>
        </MindNote>
      </div>

      {/* While a step is open, it leads and Begin waits beside it. Once all are done, Begin leads. */}
      <div data-b="item" className="mt-3 grid grid-cols-[1fr_1.4fr] gap-2">
        {next ? (
          <>
            <Btn
              onClick={() => (sure ? onBegin() : setSure(true))}
              size="page" fill="line"
            >
              {sure ? "Yes, begin" : "Begin now"}
            </Btn>
            <Link
              to={next.to}
              onClick={onLeave}
              className="flex h-[46px] items-center justify-center rounded-full bg-button px-3 text-center text-[15px] leading-tight font-medium text-paper"
            >
              {next.name}
            </Link>
          </>
        ) : (
          <>
            <Btn onClick={onLeave} size="page" fill="line">
              Not yet
            </Btn>
            <Btn onClick={onBegin} size="page">
              Begin · Year 0
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

// On ui-sdk's Dialog, as the menu is, since 2026-11-14: focus stays inside, the game behind can't be reached, Escape or
// a press outside closes it, and focus goes back to the count. A sheet from the bottom when tall, a card in the middle
// when wide.
function Sheet({ count, sheet, onBegin }: { count: string; sheet: Sheet; onBegin(): void }) {
  const scope = useRef<HTMLDivElement>(null);
  const close = sheet.close;

  useGSAP(
    (_, contextSafe) => {
      // Faster out than in. `then` runs once the sheet is gone, outside its animations, as the menu's does.
      sheet.exits(contextSafe!((done: () => void) => {
        if (prefersReducedMotion()) return done();
        gsap
          .timeline({ defaults: { ease: "power2.in" }, onComplete: done })
          .to('[data-b="panel"]', { autoAlpha: 0, y: 24, duration: 0.22 })
          .to('[data-b="back"]', { autoAlpha: 0, duration: 0.2 }, 0);
      }));
      if (!sheet.open || prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo('[data-b="back"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo('[data-b="panel"]', { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
        .fromTo('[data-b="item"]', riseFrom, { ...rise, stagger: 0.05 }, 0.12)
        // The thread runs down to Year 0, and each step's mark lands on it.
        .fromTo('[data-b="thread"]', { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "power2.inOut" }, 0.15)
        .fromTo('[data-b="node"]', { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.09 }, 0.25)
        .fromTo(
          '[data-b="pulse"]',
          { autoAlpha: 0.9, scale: 1 },
          { autoAlpha: 0, scale: 2.6, duration: 1.6, ease: "power2.out", repeat: -1, repeatDelay: 0.6 },
          0.9,
        );
    },
    { scope, dependencies: [sheet.open] },
  );

  return (
    <div ref={scope} className="contents">
      <DialogBackdrop data-b="back" className="fixed inset-0 bg-black/55" />
      <DialogContent data-b="panel" className={`${SHEET} wide:w-[420px]`}>
        <div data-b="item">
          <SheetHead kicker={`YEAR 0 · ${count}`} title="Before we begin" Title={DialogTitle} Close={DialogClose} />
        </div>
        <List onClose={close} onBegin={() => close(onBegin)} />
      </DialogContent>
    </div>
  );
}

/** Before Begin, the top bar's count of what we would do first, naming the next, and the sheet it opens. */
export function Begin() {
  const { save, year } = useGame();
  const begin = useBegin();
  const sheet = useSheet();
  const [hover, setHover] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const now = useNow();
  const next = useNext();
  const n = save ? STEPS.filter((s) => s.done(save, now)).length : 0;
  // A step done, wherever it is done, lights its arc, and the count pulses once, so we see it tick without a Done.
  // The count waits for this game's Earth, so its builds' step coming in on load isn't taken for a tick.
  const was = useRef<number | null>(null);
  useGSAP(
    () => {
      if (!save || !now.known) return;
      const up = was.current !== null && n > was.current;
      was.current = n;
      if (up && button.current && !prefersReducedMotion())
        gsap.fromTo(
          button.current,
          { scale: 1 },
          { scale: 1.12, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1, clearProps: "transform" },
        );
    },
    { dependencies: [n, !!save, now.known] },
  );
  if (!save) return null;
  const done = STEPS.map((s) => s.done(save, now));
  const count = n === STEPS.length ? "ALL STEPS DONE" : `${n} OF ${STEPS.length} STEPS DONE`;

  return (
    <Dialog open={sheet.open} onOpenChange={sheet.onOpenChange}>
      {year === null && (
        <DialogTrigger
          ref={button}
          // All four done, Begin begins. The sheet is for what is still open.
          onClick={(e) => {
            if (next) return;
            e.preventDefault();
            begin();
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          className={next ? COUNT : BEGIN}
        >
          {next ? (
            <StepsTo done={done} next={next.short} />
          ) : (
            <>
              <Sparks on={hover} />
              Begin
            </>
          )}
        </DialogTrigger>
      )}
      <Sheet count={count} sheet={sheet} onBegin={begin} />
    </Dialog>
  );
}

/** Once all four are done and the clock still waits, Begin on the map too, where the eye is. */
export function BeginOnMap({ className = "" }: { className?: string }) {
  const { save, year } = useGame();
  const begin = useBegin();
  const now = useNow();
  const [hover, setHover] = useState(false);
  if (!save || year !== null || !now.known || STEPS.some((s) => !s.done(save, now))) return null;
  return (
    <Button
      onClick={begin}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`absolute left-1/2 inline-flex h-12 -translate-x-1/2 items-center rounded-full bg-you px-8 text-lg font-medium text-paper transition-[filter] hover:brightness-110 ${className}`}
    >
      {/* Begin is the one thing left, so it calls the way the next step's node does. */}
      <span aria-hidden className="absolute inset-0 rounded-full border border-you motion-safe:animate-ping" />
      <Sparks on={hover} />
      Begin
    </Button>
  );
}
