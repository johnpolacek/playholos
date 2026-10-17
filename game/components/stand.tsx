"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KNOCKS, RADARS_SINCE } from "@/lib/game/knocks";
import { YEAR_0 } from "@/lib/game/clock";
import { SkyArt } from "@/components/sky";
import { FILL, Spread } from "@/components/spread";
import type { Dials, Mark } from "@/lib/drift";
import { STAND_SOURCES } from "@/lib/game/sources";
import { prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";
import SKY from "@/lib/game/sky.json";

// "Where things stand": ninety years of Earth's noise across the stars within 50 light-years, in the game's sky. Each
// star sits at its real place. From 1950 the radar shell spreads at the speed of light and lights every one of them.
// Then the aimed messages leave on their real dates, each a pulse along its beam. Some arrive. Three could have been
// answered by now, and none were. Six are still on their way.

const TARGETS = SKY.targets as unknown as Record<string, [ra: number, d: number]>;

/** The earliest a reply to any message to this star could reach Earth. */
const replyBy = (target: string) =>
  Math.min(...KNOCKS.filter((k) => k[2] === target).map(([, sent, , ly]) => sent + 2 * ly));
const TARGET_NAMES = Object.keys(TARGETS);
const FLYING = KNOCKS.filter(([, sent, , ly]) => sent + ly > YEAR_0).length;
const SILENT = TARGET_NAMES.filter((t) => replyBy(t) < YEAR_0);
const NEXT = TARGET_NAMES.filter((t) => replyBy(t) >= YEAR_0).sort((a, b) => replyBy(a) - replyBy(b))[0];
const NEXT_YEAR = Math.floor((replyBy(NEXT) - YEAR_0) * 10) / 10;

/** The map, in the sky: the scene draws the shell, the stars and the beams, and names the knocked-on stars here. */
function Map({ dials, onReady }: { dials: Dials; onReady(flight: number): void }) {
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  // The stars that could have answered by now are named silent, and the next to answer is named in blue.
  const onMarks = useCallback(
    (marks: Mark[]) => {
      const year = dials.year ?? YEAR_0;
      for (const { id, x, y, a } of marks) {
        const n = names.current[id];
        if (!n) continue;
        const shown = id === "Sol" ? a : a * (dials.labels ?? 0) * (id === NEXT || replyBy(id) < year ? 1 : 0);
        const right = x > (n.parentElement?.clientWidth ?? 0) / 2;
        n.style.transform = `translate(${x + (right ? 8 : -8)}px, ${y}px) translate(${right ? "0" : "-100%"}, -50%)`;
        n.style.opacity = String(shown);
      }
    },
    [dials],
  );
  return (
    <SkyArt
      mode="stand"
      dials={dials}
      onReady={onReady}
      onMarks={onMarks}
      className={`relative mx-auto block aspect-square w-full max-w-[420px] shrink-0 sm:max-w-[520px] wide:aspect-auto ${FILL}`}
    >
      {[...TARGET_NAMES, "Sol"].map((id) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id === NEXT ? "text-you" : "text-muted"}`}
        >
          {id === "Sol" ? "Sol" : id === NEXT ? `${id} · reply Year ${NEXT_YEAR}` : `${id} · silent`}
        </span>
      ))}
    </SkyArt>
  );
}

const LINES = [
  "Our radars have swept every star within 50 light-years.",
  `We aimed ${KNOCKS.length} messages at ${TARGET_NAMES.length} stars. ${FLYING} are still on their way.`,
  `${SILENT.length} replies could have come by now. None did.`,
  `The next could come in Year ${NEXT_YEAR}, from ${NEXT}.`,
];

export function Stand({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  // One object for the whole screen: the intro runs the years, and the scene reads them every frame.
  const [dials] = useState<Dials>(() => ({ year: RADARS_SINCE - 2, grid: 0, labels: 0 }));
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
      const show = () => {
        const y = Math.floor(s.year ?? YEAR_0);
        clock.current!.textContent = y >= YEAR_0 ? `${YEAR_0} · Year 0` : String(Math.max(RADARS_SINCE, y));
      };
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .to(s, { grid: 1, duration: 1 }, 0.2)
        .fromTo(q('[data-m="clock"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6)
        .to(s, { year: YEAR_0, duration: 8, ease: "power1.inOut", onUpdate: show }, 0.8)
        .to(s, { labels: 1, duration: 0.6 }, 8.6)
        .fromTo(q('[data-m="lead"]'), riseFrom, { ...rise, duration: 0.7 }, 8.9);
      q('[data-m="line"]').forEach((line, i) => tl.fromTo(line, riseFrom, { ...rise, duration: 0.6 }, 9.5 + i * 0.7));
      tl.fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.8 }, 12.4).fromTo(
        q('[data-m="act"]'),
        riseFrom,
        { ...rise, stagger: 0.08 },
        13,
      );
    },
    ready,
  );

  // Reduced motion skips the ninety years: the sky as it stands at Year 0.
  useEffect(() => {
    if (!ready || !prefersReducedMotion()) return;
    Object.assign(dials, { year: YEAR_0, grid: 1, labels: 1 });
    clock.current!.textContent = `${YEAR_0} · Year 0`;
  }, [ready, dials]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 text-ink wide:px-10"
    >
      <Spread
        sources={STAND_SOURCES}
        head={
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
              YEAR 0 · WHERE THINGS STAND
            </span>
            <span data-m="clock" ref={clock} className="font-mono text-[13px] text-other tabular-nums">
              {RADARS_SINCE}
            </span>
          </div>
        }
        art={<Map dials={dials} onReady={onReady} />}
      >
        <h1 data-m="lead" className="mt-2 text-[24px] leading-tight font-semibold wide:mt-4 wide:text-[30px]">
          Ninety years loud. Nothing heard.
        </h1>
        <div className="mt-2.5 flex flex-col gap-1.5 text-[15px] leading-snug text-page-ink2">
          {LINES.map((line) => (
            <p key={line} data-m="line">
              {line}
            </p>
          ))}
          <p data-m="last" className="mt-2 text-[17px] leading-snug font-medium text-other">
            We know where our noise has gone. We can’t know who heard it.
          </p>
        </div>
        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button data-m="act" onClick={() => leave(onSkip)} className="h-[46px] rounded-full text-[15px] font-medium">
            Skip
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            What you inherit
          </button>
        </div>
      </Spread>
    </div>
  );
}
