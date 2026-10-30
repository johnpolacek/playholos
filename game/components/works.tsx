import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { SkyArt } from "@/components/sky";
import { tenths, YEAR_0 } from "@/lib/game/clock";
import { CLOSE } from "@/lib/game/close";
import { GROWS, grownSpans } from "@/lib/game/halo";
import { keptOf, ordered, takenAt } from "@/lib/game/plan";
import { type Site, SITES } from "@/lib/game/sites";
import type { Plan } from "@/lib/game/types";
import type { Dials, Mark } from "@/lib/drift";
import { AU_KM } from "../../src/astronomy.js";
import { bodyPosition, moonOffset } from "../../src/ephemeris.js";

// Our builds on the map. Opening one's page in Build flies the map to where it would stand and draws it there: dashed
// while it waits, drawn round as it goes up, lit once done. Close View flies on down to the ground there, where the
// build is drawn as it would look. Leaving the page, or Back to Earth, brings the map home. The map shows one thing at
// a time, so picking a build puts a message back.

/** One of our builds with a place on the map, as the plan has it now. */
export interface Work {
  name: string;
  site: Site;
  /** In the queue, or under way. */
  queued: boolean;
  /** When it is done, in Years from Year 0. Null when not queued, or past 40 Years. */
  done: number | null;
  /** Taken back in play: the share of it built then, or null for Thought Fields, which keeps no work. 2026-10-23. */
  back?: number | null;
  /** For a build that grows once done: the Years it grew, as spans, the last open while it grows. 2026-10-29. */
  spans?: [number, number | null][];
}

/** Our builds with places, as the plan has them: queued or not, when each queued one is done, and how much of one
 *  taken back was built, with this game's compute. */
