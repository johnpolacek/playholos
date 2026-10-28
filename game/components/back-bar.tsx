import { Link } from "react-router";

// The game's way back from a page to where it was opened: a full-width bar on a dark track, faint stars drifting
// behind its words, a bare chevron, and the place it goes back to. Opened from a walk, the walk's stops sit small at
// its end, the one it goes back to ringed. Settled 2026-10-28 in explorations/back-nav-step.html, 12.
export function BackBar({ to, state, label, stops }: { to: string; state?: unknown; label: string; stops?: { n: number; at: number } }) {
  return (
    <Link
      to={to}
      state={state}
      data-m
      className="group relative flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-faint bg-[#1d1e21] pr-[18px] pl-3.5 text-[14.5px] font-medium text-ink transition-colors hover:border-[#4a4c51]"
    >
      <span aria-hidden className="starfield absolute inset-0" />
      <span aria-hidden className="relative text-[20px] leading-none transition-transform group-hover:-translate-x-0.5">
        ‹
      </span>
      <span className="relative">{label}</span>
      {stops && (
        <span aria-hidden className="relative ml-auto flex items-center gap-[5px]">
          {Array.from({ length: stops.n }, (_, i) => (
            <i
              key={i}
              className={`rounded-full ${i === stops.at ? "size-2 bg-you shadow-[0_0_0_2px_#2a3d45]" : `size-[5px] ${i ? "bg-you/55" : "bg-ink/55"}`}`}
            />
          ))}
        </span>
      )}
    </Link>
  );
}
