import { useMemo } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildColor, buildTone } from "@/components/marks";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { ListHead } from "@/components/tab-head";
import { span, tenths, yearText } from "@/lib/game/clock";
import { grownSpans } from "@/lib/game/halo";
import { SWARM } from "@/lib/sim/conflict";
import { type Reading, starName } from "@/lib/game/leads";
import { buildOf, buildSlug, computeAt, LAUNCH_LIFT, ordered, PAST } from "@/lib/game/plan";
import type { Heard, Visit } from "@/lib/sim/types";
import { CO_ORBITALS, MOON_SEARCH_YEARS, type MindsSeen, moonSearchEnds, tourEnds } from "@/lib/sim/minds";

// In play, our builds once done stop being a queue and become instruments: each a card that says what it does now in
// the world, from what it has caught, read or found. What is still building rises under them, a bar a build. Chosen
// from the Build canvas, (i) “Builds become instruments”, 2026-10-29.

const A = (move: string) => `${/^[aeiou]/.test(move) ? "an" : "a"} ${move}`;

/** Our craft whose word a build's sights come home as. */
const CRAFT: Record<string, Visit["by"]> = { "Laser Sail Array": "sails", "Probe Yard": "probe", "Solar Lens": "lens", Hypertelescope: "hyper" };

interface Known {
  now: number;
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
        ? `Warm glow ${i} faded by Year ${yearText(f.faded)}.`
        : f.range
          ? `Warm glow ${i}, ranged by our Infrared Telescope.`
          : "Our Infrared Telescope must range it before we can place it.";
    return { line: `Has seen ${n(i)} new warm glow${i > 1 ? "s" : ""}, the latest at Year ${yearText(f.seen)}. ${at}`, news: recent(f.faded ?? f.ranged ?? f.seen) };
  }
  if ((name === "Halo Survey" || name === "Halo Array") && m.glows.length) {
    const g = m.glows.at(-1)!;
    const i = m.glows.length;
    return { line: `Found ${n(i)} cold glow${i > 1 ? "s" : ""}. The latest, Cold glow ${i}, at Year ${yearText(g.seen)}.`, news: recent(g.seen) };
  }
  const w = m.watcher;
  if (name === "Moon Search" && w?.by === "moon search")
    return { line: `Found a dark body about 10 cm across at the Moon’s L5, at Year ${yearText(w.seen)}. It holds where no rock should.`, news: recent(w.seen) };
  if (name === "Asteroid Tour" && w?.by === "asteroid tour")
    return { line: `Found something made on ${w.place}, at Year ${yearText(w.seen)}.`, news: recent(w.seen) };
  return null;
}

