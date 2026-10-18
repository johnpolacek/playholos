import type { EarthPast } from "@/lib/game/past";
import { inPool, loadWorld } from "./world";

// Earth's own road to Year 0. The player lived it, so it is no secret: the branches that happened, and when.
export async function earth(req: Request) {
  const seed = Number(new URL(req.url).searchParams.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  const { earth } = (await loadWorld(seed)) as unknown as { earth: EarthPast & { years: Record<string, number> } };
  const past: EarthPast = {
    taiwan: earth.taiwan,
    nuclear: earth.nuclear,
    mars: earth.mars,
    fusion: earth.fusion,
    compute: earth.compute,
    years: Object.fromEntries(Object.entries(earth.years).filter(([k]) => (k === "taiwan" ? earth.taiwan : earth[k as "nuclear"]))),
  };
  return Response.json(past);
}
