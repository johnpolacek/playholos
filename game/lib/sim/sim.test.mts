// The simulation's checks: run `npm test`. Each pins the TypeScript to what Python and the mocks show.
import assert from "node:assert/strict";
import { test } from "node:test";
import golden from "./golden.json" with { type: "json" };
import { describe, earthKnows, glows } from "./knowledge.ts";
import { observe } from "./observing.ts";
import { PyRandom } from "./pyrandom.ts";
import { roll } from "./reactions.ts";
import { hop, seedProbes } from "./spread.ts";
import { POOL } from "./pool.ts";
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

test("reading times match calcs/observing.py, the dark patch's edges included, on both mirrors", () => {
  const close = (a: number | null, b: number | string | null) =>
    b === null ? a === null : b === "inf" ? a === Infinity : a !== null && Math.abs(a - (b as number)) < 1e-9 * Math.max(1, Math.abs(b as number));
  for (const { args, out } of golden.observe) {
    const got = observe(...(args as [number, number, number, number, number?]));
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

test("messages match calcs/messages.py: send times, power, and reach", async () => {
  const { aimedYears, GRID_2040, powerFor, readReach, SIZES, YEAR_S } = await import("./messages.ts");
  // Wikipedia's text to 12 ly, read by an all-sky watch: 334.3 days. A page sent every way, read at 30.4 ly at 0.1%.
  assert.equal(Math.round(aimedYears(SIZES.encyclopedia, 12) * YEAR_S / 86400 * 10) / 10, 334.3);
  assert.equal(Math.round(readReach(0.001 * GRID_2040, SIZES.page) * 10) / 10, 30.4);
  // Heard for a Year, capped where it is noticed: 376 ly. Our genes read at 10 ly in a day: 2797% of 2040's energy.
  assert.equal(Math.round(readReach(0.001 * GRID_2040, SIZES.page, 86400, 365)), 376);
  assert.equal(Math.round(powerFor(10, SIZES.genome) / GRID_2040 * 100), 2797);
});

test("power from orbit and the cold annex never share rock: the second waits for its own megatonnes", () => {
  const g = golden.works[0];
  const alone = mock(g);
  const both = pace([...(g.orders as Order[]), { y: 12, begin: "Cold annex" }], 120, { scale: g.scale, aside: g.aside as [number, number, number][] });
  const [first, second] = [both.done["Cold annex"], both.done["Power from orbit"]].sort((a, b) => a - b);
  const rock = (y: number) => pace([...(g.orders as Order[]), { y: 12, begin: "Cold annex" }], y, { scale: g.scale, aside: g.aside as [number, number, number][] }).rockKt;
  assert.ok(rock(first) < 14_000 - 1 && rock(second) >= 14_000 - 1e-6, `${rock(first)} kt, then ${rock(second)}`);
  // Both done, so one more data center fits for each.
  assert.equal(both.dataCenters.length, alone.dataCenters.length + 1);
});

test("the Halo Survey sees what calcs/neighbors.py's glow_at gives, over ALMA's floor: none by Year 50, 12 by Year 100", async () => {
  let fifty = 0, hundred = 0;
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    fifty += glows(world, 0, 50).length;
    hundred += glows(world, 0, 100).length;
  }
  assert.equal(fifty, 0);
  assert.equal(hundred, 12);
});

test("a lens pictures a felt world's face once its picture is home: a home's cities, a natural world's ground", async () => {
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const home = world.finds.find((f) => f.truth.kind === "home");
    if (!home) continue;
    const star = world.stars[home.star]?.shown ?? home.star;
    const kit = { lenses: [{ star, looks: 30, home: 30.5 }] };
    assert.equal(earthKnows(world, 30.4, {}, kit).visits.filter((v) => v.by === "lens").length, 0);
    const v = earthKnows(world, 30.5, {}, kit).visits.find((x) => x.by === "lens")!;
    assert.equal(v.sight, "cities");
    assert.ok(Math.abs(v.km! - (25 * home.d) / (30 * 3.2616)) < 1e-9);
    return;
  }
  assert.fail("no seed has a felt home");
});

test("a sentinel stays and sees who lives there: its first word comes home one light-time after it arrives", async () => {
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const home = world.finds.find((f) => f.truth.kind === "home");
    if (!home) continue;
    const star = world.stars[home.star]?.shown ?? home.star;
    const word = 10 + home.d / 0.1 + 10 + home.d;
    const kit = { sentinels: [{ star, leaves: 10 }] };
    assert.equal(earthKnows(world, word - 0.01, {}, kit).visits.length, 0);
    const v = earthKnows(world, word, {}, kit).visits.find((x) => x.by === "sentinel")!;
    assert.ok(v.lives && v.sight === "cities" && v.air?.oxygen);
    return;
  }
  assert.fail("no seed has a felt home");
});

