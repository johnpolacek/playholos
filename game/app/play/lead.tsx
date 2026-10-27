import { useParams } from "react-router";
import { LeadPage } from "@/components/lead-page";
import { TabHead } from "@/components/tab-head";

// One lead, opened from Scan.
export default function Lead() {
  const { slug = "" } = useParams();
  return (
    <>
      <TabHead title="SCAN" />
      <LeadPage slug={slug} />
    </>
  );
}
