import { useSearchParams } from "react-router";
import { Scan } from "@/components/scan";
import { TabHead } from "@/components/tab-head";

// What we know of the sky: Earth's leads, drawn on the map and listed here. The review brings its own head.
export default function ScanTab() {
  const [params] = useSearchParams();
  return (
    <>
      {!params.has("review") && <TabHead title="SCAN" />}
      <Scan />
    </>
  );
}
