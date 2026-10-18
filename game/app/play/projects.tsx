import { Projects } from "@/components/projects";
import { TabHead } from "@/components/tab-head";
import { PLAN_SOURCES } from "@/lib/game/sources";

export default function ProjectsTab() {
  return (
    <>
      <TabHead title="PROJECTS" sources={PLAN_SOURCES} />
      <Projects />
    </>
  );
}
