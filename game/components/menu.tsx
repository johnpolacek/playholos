import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { useLeaveShell } from "@/components/wake";
import { forgetKey, useAccess } from "@/lib/key";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

const ABOUT = [
  ["/about", "About Holos"],
  ["/about/research", "Research"],
  ["/about/design", "Design"],
  ["/about/building", "Building"],
] as const;

const ELSEWHERE = [
  ["https://github.com/johnpolacek/playholos", "GitHub"],
  ["https://johnpolacek.com", "Created by John Polacek"],
] as const;

// The mark in the top bar's corner: the galactic year. Sol, in cyan, circles the galaxy's glowing core, as it does
// once every 230 million years. Here a lap takes 14 seconds, and the core swells and settles once every six. Drawn on
// a 24-unit grid around the center. Rounded, so the server and the browser draw it alike.
const round = (v: number) => Math.round(v * 1000) / 1000;
const ORBIT = 9.4;
// Where Sol starts, up and to the right, and where it rests for anyone who asks for less motion.
const SOL_AT = -0.8;
// Sol's wake: ten short arcs behind it, each thinner and fainter.
const WAKE = Array.from({ length: 10 }, (_, i) => {
  const p = (a: number) => `${round(ORBIT * Math.cos(a))} ${round(ORBIT * Math.sin(a))}`;
  return {
    d: `M${p(SOL_AT + i * 0.09)}A${ORBIT} ${ORBIT} 0 0 1 ${p(SOL_AT + (i + 1) * 0.09)}`,
    width: round(Math.max(1.1 * (1 - i * 0.07), 0.7)),
    opacity: round(0.8 * (1 - i / 10)),
  };
});
const GLOW = [
  [0, 1],
  [0.3, 0.55],
  [1, 0],
] as const;
// The core's two glows, wide and bright, each at rest and at the top of a breath. The wide one's faint edge reaches
// Sol's orbit at the top of a breath.
const CORE = { wide: [8.2, 9.4], bright: [3.8, 4.25] } as const;
// On hover, the core swells past the mark's edge, Sol laps four times as fast, and the core breathes twice as fast.
const HOVER = { core: 1.45, sol: 4, breath: 2 } as const;

function GalacticYear({ size }: { size: number }) {
  const root = useRef<SVGSVGElement>(null);
  // Each copy of the mark needs its own gradient id. React's ids carry characters a url(#…) can't.
  const glow = `glow${useId().replace(/[^\w-]/g, "")}`;
  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;
      const sol = gsap.to('[data-g="sol"]', { rotation: -360, svgOrigin: "0 0", duration: 14, ease: "none", repeat: -1 });
      const breath = { duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 };
      const breaths = [
        gsap.to('[data-g="wide"]', { attr: { r: CORE.wide[1] }, opacity: 1, ...breath }),
        gsap.to('[data-g="bright"]', { attr: { r: CORE.bright[1] }, ...breath }),
      ];
      // Only the top bar's copy sits in a button, so only it wakes on hover.
      const button = root.current?.closest("button");
      if (!button || !contextSafe) return;
      const wake = contextSafe((on: boolean) => {
        const ease = { duration: 0.6, ease: "power2.out", overwrite: true };
        gsap.to('[data-g="core"]', { scale: on ? HOVER.core : 1, svgOrigin: "0 0", ...ease });
        gsap.to(sol, { timeScale: on ? HOVER.sol : 1, ...ease });
        breaths.forEach((b) => gsap.to(b, { timeScale: on ? HOVER.breath : 1, ...ease }));
      });
      const enter = () => wake(true);
      const leave = () => wake(false);
      button.addEventListener("pointerenter", enter);
      button.addEventListener("pointerleave", leave);
      return () => {
        button.removeEventListener("pointerenter", enter);
        button.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );
  return (
    <svg ref={root} width={size} height={size} viewBox="-12 -12 24 24" overflow="visible" aria-hidden>
      <defs>
        <radialGradient id={glow}>
          {GLOW.map(([offset, opacity]) => (
            <stop key={offset} offset={offset} style={{ stopColor: "var(--ink)", stopOpacity: opacity }} />
          ))}
        </radialGradient>
      </defs>
      {/* The core: a wide soft glow, and a small bright one inside it. */}
      <g data-g="core">
        <circle data-g="wide" r={CORE.wide[0]} opacity={0.85} fill={`url(#${glow})`} />
        <circle data-g="bright" r={CORE.bright[0]} fill={`url(#${glow})`} />
      </g>
      <circle
        r={ORBIT}
        fill="none"
        className="stroke-muted"
        strokeOpacity={0.55}
        strokeWidth={0.55}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`0 ${round(100 / 36)}`}
      />
      <g data-g="sol">
        {WAKE.map(({ d, width, opacity }, i) => (
          <path key={i} d={d} fill="none" className="stroke-you" strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" />
        ))}
        <circle cx={round(ORBIT * Math.cos(SOL_AT))} cy={round(ORBIT * Math.sin(SOL_AT))} r={0.8} className="fill-you" />
      </g>
    </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span data-d="item" className="mt-6 mb-1 block font-mono text-[10.5px] tracking-[.1em] text-muted">
      {children}
    </span>
  );
}

