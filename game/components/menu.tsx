import { Button } from "@ui-sdk/react/button";
import { Textarea } from "@ui-sdk/react/textarea";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog";
import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { GalacticYear } from "@/components/galactic-year";
import { useGame } from "@/components/game-provider";
import { RunLocal } from "@/components/run-local";
import { type Sheet, useSheet } from "@/components/sheet";
import { useLeaveShell } from "@/components/wake";
import { forgetKey, useAccess, useAllowance } from "@/lib/key";
import { plainClick, useLeaveFor } from "@/lib/leave";
import { setMusic, useMusic } from "@/lib/music";
import { LIVE, sendFeedback } from "@/lib/track";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// Ways out of the game, each a section: the universe and the simulation, then the about pages. 2026-11-04.
const PAGES = [
  ["EXPLORE", [["/universe", "Universe"], ["/sim", "Simulation"]]],
  ["ABOUT HOLOS", [["/about/research", "Research"], ["/about/design", "Design"]]],
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

/** The menu's look: its paper, edge and room. /ui/menu draws it in place with it. */
export const MENU_LOOK = "flex flex-col border-r border-faint bg-paper px-5 pt-3 pb-8 text-ink";

const row = "flex min-h-11 items-center justify-between gap-3 border-b border-rowline text-[15px]";

// A note to the game's maker, with the screen and Year sent beside it, so we know where the player was. Only on
// playholos.com and the dev server, since a local game has no one to send it to. 2026-11-08.
function Feedback() {
  const { pathname } = useLocation();
  const { year } = useGame();
  if (!LIVE && !import.meta.env.DEV) return null;
  return <FeedbackFace onSend={(text) => sendFeedback(text, pathname, year)} />;
}

/** The note to the game's maker, drawn: the box, a line on where it goes, and Send, which says how it went. Feedback
 *  sends it from the game, and /ui/menu sends nothing. 2026-11-15. */
export function FeedbackFace({ onSend }: { onSend(text: string): Promise<boolean> }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const send = async () => {
    if (!text.trim() || state === "sending") return;
    setState("sending");
    const ok = await onSend(text);
    setState(ok ? "sent" : "failed");
    if (ok) setText("");
  };
  return (
    <>
      <Label>FEEDBACK</Label>
      <div data-d="item" className="flex flex-col gap-2 py-2">
        {state === "sent" ? (
          <p className="text-[13px] text-page-ink2">Sent. Thank you, it’s read.</p>
        ) : (
          <>
            <Textarea
              value={text}
              onValueChange={setText}
              maxLength={1000}
              rows={3}
              placeholder="What’s confusing, broken, or wonderful?"
              aria-label="Feedback for the game’s maker"
              className="min-h-20 w-full resize-y rounded-md border border-faint bg-panel p-2.5 text-[14px] outline-none placeholder:text-muted focus:border-muted"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted">{state === "failed" ? "That didn’t send. Try again in a minute." : "Goes to the game’s maker, with this screen."}</span>
              <Button
                type="button"
                onClick={() => void send()}
                disabled={!text.trim() || state === "sending"}
                // Under Schematic, 2026-11-15, drawn in an ink line, not filled. Under Infrared, cold until touched.
                className="h-9 shrink-0 rounded-md bg-button px-3.5 text-[13px] text-paper disabled:opacity-50 schematic:rounded-[1px] schematic:bg-transparent schematic:text-ink schematic:shadow-[inset_0_0_0_1px_currentColor] infrared:bg-(--cold) infrared:text-ink infrared:shadow-[inset_0_0_0_1px_var(--heat-0)] infrared:hover:shadow-[inset_0_0_0_1px_var(--heat-1)]"
              >
                {state === "sending" ? "Sending…" : "Send"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// New game asks twice, and the second ask lapses. It lives inside the drawer, so closing it forgets the first ask.
function NewGame({ close }: { close: Sheet["close"] }) {
  const { newGame } = useGame();
  const leaveShell = useLeaveShell();
  return <NewGameButton onErase={() => close(() => leaveShell(newGame))} />;
}

/** New game, drawn: it asks twice, and the second ask lapses. */
export function NewGameButton({ onErase }: { onErase(): void }) {
  const [sure, setSure] = useState(false);
  useEffect(() => {
    if (!sure) return;
    const id = setTimeout(() => setSure(false), 4000);
    return () => clearTimeout(id);
  }, [sure]);
  return (
    <Button onClick={() => (sure ? onErase() : setSure(true))} className={`h-11 grow text-left ${sure ? "text-other" : ""}`}>
      {sure ? "Tap again to erase this game" : "New game"}
    </Button>
  );
}

// The game's quiet music, on or off, kept in this browser. 2026-11-15.
function Music() {
  const on = useMusic();
  return (
    <>
      <span className="flex flex-col py-2">
        Music
        <span className="text-xs text-muted">{on ? "On, quietly." : "Off."}</span>
      </span>
      <Button onClick={() => setMusic(!on)} className="-mr-2 h-11 shrink-0 px-2 text-[13px] underline underline-offset-2">
        {on ? "Turn off" : "Turn on"}
      </Button>
    </>
  );
}

// The drawer slides in from the left over the whole screen. On ui-sdk's Dialog since 2026-11-14, so focus stays
// inside it, the game behind can't be reached, Escape or a press outside closes it, and focus goes back to the galaxy.
function Drawer({ sheet }: { sheet: Sheet }) {
  const scope = useRef<HTMLDivElement>(null);
  const close = sheet.close;
  const leaveFor = useLeaveFor();
  const open = useAccess();
  const keyed = open === undefined ? null : open === "key";
  const { free } = useAllowance();

  useGSAP(
    (_, contextSafe) => {
      // Faster out than in. The shell's leaving runs after, outside these, or it would be reverted with them.
      sheet.exits(contextSafe!((done: () => void) => {
        if (prefersReducedMotion()) return done();
        gsap
          .timeline({ defaults: { ease: "power2.in" }, onComplete: done })
          .to('[data-d="panel"]', { xPercent: -100, duration: 0.22 })
          .to('[data-d="back"]', { autoAlpha: 0, duration: 0.2 }, 0);
      }));
      if (!sheet.open || prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo('[data-d="back"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo('[data-d="panel"]', { xPercent: -100 }, { xPercent: 0, duration: 0.4 }, 0)
        .fromTo('[data-d="item"]', { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.035 }, 0.12);
    },
    { scope, dependencies: [sheet.open] },
  );

  return (
    <div ref={scope} className="contents">
      <DialogBackdrop data-d="back" className="fixed inset-0 bg-black/55" />
      <DialogContent
        data-d="panel"
        render={<nav />}
        className={`${MENU_LOOK} fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-[min(320px,86%)] overflow-y-auto outline-none`}
      >
        <MenuFace
          Title={DialogTitle}
          Close={DialogClose}
          mind={{
            name: open === null ? "The Mind" : "Anthropic key",
            line:
              keyed === null
                ? "…"
                : keyed
                  ? "In use. Each question is billed to it."
                  : open === null
                    ? free
                      ? "Locked. Open it on us, with a key, or on your Claude plan."
                      : "Locked. A key opens it, or play on your Claude plan."
                    : open === "free"
                      ? "On us, with a daily limit. A key lifts it."
                      : "None. The Mind tab takes one.",
            action: keyed ? (
              <Button onClick={forgetKey} className="-mr-2 h-11 shrink-0 px-2 text-[13px] underline underline-offset-2">
                Forget
              </Button>
            ) : keyed === false ? (
              <Link to="/play/mind" onClick={() => close()} className="-mr-2 flex h-11 shrink-0 items-center px-2 text-[13px] underline underline-offset-2">
                {open === null ? "Open" : "Add"}
              </Link>
            ) : null,
          }}
          music={<Music />}
          newGame={<NewGame close={close} />}
          // The drawer slides away, then the game plays out to the page.
          onPage={(e, href) => {
            if (!plainClick(e)) return;
            e.preventDefault();
            close(() => leaveFor(href));
          }}
          feedback={<Feedback />}
        />
      </DialogContent>
    </div>
  );
}

/** The galaxy in the top bar's corner, and the menu it opens. */
export function Menu() {
  const sheet = useSheet();
  return (
    <Dialog open={sheet.open} onOpenChange={sheet.onOpenChange}>
      <DialogTrigger aria-label="Menu" className="-my-2 -ml-2 flex size-12 items-center justify-center text-ink">
        <GalacticYear size={40} />
      </DialogTrigger>
      <Drawer sheet={sheet} />
    </Dialog>
  );
}

/** The menu, drawn: the galaxy and the name, the Mind's key, New game, the pages, a note to the game's maker, and the
 *  ways elsewhere. The drawer feeds it the game, and /ui/menu a fixed one. A drawer passes its Dialog's own Title and
 *  Close. 2026-11-15. */
export function MenuFace({
  Title = "h2",
  Close = Button,
  mind,
  music,
  newGame,
  onPage,
  feedback,
}: {
  Title?: React.ElementType;
  Close?: React.ElementType;
  mind: { name: string; line: string; action: React.ReactNode };
  music?: React.ReactNode;
  newGame: React.ReactNode;
  onPage?: (e: React.MouseEvent, href: string) => void;
  feedback?: React.ReactNode;
}) {
  return (
    <>
      <div data-d="item" className="flex items-center justify-between">
        <span className="flex items-center gap-2.5">
          <GalacticYear size={34} />
          <Title className="font-mono text-[10.5px] font-normal tracking-[.1em]">HOLOS</Title>
        </span>
        <Close aria-label="Close" className="-mr-3 size-11 text-xl leading-none text-muted">
          ×
        </Close>
      </div>
      <p data-d="item" className="mt-1 text-[13px] leading-[1.45] text-page-ink2">
        Earth, around Sol. We circle the galaxy’s core once every 230 million years.
      </p>

      <Label>SETTINGS</Label>
      <div data-d="item" className={row}>
        <span className="flex flex-col py-2">
          {mind.name}
          <span className="text-xs text-muted">{mind.line}</span>
        </span>
        {mind.action}
      </div>
      {music && (
        <div data-d="item" className={row}>
          {music}
        </div>
      )}
      <div data-d="item" className={row}>
        {newGame}
      </div>

      {PAGES.map(([title, links]) => (
        <Fragment key={title}>
          <Label>{title}</Label>
          {links.map(([href, label]) => (
            <Link key={href} data-d="item" to={href} onClick={(e) => onPage?.(e, href)} className={row}>
              {label}
              <span className="text-muted">→</span>
            </Link>
          ))}
        </Fragment>
      ))}

      {feedback}

      <Label>ELSEWHERE</Label>
      {ELSEWHERE.map(([href, label]) => (
        <a key={href} data-d="item" href={href} target="_blank" rel="noopener noreferrer" className={row}>
          {label}
          <span className="text-muted">↗</span>
        </a>
      ))}
      <RunLocal data-d="item" className={`${row} w-full text-left`}>
        Run locally
        <span className="text-muted">↓</span>
      </RunLocal>
    </>
  );
}
