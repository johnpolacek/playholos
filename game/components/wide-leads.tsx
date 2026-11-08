import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Lens } from "@/components/icons";
import { useLeads } from "@/components/scan";
import { prefersReducedMotion } from "@/lib/motion";

// Our warm glows lie thousands of light-years off, where the map of nearby stars never shows them: three sat found and
// unseen in a playtest. This pulls the map back over the Milky Way to show them, Sol among them, and brings it home.
// As the simulation's Peers do. 2026-11-03. Reduced motion holds the map still, so it has no way to fly there.
export function WideLeads() {
  const { leads, dials, close, minds } = useLeads();
  // Kept for the page it was set on: left on, it carried over to every lead's page and the review. A glow not yet ranged
  // has no place to fly to, so its page opens over the Milky Way, and every other page on the stars around us. 2026-11-08.
  const { pathname, search } = useLocation();
  const at = pathname + search;
  const glow = pathname.match(/^\/play\/lead\/warm-glow-(\d+)$/)?.[1];
  const unranged = !!glow && !!minds?.flashes[Number(glow) - 1] && !leads.some((l) => l.slug === `warm-glow-${glow}`);
  const [set, setSet] = useState<{ at: string; on: boolean } | null>(null);
  const wide = set?.at === at ? set.on : unranged;
  const setWide = (on: boolean) => setSet({ at, on });
  const count = leads.filter((l) => l.slug.startsWith("warm-glow-")).length;
  const any = count > 0;
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
      {wide ? "Nearby Stars" : `Milky Way · ${count} warm glow${count > 1 ? "s" : ""}`}
    </button>
  );
}
