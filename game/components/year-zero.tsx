import { useRef } from "react";
import { createPortal } from "react-dom";
import { YEAR_0 } from "@/lib/game/clock";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// The tap on Begin: 2040 counts down to 0 and becomes Year 0. The first time, over the whole screen, then into the
// top bar where the clock now runs. After that, a quick roll over the top bar's own year. A tap finishes it.

const SEEN = "holos:year0";

/** Whether this browser has seen the full moment. Storage can be missing, so a miss means a first time. */
export function seenYearZero() {
  try {
    return localStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN, "1");
  } catch {}
}

function Moment({ full, onDone }: { full: boolean; onDone(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>(undefined);

  useGSAP(
    () => {
      const el = root.current!;
      const phone = document.getElementById("phone")!.getBoundingClientRect();
      const bar = document.querySelector("[data-year]")?.getBoundingClientRect();
      const num = el.querySelector<HTMLElement>('[data-y="num"]')!;
      const word = el.querySelector('[data-y="word"]');
      const label = el.querySelector<HTMLElement>('[data-y="label"]')!;
      const count = { v: YEAR_0 };
      const show = () => (num.textContent = String(Math.round(count.v)));
      if (prefersReducedMotion() || !bar) return onDone();

      if (!full) {
        // Over the top bar's year, in its own size, on its own background.
        gsap.set(label, {
          left: bar.right - phone.left,
          top: bar.top - phone.top,
          height: bar.height,
          minWidth: bar.width + 8,
          xPercent: -100,
        });
        tl.current = gsap
          .timeline({ onComplete: onDone })
          .to(count, { v: 0, duration: 1.1, ease: "power3.in", onUpdate: show })
          .fromTo(word, { autoAlpha: 0, x: 6 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 0.9)
          .to(label, { autoAlpha: 0, duration: 0.3 }, 1.6);
        return;
      }

      markSeen();
      tl.current = gsap
        .timeline({ onComplete: onDone })
        .fromTo('[data-y="dim"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(
          label,
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" },
          0.1,
        )
        // Faster and faster, and blurred at its fastest.
        .to(count, { v: 0, duration: 2.2, ease: "power3.in", onUpdate: show }, 0.7)
        .to(num, { filter: "blur(3px)", duration: 1.6, ease: "power2.in" }, 0.9)
        .to(num, { filter: "blur(0px)", duration: 0.25 }, 2.9)
        .fromTo(word, { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" }, 2.95)
        // The pair comes to the middle as the word arrives.
        .to(label, { x: () => word!.getBoundingClientRect().width / 2, duration: 0.5, ease: "power3.out" }, 2.95)
        .fromTo(
          '[data-y="pulse"]',
          { autoAlpha: 0.8, scale: 0.4 },
          { autoAlpha: 0, scale: 2.4, duration: 1.1, ease: "power2.out", immediateRender: false },
          3.0,
        )
        .addLabel("settle", 3.9)
        // Into the top bar, where the clock now runs.
        .add(() => {
          const from = label.getBoundingClientRect();
          gsap.to(label, {
            x: `+=${bar.right - from.right}`,
            y: bar.top + bar.height / 2 - (from.top + from.height / 2),
            scale: bar.height / from.height,
            transformOrigin: "100% 50%",
            duration: 0.7,
            ease: "power3.inOut",
          });
        }, "settle")
        .to('[data-y="dim"]', { autoAlpha: 0, duration: 0.6 }, "settle+=0.2")
        .to(label, { autoAlpha: 0, duration: 0.2 }, "settle+=0.65");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      onPointerDown={() => tl.current?.progress(1)}
      className={`absolute inset-0 z-50 ${full ? "" : "pointer-events-none"}`}
    >
      {full && <div data-y="dim" className="invisible absolute inset-0 bg-paper/85 backdrop-blur-sm" />}
      <div
        data-y="label"
        className={
          full
            ? "invisible absolute inset-0 m-auto flex h-fit w-fit items-baseline text-[clamp(64px,16vw,160px)] leading-none font-semibold tracking-[-.02em] tabular-nums"
            : "absolute flex items-center justify-end gap-1 bg-paper pl-2 text-[15px] font-medium tabular-nums"
        }
      >
        {/* Full, the word stands left of the number, so the number counts down in the middle. */}
        <span data-y="word" className={`invisible ${full ? "absolute right-full mr-[.25em]" : ""}`}>
          {full ? "YEAR" : "Year"}
        </span>
        <span className="relative">
          {full && (
            <span
              data-y="pulse"
              className="invisible absolute inset-0 m-auto size-[1em] rounded-full border-2 border-you"
            />
          )}
          <span data-y="num">{YEAR_0}</span>
        </span>
      </div>
    </div>
  );
}

/** The moment, over the phone, while `on`. */
export function YearZero({ on, full, onDone }: { on: boolean; full: boolean; onDone(): void }) {
  const phone = typeof document === "undefined" ? null : document.getElementById("phone");
  return on && phone ? createPortal(<Moment full={full} onDone={onDone} />, phone) : null;
}
