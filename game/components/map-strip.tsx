"use client";

import { useEffect, useRef } from "react";

// The board: a strip of the map under the top bar, drawn by the atlas's own scene.
export function MapStrip() {
  const view = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = view.current;
    if (!parent) return;
    const dark = matchMedia("(prefers-color-scheme: dark)");
    let strip: { setTheme(name: string): void; dispose(): void } | undefined;
    let gone = false;
    const follow = () => strip?.setTheme(dark.matches ? "dark" : "light");
    import("@/lib/atlas")
      .then(({ mountAtlas }) => mountAtlas(parent, dark.matches ? "dark" : "light"))
      .then((mounted) => {
        if (gone) mounted.dispose();
        else strip = mounted;
      });
    dark.addEventListener("change", follow);
    return () => {
      gone = true;
      dark.removeEventListener("change", follow);
      strip?.dispose();
    };
  }, []);

  return (
    <div className="relative h-[195px] shrink-0 overflow-hidden border-b border-faint bg-paper">
      <div ref={view} className="absolute inset-0" />
      <span className="pointer-events-none absolute top-2 left-2.5 rounded-[9px] border border-faint bg-paper px-[7px] py-0.5 font-mono text-[9.5px] tracking-[.06em]">
        ORBIT · EARTH
      </span>
      <span aria-hidden className="pointer-events-none absolute bottom-[5px] left-1/2 -ml-[18px] h-1 w-9 rounded-sm bg-faint" />
    </div>
  );
}
