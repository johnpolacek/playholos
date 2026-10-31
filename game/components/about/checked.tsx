import { useRef, useState } from "react";
import { record, STARS, verdict, type Star } from "@/lib/about/checked";
import { starsWithin } from "@/lib/about/dials";
import { STARS_PER_MIND } from "@/lib/about/haystack";
import { color, KICK, useCanvas } from "./dials";

// Checked stars, on /about/research: every real star within 20 ly, turning slowly around the Sun, lit by how closely
// it has been searched. Tap one for its record: what each search rules out there, and what it leaves open.

/** Stars worth a closer look, from checked.json: the only cold dust rings within 20 ly, where a cold mind could pass for
 *  dust until checked at several wavelengths, a target Breakthrough Listen planned and never heard, and the two no
 *  survey looked at closely. */
const LOOK = [
  {
    name: "Epsilon Eridani",
    why: "A ring of cold dust, never checked at enough wavelengths to tell it from a cold mind",
  },
  {
    name: "Tau Ceti",
    why: "A ring of cold dust too, though the most searched star near us",
  },
  { name: "82 G. Eri", why: "The third dust ring within 20 ly" },
  {
    name: "Epsilon Indi",
    why: "Breakthrough Listen planned to listen and never did",
  },
  { name: "Gliese 3379", why: "No close search at all" },
  { name: "Gliese 169.1 A", why: "No close search at all" },
];

const R = 20,
  TILT = 1.05;

function project(
  p: readonly number[],
  turn: number,
  s: number,
  cx: number,
  cy: number,
) {
  const c = Math.cos(turn),
    n = Math.sin(turn);
  const x = p[0] * c - p[1] * n,
    y = p[0] * n + p[1] * c,
    z = p[2];
  // Tipped toward us, so the disk of nearby space reads in depth.
  const yy = y * Math.cos(TILT) - z * Math.sin(TILT),
    depth = y * Math.sin(TILT) + z * Math.cos(TILT);
  return { x: cx + x * s, y: cy + yy * s, depth };
}

function StarMap({ pick, onPick }: { pick: Star; onPick: (s: Star) => void }) {
  const placed = useRef<{ s: Star; x: number; y: number }[]>([]);
  const ref = useCanvas((c, w, h, t) => {
    const ink = color("--ink"),
      muted = color("--muted"),
      other = color("--other"),
      you = color("--you");
    const s = (Math.min(w, h * 1.3) / 2 - 20) / R,
      cx = w / 2,
      cy = h / 2,
      turn = t * 0.03;
    // Rings at 10 and 20 ly, flattened as the view tips.
    c.strokeStyle = muted;
    c.globalAlpha = 0.3;
    for (const r of [10, 20]) {
      c.beginPath();
      c.ellipse(cx, cy, r * s, r * s * Math.cos(TILT), 0, 0, 2 * Math.PI);
      c.stroke();
    }
    c.globalAlpha = 1;
    c.fillStyle = muted;
    c.font = "10.5px var(--font-plex-mono), monospace";
    c.fillText("10 LY", cx + 10 * s + 4, cy);
    c.fillText("20 LY", cx + 20 * s + 4, cy);
    c.fillStyle = you;
    c.beginPath();
    c.arc(cx, cy, 3.5, 0, 2 * Math.PI);
    c.fill();
    c.fillText("SUN", cx + 6, cy - 6);
    // The stars, back to front: bright where searched closely, dim where only the all-sky maps passed.
    const at = STARS.map((st) => ({
      st,
      ...project(st.pos, turn, s, cx, cy),
    })).sort((a, b) => a.depth - b.depth);
    placed.current = at.map((a) => ({ s: a.st, x: a.x, y: a.y }));
    for (const a of at) {
      const on = a.st.name === pick.name;
      c.globalAlpha = a.st.checks === 0 ? 0.35 : a.st.checks === 1 ? 0.7 : 1;
      c.fillStyle = a.st.checks === 0 ? muted : ink;
      c.beginPath();
      c.arc(a.x, a.y, a.st.checks === 2 ? 2.6 : 2, 0, 2 * Math.PI);
      c.fill();
      if (a.st.listen) {
        c.strokeStyle = other;
        c.beginPath();
        c.arc(a.x, a.y, 5, 0, 2 * Math.PI);
        c.stroke();
      }
      c.globalAlpha = 1;
      if (on) {
        c.strokeStyle = ink;
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(a.x, a.y, 9 + Math.sin(t * 3), 0, 2 * Math.PI);
        c.stroke();
        c.lineWidth = 1;
        c.fillStyle = ink;
        c.fillText(a.st.name.toUpperCase(), a.x + 12, a.y - 8);
      }
    }
  });
  const choose = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left,
      py = e.clientY - box.top;
    let best: Star | null = null,
      bd = 16;
    for (const p of placed.current) {
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < bd) {
        bd = d;
        best = p.s;
      }
    }
    if (best) onPick(best);
  };
  return (
    <canvas
      ref={ref}
      aria-hidden
      onPointerDown={choose}
      className="h-[420px] w-full cursor-pointer"
    />
  );
}

