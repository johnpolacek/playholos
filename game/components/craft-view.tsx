// Each craft on Reach's walk, up close in the map's own 3D lines: the camera opens on it in deep space, turns round
// it, then pulls back until it is a point, and the map's flight to Proxima takes over. Asked for 2026-11-07, (x): the
// sail, the probe and the sentinel themselves in the 3D view, not drawings beside it. Drawn over the starfield with a
// clear background, so the sky behind is the map's. Sizes are real, in metres, from calcs/craft.py and Parkin 2018:
// a sail 4.1 m across with its 1 g chip, a probe of 150 t of instruments, 6,100 t of deuterium (about 36,000 m³ of
// liquid, at 0.169 t a m³) and 400 t of engine and radiators, and a sentinel's loop 1,600 km across (Gros 2017).
// Since 2026-11-10 each has faces, as the builds have in Close View: they hide the lines behind them and carry dots,
// at 35%, lit by the light that is really there. Voyager 1 by the Sun far behind it, a sail by its beam, a probe by
// the Sun it leaves and its own heat, a sentinel by the star ahead.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";
import { steadySide } from "@/lib/steady-side";
import { CATALOG } from "@/lib/sim/works";

export type CraftKind = "voyager" | "sail" | "probe" | "sentinel";

/** How bright the dots on a face are, and the most of them a craft carries. As a build's, in lib/drift.ts. */
const DOTS = 0.35;
const MOST_DOTS = 36_000;

/** Seconds from opening close to the craft until it is a point and the map's flight takes over. */
export const CRAFT_SHOT_SECS = 11;

type V = [number, number, number];
const t = (kt: number) => `${(kt * 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} T`;

/** A ring of segments round `c`, of radius `r`, square to `axis` "x", "y" or "z". */
function ring(c: V, r: number, axis: "x" | "y" | "z", n = 48): number[] {
  const out: number[] = [];
  const at = (k: number): V => {
    const a = (k / n) * 2 * Math.PI;
    const [u, v] = [r * Math.cos(a), r * Math.sin(a)];
    return axis === "x" ? [c[0], c[1] + u, c[2] + v] : axis === "y" ? [c[0] + u, c[1], c[2] + v] : [c[0] + u, c[1] + v, c[2]];
  };
  for (let k = 0; k < n; k++) out.push(...at(k), ...at(k + 1));
  return out;
}
const seg = (a: V, b: V) => [...a, ...b];
/** A number from 0 to 1 for each bit of a flow, and another for each `k`, with no rhythm between them. With the golden
 *  ratio for how far out one began and which way round, they lay on one spiral, and a flame was a corkscrew. 2026-11-10. */
const chance = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const quad = (a: V, b: V, c: V, d: V) => [...a, ...b, ...c, ...a, ...c, ...d];
/** A face turned round an axis through `c`, as triangles. `outline` is its edge: at each point, how far along the
 *  axis and how far out. Its corners fall where `ring`'s do. */
function lathe(c: V, axis: "x" | "y" | "z", outline: [number, number][], n = 24): number[] {
  const at = (along: number, r: number, k: number): V => {
    const a = (k / n) * 2 * Math.PI;
    const [u, v] = [r * Math.cos(a), r * Math.sin(a)];
    return axis === "x" ? [c[0] + along, c[1] + u, c[2] + v] : axis === "y" ? [c[0] + u, c[1] + along, c[2] + v] : [c[0] + u, c[1] + v, c[2] + along];
  };
  const out: number[] = [];
  for (let j = 0; j + 1 < outline.length; j++) {
    const [[a0, r0], [a1, r1]] = [outline[j], outline[j + 1]];
    for (let k = 0; k < n; k++) {
      if (r0 > 0) out.push(...at(a0, r0, k), ...at(a0, r0, k + 1), ...at(a1, r1, k + 1));
      if (r1 > 0) out.push(...at(a0, r0, k), ...at(a1, r1, k + 1), ...at(a1, r1, k));
    }
  }
  return out;
}

/** Faces of one kind. They hide what is behind them and carry dots. */
interface Skin {
  tris: number[];
  /** In the build's color, as the lines of what works are. */
  hot?: boolean;
  /** Light of its own, 0 to 1: a radiator's heat, a power cell's warmth. */
  glow?: number;
}

