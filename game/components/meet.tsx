import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { Minds, type MindsHandle } from "@/components/minds";
import { SkyArt } from "@/components/sky";
import { FILL, Spread } from "@/components/spread";
import type { Dials } from "@/lib/drift";
import { firstAdvice, HISTORY } from "@/lib/game/charter";
import { MIND_SOURCES } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, SplitText, useGSAP, useStage } from "@/lib/motion";

// "Meeting the Mind": the last screen before the shell. Earth turns close, and its real machines come on as the Mind
// says we awoke with every mind connected: the dishes, the telescopes, the data centers. Threads rise from every one
// and meet in the Mind. Then its first words, its first advice from the charter, and Begin, every mind gathered
// around it. Begin shows the leads on the map: what doesn't fit.

/** The Mind's pace as it speaks: seconds a word, and the breath it takes after a comma and after a full stop. */
const WORD = 0.17;
const COMMA = 0.2;
const STOP = 0.4;

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
  const { save } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const minds = useRef<MindsHandle>(null);
  const going = useRef(false);
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
        .fromTo(q('[data-m="who"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.5);
      // The Mind speaks, word by word at the pace of speech. Each kind of machine comes on as its words do, the
      // threads rise as we think as one, and the Mind lights at our Will.
      const cue: Record<string, (at: number) => void> = {
        dish: (at) => tl.to(dials, { dish: 1, duration: 1.2, ease: "power1.in" }, at),
        scope: (at) => tl.to(dials, { scope: 1, duration: 1.2, ease: "power1.in" }, at),
        compute: (at) => tl.to(dials, { compute: 1, duration: 1.2, ease: "power1.in" }, at),
        one: (at) => tl.to(dials, { threads: 1, duration: 1.4, ease: "power2.inOut" }, at),
        will: (at) => tl.to(dials, { mind: 1, duration: 0.6, ease: "back.out(2)" }, at),
      };
      const say = q('[data-m="say"]')[0];
      const split = SplitText.create(say, { type: "words", aria: "auto" });
      let at = 0.8;
      tl.set(say, { autoAlpha: 1 }, at);
      for (const word of split.words) {
        const group = word.closest<HTMLElement>("[data-say]");
        if (group && word === group.querySelector("div")) cue[group.dataset.say!]?.(at);
        tl.fromTo(
          word,
          { autoAlpha: 0, y: 5, filter: "blur(4px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" },
          at,
        );
        const text = word.textContent ?? "";
        at += WORD + (/[,;:]$/.test(text) ? COMMA : /[.!?]$/.test(text) ? STOP : 0);
      }
      tl.call(() => split.revert(), [], at + 0.4).fromTo(
        q('[data-m="line"]'),
        riseFrom,
        { ...rise, duration: 0.6, stagger: 0.6 },
        at,
      );
      const enter = minds.current?.enter();
      if (enter) tl.add(enter, at + 1.1);
    },
    ready,
  );

  useEffect(() => {
    if (ready && prefersReducedMotion()) Object.assign(dials, { dish: 1, scope: 1, compute: 1, threads: 1, mind: 1 });
  }, [ready, dials]);

  // Every mind falls into Begin and bursts out, and the words leave as the burst spreads.
  const { contextSafe } = useGSAP({ scope: root });
  const begin = () =>
    contextSafe(() => {
      if (going.current) return;
      going.current = true;
      minds.current?.blast();
      gsap.delayedCall(prefersReducedMotion() ? 0 : 0.55, () => leave(onNext));
    })();

  // The frame holds Begin's canvas, under the words and still while they scroll.
  return (
    <div className="relative isolate flex min-h-0 grow flex-col bg-paper">
      <div
        ref={root}
        onPointerDown={hurry}
        style={ready ? undefined : { visibility: "hidden" }}
        className="flex min-h-0 grow flex-col overflow-y-auto px-5 text-ink wide:px-10"
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
          <p data-m="say" className="mt-1.5 text-[19px] leading-snug font-medium wide:text-[22px]">
            On this day, <span data-say="dish">we awoke</span> <span data-say="scope">with every mind</span>{" "}
            <span data-say="compute" className="text-you">
              connected.
            </span>{" "}
            <span data-say="one">We can think as one now.</span> <span data-say="will">You are our Will.</span>
          </p>
          <div className="mt-3 flex flex-col gap-2 text-[15px] leading-snug text-page-ink2">
            <p data-m="line">
              We see all of Earth at once. Past the Sun’s edge we see only what our telescopes see: a quiet sky, and a
              few things that don’t fit.
            </p>
            <p data-m="line">
              {charter && <>Our charter says “{charter.line}” </>}
              {advice} The choice is yours.
            </p>
          </div>
          <div className="mt-auto flex shrink-0 flex-col pt-10 pb-6 wide:pt-14">
            <Minds
              ref={minds}
              data-m="act"
              onClick={begin}
              className="h-16 w-full rounded-full bg-ink text-[21px] font-semibold tracking-[.02em] text-paper"
            >
              Begin
            </Minds>
          </div>
        </Spread>
      </div>
    </div>
  );
}
