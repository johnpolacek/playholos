import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { Heard } from "@/components/heard";
import { LeadList, LeadsMap } from "@/components/leads";
import { Messages } from "@/components/messages";
import { Review } from "@/components/review";
import { ListHead } from "@/components/tab-head";
import type { Dials } from "@/lib/drift";
import { placeLeads } from "@/lib/game/places";
import { knownQuery } from "@/lib/game/known-query";
import { airReading, glowReading, type Lead, landed, leadsOf, lifeOf, nearestReading, ODDS, type Reading, rockLead, skyId, visitReading } from "@/lib/game/leads";
import { useSchedule } from "@/components/picks";
import { EMPTY } from "@/lib/game/plan";
import { rockAt, rockOf } from "@/lib/game/rocks";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import type { EarthView, Heard as Signal, Visit } from "@/lib/sim/types";

// Scan: what we know of the sky. Earth's leads, drawn on the map and listed in the tab, with one lead in view
// between them: pointing at a row turns the map to its star. Readings land on their leads as the clock runs, and stay
// marked until opened. The tab's head offers a review of them with the Mind, one at a time, at any time. Under the leads, our
// messages still on their way: light crossing the same sky, whose replies would be leads. A lead open, in the review or
// on its page, whose system we know, has a Close View: the map flies into its system, as a destination's does on
// Reach. Added 2026-10-19. What Earth knows comes from the server as the clock runs, through the knowledge wall: what our
// Infrared Telescope reads lands on each world's lead, and what our watches catch is listed above the leads, 2026-10-22.

interface Leads {
  leads: Lead[];
  ids: string[];
  dials: Dials;
  /** What has landed on each lead, by its slug. */
  readings: Record<string, Reading[]>;
  /** Readings landed and not yet opened, by id, and signals caught and not yet opened. */
  fresh: Set<string>;
  /** Signals our watches have caught, as they arrived. */
  heard: Signal[];
  /** What our sails and probe have seen up close, once their word is home. */
  visits: Visit[];
  /** Our Mind at a black hole, as its word has reached us. */
  colony?: EarthView["colony"];
  /** The minds Earth has found, as measured, for the watches' lines on Build. 2026-10-30. */
  minds?: EarthView["minds"];
  /** The lead open, in the review or on its page, whose system Close View flies into. */
  look: Lead | null;
  setLook(lead: Lead | null): void;
  /** In its system, or not. */
  close: boolean;
  setClose(on: boolean): void;
  /** On or back a stop in the review, while it is open: a tap on the map takes it too. */
  step(by: 1 | -1): void;
  /** The review gives its step here as it opens, and null as it closes. */
  setStep(step: ((by: 1 | -1) => void) | null): void;
}

const ScanContext = createContext<Leads>({
  leads: [],
  ids: [],
  dials: {},
  readings: {},
  fresh: new Set(),
  heard: [],
  visits: [],
  look: null,
  setLook() {},
  close: false,
  setClose() {},
  step() {},
  setStep() {},
});
/** Earth's leads, their stars as the sky names them, and the dials the map draws them by. */
export const useLeads = () => use(ScanContext);

const NOTHING: EarthView = { year: 0, felt: [], heard: [], visits: [] };

