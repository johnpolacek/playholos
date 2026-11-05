import type { Visit } from "@/lib/sim/types";

// Proxima b as our sails or probe saw it, drawn: its face lit from the left by its red star, fading to a night side
// that is dark for good, since it turns once each orbit. Bare rock and its craters, a gas world's bands under haze, or
// cloud drifting over dark seas, with forests dark green on the land, as plants under a red star would look. Air
// shows as a thin glow on its lit edge. 2026-10-22. A lens at the Sun's focus pictures felt worlds too, 2026-10-26:
// ice from pole to pole. An old mind's works, 2026-10-28: round a world, far out, they hang in a thin ring of sheets.
// Awake, they glow faint and cold, never brightening, and turn slowly. Asleep, they are dark and still. Lived-in worlds
// and their cities went with the neighbors, 2026-10-31.

/** Sheets in a ring, each turned along it. Fixed, so the picture is the same each time. */
const SHEETS = Array.from({ length: 44 }, (_, k) => {
  const a = (k / 44) * 2 * Math.PI + ((k * 5) % 7) * 0.02;
  return { x: 66 + (57 + ((k * 11) % 9)) * Math.cos(a), y: 66 + (57 + ((k * 11) % 9)) * Math.sin(a), deg: (a * 180) / Math.PI + 90, w: k % 5 ? 2.6 : 4.2 };
});

function Works({ asleep }: { asleep: boolean }) {
  return (
    <g aria-hidden>
      {!asleep && (
        <>
          <filter id="works-heat" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <circle cx="66" cy="66" r="61" fill="none" stroke="#aab4c8" strokeWidth="6" opacity=".1" filter="url(#works-heat)" />
        </>
      )}
      <g className={asleep ? undefined : "origin-center animate-[spin_240s_linear_infinite] motion-reduce:animate-none"}>
        {SHEETS.map(({ x, y, deg, w }, k) => (
          <rect
            key={k}
            x={x - w / 2}
            y={y - 0.45}
            width={w}
            height=".9"
            transform={`rotate(${deg} ${x} ${y})`}
            fill={asleep ? "#2b3038" : "#c4cddd"}
            stroke={asleep ? "#565d68" : "none"}
            strokeWidth=".3"
            opacity={asleep ? 0.9 : 0.55}
          />
        ))}
      </g>
    </g>
  );
}

export function VisitArt({ sight, elder, size = 132 }: { sight: Visit["sight"]; elder?: "awake" | "asleep"; size?: number }) {
  // At a black hole: its dark disk, and the sky behind it bent into a ring of light. 2026-10-26.
  if (sight === "dark")
    return (
      <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden className="shrink-0 overflow-visible">
        <circle cx="66" cy="66" r="44" fill="none" stroke="#f4f6ff" strokeWidth="1.2" opacity=".5" />
        <circle cx="66" cy="66" r="40" fill="none" stroke="#f0a777" strokeWidth="6" opacity=".25" className="animate-pulse motion-reduce:animate-none" />
        <circle cx="66" cy="66" r="30" fill="#000" />
        <circle cx="66" cy="66" r="30.5" fill="none" stroke="#f4f6ff" strokeWidth=".6" opacity=".8" />
      </svg>
    );
  // A pass with no world to picture: a soft smear of light that no frame resolves, the stars behind it streaked by our
  // speed. 2026-11-05.
  if (sight === "far")
    return (
      <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden className="shrink-0 overflow-visible">
        <defs>
          <radialGradient id="visit-far">
            <stop offset="0" stopColor="#f0a777" stopOpacity=".55" />
            <stop offset=".45" stopColor="#f0a777" stopOpacity=".16" />
            <stop offset="1" stopColor="#f0a777" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 16 }, (_, k) => {
          const x = 12 + ((k * 37) % 108), y = 14 + ((k * 23) % 104);
          return <line key={k} x1={x} y1={y} x2={x + 5 + (k % 4) * 2} y2={y} stroke="#f4f6ff" strokeWidth=".6" opacity={0.2 + (k % 3) * 0.15} />;
        })}
        <circle cx="66" cy="66" r="46" fill="url(#visit-far)" className="animate-pulse motion-reduce:animate-none" />
      </svg>
    );
  // A star with no warm world, as our seed probe sees it: its belt of rock going round, and our probe mining one, its
  // furnace's glow faint beside it. 2026-10-26.
  if (sight === "rocks")
    return (
      <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden className="shrink-0 overflow-visible">
        <circle cx="66" cy="66" r="7" fill="#f0a777" />
        <circle cx="66" cy="66" r="13" fill="#f0a777" opacity=".15" />
        <ellipse cx="66" cy="66" rx="54" ry="20" fill="none" stroke="#7a685d" strokeWidth="9" opacity=".25" />
        <g className="origin-center animate-[spin_90s_linear_infinite] motion-reduce:animate-none">
          {Array.from({ length: 36 }, (_, k) => {
            const a = (k / 36) * 2 * Math.PI, r = 50 + ((k * 7) % 9);
            return <circle key={k} cx={66 + r * Math.cos(a)} cy={66 + r * 0.37 * Math.sin(a)} r={k % 4 ? 0.9 : 1.6} fill="#a08b7d" />;
          })}
        </g>
        <circle cx="112" cy="74" r="2.2" fill="#f4f6ff" />
        <circle cx="112" cy="74" r="5" fill="#ffd28a" opacity=".35" className="animate-pulse motion-reduce:animate-none" />
      </svg>
    );
  const id = `v-${sight}`;
  const airy = sight !== "bare" && sight !== "ice";
  const haze = sight === "haze";
  return (
    <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden className="shrink-0 overflow-visible">
      {elder && <Works asleep={elder === "asleep"} />}
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
        {sight === "ice" && (
          <>
            <rect width="132" height="132" fill="#c9d3d6" />
            <path d="M18 52q24 8 50-2t48 6M24 82q30-10 52 2t40-4M40 30q10 14 30 12" fill="none" stroke="#9fb0b6" strokeWidth=".9" />
            <path d="M58 60l8 12-6 10M80 40l-4 14 10 8" fill="none" stroke="#8fa2a9" strokeWidth=".7" />
          </>
        )}
        {(sight === "seas" || sight === "green") && (
          <>
            <rect width="132" height="132" fill="#173244" />
            <path
              d="M22 40q14-16 34-10t26 22q-6 18-28 16t-32-28zM48 82q18-8 32 2t-2 22q-18 4-28-6t-2-18z"
              fill={sight === "seas" ? "#55463b" : "#29391f"}
            />
            {sight !== "seas" && <path d="M30 42q10-8 20-2t2 14q-12 4-22-12zM56 88q10-2 16 4t-6 10q-10-2-10-14z" fill="#36502b" />}
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
