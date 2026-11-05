import { useImperativeHandle, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { ParticleField, perimeterPoint, type Particle } from "@/lib/particles";

// A button with a life of its own, drawn on a canvas under it, from animaxxing's Get Animaxxed. Each mood is a
// personality: embers rise off it, small moons circle it, or a web of points drifts round it, threads forming and
// breaking. Each enters in its own way, wakes under the pointer or focus, and bursts in its own way when pressed. The
// canvas sits under the button, so the button needs a solid fill. Quieter since 2026-11-04, when the title got three.

const rnd = gsap.utils.random;
/** How far the canvas reaches past the button on each side, in px. */
const BLEED = 180;

export type Mood = "embers" | "orbit" | "web";

export type ReactorHandle = {
  /** The entrance, for the screen's own timeline. It reveals the button. */
  enter(): gsap.core.Timeline | undefined;
  /** The biggest burst, then quiet. The button itself is left to the screen. */
  blast(): void;
};

/** What a mood does: its entrance, its idle life, its answer to the pointer, and its burst. */
type Life = {
  enter(tl: gsap.core.Timeline): void;
  idle(dt: number): void;
  hover(on: boolean): void;
  blast(): void;
};

/** The outline, breathing outward and fading. */
const shockwave = (field: ParticleField, spread: number, duration: number, alpha: number) =>
  field.spawn({
    x: 0,
    y: 0,
    shape: "outline",
    size: 0,
    alpha,
    life: duration,
    update: (p) => (p.size = spread * gsap.parseEase("power2.out")(p.age / p.life)),
  });

/** Play: a few embers rise off it, and sparks spiral in to light it. */
function embers(field: ParticleField, el: HTMLElement): Life {
  const state = { rate: 4, rise: 40 };
  let lit = false;
  let due = 0;
  let pulseIn = 1.5;
  const erupt = (count: number, speed: [number, number]) => {
    for (let i = 0; i < count; i++) {
      const pt = perimeterPoint(field.box, field.radius, Math.random());
      const v = rnd(speed[0], speed[1]);
      field.spawn({
        x: pt.x,
        y: pt.y,
        vx: pt.nx * v,
        vy: pt.ny * v - 30,
        size: rnd(0.8, 1.8),
        life: rnd(0.4, 0.9),
        drag: 0.12,
        gravity: 200,
      });
    }
  };
  return {
    enter(tl) {
      const { box } = field;
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      for (let i = 0; i < 48; i++) {
        const orbit = { radius: rnd(120, 200), angle: rnd(0, Math.PI * 2) };
        const landing = { x: rnd(-box.w * 0.4, box.w * 0.4), y: rnd(-box.h * 0.4, box.h * 0.4) };
        const p = field.spawn({
          x: cx + Math.cos(orbit.angle) * orbit.radius,
          y: cy + Math.sin(orbit.angle) * orbit.radius,
          size: rnd(0.8, 1.6),
          alpha: 0,
          life: Infinity,
          fade: false,
          shape: "spark",
        });
        const turn = rnd(1, 2) * (Math.random() < 0.5 ? -1 : 1);
        tl.to(
          orbit,
          {
            radius: 0,
            angle: orbit.angle + turn,
            duration: rnd(0.6, 0.9),
            ease: "power3.in",
            onUpdate() {
              const k = 1 - orbit.radius / 200;
              const nx = cx + landing.x * k + Math.cos(orbit.angle) * orbit.radius;
              const ny = cy + landing.y * k + Math.sin(orbit.angle) * orbit.radius;
              // Velocity only points the spark's tail. The tween sets its place.
              p.vx = (nx - p.x) * 60;
              p.vy = (ny - p.y) * 60;
              p.x = nx;
              p.y = ny;
              p.alpha = Math.min(0.8, this.progress() * 2.5);
            },
            onComplete: () => Object.assign(p, { life: 0.12, age: 0, fade: true, vx: 0, vy: 0 }),
          },
          rnd(0, 0.2),
        );
      }
      tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, 0.82).call(
        () => {
          shockwave(field, 40, 0.6, 0.5);
          erupt(16, [80, 180]);
        },
        [],
        0.84,
      ).call(() => void (lit = true), [], 1.05);
    },
    idle(dt) {
      if (!lit) return;
      // Embers start inside the button, hidden behind it, and surface as they rise past its top edge.
      const { box } = field;
      due += state.rate * dt;
      while (due >= 1) {
        due -= 1;
        field.spawn({
          x: box.x + rnd(6, box.w - 6),
          y: box.y + rnd(2, box.h - 2),
          vx: rnd(-8, 8),
          vy: -rnd(state.rise * 0.6, state.rise * 1.3),
          size: rnd(0.8, 1.8),
          alpha: rnd(0.5, 0.9),
          life: rnd(1.2, 2),
          gravity: -10,
          wobble: rnd(4, 10),
          wobbleFreq: rnd(1.5, 3),
          phase: rnd(0, Math.PI * 2),
        });
      }
      pulseIn -= dt;
      if (pulseIn <= 0) {
        pulseIn = 3.2;
        shockwave(field, 18, 1.3, 0.18);
      }
    },
    hover(on) {
      gsap.to(state, { rate: on ? 22 : 4, rise: on ? 120 : 40, duration: on ? 0.3 : 0.9, overwrite: true });
      if (on) {
        shockwave(field, 24, 0.5, 0.4);
        erupt(14, [80, 180]);
      }
    },
    blast() {
      shockwave(field, 90, 0.6, 0.7);
      gsap.delayedCall(0.1, () => shockwave(field, 130, 0.7, 0.35));
      erupt(60, [260, 620]);
    },
  };
}