interface Model {
  /** Structure, drawn in ink. */
  ink: number[];
  /** What works, drawn in the build's color: the beam, the flame, the loop. */
  hot: number[];
  /** Its path, drawn in the amber of our craft on the map, so it can't be taken for a part of it. */
  path?: number[];
  /** Its faces. */
  skins: Skin[];
  /** The way to the light that falls on it. */
  light: V;
  /** The light is its beam, in the build's color, not a star's. */
  beam?: boolean;
  /** How bright a face turned from the light still is, 0 to 1. Starlight, and a long exposure. */
  fill?: number;
  /** Where the camera stands round it at first, and how fast it turns, in radians. */
  turn?: [number, number];
  /** Lights: points, each x, y, z. */
  lamps: number[];
  /** Names, at points on it. */
  labels: { at: V; head: string; line?: string; keep?: boolean }[];
  /** Camera distance in metres while it holds, and how far it pulls back. */
  near: number;
  far: number;
  /** Particles: where each starts, and how it moves each second. Wrapped between `from` and `to` along `axis`. */
  flow?: {
    n: number;
    axis: 0 | 1 | 2;
    from: number;
    to: number;
    speed: number;
    spread: (i: number) => [number, number];
    hot: boolean;
    /** Where one stops short, by how far out it is: light that meets the sail goes no farther. */
    stop?: (r: number) => number | null;
    /** How far out one is pushed, by where it is along the way and how far out it began. */
    bend?: (along: number, r: number) => number;
    /** Each is drawn as a streak this long, back the way it came, so the flow's turn shows. */
    streak?: number;
  };
  /** Its look: elevation above its side, in degrees. */
  el: number;
}

/** A Starshot sail: 4.1 m across, bowed by the push behind its chip, which lags. Travel is up, the beam from below. */
function sail(): Model {
  const R = 2.05;
  const ink: number[] = [];
  const z = (r: number) => -0.22 * (1 - (r / R) ** 2);
  for (const r of [0.5, 1, 1.5, R]) ink.push(...ring([0, 0, z(r)], r, "z", 64));
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 2 * Math.PI;
    for (let j = 0; j < 8; j++) {
      const [r0, r1] = [(j / 8) * R, ((j + 1) / 8) * R];
      ink.push(...seg([r0 * Math.cos(a), r0 * Math.sin(a), z(r0)], [r1 * Math.cos(a), r1 * Math.sin(a), z(r1)]));
    }
  }
  // The chip, about 2 cm across.
  ink.push(...ring([0, 0, z(0) - 0.01], 0.02, "z", 12));
  // The film itself, a mirror to its beam.
  const film = lathe([0, 0, 0], "z", Array.from({ length: 9 }, (_, j): [number, number] => [z((j / 8) * R), (j / 8) * R]), 64);
  // The beam, a column of light up from below, wider than the sail: what misses it goes on.
  const hot: number[] = [];
  for (let k = 0; k < 28; k++) {
    const a = k * 2.39996, r = 2.5 * Math.sqrt((k + 0.5) / 28);
    const [x, y] = [r * Math.cos(a), r * Math.sin(a)];
    hot.push(...seg([x, y, -14], [x, y, r < R ? z(r) : 18]));
  }
  return {
    ink,
    hot,
    skins: [{ tris: film }],
    // Its beam outshines the Sun on it ten million times over, so the beam is its only light.
    light: [0, 0, -1],
    beam: true,
    fill: 0.1,
    turn: [0.9, 0.12],
    lamps: [0, 0, z(0) - 0.01],
    labels: [
      { at: [R, 0, 0], head: "SAIL · 4.1 M · 2.6 G", line: "thinner than a soap film" },
      { at: [0, 0, z(0)], head: "CHIP · 1 G", line: "cameras, and a laser home" },
      { at: [0, -1.4, -5], head: "BEAM · 200 GW", line: "8 minutes, from a 2.7 km array" },
    ],
    near: 8,
    far: 9000,
    el: 34,
    // The beam's light, up from below. What misses the sail goes on toward its star.
    flow: {
      n: 900,
      axis: 2,
      from: -14,
      to: 18,
      speed: 9,
      spread: (i) => {
        const r = 2.5 * Math.sqrt(chance(i, 1));
        const a = chance(i, 2) * 2 * Math.PI;
        return [r * Math.cos(a), r * Math.sin(a)];
      },
      hot: true,
      stop: (r) => (r < R ? z(r) : null),
    },
  };
}

/** A flyby probe on a deuterium fusion engine, travel along +x: instruments and dish up front, the tank, a truss, the
 *  radiators, the engine and its flame. */
