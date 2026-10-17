"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { NIGHT } from "@/components/people";
import type { EarthPast } from "@/lib/game/past";
import { Sources } from "@/components/sources";
import { INHERIT_SOURCES } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "What you inherit": Earth's kit at Year 0, as a powers-of-ten flight. The view opens on Earth's night lights and
// pulls back past the spare matter in orbit, the Moon's south-pole stations, the telescopes at L2 and the Sun, out to
// Voyager 1, silent at 220 AU. Real distances throughout. Kit from HOLOS_GAME_CONCEPT.md, Earth's kit at Year 0.

type Light = [lat: number, lon: number, b: number];

const AMBER = "232,180,92";
const BLUE = "91,184,214";
const INK = "230,227,219";
const MUTED = "138,134,126";
const KM_AU = 1.496e8;
const LIGHT_S = 299792;

const EARTH_R = 6371;
const MOON = { d: 384400, r: 1737, a: -0.55 };
const SUN_A = 3.5;
const L2 = { d: 1.5e6, a: SUN_A - Math.PI };
const NEW_HORIZONS = { d: 100 * KM_AU, a: 4.9 };
const VOYAGER = { d: 220 * KM_AU, a: 4.35 };

/** Where the camera rests for each caption: log10 of the view's radius in km. */
const STOPS = [4.15, 4.75, 5.8, 6.55, 8.5, 10.65];

/** A view radius as the scale readout says it: kilometers up close, then light-time. */
function reach(km: number) {
  const s = km / LIGHT_S;
  if (s < 1) return `${Number(km.toPrecision(2)).toLocaleString("en-US")} km`;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} light-seconds`;
  if (s < 3600) return `${(s / 60).toFixed(s < 600 ? 1 : 0)} light-minutes`;
  return `${(s / 3600).toFixed(0)} light-hours`;
}

function glowSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.2, `rgba(${rgb},.7)`);
  grad.addColorStop(0.5, `rgba(${rgb},.15)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

