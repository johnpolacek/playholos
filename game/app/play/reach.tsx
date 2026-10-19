import { Reach } from "@/components/reach";
import { TabHead } from "@/components/tab-head";
import { REACH_SOURCES } from "@/lib/game/sources";

// Spreading out into the Galaxy, probes first. At Year 0, how far we have gone, what we have sent, and the roads to the
// nearest star.
export default function ReachTab() {
  return (
    <>
      <TabHead title="REACH" sources={REACH_SOURCES} />
      <Reach />
    </>
  );
}