function probe(): Model {
  const ink: number[] = [];
  const hot: number[] = [];
  // Instruments, 150 t, and the dish that lasers home.
  for (const x of [50, 56, 62]) ink.push(...ring([x, 0, 0], 3, "x", 24));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    ink.push(...seg([50, 3 * Math.cos(a), 3 * Math.sin(a)], [62, 3 * Math.cos(a), 3 * Math.sin(a)]));
    ink.push(...seg([66, 0, 0], [63, 7 * Math.cos(a), 7 * Math.sin(a)]));
  }
  ink.push(...ring([63, 0, 0], 7, "x", 40));
  // The deuterium tank: about 36,000 m³, 12 m round and 80 m long.
  for (let x = -30; x <= 48; x += 6.5) ink.push(...ring([x, 0, 0], 12, "x", 48));
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 2 * Math.PI;
    ink.push(...seg([-30, 12 * Math.cos(a), 12 * Math.sin(a)], [48, 12 * Math.cos(a), 12 * Math.sin(a)]));
  }
  // The truss back to the engine, its four long rods at the corners of its frames.
  for (const [y, z] of [[5.6, 0], [-5.6, 0], [0, 5.6], [0, -5.6]] as const) ink.push(...seg([-30, y, z], [-72, y, z]));
  for (let x = -72; x <= -30; x += 7) ink.push(...ring([x, 0, 0], 5.6, "x", 4));
  // Radiators: most of the engine's mass. Fusion's heat must go somewhere.
  for (const s of [1, -1]) {
    ink.push(...seg([-68, 0, 6 * s], [-68, 0, 38 * s]), ...seg([-34, 0, 6 * s], [-34, 0, 38 * s]), ...seg([-68, 0, 38 * s], [-34, 0, 38 * s]));
    for (let x = -64; x <= -38; x += 4) hot.push(...seg([x, 0, 6 * s], [x, 0, 38 * s]));
  }
  // The engine: a magnetic nozzle round the pinch.
  for (let k = 0; k <= 5; k++) ink.push(...ring([-72 - k * 3, 0, 0], 4 + k * 1.3, "x", 32));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * Math.PI;
    ink.push(...seg([-72, 4 * Math.cos(a), 4 * Math.sin(a)], [-87, 10.5 * Math.cos(a), 10.5 * Math.sin(a)]));
  }
  return {
    ink,
    hot,
    skins: [
      { tris: [...lathe([0, 0, 0], "x", [[50, 0], [50, 3], [62, 3], [62, 0]], 24), ...lathe([0, 0, 0], "x", [[66, 0], [63, 7]], 40)] },
      { tris: lathe([0, 0, 0], "x", [[-30, 0], [-30, 12], [48, 12], [48, 0]], 48) },
      // The radiators glow with the engine's heat, and the nozzle with its flame.
      { tris: [1, -1].flatMap((s) => quad([-68, 0, 6 * s], [-34, 0, 6 * s], [-34, 0, 38 * s], [-68, 0, 38 * s])), hot: true, glow: 0.55 },
      { tris: lathe([0, 0, 0], "x", [[-72, 4], [-87, 10.5]], 32), hot: true, glow: 0.3 },
    ],
    // It leaves from by the Sun, engine lit. Which side the Sun is on turns with the season, so this is one of them.
    light: [0.6, 0.3, 0.74],
    lamps: [66, 0, 0, -80, 0, 0],
    labels: [
      { at: [56, 0, 3], head: "INSTRUMENTS · 150 T", line: "reads a world’s air" },
      { at: [10, 0, 12], head: `DEUTERIUM · ${t(CATALOG.probe.fuel)}`, line: "burned over 20 Years" },
      { at: [-51, 0, 38], head: "ENGINE AND RADIATORS · 400 T" },
      { at: [-110, 0, 0], head: "EXHAUST · 12,000 KM/S" },
    ],
    near: 330,
    far: 2.5e6,
    el: 14,
    flow: {
      n: 700,
      axis: 0,
      from: -88,
      to: -300,
      speed: -260,
      spread: (i) => {
        const r = 2 + 5 * chance(i, 1);
        const a = chance(i, 2) * 2 * Math.PI;
        return [r * Math.cos(a), r * Math.sin(a)];
      },
      hot: true,
    },
  };
}

/** A sentinel braking: a 1,000 t craft at the middle of a superconducting loop 1,600 km across, held by tethers, with
 *  the thin gas between the stars streaming at it at a tenth of light speed. Travel along +x. */
function sentinel(): Model {
  const ink: number[] = [];
  const hot: number[] = [];
  for (const x of [-12, -4, 4, 12]) ink.push(...ring([x, 0, 0], 5, "x", 24));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    ink.push(...seg([-12, 5 * Math.cos(a), 5 * Math.sin(a)], [12, 5 * Math.cos(a), 5 * Math.sin(a)]));
  }
  for (let k = 0; k <= 3; k++) ink.push(...ring([-12 - k * 3, 0, 0], 3 + k * 1.2, "x", 24));
  const R = 800_000;
  hot.push(...ring([0, 0, 0], R, "x", 360));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    ink.push(...seg([0, 0, 0], [0, R * Math.cos(a), R * Math.sin(a)]));
  }
  return {
    ink,
    hot,
    skins: [
      { tris: lathe([0, 0, 0], "x", [[-12, 0], [-12, 5], [12, 5], [12, 0]], 24) },
      { tris: lathe([0, 0, 0], "x", [[-12, 3], [-21, 6.6]], 24) },
    ],
    // Between the stars the only light is the one it flies to, dead ahead.
    light: [1, 0, 0],
    fill: 0.3,
    // Seen from a little ahead, so its loop is a ring to us and not a line.
    turn: [0.85, 0.03],
    lamps: [12, 0, 0],
    labels: [
      { at: [0, 0, 5], head: "SENTINEL · 1,000 T" },
      { at: [0, 0, R], head: "MAGNETIC SAIL · 1,600 KM ACROSS", line: "brakes with no flame, then a short burn ends the stop", keep: true },
    ],
    near: 120,
    far: 3.2e6,
    el: 18,
    flow: {
      n: 1400,
      axis: 0,
      from: 3e6,
      to: -3e6,
      speed: -2.4e6,
      spread: (i) => {
        const r = 1.6e6 * Math.sqrt(chance(i, 1));
        const a = chance(i, 2) * 2 * Math.PI;
        return [r * Math.cos(a), r * Math.sin(a)];
      },
      hot: false,
      streak: 2.6e5,
      // The loop's field turns the gas aside over about its own span, and that push is the brake (Gros 2017). Drawn
      // as a stream parting round a ball as wide as the loop, with the hollow it leaves behind.
      bend: (along, b) => {
        const x = Math.max(0, along);
        let [lo, hi] = [Math.sqrt(Math.max(0, R * R - x * x)), b + R];
        for (let k = 0; k < 14; k++) {
          const mid = (lo + hi) / 2;
          if (mid * mid * (1 - R ** 3 / (x * x + mid * mid) ** 1.5) < b * b) lo = mid;
          else hi = mid;
        }
        return hi;
      },
    },
  };
}

