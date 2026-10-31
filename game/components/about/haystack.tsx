import { useEffect, useMemo, useRef } from "react";
import { stream } from "@/lib/about/random";
import { dots, type Behave } from "@/lib/about/behave";
import {
  allSkyAbove,
  least,
  LISTEN,
  listenLeast,
  MARKS,
  NEARBY,
  nearbyLeast,
  NEARBY_STARS,
  starsWithin,
  SURVEYS,
} from "@/lib/about/haystack";
import { color, useCanvas } from "./dials";

// The haystack, on /about/research: what our searches rule out, painted where they looked at every star and hatched
// where they looked at only a few hundred, and what is left. Distance runs across, power
// up, both by tens. A mind above a line would have been seen. Below every line, it is still possible.

const NEAR = 10,
  FAR = 1e5,
  PAD = { l: 14, r: 14, t: 14, b: 30 };

type Axes = {
  x: (ly: number) => number;
  y: (w: number) => number;
  w: number;
  h: number;
};

function axes(w: number, h: number, lo: number, hi: number): Axes {
  return {
    x: (ly) =>
      PAD.l +
      (Math.log(ly / NEAR) / Math.log(FAR / NEAR)) * (w - PAD.l - PAD.r),
    y: (p) =>
      h - PAD.b - (Math.log(p / lo) / Math.log(hi / lo)) * (h - PAD.t - PAD.b),
    w,
    h,
  };
}

const sup = (n: number) =>
  String(n).replace(/[-0-9]/g, (d) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(d)]);

/** Distance along the bottom, and powers of ten up the side. */
function frame(
  c: CanvasRenderingContext2D,
  a: Axes,
  lo: number,
  hi: number,
  muted: string,
) {
  c.fillStyle = muted;
  c.font = "10.5px var(--font-plex-mono), monospace";
  const base = a.h - PAD.b;
  c.fillRect(PAD.l, base, a.w - PAD.l - PAD.r, 1);
  for (const ly of [10, 100, 1e3, 1e4, 1e5]) {
    c.fillRect(a.x(ly), base, 1, 4);
    c.fillText(ly.toLocaleString("en-US"), a.x(ly) - 6, base + 16);
  }
  c.fillText("LIGHT-YEARS AWAY", a.w - PAD.r - 104, base + 28);
  for (let e = Math.ceil(Math.log10(lo)); e <= Math.log10(hi); e += 4) {
    c.globalAlpha = 0.25;
    c.fillRect(PAD.l, a.y(10 ** e), a.w - PAD.l - PAD.r, 1);
    c.globalAlpha = 1;
    c.fillText(`10${sup(e)} W`, PAD.l + 2, a.y(10 ** e) - 4);
  }
}

/** The ruled-out region: everything above `edge`, column by column, painted. */
function paint(
  c: CanvasRenderingContext2D,
  a: Axes,
  edge: (ly: number) => number,
  fill: string,
) {
  const cols = Math.ceil(a.w - PAD.l - PAD.r);
  c.beginPath();
  c.moveTo(PAD.l, PAD.t);
  let started = false;
  for (let i = 0; i <= cols; i++) {
    const ly = NEAR * (FAR / NEAR) ** (i / cols);
    const y = Math.max(PAD.t, Math.min(a.h - PAD.b, a.y(edge(ly))));
    const x = PAD.l + i;
    if (!started) {
      c.lineTo(x, y);
      started = true;
    } else c.lineTo(x, y);
  }
  c.lineTo(a.w - PAD.r, PAD.t);
  c.closePath();
  c.fillStyle = fill;
  c.globalAlpha = 0.16;
  c.fill();
  c.globalAlpha = 1;
}

