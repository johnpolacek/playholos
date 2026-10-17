"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { history, type EarthPast, type Moment } from "@/lib/game/past";
import { Sources } from "@/components/sources";
import { originsSources } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "Where we come from": 4.6 billion years as a spiral, drawn from the outside in. Each turn holds less time, so the
// deep past sweeps by and the last century crowds the middle. A light travels the line and stops at each moment.
// The middle is this morning, and Earth wakes there.

const CX = 195;
const CY = 168;
const TURNS = 3.25;
const DEEP = Math.log10(4.6e9 + 1);

/** Where on the spiral a moment sits, from 0 at the Sun's birth to 1 at this morning. Log time. */
const place = (ago: number) => 1 - Math.log10(ago + 1) / DEEP;
const radius = (u: number) => 152 * (1 - u) ** 0.6;
const angle = (u: number) => -Math.PI / 2 + TURNS * Math.PI * 2 * u;
const at = (u: number) => ({ x: CX + radius(u) * Math.cos(angle(u)), y: CY + radius(u) * Math.sin(angle(u)) });

/** The spiral as one path, and how far along it each u falls, so the line can be drawn to any moment. */
function spiral() {
  const n = 720;
  const pts = Array.from({ length: n + 1 }, (_, i) => at(i / n));
  const len = [0];
  for (let i = 1; i <= n; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = len[n];
  return {
    d: "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L"),
    along: (u: number) => (len[Math.round(u * n)] / total) * 100,
  };
}
const SPIRAL = spiral();

/** The clock under the spiral: years ago in the deep past, then dates. */
function when(ago: number) {
  if (ago < 0.5) return "2040 · this morning";
  if (ago >= 1e9) return `${(ago / 1e9).toFixed(1)} billion years ago`;
  if (ago >= 1e6) return `${Math.round(ago / 1e6)} million years ago`;
  if (ago >= 1e4) return `${Math.round(ago / 1e3).toLocaleString("en-US")},000 years ago`;
  const year = Math.round(2040 - ago);
  return year > 0 ? String(year) : `${(1 - year).toLocaleString("en-US")} BCE`;
}

function Caption({ m, now }: { m: Moment; now?: boolean }) {
  return (
    <div data-m="cap" className="col-start-1 row-start-1 flex flex-col gap-1">
      <b className={`text-[20px] leading-tight font-semibold ${now ? "text-you" : ""}`}>{m.what}</b>
      {m.detail && <span className="text-[13.5px] leading-[1.4] text-page-ink2">{m.detail}</span>}
      {m.dial && (
        <span className="mt-0.5 self-start rounded-lg border border-you px-1.5 text-[10.5px] text-you">{m.dial}</span>
      )}
    </div>
  );
}

const NOW: Moment = { when: "2040", ago: 0, what: "Earth wakes" };

