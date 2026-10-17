"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { Spread } from "@/components/spread";
import { base, dialsFor, suggest } from "@/lib/game/charter";
import type { EarthPast } from "@/lib/game/past";
import { gsap, prefersReducedMotion, rise, riseFrom, SplitText, useStage } from "@/lib/motion";

// "Our Charter": morning, after the night. The Mind suggests four founding lines, the one Earth's history fits best
// first, and offers more on request. The line is the setting: each sets Earth's three dials behind it, and the Mind
// advises from them. Wide, the chosen line stands large on the left and writes itself in as the pick changes.

function Chosen({ line }: { line: string }) {
  const el = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!el.current || prefersReducedMotion()) return;
    const split = SplitText.create(el.current, { type: "words", aria: "auto" });
    const tween = gsap.fromTo(
      split.words,
      { autoAlpha: 0, y: 14, filter: "blur(6px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        onComplete: () => split.revert(),
      },
    );
    return () => {
      tween.kill();
      split.revert();
    };
  }, [line]);
  return (
    <p
      ref={el}
      key={line}
      className="max-w-[640px] text-[clamp(32px,4vw,56px)] leading-[1.15] font-semibold text-balance"
    >
      {line ? `“${line}”` : ""}
    </p>
  );
}

export function Charter({ onNext }: { onSkip(): void; onNext(): void }) {
  const { save, setCharter } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState<EarthPast>();
  const [pick, setPick] = useState(0);
  const [shown, setShown] = useState(4);
  const list = useRef<HTMLDivElement>(null);
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast);
  }, [seed]);

  const history = useMemo(() => (past ? base(past) : []), [past]);
  const lines = useMemo(() => (past ? suggest(past) : []), [past]);
  const line = lines[pick]?.line ?? "";

  // Lines asked for rise in after the first four.
  useEffect(() => {
    if (shown <= 4 || !list.current || prefersReducedMotion()) return;
    const fresh = [...list.current.querySelectorAll("[data-line]")].slice(shown - 4, shown);
    gsap.fromTo(fresh, riseFrom, { ...rise, stagger: 0.06 });
  }, [shown]);

  const { leave } = useStage(
    root,
    (q, tl) => {
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(q('[data-m="lead"]'), riseFrom, { ...rise, duration: 0.7 }, 0.1)
        .fromTo(q('[data-m="art"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.4)
        .fromTo(q('[data-m="line"]'), riseFrom, { ...rise, stagger: 0.12 }, 0.5)
        .fromTo(q('[data-m="act"]'), riseFrom, rise, 1.2);
    },
    !!past,
  );

  function keep() {
    if (!line) return;
    setCharter({ line, dials: dialsFor(lines[pick].pull, history) });
    leave(onNext);
  }

  return (
    <div
      ref={root}
      style={past ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 wide:px-10"
    >
      <Spread
        head={
          <>
            <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
              BEFORE YEAR 0 · WHAT IS EARTH FOR?
            </span>
            <h1 data-m="lead" className="mt-1.5 text-[28px] leading-tight font-semibold wide:text-[36px]">
              Our Charter
            </h1>
          </>
        }
        art={
          <div data-m="art" className="hidden wide:flex wide:w-full wide:items-center wide:justify-center wide:px-6">
            <Chosen line={line} />
          </div>
        }
      >
        <div ref={list} className="mt-5 flex flex-col gap-2 wide:mt-6">
          {lines.slice(0, shown).map((c, i) => (
            <button
              key={c.line}
              data-line
              data-m={i < 4 ? "line" : undefined}
              onClick={() => setPick(i)}
              aria-pressed={pick === i}
              className={`rounded-xl border px-3.5 py-3 text-left text-[15px] leading-snug transition-colors ${pick === i ? "border-you bg-you/10 font-medium" : "border-faint"}`}
            >
              “{c.line}”
            </button>
          ))}
          {shown < lines.length && (
            <button
              data-m="line"
              onClick={() => setShown((n) => n + 4)}
              className="self-start px-1 py-2 text-[14px] text-you"
            >
              More lines ({lines.length - shown})
            </button>
          )}
        </div>
        <div className="mt-auto shrink-0 pt-5 pb-4 wide:pt-8">
          <button
            data-m="act"
            onClick={keep}
            disabled={!line}
            className="h-[46px] w-full rounded-full bg-ink text-[15px] font-medium text-paper disabled:opacity-35"
          >
            This is our charter
          </button>
        </div>
      </Spread>
    </div>
  );
}
