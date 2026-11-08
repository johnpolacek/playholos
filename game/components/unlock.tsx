import { useEffect, useRef, useState } from "react";
import { Check, KeyMark, Prompt } from "@/components/icons";
import { FREE_QUESTIONS } from "@/lib/access";
import type { Wrong } from "@/lib/access";
import { earnPass, unlock, useAllowance } from "@/lib/key";
import { ASK, STEPS_URL as STEPS } from "@/components/run-local";

// Where the player's key goes, drawn as a route: kept in their browser, carried through the game's server, which
// keeps nothing, to Anthropic, which bills it.
const ROUTE = [
  { at: "This browser keeps it", dot: "bg-you" },
  { at: "Our server saves nothing", dot: "border border-muted bg-paper" },
  { at: "Anthropic bills it", dot: "bg-ink" },
];

function Route() {
  return (
    <div className="relative grid grid-cols-3 gap-2 text-[10.5px] leading-snug text-muted">
      <span aria-hidden className="absolute top-[3px] right-[3px] left-[3px] border-t border-dashed border-muted" />
      {ROUTE.map(({ at, dot }, i) => (
        <div key={at} className={["text-left", "text-center", "text-right"][i]}>
          <span aria-hidden className={`relative inline-block size-[7px] rounded-full ${dot}`} />
          <p className="mt-1">{at}</p>
        </div>
      ))}
    </div>
  );
}

/** Anthropic's page for a key. */
const KEYS = "https://platform.claude.com/settings/keys";
/** A whole key, as Anthropic gives it: once one is in the field, it opens the Mind with no second tap. */
const WHOLE = /^sk-ant-[A-Za-z0-9_-]{20,}$/;

// Asks for a key or the code before the Mind will talk. It is a card, not the Mind's input, so a key is never mistaken
// for a question. A key spends the player's money and a code spends ours, so a browser holds only one. Kept to a line,
// a field and the route, 2026-10-25: a whole key opens the Mind on its own, pasted or typed, so no Paste button.
export function Unlock() {
  const [wrong, setWrong] = useState<Wrong>();
  const [busy, setBusy] = useState(false);
  const { free } = useAllowance();

  const open = async (entry: string) => {
    if (!entry || busy) return;
    setBusy(true);
    const no = await unlock(entry);
    setBusy(false);
    setWrong(no);
  };

  return (
    <>
      <p className="mt-3 text-[13px] leading-[1.45] text-page-ink2">
        Our Mind thinks with Claude. {free ? "Three ways open it: on us, with your own API key, or on your Claude plan on your own computer." : "Two ways open it: your own API key here, or your Claude plan on your own computer."}
      </p>
      {free && <OnUs site={free} />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void open(String(new FormData(e.currentTarget).get("code") ?? "").trim());
        }}
        className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed border-muted bg-paper p-3.5"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-page-ink2">
          <KeyMark size={13} />
          YOUR KEY
        </div>
        <p className="text-[13px] text-page-ink2">
          Provide your{" "}
          <a href={KEYS} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2">
            Anthropic API key ↗
          </a>{" "}
          to enable the Mind.
        </p>
        <div className="flex gap-2">
          <input
            name="code"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-… or code"
            aria-label="Anthropic API key or access code"
            onChange={(e) => WHOLE.test(e.currentTarget.value.trim()) && void open(e.currentTarget.value.trim())}
            className="h-10 min-w-0 grow rounded-md border border-faint bg-panel px-2.5 font-mono text-[12.5px] outline-none placeholder:text-muted focus:border-muted"
          />
          <button type="submit" disabled={busy} className="h-10 shrink-0 rounded-md bg-ink px-3.5 text-[13px] text-paper disabled:opacity-60">
            {busy ? "Opening…" : "Open"}
          </button>
        </div>
        {wrong === "key" && <p className="text-xs text-other">That key doesn’t open the Mind. It takes an Anthropic API key, not a claude.ai login.</p>}
        {wrong === "workspace" && <p className="text-xs text-other">We can’t find a workspace that key can ask in. Make a key for a single workspace.</p>}
        {wrong === "code" && <p className="text-xs text-other">That code doesn’t open the Mind.</p>}
        <Route />
      </form>
      <Local />
    </>
  );
}


type Turnstile = {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  remove(id: string): void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

/** Loads Cloudflare's Turnstile script once, when a player first asks for a pass. */
let loading: Promise<Turnstile> | undefined;
function loadTurnstile() {
  loading ??= new Promise((done, fail) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => (window.turnstile ? done(window.turnstile) : fail(new Error("No Turnstile")));
    script.onerror = () => {
      loading = undefined;
      fail(new Error("No Turnstile"));
    };
    document.head.append(script);
  });
  return loading;
}

// The first way in, 2026-11-08: our Mind on our credit, a hundred questions a day, once Turnstile is sure a person
// asks. The check shows only if Turnstile is unsure, and a pass keeps for a week.
function OnUs({ site }: { site: string }) {
  const [state, setState] = useState<"idle" | "checking" | "failed">("idle");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state !== "checking" || !box.current) return;
    let id: string | undefined;
    let ts: Turnstile | undefined;
    loadTurnstile()
      .then((t) => {
        ts = t;
        id = t.render(box.current!, {
          sitekey: site,
          appearance: "interaction-only",
          callback: (token: string) => void earnPass(token).then((no) => no && setState("failed")),
          "error-callback": () => setState("failed"),
        });
      })
      .catch(() => setState("failed"));
    return () => {
      if (ts && id) ts.remove(id);
    };
  }, [state, site]);
  return (
    <section className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed border-muted bg-paper p-3.5">
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-page-ink2">
        <Check size={13} />
        ON US
      </div>
      <p className="text-[13px] text-page-ink2">
        Ask our Mind up to {FREE_QUESTIONS} questions a day, free. A quick check makes sure you’re a person.
      </p>
      <div ref={box} />
      <button
        type="button"
        disabled={state === "checking"}
        onClick={() => setState("checking")}
        className="h-10 self-start rounded-md bg-ink px-3.5 text-[13px] text-paper disabled:opacity-60"
      >
        {state === "checking" ? "Checking…" : "Open our Mind"}
      </button>
      {state === "failed" && <p className="text-xs text-other">The check didn’t pass. Try again, or use a key below.</p>}
    </section>
  );
}

// The other way in, 2026-10-27: on the player's own computer, the Mind answers through Claude Code on their own Claude
// plan, so no key. Claude Code can set it up itself, so the card gives the ask to paste in, and the one command for doing
// it by hand. npx playholos downloads the game and starts it, with no git, from 2026-11-04.
function Local() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(ASK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed border-muted bg-paper p-3.5">
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-page-ink2">
        <Prompt size={13} />
        OR PLAY ON YOUR CLAUDE PLAN
      </div>
      <p className="text-[13px] text-page-ink2">
        With Claude Pro or Max, run Holos on your own computer. The Mind answers through Claude Code on your plan, with no
        API key. Paste this into Claude Code:
      </p>
      <div className="flex flex-col gap-2 rounded-md border border-faint bg-panel p-2.5">
        <p className="font-mono text-[12px] leading-relaxed text-ink">{ASK}</p>
        <button type="button" onClick={() => void copy()} className="h-8 self-end rounded-md bg-ink px-3 text-[12.5px] text-paper">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-[13px] text-page-ink2">
        Or run <code className="font-mono text-[12px] text-ink">npx playholos</code> in a terminal.{" "}
        <a href={STEPS} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2">
          The steps on GitHub ↗
        </a>
      </p>
    </section>
  );
}
