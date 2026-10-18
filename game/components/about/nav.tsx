import { useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { AboutLink } from "@/components/about/motion";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

const PAGES = [
  ["/about/research", "Research"],
  ["/about/design", "Design"],
  ["/about/building", "Building"],
] as const;

// The about pages' top bar: Holos, the three pages, and the way back to the game. A line under the page you're on
// slides to the next one as you go.
export function AboutNav() {
  const here = useLocation().pathname;
  const bar = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  // Where the line goes: under the page you're on, or nowhere on the intro page.
  const target = () => {
    const on = bar.current?.querySelector<HTMLElement>('[aria-current="page"]');
    return on ? { x: on.offsetLeft, width: on.offsetWidth, autoAlpha: 1 } : { autoAlpha: 0 };
  };

  // It slides on every page change after the first, and keeps its place between them.
  useGSAP(
    () => {
      if (placed.current && !prefersReducedMotion())
        gsap.to(line.current, {
          ...target(),
          duration: 0.35,
          ease: "power3.out",
          overwrite: true,
        });
      else gsap.set(line.current, target());
      placed.current = true;
    },
    { scope: bar, dependencies: [here], revertOnUpdate: false },
  );

  useEffect(() => {
    const onResize = () => gsap.set(line.current, target());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-rowline bg-page/80 backdrop-blur-md">
      <div
        ref={bar}
        className="relative mx-auto flex h-12 max-w-[1180px] items-center gap-4 px-4 font-mono text-[10.5px] tracking-[.1em]"
      >
        <AboutLink
          data-a-nav
          href="/about"
          className={`mr-auto transition-colors ${here === "/about" ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          HOLOS
        </AboutLink>
        {PAGES.map(([href, label]) => (
          <AboutLink
            key={href}
            data-a-nav
            href={href}
            aria-current={here === href ? "page" : undefined}
            className={`transition-colors ${here === href ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {label.toUpperCase()}
          </AboutLink>
        ))}
        <AboutLink
          data-a-nav
          href="/"
          className="ml-1 rounded-full border border-ink/70 px-3 py-1.5 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          PLAY
        </AboutLink>
        <span ref={line} aria-hidden className="invisible absolute bottom-3 left-0 h-px w-0 bg-ink" />
      </div>
    </nav>
  );
}
