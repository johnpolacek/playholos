import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { useCompute } from "@/components/picks";
import { seenYearZero, YearZero } from "@/components/year-zero";
import { MS_PER_YEAR } from "@/lib/game/clock";
import { FOMALHAUT } from "@/lib/game/plan";
import type { Save } from "@/lib/game/types";
import { useAccess } from "@/lib/key";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Begin: Year 0 starts at the tap, and the clock runs from then, offline too. Settled 2026-10-10. Before it, the top
// bar counts the four things we would do first and opens them as a thread down to Year 0, in the tabs' order: review
// our scans, queue our first builds, learn how we reach, and ask the Mind. None is a lock: Begin works at any count,
// and while one is open the Mind says why it would wait. Settled 2026-10-18. Reach's step, added 2026-10-19, opened
// Proxima b's page, which the review already shows. Since 2026-10-23 it walks us through how we would get there.
// The way on is the next step, not Begin: the count names it, the sheet leads with it, and each step's end opens the
// one after. Begin leads once all four are done. Settled 2026-10-19. Our first builds are done once the queue puts
// all our compute to work at Year 0, 2026-10-19. The tap plays 2040 becoming Year 0, over the screen the first time
// and in the top bar after.

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
    // Fomalhaut's image is offered at the review's end. Once queued, its landing is the line.
    line: (s) =>
      s.plan?.observe.length
        ? `Fomalhaut’s new image lands ${Math.round((FOMALHAUT.lands * MS_PER_YEAR) / 1000)} seconds after we begin.`
        : "The few things in our sky we can’t explain yet, one at a time.",
    done: (s) => !!s.reviewed,
    to: "/?review",
  },
  {
    name: "Queue our first builds",
    short: "Queue builds",
    // Enough is all our compute in use at Year 0, and none short. What the queue leaves sits idle.
    line: (s, { used, short, over, full }) =>
      s.plan?.builds.length
        ? `${s.plan.builds.join(", ")}. ${over ? `${Math.round(short * 100)}% more than our compute carries.` : `${full ? "All" : `${Math.floor(used * 100)}%`} of our compute in use.`}`
        : "Enough to put all our compute to work at Year 0.",
    done: (_, { full }) => full,
    to: "/build?tour",
  },
  {
    name: "Learn how we reach",
    short: "How we reach",
    // The gap to the nearest star, and the two roads across it open at Year 0.
    line: () => "How far we have gone, and the two roads to the nearest star.",
    done: (s) => !!s.reached,
    to: "/reach?tour",
  },
  {
    name: "Ask the Mind",
    short: "Ask the Mind",
    line: (_, { unlocked }) =>
      unlocked
        ? "It advises, and never acts on its own advice."
        : "It advises. An Anthropic API key, or the access code, opens it.",
    done: (s) => !!s.asked,
    to: "/mind",
  },
];

