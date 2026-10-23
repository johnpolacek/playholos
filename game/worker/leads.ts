import { kitOf } from "@/lib/game/reach";
import { earthKnows } from "@/lib/sim/knowledge";
import { readLater, readObserve, readQueue, readStops } from "./orders";
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

// What Earth knows at a Year, for Scan, through the same wall: the worlds felt, with what our Infrared Telescope has
// read of them, and the signals our watches have caught. Each is dated as Build dates our order, with this game's
// compute, as the Mind hears it. Nothing yet to arrive leaves the server. 2026-10-22.
export async function known(req: Request) {
  const q = new URL(req.url).searchParams;
  const seed = Number(q.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  const year = Math.min(200, Math.max(0, Number(q.get("year")) || 0));
  const world = await loadWorld(seed);
  const plan = {
    builds: readQueue(list(q.get("builds"))),
    observe: readObserve(list(q.get("observe"))),
    later: readLater(list(q.get("later"))),
    stops: readStops(list(q.get("stops"))),
  };
  return Response.json(earthKnows(world, year, await loadVoices(world), kitOf(plan, Number(world.earth.compute) || 1)));
}
