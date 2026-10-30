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
import { ARCHIVE, combedAt, offEarth, pace, type Order } from "./works.ts";
import { between, glowsSeen, knownTo, landings, SOL } from "./answers.ts";
import { haloReaches, HALO, SWARM, swarmSeenAt } from "./conflict.ts";
import catalog from "../../data/works.json" with { type: "json" };
import { colonyActor, earthActor, ourCodes, ourKind, ourTable } from "./colony.ts";

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

test("strikes: a tonne at a tenth of light speed lands with 108 Mt, harm grows with energy, and a screen stops a bullet", async () => {
  const { bulletMt, harmOf, mtPerTonne, rockMt, screened, strikesLanded } = await import("./conflict.ts");
  assert.equal(Math.round(mtPerTonne(0.1)), 108);
  assert.equal(Math.round(bulletMt() / 1000), 108);
  assert.equal(harmOf(5).tier, "local");
  assert.equal(harmOf(bulletMt()).tier, "climate");
  assert.ok(harmOf(10).share < 0.01 && harmOf(1e3).share > 0.05 && harmOf(1e5).share > 0.3 && harmOf(1e8).share === 1);
  assert.ok(harmOf(1e8).ends && !harmOf(1e7).ends);
  // A 60 m rock lands like Tunguska, a 140 m one like a hundred of them.
  assert.ok(rockMt(60) > 5 && rockMt(60) < 20 && rockMt(140) > 50 && rockMt(140) < 300, `${rockMt(60)}, ${rockMt(140)}`);
  const s = { star: "Tau Ceti", fired: 30, lands: 149, mt: bulletMt() };
  assert.ok(screened(s, [{ star: "Tau Ceti", done: 100 }]) && !screened(s, [{ star: "Tau Ceti", done: 150 }]));
  const { landed, ends } = strikesLanded([s, { ...s, star: "Ross 128", mt: 2e8 }], [{ star: "Tau Ceti", done: 100 }], 200);
  assert.equal(landed[0].harm.share, 0);
  assert.equal(ends, 149);
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

test("parity: our bullet is news where it lands, its flame seen only by a probe watching our system, probes are seen and caught, and they strike back", async () => {
  const { landings } = await import("./answers.ts");
  const { probeFate, probesToUs, strikesOnUs } = await import("./conflict.ts");
  const world = await loadWorld(11);
  const acts = { strikes: [{ star: "Alpha Centauri A", fired: 10, lands: 10 + 4.32 / 0.1 }], caught: [], quiet: null };
  const due = landings(world, [], [], 60, "test", [], acts);
  const struck = due.find((l) => l.news === "struck")!;
  assert.equal(struck.star, "Alpha Centauri A");
  assert.ok(Math.abs(struck.at - 53.2) < 1e-6 && !struck.missed);
  // Fired at Year 10, before any probe of theirs reached Sol: no one else sees it. Fired at 40, Hael's probe, here since
  // 36.2, sees it, and its word reaches Hael one light-time later.
  assert.ok(!due.some((l) => l.news === "strike_seen"));
  const later = landings(world, [], [], 60, "test", [], { strikes: [{ star: "Gliese 570 A", fired: 40, lands: 232 }], caught: [], quiet: null });
  const seen = later.filter((l) => l.news === "strike_seen");
  assert.ok(seen.length === 1 && seen[0].star === "Alpha Centauri A" && Math.abs(seen[0].at - 44.32) < 1e-6);
  // Struck, Hael strikes back: its bullet leaves once its harvest is built and filled, 44.4 Years on, and lands at a
  // tenth of light speed.
  const back = strikesOnUs(world, [{ key: struck.key, sent: "strike:Alpha Centauri A", star: "Alpha Centauri A", d: 4.32, at: struck.at, move: "strike" }]);
  assert.ok(back.length === 1 && Math.abs(back[0].lands - (53.2 + 0.25 + 44.4 + 43.2)) < 1e-6);
  // Hael's probe burns all the way in at Year 36.2: our watch sees it weeks out, and an interceptor ready by then wrecks it.
  const hael = probesToUs(world, []).find((p) => p.star === "Alpha Centauri A")!;
  assert.ok(hael.close && Math.abs(hael.arrives - 36.16) < 0.01);
  assert.ok(probeFate(hael, 10, 20).caught !== null && probeFate(hael, 10, 40).caught === null && probeFate(hael, null, 20).seen === null);
  // Our radars cut at Year 5: every neighbor that heard them hears them stop, one light-time later.
  const quiet = landings(world, [], [], 100, "test", [], { strikes: [], caught: [], quiet: 5 }).filter((l) => l.news === "quiet");
  assert.ok(quiet.length > 3 && quiet.every((l) => Math.abs(l.at - (5 + l.d)) < 1e-6));
});

test("parity both ways: a neighbor's guard screens our bullet, and neighbors strike each other", async () => {
  const { landings } = await import("./answers.ts");
  const { strikesBetween } = await import("./conflict.ts");
  const world = await loadWorld(11);
  // Hael guards against us at Year 0: its screen stands 4 Years later, so our bullet landing at 53.2 bursts on it.
  const guard = { key: "g:Alpha Centauri A", sent: "x", star: "Alpha Centauri A", d: 4.32, at: 0, move: "guard" };
  const acts = { strikes: [{ star: "Alpha Centauri A", fired: 10, lands: 53.2 }], caught: [], quiet: null };
  const hit = landings(world, [], [guard], 60, "test", [], acts).find((l) => l.star === "Alpha Centauri A" && l.news === "struck")!;
  assert.equal(hit.signal.move, "screened");
  // Hael strikes Iru, at Gliese 570 A, on Iru's news: Iru is struck once it lands, and watchers near Hael see the launch.
  const strike = { key: "s:Alpha Centauri A", sent: "y", star: "Alpha Centauri A", d: 4.32, at: 5, move: "strike", from: "Gliese 570 A" };
  const [b] = strikesBetween(world, [strike]);
  assert.ok(b && b.to === "Gliese 570 A" && Math.abs(b.fired - 49.65) < 1e-6 && b.lands > b.fired && !b.screened);
  const due = landings(world, [], [strike], b.lands + 1, "test");
  const struck = due.find((l) => l.news === "struck" && l.star === "Gliese 570 A")!;
  assert.ok(struck && struck.signal.from === "Alpha Centauri A" && Math.abs(struck.at - b.lands) < 1e-6);
  // No one else's craft watches Hael's system, so no one else sees the launch.
  assert.ok(!due.some((l) => l.news === "strike_seen"));
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

test("the Halo Survey sees what calcs/neighbors.py's glow_at gives, over ALMA's floor: no young Mind by Year 50, 12 by Year 100", async () => {
  let fifty = 0, hundred = 0;
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const young = (g: { star: string }) => !world.neighbors.some((n) => n.elder && (world.stars[n.star]?.shown ?? n.star) === g.star);
    fifty += glows(world, 0, 50).filter(young).length;
    hundred += glows(world, 0, 100).filter(young).length;
  }
  assert.equal(fifty, 0);
  assert.equal(hundred, 12);
});

test("an elder awake shows on the Halo Survey's first look and holds steady; one asleep never shows", async () => {
  let awake = 0;
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const elders = world.neighbors.filter((n) => n.elder);
    assert.equal(elders.length, 1);
    const e = elders[0], star = world.stars[e.star]?.shown ?? e.star;
    const seen = glows(world, 3, 200).find((g) => g.star === star);
    if (e.elder!.asleep) { assert.equal(seen, undefined); continue; }
    awake++;
    assert.equal(seen?.seen, 3);
    assert.equal(seen?.watts, e.elder!.ceiling);
    assert.ok(seen?.steady);
  }
  assert.ok(awake > 5 && awake < POOL.length - 5);
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

test("our colony's table comes from our charter: a lean is 1, far past the middle 2, and it never strikes first", () => {
  assert.equal(ourCodes([35, 50, 62]), "O1 B1");
  assert.equal(ourCodes([20, 80, 50]), "O2 D2");
  assert.equal(ourKind("O1 B1"), "contacter");
  assert.equal(ourKind("H1 D1"), "inward");
  assert.equal(ourKind("H1 E1"), "watcher");
  for (const codes of ["O1 B1", "H2 D2 C2", ""]) {
    for (const [news, row] of Object.entries(ourTable(codes))) {
      assert.ok(Math.abs(row.reduce((t, [, w]) => t + w, 0) - 1) < 1e-9);
      if (news !== "struck") assert.ok(!row.some(([m]) => m === "strike"), `${codes} ${news}`);
    }
  }
});

test("our colony hears a neighbor's call near it once it stands, never our own sends, and not while the Will lives there", async () => {
  const world = await loadWorld(10);
  const shown = (k: string) => world.stars[k]?.shown ?? k;
  const p = world.neighbors.find((n) => !n.dead && !n.elder)!;
  const key = Object.keys(world.stars).find((k) => k !== p.star && !world.neighbors.some((n) => n.star === k) && between(world, shown(k), shown(p.star)) < 20)!;
  const craft = { id: `colony:${key}`, kind: "colony" as const, atStar: true, hole: shown(key), holeId: key, d: world.stars[key].d, arrives: 0, stands: 0 };
  const mine = colonyActor(world, craft, [35, 50, 62], null)!;
  assert.equal(colonyActor(world, craft, [35, 50, 62], shown(key)), null);
  const played = { ...world, neighbors: [...world.neighbors, mine] };
  const call = { key: "c:x", sent: "c", star: shown(p.star), d: p.d, at: 1, move: "call", text: "We are here.", to: "everywhere" };
  const ours = { id: "s1", y: 1, to: "everywhere", travels: "Hello.", size: "page" as const, reach: 60 };
  const got = landings(played, [ours as never], [call], 500, "t").filter((l) => l.neighbor.ours && l.signal.move !== "glow");
  assert.equal(got.length, 1);
  assert.equal(got[0].signal.from, shown(p.star));
  assert.ok(got[0].offers.every((m) => m in ourTable("O1 B1").broadcast.reduce((o, [k]) => ({ ...o, [k]: 1 }), {})));
});

test("our colony glows and watches as a neighbor does, from the Year it stands", async () => {
  const world = await loadWorld(10);
  const shown = (k: string) => world.stars[k]?.shown ?? k;
  const p = world.neighbors.find((n) => !n.dead && !n.elder)!;
  const key = Object.keys(world.stars).find((k) => k !== p.star && !world.neighbors.some((n) => n.star === k) && between(world, shown(k), shown(p.star)) < 20)!;
  const craft = { id: `colony:${key}`, kind: "colony" as const, atStar: true, hole: shown(key), holeId: key, d: world.stars[key].d, arrives: 100, stands: 120 };
  const g = glowsSeen({ ...world, neighbors: [...world.neighbors, colonyActor(world, craft, [35, 50, 62], null)!] });
  const seen = g.find((x) => x.from === shown(key) && x.to === shown(p.star));
  const sees = g.find((x) => x.to === shown(key) && x.from === shown(p.star));
  assert.ok(seen && seen.at > 120, "a neighbor sees our colony's glow after it stands");
  assert.ok(sees && sees.at >= 120, "our colony sees a neighbor's glow once it stands");
});

test("Earth's stand-in takes what lands at Sol once the Will has left, and nothing before", async () => {
  const world = await loadWorld(10);
  assert.equal(earthActor([35, 50, 62], null), null);
  assert.equal(earthActor([35, 50, 62], { d: 12, y: 200, lost: true }), null);
  const earth = earthActor([35, 50, 62], { d: 12, y: 200 })!;
  const p = world.neighbors.find((n) => !n.dead && !n.elder)!;
  const knock = (at: number) => ({ key: `k${at}:x`, sent: `k${at}`, star: world.stars[p.star]?.shown ?? p.star, d: p.d, at, move: "knock", text: "Hello?" });
  const got = landings({ ...world, neighbors: [...world.neighbors, earth] }, [], [knock(50), knock(250)], 600, "t").filter((l) => l.neighbor.star === SOL);
  assert.deepEqual(got.map((l) => l.signal.id), ["k250:x"]);
});

test("a warning goes only to a world its sender knows of, and lands as a tip-off", async () => {
  const world = await loadWorld(10);
  const shown = (n: { star: string }) => world.stars[n.star]?.shown ?? n.star;
  const [a, b, c] = world.neighbors.filter((n) => !n.dead && !n.elder && n.waking < 0);
  // a knows b by b's call, and Earth only if it heard our radars.
  const call = { key: `call:${shown(a)}`, sent: "call", star: shown(a), d: a.d, at: 20, move: "watch", from: shown(b) };
  assert.deepEqual(knownTo(world, [call], shown(a), 10).filter((s) => s !== SOL), []);
  assert.deepEqual(knownTo(world, [call], shown(a), 30).filter((s) => s !== SOL), [shown(b)]);
  assert.equal(knownTo(world, [], shown(a), 300).includes(SOL), a.heard);
  // a warns b about c: b takes it by its tip-off table.
  const warn = { key: "w:x", sent: "w", star: shown(a), d: a.d, at: 30, move: "warn", from: shown(c), to: shown(b), text: "Beware the world near you." };
  const got = landings(world, [], [call, warn], 2000, "t").filter((l) => l.signal.id === "w:x");
  assert.equal(got.length, 1);
  assert.equal(got[0].star, shown(b));
  assert.equal(got[0].news, "tipoff");
});

test("a Mind that hides stops its glow growing: seen if it had crossed a watcher's floor, never if not", async () => {
  const world = await loadWorld(10);
  const all = glowsSeen(world);
  const pair = all.find((g) => g.at > 50)!;
  const p = world.neighbors.find((n) => (world.stars[n.star]?.shown ?? n.star) === pair.from)!;
  const hide = (at: number) => [{ key: `h${at}`, sent: "h", star: pair.from, d: p.d, at, move: "hide" }];
  // Hid long before its light could cross: no one sees it. Hid after: as before.
  assert.ok(!glowsSeen(world, hide(p.waking - p.thinks)).some((g) => g.from === pair.from));
  assert.ok(glowsSeen(world, hide(pair.at)).some((g) => g.from === pair.from && g.to === pair.to));
  // Our Halo Survey the same: a hider found only if it crossed first, and its watts stop growing from the hide.
  const ours = glows(world, 0, 400);
  const g = ours.find((x) => x.seen > 20 && !world.neighbors.find((n) => (world.stars[n.star]?.shown ?? n.star) === x.star)?.elder)!;
  const q = world.neighbors.find((n) => (world.stars[n.star]?.shown ?? n.star) === g.star)!;
  assert.ok(!glows(world, 0, 400, new Map([[g.star, q.waking]])).some((x) => x.star === g.star));
  const late = glows(world, 0, 400, new Map([[g.star, g.seen - q.d]])).find((x) => x.star === g.star)!;
  assert.ok(late && late.watts < g.watts);
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

test("neighbors see our Cold Halo once its 77 K glow crosses their floor, and never while it is small", async () => {
  const world = await loadWorld(10);
  // 26 doublings or so for a watcher 10 ly out.
  const need = 3e18 * HALO.warmer * (10 / (10 * 3.2616)) ** 2;
  const y = haloReaches([[100, null]], need)!;
  assert.ok(y > 100 + 250 && y < 100 + 270, String(y));
  assert.equal(haloReaches([[100, 150]], need), null);
  const seen = glowsSeen(world, [], [[0, null]]).filter((g) => g.from === SOL);
  const p = world.neighbors.find((n) => !n.dead && !n.elder?.asleep)!;
  const mine = seen.find((g) => g.to === (world.stars[p.star]?.shown ?? p.star))!;
  assert.ok(mine && mine.at >= p.d);
  assert.ok(!glowsSeen(world, [], [[0, 100]]).some((g) => g.from === SOL));
});

test("idle thought combs old recordings, and digs out a broadcast our watches missed", async () => {
  // Ten flagship-Years a Year of recordings: 24 Years of backlog takes 240.
  const log: [number, number][] = [[0, 0], [10, 240], [20, 480]];
  assert.equal(combedAt(log, 5), ARCHIVE.from + 12);
  assert.equal(combedAt(log, 20), 20);
  // Mu Herculis's last broadcast reached us in 2018, missed by Year 0's watch.
  const world = await loadWorld(11);
  const found = (kit: Parameters<typeof earthKnows>[3], year: number) => earthKnows(world, year, {}, kit).heard.find((h) => h.star === "Mu Herculis");
  assert.equal(found({}, 20), undefined);
  const h = found({ searched: log }, 20)!;
  assert.ok(h.found !== undefined && Math.abs(h.found - (h.arrived - ARCHIVE.from) * ARCHIVE.cost / 24) < 1e-6, String(h.found));
  assert.equal(found({ searched: log }, h.found! - 0.1), undefined);
});

test("the realistic premise's minds: rare and old near us, a few peers far off, a watcher every game", async () => {
  let olds = 0, peers = 0;
  for (const s of POOL) {
    const { minds } = await loadWorld(s);
    assert.ok(minds, `seed ${s} has no minds`);
    olds += minds.old.length; peers += minds.peers.length;
    // Old minds lie out to 1,000 ly, nearest first, on real stars only inside the 326 ly catalog.
    minds.old.forEach((o, i) => {
      assert.ok(o.d <= 2000 && (i === 0 || o.d >= minds.old[i - 1].d));
      assert.ok(o.star === null ? o.d >= 326 : o.d <= 326.5, `${o.id} at ${o.d} ly`);
      assert.ok(o.age > 0 && o.age <= 5e9 && (o.asleep ? o.glowW === null : o.glowW! > 0));
    });
    // A peer's warm phase reaches us d Years after it shines, and our light finds it inward, outward or not yet awake.
    for (const p of minds.peers) {
      assert.ok(Math.abs(p.flash[0] - (p.wake + p.d)) <= 0.15, p.id);
      assert.ok(p.outwardYears >= 50 && p.outwardYears <= 21000 && p.reachLy <= 200);
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
  // About 8.5 old minds within 1,000 ly and 5 peers a game, loosely, over the pool.
  assert.ok(olds / POOL.length > 5 && olds / POOL.length < 12, `${olds / POOL.length} old minds a game`);
  assert.ok(peers / POOL.length > 3 && peers / POOL.length < 7, `${peers / POOL.length} peers a game`);
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

test("neighbors see our Solar Swarm as a warm excess over the Sun once it catches enough, and not while held small", async () => {
  // Near: an excess of about a quarter of a thousandth of the Sun, some 86 Years after it starts.
  const near = haloReaches([[0, null]], swarmSeenAt(10), SWARM)!;
  assert.ok(near > 80 && near < 90, String(near));
  // Across the Galaxy, only once it catches nearly all the Sun, and never past it.
  assert.ok(haloReaches([[0, null]], swarmSeenAt(30000), SWARM)! > 105);
  assert.equal(haloReaches([[0, null]], swarmSeenAt(60000), SWARM), null);
  const world = await loadWorld(10);
  const warm = glowsSeen(world, [], [], [[0, null]]).filter((g) => g.from === SOL && g.warm);
  assert.ok(warm.length && warm.every((g) => g.at >= near + g.d - 1e-9 || g.at === 0));
  assert.ok(!glowsSeen(world, [], [], [[0, 60]]).some((g) => g.from === SOL));
});

test("the Hypertelescope pictures each felt world in its reach, nearest first, a week each, and never cities", async () => {
  for (const seed of POOL) {
    const world = await loadWorld(seed);
    const home = world.finds.find((f) => f.truth.kind === "home" && !f.truth.elder && f.d <= catalog.hyper.reach);
    if (!home) continue;
    const seen = earthKnows(world, 500, {}, { hyper: 40 }).visits.filter((v) => v.by === "hyper");
    const reach = new Set(world.finds.filter((f) => f.d <= catalog.hyper.reach).map((f) => world.stars[f.star]?.shown ?? f.star));
    assert.equal(seen.length, reach.size + 1);
    assert.equal(seen[0].world, "Proxima b");
    assert.ok(seen.every((v, i) => i === 0 || v.passed > seen[i - 1].passed));
    assert.ok(!seen.some((v) => v.sight === "cities"));
    const v = seen.find((x) => x.star === (world.stars[home.star]?.shown ?? home.star))!;
    assert.equal(v.sight, "green");
    assert.ok(v.coarse && Math.abs(v.km! - catalog.hyper.kmPerLy * home.d) < 1e-9);
    assert.equal(earthKnows(world, 39.9, {}, { hyper: 40 }).visits.filter((x) => x.by === "hyper").length, 0);
    return;
  }
  assert.fail("no seed has a felt home in reach");
});

test("bullets wait on helium-3: 37 kt each from a harvest of 1.5 kt a Year, in the order ordered, and none without one", async () => {
  const { bulletsReady, BULLET } = await import("./conflict.ts");
  const { HE3 } = await import("./meetings.ts");
  // The yard done at 10, the harvest at 30: the first waits on its fuel, the second on more, the third on its build.
  const ready = bulletsReady([10, 10, 200], 10, 30);
  assert.ok(Math.abs(ready[0]! - (30 + HE3.bullet / HE3.perYear)) < 1e-9);
  assert.ok(Math.abs(ready[1]! - (30 + (2 * HE3.bullet) / HE3.perYear)) < 1e-9);
  assert.equal(ready[2], 220);
  assert.deepEqual(bulletsReady([10], 10, null), [null]);
  // A neighbor starts its harvest when it chooses to strike: 20 Years to build, 24.4 to fill.
  assert.ok(Math.abs(BULLET.ready - 44.4) < 1e-9);
});
