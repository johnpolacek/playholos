// Each craft on Reach's walk, up close in the map's own 3D lines: the camera opens on it in deep space, turns round
// it, then pulls back until it is a point, and the map's flight to Proxima takes over. Asked for 2026-11-07, (x): the
// sail, the probe and the sentinel themselves in the 3D view, not drawings beside it. Drawn over the starfield with a
// clear background, so the sky behind is the map's. Sizes are real, in metres, from calcs/craft.py and Parkin 2018:
// a sail 4.1 m across with its 1 g chip, a probe of 150 t of instruments, 6,100 t of deuterium (about 36,000 m³ of
// liquid, at 0.169 t a m³) and 400 t of engine and radiators, and a sentinel's loop 1,600 km across (Gros 2017).
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/motion";
import { CATALOG } from "@/lib/sim/works";

export type CraftKind = "voyager" | "sail" | "probe" | "sentinel";

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

interface Model {
  /** Structure, drawn in ink. */
  ink: number[];
  /** What works, drawn in the build's color: the beam, the flame, the loop. */
  hot: number[];
  /** Lights: points, each x, y, z. */
  lamps: number[];
  /** Names, at points on it. */
  labels: { at: V; head: string; line?: string; keep?: boolean }[];
  /** Camera distance in metres while it holds, and how far it pulls back. */
  near: number;
  far: number;
  /** Particles: where each starts, and how it moves each second. Wrapped between `from` and `to` along `axis`. */
  flow?: { n: number; axis: 0 | 1 | 2; from: number; to: number; speed: number; spread: (i: number) => [number, number]; hot: boolean };
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
        const r = 2.5 * Math.sqrt(((i * 0.618) % 1));
        const a = i * 2.39996;
        return [r * Math.cos(a), r * Math.sin(a)];
      },
      hot: true,
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
  // The truss back to the engine.
  for (const [y, z] of [[4, 4], [-4, 4], [4, -4], [-4, -4]] as const) ink.push(...seg([-30, y, z], [-72, y, z]));
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
        const r = 2 + 5 * ((i * 0.618) % 1);
        const a = i * 2.39996;
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
    lamps: [12, 0, 0],
    labels: [
      { at: [0, 0, 5], head: "SENTINEL · 1,000 T" },
      { at: [0, 0, R], head: "MAGNETIC SAIL · 1,600 KM ACROSS", line: `brakes ${CATALOG.sentinel.brake} Years, with no flame`, keep: true },
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
        const r = 1.6e6 * Math.sqrt((i * 0.618) % 1);
        const a = i * 2.39996;
        return [r * Math.cos(a), r * Math.sin(a)];
      },
      hot: false,
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
    const a = (k / 4) * 2 * Math.PI + Math.PI / 4;
    ink.push(...seg([-0.25 + 0.3 * Math.cos(a), -3.2, 0.3 * Math.sin(a)], [-0.25 + 0.3 * Math.cos(a), -3.5, 0.3 * Math.sin(a)]));
  }
  // The magnetometer boom, 13 m, a thin mast.
  ink.push(...seg([-0.2, 0.6, 0.6], [-0.2, 6.5, 11.3]));
  for (let k = 1; k <= 12; k++) ink.push(...ring([-0.2, 0.6 + (5.9 * k) / 12, 0.6 + (10.7 * k) / 12], 0.06, "x", 3));
  // The Golden Record, 30 cm, on the body's side.
  hot.push(...ring([-0.24, 0, -0.9], 0.15, "z", 24));
  // Its dotted road back to the Sun, as on the map, the dots spreading as they go.
  for (let k = 0, x = -2.6; k < 34; k++, x *= 1.18) ink.push(...seg([x, 0, 0], [x * 1.04, 0, 0]));
  return {
    ink,
    hot,
    // Its point of light, which lands on its dot on the map as the view pulls back.
    lamps: [-0.25, 0, 0],
    labels: [
      { at: [-1.3, 0, 1.83], head: "VOYAGER 1 · 722 KG", line: "launched 1977, silent now" },
      { at: [-0.24, 0, -0.95], head: "GOLDEN RECORD", line: "sounds and pictures of Earth" },
      { at: [-0.25, 3.3, 0], head: "PLUTONIUM POWER", line: "nearly spent" },
      { at: [-0.2, 6.5, 11.3], head: "MAGNETOMETER · 13 M" },
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
    const inkMat = new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.75 });
    const hotMat = new THREE.LineBasicMaterial({ color: hot, transparent: true, opacity: 0.9 });
    const lines = (pts: number[], mat: THREE.LineBasicMaterial) => {
      const l = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), mat);
      l.frustumCulled = false;
      scene.add(l);
      return l;
    };
    lines(m.ink, inkMat);
    if (m.hot.length) lines(m.hot, hotMat);
    const tex = dotTexture();
    const lampMat = new THREE.PointsMaterial({ color: lamp, map: tex, size: 14, sizeAttenuation: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const lamps = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(m.lamps, 3)), lampMat);
    scene.add(lamps);
    // Its flow: the beam's light, the flame, or the gas between the stars.
    let flowPos: THREE.BufferAttribute | null = null;
    const flowMat = new THREE.PointsMaterial({ color: m.flow?.hot ? hot : ink, map: tex, size: m.flow?.hot ? 4.5 : 1.8, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    if (m.flow) {
      const f = m.flow;
      const arr = new Float32Array(f.n * 3);
      for (let i = 0; i < f.n; i++) {
        const [u, v] = f.spread(i);
        const along = f.from + (f.to - f.from) * ((i * 0.754877) % 1);
        const p = f.axis === 0 ? [along, u, v] : f.axis === 1 ? [u, along, v] : [u, v, along];
        arr.set(p, i * 3);
      }
      flowPos = new THREE.BufferAttribute(arr, 3);
      const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", flowPos), flowMat);
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
      const az = kind === "sail" ? 0.9 + s * 0.12 : 1.25 + s * 0.05;
      const el = (m.el * Math.PI) / 180;
      // Travel is +x for the probe and sentinel, +z for the sail: the camera stands to the side and a little behind.
      if (kind === "sail") camera.position.set(D * Math.cos(az) * Math.cos(el), D * Math.sin(az) * Math.cos(el), -D * Math.sin(el));
      else camera.position.set(D * Math.cos(az) * Math.cos(el), D * Math.sin(az) * Math.cos(el), D * Math.sin(el));
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
      if (to && pull > 0) camera.setViewOffset(pw, ph, -(to.x - pw / 2) * slide, -(to.y - ph / 2) * slide, pw, ph);
      else camera.clearViewOffset();
      camera.near = D / 2000;
      camera.far = D * 2000;
      camera.updateProjectionMatrix();
      inkMat.opacity = 0.75 * fade;
      hotMat.opacity = fade * (kind === "probe" ? 0.55 + 0.15 * Math.sin(s * 9) : kind === "sail" ? 0.5 : 0.9);
      // The map behind steps back while the craft is close.
      if (shade.current) shade.current.style.opacity = String(fade * (1 - pull));
      lampMat.opacity = fade;
      flowMat.opacity = 0.8 * fade;
      if (flowPos && m.flow && !still) {
        const f = m.flow;
        const a = flowPos.array as Float32Array;
        const span = f.to - f.from;
        for (let i = 0; i < f.n; i++) {
          let x = a[i * 3 + f.axis] + f.speed * dt;
          if ((span > 0 && x > f.to) || (span < 0 && x < f.to)) x -= span;
          a[i * 3 + f.axis] = x;
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
      m.labels.forEach((l, i) => {
        const n = tags.current[i];
        if (!n) return;
        v.set(...l.at).project(camera);
        const on = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
        n.style.transform = `translate(${((v.x + 1) / 2) * w + 10}px, ${((1 - v.y) / 2) * h}px) translate(0, -50%)`;
        n.style.opacity = String(on ? fade * (l.keep ? Math.min(1, Math.max(0, pull * 2 - 1)) : 1 - Math.min(1, pull * 3)) : 0);
      });
      if (s < CRAFT_SHOT_SECS && !still) raf = requestAnimationFrame(frame);
      else if (still) renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      tex.dispose();
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
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
          className="absolute top-0 left-0 font-mono text-[10px] leading-tight tracking-[.08em] whitespace-nowrap opacity-0"
        >
          <div className="text-ink">{l.head}</div>
          {l.line && <div className="text-muted">{l.line}</div>}
        </div>
      ))}
    </div>
  );
}
