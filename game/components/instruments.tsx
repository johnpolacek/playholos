import { useMemo } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildColor, buildTone } from "@/components/marks";
import { usePlan, usePoint, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { ListHead } from "@/components/tab-head";
import { span, tenths, timesText, yearText } from "@/lib/game/clock";
import { grownSpans } from "@/lib/game/halo";
import { iceBetween, iceFirsts, iceRange, stormFirsts, stormsHeard } from "@/lib/game/natural";
import { SWARM } from "@/lib/sim/conflict";
import { type Reading, starName } from "@/lib/game/leads";
import { buildOf, buildSlug, computeAt, fifthsOf, isOn, wreckAt, LAUNCH_LIFT, ordered, PAST, SWITCHED } from "@/lib/game/plan";
import type { Heard, Visit } from "@/lib/sim/types";
import { CATALOG } from "@/lib/sim/works";
import { CO_ORBITALS, MOON_SEARCH_YEARS, type MindsSeen, moonSearchEnds, TOUR_EACH, TOUR_FLIGHT, TOUR_MAP, tourEnds } from "@/lib/sim/minds";

// In play, our builds once done stop being a queue and become instruments: each a card that says what it does now in
// the world, from what it has caught, read or found. What is still building rises, a bar a build. Chosen from the
// Build canvas, (i) “Builds become instruments”, 2026-10-29. What rises leads Build and what works closes it,
// 2026-11-10.

const A = (move: string) => `${/^[aeiou]/.test(move) ? "an" : "a"} ${move}`;

/** Our craft whose word a build's sights come home as. */
const CRAFT: Record<string, Visit["by"]> = { "Laser Sail Array": "sails", "Probe Yard": "probe", "Solar Lens": "lens", Hypertelescope: "hyper" };

interface Known {
  now: number;
  /** This game's seed, for the natural sky our Deep Ice Watch hears. 2026-11-11. */
  seed?: number;
  /** The Years our Far-Side Array found each world it has, by its magnetic field. 2026-11-11. */
  fields: number[];
  /** The Year each fifth of it was done, for the star storms it hears. 2026-11-12. */
  fifths: number[];
  heard: Heard[];
  /** Every reading landed by now, with the star of its lead. */
  read: { star: string; r: Reading }[];
  visits: Visit[];
  /** Our compute now, as a multiple of Year 0's. */
  grown: number;
  /** Our Solar Swarm's share of the Sun's light now, and whether it still grows. 2026-10-29. */
  swarm: { share: number; growing: boolean } | null;
  /** The minds found by now, as Scan has them. Their watches said "none yet" after a find until 2026-10-30. */
  minds?: MindsSeen;
}

/** Our watch that found the minds' signs: the warm glows, the cold glows, and the watcher. 2026-10-30. */
/** The star storms our Far-Side Array has heard by now, as a sentence for its card, with what their count settles
 *  once it has, and the Year of its latest news. lib/game/natural.ts, 2026-11-12. */
function stormsLine(k: Known): { line: string; at: number } {
  const f = stormFirsts(k.fifths);
  const heard = f && k.now >= f.first ? Math.floor(stormsHeard(k.fifths, k.now)) : 0;
  if (!f || !heard) return { line: "", at: -Infinity };
  const settled = k.now >= f.settled;
  return {
    line: ` It has heard ${heard.toLocaleString("en-US")} star storm${heard === 1 ? "" : "s"} from red dwarfs.${settled ? ` Storms do not follow flares, settled at Year ${yearText(f.settled)}.` : ""}`,
    at: settled ? f.settled : f.first,
  };
}

function found(name: string, k: Known): { line: string; news: boolean } | null {
  const m = k.minds;
  if (!m) return null;
  const recent = (at: number) => k.now - at < 0.5;
  const n = (i: number) => (i === 1 ? "a" : ["two", "three", "four", "five"][i - 2] ?? String(i));
  if (name === "Warm Sky Watch" && m.flashes.length) {
    const f = m.flashes.at(-1)!;
    const i = m.flashes.length;
    const at =
      f.faded !== undefined
        ? `Warm Glow ${i} faded by Year ${yearText(f.faded)}.`
        : f.range
          ? `Warm Glow ${i}, ranged by our Infrared Telescope.`
          : "Our Infrared Telescope must range it before we can place it.";
    return { line: `Has seen ${n(i)} new warm glow${i > 1 ? "s" : ""}, the latest at Year ${yearText(f.seen)}. ${at}`, news: recent(f.faded ?? f.ranged ?? f.seen) };
  }
  if ((name === "Halo Survey" || name === "Halo Array") && m.glows.length) {
    const g = m.glows.at(-1)!;
    const i = m.glows.length;
    return { line: `Found ${n(i)} cold glow${i > 1 ? "s" : ""}. The latest, Cold Glow ${i}, at Year ${yearText(g.seen)}.`, news: recent(g.seen) };
  }
  // Our Glow Imager: how many glows it has shown us, and what the latest was. 2026-11-11.
  if (name === "Glow Imager") {
    const looks = [
      ...m.glows.flatMap((g, i) => (g.imaged !== undefined ? [{ at: g.imaged, what: `thin panels on orderly orbits at Cold Glow ${i + 1}` }] : [])),
      ...m.flashes.flatMap((f, i) => (f.imaged ? [{ at: f.imaged.at, what: `${f.imaged.saw === "ring" ? "a made ring" : "a cloud of dust"} at Warm Glow ${i + 1}` }] : [])),
    ].sort((a, b) => a.at - b.at);
    if (!looks.length) return null;
    const l = looks.at(-1)!;
    return { line: `Has shown us ${looks.length === 1 ? "one glow" : `${looks.length} glows`}. The latest, ${l.what}, at Year ${yearText(l.at)}.`, news: recent(l.at) };
  }
  const w = m.watcher;
  if (name === "Moon Search" && w?.by === "moon search")
    return { line: `Found a dark body about 10 cm across at the Moon’s ${w.place.slice(-2)}, at Year ${yearText(w.seen)}. It holds where no rock should.`, news: recent(w.seen) };
  // Our Close Look: on its way, then what it saw up close. 2026-10-30.
  if (name === "Close Look" && w)
    return w.looked
      ? { line: `Saw it up close at Year ${yearText(w.looked.at)}: near black, with a small mirror held on one point of the sky. It saw us come.`, news: recent(w.looked.at) }
      : { line: `Flying to the dark body at ${w.by === "moon search" ? `the Moon’s ${w.place.slice(-2)}` : w.place}.`, news: false };
  // Our Relay Search: flying out along the mirror's line, then what it found there. 2026-10-30.
  if (name === "Relay Search" && w?.looked)
    return w.relay
      ? { line: `Found a dark craft ${w.relay.au.toLocaleString("en-US")} AU out at Year ${yearText(w.relay.at)}, holding on the line. It sent nothing while we were near.`, news: recent(w.relay.at) }
      : { line: "Flying out along the line the watcher’s mirror points.", news: false };
  if (name === "Asteroid Tour" && w?.by === "asteroid tour")
    return { line: `Found something made on ${w.place}, at Year ${yearText(w.seen)}.`, news: recent(w.seen) };
  return null;
}

/** Where the tour is: flying out, mapping a rock, or flying on to the next, and the Year that ends. One line for up to
 *  12 Years read as nothing happening. 2026-11-07. */
function touring(now: number, since: number): string {
  const n = CO_ORBITALS.length, start = since + TOUR_FLIGHT;
  if (now < start) return `Flying out to ${CO_ORBITALS[0]}, the first of ${n}. There at Year ${yearText(start)}`;
  const i = Math.min(n - 1, Math.floor((now - start) / TOUR_EACH)), at = start + i * TOUR_EACH;
  if (now < at + TOUR_MAP) return `Mapping ${CO_ORBITALS[i]}, rock ${i + 1} of ${n}, until Year ${yearText(at + TOUR_MAP)}. Only rock so far`;
  return `Flying on to ${CO_ORBITALS[i + 1]}. ${i + 1} of ${n} mapped, all rock. There at Year ${yearText(at + TOUR_EACH)}`;
}

/** What a build does now, from what it has brought us, and whether that is news: landed in the last half Year. */
function doing(name: string, k: Known, since: number): { line: string; news: boolean; busy?: boolean } {
  const recent = (at: number) => k.now - at < 0.5;
  const caught = k.heard.filter((h) => h.by === name && h.arrived <= k.now);
  if (caught.length) {
    const h = caught.at(-1)!;
    const more = caught.length > 1 ? ` ${caught.length} caught in all.` : "";
    return { line: `Caught ${A(h.move)} from ${h.star} at Year ${yearText(h.arrived)}.${more}`, news: recent(h.arrived) };
  }
  if (name === "All-Sky Watch") return { line: "Listening to the whole sky, at every hour. Nothing yet our old watches would miss.", news: false };
  if (name === "Deep Flash Watch") return { line: "Watching for laser flashes. None yet.", news: false };
  const sign = found(name, k);
  if (sign) return sign;
  const read = k.read.filter((x) => x.r.by === name && x.r.at <= k.now).sort((a, b) => a.r.at - b.r.at);
  if (read.length) {
    const { r } = read.at(-1)!;
    const star = starName(read.at(-1)!.star);
    const stars = new Set(read.map((x) => x.star)).size;
    // Our Far-Side Array hears star storms too, beside the worlds it has read.
    const storms = name === "Far-Side Array" ? stormsLine(k) : { line: "", at: -Infinity };
    const line =
      name === "Halo Survey"
        ? `Found ${stars > 1 ? `${stars} grey glows. The latest at` : "a grey glow at"} ${star}.`
        : stars > 1
          ? `Has read ${stars} worlds. The latest at ${star}.`
          : `Has read a world at ${star}.`;
    return { line: `${line}${storms.line}`, news: recent(Math.max(r.at, storms.at)) };
  }
  if (name === "Infrared Telescope") return { line: "Reading the air of the nearest worlds. Nothing in yet.", news: false };
  if (name === "Halo Survey") return { line: "Looking at star after star for cold glows, nearest first. None yet.", news: false };
  if (name === "Halo Array") return { line: "Looking at forty thousand stars a Year for cold glows. None yet.", news: false };
  // Each survey ends: the tour once its last rock is mapped, the search once 3 Years of images are stacked. 2026-10-30.
  const toured = tourEnds(since);
  if (name === "Asteroid Tour")
    return k.now >= toured
      ? { line: `Mapped all ${CO_ORBITALS.length} asteroids that share our orbit by Year ${yearText(toured)}. Only rock.`, news: k.now - toured < 0.5 }
      : { line: touring(k.now, since), news: false, busy: true };
  if (name === "Moon Search")
    return k.now >= moonSearchEnds(since)
      ? { line: `Stacked ${MOON_SEARCH_YEARS} Years of deep images of the Moon’s L4 and L5 points. Nothing small and dark there.`, news: k.now - moonSearchEnds(since) < 0.5 }
      : { line: "Stacking deep images of the Moon’s L4 and L5 points. Nothing small and dark yet", news: false, busy: true };
  if (name === "Warm Sky Watch") return { line: "Mapping the warm sky every 2 Years. No new warm glow yet.", news: false };
  if (name === "Far-Side Array") {
    const n = k.fields.length;
    const storms = stormsLine(k);
    const latest = Math.max(n ? k.fields.at(-1)! : -Infinity, storms.at);
    return n
      ? { line: `Has found ${n === 1 ? "a world" : `${n} worlds`} by the radio of ${n === 1 ? "its magnetic field" : "their magnetic fields"}, the latest at Year ${yearText(k.fields.at(-1)!)}.${storms.line}`, news: recent(latest) }
      : { line: `Listening for the radio of magnetic fields at red dwarfs’ worlds. None new yet.${storms.line}`, news: storms.line ? recent(latest) : false };
  }
  // What our Deep Ice Watch has heard, and each of its three firsts as it comes. lib/game/natural.ts, 2026-11-11.
  if (name === "Deep Ice Watch" && k.seed !== undefined) {
    const { bright, dark } = iceBetween(k.seed, since, since, k.now);
    const f = iceFirsts(k.seed, since);
    const n = (x: number) => x.toLocaleString("en-US");
    const range = iceRange();
    if (!bright && !dark) return { line: "Listening through the ice. No star’s death heard yet.", news: false };
    const heard = `Has heard ${n(bright)} star${bright === 1 ? "" : "s"} explode and ${n(dark)} burst${dark === 1 ? "" : "s"} no flash followed.`;
    if (k.now >= f.settled) return { line: `${heard} About 1 heavy star in ${range.mid} dies dark, settled at Year ${yearText(f.settled)}.`, news: recent(f.settled) };
    if (k.now >= f.sure) return { line: `${heard} One is sure: a telescope found the star gone, at Year ${yearText(f.sure)}.`, news: recent(f.sure) };
    return { line: `${heard} None read near and made sure yet.`, news: recent(f.first) };
  }
  if (name === "Glow Imager") return { line: "Ready. It turns to each glow our surveys find. None to show yet.", news: false };
  if (name === "Galaxy Broadcast Array") return { line: "Ready. It sends only what we choose to send, from the Mind’s tab.", news: false };
  const craft = CRAFT[name];
  if (craft) {
    const home = k.visits.filter((v) => v.by === craft && v.home <= k.now).sort((a, b) => a.home - b.home);
    if (home.length) {
      const v = home.at(-1)!;
      // The Hypertelescope pictures many on its own: how many, and the latest. 2026-10-29.
      if (craft === "hyper")
        return { line: `Has pictured ${home.length === 1 ? "a world" : `${home.length} worlds`}. The latest, ${v.world}, at Year ${yearText(v.home)}.`, news: recent(v.home) };
      return { line: `Word home from ${starName(v.world)}, at Year ${yearText(v.home)}.`, news: recent(v.home) };
    }
    if (craft === "hyper") return { line: "Turning to the nearest worlds we’ve felt. No picture in yet.", news: false };
    return { line: "Ready. We send from Reach.", news: false };
  }
  if (name === "Solar Swarm" && k.swarm) {
    const { share, growing } = k.swarm;
    // In watts, as its page says it, and as a share of the Sun once that reads plainly.
    const w = share * SWARM.most, e = Math.floor(Math.log10(w));
    const of = share >= 0.999 ? "all the Sun’s light" : share >= 1e-3 ? `${Math.round(share * 1000) / 10}% of the Sun’s light` : w < 1e15 ? `about ${(w / 1e12).toFixed(1)} TW of sunlight` : `about ${(w / 10 ** e).toFixed(1)}×10${[...String(e)].map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]).join("")} W of sunlight`;
    return { line: `Catching ${of}. ${share >= 0.999 ? "It can grow no more." : growing ? "It doubles every 2 Years." : "We hold it at its size."}`, news: false };
  }
  if (name === "Helium-3 Harvest") return { line: "Gathering helium-3 from Uranus’s air, faster each time its craft double.", news: false };
  if (name === "Mercury Works") return { line: "Its seed copies itself from Mercury’s rock.", news: false };
  if (name === "Star Beam") return { line: "Ready. Each lens we send rides it to the Sun’s focus in about ten weeks.", news: false };
  if (name === "Wide Beam") return { line: `Ready. It throws each rod and flyby probe that leaves, a rod at ${CATALOG.speeds.wide.rod.beam.toFixed(2)} of light speed.`, news: false };
  if (name === "Ship Beam") return { line: `Ready. Each seed ship we send rides it, a tenth of light speed in ${CATALOG.beams.shipDays} days and as fast as it can stop from.`, news: false };
  if (name === "Thought Fields")
    return { line: `Our compute is ${timesText(k.grown)} what it was at Year 0. No more campuses fit the grid.`, news: false };
  if (name === "Launch Complex") return { line: `Ready. It lifts ${LAUNCH_LIFT} kt more to orbit each Year.`, news: false };
  return { line: buildOf(name)?.what ?? "", news: false };
}

/** A small live trace for each card: the build's own mark, in its color. */
function Card({ name, since, line, news, busy }: { name: string; since: number; line: string; news: boolean; busy?: boolean }) {
  // Pointed at, the map flies to where it stands. 2026-11-08.
  const point = usePoint();
  return (
    <li {...point(name)}>
      <Link
        to={`/play/build/${buildSlug(name)}`}
        className={`flex items-center gap-3.5 rounded-lg border bg-paper px-3.5 py-3 transition-colors hover:border-faint ${news ? "border-(--c)" : "border-rowline"}`}
        style={{ "--c": buildColor(name) } as React.CSSProperties}
      >
        <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-ink/[.04] ${buildTone(name)}`}>
          <BuildMark name={name} size={24} />
        </span>
        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="text-[15px] leading-snug font-medium">{name}</span>
          <span className={`text-[13px] leading-snug ${news ? "text-(--c)" : "text-page-ink2"}`}>
            {line}
            {/* A search still at work breathes: three dots in turn. 2026-11-07. */}
            {busy && (
              <span aria-hidden>
                {[0, 1, 2].map((d) => (
                  <span key={d} className="motion-safe:animate-ellipsis" style={{ animationDelay: `${d * 0.25}s` }}>.</span>
                ))}
              </span>
            )}
          </span>
        </span>
        <span className="shrink-0 self-start font-mono text-[10.5px] text-muted tabular-nums">since Y{yearText(since)}</span>
      </Link>
    </li>
  );
}

/** Our builds done, as instruments at work, newest first. Last on Build, under what rises, the Catalog and what it
 *  all costs: what is done matters least to what we order next. 2026-11-10. */
export function Working() {
  const { year, save } = useGame();
  const { plan } = usePlan();
  const { done, scale } = useSchedule();
  const { heard, readings, leads, visits, minds } = useLeads();
  const now = year ?? 0;
  const working = ordered(plan).filter((n) => done[n] != null && done[n]! <= now);
  const read = useMemo(
    () => leads.flatMap((l) => (readings[l.slug] ?? []).map((r) => ({ star: l.star, r }))),
    [leads, readings],
  );
  const tenth = tenths(now);
  const grown = useMemo(() => computeAt(plan, scale, tenth) / computeAt(plan, scale, 0), [plan, scale, tenth]);
  const swarm = useMemo(() => {
    const spans = grownSpans(plan, scale, "Solar Swarm");
    if (!spans.length || spans[0][0] > tenth) return null;
    const years = spans.reduce((y, [a, b]) => y + Math.max(0, Math.min(b ?? tenth, tenth) - a), 0);
    return { share: Math.min(1, (SWARM.watts * 2 ** Math.floor(years / SWARM.doubling)) / SWARM.most), growing: spans.at(-1)![1] === null };
  }, [plan, scale, tenth]);
  // The worlds our Far-Side Array found, by the Year of the reading each came with.
  const fields = useMemo(
    () => leads.filter((l) => l.facts.some(([k]) => k === "Heard by")).map((l) => (readings[l.slug] ?? []).find((r) => r.field !== undefined)?.at ?? 0).sort((a, b) => a - b),
    [leads, readings],
  );
  const fifths = useMemo(() => fifthsOf(plan, scale), [plan, scale]);
  const known: Known = { now, seed: save?.seed, fields, fifths, heard, read, visits, grown, swarm, minds };
  if (!working.length) return null;
  return (
    <>
      <ListHead left={`Working now · ${working.length}`} right="" className="mt-1" />
      <ul className="mt-2 flex flex-col gap-2">
        {[...working].sort((a, b) => done[b]! - done[a]!).map((n) => (
          // One the Will has stood down says so, in place of what it would be doing. 2026-11-11.
          <Card key={n} name={n} since={done[n]!} {...(wreckAt(plan, n, now) ? { line: `Wrecked at Year ${yearText(wreckAt(plan, n, now)!.at)} by an old mind, for the bullet we threw at it. It stands again at Year ${yearText(wreckAt(plan, n, now)!.until)}.`, news: false } : SWITCHED[n] && !isOn(plan, n, now) ? { line: SWITCHED[n].whenOff, news: false } : doing(n, known, done[n]!))} />
        ))}
      </ul>
    </>
  );
}

/** Our builds still rising, each with its bar and how long until it's done, then the Catalog. Nothing rising, the
 *  Catalog leads, and says so in gold with the Mind's pick. Playtest 2026-11-02. */
export function Rising({ catalog }: { catalog?: (idle: boolean) => React.ReactNode }) {
  const { year } = useGame();
  const { plan } = usePlan();
  const { done } = useSchedule();
  const point = usePoint();
  const now = year ?? 0;
  const rising = ordered(plan).filter((n) => done[n] == null || done[n]! > now);
  return (
    <>
      {rising.length > 0 && (
        <>
          <ListHead left={`Rising · ${rising.length}`} right="Done in" className="mt-1" />
          <ul className="mt-1">
            {rising.map((n) => {
              const at = done[n];
              const from = plan.later?.filter((o) => o.name === n).at(-1)?.y ?? 0;
              const p = at == null ? 0 : Math.min(1, Math.max(0, (now - from) / Math.max(0.01, at - from)));
              return (
                <li key={n} className="border-t border-faint" {...point(n)}>
                  <Link to={`/play/build/${buildSlug(n)}`} className="flex flex-col gap-1.5 py-2.5">
                    <span className="flex items-baseline gap-3">
                      <span className={`shrink-0 self-center ${buildTone(n)}`}>
                        <BuildMark name={n} size={16} />
                      </span>
                      <span className="grow text-[15px] leading-snug">{n}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">{at == null ? PAST : span(at - now)}</span>
                    </span>
                    <span className="ml-7 h-1 overflow-hidden rounded-full bg-track">
                      <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${p * 100}%`, background: buildColor(n) }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {catalog?.(!rising.length)}
    </>
  );
}
