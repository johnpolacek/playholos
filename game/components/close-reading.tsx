import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router";
import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { tenths, yearText } from "@/lib/game/clock";
import { glowNamed } from "@/lib/game/glow-names";
import { starName, type Lead } from "@/lib/game/leads";
import { READ_YEARS } from "@/lib/sim/minds";
import { prefersReducedMotion } from "@/lib/motion";

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

/** Where a warm glow's Close Reading stands, or null if it has none to show, as a shine faded with no reading. */
export function readingStands(lead: Lead, minds: ReturnType<typeof useLeads>["minds"], reads: { name: string }[] = []) {
  if (!lead.slug.startsWith("warm-glow-")) return null;
  const flash = minds?.flashes[Number(lead.slug.replace("warm-glow-", "")) - 1];
  if (!flash) return null;
  const mine = reads.some((o) => o.name === lead.star);
  if (flash.read?.saw) return "done";
  if (mine) return "under way";
  return flash.faded === undefined ? "open" : null;
}

/** The warm glows we could read now: still shining, unread, with our telescope built and free. A glow's page buried this
 *  move two screens down, and the map said nothing needs us. So these stand under Needs us. Playtest 2026-11-04. */
export function openReadings(leads: Lead[], minds: ReturnType<typeof useLeads>["minds"], reads: { name: string; y: number }[], scope: number | null | undefined, now: number) {
  if (scope == null || scope > now || reads.some((o) => o.y + READ_YEARS > now)) return [];
  return leads.filter((l) => readingStands(l, minds, reads) === "open");
}

export function useOpenReadings() {
  const { year } = useGame();
  const { plan } = usePlan();
  const { done } = useSchedule();
  const { leads, minds } = useLeads();
  return openReadings(leads, minds, plan?.closeReads ?? [], done["Infrared Telescope"], tenths(year ?? 0));
}

/** While the telescope reads, a beam sweeps the colors and faint light gathers behind it, denser as the Years pass. The
 *  points sit near the plain curve with no bump either way, so nothing tells the answer early. Playtest 2026-11-04: the
 *  order changed one line of text, and read as nothing happening. */
function Gathering({ done }: { done: number }) {
  const pts = useMemo(() => {
    const planck = (um: number) => um ** -5 / (Math.exp(14388 / (um * 300)) - 1);
    const peak = planck(9.66);
    return Array.from({ length: 90 }, (_, k) => {
      const x = (k * 0.618034 * W) % W;
      const um = 5 + (20 * x) / W;
      const jitter = Math.sin(k * 12.9898) * 43758.5453;
      const y = planck(um) / peak + (jitter - Math.floor(jitter) - 0.5) * 0.3;
      return { x, y: H - 12 - (y / 1.45) * (H - 18), k };
    });
  }, []);
  const shown = Math.round(Math.max(0.08, Math.min(1, done)) * pts.length);
  return (
    <g>
      {pts.slice(0, shown).map((p) => (
        <circle key={p.k} cx={p.x} cy={p.y} r="0.9" fill="var(--other)" fillOpacity=".55" />
      ))}
      <rect y="4" width="10" height={H - 16} fill="var(--other)" fillOpacity=".14">
        {!prefersReducedMotion() && <animate attributeName="x" from="-10" to={W} dur="2.6s" repeatCount="indefinite" />}
      </rect>
    </g>
  );
}

export function CloseReading({ lead }: { lead: Lead }) {
  const { hash } = useLocation();
  const root = useRef<HTMLElement>(null);
  // Brought here from the Mind's words.
  useEffect(() => {
    if (hash === "#close-reading") root.current?.scrollIntoView({ block: "start" });
  }, [hash]);
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
  const reading = mine && !saw;
  const named = glowNamed(lead.star);
  return (
    <section ref={root} id="close-reading" data-m className="mt-4 scroll-mt-20 rounded-xl border border-other/40 bg-other/[.05] px-3 py-2.5">
      <h2 className="font-mono text-[10px] tracking-[.1em] text-other uppercase">A Close Reading</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1.5 w-full" role="img" aria-label={saw === "dust" ? "Its light, with a bump at 10 microns" : saw === "smooth" ? "Its light, a smooth curve" : "Its light, not yet read"}>
        <line x1="0" x2={W} y1={H - 12} y2={H - 12} className="stroke-faint" />
        {saw === "dust" || saw === "smooth" ? (
          <path d={curve(saw === "dust")} fill="none" stroke="var(--other)" strokeWidth="1.6" />
        ) : (
          <path d={curve(false)} fill="none" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 4" />
        )}
        {reading && <Gathering done={(now - mine.y) / READ_YEARS} />}
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
      {saw === "smooth" ? (
        shining ? (
          <>
            <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
              Plain heat, with no silicate dust in it. Carbon dust can look this smooth too. {named && <b className="font-medium text-other">We name it {named.name}, for {named.after}. </b>}To be sure, we call out, or go.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                to={`/play/reach/${lead.slug}`}
                className="inline-flex h-8 items-center rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
              >
                Engage {starName(lead.star)}
              </Link>
              <Link
                to={`/play/mind?ask=${encodeURIComponent(`We want to send a message to ${lead.star}. What should it say, and what does it risk?`)}`}
                className="text-[12.5px] text-you hover:underline"
              >
                Send it a message ›
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
            Plain heat, with no silicate dust in it, before it faded. {named && <b className="font-medium text-other">We name it {named.name}, for {named.after}.</b>}
          </p>
        )
      ) : saw === "dust" ? (
        <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">Dust, with the bump near 10 microns. It will fade, and there is nothing more for us to do here.</p>
      ) : saw ? (
        <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">It faded before we finished, and took the answer with it.</p>
      ) : mine ? (
        <>
          <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">Our Infrared Telescope is splitting its light. Done by Year {yearText(mine.y + READ_YEARS)}, if it still shines.</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-faint/40">
            <div className="h-full rounded-full bg-other transition-[width] duration-700" style={{ width: `${Math.max(3, Math.min(100, ((now - mine.y) / READ_YEARS) * 100))}%` }} />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
            <span>Year {yearText(mine.y)}</span>
            <span>Year {yearText(mine.y + READ_YEARS)}</span>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1.5 text-[13.5px] leading-snug text-page-ink2">
            Split its light by color. Silicate dust shows a bump near 10 microns, and plain heat from something built doesn’t. {READ_YEARS} Years, one glow at a time.
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
