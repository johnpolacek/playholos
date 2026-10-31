import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useRef } from "react";
import { BackBar } from "@/components/back-bar";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildBlue, buildTone, LeadMark, LockMark } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { Lens } from "@/components/icons";
import { axis, Brings, Key, says, sooner, Thread, useReach, year, Years } from "@/components/reach";
import { useLeads } from "@/components/scan";
import { VisitArt } from "@/components/visit-art";
import { isHole, skyId, starName, visitReading } from "@/lib/game/leads";
import { Face, ListHead } from "@/components/tab-head";
import { HISTORY } from "@/lib/game/charter";
import { span, lyOf, yearText } from "@/lib/game/clock";
import { buildSlug, moves } from "@/lib/game/plan";
import {
  colonyRoad,
  lensKm,
  lensRoad,
  LOCKED,
  type Road,
  roads,
  SEED_NEEDS,
  seedReady,
  seedRoad,
  SENTINEL_NEEDS,
  sentinelReady,
  sentinelRoad,
  strikeRoad,
  SHIP_NEEDS,
  shipReady,
  toward,
  willRoad,
} from "@/lib/game/reach";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One destination, opened from Reach: a lead's star, and every way we could go there. The two roads open at Year 0,
// by sail and by probe, are drawn on the Years they would take, each with the build it needs and, before Begin, the
// button that queues it. The rest are listed locked, each with the builds it needs, every one a link to its page to
// start it, so the way ahead shows. Reach's map stays, and flies out to the star, its ruler stretched to it. Last, Close
// View flies the map into the star's system, every world known there going round. Settled 2026-10-19. Once our sails
// or probe have passed and their word is home, what they saw is drawn above the ways, 2026-10-22.

