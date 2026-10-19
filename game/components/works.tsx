import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { tenths, YEAR_0 } from "@/lib/game/clock";
import { type Site, SITES } from "@/lib/game/sites";
import type { Plan } from "@/lib/game/types";
import type { Dials, Mark } from "@/lib/drift";
import { AU_KM } from "../../src/astronomy.js";
import { moonOffset } from "../../src/ephemeris.js";

// Our builds on the map. Picking one in Projects flies the map to where it would stand and draws it there: dashed
// while it waits, drawn round as it goes up, lit once done. Pointing at another while the map is out turns to it.
// Picking it again, or Back to Earth, brings the map home. The map shows one thing at a time, so picking a build puts
// a message back.

/** One of our builds with a place on the map, as the plan has it now. */
export interface Work {
  name: string;
  site: Site;
  /** In the queue, or under way. */
  queued: boolean;
  /** When it is done, in Years from Year 0. Null when not queued, or past 40 Years. */
  done: number | null;
}

/** Our builds with places, as the plan has them: queued or not, and when each queued one is done. */
export const placedOf = (plan: Plan, done: Record<string, number | null>): Work[] =>
  Object.entries(SITES).map(([name, { site }]) => {
    const queued = plan.builds.includes(name);
    return { name, site, queued, done: queued ? (done[name] ?? null) : null };
  });

interface Works {
  list: Work[];
  /** The build shown, by name. Null with the map at its stops. */
  picked: string | null;
  dials: Dials;
  /** Our builds with places, whenever the plan changes. */
  set(list: Work[]): void;
  /** Picks a build, or none, which brings the map home. */
  pick(name: string | null): void;
  /** Points at a build while the map is out, or stops pointing. */
  peek(name: string | null): void;
}

const WorksContext = createContext<Works>({
  list: [],
  picked: null,
  dials: {},
  set() {},
  pick() {},
  peek() {},
});
export const useWorks = () => use(WorksContext);

export function WorksProvider({ children }: { children: React.ReactNode }) {
  const { pick: aimBeam } = useBeams();
  const [list, setList] = useState<Work[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [dials] = useState<Dials>(() => ({ focus: 0, year: YEAR_0 }));
  const held = useRef<string | null>(null);
  const now = useRef<Work[]>([]);
  // The build in view, counted from 1: the one pointed at, or else the one picked.
  const focus = useCallback(
    (name: string | null) =>
      void Object.assign(dials, { focus: now.current.findIndex((w) => w.name === (name ?? held.current)) + 1 }),
    [dials],
  );
  const set = useCallback(
    (next: Work[]) => {
      now.current = next;
      setList(next);
      focus(null);
    },
    [focus],
  );
  const pick = useCallback(
    (name: string | null) => {
      held.current = name;
      setPicked(name);
      focus(null);
      if (name !== null) aimBeam([], null);
    },
    [aimBeam, focus],
  );
  const value = useMemo(
    () => ({ list, picked, dials, set, pick, peek: focus }),
    [list, picked, dials, set, pick, focus],
  );
  return <WorksContext value={value}>{children}</WorksContext>;
}

/** Where a build is, in words: waiting, how much is built, or done. Built evenly from Year 0, near enough. */
function state(w: Work, year: number | null) {
  if (!w.queued) return "Not queued";
  if (w.done === null) return "Past Year 40";
  if (year === null) return `Done Year ${tenths(w.done)}`;
  return year >= w.done ? "Built" : `${Math.floor((100 * year) / w.done)}% built`;
}

/** Which way a place off the map is, as an arrow: one of eight, from the map's middle. */
function toward(dx: number, dy: number) {
  return ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"][(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8];
}

/** The map on our builds: the one in view where it would stand, how far along it is, and from the Moon or L2, which
 *  way Earth is, in light. */
export function WorksMap({ className }: { className: string }) {
  const { list, dials } = useWorks();
  const { year } = useGame();
  useEffect(() => void Object.assign(dials, { year: YEAR_0 + (year ?? 0) }), [dials, year]);
  // Light from Earth to the Moon today, and to L2, in seconds.
  const [light] = useState(() => {
    const m = moonOffset(new Date());
    return (Math.hypot(m.x, m.y, m.z) * AU_KM) / 299792.458;
  });
  const l2 = (list.find((w) => w.site.on === "l2")?.site.km ?? 1.5e6) / 299792.458;
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback((marks: Mark[]) => {
    // Only the build in view is named, at its places, and Earth only from the Moon or L2.
    for (const [id, n] of Object.entries(names.current))
      if (n && !id.startsWith("arrow:") && !marks.some((m) => m.id === id)) n.style.opacity = "0";
    for (const { id, x, y, a } of marks) {
      const n = names.current[id];
      const box = n?.parentElement;
      if (!n || !box) continue;
      if (id.startsWith("site:")) {
        n.style.transform = `translate(${x + 26}px, ${y}px) translate(0, -50%)`;
        n.style.opacity = String(a);
        continue;
      }
      // Earth: where it is, or held at the map's edge with an arrow its way.
      const [w, h] = [box.clientWidth, box.clientHeight];
      const pad = 18;
      const inside = x > pad && x < w - pad && y > pad && y < h - pad;
      const [cx, cy] = [w / 2, h / 2];
      const k = inside
        ? 1
        : Math.min((w / 2 - pad) / Math.abs(x - cx || 1e-6), (h / 2 - pad) / Math.abs(y - cy || 1e-6));
      const [ex, ey] = [cx + (x - cx) * k, cy + (y - cy) * k];
      const arrow = names.current[`arrow:${id.slice("earth:".length)}`];
      if (arrow) arrow.textContent = inside ? "" : `${toward(x - cx, y - cy)} `;
      n.style.transform = `translate(${ex}px, ${ey}px) translate(${ex > cx ? "-100%" : "0"}, ${ey > cy ? "-100%" : "0"})`;
      n.style.opacity = String(a);
    }
  }, []);
  const label =
    "pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 [text-shadow:0_0_4px_#121314,0_0_8px_#121314]";
  return (
    <SkyArt mode="works" dials={dials} works={list} onMarks={onMarks} className={className}>
      {list.flatMap((w) =>
        w.site.places.map((pl, k) => (
          <span
            key={`${w.name}:${k}`}
            ref={(n) => {
              names.current[`site:${w.name}:${k}`] = n;
            }}
            className={`${label} leading-snug`}
          >
            <span className="block text-you">{pl.name}</span>
            <span className="block text-ink">{state(w, year)}</span>
          </span>
        )),
      )}
      {(
        [
          ["moon", light],
          ["l2", l2],
        ] as const
      ).map(([from, secs]) => (
        <span
          key={from}
          ref={(n) => {
            names.current[`earth:${from}`] = n;
          }}
          className={`${label} text-muted`}
        >
          <span
            ref={(n) => {
              names.current[`arrow:${from}`] = n;
            }}
          />
          Earth · {secs.toFixed(2)} light-seconds
        </span>
      ))}
    </SkyArt>
  );
}
