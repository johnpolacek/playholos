import { useSearchParams } from "react-router";
import { Projects } from "@/components/projects";
import { TabHead } from "@/components/tab-head";
import { PLAN_SOURCES } from "@/lib/game/sources";

// Our builds and what is on its way. The Mind's tour of what we would start with brings its own head.
export default function ProjectsTab() {
  const [params] = useSearchParams();
  return (
    <>
      {!params.has("tour") && <TabHead title="PROJECTS" sources={PLAN_SOURCES} />}
      <Projects />
    </>
  );
}
