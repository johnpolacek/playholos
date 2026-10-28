import { useEffect, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { readMindPick } from "@/lib/access";

// Our dishes listening at every star we sent to. Each tenth of a Year it asks the server whether a neighbor has taken
// one of ours, or another's news, or found another's glow: the neighbors play on without us, 2026-10-26. The server knows who lives where, and
// asks the model only for a message that has landed on someone. What comes back is kept in the save, decided for good.
// Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's What Earth sends.

const PICK = "holos:mind-pick";
const pick = () => {
  try {
    return readMindPick(JSON.parse(localStorage.getItem(PICK) ?? "null"));
  } catch {
    return readMindPick(null);
  }
};

export function Listening() {
  const { save, year, addReactions } = useGame();
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  const asking = useRef(false);
  const plan = save?.plan;
  // From Year 0: neighbors find each other's glows with no message of ours, so the server is asked from the start.
  // When nothing has landed it answers at once, with no model asked.
  const first = 0;
  useEffect(() => {
    if (!save || tenth === null || tenth < first || asking.current) return;
    asking.current = true;
    fetch("/api/react", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        seed: save.seed, beganAt: save.beganAt, sent: save.sent, reactions: save.reactions ?? [], pick: pick(),
        builds: plan?.builds ?? [], observe: plan?.observe ?? [], later: plan?.later ?? [], stops: plan?.stops ?? [],
        gifts: plan?.gifts ?? [], sentinels: plan?.sentinels ?? [], colony: plan?.colony ?? null, will: save.will ?? null,
        pickets: plan?.pickets ?? [], strikes: plan?.strikes ?? [], charter: save.charter ?? null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.reactions?.length && addReactions(d.reactions))
      .catch(() => {})
      .finally(() => (asking.current = false));
    // Once a tenth of a Year, not on every change to the save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenth, first]);
  return null;
}
