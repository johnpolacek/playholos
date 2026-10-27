import { useState } from "react";
import { KeyMark } from "@/components/icons";
import type { Wrong } from "@/lib/access";
import { unlock } from "@/lib/key";

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

  const open = async (entry: string) => {
    if (!entry || busy) return;
    setBusy(true);
    const no = await unlock(entry);
    setBusy(false);
    setWrong(no);
  };

  return (
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
        We answer with your{" "}
        <a href={KEYS} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2">
          Anthropic API key ↗
        </a>{" "}
        or the test code.
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
  );
}
