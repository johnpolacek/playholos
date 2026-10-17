// The simulation's checks: run `npm test`. Each pins the TypeScript to what Python and the mocks show.
import assert from "node:assert/strict";
import { test } from "node:test";
import golden from "./golden.json" with { type: "json" };
import { describe, earthKnows } from "./knowledge.ts";
import { observe } from "./observing.ts";
import { PyRandom } from "./pyrandom.ts";
import { roll } from "./reactions.ts";
import { loadVoices, loadWorld } from "./world.ts";
import { pace, type Order } from "./works.ts";

test("the generator is CPython's, seeded from ints and strings", () => {
  for (const [key, want] of Object.entries(golden.random)) {
    const r = new PyRandom(/^\d+$/.test(key) ? BigInt(key) : key);
    assert.deepEqual(want.map(() => r.random()), want, key);
  }
});

test("rolls match the mocks: Ombe and Hael knock again, Ombe answers ours with a probe", () => {
  for (const [key, want] of Object.entries(golden.rolls)) {
    const [seed, name, news] = key.split(":");
    assert.equal(roll(Number(seed), name, news as "silence" | "reply"), want, key);
  }
});

test("seed 10 at Year 0: three felt worlds, nearest first, as the first mock leads", async () => {
  const view = earthKnows(await loadWorld(10), 0);
  assert.deepEqual(view.felt.map((f) => f.star), ["Gliese 432 A", "12 Ophiuchi", "Gliese 1232"]);
  assert.equal(view.heard.length, 0);
});

test("the wall: the Mind's words never name who lives where", async () => {
  for (const seed of [10, 11, 62]) {
    const world = await loadWorld(seed);
    const words = describe(earthKnows(world, 0, await loadVoices(world)));
    for (const p of world.neighbors) assert.ok(!words.includes(p.name), `seed ${seed} leaks ${p.name}`);
    for (const rung of ["bare rock", "hiding microbes", "showing oxygen", "animals", "where life died", "frozen"])
      assert.ok(!words.includes(rung), `seed ${seed} leaks a rung: ${rung}`);
  }
});

test("a knock is heard only once it arrives, and only if the watch catches it", async () => {
  const world = await loadWorld(10);
  const ombe = world.neighbors.find((p) => p.name === "Ombe")!;
  assert.equal(ombe.inbound[0].kit0, false);                      // Year 0's sky watch misses it, so Earth hears nothing yet
  assert.equal(earthKnows(world, 20).heard.length, 0);
});

test("reading times match calcs/observing.py, the dark patch's edges included", () => {
  const close = (a: number | null, b: number | string | null) =>
    b === null ? a === null : b === "inf" ? a === Infinity : a !== null && Math.abs(a - (b as number)) < 1e-9 * Math.max(1, Math.abs(b as number));
  for (const { args, out } of golden.observe) {
    const got = observe(...(args as [number, number, number, number]));
    assert.ok(close(got.sep, out.sep), `sep ${args}`);
    assert.ok(close(got.seenH, out.seen_h), `seen ${args}`);
    for (const gas of ["water", "oxygen", "ozone"] as const) assert.ok(close(got[gas], out[gas]), `${gas} ${args}: ${got[gas]} vs ${out[gas]}`);
  }
});

// Python steps its loops a hundredth of a Year at a time and dates a work by the step it ends in. This loop is exact,
// so it runs a little later, and the gap grows down the line: at most 0.03 Years by the fifth far-side array.
const STEPPED = 0.05;
const mock = (g: (typeof golden.works)[number]) => pace(g.orders as Order[], 80, { scale: g.scale, aside: g.aside as [number, number, number][] });

test("works are done when calcs/early_game.py says, in all four mock games", () => {
  for (const g of golden.works) {
    const p = mock(g);
    assert.deepEqual(Object.keys(p.done).sort(), Object.keys(g.done).sort(), g.name);
    for (const [w, y] of Object.entries(g.done)) assert.ok(Math.abs(p.done[w] - (y as number)) < STEPPED, `${g.name}: ${w} at ${p.done[w]}, Python ${y}`);
  }
});

test("Year 5 of the first mock: the watches are built, the telescope is not", () => {
  const p = pace(golden.works[0].orders as Order[], 5, { aside: golden.works[0].aside as [number, number, number][] });
  assert.ok(p.done["All-sky watch"] < 5 && p.done["Launch complex"] < 5);
  assert.deepEqual(p.line.map((l) => l.work), ["Infrared telescope", "Moon vault"]);
  assert.equal(p.dataCenters.length, 4);
});

test("a fifth of the compute stalls the first hour, and nothing breaks", () => {
  const full = mock(golden.works[0]), deep = pace(golden.works[0].orders as Order[], 80, { scale: 0.1975, aside: golden.works[0].aside as [number, number, number][] });
  assert.ok(deep.done["All-sky watch"] > full.done["All-sky watch"]);
  assert.ok(deep.done["Far-side array, fifth 5"] !== undefined);
});