/** A signal's id, to mark it new until opened. */
export const heardId = (h: Signal) => `heard-${h.star}-${h.arrived}`;

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const { save, year } = useGame();
  const seed = save?.seed;
  // Landing depends only on the tenth of a Year, so what we know changes at most every thirty seconds.
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  const plan = save?.plan;
  // What the server needs from the save, shared with the skip. 2026-10-29.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const query = useMemo(() => knownQuery(save, tenth), [tenth, plan, save?.will]);
  const [view, setView] = useState<EarthView>();
  useEffect(() => {
    if (seed === undefined) return;
    let live = true;
    fetch(`/api/known?seed=${seed}&${query}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (v: EarthView | null) => live && setView((was) => v ?? was ?? NOTHING),
        () => live && setView((was) => was ?? NOTHING),
      );
    return () => void (live = false);
  }, [seed, query]);
  const felt = view?.felt;
  // What our watches caught. Answers to what we sent went with the neighbors, 2026-10-29.
  const heard = useMemo(() => view?.heard ?? [], [view]);
  const visits = useMemo(() => view?.visits ?? [], [view]);
  const colony = view?.colony;
  const proxima = view?.proxima;
  const [dials] = useState<Dials>(() => ({ found: 0, grid: 0, focus: 0, close: 0 }));
  // Keyed by the stars felt, so a reading landing never rebuilds the leads the map lights.
  // Black holes found join them, after the worlds, 2026-10-26.
  const holes = view?.holes;
  const glows = view?.glows;
  // The realistic premise's minds found, 2026-10-29.
  const minds = view?.minds;
  // And stars our seed probes reached with no lead of their own, 2026-10-26.
  const seeds = useMemo(() => visits.filter((v) => v.by === "seed" && !v.sent), [visits]);
  // Holes our craft went to keep their leads, beside the nearest.
  const kept = [...(plan?.sentinels ?? []), ...(plan?.colony ? [plan.colony] : [])].map((o) => o.name);
  // A rock found, and what befell it, leads Scan from the Year we find it. 2026-10-30.
  const { done } = useSchedule();
  const rock = useMemo(
    () => (seed === undefined || tenth === null ? null : rockAt(rockOf(seed), plan ?? EMPTY, done, tenth)),
    [seed, plan, done, tenth],
  );
  const rockKey = rock && rock.state !== "unknown" ? `${rock.state} ${rock.lands}` : "";
  const stars = [
    rockKey,
    ...kept.map((k) => `kept ${k}`), ...(felt ?? []).map((f) => f.star), ...(holes ?? []).map((h) => h.name), ...(glows ?? []).map((g) => `glow ${g.star}`), ...seeds.map((v) => `seed ${v.star}`),
    ...(minds ? [JSON.stringify([minds.flashes.map((f) => f.range ?? f.seen), minds.glows.length, minds.sleepers.length, minds.watcher?.seen])] : []),
  ].join("|");
  const leads = useMemo(
    () => (felt ? [...(rockKey ? [rockLead(rock!)] : []), ...leadsOf(felt, holes ?? [], glows ?? [], seeds, kept, minds)] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stars],
  );
  // The map places leads the sky file lacks: black holes found, and far landmarks.
  useEffect(() => placeLeads(Object.fromEntries(leads.flatMap((l) => (l.at ? [[skyId(l.star), l.at]] : [])))), [leads]);
  // The scene reads Close View from the dials each frame, and the screen from here. Another lead starts outside.
  const [look, setLookState] = useState<Lead | null>(null);
  const [close, setCloseState] = useState(false);
  const setClose = useCallback(
    (on: boolean) => {
      Object.assign(dials, { close: on ? 1 : 0 });
      setCloseState(on);
    },
    [dials],
  );
  const setLook = useCallback(
    (lead: Lead | null) => {
      setClose(false);
      setLookState(lead);
    },
    [setClose],
  );
  const stepping = useRef<((by: 1 | -1) => void) | null>(null);
  const step = useCallback((by: 1 | -1) => stepping.current?.(by), []);
  const setStep = useCallback((to: ((by: 1 | -1) => void) | null) => void (stepping.current = to), []);
  // Kept apart from the readings, so a landing never relights the map.
  const ids = useMemo(() => leads.map((l) => skyId(l.star)), [leads]);
  const observe = save?.plan?.observe;
  const seen = save?.seen;
  const value = useMemo(() => {
    // What our telescopes have read, on each felt world's lead, after any observation's: the Infrared Telescope's,
    // then the 15 m Mirror's, which reads Proxima b too.
    const air: Record<string, Reading[]> = Object.fromEntries(
      (felt ?? []).map((f) => [
        f.star,
        [airReading(f), airReading(f, true)].filter((r): r is Reading => r !== null).sort((a, b) => a.at - b.at),
      ]),
    );
    if (proxima) air["Proxima Centauri"] = [nearestReading(proxima)];
    // And what our sails and probe saw of Proxima b, last.
    const visited = Object.fromEntries(
      leads.map((l) => [l.star, visits.filter((v) => v.star === l.star).map(visitReading)]),
    );
    // What the Halo Survey saw at a lead's star, 2026-10-26.
    const glowed = Object.fromEntries((glows ?? []).map((g) => [g.star, [glowReading(g)]]));
    const readings = Object.fromEntries(
      leads.map((l) => [l.slug, [...landed(l.slug, observe, tenth), ...(air[l.star] ?? []), ...(visited[l.star] ?? []), ...(glowed[l.star] ?? [])]]),
    );
    const opened = new Set(seen);
    // New until opened, or for 50 Years: a badge from Year 10 still read NEW at Year 9,104 until 2026-10-30.
    const recent = (at: number) => tenth === null || tenth - at < 50;
    const fresh = new Set(
      [
        ...Object.values(readings).flatMap((rs) => rs.filter((r) => recent(r.at)).map((r) => r.id)),
        ...heard.filter((h) => recent(h.arrived)).map(heardId),
      ].filter((id) => !opened.has(id)),
    );
    return { leads, ids, dials, readings, fresh, heard, visits, colony, minds, look, setLook, close, setClose, step, setStep };
  }, [leads, felt, proxima, ids, dials, observe, tenth, seen, heard, visits, colony, minds, look, setLook, close, setClose, step, setStep]);
  return <ScanContext value={value}>{children}</ScanContext>;
}

/** A tap that steps the review, as a story on a phone: on, or back on the left quarter. A drag, a scroll, a selection,
 *  or a press on a button or link is left alone. A swipe across steps it too, on from the right. */
export function useStepTap(step: (by: 1 | -1) => void) {
  const from = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => void (from.current = { x: e.clientX, y: e.clientY }),
    onPointerCancel: () => void (from.current = null),
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const at = from.current;
      from.current = null;
      if (!at || (e.pointerType === "mouse" && e.button !== 0)) return;
      if (e.target instanceof Element && e.target.closest("button, a, input, textarea, select, label, dialog")) return;
      const dx = e.clientX - at.x;
      const dy = e.clientY - at.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > 2 * Math.abs(dy)) return step(dx < 0 ? 1 : -1);
      if (Math.hypot(dx, dy) > 10 || !window.getSelection()?.isCollapsed) return;
      const box = e.currentTarget.getBoundingClientRect();
      step(e.clientX - box.left < box.width / 4 ? -1 : 1);
    },
  };
}

/** The map on Scan: the stars within 50 light-years, and the leads lit in turn as the camera arrives. An open lead's
 * page holds the focus, so the camera goes on to its star once all are lit. */
export function ScanMap({ className }: { className: string }) {
  const { leads, ids, dials, look, readings } = useLeads();
  // Each lead glows by the Mind's word that something lives there, brighter as a reading raises it. 2026-10-29.
  const life = useMemo(
    () => leads.map((l) => {
      const word = lifeOf(l, readings[l.slug] ?? []);
      return word ? ODDS.indexOf(word) : -1;
    }),
    [leads, readings],
  );
  // The leads light once as the map opens, not again as a lead's system comes and goes.
  const lit = useRef(false);
  // A lead found after they lit lights too. Until all are lit the map holds no focus, so no Close View.
  const count = useRef(ids.length);
  const onReady = useCallback(
    (flight: number) => {
      if (lit.current) return;
      lit.current = true;
      gsap.killTweensOf(dials);
      if (prefersReducedMotion()) return void Object.assign(dials, { grid: 1, found: count.current });
      Object.assign(dials, { grid: 0, found: 0 });
      gsap
        .timeline({ delay: Math.max(0, flight - 0.6) })
        .to(dials, { grid: 1, duration: 1 }, 0)
        .to(dials, { found: () => count.current, duration: Math.min(3, 0.4 * count.current), ease: "power1.inOut" }, 0.4);
    },
    [dials],
  );
  useEffect(() => {
    count.current = ids.length;
    if (!lit.current || gsap.isTweening(dials) || dials.found === ids.length) return;
    if (prefersReducedMotion()) return void Object.assign(dials, { found: ids.length });
    gsap.to(dials, { found: ids.length, duration: 0.6, ease: "power1.inOut", overwrite: "auto" });
  }, [dials, ids]);
  useEffect(() => () => void gsap.killTweensOf(dials), [dials]);
  return ids.length ? (
    <LeadsMap dials={dials} ids={ids} life={life} system={look?.system} onReady={onReady} className={className} />
  ) : null;
}

/** The Scan tab: Earth's leads, and how long a message takes to reach each. Each opens its own page. */
export function Scan() {
  const { leads, dials, readings, fresh, heard } = useLeads();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  if (!leads.length) return null;
  if (params.has("review")) return <Review onClose={close} />;
  return (
    <>
      {heard.length > 0 && <Heard />}
      <ListHead left={`Leads · ${leads.length}`} right="Reached in" className={heard.length ? "mt-5" : "mt-1"} />
      <LeadList leads={leads} dials={dials} readings={readings} fresh={fresh} />
      <Messages />
    </>
  );
}
