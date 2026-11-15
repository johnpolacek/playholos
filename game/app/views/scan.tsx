import { useState } from "react";
import { Choice } from "@/components/kit/choice";
import { Fold } from "@/components/kit/fold";
import { LeadEntry, LeadFace } from "@/components/leads";
import { PathCard, type Stage } from "@/components/path";
import { RailNav, RailTab } from "@/components/rail";
import { ListHead, TAB_PAGE, TabHead } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import type { Art } from "@/lib/game/leads";
import { SCAN_SOURCES } from "@/lib/game/sources";

// Scan at Year 41, as the game draws it: our path's three trails with the next step, the lenses, what needs us, what
// still shines, and the quiet ones folded shut. The leads are a fixed example sky. 2026-11-15.

const STAGES: Stage[] = [
  {
    name: "Find life",
    steps: [
      { label: "Watch for warm glows", at: "done", to: "/ui/scan" },
      { label: "Range each glow", at: "done", to: "/ui/scan" },
      { label: "Read a warm glow’s light", at: "going", to: "/ui/scan" },
      { label: "Send a craft to a glow", at: "todo", to: "/ui/scan" },
      { label: "Find a mind", at: "todo" },
    ],
  },
  {
    name: "Spread",
    steps: [
      { label: "Build the Deuterium Works", at: "done", to: "/ui/scan" },
      { label: "Build the Fusion Drive", at: "going", to: "/ui/scan" },
      { label: "Build the Seed Ship", at: "todo", to: "/ui/scan" },
      { label: "Send our Mind to stay", at: "todo", to: "/ui/scan" },
      { label: "Move the Will there", at: "todo", to: "/ui/scan" },
    ],
  },
  {
    name: "Make contact",
    steps: [
      { label: "Call out to a star", at: "todo", to: "/ui/scan" },
      { label: "Hear an answer", at: "todo" },
    ],
  },
];

const LENSES = [
  { value: "all", label: "All" },
  { value: "minds", label: "Minds" },
  { value: "homes", label: "Homes" },
];

type Row = { star: string; what: string; art: Art; line: React.ReactNode; right: string; warm?: boolean; faded?: boolean; move?: string; bound?: string };

const NEEDS: Row[] = [
  {
    star: "HD 102365",
    what: "a warm glow",
    art: { kind: "warm", near: 28, far: 31 },
    warm: true,
    line: <span className="mt-0.5 block font-medium text-other">Ready for a Close Reading</span>,
    right: "29.6 ly",
    move: "Order a Close Reading",
  },
];
const SHINING: Row[] = [
  { star: "Gliese 667 C", what: "a warm glow", art: { kind: "warm", near: 22, far: 24, shape: "ring" }, warm: true, line: "Still shining, ranged at Year 33.", right: "23.6 ly", bound: "A sentinel" },
  { star: "Tau Ceti", what: "a world in the warm zone", art: { kind: "orbit", a: 1.35, e: 0.45 }, line: "Dusty, and nothing heard.", right: "11.9 ly", move: "Send a flyby probe" },
];
const QUIET: Row[] = [
  { star: "Ross 128", what: "a world in the warm zone", art: { kind: "orbit", a: 1, e: 0 }, line: "Nothing heard in 30 Years.", right: "11.0 ly" },
  { star: "Wolf 1061", what: "a warm glow, faded", art: { kind: "warm", near: 13, far: 15 }, warm: true, faded: true, line: "It faded before we read it.", right: "14.0 ly" },
];

/** A lead as LeadList draws one: the game's own row and entry. */
function Lead({ r }: { r: Row }) {
  return (
    <li className="border-t border-faint">
      <LeadEntry
        to="/ui/scan"
        face={<LeadFace art={r.art} star={r.star} what={r.what} warm={r.warm} faded={r.faded} line={r.line} right={r.right} />}
        bound={r.bound}
        move={r.move ? { to: "/ui/scan", label: r.move } : null}
      />
    </li>
  );
}

export default function ScanView() {
  const [lens, setLens] = useState("all");
  const [quiet, setQuiet] = useState(false);
  return (
    <View code="SC-1" name="Scan" parts={["Tab head", "Dialog", "Collapsible", "Choice", "List row", "Lead marks", "Fold", "Tabs"]}>
      <div className="flex h-[720px] flex-col">
        <div className={`${TAB_PAGE} pb-4`}>
          <TabHead title="SCAN" sources={SCAN_SOURCES} walk={{ to: "/ui/scan", label: "Review" }} />
          <PathCard stages={STAGES} next={STAGES[0].steps[2]} />
          <Choice look="lens" label="What we look for" value={lens} onChange={setLens} options={LENSES} className="mt-4" />
          <ListHead left={`Needs us · ${NEEDS.length}`} right="Reached in" className="mt-4" />
          <ul className="mt-1">
            {NEEDS.map((r) => (
              <Lead key={r.star} r={r} />
            ))}
          </ul>
          <ListHead left={`Warm glows, still shining · ${SHINING.length}`} right="" className="mt-5" />
          <ul className="mt-1">
            {SHINING.map((r) => (
              <Lead key={r.star} r={r} />
            ))}
          </ul>
          <Fold label={`Quiet · ${QUIET.length}`} open={quiet} onOpenChange={setQuiet} shut="Nothing for us to do at these yet.">
            {QUIET.map((r) => (
              <Lead key={r.star} r={r} />
            ))}
          </Fold>
        </div>
        <RailNav>
          <RailTab to="/ui/scan" label="Scan" on />
          <RailTab to="/ui/scan" label="Build" on={false} />
          <RailTab to="/ui/scan" label="Reach" on={false} />
          <RailTab to="/ui/scan" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
