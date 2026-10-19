import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { LeadList, LeadsMap } from "@/components/leads";
import { Messages } from "@/components/messages";
import { Review } from "@/components/review";
import { ListHead, Walk } from "@/components/tab-head";
import type { Dials } from "@/lib/drift";
import { type Lead, landed, leadsOf, type Reading, skyId } from "@/lib/game/leads";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import type { FeltWorld } from "@/lib/sim/types";

// Scan: what we know of the sky. Earth's leads, drawn on the map and listed in the tab, with one lead in view
// between them: pointing at a row turns the map to its star. Readings land on their leads as the clock runs, and stay
// marked until opened. Before Begin, the tab offers a review of them with the Mind, one at a time. Under the leads, our
// messages still on their way: light crossing the same sky, whose replies would be leads.

interface Leads {
  leads: Lead[];
  ids: string[];
  dials: Dials;
  /** What has landed on each lead, by its slug. */
  readings: Record<string, Reading[]>;
  /** Readings landed and not yet opened, by id. */
  fresh: Set<string>;
}

const ScanContext = createContext<Leads>({ leads: [], ids: [], dials: {}, readings: {}, fresh: new Set() });
/** Earth's leads, their stars as the sky names them, and the dials the map draws them by. */
export const useLeads = () => use(ScanContext);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const { save, year } = useGame();
  const seed = save?.seed;
  const [felt, setFelt] = useState<FeltWorld[]>();
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/leads?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFelt, () => setFelt([]));
  }, [seed]);
  const [dials] = useState<Dials>(() => ({ found: 0, grid: 0, focus: 0 }));
  const leads = useMemo(() => (felt ? leadsOf(felt) : []), [felt]);
  // Kept apart from the readings, so a landing never relights the map.
  const ids = useMemo(() => leads.map((l) => skyId(l.star)), [leads]);
  // Landing depends only on the tenth of a Year, so the readings change at most every thirty seconds.
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  const observe = save?.plan?.observe;
  const seen = save?.seen;
  const value = useMemo(() => {
    const readings = Object.fromEntries(leads.map((l) => [l.slug, landed(l.slug, observe, tenth)]));
    const opened = new Set(seen);
    const fresh = new Set(Object.values(readings).flatMap((rs) => rs.map((r) => r.id).filter((id) => !opened.has(id))));
    return { leads, ids, dials, readings, fresh };
  }, [leads, ids, dials, observe, tenth, seen]);
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

/** The Scan tab: Earth's leads, and how long a message takes to reach each. Each opens its own page. */
export function Scan() {
  const { leads, dials, readings, fresh } = useLeads();
  const { save, year } = useGame();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  if (!leads.length) return null;
  if (params.has("review")) return <Review onClose={close} />;
  return (
    <>
      {(year === null || !save?.reviewed) && (
        <Walk to="/?review" title="Review our scans" line="With the Mind, one lead at a time." done={!!save?.reviewed} />
      )}
      <ListHead left={`Leads · ${leads.length}`} right="Reached in" className="mt-1" />
      <LeadList leads={leads} dials={dials} readings={readings} fresh={fresh} />
      <Messages />
    </>
  );
}
