import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BackBar } from "@/components/back-bar";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildBlue, buildTone, LeadMark, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { toggleBuild, usePlan, useSchedule, WASH } from "@/components/picks";
import { Lens } from "@/components/icons";
import { CRAFT_SHOT_SECS, type CraftKind } from "@/components/craft-view";
import { axis, Brings, Key, says, sooner, targetOf, Thread, tripAt, useReach, useTripLoop, year, Years } from "@/components/reach";
import { useLeads } from "@/components/scan";
import { VisitArt } from "@/components/visit-art";
import { Chances } from "@/components/chances";
import { LeadArt } from "@/components/lead-art";
import { SystemArt } from "@/components/system-art";
import { isHole, starName, visitReading } from "@/lib/game/leads";
import { Face, ListHead } from "@/components/tab-head";
import { HISTORY } from "@/lib/game/charter";
import { span, lyOf, yearText } from "@/lib/game/clock";
import { buildSlug, isOn, moves, recall } from "@/lib/game/plan";
import {
  colonyRoad,
  lensKm,
  lensRoad,
  LOCKED,
  NEAREST,
  type Road,
  roads,
  seedNeeds,
  seedReady,
  seedRoad,
  SENTINEL_NEEDS,
  sentinelReady,
  sentinelRoad,
  strikeRoad,
  shipNeeds,
  shipReady,
  toward,
  willRoad,
} from "@/lib/game/reach";
import { beamMiss, beamSeen, finishWeight, rodReady, rodTonnes, worksAU } from "@/lib/sim/speeds";
import { CATALOG } from "@/lib/sim/works";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One destination, opened from Reach: a lead's star, and every way we could go there. The two roads open at Year 0,
// by sail and by probe, are drawn on the Years they would take, each with the build it needs and the button that queues
// it or, once ordered, sends a craft here. The rest are listed locked, each with the builds it needs, every one a link to its page to
// start it, so the way ahead shows. Reach's map stays, and flies out to the star, its ruler stretched to it. Last, Close
// View flies the map into the star's system, every world known there going round. Settled 2026-10-19. Once our sails
// or probe have passed and their word is home, what they saw is drawn above the ways, 2026-10-22.

/** A build a way needs: its mark in its color, its name, and how it stands, opening its page to start it. */
/** What the beam that throws a craft shows at its star: how wide it passes, and whether an old mind awake there would
 *  see it. We aim where the star will be, so the slower the craft, the wider. lib/sim/speeds.ts's beamMiss. 2026-11-12. */
function beamLine(ly: number, beta: number, lum?: number, kms?: number) {
  if (!(ly > 0)) return "";
  const au = beamMiss(ly, beta, kms);
  const wide = au >= 31620 ? `${(au / 63241).toFixed(1)} ly` : `${Math.round(au).toLocaleString("en-US")} AU`;
  // An old mind's cold works sit where 12 K lies round its star: far out at a bright one, close in at a dim one.
  // Where we don't know the star's light, a Sun's, and said so.
  const reach = `${Math.round(worksAU(lum)).toLocaleString("en-US")} AU out${lum === undefined ? ", round a star like the Sun" : ""}`;
  return beamSeen(ly, beta, lum, kms)
    ? ` We aim where this star will be, so its beam passes the star by about ${wide}. If an old mind is awake here, its cold works reach about ${reach}, and it sees the beam as it would a knock.`
    : ` We aim where this star will be, so its beam passes the star by about ${wide}. An old mind’s cold works here would reach about ${reach}, so none sees it.`;
}

/** Days the Ship Beam pushes a seed ship to a speed, as a share of light speed: 78 to a tenth, and to its most as
 *  calcs/speeds.py has it, since a fast ship runs from the light. Between the two, by the straight line. `carries`: a
 *  small drive and its fuel ride too, and the same push takes that much longer on the heavier craft. */
const pushDays = (beta: number, carries = false) => Math.round(bareDays(beta) * (carries ? finishWeight(beta) : 1));
function bareDays(beta: number) {
  const { shipDays } = CATALOG.beams, { beam, beamDays } = CATALOG.speeds, tenth = CATALOG.seedShip.speed;
  if (beta <= beam + 1e-9) return Math.round(beta <= tenth ? (shipDays * beta) / tenth : shipDays + ((beamDays - shipDays) * (beta - tenth)) / (beam - tenth));
  // Past the Ship Beam's most, the Wide Beam's push: by the straight line between the speeds calcs/speeds.py worked.
  const { ship } = CATALOG.speeds.wide;
  const pts = [[beam, beamDays], ...ship.curve.filter(([b]) => b > beam), [ship.beam, ship.days]];
  const k = Math.max(1, pts.findIndex(([b]) => b >= beta));
  const [b0, d0] = pts[k - 1], [b1, d1] = pts[k] ?? pts[pts.length - 1];
  return Math.round(d0 + ((d1 - d0) * (Math.min(beta, b1) - b0)) / (b1 - b0));
}

