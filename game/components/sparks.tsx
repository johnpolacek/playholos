import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Begin's hover: specks of light drawn in from around the button, spiraling down onto its edge, as our light gathers
// at Year 0. Placed inside a positioned button, it spills past the edge and never takes the pointer. Off when motion
// is reduced.
const SPILL = 40;

interface Speck {
  a: number;
  k: number;
  spin: number;
  fall: number;
  size: number;
  life: number;
}

export function Sparks({ on }: { on: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef(on);
  const running = useRef<(() => void) | null>(null);

  useEffect(() => {
    live.current = on;
    if (!on || running.current || prefersReducedMotion()) return;
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const color = getComputedStyle(el).getPropertyValue("--you").trim() || "#5bb8d6";
    const dpr = window.devicePixelRatio || 1;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    el.width = w * dpr;
    el.height = h * dpr;
    ctx.scale(dpr, dpr);
    const cx = w / 2;
    const cy = h / 2;
    const rx = cx - SPILL;
    const ry = cy - SPILL;
    const specks: Speck[] = [];
    let frame = 0;
    let last = performance.now();

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (live.current) for (let i = 0; i < 2; i++) specks.push(spawn());
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      for (let i = specks.length - 1; i >= 0; i--) {
        const s = specks[i];
        const was = point(s);
        s.a += s.spin * dt;
        s.k -= s.fall * dt;
        s.life += dt;
        if (s.k <= 1) {
          specks.splice(i, 1);
          continue;
        }
        const at = point(s);
        // Bright as it nears the edge, faint far out.
        const glow = Math.min(1, s.life * 3) * Math.min(1, (1.9 - s.k) * 1.6);
        ctx.globalAlpha = glow * 0.45;
        ctx.lineWidth = s.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(was.x, was.y);
        ctx.lineTo(at.x, at.y);
        ctx.stroke();
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.arc(at.x, at.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (live.current || specks.length) frame = requestAnimationFrame(tick);
      else stop();
    };
    const spawn = (): Speck => ({
      a: Math.random() * Math.PI * 2,
      k: 1.5 + Math.random() * 0.4,
      spin: 0.8 + Math.random() * 0.9,
      fall: 0.5 + Math.random() * 0.5,
      size: 0.6 + Math.random() * 1.1,
      life: 0,
    });
    const point = (s: Speck) => ({
      x: cx + Math.cos(s.a) * rx * s.k,
      y: cy + Math.sin(s.a) * ry * s.k,
    });
    const stop = () => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      running.current = null;
    };
    running.current = stop;
    frame = requestAnimationFrame(tick);
  }, [on]);

  useEffect(() => () => running.current?.(), []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      style={{ inset: -SPILL }}
      className="pointer-events-none absolute h-[calc(100%+80px)] w-[calc(100%+80px)]"
    />
  );
}
