import { useImperativeHandle, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { type Particle, ParticleField, perimeterPoint } from "@/lib/particles";

// Begin on Meeting the Mind: a button that is every mind on Earth, linked. Lights scattered across the whole screen
// fade in, thread themselves to their neighbors, and gather into a band around the button, which lights as they land.
// While it waits the band turns, threads run in to the button, a light now and then runs one, and a ring closes on it
// like a breath in. Under the pointer or focus the band draws in close and reaches farther. Pressed, every light falls
// into it and it bursts: sparks across the screen, and the minds flung back out, their threads stretching and
// snapping. The canvas covers the nearest positioned ancestor, under the screen's words, so nothing between the two
// may be positioned, and the button needs a solid fill to hide the threads that meet behind it.

const rnd = gsap.utils.random;
/** How many minds band the button. */
const MINDS = 72;
/** How far the band stands off the button's edge, px: nearest and farthest. */
const BAND: [number, number] = [16, 130];
/** How much of its distance the band keeps above the button. */
const ABOVE = 0.6;
/** How far a mind threads itself to another, px, at rest and under the pointer. */
const REACH = { idle: 78, hover: 120 };
/** How far threads run in to the button's center, past its edge. */
const HUB = 120;
/** How much of the band's distance it keeps under the pointer. */
const DRAW_IN = 0.6;
/** Seconds between lights running a thread in, at rest. Under the pointer, four times as often. */
const RUN_EVERY: [number, number] = [0.3, 0.9];
/** Seconds between breaths in. */
const BREATH = 3.2;

export type MindsHandle = {
  /** The entrance, for the screen's own timeline. It reveals the button. */
  enter(): gsap.core.Timeline | undefined;
  /** Every mind falls in and bursts out, and the canvas fades. The button itself is left to the screen. */
  blast(): void;
};

type Mind = {
  /** Where on the band, as a share of the button's outline, and how fast it turns, shares per second. */
  t: number;
  speed: number;
  off: number;
  phase: number;
  /** Where it starts, out on the screen, and how far it has come to the band, then fallen into the button, 0 to 1. */
  from: { x: number; y: number };
  pull: number;
  fall: number;
  p: Particle;
};

export function Minds({
  ref,
  ...props
}: Omit<React.ComponentProps<"button">, "ref"> & { ref?: React.Ref<MindsHandle> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const fx = useRef<MindsHandle>(null);

  useGSAP((_, safe) => {
    const el = button.current;
    const frame = canvas.current?.offsetParent as HTMLElement | null;
    if (!canvas.current || !el || !frame || prefersReducedMotion()) return;
    const field = new ParticleField(canvas.current, el, 0, frame);
    const state = { band: 1, reach: REACH.idle, hovering: false };
    const minds: Mind[] = [];
    let hub: Particle | undefined;
    let entrance: gsap.core.Timeline | undefined;
    let ready = false;
    let clock = 0;
    let runIn = 1;
    let breathIn = 1;

    const center = () => ({ x: field.box.x + field.box.w / 2, y: field.box.y + field.box.h / 2 });

    // Each mind's place: out on the screen, on its way to the band, on the band, or falling into the button.
    const place = (m: Mind) => {
      const { box, radius } = field;
      const pt = perimeterPoint(box, radius, m.t + clock * m.speed);
      // Above the button the band keeps closer, clear of the words.
      const off = m.off * (pt.ny < 0 ? ABOVE : 1) * state.band + Math.sin(clock * 0.9 + m.phase) * 5;
      const x = m.from.x + (pt.x + pt.nx * off - m.from.x) * m.pull;
      const y = m.from.y + (pt.y + pt.ny * off - m.from.y) * m.pull;
      const c = center();
      m.p.x = x + (c.x - x) * m.fall;
      m.p.y = y + (c.y - y) * m.fall;
      m.p.link = state.reach;
    };

    // A light runs a thread in from a mind near enough to have one.
    const run = () => {
      const c = center();
      const near = minds.filter((m) => Math.hypot(m.p.x - c.x, m.p.y - c.y) < field.box.h / 2 + HUB * 0.8);
      const m = near[Math.floor(Math.random() * near.length)];
      if (!m) return;
      const { x, y } = m.p;
      const ease = gsap.parseEase("power2.in");
      field.spawn({
        x,
        y,
        size: 1.8,
        life: rnd(0.45, 0.7),
        fade: false,
        update: (p) => {
          const k = ease(p.age / p.life);
          const to = center();
          p.x = x + (to.x - x) * k;
          p.y = y + (to.y - y) * k;
          p.alpha = Math.sin(Math.min(1, (p.age / p.life) * 1.4) * Math.PI * 0.5);
        },
      });
    };

    // A ring around the button's outline, from one spread to another, brightening or fading as it goes.
    const ring = (from: number, to: number, duration: number, alpha: number, closing = false) => {
      const ease = gsap.parseEase(closing ? "power2.in" : "power2.out");
      return field.spawn({
        x: 0,
        y: 0,
        shape: "outline",
        size: from,
        alpha,
        life: duration,
        fade: !closing,
        update: (p) => {
          const k = ease(p.age / p.life);
          p.size = from + (to - from) * k;
          if (closing) p.alpha = alpha * k;
        },
      });
    };

    // Sparks straight out from the whole outline, evenly spaced.
    const flash = (count: number, speed: [number, number], life: [number, number]) => {
      for (let i = 0; i < count; i++) {
        const pt = perimeterPoint(field.box, field.radius, i / count + rnd(-0.01, 0.01));
        const v = rnd(...speed);
        field.spawn({
          x: pt.x,
          y: pt.y,
          vx: pt.nx * v,
          vy: pt.ny * v,
          size: rnd(1, 2),
          life: rnd(...life),
          drag: 0.05,
          shape: "spark",
        });
      }
    };

    const tick = (dt: number) => {
      clock += dt;
      if (!ready) return;
      runIn -= dt * (state.hovering ? 4 : 1);
      if (runIn <= 0) {
        runIn = rnd(...RUN_EVERY);
        run();
      }
      breathIn -= dt;
      if (breathIn <= 0) {
        breathIn = BREATH;
        ring(34, 0, 1.1, state.hovering ? 0.8 : 0.45, true);
      }
    };

    const hover = safe!((on: boolean) => {
      if (!ready) return;
      state.hovering = on;
      gsap.to(state, {
        band: on ? DRAW_IN : 1,
        reach: on ? REACH.hover : REACH.idle,
        duration: on ? 0.5 : 1,
        ease: on ? "power3.out" : "power2.inOut",
        overwrite: true,
      });
      gsap.to(el, { scale: on ? 1.03 : 1, duration: 0.3, ease: on ? "back.out(2)" : "power2.out", overwrite: "auto" });
      if (on) ring(44, 0, 0.5, 0.9, true);
    });
    const on = () => hover(true);
    const off = () => hover(false);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);

    // The button moves in the frame as the words scroll, and the frame resizes with the window.
    let queued = 0;
    const resync = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        field.sync();
      });
    };
    frame.addEventListener("scroll", resync, { capture: true, passive: true });
    const sizes = new ResizeObserver(resync);
    sizes.observe(frame);

    fx.current = {
      enter: safe!(() => {
        field.sync();
        field.particles.length = 0;
        minds.length = 0;
        const { offsetWidth: w, offsetHeight: h } = frame;
        const tl = gsap.timeline({ onComplete: () => void (ready = true) });
        gsap.set(el, { autoAlpha: 0, scale: 0.88, transformOrigin: "50% 50%" });
        field.addEmitter(tick);

        // The button's center threads to the minds nearest it. It draws nothing itself: the button hides it.
        const c = center();
        hub = field.spawn({
          ...c,
          size: 0,
          alpha: 0,
          life: Infinity,
          fade: false,
          link: field.box.h / 2 + HUB,
          update: (p) => Object.assign(p, center()),
        });

        // Every mind starts somewhere on the screen, lights, and comes to its place on the band.
        for (let i = 0; i < MINDS; i++) {
          const from = { x: rnd(0, w), y: rnd(0, h) };
          const m: Mind = {
            t: i / MINDS + rnd(-0.004, 0.004),
            speed: rnd(0.004, 0.012),
            off: BAND[0] + (BAND[1] - BAND[0]) * Math.random() ** 1.5,
            phase: rnd(0, Math.PI * 2),
            from,
            pull: 0,
            fall: 0,
            p: field.spawn({ ...from, size: rnd(1.1, 2.5), alpha: 0, life: Infinity, fade: false }),
          };
          m.p.update = () => place(m);
          minds.push(m);
          tl.to(m.p, { alpha: rnd(0.5, 0.95), duration: 0.5, ease: "power1.out" }, rnd(0, 0.5)).to(
            m,
            { pull: 1, duration: rnd(1, 1.4), ease: "power3.inOut" },
            rnd(0.35, 0.6),
          );
        }

        // The last of them land and the button lights, with a flash out from its edge.
        tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, 1.55)
          .to(hub, { alpha: 0.9, duration: 0.6 }, 1.55)
          .call(
            () => {
              ring(0, 70, 0.7, 0.9);
              flash(64, [160, 360], [0.35, 0.7]);
            },
            [],
            1.6,
          );
        entrance = tl;
        return tl;
      }),
      blast: safe!(() => {
        // A press during the entrance lands it first, so no mind is left halfway.
        entrance?.progress(1).kill();
        ready = false;
        state.hovering = false;
        for (const m of minds) gsap.to(m, { fall: 1, duration: rnd(0.22, 0.4), ease: "power3.in" });
        gsap
          .timeline()
          .to(el, { scale: 0.95, duration: 0.3, ease: "power2.in", overwrite: "auto" })
          .to(el, { scale: 1.06, duration: 0.4, ease: "back.out(3)" });
        gsap.delayedCall(0.4, () => {
          for (const m of minds) m.p.life = 0;
          if (hub) hub.life = 0;
          field.removeEmitter(tick);
          ring(0, 140, 0.7, 1);
          gsap.delayedCall(0.08, () => ring(0, 260, 0.9, 0.6));
          gsap.delayedCall(0.16, () => ring(0, 420, 1.1, 0.3));
          flash(180, [500, 1400], [0.5, 1]);
          // Every mind flung back out across the screen, threaded until they fly too far apart.
          for (const m of minds) {
            const pt = perimeterPoint(field.box, field.radius, m.t + clock * m.speed);
            const v = rnd(140, 560);
            const jitter = rnd(-0.4, 0.4);
            field.spawn({
              x: pt.x,
              y: pt.y,
              vx: (pt.nx + jitter * pt.ny) * v,
              vy: (pt.ny - jitter * pt.nx) * v,
              size: m.p.size,
              alpha: m.p.alpha,
              life: rnd(0.9, 1.5),
              drag: 0.25,
              link: REACH.hover,
            });
          }
        });
        gsap.to(canvas.current, { autoAlpha: 0, duration: 0.5, delay: 0.6, ease: "power1.in" });
      }),
    };

    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focus", on);
      el.removeEventListener("blur", off);
      frame.removeEventListener("scroll", resync, { capture: true });
      sizes.disconnect();
      cancelAnimationFrame(queued);
      field.destroy();
      fx.current = null;
    };
  });

  useImperativeHandle(ref, () => ({
    enter: () => fx.current?.enter(),
    blast: () => fx.current?.blast(),
  }));

  return (
    <>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute top-0 left-0 -z-10 text-you" />
      <button ref={button} type="button" {...props} />
    </>
  );
}
