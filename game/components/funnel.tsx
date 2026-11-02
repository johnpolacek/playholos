import { useEffect, useRef } from "react";
import { round } from "@/lib/about/dials";
import { prefersReducedMotion } from "@/lib/motion";

// The chain from stars to minds as a stream of light: 200 billion stars pour in at the top, and each step lets through
// its share, so the stream narrows tier by tier, warm worlds, air, life, animals, down to minds. Each tier's width is
// its count on a log scale, so a dial's turn widens or pinches its own stretch and every tier below it. Points of light
// flow down and thin where it narrows. Simulation mode, 2026-11-01.

export interface Tier {
  label: string;
  count: number;
  /** The tier's color, as a CSS color. */
  color: string;
}

const TOP = 2e11;
const ROW = 30;
const PAD = 8;
const FLOOR = 4;
/** Room kept for the tier's name on the left and its count on the right, px. */
const LEFT = 128, RIGHT = 86;

export function Funnel({ tiers }: { tiers: Tier[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const want = useRef(tiers);
  useEffect(() => void (want.current = tiers), [tiers]);

  useEffect(() => {
    const c = canvas.current!;
    const g = c.getContext("2d")!;
    const still = prefersReducedMotion();
    const shown = want.current.map((t) => t.count);
    type Dot = { y: number; u: number; v: number };
    const dots: Dot[] = [];
    let raf = 0,
      last = performance.now();
    // From 10,000 up, on a log scale, so each step's cut shows as a pinch: a thousand-fold drop narrows it by a third.
    const widthOf = (n: number, room: number) =>
      Math.max(2, ((Math.log10(Math.max(1, n)) - FLOOR) / (Math.log10(TOP) - FLOOR)) * room);
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = devicePixelRatio || 1;
      const W = c.clientWidth,
        H = c.clientHeight;
      if (c.width !== W * dpr) [c.width, c.height] = [W * dpr, H * dpr];
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const tiers = want.current;
      // Each tier eases to its new count, in the log, so a turn reads as the stream swelling or pinching.
      tiers.forEach((t, i) => {
        const a = Math.log10(Math.max(1, shown[i] ?? t.count)),
          b = Math.log10(Math.max(1, t.count));
        shown[i] = 10 ** (still ? b : a + (b - a) * (1 - Math.exp(-dt * 6)));
      });
      const ys = tiers.map((_, i) => PAD + i * ROW + ROW / 2);
      const room = W - LEFT - RIGHT;
      const ws = shown.map((n) => widthOf(n, room));
      const widthAt = (y: number) => {
        if (y <= ys[0]) return ws[0];
        for (let i = 1; i < ys.length; i++)
          if (y <= ys[i]) {
            const k = (y - ys[i - 1]) / (ys[i] - ys[i - 1]);
            return ws[i - 1] + (ws[i] - ws[i - 1]) * (k * k * (3 - 2 * k));
          }
        return ws[ws.length - 1];
      };
      // The stream's body: a soft band through every tier.
      const cx = LEFT + room / 2;
      g.beginPath();
      for (let y = ys[0]; y <= ys[ys.length - 1]; y += 2) g.lineTo(cx - widthAt(y) / 2, y);
      for (let y = ys[ys.length - 1]; y >= ys[0]; y -= 2) g.lineTo(cx + widthAt(y) / 2, y);
      g.closePath();
      const grad = g.createLinearGradient(0, ys[0], 0, ys[ys.length - 1]);
      tiers.forEach((t, i) => grad.addColorStop(i / (tiers.length - 1), t.color));
      g.globalAlpha = 0.16;
      g.fillStyle = grad;
      g.fill();
      // Its light, flowing down. A point leaves where the stream narrows, as most do at each step.
      if (!still)
        for (let k = 0; k < 6; k++) dots.push({ y: ys[0], u: Math.random() * 2 - 1, v: 28 + Math.random() * 30 });
      g.globalAlpha = 1;
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i];
        const w0 = widthAt(d.y);
        d.y += d.v * dt;
        const w1 = widthAt(d.y);
        if (d.y > ys[ys.length - 1] || (w1 < w0 && Math.random() > (w1 / w0) ** 3)) {
          dots.splice(i, 1);
          continue;
        }
        const t = Math.min(tiers.length - 1, Math.max(0, Math.round((d.y - ys[0]) / ROW)));
        g.fillStyle = tiers[t].color;
        g.globalAlpha = 0.85;
        g.fillRect(cx + (d.u * w1) / 2 - 0.75, d.y - 0.75, 1.5, 1.5);
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative mt-3" style={{ height: PAD * 2 + tiers.length * ROW }}>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      {tiers.map((t, i) => (
        <div
          key={t.label}
          className="absolute inset-x-0 flex items-center justify-between font-mono text-[11px] [text-shadow:0_0_4px_#000,0_0_8px_#000]"
          style={{ top: PAD + i * ROW, height: ROW }}
        >
          <span className="text-page-ink2">{t.label}</span>
          <span style={{ color: t.color }}>{round(t.count)}</span>
        </div>
      ))}
    </div>
  );
}