function Need({ name, queued, done }: { name: string; queued: boolean; done: boolean }) {
  return (
    <Link
      to={`/play/build/${buildSlug(name)}`}
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-faint pr-2.5 pl-2 text-[12.5px] text-ink transition-colors hover:border-muted"
    >
      <span className={buildTone(name, queued || done)}>
        <BuildMark name={name} size={13} />
      </span>
      {name}
      {(queued || done) && <span className="text-muted">· {done ? "done" : "queued"}</span>}
      <span aria-hidden className="text-muted">
        ›
      </span>
    </Link>
  );
}

const WHAT: Record<string, string> = {
  strike:
    "1,000 t at a tenth of light speed, readied in 20 Years, and fired once the Helium-3 Harvest gathers its 37 kt, after any bullet before it: about 12 Years for the first, less as the harvest grows. It lands with about 110,000 Mt: a region gone, the ozone thinned, the climate cooled. Its launch flame shows only here, to a probe of theirs watching us.",
  "Laser Sail Array": "Sails weighing a few grams, pushed by a beam from Earth, fly past at a fifth of light speed.",
  "Probe Yard": "A probe built in orbit and fueled with 6 kt of deuterium from the Deuterium Works. Building one takes 12 Years once its yard and a Fusion Drive are done. It burns 20 Years to a tenth of light speed and flies past.",
  mind:
    "A copy of our Mind on the Seed Ship, to stand alone beside the hole. Feed it, and its furnace grows us fast, and shows once it passes a millionth of the Sun. Hide in it, and its heat falls in unseen, so it stays small, and safe.",
  settle:
    "A copy of our Mind on the Seed Ship, to stand alone at this star. Settle, and it mines the moons and asteroids there and builds on the star’s light, growing as it goes, and a watcher counts that as growth. Keep it small, and it builds a receiver and a cold Mind from a comet’s worth of rock, and stays that size. It brakes in on its sail, unseen. One Seed Ship, one Mind: once sent, no other place.",
  seed:
    "A seed ship with no Mind on board, built beside the Seed Ship. It brakes on its sail, unseen, and stays. It mines the moons and asteroids there to build two copies of itself, which go on to the nearest stars no probe of ours is bound for. Copies make copies, for three generations: at most seven craft. Once it leaves, it can’t be called back.",
  sentinel:
    "A probe built at the Probe Yard burns 64 kt of deuterium to reach a tenth of light speed, then brakes on a magnetic sail 1,800 km across, unseen, and ends its stop with a short burn, to stay. It watches for as long as it lasts, and sees what a pass can’t.",
  will: "The Will, sent by laser to our Mind here, to live. The crossing is dark: a Year for each light-year, with no orders and no news, while Earth goes on by our orders and charter. Then orders and news cross the light-years between us and Earth.",
  refuge: "In a refuge, our Mind spreads over small chips on the hole’s innermost orbit, so its clock runs slow and the sky goes by faster.",
  "Solar Lens": "Small sails dive past the Sun to its focus, 3 light-days out, and stay. The Sun’s gravity gathers this world’s light into a picture of its face.",
};

/** A way that sends one craft to this star, a lens or a sentinel: drawn on its Years like the two roads, with what it
 *  needs, and once we can, the button that sends it. One a star, and never taken back. 2026-10-26. */
