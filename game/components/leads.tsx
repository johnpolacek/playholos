"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { FILL, Spread } from "@/components/spread";
import type { Dials, Mark } from "@/lib/drift";
import { realTime, YEAR_0 } from "@/lib/game/clock";
import { KNOCKS } from "@/lib/game/knocks";
import { LEADS_SOURCES } from "@/lib/game/sources";
import type { FeltWorld } from "@/lib/sim/types";
import { prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "What doesn't fit?": the Mind's answer, drawn. The stars within 50 light-years from above, and Earth's real leads
// lit one by one, each with a thread out from Sol: a world on a stretched orbit, every world the planet hunters felt
// by 2040, nearest first, Fomalhaut's collisions, and the first star that could answer our messages. Beside each, how
// long light takes to get there, in play time: what a call would cost.

interface Lead {
  star: string;
  what: string;
  line: string;
  ly: number;
  reply?: boolean;
}

/** The first reply that could come from Luyten's Star, in game Years. */
const REPLY =
  Math.floor(
    (Math.min(...KNOCKS.filter((k) => k[2] === "Luyten's Star").map(([, sent, , ly]) => sent + 2 * ly)) - YEAR_0) * 10,
  ) / 10;

function leadsOf(felt: FeltWorld[]): Lead[] {
  const one = (x: number) => x.toFixed(1);
  return [
    {
      star: "82 Eridani",
      what: "A stretched orbit",
      line: "A heavy world, sometimes warm. Its air is unread.",
      ly: 19.7,
    },
    ...felt.map((f) => ({
      star: f.star,
      what: "A new world",
      line: `Felt by ${f.by} in ${YEAR_0 + f.year}. At least ${one(f.minMass)} Earths.`,
      ly: f.d,
    })),
    {
      star: "Fomalhaut",
      what: "Too many collisions",
      line: "Two dust clouds in 20 years, where we expected one.",
      ly: 25.1,
    },
    {
      star: "Luyten’s Star",
      what: "A reply could come",
      line: `To our 2017 message, as soon as Year ${REPLY}, about ${Math.round(REPLY * 5)} minutes after we begin.`,
      ly: 12.3,
      reply: true,
    },
  ];
}

/** The scene names Luyten's Star as the catalog does. */
const skyId = (star: string) => star.replace("’", "'");

function Map({ dials, ids, onReady }: { dials: Dials; ids: string[]; onReady(flight: number): void }) {
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback(
    (marks: Mark[]) => {
      const focus = ids[(dials.focus ?? 0) - 1];
      for (const { id, x, y, a } of marks) {
        const n = names.current[id];
        if (!n) continue;
        const ring = id.startsWith("ring:");
        const right = ring || x > (n.parentElement?.clientWidth ?? 0) / 2;
        n.style.transform = ring
          ? `translate(${x}px, ${y + 4}px) translate(-50%, 0)`
          : `translate(${x + (right ? 9 : -9)}px, ${y}px) translate(${right ? "0" : "-100%"}, -50%)`;
        n.style.opacity = String(a * (focus && id !== focus && id !== "Sol" && !ring ? 0.45 : 1));
      }
    },
    [dials, ids],
  );
  return (
    <SkyArt
      mode="leads"
      dials={dials}
      leads={ids}
      onReady={onReady}
      onMarks={onMarks}
      className={`relative mx-auto block aspect-square w-full max-w-[420px] shrink-0 sm:max-w-[520px] wide:aspect-auto ${FILL}`}
    >
      {[...ids, "Sol", "ring:10", "ring:20", "ring:30", "ring:40"].map((id) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id === "Luyten's Star" ? "text-other" : id.startsWith("ring:") || id === "Sol" ? "text-muted" : "text-you"}`}
        >
          {id.startsWith("ring:") ? `${id.slice(5)} ly` : id}
        </span>
      ))}
    </SkyArt>
  );
}

export function Leads({ onNext }: { onSkip(): void; onNext(): void }) {
  const { save, wake } = useGame();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [felt, setFelt] = useState<FeltWorld[]>();
  const [dials] = useState<Dials>(() => ({ found: 0, grid: 0, focus: 0 }));
  const [flown, setFlown] = useState(false);
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setFlown(true);
  }, []);
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/leads?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFelt, () => setFelt([]));
  }, [seed]);
  const leads = useMemo(() => (felt ? leadsOf(felt) : []), [felt]);
  const ids = useMemo(() => leads.map((l) => skyId(l.star)), [leads]);
  const ready = flown && !!felt;

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      // However many there are, they all come on in about five seconds.
      const step = Math.min(0.8, 5 / leads.length);
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .to(dials, { grid: 1, duration: 1 }, 0.1)
        .fromTo(q('[data-m="who"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.3)
        .fromTo(q('[data-m="open"]'), riseFrom, { ...rise, duration: 0.6 }, 0.5)
        .fromTo(q('[data-m="head"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 1.3);
      q('[data-m="lead"]').forEach((row, i) => {
        const at = 1.5 + i * step;
        tl.to(dials, { found: i + 1, duration: step * 1.4, ease: "power1.inOut" }, at).fromTo(
          row,
          riseFrom,
          { ...rise, duration: 0.5 },
          at + step * 0.7,
        );
      });
      const end = 1.5 + leads.length * step + 0.6;
      tl.fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.7 }, end).fromTo(
        q('[data-m="act"]'),
        riseFrom,
        { ...rise, stagger: 0.08 },
        end + 0.6,
      );
    },
    ready,
  );

  useEffect(() => {
    if (ready && prefersReducedMotion()) Object.assign(dials, { found: leads.length, grid: 1 });
  }, [ready, dials, leads]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 text-ink wide:px-10"
    >
      <Spread
        sources={LEADS_SOURCES}
        head={
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · WHAT DOESN’T FIT?
          </span>
        }
        art={ids.length ? <Map dials={dials} ids={ids} onReady={onReady} /> : <div className="aspect-square w-full" />}
      >
        <span data-m="who" className="mt-1 font-mono text-[10px] tracking-[.1em] text-you wide:mt-3">
          THE MIND
        </span>
        <p data-m="open" className="mt-1.5 text-[19px] leading-snug font-medium wide:text-[22px]">
          The sky near us is quiet. These are the few things in it we can’t explain yet.
        </p>
        <div
          data-m="head"
          className="mt-4 flex justify-between font-mono text-[10px] tracking-[.1em] text-muted uppercase"
        >
          <span>Leads · {leads.length}</span>
          <span>Light takes</span>
        </div>
        <ul className="mt-1 flex flex-col">
          {leads.map((l, i) => (
            <li
              key={l.star}
              data-m="lead"
              onPointerEnter={() => (dials.focus = i + 1)}
              onPointerLeave={() => (dials.focus = 0)}
              className="flex items-baseline gap-3 border-t border-faint py-2.5"
            >
              <span className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${l.reply ? "bg-other" : "bg-you"}`} />
              <span className="flex min-w-0 grow flex-col">
                <span className="text-[15px] leading-snug">
                  <b className="font-semibold">{l.what}</b> · {l.star}
                </span>
                <span className="text-[13.5px] leading-snug text-page-ink2">{l.line}</span>
              </span>
              <span className="shrink-0 text-right font-mono text-[11px] text-muted tabular-nums">
                {realTime(l.ly)}
              </span>
            </li>
          ))}
        </ul>
        <p data-m="last" className="mt-3 text-[15px] leading-snug text-page-ink2">
          A call to any of them takes as long as its light, and an answer as long again. Which we look at first is
          yours.
        </p>
        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button
            data-m="act"
            onClick={() =>
              leave(() => {
                router.push(`/mind?ask=${encodeURIComponent("What doesn’t fit?")}`);
                wake();
              })
            }
            className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
          >
            Ask about them
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            Plan our waking
          </button>
        </div>
      </Spread>
    </div>
  );
}
