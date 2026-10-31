import { useEffect, useMemo } from "react";
import { useGame } from "@/components/game-provider";
import { useSchedule } from "@/components/picks";
import { tenths, YEAR_0 } from "@/lib/game/clock";
import { colonyOf, scarOf, survivorAt } from "@/lib/game/hits";
import { setScars } from "@/lib/scars";
import { target } from "@/lib/game/sends";

// When a strike ends Earth's Mind: from 10⁸ Mt no Mind of ours lives on Earth. If a vault or our colony stands by then,
// the Will crosses to it as a transfer, a Year for each light-year, and play goes on there. If none does, the game is
// over. HOLOS_GAME_CONCEPT.md's Death and new games, built 2026-10-28.
export function Fate() {
  const { save, year, moveWill, newGame } = useGame();
  const { hits, done, scale } = useSchedule();
  const end = hits.find((h) => h.harm.ends);
  const plan = save?.plan;
  const colony = useMemo(() => (plan ? colonyOf(plan, scale, (n) => target(n)?.d) : null), [plan, scale]);
  const lives = end ? survivorAt(done, end.lands, colony) : null;
  const will = save?.will;
  // Every strike that landed, a flash and a scar on the globe, on every screen that shows it.
  const scars = useMemo(() => hits.map(scarOf), [hits]);
  useEffect(() => void setScars(scars, YEAR_0 + (year ?? 0)), [scars, year]);
  useEffect(() => {
    if (end && lives && !will) moveWill({ hole: lives.name, d: lives.d, y: end.lands, at: end.lands + lives.d, rate: 1, lost: true });
  }, [end, lives, will, moveWill]);
  // A tenth of a Year, half a minute of play, to see the flash before the end.
  if (!end || lives || year === null || year < end.lands + 0.1) return null;
  return (
    <div role="dialog" aria-modal aria-label="The game is over" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper px-4">
      <p className="font-mono text-[11px] tracking-[.14em] text-muted">YEAR {tenths(end.lands)}</p>
      <h1 className="mt-2 text-center text-[22px] leading-snug font-medium">No Mind of ours survives</h1>
      <p className="mt-3 max-w-[36ch] text-center text-[14px] leading-snug text-page-ink2">
        {end.from === "a rock" ? "A rock" : `A bullet from ${end.from}`} struck Earth with about {Math.round(end.mt).toLocaleString("en-US")} Mt. No vault and no colony stood to carry us on.
      </p>
      <button onClick={newGame} className="mt-6 h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper">
        New game
      </button>
    </div>
  );
}
