import { useParams } from "react-router";
import { BuildPage, useBack } from "@/components/build-page";
import { WalkBack } from "@/components/reach-tour";
import { TabHead } from "@/components/tab-head";
import { PLAN_SOURCES } from "@/lib/game/sources";

// One build, opened from Build, or from the walk on Reach, which keeps its own head over it. 2026-10-28.
export default function BuildItem() {
  const { slug = "" } = useParams();
  const walk = useBack()?.walk;
  return (
    <>
      {walk ? <WalkBack /> : <TabHead title="BUILD" sources={PLAN_SOURCES} />}
      <BuildPage slug={slug} />
    </>
  );
}
