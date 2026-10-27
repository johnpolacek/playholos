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