function Flight({ zoom, lights }: { zoom: React.RefObject<{ z: number; show: number }>; lights: Light[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const g = el.getContext("2d")!;
    const lamp = glowSprite(AMBER);
    const sun = glowSprite("255,236,190");
    // Spare matter: depots, spent stages and dead craft, mostly low, some at geostationary height.
    const junk = Array.from({ length: 260 }, (_, i) => ({
      r: i % 9 === 0 ? 42164 : EARTH_R + 400 + Math.random() * 1600,
      a: Math.random() * Math.PI * 2,
      w: 0.25 + Math.random() * 0.2,
    }));
    const tilt = (20 * Math.PI) / 180;
    const lon0 = 15;
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

    const label = (text: string, x: number, y: number, rgb = MUTED, alpha = 1) => {
      g.font = "9px var(--font-plex-mono), monospace";
      g.textAlign = x > w * 0.62 ? "right" : "left";
      g.fillStyle = `rgba(${rgb},${alpha})`;
      g.fillText(text, x + (x > w * 0.62 ? -8 : 8), y + 3);
    };
    // Fades a thing in while it is a readable size on screen, and out when it shrinks to nothing.
    const visible = (px: number, lo: number, hi = Infinity) => Math.max(0, Math.min(1, (px - lo) / lo, (hi - px) / hi));

    let t0 = performance.now();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const { z, show } = zoom.current;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.globalAlpha = show;
      const R = Math.min(w, h) * 0.46;
      const k = R / 10 ** z;
      const cx = w / 2;
      const cy = h / 2;
      const pos = (d: number, a: number) => ({ x: cx + d * k * Math.cos(a), y: cy + d * k * Math.sin(a) });
      const er = EARTH_R * k;

      // The Sun, and Earth's year around it, once the view is wide enough.
      const s = pos(KM_AU, SUN_A);
      const sunA = visible(KM_AU * k, 6);
      if (sunA > 0) {
        g.strokeStyle = `rgba(${INK},${0.12 * sunA})`;
        g.lineWidth = 0.7;
        g.beginPath();
        g.arc(s.x, s.y, KM_AU * k, 0, Math.PI * 2);
        g.stroke();
        const size = 10 + 6 * sunA;
        g.globalCompositeOperation = "lighter";
        g.drawImage(sun, s.x - size, s.y - size, size * 2, size * 2);
        g.globalCompositeOperation = "source-over";
        label("the Sun", s.x, s.y, MUTED, sunA);
      }

      // The far probes, on their long roads out from the Sun.
      for (const [p, name] of [
        [NEW_HORIZONS, "New Horizons · 100 AU"],
        [VOYAGER, "Voyager 1 · silent · 220 AU"],
      ] as const) {
        const a = visible(p.d * k, 30);
        if (a <= 0) continue;
        const q = { x: s.x + p.d * k * Math.cos(p.a), y: s.y + p.d * k * Math.sin(p.a) };
        g.setLineDash([2, 4]);
        g.strokeStyle = `rgba(${INK},${0.25 * a})`;
        g.beginPath();
        g.moveTo(s.x, s.y);
        g.lineTo(q.x, q.y);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = `rgba(${INK},${a})`;
        g.beginPath();
        g.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
        g.fill();
        label(name, q.x, q.y, INK, a);
      }

      // L2, where Roman and an aging JWST watch.
      const l2 = pos(L2.d, L2.a);
      const l2A = visible(L2.d * k, 20, R * 6);
      if (l2A > 0) {
        g.setLineDash([1, 3]);
        g.strokeStyle = `rgba(${BLUE},${0.5 * l2A})`;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(l2.x, l2.y);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = `rgba(${INK},${l2A})`;
        for (const dy of [-3, 3]) {
          g.beginPath();
          g.arc(l2.x, l2.y + dy, 1.6, 0, Math.PI * 2);
          g.fill();
        }
        label("Roman · JWST · L2", l2.x, l2.y, INK, l2A);
      }

      // The Moon, with stations at its south pole.
      const m = pos(MOON.d, MOON.a);
      const mA = visible(MOON.d * k, 14, R * 8);
      if (mA > 0) {
        const mr = Math.max(2, MOON.r * k);
        g.setLineDash([1, 3]);
        g.strokeStyle = `rgba(${BLUE},${0.5 * mA})`;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(m.x, m.y);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = "#07090b";
        g.strokeStyle = `rgba(${INK},${mA})`;
        g.lineWidth = 1;
        g.beginPath();
        g.arc(m.x, m.y, mr, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        if (mr > 5) {
          g.fillStyle = `rgba(${BLUE},${mA})`;
          g.beginPath();
          g.arc(m.x, m.y + mr * 0.92, 1.8, 0, Math.PI * 2);
          g.fill();
        }
        label(mr > 5 ? "the Moon · south-pole stations" : "the Moon", m.x + mr, m.y, MUTED, mA);
      }

      // Spare matter in orbit, circling.
      for (const j of junk) {
        const r = j.r * k;
        const a = visible(r - er, 1.5, R * 3);
        if (a <= 0) continue;
        const ang = j.a + t * j.w * (EARTH_R / j.r) ** 1.5;
        g.fillStyle = `rgba(${INK},${0.55 * a})`;
        g.fillRect(cx + r * Math.cos(ang), cy + r * Math.sin(ang), 1.2, 1.2);
      }

      // Lift: rockets climbing from the ground, a few at a time.
      if (er > 30) {
        for (let i = 0; i < 4; i++) {
          const phase = (t * 0.5 + i / 4) % 1;
          const a = -2.3 + i * 0.5 + Math.sin(i * 7) * 0.2;
          const r0 = er;
          const r1 = er + EARTH_R * 0.18 * k * phase;
          g.strokeStyle = `rgba(${AMBER},${0.7 * (1 - phase)})`;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a));
          g.lineTo(cx + r1 * Math.cos(a + phase * 0.25), cy + r1 * Math.sin(a + phase * 0.25));
          g.stroke();
        }
      }

      // Earth: its lights while it is large, a blue point when it is not.
      if (er > 4) {
        g.fillStyle = "#07090b";
        g.beginPath();
        g.arc(cx, cy, er, 0, Math.PI * 2);
        g.fill();
        const air = g.createRadialGradient(cx, cy, er * 0.96, cx, cy, er * 1.1);
        air.addColorStop(0, `rgba(${BLUE},0.28)`);
        air.addColorStop(1, `rgba(${BLUE},0)`);
        g.fillStyle = air;
        g.beginPath();
        g.arc(cx, cy, er * 1.1, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = `rgba(${INK},0.5)`;
        g.lineWidth = 1;
        g.beginPath();
        g.arc(cx, cy, er, 0, Math.PI * 2);
        g.stroke();
        g.globalCompositeOperation = "lighter";
        for (const [lat, lon, b] of lights) {
          const p = (lat * Math.PI) / 180;
          const l = ((lon - lon0 - t * 2) * Math.PI) / 180;
          const cosc = Math.sin(tilt) * Math.sin(p) + Math.cos(tilt) * Math.cos(p) * Math.cos(l);
          if (cosc <= 0.02) continue;
          const x = cx + er * Math.cos(p) * Math.sin(l);
          const y = cy - er * (Math.cos(tilt) * Math.sin(p) - Math.sin(tilt) * Math.cos(p) * Math.cos(l));
          const size = (1.4 + b) * (er / 160);
          g.globalAlpha = show * Math.min(1, cosc * 2.2) * (0.35 + b * 0.08);
          g.drawImage(lamp, x - size, y - size, size * 2, size * 2);
        }
        g.globalAlpha = show;
        g.globalCompositeOperation = "source-over";
      }
      g.fillStyle = `rgba(${BLUE},1)`;
      g.beginPath();
      g.arc(cx, cy, er > 4 ? 0 : 2.6, 0, Math.PI * 2);
      g.fill();
      if (er <= 4) label("Earth", cx, cy, BLUE);

      // The scale: the view's radius, in kilometers and then in light-time.
      g.globalAlpha = show;
      g.strokeStyle = `rgba(${MUTED},0.8)`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx, h - 10);
      g.lineTo(cx + R, h - 10);
      g.moveTo(cx, h - 13);
      g.lineTo(cx, h - 7);
      g.moveTo(cx + R, h - 13);
      g.lineTo(cx + R, h - 7);
      g.stroke();
      g.font = "9px var(--font-plex-mono), monospace";
      g.textAlign = "center";
      g.fillStyle = `rgba(${MUTED},1)`;
      g.fillText(reach(10 ** z), cx + R / 2, h - 15);
      g.globalAlpha = 1;
    };

    t0 = performance.now();
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
    };
  }, [lights, zoom]);

  return <canvas ref={canvas} data-m="flight" aria-hidden className="block h-[min(48vh,400px)] w-full shrink-0" />;
}