test("black holes: Gaia's finds are known at Year 0, the Star Mapper finds more, and a sentinel measures one's spin", async () => {
  const { darkMasses, iscoClock } = await import("./knowledge.ts");
  assert.ok(Math.abs(iscoClock(0) - Math.SQRT1_2) < 1e-9);
  let gaia = 0, mapped = 0;
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    gaia += darkMasses(world, 0, null).length;
    mapped += darkMasses(world, 50, 0).length;
    assert.equal(earthKnows(world, 0).holes?.length ?? 0, world.holes!.filter((h) => h.found2040).length);
  }
  assert.ok(gaia < mapped, `${gaia} by Gaia, ${mapped} by Year 50 with a mapper`);
  const world = await loadWorld(10);
  const h = darkMasses(world, 300, 0)[0];
  const home = 10 + h.d / 0.1 + 10 + h.d;
  const v = earthKnows(world, home, {}, { mapper: 0, sentinels: [{ star: h.name, leaves: 10 }] }).visits.find((x) => x.sight === "dark")!;
  assert.equal(v.spin, world.holes!.find((x) => x.id === h.id)!.spin);
});

test("every game has a black hole to find: the Star Mapper finds one within 20 Years of being done, in every seed", async () => {
  const { darkMasses } = await import("./knowledge.ts");
  for (const seed of POOL) assert.ok(darkMasses(await loadWorld(seed), 20, 0).length > 0, `seed ${seed} has none to find`);
});

test("a neighbor may reach a black hole before us, never before Year 0, and our sentinel sees it there unnamed", async () => {
  const { darkMasses } = await import("./knowledge.ts");
  let checked = false;
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    for (const h of world.holes!) for (const c of h.claims ?? []) assert.ok(c.arrives > 0, `seed ${seed}: ${c.who} at ${h.id} before Year 0`);
    const hole = world.holes!.find((h) => h.claims?.some((c) => c.kind === "colony"));
    if (!hole || checked) continue;
    const named = darkMasses(world, 2000, 0).find((d) => d.id === hole.id);
    if (!named) continue;
    const settled = hole.claims!.find((c) => c.kind === "colony")!.stands!;
    const leaves = settled;                                       // ours leaves once theirs stands, so it arrives after
    const home = leaves + hole.d / 0.1 + 10 + hole.d;
    const v = earthKnows(world, home, {}, { mapper: 0, sentinels: [{ star: named.name, leaves }] }).visits.find((x) => x.sight === "dark")!;
    assert.ok(v.others?.some((o) => o.kind === "colony"));
    assert.ok(!describe(earthKnows(world, home, {}, { mapper: 0, sentinels: [{ star: named.name, leaves }] })).includes(hole.claims![0].who));
    checked = true;
  }
  assert.ok(checked, "no seed has a colony at a hole the mapper finds");
});

