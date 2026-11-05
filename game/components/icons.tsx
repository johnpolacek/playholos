// The map's way-finding marks, drawn on a 16-unit grid in the same line as the sources' mark: a lens to go closer or
// farther, and Earth to come home. Each takes its color from the words beside it.
const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round",
} as const;

/** A lens, with a plus to go closer or a minus to go farther. */
export function Lens({ closer, size = 14 }: { closer: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <circle cx="7" cy="7" r="4.75" />
      <path d="M10.5 10.5 14 14" />
      <path d={closer ? "M7 5v4M5 7h4" : "M5 7h4"} />
    </svg>
  );
}

/** An arrow round a circle, to play something again. */
export function Replay({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <path d="M3.2 6.2A5 5 0 1 1 3 9.5" />
      <path d="M2.75 2.75v3.5h3.5" />
    </svg>
  );
}

/** A triangle pointing on, to play. */
export function Play({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE} strokeLinejoin="round">
      <path d="M5 3.25v9.5L12.5 8z" fill="currentColor" />
    </svg>
  );
}

/** An astroid: four cusps curving in to a point, like a star's glint. Separates the title's footer links. */
export function Astroid({ size = 7 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M8 0Q8.6 7.4 16 8Q8.6 8.6 8 16Q7.4 8.6 0 8Q7.4 7.4 8 0z" fill="currentColor" />
    </svg>
  );
}

/** Earth: its edge, a meridian and the equator. */
export function Globe({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <circle cx="8" cy="8" r="6.25" />
      <ellipse cx="8" cy="8" rx="2.6" ry="6.25" />
      <path d="M1.75 8h12.5" />
    </svg>
  );
}

/** Two dials on their tracks, for the Mind's settings. */
export function Dials({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <path d="M2 5h12M2 11h12" />
      <circle cx="10.5" cy="5" r="1.75" fill="currentColor" />
      <circle cx="5.5" cy="11" r="1.75" fill="currentColor" />
    </svg>
  );
}

/** A check, for a thing that is set. */
export function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

/** An x, to clear a thing out. */
export function Cross({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

/** A key: its bow, its shaft and two teeth. */
export function KeyMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <circle cx="4.75" cy="8" r="3" />
      <path d="M7.75 8h6.5M11.5 8v2.5M14.25 8v2" />
    </svg>
  );
}

/** A terminal: its window and a prompt. */
export function Prompt({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE}>
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" />
      <path d="M4.5 6.5 6.75 8.5 4.5 10.5M8.5 10.5h3" />
    </svg>
  );
}

/** What the simulation's map names: a mind awake or asleep, a peer, or a world by how far its life has come. */
export type SimKind = "awake" | "asleep" | "peer" | "animals" | "oxygen" | "microbes";
/** Each in the color the map draws it: minds blue, peers amber, warm life warm, microbes cool. 2026-11-01. */
export const SIM_COLOR: Record<SimKind, string> = {
  awake: "var(--you)",
  asleep: "var(--muted)",
  peer: "var(--other)",
  animals: "rgb(255,206,150)",
  oxygen: "rgb(255,206,150)",
  microbes: "rgb(168,198,255)",
};

/** A small mark for each: an open eye awake, a shut one asleep, two equals for a peer, a pine for animals and forests,
 *  two bound atoms for oxygen, and a cell for microbes. */
export function SimMark({ kind, size = 11 }: { kind: SimKind; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className="shrink-0" {...LINE} strokeWidth={1.5}>
      {kind === "awake" && (
        <>
          <path d="M1.75 8S4.5 3.75 8 3.75 14.25 8 14.25 8 11.5 12.25 8 12.25 1.75 8 1.75 8Z" />
          <circle cx="8" cy="8" r="2" />
        </>
      )}
      {kind === "asleep" && <path d="M2 6.5c1.6 2.2 3.7 3.25 6 3.25s4.4-1.05 6-3.25M4.2 9.4 3 11.2M8 9.75v2.1M11.8 9.4l1.2 1.8" />}
      {kind === "peer" && (
        <>
          <circle cx="4.25" cy="8" r="2.5" />
          <circle cx="11.75" cy="8" r="2.5" />
          <path d="M6.75 8h2.5" />
        </>
      )}
      {kind === "animals" && <path d="M8 1.75 11.25 6.5h-6.5ZM8 4.5l4.75 7h-9.5ZM8 11.5v2.75" />}
      {kind === "oxygen" && (
        <>
          <circle cx="5.6" cy="8" r="3.35" />
          <circle cx="10.4" cy="8" r="3.35" />
        </>
      )}
      {kind === "microbes" && (
        <>
          <ellipse cx="8" cy="8" rx="6" ry="3.6" transform="rotate(-30 8 8)" />
          <circle cx="6.4" cy="8.6" r="0.9" fill="currentColor" />
          <circle cx="9.6" cy="7" r="0.6" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
