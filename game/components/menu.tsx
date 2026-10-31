import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { GalacticYear } from "@/components/galactic-year";
import { useGame } from "@/components/game-provider";
import { useLeaveShell } from "@/components/wake";
import { forgetKey, useAccess } from "@/lib/key";
import { plainClick, useLeaveFor } from "@/lib/leave";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

const ABOUT = [
  ["/about", "About Holos"],
  ["/about/research", "Research"],
  ["/about/design", "Design"],
] as const;

const ELSEWHERE = [
  ["https://github.com/johnpolacek/playholos", "GitHub"],
  ["https://johnpolacek.com", "Created by John Polacek"],
] as const;

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
  const leaveFor = useLeaveFor();
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
        {/* The drawer slides away, then the game plays out to the page. */}
        {ABOUT.map(([href, label]) => (
          <Link
            key={href}
            data-d="item"
            to={href}
            onClick={(e) => {
              if (!plainClick(e)) return;
              e.preventDefault();
              close(() => leaveFor(href));
            }}
            className={row}
          >
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
