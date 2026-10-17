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

// The dial's rows, top to bottom, and where night sits on the world for each: half, none, all.
const CHOICES: Choice[] = ["system", "light", "dark"];
const SHADE = { system: 0, light: 4, dark: -4 };
const ROW = 14;

/** Every tap changes what shows: from System to the theme the phone isn't in, then the one it is, then back. */
function next(c: Choice): Choice {
  const os = phoneScheme();
  const other = os === "dark" ? "light" : "dark";
  return c === "system" ? other : c === other ? os : "system";
}

// The theme chip, in the map's corner across from the stage tag. A small world turns into night with the choice.
export function ThemeToggle() {
  const root = useRef<HTMLButtonElement>(null);
  const tapped = useRef(false);
  const choice = useSyncExternalStore(subscribe, getChoice, (): Choice => "system");

  // Strict Mode's dev remount clears the attribute the root layout's script set. A no-op in production.
  useLayoutEffect(() => paint(getChoice()), []);

  // It enters once the map has opened, and leaves with the map.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(root.current, { autoAlpha: 0, y: -6, duration: 0.4, ease: "power3.out", delay: 0.75 });
    },
    { scope: root },
  );

  // The dial rolls to the choice and night crosses the world. Set in place until the first tap.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const dial = { y: -ROW * CHOICES.indexOf(choice) };
      const shade = { x: SHADE[choice] };
      if (!tapped.current || prefersReducedMotion()) {
        gsap.set(q("[data-dial]"), dial);
        gsap.set(q("[data-shade]"), shade);
        return;
      }
      gsap.to(q("[data-dial]"), { ...dial, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      gsap.to(q("[data-shade]"), { ...shade, duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
    },
    { scope: root, dependencies: [choice] },
  );

  function tap() {
    tapped.current = true;
    choose(next(choice));
  }

  return (
    <button
      ref={root}
      onClick={tap}
      aria-label={`Theme: ${choice[0].toUpperCase()}${choice.slice(1)}`}
      className="absolute top-0 right-0 pt-2 pr-2.5 pb-3 pl-4"
    >
      <span className="flex items-center gap-[5px] rounded-[9px] border border-faint bg-paper px-[7px] py-0.5 font-mono text-[9.5px] tracking-[.06em]">
        <svg viewBox="0 0 10 10" aria-hidden className="size-[10px]">
          <clipPath id="theme-moon">
            <circle cx="5" cy="5" r="4" />
          </clipPath>
          {/* Night is hatched, as on Wake's Earth, so it reads as shade in either theme. */}
          <pattern id="theme-hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="2" strokeWidth=".9" className="stroke-ink" />
          </pattern>
          <g clipPath="url(#theme-moon)">
            <rect data-shade x="5" y="1" width="8" height="8" fill="url(#theme-hatch)" />
          </g>
          <circle cx="5" cy="5" r="4" fill="none" strokeWidth="1" className="stroke-ink" />
        </svg>
        <span aria-hidden className="h-[14px] overflow-hidden leading-[14px]">
          <span data-dial className="flex flex-col">
            {CHOICES.map((c) => (
              <span key={c}>{c.toUpperCase()}</span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
}
