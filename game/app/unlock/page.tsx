import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, admits, safePath } from "@/lib/access";

async function unlock(form: FormData) {
  "use server";
  const code = String(form.get("code") ?? "");
  const next = safePath(form.get("next"));
  if (!admits(code)) redirect(`/unlock?wrong=1&next=${encodeURIComponent(next)}`);
  (await cookies()).set(ACCESS_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(next);
}

export default async function Unlock({ searchParams }: PageProps<"/unlock">) {
  const { next, wrong } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form action={unlock} className="flex w-full max-w-[358px] flex-col gap-3">
        <span className="flex items-center gap-2 text-xl font-semibold">
          <i className="size-2.5 rounded-full bg-you" />
          Holos
        </span>
        <p className="text-sm text-page-ink2">This test build is private. Enter the access code.</p>
        <input type="hidden" name="next" value={safePath(next)} />
        <div className="flex h-11 items-center gap-2 rounded-full border border-ink bg-paper pr-1.5 pl-3.5">
          <input
            name="code"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="Code"
            aria-label="Access code"
            className="min-w-0 grow bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button type="submit" aria-label="Open" className="size-8 shrink-0 rounded-full bg-ink text-paper">
            ↑
          </button>
        </div>
        {wrong && <p className="text-xs text-other">That code doesn’t open Holos.</p>}
      </form>
    </main>
  );
}
