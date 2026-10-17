"use client";

import { useEffect, useRef, useState } from "react";
import { Sources } from "@/components/sources";
import { PEOPLE_SOURCES } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "Who they are": Earth at night. The globe turns in the dark while its real city lights come on and the count
// climbs to 9.2 billion, the UN's 2040 projection. Then threads rise from the cities and meet in one point: their
// machines, woken as one. The lights are NASA's Black Marble, by way of the atlas's night map (scripts/lights.mjs).

type Light = [lat: number, lon: number, b: number];

// The night, whatever the phone's theme: the dark tokens, on this screen only.
export const NIGHT = {
  "--paper": "#07090b",
  "--panel": "#07090b",
  "--ink": "#e6e3db",
  "--muted": "#8a867e",
  "--page-ink2": "#b3afa6",
  "--faint": "#2a2c30",
  "--you": "#5bb8d6",
  "--other": "#e8b45c",
} as React.CSSProperties;

const LAMP = "232,180,92";
const MIND = "91,184,214";
const TILT = (22 * Math.PI) / 180;
const PEOPLE = 9.2e9;

/** The scene's dials, tweened by the intro and read every frame. */
interface Scene {
  outline: number;
  lit: number;
  threads: number;
  mind: number;
}

/** A soft round glow, drawn once and stamped for every light. */
function glowSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.18, `rgba(${rgb},.75)`);
  grad.addColorStop(0.45, `rgba(${rgb},.18)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/** The brightest cities, spread apart: where the threads start. */
function hubs(lights: Light[], n: number, apart: number) {
  const out: Light[] = [];
  for (const l of [...lights].sort((a, b) => b[2] - a[2])) {
    if (out.every((h) => Math.hypot(h[0] - l[0], (h[1] - l[1]) * Math.cos((l[0] * Math.PI) / 180)) > apart))
      out.push(l);
    if (out.length === n) break;
  }
  return out;
}

function Globe({ scene, lights }: { scene: React.RefObject<Scene>; lights: Light[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const g = el.getContext("2d")!;
    const lamp = glowSprite(LAMP);
    const mindGlow = glowSprite(MIND);
    // Cities first, then towns, so the count climbs as the big lights come on.
    const order = lights.map((l, i) => ({ l, k: l[2] + Math.random() * 2.5, i })).sort((a, b) => b.k - a.k);
    const rank = new Float32Array(lights.length);
    order.forEach((o, r) => (rank[o.i] = r / lights.length));
    const starts = hubs(lights, 18, 14);
    const still = prefersReducedMotion();
    let lon0 = -40;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = w * dpr;
      el.height = h * dpr;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const project = (lat: number, lon: number, cx: number, cy: number, r: number) => {
      const p = (lat * Math.PI) / 180;
      const l = ((lon - lon0) * Math.PI) / 180;
      const cosc = Math.sin(TILT) * Math.sin(p) + Math.cos(TILT) * Math.cos(p) * Math.cos(l);
      return {
        x: cx + r * Math.cos(p) * Math.sin(l),
        y: cy - r * (Math.cos(TILT) * Math.sin(p) - Math.sin(TILT) * Math.cos(p) * Math.cos(l)),
        z: cosc,
      };
    };

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!still) lon0 -= dt * 4;
      const s = scene.current;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const r = Math.min(w * 0.4, h * 0.34);
      const cx = w / 2;
      const cy = h * 0.6;

      // The air: a thin blue glow on the limb.
      if (s.outline > 0) {
        const air = g.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.12);
        air.addColorStop(0, `rgba(${MIND},${0.22 * s.outline})`);
        air.addColorStop(1, `rgba(${MIND},0)`);
        g.fillStyle = air;
        g.beginPath();
        g.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = `rgba(230,227,219,${0.55 * s.outline})`;
        g.lineWidth = 1;
        g.beginPath();
        g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.outline);
        g.stroke();
      }

      // The lights. Each comes on at its turn, and dims toward the limb.
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < lights.length; i++) {
        const on = (s.lit - rank[i]) * 12;
        if (on <= 0) continue;
        const [lat, lon, b] = lights[i];
        const p = project(lat, lon, cx, cy, r);
        if (p.z <= 0.02) continue;
        const size = (1.6 + b * 1.1) * (r / 150);
        g.globalAlpha = Math.min(1, on) * Math.min(1, p.z * 2.2) * (0.35 + b * 0.08);
        g.drawImage(lamp, p.x - size, p.y - size, size * 2, size * 2);
      }
      g.globalAlpha = 1;

      // The threads: from each city on this side up to one point, the Mind.
      const mx = cx;
      const my = cy - r * 1.45;
      if (s.threads > 0) {
        g.lineWidth = 0.8;
        for (const [lat, lon] of starts) {
          const p = project(lat, lon, cx, cy, r);
          if (p.z <= 0.05) continue;
          const qx = (p.x + mx) / 2 + (p.x - cx) * 0.35;
          const qy = Math.min(p.y, my) - r * 0.25;
          g.strokeStyle = `rgba(${MIND},${0.55 * Math.min(1, p.z * 3)})`;
          g.beginPath();
          g.moveTo(p.x, p.y);
          const steps = 24;
          for (let k = 1; k <= steps * s.threads; k++) {
            const t = k / steps;
            g.lineTo(
              (1 - t) ** 2 * p.x + 2 * (1 - t) * t * qx + t * t * mx,
              (1 - t) ** 2 * p.y + 2 * (1 - t) * t * qy + t * t * my,
            );
          }
          g.stroke();
        }
      }
      if (s.mind > 0) {
        const pulse = still ? 1 : 1 + 0.25 * Math.sin(now / 420);
        const size = 26 * s.mind * pulse;
        g.drawImage(mindGlow, mx - size, my - size, size * 2, size * 2);
      }
      g.globalCompositeOperation = "source-over";
      if (s.mind > 0) {
        g.fillStyle = `rgba(${MIND},${s.mind})`;
        g.beginPath();
        g.arc(mx, my, 2.5, 0, Math.PI * 2);
        g.fill();
        g.font = "9px var(--font-plex-mono), monospace";
        g.textAlign = "center";
        g.fillStyle = `rgba(138,134,126,${s.mind})`;
        g.fillText("the Mind", mx, my - 12);
      }
    };

    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
    };
  }, [lights, scene]);

  return <canvas ref={canvas} data-m="globe" aria-hidden className="block h-[min(46vh,360px)] w-full shrink-0" />;
}

const LINES = ["About 195 nations. No one government.", "Their air is warmer than their recent ancestors knew."];

export function People({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const scene = useRef<Scene>({ outline: 0, lit: 0, threads: 0, mind: 0 });
  const [lights, setLights] = useState<Light[]>();

  useEffect(() => {
    import("@/lib/game/lights.json").then((m) => setLights(m.default as Light[]));
  }, []);

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      const s = scene.current;
      const n = { v: 0 };
      const show = () => (count.current!.textContent = Math.round(n.v).toLocaleString("en-US"));
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
        .set(q('[data-m="globe"]'), { autoAlpha: 1 }, 0)
        .to(s, { outline: 1, duration: 1.4, ease: "power2.inOut" }, 0.2)
        .to(s, { lit: 1, duration: 3.6, ease: "power1.in" }, 1)
        .fromTo(q('[data-m="count"]'), riseFrom, { ...rise, duration: 0.6 }, 1.1)
        .to(n, { v: PEOPLE, duration: 3.6, ease: "power1.in", onUpdate: show }, 1)
        .fromTo(q('[data-m="still"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 4.4);
      q('[data-m="line"]').forEach((line, i) => tl.fromTo(line, riseFrom, { ...rise, duration: 0.6 }, 4.8 + i * 1.1));
      tl.to(s, { threads: 1, duration: 1.8, ease: "power2.inOut" }, 6.2)
        .to(s, { mind: 1, duration: 0.6, ease: "back.out(2)" }, 7.7)
        .fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.8 }, 8.6)
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, 9.2);
    },
    !!lights,
  );

  // Reduced motion skips the intro, so the scene starts complete.
  useEffect(() => {
    if (lights && prefersReducedMotion()) {
      scene.current = { outline: 1, lit: 1, threads: 1, mind: 1 };
      count.current!.textContent = PEOPLE.toLocaleString("en-US");
    }
  }, [lights]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={{ ...NIGHT, visibility: lights ? undefined : "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 pt-6 text-ink"
    >
      <div className="flex items-center justify-between">
        <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          YEAR 0 · EARTH’S PEOPLE
        </span>
        <Sources sources={PEOPLE_SOURCES} />
      </div>
      {lights && <Globe scene={scene} lights={lights} />}
      <div data-m="count" className="-mt-2 flex items-baseline gap-2">
        <span ref={count} className="text-[34px] leading-none font-semibold tracking-[-.01em] tabular-nums">
          0
        </span>
      </div>
      <span data-m="still" className="mt-1 text-[13px] text-muted">
        people, and still rising
      </span>
      <div className="mt-4 flex flex-col gap-1.5 text-[15px] leading-snug text-page-ink2">
        {LINES.map((line) => (
          <p key={line} data-m="line">
            {line}
          </p>
        ))}
        <p data-m="last" className="mt-2 text-[17px] leading-snug font-medium text-other">
          Every light is a soul. You are their Will.
        </p>
      </div>
      <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4">
        <button
          data-m="act"
          onClick={() => leave(onSkip)}
          className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
        >
          Skip
        </button>
        <button
          data-m="act"
          onClick={() => leave(onNext)}
          className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Where things stand
        </button>
      </div>
    </div>
  );
}
