import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

// The opening screens' buttons: back a screen, Skip, and the next screen's name. Skip says only Skip, with Lucide's
// chevrons-right, and back is Lucide's chevron-left with no words. Both are faint outlines, sized to what they hold, and the next
// screen's button takes the rest of the row and gives off sparks on hover. 2026-11-08.

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function OpeningActs({
  onBack,
  onSkip,
  onNext,
  next,
  pad = "pt-5 pb-4 wide:pt-8",
}: {
  onBack(): void;
  onSkip(): void;
  onNext(): void;
  next: ReactNode;
  /** The row's padding, which differs on Earth waking. */
  pad?: string;
}) {
  return (
    <div
      className={`mt-auto grid shrink-0 grid-cols-[auto_auto_1fr] gap-2 ${pad}`}
    >
      <button
        data-m="act"
        onClick={onBack}
        aria-label="Back"
        className={`${GHOST} text-page-ink2`}
      >
        <Sheen />
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          aria-hidden
          {...LINE}
          className="relative transition-transform duration-300 ease-out group-hover:-translate-x-1"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        data-m="act"
        onClick={onSkip}
        className={`${GHOST} gap-1 text-[15px] font-medium`}
      >
        <Sheen />
        <span className="relative">Skip</span>
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          aria-hidden
          {...LINE}
          className="relative overflow-visible"
        >
          <path
            d="m6 17 5-5-5-5"
            className="transition-transform duration-300 ease-out group-hover:translate-x-1"
          />
          <path
            d="m13 17 5-5-5-5"
            className="transition-transform delay-75 duration-300 ease-out group-hover:translate-x-1.5"
          />
        </svg>
      </button>
      <Sparking onClick={onNext}>{next}</Sparking>
    </div>
  );
}

// A faint outline that brightens on hover, with a light sweeping across, and a small press. Reduced motion keeps the
// brighter outline and drops the movement.
const GHOST =
  "group relative inline-flex h-[46px] items-center justify-center overflow-hidden rounded-full border px-4 border-faint " +
  "transition-[border-color,color,transform] duration-300 ease-out hover:border-muted hover:text-ink " +
  "active:scale-[.97] motion-reduce:transition-none motion-reduce:active:scale-100";

const Sheen = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-y-0 -left-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-ink/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%] motion-reduce:hidden"
  />
);

/** Colors the sparks take: mostly the button's own light, some of ours and theirs. */
const SPARK = ["var(--ink)", "var(--ink)", "var(--you)", "var(--other)"];

// The next screen's button. While a mouse rests on it, small sparks lift off its edges and drift up and out, fading,
// with a burst as the pointer arrives. A touch has no hover, so it gets none, and reduced motion gets none.
function Sparking({
  onClick,
  children,
}: {
  onClick(): void;
  children: ReactNode;
}) {
  const layer = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const spark = () => {
    const el = layer.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const dot = document.createElement("span");
    const size = gsap.utils.random(1.5, 3.5);
    const color = gsap.utils.random(SPARK);
    const top = Math.random() < 0.6;
    Object.assign(dot.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 6px ${color}`,
      left: `${gsap.utils.random(height / 2, width - height / 2)}px`,
      top: `${top ? 2 : height - 2}px`,
    });
    el.appendChild(dot);
    gsap.fromTo(
      dot,
      { opacity: 0, scale: 0.4 },
      {
        keyframes: { opacity: [0, 1, 0], scale: [0.4, 1, 0.2] },
        x: gsap.utils.random(-18, 18),
        y: top ? gsap.utils.random(-34, -14) : gsap.utils.random(10, 24),
        duration: gsap.utils.random(0.7, 1.3),
        ease: "power1.out",
        onComplete: () => dot.remove(),
      },
    );
  };

  const stop = () => {
    window.clearInterval(timer.current);
    timer.current = undefined;
  };

  const start = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion() || timer.current)
      return;
    for (let i = 0; i < 10; i++) spark();
    timer.current = window.setInterval(spark, 70);
  };

  useEffect(() => stop, []);

  return (
    <div data-m="act" className="relative grid">
      <span
        ref={layer}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
      <button
        onClick={onClick}
        onPointerEnter={start}
        onPointerLeave={stop}
        className="relative h-[46px] rounded-full bg-button text-[15px] font-medium text-paper transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_0_18px_-4px_var(--you)] active:scale-[.98] motion-reduce:transition-none"
      >
        {children}
      </button>
    </div>
  );
}
