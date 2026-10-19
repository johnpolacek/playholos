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