/** A build a way needs: its mark in its color, its name, and how it stands, opening its page to start it. */
function Need({ name, queued, done }: { name: string; queued: boolean; done: boolean }) {
  return (
    <Link
      to={`/build/${buildSlug(name)}`}
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
  "Probe Yard": "A probe built and fueled in orbit. It leaves 12 Years after its yard is done and flies past at an eighth of light speed.",
  mind:
    "A copy of our Mind on the Seed Ship, to stand alone beside the hole. Feed it, and its furnace grows us fast, and shows once it passes a millionth of the Sun. Hide in it, and its heat falls in unseen, so it stays small, and safe.",
  settle:
    "A copy of our Mind on the Seed Ship, to stand alone at this star. Settle, and it mines the moons and asteroids there and builds on the star’s light, growing as it goes, and a watcher counts that as growth. Keep it small, and it builds a receiver and a cold Mind from a comet’s worth of rock, and stays that size. Anyone living here sees its flame as it brakes in. One Seed Ship, one Mind: once sent, no other place.",
  seed:
    "A seed ship with no Mind on board, built beside the Seed Ship. It brakes on its sail, unseen, and stays. It mines the moons and asteroids there to build two copies of itself, which go on to the nearest stars no probe of ours is bound for. Copies make copies, for three generations: at most seven craft. Once sent, it can’t be called back.",
  sentinel:
    "A probe built at the Probe Yard flies at a tenth of light speed and brakes on its fusion flame to stay. It watches for as long as it lasts, and sees what a pass can’t.",
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
}) {
  const { road, i, to, name, line, needs, have, can, send, what, choices, sentAs } = props;
  const sent = road.n !== null;
  return (
    <li data-m style={buildBlue(needs[0])} className="border-t border-faint py-2.5">
      <Face
        mark={<BuildMark name={needs[0]} />}
        tone={buildTone(needs[0], sent)}
        name={<b className="font-semibold">{name}</b>}
        line={line}
        right={(road.home ?? (road.craft === "The Will" ? road.arrives : null)) === null ? "Not yet" : `Year ${year((road.home ?? road.arrives)!)}`}
        more={false}
      />
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
          {can && (sent || !choices) && (
            <button
              disabled={sent}
              onClick={send}
              className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ${sent ? "border border-faint text-muted" : "bg-ink text-paper"}`}
            >
              {sent ? (sentAs ?? `${what} sent`) : `Send a ${what}`}
            </button>
          )}
          {can && !sent && choices && (
            <span className="flex shrink-0 gap-1.5">
              {choices.map((c) => (
                <button key={c.label} onClick={c.send} className="h-8 rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper">
                  {c.label}
                </button>
              ))}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function DestinationPage({ slug }: { slug: string }) {
  const { leads, visits, colony } = useLeads();
  const { aim, close, setClose } = useReach();
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
  const ly = lead?.ly ?? 0;
  const ways = useMemo(() => roads(plan, scale, from).map((r) => toward(r, ly)), [plan, scale, from, ly]);
  const tip = useMemo(() => sooner(plan, scale, from, ways[1].home, ly), [plan, scale, from, ways, ly]);
  const slow = useMemo(() => (before ? moves(plan, scale, "Probe Yard").late : null), [before, plan, scale]);
  // A lens pictures only a world we have felt, one lens a star. 2026-10-26.
  const felt = lead?.what === "A new world";
  const lens = useMemo(() => (felt && lead ? lensRoad(plan, scale, from, lead.star) : null), [felt, lead, plan, scale, from]);
  // A sentinel can go wherever a world is known, the world next door or one we've felt, or to a black hole we found.
  const stay = useMemo(
    () =>
      lead && (felt || lead.slug === "proxima-centauri" || isHole(lead.art)) ? sentinelRoad(plan, scale, from, lead.star, lead.ly) : null,
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
  const { to, step } = axis([...ways, ...(lens ? [lens] : []), ...(stay ? [stay] : []), ...(seed ? [seed] : []), ...(mind ? [mind] : []), ...(will ? [will] : [])]);

  // Reach's map flies out to the star while the page is open, and back to the nearest star when we leave.
  const star = lead?.star;
  const system = lead?.system;
  useEffect(() => {
    if (!star) return;
    aim({ id: skyId(star), name: star, ly, system });
    return () => aim(null);
  }, [aim, star, ly, system]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && navigate("/reach");
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
        <Link to="/reach" className="text-ink underline underline-offset-2">
          Back to Reach
        </Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <BackBar to="/reach" label="All destinations" />
      </div>
      <div data-m className="mt-1 flex items-start gap-2.5">
        <span className={`mt-[4px] shrink-0 ${lead.reply ? "text-other" : "text-you"}`}>
          <LeadMark art={lead.art} size={18} />
        </span>
        <h1 className="text-[19px] leading-snug font-medium">{starName(lead.star)}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.what} · {lead.range ? `${lyOf(lead.range[0])} to ${lyOf(lead.range[1])}` : lyOf(lead.ly)} ly · a message takes{" "}
        <span className="font-mono tabular-nums">{span(lead.ly)}</span> ·{" "}
        <Link to={`/lead/${lead.slug}`} className="whitespace-nowrap text-you">
          Its lead ›
        </Link>
      </p>

      {visits
        .filter((v) => v.star === lead.star)
        .map((v) => {
          const r = visitReading(v);
          return (
            <section key={r.id} data-m className="mt-4 flex items-center gap-3 rounded-xl border border-other/50 bg-other/[.05] p-3">
              <VisitArt sight={v.sight} elder={v.elder} size={96} />
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

      <ListHead data-m left={`Ways to go · ${ways.length + (lens ? 1 : 0) + (stay ? 1 : 0) + (mind ? 1 : 0) + LOCKED.length}`} right="Passes" className="mt-5" />
      <ul className="mt-1">
        {ways.map((road, k) => {
          const queued = road.n !== null;
          const done = !before && road.done !== null && clock >= road.done;
          return (
            // The road's lines take its build's color, as on Build.
            <li key={road.name} data-m style={buildBlue(road.build)} className="border-t border-faint py-2.5">
              <Face
                mark={<BuildMark name={road.build} />}
                tone={buildTone(road.build, queued)}
                name={<b className="font-semibold">{road.name}</b>}
                line={WHAT[road.build]}
                right={road.arrives === null ? "Not yet" : `Year ${year(road.arrives)}`}
                more={false}
              />
              <div className="pl-7">
                <div className="mt-1.5 mb-1">
                  <Brings road={road} />
                </div>
                <Thread road={road} i={k} to={to} />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                    Needs <Need name={road.build} queued={queued} done={done} />
                  </span>
                  {before && (
                    <button
                      onClick={() => change(toggleBuild(road.build))}
                      className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ${queued ? "border border-ink" : "bg-ink text-paper"}`}
                    >
                      {queued ? "Remove from Queue" : "Add to Queue"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {lens && (
          <Sent
            road={lens}
            i={ways.length}
            to={to}
            name="A lens at the Sun’s focus"
            line={`${WHAT["Solar Lens"]} About ${Math.round(lensKm(lead.ly))} km a pixel here.${lens.push === "Star Beam" ? " The Star Beam pushes it there instead, in about two months." : lens.push ? ` The ${lens.push} pushes it there instead, in about 5 Years.` : ""}`}
            needs={["Solar Lens"]}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Sent once the Solar Lens is ordered: it leaves when it is done. One a star, and never taken back.
            can={!before && inOrder("Solar Lens")}
            send={() => change((p) => ({ ...p, lenses: [...(p.lenses ?? []), { name: lead.star, y: from }] }))}
            what="Lens"
          />
        )}
        {mind && (
          <Sent
            road={mind}
            i={ways.length + 2}
            to={to}
            name="Our Mind, to stay"
            line={hole ? WHAT.mind : WHAT.settle}
            needs={SHIP_NEEDS}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // One Seed Ship, one Mind: once sent to one hole, no other. Sent once all three are in our order.
            can={shipReady(plan) && (!plan.colony || plan.colony.name === lead.star)}
            send={() => {}}
            what="Mind"
            sentAs={plan.colony?.mode === "furnace" ? "Sent, to feed it" : plan.colony?.mode === "refuge" ? "Sent, to hide" : plan.colony?.mode === "quiet" ? "Sent, to keep small" : "Sent, to settle"}
            choices={(hole ? (["furnace", "refuge"] as const) : (["quiet", "settle"] as const)).map((mode) => ({
              label: mode === "furnace" ? "Feed It" : mode === "refuge" ? "Hide in It" : mode === "quiet" ? "Keep Small" : "Settle Here",
              send: () => change((p) => ({ ...p, colony: { name: lead.star, y: from, mode } })),
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
          />
        )}
        {seed && (
          <Sent
            road={seed}
            i={ways.length + 4}
            to={to}
            name="A seed probe that copies itself"
            line={WHAT.seed}
            needs={SEED_NEEDS}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Sent once all three are in our order, before Begin too: it is built once they are done.
            can={seedReady(plan)}
            send={() => change((p) => ({ ...p, seeds: [...(p.seeds ?? []), { name: lead.star, y: from }] }))}
            what="Seed probe"
          />
        )}
        {bullet && (
          <Sent
            road={bullet}
            i={ways.length + 6}
            to={to}
            name="A bullet, fired here"
            line={WHAT.strike}
            needs={["Strike Yard", "Helium-3 Harvest"]}
            have={(n) => ({ queued: inOrder(n), done: !before && (doneBy[n] ?? Infinity) <= clock })}
            // Ordered only in play, once the Strike Yard is in our order. One a star, and never taken back.
            can={!before && inOrder("Strike Yard")}
            send={() => {}}
            what="Bullet"
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
