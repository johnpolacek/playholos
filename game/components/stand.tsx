"use client";

import { useEffect, useRef } from "react";
import { NIGHT } from "@/components/people";
import { KNOCKS, RADARS_SINCE } from "@/lib/game/knocks";
import { YEAR_0 } from "@/lib/game/clock";
import { Sources } from "@/components/sources";
import { STAND_SOURCES } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";
import SKY from "@/lib/game/sky.json";

// "Where things stand": ninety years of Earth's noise, seen from above Sol. Each star within 50 ly sits at its real
// distance and right ascension. From 1950 the radar shell spreads at the speed of light and crosses every one of
// them. Then the aimed messages leave on their real dates, each a pulse along its beam. Some arrive. Three could have
// been answered by now, and none were. Six are still on their way.

const SPAN = 52;
const AMBER = "232,180,92";
const BLUE = "91,184,214";
const STARS = SKY.stars as unknown as [ra: number, d: number, mag: number][];
const TARGETS = SKY.targets as unknown as Record<string, [ra: number, d: number]>;

/** The earliest a reply to any message to this star could reach Earth. */
const replyBy = (target: string) =>
  Math.min(...KNOCKS.filter((k) => k[2] === target).map(([, sent, , ly]) => sent + 2 * ly));
const TARGET_NAMES = Object.keys(TARGETS);
const FLYING = KNOCKS.filter(([, sent, , ly]) => sent + ly > YEAR_0).length;
const SILENT = TARGET_NAMES.filter((t) => replyBy(t) < YEAR_0);
const NEXT = TARGET_NAMES.filter((t) => replyBy(t) >= YEAR_0).sort((a, b) => replyBy(a) - replyBy(b))[0];
const NEXT_YEAR = Math.floor((replyBy(NEXT) - YEAR_0) * 10) / 10;

function Sky({ scene }: { scene: React.RefObject<{ year: number; grid: number; labels: number }> }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const g = el.getContext("2d")!;
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

    const draw = (now: number) => {
      const { year, grid, labels } = scene.current;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) / 2 - 6;
      const px = (ly: number) => (ly / SPAN) * R;
      const at = (ra: number, d: number) => {
        const a = -Math.PI / 2 - (ra / 24) * Math.PI * 2;
        return { x: cx + px(d) * Math.cos(a), y: cy + px(d) * Math.sin(a) };
      };
      const shell = year - RADARS_SINCE;

      // Distance rings, 10 ly apart.
      g.lineWidth = 0.6;
      g.font = "8.5px var(--font-plex-mono), monospace";
      g.textAlign = "center";
      for (let ly = 10; ly <= 50; ly += 10) {
        g.strokeStyle = `rgba(230,227,219,${0.09 * grid})`;
        g.beginPath();
        g.arc(cx, cy, px(ly), 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = `rgba(138,134,126,${0.8 * grid})`;
        g.fillText(`${ly} ly`, cx, cy - px(ly) - 3);
      }

      // The radar shell, and the noise inside it.
      if (shell > 0) {
        // Past the map's edge the noise still fills it, but the glow stays inside the map.
        const r = Math.min(px(shell), R + 4);
        const inside = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        inside.addColorStop(0, `rgba(${AMBER},0.02)`);
        inside.addColorStop(1, `rgba(${AMBER},0.08)`);
        g.fillStyle = inside;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = `rgba(${AMBER},${px(shell) > R ? 0 : 0.7})`;
        g.lineWidth = 1.4;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
      }

      // The stars. Each flares as the shell crosses it, then stays lit.
      for (const [ra, d, mag] of STARS) {
        const p = at(ra, d);
        const size = Math.max(0.6, 2.2 - mag * 0.1);
        const since = shell - d;
        if (since > 0) {
          const flare = Math.max(0, 1 - since / 3);
          g.fillStyle = `rgba(${AMBER},${0.45 + 0.55 * flare})`;
          g.beginPath();
          g.arc(p.x, p.y, size + flare * 2.5, 0, Math.PI * 2);
          g.fill();
        } else {
          g.fillStyle = `rgba(230,227,219,${0.35 * grid})`;
          g.beginPath();
          g.arc(p.x, p.y, size * 0.8, 0, Math.PI * 2);
          g.fill();
        }
      }

      // The aimed messages: a beam to each star, and a pulse moving out along it at the speed of light.
      for (const [, sent, target, ly] of KNOCKS) {
        if (year <= sent) continue;
        const [ra] = TARGETS[target];
        const gone = Math.min(year - sent, ly);
        const head = at(ra, gone);
        g.strokeStyle = `rgba(${AMBER},0.35)`;
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(head.x, head.y);
        g.stroke();
        if (year - sent < ly) {
          const pulse = 3.2 + Math.sin(now / 200 + sent) * 0.8;
          g.fillStyle = `rgba(${AMBER},0.25)`;
          g.beginPath();
          g.arc(head.x, head.y, pulse * 2, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = `rgba(255,236,190,1)`;
          g.beginPath();
          g.arc(head.x, head.y, 1.8, 0, Math.PI * 2);
          g.fill();
        } else {
          const ping = year - sent - ly;
          if (ping < 3) {
            g.strokeStyle = `rgba(${AMBER},${0.8 * (1 - ping / 3)})`;
            g.lineWidth = 1;
            g.beginPath();
            g.arc(head.x, head.y, 3 + ping * 6, 0, Math.PI * 2);
            g.stroke();
          }
        }
      }

      // The twelve stars Earth knocked on.
      for (const name of TARGET_NAMES) {
        const [ra, d] = TARGETS[name];
        const p = at(ra, d);
        const silent = replyBy(name) < year;
        const next = name === NEXT;
        g.strokeStyle = next ? `rgba(${BLUE},${grid})` : `rgba(230,227,219,${0.8 * grid})`;
        g.fillStyle = "#07090b";
        g.lineWidth = 1;
        g.beginPath();
        g.arc(p.x, p.y, 3, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        if (labels > 0 && (next || silent)) {
          g.font = "9px var(--font-plex-mono), monospace";
          g.textAlign = p.x > cx ? "left" : "right";
          const dx = p.x > cx ? 7 : -7;
          g.fillStyle = next ? `rgba(${BLUE},${labels})` : `rgba(138,134,126,${labels})`;
          g.fillText(next ? `${name} · reply Year ${NEXT_YEAR}` : `${name} · silent`, p.x + dx, p.y + 3);
        }
      }

      // Sol.
      g.fillStyle = `rgba(${BLUE},1)`;
      g.beginPath();
      g.arc(cx, cy, 3, 0, Math.PI * 2);
      g.fill();
      g.font = "9px var(--font-plex-mono), monospace";
      g.textAlign = "center";
      g.fillStyle = `rgba(138,134,126,${grid})`;
      g.fillText("Sol", cx, cy + 14);
    };

    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
    };
  }, [scene]);

  return (
    <canvas
      ref={canvas}
      data-m="sky"
      aria-hidden
      className="mx-auto block aspect-square w-full max-w-[420px] shrink-0"
    />
  );
}

