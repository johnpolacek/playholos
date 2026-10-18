import { LeadPage } from "@/components/lead-page";
import { TabHead } from "@/components/tab-head";

// One lead, opened from Scan.
export default async function Lead(props: PageProps<"/lead/[slug]">) {
  const { slug } = await props.params;
  return (
    <>
      <TabHead title="SCAN" />
      <LeadPage slug={slug} />
    </>
  );
}
