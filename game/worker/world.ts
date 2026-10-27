// The seed's world, from the pool calcs/export_worlds.py drew, and the senders' voice banks. They hold the truth, so
// they ride inside the Worker and never among the public files. Each opens on its first ask. lib/sim/world.ts reads
// the same files from disk, for the tests.
import { POOL } from "@/lib/sim/pool";
import type { Voices } from "@/lib/sim/knowledge";
import type { World } from "@/lib/sim/types";

const WORLDS = import.meta.glob<World>("../data/worlds/*.json.gz", { import: "default" });
const BANKS = import.meta.glob<Voices[string]>("../../data/voices/*.json", { import: "default" });
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

export async function loadVoices(world: World): Promise<Voices> {
  const out: Voices = {};
  for (const p of world.neighbors) {
    const bank = await BANKS[`../../data/voices/${p.name.toLowerCase()}.json`]?.();
    if (bank) out[p.name] = { hail: bank.hail, close: bank.close };
  }
  return out;
}
