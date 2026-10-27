import { useImperativeHandle, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { ParticleField, perimeterPoint } from "@/lib/particles";

// A button that is a reactor, from animaxxing's Get Animaxxed: sparks spiral in and collapse into it, it breathes
// embers while it waits, flares under the pointer or focus, and bursts when pressed. The canvas sits under the button,
// so the button needs a solid fill to hide the embers until they rise past its top edge.

const rnd = gsap.utils.random;
/** How far the canvas reaches past the button on each side, in px. */
const BLEED = 180;
/** Embers per second, idle and hovered. */
const EMBER_RATE = { idle: 9, hover: 70 };
/** How fast embers rise, px/s, idle and hovered. */
const EMBER_RISE = { idle: 55, hover: 220 };
/** Seconds between idle pulses. */
const PULSE_EVERY = 2.6;

export type ReactorHandle = {
  /** The entrance, for the screen's own timeline. It reveals the button. */
  enter(): gsap.core.Timeline | undefined;
  /** The biggest burst, then quiet. The button itself is left to the screen. */
  blast(): void;
};

export function Reactor({
  ref,
  ...props
}: Omit<React.ComponentProps<"button">, "ref"> & { ref?: React.Ref<ReactorHandle> }) {
  const scope = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const fx = useRef<ReactorHandle>(null);

  useGSAP(
    (_, safe) => {
      const el = button.current;
      if (!canvas.current || !el || prefersReducedMotion()) return;
      const field = new ParticleField(canvas.current, el, BLEED);
      const state = { rate: EMBER_RATE.idle, rise: EMBER_RISE.idle, hovering: false };
      let entrance: gsap.core.Timeline | undefined;
      let ready = false;
      let embers = 0;
      let pulseIn = 1.2;

      const ambient = (dt: number) => {
        const { box } = field;
        // Embers start inside the button, hidden behind it, and surface as they rise past its top edge.
        embers += state.rate * dt;
        while (embers >= 1) {
          embers -= 1;
          field.spawn({
            x: box.x + rnd(4, box.w - 4),
            y: box.y + rnd(2, box.h - 2),
            vx: rnd(-10, 10) * (state.hovering ? 3 : 1),
            vy: -rnd(state.rise * 0.6, state.rise * 1.3),
            size: rnd(1.2, 2.8),
            alpha: rnd(0.7, 1),
            life: rnd(1.1, 2.1),
            gravity: -12,
            wobble: rnd(6, 16),
            wobbleFreq: rnd(1.5, 4),
            phase: rnd(0, Math.PI * 2),
          });
        }
        // A slow heartbeat: the outline breathes outward and fades.
        pulseIn -= dt;
        if (pulseIn <= 0) {
          pulseIn = PULSE_EVERY;
          if (!state.hovering) shockwave(28, 1.3, 0.35);
        }
      };

      const shockwave = (spread: number, duration: number, alpha: number) =>
        field.spawn({
          x: 0,
          y: 0,
          shape: "outline",
          size: 0,
          alpha,
          life: duration,
          update: (p) => (p.size = spread * gsap.parseEase("power2.out")(p.age / p.life)),
        });

      const erupt = (count: number, speed: [number, number]) => {
        for (let i = 0; i < count; i++) {
          const pt = perimeterPoint(field.box, field.radius, Math.random());
          const v = rnd(speed[0], speed[1]);
          const jitter = rnd(-0.5, 0.5);
          const square = Math.random() < 0.35;
          field.spawn({
            x: pt.x,
            y: pt.y,
            vx: (pt.nx + jitter * pt.ny) * v,
            vy: (pt.ny - jitter * pt.nx) * v - 40,
            size: square ? rnd(1.5, 3) : rnd(1, 2.4),
            shape: square ? "square" : "dot",
            rotation: rnd(0, Math.PI),
            spin: rnd(-12, 12),
            life: rnd(0.5, 1.1),
            drag: 0.12,
            gravity: 320,
          });
        }
      };

      const hover = safe!((on: boolean) => {
        if (!ready) return;
        state.hovering = on;
        gsap.to(state, {
          rate: on ? EMBER_RATE.hover : EMBER_RATE.idle,
          rise: on ? EMBER_RISE.hover : EMBER_RISE.idle,
          duration: on ? 0.3 : 0.9,
          ease: on ? "power3.out" : "power2.inOut",
          overwrite: true,
        });
        gsap.to(el, { scale: on ? 1.04 : 1, duration: 0.3, ease: on ? "back.out(2)" : "power2.out", overwrite: "auto" });
        if (on) {
          shockwave(40, 0.5, 0.8);
          erupt(56, [160, 360]);
        }
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
          const { box } = field;
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          const tl = gsap.timeline({ onComplete: () => void (ready = true) });
          gsap.set(el, { autoAlpha: 0, scale: 0.5, transformOrigin: "50% 50%" });

          // Sparks spiral in from a wide ring and collapse into the button.
          for (let i = 0; i < 110; i++) {
            const orbit = { radius: rnd(200, 320), angle: rnd(0, Math.PI * 2) };
            const landing = { x: rnd(-box.w * 0.4, box.w * 0.4), y: rnd(-box.h * 0.4, box.h * 0.4) };
            const p = field.spawn({
              x: cx + Math.cos(orbit.angle) * orbit.radius,
              y: cy + Math.sin(orbit.angle) * orbit.radius,
              size: rnd(1, 2.4),
              alpha: 0,
              life: Infinity,
              fade: false,
              shape: "spark",
            });
            const turn = rnd(1.2, 2.4) * (Math.random() < 0.5 ? -1 : 1);
            tl.to(
              orbit,
              {
                radius: 0,
                angle: orbit.angle + turn,
                duration: rnd(0.6, 0.9),
                ease: "power3.in",
                onUpdate() {
                  const k = 1 - orbit.radius / 320;
                  const nx = cx + landing.x * k + Math.cos(orbit.angle) * orbit.radius;
                  const ny = cy + landing.y * k + Math.sin(orbit.angle) * orbit.radius;
                  // Velocity only points the spark's tail. The tween sets its place.
                  p.vx = (nx - p.x) * 60;
                  p.vy = (ny - p.y) * 60;
                  p.x = nx;
                  p.y = ny;
                  p.alpha = Math.min(1, this.progress() * 3);
                },
                onComplete: () => Object.assign(p, { life: 0.12, age: 0, fade: true, vx: 0, vy: 0 }),
              },
              rnd(0, 0.2),
            );
          }
          // Impact: the button pops in and the collapse rebounds outward.
          tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, 0.82)
            .call(
              () => {
                shockwave(60, 0.7, 0.9);
                erupt(44, [140, 320]);
              },
              [],
              0.84,
            )
            .call(() => shockwave(90, 0.9, 0.5), [], 0.96)
            .call(() => field.addEmitter(ambient), [], 1.05);
          entrance = tl;
          return tl;
        }),
        blast: safe!(() => {
          // A press during the entrance lands it first, so no spark is left hanging.
          entrance?.progress(1).kill();
          ready = false;
          field.removeEmitter(ambient);
          shockwave(120, 0.6, 1);
          gsap.delayedCall(0.08, () => shockwave(160, 0.7, 0.6));
          gsap.delayedCall(0.16, () => shockwave(200, 0.8, 0.3));
          erupt(140, [400, 1000]);
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