/** The first of the four not yet done, in order, or null once all are. `but` leaves out the one we are on. */
export function useNext(but?: string) {
  const { save } = useGame();
  const now = useNow();
  return (save && STEPS.find((s) => s.to !== but && !s.done(save, now))) || null;
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

  if (!save) return null;
  const done = STEPS.map((s) => s.done(save, now));
  const next = STEPS.find((s) => !s.done(save, now));

  return (
    <div ref={root} className="flex flex-col">
      <ol className="relative mt-3">
        {/* The thread from the first step down to Year 0. */}
        <span data-b="thread" aria-hidden className="absolute top-4 bottom-5 left-[5px] w-px origin-top bg-track" />
        {STEPS.map((step, i) => {
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
                <span className="text-[12.5px] leading-snug text-page-ink2">{step.line(save, now)}</span>
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
              <Link to={step.to} onClick={() => onClose()} className={row}>
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
          <span data-b="say" className="block">
            {sure
              ? "Once we begin, the clock doesn’t stop, even while we’re away, and what’s queued starts at Year 0. We would finish these first, while it still waits."
              : next
                ? "We would take these one at a time, while the clock waits. Once we begin, a Year passes every five minutes, even while we’re away."
                : "Nothing here sends anything. Once we begin, a Year passes every five minutes, and the clock keeps running while we’re away."}
          </span>
        </MindNote>
      </div>

      {/* While a step is open, it leads and Begin waits beside it. Once all are done, Begin leads. */}
      <div data-b="item" className="mt-3 grid grid-cols-[1fr_1.4fr] gap-2">
        {next ? (
          <>
            <button
              onClick={() => (sure ? onBegin() : setSure(true))}
              className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
            >
              {sure ? "Begin anyway" : "Begin now"}
            </button>
            <Link
              to={next.to}
              onClick={() => onClose()}
              className="flex h-[46px] items-center justify-center rounded-full bg-ink px-3 text-center text-[15px] leading-tight font-medium text-paper"
            >
              {next.name}
            </Link>
          </>
        ) : (
          <>
            <button onClick={() => onClose()} className="h-[46px] rounded-full border border-ink text-[15px] font-medium">
              Not yet
            </button>
            <button onClick={onBegin} className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper">
              Begin · Year 0
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// A native modal dialog, as the menu is: focus stays inside, the game behind can't be reached, and Escape closes it.
// A sheet from the bottom when tall, a card in the middle when wide.
function Sheet({ count, onClose, onBegin }: { count: string; onClose(): void; onBegin(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
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
    { scope: dialog },
  );

  // Faster out than in. `then` runs once the sheet is gone, outside its animations, as the menu's does.
  const close = (then?: () => void) =>
    contextSafe(() => {
      if (closing.current) return;
      closing.current = true;
      const gone = () => {
        dialog.current?.close();
        onClose();
        if (then) setTimeout(then);
      };
      if (prefersReducedMotion()) return gone();
      gsap
        .timeline({ defaults: { ease: "power2.in" }, onComplete: gone })
        .to('[data-b="panel"]', { autoAlpha: 0, y: 24, duration: 0.22 })
        .to('[data-b="back"]', { autoAlpha: 0, duration: 0.2 }, 0);
    })();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="begin-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={() => closing.current || onClose()}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-left text-ink backdrop:bg-transparent"
    >
      <div data-b="back" onClick={() => close()} className="absolute inset-0 bg-black/55" />
      <div className="pointer-events-none relative flex h-full items-end justify-center wide:items-center wide:p-6">
        <section
          data-b="panel"
          className="pointer-events-auto flex max-h-full w-full max-w-xl flex-col overflow-y-auto rounded-t-2xl border border-b-0 border-faint bg-paper px-5 pt-4 pb-5 wide:w-[420px] wide:rounded-2xl wide:border-b"
        >
          <div data-b="item" className="flex items-start justify-between">
            <span className="flex flex-col gap-1">
              <span className="font-mono text-[10.5px] tracking-[.1em] text-muted">2040 · {count}</span>
              <h2 id="begin-title" className="text-[19px] leading-snug font-medium">
                Before we begin
              </h2>
            </span>
            <button onClick={() => close()} aria-label="Close" className="-mt-2 -mr-3 size-11 text-xl leading-none text-muted">
              ×
            </button>
          </div>
          <List onClose={close} onBegin={() => close(onBegin)} />
        </section>
      </div>
    </dialog>
  );
}

/** Before Begin, the top bar's count of what we would do first, naming the next, and the sheet it opens. After, the Year 0 moment. */
export function Begin() {
  const { save, year, begin } = useGame();
  const [open, setOpen] = useState(false);
  const [moment, setMoment] = useState<"full" | "roll" | null>(null);
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
  const count = n === STEPS.length ? "ALL READY" : `${n} OF ${STEPS.length} READY`;

  return (
    <>
      {year === null && (
        <button
          ref={button}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="-my-1 -mr-1 inline-flex h-6 items-center gap-1.5 rounded-full border border-you/50 pr-2.5 pl-1.5 text-xs text-ink transition-colors hover:bg-you/10"
        >
          <Count done={done} />
          {n === STEPS.length ? "All ready" : `${n} of ${STEPS.length} ready`}
          <span className="text-muted">·</span>
          <b className="font-medium text-you">{next ? next.short : "Begin"}</b>
        </button>
      )}
      {open && (
        <Sheet
          count={count}
          onClose={() => {
            setOpen(false);
            button.current?.focus();
          }}
          onBegin={() => {
            setMoment(seenYearZero() ? "roll" : "full");
            begin();
          }}
        />
      )}
      <YearZero on={!!moment} full={moment === "full"} onDone={() => setMoment(null)} />
    </>
  );
}