/** Voyager 1 as it flies in 2040, silent: its 3.7 m dish still turned home, its ten-sided body 1.8 m across with the
 *  Golden Record on its side, three plutonium power cells on one boom, the instruments' platform on the other, and the
 *  13 m magnetometer boom. 722 kg at launch. Travel along +x, the dish back toward Earth. NASA JPL's figures. */
function voyager(): Model {
  const ink: number[] = [];
  const hot: number[] = [];
  // The body: a ten-sided ring, 1.78 m across and 0.47 m deep.
  for (const x of [-0.47, 0]) ink.push(...ring([x, 0, 0], 0.89, "x", 10));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * 2 * Math.PI;
    ink.push(...seg([-0.47, 0.89 * Math.cos(a), 0.89 * Math.sin(a)], [0, 0.89 * Math.cos(a), 0.89 * Math.sin(a)]));
  }
  // The dish, 3.7 m across, facing home, and the struts to its feed.
  for (const [x, r] of [[-0.5, 0.4], [-0.75, 1.0], [-1.0, 1.45], [-1.3, 1.83]] as const) ink.push(...ring([x, 0, 0], r, "x", 48));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * Math.PI;
    const pt = (x: number, r: number): V => [x, r * Math.cos(a), r * Math.sin(a)];
    ink.push(...seg(pt(-0.5, 0.4), pt(-0.75, 1.0)), ...seg(pt(-0.75, 1.0), pt(-1.0, 1.45)), ...seg(pt(-1.0, 1.45), pt(-1.3, 1.83)));
  }
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * 2 * Math.PI + 0.5;
    ink.push(...seg([-1.3, 1.83 * Math.cos(a), 1.83 * Math.sin(a)], [-2.1, 0, 0]));
  }
  ink.push(...ring([-2.1, 0, 0], 0.14, "x", 16));
  // The power boom: three plutonium cells, warm still, and nearly spent.
  ink.push(...seg([-0.25, 0.89, 0], [-0.25, 3.3, 0]));
  for (const y of [1.6, 2.2, 2.8]) {
    hot.push(...ring([-0.25, y, 0], 0.2, "y", 16), ...ring([-0.25, y + 0.45, 0], 0.2, "y", 16));
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * 2 * Math.PI;
      hot.push(...seg([-0.25 + 0.2 * Math.cos(a), y, 0.2 * Math.sin(a)], [-0.25 + 0.2 * Math.cos(a), y + 0.45, 0.2 * Math.sin(a)]));
    }
  }
  // The instruments' boom and its platform, its cameras long since off.
  ink.push(...seg([-0.25, -0.89, 0], [-0.25, -3.2, 0]));
  ink.push(...ring([-0.25, -3.2, 0], 0.3, "y", 4), ...ring([-0.25, -3.5, 0], 0.3, "y", 4));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * 2 * Math.PI;
    ink.push(...seg([-0.25 + 0.3 * Math.cos(a), -3.2, 0.3 * Math.sin(a)], [-0.25 + 0.3 * Math.cos(a), -3.5, 0.3 * Math.sin(a)]));
  }
  // The magnetometer boom, 13 m, a thin mast.
  ink.push(...seg([-0.2, 0.6, 0.6], [-0.2, 6.5, 11.3]));
  for (let k = 1; k <= 12; k++) ink.push(...ring([-0.2, 0.6 + (5.9 * k) / 12, 0.6 + (10.7 * k) / 12], 0.06, "x", 3));
  // The Golden Record, 30 cm, on one of the body's ten sides, facing out.
  const side = 0.89 * Math.cos(Math.PI / 10);
  hot.push(...ring([-0.24, 0, side + 0.02], 0.15, "z", 24), ...ring([-0.24, 0, side + 0.02], 0.05, "z", 12));
  // Its dotted road back to the Sun, as on the map, the dots spreading as they go, and a few ahead, outward.
  const path: number[] = [];
  for (let k = 0, x = -2.6; k < 34; k++, x *= 1.18) path.push(...seg([x, 0, 0], [x * 1.04, 0, 0]));
  for (let x = 1.2; x < 9; x += 1.4) path.push(...seg([x, 0, 0], [x + 0.5, 0, 0]));
  return {
    ink,
    hot,
    skins: [
      {
        tris: [
          ...lathe([0, 0, 0], "x", [[-0.47, 0], [-0.47, 0.89], [0, 0.89], [0, 0]], 10),
          ...lathe([0, 0, 0], "x", [[-0.5, 0], [-0.5, 0.4], [-0.75, 1.0], [-1.0, 1.45], [-1.3, 1.83]], 48),
          ...lathe([0, 0, 0], "x", [[-2.1, 0], [-2.1, 0.14]], 16),
          ...lathe([-0.25, 0, 0], "y", [[-3.2, 0], [-3.2, 0.3], [-3.5, 0.3], [-3.5, 0]], 4),
        ],
      },
      { tris: [1.6, 2.2, 2.8].flatMap((y) => lathe([-0.25, 0, 0], "y", [[y, 0], [y, 0.2], [y + 0.45, 0.2], [y + 0.45, 0]], 16)), hot: true, glow: 0.22 },
      { tris: lathe([-0.24, 0, 0], "z", [[side + 0.02, 0], [side + 0.02, 0.15]], 24), hot: true, glow: 0.12 },
    ],
    // The Sun, 220 times as far as from Earth and behind it, where its dish points. Dim there, about eight full Moons.
    light: [-1, 0, 0],
    fill: 0.2,
    // Seen from a little behind, into the dish the Sun lights.
    turn: [1.9, 0.05],
    path,
    // Its point of light, which lands on its dot on the map as the view pulls back.
    lamps: [-0.25, 0, 0],
    labels: [
      { at: [-1.3, 0, 1.83], head: "VOYAGER 1 · 722 KG", line: "launched 1977, silent now" },
      { at: [-0.24, 0, side + 0.05], head: "GOLDEN RECORD", line: "sounds and pictures of Earth" },
      { at: [-0.25, 3.3, 0], head: "PLUTONIUM POWER", line: "nearly spent" },
      { at: [-0.2, 1.3, 1.9], head: "MAGNETOMETER BOOM · 13 M", line: "keeps its sensors clear of the craft" },
      { at: [2.6, 0, 0], head: "OUTWARD, 17 KM/S", line: "its path back to the Sun behind it" },
    ],
    near: 10,
    far: 2e5,
    el: 22,
  };
}

