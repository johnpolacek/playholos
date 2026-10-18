import { useCallback, useRef } from "react";
import { lightTime, PLACES } from "@/components/drift";
import { Sky, SkyArt } from "@/components/sky";
import { gsap, rise, riseFrom, useStage } from "@/lib/motion";

// The about page's opening: the title's slow flight from Earth out to the Local Group and home, behind the intro, with
// where the view is and how long light takes to get there. Tall, the words sit below the sky. Wide, they stand on the
// right, where the sky's shade falls.
export function AboutHero() {
  return (
    <section data-a-out className="relative flex h-[calc(100svh-3rem)] min-h-[600px] flex-col overflow-hidden bg-paper">
      <Sky shade>
        <Words />
      </Sky>
    </section>
  );
}

function Words() {
  const root = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLSpanElement>(null);
  const far = useRef<HTMLSpanElement>(null);

  useStage(root, (q, tl) => {
    tl.fromTo(q('[data-m="w"]'), riseFrom, { ...rise, duration: 0.7, stagger: 0.12 }, 0.8);
  });

  // Where the view is, written straight to the page each frame, not through React.
  const onFrame = useCallback((au: number) => {
    const name = PLACES.find(([upTo]) => au < upTo)![1];
    const away = au < 1e-9 ? "" : `${lightTime(au)} from Earth`;
    if (place.current && place.current.textContent !== name) {
      place.current.textContent = name;
      gsap.fromTo(place.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, overwrite: true });
    }
    if (far.current && far.current.textContent !== away) far.current.textContent = away;
  }, []);

  return (
    <div
      ref={root}
      className="relative flex grow flex-col wide:grid wide:grid-cols-[minmax(0,1fr)_clamp(320px,38vw,500px)]"
    >
      <SkyArt mode="title" onFrame={onFrame} className="hidden" />
      <div className="mt-auto px-5 pb-10 wide:col-start-2 wide:my-auto wide:pr-12 wide:pb-0">
        <div data-m="w" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          ABOUT HOLOS
        </div>
        <h1 data-m="w" className="mt-3 text-[34px] leading-[1.08] font-semibold text-balance wide:text-[44px]">
          Earth wakes as one Mind. You are its Will.
        </h1>
        <p data-m="w" className="mt-5 text-[16px] leading-[1.6] text-ink/85">
          Holos is a hard science fiction game built on real data. In 2040, humanity crosses the singularity. Nine
          billion of us join with our machines into one Mind, past aging and past illness. One question is left, the
          oldest one: are we alone? Finding other life in the universe is our greatest opportunity and gravest threat.
        </p>
        <div data-m="w" className="mt-8 flex items-baseline gap-2 font-mono text-[10.5px] tracking-[.1em] text-muted">
          <span ref={place}>EARTH</span>
          <span ref={far} className="tracking-normal tabular-nums" />
        </div>
      </div>
    </div>
  );
}
