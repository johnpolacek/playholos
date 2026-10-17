import { Sources } from "@/components/sources";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Source } from "@/lib/game/sources";

// The top of every screen before the shell: the real record on the left, when the screen has one, and the theme on
// the right. Both enter with the screen's kicker and leave with the screen.
export function ScreenBar({ sources }: { sources?: Source[] }) {
  return (
    <div className="relative flex h-12 shrink-0 items-center">
      {sources && <Sources sources={sources} />}
      <ThemeToggle staged className="pt-2.5" />
    </div>
  );
}