export function CheckedStars() {
  const start = STARS.find((s) => s.name === "Tau Ceti") ?? STARS[0];
  const [pick, setPick] = useState<Star>(start);
  const isCold = (s: Star) => !!(s.debris || s.dunes || s.sons);
  const split = [
    {
      label: "Both",
      n: STARS.filter((s) => s.listen && isCold(s)).length,
      tone: "bg-other",
    },
    {
      label: "Radio only",
      n: STARS.filter((s) => s.listen && !isCold(s)).length,
      tone: "bg-other/50",
    },
    {
      label: "Cold glow only",
      n: STARS.filter((s) => !s.listen && isCold(s)).length,
      tone: "bg-ink/50",
    },
    {
      label: "Never checked closely",
      n: STARS.filter((s) => s.checks === 0).length,
      tone: "bg-faint",
    },
  ];
  const odds = Math.round(
    1 / (1 - Math.exp(-starsWithin(20) / STARS_PER_MIND)),
  );
  return (
    <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div>
        <StarMap pick={pick} onPick={setPick} />
        <div className={`mt-2 ${KICK}`}>
          HOW THE {STARS.length} STARS WITHIN 20 LY WERE SEARCHED
        </div>
        <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full">
          {split.map((p) => (
            <div
              key={p.label}
              className={p.tone}
              style={{ width: `${(p.n / STARS.length) * 100}%` }}
              title={`${p.label}: ${p.n}`}
            />
          ))}
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
          {split.map((p) => (
            <li key={p.label} className="flex items-center gap-1.5">
              <span className={`inline-block size-2 rounded-full ${p.tone}`} />
              <span className="font-mono tabular-nums">{p.n}</span>
              <span className="text-muted">{p.label.toLowerCase()}</span>
            </li>
          ))}
        </ul>
        <div className={`mt-6 ${KICK}`}>WORTH A CLOSER LOOK</div>
        <ul className="mt-2 flex flex-col gap-2">
          {LOOK.map((l) => {
            const star = STARS.find((s) => s.name === l.name);
            if (!star) return null;
            return (
              <li key={l.name}>
                <button
                  type="button"
                  onClick={() => setPick(star)}
                  className={`text-left text-[14px] leading-[1.45] ${star.name === pick.name ? "text-other" : "hover:text-ink"}`}
                >
                  <span className="font-semibold">{l.name}</span>
                  <span className="text-muted">. {l.why}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-[15px] leading-[1.55]">
          At one mind per {STARS_PER_MIND.toLocaleString("en-US")} stars, there
          is about a 1 in {odds} chance that any mind lies this close.
        </p>
        <label className="mt-4 flex items-center gap-3">
          <span className={KICK}>OR CHOOSE</span>
          <select
            value={pick.name}
            onChange={(e) =>
              setPick(STARS.find((s) => s.name === e.target.value)!)
            }
            className="rounded border border-faint bg-transparent px-2 py-1 text-[14px]"
          >
            {[...STARS]
              .sort((a, b) => a.d - b.d)
              .map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}, {s.d} ly
                </option>
              ))}
          </select>
        </label>
      </div>
      <div aria-live="polite">
        <div className={KICK}>{pick.d} LIGHT-YEARS</div>
        <h4 className="mt-1 text-[20px] font-semibold">{pick.name}</h4>
        <ul className="mt-4 flex flex-col gap-4">
          {record(pick).map((l) => (
            <li key={l.kind} className="border-l border-faint pl-3">
              <div className={KICK}>
                {l.kind.toUpperCase()} · {l.by.toUpperCase()}
              </div>
              <p className="mt-1 text-[14.5px] leading-[1.5]">{l.rules}</p>
              <p className="mt-1 text-[13.5px] leading-[1.5] text-muted">
                {l.not}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px] leading-[1.55] font-semibold">
          {verdict(pick)}
        </p>
        {[pick.listen, pick.debris, pick.dunes, pick.sons].some(
          (x) => x && !x.sure,
        ) && (
          <p className="mt-2 text-[13px] text-muted">
            One search named this star’s companion. This star was in the same
            view, so its record is a little less certain.
          </p>
        )}
      </div>
    </div>
  );
}