export const placedOf = (plan: Plan, done: Record<string, number | null>, scale: number): Work[] =>
  Object.entries(SITES).map(([name, { site }]) => {
    const queued = ordered(plan).includes(name);
    const at = takenAt(plan, name);
    const back = at === null ? {} : { back: keptOf(plan, scale, name, at)?.built ?? null };
    const grows = GROWS.includes(name) ? { spans: grownSpans(plan, scale, name) } : {};
    return { name, site, queued, done: queued ? (done[name] ?? null) : null, ...back, ...grows };
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
  /** Down at the build picked, in its Close View. */
  close: boolean;
  /** Flies down to the build picked, or back up. */
  setClose(on: boolean): void;
}

const WorksContext = createContext<Works>({
  list: [],
  picked: null,
  dials: {},
  set() {},
  pick() {},
  close: false,
  setClose() {},
});
export const useWorks = () => use(WorksContext);

export function WorksProvider({ children }: { children: React.ReactNode }) {
  const { pick: aimBeam } = useBeams();
  const [list, setList] = useState<Work[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [close, setDown] = useState(false);
  const [dials] = useState<Dials>(() => ({ focus: 0, year: YEAR_0, close: 0 }));
  const held = useRef<string | null>(null);
  const now = useRef<Work[]>([]);
  // The build in view, the one picked, counted from 1.
  const focus = useCallback(
    () => void Object.assign(dials, { focus: now.current.findIndex((w) => w.name === held.current) + 1 }),
    [dials],
  );
  const set = useCallback(
    (next: Work[]) => {
      now.current = next;
      setList(next);
      focus();
    },
    [focus],
  );
  const setClose = useCallback(
    (on: boolean) => {
      Object.assign(dials, { close: Number(on) });
      setDown(on);
    },
    [dials],
  );
  // Another build, or none, starts from its own view again.
  const pick = useCallback(
    (name: string | null) => {
      if (name !== held.current) setClose(false);
      held.current = name;
      setPicked(name);
      focus();
      if (name !== null) aimBeam([], null);
    },
    [aimBeam, focus, setClose],
  );
  const value = useMemo(
    () => ({ list, picked, dials, set, pick, close, setClose }),
    [list, picked, dials, set, pick, close, setClose],
  );
  return <WorksContext value={value}>{children}</WorksContext>;
}

/** Where a build is, in words: waiting, how much is built, or done. Built evenly from Year 0, near enough. */
function state(w: Work, year: number | null) {
  // The Cold Halo, or the Solar Swarm, taken back once built is held at its size, not undone. 2026-10-28.
  if (GROWS.includes(w.name) && w.back === null) return "Built, held at its size";
  if (w.back !== undefined) return w.back === null ? "Taken back" : `Taken back, ${Math.floor(100 * w.back)}% built`;
  if (!w.queued) return "Not queued";
  if (w.done === null) return "Past Year 1,000";
  if (year === null) return `Done by Year ${tenths(w.done)}`;
  return year >= w.done ? "Built" : `${Math.floor((100 * year) / w.done)}% built`;
}

/** Which way a place off the map is, as an arrow: one of eight, from the map's middle. */
function toward(dx: number, dy: number) {
  return ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"][(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8];
}

/** The map on our builds: the one in view where it would stand, how far along it is, and from the Moon or L2, which
 *  way Earth is, in light. */
export function WorksMap({ className }: { className: string }) {
  const { list, dials, close, setClose } = useWorks();
  const { year } = useGame();
  useEffect(() => void Object.assign(dials, { year: YEAR_0 + (year ?? 0) }), [dials, year]);
  // Light from Earth to the Moon today, and to L2, in seconds.
  const [light] = useState(() => {
    const m = moonOffset(new Date());
    return (Math.hypot(m.x, m.y, m.z) * AU_KM) / 299792.458;
  });
  const l2 = (list.find((w) => w.site.on === "l2")?.site.km ?? 1.5e6) / 299792.458;
  const l4 = (list.find((w) => w.site.on === "l4")?.site.km ?? 149_597_871) / 299792.458;
  // From a planet, Earth is light-minutes away, as far as it is today. 2026-10-29.
  const [planet] = useState(() => {
    const at = (name: string) => bodyPosition(name, new Date());
    return (body: string) => {
      const [p, e] = [at(body), at("Earth")];
      return (Math.hypot(p.x - e.x, p.y - e.y, p.z - e.z) * AU_KM) / 299792.458 / 60;
    };
  });
  const bodies = [...new Set(list.flatMap((w) => (w.site.on === "planet" ? [w.site.body!] : [])))];
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback((marks: Mark[]) => {
    // Only the build in view is named, at its places, and Earth only from the Moon or L2.
    for (const [id, n] of Object.entries(names.current))
      if (n && !id.startsWith("arrow:") && !marks.some((m) => m.id === id)) {
        n.style.opacity = "0";
        n.style.visibility = "hidden";
      }
    for (const { id, x, y, a } of marks) {
      const n = names.current[id];
      const box = n?.parentElement;
      if (!n || !box) continue;
      if (id.startsWith("site:")) {
        // Beside its place, or on its left where the right would run off the map, as on a phone.
        const left = x + 26 + n.offsetWidth > box.clientWidth - 8;
        n.style.transform = left
          ? `translate(${x - 26}px, ${y}px) translate(-100%, -50%)`
          : `translate(${x + 26}px, ${y}px) translate(0, -50%)`;
        n.style.textAlign = left ? "right" : "left";
        n.style.opacity = String(a);
        // Hidden, its name can't be tapped.
        n.style.visibility = a > 0.02 ? "visible" : "hidden";
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
        w.site.places.map((pl, k) => {
          const words = (
            <>
              <span className="block tracking-[.08em] text-ink">{w.name.toUpperCase()}</span>
              <span className="block text-you">{pl.name}</span>
              <span className="block text-ink">{state(w, year)}</span>
            </>
          );
          return (
            <span
              key={`${w.name}:${k}`}
              ref={(n) => {
                names.current[`site:${w.name}:${k}`] = n;
              }}
              className={`${label} leading-snug`}
            >
              {/* A tap on its name takes the map down to it, as Close View does. */}
              {CLOSE[w.name] && !close ? (
                <button
                  tabIndex={-1}
                  onClick={() => setClose(true)}
                  className="pointer-events-auto cursor-pointer [text-align:inherit]"
                >
                  {words}
                </button>
              ) : (
                words
              )}
            </span>
          );
        }),
      )}
      {(
        [
          ["moon", light],
          ["l2", l2],
          ["l4", l4],
          ...bodies.map((b) => [`planet:${b}`, planet(b) * 60] as const),
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
          Earth
          <span className="block">{from.startsWith("planet:") ? `${(secs / 60).toFixed(1)} light-minutes` : `${secs.toFixed(2)} light-seconds`}</span>
        </span>
      ))}
    </SkyArt>
  );
}
