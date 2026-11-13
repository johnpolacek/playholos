import { useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { yearText } from "@/lib/game/clock";
import { buildSlug } from "@/lib/game/plan";
import { inOrder } from "@/lib/game/reach";
import { WRECK_FLIGHT } from "@/lib/sim/minds";

// Our one weapon of attack, 2026-11-13, the designer's pick: wreck the watcher, once we have found it where a craft can
// reach it. One of our Interceptor's kill vehicles flies to it and hits it. From then it sees nothing of us, and its
// maker learns a light-time later and answers by its own nature. Said as a weapon, as the Strike Yard once was. Once
// given, the order stands: a tap asks again before it is given. lib/sim/ladder.ts plays what follows.

export function WreckCard({ where }: { where: "moon" | "co-orbital" }) {
  const { plan, change } = usePlan();
  const { done } = useSchedule();
  const { orderAt } = useGame();
  const { minds } = useLeads();
  const [sure, setSure] = useState(false);
  const wrecked = minds?.watcher?.wrecked;
  const ready = done["Interceptor"] ?? null;
  const flight = where === "moon" ? WRECK_FLIGHT.moon : WRECK_FLIGHT.rock;
  const flies = where === "moon" ? "about 3 days, to the Moon’s L4 or L5" : "about a Year, to the rock it rides";
  const now = orderAt ?? 0;
  const hits = plan.wreck != null && ready !== null ? Math.max(plan.wreck, ready) + flight : null;

  return (
    <section data-m className="mt-5 rounded-xl border border-attack/60 px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Wreck it</h2>
        <span className="font-mono text-[9px] tracking-[.1em] text-attack uppercase">Attack</span>
      </div>
      <p className="mt-1 text-[13.5px] leading-snug text-page-ink2">
        A weapon. One of our Interceptor’s kill vehicles flies {flies}, and hits it. Then it sees nothing we do, our next seed included.
        But whoever sent it will know a light-time later that its watcher went dark. A mind that wishes us ill may treat us as if we had
        spread. A calmer one may send another, hidden better. We can’t tell which ours is, and it can’t be undone.
      </p>
      {wrecked !== undefined ? (
        <p className="mt-2 text-[13.5px] font-medium text-attack">Wrecked at Year {yearText(wrecked)}.</p>
      ) : plan.wreck != null ? (
        <p className="mt-2 text-[13.5px] leading-snug text-attack">
          Ordered at Year {yearText(plan.wreck)}.{" "}
          {hits !== null ? `It hits about Year ${yearText(hits)}.` : "It flies once the Interceptor stands."}
        </p>
      ) : !inOrder(plan, "Interceptor") ? (
        <Link to={`/play/build/${buildSlug("Interceptor")}`} className="mt-2 inline-block text-[13px] text-you hover:underline">
          Needs the Interceptor ›
        </Link>
      ) : (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (!sure) return setSure(true);
              change((p) => ({ ...p, wreck: now }));
              setSure(false);
            }}
            className="h-9 rounded-full bg-attack px-4 text-[14px] font-medium text-paper"
          >
            {sure ? "Yes, wreck it" : "Wreck the watcher"}
          </button>
          {sure && (
            <button onClick={() => setSure(false)} className="h-9 rounded-full border border-ink px-4 text-[14px]">
              Not now
            </button>
          )}
          <span className="text-[12.5px] text-muted">
            {ready === null ? "Flies once the Interceptor stands." : ready > now ? `Flies once the Interceptor stands, Year ${yearText(ready)}.` : "Flies now."}
          </span>
        </div>
      )}
    </section>
  );
}
