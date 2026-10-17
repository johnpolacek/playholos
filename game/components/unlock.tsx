import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, admits, safePath } from "@/lib/access";

async function unlock(form: FormData) {
  "use server";
  const code = String(form.get("code") ?? "");
  const next = safePath(form.get("next"));
  if (!admits(code)) redirect(`${next}?wrong=1`);
  (await cookies()).set(ACCESS_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(next);
}

/** Whether this browser holds the code. */
export async function unlocked() {
  return admits((await cookies()).get(ACCESS_COOKIE)?.value);
}

// Asks for the code in place of the Mind's input, then returns to `next`.
export function Unlock({ next, wrong }: { next: string; wrong?: boolean }) {
  return (
    <form action={unlock} className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-panel pb-3">
      <p className="text-[13px] text-page-ink2">We answer through AI, so this test build asks for the access code first.</p>
      <input type="hidden" name="next" value={safePath(next)} />
      <div className="flex h-11 items-center gap-2 rounded-full border border-ink bg-paper pr-1.5 pl-3.5">
        <input
          name="code"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Code"
          aria-label="Access code"
          className="min-w-0 grow bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Open" className="size-8 shrink-0 rounded-full bg-ink text-paper">
          ↑
        </button>
      </div>
      {wrong && <p className="text-xs text-other">That code doesn’t open the Mind.</p>}
    </form>
  );
}
