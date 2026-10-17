"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FILL, Spread } from "@/components/spread";
import { SkyArt } from "@/components/sky";
import type { Dials } from "@/lib/drift";
import { PEOPLE_SOURCES } from "@/lib/game/sources";
import { prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "Who they are": Earth at night, in the game's scene. The globe turns in the dark while its real city lights come
// on, cities first, and the count climbs to 9.2 billion, the UN's 2040 projection. Then threads rise from the cities
// and meet in one point: their machines, woken as one. The lights are NASA's Black Marble, by way of the atlas's night
// map (scripts/lights.mjs).

const PEOPLE = 9.2e9;

function Globe({ dials, onReady }: { dials: Dials; onReady(flight: number): void }) {
  const label = useRef<HTMLSpanElement>(null);
  // The Mind's name follows its point, and comes in with it.
  const onMind = useCallback(
    (x: number, y: number) => {
      const l = label.current;
      if (!l) return;
      l.style.transform = `translate(${x}px, ${y - 14}px) translate(-50%, -100%)`;
      l.style.opacity = String(dials.mind ?? 0);
    },
    [dials],
  );
  return (
    <SkyArt
      mode="people"
      dials={dials}
      onReady={onReady}
      onMind={onMind}
      className={`relative block h-[min(46vh,360px)] w-full shrink-0 sm:h-[min(46vh,480px)] ${FILL}`}
    >
      <span ref={label} className="pointer-events-none absolute top-0 left-0 font-mono text-[9px] text-muted opacity-0">
        the Mind
      </span>
    </SkyArt>
  );
}

const LINES = ["About 195 nations. No one government.", "Their air is warmer than their recent ancestors knew."];

export function People({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  // One object for the whole screen: the intro tweens it, and the scene reads it every frame.
  const [dials] = useState<Dials>(() => ({ lit: 0, threads: 0, mind: 0 }));
  const [ready, setReady] = useState(false);
  // When the camera arrives at this screen, on the page's clock: the story starts then, however long its data took.
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setReady(true);
  }, []);

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      const s = dials;
      const n = { v: 0 };
      const show = () => (count.current!.textContent = Math.round(n.v).toLocaleString("en-US"));
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
        .set(q('[data-m="globe"]'), { autoAlpha: 1 }, 0)
        .to(s, { lit: 1, duration: 3.6, ease: "power1.in" }, 1)
        .fromTo(q('[data-m="count"]'), riseFrom, { ...rise, duration: 0.6 }, 1.1)
        .to(n, { v: PEOPLE, duration: 3.6, ease: "power1.in", onUpdate: show }, 1)
        .fromTo(q('[data-m="still"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 4.4);
      q('[data-m="line"]').forEach((line, i) => tl.fromTo(line, riseFrom, { ...rise, duration: 0.6 }, 4.8 + i * 1.1));
      tl.to(s, { threads: 1, duration: 1.8, ease: "power2.inOut" }, 6.2)
        .to(s, { mind: 1, duration: 0.6, ease: "back.out(2)" }, 7.7)
        .fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.8 }, 8.6)
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, 9.2);
    },
    ready,
  );

  // Reduced motion skips the intro, so the scene starts complete.
  useEffect(() => {
    if (ready && prefersReducedMotion()) {
      Object.assign(dials, { lit: 1, threads: 1, mind: 1 });
      count.current!.textContent = PEOPLE.toLocaleString("en-US");
    }
  }, [ready, dials]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 text-ink wide:px-10"
    >
      <Spread
        sources={PEOPLE_SOURCES}
        head={
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · EARTH’S PEOPLE
          </span>
        }
        art={<Globe dials={dials} onReady={onReady} />}
      >
        <div data-m="count" className="-mt-2 flex items-baseline gap-2 wide:mt-3">
          <span
            ref={count}
            className="text-[34px] leading-none font-semibold tracking-[-.01em] tabular-nums wide:text-[44px]"
          >
            0
          </span>
        </div>
        <span data-m="still" className="mt-1 text-[13px] text-muted">
          people, and still rising
        </span>
        <div className="mt-4 flex flex-col gap-1.5 text-[15px] leading-snug text-page-ink2">
          {LINES.map((line) => (
            <p key={line} data-m="line">
              {line}
            </p>
          ))}
          <p data-m="last" className="mt-2 text-[17px] leading-snug font-medium text-other">
            Every light is a soul. You are their Will.
          </p>
        </div>
        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button
            data-m="act"
            onClick={() => leave(onSkip)}
            className="h-[46px] rounded-full text-[15px] font-medium"
          >
            Skip
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            Where things stand
          </button>
        </div>
      </Spread>
    </div>
  );
}