/** Earth's compute at Year 0, as the seed left it: 10²⁵ a second, less what a Taiwan war or blockade cost. */
function compute(share: number) {
  return share >= 0.99 ? "10²⁵ a second" : `${(share * 10).toFixed(1)} × 10²⁴ a second`;
}

function stops(past: EarthPast) {
  return [
    {
      kick: "GROW · ENERGY AND THOUGHT",
      big: "24 TW",
      line: `Earth’s grid. Thinking takes about 1% of it: ${compute(past.compute)}.`,
    },
    {
      kick: "GROW · MATTER",
      big: "20 kt",
      line: "Spare in orbit: depots, spent stages, dead craft. Lift brings 15 kt more each Year.",
    },
    {
      kick: "GROW · PLACES",
      big: "The Moon",
      line: past.mars
        ? "Small stations at its south pole, and a few people on Mars."
        : "Small stations at its south pole. No one on Mars.",
    },
    {
      kick: "KNOW · TELESCOPES",
      big: "Roman, JWST, the ELT",
      line: "They feel worlds by their tug. None can read a rocky world’s air.",
    },
    {
      kick: "REACH · LASER LINKS",
      big: "The home system",
      line: "The Sun is 8 light-minutes away. Laser links cross the whole system in hours.",
    },
    { kick: "REACH · PROBES", big: "Voyager 1", line: "Silent, 220 AU out. The farthest thing we ever sent." },
  ];
}

