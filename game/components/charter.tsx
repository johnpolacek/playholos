"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { ENDS, HISTORY, NOTCH, WHY, base, kicks, lean, offers, reply } from "@/lib/game/charter";
import type { EarthPast } from "@/lib/game/past";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "What is Earth for?": morning, after the night. Three dials swing to where history set them, and this game's
// branches kick them. The Will may nudge each one notch. Then the Mind offers three founding lines fitted to the
// dials, or the Will writes its own.

const R = 42;
/** A needle's turn for a dial value: straight up at 50, flat left at 0, flat right at 100. */
const turn = (v: number) => -90 + (180 * v) / 100;
const tip = (v: number, r = R) => {
  const a = Math.PI - (Math.PI * v) / 100;
  return { x: 55 + r * Math.cos(a), y: 52 - r * Math.sin(a) };
};

function Gauge({
  dial,
  value,
  history,
  kick,
  nudge,
  onNudge,
}: {
  dial: number;
  value: number;
  history: number;
  kick?: string;
  nudge: number;
  onNudge(n: number): void;
}) {
  const needle = useRef<SVGGElement>(null);
  const first = useRef(true);
  const [a, b] = ENDS[dial];
  const ghost = tip(history, R + 4);
  const ghostIn = tip(history, R - 6);

  // After the intro, a nudge swings the needle to its new place.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) gsap.set(needle.current, { rotation: turn(value), svgOrigin: "55 52" });
    else gsap.to(needle.current, { rotation: turn(value), svgOrigin: "55 52", duration: 0.6, ease: "back.out(2.2)" });
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 110 62" className="w-full max-w-[120px]" aria-label={`${a} or ${b}: ${lean(dial, value)}`}>
        <path data-m="arc" d={`M13 52 A${R} ${R} 0 0 1 97 52`} fill="none" strokeWidth="1.2" className="stroke-ink" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const p = tip(i * 12.5, R);
          const q = tip(i * 12.5, R - 4);
          return (
            <line key={i} data-m="tick" x1={p.x} y1={p.y} x2={q.x} y2={q.y} strokeWidth=".8" className="stroke-muted" />
          );
        })}
        <line
          data-m="ghost"
          x1={ghost.x}
          y1={ghost.y}
          x2={ghostIn.x}
          y2={ghostIn.y}
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-you"
          opacity={nudge ? 0.6 : 0}
        />
        <g ref={needle} data-m="needle" data-dial={dial}>
          <line
            x1="55"
            y1="52"
            x2="55"
            y2={52 - R + 6}
            strokeWidth="1.6"
            strokeLinecap="round"
            className="stroke-ink"
          />
          <circle cx="55" cy="52" r="3" className="fill-ink" />
        </g>
      </svg>
      <div data-m="ends" className="-mt-1 flex w-full max-w-[120px] justify-between font-mono text-[9px] text-muted">
        <span>{a}</span>
        <span>{b}</span>
      </div>
      <span data-m="why" className="mt-1 min-h-[22px] text-center font-mono text-[9px] leading-tight text-muted">
        {WHY[dial]}
      </span>
      <span data-m="kick-tag" className="mt-1 min-h-[14px] text-center font-mono text-[9px] text-you">
        {kick}
      </span>
      <div data-m="nudge" className="mt-1 flex items-center gap-1">
        <button
          onClick={() => onNudge(nudge - 1)}
          disabled={nudge <= -1}
          aria-label={`Toward ${a}`}
          className="h-8 w-8 rounded-full border border-faint text-sm disabled:opacity-25"
        >
          ‹
        </button>
        <button
          onClick={() => onNudge(nudge + 1)}
          disabled={nudge >= 1}
          aria-label={`Toward ${b}`}
          className="h-8 w-8 rounded-full border border-faint text-sm disabled:opacity-25"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function Charter({ onNext }: { onSkip(): void; onNext(): void }) {
  const { save, setCharter } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState<EarthPast>();
  const [nudge, setNudge] = useState([0, 0, 0]);
  const [said, setSaid] = useState("");
  const [pick, setPick] = useState(0);
  const [own, setOwn] = useState("");
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast);
  }, [seed]);

  const start = useMemo(() => (past ? base(past) : HISTORY), [past]);
  const tags = useMemo(() => (past ? kicks(past) : []), [past]);
  const dials = start.map((v, i) => v + nudge[i] * NOTCH);
  const lines = offers(dials);
  const line = pick === 3 ? own.trim() : lines[pick];

  const { leave } = useStage(
    root,
    (q, tl) => {
      const needles = q('[data-m="needle"]');
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(q('[data-m="lead"]'), riseFrom, { ...rise, duration: 0.7 }, 0.1)
        .set(q('[data-m="arc"]'), { autoAlpha: 1 }, 0.4)
        .fromTo(
          q('[data-m="arc"]'),
          { drawSVG: "50% 50%" },
          { drawSVG: "0% 100%", duration: 0.8, ease: "power2.inOut", stagger: 0.12 },
          0.4,
        )
        .fromTo(q('[data-m="tick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.01 }, 0.8)
        .fromTo(q('[data-m="ends"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.1 }, 1)
        .set(needles, { autoAlpha: 1, rotation: 0, svgOrigin: "55 52" }, 1.1);
      // History swings each needle, and the reason shows under it.
      needles.forEach((n, i) => {
        tl.to(n, { rotation: turn(HISTORY[i]), duration: 1.1, ease: "elastic.out(1, 0.6)" }, 1.3 + i * 0.25);
      });
      tl.fromTo(q('[data-m="why"]'), { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.25 }, 1.4);
      // This game's branches kick the needles one notch.
      let t = 2.9;
      tags.forEach((k) => {
        tl.to(needles[k.dial], { rotation: turn(start[k.dial]), duration: 0.5, ease: "back.out(3)" }, t);
        t += 0.45;
      });
      tl.fromTo(
        q('[data-m="kick-tag"]'),
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)", stagger: 0.2 },
        2.9,
      )
        .fromTo(q('[data-m="nudge"]'), riseFrom, { ...rise, stagger: 0.08 }, t + 0.2)
        .fromTo(q('[data-m="note"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, t + 0.3)
        .fromTo(q('[data-m="lines-head"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.7)
        .fromTo(q('[data-m="line"]'), riseFrom, { ...rise, stagger: 0.12 }, t + 0.8)
        .fromTo(q('[data-m="act"]'), riseFrom, rise, t + 1.4);
    },
    !!past,
  );

  // Reduced motion skips the swing: the needles start where history and the branches left them.
  useEffect(() => {
    if (!past || !prefersReducedMotion() || !root.current) return;
    root.current.querySelectorAll<SVGGElement>('[data-m="needle"]').forEach((n, i) => {
      gsap.set(n, { rotation: turn(start[i]), svgOrigin: "55 52" });
    });
  }, [past, start]);

  function onNudge(dial: number, n: number) {
    setNudge((all) => all.map((v, i) => (i === dial ? n : v)));
    setSaid(reply(dial, n));
  }

  function keep() {
    if (!line) return;
    setCharter({ line, dials });
    leave(onNext);
  }

  return (
    <div
      ref={root}
      style={past ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 pt-6"
    >
      <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
        BEFORE YEAR 0 · EARTH’S CHARTER
      </span>
      <h1 data-m="lead" className="mt-1.5 text-[28px] leading-tight font-semibold">
        What is Earth for?
      </h1>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Gauge
            key={i}
            dial={i}
            value={dials[i]}
            history={start[i]}
            kick={tags
              .filter((k) => k.dial === i)
              .map((k) => k.what)
              .join(" · ")}
            nudge={nudge[i]}
            onNudge={(n) => onNudge(i, n)}
          />
        ))}
      </div>
      <p data-m="note" className="mt-3 min-h-[38px] text-[13px] leading-snug text-page-ink2">
        {said ||
          "History set these. Nudge each one notch if you disagree. They shape our advice, never what Earth can build."}
      </p>
      <span data-m="lines-head" className="mt-3 font-mono text-[10.5px] tracking-[.1em] text-muted">
        FOUNDING LINE · PROPOSED BY THE MIND
      </span>
      <div className="mt-2 flex flex-col gap-2">
        {lines.map((l, i) => (
          <button
            key={l}
            data-m="line"
            onClick={() => setPick(i)}
            aria-pressed={pick === i}
            className={`rounded-xl border px-3.5 py-3 text-left text-[15px] leading-snug transition-colors ${pick === i ? "border-you bg-you/10 font-medium" : "border-faint"}`}
          >
            “{l}”
          </button>
        ))}
        <div
          data-m="line"
          className={`rounded-xl border px-3.5 py-2 transition-colors ${pick === 3 ? "border-you bg-you/10" : "border-faint"}`}
        >
          <input
            value={own}
            onFocus={() => setPick(3)}
            onChange={(e) => {
              setOwn(e.target.value);
              setPick(3);
            }}
            maxLength={140}
            placeholder="Other: write your own"
            className="w-full bg-transparent py-1 text-[15px] outline-none placeholder:text-muted"
          />
        </div>
      </div>
      <div className="mt-auto shrink-0 pt-5 pb-4">
        <button
          data-m="act"
          onClick={keep}
          disabled={!line}
          className="h-[46px] w-full rounded-full bg-ink text-[15px] font-medium text-paper disabled:opacity-35"
        >
          This is our charter
        </button>
      </div>
    </div>
  );
}
