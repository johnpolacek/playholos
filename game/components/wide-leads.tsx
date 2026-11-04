import { useEffect, useState } from "react";
import { Lens } from "@/components/icons";
import { useLeads } from "@/components/scan";
import { prefersReducedMotion } from "@/lib/motion";

// Our warm glows lie thousands of light-years off, where the map of nearby stars never shows them: three sat found and
// unseen in a playtest. This pulls the map back over the Milky Way to show them, Sol among them, and brings it home.
// As the simulation's Peers do. 2026-11-03. Reduced motion holds the map still, so it has no way to fly there.
export function WideLeads() {
  const { leads, dials, close } = useLeads();
  const [wide, setWide] = useState(false);
  const any = leads.some((l) => l.slug.startsWith("warm-glow-"));
  useEffect(() => void Object.assign(dials, { wide: wide ? 1 : 0 }), [dials, wide]);
  useEffect(() => () => void Object.assign(dials, { wide: 0 }), [dials]);
  if (!any || close || prefersReducedMotion()) return null;
  return (
    <button
      onClick={() => setWide(!wide)}
      title={wide ? "Back to the stars around us" : "See our warm glows across the Milky Way"}
      className="absolute right-2.5 bottom-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper pr-3 pl-2.5 text-xs"
    >
      <Lens closer={wide} />
      {wide ? "Nearby Stars" : "Milky Way"}
    </button>
  );
}
