import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useNext } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { Lens } from "@/components/icons";
import { MindNote } from "@/components/mind-note";
import { LeadMark } from "@/components/marks";
import { useLeads, useStepTap } from "@/components/scan";
import { span, lyOf } from "@/lib/game/clock";
import {
  gsap,
  prefersReducedMotion,
  rise,
  riseFrom,
  useGSAP,
} from "@/lib/motion";

// Reviewing our scans, the first of the four things we would do before Begin. The Mind takes us through Earth's
// leads one at a time, and the map turns to each star as we reach it. Settled 2026-10-18. Reaching the last lead
// counts as done, and says so: the head reads DONE, the top bar's count ticks, and the way on is the next of
// the four, or back to Scan once all are done.

const INTRO =
  "The sky near us is quiet. These are the few things in it we can’t explain yet. Beside each, how long light takes to reach it, at a Year every five minutes. A message takes that long, and an answer as long again to come back.";

/** The stops as a thread: Sol, then each lead in the order we take them. Passed and current stops are lit. The
 *  Build tour takes its builds on it too. */
export function Thread({
  stops,
  at,
  go,
}: {
  stops: { name: string; reply?: boolean }[];
  at: number;
  go(k: number): void;
}) {
  const last = stops.length - 1;
  return (
    <ol className="relative mt-1 flex items-center justify-between">
      <span
        aria-hidden
        className="absolute inset-x-[14px] top-1/2 h-px bg-track"
      />
      <span
        aria-hidden
        style={{ transform: `scaleX(${last ? at / last : 0})` }}
        className="absolute inset-x-[14px] top-1/2 h-px origin-left bg-you transition-transform duration-500 ease-out motion-reduce:transition-none"
      />
      {stops.map((s, k) => {
        const color = k === 0 ? "ink" : s.reply ? "other" : "you";
        const lit = k <= at;
        return (
          <li key={s.name} className="relative">
            <button
              onClick={() => go(k)}
              aria-label={s.name}
              aria-current={k === at ? "step" : undefined}
              className="flex size-7 items-center justify-center"
            >
              <span
                className={`rounded-full border transition-all duration-300 motion-reduce:transition-none ${k === at ? "size-[13px] ring-2 ring-offset-2 ring-offset-panel" : "size-[9px]"} ${
                  color === "ink"
                    ? `border-ink ring-ink/30 ${lit ? "bg-ink" : "bg-panel"}`
                    : color === "other"
                      ? `border-other ring-other/30 ${lit ? "bg-other" : "bg-panel"}`
                      : `border-you ring-you/30 ${lit ? "bg-you" : "bg-panel"}`
                }`}
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function Review({ onClose }: { onClose(): void }) {
  const { leads, dials, readings, setLook, close, setClose, setStep } = useLeads();
  const { did } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  // At the end, the way on is the next of the four things we would do first, or back to the tab once all are done.
  const then = useNext("/?review");
  const [at, setAt] = useState(0);

  // The leads in the order we take them: as Scan lists them.
  const order = useMemo(() => [...leads.keys()], [leads]);
  const last = order.length;
  const i = at > 0 ? order[at - 1] : -1;
  const lead = leads[i];
  const read = lead && readings[lead.slug]?.at(-1);

  // The map turns to the lead in view, and back out to them all when we leave. Its system, if we know it, is open to
  // Close View, from outside each time.
  useEffect(() => void Object.assign(dials, { focus: i + 1 }), [dials, i]);
  useEffect(() => () => void Object.assign(dials, { focus: 0 }), [dials]);
  useEffect(() => setLook(lead ?? null), [setLook, lead]);
  useEffect(() => () => setLook(null), [setLook]);

  useEffect(() => {
    if (last && at === last) did("reviewed");
  }, [at, last, did]);

  const go = (k: number) => setAt(Math.max(0, Math.min(last, k)));
  // A tap anywhere on the review or the map steps it, as a story on a phone, and on from the last stop is the way on.
  const step = (by: 1 | -1) => (by > 0 && at === last ? then && navigate(then.to) : go(at + by));
  const tap = useStepTap(step);
  useEffect(() => setStep(step));
  useEffect(() => () => setStep(null), [setStep]);
  // Each stop opens at its top: on a phone the page scrolls, and the last stop's place would hide this one's head.
  useEffect(
    () => void root.current?.closest("main")?.scrollTo({ top: 0 }),
    [at],
  );
  useEffect(() => next.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      // Typing, or a sheet open over the review, keeps the keys.
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
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
      if (!prefersReducedMotion())
        gsap.fromTo("[data-r]", riseFrom, { ...rise, stagger: 0.05 });
    },
    { scope: root, dependencies: [at] },
  );

  if (!leads.length) return null;
  const near = Math.min(...leads.map((l) => l.ly));
  const far = Math.max(...leads.map((l) => l.ly));

  return (
    <div ref={root} {...tap} className="flex grow flex-col">
      {/* In place of the tab's head, held at the top as the page scrolls. Tall, as on a phone, the way on is here too,
          so the Mind's words clear the fold. */}
      <div className="sticky -top-3 z-10 -mx-4 -mt-3 bg-panel px-4 pt-3 pb-1">
        <div className="flex items-center justify-between pt-1 pb-0.5 text-[11px] tracking-[.08em] text-muted">
          <span className="grow">
            {at ? `SCAN · REVIEW ${at} OF ${last}` : "SCAN · REVIEW"}
            {at === last && <span className="text-you"> · DONE</span>}
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
          <button
            onClick={onClose}
            aria-label="Close the review"
            className="-my-3 -mr-3 size-11 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <Thread
          stops={[
            { name: "All our leads" },
            ...order.map((k) => ({
              name: leads[k].star,
              reply: leads[k].reply,
            })),
          ]}
          at={at}
          go={go}
        />
      </div>

      <div
        key={at}
        aria-live="polite"
        className="mt-2 flex touch-pan-y flex-col"
      >
        {lead ? (
          <>
            <div data-r className="flex items-start gap-2.5">
              <span className={`mt-[4px] shrink-0 ${lead.reply ? "text-other" : "text-you"}`}>
                <LeadMark art={lead.art} size={18} />
              </span>
              <h2 className="text-[19px] leading-snug font-medium">
                {lead.star}
              </h2>
            </div>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {lead.what} · {lyOf(lead.ly)} ly · reached in{" "}
              <span className="font-mono tabular-nums">{span(lead.ly)}</span>
            </p>
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">
                {read ? (
                  <>
                    <b className="font-semibold">
                      {read.title}, Year {read.at}.
                    </b>{" "}
                    {read.mind}
                  </>
                ) : (
                  lead.brief
                )}
              </MindNote>
            </div>
            {lead.system && (
              <button
                data-r
                onClick={() => setClose(!close)}
                className="mt-4 flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-full border border-ink text-[15px] font-medium"
              >
                <Lens closer={!close} size={17} />
                {close ? "Pull Back" : "Close View"}
              </button>
            )}
          </>
        ) : (
          <>
            <h2 data-r className="text-[19px] leading-snug font-medium">
              What we can’t explain yet
            </h2>
            <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
              {leads.length} leads, {near.toFixed(1)} to {far.toFixed(1)}{" "}
              light-years out
            </p>
            <div data-r className="mt-3">
              <MindNote className="text-[14.5px] leading-snug">
                {INTRO}
              </MindNote>
            </div>
            {/* On a phone the way on is a tap, which nothing else says. Wide has its buttons. */}
            <p data-r className="mt-4 text-center font-mono text-[10px] tracking-[.1em] text-muted wide:hidden">
              TAP ANYWHERE TO GO ON
            </p>
          </>
        )}
      </div>

      {/* Wide, the way on stays in reach under the words. At the last stop, on a phone too, so the next step is plain. */}
      <div
        className={`sticky bottom-0 mt-auto grid-cols-[1fr_1.4fr] gap-2 bg-panel pt-3 pb-3 ${at === last ? "grid" : "hidden wide:grid"}`}
      >
        <button
          onClick={() => (at ? go(at - 1) : onClose())}
          className="h-11 rounded-full border border-ink text-[15px] font-medium"
        >
          {at ? "Back" : "Not now"}
        </button>
        <button
          ref={next}
          onClick={() => (at === last ? (then ? navigate(then.to) : onClose()) : go(at + 1))}
          className="h-11 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          {at === last
            ? (then?.name ?? "Back to Scan")
            : at
              ? `Next · ${leads[order[at]].star}`
              : `First · ${leads[order[0]].star}`}
        </button>
      </div>
    </div>
  );
}
