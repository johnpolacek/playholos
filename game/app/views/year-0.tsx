import { YearZeroFace } from "@/components/mind-news";
import { View } from "@/app/views/frame";

// Year 0's moment, as the game shows it over everything once Begin is pressed: rings round our point, the date, Year 0,
// the Mind's first words, and Continue. Drawn in place. The Mind's words here are the ones it says when it can't be
// reached, the game's own. 2026-11-15.

export default function YearZeroView() {
  return (
    <View code="Y0-1" name="Year 0" parts={["Mind note", "Button"]}>
      <div className="flex h-[720px] flex-col items-center overflow-y-auto bg-paper px-4 pt-10 pb-8 text-ink">
        <YearZeroFace words="The clock runs now, a Year every five minutes, even while we’re away, and it pauses when nothing is building. What we queued has started. We will tell you as it lands." />
      </div>
    </View>
  );
}