/** A region searched only at some stars: hatched above `edge`, out to `upto` ly, so it reads as partly checked. */
function hatch(
  c: CanvasRenderingContext2D,
  a: Axes,
  edge: (ly: number) => number,
  upto: number,
  stroke: string,
) {
  const cols = Math.ceil(a.x(upto) - PAD.l);
  c.save();
  c.beginPath();
  c.moveTo(PAD.l, PAD.t);
  for (let i = 0; i <= cols; i++) {
    const ly = NEAR * (FAR / NEAR) ** (i / Math.ceil(a.w - PAD.l - PAD.r));
    c.lineTo(PAD.l + i, Math.max(PAD.t, Math.min(a.h - PAD.b, a.y(edge(ly)))));
  }
  c.lineTo(PAD.l + cols, PAD.t);
  c.closePath();
  c.clip();
  c.strokeStyle = stroke;
  c.globalAlpha = 0.35;
  for (let x = PAD.l - a.h; x < PAD.l + cols; x += 7) {
    c.beginPath();
    c.moveTo(x, a.h);
    c.lineTo(x + a.h, 0);
    c.stroke();
  }
  c.restore();
}

/** A line along `edge`, where it is finite and on the chart. */
function trace(
  c: CanvasRenderingContext2D,
  a: Axes,
  edge: (ly: number) => number,
  stroke: string,
  width = 1,
) {
  const cols = Math.ceil(a.w - PAD.l - PAD.r);
  c.strokeStyle = stroke;
  c.lineWidth = width;
  c.beginPath();
  let pen = false;
  for (let i = 0; i <= cols; i++) {
    const ly = NEAR * (FAR / NEAR) ** (i / cols),
      p = edge(ly);
    const y = a.y(p);
    if (!isFinite(p) || y < PAD.t || y > a.h - PAD.b) {
      pen = false;
      continue;
    }
    if (pen) c.lineTo(PAD.l + i, y);
    else c.moveTo(PAD.l + i, y);
    pen = true;
  }
  c.stroke();
  c.lineWidth = 1;
}

/** Heat: what the whole-sky maps rule out for a mind at T kelvin, solid, and what a few hundred nearby stars' surveys
 *  add, hatched, against what a mind might put out. */
export function HeatChart({ b }: { b: Behave }) {
  const T = b.cold;
  const shown = useRef(T);
  const minds = useMemo(() => dots(b, 80, stream(4)), [b]);
  const LO = 1e12,
    HI = 1e34;
  const ref = useCanvas((c, w, h, t) => {
    // Ease toward the dial, in log, so the painted region slides.
    const a0 = Math.log(shown.current),
      b0 = Math.log(T);
    shown.current =
      Math.abs(b0 - a0) < 0.002 ? T : Math.exp(a0 + (b0 - a0) * 0.15);
    const temp = shown.current;
    const a = axes(w, h, LO, HI),
      ink = color("--ink"),
      muted = color("--muted"),
      other = color("--other"),
      you = color("--you");
    frame(c, a, LO, HI, muted);
    paint(c, a, (ly) => allSkyAbove(temp, ly), other);
    // Each whole-sky survey's own line, faint, named where it enters the chart.
    for (const s of SURVEYS) {
      trace(c, a, (ly) => least(s, temp, ly), muted);
      const p = least(s, temp, 12);
      if (isFinite(p) && a.y(p) > PAD.t + 8 && a.y(p) < a.h - PAD.b) {
        c.fillStyle = muted;
        c.fillText(s.name.toUpperCase(), a.x(12), a.y(p) - 4);
      }
    }
    trace(c, a, (ly) => allSkyAbove(temp, ly), other, 1.5);
    // The nearby-star surveys: deeper, but only at their few hundred stars.
    if (isFinite(nearbyLeast(temp, 50))) {
      const edge = (ly: number) => nearbyLeast(temp, ly);
      hatch(
        c,
        a,
        (ly) => Math.min(edge(ly), allSkyAbove(temp, ly)),
        NEARBY.ly,
        other,
      );
      trace(c, a, edge, other);
      c.fillStyle = other;
      c.fillText(
        `HERSCHEL, JCMT: ${NEARBY_STARS} OF ABOUT ${Math.round(starsWithin(NEARBY.ly) / 1000)},000 STARS`,
        a.x(12),
        a.y(edge(12)) + 16,
      );
    }
    // What a mind might put out.
    for (const m of MARKS.filter((m) => !m.radio)) {
      c.strokeStyle = ink;
      c.globalAlpha = 0.5;
      c.setLineDash([3, 4]);
      c.beginPath();
      c.moveTo(PAD.l, a.y(m.w));
      c.lineTo(a.w - PAD.r, a.y(m.w));
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      c.fillStyle = ink;
      c.fillText(
        m.name.toUpperCase(),
        a.w - PAD.r - c.measureText(m.name.toUpperCase()).width,
        a.y(m.w) - 4,
      );
    }
    // Awake minds at the dial's power. One in the solid region would already have been seen.
    minds.forEach((m, i) => {
      const caught = m.w > allSkyAbove(temp, m.ly);
      c.fillStyle = caught ? other : you;
      c.globalAlpha = 0.55 + 0.45 * Math.sin(t * 1.3 + i * 1.7);
      c.beginPath();
      c.arc(a.x(m.ly), a.y(m.w), caught ? 3 : 2.2, 0, 2 * Math.PI);
      c.fill();
      // A full ring: the whole-sky maps would have seen it. A half ring: seen if its star was one the nearby
      // surveys checked, most within 20 ly.
      const partly = !caught && m.w > nearbyLeast(temp, m.ly);
      if (caught || partly) {
        c.strokeStyle = other;
        c.globalAlpha = 1;
        c.beginPath();
        c.arc(a.x(m.ly), a.y(m.w), 6, 0, caught ? 2 * Math.PI : Math.PI);
        c.stroke();
      }
    });
    c.globalAlpha = 1;
    c.font = "12px var(--font-plex-mono), monospace";
    c.fillStyle = other;
    c.fillText("RULED OUT, EVERY STAR", a.x(2000), PAD.t + 18);
    c.fillStyle = ink;
    c.fillText("STILL POSSIBLE", a.x(2000), a.y(1e15));
  });
  useEffect(
    () => void ref.current?.dispatchEvent(new Event("dials")),
    [b, ref],
  );
  return <canvas ref={ref} aria-hidden className="h-[380px] w-full" />;
}

