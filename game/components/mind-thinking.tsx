import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// While the Mind thinks: its words, and beside them points for all of us and our machines. Thoughts jump between the
// points while we wait. When the answer comes, or can't, the points gather into one, it flares, the words fade and
// the row folds away, and the answer comes in where it was. Chosen 2026-10-25 from explorations/mind-thinking.html,
// take 03.
const WORDS = "THE MIND IS THINKING";
/** The field's height. */
const H = 18;

type Point = { x: number; y: number; x0: number; y0: number; el: SVGCircleElement; glow: number; vis: number; base: number; near: Point[] };
type Line = { el: SVGLineElement; busy: boolean };
type Jump = { a: Point; b: Point; t0: number; line: Line; depth: number; landed: boolean };
type Field = { points: Point[]; width: number; firing: boolean; flare: number; stop(): void };

const set = (el: Element, attrs: Record<string, number>) => {
  for (const name in attrs) el.setAttribute(name, attrs[name].toFixed(2));
};
function add<K extends "circle" | "line">(svg: SVGSVGElement, tag: K, className: string) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  el.setAttribute("class", className);
  svg.append(el);
  return el;
}

/** Draws the field into `svg`, and keeps it moving a frame at a time until stopped. A still field is drawn once. */
function field(svg: SVGSVGElement, still: boolean): Field {
  svg.replaceChildren();
  const width = svg.clientWidth || 200;
  // Denser near the words, thinning out to the right.
  const points: Point[] = Array.from({ length: Math.max(24, Math.min(70, Math.round(width / 5.5))) }, () => {
    const x = 3 + Math.pow(Math.random(), 1.35) * (width - 6);
    const y = 2 + Math.random() * (H - 4);
    return { x, y, x0: x, y0: y, el: add(svg, "circle", "fill-you"), glow: 0, vis: still ? 1 : 0, base: 0.22 + 0.3 * (1 - x / width), near: [] };
  });
  const apart = (a: Point, b: Point) => Math.hypot(a.x0 - b.x0, a.y0 - b.y0);
  for (const a of points) a.near = points.filter((b) => b !== a).sort((b, c) => apart(a, b) - apart(a, c)).slice(0, 3);
  const lines: Line[] = Array.from({ length: 10 }, () => {
    const el = add(svg, "line", "stroke-you");
    set(el, { "stroke-width": 0.6, opacity: 0 });
    return { el, busy: false };
  });
  const flare = add(svg, "circle", "fill-ink");
  const jumps: Jump[] = [];
  let last = 0;

  // A thought jumps from `a` to one of its three nearest, and half the time on again from there, up to three times.
  const jump = (a: Point, time: number, depth: number) => {
    const line = lines.find((l) => !l.busy);
    if (!line) return;
    line.busy = true;
    a.glow = 1;
    jumps.push({ a, b: a.near[Math.floor(Math.random() * a.near.length)], t0: time, line, depth, landed: false });
  };
  const draw = (time: number, ms: number) => {
    if (f.firing && time - last > 0.13) {
      last = time;
      jump(points[Math.floor(Math.random() * points.length)], time, 0);
    }
    for (let k = jumps.length - 1; k >= 0; k--) {
      const j = jumps[k];
      const u = (time - j.t0) / 0.32;
      const reach = Math.min(1, u);
      set(j.line.el, { x1: j.a.x, y1: j.a.y, x2: j.a.x + (j.b.x - j.a.x) * reach, y2: j.a.y + (j.b.y - j.a.y) * reach, opacity: u < 1 ? 0.7 : Math.max(0, 0.7 - (u - 1) * 1.4) });
      if (u >= 1 && !j.landed) {
        j.landed = true;
        j.b.glow = 1;
        if (f.firing && j.depth < 3 && Math.random() < 0.5) jump(j.b, time, j.depth + 1);
      }
      if (u > 1.5) {
        j.line.busy = false;
        set(j.line.el, { opacity: 0 });
        jumps.splice(k, 1);
      }
    }
    const fade = Math.pow(0.9, ms / 16.7);
    for (const p of points) {
      p.glow *= fade;
      set(p.el, { cx: p.x, cy: p.y, r: (0.85 + p.glow * 0.9) * p.vis, opacity: (p.base + p.glow * 0.7) * p.vis });
    }
    set(flare, { cx: 0, cy: H / 2, r: f.flare * 3, opacity: Math.min(1, f.flare * 2) });
  };
  const f: Field = { points, width, firing: false, flare: 0, stop: () => gsap.ticker.remove(draw) };
  draw(0, 16.7);
  if (!still) gsap.ticker.add(draw);
  return f;
}

/** Whether the thinking row is up: from when the Mind starts thinking until the row has left. */
export function useThinking(on: boolean) {
  const [here, setHere] = useState(on);
  // Back as soon as it thinks again, even while leaving.
  if (on && !here) setHere(true);
  return { here, gone: () => setHere(false) };
}

export function MindThinking({ on, gone }: { on: boolean; gone(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const live = useRef<Field>(undefined);
  const run = useRef<gsap.core.Timeline>(undefined);

  // The field, once the row is laid out, so it fills the row's width.
  useGSAP(
    () => {
      const f = (live.current = field(root.current!.querySelector("svg")!, prefersReducedMotion()));
      return () => {
        f.stop();
        live.current = undefined;
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const row = root.current!;
      const words = row.querySelector("[data-words]")!;
      const f = live.current!;
      if (prefersReducedMotion()) {
        if (!on) gone();
        return;
      }
      run.current?.kill();
      const tl = (run.current = gsap.timeline());
      if (on) {
        gsap.set(row, { clearProps: "height,marginTop,overflow" });
        gsap.set(words, { opacity: 0 });
        f.points.forEach((p) => Object.assign(p, { x: p.x0, y: p.y0, vis: 0 }));
        tl.to(words, { opacity: 0.85, duration: 0.4, ease: "power2.out" }, 0)
          .to(f.points, { vis: 1, duration: 0.3, ease: "back.out(3)", stagger: { each: 0.012, from: "random" } }, 0.1)
          .call(() => void (f.firing = true))
          .to(words, { opacity: 0.55, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      } else {
        f.firing = false;
        // Out over the gap above, so what follows doesn't jump when the row goes.
        const gap = parseFloat(getComputedStyle(row.parentElement!).rowGap) || 0;
        tl.eventCallback("onComplete", gone);
        tl.to(f.points, { x: 0, y: H / 2, duration: (i: number) => 0.25 + (f.points[i].x0 / f.width) * 0.25, ease: "power3.in" }, 0)
          .to(f, { flare: 1, duration: 0.12, ease: "power2.out" }, 0.48)
          .to(f.points, { vis: 0, duration: 0.1 }, 0.5)
          .to(f, { flare: 0, duration: 0.25, ease: "power2.in" }, 0.6)
          .to(words, { opacity: 0, duration: 0.25 }, 0.38)
          .set(row, { overflow: "hidden" }, 0.55)
          .to(row, { height: 0, marginTop: -gap, duration: 0.3, ease: "power2.inOut" }, 0.55);
      }
    },
    { scope: root, dependencies: [on] },
  );

  return (
    <div ref={root} className="mt-2 flex w-[86%] items-center gap-2 self-start">
      <span className="sr-only">The Mind is thinking</span>
      <span aria-hidden data-words className="font-mono text-[9.5px] tracking-[.1em] whitespace-pre text-you">
        {WORDS}
      </span>
      <svg aria-hidden className="h-[18px] min-w-0 flex-1 overflow-visible" />
    </div>
  );
}