test("our Mind at a black hole: word of its landing comes one light-time later, and a furnace grows where a refuge stays dark", async () => {
  const { darkMasses } = await import("./knowledge.ts");
  const world = await loadWorld(10);
  const h = darkMasses(world, 300, 0)[0];
  const lands = 10 + h.d / 0.1 + 10 + 15;
  const at = (year: number, mode: "furnace" | "refuge") => earthKnows(world, year, {}, { mapper: 0, colony: { star: h.name, mode, leaves: 10 } }).colony!;
  assert.equal(at(lands + h.d - 1, "furnace").others, undefined);
  assert.ok(Math.abs(at(lands + h.d, "furnace").lands! - lands) < 1e-9);
  assert.ok(at(lands + h.d + 60, "furnace").watts! > 1e14);
  assert.equal(at(lands + h.d + 60, "refuge").watts, undefined);
});

test("seed probes copy themselves to the nearest free stars, two each, for three generations, and stop", () => {
  const probes = seedProbes([{ star: "Proxima Centauri", leaves: 45 }]);
  assert.equal(probes.length, 7);
  assert.deepEqual(probes.map((p) => p.gen).sort(), [1, 2, 2, 3, 3, 3, 3]);
  const [first] = probes;
  assert.equal(first.lands, 45 + hop(first.d));
  // Alpha Centauri is Proxima's home ground, so its first copy goes on to Barnard's Star, 60 Years after it lands.
  assert.equal(first.copies[0].star, "Barnard’s Star");
  assert.equal(first.copies[0].leaves, first.lands + 60);
  assert.equal(first.copies[1].leaves, first.lands + 80);
  assert.equal(new Set(probes.map((p) => p.star)).size, 7);
  assert.ok(probes.filter((p) => p.gen === 3).every((p) => p.copies.length === 0));
  // Two sent never chase the same star.
  const two = seedProbes([{ star: "Proxima Centauri", leaves: 45 }, { star: "Barnard’s Star", leaves: 45 }]);
  assert.equal(new Set(two.map((p) => p.star)).size, two.length);
});

test("a seed probe's word comes home from each star a light-time after it lands, and it sees who lives there", async () => {
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const n = world.neighbors.find((x) => !x.dead);
    if (!n) continue;
    const star = world.stars[n.star].shown;
    const [p] = seedProbes([{ star, leaves: 10 }]);
    if (!p) continue;
    const kit = { seeds: [{ star, leaves: 10 }] };
    assert.equal(earthKnows(world, p.lands + p.d - 0.01, {}, kit).visits.filter((v) => v.by === "seed").length, 0);
    const v = earthKnows(world, p.lands + p.d, {}, kit).visits.find((x) => x.by === "seed")!;
    assert.ok(v.lives && v.sight === "cities" && v.gen === 1);
    const later = earthKnows(world, 1000, {}, kit);
    assert.equal(later.visits.filter((x) => x.by === "seed" && !x.sent).length, 7);
    assert.equal(later.visits.filter((x) => x.sent).length, 6);
    assert.match(describe(later), /seed probe/);
    return;
  }
  assert.fail("no seed has a living neighbor in the census");
});

test("our Mind settled at a star: word of its landing comes one light-time later, and the people living there see it brake in", async () => {
  const { crafts, notices } = await import("./meetings.ts");
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const n = world.neighbors.find((x) => !x.dead);
    if (!n) continue;
    const star = world.stars[n.star].shown, d = world.stars[n.star].d;
    const lands = 10 + hop(d);
    const kit = { colony: { star, mode: "settle" as const, leaves: 10 } };
    const at = (year: number) => earthKnows(world, year, {}, kit).colony!;
    assert.equal(at(lands + d - 0.01).others, undefined);
    const c = at(lands + d);
    assert.ok(c.atStar && Math.abs(c.lands! - lands) < 1e-9);
    assert.ok(c.others?.some((o) => o.kind === "home"));
    assert.match(describe(earthKnows(world, lands + d, {}, kit)), /settle there/);
    const [seen] = notices(world, crafts(world, kit), () => true).filter((x) => x.neighbor === n);
    assert.ok(seen && seen.local && seen.first === "them" && Math.abs(seen.at - lands) < 1e-9);
    return;
  }
  assert.fail("no seed has a living neighbor in the census");
});