/** Radio: what Breakthrough Listen rules out, a steady tone from a nearby star, and the rest of the sky unheard. */
export function RadioChart() {
  const LO = 1e8,
    HI = 1e20;
  const ref = useCanvas((c, w, h, t) => {
    const a = axes(w, h, LO, HI),
      ink = color("--ink"),
      muted = color("--muted"),
      other = color("--other");
    frame(c, a, LO, HI, muted);
    hatch(c, a, listenLeast, LISTEN.at, other);
    trace(c, a, listenLeast, other, 1.5);
    c.fillStyle = other;
    c.fillText(
      `BREAKTHROUGH LISTEN: ${LISTEN.stars.toLocaleString("en-US")} OF ABOUT ${Math.round(starsWithin(LISTEN.at) / 1000)},000 STARS`,
      a.x(12),
      a.y(listenLeast(12)) - 6,
    );
    for (const m of MARKS.filter((m) => m.radio)) {
      c.strokeStyle = ink;
      c.globalAlpha = 0.5;
      c.setLineDash([3, 4]);
      c.beginPath();
      c.moveTo(PAD.l, a.y(m.w));
      c.lineTo(a.w - PAD.r, a.y(m.w));
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      c.fillStyle = ink;
      c.fillText(
        m.name.toUpperCase(),
        a.w - PAD.r - c.measureText(m.name.toUpperCase()).width,
        a.y(m.w) - 4,
      );
    }
    // A tight beam between two old minds, sweeping past us unheard.
    const sweep = (t * 0.15) % 1;
    c.strokeStyle = other;
    c.globalAlpha = 0.6 * Math.sin(Math.PI * sweep);
    c.beginPath();
    c.moveTo(a.x(2000), a.y(1e17));
    c.lineTo(a.x(2000 + 60000 * sweep), a.y(1e17));
    c.stroke();
    c.globalAlpha = 1;
    c.fillStyle = muted;
    c.fillText(
      "A BEAM BETWEEN OLD MINDS, AIMED AWAY",
      a.x(2000),
      a.y(1e17) - 6,
    );
    c.font = "12px var(--font-plex-mono), monospace";
    c.fillStyle = ink;
    c.fillText("UNHEARD", a.x(3000), a.y(1e10));
  });
  return <canvas ref={ref} aria-hidden className="h-[300px] w-full" />;
}
