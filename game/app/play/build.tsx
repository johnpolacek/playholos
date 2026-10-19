import { useSearchParams } from "react-router";
import { Build } from "@/components/build";
import { TabHead } from "@/components/tab-head";
import { PLAN_SOURCES } from "@/lib/game/sources";

// Our builds. The Mind's tour of what we would start with brings its own head.
export default function BuildTab() {
  const [params] = useSearchParams();
  return (
    <>
      {!params.has("tour") && <TabHead title="BUILD" sources={PLAN_SOURCES} />}
      <Build />
    </>
  );
}
