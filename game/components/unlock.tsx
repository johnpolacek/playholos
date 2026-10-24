import { useEffect, useRef, useState } from "react";
import { KeyMark } from "@/components/icons";
import type { Wrong } from "@/lib/access";
import { forgetKey, unlock } from "@/lib/key";

// Where the player's key goes, drawn as a route: kept in their browser, carried through the game's server, which
// keeps nothing, to Anthropic, which bills it.
const ROUTE = [
  { at: "This browser", does: "keeps your key", dot: "bg-you" },
  { at: "The game’s server", does: "passes it on, saves nothing", dot: "border border-muted bg-paper" },
  { at: "Anthropic", does: "bills each question to it", dot: "bg-ink" },
];

function Route() {
  return (
    <div className="relative grid grid-cols-3 gap-2 text-[10.5px] leading-snug">
      <span aria-hidden className="absolute top-[3px] right-[3px] left-[3px] border-t border-dashed border-muted" />
      {ROUTE.map(({ at, does, dot }, i) => (
        <div key={at} className={["text-left", "text-center", "text-right"][i]}>
          <span aria-hidden className={`relative inline-block size-[7px] rounded-full ${dot}`} />
          <p className="mt-1 text-ink">{at}</p>
          <p className="text-muted">{does}</p>
        </div>
      ))}
    </div>
  );
}

/** Anthropic's pages for a key and for credit. */
const KEYS = "https://platform.claude.com/settings/keys";
const BILLING = "https://platform.claude.com/settings/billing";
/** Set while the player is off getting a key, so coming back, even to a reloaded tab, says what to do next. */
const AWAY = "holos:key-away";
/** A whole key, as Anthropic gives it: once one is in the field, it opens the Mind with no second tap. */
const WHOLE = /^sk-ant-[A-Za-z0-9_-]{20,}$/;

const away = {
  get: () => {
    try {
      return sessionStorage.getItem(AWAY) === "1";
    } catch {
      return false;
    }
  },
  set: (on: boolean) => {
    try {
      if (on) sessionStorage.setItem(AWAY, "1");
      else sessionStorage.removeItem(AWAY);
    } catch {}
  },
};

/** One step of getting a key: its number, and what to do. */
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full border border-muted font-mono text-[10px] text-page-ink2">
        {n}
      </span>
      <div className="min-w-0 grow">{children}</div>
    </li>
  );
}

// Asks for a key or the code before the Mind will talk. It is a card, not the Mind's input, so a key is never mistaken
// for a question. A key spends the player's money and a code spends ours, so a browser holds only one. Getting a key
// is the hard part, so the card walks it, 2026-10-24: a button to Anthropic's key page, a word on credit and what a
// question costs, and once back, Paste, which reads the clipboard. A whole key opens the Mind on its own, pasted or
// typed. Coming back from Anthropic's page, the card says to tap Paste. A question is about 4,500 tokens in to
// claude-opus-5-5 at $4 a million and a short answer out at $20 a million: 3 to 4 cents.
export function Unlock() {
  const [wrong, setWrong] = useState<Wrong>();
  const [busy, setBusy] = useState(false);
  const [back, setBack] = useState(away.get);
  const form = useRef<HTMLFormElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const paste = useRef<HTMLButtonElement>(null);

  // Back from Anthropic's page: the card comes into view, with Paste ready.
  useEffect(() => {
    const look = () => {
      if (document.visibilityState !== "visible" || !away.get()) return;
      setBack(true);
      form.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      paste.current?.focus({ preventScroll: true });
    };
    look();
    document.addEventListener("visibilitychange", look);
    return () => document.removeEventListener("visibilitychange", look);
  }, []);

  const open = async (entry: string) => {
    if (!entry || busy) return;
    setBusy(true);
    const no = await unlock(entry);
    setBusy(false);
    setWrong(no);
    if (!no) away.set(false);
  };
  // A whole key opens the Mind as soon as it is in, without a second tap.
  const whole = (text: string) => {
    if (!field.current) return;
    field.current.value = text;
    if (WHOLE.test(text)) void open(text);
  };
  const fromClipboard = async () => {
    try {
      whole((await navigator.clipboard.readText()).trim());
    } catch {
      // No clipboard to read here: the field takes a long press instead.
    }
    field.current?.focus();
  };

  return (
    <form
      ref={form}
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
        We answer through AI. Bring your own Anthropic API key, or the access code for this test build.
      </p>
      {back ? (
        <p className="rounded-md border border-you/40 bg-you/10 px-3 py-2 text-[13px] text-ink">
          Welcome back. Tap Paste to use the key you copied.
        </p>
      ) : (
        <ol className="flex flex-col gap-2.5 text-[13px] leading-snug text-page-ink2">
          <Step n={1}>
            <a
              href={KEYS}
              target="_blank"
              rel="noreferrer"
              onClick={() => away.set(true)}
              className="inline-flex h-9 items-center rounded-md bg-ink px-3.5 text-[13px] font-medium text-paper"
            >
              Get a key from Anthropic ↗
            </a>
            <p className="mt-1 text-[12px] text-muted">Sign in or sign up, then Create Key. Any name will do.</p>
          </Step>
          <Step n={2}>
            New account? Add a little{" "}
            <a href={BILLING} target="_blank" rel="noreferrer" onClick={() => away.set(true)} className="text-ink underline underline-offset-2">
              credit
            </a>{" "}
            first. A question costs 3 to 4 cents, so $5 asks over a hundred.
          </Step>
          <Step n={3}>Copy the key. Anthropic shows it once. Come back here and tap Paste.</Step>
        </ol>
      )}
      <div className="flex gap-2">
        <input
          ref={field}
          name="code"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-ant-… or code"
          aria-label="Anthropic API key or access code"
          onPaste={(e) => {
            e.preventDefault();
            whole(e.clipboardData.getData("text").trim());
          }}
          onChange={(e) => WHOLE.test(e.currentTarget.value.trim()) && void open(e.currentTarget.value.trim())}
          className="h-10 min-w-0 grow rounded-md border border-faint bg-panel px-2.5 font-mono text-[12.5px] outline-none placeholder:text-muted focus:border-muted"
        />
        <button
          ref={paste}
          type="button"
          onClick={fromClipboard}
          disabled={busy}
          className={`h-10 shrink-0 rounded-md px-3.5 text-[13px] font-medium ${back ? "bg-you text-paper" : "border border-ink text-ink"}`}
        >
          Paste
        </button>
        <button type="submit" disabled={busy} className="h-10 shrink-0 rounded-md bg-ink px-3.5 text-[13px] text-paper disabled:opacity-60">
          {busy ? "Opening…" : "Keep it here"}
        </button>
      </div>
      {wrong === "key" && <p className="text-xs text-other">That key doesn’t open the Mind. It takes an Anthropic API key, not a claude.ai login.</p>}
      {wrong === "workspace" && <p className="text-xs text-other">We can’t find a workspace that key can ask in. Make one for a single workspace.</p>}
      {wrong === "code" && <p className="text-xs text-other">That code doesn’t open the Mind.</p>}
      {back && (
        <button type="button" onClick={() => (away.set(false), setBack(false))} className="self-start text-[11px] text-muted underline">
          Show the steps again
        </button>
      )}
      <Route />
    </form>
  );
}

// While the player's own key opens the Mind, a way to take it back out.
export function ForgetKey() {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
      <KeyMark size={12} />
      <span>
        We are asking with your Anthropic key, kept in this browser.{" "}
        <button type="button" onClick={forgetKey} className="underline">
          Forget it
        </button>
      </span>
    </p>
  );
}
