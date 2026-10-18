import { useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { AboutLink } from "@/components/about/motion";
import { Play, type PlayHandle } from "@/components/about/play";
import { GalacticYear } from "@/components/galactic-year";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

const PAGES = [
  ["/about", "About"],
  ["/about/research", "Research"],
  ["/about/design", "Design"],
  ["/about/building", "Building"],
] as const;

// The about pages' top bar: the game's mark, the four pages, and Play. The mark, like Play, goes back to the game. A
// line under the page you're on slides to the next one as you go.
export function AboutNav() {
  const here = useLocation().pathname;
  const bar = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const play = useRef<PlayHandle>(null);

  // Where the line goes: under the page you're on.
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
        className="relative mx-auto flex h-12 max-w-[1180px] items-center gap-2 px-4 font-mono text-[10.5px] tracking-[.1em] sm:gap-4"
      >
        <AboutLink
          data-a-nav
          href="/"
          aria-label="Play Holos"
          onLeave={() => play.current?.blast()}
          className="-my-1 mr-auto -ml-2 flex size-10 shrink-0 items-center justify-center text-ink"
        >
          <GalacticYear size={36} />
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
        <Play ref={play} />
        <span ref={line} data-a-bar aria-hidden className="invisible absolute bottom-3 left-0 h-px w-0 bg-ink" />
      </div>
    </nav>
  );
}
