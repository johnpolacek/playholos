// The seed's world, from the pool calcs/export_worlds.py drew. It holds the truth, so it lives in a private R2 bucket
// and never among the public files. Each is read on its first ask and kept while the Worker lives. Moved out of the
// Worker's own bundle 2026-10-31, when 33 worlds at one mind per 1,600 stars passed 5 MB. scripts/worlds.mjs uploads
// them. lib/sim/world.ts reads the same files from disk, for the tests.
import { env } from "cloudflare:workers";
import { POOL } from "@/lib/sim/pool";
import type { World } from "@/lib/sim/types";

const cache = new Map<number, Promise<World>>();

export function inPool(seed: unknown): seed is number {
  return typeof seed === "number" && POOL.includes(seed);
}

async function read(seed: number): Promise<World> {
  const file = await env.WORLDS.get(`${seed}.json.gz`);
  if (!file) throw new Error(`World ${seed} is missing from the bucket. Run pnpm worlds.`);
  return new Response(file.body.pipeThrough(new DecompressionStream("gzip"))).json();
}

export async function loadWorld(seed: number): Promise<World> {
  if (!inPool(seed)) throw new Error(`No world drawn for seed ${seed}.`);
  let world = cache.get(seed);
  if (!world) {
    // The promise is kept, so asks that arrive together share one read. A failed read is dropped, to try again.
    world = read(seed).catch((e) => {
      cache.delete(seed);
      throw e;
    });
    cache.set(seed, world);
  }
  return world;
}
