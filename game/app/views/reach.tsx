import { useState } from "react";
import { Item, type Row } from "@/components/journey";
import type { Aim } from "@/components/picks";
import { Fleet, PlaceRow, SENT } from "@/components/reach";
import { RailNav, RailTab } from "@/components/rail";
import { ListHead, TAB_PAGE, TabHead } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import { REACH_SOURCES } from "@/lib/game/sources";

// Reach at Year 41, as the game draws it: our craft, each a row we can aim the map at, two sentinels folded into one
// fleet, Voyager 1 still going, and where we could go next. The craft and their Years are a fixed example. 2026-11-15.

const PROBE: Row = {
  key: "Probe Yard",
  name: "A flyby probe to Tau Ceti",
  note: "Past it in minutes, at a tenth of light’s speed. Its word comes home after.",
  at: 165,
  kind: "flight",
  from: 38,
};

const SENTINELS: Row[] = [
  { key: "Probe Yard", name: "A sentinel to Gliese 667 C", note: "Slows to stay, and watches the glow for us.", at: 312, kind: "flight", from: 40 },
  { key: "Probe Yard", name: "A sentinel to HD 102365", note: "Leaves once the Deuterium Works has made its fuel.", at: 389, kind: "flight", from: 41 },
];

const PLACES = [
  { star: "Proxima Centauri", art: { kind: "orbit", a: 1, e: 0 }, line: "A world next door · 4.2 ly", right: "Year 84.0" },
  { star: "Tau Ceti", art: { kind: "orbit", a: 1.35, e: 0.45 }, line: "A world in the warm zone · 11.9 ly", right: "On its way, Year 165" },
  { star: "Gliese 667 C", art: { kind: "warm", near: 22, far: 24, shape: "ring" }, line: "A warm glow · 23.6 ly", right: "On its way, Year 312" },
] as const;

/** An aim the view keeps itself: pressed and lit together, as the map would show it. */
function useAim(): Aim {
  const [shown, setShown] = useState(false);
  return { shown, lit: shown, toggle: () => setShown(!shown), point: () => {} };
}

export default function ReachView() {
  const probe = useAim();
  const voyager = useAim();
  return (
    <View code="RC-1" name="Reach" parts={["Tab head", "Dialog", "Toggle", "Collapsible", "List row", "Build marks", "Lead marks", "Tabs"]}>
      <div className="flex h-[720px] flex-col">
        <div className={`${TAB_PAGE} pb-4`}>
          <TabHead title="REACH" sources={REACH_SOURCES} walk={{ to: "/ui/reach", label: "How we reach" }} />
          <ListHead left="Craft · 4" right="Word home" className="mt-4" />
          <ul className="mt-1">
            <Item row={PROBE} now={41} began aim={probe} />
            <Fleet title="Sentinels" build="Probe Yard" rows={SENTINELS.map((r, i) => ({ id: String(i), leaves: r.from!, home: r.at! }))} now={41}>
              <ul className="mb-1 pl-7">
                {SENTINELS.map((r) => (
                  <Item key={r.name} row={r} now={41} began />
                ))}
              </ul>
            </Fleet>
            <Item row={SENT} now={41} began aim={voyager} />
          </ul>
          <ListHead left={`Destinations · ${PLACES.length}`} right="Soonest" className="mt-5" />
          <ul className="mt-1">
            {PLACES.map((p) => (
              <PlaceRow key={p.star} to="/ui/reach" art={p.art} star={p.star} line={p.line} right={p.right} />
            ))}
          </ul>
        </div>
        <RailNav>
          <RailTab to="/ui/reach" label="Scan" on={false} />
          <RailTab to="/ui/reach" label="Build" on={false} />
          <RailTab to="/ui/reach" label="Reach" on />
          <RailTab to="/ui/reach" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
