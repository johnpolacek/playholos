// The simulation's checks: run `npm test`. Each pins the TypeScript to what Python and the mocks show.
import assert from "node:assert/strict";
import { test } from "node:test";
import golden from "./golden.json" with { type: "json" };
import { describe, earthKnows } from "./knowledge.ts";
import { observe } from "./observing.ts";
import { PyRandom } from "./pyrandom.ts";
import { hop, seedProbes } from "./spread.ts";
import { POOL } from "./pool.ts";
import { loadWorld } from "./world.ts";
import { offEarth, pace, type Order } from "./works.ts";
import catalog from "../../data/works.json" with { type: "json" };

test("the generator is CPython's, seeded from ints and strings", () => {
  for (const [key, want] of Object.entries(golden.random)) {
    const r = new PyRandom(/^\d+$/.test(key) ? BigInt(key) : key);
    assert.deepEqual(want.map(() => r.random()), want, key);
  }
});

test("seed 10 at Year 0: one felt world, natural, and no signals: the neighbors are retired", async () => {
  const view = earthKnows(await loadWorld(10), 0);
  assert.deepEqual(view.felt.map((f) => f.star), ["Gliese 1232"]);
  assert.equal(view.heard.length, 0);
});

test("the wall: the Mind's words never name who lives where", async () => {
  for (const seed of [10, 11, 62]) {
    const world = await loadWorld(seed);
    const words = describe(earthKnows(world, 0));
    for (const p of world.neighbors) assert.ok(!words.includes(p.name), `seed ${seed} leaks ${p.name}`);
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

test("fusion plants add half again to the grid, so one more data center fits once they are done", () => {
  const g = golden.works[0];
  const alone = mock(g);
  const fused = pace([...(g.orders as Order[]), { y: 0, begin: "Fusion plants" }], 80, { scale: g.scale, aside: g.aside as [number, number, number][] });
  // 30 standard Years, and no faster than two thirds of that however much thought pushes it.
  assert.ok(fused.done["Fusion plants"] >= 20 && fused.done["Fusion plants"] <= 30, `done at Year ${fused.done["Fusion plants"]}`);
  assert.equal(fused.dataCenters.length, alone.dataCenters.length + 1);
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
  const word = 10 + f.d / 0.1 + 10 + f.d;
  const kit = { sentinels: [{ star, leaves: 10 }] };
  assert.equal(earthKnows(world, word - 0.01, kit).visits.length, 0);
  const v = earthKnows(world, word, kit).visits.find((x) => x.by === "sentinel")!;
  assert.ok(v && !v.lives && !v.ruins && v.sight !== "cities");
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
  const lands = 10 + h.d / 0.1 + 10 + 15;
  const at = (year: number, mode: "furnace" | "refuge") => earthKnows(world, year, { mapper: 0, colony: { star: h.name, mode, leaves: 10 } }).colony!;
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

test("a seed probe's word comes home from each star a light-time after it lands, and its copies go on", async () => {
  const world = await loadWorld(10);
  const star = world.stars[world.finds[0].star].shown;
  const [p] = seedProbes([{ star, leaves: 10 }]);
  const kit = { seeds: [{ star, leaves: 10 }] };
  assert.equal(earthKnows(world, p.lands + p.d - 0.01, kit).visits.filter((v) => v.by === "seed").length, 0);
  const v = earthKnows(world, p.lands + p.d, kit).visits.find((x) => x.by === "seed")!;
  assert.ok(v.gen === 1 && !v.lives);
  const later = earthKnows(world, 1000, kit);
  assert.equal(later.visits.filter((x) => x.by === "seed" && !x.sent).length, 7);
  assert.equal(later.visits.filter((x) => x.sent).length, 6);
  assert.match(describe(later), /seed probe/);
});

test("our Mind settled at a star: word of its landing comes one light-time later, and no one was there first", async () => {
  const world = await loadWorld(10);
  const f = world.finds[0];
  const star = world.stars[f.star].shown, d = world.stars[f.star].d;
  const lands = 10 + hop(d);
  const kit = { colony: { star, mode: "settle" as const, leaves: 10 } };
  const at = (year: number) => earthKnows(world, year, kit).colony!;
  const c = at(lands + d);
  assert.ok(c.atStar && Math.abs(c.lands! - lands) < 1e-9);
  assert.equal(c.others, undefined);
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

test("the realistic premise's minds: rare and old near us, a few peers far off, a watcher every game", async () => {
  let olds = 0, peers = 0;
  for (const s of POOL) {
    const { minds } = await loadWorld(s);
    assert.ok(minds, `seed ${s} has no minds`);
    olds += minds.old.length; peers += minds.peers.length;
    // Old minds lie out to 1,000 ly, nearest first, on real stars only inside the 326 ly catalog. Each woke before the
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
    assert.ok(w.ladder[1].delay >= maker.d * 10);
  }
  // About 8.5 old minds within 1,000 ly and 7 peers a game, loosely, over the pool.
  assert.ok(olds / POOL.length > 5 && olds / POOL.length < 12, `${olds / POOL.length} old minds a game`);
  assert.ok(peers / POOL.length > 4.5 && peers / POOL.length < 9.5, `${peers / POOL.length} peers a game`);
});

test("finding minds: a flash while the warm watch runs, half the cold glows, the watcher by where it sits, a sleeper up close", async () => {
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
      const f = flashOf(p, 0, 200000);
      if (p.flash[1] < 0) assert.equal(f, null);
      else assert.ok(f && f.seen >= Math.max(0, p.flash[0]) && f.seen < Math.max(0, p.flash[0]) + WARM_EVERY + 1e-9, p.id);
      assert.equal(flashOf(p, p.flash[1] + 1, 200000), null);   // built after it faded: missed for good
      // Ranged by our Infrared Telescope while it shines: a range that holds the truth. Faded first, never ranged.
      const r = flashOf(p, 0, 200000, 0);
      if (r?.range) assert.ok(r.range[0] <= p.d && p.d <= r.range[1] && r.ranged! <= p.flash[1], p.id);
      if (r && Math.max(r.seen, 0) + 2 > p.flash[1]) assert.equal(r.range, undefined);
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
    // A craft that stays finds a sleeper. A flyby only if it rests within a 1 m telescope's reach.
    for (const o of m.old.filter((o) => o.asleep)) {
      const stay = sleeperOf(o, [{ pos: o.pos, arrives: 5000, stays: true }], 1e6);
      assert.equal(stay?.seen, 5000 + STAY_SEARCH_YEARS + o.d);
      const pass = sleeperOf(o, [{ pos: o.pos, arrives: 5000, stays: false }], 1e6);
      assert.equal(pass !== null, o.restAU! <= FLYBY_SEES_AU);
      assert.equal(sleeperOf(o, [{ pos: [o.pos[0] + 1, o.pos[1], o.pos[2]], arrives: 5000, stays: true }], 1e6), null);
    }
  }
  // The Halo Survey sees about half the awake old minds.
  assert.ok(glowing / awake > 0.3 && glowing / awake < 0.7, `${glowing} of ${awake}`);
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
    assert.ok(!seen.some((v) => v.sight === "cities"));
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
  const { nextKnown, nextStop } = await import("./next.ts");
  const world = await loadWorld(10);
  // Seed 10 with the Warm Sky Watch at Year 0 and our Infrared Telescope: a warm glow is seen at Year 2,386, ranged two Years on.
  const ahead = earthKnows(world, 102500, { warmWatch: 0, telescope: 0 });
  const first = ahead.minds!.flashes[0];
  // Once it will be ranged, the skip stops when it is, where Scan shows it, not when first seen. 2026-10-30.
  assert.equal(nextKnown(ahead, 2000), first.ranged);
  // Never ranged, as with no Infrared Telescope, the Warm Sky Watch's sighting stops it.
  const unranged = earthKnows(world, 102500, { warmWatch: 0 });
  assert.equal(nextKnown(unranged, 2000), unranged.minds!.flashes[0].seen);
  // A place in [ra, dec, d] is never taken for a time, and a build done sooner stops the skip first.
  assert.equal(nextStop(ahead, 2000, { "Moon Search": 2100, "Halo Survey": null }), 2100);
  assert.equal(nextStop({ year: 0, felt: [], heard: [], visits: [] }, 5, {}), null);
  // A rock's Years stop it too, the past ones ignored.
  assert.equal(nextStop({ year: 0, felt: [], heard: [], visits: [] }, 5, {}, [3, null, 412.5]), 412.5);
});
