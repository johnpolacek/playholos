import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { layered, LINES, RUNGS, SOURCES, surface } from "@/lib/about/see";
import { Stat } from "./ages";
import { color, KICK, Sources, useCanvas } from "./dials";

// What can we see, on /about/research: one Earth twin, rung by rung, from a sway in its star's light to a dot, its air,
// a map through the Sun's lens, and a flyby's close look. It climbs on its own until a reader picks a rung.

const H = 340,
  STAY = 6;

/** The world's map, made once: longitude across, latitude down. */
const MW = 512,
  MH = 256;
let map: Uint8ClampedArray | null = null;
function worldMap() {
  if (map) return map;
  map = new Uint8ClampedArray(MW * MH * 3);
  for (let j = 0; j < MH; j++) {
    const lat = (0.5 - (j + 0.5) / MH) * Math.PI;
    for (let i = 0; i < MW; i++) {
      const lon = ((i + 0.5) / MW) * 2 * Math.PI;
      const rgb = surface(
        Math.cos(lat) * Math.sin(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.cos(lon),
        6,
      );
      map.set(rgb, (j * MW + i) * 3);
    }
  }
  return map;
}

/** The world drawn `s` pixels across, turned by `turn`, into an image of that size. */
function globe(s: number, turn: number): ImageData {
  const img = new ImageData(s, s),
    m = worldMap();
  for (let j = 0; j < s; j++)
    for (let i = 0; i < s; i++) {
      const nx = ((i + 0.5) / s) * 2 - 1,
        ny = ((j + 0.5) / s) * 2 - 1,
        r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2);
      const lon =
          (((Math.atan2(nx, nz) + turn) % (2 * Math.PI)) + 2 * Math.PI) %
          (2 * Math.PI),
        lat = Math.asin(-ny);
      const at =
        (Math.min(MH - 1, Math.floor((0.5 - lat / Math.PI) * MH)) * MW +
          Math.min(MW - 1, Math.floor((lon / (2 * Math.PI)) * MW))) *
        3;
      const r = m[at],
        g = m[at + 1],
        b = m[at + 2];
      // Lit from the upper left, darker at the edge.
      const lit = Math.max(
        0.12,
        0.25 + 0.75 * (nz * 0.7 - nx * 0.45 - ny * 0.3),
      );
      const k = (j * s + i) * 4;
      img.data[k] = r * lit;
      img.data[k + 1] = g * lit;
      img.data[k + 2] = b * lit;
      img.data[k + 3] = 255;
    }
  return img;
}

