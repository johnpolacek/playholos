import { notFound } from "next/navigation";
import { Compare } from "./compare";

// The first screen's two looks side by side: the drift's own scene, and the map's line art. Dev only.
export default function DriftCompare() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Compare />;
}
