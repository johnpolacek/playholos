import { Link } from "react-router";
import { Sources } from "@/components/sources";
import type { Source } from "@/lib/game/sources";

// A tab's head, and the pieces Scan and Build share below it, so the two read alike: the card that walks us through
// the tab with the Mind, a list's head, and a row's face.

/** A tab's name, and on the right its state, or the ⓘ that opens the real record behind it. */
export function TabHead({ title, right, sources }: { title: string; right?: string; sources?: Source[] }) {
  return (
    <div className="flex items-center justify-between pt-1 pb-1.5 text-[11px] tracking-[.08em] text-muted">
      <span>{title}</span>
      {right && <span className="font-mono">{right}</span>}
      {sources && (
        <span className="-my-2.5 -mr-2.5 flex justify-end">
          <Sources sources={sources} />
        </span>
      )}
    </div>
  );
}

/** A walk through the tab with the Mind, one stop at a time: Scan's review of our leads, Build's first builds. Once
 *  done, it says so. */
export function Walk({ to, title, line, done }: { to: string; title: string; line: string; done: boolean }) {
  return (
    <Link
      to={to}
      className="mt-1 mb-2 flex items-center gap-3 rounded-xl border border-you/50 px-3 py-2.5 transition-colors hover:bg-you/10"
    >
      <svg width={14} height={14} viewBox="-7 -7 14 14" aria-hidden className="shrink-0">
        <circle r={6} fill="none" className="stroke-you" />
        <path d="M-1.8 -3 L3 0 L-1.8 3 Z" className="fill-you" />
      </svg>
      <span className="flex min-w-0 grow flex-col">
        <span className="text-[14.5px] leading-snug">{title}</span>
        <span className="text-[12.5px] leading-snug text-page-ink2">{line}</span>
      </span>
      <span className={`shrink-0 font-mono ${done ? "text-[10.5px] tracking-[.06em] text-you" : "text-[14px] text-muted"}`}>
        {done ? "DONE" : "→"}
      </span>
    </Link>
  );
}

/** A list's head: what it holds and how many, and what its right column counts. */
export function ListHead({
  left,
  right,
  className = "",
  ...rest
}: { left: string; right: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`flex justify-between font-mono text-[10px] tracking-[.1em] text-muted uppercase ${className}`}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

/** A row's face: its dot, its name and line, its count on the right, and a › when it opens a page. */
export function Face({
  dot,
  name,
  line,
  right,
  more = true,
}: {
  /** The dot's look: filled in our blue, or theirs, or an open ring. */
  dot: string;
  name: React.ReactNode;
  line: React.ReactNode;
  right: React.ReactNode;
  more?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-3">
      <span className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${dot}`} />
      <span className="flex min-w-0 grow flex-col">
        <span className="text-[15px] leading-snug">{name}</span>
        <span className="text-[13.5px] leading-snug text-page-ink2">{line}</span>
      </span>
      <span className="shrink-0 text-right font-mono text-[11px] text-muted tabular-nums">{right}</span>
      {more && <span className="shrink-0 self-center text-muted">›</span>}
    </span>
  );
}
