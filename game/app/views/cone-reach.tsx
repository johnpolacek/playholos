import { ConeLanes, coneEnd, laneOfRoad, useConePick } from "@/components/light-cone";
import { RailNav, RailTab } from "@/components/rail";
import { TAB_PAGE, TabHead } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import type { Road } from "@/lib/game/reach";
import { REACH_SOURCES } from "@/lib/game/sources";
import { flybyYears, sailYears, sentinelYears } from "@/lib/sim/speeds";

// Reach in the Light cone layout, 2026-11-15: our craft as lanes on one axis of Years. Each is built, leaves, arrives,
// and its word comes home at light's speed, with the light that left with it drawn under its flight. The stars and
// their distances are real, each flight's Years come from lib/sim/speeds.ts, and the Years they are ordered, built and
// leave are a fixed example.

const road = (name: string, build: string, craft: string, ly: number, flies: number, done: number, leaves: number): Road => {
  const arrives = leaves + flies;
  // Its word comes home at light's speed: a light-year a Year.
  return { name, n: null, build, craft, speed: 0, done, leaves, arrives, home: arrives + ly };
};

const CRAFT = [
  { id: "sail", name: "Sails, Proxima Centauri", ordered: 2, road: road("Send a sail", "Laser Sail Array", "Sails", 4.24, sailYears(4.24), 13.6, 13.6) },
  { id: "probe", name: "A flyby probe, Tau Ceti", ordered: 8, road: road("Send a flyby probe", "Probe Yard", "A flyby probe", 11.9, flybyYears(11.9), 28, 38) },
  { id: "s1", name: "A sentinel, Gliese 667 C", ordered: 22, road: road("Send a sentinel", "Probe Yard", "A sentinel", 23.6, sentinelYears(23.6, "Gliese 667 C"), 34, 40) },
  { id: "s2", name: "A sentinel, HD 102365", ordered: 26, road: { ...road("Send a sentinel", "Probe Yard", "A sentinel", 29.6, sentinelYears(29.6, "HD 102365"), 36, 52), fuelWait: { built: 36, fuel: "deuterium" as const } } },
];

const END = coneEnd(Math.max(...CRAFT.map((c) => c.road.home!)));

export default function ConeReachView() {
  const pick = useConePick();
  return (
    <View code="LC-1" name="Light cone · Reach" wide parts={["Tab head", "Scrub", "Lanes", "Events", "Tooltip", "Build marks", "Tabs"]}>
      <div className="flex min-h-[560px] flex-col">
        <div className={`${TAB_PAGE} pb-5`}>
          <TabHead title="REACH · LIGHT CONE" sources={REACH_SOURCES} />
          <ConeLanes
            className="mt-3"
            label="Our craft, on their Years"
            head={`Craft · ${CRAFT.length}`}
            range={[0, END]}
            start={41}
            lanes={(now) => CRAFT.flatMap((c) => laneOfRoad(c.id, c.name, c.road, { ordered: c.ordered, aim: pick(c.id), now }) ?? [])}
          />
        </div>
        <RailNav>
          <RailTab to="/ui/cone-reach" label="Scan" on={false} />
          <RailTab to="/ui/cone-reach" label="Build" on={false} />
          <RailTab to="/ui/cone-reach" label="Reach" on />
          <RailTab to="/ui/cone-reach" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
