"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { history, type EarthPast, type Moment } from "@/lib/game/past";
import { SkyArt } from "@/components/sky";
import { FILL, Spread } from "@/components/spread";
import type { Dials } from "@/lib/drift";
import { LAP, agoAt, place, roadZoom } from "@/lib/game/road";
import { originsSources } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "Where we come from": 4.6 billion years as the Sun's road around the Milky Way, in the game's scene. The Sun's light
// laps the galaxy about twenty times while the deep past sweeps by, and each moment lights on the road where the Sun was
// then. As time runs short the view closes in: the nearby stars for the first people, the Sun's neighborhood for
// writing, and home. The road ends on Earth, this morning, as it wakes.

/** The clock under the road: years ago in the deep past, then dates. */
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
  const knots = useMemo(() => told?.moments.map((m) => ({ u: place(m.ago), dial: !!m.dial })), [told]);
  // One object for the whole screen: the intro moves the light, and the scene reads it every frame.
  const [dials] = useState<Dials>(() => ({ u: 0, earth: 0 }));
  const [shown, setShown] = useState(false);
  // When the camera arrives at this screen, on the page's clock: the story starts then, however long its data took.
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setShown(true);
  }, []);
  const ready = !!told && shown;

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      const caps = q('[data-m="cap"]');
      const follow = () => {
        clock.current!.textContent = when(agoAt(dials.u ?? 0));
      };
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(q('[data-m="lead"]'), riseFrom, { ...rise, duration: 0.6 }, 0.1)
        .fromTo(q('[data-m="road"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power1.inOut" }, 0.2)
        .fromTo(q('[data-m="clock"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.4)
        .call(follow, [], 0.4);
      let prev = 0;
      let t = 0.6;
      moments.forEach((m, i) => {
        const u = place(m.ago);
        // Longer for the laps the Sun runs between moments, and for each power of ten the view closes in.
        const laps = (agoAt(prev) - agoAt(u)) / LAP;
        const move = 0.35 + 2.4 * (u - prev) + 0.12 * laps + 0.35 * Math.abs(roadZoom(prev) - roadZoom(u));
        tl.to(dials, { u, duration: move, ease: "sine.inOut", onUpdate: follow }, t);
        t += move;
        if (i > 0) tl.to(caps[i - 1], { autoAlpha: 0, y: -6, duration: 0.18, ease: "power2.in" }, t - 0.15);
        tl.fromTo(caps[i], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, t);
        t += m === NOW ? 0 : 0.5 + (m.detail ? 0.35 : 0) + (m.dial ? 0.3 : 0);
        prev = u;
      });
      tl.to(dials, { earth: 1, duration: 0.8, ease: "power2.out" }, t - 0.2).fromTo(
        q('[data-m="act"]'),
        riseFrom,
        { ...rise, stagger: 0.08 },
        t + 0.6,
      );
    },
    ready,
  );

  // Reduced motion skips the journey: the whole road around the galaxy, every moment, and this morning's caption.
  useEffect(() => {
    if (!ready || !prefersReducedMotion() || !root.current) return;
    const caps = root.current.querySelectorAll('[data-m="cap"]');
    caps.forEach((c, i) => gsap.set(c, { autoAlpha: i === caps.length - 1 ? 1 : 0 }));
    Object.assign(dials, { u: 1, earth: 1 });
    clock.current!.textContent = when(0);
  }, [ready, dials]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 wide:px-10"
    >
      <Spread
        sources={past ? originsSources(past) : []}
        head={
          <>
            <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
              2040 · WHERE WE COME FROM
            </span>
            <h1 data-m="lead" className="mt-1.5 text-[22px] font-semibold wide:text-[30px] wide:leading-tight">
              4.6 billion years to this morning
            </h1>
          </>
        }
        art={
          <SkyArt
            mode="origins"
            dials={dials}
            moments={knots}
            onReady={onReady}
            className={`-mx-5 mt-1 block h-[min(44vh,360px)] w-[calc(100%+40px)] max-w-none shrink-0 sm:h-[min(44vh,480px)] ${FILL}`}
          />
        }
      >
        <span data-m="clock" ref={clock} className="mt-1 font-mono text-[12px] tracking-[.04em] text-muted wide:mt-5">
          4.6 billion years ago
        </span>
        <div className="mt-1.5 grid min-h-[110px]">
          {told?.moments.map((m) => (
            <Caption key={m.what} m={m} />
          ))}
          <Caption m={NOW} now />
        </div>
        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button
            data-m="act"
            onClick={() => leave(onSkip)}
            className="h-[46px] rounded-full text-[15px] font-medium"
          >
            Skip people
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            Who we are
          </button>
        </div>
      </Spread>
    </div>
  );
}