/** Universe: three small moons circle it, each at its own pace and distance, and now and then a star glints by it. */
function orbit(field: ParticleField, el: HTMLElement): Life {
  const state = { pace: 1, glintEvery: 2.6 };
  const moons = [
    { t: 0.05, speed: 0.045, out: 6, size: 1.6 },
    { t: 0.4, speed: 0.03, out: 11, size: 1.3 },
    { t: 0.75, speed: -0.02, out: 17, size: 1.1 },
  ].map((m) => ({ ...m, reach: 1, p: null as Particle | null }));
  let glintIn = 1.4;
  const place = (m: (typeof moons)[number], p: Particle) => {
    const pt = perimeterPoint(field.box, field.radius, m.t);
    p.x = pt.x + pt.nx * m.out * m.reach;
    p.y = pt.y + pt.ny * m.out * m.reach;
  };
  const glint = (alpha: number) => {
    const { box } = field;
    const pt = perimeterPoint(box, field.radius, Math.random());
    const away = rnd(8, 30);
    const top = rnd(2.5, 4.5);
    field.spawn({
      x: pt.x + pt.nx * away,
      y: pt.y + pt.ny * away,
      shape: "star",
      size: 0,
      alpha,
      life: rnd(0.8, 1.2),
      fade: false,
      rotation: rnd(0, Math.PI / 4),
      spin: 0.6,
      update: (p) => (p.size = top * Math.sin((Math.PI * p.age) / p.life)),
    });
  };
  return {
    enter(tl) {
      tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.1);
      moons.forEach((m, i) => {
        m.reach = 6;
        m.p = field.spawn({ x: 0, y: 0, size: m.size, alpha: 0, life: Infinity, fade: false, update: (p) => place(m, p) });
        tl.to(m, { reach: 1, duration: 1.4, ease: "expo.out" }, 0.15 + i * 0.12);
        tl.to(m.p, { alpha: 0.85, duration: 0.8, ease: "power1.out" }, 0.15 + i * 0.12);
      });
      tl.call(() => glint(0.8), [], 0.9);
    },
    idle(dt) {
      for (const m of moons) m.t += m.speed * state.pace * dt;
      glintIn -= dt;
      if (glintIn <= 0) {
        glintIn = state.glintEvery * rnd(0.6, 1.4);
        glint(0.55);
      }
    },
    hover(on) {
      gsap.to(state, { pace: on ? 3.5 : 1, glintEvery: on ? 0.5 : 2.6, duration: on ? 0.4 : 1.2, ease: "power2.out", overwrite: true });
      for (const m of moons) gsap.to(m, { reach: on ? 1.6 : 1, duration: 0.6, ease: "power3.out", overwrite: true });
      if (on) glint(0.9);
    },
    blast() {
      // The moons are let go, each along its path, and fly off.
      for (const m of moons) {
        const p = m.p;
        if (!p) continue;
        const pt = perimeterPoint(field.box, field.radius, m.t);
        const way = Math.sign(m.speed);
        const v = rnd(260, 420);
        Object.assign(p, { update: undefined, life: 0.9, age: 0, fade: true, drag: 0.3, vx: (-pt.ny * way + pt.nx * 0.4) * v, vy: (pt.nx * way + pt.ny * 0.4) * v });
      }
      shockwave(field, 80, 0.7, 0.5);
      for (let i = 0; i < 4; i++) gsap.delayedCall(i * 0.06, () => glint(1));
    },
  };
}

