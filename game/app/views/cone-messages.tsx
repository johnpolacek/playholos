import { Events, type Happens } from "@/components/kit/events";
import { ConeLanes, coneEnd, coneYear, laneOfBeam, laneOfHeard, laneOfSent, useConePick } from "@/components/light-cone";
import { RailNav, RailTab } from "@/components/rail";
import { ListHead, TAB_PAGE, TabHead } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import { YEAR_0 } from "@/lib/game/clock";
import { KNOCKS } from "@/lib/game/knocks";
import { SCAN_SOURCES } from "@/lib/game/sources";
import type { Sent } from "@/lib/game/types";

// Messages in the Light cone layout, 2026-11-15: what we sent and what we heard as lanes of light on one axis of Years.
// The axis starts before Year 0, since our first messages left decades ago and are still on their way. The four old
// messages are real, from lib/game/knocks.ts. The two sent in play, the signal heard and the news are a fixed example.

const OLD = [0, 9, 12, 13].map((i) => {
  const [name, sent, star, ly] = KNOCKS[i];
  return { key: `${name}:${star}`, name, star, sent, ly, reply: true };
});

const SENT: Sent[] = [
  { id: "m1", y: 12, to: "Tau Ceti", d: 11.9, asked: "", travels: "We are here, round a yellow star.", holds: ["words"], size: "page" },
  { id: "m2", y: 30, to: "everywhere", reach: 20, repeat: true, asked: "", travels: "We count, we draw, and we listen.", holds: ["words", "pictures"], size: "page" },
];

const HEARD = { key: "heard", star: "HD 102365", at: 36, ly: 29.6 };

const START = Math.floor(Math.min(...OLD.map((o) => o.sent)) - YEAR_0);
// Far enough on to hold what we send in play, and an answer to it.
const END = coneEnd(Math.max(60, ...OLD.map((o) => o.sent - YEAR_0 + 2 * o.ly)));

// Readings and news, as they reached us: each is the Year its light got here, never the Year it happened there.
const NEWS: Happens[] = [
  { key: "n1", at: 6.2, title: "A warm glow ranged", line: "HD 102365, 29.6 light-years. Its light left there before Year 0.", tone: "var(--see)" },
  { key: "n2", at: 23.9, title: "Our message lands at Tau Ceti", line: "We can’t see it land. We know light’s pace.", tone: "var(--you)" },
  { key: "n3", at: 36, title: "A signal heard", line: "From HD 102365. It left there near 2046.", tone: "var(--other)" },
  { key: "n4", at: 47.9, title: "The soonest an answer from Tau Ceti", line: "If they answer the day our message lands.", tone: "var(--wait)" },
];

export default function ConeMessagesView() {
  const pick = useConePick();
  return (
    <View code="LC-2" name="Light cone · Messages" wide parts={["Tab head", "Scrub", "Lanes", "Events", "Tooltip", "List row", "Tabs"]}>
      <div className="flex min-h-[560px] flex-col">
        <div className={`${TAB_PAGE} pb-5`}>
          <TabHead title="MESSAGES · LIGHT CONE" sources={SCAN_SOURCES} />
          <ConeLanes
            className="mt-3"
            label="Messages sent and heard, on their Years"
            head={`Messages · ${OLD.length + SENT.length + 1}`}
            range={[START, END]}
            start={41}
            lanes={() => [...OLD.map((o) => laneOfBeam(o, pick(o.key))), ...SENT.map((s) => laneOfSent(s, pick(s.id))), laneOfHeard(HEARD, pick(HEARD.key))]}
          />
          <ListHead left={`Readings and news · ${NEWS.length}`} right="Reached us" className="mt-6 mb-3" />
          <Events label="Readings and news, as they reached us" events={NEWS} now={41} format={coneYear} className="max-w-xl" />
        </div>
        <RailNav>
          <RailTab to="/ui/cone-messages" label="Scan" on />
          <RailTab to="/ui/cone-messages" label="Build" on={false} />
          <RailTab to="/ui/cone-messages" label="Reach" on={false} />
          <RailTab to="/ui/cone-messages" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
