// The seed's world, from the pool calcs/export_worlds.py drew. It holds the truth, so it rides inside the Worker and
// never among the public files. Each opens on its first ask. lib/sim/world.ts reads the same files from disk, for the
// tests. The neighbors' voice banks went with the neighbors, 2026-10-29.
import { POOL } from "@/lib/sim/pool";
import type { World } from "@/lib/sim/types";

const WORLDS = import.meta.glob<World>("../data/worlds/*.json.gz", { import: "default" });
const cache = new Map<number, World>();

export function inPool(seed: unknown): seed is number {
  return typeof seed === "number" && POOL.includes(seed);
}

export async function loadWorld(seed: number): Promise<World> {
  if (!inPool(seed)) throw new Error(`No world drawn for seed ${seed}.`);
  let world = cache.get(seed);
  if (!world) {
    world = await WORLDS[`../data/worlds/${seed}.json.gz`]();
    cache.set(seed, world);
  }
  return world;
}