/** What a build does now, from what it has brought us, and whether that is news: landed in the last half Year. */
function doing(name: string, k: Known, since: number): { line: string; news: boolean } {
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
    const line =
      name === "Halo Survey"
        ? `Found ${stars > 1 ? `${stars} grey glows. The latest at` : "a grey glow at"} ${star}.`
        : stars > 1
          ? `Has read ${stars} worlds. The latest at ${star}.`
          : `Has read a world at ${star}.`;
    return { line, news: recent(r.at) };
  }
  if (name === "Infrared Telescope") return { line: "Reading the air of the nearest worlds. Nothing in yet.", news: false };
  if (name === "Halo Survey") return { line: "Looking at star after star for cold glows, nearest first. None yet.", news: false };
  if (name === "Halo Array") return { line: "Looking at forty thousand stars a Year for cold glows. None yet.", news: false };
  // Each survey ends: the tour once its last rock is mapped, the search once 3 Years of images are stacked. 2026-10-30.
  const toured = tourEnds(since);
  if (name === "Asteroid Tour")
    return k.now >= toured
      ? { line: `Mapped all ${CO_ORBITALS.length} asteroids that share our orbit by Year ${yearText(toured)}. Only rock.`, news: k.now - toured < 0.5 }
      : { line: "Mapping the asteroids that share our orbit, one by one. Nothing that isn’t rock yet.", news: false };
  if (name === "Moon Search")
    return k.now >= moonSearchEnds(since)
      ? { line: `Stacked ${MOON_SEARCH_YEARS} Years of deep images of the Moon’s L4 and L5 points. Nothing small and dark there.`, news: k.now - moonSearchEnds(since) < 0.5 }
      : { line: "Stacking deep images of the Moon’s L4 and L5 points. Nothing small and dark yet.", news: false };
  if (name === "Warm Sky Watch") return { line: "Mapping the warm sky every 2 Years. No new warm glow yet.", news: false };
  const craft = CRAFT[name];
  if (craft) {
    const home = k.visits.filter((v) => v.by === craft && v.home <= k.now).sort((a, b) => a.home - b.home);
    if (home.length) {
      const v = home.at(-1)!;
      // The Hypertelescope pictures many on its own: how many, and the latest. 2026-10-29.
      if (craft === "hyper")
        return { line: `Has pictured ${home.length === 1 ? "a world" : `${home.length} worlds`}. The latest, ${v.world}, at Year ${yearText(v.home)}.`, news: recent(v.home) };
      return { line: `Word home from ${v.world}, at Year ${yearText(v.home)}.`, news: recent(v.home) };
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
  if (name === "Star Beam") return { line: "Ready. Each lens we send rides it to the Sun’s focus in about two months.", news: false };
  if (name === "Thought Fields")
    return { line: `Our compute is ${Math.round(k.grown * 10) / 10}× what it was at Year 0. No more campuses fit the grid.`, news: false };
  if (name === "Launch Complex") return { line: `Ready. It lifts ${LAUNCH_LIFT} kt more to orbit each Year.`, news: false };
  return { line: buildOf(name)?.what ?? "", news: false };
}

/** A small live trace for each card: the build's own mark, in its color. */
function Card({ name, since, line, news }: { name: string; since: number; line: string; news: boolean }) {
  return (
    <li>
      <Link
        to={`/build/${buildSlug(name)}`}
        className={`flex items-center gap-3.5 rounded-lg border bg-paper px-3.5 py-3 transition-colors hover:border-faint ${news ? "border-(--c)" : "border-rowline"}`}
        style={{ "--c": buildColor(name) } as React.CSSProperties}
      >
        <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-ink/[.04] ${buildTone(name)}`}>
          <BuildMark name={name} size={24} />
        </span>
        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="text-[15px] leading-snug font-medium">{name}</span>
          <span className={`text-[13px] leading-snug ${news ? "text-(--c)" : "text-page-ink2"}`}>{line}</span>
        </span>
        <span className="shrink-0 self-start font-mono text-[10.5px] text-muted tabular-nums">since Y{yearText(since)}</span>
      </Link>
    </li>
  );
}

/** Our builds in play: those done as instruments at work, then those still rising, each with its bar and how long until
 *  it's done. */
export function Instruments() {
  const { year } = useGame();
  const { plan } = usePlan();
  const { done, scale } = useSchedule();
  const { heard, readings, leads, visits, minds } = useLeads();
  const now = year ?? 0;
  const names = ordered(plan);
  const working = names.filter((n) => done[n] != null && done[n]! <= now);
  const rising = names.filter((n) => !working.includes(n));
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
  const known: Known = { now, heard, read, visits, grown, swarm, minds };
  return (
    <>
      {working.length > 0 && (
        <>
          <ListHead left={`Working now · ${working.length}`} right="" className="mt-1" />
          <ul className="mt-2 flex flex-col gap-2">
            {[...working].sort((a, b) => done[b]! - done[a]!).map((n) => (
              <Card key={n} name={n} since={done[n]!} {...doing(n, known, done[n]!)} />
            ))}
          </ul>
        </>
      )}
      <ListHead left={`Rising · ${rising.length}`} right="Done in" className={working.length ? "mt-5" : "mt-1"} />
      {rising.length ? (
        <ul className="mt-1">
          {rising.map((n) => {
            const at = done[n];
            const from = plan.later?.filter((o) => o.name === n).at(-1)?.y ?? 0;
            const p = at == null ? 0 : Math.min(1, Math.max(0, (now - from) / Math.max(0.01, at - from)));
            return (
              <li key={n} className="border-t border-faint">
                <Link to={`/build/${buildSlug(n)}`} className="flex flex-col gap-1.5 py-2.5">
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
      ) : (
        <p className="mt-1 border-t border-faint py-2.5 text-[13.5px] leading-snug text-page-ink2">
          Nothing rising. Our instruments keep watch, and the Mind keeps studying.
        </p>
      )}
    </>
  );
}
