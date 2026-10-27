import { useParams } from "react-router";
import { DestinationPage } from "@/components/destination";
import { TabHead } from "@/components/tab-head";
import { REACH_SOURCES } from "@/lib/game/sources";

// One destination, opened from Reach.
export default function Destination() {
  const { slug = "" } = useParams();
  return (
    <>
      <TabHead title="REACH" sources={REACH_SOURCES} />
      <DestinationPage slug={slug} />
    </>
  );
}
