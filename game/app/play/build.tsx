import { useSearchParams } from "react-router";
import { Build } from "@/components/build";
import { TabHead } from "@/components/tab-head";
import { PLAN_SOURCES } from "@/lib/game/sources";

// Our builds. The head opens the walk through what we could start at any time, and the walk brings its own head.
export default function BuildTab() {
  const [params] = useSearchParams();
  return (
    <>
      {!params.has("tour") && (
        <TabHead title="BUILD" sources={PLAN_SOURCES} walk={{ to: "/build?tour", label: "Explore" }} />
      )}
      <Build />
    </>
  );
}
