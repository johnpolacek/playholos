import { Button } from "@ui-sdk/react/button";
import { ADD, CatalogRow } from "@/components/catalog";
import { KindTag } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { RailNav, RailTab } from "@/components/rail";
import { ListHead, TAB_PAGE, TabHead } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import { BUILDS } from "@/lib/game/plan";
import { PLAN_SOURCES } from "@/lib/game/sources";

// The Build tab before Begin, as the game draws it: its head with the real record and the walk through strategies, the
// Mind's word on our compute, and the Catalog's rows, each with what it opens and the button that queues it. The
// builds and their words are the game's own; how long each would take is a fixed example. 2026-11-15.

const ROWS = [
  { name: "All-Sky Watch", right: "21m" },
  { name: "Thought Fields", right: "48m" },
  { name: "Probe Yard", right: "1h 12m" },
].map((r) => ({ ...r, what: BUILDS.find((b) => b.name === r.name)?.what ?? "" }));

export default function BuildView() {
  return (
    <View code="BD-1" name="Build" parts={["Tab head", "Dialog", "Mind note", "List row", "Build marks", "Button", "Tabs"]}>
      <div className="flex h-[640px] flex-col">
        <div className={TAB_PAGE}>
          <TabHead title="BUILD" sources={PLAN_SOURCES} walk={{ to: "/ui/build", label: "Strategies" }} />
          <MindNote className="mt-1 text-[14.5px] leading-snug">
            Our compute flows to what we build, and a wider stream finishes sooner. What circles us is idle. Pick what we
            start with, and we will say what each one costs.
          </MindNote>
          <ListHead left={`Catalog · ${ROWS.length}`} right="Done in" className="mt-5" />
          <ul className="mt-1">
            {ROWS.map((r) => (
              <CatalogRow
                key={r.name}
                name={r.name}
                tags={<KindTag name={r.name} className="ml-2 align-[2px]" />}
                line={r.what}
                right={r.right}
                action={<Button className={ADD}>Add to Queue</Button>}
              />
            ))}
          </ul>
        </div>
        <RailNav>
          <RailTab to="/ui/build" label="Scan" on={false} />
          <RailTab to="/ui/build" label="Build" on />
          <RailTab to="/ui/build" label="Reach" on={false} />
          <RailTab to="/ui/build" label="Mind" on={false} dot />
        </RailNav>
      </div>
    </View>
  );
}
