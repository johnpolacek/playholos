import type { Row } from "@/components/journey";
import { ConeLanes, laneOfBuild, useConePick } from "@/components/light-cone";
import { RailNav, RailTab } from "@/components/rail";
import { TAB_PAGE, TabHead } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import { BUILDS } from "@/lib/game/plan";
import { PLAN_SOURCES } from "@/lib/game/sources";

// The build queue in the Light cone layout, 2026-11-15: each build a lane from the Year we ordered it to the Year it is
// done, as the queue's own rows have them. The builds and their words are the game's own. The Years are a fixed
// example, and the last has no Year yet, so its bar is left open.

const ROWS: Row[] = (
  [
    ["All-Sky Watch", 0, 4.2],
    ["Thought Fields", 0, 13.8],
    ["Laser Sail Array", 2, 13.6],
    ["Probe Yard", 8, 28],
    ["Deuterium Works", 20, 36],
    ["Fusion Drive", 26, null],
  ] as const
).map(([name, from, at]) => ({ key: name, name, note: BUILDS.find((b) => b.name === name)?.what ?? "", from, at, kind: "build" }));

const END = 60;

export default function ConeBuildView() {
  const pick = useConePick();
  return (
    <View code="LC-3" name="Light cone · Build" wide parts={["Tab head", "Scrub", "Lanes", "Events", "Tooltip", "Build marks", "Tabs"]}>
      <div className="flex min-h-[520px] flex-col">
        <div className={`${TAB_PAGE} pb-5`}>
          <TabHead title="BUILD · LIGHT CONE" sources={PLAN_SOURCES} />
          <ConeLanes
            className="mt-3"
            label="Our builds, on their Years"
            head={`Queue · ${ROWS.length}`}
            range={[0, END]}
            start={20}
            lanes={() => ROWS.map((r) => laneOfBuild(r, END, pick(r.key)))}
          />
        </div>
        <RailNav>
          <RailTab to="/ui/cone-build" label="Scan" on={false} />
          <RailTab to="/ui/cone-build" label="Build" on />
          <RailTab to="/ui/cone-build" label="Reach" on={false} />
          <RailTab to="/ui/cone-build" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
