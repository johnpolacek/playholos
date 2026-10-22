import type { Visit } from "@/lib/sim/types";

// Proxima b as our sails or probe saw it, drawn: its face lit from the left by its red star, fading to a night side
// that is dark for good, since it turns once each orbit. Bare rock and its craters, a gas world's bands under haze, or
// cloud drifting over dark seas, with forests dark green on the land, as plants under a red star would look. Air
// shows as a thin glow on its lit edge. 2026-10-22.

export function VisitArt({ sight, size = 132 }: { sight: Visit["sight"]; size?: number }) {
  const id = `v-${sight}`;
  const airy = sight !== "bare";
  const haze = sight === "haze";
  return (
    <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <clipPath id={`${id}-disc`}>
          <circle cx="66" cy="66" r="48" />
        </clipPath>
        {/* Lit from the star's side: bright toward it, then the terminator, then night. */}
        <radialGradient id={`${id}-light`} cx="0.24" cy="0.42" r="0.9">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.4" stopColor="#000" stopOpacity="0.1" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.8" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0.97" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" x2="1">
          <stop offset="0" stopColor="#f0a777" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#f0a777" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={`${id}-halo`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={haze ? 4 : 2.5} />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-disc)`}>
        {sight === "bare" && (
          <>
            <rect width="132" height="132" fill="#7a685d" />
            {[
              [42, 48, 8],
              [60, 84, 5.5],
              [34, 76, 4],
              [70, 44, 3.5],
              [52, 62, 2.5],
              [82, 70, 6],
              [44, 96, 3],
              [28, 58, 2],
            ].map(([cx, cy, r]) => (
              <g key={`${cx}${cy}`}>
                <circle cx={cx} cy={cy} r={r} fill="#5e4f46" />
                <path d={`M${cx - r} ${cy}a${r} ${r} 0 0 1 ${r} ${-r}`} fill="none" stroke="#a08b7d" strokeWidth=".9" />
              </g>
            ))}
          </>
        )}
        {haze && (
          <>
            <rect width="132" height="132" fill="#b98f70" />
            {[24, 38, 50, 61, 74, 88, 102].map((y, k) => (
              <rect key={y} x="0" y={y} width="132" height={k % 2 ? 8 : 5} fill={k % 2 ? "#a07a5e" : "#cba283"} opacity=".6" />
            ))}
          </>
        )}
        {(sight === "seas" || sight === "green") && (
          <>
            <rect width="132" height="132" fill="#173244" />
            <path
              d="M22 40q14-16 34-10t26 22q-6 18-28 16t-32-28zM48 82q18-8 32 2t-2 22q-18 4-28-6t-2-18z"
              fill={sight === "green" ? "#29391f" : "#55463b"}
            />
            {sight === "green" && <path d="M30 42q10-8 20-2t2 14q-12 4-22-12zM56 88q10-2 16 4t-6 10q-10-2-10-14z" fill="#36502b" />}
            <g className="animate-drift motion-reduce:animate-none" filter={`url(#${id}-soft)`} fill="#eee2d6" opacity=".8">
              {[0, 132].map((dx) => (
                <g key={dx} transform={`translate(${dx} 0)`}>
                  <ellipse cx="38" cy="34" rx="18" ry="3.5" />
                  <ellipse cx="72" cy="58" rx="22" ry="4" />
                  <ellipse cx="30" cy="70" rx="10" ry="2.5" />
                  <ellipse cx="50" cy="104" rx="16" ry="3" />
                  <ellipse cx="96" cy="88" rx="12" ry="2.5" />
                </g>
              ))}
            </g>
          </>
        )}
        {/* Red light, then shading from the lit side to the night. */}
        <rect width="132" height="132" fill="#c9533a" opacity=".14" />
        <rect width="132" height="132" fill={`url(#${id}-light)`} />
      </g>
      {/* Air glows on the lit edge, thicker for a gas world's haze. */}
      {airy && (
        <>
          <circle cx="66" cy="66" r={haze ? 50 : 49} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={haze ? 7 : 4} filter={`url(#${id}-halo)`} />
          <circle cx="66" cy="66" r="48.4" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
}
