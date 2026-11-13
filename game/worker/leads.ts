import { WINDOWS } from "@/lib/game/leads";
import { schedule, fifthsOf } from "@/lib/game/plan";
import { rockAt, rockOf } from "@/lib/game/rocks";
import { iceFirsts, skyOf, stormFirsts } from "@/lib/game/natural";
import { kitOf } from "@/lib/game/reach";
import { nextStopWhy } from "@/lib/sim/next";
import { earthKnows, willKnows } from "@/lib/sim/knowledge";
import { moonSearchEnds, tourEnds } from "@/lib/sim/minds";
import { readGifts, readLater, readColony, readCloseReads, readFlybys, readLenses, readObserve, readSentinels, readSeeds, readQueue, readStops, readSwitches } from "./orders";
import { readAimed, readCalls, readKnocks, readWill, readWreck } from "./orders";
import { inPool, loadWorld } from "./world";

// The worlds Earth's planet hunters have felt by Year 0, through the knowledge wall: measured, never who lives there.
export async function leads(req: Request) {
  const seed = Number(new URL(req.url).searchParams.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  return Response.json(earthKnows(await loadWorld(seed), 0).felt);
}

const list = (s: string | null): unknown => {
  try {
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};
const one = (s: string | null): unknown => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

/** The save's query: in the body of a POST, since a long game's flybys outgrow a URL's limit (431 at Year 5,379 with 96
 *  probes out, 2026-11-05), or in the URL of an older client's GET. */
async function askOf(req: Request) {
  const url = new URL(req.url).searchParams;
  if (req.method !== "POST") return url;
  const body = new URLSearchParams(await req.text());
  if (!body.has("seed")) body.set("seed", url.get("seed") ?? "");
  return body;
}

// What Earth knows at a Year, for Scan, through the same wall: the worlds felt, with what our telescopes have read of
// them, Proxima b's air once the 15 m Mirror reads it, and the signals our watches have caught. Each is dated as Build dates our order, with this game's
// compute, as the Mind hears it. Nothing yet to arrive leaves the server. 2026-10-22.
export async function known(req: Request) {
  const q = await askOf(req);
  const seed = Number(q.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  // A game has no last Year, and word from far holes comes late: Gaia BH1's sentinel reports about Year 17,200.
  // Capped at 200 until 2026-10-26, which hid every report after it. At 25,000 until 2026-10-29: a peer's warm glow
  // reaches us near Year 29,000 in a typical game, and a game runs 100,000 Years or more.
  const year = Math.min(1_000_000, Math.max(0, Number(q.get("year")) || 0));
  const world = await loadWorld(seed);
  const plan = {
    builds: readQueue(list(q.get("builds"))),
    observe: readObserve(list(q.get("observe"))),
    later: readLater(list(q.get("later"))),
    stops: readStops(list(q.get("stops"))),
    switches: readSwitches(list(q.get("switches"))),
    gifts: readGifts(list(q.get("gifts"))),
    lenses: readLenses(list(q.get("lenses"))),
    closeReads: readCloseReads(list(q.get("closeReads"))),
    sentinels: readSentinels(list(q.get("sentinels"))),
    seeds: readSeeds(list(q.get("seeds"))),
    colony: readColony(one(q.get("colony"))),
    flybys: readFlybys(list(q.get("flybys"))),
    wreck: readWreck(one(q.get("wreck"))),
  };
  // Once the Will lives at a hole, Earth's news reaches it a light-time late. 2026-10-26.
  const more = { knocks: readKnocks(q.get("knocks")), aimed: readAimed(q.get("aimed")), calls: readCalls(q.get("calls")) };
  return Response.json(willKnows(world, year, { ...kitOf(plan, Number(world.earth.compute) || 1), ...more }, readWill(one(q.get("will")))));
}

/** How far ahead a skip looks for what comes next, in Years. A skip with nothing in reach goes this far at most. */
const AHEAD = 100_000;

// The next Year something new happens, for a skip, through the same wall: it says when, never what. 2026-10-29.
export async function next(req: Request) {
  const q = await askOf(req);
  const seed = Number(q.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  const year = Math.min(1_000_000, Math.max(0, Number(q.get("year")) || 0));
  const world = await loadWorld(seed);
  const plan = {
    builds: readQueue(list(q.get("builds"))),
    observe: readObserve(list(q.get("observe"))),
    later: readLater(list(q.get("later"))),
    stops: readStops(list(q.get("stops"))),
    switches: readSwitches(list(q.get("switches"))),
    gifts: readGifts(list(q.get("gifts"))),
    lenses: readLenses(list(q.get("lenses"))),
    closeReads: readCloseReads(list(q.get("closeReads"))),
    sentinels: readSentinels(list(q.get("sentinels"))),
    seeds: readSeeds(list(q.get("seeds"))),
    colony: readColony(one(q.get("colony"))),
    flybys: readFlybys(list(q.get("flybys"))),
    wreck: readWreck(one(q.get("wreck"))),
  };
  const scale = Number(world.earth.compute) || 1;
  const more = { knocks: readKnocks(q.get("knocks")), aimed: readAimed(q.get("aimed")), calls: readCalls(q.get("calls")) };
  const ahead = willKnows(world, year + AHEAD, { ...kitOf(plan, scale), ...more }, readWill(one(q.get("will"))));
  const done = schedule(plan, scale);
  // A rock: the Year we find it, the Year our push lands if it turns it aside, and the Year it would strike. 2026-10-29.
  const rock = rockAt(rockOf(seed), plan, done, year);
  // And the Years the Moon Search and the Asteroid Tour end, each saying so on Build. 2026-10-30.
  const ends = [
    { at: done["Moon Search"] == null ? null : moonSearchEnds(done["Moon Search"]), why: "the Moon Search’s end" },
    // Readings already ordered, by us or unasked after our first: one ordered later would tell of a glow not yet found.
    ...(ahead.minds?.flashes ?? []).filter((f) => f.read && f.read.from <= year).map((f) => ({ at: f.read!.at, why: "Close Reading done" })),
    { at: done["Asteroid Tour"] == null ? null : tourEnds(done["Asteroid Tour"]), why: "the Asteroid Tour’s end" },
  ];
  // Betelgeuse's end, once, the one natural event that stops a skip. 2026-10-30.
  // And why, in words that spoil nothing: what is ours is named, the sky's is only our next finding. 2026-11-01.
  // Each reads after "Jump to", 2026-11-04.
  const stop = nextStopWhy(ahead, year, done, [
    ...(rock
      ? [
          { at: rock.found, why: "our next finding" },
          { at: rock.pushed ? rock.lands : null, why: "our push reaching the rock" },
          { at: rock.strikes, why: "the rock’s arrival" },
        ]
      : []),
    ...ends,
    // A reply window on a star messaged before Year 0: a jump went past Luyten's Star's at Year 2.3 in two blind
    // playtests, though both players were waiting for it. 2026-11-07.
    ...WINDOWS.map((w) => ({ at: w.at, why: `${w.star}’s reply window` })),
    { at: skyOf(seed).betelgeuse, why: "our next finding" },
    // Our Deep Ice Watch's three firsts: its first catch, the first dark death made sure, and the share settled. The
    // hundreds of thousands of deaths it hears after stop nothing. 2026-11-11.
    ...(done["Deep Ice Watch"] == null ? [] : Object.values(iceFirsts(seed, done["Deep Ice Watch"])).map((at) => ({ at, why: "our next finding" }))),
    // Our Far-Side Array's first star storm, and the Year its count settles whether storms follow flares. 2026-11-12.
    ...Object.values(stormFirsts(fifthsOf(plan, scale)) ?? {}).map((at) => ({ at, why: "our next finding" })),
  ]);
  return Response.json({ next: stop?.at ?? null, why: stop?.why ?? null, ahead: AHEAD });
}
