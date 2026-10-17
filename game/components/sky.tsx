"use client";

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import type { Drift, Mark, Show } from "@/lib/drift";
import type { Stop } from "@/lib/flight";
import { prefersReducedMotion } from "@/lib/motion";

interface SkyApi {
  /** Returns the camera's flight to this view, in seconds. */
  show(spec: Show): number;
  /** The title's dive home. Returns its length in seconds. */
  home(): number;
  /** The map: flies to a stop. */
  go(stop: Stop): void;
  /** The map: turns the view by a drag, as shares of the map's width and height. */
  turn(dx: number, dy: number): void;
  /** The sky's frame, which art is placed against. */
  frame: React.RefObject<HTMLDivElement | null>;
}

const SkyContext = createContext<SkyApi | null>(null);
export const useSky = () => use(SkyContext);

// The game's one sky, behind every screen from the title to the charter, and then the map. It never fades: each
// screen says where to look and where its art sits, and the camera flies there. The screens above it are see-through.
// Before the shell, a soft shade keeps their words clear of it. In the shell, the map strip is its window.
export function Sky({ shade, children }: { shade: boolean; children: React.ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const scene = useRef<Drift>(undefined);
  const wanted = useRef<Show>({ mode: "title" });
  // The one fade the sky has: in, when the game first opens.
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = frame.current!;
    let gone = false;
    import("@/lib/drift")
      .then(({ mountDrift }) => {
        if (gone) return;
        scene.current = mountDrift(el, { still: prefersReducedMotion(), ...wanted.current });
        setLit(true);
      })
      // No WebGL: the screens carry on over the plain page.
      .catch(() => {});
    return () => {
      gone = true;
      scene.current?.dispose();
      scene.current = undefined;
    };
  }, []);

  const show = useCallback((spec: Show) => {
    wanted.current = spec;
    return scene.current?.show(spec) ?? 0;
  }, []);
  const home = useCallback(() => scene.current?.home() ?? 0, []);
  const go = useCallback((stop: Stop) => scene.current?.go(stop), []);
  const turn = useCallback((dx: number, dy: number) => scene.current?.turn(dx, dy), []);
  const [api] = useState<SkyApi>(() => ({ show, home, go, turn, frame }));
  const shading = `pointer-events-none absolute transition-opacity duration-700 ${shade ? "opacity-100" : "opacity-0"}`;

  return (
    <SkyContext value={api}>
      <div
        ref={frame}
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-[2400ms] ease-in-out motion-reduce:transition-none ${lit ? "opacity-100" : "opacity-0"}`}
      />
      <div
        aria-hidden
        className={`${shading} inset-0 bg-linear-to-b from-transparent from-45% to-paper/80 to-75% wide:bg-linear-to-r wide:from-50% wide:to-paper/75 wide:to-80%`}
      />
      <div
        aria-hidden
        className={`${shading} inset-x-0 top-0 h-32 bg-linear-to-b from-paper/70 to-transparent wide:hidden`}
      />
      <div className="relative flex min-h-0 grow flex-col [&>*]:!bg-transparent">{children}</div>
    </SkyContext>
  );
}

type Box = { x: number; y: number; w: number; h: number };

/**
 * A screen's art: an empty box in the screen's layout, where the sky frames the screen's subject. Its children, such as
 * labels, sit in the box, and the scene's screen positions come to them measured from it.
 */
export function SkyArt({
  className,
  children,
  onReady,
  mode,
  dials,
  moments,
  onFrame,
  onMind,
  onMarks,
  onScale,
}: Omit<Show, "rect"> & {
  className: string;
  children?: React.ReactNode;
  /** Once the sky is turning to this view, with how long the camera takes to get there, in seconds. */
  onReady?(flight: number): void;
}) {
  const sky = useSky();
  const box = useRef<HTMLDivElement>(null);
  const at = useRef<Box>({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (!sky) return onReady?.(0);
    const rect = () => {
      const a = box.current?.getBoundingClientRect();
      const f = sky.frame.current?.getBoundingClientRect();
      if (!a || !f) return null;
      at.current = { x: a.left - f.left, y: a.top - f.top, w: a.width, h: a.height };
      return at.current;
    };
    const flight = sky.show({
      mode,
      dials,
      moments,
      rect,
      onFrame,
      onMind: onMind && ((x, y) => onMind(x - at.current.x, y - at.current.y)),
      onMarks:
        onMarks &&
        ((marks: Mark[]) => onMarks(marks.map((m) => ({ ...m, x: m.x - at.current.x, y: m.y - at.current.y })))),
      onScale,
    });
    onReady?.(flight);
  }, [sky, mode, dials, moments, onFrame, onMind, onMarks, onScale, onReady]);

  return (
    <div ref={box} aria-hidden className={className}>
      {children}
    </div>
  );
}
