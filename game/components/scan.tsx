import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { openReadings, useOpenReadings } from "@/components/close-reading";
import { Heard } from "@/components/heard";
import { LeadList, LeadsMap } from "@/components/leads";
import { Messages } from "@/components/messages";
import { Review } from "@/components/review";
import type { Dials } from "@/lib/drift";
import { placeLeads } from "@/lib/game/places";
import { knownQuery } from "@/lib/game/known-query";
import { type Lead, due, leadsOf, lifeOf, ODDS, type Reading, readingsOf, rockLead, skyId, betelgeuseLead } from "@/lib/game/leads";
import { setStruck, setWatched, useSchedule } from "@/components/picks";
import { watchedAt } from "@/lib/sim/minds";
import { skyOf } from "@/lib/game/natural";
import { glowNames, knowGlowNames } from "@/lib/game/glow-names";
import { dates, knowStars, target, WATCHER } from "@/lib/game/sends";
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
  /** Where each lead stands, by its slug: a reading to open, something of ours on its way, or nothing to do. */
  standing: Record<string, Standing>;
  /** The Year what we know was read at, once it has loaded. */
  known?: number;
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

/** Where a lead stands. 76 leads in one list left the Will not knowing what to do, so Scan sorts them: what has news
 *  for us, what we are waiting on, and the rest, folded. Playtest 2026-11-02. */
/** "watching": a warm glow still shining, our hottest kind of lead, kept out of Quiet. 2026-11-03. */
export type Standing = "needs" | "watching" | "waiting" | "quiet";

