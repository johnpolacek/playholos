import { Button } from "@ui-sdk/react/button";
import { useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { yearText } from "@/lib/game/clock";
import { buildSlug } from "@/lib/game/plan";
import { inOrder } from "@/lib/game/reach";
import type { Plan } from "@/lib/game/types";
import { CLOSE_FLIGHT, flightTo, TAKE_BUILD, WRECK_FLIGHT, type WatcherSeen } from "@/lib/sim/minds";

// What we can do to the watcher, once we have found it where a craft can reach it: take it whole and bring it home, to
// study, 2026-11-14, or wreck it, our one weapon, 2026-11-13. Either blinds it, and its maker learns a light-time later
// and answers by its own nature. Found only by its laser, both wait for our Close Look to place it. Once given, an
// order stands: a tap asks again before it is given. lib/sim/ladder.ts plays what follows.

export function WatcherCards({ w }: { w: WatcherSeen }) {
  if (w.by === "its warning" && !w.looked) return null;
  return (
    <>
      <TakeCard w={w} />
      <WreckCard w={w} />
    </>
  );
}

/** The two-tap order button both cards share: a tap asks, a second gives it. */
function Order({ label, sure: yes, tone, give, note }: { label: string; sure: string; tone: string; give: () => void; note: string }) {
  const [sure, setSure] = useState(false);
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      <Button
        onClick={() => {
          if (!sure) return setSure(true);
          give();
          setSure(false);
        }}
        className={`h-9 rounded-full px-4 text-[14px] font-medium text-paper ${tone}`}
      >
        {sure ? yes : label}
      </Button>
      {sure && (
        <Button onClick={() => setSure(false)} className="h-9 rounded-full border border-ink px-4 text-[14px]">
          Not now
        </Button>
      )}
      <span className="text-[12.5px] text-muted">{note}</span>
    </div>
  );
}

const flights = { moon: "about 4 months, to the Moon’s L4 or L5", sun: "about 13 months, out to the Sun–Earth L4 or L5", rock: "about a Year, to the rock it rides" };

/** Take it whole, by a craft of our Close Look's class with a soft bag, and bring it home to study. */
function TakeCard({ w }: { w: WatcherSeen }) {
  const { plan, change } = usePlan();
  const { orderAt } = useGame();
  const now = orderAt ?? 0;
  const flight = CLOSE_FLIGHT[flightTo(w)];
  const reaches = plan.take != null && w.looked ? Math.max(plan.take, w.looked.at) + TAKE_BUILD + flight : null;
  return (
    <section data-m className="mt-5 rounded-xl border border-you/60 px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Bring it home</h2>
        <span className="font-mono text-[9px] tracking-[.1em] text-you uppercase">Study</span>
      </div>
      <p className="mt-1 text-[13.5px] leading-snug text-page-ink2">
        A craft of our Close Look’s class, with a soft bag and the fuel to come back, 2 Years to build. It flies {flights[flightTo(w)]}, takes the
        watcher whole, and flies home the same way. In our lab, its skin would tell us how long it has sat in space, and what it is made of. But it
        blinds the watcher as surely as a wreck: whoever sent it will know a light-time later, and may answer the same way.
      </p>
      {w.taken ? (
        <p className="mt-2 text-[13.5px] font-medium text-you">
          Taken at Year {yearText(w.taken.at)}. {w.taken.back ? `Home at Year ${yearText(w.taken.home)}.` : `Home about Year ${yearText(w.taken.home)}.`}
        </p>
      ) : w.wrecked !== undefined ? (
        <p className="mt-2 text-[13.5px] text-muted">We wrecked it. Nothing is left to take.</p>
      ) : plan.take != null ? (
        <p className="mt-2 text-[13.5px] leading-snug text-you">
          Ordered at Year {yearText(plan.take)}.{" "}
          {reaches !== null ? `It reaches it about Year ${yearText(reaches)}, and is home about Year ${yearText(reaches + flight)}.` : "It is built once our Close Look has seen it."}
        </p>
      ) : !w.looked ? (
        <Link to={`/play/build/${buildSlug("Close Look")}`} className="mt-2 inline-block text-[13px] text-you hover:underline">
          Needs our Close Look to see it first ›
        </Link>
      ) : plan.wreck != null ? (
        <p className="mt-2 text-[13.5px] text-muted">We ordered it wrecked instead.</p>
      ) : (
        <Order
          label="Bring the watcher home"
          sure="Yes, bring it home"
          tone="bg-you"
          give={() => change((p: Plan) => ({ ...p, take: now }))}
          note={`It reaches it about Year ${yearText(now + TAKE_BUILD + flight)}.`}
        />
      )}
    </section>
  );
}

/** Our one weapon: one of our Interceptor's kill vehicles flies to it and hits it. */
function WreckCard({ w }: { w: WatcherSeen }) {
  const { plan, change } = usePlan();
  const { done } = useSchedule();
  const { orderAt } = useGame();
  const ready = done["Interceptor"] ?? null;
  const at = flightTo(w);
  const flight = WRECK_FLIGHT[at];
  const flies = { moon: "about 3 days, to the Moon’s L4 or L5", sun: "about 13 months, out to the Sun–Earth L4 or L5", rock: "about a Year, to the rock it rides" }[at];
  const now = orderAt ?? 0;
  const hits = plan.wreck != null && ready !== null ? Math.max(plan.wreck, ready) + flight : null;

  return (
    <section data-m className="mt-3 rounded-xl border border-attack/60 px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Wreck it</h2>
        <span className="font-mono text-[9px] tracking-[.1em] text-attack uppercase">Attack</span>
      </div>
      <p className="mt-1 text-[13.5px] leading-snug text-page-ink2">
        A weapon. One of our Interceptor’s kill vehicles flies {flies}, and hits it. Then it sees nothing we do, our next seed included.
        But whoever sent it will know a light-time later that its watcher went dark. A mind that wishes us ill may treat us as if we had
        spread. A calmer one may send another, hidden better. We can’t tell which ours is, and it can’t be undone.
      </p>
      {w.wrecked !== undefined ? (
        <p className="mt-2 text-[13.5px] font-medium text-attack">Wrecked at Year {yearText(w.wrecked)}.</p>
      ) : w.taken ? (
        <p className="mt-2 text-[13.5px] text-muted">We took it whole. Nothing is left there to hit.</p>
      ) : plan.wreck != null ? (
        <p className="mt-2 text-[13.5px] leading-snug text-attack">
          Ordered at Year {yearText(plan.wreck)}.{" "}
          {hits !== null ? `It hits about Year ${yearText(hits)}.` : "It flies once the Interceptor stands."}
        </p>
      ) : plan.take != null ? (
        <p className="mt-2 text-[13.5px] text-muted">We ordered it brought home instead.</p>
      ) : !inOrder(plan, "Interceptor") ? (
        <Link to={`/play/build/${buildSlug("Interceptor")}`} className="mt-2 inline-block text-[13px] text-you hover:underline">
          Needs the Interceptor ›
        </Link>
      ) : (
        <Order
          label="Wreck the watcher"
          sure="Yes, wreck it"
          tone="bg-attack"
          give={() => change((p: Plan) => ({ ...p, wreck: now }))}
          note={ready === null ? "Flies once the Interceptor stands." : ready > now ? `Flies once the Interceptor stands, Year ${yearText(ready)}.` : "Flies now."}
        />
      )}
    </section>
  );
}
