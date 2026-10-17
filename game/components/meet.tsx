"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { FILL, Spread } from "@/components/spread";
import type { Dials } from "@/lib/drift";
import { firstAdvice, HISTORY } from "@/lib/game/charter";
import { MIND_SOURCES } from "@/lib/game/sources";
import { prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "Meeting the Mind": the last screen before the shell. Earth turns close, and its real machines come on as the Mind
// names them: the dishes, the telescopes, the data centers. Threads rise from every one and meet in the Mind. Then
// its first words, its first advice from the charter, and three things the Will can ask. "What doesn't fit?" shows
// the leads on the map. The others open the Mind's chat with the question asked.

const ASKS = ["What doesn’t fit?", "Who has heard us?", "Plan our waking."];

function Globe({ dials, onReady }: { dials: Dials; onReady(flight: number): void }) {
  const label = useRef<HTMLSpanElement>(null);
  const onMind = useCallback(
    (x: number, y: number) => {
      const l = label.current;
      if (!l) return;
      l.style.transform = `translate(${x}px, ${y - 16}px) translate(-50%, -100%)`;
      l.style.opacity = String(dials.mind ?? 0);
    },
    [dials],
  );
  return (
    <SkyArt
      mode="mind"
      dials={dials}
      onReady={onReady}
      onMind={onMind}
      className={`relative block h-[min(40vh,320px)] w-full shrink-0 sm:h-[min(44vh,460px)] ${FILL}`}
    >
      <span ref={label} className="pointer-events-none absolute top-0 left-0 font-mono text-[9px] text-you opacity-0">
        the Mind
      </span>
    </SkyArt>
  );
}

export function Meet({ onNext }: { onSkip(): void; onNext(): void }) {
  const { save, wake } = useGame();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [dials] = useState<Dials>(() => ({ dish: 0, scope: 0, compute: 0, threads: 0, mind: 0 }));
  const [ready, setReady] = useState(false);
  // When the camera arrives at this screen, on the page's clock: the story starts then.
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setReady(true);
  }, []);
  const charter = save?.charter;
  const advice = firstAdvice(charter?.dials ?? HISTORY);

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
        .set(q('[data-m="globe"]'), { autoAlpha: 1 }, 0)
        .fromTo(q('[data-m="who"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.5)
        .fromTo(q('[data-m="open"]'), riseFrom, { ...rise, duration: 0.6 }, 0.7);
      // Each kind of machine comes on as its words do.
      (["dish", "scope", "compute"] as const).forEach((kind, i) => {
        const at = 1.4 + i * 1.3;
        tl.fromTo(q(`[data-m="${kind}"]`), riseFrom, { ...rise, duration: 0.5 }, at).to(
          dials,
          { [kind]: 1, duration: 1.3, ease: "power1.in" },
          at,
        );
      });
      tl.fromTo(q('[data-m="one"]'), riseFrom, { ...rise, duration: 0.6 }, 5.4)
        .to(dials, { threads: 1, duration: 1.8, ease: "power2.inOut" }, 5.4)
        .to(dials, { mind: 1, duration: 0.6, ease: "back.out(2)" }, 7)
        .fromTo(q('[data-m="will"]'), riseFrom, { ...rise, duration: 0.6 }, 7.4)
        .fromTo(q('[data-m="line"]'), riseFrom, { ...rise, duration: 0.6, stagger: 0.9 }, 8.4)
        .fromTo(q('[data-m="ask"]'), riseFrom, { ...rise, stagger: 0.1 }, 10.4)
        .fromTo(q('[data-m="act"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 10.9);
    },
    ready,
  );

  useEffect(() => {
    if (ready && prefersReducedMotion()) Object.assign(dials, { dish: 1, scope: 1, compute: 1, threads: 1, mind: 1 });
  }, [ready, dials]);

  function ask(text: string) {
    if (text === ASKS[0]) return leave(onNext);
    leave(() => {
      router.push(`/mind?ask=${encodeURIComponent(text)}`);
      wake();
    });
  }

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 text-ink wide:px-10"
    >
      <Spread
        sources={MIND_SOURCES}
        head={
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · FIRST WORDS
          </span>
        }
        art={<Globe dials={dials} onReady={onReady} />}
      >
        <span data-m="who" className="mt-1 font-mono text-[10px] tracking-[.1em] text-you wide:mt-3">
          THE MIND
        </span>
        <p className="mt-1.5 text-[19px] leading-snug font-medium wide:text-[22px]">
          <span data-m="open" className="inline-block">
            This morning Earth’s machines woke as one:
          </span>{" "}
          <span data-m="dish" className="inline-block text-you">
            every dish,
          </span>{" "}
          <span data-m="scope" className="inline-block">
            every telescope,
          </span>{" "}
          <span data-m="compute" className="inline-block text-other">
            every data center.
          </span>{" "}
          <span data-m="one" className="inline-block">
            We think as one now.
          </span>{" "}
          <span data-m="will" className="inline-block">
            You are our Will.
          </span>
        </p>
        <div className="mt-3 flex flex-col gap-2 text-[15px] leading-snug text-page-ink2">
          <p data-m="line">
            We see all of Earth at once. Past the Sun’s edge we see only what our telescopes see: a quiet sky, and a few
            things that don’t fit.
          </p>
          <p data-m="line">
            {charter && <>Our charter says “{charter.line}” </>}
            {advice} The choice is yours.
          </p>
        </div>
        <div className="mt-auto flex shrink-0 flex-col gap-2 pt-5 pb-4 wide:pt-8">
          {ASKS.map((text, i) => (
            <button
              key={text}
              data-m="ask"
              onClick={() => ask(text)}
              className={`h-[44px] rounded-full text-[15px] font-medium ${i === ASKS.length - 1 ? "bg-ink text-paper" : "border border-ink"}`}
            >
              {text}
            </button>
          ))}
          <button data-m="act" onClick={() => leave(wake)} className="h-9 text-[13px] text-muted">
            Later
          </button>
        </div>
      </Spread>
    </div>
  );
}
