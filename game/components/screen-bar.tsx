import { Replay } from "@/components/icons";
import { Sources } from "@/components/sources";
import { prefersReducedMotion } from "@/lib/motion";
import type { Source } from "@/lib/game/sources";

// The top of every screen before the shell: the real record on the left, when the screen has one. It enters with the
// screen's kicker and leaves with the screen. A screen's own control, as Replay, sits on the right.
export function ScreenBar({ sources, tool }: { sources?: Source[]; tool?: React.ReactNode }) {
  return (
    <div className="relative flex h-12 shrink-0 items-center">
      {sources && <Sources sources={sources} />}
      {tool && <div className="ml-auto">{tool}</div>}
    </div>
  );
}

/** Replay, for a screen's top right: the opening again, from Earth waking. It enters with the screen's kicker. Hidden
 *  with reduced motion. Its own tap never hurries the screen's intro. 2026-11-01. */
export function ReplayButton({ onReplay }: { onReplay(): void }) {
  if (prefersReducedMotion()) return null;
  return (
    <button
      data-m="kick"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onReplay}
      aria-label="Replay"
      className="-mr-2 flex h-8 items-center gap-1.5 rounded-full px-2 font-mono text-[10px] tracking-[.1em] text-muted transition-colors hover:text-ink"
    >
      <span className="hidden wide:inline">REPLAY</span>
      <Replay size={13} />
    </button>
  );
}
