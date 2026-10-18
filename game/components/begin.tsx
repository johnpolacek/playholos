import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { seenYearZero, YearZero } from "@/components/year-zero";
import { MS_PER_YEAR } from "@/lib/game/clock";
import { FOMALHAUT } from "@/lib/game/plan";
import type { Save } from "@/lib/game/types";
import { useAccess } from "@/lib/key";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Begin: Year 0 starts at the tap, and the clock runs from then, offline too. Settled 2026-10-10. Before it, the top
// bar counts the three things we would do first and opens them as a thread down to Year 0: review our scans, queue
// our first builds, and ask the Mind. None is a lock: Begin works at any count, and while one is open the Mind says
// why it would wait. Settled 2026-10-18. The tap plays 2040 becoming Year 0, over the screen the first time and in the
// top bar after.

interface Step {
  name: string;
  line(save: Save, unlocked: boolean): string;
  done(save: Save): boolean;
  /** The tab where it is done. */
  to: string;
}

const STEPS: Step[] = [
  {
    name: "Review our scans",
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
    line: (s) => (s.plan?.builds.length ? s.plan.builds.join(", ") : "They start at Year 0, the moment we begin."),
    done: (s) => !!s.plan?.builds.length,
    to: "/projects",
  },
  {
    name: "Ask the Mind",
    line: (_, unlocked) =>
      unlocked
        ? "It advises, and never acts on its own advice."
        : "It advises. An Anthropic API key, or the access code, opens it.",
    done: (s) => !!s.asked,
    to: "/mind",
  },
];

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
  const unlocked = !!useAccess();
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
  const done = STEPS.map((s) => s.done(save));
  const open = done.filter((d) => !d).length;

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
                className={`relative mt-[5px] size-[11px] shrink-0 rounded-full border transition-colors duration-500 ${done[i] ? "border-you bg-you" : sure ? "animate-pulse border-other bg-paper" : "border-muted bg-paper"}`}
              />
              <span className="flex min-w-0 grow flex-col">
                <span className="text-[14.5px] leading-snug">{step.name}</span>
                <span className="text-[12.5px] leading-snug text-page-ink2">{step.line(save, unlocked)}</span>
              </span>
              <span
                className={`shrink-0 font-mono tracking-[.06em] ${done[i] ? "mt-[3px] text-[10.5px] text-you" : "text-[14px] text-muted"}`}
              >
                {done[i] ? "DONE" : "→"}
              </span>
            </>
          );
          return (
            <li key={step.name} data-b="item">
              <span className="sr-only">{done[i] ? "Done: " : "Not done: "}</span>
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
              ? "Once we begin, a Year passes every five of your minutes, even while you’re away. What’s queued starts at Year 0. We would finish these first, while the clock still waits."
              : "Nothing here sends anything. When you begin, one Year passes every five of your minutes, and we keep going while you’re away."}
          </span>
        </MindNote>
      </div>

      <div data-b="item" className="mt-3 grid grid-cols-[1fr_1.4fr] gap-2">
        <button
          onClick={() => (sure ? setSure(false) : onClose())}
          className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
        >
          Not yet
        </button>
        <button
          onClick={() => (open && !sure ? setSure(true) : onBegin())}
          className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          {sure ? "Begin anyway" : "Begin · Year 0"}
        </button>
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

/** Before Begin, the top bar's count of what we would do first, and the sheet it opens. After, the Year 0 moment. */
export function Begin() {
  const { save, year, begin } = useGame();
  const [open, setOpen] = useState(false);
  const [moment, setMoment] = useState<"full" | "roll" | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  if (!save) return null;
  const done = STEPS.map((s) => s.done(save));
  const n = done.filter(Boolean).length;
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
          <b className="font-medium text-you">Begin</b>
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
