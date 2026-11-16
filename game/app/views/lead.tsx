import { BackBar } from "@/components/back-bar";
import { Btn } from "@/components/kit/button";
import { LeadArt } from "@/components/lead-art";
import { CouldBe, EngageBar, LeadHead, Measured, ReadingCard, Tells } from "@/components/lead-page";
import { RailNav, RailTab } from "@/components/rail";
import { TAB_PAGE } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import type { Art, Could, Reading } from "@/lib/game/leads";

// A lead's page, as the game draws it: Proxima Centauri's world, its head, the way to engage it, the reading our flyby
// probe sent home, its orbit drawn, what we measured, what it could be and what would tell us. Its mass and orbit are
// measured; the reading is a fixed example of what the game can find. 2026-11-15.

const ART: Art = { kind: "orbit", a: 0.0485, e: 0, hz: [0.042, 0.082] };

const READ: Reading = {
  id: "view-reading",
  needs: "Probe Yard",
  at: 36.4,
  by: "Our flyby probe",
  title: "Seas under thin cloud",
  line: "Its pictures show dark water and bright cloud on the side that always faces its star.",
  mind: "Water at the surface makes life likelier here than at any world we have looked at.",
  now: ["likely", "unlikely"],
  tells: ["A Close Reading of its air would show oxygen, if something breathes there."],
  sight: "seas",
};

const COULD: Could[] = [
  { what: "A rocky world", why: "Most worlds under about 2 Earths are rock. Its tug gives only its least mass.", odds: "roughly even" },
  { what: "A small gas world", why: "Past about 2 Earths, most worlds we know keep thick hydrogen.", odds: "roughly even" },
];

export default function LeadView() {
  return (
    <View code="LD-1" name="Lead" parts={["Back bar", "Lead marks", "Button", "Visit art", "Mind note", "Tabs"]}>
      <div className="flex h-[720px] flex-col">
        <div className={`${TAB_PAGE} pb-4`}>
          <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
            <BackBar to="/ui/lead" label="All leads" />
          </div>
          <LeadHead
            art={ART}
            star="Proxima Centauri"
            line={
              <>
                A world next door · 4.2 ly · reached in <span className="font-mono tabular-nums">21m</span>
              </>
            }
          />
          <EngageBar to="/ui/lead" star="Proxima Centauri" />
          <ReadingCard read={READ} />
          <div className="lcd mt-3 rounded-xl border border-faint bg-paper px-2 py-1">
            <LeadArt art={ART} />
          </div>
          <Measured
            facts={[
              ["Its least mass", "1.07 Earths"],
              ["Its year", "11.2 days"],
              ["Its star", "A red dwarf, a seventh of the Sun’s mass"],
            ]}
          />
          <CouldBe could={COULD} now={READ.now} />
          <Tells tells={READ.tells} />
          <Btn size="page" fill="line" className="mt-6 shrink-0">
            Ask the Mind about it
          </Btn>
        </div>
        <RailNav>
          <RailTab to="/ui/lead" label="Scan" on />
          <RailTab to="/ui/lead" label="Build" on={false} />
          <RailTab to="/ui/lead" label="Reach" on={false} />
          <RailTab to="/ui/lead" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
