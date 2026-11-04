import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import type { Body, Flight, Target } from "@/lib/sim/flight-view";

/** Simulation mode's flight through our neighborhood, on its own canvas: drag to turn round the place in view, scroll
 *  to come closer or stand back, tap to fly to whatever is there. 2026-11-03. */
export function SimFlight({
  bodies,
  target,
  light,
  thread,
  onArrive,
  onTap,
  onTouch,
  className,
}: {
  bodies: Body[];
  target: Target;
  /** Our light's shell, light-years, or null. */
  light: number | null;
  /** A dashed line from Sol to this place, or null. */
  thread: [number, number, number] | null;
  onArrive(id: string): void;
  onTap(id: string | null): void;
  onTouch(): void;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const flight = useRef<Flight | null>(null);
  const calls = useRef({ onArrive, onTouch });
  const wanted = useRef({ bodies, target, light, thread });
  useEffect(() => {
    calls.current = { onArrive, onTouch };
    wanted.current = { bodies, target, light, thread };
  });

  useEffect(() => {
    let gone = false;
    import("@/lib/sim/flight-view").then(({ mountFlight }) => {
      if (gone || !box.current) return;
      const f = mountFlight(box.current, {
        still: prefersReducedMotion(),
        onArrive: (id) => calls.current.onArrive(id),
        onTouch: () => calls.current.onTouch(),
      });
      flight.current = f;
      f.bodies(wanted.current.bodies);
      f.fly(wanted.current.target);
      f.light(wanted.current.light);
      f.thread(wanted.current.thread);
    });
    return () => {
      gone = true;
      flight.current?.dispose();
      flight.current = null;
    };
  }, []);
  useEffect(() => flight.current?.bodies(bodies), [bodies]);
  useEffect(() => flight.current?.fly(target), [target]);
  useEffect(() => flight.current?.light(light), [light]);
  useEffect(() => flight.current?.thread(thread), [thread]);

  // Wheel needs a listener that can stop the page scrolling.
  useEffect(() => {
    const el = box.current!;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      flight.current?.zoom(Math.exp(e.deltaY * 0.0015));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  const from = useRef<{ x: number; y: number } | null>(null);
  const down = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      ref={box}
      className={`cursor-grab touch-none active:cursor-grabbing ${className ?? ""}`}
      onPointerDown={(e) => {
        from.current = down.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!from.current) return;
        const { width, height } = e.currentTarget.getBoundingClientRect();
        flight.current?.turn((e.clientX - from.current.x) / width, (e.clientY - from.current.y) / height);
        from.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        from.current = null;
        const d = down.current;
        down.current = null;
        if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
        const r = e.currentTarget.getBoundingClientRect();
        onTap(flight.current?.pick(e.clientX - r.left, e.clientY - r.top) ?? null);
      }}
      onPointerCancel={() => (from.current = null)}
    />
  );
}
