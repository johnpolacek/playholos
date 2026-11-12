// The simulation's checks: run `npm test`. Each pins the TypeScript to what Python and the mocks show.
import assert from "node:assert/strict";
import { test } from "node:test";
import golden from "./golden.json" with { type: "json" };
import { describe, earthKnows } from "./knowledge.ts";
import { observe } from "./observing.ts";
import { PyRandom } from "./pyrandom.ts";
import { sha512 } from "./sha512.ts";
import { catalogOf, drawMinds, fillers, HOLOS_ODDS, safeTop } from "./draw-minds.ts";
import { blake2b } from "./blake2b.ts";
import { drawWorlds, HOLOS_WORLD_ODDS, keyed, RUNGS, type Host } from "./draw-worlds.ts";
import hostsJson from "../../data/sim-hosts.json" with { type: "json" };
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { hop, seedProbes } from "./spread.ts";
import { POOL } from "./pool.ts";
import { loadWorld } from "./world.ts";
import { rangedAt, glowsFound } from "./minds.ts";
import { centers, offEarth, pace, type Order } from "./works.ts";
import catalog from "../../data/works.json" with { type: "json" };
import { ICE, deathsIn, iceBetween, iceFirsts } from "../game/natural.ts";
import { fieldFlux, fieldHeardAt, FIELDS } from "./fields.ts";
import { bulletBeta, bulletYears, flybyBeta, flybyYears, gasAt, sentinelYears, shipYears, stay, theirBeta, theirReady, theirYears } from "./speeds.ts";
import { proximaField } from "./proxima.ts";

test("the generator is CPython's, seeded from ints and strings", () => {
  for (const [key, want] of Object.entries(golden.random)) {
    const r = new PyRandom(/^\d+$/.test(key) ? BigInt(key) : key);
    assert.deepEqual(want.map(() => r.random()), want, key);
  }
});

test("the browser's SHA-512 is node's", () => {
  for (const s of ["", "abc", "10:minds:peer:5", "x".repeat(111), "x".repeat(112), "y".repeat(300)]) {
    const b = new TextEncoder().encode(s);
    assert.equal(Buffer.from(sha512(b)).toString("hex"), createHash("sha512").update(b).digest("hex"), `${s.length} bytes`);
  }
});

