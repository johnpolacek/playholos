import { Scan } from "@/components/scan";
import { TabHead } from "@/components/tab-head";

// What we know of the sky: Earth's leads, drawn on the map and listed here.
export default function ScanTab() {
  return (
    <>
      <TabHead title="SCAN" />
      <Scan />
    </>
  );
}
