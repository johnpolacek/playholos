import { useEffect, useRef, useState } from "react";
import { Prompt } from "@/components/icons";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

/** The repo's steps for playing on a Claude login. */
export const STEPS_URL = "https://github.com/johnpolacek/playholos#play-on-your-own-claude-or-chatgpt-plan";
/** What to ask Claude Code or Codex, already on the machine and logged in. */
export const ASK = "Set up Holos for me to play: run npx playholos. If Node 20.9 or later is missing, help me install it first.";

const CLAUDE_CODE = "https://claude.com/claude-code";
const CODEX = "https://developers.openai.com/codex";

const STEPS: { title: string; body: React.ReactNode; code?: string }[] = [
  {
    title: "Get Node",
    body: (
      <>
        Download it from{" "}
        <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
          nodejs.org ↗
        </a>
        . Version 20.9 or newer.
      </>
    ),
  },
  {
    title: "Get Claude Code or Codex",
    body: (
      <>
        Install{" "}
        <a href={CLAUDE_CODE} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
          Claude Code ↗
        </a>{" "}
        or{" "}
        <a href={CODEX} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
          Codex ↗
        </a>
        , then run it once to log in. It needs a paid Claude or ChatGPT plan.
      </>
    ),
  },
  {
    title: "Run the game",
    body: "Open a terminal and run this. It downloads the game, sets it up, and opens it in your browser.",
    code: "npx playholos",
  },
];

function Copy({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copy ${label}`}
      className="h-8 shrink-0 rounded-md bg-button px-3 text-[12.5px] text-paper"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// A native modal dialog, as the menu and Begin's sheet are: a sheet from the bottom when tall, a card in the middle when
// wide. It can open from inside the menu, so its own cancel and close stop here and never reach the menu's. 2026-11-05.
function Sheet({ onClose }: { onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo('[data-r="back"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo('[data-r="panel"]', { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
        .fromTo('[data-r="item"]', riseFrom, { ...rise, stagger: 0.05 }, 0.12)
        .fromTo('[data-r="thread"]', { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "power2.inOut" }, 0.15)
        .fromTo('[data-r="node"]', { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.09 }, 0.25);
    },
    { scope: dialog },
  );

  const close = () =>
    contextSafe(() => {
      if (closing.current) return;
      closing.current = true;
      const gone = () => {
        dialog.current?.close();
        onClose();
      };
      if (prefersReducedMotion()) return gone();
      gsap
        .timeline({ defaults: { ease: "power2.in" }, onComplete: gone })
        .to('[data-r="panel"]', { autoAlpha: 0, y: 24, duration: 0.22 })
        .to('[data-r="back"]', { autoAlpha: 0, duration: 0.2 }, 0);
    })();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="run-local-title"
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
      onClose={(e) => {
        e.stopPropagation();
        if (!closing.current) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-left text-ink normal-case tracking-normal backdrop:bg-transparent"
    >
      <div data-r="back" onClick={close} className="absolute inset-0 bg-black/55" />
      <div className="pointer-events-none relative flex h-full items-end justify-center wide:items-center wide:p-6">
        <section
          data-r="panel"
          className="pointer-events-auto flex max-h-full w-full max-w-xl flex-col overflow-y-auto rounded-t-2xl border border-b-0 border-faint bg-paper px-5 pt-4 pb-5 font-sans wide:w-[440px] wide:rounded-2xl wide:border-b"
        >
          <div data-r="item" className="flex items-start justify-between">
            <span className="flex flex-col gap-1">
              <span className="font-mono text-[10.5px] tracking-[.1em] text-muted">ON YOUR OWN COMPUTER</span>
              <h2 id="run-local-title" className="text-[19px] leading-snug font-medium">
                Run Holos locally
              </h2>
            </span>
            <button onClick={close} aria-label="Close" className="-mt-2 -mr-3 size-11 text-xl leading-none text-muted">
              ×
            </button>
          </div>
          <p data-r="item" className="mt-2 text-[13px] leading-[1.5] text-page-ink2">
            The Mind answers through Claude Code or Codex on your own plan, so you need no API key.
          </p>

          <section data-r="item" className="mt-4 flex flex-col gap-2.5 rounded-lg border border-dashed border-muted p-3.5">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-page-ink2">
              <Prompt size={13} />
              HAVE YOUR AGENT DO IT
            </div>
            <p className="text-[13px] leading-[1.5] text-page-ink2">
              Paste this into{" "}
              <a href={CLAUDE_CODE} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
                Claude Code ↗
              </a>{" "}
              or{" "}
              <a href={CODEX} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
                Codex ↗
              </a>
              . It needs a paid Claude or ChatGPT plan.
            </p>
            <div className="flex flex-col gap-2 rounded-md border border-faint bg-panel p-2.5">
              <p className="font-mono text-[12px] leading-relaxed text-ink">{ASK}</p>
              <span className="self-end">
                <Copy text={ASK} label="the prompt" />
              </span>
            </div>
          </section>

          <span data-r="item" className="mt-5 font-mono text-[10px] tracking-[.12em] text-page-ink2">
            OR DO IT BY HAND
          </span>
          <ol className="relative mt-3 flex flex-col gap-4">
            <span
              data-r="thread"
              aria-hidden
              className="absolute top-3 bottom-3 left-[11px] origin-top border-l border-dashed border-muted"
            />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-3">
                <span
                  data-r="node"
                  aria-hidden
                  className="relative flex size-[23px] shrink-0 items-center justify-center rounded-full border border-muted bg-paper font-mono text-[11px] text-ink"
                >
                  {i + 1}
                </span>
                <div data-r="item" className="flex min-w-0 grow flex-col gap-1.5 pt-0.5">
                  <span className="text-[15px] font-medium">{s.title}</span>
                  <p className="text-[13px] leading-[1.5] text-page-ink2">{s.body}</p>
                  {s.code && (
                    <div className="flex items-center justify-between gap-2 rounded-md border border-faint bg-panel py-1.5 pr-1.5 pl-3">
                      <code className="font-mono text-[13px] text-ink">{s.code}</code>
                      <Copy text={s.code} label="the command" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <p data-r="item" className="mt-4 text-[13px] leading-[1.5] text-page-ink2">
            Later, <code className="font-mono text-[12px] text-ink">npx playholos --update</code> gets the newest version.
            Your game is saved in the browser, so it carries over.
          </p>

          <a
            data-r="item"
            href={STEPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 self-start text-[13px] text-page-ink2 underline underline-offset-2"
          >
            The steps on GitHub ↗
          </a>
        </section>
      </div>
    </dialog>
  );
}

/** A link that opens the steps for running Holos on your own computer. */
export function RunLocal({ className, children = "Run locally", ...rest }: React.ComponentProps<"button">) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
        {...rest}
      >
        {children}
      </button>
      {open && (
        <Sheet
          onClose={() => {
            setOpen(false);
            button.current?.focus();
          }}
        />
      )}
    </>
  );
}
