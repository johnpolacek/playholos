"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { type Choice, loadChoice, paint, saveChoice, type Scheme } from "@/lib/theme";

// The page's one theme store. The toggle writes it, and the map strip draws in the scheme it comes to.
const listeners = new Set<() => void>();
let chosen: Choice | undefined;
const phone = () => matchMedia("(prefers-color-scheme: dark)");
const phoneScheme = (): Scheme => (phone().matches ? "dark" : "light");
const getChoice = () => (chosen ??= loadChoice());

export function currentScheme(): Scheme {
  const c = getChoice();
  return c === "system" ? phoneScheme() : c;
}

function subscribe(fn: () => void) {
  const os = phone();
  listeners.add(fn);
  os.addEventListener("change", fn);
  return () => {
    listeners.delete(fn);
    os.removeEventListener("change", fn);
  };
}

function choose(c: Choice) {
  chosen = c;
  saveChoice(c);
  paint(c);
  listeners.forEach((fn) => fn());
}

export const useScheme = () => useSyncExternalStore(subscribe, currentScheme, (): Scheme => "light");

// How far night has crossed the world: none for light, all for dark.
const NIGHT = { light: 13, dark: 0 };

// The theme button, in the map's corner across from the stage tag, and in Wake's. It follows the phone until tapped,
// then each tap turns the world into night or out of it. On a staged screen, the screen's useStage brings it in and
// out as `[data-m="theme"]`.
export function ThemeToggle({ staged = false, className = "pt-1 pr-2.5" }: { staged?: boolean; className?: string }) {
  const root = useRef<HTMLButtonElement>(null);
  const tapped = useRef(false);
  const scheme = useScheme();

  // Strict Mode's dev remount clears the attribute the root layout's script set. A no-op in production.
  useLayoutEffect(() => paint(getChoice()), []);

  // In the map, it enters once the map has opened, and leaves with the map.
  useGSAP(
    () => {
      if (staged || prefersReducedMotion()) return;
      gsap.from(root.current, { autoAlpha: 0, y: -6, duration: 0.4, ease: "power3.out", delay: 0.75 });
    },
    { scope: root },
  );

  // Night crosses the world. Set in place until the first tap.
  useGSAP(
    () => {
      const shade = gsap.utils.selector(root)("[data-shade]");
      const to = { x: NIGHT[scheme] };
      if (!tapped.current || prefersReducedMotion()) gsap.set(shade, to);
      else gsap.to(shade, { ...to, duration: 0.6, ease: "power2.inOut", overwrite: "auto" });
    },
    { scope: root, dependencies: [scheme] },
  );

  function tap() {
    tapped.current = true;
    choose(scheme === "dark" ? "light" : "dark");
  }

  return (
    <button
      ref={root}
      data-m={staged ? "theme" : undefined}
      onClick={tap}
      aria-label="Dark theme"
      aria-pressed={scheme === "dark"}
      className={`absolute top-0 right-0 pb-2 pl-3 ${className}`}
    >
      <span className="flex size-7 items-center justify-center rounded-full border border-faint bg-paper">
        <svg viewBox="0 0 16 16" aria-hidden className="size-3.5">
          <clipPath id="theme-world">
            <circle cx="8" cy="8" r="6.5" />
          </clipPath>
          {/* Night is hatched, as on Wake's Earth, so it reads as shade in either theme. */}
          <pattern id="theme-hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="2.2" strokeWidth=".9" className="stroke-ink" />
          </pattern>
          <g clipPath="url(#theme-world)">
            <rect data-shade x="1.5" y="1.5" width="13" height="13" fill="url(#theme-hatch)" />
          </g>
          <circle cx="8" cy="8" r="6.5" fill="none" strokeWidth="1.1" className="stroke-ink" />
        </svg>
      </span>
    </button>
  );
}
