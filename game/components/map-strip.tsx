"use client";

import { useEffect, useRef, useState } from "react";
import { currentScheme, ThemeToggle, useScheme } from "@/components/theme-toggle";

// The atlas's five stages, and its outward button: each tap travels one stage out, and the last comes home.
const STAGES = [
  { id: "earth", name: "EARTH", next: "Solar System ↗" },
  { id: "solar", name: "SOLAR SYSTEM", next: "Nearby stars ↗" },
  { id: "stars", name: "NEARBY STARS", next: "Milky Way ↗" },
  { id: "galaxy", name: "MILKY WAY", next: "Other galaxies ↗" },
  { id: "group", name: "LOCAL GROUP", next: "Back to Earth ↙" },
];

interface Strip {
  show(stage: string): void;
  setTheme(name: string): void;
  dispose(): void;
}

// The board: a strip of the map under the top bar, drawn by the atlas's own scene.
export function MapStrip() {
  const view = useRef<HTMLDivElement>(null);
  const strip = useRef<Strip>(undefined);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [tall, setTall] = useState(false);
  const scheme = useScheme();

  useEffect(() => {
    const parent = view.current;
    if (!parent) return;
    let gone = false;
    import("@/lib/atlas")
      .then(({ mountAtlas }) => mountAtlas(parent, currentScheme()))
      .then((mounted) => {
        if (gone) return mounted.dispose();
        strip.current = mounted;
        setReady(true);
      });
    return () => {
      gone = true;
      strip.current?.dispose();
      strip.current = undefined;
    };
  }, []);

  // The map draws in the theme the page is in, chosen or the phone's.
  useEffect(() => {
    if (ready) strip.current?.setTheme(scheme);
  }, [ready, scheme]);

  function travel() {
    const next = (stage + 1) % STAGES.length;
    strip.current?.show(STAGES[next].id);
    setStage(next);
  }

  return (
    <div data-shell="map" className={`relative shrink-0 overflow-hidden border-b border-faint bg-paper transition-[height] duration-300 ${tall ? "h-[72%]" : "h-[45%]"}`}>
      <div ref={view} className="absolute inset-0" />
      <span className="pointer-events-none absolute top-2 left-2.5 rounded-[9px] border border-faint bg-paper px-[7px] py-0.5 font-mono text-[9.5px] tracking-[.06em]">
        {STAGES[stage].name}
      </span>
      <ThemeToggle />
      {ready && (
        <button onClick={travel} className="absolute right-2.5 bottom-3 h-8 rounded-full border border-faint bg-paper px-3 text-xs">
          {STAGES[stage].next}
        </button>
      )}
      <button
        onClick={() => setTall(!tall)}
        aria-label={tall ? "Show less of the map" : "Show more of the map"}
        aria-expanded={tall}
        className="absolute bottom-0 left-1/2 flex h-5 w-16 -translate-x-1/2 items-end justify-center pb-[5px]"
      >
        <span className="h-1 w-9 rounded-sm bg-faint" />
      </button>
    </div>
  );
}