function Sent(props: {
  road: Road;
  i: number;
  to: number;
  name: string;
  line: string;
  needs: string[];
  have(n: string): { queued: boolean; done: boolean };
  can: boolean;
  send(): void;
  what: string;
  /** Ways to send it that the Will picks between, in place of one button. */
  choices?: { label: string; send(): void }[];
  /** What was sent, once it is. */
  sentAs?: string;
  /** The Year at the row's right, in place of when its word comes home. */
  right?: string;
  /** A control beside the needs, in place of sending. */
  extra?: React.ReactNode;
  /** Cancels it, while it waits to leave. 2026-11-10. */
  recall?: () => void;
  /** Whether its road plays on the map, and what plays it, or plays it again once sent. 2026-11-08. */
  previewing: boolean;
  preview(on: boolean): void;
}) {
  const { road, i, to, name, line, needs, have, can, send, what, choices, sentAs, right, extra, recall, previewing, preview } = props;
  const sent = road.n !== null;
  // Ordered but not yet gone says when it goes: "Sail sent" read as flying while the Laser Sail Array was only queued.
  // Blind playtest 2026-11-07.
  const now = useGame().year ?? 0;
  const waiting = sent && road.leaves !== null && now < road.leaves;
  // A send is never taken back once it leaves, so it asks once before it goes. Playtest 2026-11-01: a seed probe went
  // in one tap.
  const [asking, setAsking] = useState<{ label: string; send(): void } | null>(null);
  return (
    <li data-m style={buildBlue(needs[0])} className="border-t border-faint py-2.5">
      {/* Its head plays its road on the map, the craft up close where we have one, and again to stop. 2026-11-08. */}
      <button onClick={() => preview(!previewing)} aria-pressed={previewing} className={`block w-full text-left transition-colors duration-200 ${previewing ? WASH : ""}`}>
        <Face
          mark={<BuildMark name={needs[0]} />}
          tone={buildTone(needs[0], sent)}
          name={<b className="font-semibold">{name}</b>}
          line={line}
          right={right ?? ((road.home ?? (road.craft === "The Will" ? road.arrives : null)) === null ? "Not yet" : `Year ${year((road.home ?? road.arrives)!)}`)}
          more={false}
        />
      </button>
      <div className="pl-7">
        <div className="mt-1.5 mb-1">
          <Brings road={road} />
        </div>
        <Thread road={road} i={i} to={to} />
        <div className="flex items-center justify-between gap-3">
          <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
            Needs
            {needs.map((n) => (
              <Need key={n} name={n} {...have(n)} />
            ))}
          </span>
          {extra}
          {can && !asking && (sent || !choices) && !(waiting && recall) && (
            <button
              disabled={sent}
              onClick={() => setAsking({ label: `Send it`, send })}
              className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ${sent ? "border border-faint text-muted" : "bg-ink text-paper"}`}
            >
              {sent ? (sentAs ?? (waiting ? `${what[0].toUpperCase()}${what.slice(1)} leaves Year ${year(road.leaves!)}` : `${what} sent`)) : `Send a ${what}`}
            </button>
          )}
          {can && !sent && !asking && choices && (
            <span className="flex shrink-0 gap-1.5">
              {choices.map((c) => (
                <button key={c.label} onClick={() => setAsking(c)} className="h-8 rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper">
                  {c.label}
                </button>
              ))}
            </span>
          )}
        </div>
        {/* Waiting to leave, it says when on its own line, with Cancel: beside the needs, the two buttons squeezed the
            needs to two lines each and ran off the panel. 2026-11-10. */}
        {waiting && recall && (
          <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
            <span className="text-[12.5px] text-muted">Leaves Year {year(road.leaves!)}.</span>
            <button onClick={recall} className="h-8 rounded-full border border-faint px-3.5 text-[13px] font-medium hover:border-ink">
              Cancel
            </button>
          </div>
        )}
        {/* The ask sits on its own line: beside the needs it ran off the panel, playtest 2026-11-01. */}
        {can && !sent && asking && (
          <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5">
            <span className="text-[12.5px] text-muted">{recall ? "We can cancel it until it leaves." : "Can’t be called back."}</span>
            <button onClick={() => setAsking(null)} className="h-8 rounded-full border border-faint px-3.5 text-[13px] font-medium">
              Wait
            </button>
            <button
              onClick={() => {
                asking.send();
                setAsking(null);
                // Sent, it shows on the map at once, before Begin too. 2026-11-08.
                preview(true);
              }}
              className="h-8 rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper"
            >
              {asking.label}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export function DestinationPage({ slug }: { slug: string }) {
  const { leads, visits, colony, readings } = useLeads();
  const { aim, close, setClose, setTrip, showCraft } = useReach();
  const { save, year: clock, orderAt, moveWill } = useGame();
  const { plan, change } = usePlan();
  const { scale, done: doneBy } = useSchedule();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const i = leads.findIndex((l) => l.slug === slug);
  const lead = leads[i];

  // Begun now: Year 0 before Begin, and after it the tenth of a Year.
  const before = clock === null;
  // Ordered from a hole, it begins on Earth a light-time later. 2026-10-26.
  const from = before ? 0 : Math.floor((orderAt ?? clock) * 10) / 10;
  // The Ship Beam, in our order and kept dark by the Will: plan.ts's SWITCHED. 2026-11-11.
  const dark = (plan.builds.includes("Ship Beam") || (plan.later ?? []).some((o) => o.name === "Ship Beam")) && !isOn(plan, "Ship Beam", from);
  const ly = lead?.ly ?? 0;
  const nearest = lead?.star === NEAREST.name;
  const ways = useMemo(() => roads(plan, scale, from).map((r) => toward(r, ly, nearest ? undefined : from)), [plan, scale, from, ly, nearest]);
  // The same roads as we fly them: Proxima's first flies by itself once queued before Begin, and any other is sent from
  // here, dated from its order. Until 2026-11-05 no sail or probe could go anywhere but Proxima.
  const flown = useMemo(
    () =>
      roads(plan, scale, from).map((r, k) => {
        const sent = plan.flybys?.find((o) => o.name === lead?.star && o.by === (k ? "probe" : "sails"));
        const auto = nearest && r.n !== null;
        return { ...(auto ? toward(r, ly) : toward(r, ly, sent?.y ?? from)), n: auto || sent ? 1 : null };
      }),
    [plan, scale, from, ly, nearest, lead?.star],
  );
  const tip = useMemo(() => sooner(plan, scale, from, ways[1].home, ly), [plan, scale, from, ways, ly]);
  const slow = useMemo(() => (before ? moves(plan, scale, "Probe Yard").late : null), [before, plan, scale]);
  // A lens pictures only a world we know, one lens a star: one we have felt, or the world next door, 2026-11-10.
  const felt = lead?.what === "A new world";
  const lens = useMemo(() => ((felt || lead?.slug === "proxima-centauri") && lead ? lensRoad(plan, scale, from, lead.star) : null), [felt, lead, plan, scale, from]);
  // A sentinel can go wherever a world is known, the world next door or one we've felt, or to a black hole we found.
  // Or to a cold glow's star, to see what glows, out to 326 ly. 2026-10-31. Or to a warm glow: it brakes once it sees
  // the glow up close, so a range is enough, and sees what makes the heat. 2026-11-05.
  const stay = useMemo(
    () =>
      lead && (felt || lead.slug === "proxima-centauri" || isHole(lead.art) || lead.slug.startsWith("cold-glow-") || lead.slug.startsWith("warm-glow-")) ? sentinelRoad(plan, scale, from, lead.star, lead.ly) : null,
    [felt, lead, plan, scale, from],
  );
  // A seed probe goes where there is rock to copy itself from: the world next door, or a world we've felt. 2026-10-26.
  const seed = useMemo(
    () => (lead && (felt || lead.slug === "proxima-centauri") ? seedRoad(plan, scale, from, lead.star, lead.ly) : null),
    [felt, lead, plan, scale, from],
  );
  // What a mind can do to us, we can do here: fire on this star. 2026-10-28. Screens retired 2026-10-31.
  const bullet = useMemo(() => (lead ? strikeRoad(plan, scale, from, lead.star, lead.ly) : null), [lead, plan, scale, from]);
  // Our Mind can go to a black hole, a furnace to feed or a shadow to hide in, 2026-10-26, or settle where a seed probe
  // could, on a star's light and rock, 2026-10-27.
  const hole = !!lead && isHole(lead.art);
  const settles = !!lead && !hole && (felt || lead.slug === "proxima-centauri");
  const mind = useMemo(() => (lead && (hole || settles) ? colonyRoad(plan, scale, from, lead.star, lead.ly) : null), [lead, hole, settles, plan, scale, from]);
  // The Will can move to our Mind here once the Mind Link is done and word has come that it stands. 2026-10-26.
  const ours = mind && plan.colony?.name === lead!.star && colony?.star === lead!.star && !colony.lost ? colony : null;
  const heard = ours?.stands !== undefined && ours.d !== undefined ? ours.stands + ours.d : null;
  const gone = save?.will && save.will.hole === lead?.star ? save.will : undefined;
  const here = !!ours;
  const will = useMemo(() => (here ? willRoad(plan, scale, from, ly, heard, gone) : null), [here, plan, scale, from, ly, heard, gone]);
  const rate = ours?.mode === "refuge" && ours.clock ? 1 / ours.clock : 1;
  const inOrder = (n: string) => plan.builds.includes(n) || (plan.later ?? []).some((o) => o.name === n);
  const { to, step } = axis([...flown, ...(lens ? [lens] : []), ...(stay ? [stay] : []), ...(seed ? [seed] : []), ...(mind ? [mind] : []), ...(will ? [will] : [])]);

  // Reach's map flies out to the star while the page is open, and back to the nearest star when we leave.
  const star = lead?.star;
  const system = lead?.system;
  const range = lead?.range;
  useEffect(() => {
    if (!star) return;
    aim(targetOf(star, ly, system, range));
    return () => aim(null);
  }, [aim, star, ly, system, range]);

  // A way picked plays its road on the map, out and its word home, as the walk's do, its craft up close where we have
  // one. Opened from a flyby on Reach, that craft shows up close. 2026-11-08.
  const [previewing, setPreviewing] = useState<string | null>(null);
  const plays: Record<string, { road: Road | null; craft: CraftKind | null }> = {
    sails: { road: flown[0], craft: "sail" },
    probe: { road: flown[1], craft: "probe" },
    lens: { road: lens, craft: null },
    mind: { road: mind, craft: null },
    // The Will crosses at light speed and sends no word of its own, so its road ends as it arrives.
    will: { road: will && { ...will, home: will.arrives }, craft: null },
    sentinel: { road: stay, craft: "sentinel" },
    seed: { road: seed, craft: null },
    // A bullet sends nothing home: its road ends as it lands.
    bullet: { road: bullet, craft: null },
  };
  const playing = previewing ? plays[previewing] : null;
  useTripLoop(playing?.road ?? null, undefined, playing?.craft ? CRAFT_SHOT_SECS - 1 : 0);
  const playingCraft = playing?.craft ?? null;
  useEffect(() => {
    if (!playingCraft) return;
    showCraft(playingCraft);
    return () => showCraft(null);
  }, [playingCraft, previewing, showCraft]);
  const came = useLocation().state as { craft?: CraftKind | null; engage?: boolean } | null;
  const cameWith = came?.craft;
  // Engage on a lead lands on how we send, not on the facts again: blind first-timers, five runs of six, met the
  // facts they had just read, saw no send, and scrolled or asked the Mind. 2026-11-08.
  const send = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!came?.engage) return;
    const t = setTimeout(() => send.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
    return () => clearTimeout(t);
  }, [came?.engage, slug]);
  useEffect(() => {
    if (!cameWith) return;
    showCraft(cameWith);
    return () => showCraft(null);
  }, [cameWith, showCraft]);
  const way = (key: string) => ({
    previewing: previewing === key,
    preview: (on: boolean) => {
      // Sent again while it plays, the close-up runs again.
      const c = plays[key]?.craft;
      if (on && previewing === key && c) showCraft(c);
      setPreviewing(on ? key : null);
    },
  });

  // Our craft here on the map: the one whose word comes home soonest, on its way, then its word coming back. 2026-11-05.
  // A way playing holds the map meanwhile.
  const tenth = clock === null || previewing ? null : Math.floor(clock * 10) / 10;
  const going = tenth === null
    ? null
    : [...flown, ...(stay ? [stay] : []), ...(seed ? [seed] : [])]
        .filter((r) => r.n !== null && r.home !== null && r.home > tenth)
        .sort((a, b) => a.home! - b.home!)[0];
  const trip = going && tenth !== null ? tripAt(going, tenth) : null;
  const [tripCraft, tripSignal] = [trip?.craft, trip?.signal];
  useEffect(() => {
    if (tripCraft === undefined) return;
    setTrip({ craft: tripCraft, signal: tripSignal! });
    return () => setTrip(null);
  }, [setTrip, tripCraft, tripSignal]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate("/play/reach");
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [navigate]);

  useGSAP(
    () => {
      if (!lead || prefersReducedMotion()) return;
      gsap.fromTo("[data-m]", riseFrom, { ...rise, stagger: 0.05 });
      // Each road draws out along its Years.
      const draw = { attr: { width: 360 }, duration: 1.4, stagger: 0.3, delay: 0.4, ease: "power2.inOut" };
      gsap.fromTo('[data-reach="road"]', { attr: { width: 0 } }, draw);
    },
    { scope: root, dependencies: [lead?.slug] },
  );

  if (!leads.length || !save) return null;
  if (!lead)
    return (
      <p className="mt-2 text-sm text-muted">
        We have no destination by that name.{" "}
        <Link to="/play/reach" className="text-ink underline underline-offset-2">
          Back to Reach
        </Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <BackBar to="/play/reach" label="All destinations" />
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className={`mt-[4px] shrink-0 ${lead.reply ? "text-other" : "text-you"}`}>
          <LeadMark art={lead.art} size={18} />
        </span>
        <h1 className="text-[19px] leading-snug font-medium">{starName(lead.star)}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.what} · {lead.range ? `${lyOf(lead.range[0])} to ${lyOf(lead.range[1])}` : lyOf(lead.ly)} ly · a message takes{" "}
        <span className="font-mono tabular-nums">{lead.range ? `${span(lead.range[0])} to ${span(lead.range[1])}` : span(lead.ly)}</span> ·{" "}
        <Link to={`/play/lead/${lead.slug}`} className="whitespace-nowrap text-you">
          Its lead ›
        </Link>
      </p>

      {visits
        .filter((v) => v.star === lead.star)
        .map((v) => {
          const r = visitReading(v);
          return (
            <section key={r.id} data-m className="mt-4 flex items-center gap-3 rounded-xl border border-other/50 bg-other/[.05] p-3">
              <VisitArt sight={v.sight} size={96} />
              <div className="min-w-0">
                <span className="font-mono text-[10px] tracking-[.1em] text-other uppercase">
                  {v.world} · {r.by} · Year {yearText(r.at)}
                </span>
                <h2 className="mt-0.5 text-[16px] leading-snug font-semibold">{r.title}</h2>
                <p className="mt-0.5 text-[13px] leading-snug text-page-ink2">{r.line}</p>
              </div>
            </section>
          );
        })}

      {/* What we know of it, where we choose how to go: "is it habitable? what is the system like?" had to be asked,
          playtest 2026-11-05. Its latest word, its system or its art, what we measured, and its chances. */}
      {lead.art.kind !== "near" && (
        <section data-m className="mt-4 rounded-xl border border-faint bg-paper px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">What we know</span>
            {lead.system && (
              <button onClick={() => setClose(!close)} className="flex h-7 items-center gap-1.5 rounded-full border border-faint px-3 text-[12.5px] hover:border-muted">
                <Lens closer={!close} size={13} />
                {close ? "Pull back" : "See its system"}
              </button>
            )}
          </div>
          <p className="mt-1 text-[14px] leading-snug">{(readings[lead.slug] ?? []).at(-1)?.title ?? lead.line}</p>
          <div className="mt-2 rounded-lg border border-faint px-2 py-1">
            {lead.system && lead.art.kind === "orbit" ? <SystemArt system={lead.system} /> : <LeadArt art={lead.art} />}
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px] leading-snug">
            {lead.facts.slice(0, 5).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Chances lead={lead} readings={readings[lead.slug] ?? []} className="mt-2.5" />
        </section>
      )}

      {/* A message is a way to engage too, and the fastest, so it leads: a blind first-timer looked down this list for
          one, found only craft, and had to guess to ask the Mind. At its foot, a second missed it. 2026-11-07. */}
      <Link
        ref={send}
        data-m
        to={`/play/mind?ask=${encodeURIComponent(`We want to send a message to ${lead.star}. What should it say, and what does it risk?`)}`}
        className="mt-5 block rounded-lg border border-you/40 px-3 py-2.5 text-[13.5px] leading-snug"
      >
        <b className="font-semibold">Send a message</b>
        <span className="block text-page-ink2">
          It goes at the speed of light, sooner than any craft. The Mind drafts it, and we send it. Or send a craft, below. <span className="text-you">Ask the Mind to draft it ›</span>
        </span>
      </Link>
      {/* A glow gone dark says so before we send: a blind first-timer sent a probe to one that had already faded, with no
          word of it here. 2026-11-07. */}
      {lead?.facts.find(([k]) => k === "Faded") && (
        <p data-m className="mt-4 text-[13px] leading-snug text-other">
          It faded by {lead.facts.find(([k]) => k === "Faded")![1]}. A craft sent now finds only what is left there.
        </p>
      )}
      <ListHead data-m left={`Ways to engage · ${ways.length + (lens ? 1 : 0) + (stay ? 1 : 0) + (mind ? 1 : 0) + LOCKED.length}`} right="Passes" className="mt-5" />
      <ul className="mt-1">
        {flown.map((road, k) => {
          const by = k ? "probe" : "sails";
          // Before Begin, Proxima's roads and any build not yet ordered queue here. Once ordered, a craft is sent.
          const queues = before && (nearest || !inOrder(road.build));
          return (
            <Sent
              key={road.name}
              road={road}
              i={k}
              to={to}
              name={road.name}
              line={k && road.push ? `A probe built in orbit in 12 Years, with no engine and no fuel. The ${road.push} throws it on a sail a kilometer wide${road.push === "Wide Beam" ? `, stepping through four colors: up to ${CATALOG.speeds.wide.probe.days}` : `: ${CATALOG.speeds.probe.days}`} days of push to ${road.speed.toFixed(2)} of light speed, and it flies past.${beamLine(ly, road.speed, lead?.lum, lead?.kms)}` : `${WHAT[road.build]}${k ? "" : beamLine(ly, road.speed, lead?.lum, lead?.kms)}`}
              needs={[road.build]}
              have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
              can={!queues && inOrder(road.build)}
              send={() => change((p) => ({ ...p, flybys: [...(p.flybys ?? []), { name: lead.star, y: from, d: ly, by }] }))}
              what={k ? "Probe" : "Sail"}
              {...way(by)}
              // Only one we sent from here: Proxima's first flies by itself with its build.
              recall={plan.flybys?.some((o) => o.name === lead.star && o.by === by) ? () => change((p) => recall(p, by, lead.star)) : undefined}
              right={road.arrives === null ? "Not yet" : `Year ${year(road.arrives)}`}
              extra={
                queues && (
                  <button
                    onClick={() => {
                      // Queued, its road plays on the map, as a tap on its head does. 2026-11-08.
                      if (!plan.builds.includes(road.build)) way(by).preview(true);
                      change(toggleBuild(road.build));
                    }}
                    className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ${plan.builds.includes(road.build) ? "border border-ink" : "bg-ink text-paper"}`}
                  >
                    {plan.builds.includes(road.build) ? "Remove from Queue" : "Add to Queue"}
                  </button>
                )
              }
            />
          );
        })}
        {lens && (
          <Sent
            road={lens}
            i={ways.length}
            to={to}
            name="A lens at the Sun’s focus"
            line={`${WHAT["Solar Lens"]} About ${Math.round(lensKm(lead.ly))} km a pixel here.${lens.push === "Star Beam" ? " The Star Beam pushes it there instead, in about ten weeks." : lens.push ? ` The ${lens.push} pushes it there instead, in about 5 Years.` : ""}`}
            needs={["Solar Lens"]}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Sent once the Solar Lens is ordered: it leaves when it is done. One a star, canceled only before it leaves.
            can={!before && inOrder("Solar Lens")}
            send={() => change((p) => ({ ...p, lenses: [...(p.lenses ?? []), { name: lead.star, y: from }] }))}
            what="Lens"
            {...way("lens")}
            recall={() => change((p) => recall(p, "lens", lead.star))}
          />
        )}
        {mind && (
          <Sent
            road={mind}
            i={ways.length + 2}
            to={to}
            name="Our Mind, to stay"
            line={`${hole ? WHAT.mind : WHAT.settle}${mind.push ? ` The ${mind.push} pushes it to speed in ${pushDays(mind.speed, mind.carries)} days, ${mind.carries ? "with a small drive and its fuel aboard to end its stop" : "with no drive or fuel"}.${beamLine(ly, mind.speed, lead?.lum, lead?.kms)}` : ""}${dark ? " We keep the Ship Beam dark, so it won’t push." : ""}`}
            needs={shipNeeds(plan)}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // One Seed Ship, one Mind: once sent to one hole, no other. Sent once all three are in our order.
            can={shipReady(plan) && (!plan.colony || plan.colony.name === lead.star)}
            send={() => {}}
            what="Mind"
            {...way("mind")}
            sentAs={plan.colony?.mode === "furnace" ? "Sent, to feed it" : plan.colony?.mode === "refuge" ? "Sent, to hide" : plan.colony?.mode === "quiet" ? "Sent, to keep small" : "Sent, to settle"}
            choices={(hole ? (["furnace", "refuge"] as const) : (["quiet", "settle"] as const)).map((mode) => ({
              label: mode === "furnace" ? "Feed It" : mode === "refuge" ? "Hide in It" : mode === "quiet" ? "Keep Small" : "Settle Here",
              send: () => change((p) => ({ ...p, colony: { name: lead.star, y: from, mode, d: ly } })),
            }))}
          />
        )}
        {will && (
          <Sent
            road={will}
            i={ways.length + 3}
            to={to}
            name="The Will, to live here"
            line={`${WHAT.will} ${!hole ? "" : rate > 1 ? `${WHAT.refuge} Here ${rate.toFixed(1)} of the sky’s Years would pass in each of ours.` : "A furnace’s disk fills that orbit, so here our clock runs as Earth’s."}`.trim()}
            needs={["Mind Link"]}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Once, for good: the Will leaves Earth now, dark until all of it has arrived, and lives here then.
            can={!before && !save?.will && will.leaves !== null && will.leaves <= from + 0.05}
            send={() => {}}
            what="Will"
            {...way("will")}
            sentAs={(clock ?? 0) >= will.arrives! ? "The Will lives here" : "The Will is going"}
            choices={[{ label: "Move Here", send: () => moveWill({ hole: lead.star, d: lead.ly, y: will.leaves!, at: will.arrives!, rate }) }]}
          />
        )}
        {stay && (
          <Sent
            road={stay}
            i={ways.length + 1}
            to={to}
            name="A sentinel that stays"
            line={WHAT.sentinel}
            needs={SENTINEL_NEEDS}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Sent once all three are in our order, before Begin too: it is built once they are done.
            can={sentinelReady(plan)}
            send={() => change((p) => ({ ...p, sentinels: [...(p.sentinels ?? []), { name: lead.star, y: from }] }))}
            what="Sentinel"
            {...way("sentinel")}
            recall={() => change((p) => recall(p, "sentinel", lead.star))}
          />
        )}
        {seed && (
          <Sent
            road={seed}
            i={ways.length + 4}
            to={to}
            name="A seed probe that copies itself"
            line={`${WHAT.seed}${seed.push ? ` The ${seed.push} pushes it to speed in ${pushDays(seed.speed, seed.carries)} days, ${seed.carries ? "with a small drive and its fuel aboard to end its stop" : "with no drive or fuel"}.${beamLine(ly, seed.speed, lead?.lum, lead?.kms)}` : ""}${dark ? " We keep the Ship Beam dark, so it won’t push." : ""}`}
            needs={seedNeeds(plan)}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Sent once all three are in our order, before Begin too: it is built once they are done.
            can={seedReady(plan)}
            send={() => change((p) => ({ ...p, seeds: [...(p.seeds ?? []), { name: lead.star, y: from, d: ly }] }))}
            what="Seed probe"
            {...way("seed")}
            recall={() => change((p) => recall(p, "seed", lead.star))}
          />
        )}
        {bullet && (
          <Sent
            road={bullet}
            i={ways.length + 6}
            to={to}
            name="A bullet, fired here"
            line={
              // What it would strike, and what we would see of it: a bullet needs a world whose path we know, and
              // nothing comes home from one. lib/sim/strikes.ts, 2026-11-12.
              (bullet.push
                ? `${
                    bullet.push === "Wide Beam"
                      ? `A rod of ${rodTonnes(ly, "wide").toFixed(1)} t with no engine, readied in about ${Math.round(rodReady(ly, "wide") * 365.25)} days. The Wide Beam throws it, stepping through four colors: ${CATALOG.speeds.wide.rod.days}`
                      : `A rod of ${Math.round(CATALOG.speeds.rod.tonnes)} t with no engine, readied in about ${Math.round(CATALOG.speeds.rod.ready * 12)} months. The Ship Beam throws it: ${CATALOG.speeds.rod.days}`
                  } days of push to ${bullet.speed.toFixed(2)} of light speed, with no helium-3. It lands as hard as a bullet, with about 110,000 Mt: a region gone, the ozone thinned, the climate cooled.${beamLine(ly, bullet.speed, lead?.lum, lead?.kms)}`
                : WHAT.strike) +
              (settles
                ? " Nothing comes home from a bullet. Its flash would about double this world’s light for three minutes: only a telescope that splits the world from its star sees that, or a sentinel of ours here."
                : " We know no world here to aim it at, so it would strike nothing we know of and fly on.")
            }
            needs={bullet.push ? ["Strike Yard", bullet.push] : ["Strike Yard", "Helium-3 Harvest"]}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Ordered only in play, once the Strike Yard is in our order. One a star, and never taken back.
            can={!before && inOrder("Strike Yard")}
            send={() => {}}
            what="Bullet"
            {...way("bullet")}
            sentAs={bullet.leaves !== null && (clock ?? 0) >= bullet.leaves ? "Fired" : "Readying"}
            choices={[{ label: "Fire Here", send: () => change((p) => ({ ...p, strikes: [...(p.strikes ?? []), { name: lead!.star, y: from, d: lead!.ly }] })) }]}
          />
        )}
        <li data-m className="pl-7">
          <Years to={to} step={step} />
          <Key />
        </li>
        {LOCKED.map((w) => (
          <li key={w.key} data-m className="border-t border-faint py-2.5">
            <Face
              mark={<LockMark />}
              tone="text-muted"
              name={<b className="font-semibold text-page-ink2">{w.name}</b>}
              line={w.line}
              right="Not yet"
              more={false}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-7 text-[12.5px] text-muted">
              Needs
              {w.needs.map((n) => (
                <Need
                  key={n}
                  name={n}
                  queued={plan.builds.includes(n)}
                  done={!before && (doneBy[n] ?? Infinity) <= clock}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div data-m className="mt-4">
        <MindNote className="text-[14.5px] leading-snug">
          {says(lead.star, plan, save.charter?.dials ?? HISTORY, ways, tip, slow, before)}
        </MindNote>
      </div>
      {lead.system && (
        <button
          data-m
          onClick={() => setClose(!close)}
          className="mt-6 flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-full border border-ink text-[15px] font-medium"
        >
          <Lens closer={!close} size={17} />
          {close ? "Pull Back" : "Close View"}
        </button>
      )}
    </div>
  );
}
