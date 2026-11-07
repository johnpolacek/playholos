// What each craft on Reach's walk does and costs, in a row under its name. The craft itself is up close on the map:
// components/craft-view.tsx. Its drawings here gave way to that, 2026-11-07. Numbers from data/works.json, calcs/craft.py.
import type { CraftKind } from "@/components/craft-view";
import { CATALOG } from "@/lib/sim/works";

const t = (kt: number) => `${(kt * 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} t`;

const FACTS: Record<CraftKind, [string, string][]> = {
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
    ["Brakes", `${CATALOG.sentinel.brake} Years, with no flame, unseen`],
    ["Fuel", `${t(CATALOG.sentinel.fuel)}, to speed up`],
    ["Waits on", "A Fusion Drive and the Works"],
  ],
};

export function CraftFacts({ kind }: { kind: CraftKind }) {
  return (
    <dl className="grid grid-cols-3 gap-x-3 gap-y-1">
      {FACTS[kind].map(([k, v]) => (
        <div key={k}>
          <dt className="font-mono text-[9px] tracking-[.08em] text-muted uppercase">{k}</dt>
          <dd className="text-[12.5px] leading-snug text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
