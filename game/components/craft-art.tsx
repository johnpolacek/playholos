// What each craft on Reach's walk does and costs, in a row under its name. The craft itself is up close on the map:
// components/craft-view.tsx. Its drawings here gave way to that, 2026-11-07. Numbers from data/works.json, calcs/craft.py.
import type { CraftKind } from "@/components/craft-view";
import { CATALOG } from "@/lib/sim/works";

const t = (kt: number) => `${(kt * 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} t`;

const FACTS: Partial<Record<CraftKind, [string, string][]>> = {
  sail: [
    ["Speed", "A fifth of light’s, in 10 minutes"],
    ["Push", "Up to 15,000 g"],
    ["A launch", "63 GWh, and a flash at its star"],
  ],
  probe: [
    ["Speed", "A tenth of light’s, after a 20-Year burn"],
    ["Fuel", `${t(CATALOG.probe.fuel)}, under a Year of the Works`],
    ["Waits on", "A Fusion Drive, never flown"],
  ],
  sentinel: [
    ["Brakes", "On its sail, unseen, then a short burn"],
    ["Fuel", `${t(CATALOG.sentinel.fuel)}, to speed up`],
    ["Waits on", "A Fusion Drive and the Works"],
  ],
};

export function CraftFacts({ kind }: { kind: CraftKind }) {
  const facts = FACTS[kind];
  if (!facts) return null;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px] leading-snug">
      {facts.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
