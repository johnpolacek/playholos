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

export const useScheme = () => useSyncExternalStore(subscribe, currentScheme, (): Scheme => "dark");

// What the memory screens' canvases draw with, as "r,g,b". Dark keeps their night: warm lamps that add light to a
// black sky. Light draws ink on paper, and its lamps darken the paper where they burn.
export const CANVAS = {
  dark: {
    ink: "230,227,219",
    muted: "138,134,126",
    lamp: "232,180,92",
    mind: "91,184,214",
    sun: "255,236,190",
    paper: "#121314",
    glow: "lighter",
  },
  light: {
    ink: "23,23,22",
    muted: "107,104,96",
    lamp: "168,98,15",
    mind: "31,122,150",
    sun: "214,140,40",
    paper: "#fbfaf7",
    glow: "multiply",
  },
} as const;

/** The canvas palette for the page's theme, in a ref a draw loop reads every frame. */
export function useCanvasInk() {
  const scheme = useScheme();
  const ink = useRef<(typeof CANVAS)[Scheme]>(CANVAS.light);
  useLayoutEffect(() => {
    ink.current = CANVAS[scheme];
  }, [scheme]);
  return ink;
}

// The theme button, in the map's corner across from the stage tag, and in Wake's: a crescent and a star. It follows
// the phone until tapped, then each tap flips the theme. The crescent fills in the dark, and the star twinkles. On a
// staged screen, it enters with the screen's kicker and leaves with the screen.
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

  // The crescent fills or empties, and the star turns in. Set in place until the first tap.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const fill = { fillOpacity: scheme === "dark" ? 1 : 0 };
      if (!tapped.current || prefersReducedMotion()) {
        gsap.set(q("[data-moon]"), fill);
        return;
      }
      gsap.to(q("[data-moon]"), { ...fill, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      gsap.fromTo(
        q("[data-star]"),
        { scale: 0.2, rotation: -90, svgOrigin: "13 3.5" },
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)", overwrite: "auto" },
      );
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
      data-m={staged ? "kick" : undefined}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={tap}
      aria-label="Dark theme"
      aria-pressed={scheme === "dark"}
      className={`absolute top-0 right-0 pb-2 pl-3 ${className}`}
    >
      <span className="flex size-7 items-center justify-center rounded-full border border-faint bg-paper">
        <svg viewBox="0 0 16 16" aria-hidden className="size-3.5">
          <path
            data-moon
            d="M6.22 3.56A5.5 5.5 0 1 0 12.44 9.78A4.5 4.5 0 0 1 6.22 3.56Z"
            strokeWidth="1.1"
            strokeLinejoin="round"
            fillOpacity="0"
            className="fill-ink stroke-ink"
          />
          <path data-star d="M13 1.3L13.6 2.9L15.2 3.5L13.6 4.1L13 5.7L12.4 4.1L10.8 3.5L12.4 2.9Z" className="fill-ink" />
        </svg>
      </span>
    </button>
  );
}
