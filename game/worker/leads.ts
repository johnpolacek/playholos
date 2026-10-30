import { schedule } from "@/lib/game/plan";
import { rockAt, rockOf } from "@/lib/game/rocks";
import { skyOf } from "@/lib/game/natural";
import { kitOf } from "@/lib/game/reach";
import { nextStop } from "@/lib/sim/next";
import { earthKnows, willKnows } from "@/lib/sim/knowledge";
import { moonSearchEnds, tourEnds } from "@/lib/sim/minds";
import { readGifts, readLater, readColony, readLenses, readObserve, readSentinels, readSeeds, readQueue, readStops } from "./orders";
import { readPickets, readStrikes, readWill } from "./orders";
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

// What Earth knows at a Year, for Scan, through the same wall: the worlds felt, with what our telescopes have read of
// them, Proxima b's air once the 15 m Mirror reads it, and the signals our watches have caught. Each is dated as Build dates our order, with this game's
// compute, as the Mind hears it. Nothing yet to arrive leaves the server. 2026-10-22.
export async function known(req: Request) {
  const q = new URL(req.url).searchParams;
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
    gifts: readGifts(list(q.get("gifts"))),
    lenses: readLenses(list(q.get("lenses"))),
    sentinels: readSentinels(list(q.get("sentinels"))),
    seeds: readSeeds(list(q.get("seeds"))),
    colony: readColony(one(q.get("colony"))),
    pickets: readPickets(list(q.get("pickets"))),
    strikes: readStrikes(list(q.get("strikes"))),
  };
  // Once the Will lives at a hole, Earth's news reaches it a light-time late. 2026-10-26.
  return Response.json(willKnows(world, year, kitOf(plan, Number(world.earth.compute) || 1), readWill(one(q.get("will")))));
}

/** How far ahead a skip looks for what comes next, in Years. A skip with nothing in reach goes this far at most. */
const AHEAD = 100_000;

// The next Year something new happens, for a skip, through the same wall: it says when, never what. 2026-10-29.
export async function next(req: Request) {
  const q = new URL(req.url).searchParams;
  const seed = Number(q.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  const year = Math.min(1_000_000, Math.max(0, Number(q.get("year")) || 0));
  const world = await loadWorld(seed);
  const plan = {
    builds: readQueue(list(q.get("builds"))),
    observe: readObserve(list(q.get("observe"))),
    later: readLater(list(q.get("later"))),
    stops: readStops(list(q.get("stops"))),
    gifts: readGifts(list(q.get("gifts"))),
    lenses: readLenses(list(q.get("lenses"))),
    sentinels: readSentinels(list(q.get("sentinels"))),
    seeds: readSeeds(list(q.get("seeds"))),
    colony: readColony(one(q.get("colony"))),
    pickets: readPickets(list(q.get("pickets"))),
    strikes: readStrikes(list(q.get("strikes"))),
  };
  const scale = Number(world.earth.compute) || 1;
  const ahead = willKnows(world, year + AHEAD, kitOf(plan, scale), readWill(one(q.get("will"))));
  const done = schedule(plan, scale);
  // A rock: the Year we find it, the Year our push lands if it turns it aside, and the Year it would strike. 2026-10-29.
  const rock = rockAt(rockOf(seed), plan, done, year);
  // And the Years the Moon Search and the Asteroid Tour end, each saying so on Build. 2026-10-30.
  const ends = [
    done["Moon Search"] == null ? null : moonSearchEnds(done["Moon Search"]),
    done["Asteroid Tour"] == null ? null : tourEnds(done["Asteroid Tour"]),
  ];
  // Betelgeuse's end, once, the one natural event that stops a skip. 2026-10-30.
  const stop = nextStop(ahead, year, done, [...(rock ? [rock.found, rock.pushed ? rock.lands : null, rock.strikes] : []), ...ends, skyOf(seed).betelgeuse]);
  return Response.json({ next: stop, ahead: AHEAD });
}
