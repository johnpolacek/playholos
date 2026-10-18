"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/game-provider";
import { LeadList, LeadsMap } from "@/components/leads";
import type { Dials } from "@/lib/drift";
import { type Lead, leadsOf, skyId } from "@/lib/game/leads";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import type { FeltWorld } from "@/lib/sim/types";

// Scan: what we know of the sky. Earth's leads, drawn on the map and listed in the tab, with one lead in view
// between them: pointing at a row turns the map to its star.

interface Leads {
  leads: Lead[];
  ids: string[];
  dials: Dials;
}

const ScanContext = createContext<Leads>({ leads: [], ids: [], dials: {} });
/** Earth's leads, their stars as the sky names them, and the dials the map draws them by. */
export const useLeads = () => use(ScanContext);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const seed = useGame().save?.seed;
  const [felt, setFelt] = useState<FeltWorld[]>();
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/leads?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFelt, () => setFelt([]));
  }, [seed]);
  const [dials] = useState<Dials>(() => ({ found: 0, grid: 0, focus: 0 }));
  const value = useMemo(() => {
    const leads = felt ? leadsOf(felt) : [];
    return { leads, ids: leads.map((l) => skyId(l.star)), dials };
  }, [felt, dials]);
  return <ScanContext value={value}>{children}</ScanContext>;
}

/** The map on Scan: the stars within 50 light-years, and the leads lit in turn as the camera arrives. An open lead's
 * page holds the focus, so the camera goes on to its star once all are lit. */
export function ScanMap({ className }: { className: string }) {
  const { ids, dials } = useLeads();
  const onReady = useCallback(
    (flight: number) => {
      gsap.killTweensOf(dials);
      if (prefersReducedMotion()) return void Object.assign(dials, { grid: 1, found: ids.length });
      Object.assign(dials, { grid: 0, found: 0 });
      gsap
        .timeline({ delay: Math.max(0, flight - 0.6) })
        .to(dials, { grid: 1, duration: 1 }, 0)
        .to(dials, { found: ids.length, duration: Math.min(3, 0.4 * ids.length), ease: "power1.inOut" }, 0.4);
    },
    [dials, ids],
  );
  useEffect(() => () => void gsap.killTweensOf(dials), [dials]);
  return ids.length ? <LeadsMap dials={dials} ids={ids} onReady={onReady} className={className} /> : null;
}

/** The Scan tab: Earth's leads, and how long light takes to reach each. Each opens its own page. */
export function Scan() {
  const { leads, dials } = useLeads();
  if (!leads.length) return null;
  return (
    <>
      <div className="mt-1 flex justify-between font-mono text-[10px] tracking-[.1em] text-muted uppercase">
        <span>Leads · {leads.length}</span>
        <span>Light takes</span>
      </div>
      <LeadList leads={leads} dials={dials} />
    </>
  );
}
