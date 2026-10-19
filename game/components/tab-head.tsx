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

/** A list's head: what it holds and how many, and what its right column counts, its edge on the counts' edge, clear
 *  of the rows' ›. */
export function ListHead({
  left,
  right,
  className = "",
  ...rest
}: { left: string; right: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`flex justify-between pr-5 font-mono text-[10px] tracking-[.1em] text-muted uppercase ${className}`}
    >
      <span>{left}</span>
      {/* The tracking trails the last letter, so it hangs out by as much. */}
      <span className="-mr-[.1em]">{right}</span>
    </div>
  );
}

/** A row's face: its mark, its name and line, its count on the right, and a › when it opens a page. */
export function Face({
  mark,
  tone,
  name,
  line,
  right,
  more = true,
}: {
  /** What it is, drawn, from marks.tsx. */
  mark: React.ReactNode;
  /** The mark's color: our blue, theirs, or muted until it's ours. */
  tone: string;
  name: React.ReactNode;
  line: React.ReactNode;
  right: React.ReactNode;
  more?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-3">
      {/* On the name's first line, centered on it. */}
      <span className={`mt-[2px] shrink-0 self-start ${tone}`}>{mark}</span>
      <span className="flex min-w-0 grow flex-col">
        <span className="text-[15px] leading-snug">{name}</span>
        <span className="text-[13.5px] leading-snug text-page-ink2">{line}</span>
      </span>
      <span className="shrink-0 text-right font-mono text-[11px] text-muted tabular-nums">{right}</span>
      {/* As wide as the head leaves clear: 8px, and the 12px gap before it. */}
      {more && <span className="w-2 shrink-0 self-center text-center text-muted">›</span>}
    </span>
  );
}