/** A close patch of the world near a coast, as a flyby sees it, made once: `s` pixels, wider than shown so it pans. */
function patch(s: number): ImageData {
  const img = new ImageData(s, s);
  // A coast: start near the edge of the first continent along the equator.
  let lon = 0;
  for (let a = 0; a < 6.28; a += 0.01) {
    const [r] = surface(Math.sin(a), 0.2, Math.cos(a), 6);
    if (r > 60) {
      lon = a;
      break;
    }
  }
  const span = 0.05;
  for (let j = 0; j < s; j++)
    for (let i = 0; i < s; i++) {
      const a = lon + (i / s - 0.5) * span,
        y = 0.2 + (j / s - 0.5) * span;
      const px = Math.sin(a),
        pz = Math.cos(a);
      // Close up: the coast roughened, land in forest, field and bare ground, thin cloud above.
      const h =
        layered(px * 1.8 + 3, y * 1.8, pz * 1.8, 6) +
        (layered(px * 90, y * 90, pz * 90, 5) - 0.5) * 0.06 +
        (layered(px * 700, y * 700, pz * 700, 3) - 0.5) * 0.015;
      const cover = layered(px * 300 + 7, y * 300, pz * 300, 5);
      const cloud = Math.max(
        0,
        Math.min(1, (layered(px * 120 + 9, y * 160, pz * 120, 5) - 0.6) * 3),
      );
      let rgb: number[];
      if (h < 0.5) {
        const deep = Math.min(1, (0.5 - h) * 25);
        rgb = [40 - 20 * deep, 110 - 55 * deep, 140 - 40 * deep];
      } else if (h < 0.503) rgb = [196, 184, 150];
      else if (cover > 0.56) rgb = [38, 66, 36];
      else if (cover > 0.44) rgb = [84, 112, 58];
      else rgb = [150, 132, 98];
      const [r, g, b] = rgb.map((v) => v + (240 - v) * cloud);
      const k = (j * s + i) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
  return img;
}

function View({ rung }: { rung: number }) {
  const off = useRef<HTMLCanvasElement | null>(null);
  const close = useRef<HTMLCanvasElement | null>(null);
  const ref = useCanvas((c, w, h, t) => {
    const r = RUNGS[rung],
      ink = color("--ink"),
      muted = color("--muted"),
      other = color("--other");
    const air = r.key === "air";
    const D = Math.min(h - 40, air ? w * 0.42 : w - 24),
      cx = air ? D / 2 + 12 : w / 2,
      cy = h / 2 - 6;
    c.font = "10.5px var(--font-plex-mono), monospace";
    if (r.px === 0) {
      // The star, swaying as its world circles, too small a sway to draw true.
      const sx = cx + Math.sin(t * 1.2) * 6;
      const glow = c.createRadialGradient(sx, cy, 0, sx, cy, 40);
      glow.addColorStop(0, "rgba(255,244,214,1)");
      glow.addColorStop(1, "rgba(255,244,214,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(sx, cy, 40, 0, 2 * Math.PI);
      c.fill();
      c.fillStyle = muted;
      c.fillText("← SWAYS 9 CM/S →", cx - 52, cy + 64);
      return;
    }
    if (r.px === 1) {
      // The starlight blocked, and one pale dot beside it.
      c.strokeStyle = muted;
      c.globalAlpha = 0.5;
      c.beginPath();
      c.arc(cx - 40, cy, 18, 0, 2 * Math.PI);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = muted;
      c.fillText("STAR, BLOCKED", cx - 82, cy + 38);
      const px = cx + 50,
        pulse = 0.75 + 0.25 * Math.sin(t * 2);
      const glow = c.createRadialGradient(px, cy, 0, px, cy, 12);
      glow.addColorStop(0, `rgba(150,190,255,${pulse})`);
      glow.addColorStop(1, "rgba(150,190,255,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(px, cy, 12, 0, 2 * Math.PI);
      c.fill();
      c.fillStyle = "rgb(200,220,255)";
      c.fillRect(px - 1.5, cy - 1.5, 3, 3);
      c.fillStyle = muted;
      c.fillText("ONE PIXEL", px - 26, cy + 38);
      if (air) {
        // Its light spread into colors, with what each air takes out.
        const x0 = w * 0.48,
          x1 = w - 16,
          top = 40,
          base = h - 60;
        const x = (um: number) => x0 + ((um - 0.5) / 0.5) * (x1 - x0);
        c.strokeStyle = other;
        c.lineWidth = 1.5;
        c.beginPath();
        for (let i = 0; i <= 300; i++) {
          const um = 0.5 + (i / 300) * 0.5;
          let v = 0.85;
          for (const l of LINES)
            v -=
              l.depth *
              Math.exp(-(((um - l.um) / (l.um === 0.6 ? 0.05 : 0.008)) ** 2));
          const y = top + (1 - v) * (base - top);
          if (i) c.lineTo(x(um), y);
          else c.moveTo(x(um), y);
        }
        c.stroke();
        c.lineWidth = 1;
        LINES.forEach((l, i) => {
          c.fillStyle = l.faint ? muted : ink;
          c.globalAlpha = l.faint ? 0.6 : 1;
          const label = l.faint
            ? `${l.name.toUpperCase()}, TOO FAINT`
            : l.name.toUpperCase();
          c.fillText(label, x(l.um) - 12, base + 18 + (i % 2) * 14);
        });
        c.globalAlpha = 1;
        c.fillStyle = muted;
        c.fillRect(x0, base, x1 - x0, 1);
        c.fillText("0.5", x0, top - 10);
        c.fillText("1 MICRON", x1 - 56, top - 10);
      }
      return;
    }
    if (r.key === "lens") {
      // The map: the whole world, turning, as sharp as this screen allows.
      const s = Math.round(D);
      if (!off.current) off.current = document.createElement("canvas");
      off.current.width = s;
      off.current.height = s;
      off.current.getContext("2d")!.putImageData(globe(s, t * 0.08), 0, 0);
      c.drawImage(off.current, cx - s / 2, cy - s / 2);
      c.fillStyle = muted;
      c.fillText("ABOUT 8 KM A PIXEL", cx - 50, h - 8);
      return;
    }
    // The flyby: a close patch, panning past.
    const s = Math.round(D);
    if (!close.current) {
      close.current = document.createElement("canvas");
      close.current.width = s * 2;
      close.current.height = s;
      const big = patch(s * 2);
      close.current.getContext("2d")!.putImageData(big, 0, -s / 2);
    }
    const pan = ((t * 12) % s) | 0;
    c.save();
    c.beginPath();
    c.arc(cx, cy, s / 2, 0, 2 * Math.PI);
    c.clip();
    c.drawImage(close.current, pan, 0, s, s, cx - s / 2, cy - s / 2, s, s);
    c.restore();
    c.fillStyle = muted;
    c.fillText("20 TO 200 M A PIXEL", cx - 56, h - 8);
  });
  useEffect(
    () => void ref.current?.dispatchEvent(new Event("dials")),
    [rung, ref],
  );
  return (
    <canvas ref={ref} aria-hidden className="w-full" style={{ height: H }} />
  );
}

export function See() {
  const [rung, setRung] = useState(0);
  const held = useRef(false);
  // Climb a rung every few seconds until the reader picks one.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => {
      if (!held.current) setRung((r) => (r + 1) % RUNGS.length);
    }, STAY * 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <section
      id="see"
      aria-label="What can we see"
      className="mx-auto max-w-[1180px] scroll-mt-16 px-4 pb-16"
    >
      <h2
        data-a
        className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
      >
        What can we see?
      </h2>
      <p
        data-a
        className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        From here, another Earth is a single dot, and only going there shows its
        face.
      </p>
      <dl data-a className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
        <Stat
          value="1 pixel"
          label="Another Earth, through our best telescope"
        />
        <Stat value="1,500" label="Pixels across, through the Sun’s lens" />
        <Stat value="20 m" label="A flyby’s sharpest look" />
      </dl>
      <div data-a className="mt-8">
        <View rung={rung} />
        <ol className="mt-4 flex flex-wrap gap-2">
          {RUNGS.map((r, i) => (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => {
                  held.current = true;
                  setRung(i);
                }}
                className={`rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-[.1em] transition-colors ${i === rung ? "border-other text-other" : "border-faint text-muted hover:text-ink"}`}
              >
                <span className="mr-1.5 opacity-60">{i + 1}</span>
                {r.name.toUpperCase()}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-4 min-h-[4.5em] max-w-[60ch] text-[15px] leading-[1.55]">
          {RUNGS[rung].says}
        </p>
        <p className={`mt-1 ${KICK}`}>
          AN EARTH TWIN ABOUT 33 LIGHT-YEARS AWAY
        </p>
        <Sources list={SOURCES} />
      </div>
    </section>
  );
}
