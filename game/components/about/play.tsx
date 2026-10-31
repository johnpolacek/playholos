import { useImperativeHandle, useRef } from "react";
import { AboutLink } from "@/components/about/motion";
import { fontsReady, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { ParticleField, perimeterPoint } from "@/lib/particles";

// The about pages' way back to the game, in their top bar: a pill that Sol circles in cyan, as it circles the core in
// the corner's mark, counterclockwise and trailing its wake. Sparks gather onto the outline as the bar drops in. Under
// the pointer or keyboard focus it swells, Sol laps four times as fast and throws off sparks, and the outline glints
// more often. Pressed, it squashes and ripples from where it was pressed. Played, it bursts and Sol flies off its
// track. From animaxxing's marquee and press feedback, with one runner. The canvas sits over the pill.

const rnd = gsap.utils.random;
/** How far the canvas reaches past the pill on each side, in px. */
const BLEED = 120;
/** Seconds for one lap of the outline, at rest. Under the pointer it laps four times as fast, as the mark's Sol. */
const LAP = 2.8;
const RUSH = 4;
/** Where Sol starts: the top right corner, as a share of the outline clockwise from the top left. */
const SOL_AT = 0.27;
/** How long each dot of Sol's wake lasts, in seconds. The faster the lap, the longer the wake. */
const WAKE = 0.3;
/** Sparks per second off Sol while it races. */
const SHED = 70;
/** Seconds between glints on the outline, at rest. Racing, three times as often. */
const GLINT_EVERY: [number, number] = [1.2, 2.8];
/** The pill's scale under the pointer, and pressed. */
const SWELL = 1.08;
const SQUASH = 0.9;
/** The ripple's ink, at its start. */
const INK = 0.3;

export type PlayHandle = {
  /** The burst, as the page leaves for the game. The pill itself fades with the bar. */
  blast(): void;
};

export function Play({
  ref,
  delay = 0,
}: {
  ref?: React.Ref<PlayHandle>;
  delay?: number;
}) {
  const scope = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fx = useRef<PlayHandle>(null);

  useGSAP(
    (_, safe) => {
      const el = scope.current?.querySelector("a");
      if (!canvas.current || !el || prefersReducedMotion()) return;
      const field = new ParticleField(canvas.current, el, BLEED);
      const state = { rush: 1, hot: false, pressed: false };
      let sol = SOL_AT;
      let shed = 0;
      let glintIn = 1;
      let entrance: gsap.core.Timeline | undefined;
      let ready = false;
      let back: gsap.core.Tween | undefined;
      const ripples = new Set<HTMLElement>();

      const ambient = (dt: number) => {
        const { box, radius } = field;
        // Counterclockwise, as in the mark. Each frame leaves a dot that fades and shrinks: Sol's wake.
        sol = (((sol - (state.rush * dt) / LAP) % 1) + 1) % 1;
        const pt = perimeterPoint(box, radius, sol);
        field.spawn({ x: pt.x, y: pt.y, size: 2.2, life: WAKE, shrink: true });
        if (state.hot) {
          // Racing, Sol throws sparks off behind it and outward.
          shed += SHED * dt;
          while (shed >= 1) {
            shed -= 1;
            const v = rnd(60, 200);
            const back = rnd(0.2, 1);
            field.spawn({
              x: pt.x,
              y: pt.y,
              vx: (pt.nx - back * pt.ny) * v,
              vy: (pt.ny + back * pt.nx) * v,
              size: rnd(0.8, 1.6),
              alpha: rnd(0.6, 1),
              life: rnd(0.3, 0.7),
              drag: 0.08,
              gravity: 90,
              shape: "spark",
            });
          }
        }
        glintIn -= dt;
        if (glintIn <= 0) {
          glintIn = rnd(...GLINT_EVERY) / (state.hot ? 3 : 1);
          glint(perimeterPoint(box, radius, Math.random()));
        }
      };

      const glint = (pt: { x: number; y: number }) => {
        const size = rnd(3.5, 7);
        field.spawn({
          x: pt.x,
          y: pt.y,
          size,
          shape: "star",
          rotation: rnd(0, Math.PI),
          spin: rnd(-1.5, 1.5),
          life: rnd(0.45, 0.8),
          fade: false,
          update: (p) => {
            const k = Math.sin((p.age / p.life) * Math.PI);
            p.size = size * k;
            p.alpha = k;
          },
        });
      };

      // Sparks straight out from the whole outline, evenly spaced.
      const flash = (
        count: number,
        speed: [number, number],
        life: [number, number],
      ) => {
        const { box, radius } = field;
        for (let i = 0; i < count; i++) {
          const pt = perimeterPoint(box, radius, i / count + rnd(-0.01, 0.01));
          const v = rnd(...speed);
          field.spawn({
            x: pt.x,
            y: pt.y,
            vx: pt.nx * v,
            vy: pt.ny * v,
            size: rnd(1, 2),
            life: rnd(...life),
            drag: 0.04,
            shape: "spark",
          });
        }
      };

      const ring = (spread: number, duration: number, alpha: number) =>
        field.spawn({
          x: 0,
          y: 0,
          shape: "outline",
          size: 0,
          alpha,
          life: duration,
          update: (p) =>
            (p.size = spread * gsap.parseEase("power2.out")(p.age / p.life)),
        });

      const idle = () => {
        ready = true;
        field.addEmitter(ambient);
      };

      // One owner for the pill's scale: the entrance, the swell, the squash, and the spring back.
      const scaleTo = (scale: number, vars: gsap.TweenVars) =>
        gsap.to(el, { scale, overwrite: "auto", ...vars });
      const rest = () => (state.hot ? SWELL : 1);

      const heat = safe!((on: boolean) => {
        if (!ready || state.hot === on) return;
        state.hot = on;
        gsap.to(state, {
          rush: on ? RUSH : 1,
          duration: on ? 0.35 : 0.8,
          ease: on ? "power3.out" : "power2.inOut",
          overwrite: true,
        });
        if (!state.pressed)
          scaleTo(rest(), {
            duration: 0.3,
            ease: on ? "back.out(2)" : "power2.out",
          });
        if (on) {
          ring(18, 0.5, 0.7);
          flash(28, [90, 220], [0.3, 0.6]);
        }
      });

      // The ink spreads from the press, far enough to reach the farthest corner.
      const ripple = (x: number, y: number) => {
        const reach = Math.hypot(
          Math.max(x, el.offsetWidth - x),
          Math.max(y, el.offsetHeight - y),
        );
        const drop = document.createElement("span");
        drop.setAttribute("aria-hidden", "true");
        Object.assign(drop.style, {
          position: "absolute",
          left: `${x - reach}px`,
          top: `${y - reach}px`,
          width: `${reach * 2}px`,
          height: `${reach * 2}px`,
          borderRadius: "50%",
          background: "currentColor",
          pointerEvents: "none",
        });
        el.append(drop);
        ripples.add(drop);
        gsap.fromTo(
          drop,
          { scale: 0, opacity: INK },
          {
            scale: 1,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
              drop.remove();
              ripples.delete(drop);
            },
          },
        );
      };
      const press = safe!((x: number, y: number) => {
        if (!ready || state.pressed) return;
        state.pressed = true;
        scaleTo(SQUASH, { duration: 0.12, ease: "power2.out" });
        ripple(x, y);
      });
      const release = safe!(() => {
        if (!state.pressed) return;
        state.pressed = false;
        scaleTo(rest(), { duration: 0.5, ease: "elastic.out(1, 0.45)" });
      });

      // Hover is for a mouse or pen. A touch only presses. Focus heats the pill only from the keyboard.
      const listen = <K extends keyof HTMLElementEventMap>(
        type: K,
        fn: (e: HTMLElementEventMap[K]) => void,
      ) => {
        el.addEventListener(type, fn);
        return () => el.removeEventListener(type, fn);
      };
      const unlisten = [
        listen("pointerenter", (e) => e.pointerType !== "touch" && heat(true)),
        listen("pointerleave", () => {
          release();
          if (!el.matches(":focus-visible")) heat(false);
        }),
        listen("focus", () => el.matches(":focus-visible") && heat(true)),
        listen("blur", () => {
          release();
          heat(false);
        }),
        listen("pointerdown", (e) => {
          if (e.button !== 0) return;
          const box = el.getBoundingClientRect();
          // Measured on the pill as laid out, since it may be swollen.
          const k = el.offsetWidth / box.width;
          press((e.clientX - box.left) * k, (e.clientY - box.top) * k);
        }),
        listen("pointerup", release),
        listen("pointercancel", release),
        listen("keydown", (e) => {
          if (e.key === "Enter" && !e.repeat)
            press(el.offsetWidth / 2, el.offsetHeight / 2);
        }),
        listen("keyup", release),
      ];

      // The label's face changes the pill's width, so the field measures it again when it does.
      const resize = new ResizeObserver(() => field.sync());
      resize.observe(el);

      fx.current = {
        blast: safe!(() => {
          // A press during the entrance lands it first, so no spark is left hanging.
          entrance?.progress(1);
          field.removeEmitter(ambient);
          ready = false;
          back?.kill();
          const { box, radius } = field;
          ring(22, 0.45, 1);
          gsap.delayedCall(0.06, () => ring(40, 0.5, 0.6));
          gsap.delayedCall(0.12, () => ring(62, 0.55, 0.3));
          flash(70, [260, 700], [0.3, 0.55]);
          for (let i = 0; i < 8; i++)
            glint(perimeterPoint(box, radius, Math.random()));
          // Sol leaves its track: a bright streak flung along its way round.
          const pt = perimeterPoint(box, radius, sol);
          const fling = { vx: pt.ny * 900, vy: -pt.nx * 900 };
          field.spawn({
            x: pt.x,
            y: pt.y,
            ...fling,
            size: 2.4,
            life: 0.5,
            drag: 0.2,
            shape: "spark",
          });
          scaleTo(1.14, { duration: 0.12, ease: "power2.out" });
          scaleTo(1, {
            duration: 0.4,
            ease: "power2.inOut",
            delay: 0.12,
            overwrite: false,
          });
          // Should the page stay, as when back cuts the leaving short, Sol takes up its lap again.
          back = gsap.delayedCall(1.2, () => {
            state.hot = el.matches(":hover, :focus-visible");
            state.rush = state.hot ? RUSH : 1;
            idle();
          });
        }),
      };

      // The entrance, once the label's face is in: sparks from all around land on the outline, the pill pops in with a
      // flash, and Sol sets off.
      gsap.set(el, { autoAlpha: 0 });
      let live = true;
      fontsReady().then(
        safe!(() => {
          if (!live) return;
          field.sync();
          const { box, radius } = field;
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          const tl = gsap.timeline({ delay });
          const pop = {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          };
          tl.fromTo(el, { autoAlpha: 0, scale: 0.5 }, pop, 0.45);
          const count = 40;
          for (let i = 0; i < count; i++) {
            const to = perimeterPoint(box, radius, i / count);
            const angle = rnd(0, Math.PI * 2);
            const dist = rnd(50, 110);
            const p = field.spawn({
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              size: rnd(1, 2),
              alpha: 0,
              life: Infinity,
              fade: false,
            });
            tl.to(
              p,
              {
                x: to.x,
                y: to.y,
                alpha: 1,
                duration: rnd(0.45, 0.7),
                ease: "power3.inOut",
                onComplete: () =>
                  Object.assign(p, {
                    life: 0.4,
                    age: 0,
                    fade: true,
                    shrink: true,
                  }),
              },
              rnd(0, 0.2),
            );
          }
          tl.call(
            () => {
              ring(16, 0.5, 0.8);
              flash(30, [60, 160], [0.3, 0.6]);
              idle();
            },
            [],
            0.8,
          );
          entrance = tl;
        }),
      );

      return () => {
        live = false;
        unlisten.forEach((off) => off());
        resize.disconnect();
        ripples.forEach((drop) => drop.remove());
        field.destroy();
        fx.current = null;
      };
    },
    { scope },
  );

  useImperativeHandle(ref, () => ({ blast: () => fx.current?.blast() }));

  return (
    <span ref={scope} className="relative inline-flex sm:ml-1">
      <AboutLink
        data-a-bar
        href="/"
        onLeave={() => fx.current?.blast()}
        className="relative overflow-clip rounded-full border border-ink/70 px-3 py-1.5 text-ink transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-ink hover:text-paper"
      >
        PLAY
      </AboutLink>
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute text-you motion-reduce:hidden"
        style={{ left: -BLEED, top: -BLEED }}
      />
    </span>
  );
}
