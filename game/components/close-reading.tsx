import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { tenths, yearText } from "@/lib/game/clock";
import type { Lead } from "@/lib/game/leads";
import { READ_YEARS } from "@/lib/sim/minds";

// A Close Reading, settled 2026-11-03: the one move on a warm glow while it shines. Our Infrared Telescope splits its
// light by color, as JWST's MIRI did for Project Hephaistos's Dyson-sphere candidates. Dust shows a bump near 10 microns,
// as FU Orionis's does. Plain heat doesn't. One at a time, and a glow that fades first takes the answer with it.

const W = 280;
const H = 74;
/** The shape of a 300 K glow's light across 5 to 25 microns, 0 to 1, with dust's bump at 10 if `dust`. */
function curve(dust: boolean) {
  const planck = (um: number) => um ** -5 / (Math.exp(14388 / (um * 300)) - 1);
  const peak = planck(9.66);
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const um = 5 + (20 * i) / 60;
    const y = planck(um) / peak + (dust ? 0.42 * Math.exp(-(((um - 10) / 1.1) ** 2)) : 0);
    pts.push(`${i ? "L" : "M"}${((W * i) / 60).toFixed(1)} ${(H - 12 - (y / 1.45) * (H - 18)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function CloseReading({ lead }: { lead: Lead }) {
  const { year } = useGame();
  const { plan, change } = usePlan();
  const { done } = useSchedule();
  const { minds } = useLeads();
  const i = Number(lead.slug.replace("warm-glow-", "")) - 1;
  const flash = minds?.flashes[i];
  const now = tenths(year ?? 0);
  const reads = plan?.closeReads ?? [];
  const mine = reads.find((o) => o.name === lead.star);
  const busy = reads.find((o) => o.name !== lead.star && o.y + READ_YEARS > now);
  const scope = done["Infrared Telescope"];
  const read = flash?.read;
  const shining = flash?.faded === undefined;
  if (!flash || (!shining && !mine)) return null;
  const saw = read?.saw;
  return (
    <section data-m className="mt-4 rounded-xl border border-other/40 bg-other/[.05] px-3 py-2.5">
      <h2 className="font-mono text-[10px] tracking-[.1em] text-other uppercase">A Close Reading</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1.5 w-full" role="img" aria-label={saw === "dust" ? "Its light, with a bump at 10 microns" : saw === "smooth" ? "Its light, a smooth curve" : "Its light, not yet read"}>
        <line x1="0" x2={W} y1={H - 12} y2={H - 12} className="stroke-faint" />
        {saw === "dust" || saw === "smooth" ? (
          <path d={curve(saw === "dust")} fill="none" stroke="var(--other)" strokeWidth="1.6" />
        ) : (
          <path d={curve(false)} fill="none" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 4" />
        )}
        <line x1={W * 0.25} x2={W * 0.25} y1="6" y2={H - 12} className="stroke-muted" strokeOpacity=".45" strokeDasharray="1 3" />
        <text x={W * 0.25} y={H - 2} textAnchor="middle" className="fill-muted font-mono" fontSize="8">
          dust shows here
        </text>
        <text x="0" y={H - 2} className="fill-muted font-mono" fontSize="8">
          5
        </text>
        <text x={W} y={H - 2} textAnchor="end" className="fill-muted font-mono" fontSize="8">
          25 microns
        </text>
      </svg>
      {saw ? null : mine ? (
        <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">Our Infrared Telescope is splitting its light. Done by Year {yearText(mine.y + READ_YEARS)}, if it still shines.</p>
      ) : (
        <>
          <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
            Split its light by color. Dust shows a bump near 10 microns, and plain heat from something built doesn’t. {READ_YEARS} Years, one glow at a time.
          </p>
          {scope == null || scope > now ? (
            <p className="mt-2 text-[12.5px] text-muted">Needs our Infrared Telescope.</p>
          ) : busy ? (
            <p className="mt-2 text-[12.5px] text-muted">Our telescope is reading {busy.name} until Year {yearText(busy.y + READ_YEARS)}.</p>
          ) : (
            <button
              onClick={() => change((p) => ({ ...p, closeReads: [...(p.closeReads ?? []), { name: lead.star, y: now }] }))}
              className="mt-2 h-8 rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
            >
              Read its light
            </button>
          )}
        </>
      )}
    </section>
  );
}