const row = "flex min-h-11 items-center justify-between gap-3 border-b border-rowline text-[15px]";

// The drawer slides in from the left over the whole screen. A native modal dialog, so focus stays inside it, the game
// behind can't be reached, and Escape closes it.
function Drawer({ onClose }: { onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const { newGame } = useGame();
  const leaveShell = useLeaveShell();
  const open = useAccess();
  const keyed = open === undefined ? null : open === "key";
  const [sure, setSure] = useState(false);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  // New game asks twice, and the second ask lapses.
  useEffect(() => {
    if (!sure) return;
    const id = setTimeout(() => setSure(false), 4000);
    return () => clearTimeout(id);
  }, [sure]);

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo('[data-d="back"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo('[data-d="panel"]', { xPercent: -100 }, { xPercent: 0, duration: 0.4 }, 0)
        .fromTo('[data-d="item"]', { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.035 }, 0.12);
    },
    { scope: dialog },
  );

  // Faster out than in. `then` runs once the drawer is gone.
  const close = (then?: () => void) =>
    contextSafe(() => {
      if (closing.current) return;
      closing.current = true;
      const done = () => {
        dialog.current?.close();
        onClose();
        // After this drawer's own animations are gone: run inside them, the shell's leaving would be reverted with them.
        if (then) setTimeout(then);
      };
      if (prefersReducedMotion()) return done();
      gsap
        .timeline({ defaults: { ease: "power2.in" }, onComplete: done })
        .to('[data-d="panel"]', { xPercent: -100, duration: 0.22 })
        .to('[data-d="back"]', { autoAlpha: 0, duration: 0.2 }, 0);
    })();

  return (
    <dialog
      ref={dialog}
      aria-label="Menu"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      // The browser can close it without asking, as on a second Escape. Then it is already gone.
      onClose={() => closing.current || onClose()}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div data-d="back" onClick={() => close()} className="absolute inset-0 bg-black/55" />
      <nav data-d="panel" className="relative flex h-full w-[min(320px,86%)] flex-col overflow-y-auto border-r border-faint bg-paper px-5 pt-3 pb-8">
        <div data-d="item" className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <GalacticYear size={34} />
            <span className="font-mono text-[10.5px] tracking-[.1em]">HOLOS</span>
          </span>
          <button onClick={() => close()} aria-label="Close" className="-mr-3 size-11 text-xl leading-none text-muted">
            ×
          </button>
        </div>
        <p data-d="item" className="mt-1 text-[13px] leading-[1.45] text-page-ink2">
          Earth, around Sol. We circle the galaxy’s core once every 230 million years.
        </p>

        <Label>SETTINGS</Label>
        <div data-d="item" className={row}>
          <span className="flex flex-col py-2">
            Anthropic key
            <span className="text-xs text-muted">
              {keyed === null ? "…" : keyed ? "In use. Each question is billed to it." : "None. The Mind tab takes one."}
            </span>
          </span>
          {keyed ? (
            <button
              onClick={forgetKey}
              className="-mr-2 h-11 shrink-0 px-2 text-[13px] underline underline-offset-2"
            >
              Forget
            </button>
          ) : keyed === false ? (
            <Link to="/mind" onClick={() => close()} className="-mr-2 flex h-11 shrink-0 items-center px-2 text-[13px] underline underline-offset-2">
              Add
            </Link>
          ) : null}
        </div>
        <div data-d="item" className={row}>
          <button onClick={() => (sure ? close(() => leaveShell(newGame)) : setSure(true))} className={`h-11 grow text-left ${sure ? "text-other" : ""}`}>
            {sure ? "Tap again to erase this game" : "New game"}
          </button>
        </div>

        <Label>ABOUT HOLOS</Label>
        {ABOUT.map(([href, label]) => (
          <Link key={href} data-d="item" to={href} className={row}>
            {label}
            <span className="text-muted">→</span>
          </Link>
        ))}

        <Label>ELSEWHERE</Label>
        {ELSEWHERE.map(([href, label]) => (
          <a key={href} data-d="item" href={href} target="_blank" rel="noopener noreferrer" className={row}>
            {label}
            <span className="text-muted">↗</span>
          </a>
        ))}
      </nav>
    </dialog>
  );
}

/** The galaxy in the top bar's corner, and the menu it opens. */
export function Menu() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={button}
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="-my-2 -ml-2 flex size-12 items-center justify-center text-ink"
      >
        <GalacticYear size={40} />
      </button>
      {open && (
        <Drawer
          onClose={() => {
            setOpen(false);
            button.current?.focus();
          }}
        />
      )}
    </>
  );
}
