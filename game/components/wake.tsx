import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { Origins } from "@/components/origins";
import { People } from "@/components/people";
import { Stand } from "@/components/stand";
import { Inherit } from "@/components/inherit";
import { FILL, Spread } from "@/components/spread";
import { Charter } from "@/components/charter";
import { Meet } from "@/components/meet";
import { Leads } from "@/components/leads";
import { Plan } from "@/components/plan";
import { Drift } from "@/components/drift";
import { Sky, SkyArt } from "@/components/sky";
import type { Dials } from "@/lib/drift";
import { charsRise, gsap, prefersReducedMotion, rise, riseFrom, useGSAP, useStage } from "@/lib/motion";

/** The art's size on a phone, and its soft edge into the words. Wide, it fills the left. */
const ART = `-mx-6 block h-[min(46vh,380px)] w-[calc(100%+48px)] max-w-none shrink-0 sm:h-[min(46vh,480px)] ${FILL}`;

// The first screen of a new game, after the drift. Earth's night side close up, its real cities lit, and as the words
// come the real Sun rises past its edge: this morning.
export function Wake({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const [dials] = useState<Dials>(() => ({ rise: 0 }));
  const [ready, setReady] = useState(false);
  // When the camera arrives at this screen, on the page's clock: the story starts then, however long its data took.
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setReady(true);
  }, []);
  const { leave } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      tl.fromTo(q('[data-m="sky"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power1.inOut" }, 0)
        .to(dials, { rise: 1, duration: 3.4, ease: "power1.inOut" }, 0.4)
        .fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.8);
      charsRise(tl, q('[data-m="title"]')[0], 2);
      tl.fromTo(q('[data-m="copy"]'), riseFrom, { ...rise, duration: 0.6, stagger: 0.25 }, 2.5).fromTo(
        q('[data-m="act"]'),
        riseFrom,
        { ...rise, stagger: 0.08 },
        3.1,
      );
    },
    ready,
  );

  // Reduced motion skips the intro: the Sun is up.
  useEffect(() => {
    if (ready && prefersReducedMotion()) Object.assign(dials, { rise: 1 });
  }, [ready, dials]);

  return (
    <div
      ref={root}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-6 wide:px-10"
    >
      <Spread art={<SkyArt mode="wake" dials={dials} onReady={onReady} className={ART} />}>
        <div className="flex grow flex-col gap-2.5 pt-2 pb-6">
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · SOL
          </span>
          <h1
            data-m="title"
            className="text-[32px] font-semibold tracking-[-.01em] [font-kerning:none] [text-rendering:optimizeSpeed] wide:text-[44px]"
          >
            Earth wakes.
          </h1>
          <p data-m="copy" className="text-[15.5px] leading-normal text-page-ink2">
            For ten thousand years, we built telescopes, grids and machines. This morning, we and our machines woke as
            one Mind.
          </p>
          <p data-m="copy" className="text-[15.5px] leading-normal text-page-ink2">
            <b className="font-semibold text-ink">You are its Will.</b> What Earth becomes is yours to choose.
          </p>
          <div className="mt-auto grid grid-cols-[1fr_1.4fr] gap-2 pt-4 wide:pt-6">
            <button
              data-m="act"
              onClick={() => leave(onSkip)}
              className="h-[46px] rounded-full text-[15px] font-medium"
            >
              Skip memories
            </button>
            <button
              data-m="act"
              onClick={() => leave(onNext)}
              className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
            >
              Where we come from
            </button>
          </div>
        </div>
      </Spread>
    </div>
  );
}

// The shell leaves before a new game wakes. Tabs call it with what to do once the shell is gone.
const LeaveShell = createContext<(then: () => void) => void>((then) => then());
export const useLeaveShell = () => use(LeaveShell);

// Before Begin, the plan can be changed: the shell leaves for Planning, under the same sky, and comes back after.
const Replan = createContext<() => void>(() => {});
export const useReplan = () => use(Replan);

// The phone. A new game opens on the drift, then Wake and the memories, all under one sky. A game already begun goes straight to the
// shell. Screens past the last one built lead to the shell. A reload starts over at the drift.
const SCREENS = [Drift, Wake, Origins, People, Stand, Inherit, Charter, Meet, Leads, Plan];

export function Opening({ className, children }: { className: string; children: React.ReactNode }) {
  const { save, wake } = useGame();
  const [at, setAt] = useState(0);
  const [replanning, setReplanning] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const inShell = !!save && (save.woke || save.beganAt !== null);
  const shell = inShell && !replanning;

  // The shell enters piece by piece: the top bar drops in, the map opens, the page rises, the rail comes up.
  const { contextSafe } = useGSAP(
    () => {
      if (!shell) return;
      const q = gsap.utils.selector(frame);
      const parts = q("[data-shell]");
      if (prefersReducedMotion()) return;
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => gsap.set(parts, { clearProps: "transform,opacity,visibility" }),
        })
        .fromTo(q('[data-shell="top"]'), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(q('[data-shell="map"]'), { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, 0.15)
        .fromTo(q('[data-shell="page"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.35)
        .fromTo(q('[data-shell="rail"]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.45);
    },
    { scope: frame, dependencies: [shell] },
  );

  const leaveShell = (then: () => void) =>
    contextSafe(() => {
      const parts = gsap.utils.selector(frame)("[data-shell]").reverse();
      // A new game opens on the drift, with or without the shell's leaving.
      const gone = () => {
        setAt(0);
        then();
      };
      if (prefersReducedMotion()) return gone();
      gsap
        .timeline({ onComplete: gone })
        .to(parts, {
          autoAlpha: 0,
          y: (i) => (i === 0 ? 12 : i === parts.length - 1 ? -12 : -8),
          duration: 0.28,
          ease: "power2.in",
          stagger: 0.06,
        });
    })();

  let body: React.ReactNode = <div className="grow bg-paper" />;
  if (shell) body = children;
  else if (replanning)
    body = (
      <>
        <Plan onSkip={() => setReplanning(false)} onNext={() => setReplanning(false)} />
        <SkyArt mode="charter" className="hidden" />
      </>
    );
  else if (save) {
    const Screen = SCREENS[at];
    const next = () => (at + 1 < SCREENS.length ? setAt(at + 1) : wake());
    // Skip leaves the memories for the charter on Wake, and skips one memory after that.
    const charter = SCREENS.indexOf(Charter);
    // Past the charter, Skip goes to Planning: as "Plan our waking." does on Meeting the Mind.
    const skip = () =>
      setAt(at === SCREENS.indexOf(Wake) ? charter : at > charter ? SCREENS.indexOf(Plan) : Math.min(at + 2, charter));
    body = (
      <>
        <Screen key={at} onSkip={skip} onNext={next} />
        {/* The charter and Planning have no sky art of their own: the sky holds on Earth and the Moon behind them. */}
        {(Screen === Charter || Screen === Plan) && <SkyArt mode="charter" className="hidden" />}
      </>
    );
  }
  // One sky behind every screen from the title to the charter, and on into the map. The camera flies between them.
  return (
    <div ref={frame} id="phone" className={`relative ${className}`}>
      <LeaveShell value={leaveShell}>
        <Replan value={() => leaveShell(() => setReplanning(true))}>
          <Sky shade={!shell}>{body}</Sky>
        </Replan>
      </LeaveShell>
    </div>
  );
}
