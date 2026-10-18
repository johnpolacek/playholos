import { useState } from "react";
import { forgetKey, unlock } from "@/lib/key";

// Asks for a key or the code in place of the Mind's input. A key spends the player's money and a code spends ours, so
// a browser holds only one.
export function Unlock() {
  const [wrong, setWrong] = useState<"key" | "code">();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setWrong(await unlock(String(new FormData(e.currentTarget).get("code") ?? "").trim()));
      }}
      className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-panel pb-3"
    >
      <p className="text-[13px] text-page-ink2">We answer through AI. Bring your own Anthropic API key, or the access code for this test build.</p>
      <div className="flex h-11 items-center gap-2 rounded-full border border-ink bg-paper pr-1.5 pl-3.5">
        <input
          name="code"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="API key or code"
          aria-label="Anthropic API key or access code"
          className="min-w-0 grow bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Open" className="size-8 shrink-0 rounded-full bg-ink text-paper">
          ↑
        </button>
      </div>
      {wrong === "key" && <p className="text-xs text-other">That isn’t an Anthropic API key. A claude.ai login can’t open the Mind.</p>}
      {wrong === "code" && <p className="text-xs text-other">That code doesn’t open the Mind.</p>}
      <p className="text-[11px] text-muted">
        Your key stays in this browser, and each question is billed to it.{" "}
        <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noreferrer" className="underline">
          Get a key
        </a>
      </p>
    </form>
  );
}

// While the player's own key opens the Mind, a way to take it back out.
export function ForgetKey() {
  return (
    <p className="mt-2 text-[11px] text-muted">
      We are asking with your Anthropic key.{" "}
      <button type="button" onClick={forgetKey} className="underline">
        Forget it
      </button>
    </p>
  );
}