/** Simulation: points drift round it, threads forming and breaking between them, like minds finding each other. */
function web(field: ParticleField, el: HTMLElement): Life {
  const N = 9;
  const state = { reach: 62, alpha: 0.6, pull: 1 };
  let time = 0;
  const nodes = Array.from({ length: N }, (_, i) => ({
    angle: ((i + rnd(-0.3, 0.3)) / N) * Math.PI * 2,
    out: rnd(14, 24),
    freq: rnd(0.15, 0.35),
    phase: rnd(0, Math.PI * 2),
    reach: 1,
    p: null as Particle | null,
  }));
  const place = (n: (typeof nodes)[number], p: Particle) => {
    const { box } = field;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    // Mostly above and below, so the web keeps clear of the buttons beside it.
    const rx = (box.w / 2 + n.out * 0.3 * state.pull) * n.reach;
    const ry = (box.h / 2 + n.out * state.pull) * n.reach;
    const a = n.angle + Math.sin(time * n.freq + n.phase) * 0.12;
    p.x = cx + Math.cos(a) * rx + Math.cos(time * n.freq * 2 + n.phase) * 5;
    p.y = cy + Math.sin(a) * ry + Math.sin(time * n.freq * 1.7 + n.phase) * 5;
    p.link = state.reach;
    p.alpha = state.alpha;
  };
  return {
    enter(tl) {
      tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.25);
      for (const n of nodes) {
        n.reach = rnd(1.5, 2.2);
        n.p = field.spawn({ x: 0, y: 0, size: rnd(1, 1.6), alpha: 0, life: Infinity, fade: false, update: (p) => place(n, p) });
        tl.to(n, { reach: 1, duration: rnd(1.2, 1.8), ease: "power3.out" }, rnd(0, 0.4));
      }
      tl.fromTo(state, { alpha: 0 }, { alpha: 0.6, duration: 1, ease: "power1.out" }, 0.1);
    },
    idle(dt) {
      time += dt;
    },
    hover(on) {
      // The web draws in and lights up: more threads, brighter.
      gsap.to(state, { reach: on ? 96 : 62, alpha: on ? 1 : 0.6, pull: on ? 0.55 : 1, duration: on ? 0.5 : 1.1, ease: "power3.out", overwrite: true });
    },
    blast() {
      // Every point flies outward, its threads stretching until they break.
      const { box } = field;
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      for (const n of nodes) {
        const p = n.p;
        if (!p) continue;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const v = rnd(200, 380);
        Object.assign(p, { update: undefined, life: 1, age: 0, fade: true, drag: 0.4, vx: (dx / d) * v, vy: (dy / d) * v, alpha: 1 });
      }
      shockwave(field, 80, 0.7, 0.5);
    },
  };
}

const MOODS = { embers, orbit, web } satisfies Record<Mood, (field: ParticleField, el: HTMLElement) => Life>;

export function Reactor({
  ref,
  mood = "embers",
  ...props
}: Omit<React.ComponentProps<"button">, "ref"> & { ref?: React.Ref<ReactorHandle>; mood?: Mood }) {
  const scope = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const fx = useRef<ReactorHandle>(null);

  useGSAP(
    (_, safe) => {
      const el = button.current;
      if (!canvas.current || !el || prefersReducedMotion()) return;
      const field = new ParticleField(canvas.current, el, BLEED);
      const life = MOODS[mood](field, el);
      const idle = (dt: number) => life.idle(dt);
      let entrance: gsap.core.Timeline | undefined;
      let ready = false;

      const hover = safe!((on: boolean) => {
        if (!ready) return;
        gsap.to(el, { scale: on ? 1.03 : 1, duration: 0.3, ease: on ? "back.out(2)" : "power2.out", overwrite: "auto" });
        life.hover(on);
      });
      const on = () => hover(true);
      const off = () => hover(false);
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      el.addEventListener("focus", on);
      el.addEventListener("blur", off);

      fx.current = {
        enter: safe!(() => {
          field.sync();
          field.particles.length = 0;
          const tl = gsap.timeline({ onComplete: () => void (ready = true) });
          gsap.set(el, { autoAlpha: 0, scale: mood === "embers" ? 0.6 : 0.94, transformOrigin: "50% 50%" });
          field.addEmitter(idle);
          life.enter(tl);
          entrance = tl;
          return tl;
        }),
        blast: safe!(() => {
          // A press during the entrance lands it first, so nothing is left hanging.
          entrance?.progress(1).kill();
          ready = false;
          field.removeEmitter(idle);
          life.blast();
        }),
      };

      return () => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", off);
        el.removeEventListener("focus", on);
        el.removeEventListener("blur", off);
        field.destroy();
        fx.current = null;
      };
    },
    { scope },
  );

  useImperativeHandle(ref, () => ({
    enter: () => fx.current?.enter(),
    blast: () => fx.current?.blast(),
  }));

  return (
    <span ref={scope} className="relative isolate inline-flex">
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute -z-10 text-ink"
        style={{ left: -BLEED, top: -BLEED }}
      />
      <button ref={button} type="button" {...props} />
    </span>
  );
}