test("the minds draw at Holos's odds is calcs/minds.py's, in every shipped world", async () => {
  const b = readFileSync(new URL("../../../data/gcns-326ly.bin", import.meta.url));
  const stars = catalogOf(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  for (const seed of POOL) {
    const got = drawMinds(seed, stars);
    const peers = got.peers.map(({ fills, ...p }) => (assert.ok(!fills), p));
    assert.equal(JSON.stringify({ ...got, peers }), JSON.stringify((await loadWorld(seed)).minds), `seed ${seed}`);
  }
});

const hosts = hostsJson as Host[];

test("the browser's BLAKE2b is Python's, as calcs/seed.py's keyed() reads it", () => {
  const hex = (u: Uint8Array) => Buffer.from(u).toString("hex");
  assert.equal(hex(blake2b(new TextEncoder().encode("abc"), 8)), "d8bb14d833d59559");
  assert.equal(hex(blake2b(new TextEncoder().encode("y".repeat(200)), 8)), "21bbef050e848d31");
  assert.ok(keyed(10, "natural", "HIP 71681") > 0 && keyed(10, "natural", "HIP 71681") < 1);
});

test("natural warm worlds at Holos's odds are calcs/seed.py's, in every shipped world", async () => {
  const r4 = (x: number | null) => (x === null ? null : Math.round(x * 1e4) / 1e4);
  for (const seed of POOL) {
    const got = drawWorlds(seed, hosts).map((w) => [w.star, r4(w.d), r4(w.a), r4(w.radius), r4(w.mass), r4(w.pole), r4(w.tug), w.rung, r4(w.age), w.ageBy, r4(w.thaw), w.field]);
    const want = ((await loadWorld(seed)).worlds as unknown as Record<string, unknown>[]).map((w) =>
      ["star", "d", "a", "radius", "mass", "pole", "tug", "rung", "age", "ageBy", "thaw", "field"].map((k) => w[k]));
    assert.deepEqual(got, want, `seed ${seed}`);
  }
});

test("the air and animals dials nudge the physics: more air, more airy worlds; slower life, fewer with animals", () => {
  const count = (o: Partial<typeof HOLOS_WORLD_ODDS>, rung: (typeof RUNGS)[number]) =>
    drawWorlds(10, hosts, { ...HOLOS_WORLD_ODDS, ...o }).filter((w) => w.rung === rung).length;
  assert.ok(count({ air: 0.9 }, RUNGS[0]) < count({}, RUNGS[0]));
  assert.ok(count({ animals: 0.1 }, RUNGS[4]) < count({}, RUNGS[4]));
});

test("spreading's limit is calcs/spread_limit.py's: under about 1 in 84 at one mind per 1,600 stars", () => {
  assert.equal(Math.round(1 / safeTop(1600)), 84);
  assert.ok(fillers(HOLOS_ODDS) < 0.5 && fillers({ ...HOLOS_ODDS, spreadTop: 0.05 }) > 1);
});

test("seed 10 at Year 0: one felt world, natural, and no signals: the neighbors are retired", async () => {
  const view = earthKnows(await loadWorld(10), 0);
  assert.deepEqual(view.felt.map((f) => f.star), ["Gliese 1232"]);
  assert.equal(view.heard.length, 0);
});

test("the wall: the Mind's words never name a world's true rung", async () => {
  for (const seed of [10, 11, 62]) {
    const world = await loadWorld(seed);
    const words = describe(earthKnows(world, 0));
    for (const rung of ["bare rock", "hiding microbes", "showing oxygen", "animals", "where life died", "frozen"])
      assert.ok(!words.includes(rung), `seed ${seed} leaks a rung: ${rung}`);
  }
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

test("the Galaxy Broadcast Array's call matches calcs/messages.py: a page read to 6,674 ly on the first pass", async () => {
  const { callBits, callPasses, callReach, noticeReach, CALL, SIZES } = await import("./messages.ts");
  assert.equal(Math.round(callReach(SIZES.page)), 6674);
  assert.equal(Math.round(callReach(SIZES.page, 100)), 66736);
  assert.equal(Math.round(callBits(2700)), 146625);
  assert.deepEqual([2700, 10000, 27000, 50000].map((d) => callPasses(SIZES.page, d)), [1, 3, 17, 57]);
  // Noticed anywhere in the Galaxy in one dwell. Cosmic Call 2's 220 MB would be read only next door.
  assert.equal(Math.round(noticeReach(CALL.eirp, 12, CALL.dwell)), 323697);
  assert.equal(Math.round(callReach(SIZES.collection) * 10) / 10, 24.6);
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

test("fusion plants add 2.4 times Year 0's electricity, so the data centers that room holds fit once they are done", () => {
  const g = golden.works[0];
  const alone = mock(g);
  const fused = pace([...(g.orders as Order[]), { y: 0, begin: "Fusion plants" }], 80, { scale: g.scale, aside: g.aside as [number, number, number][] });
  // 30 standard Years, no faster than two thirds of that however much thought pushes it, and slower when thought is
  // short, as it is under electricity's limit since 2026-10-31.
  assert.ok(fused.done["Fusion plants"] >= 20 && fused.done["Fusion plants"] <= 45, `done at Year ${fused.done["Fusion plants"]}`);
  // Ground solar's room is already in the mock, so fusion's own adds what the two together hold beyond it.
  assert.equal(fused.dataCenters.length, alone.dataCenters.length + centers(1, 0.96 + 2.4) - centers(1, 0.96));
  assert.ok(fused.dataCenters.at(-1)! >= fused.done["Fusion plants"] - 1e-9);
});

test("a rock coming: the same for a seed, found before it strikes, and pushed aside only if the push lands in time", async () => {
  const { rockOf, rockAt, leadNeeded } = await import("../game/rocks.ts");
  const rocks = POOL.map((s) => rockOf(s)).filter((r) => r !== null);
  assert.deepEqual(rockOf(15), rockOf(15));
  // About 0.6 strikes a millennium of rocks no survey mapped: roughly 45% of games see one in 1,000 Years.
  assert.ok(rocks.length >= 8 && rocks.length <= 22, `${rocks.length} of ${POOL.length}`);
  for (const r of rocks) assert.ok(r.m >= 50 && r.strikes <= 1000 && (r.found === null || r.found < r.strikes));
  const rock = rockOf(15)!;
  const late = rock.strikes - leadNeeded(rock.m) + 0.5, early = rock.strikes - leadNeeded(rock.m) - 2;
  const plan = { builds: [], observe: [], later: [{ name: "Rock Deflector", y: rock.found! }] };
  assert.equal(rockAt(rock, plan, { "Rock Deflector": early - 1 }, rock.strikes)!.state, "pushed");
  assert.equal(rockAt(rock, plan, { "Rock Deflector": late - 1 }, rock.strikes)!.state, "struck");
  assert.equal(rockAt(rock, { builds: [], observe: [] }, {}, rock.found!)!.state, "coming");
});

test("strikes: a tonne at a tenth of light speed lands with 108 Mt, and harm grows with energy", async () => {
  const { bulletMt, harmOf, mtPerTonne, rockMt } = await import("./conflict.ts");
  assert.equal(Math.round(mtPerTonne(0.1)), 108);
  assert.equal(Math.round(bulletMt() / 1000), 108);
  assert.equal(harmOf(5).tier, "local");
  assert.equal(harmOf(bulletMt()).tier, "climate");
  assert.ok(harmOf(10).share < 0.01 && harmOf(1e3).share > 0.05 && harmOf(1e5).share > 0.3 && harmOf(1e8).share === 1);
  assert.ok(harmOf(1e8).ends && !harmOf(1e7).ends);
  // A 60 m rock lands like Tunguska, a 140 m one like a hundred of them.
  assert.ok(rockMt(60) > 5 && rockMt(60) < 20 && rockMt(140) > 50 && rockMt(140) < 300, `${rockMt(60)}, ${rockMt(140)}`);
});

test("a strike cuts our thought, and it comes back as we rebuild", () => {
  const g = golden.works[0];
  const base = mock(g);
  const hit = pace([...(g.orders as Order[]), { y: 30, harm: 0.4, recover: 10 }], 80, { scale: g.scale, aside: g.aside as [number, number, number][] });
  const at = (y: number, extra: Order[] = []) => pace([...(g.orders as Order[]), ...extra], y, { scale: g.scale, aside: g.aside as [number, number, number][] }).thought;
  assert.ok(Math.abs(at(30.05, [{ y: 30, harm: 0.4, recover: 10 }]) / at(30.05) - 0.6) < 0.01);
  assert.ok(Math.abs(at(45, [{ y: 30, harm: 0.4, recover: 10 }]) / at(45) - 1) < 1e-9);
  // Works under way when it lands are done later.
  assert.ok(Object.keys(base.done).some((w) => (hit.done[w] ?? Infinity) > base.done[w] + 1e-6));
});

test("Earth lost: a backup wakes small where something can run it, and doubles back to all of it", () => {
  const g = golden.works[0];
  const at = (y: number, extra: Order[] = []) => pace([...(g.orders as Order[]), ...extra], y, { scale: g.scale, aside: g.aside as [number, number, number][] }).thought;
  const lost: Order = { y: 30, restore: 0.01, doubling: 2 };
  assert.ok(Math.abs(at(30.01, [lost]) / at(30.01) - 0.01) < 0.001);
  // No data center is built once Earth is lost, so it regrows to what Earth had then.
  const woke = at(30, [lost]);
  assert.ok(Math.abs(at(34, [lost]) / woke - 4) < 1e-6);
  assert.ok(Math.abs(at(50, [lost]) / woke - 100) < 1e-6);
});

test("Earth lost: its works leave the line, and a backup builds only off Earth", () => {
  const orders: Order[] = [
    { y: 0, begin: "Laser sail array" },
    { y: 0, begin: "Probe yard" },
    { y: 5, restore: 0.01, doubling: 2 },
    { y: 6, begin: "Ground solar" },
    { y: 6, begin: "Orbital yard" },
  ];
  const p = pace(orders, 6.01);
  assert.deepEqual(p.line.map((l) => l.work), ["Probe yard", "Orbital yard"]);
  assert.ok(offEarth("Moon vault") && offEarth("Seed ship") && !offEarth("Launch complex"));
});

test("the Launch Tunnel builds our craft a fifth faster, and nothing else", () => {
  const took = (work: string, tunnel: boolean) => {
    const orders: Order[] = [...(tunnel ? [{ y: 0, begin: "Launch tunnel" }] : []), { y: 50, begin: work }];
    return pace(orders, 200).done[work] - 50;
  };
  assert.ok(Math.abs(took("Strike yard", true) / took("Strike yard", false) - 0.8) < 1e-3);
  assert.ok(Math.abs(took("Infrared telescope", true) / took("Infrared telescope", false) - 1) < 1e-3);
});

test("a lens pictures a felt world's face once its picture is home: its ground, never cities, now no one lives near", async () => {
  const world = await loadWorld(10);
  const f = world.finds[0];
  const star = world.stars[f.star]?.shown ?? f.star;
  const kit = { lenses: [{ star, looks: 30, home: 30.5 }] };
  assert.equal(earthKnows(world, 30.4, kit).visits.filter((v) => v.by === "lens").length, 0);
  const v = earthKnows(world, 30.5, kit).visits.find((x) => x.by === "lens")!;
  assert.notEqual(v.sight, "cities");
  assert.ok(Math.abs(v.km! - (25 * f.d) / (30 * 3.2616)) < 1e-9);
});

test("a sentinel stays and reads a felt world up close: its first word comes home one light-time after it arrives", async () => {
  const world = await loadWorld(10);
  const f = world.finds[0];
  const star = world.stars[f.star]?.shown ?? f.star;
  const word = 10 + sentinelYears(f.d, star) + f.d;
  const kit = { sentinels: [{ star, leaves: 10 }] };
  assert.equal(earthKnows(world, word - 0.01, kit).visits.length, 0);
  const v = earthKnows(world, word, kit).visits.find((x) => x.by === "sentinel")!;
  assert.ok(v && v.by === "sentinel");
});

test("flybys: a pass pictures a felt world, a probe reads its air, and a glow stays a glow", async () => {
  const world = await loadWorld(10);
  const f = world.finds[0];
  const star = world.stars[f.star]?.shown ?? f.star;
  const kit = {
    flybys: [
      { star, by: "sails" as const, passed: 100, home: 120 },
      { star, by: "probe" as const, passed: 100, home: 120 },
      { star: "Warm glow 1", by: "probe" as const, passed: 100, home: 120 },
    ],
  };
  assert.equal(earthKnows(world, 119, kit).visits.length, 0);
  const seen = earthKnows(world, 120, kit).visits;
  const sails = seen.find((v) => v.star === star && v.by === "sails")!;
  const probe = seen.find((v) => v.star === star && v.by === "probe")!;
  assert.equal(sails.air, undefined);
  assert.ok(probe.sight === "haze" || probe.air);
  assert.equal(seen.find((v) => v.star === "Warm glow 1")!.sight, "far");
});

test("a sentinel at a warm glow sees what makes its heat", async () => {
  const world = await loadWorld(10);
  const found = glowsFound(world, { warmWatch: 0, telescope: 0 }, 5000);
  assert.ok(found.length > 0);
  const src = found[0].src;
  const home = 10 + sentinelYears(src.d) + src.d;
  const kit = { warmWatch: 0, telescope: 0, sentinels: [{ star: "Warm glow 1", leaves: 10 }] };
  assert.equal(earthKnows(world, home - 0.01, kit).visits.filter((v) => v.by === "sentinel").length, 0);
  const v = earthKnows(world, home, kit).visits.find((x) => x.by === "sentinel")!;
  assert.equal(v.sight, "kind" in src ? "dusty" : "works");
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
  const home = 10 + sentinelYears(h.d) + h.d;
  const v = earthKnows(world, home, { mapper: 0, sentinels: [{ star: h.name, leaves: 10 }] }).visits.find((x) => x.sight === "dark")!;
  assert.equal(v.spin, world.holes!.find((x) => x.id === h.id)!.spin);
});

test("every game has a black hole to find: the Star Mapper finds one within 20 Years of being done, in every seed", async () => {
  const { darkMasses } = await import("./knowledge.ts");
  for (const seed of POOL) assert.ok(darkMasses(await loadWorld(seed), 20, 0).length > 0, `seed ${seed} has none to find`);
});

test("our Mind at a black hole: word of its landing comes one light-time later, and a furnace grows where a refuge stays dark", async () => {
  const { darkMasses } = await import("./knowledge.ts");
  const world = await loadWorld(10);
  const h = darkMasses(world, 300, 0)[0];
  const lands = 10 + shipYears(h.d);
  const at = (year: number, mode: "furnace" | "refuge") => earthKnows(world, year, { mapper: 0, colony: { star: h.name, mode, leaves: 10 } }).colony!;
  assert.equal(at(lands + h.d - 1, "furnace").stands, lands + 20);
  assert.ok(Math.abs(at(lands + h.d, "furnace").lands! - lands) < 1e-9);
  assert.ok(at(lands + h.d + 60, "furnace").watts! > 1e14);
  assert.equal(at(lands + h.d + 60, "refuge").watts, undefined);
});

test("seed probes copy themselves to the nearest free stars, two each, for three generations, and stop", () => {
  const probes = seedProbes([{ star: "Proxima Centauri", leaves: 45 }]);
  assert.equal(probes.length, 7);
  assert.deepEqual(probes.map((p) => p.gen).sort(), [1, 2, 2, 3, 3, 3, 3]);
  const [first] = probes;
  assert.equal(first.lands, 45 + hop(first.d, undefined, first.star));
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

test("a seed probe our Ship Beam pushed flies as a pushed ship does, and its copies still burn their own fuel", () => {
  const { burn } = catalog.seedShip, { ship } = catalog.beams;
  assert.ok(ship < 0.5 && burn === 10);
  const [own] = seedProbes([{ star: "Proxima Centauri", leaves: 45 }]);
  const pushed = seedProbes([{ star: "Proxima Centauri", leaves: 45, burn: ship }]);
  // Pushed, it carries no drive, so it stops on its sail alone: no burn to start, a longer stop.
  assert.ok(Math.abs(own.lands - 45 - shipYears(own.d, false, own.star)) < 1e-9);
  assert.ok(Math.abs(pushed[0].lands - 45 - shipYears(own.d, true, own.star)) < 1e-9);
  assert.notEqual(pushed[0].lands, own.lands);
  // Each copy is built where no beam stands: its flight is as long as before, only begun sooner.
  const copy = pushed.find((p) => p.gen === 2)!, before = seedProbes([{ star: "Proxima Centauri", leaves: 45 }]).find((p) => p.star === copy.star)!;
  assert.ok(Math.abs(copy.lands - copy.leaves - (before.lands - before.leaves)) < 1e-9);
});

test("a seed probe's word comes home from each star a light-time after it lands, and its copies go on", async () => {
  const world = await loadWorld(10);
  const star = world.stars[world.finds[0].star].shown;
  const [p] = seedProbes([{ star, leaves: 10 }]);
  const kit = { seeds: [{ star, leaves: 10 }] };
  assert.equal(earthKnows(world, p.lands + p.d - 0.01, kit).visits.filter((v) => v.by === "seed").length, 0);
  const v = earthKnows(world, p.lands + p.d, kit).visits.find((x) => x.by === "seed")!;
  assert.ok(v.gen === 1);
  const later = earthKnows(world, 1000, kit);
  assert.equal(later.visits.filter((x) => x.by === "seed" && !x.sent).length, 7);
  assert.equal(later.visits.filter((x) => x.sent).length, 6);
  assert.match(describe(later), /seed probe/);
});

test("our Mind settled at a star: word of its landing comes one light-time later, and no one was there first", async () => {
  const world = await loadWorld(10);
  const f = world.finds[0];
  const star = world.stars[f.star].shown, d = world.stars[f.star].d;
  const lands = 10 + hop(d, undefined, star);
  const kit = { colony: { star, mode: "settle" as const, leaves: 10 } };
  const at = (year: number) => earthKnows(world, year, kit).colony!;
  const c = at(lands + d);
  assert.ok(c.atStar && Math.abs(c.lands! - lands) < 1e-9);
  assert.match(describe(earthKnows(world, lands + d, kit)), /settle there/);
});

test("the Cold Halo doubles every 10 Years once done, a data center's step each, and holds while taken back", () => {
  const at = (y: number, extra: Order[] = []) => pace([{ y: 0, begin: "Cold halo" }, ...extra], y);
  const done = at(200).done["Cold halo"];
  assert.ok(done > 0);
  const t0 = at(done + 0.01).thought;
  assert.ok(Math.abs(at(done + 10.01).thought / t0 - 1.5) < 1e-6);
  assert.ok(Math.abs(at(done + 30.01).thought / t0 - 1.5 ** 3) < 1e-6);
  // Held from 15 Years in to 35: one doubling before, none while held, then on again.
  const held = [{ y: done + 15, drop: "Cold halo" }, { y: done + 35, begin: "Cold halo" }] as Order[];
  assert.ok(Math.abs(at(done + 34, held).thought / t0 - 1.5) < 1e-6);
  assert.ok(Math.abs(at(done + 40.01, held).thought / t0 - 1.5 ** 2) < 1e-6);
});

test("the realistic premise's minds: old near us, peers across the Galaxy, a watcher every game", async () => {
  let olds = 0, peers = 0;
  for (const s of POOL) {
    const { minds } = await loadWorld(s);
    assert.ok(minds, `seed ${s} has no minds`);
    olds += minds.old.length; peers += minds.peers.length;
    // Old minds lie out to the 326 ly catalog's edge, nearest first, on real stars. Each woke before the
    // peers' window and after the thin disk's first stars.
    minds.old.forEach((o, i) => {
      assert.ok(o.d <= 2000 && (i === 0 || o.d >= minds.old[i - 1].d));
      assert.ok(o.star === null ? o.d >= 326 : o.d <= 326.5, `${o.id} at ${o.d} ly`);
      assert.ok(o.age > 1e5 && o.age <= 10.5e9 && (o.asleep ? o.glowW === null : o.glowW! > 0));
    });
    // A peer's warm phase reaches us d Years after it shines, and our light finds it inward, outward or not yet awake.
    for (const p of minds.peers) {
      assert.ok(Math.abs(p.flash[0] - (p.wake + p.d)) <= 0.15, p.id);
      assert.ok(p.outwardYears >= 50 && p.reachLy % 5 === 0 && (p.settlements > 0) === (p.reachLy > 0));
      const at = p.wake > p.d ? "unborn" : p.wake + p.outwardYears < p.d ? "inward" : "outward";
      assert.equal(p.atContact, at, p.id);
    }
    // The watcher answers for the nearest old mind. It warns at once, and the maker's acts cross the gap and back.
    const w = minds.watcher, maker = minds.old[0];
    assert.equal(w.maker, maker.id);
    assert.deepEqual(w.ladder.map((r) => r.rung), ["warn", "contain", "strike"]);
    assert.equal(w.ladder[0].delay, 0);
    // Word crosses to the maker at light speed, and what it throws comes back near it: lib/sim/speeds.ts.
    assert.equal(w.ladder[1].delay, Math.round(maker.d + theirYears(maker.d)));
    assert.ok(w.ladder[1].delay > 2 * maker.d && w.ladder[1].delay < 4 * maker.d);
  }
  // About 190 old minds within 326 ly a game, and about 785 peers still to shine of the Galaxy's 800 within 20,000
  // years of us, loosely.
  assert.ok(olds / POOL.length > 160 && olds / POOL.length < 230, `${olds / POOL.length} old minds a game`);
  assert.ok(peers / POOL.length > 700 && peers / POOL.length < 870, `${peers / POOL.length} peers a game`);
});

test("finding minds: a flash while the warm watch runs, most cold glows, the watcher by where it sits, a sleeper up close", async () => {
  const { skyOf, flashOf, coldGlowOf, watcherOf, sleeperOf, WARM_EVERY, MOON_SEARCH_YEARS, STAY_SEARCH_YEARS, FLYBY_SEES_AU, CO_ORBITALS, TOUR_EACH, TOUR_MAP, HALO_RATE, ARRAY_RATE } = await import("./minds.ts");
  const { skyBasis } = await import("../../../src/coordinates.js");
  // Sky positions agree with the atlas's own frame.
  for (const [ra, dec] of [[56.6, 24.1], [262.17, -0.58], [6.02, -72.08]]) {
    const r = skyBasis(ra, dec).radial;
    const s = skyOf([r.x * 500, r.y * 500, r.z * 500]);
    assert.ok(Math.abs(s.ra * 15 - ra) < 0.01 && Math.abs(s.dec - dec) < 0.01, `${ra} ${dec}`);
  }
  let awake = 0, glowing = 0;
  for (const s of POOL) {
    const world = await loadWorld(s);
    const m = world.minds!;
    // Earth knows no mind with nothing built: the wall holds.
    assert.equal(earthKnows(world, 100000).minds, undefined);
    for (const p of m.peers) {
      const f = flashOf(p, 0, 1e6);
      if (p.flash[1] < 0) assert.equal(f, null);
      else assert.ok(f && f.seen >= Math.max(0, p.flash[0]) && f.seen < Math.max(0, p.flash[0]) + WARM_EVERY + 1e-9, p.id);
      assert.equal(flashOf(p, p.flash[1] + 1, 1e6), null);   // built after it faded: missed for good
      // Ranged by our Infrared Telescope while it shines: a range that holds the truth. Faded first, never ranged.
      const r = flashOf(p, 0, 1e6, 0);
      if (r?.range) assert.ok(r.range[0] <= p.d && p.d <= r.range[1] && r.ranged! <= p.flash[1], p.id);
      // Ranged once out of the Sun's glare, within 6 months, in hours of looking. 2026-11-08.
      if (r?.ranged !== undefined) assert.ok(r.ranged >= r.seen && r.ranged - r.seen < 0.5 + 1e-3, p.id);
      if (r && rangedAt(r, Math.max(r.seen, 0), 0) > p.flash[1]) assert.equal(r.range, undefined);
    }
    for (const o of m.old) if (!o.asleep) { awake++; if (coldGlowOf(o, 0, 1e6)) glowing++;
      // Star by star, nearest first: the farther, the later, and the array ten times sooner.
      const slow = coldGlowOf(o, 0, 1e6), fast = coldGlowOf(o, null, 1e6, 0);
      if (slow) assert.ok(fast && Math.abs(fast.seen * (ARRAY_RATE / HALO_RATE) - slow.seen) < 1e-6 * slow.seen);
    }
    // The watcher shows itself when it warns us, and a moon search finds it only at the Moon's L4 or L5.
    const w = m.watcher;
    assert.deepEqual(watcherOf(world, { firstSeed: 40 }, 39), null);
    assert.equal(watcherOf(world, { firstSeed: 40 }, 40)?.by, "its warning");
    const moon = watcherOf(world, { moonSearch: 10 }, 1000);
    assert.equal(moon?.seen ?? null, w.place.startsWith("Earth–Moon") ? 10 + MOON_SEARCH_YEARS : null);
    // The asteroid tour finds it only on its own rock, in the tour's order. At the Sun–Earth points, only its warning.
    const tour = watcherOf(world, { asteroidTour: 20 }, 1000);
    assert.equal(tour?.seen ?? null, w.rock ? 20 + CO_ORBITALS.indexOf(w.rock) * TOUR_EACH + TOUR_MAP : null);
    if (w.place.startsWith("Sun–Earth")) assert.equal(watcherOf(world, { moonSearch: 10, asteroidTour: 20 }, 1e5), null);
    // Only seeds that build out a star draw its warning: a Mind sent to settle does, one kept small never does.
    const star = "Proxima Centauri";
    const told = (mode: "settle" | "quiet") => earthKnows(world, 60, { colony: { star, mode, leaves: 50 } }).minds?.watcher ?? null;
    assert.equal(told("settle")?.by, "its warning");
    assert.equal(told("settle")?.seen, 50);
    assert.equal(told("quiet"), null);
    // Up close its mirror points at its relay, opposite its maker, and a Relay Search out that line finds it there.
    assert.ok(w.relayAU >= 1000 && w.relayAU <= 2500, `relay at ${w.relayAU} AU`);
    if (w.place.startsWith("Earth–Moon")) {
      const kit = { moonSearch: 10, closeLook: 20, relaySearch: { built: 30, perAU: 0.03 } };
      const seen = watcherOf(world, kit, 1e5)!, sent = skyOf(m.old.find((o) => o.id === w.maker)!.pos);
      assert.ok(Math.abs(((seen.looked!.ra + 12) % 24) - sent.ra) < 1e-3 && Math.abs(seen.looked!.dec + sent.dec) < 1e-2);
      assert.ok(Math.abs(seen.relay!.at - (30 + 0.03 * w.relayAU + w.relayAU / 63241)) < 1e-9);
      assert.equal(watcherOf(world, kit, seen.relay!.at - 0.01)?.relay, undefined);
      assert.equal(watcherOf(world, { ...kit, relaySearch: null }, 1e5)?.relay, undefined);
    }
    // A craft that stays finds a sleeper. A flyby only if it rests within a 1 m telescope's reach. A hostile one's
    // machines wreck a craft that comes to stay, so it finds nothing there. 2026-11-11.
    for (const o of m.old.filter((o) => o.asleep)) {
      const stay = sleeperOf(o, [{ pos: o.pos, arrives: 5000, stays: true }], 1e6, w.maker);
      if (o.peaceful <= 3 && o.id !== w.maker) assert.equal(stay, null);
      else assert.equal(stay?.seen, 5000 + STAY_SEARCH_YEARS + o.d);
      const pass = sleeperOf(o, [{ pos: o.pos, arrives: 5000, stays: false }], 1e6);
      assert.equal(pass !== null, o.restAU! <= FLYBY_SEES_AU);
      assert.equal(sleeperOf(o, [{ pos: [o.pos[0] + 1, o.pos[1], o.pos[2]], arrives: 5000, stays: true }], 1e6), null);
    }
  }
  // The Halo Survey sees about half the awake old minds.
  assert.ok(glowing / awake > 0.55 && glowing / awake < 0.85, `${glowing} of ${awake}`);   // about 7 in 10 since the all-sky cap loosened, 2026-10-31
});

test("the ladder: warned at our first seed, our seeds wrecked after another, and Earth struck once copies launch seeds", async () => {
  const { ladderOf } = await import("./ladder.ts");
  const { seedProbes } = await import("./spread.ts");
  const world = await loadWorld(22);
  const maker = world.minds!.old.find((o) => o.id === world.minds!.watcher.maker)!;
  // One seed: warned, nothing wrecked, but its copies launch seeds of their own, so a bullet comes, far later.
  const one = ladderOf(world, seedProbes([{ star: "Proxima Centauri", leaves: 50 }]), null);
  assert.equal(one.warned, 50);
  assert.equal(one.lost.length, 0);
  assert.ok(one.strike && one.strike.lands > 50 + maker.d + theirYears(maker.d), `${one.strike?.lands}`);
  // The maker's beam stands, so it throws within months of choosing to: no 32 Years of readying. 2026-11-12.
  assert.ok(Math.abs(one.strike!.lands - one.strike!.chose - theirReady(maker.d) - theirYears(maker.d)) < 1e-9 && theirReady(maker.d) < 1);
  // Another after the warning: grams cross to every star we reached, after word reaches the maker.
  const two = ladderOf(world, seedProbes([{ star: "Proxima Centauri", leaves: 50 }, { star: "Barnard’s Star", leaves: 60 }]), null);
  assert.ok(two.lost.length >= 2);
  assert.ok(two.lost.every((l) => l.at > 60 + maker.d));
  // Kept small, a Mind draws nothing. Sent to settle, it is warned only, alone.
  assert.equal(ladderOf(world, [], { star: "Proxima Centauri", mode: "quiet", leaves: 50 }).warned, null);
  const settle = ladderOf(world, [], { star: "Proxima Centauri", mode: "settle", leaves: 50 });
  assert.equal(settle.warned, 50);
  assert.equal(settle.strike, null);
  // What the maker throws flies near light speed, 2026-11-11, so from 30 ly its grams wreck our seeds before any copy
  // leaves: containing us works, and no bullet follows. At a tenth of light speed they came too late to stop the copies.
  assert.equal(two.strike, null);
  assert.ok(two.lost.every((l) => l.at < 60 + maker.d + theirYears(2 * maker.d) + 60));
  // Earth learns of the strike once it lands, and of a silent seed once its word is overdue.
  const struck = one.strike!.lands;
  assert.equal(earthKnows(world, struck + 1, { seeds: [{ star: "Proxima Centauri", leaves: 50 }] }).minds!.watcher!.struck?.lands, struck);
  assert.equal(earthKnows(world, struck - 1, { seeds: [{ star: "Proxima Centauri", leaves: 50 }] }).minds!.watcher!.struck, undefined);
  const w = earthKnows(world, 1000, { seeds: [{ star: "Proxima Centauri", leaves: 50 }, { star: "Barnard’s Star", leaves: 60 }] }).minds!.watcher!;
  assert.ok(w.seedsLost!.length >= 1);
  assert.equal(w.struck, undefined);
});

test("the Solar Swarm thinks with the light it catches, doubling every 2 Years, and stops once it catches all the Sun", () => {
  const at = (y: number, extra: Order[] = []) => pace([{ y: 0, begin: "Solar swarm" }, ...extra], y);
  const done = at(400).done["Solar swarm"];
  assert.ok(done > 0);
  const t0 = at(done + 0.01).thought;
  // Small at first: its seed's power is under a hundredth of what our Mind drew at Year 0.
  assert.ok(t0 / pace([], done + 0.01).thought < 1.01);
  // Twenty doublings on, it thinks thousands of times what we did.
  const { thinks } = catalog.works["Solar swarm"];
  assert.ok(Math.abs(at(done + 40.01).thought / t0 - (1 + thinks * 2 ** 20) / (1 + thinks)) < 1e-3 * at(done + 40.01).thought / t0);
  // Past all the Sun it grows no more.
  assert.equal(at(done + 200).thought, at(done + 300).thought);
  // Held, it keeps its size.
  const held = [{ y: done + 9, drop: "Solar swarm" }] as Order[];
  assert.equal(at(done + 9.5, held).thought, at(done + 60, held).thought);
});

test("the Hypertelescope pictures each felt world in its reach, nearest first, a week each, and never cities", async () => {
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const f = world.finds.find((x) => x.d <= catalog.hyper.reach);
    if (!f) continue;
    const seen = earthKnows(world, 500, { hyper: 40 }).visits.filter((v) => v.by === "hyper");
    const reach = new Set(world.finds.filter((x) => x.d <= catalog.hyper.reach).map((x) => world.stars[x.star]?.shown ?? x.star));
    assert.equal(seen.length, reach.size + 1);
    assert.equal(seen[0].world, "Proxima b");
    assert.ok(seen.every((v, i) => i === 0 || v.passed > seen[i - 1].passed));
    const v = seen.find((x) => x.star === (world.stars[f.star]?.shown ?? f.star))!;
    assert.ok(Math.abs(v.km! - catalog.hyper.kmPerLy * f.d) < 1e-9);
    assert.equal(earthKnows(world, 39.9, { hyper: 40 }).visits.filter((x) => x.by === "hyper").length, 0);
    return;
  }
  assert.fail("no seed has a felt world in reach");
});

test("bullets wait on helium-3 from a harvest that doubles every 5 Years, in the order ordered, and none without one", async () => {
  const { bulletsReady, BULLET } = await import("./conflict.ts");
  const { HE3, he3By, he3When } = await import("./meetings.ts");
  // 1.5 kt a Year for 5 Years, 3 for the next 5: 22.5 kt by 10 Years in.
  assert.ok(Math.abs(he3By([[30, null]], 40) - 22.5) < 1e-9);
  // Held from Year 37 to 50, it gathers at 3 kt a Year, its size, then doubles again 3 Years after it grows on.
  assert.ok(Math.abs(he3By([[30, 37], [50, null]], 55) - (1.5 * 5 + 3 * 2 + 3 * 13 + 3 * 3 + 6 * 2)) < 1e-9);
  // The yard done at 10, the harvest at 30: the first waits on its fuel, the second on more, the third on its build.
  const ready = bulletsReady([10, 10, 200], 10, [[30, null]]);
  assert.ok(Math.abs(ready[0]! - he3When([[30, null]], HE3.bullet)!) < 1e-6 && ready[0]! > 42 && ready[0]! < 43);
  assert.ok(Math.abs(ready[1]! - he3When([[30, null]], 2 * HE3.bullet)!) < 1e-6);
  assert.equal(ready[2], 220);
  assert.deepEqual(bulletsReady([10], 10, []), [null]);
  // A neighbor starts its harvest when it chooses to strike: 20 Years to build, about 12.4 to fill.
  assert.ok(Math.abs(BULLET.ready - 32.4) < 0.05, String(BULLET.ready));
});

test("skipping ahead stops at the next thing we learn or build, and says when, never what", async () => {
  const { nextKnown, nextStop, GLOW_GAP } = await import("./next.ts");
  const world = await loadWorld(10);
  // Seed 10 with the Warm Sky Watch at Year 0 and our Infrared Telescope: warm glows rise and fade every few centuries.
  const ahead = earthKnows(world, 102500, { warmWatch: 0, telescope: 0 });
  // Once ranged, a glow stops the skip when it is, where Scan shows it, at most once in GLOW_GAP Years, and its fade
  // never does. Playtest 2026-11-01.
  const stops = (fs: NonNullable<typeof ahead.minds>["flashes"], at: (f: (typeof fs)[number]) => number) => {
    let last = -Infinity;
    return fs.map(at).sort((a, b) => a - b).filter((t) => (t - last >= GLOW_GAP ? ((last = t), true) : false));
  };
  const after = (ts: number[], y: number) => Math.min(...ts.filter((t) => t > y));
  assert.ok(ahead.minds!.flashes.some((f) => f.ranged! > 2000));
  assert.equal(nextKnown(ahead, 2000), after(stops(ahead.minds!.flashes, (f) => f.ranged ?? f.seen), 2000));
  assert.ok(stops(ahead.minds!.flashes, (f) => f.ranged!).length < ahead.minds!.flashes.length / 2);
  // Never ranged, as with no Infrared Telescope, the Warm Sky Watch's sighting stops it.
  const unranged = earthKnows(world, 102500, { warmWatch: 0 });
  assert.equal(nextKnown(unranged, 2000), after(stops(unranged.minds!.flashes, (f) => f.seen), 2000));
  // A place in [ra, dec, d] is never taken for a time, and a build done sooner stops the skip first.
  assert.equal(nextStop(ahead, 2000, { "Moon Search": 2001, "Halo Survey": null }), 2001);
  assert.equal(nextStop({ year: 0, felt: [], heard: [], visits: [] }, 5, {}), null);
  // A rock's Years stop it too, the past ones ignored.
  assert.equal(nextStop({ year: 0, felt: [], heard: [], visits: [] }, 5, {}, [3, null, 412.5]), 412.5);
});

test("our Glow Imager shows what makes each glow we have found, a week each: panels, a made ring, or a cloud", async () => {
  const { mindsSeen, IMAGER_SLEW } = await import("./minds.ts");
  const { glowNames } = await import("../game/glow-names.ts");
  const { nextKnown } = await import("./next.ts");
  const world = await loadWorld(10);
  const kit = { warmWatch: 5, telescope: 8, halo: 3, haloArray: 20 };
  const year = 2500;
  const before = mindsSeen(world, kit, year);
  assert.ok(before.glows.length > 1 && before.flashes.some((f) => f.range));
  assert.ok(before.glows.every((g) => g.imaged === undefined) && before.flashes.every((f) => !f.imaged));
  // Built at Year 400, it works through every glow found by then, the first a week on, then each new one as it comes.
  const seen = mindsSeen(world, { ...kit, imager: 400 }, year);
  assert.ok(seen.glows.every((g) => g.imaged !== undefined && g.imaged >= Math.max(400, g.seen) + IMAGER_SLEW - 1e-3));
  const first = seen.glows.filter((g) => g.seen <= 400).map((g) => g.imaged!).sort((a, b) => a - b);
  assert.ok(Math.abs(first[0] - (400 + IMAGER_SLEW)) < 2e-3 && first.every((t, i) => i === 0 || t - first[i - 1] > IMAGER_SLEW - 2e-3));
  // A warm glow is shown only once ranged and while it shines: a peer's is a made ring, nature's a cloud of dust.
  const found = glowsFound(world, kit, year);
  seen.flashes.forEach((f, i) => {
    if (!f.imaged) return;
    assert.ok(f.ranged !== undefined && f.imaged.at >= f.ranged && f.imaged.at <= found[i].src.flash[1]);
    assert.equal(f.imaged.saw, "kind" in found[i].src ? "cloud" : "ring");
  });
  assert.ok(seen.flashes.some((f) => f.imaged?.saw === "ring") && seen.flashes.some((f) => f.imaged?.saw === "cloud"));
  assert.ok(seen.flashes.filter((f) => f.faded !== undefined && f.faded <= 400).every((f) => !f.imaged));
  // A ring earns a warm glow its name, as plain heat does, and panels a cold glow's, as a sentinel's look does.
  const names = glowNames(seen);
  assert.ok(Object.keys(names).some((k) => k.startsWith("Warm glow")) && Object.keys(names).filter((k) => k.startsWith("Cold glow")).length === seen.glows.length);
  // Skipping ahead stops at its first look at a cold glow, and not at each one after.
  const kit2 = { telescope: 8, warmWatch: 5, halo: 3, haloArray: 20, imager: 400 };
  const ahead = earthKnows(world, 420, kit2);
  assert.ok(Math.abs(nextKnown(ahead, 400)! - (400 + IMAGER_SLEW)) < 2e-3);
  const next = nextKnown(ahead, 400 + IMAGER_SLEW + 0.01);
  assert.ok(next === null || next > 400 + 3 * IMAGER_SLEW);
});

test("a call through our Galaxy Broadcast Array is answered once by each awake peer, found or not, twice its distance on", async () => {
  const { peerAnswers } = await import("./peers.ts");
  const { callPasses, SIZES } = await import("./messages.ts");
  const world = await loadWorld(10);
  const peers = world.minds!.peers;
  const call = { y: 150, until: null, bits: SIZES.page, questions: true, lie: false, travels: "We are here. Who are you?" };
  const year = 60000;
  // No watch built, so no glow is found: every answer comes from a star we had not marked, in the order they came.
  const heard = peerAnswers(world, {}, [], year, [call]);
  assert.ok(heard.length > 20);
  assert.deepEqual(heard.map((h) => h.star), heard.map((_, i) => `Far voice ${i + 1}`));
  assert.ok(heard.every((h, i) => i === 0 || h.arrived >= heard[i - 1].arrived));
  // Each is a peer awake when it had read the call, and its answer takes its distance again to come home.
  for (const h of heard) {
    const p = peers.find((x) => x.d === h.d && !(x.asleep && h.sent >= x.wake + x.outwardYears))!;
    assert.ok(p && h.sent >= p.wake - 1e-6 && Math.abs(h.arrived - h.sent - p.d) < 1e-6);
    assert.ok(h.sent >= 150 + p.d + callPasses(SIZES.page, p.d) - 1 - 1e-6);
    assert.equal(h.answers, call.travels);
  }
  // The first comes no sooner than twice the nearest answering peer's distance, thousands of Years on.
  assert.ok(heard[0].arrived > 150 + 2 * Math.min(...peers.map((p) => p.d)) - 1e-6 && heard[0].arrived > 5000);
  // The same answers stand as time goes on: none is renamed, and more only join.
  const later = peerAnswers(world, {}, [], year + 20000, [call]);
  assert.deepEqual(later.slice(0, heard.length).map((h) => [h.star, h.arrived]), heard.map((h) => [h.star, h.arrived]));
  // Sent once, it is read only as far as one pass reads a page: farther minds notice a pulse they can't read.
  const once = peerAnswers(world, {}, [], year, [{ ...call, until: 150 }]);
  assert.ok(once.some((h) => /too short to read/.test(h.text!)) && once.every((h) => h.d > 6674 === /too short to read/.test(h.text!)));
  // No call, no answer.
  assert.equal(peerAnswers(world, {}, [], year).length, 0);
});

test("old minds differ by their part in the settling: one answers a knock, one stays silent, a hostile one wrecks our sentinel", async () => {
  const { mindsSeen, guardAt, hostile, HOSTILE } = await import("./minds.ts");
  const { oldAnswers, ANSWERS_IN, SILENT, WAKES_IN, pastSeen, GIVES_KNOWLEDGE } = await import("./old-minds.ts");
  const world = await loadWorld(10);
  const olds = world.minds!.old, maker = world.minds!.watcher.maker;
  // Every old mind has a part and three scores from 1 to 10, and only a sleeping one has a word on waking.
  for (const m of olds) {
    assert.ok(["founder", "stopped", "after"].includes(m.part));
    assert.ok([m.open, m.peaceful, m.generous].every((s) => Number.isInteger(s) && s >= 1 && s <= 10));
    assert.equal(m.wakes === null, !m.asleep);
    assert.equal(m.part === "after", m.age < 3e9);
  }
  // About two thirds were born after, and of those who lived through it, about 1 in 5 was made to stop.
  const lived = olds.filter((m) => m.part !== "after");
  assert.ok(Math.abs(olds.filter((m) => m.part === "after").length / olds.length - 0.67) < 0.1);
  assert.ok(Math.abs(lived.filter((m) => m.part === "stopped").length / lived.length - 0.2) < 0.12);
  // The mind that made our watcher is never hostile to a craft: it told us we may look.
  assert.ok(!hostile(olds.find((m) => m.id === maker)!, maker));
  const kit = { halo: 3, haloArray: 20 };
  const year = 5000;
  const seen = mindsSeen(world, kit, year);
  const mind = (id: string) => olds.find((m) => m.id === id)!;
  const knock = (to: string) => ({ to, y: 100, questions: true, lie: false, travels: "We see you. Who are you?" });
  // An awake, open mind answers a message from home, once, its distance and its own time on, and its distance back.
  const i = seen.glows.findIndex((g) => mind(g.id).open > SILENT);
  const m = mind(seen.glows[i].id);
  const [a] = oldAnswers(world, seen, [], [knock(`Cold glow ${i + 1}`), { ...knock(`Cold glow ${i + 1}`), y: 200 }], year);
  assert.equal(a.star, `Cold glow ${i + 1}`);
  assert.ok(Math.abs(a.arrived - (100 + 2 * m.d + ANSWERS_IN[m.open])) < 1e-6);
  assert.match(a.text!, /build at no other star/);
  if (m.generous > 3) assert.ok(a.text!.includes(pastSeen(m.age)));
  assert.equal(a.gift !== undefined, m.generous >= GIVES_KNOWLEDGE);
  // A hidden one never answers, however long we wait.
  const h = seen.glows.findIndex((g) => mind(g.id).open <= SILENT);
  assert.ok(h >= 0);
  assert.equal(oldAnswers(world, seen, [], [knock(`Cold glow ${h + 1}`)], 1e6).length, 0);
  // A hostile one wrecks a sentinel that comes to stay, as it arrives: no word up close, only that it went dark.
  const g = seen.glows.findIndex((x) => hostile(mind(x.id), maker));
  assert.ok(g >= 0 && mind(seen.glows[g].id).peaceful <= HOSTILE);
  const bad = mind(seen.glows[g].id);
  const there = [{ pos: bad.pos, arrives: 900, stays: true }];
  const after = mindsSeen(world, { ...kit, craft: there }, year).glows.find((x) => x.id === bad.id)!;
  assert.equal(after.near, undefined);
  assert.ok(Math.abs(after.lost! - (900 + bad.d)) < 1e-6);
  assert.equal(guardAt(world, bad.pos)!.id, bad.id);
  // A peaceful one lets it stay, and it sees what glows.
  const good = mind(seen.glows.find((x) => !hostile(mind(x.id), maker))!.id);
  const stayed = mindsSeen(world, { ...kit, craft: [{ pos: good.pos, arrives: 900, stays: true }] }, year).glows.find((x) => x.id === good.id)!;
  assert.ok(stayed.near !== undefined && stayed.lost === undefined);
  // A sleeping mind hears nothing from afar. With a craft of ours beside it, one a knock wakes answers, later by its waking.
  const s = olds.find((x) => x.asleep && x.wakes && x.open > SILENT && !hostile(x, maker))!;
  const by = [{ pos: s.pos, arrives: 800, stays: true }];
  const found = mindsSeen(world, { ...kit, craft: by }, year);
  const n = found.sleepers.findIndex((x) => x.id === s.id);
  assert.ok(n >= 0);
  const [w] = oldAnswers(world, found, by, [knock(`Warm body ${n + 1}`)], 1e5);
  assert.ok(Math.abs(w.arrived - (Math.max(100 + s.d, 800) + WAKES_IN + ANSWERS_IN[s.open] + s.d)) < 1e-6);
  assert.match(w.text!, /^You woke us/);
  assert.equal(oldAnswers(world, found, [], [knock(`Warm body ${n + 1}`)], 1e5).length, 0);
  // One a knock doesn't wake never answers, and a hostile sleeper is never found by a craft that stays.
  const deep = olds.find((x) => x.asleep && !x.wakes && !hostile(x, maker))!;
  const byDeep = [{ pos: deep.pos, arrives: 800, stays: true }];
  const fd = mindsSeen(world, { ...kit, craft: byDeep }, year);
  assert.equal(oldAnswers(world, fd, byDeep, [knock(`Warm body ${fd.sleepers.findIndex((x) => x.id === deep.id) + 1}`)], 1e6).length, 0);
  const guarded = olds.find((x) => x.asleep && hostile(x, maker));
  if (guarded) assert.ok(!mindsSeen(world, { ...kit, craft: [{ pos: guarded.pos, arrives: 800, stays: true }] }, year).sleepers.some((x) => x.id === guarded.id));
});

test("a glow earns its name in the order we read it, and only plain heat or a sentinel's look earns one", async () => {
  const { glowNames, glowIdOf, knowGlowNames, properGlows } = await import("../game/glow-names.ts");
  const names = glowNames({
    flashes: [{ read: { at: 900, saw: "smooth" } }, {}, { read: { at: 500, saw: "smooth" } }, { read: { at: 100, saw: "dust" } }, { read: { at: 100, saw: "gone" } }],
    glows: [{}, { near: 700 }],
  });
  assert.deepEqual(Object.fromEntries(Object.entries(names).map(([id, v]) => [id, v.name])), { "Warm glow 3": "Prometheus", "Warm glow 1": "Hestia", "Cold glow 2": "Skadi" });
  // More read than we have names: the list comes round again, and no two share one.
  const many = glowNames({ flashes: Array.from({ length: 30 }, (_, i) => ({ read: { at: i, saw: "smooth" } })), glows: [] });
  assert.equal(new Set(Object.values(many).map((v) => v.name)).size, 30);
  knowGlowNames(names);
  assert.equal(properGlows("Warm glow 3"), "Prometheus");
  assert.equal(properGlows("Warm glow 2"), "Warm Glow 2");
  assert.equal(properGlows("Warm glow 3 and cold glow 2, but a warm glow stays a noun."), "Prometheus and Skadi, but a warm glow stays a noun.");
  assert.equal(glowIdOf("prometheus"), "Warm glow 3");
  assert.equal(glowIdOf("Proxima Centauri"), "Proxima Centauri");
  knowGlowNames({});
});

test("a launch beam is seen only where an old mind's works reach it: no peer answers one, and a near, awake old mind does", async () => {
  const { glowsFound, mindsSeen } = await import("./minds.ts");
  const { peerAnswers } = await import("./peers.ts");
  const { oldAnswers, beamsAt, BEAM_TRAVELS, SILENT, ANSWERS_IN } = await import("./old-minds.ts");
  const { beamMiss, beamSeen, seenWithin, SAIL_C } = await import("./speeds.ts");
  // The miss and who sees it, as calcs/speeds.py has them, for sails, a seed ship, a flyby probe and a rod.
  const misses = (golden as unknown as { misses: { d: number; beta: number; au: number; seen: boolean }[] }).misses;
  assert.ok(misses.length >= 36 && misses.some((g) => g.seen) && misses.some((g) => !g.seen));
  for (const g of misses) {
    assert.ok(Math.abs(beamMiss(g.d, g.beta) - g.au) <= 1e-6 * g.au, `${g.d} ly at ${g.beta}: ${beamMiss(g.d, g.beta)} against ${g.au}`);
    assert.equal(beamSeen(g.d, g.beta), g.seen);
  }
  // The slower the craft, the wider its beam misses: sails are seen within about 21 ly, a probe within about 61.
  assert.ok(seenWithin(SAIL_C) > 20 && seenWithin(SAIL_C) < 23 && seenWithin(catalog.speeds.probe.beam) > 58 && seenWithin(catalog.speeds.probe.beam) < 64);
  assert.ok(seenWithin(catalog.speeds.beam) < seenWithin(SAIL_C) && seenWithin(catalog.speeds.rod.beam) > seenWithin(catalog.speeds.probe.beam));
  assert.ok(beamMiss(4.2465, catalog.speeds.beam) > 120 && beamMiss(4.2465, catalog.speeds.beam) < 140);
  // Only a craft a beam threw at a cold glow counts: one on its drive, or one sent at a warm glow, lights nothing.
  assert.equal(beamsAt([{ star: "Cold glow 1", leaves: 10 }, { star: "Warm glow 1", leaves: 10, thrown: SAIL_C }, { star: "Tau Ceti", leaves: 10, thrown: SAIL_C }]).length, 0);
  let peers = 0, olds = 0;
  for (const seed of [10, 2, 3, 5, 7]) {
    const world = await loadWorld(seed);
    // No peer answers sails sent at its warm glow: until 2026-11-12 one awake did.
    const kit = { warmWatch: 0, telescope: 0 };
    const i = glowsFound(world, kit, 5000).findIndex((g) => !("kind" in g.src) && !(g.src as { asleep?: boolean }).asleep);
    if (i >= 0) {
      peers++;
      assert.equal(peerAnswers(world, kit, beamsAt([{ star: `Warm glow ${i + 1}`, leaves: 0, thrown: SAIL_C }]), 1e6).length, 0);
    }
    // An awake, open old mind answers a beam as it would a knock, if the beam crosses its works. A craft thrown fast
    // enough misses by little, so its beam is seen. A slow one's passes wide, and draws nothing.
    const seen = mindsSeen(world, { halo: 3, haloArray: 20 }, 5000);
    const g = seen.glows.findIndex((x) => world.minds!.old.find((m) => m.id === x.id)!.open > SILENT);
    if (g < 0) continue;
    olds++;
    const m = world.minds!.old.find((x) => x.id === seen.glows[g].id)!;
    const fast = seenWithin(SAIL_C) > m.d ? SAIL_C : 0.999;
    assert.ok(beamSeen(m.d, fast) && !beamSeen(m.d, 0.001));
    const [a] = oldAnswers(world, seen, [], beamsAt([{ star: `Cold glow ${g + 1}`, leaves: 50, thrown: fast }]), 1e6);
    assert.equal(a.answers, BEAM_TRAVELS);
    assert.ok(Math.abs(a.arrived - (50 + 2 * m.d + ANSWERS_IN[m.open])) < 1e-6);
    assert.match(a.text!, /Your beam crossed our outer works/);
    assert.equal(oldAnswers(world, seen, [], beamsAt([{ star: `Cold glow ${g + 1}`, leaves: 50, thrown: 0.001 }]), 1e6).length, 0);
  }
  assert.ok(peers > 0 && olds > 0);
});

// The Hypertelescope's pictures are a finding, not word from our craft. Playtest 2026-11-07.
test("a jump to home telescope pictures is not word from our craft", async () => {
  const { nextKnownWhy } = await import("./next.ts");
  const v = (by: string, home: number) => ({ star: "Proxima Centauri", world: "b", by, passed: home, home, sight: "seas" });
  const ahead = { year: 0, felt: [], heard: [], visits: [v("hyper", 100.5), v("sails", 137.5)] } as never;
  assert.deepEqual(nextKnownWhy(ahead, 0), { at: 100.5, why: "our next finding" });
  assert.deepEqual(nextKnownWhy(ahead, 101), { at: 137.5, why: "word from our craft" });
});

// Each build's line says what it gives us in one sentence of 45 to 75 characters, agreed 2026-11-08 when the lines
// were rewritten to name the benefit. Its page carries the rest.
// Read as text, since plan.ts imports through the app's paths, which node alone can't follow.
test("each build's line fits 45 to 75 characters", () => {
  const plan = readFileSync(new URL("../game/plan.ts", import.meta.url), "utf8");
  const builds = plan.slice(plan.indexOf("export const BUILDS"), plan.indexOf("export const buildNamed"));
  const lines = [...builds.matchAll(/name: "([^"]+)",\s*what: "([^"]+)"/g)].map(([, name, what]) => ({ name, what }));
  assert.ok(lines.length >= 45, `read ${lines.length} lines`);
  const out = lines.filter((b) => b.what.length < 45 || b.what.length > 75);
  assert.deepEqual(out.map((b) => `${b.name}: ${b.what.length}`), []);
});

// The Deep Ice Watch, 2026-11-11: calcs/senses.py's rates, drawn a Year at a time, the same every time for a seed.
test("our Deep Ice Watch hears stars die at the calcs' rates, and its three firsts come in turn", () => {
  const since = 5.3;
  const century = iceBetween(22, since, since, since + 1000);
  assert.ok(Math.abs(century.bright / 1000 - ICE.bright) < 0.15, `bright ${century.bright}`);
  assert.ok(Math.abs(century.dark / 1000 - ICE.dark) < 0.25, `dark ${century.dark}`);
  assert.ok(Math.abs(century.near / 1000 - ICE.near) < 0.08, `near ${century.near}`);
  // Counted or drawn, a span holds the same deaths, and two halves hold the whole.
  const drawn = Array.from({ length: 1001 }, (_, i) => deathsIn(22, 5 + i)).flat().filter((d) => d.at > since && d.at <= since + 1000);
  assert.equal(drawn.length, century.bright + century.dark);
  const [a, b] = [iceBetween(22, since, since, 400.7), iceBetween(22, since, 400.7, since + 1000)];
  assert.equal(a.dark + b.dark, century.dark);
  assert.deepEqual(iceBetween(22, since, 0, 3), { bright: 0, dark: 0, near: 0 });
  // A dark death is read near only within the reach of a star that explodes, and a galaxy is named only close by.
  assert.ok(drawn.every((d) => d.mpc <= (d.dark ? ICE.darkMpc : ICE.brightMpc)));
  assert.ok(drawn.every((d) => (d.host === undefined) === d.mpc > ICE.hostsMpc));
  for (const seed of [10, 22, 62]) {
    const f = iceFirsts(seed, since);
    assert.ok(since <= f.first && f.first < f.sure && f.sure <= f.settled, JSON.stringify(f));
    assert.equal(iceBetween(seed, since, since, f.settled).near, ICE.settle);
    assert.deepEqual(iceFirsts(seed, since), f);
  }
});

// The far side as a reader of worlds, 2026-11-11: calcs/senses.py's field_flux() and heard_at(), and what Earth learns.
test("our Far-Side Array hears a world's magnetic field when calcs/senses.py says", () => {
  const cases = (golden as unknown as { fields: { a: number; d: number; fifths: number[]; flux: number; at: number | null }[] }).fields;
  assert.ok(cases.length >= 5);
  for (const c of cases) {
    assert.ok(Math.abs(fieldFlux(c.a, c.d) - c.flux) < 1e-9 * c.flux, `flux ${c.a} ${c.d}`);
    const at = fieldHeardAt(c.flux, c.fifths);
    if (c.at === null) assert.equal(at, null);
    else assert.ok(at !== null && Math.abs(at - c.at) < 1e-9, `heard ${c.a} ${c.d}: ${at} against ${c.at}`);
  }
});

test("the Far-Side Array finds red dwarfs' worlds that have a field, and tells of the ones we knew", async () => {
  const fifths = [30, 36, 42, 48, 54];
  let found = 0, silent = 0;
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    assert.equal(earthKnows(world, 500).fields, undefined, "nothing heard with no array");
    const early = earthKnows(world, 31, { farSide: fifths }), late = earthKnows(world, 500, { farSide: fifths });
    const red = world.worlds.filter((w) => world.stars[w.star]?.kind === "M" && w.d <= FIELDS.reachLy && world.stars[w.star].shown !== "Proxima Centauri");
    const known = new Set(world.finds.map((f) => world.stars[f.star]?.shown ?? f.star));
    const fresh = red.filter((w) => w.field && !known.has(world.stars[w.star].shown));
    // By Year 500 every one with a field is found, none without, and each comes no sooner than the first fifth.
    assert.deepEqual((late.fields ?? []).map((f) => f.star).sort(), fresh.map((w) => world.stars[w.star].shown).sort(), `seed ${seed}`);
    assert.ok((late.fields ?? []).every((f) => f.at >= 30 && f.periodDays > 0));
    assert.ok((early.fields ?? []).length <= (late.fields ?? []).length);
    // A world we knew at a red dwarf in reach gets a reading either way, as its truth has it.
    for (const f of late.felt) {
      const w = red.find((x) => world.stars[x.star].shown === f.star);
      if (w) assert.deepEqual(f.field?.has, !!w.field); else assert.equal(f.field, undefined);
    }
    // Proxima b, 180 µJy, is heard within the first fifth's first Year.
    assert.equal(early.proximaField?.has, proximaField(seed));
    found += fresh.length; silent += red.filter((w) => !w.field).length;
  }
  // About half of some 32 a game have a field: calcs/senses.py counts 16.1.
  assert.ok(found / POOL.length > 12 && found / POOL.length < 19, `found ${found / POOL.length}`);
  assert.ok(silent > 0);
});

// Speed by physics, 2026-11-11: calcs/speeds.py's trips, each craft near and far, in a cloud and between, on its drive
// and pushed.
test("each of our craft that stops takes the Years calcs/speeds.py gives its trip", () => {
  type Golden = { kind: "sentinel" | "ship"; d: number; n: number; beamed: boolean; beta: number; years: number; binds: string; stopLy: number };
  const trips = (golden as unknown as { trips: Golden[] }).trips;
  assert.ok(trips.length >= 50);
  for (const g of trips) {
    const t = stay(g.kind, g.d, g.n, g.beamed);
    assert.equal(t.binds, g.binds, `${g.kind} ${g.d} ly`);
    for (const k of ["beta", "years", "stopLy"] as const) assert.ok(Math.abs(t[k] - g[k]) <= 1e-9 * g[k], `${g.kind} ${g.d} ly ${k}: ${t[k]} against ${g[k]}`);
  }
  // A star in a warm cloud is the quicker stop, and a pair's stars share their cloud.
  assert.ok(gasAt("Alpha Centauri A") > gasAt("Tau Ceti") && gasAt("61 Cygni B") === gasAt("Proxima Centauri"));
  assert.ok(sentinelYears(10.5, "Epsilon Eridani") < sentinelYears(10.5, "Tau Ceti"));
  // On its drive a ship is held to a tenth of light speed by its fuel. Pushed, it goes as fast as it can stop from.
  assert.equal(stay("ship", 50, gasAt(), false).beta, catalog.speeds.fusion);
  assert.ok(stay("ship", 400, gasAt(), true).beta === catalog.speeds.beam && catalog.speeds.beam > 0.16 && catalog.speeds.beam < 0.18 && stay("ship", 10, gasAt(), true).binds === "stopping");
  assert.equal(stay("ship", 0).years, 0);
});

test("a flyby probe our Ship Beam throws flies as calcs/speeds.py has it: about four tenths of light speed, slower on a very long road", () => {
  const probes = (golden as unknown as { probes: { d: number; beta: number; years: number }[] }).probes;
  assert.ok(probes.length >= 7);
  for (const g of probes) {
    assert.ok(Math.abs(flybyBeta(g.d, true) - g.beta) <= 1e-9 * g.beta, `${g.d} ly: ${flybyBeta(g.d, true)} against ${g.beta}`);
    assert.ok(Math.abs(flybyYears(g.d, true) - g.years) <= 1e-9 * g.years);
  }
  // The beam's most near us, and its shield's most far off. On its drive, a tenth, with its burn's 10 Years.
  assert.ok(flybyBeta(4.25, true) === catalog.speeds.probe.beam && catalog.speeds.probe.beam > 0.41 && catalog.speeds.probe.beam < 0.43);
  assert.ok(flybyBeta(2700, true) < flybyBeta(1000, true) && flybyBeta(1000, true) < catalog.speeds.probe.beam);
  assert.equal(flybyBeta(50), catalog.probe.speed);
  assert.equal(flybyYears(50), 50 / catalog.probe.speed + catalog.probe.burn);
  assert.ok(flybyYears(4.25, true) < flybyYears(4.25) / 5);
  assert.equal(flybyYears(0, true), 0);
});

test("a rod our Ship Beam throws in place of a bullet flies as calcs/speeds.py has it: half of light speed, with a bullet's harm", async () => {
  const { bulletMt, mtPerTonne } = await import("./conflict.ts");
  const rods = (golden as unknown as { rods: { d: number; beta: number; years: number }[] }).rods;
  assert.ok(rods.length >= 7);
  for (const g of rods) {
    assert.ok(Math.abs(bulletBeta(g.d, true) - g.beta) <= 1e-9 * g.beta, `${g.d} ly: ${bulletBeta(g.d, true)} against ${g.beta}`);
    assert.ok(Math.abs(bulletYears(g.d, true) - g.years) <= 1e-9 * g.years);
  }
  const rod = catalog.speeds.rod;
  // The mirror's most, under what the beam could push it to, and as hard as a bullet on its drive.
  assert.ok(bulletBeta(50, true) === rod.beam && rod.beam > 0.49 && rod.beam < 0.52);
  assert.ok(Math.abs((rod.tonnes * mtPerTonne(rod.beam)) / bulletMt() - 1) < 1e-6);
  assert.ok(rod.tonnes > 30 && rod.tonnes < 34 && rod.ready < 1);
  // Far off, dust binds it as it binds what another mind throws.
  assert.equal(bulletBeta(2700, true), theirBeta(2700));
  assert.equal(bulletYears(50), 50 / catalog.speeds.bullet);
  assert.ok(bulletYears(50, true) < bulletYears(50) / 4.9);
});

test("what another mind throws flies as calcs/speeds.py has it: near nine tenths of light speed close by, slower far off", () => {
  const thrown = (golden as unknown as { thrown: { d: number; beta: number; years: number }[] }).thrown;
  assert.ok(thrown.length >= 8);
  for (const g of thrown) {
    assert.ok(Math.abs(theirBeta(g.d) - g.beta) <= 1e-9 * g.beta, `${g.d} ly: ${theirBeta(g.d)} against ${g.beta}`);
    assert.ok(Math.abs(theirYears(g.d) - g.years) <= 1e-9 * g.years);
    assert.ok(Math.abs(theirReady(g.d) - (g as unknown as { ready: number }).ready) <= 1e-9 * theirReady(g.d));
  }
  // Its beam stands, so near us it is ready in about a month, and later the farther and slower its rod must fly.
  assert.ok(theirReady(30) > 0.05 && theirReady(30) < 0.12 && theirReady(2700) > theirReady(30));
  assert.equal(theirBeta(30), 0.9);
  assert.ok(theirBeta(480) < theirBeta(150) && theirBeta(2700) < theirBeta(480));
  assert.equal(theirYears(0), 0);
});
