import { useState } from "react";
import { BackBar } from "@/components/back-bar";
import { KnownCard, MessageCard, WayRow } from "@/components/destination";
import { Btn } from "@/components/kit/button";
import { LeadArt } from "@/components/lead-art";
import { LeadHead } from "@/components/lead-page";
import { RailNav, RailTab } from "@/components/rail";
import { ListHead, TAB_PAGE } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import type { Art } from "@/lib/game/leads";
import type { Road } from "@/lib/game/reach";

// A destination's page, as the game draws it: Proxima Centauri, what we know of it, a message first, and the ways to
// engage it by sail and by flyby probe, each drawn on its Years. 4.24 light-years, a fifth and a tenth of light's
// speed; the Years they leave are a fixed example. 2026-11-15.

const LY = 4.24;
const ART: Art = { kind: "orbit", a: 0.0485, e: 0, hz: [0.042, 0.082] };

const road = (name: string, build: string, craft: string, speed: number, leaves: number): Road => {
  const arrives = leaves + LY / speed;
  return { name, n: null, build, craft, speed, done: leaves, leaves, arrives, home: arrives + LY };
};
const WAYS = [
  { road: road("Send a sail", "Laser Sail Array", "A sail", 0.2, 13.6), what: "Sail", line: "A gram of chips on a sail, pushed by a laser from Earth to a fifth of light’s speed. It flies past." },
  { road: road("Send a flyby probe", "Probe Yard", "A flyby probe", 0.1, 17.9), what: "Probe", line: "A probe with a camera and a dish, a tenth of light’s speed. It flies past in minutes and sends its pictures home." },
];

export default function DestinationView() {
  const [shown, setShown] = useState<string | null>(null);
  const [queued, setQueued] = useState<string[]>(["Laser Sail Array"]);
  return (
    <View code="DS-1" name="Destination" parts={["Back bar", "Lead marks", "Toggle", "List row", "Build marks", "Button", "Tabs"]}>
      <div className="flex h-[720px] flex-col">
        <div className={`${TAB_PAGE} pb-4`}>
          <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
            <BackBar to="/ui/destination" label="All destinations" />
          </div>
          <LeadHead
            plain
            art={ART}
            star="Proxima Centauri"
            line={
              <>
                A world next door · {LY} ly · a message takes <span className="font-mono tabular-nums">21m</span> ·{" "}
                <span className="whitespace-nowrap text-you">Its lead ›</span>
              </>
            }
          />
          <KnownCard
            line="A world in its star’s warm zone. Its air is unread."
            art={<LeadArt art={ART} />}
            facts={[
              ["Its least mass", "1.07 Earths"],
              ["Its year", "11.2 days"],
            ]}
          />
          <MessageCard to="/ui/destination" />
          <ListHead left={`Ways to engage · ${WAYS.length}`} right="Passes" className="mt-5" />
          <ul className="mt-1">
            {WAYS.map((w, i) => (
              <WayRow
                key={w.what}
                now={0}
                road={w.road}
                i={i}
                to={70}
                name={w.road.name}
                line={w.line}
                needs={[w.road.build]}
                have={(n) => ({ queued: queued.includes(n), done: false })}
                can={false}
                send={() => {}}
                what={w.what}
                right={`Year ${w.road.arrives!.toFixed(1)}`}
                previewing={shown === w.what}
                preview={(on) => setShown(on ? w.what : null)}
                extra={
                  <Btn
                    fill={queued.includes(w.road.build) ? "line" : "solid"}
                    onClick={() => setQueued(queued.includes(w.road.build) ? queued.filter((q) => q !== w.road.build) : [...queued, w.road.build])}
                    className="shrink-0"
                  >
                    {queued.includes(w.road.build) ? "Queued" : "Add to Queue"}
                  </Btn>
                }
              />
            ))}
          </ul>
        </div>
        <RailNav>
          <RailTab to="/ui/destination" label="Scan" on={false} />
          <RailTab to="/ui/destination" label="Build" on={false} />
          <RailTab to="/ui/destination" label="Reach" on />
          <RailTab to="/ui/destination" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
