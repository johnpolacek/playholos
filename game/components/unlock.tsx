import { useState } from "react";
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

// Asks for a key or the code before the Mind will talk. It is a card, not the Mind's input, so a key is never mistaken
// for a question. A key spends the player's money and a code spends ours, so a browser holds only one.
export function Unlock() {
  const [wrong, setWrong] = useState<Wrong>();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setWrong(await unlock(String(new FormData(e.currentTarget).get("code") ?? "").trim()));
      }}
      className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed border-muted bg-paper p-3.5"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-page-ink2">
        <KeyMark size={13} />
        YOUR KEY
      </div>
      <p className="text-[13px] text-page-ink2">We answer through AI. Bring your own Anthropic API key, or the access code for this test build.</p>
      <div className="flex gap-2">
        <input
          name="code"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-ant-… or code"
          aria-label="Anthropic API key or access code"
          className="h-9 min-w-0 grow rounded-md border border-faint bg-panel px-2.5 font-mono text-[12.5px] outline-none placeholder:text-muted focus:border-muted"
        />
        <button type="submit" className="h-9 shrink-0 rounded-md bg-ink px-3.5 text-[12.5px] text-paper">
          Keep it here
        </button>
      </div>
      {wrong === "key" && <p className="text-xs text-other">That key doesn’t open the Mind. It takes an Anthropic API key, not a claude.ai login.</p>}
      {wrong === "workspace" && <p className="text-xs text-other">We can’t find a workspace that key can ask in. Make one for a single workspace.</p>}
      {wrong === "code" && <p className="text-xs text-other">That code doesn’t open the Mind.</p>}
      <Route />
      <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noreferrer" className="self-start text-[11px] text-muted underline">
        Get a key
      </a>
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
