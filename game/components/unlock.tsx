import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, admits, isAnthropicKey, KEY_COOKIE, safePath } from "@/lib/access";
import { forgetKey } from "@/lib/key";

const KEPT = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
} as const;

// One field takes either. A key spends the player's money and a code spends ours, so a browser holds only one.
async function unlock(form: FormData) {
  "use server";
  const entry = String(form.get("code") ?? "").trim();
  const next = safePath(form.get("next"));
  const jar = await cookies();
  if (entry.startsWith("sk-ant-")) {
    if (!isAnthropicKey(entry)) redirect(`${next}?wrong=key`);
    jar.set(KEY_COOKIE, entry, KEPT);
    jar.delete(ACCESS_COOKIE);
  } else {
    if (!admits(entry)) redirect(`${next}?wrong=code`);
    jar.set(ACCESS_COOKIE, entry, KEPT);
    jar.delete(KEY_COOKIE);
  }
  redirect(next);
}

/** What opens the Mind in this browser: the player's key, the code, or nothing. */
export async function unlocked() {
  const jar = await cookies();
  if (isAnthropicKey(jar.get(KEY_COOKIE)?.value)) return "key";
  return admits(jar.get(ACCESS_COOKIE)?.value) ? "code" : null;
}

// Asks for a key or the code in place of the Mind's input, then returns to `next`.
export function Unlock({ next, wrong }: { next: string; wrong?: string }) {
  return (
    <form action={unlock} className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-panel pb-3">
      <p className="text-[13px] text-page-ink2">We answer through AI. Bring your own Anthropic API key, or the access code for this test build.</p>
      <input type="hidden" name="next" value={safePath(next)} />
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
    <form action={forgetKey} className="mt-2 text-[11px] text-muted">
      We are asking with your Anthropic key.{" "}
      <button type="submit" className="underline">
        Forget it
      </button>
    </form>
  );
}