const LINES = [
  "Our radars have swept every star within 50 light-years.",
  `We aimed ${KNOCKS.length} messages at ${TARGET_NAMES.length} stars. ${FLYING} are still on their way.`,
  `${SILENT.length} replies could have come by now. None did.`,
  `The next could come in Year ${NEXT_YEAR}, from ${NEXT}.`,
];

export function Stand({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const scene = useRef({ year: RADARS_SINCE - 2, grid: 0, labels: 0 });

  const { leave, hurry } = useStage(root, (q, tl) => {
    const s = scene.current;
    const show = () => {
      const y = Math.floor(s.year);
      clock.current!.textContent = y >= YEAR_0 ? `${YEAR_0} · Year 0` : String(Math.max(RADARS_SINCE, y));
    };
    tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
      .set(q('[data-m="sky"]'), { autoAlpha: 1 }, 0)
      .to(s, { grid: 1, duration: 1 }, 0.2)
      .fromTo(q('[data-m="clock"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6)
      .to(s, { year: YEAR_0, duration: 8, ease: "power1.inOut", onUpdate: show }, 0.8)
      .to(s, { labels: 1, duration: 0.6 }, 8.6)
      .fromTo(q('[data-m="lead"]'), riseFrom, { ...rise, duration: 0.7 }, 8.9);
    q('[data-m="line"]').forEach((line, i) => tl.fromTo(line, riseFrom, { ...rise, duration: 0.6 }, 9.5 + i * 0.7));
    tl.fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.8 }, 12.4).fromTo(
      q('[data-m="act"]'),
      riseFrom,
      { ...rise, stagger: 0.08 },
      13,
    );
  });

  // Reduced motion skips the ninety years: the sky as it stands at Year 0.
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    scene.current = { year: YEAR_0, grid: 1, labels: 1 };
    clock.current!.textContent = `${YEAR_0} · Year 0`;
  }, []);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={NIGHT}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 pt-6 text-ink"
    >
      <div className="flex items-center justify-between gap-3">
        <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          YEAR 0 · WHERE THINGS STAND
        </span>
        <span data-m="clock" ref={clock} className="ml-auto font-mono text-[13px] text-other tabular-nums">
          {RADARS_SINCE}
        </span>
        <Sources sources={STAND_SOURCES} />
      </div>
      <Sky scene={scene} />
      <h1 data-m="lead" className="mt-2 text-[24px] leading-tight font-semibold">
        Ninety years loud. Nothing heard.
      </h1>
      <div className="mt-2.5 flex flex-col gap-1.5 text-[15px] leading-snug text-page-ink2">
        {LINES.map((line) => (
          <p key={line} data-m="line">
            {line}
          </p>
        ))}
        <p data-m="last" className="mt-2 text-[17px] leading-snug font-medium text-other">
          We know where our noise has gone. We can’t know who heard it.
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
          What you inherit
        </button>
      </div>
    </div>
  );
}
