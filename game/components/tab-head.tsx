import { Link } from "react-router";
import { Sources } from "@/components/sources";
import type { Source } from "@/lib/game/sources";

// A tab's head, with the link that walks us through the tab with the Mind, and the pieces Scan, Build and Reach share
// below it, so they read alike: a list's head, and a row's face.

/** A tab's name, and on the right its state, or the ⓘ that opens the real record behind it, with a walk through the
 *  tab beside it, open at any time. */
export function TabHead({
  title,
  right,
  sources,
  walk,
  tool,
}: {
  title: string;
  right?: string;
  /** A button of the tab's own, on the far right. */
  tool?: React.ReactNode;
  sources?: Source[];
  walk?: { to: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between pt-1 pb-1.5 text-[11px] tracking-[.08em] text-muted">
      <span>{title}</span>
      {right && <span className="font-mono">{right}</span>}
      {tool && <span className="-my-2.5 -mr-2.5 flex items-center">{tool}</span>}
      {(sources || walk) && (
        <span className="-my-2.5 -mr-2.5 flex items-center justify-end">
          {walk && (
            <Link
              to={walk.to}
              className="px-2 py-2.5 font-mono text-[10.5px] tracking-[.06em] text-you uppercase hover:underline"
            >
              {walk.label}
            </Link>
          )}
          {sources && <Sources sources={sources} />}
        </span>
      )}
    </div>
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
