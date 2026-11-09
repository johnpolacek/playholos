import { Link } from "react-router";
import { useCallback, useRef } from "react";
import { Astroid } from "@/components/icons";
import { Reactor, type ReactorHandle } from "@/components/reactor";
import { RunLocal } from "@/components/run-local";
import { SkyArt, useSky } from "@/components/sky";
import { plainClick, useLeaveFor } from "@/lib/leave";
import { lightTime } from "@/lib/light";
import { gsap, rise, riseFrom, useGSAP, useStage } from "@/lib/motion";

// Where the view is, by its distance from Earth in AU. The map's own stage names, with the Moon and the Oort cloud.
const PLACES: [upTo: number, name: string][] = [
  [0.0035, "EARTH"],
  [0.06, "EARTH AND MOON"],
  [400, "SOLAR SYSTEM"],
  [1.2e5, "OORT CLOUD"],
  [2e8, "NEARBY STARS"],
  [2.5e10, "MILKY WAY"],
  [Infinity, "LOCAL GROUP"],
];

/** The title's ways in, each a reactor of its own. 2026-11-04. */
const WAYS = [
  { id: "universe", label: "Universe", hint: "Our sky, to scale", to: "/universe", mood: "orbit", tone: "border-[#a9c8ee]/80 hover:bg-[#a9c8ee]" },
  { id: "sim", label: "Simulation", hint: "How minds might spread", to: "/sim", mood: "web", tone: "border-[#e0a24a]/80 hover:bg-[#e0a24a]" },
  { id: "play", label: "Play", hint: "Play as Earth’s Mind", to: "/play", mood: "pulse", tone: "border-white hover:bg-white" },
] as const;

// The first screen, and the landing for everyone. No title, only the sky: the view drifts out from Earth past the
// Moon, the planets and the nearby stars to the Milky Way and the Local Group, then home, and says where it is and how
// far light takes to get there. Its ways in are reactors, each its own mood: blue moons, an amber web, a white pulse. Pressed, one bursts. Universe and
// Simulation lift the screen away to their page. Play, for a new game, dives the view home to Earth, where Earth
// wakes. A game begun, or an opening part seen, goes straight on (dive false).
export function Drift({ onNext, dive = true }: { onBack?(): void; onSkip(): void; onNext(): void; dive?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLSpanElement>(null);
  const far = useRef<HTMLSpanElement>(null);
  const reactors = useRef<(ReactorHandle | null)[]>([]);
  const going = useRef(false);
  const sky = useSky();
  const leaveFor = useLeaveFor();

  const { leave } = useStage(root, (q, tl) => {
    tl.fromTo(q('[data-m="where"]'), riseFrom, { ...rise, duration: 0.7, stagger: 0.15 }, 1.8);
    reactors.current.forEach((r, i) => {
      const enter = r?.enter();
      if (enter) tl.add(enter, 2.4 + i * 0.12);
    });
    // The footer rises once the button has landed.
    tl.fromTo(q('[data-m="foot"]'), riseFrom, { ...rise, duration: 0.7, stagger: 0.08 }, 3.3);
  });
  const { contextSafe } = useGSAP({ scope: root });

  // Where the view is, written straight to the page each frame, not through React.
  const onFrame = useCallback((au: number) => {
    const name = PLACES.find(([upTo]) => au < upTo)![1];
    // Where we look from, not how far the place is: “Milky Way, 210,000 light-years from Earth” puzzled a first look,
    // as we live inside it. Screen critic, 2026-11-09.
    const away = au < 1e-9 ? "" : `seen from ${lightTime(au)} out`;
    if (place.current && place.current.textContent !== name) {
      place.current.textContent = name;
      gsap.fromTo(place.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, overwrite: true });
    }
    if (far.current && far.current.textContent !== away) far.current.textContent = away;
  }, []);

  // The words leave and the view falls home to Earth, where Earth wakes. The sky stays.
  const begin = (i: number) =>
    contextSafe(() => {
      if (going.current) return;
      going.current = true;
      reactors.current[i]?.blast();
      if (WAYS[i].id !== "play") {
        // Its code loads as the screen lifts away, so the page is there when the fade ends.
        void import("@/app/sim");
        return leaveFor(WAYS[i].to);
      }
      const secs = dive ? (sky?.home() ?? 0) : 0;
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
        {/* Where the sky is, a step larger and brighter, so it reads over the stars: dim and tiny, it sank into the
            galaxy's arm. Screen critic, 2026-11-08. */}
        <div data-m="where" className="font-mono text-[11.5px] tracking-[.1em] text-page-ink2">
          <span ref={place}>EARTH</span>
        </div>
        <div data-m="where" className="mt-1 mb-7 h-4 font-mono text-[11.5px] text-page-ink2 tabular-nums">
          <span ref={far} />
        </div>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          {/* Each with a dim line under it of what it is: bare, “Universe” and “Simulation” puzzled a first look.
              Screen critic, 2026-11-09. */}
          {WAYS.map((w, i) => (
            <div key={w.id} className="flex flex-col items-center gap-1.5">
              <Reactor
                mood={w.mood}
                ref={(r) => void (reactors.current[i] = r)}
                data-m="act"
                onClick={() => begin(i)}
                className={`h-[46px] w-[180px] rounded-full border bg-paper text-[15px] font-medium transition-colors duration-300 hover:text-paper ${w.tone}`}
              >
                {w.label}
              </Reactor>
              <span data-m="foot" className="font-mono text-[11px] text-page-ink2">
                {w.hint}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Each link stands 24px tall, so a thumb can take it: at 15px the screen audit called them small targets. 2026-11-08. */}
      <footer className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-0 px-6 pb-4 font-mono text-[10px] tracking-[.1em] text-muted uppercase">
        <Link
          data-m="foot"
          to="/about/research"
          onClick={(e) => {
            if (!plainClick(e)) return;
            e.preventDefault();
            leaveFor("/about/research");
          }}
          className="inline-flex min-h-6 items-center transition-colors hover:text-ink"
        >
          About
        </Link>
        <span data-m="foot" className="opacity-60">
          <Astroid />
        </span>
        <a
          data-m="foot"
          href="https://github.com/johnpolacek/playholos"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-6 items-center transition-colors hover:text-ink"
        >
          GitHub
        </a>
        <span data-m="foot" className="opacity-60">
          <Astroid />
        </span>
        <RunLocal data-m="foot" className="inline-flex min-h-6 items-center uppercase transition-colors hover:text-ink" />
        <span data-m="foot" className="opacity-60">
          <Astroid />
        </span>
        <span data-m="foot">
          Created by{" "}
          <a href="https://johnpolacek.com" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center transition-colors hover:text-ink">
            John Polacek
          </a>
        </span>
      </footer>
    </div>
  );
}
