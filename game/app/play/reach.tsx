import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { Reach } from "@/components/reach";
import { ReachTour } from "@/components/reach-tour";
import { TabHead } from "@/components/tab-head";
import { REACH_SOURCES } from "@/lib/game/sources";

// Spreading out into the Galaxy, probes first. At Year 0, how far we have gone, what we have sent, and the roads to the
// nearest star. The head opens the walk through how we reach at any time, and the walk brings its own head.
export default function ReachTab() {
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  if (params.has("tour")) return <ReachTour onClose={close} />;
  return (
    <>
      <TabHead title="REACH" sources={REACH_SOURCES} walk={{ to: "/reach?tour", label: "How we reach" }} />
      <Reach />
    </>
  );
}
