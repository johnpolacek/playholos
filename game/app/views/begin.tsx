import { StepsList } from "@/components/begin";
import { SHEET_LOOK, SheetHead } from "@/components/sheet";
import { View } from "@/app/views/frame";

// Begin's steps, as the game opens them over the play screen: the sheet's head, the thread of steps down to Year 0,
// two done and the next calling, the Mind's word, and the way on. Drawn in place here, with the dim the game lays
// behind it. The steps' words are the game's own; which are done is a fixed example. 2026-11-15.

const STEPS = [
  { name: "Review our scans", line: "The few things in our sky we can’t explain yet, one at a time.", to: "/ui/begin" },
  { name: "Pick our strategy", line: "Search, Protect, Expand or Balanced. Each puts all our compute to work at Year 0.", to: "/ui/begin" },
  { name: "Learn how we reach", line: "How far we have gone, and the two roads to the nearest star.", to: "/ui/begin" },
  { name: "Ask the Mind", line: "It advises, and never acts on its own advice.", to: "/ui/begin" },
];

export default function BeginView() {
  return (
    <View code="BG-1" name="Begin" parts={["Sheet", "Mind note", "Button"]}>
      <div className="relative flex h-[720px] flex-col justify-end bg-panel">
        <div aria-hidden className="absolute inset-0 bg-black/55" />
        <section className={`${SHEET_LOOK} relative`}>
          <SheetHead kicker="YEAR 0 · 2 OF 4 STEPS DONE" title="Before we begin" />
          <StepsList steps={STEPS} done={[true, true, false, false]} onLeave={() => {}} onBegin={() => {}} />
        </section>
      </div>
    </View>
  );
}
