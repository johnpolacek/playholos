import { kitOf } from "@/lib/game/reach";
import { earthKnows, willKnows } from "@/lib/sim/knowledge";
import { readGifts, readLater, readColony, readLenses, readObserve, readSentinels, readSeeds, readQueue, readStops } from "./orders";
import { readLosses, readPickets, readStrikes, readWill } from "./orders";
import { inPool, loadVoices, loadWorld } from "./world";

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
  // Capped at 200 until 2026-10-26, which hid every report after it.
  const year = Math.min(25_000, Math.max(0, Number(q.get("year")) || 0));
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
  // Our craft at holes a neighbor caught or struck, from the save's reactions. 2026-10-26.
  const losses = readLosses(list(q.get("losses")));
  // Once the Will lives at a hole, Earth's news reaches it a light-time late. 2026-10-26.
  return Response.json(willKnows(world, year, await loadVoices(world), { ...kitOf(plan, Number(world.earth.compute) || 1), losses }, readWill(one(q.get("will")))));
}