export function Origins({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const { save } = useGame();
  const [past, setPast] = useState<EarthPast>();
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast);
  }, [seed]);
  const told = useMemo(() => past && history(past), [past]);
  const moments = useMemo(() => (told ? [...told.moments, NOW] : []), [told]);

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      const line = q('[data-m="line"]')[0];
      const head = q('[data-m="head"]')[0];
      const dots = q('[data-m="dot"]');
      const caps = q('[data-m="cap"]');
      const pos = { u: 0 };
      const follow = () => {
        gsap.set(line, { drawSVG: `0% ${SPIRAL.along(pos.u)}%` });
        const p = at(pos.u);
        gsap.set(head, { x: p.x, y: p.y });
        clock.current!.textContent = when(10 ** ((1 - pos.u) * DEEP) - 1);
      };
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(q('[data-m="lead"]'), riseFrom, { ...rise, duration: 0.6 }, 0.1)
        .set([line, head], { autoAlpha: 1 }, 0.4)
        .fromTo(q('[data-m="clock"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.4)
        .call(follow, [], 0.4);
      let prev = 0;
      let t = 0.6;
      moments.forEach((m, i) => {
        const u = place(m.ago);
        const move = 0.3 + 2.4 * (u - prev);
        tl.to(pos, { u, duration: move, ease: "sine.inOut", onUpdate: follow }, t);
        t += move;
        tl.fromTo(
          dots[i],
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(3)" },
          t - 0.05,
        );
        if (i > 0) tl.to(caps[i - 1], { autoAlpha: 0, y: -6, duration: 0.18, ease: "power2.in" }, t - 0.15);
        tl.fromTo(caps[i], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, t);
        t += m === NOW ? 0 : 0.5 + (m.detail ? 0.35 : 0) + (m.dial ? 0.3 : 0);
        prev = u;
      });
      tl.fromTo(
        q('[data-m="earth"]'),
        { autoAlpha: 0, scale: 0 },
        { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(2)", transformOrigin: "50% 50%" },
        t - 0.2,
      )
        .to(head, { autoAlpha: 0, duration: 0.4 }, t)
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, t + 0.6);
    },
    !!told,
  );

  // Reduced motion skips the journey: the whole spiral, every moment, and this morning's caption.
  useEffect(() => {
    if (!told || !prefersReducedMotion() || !root.current) return;
    const caps = root.current.querySelectorAll('[data-m="cap"]');
    caps.forEach((c, i) => gsap.set(c, { autoAlpha: i === caps.length - 1 ? 1 : 0 }));
    gsap.set(root.current.querySelector('[data-m="head"]'), { autoAlpha: 0 });
    clock.current!.textContent = when(0);
  }, [told]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={told ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 pt-6"
    >
      <div className="flex items-center justify-between">
        <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          BEFORE YEAR 0 · WHERE WE COME FROM
        </span>
        <Sources sources={past ? originsSources(past) : []} />
      </div>
      <h1 data-m="lead" className="mt-1.5 text-[22px] font-semibold">
        4.6 billion years to this morning
      </h1>
      <svg
        viewBox="0 0 390 336"
        aria-hidden
        className="-mx-5 mt-1 block h-[min(44vh,360px)] w-[calc(100%+40px)] shrink-0 font-mono"
      >
        <path d={SPIRAL.d} fill="none" strokeWidth=".7" opacity=".18" className="stroke-ink" />
        <path data-m="line" d={SPIRAL.d} fill="none" strokeWidth="1.2" strokeLinecap="round" className="stroke-ink" />
        {moments.map((m) => {
          const p = at(place(m.ago));
          return m === NOW ? (
            <g key="now" data-m="dot" transform={`translate(${p.x} ${p.y})`} />
          ) : (
            <circle
              key={m.what}
              data-m="dot"
              cx={p.x}
              cy={p.y}
              r={m.dial ? 3.6 : 2.8}
              strokeWidth="1.2"
              className={m.dial ? "fill-you stroke-paper" : "fill-paper stroke-ink"}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
          );
        })}
        <g data-m="earth">
          <circle cx={CX} cy={CY} r="16" opacity=".18" className="fill-you" />
          <circle cx={CX} cy={CY} r="7" strokeWidth="1.3" className="fill-paper stroke-you" />
        </g>
        <g data-m="head">
          <circle r="9" opacity=".22" className="fill-you" />
          <circle r="3.2" className="fill-you" />
        </g>
      </svg>
      <span data-m="clock" ref={clock} className="mt-1 font-mono text-[12px] tracking-[.04em] text-muted">
        4.6 billion years ago
      </span>
      <div className="mt-1.5 grid min-h-[110px]">
        {told?.moments.map((m) => (
          <Caption key={m.what} m={m} />
        ))}
        <Caption m={NOW} now />
      </div>
      <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4">
        <button
          data-m="act"
          onClick={() => leave(onSkip)}
          className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
        >
          Skip the people
        </button>
        <button
          data-m="act"
          onClick={() => leave(onNext)}
          className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Who they are
        </button>
      </div>
    </div>
  );
}
