// The seed's world, from the pool calcs/export_worlds.py drew. Server only: it reads files, and it holds the truth.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { POOL } from "./pool.ts";
import type { World } from "./types.ts";
import type { Voices } from "./knowledge.ts";

const DATA = path.join(process.cwd(), "data");
const cache = new Map<number, World>();

export function inPool(seed: unknown): seed is number {
  return typeof seed === "number" && POOL.includes(seed);
}

export async function loadWorld(seed: number): Promise<World> {
  if (!inPool(seed)) throw new Error(`No world drawn for seed ${seed}.`);
  let world = cache.get(seed);
  if (!world) {
    world = JSON.parse(gunzipSync(await readFile(path.join(DATA, "worlds", `${seed}.json.gz`))).toString("utf8")) as World;
    cache.set(seed, world);
  }
  return world;
}

/** The senders' voice banks, from ../data/voices, read for their hails and closes. */
export async function loadVoices(world: World): Promise<Voices> {
  const out: Voices = {};
  for (const p of world.neighbors) {
    try {
      const bank = JSON.parse(await readFile(path.join(DATA, "..", "..", "data", "voices", `${p.name.toLowerCase()}.json`), "utf8"));
      out[p.name] = { hail: bank.hail, close: bank.close };
    } catch {}
  }
  return out;
}