const ScanContext = createContext<Leads>({
  leads: [],
  ids: [],
  dials: {},
  readings: {},
  fresh: new Set(),
  standing: {},
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
  const { save, year, setPlan } = useGame();
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
  // A peer's gift, once it reaches us, goes into our plan, where our thinking counts it. 2026-10-31.
  useEffect(() => {
    const plan = save?.plan;
    if (!plan) return;
    const have = new Set((plan.gifts ?? []).map((g) => g.name));
    const fresh = heard.filter((h) => h.gift && h.gift > 1 && !have.has(h.star));
    if (!fresh.length) return;
    setPlan({ ...plan, gifts: [...(plan.gifts ?? []), ...fresh.map((h) => ({ name: h.star, y: h.arrived, size: h.gift! > 2 ? ("encyclopedia" as const) : ("collection" as const) }))] });
  }, [heard, save?.plan, setPlan]);
  const visits = useMemo(() => view?.visits ?? [], [view]);
  const colony = view?.colony;
  const proxima = view?.proxima;
  const [dials] = useState<Dials>(() => ({ found: 0, grid: 0, focus: 0, close: 0, calm: 0 }));
  // Keyed by the stars felt, so a reading landing never rebuilds the leads the map lights.
  // Black holes found join them, after the worlds, 2026-10-26.
  const holes = view?.holes;
  // The realistic premise's minds found, 2026-10-29.
  const minds = view?.minds;
  // The watcher found opens our Close Look on Build. 2026-10-30.
  const watchedYear = watchedAt(minds?.watcher);
  useEffect(() => setWatched(watchedYear), [watchedYear]);
  // And the maker's bullet, once it has landed, cuts our thought from then. 2026-10-30.
  const struck = minds?.watcher?.struck ?? null;
  useEffect(() => setStruck(struck), [struck]);
  // And stars our seed probes reached with no lead of their own, 2026-10-26.
  const seeds = useMemo(() => visits.filter((v) => v.by === "seed" && !v.sent), [visits]);
  // Holes our craft went to keep their leads, beside the nearest.
  const kept = [...(plan?.sentinels ?? []), ...(plan?.flybys ?? []), ...(plan?.colony ? [plan.colony] : [])].map((o) => o.name);
  // A rock found, and what befell it, leads Scan from the Year we find it. 2026-10-30.
  const { done } = useSchedule();
  const rock = useMemo(
    () => (seed === undefined || tenth === null ? null : rockAt(rockOf(seed), plan ?? EMPTY, done, tenth)),
    [seed, plan, done, tenth],
  );
  const rockKey = rock && rock.state !== "unknown" ? `${rock.state} ${rock.lands}` : "";
  // Betelgeuse's end leads Scan once its light reaches us. 2026-10-30.
  const blown = seed !== undefined && tenth !== null && skyOf(seed).betelgeuse <= tenth ? skyOf(seed).betelgeuse : null;
  const stars = [
    rockKey,
    `betelgeuse ${blown}`,
    ...kept.map((k) => `kept ${k}`), ...(felt ?? []).map((f) => f.star), ...(holes ?? []).map((h) => h.name), ...seeds.map((v) => `seed ${v.star}`),
    ...(minds ? [JSON.stringify([minds.flashes.map((f) => [f.range ?? f.seen, f.faded, f.read?.at]), minds.glows.length, minds.sleepers.length, minds.watcher?.seen])] : []),
    // What ground telescopes saw of Proxima b, 2026-10-31.
    view?.proximaSeen ? `proxima ${view.proximaSeen.albedo}` : "",
  ].join("|");
  const leads = useMemo(
    () =>
      felt
        ? [...(rockKey ? [rockLead(rock!)] : []), ...(blown !== null ? [betelgeuseLead(blown)] : []), ...leadsOf(felt, holes ?? [], seeds, kept, minds, view?.proximaSeen)]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stars],
  );
  // The names our glows have earned, set before anything below reads them. 2026-11-04.
  useMemo(() => knowGlowNames(glowNames(minds)), [minds]);
  // A lead's star past the 50 ly census can be aimed at too, out to the catalog's 326 ly. 2026-10-31.
  useEffect(() => knowStars(leads.flatMap((l) => (l.at && l.at[2] > 50 ? [{ name: l.star, ra: l.at[0], dec: l.at[1], d: l.at[2], ...(l.range ? { range: l.range } : {}) }] : []))), [leads]);
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
    // What each lead has had read of it, as the Mind judges from too. Our knocks on the watcher, for its readings.
    const knocks = (save?.sent ?? []).filter((m) => target(m.to) === WATCHER).map((m) => m.y);
    const readings = readingsOf(leads, { felt, proxima, visits, watcher: minds?.watcher ?? undefined, flashes: minds?.flashes, knocks, observe, year: tenth });
    const opened = new Set(seen);
    // New until opened, or for 50 Years: a badge from Year 10 still read NEW at Year 9,104 until 2026-10-30.
    const recent = (at: number) => tenth === null || tenth - at < 50;
    const fresh = new Set(
      [
        ...Object.values(readings).flatMap((rs) => rs.filter((r) => recent(r.at)).map((r) => r.id)),
        ...heard.filter((h) => recent(h.arrived)).map(heardId),
      ].filter((id) => !opened.has(id)),
    );
    // What of ours is on its way to a star, or due back from it: a message until its soonest reply, a craft until its
    // word is home.
    const star = (name: string) => skyId(name);
    const owed = new Set<string>();
    for (const m of save?.sent ?? []) {
      const t = m.to === "everywhere" ? null : target(m.to);
      if (t && tenth !== null && tenth < dates(m.y, t.d, m.size).back) owed.add(star(t.name));
    }
    const went = new Set(visits.map((v) => star(v.star)));
    for (const o of [...(plan?.lenses ?? []), ...(plan?.sentinels ?? []), ...(plan?.seeds ?? []), ...(plan?.flybys ?? []), ...(plan?.colony ? [plan.colony] : [])])
      if (!went.has(star(o.name))) owed.add(star(o.name));
    const readable = new Set(openReadings(leads, minds, plan?.closeReads ?? [], done["Infrared Telescope"], tenth ?? 0));
    const standing: Record<string, Standing> = Object.fromEntries(
      leads.map((l) => {
        if (readable.has(l) || readings[l.slug]?.some((r) => fresh.has(r.id))) return [l.slug, "needs"];
        if (l.slug.startsWith("warm-glow-") && !l.facts.some(([k, v]) => k === "Faded" || (k === "Its light" && v.startsWith("Dust")))) return [l.slug, "watching"];
        const windows = l.art.kind === "reply" ? l.art.windows.filter((w) => w.star === l.star) : [];
        const waiting =
          owed.has(star(l.star)) || due(l.slug, observe, tenth).length > 0 || (tenth !== null && windows.some((w) => w.at > tenth));
        return [l.slug, waiting ? "waiting" : "quiet"];
      }),
    );
    return { known: view?.year, leads, ids, dials, readings, fresh, standing, heard, visits, colony, minds, look, setLook, close, setClose, step, setStep };
  }, [view?.year, leads, felt, proxima, ids, dials, observe, tenth, seen, save?.sent, plan, done, heard, visits, colony, minds, look, setLook, close, setClose, step, setStep]);
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
export function ScanMap({ className, quick = false }: { className: string; /** Lights every lead at once, for the map opening on one from our talk. */ quick?: boolean }) {
  const { leads, ids, dials, look, readings, standing } = useLeads();
  const quiet = useMemo(() => leads.map((l) => (standing[l.slug] === "needs" ? 0 : 1)), [leads, standing]);
  // Each lead glows by the Mind's word that something lives there, brighter as a reading raises it. 2026-10-29.
  const life = useMemo(
    () => leads.map((l) => {
      const word = lifeOf(l, readings[l.slug] ?? []);
      return word ? ODDS.indexOf(word) : -1;
    }),
    [leads, readings],
  );
  // A warm glow's distance on the map, and which have faded, for the view over the Milky Way. 2026-11-03.
  const notes = useMemo(
    () => Object.fromEntries(leads.flatMap((l) => (l.range && l.slug.startsWith("warm-glow-") ? [[l.star, `${l.range[0].toLocaleString("en-US")} to ${l.range[1].toLocaleString("en-US")} ly${l.facts.some(([k]) => k === "Faded") ? ", faded" : ""}`]] : []))),
    [leads],
  );
  useEffect(() => {
    Object.assign(dials, { faded: new Set(leads.filter((l) => l.slug.startsWith("warm-glow-") && l.facts.some(([k, v]) => k === "Faded" || (k === "Its light" && v.startsWith("Dust")))).map((l) => l.star)) });
  }, [dials, leads]);
  // The leads light once as the map opens, not again as a lead's system comes and goes.
  const lit = useRef(false);
  // A lead found after they lit lights too. Until all are lit the map holds no focus, so no Close View.
  const count = useRef(ids.length);
  const onReady = useCallback(
    (flight: number) => {
      if (lit.current) return;
      lit.current = true;
      gsap.killTweensOf(dials);
      if (quick || prefersReducedMotion()) return void Object.assign(dials, { grid: 1, found: count.current, calm: 1 });
      Object.assign(dials, { grid: 0, found: 0, calm: 0 });
      gsap
        .timeline({ delay: Math.max(0, flight - 0.6) })
        .to(dials, { grid: 1, duration: 1 }, 0)
        .to(dials, { found: () => count.current, duration: Math.min(3, 0.4 * count.current), ease: "power1.inOut" }, 0.4)
        // All shown first, then the quiet ones step back, so the map settles on what needs us. Playtest 2026-11-02.
        .to(dials, { calm: 1, duration: 1.6, ease: "power2.inOut" }, "+=1.2");
    },
    [dials, quick],
  );
  useEffect(() => {
    count.current = ids.length;
    if (!lit.current || gsap.isTweening(dials) || dials.found === ids.length) return;
    if (prefersReducedMotion()) return void Object.assign(dials, { found: ids.length });
    gsap.to(dials, { found: ids.length, duration: 0.6, ease: "power1.inOut", overwrite: "auto" });
  }, [dials, ids]);
  useEffect(() => () => void gsap.killTweensOf(dials), [dials]);
  return ids.length ? (
    <LeadsMap dials={dials} ids={ids} life={life} quiet={quiet} notes={notes} system={look?.system} onReady={onReady} className={className} />
  ) : null;
}

/** The Scan tab: Earth's leads, and how long a message takes to reach each. Each opens its own page. */
export function Scan() {
  const { leads, dials, readings, fresh, standing, heard } = useLeads();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const open = useOpenReadings();
  if (!leads.length) return null;
  if (params.has("review")) return <Review onClose={close} />;
  return (
    <>
      {heard.length > 0 && <Heard />}
      <LeadList leads={leads} dials={dials} readings={readings} fresh={fresh} standing={standing} readable={open} headClass={heard.length ? "mt-5" : "mt-1"} />
      <Messages />
    </>
  );
}