const MODELS: Record<CraftKind, () => Model> = { voyager, sail, probe, sentinel };

const css = (name: string) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#ffffff");

/** A soft round dot for lights and particles. */
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** `anchor` is where the craft sits on the map underneath: the pull back ends there, so it shrinks into its own place
 *  and not the map's middle. Voyager 1 disappeared into the Sun until 2026-11-07. */
/** `heading` is the way it flies on the map, from one screen point to another: the close view rolls so the craft
 *  flies that way too. Voyager 1 flew backwards, dish first away from the Sun, until 2026-11-07. */
type Pt = { x: number; y: number };
export function CraftView({ kind, shot, className, anchor, heading }: { kind: CraftKind; shot: number; className?: string; anchor?: () => Pt | null; heading?: () => [Pt, Pt] | null }) {
  const box = useRef<HTMLDivElement>(null);
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const shade = useRef<HTMLDivElement>(null);
  const model = MODELS[kind]();

  useEffect(() => {
    const parent = box.current;
    if (!parent) return;
    const m = MODELS[kind]();
    const still = prefersReducedMotion();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    parent.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 10);
    const [ink, hot, lamp] = [css("--ink"), css("--reach"), css("--other")];
    const inkMat = new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.75, depthWrite: false });
    const hotMat = new THREE.LineBasicMaterial({ color: hot, transparent: true, opacity: 0.9, depthWrite: false });
    const lines = (pts: number[], mat: THREE.LineBasicMaterial) => {
      const l = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), mat);
      l.frustumCulled = false;
      scene.add(l);
      return l;
    };
    lines(m.ink, inkMat);
    if (m.hot.length) lines(m.hot, hotMat);
    const pathMat = new THREE.LineBasicMaterial({ color: css("--other"), transparent: true, opacity: 0.9, depthWrite: false });
    if (m.path?.length) lines(m.path, pathMat);
    const tex = dotTexture();
    // Its faces draw nothing themselves. They only write how far off they are, a thousandth farther than they stand,
    // so the lines along their edges and the dots on them still show, and what is behind them does not.
    const [az0, turn] = m.turn ?? [1.25, 0.05];
    const el = (m.el * Math.PI) / 180;
    const up = kind === "sail" ? -1 : 1;
    const hide = new THREE.Mesh(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(m.skins.flatMap((k) => k.tris), 3)),
      new THREE.ShaderMaterial({
        colorWrite: false,
        side: THREE.DoubleSide,
        vertexShader: /* glsl */ `void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); mv.xyz *= 1.001; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `void main() { gl_FragColor = vec4(0.0); }`,
      }),
    );
    hide.frustumCulled = false;
    scene.add(hide);
    // Dots over the faces, as many on each as it fills of the first view, to one for each few pixels of it.
    const dotMat = new THREE.ShaderMaterial({
      uniforms: {
        uDpr: { value: renderer.getPixelRatio() },
        uLight: { value: new THREE.Vector3(...m.light).normalize() },
        uInk: { value: ink },
        uHot: { value: hot },
        uBeam: { value: m.beam ? 1 : 0 },
        uFill: { value: m.fill ?? 0.16 },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
uniform vec3 uLight, uInk, uHot;
uniform float uDpr, uBeam, uFill, uOpacity, uTime;
attribute float aHot, aGlow;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vec3 n = normalize(normalMatrix * normal);
  vec3 v = normalize(-mv.xyz);
  vec3 s = normalize(mat3(viewMatrix) * uLight);
  // A face is lit on whichever side we see.
  if (dot(n, v) < 0.0) n = -n;
  float lit = max(dot(n, s), 0.0);
  float glint = pow(max(dot(n, normalize(s + v)), 0.0), 48.0);
  float beat = fract(sin(dot(position, vec3(12.9898, 78.233, 37.719))) * 43758.5453) * 6.2832;
  // A film in its beam shivers, in rings out from its middle.
  lit *= 1.0 + uBeam * 0.3 * sin(length(position.xy) * 7.0 - uTime * 6.0);
  // What is hot flickers, each dot at its own beat.
  float glow = aGlow * (0.8 + 0.2 * sin(uTime * 3.0 + beat));
  // A mirror in its beam is the brightest thing there.
  float a = (uFill + (1.0 - uFill) * lit) * ${DOTS} * (1.0 + uBeam) + 0.35 * glint + 0.5 * glow;
  vColor = mix(mix(uInk, uHot, aHot), uHot, uBeam * min(1.0, lit)) * (1.0 + 0.8 * glint + glow);
  vAlpha = a * uOpacity;
  gl_PointSize = 1.8 * uDpr;
  if (vAlpha < 0.002) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`,
      fragmentShader: /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) discard;
  gl_FragColor = vec4(vColor, min(1.0, vAlpha * (1.0 - 0.5 * r2)));
}`,
      transparent: true,
      depthWrite: false,
    });
    {
      const look: V = [Math.cos(az0) * Math.cos(el), Math.sin(az0) * Math.cos(el), up * Math.sin(el)];
      const tris: { p: number[]; n: V; w: number; k: Skin }[] = [];
      let total = 0;
      for (const k of m.skins)
        for (let i = 0; i < k.tris.length; i += 9) {
          const p = k.tris.slice(i, i + 9);
          const [ux, uy, uz, vx, vy, vz] = [p[3] - p[0], p[4] - p[1], p[5] - p[2], p[6] - p[0], p[7] - p[1], p[8] - p[2]];
          const [nx, ny, nz] = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
          const l = Math.hypot(nx, ny, nz) || 1e-30;
          const w = (l / 2) * Math.max(0.2, Math.abs(nx * look[0] + ny * look[1] + nz * look[2]) / l);
          total += w;
          tris.push({ p, n: [nx / l, ny / l, nz / l], w, k });
        }
      const perM = parent.clientHeight / (2 * Math.tan((20 * Math.PI) / 180)) / m.near;
      const count = Math.round(Math.min(MOST_DOTS, (total * perM * perM) / 2.4));
      const [pos, nor, heat, glow] = [new Float32Array(count * 3), new Float32Array(count * 3), new Float32Array(count), new Float32Array(count)];
      let seed = 2040;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let d = 0, t = 0, acc = tris[0]?.w ?? 0; d < count; d++) {
        const want = ((d + rnd()) / count) * total;
        while (acc < want && t < tris.length - 1) acc += tris[++t].w;
        let [u, v] = [rnd(), rnd()];
        if (u + v > 1) [u, v] = [1 - u, 1 - v];
        const { p, n, k } = tris[t];
        for (let j = 0; j < 3; j++) pos[d * 3 + j] = p[j] + u * (p[3 + j] - p[j]) + v * (p[6 + j] - p[j]);
        nor.set(n, d * 3);
        heat[d] = k.hot ? 1 : 0;
        glow[d] = k.glow ?? 0;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      g.setAttribute("aHot", new THREE.BufferAttribute(heat, 1));
      g.setAttribute("aGlow", new THREE.BufferAttribute(glow, 1));
      const dots = new THREE.Points(g, dotMat);
      dots.frustumCulled = false;
      scene.add(dots);
    }
    // A lamp shines through its craft, as a build's do, so its point is there to land on the map.
    const lampMat = new THREE.PointsMaterial({ color: lamp, map: tex, size: 14, sizeAttenuation: false, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const lamps = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(m.lamps, 3)), lampMat);
    scene.add(lamps);
    // Its flow: the beam's light, the flame, or the gas between the stars.
    let flowPos: THREE.BufferAttribute | null = null;
    const streakMat = new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
    const flowMat = new THREE.PointsMaterial({ color: m.flow?.hot ? hot : ink, map: tex, size: m.flow?.hot ? 4.5 : 1.8, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    // Where each one ends, where it stops short of the rest, and where it began across the flow, for one that bends.
    let flowEnd: Float32Array | null = null;
    let flowOut: Float32Array | null = null;
    let flowAt: Float32Array | null = null;
    const [fu, fv] = m.flow?.axis === 0 ? [1, 2] : m.flow?.axis === 1 ? [0, 2] : [0, 1];
    /** Puts one where it is along the flow, pushed out as far as the flow bends there. A streak has a second end. */
    const place = (a: Float32Array, at: number, i: number, along: number) => {
      const f = m.flow!;
      const [u, v] = [flowOut![i * 2], flowOut![i * 2 + 1]];
      const r = Math.hypot(u, v);
      const k = f.bend && r > 0 ? f.bend(along, r) / r : 1;
      a[at * 3 + f.axis] = along;
      a[at * 3 + fu] = u * k;
      a[at * 3 + fv] = v * k;
    };
    if (m.flow) {
      const f = m.flow;
      const ends = f.streak ? 2 : 1;
      const back = f.streak ? -Math.sign(f.speed) * f.streak : 0;
      const arr = new Float32Array(f.n * ends * 3);
      flowEnd = new Float32Array(f.n);
      flowOut = new Float32Array(f.n * 2);
      flowAt = new Float32Array(f.n);
      for (let i = 0; i < f.n; i++) {
        flowOut.set(f.spread(i), i * 2);
        const end = (flowEnd[i] = f.stop?.(Math.hypot(...f.spread(i))) ?? f.to);
        flowAt[i] = f.from + (end - f.from) * chance(i, 0);
        place(arr, i * ends, i, flowAt[i]);
        if (f.streak) place(arr, i * 2 + 1, i, flowAt[i] + back);
      }
      flowPos = new THREE.BufferAttribute(arr, 3);
      const g = new THREE.BufferGeometry().setAttribute("position", flowPos);
      const pts = f.streak ? new THREE.LineSegments(g, streakMat) : new THREE.Points(g, flowMat);
      pts.frustumCulled = false;
      scene.add(pts);
    }
    // Its own sky behind it, so the map's Earth or Sun underneath can step right back while the craft is close.
    const sky = new THREE.Scene();
    const skyCam = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    const starArr = new Float32Array(1500 * 3);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1500; i++) {
      const [u, w] = [rnd() * 2 - 1, rnd() * 2 * Math.PI];
      const r = Math.sqrt(1 - u * u);
      starArr.set([100 * r * Math.cos(w), 100 * r * Math.sin(w), 100 * u], i * 3);
    }
    const starMat = new THREE.PointsMaterial({ color: ink, map: tex, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false });
    sky.add(new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(starArr, 3)), starMat));
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = parent;
      renderer.setSize(w, h, false);
      camera.aspect = skyCam.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      skyCam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const v = new THREE.Vector3();
    const start = performance.now();
    let raf = 0;
    let last = start;
    const frame = (now: number) => {
      const s = still ? 3 : (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Hold and turn, then pull back in log distance until it is a point, fading as the map's flight takes over.
      // Close for 4 seconds, out over 4.5, a beat held at the far end, then gone.
      const pull = Math.min(1, Math.max(0, (s - 4) / 4.5));
      const ease = pull * pull * (3 - 2 * pull);
      const D = m.near * (m.far / m.near) ** ease;
      const fade = Math.min(1, s / 0.8) * (1 - Math.max(0, (s - (CRAFT_SHOT_SECS - 1.2)) / 1.2));
      // Side on to its way forward, so it plainly flies across the view, turning a little. The sail is seen from
      // below, in its beam.
      const az = az0 + s * turn;
      // Travel is +x for the probe and sentinel, +z for the sail: the camera stands to the side.
      camera.position.set(D * Math.cos(az) * Math.cos(el), D * Math.sin(az) * Math.cos(el), up * D * Math.sin(el));
      camera.up.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      // Roll about the line of sight so its way forward on screen is its way on the map.
      const way = heading?.();
      if (way) {
        camera.updateMatrixWorld();
        // A point along its way forward, a tenth of the view's distance out, so it reads at any scale.
        const a = (kind === "sail" ? v.set(0, 0, D * 0.1) : v.set(D * 0.1, 0, 0)).project(camera);
        const [ax, ay] = [a.x, a.y];
        const o = v.set(0, 0, 0).project(camera);
        const have = Math.atan2(ay - o.y, ax - o.x);
        const want = Math.atan2(-(way[1].y - way[0].y), way[1].x - way[0].x);
        if (Math.hypot(ax - o.x, ay - o.y) > 1e-6) camera.rotateZ(have - want);
      }
      // Slide the view so the craft moves from the middle to its place on the map as it pulls back.
      const { clientWidth: pw, clientHeight: ph } = parent;
      const to = anchor?.();
      // It reaches its place early in the pull, while still big enough to follow, then shrinks there to a point.
      const slide = Math.min(1, ease * 2.2);
      // On a phone the map is short and its ruler lies along its foot, so up close the craft stands a little above
      // the middle, clear of it.
      const lift = ph < 420 ? 0.1 * ph * (1 - slide) : 0;
      camera.setViewOffset(pw, ph, to ? -(to.x - pw / 2) * slide : 0, (to ? -(to.y - ph / 2) * slide : 0) + lift, pw, ph);
      camera.near = D / 400;
      camera.far = D * 2000;
      camera.updateProjectionMatrix();
      inkMat.opacity = 0.75 * fade;
      hotMat.opacity = fade * (kind === "probe" ? 0.55 + 0.15 * Math.sin(s * 9) : kind === "sail" ? 0.5 : 0.9);
      // The map behind steps back while the craft is close.
      if (shade.current) shade.current.style.opacity = String(fade * (1 - pull));
      lampMat.opacity = fade;
      pathMat.opacity = 0.9 * fade;
      flowMat.opacity = 0.8 * fade;
      // As it shrinks its dots crowd together, so each dims, and the whole stays as bright as it was up close.
      dotMat.uniforms.uOpacity.value = fade * (m.near / D) ** 1.5;
      dotMat.uniforms.uTime.value = still ? 0 : s;
      streakMat.opacity = 0.35 * fade;
      if (flowPos && flowEnd && flowAt && m.flow && !still) {
        const f = m.flow;
        const a = flowPos.array as Float32Array;
        const ends = f.streak ? 2 : 1;
        const back = f.streak ? -Math.sign(f.speed) * f.streak : 0;
        for (let i = 0; i < f.n; i++) {
          const [end, span] = [flowEnd[i], flowEnd[i] - f.from];
          let x = flowAt[i] + f.speed * dt;
          if ((span > 0 && x > end) || (span < 0 && x < end)) x -= span;
          flowAt[i] = x;
          if (!f.bend && !f.streak) a[i * 3 + f.axis] = x;
          else {
            place(a, i * ends, i, x);
            if (f.streak) place(a, i * 2 + 1, i, x + back);
          }
        }
        flowPos.needsUpdate = true;
      }
      skyCam.quaternion.copy(camera.quaternion);
      starMat.opacity = 0.5 * fade * (1 - pull);
      renderer.clear();
      renderer.render(sky, skyCam);
      renderer.autoClear = false;
      renderer.render(scene, camera);
      renderer.autoClear = true;
      // Names follow their places, and fade as the view pulls back.
      const { clientWidth: w, clientHeight: h } = parent;
      // Each beside its place, on the left where the right would run off the view, held inside the view, and moved
      // down clear of the names set before it. On a phone they ran off the edge and lay over each other.
      const set: [number, number, number, number][] = [];
      m.labels.forEach((l, i) => {
        const n = tags.current[i];
        if (!n) return;
        v.set(...l.at).project(camera);
        const on = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
        const a = on ? fade * (l.keep ? Math.min(1, Math.max(0, pull * 2 - 1)) : 1 - Math.min(1, pull * 3)) : 0;
        n.style.opacity = String(a);
        if (a < 0.02) return;
        const [x, y, wd, ht] = [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h, n.offsetWidth, n.offsetHeight];
        const left = steadySide(n, x, w - 18 - wd) && x - 10 - wd >= 8;
        const tx = Math.max(8, Math.min(w - 8 - wd, left ? x - 10 - wd : x + 10));
        let ty = y - ht / 2;
        for (let pass = 0; pass < 2; pass++)
          for (const [px, py, pw, ph] of set) if (tx < px + pw && px < tx + wd && ty < py + ph + 2 && py < ty + ht + 2) ty = py + ph + 2;
        set.push([tx, ty, wd, ht]);
        n.style.transform = `translate(${tx}px, ${ty}px)`;
        n.style.textAlign = left ? "right" : "left";
      });
      if (s < CRAFT_SHOT_SECS && !still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      tex.dispose();
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      dotMat.dispose();
      streakMat.dispose();
      renderer.domElement.remove();
    };
  }, [kind, shot, anchor, heading]);

  return (
    <div ref={box} className={`pointer-events-none isolate ${className ?? ""}`} aria-hidden>
      <div ref={shade} className="absolute inset-0 -z-10 bg-page opacity-0" />
      {model.labels.map((l, i) => (
        <div
          key={`${kind}-${i}`}
          ref={(n) => void (tags.current[i] = n)}
          className="absolute top-0 left-0 font-mono text-[10px] leading-tight tracking-[.08em] whitespace-nowrap opacity-0 [text-shadow:0_0_4px_#0b0c0d,0_0_8px_#0b0c0d]"
        >
          <div className="text-ink">{l.head}</div>
          {/* On a phone the map is too small for a second line under each name. */}
          {l.line && <div className="hidden text-muted wide:block">{l.line}</div>}
        </div>
      ))}
    </div>
  );
}
