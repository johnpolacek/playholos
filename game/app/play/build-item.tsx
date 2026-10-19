import { useParams } from "react-router";
import { BuildPage } from "@/components/build-page";
import { TabHead } from "@/components/tab-head";
import { PLAN_SOURCES } from "@/lib/game/sources";

// One build, opened from Build.
export default function BuildItem() {
  const { slug = "" } = useParams();
  return (
    <>
      <TabHead title="BUILD" sources={PLAN_SOURCES} />
      <BuildPage slug={slug} />
    </>
  );
}
