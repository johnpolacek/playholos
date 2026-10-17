// Motion for the whole game: every element enters from a blank screen, rests, and leaves. The animaxxing skill's
// full treatment, on the gsap-nextjs lifecycle. Client only: import it from client components.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, SplitText);
// Screens share one choreography, and a screen may lack a part, such as dial tags.
gsap.config({ nullTargetWarn: false });

export { gsap, useGSAP, SplitText };

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fonts first, so a split measures the real face. Bounded, so a stalled font never holds the screen. */
export function fontsReady(ms = 800): Promise<unknown> {
  return Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ms))]);
}

/** An element's resting opacity: its SVG opacity attribute, or 1. */
export const rest = (_: number, el: Element) => Number(el.getAttribute("opacity") ?? 1);

/**
 * One screen's lifecycle. Every `[data-m]` inside `scope` starts hidden before paint. When `ready`, the fonts load
 * and `intro` builds the entrance. `leave(then)` plays every item out in reverse, then calls `then` once.
 */
export function useStage(
  scope: React.RefObject<HTMLElement | null>,
  intro: (q: (sel: string) => Element[], tl: gsap.core.Timeline) => void,
  ready = true,
) {
  const active = useRef<gsap.core.Timeline>(undefined);
  const leaving = useRef(false);

  const { contextSafe } = useGSAP(
    (_, safe) => {
      const root = scope.current;
      if (!root || !ready) return;
      const items = gsap.utils.toArray<Element>("[data-m]", root);
      if (prefersReducedMotion()) {
        gsap.set(items, { autoAlpha: rest });
        return;
      }
      gsap.set(items, { autoAlpha: 0 });
      let live = true;
      fontsReady().then(
        safe!(() => {
          if (!live) return;
          const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
          intro((sel) => gsap.utils.toArray<Element>(sel, root), tl);
          tl.eventCallback("onComplete", () => {
            gsap.set(items, { clearProps: "transform,willChange" });
          });
          active.current = tl;
        }),
      );
      return () => {
        live = false;
      };
    },
    { scope, dependencies: [ready] },
  );

  // Built when called, inside the hook's context, so its tweens are cleaned up with the screen.
  const leave = (then: () => void) =>
    contextSafe(() => {
      if (leaving.current) return;
      leaving.current = true;
      active.current?.kill();
      const root = scope.current;
      const items = root ? gsap.utils.toArray<Element>("[data-m]", root).reverse() : [];
      if (!items.length || prefersReducedMotion()) return then();
      gsap
        .timeline({ onComplete: then })
        .set(root, { pointerEvents: "none" })
        .to(items, {
          autoAlpha: 0,
          y: -8,
          duration: 0.22,
          ease: "power2.in",
          stagger: { amount: 0.3 },
        });
    })();

  return { leave };
}

/** Characters rise behind masks: for one display line that keeps kerning off. Returns the split's revert. */
export function charsRise(tl: gsap.core.Timeline, el: Element, at: number) {
  const split = SplitText.create(el, {
    type: "chars",
    mask: "chars",
    smartWrap: true,
    aria: "auto",
  });
  tl.set(el, { autoAlpha: 1 }, at).fromTo(
    split.chars,
    { yPercent: 115 },
    {
      yPercent: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.035,
      onComplete: () => split.revert(),
    },
    at,
  );
}

/** The workhorse entrance: up and in. */
export const rise = { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" };
export const riseFrom = { autoAlpha: 0, y: 16 };
