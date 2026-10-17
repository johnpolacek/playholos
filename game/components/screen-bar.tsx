import { Sources } from "@/components/sources";
import type { Source } from "@/lib/game/sources";

// The top of every screen before the shell: the real record on the left, when the screen has one. It enters with the
// screen's kicker and leaves with the screen.
export function ScreenBar({ sources }: { sources?: Source[] }) {
  return <div className="relative flex h-12 shrink-0 items-center">{sources && <Sources sources={sources} />}</div>;
}
