import { Link } from "react-router";
import { useCallback, useRef } from "react";
import { Reactor, type ReactorHandle } from "@/components/reactor";
import { SkyArt, useSky } from "@/components/sky";
import { plainClick, useLeaveFor } from "@/lib/leave";
import { lightTime } from "@/lib/light";
import { gsap, rise, riseFrom, useGSAP, useStage } from "@/lib/motion";

// Where the view is, by its distance from Earth in AU. The map's own stage names, with the Moon and the Oort cloud.
export const PLACES: [upTo: number, name: string][] = [
  [0.0035, "EARTH"],
  [0.06, "EARTH AND MOON"],
  [400, "SOLAR SYSTEM"],
  [1.2e5, "OORT CLOUD"],
  [2e8, "NEARBY STARS"],
  [2.5e10, "MILKY WAY"],
  [Infinity, "LOCAL GROUP"],
];

// The first screen, before Earth wakes. No title, only the sky: the view drifts out from Earth past the Moon, the
// planets and the nearby stars to the Milky Way and the Local Group, then home, and says where it is and how far light
// takes to get there. Begin game is a reactor that gathers from sparks, and pressed, it bursts and the view dives home
// to Earth.
export function Drift({ onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLSpanElement>(null);
  const far = useRef<HTMLSpanElement>(null);
  const reactor = useRef<ReactorHandle>(null);
  const going = useRef(false);
  const sky = useSky();
  const leaveFor = useLeaveFor();

  const { leave } = useStage(root, (q, tl) => {
    tl.fromTo(q('[data-m="where"]'), riseFrom, { ...rise, duration: 0.7, stagger: 0.15 }, 1.8);
    const enter = reactor.current?.enter();
    if (enter) tl.add(enter, 2.4);
    // The footer rises once the button has landed.
    tl.fromTo(q('[data-m="foot"]'), riseFrom, { ...rise, duration: 0.7, stagger: 0.08 }, 3.3);
  });
  const { contextSafe } = useGSAP({ scope: root });

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

  // The words leave and the view falls home to Earth, where Earth wakes. The sky stays.
  const begin = () =>
    contextSafe(() => {
      if (going.current) return;
      going.current = true;
      reactor.current?.blast();
      const secs = sky?.home() ?? 0;
      if (!secs) return leave(onNext);
      gsap.to(gsap.utils.toArray('[data-m="act"], [data-m="where"], [data-m="foot"]', root.current), {
        autoAlpha: 0,
        y: -8,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.05,
        overwrite: true,
      });
      gsap.delayedCall(Math.max(0, secs - 0.4), () => leave(onNext));
    })();

  return (
    <div ref={root} className="relative flex grow flex-col overflow-hidden">
      <SkyArt mode="title" onFrame={onFrame} className="hidden" />
      <div className="relative mt-auto flex flex-col items-center px-6 pb-10">
        <div data-m="where" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          <span ref={place}>EARTH</span>
        </div>
        <div data-m="where" className="mt-1 mb-7 h-4 font-mono text-[10.5px] text-muted tabular-nums">
          <span ref={far} />
        </div>
        <Reactor
          ref={reactor}
          data-m="act"
          onClick={begin}
          className="h-[46px] w-[220px] rounded-full border border-ink bg-paper text-[15px] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper"
        >
          Begin game
        </Reactor>
      </div>
      <footer className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 pb-5 font-mono text-[10px] tracking-[.1em] text-muted uppercase">
        <Link
          data-m="foot"
          to="/about"
          onClick={(e) => {
            if (!plainClick(e)) return;
            e.preventDefault();
            leaveFor("/about");
          }}
          className="transition-colors hover:text-ink"
        >
          About
        </Link>
        <a
          data-m="foot"
          href="https://github.com/johnpolacek/playholos"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-ink"
        >
          GitHub
        </a>
        <span data-m="foot">
          Created by{" "}
          <a href="https://johnpolacek.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">
            John Polacek
          </a>
        </span>
      </footer>
    </div>
  );
}