function Stop({ kick, big, line }: { kick: string; big: string; line: string }) {
  return (
    <div data-m="cap" className="col-start-1 row-start-1 flex flex-col gap-1">
      <span className="font-mono text-[10.5px] tracking-[.1em] text-other">{kick}</span>
      <b className="text-[24px] leading-tight font-semibold">{big}</b>
      <span className="text-[14px] leading-snug text-page-ink2">{line}</span>
    </div>
  );
}

export function Inherit({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const { save } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const zoom = useRef({ z: STOPS[0], show: 0 });
  const [lights, setLights] = useState<Light[]>();
  const [past, setPast] = useState<EarthPast>();
  const seed = save?.seed;

  useEffect(() => {
    import("@/lib/game/lights.json").then((m) => setLights(m.default as Light[]));
  }, []);
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast);
  }, [seed]);
  const ready = !!lights && !!past;

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      const zm = zoom.current;
      const caps = q('[data-m="cap"]');
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .set(q('[data-m="flight"]'), { autoAlpha: 1 }, 0)
        .to(zm, { show: 1, duration: 1.2 }, 0.1)
        .fromTo(caps[0], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.8);
      let t = 2.6;
      STOPS.slice(1).forEach((z, i) => {
        const move = 1.1 + (z - STOPS[i]) * 0.35;
        tl.to(zm, { z, duration: move, ease: "power2.inOut" }, t);
        tl.to(caps[i], { autoAlpha: 0, y: -8, duration: 0.25, ease: "power2.in" }, t + move - 0.55);
        tl.fromTo(
          caps[i + 1],
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
          t + move - 0.3,
        );
        t += move + 2.2;
      });
      tl.fromTo(q('[data-m="meter"]'), riseFrom, { ...rise, stagger: 0.12 }, t - 0.6)
        .fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.8 }, t)
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, t + 0.6);
    },
    ready,
  );

  // Reduced motion skips the flight: the widest view, and the last stop.
  useEffect(() => {
    if (!ready || !prefersReducedMotion() || !root.current) return;
    zoom.current = { z: STOPS[STOPS.length - 1], show: 1 };
    const caps = root.current.querySelectorAll('[data-m="cap"]');
    caps.forEach((c, i) => gsap.set(c, { autoAlpha: i === caps.length - 1 ? 1 : 0 }));
  }, [ready]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={{ ...NIGHT, visibility: ready ? undefined : "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 pt-6 text-ink"
    >
      <div className="flex items-center justify-between">
        <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          YEAR 0 · WHAT YOU INHERIT
        </span>
        <Sources sources={INHERIT_SOURCES} />
      </div>
      {ready && <Flight zoom={zoom} lights={lights} />}
      <div className="mt-2 grid min-h-[104px]">{past && stops(past).map((s) => <Stop key={s.kick} {...s} />)}</div>
      <div className="mt-3 grid grid-cols-3 gap-2.5 border-t border-faint pt-3">
        {(
          [
            ["ENERGY", "24 TW"],
            ["MATTER", "20 kt"],
            ["COMPUTE", past ? compute(past.compute).replace(" a second", "/s") : ""],
          ] as const
        ).map(([k, v]) => (
          <span key={k} data-m="meter" className="flex flex-col gap-1 text-[10px] tracking-[.08em] text-muted">
            {k}
            <em className="font-mono text-[13px] font-semibold text-ink not-italic">{v}</em>
          </span>
        ))}
      </div>
      <p data-m="last" className="mt-3 text-[17px] leading-snug font-medium text-other">
        The instruments are today’s. The Mind is not.
      </p>
      <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4">
        <button
          data-m="act"
          onClick={() => leave(onSkip)}
          className="h-[46px] rounded-full text-[15px] font-medium"
        >
          Skip
        </button>
        <button
          data-m="act"
          onClick={() => leave(onNext)}
          className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Earth’s charter
        </button>
      </div>
    </div>
  );
}
