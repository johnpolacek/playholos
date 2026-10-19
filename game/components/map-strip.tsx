import { useLocation } from "react-router";
import { useRef, useState } from "react";
import { BeamsMap, useBeams } from "@/components/beams";
import { ReachMap, useReach } from "@/components/reach";
import { ScanMap } from "@/components/scan";
import { SkyArt, useSky } from "@/components/sky";
import { useWorks, WorksMap } from "@/components/works";
import type { Stop } from "@/lib/flight";

// The map's five stops, and its outward button: each tap travels one stop out, and the last comes home.
const STAGES: { id: Stop; name: string; next: string }[] = [
  { id: "earth", name: "EARTH", next: "Solar System ↗" },
  { id: "solar", name: "SOLAR SYSTEM", next: "Nearby stars ↗" },
  { id: "stars", name: "NEARBY STARS", next: "Milky Way ↗" },
  { id: "galaxy", name: "MILKY WAY", next: "Other galaxies ↗" },
  { id: "group", name: "LOCAL GROUP", next: "Back to Earth ↙" },
];

const LABEL =
  "pointer-events-none absolute top-2 left-2.5 rounded-[9px] border border-faint bg-paper px-[7px] py-0.5 font-mono text-[9.5px] tracking-[.06em]";
const BUTTON = "absolute right-2.5 bottom-3 h-8 rounded-full border border-faint bg-paper px-3 text-xs";

// The board: a strip of the map under the top bar, a window onto the game's one sky, which flies here from the
// charter. On Scan and a lead's page it shows Earth's leads. On Projects, a message picked there takes it out to its
// star, and a build to where it would stand. On Reach it flies out from Earth to the nearest star. Elsewhere it rests
// at a stop, turning slowly, travels outward a stop a tap, and turns with a drag.
export function MapStrip() {
  const { pathname: path, search } = useLocation();
  // The walkthroughs, the Scan review and the Projects tour, need room under the map on a phone for the Mind's words.
  const guided = /[?&](review|tour)\b/.test(search);
  const scan = path === "/" || path.startsWith("/lead/");
  const beams = useBeams();
  const aimed = path === "/projects" && beams.picked !== null;
  const works = useWorks();
  const built = path === "/projects" && works.picked !== null;
  const reach = useReach();
  const [tall, setTall] = useState(false);

  // Tall, the strip opens wider at its handle, and gives a walkthrough more room. Wide, the map fills the left of the
  // screen, and needs no handle.
  return (
    <div
      data-shell="map"
      className={`relative shrink-0 overflow-hidden border-b border-faint transition-[height] duration-300 wide:col-start-1 wide:row-span-2 wide:row-start-2 wide:h-auto wide:border-b-0 ${tall ? "h-[72%]" : guided ? "h-[34%]" : "h-[45%]"}`}
    >
      {scan ? (
        <>
          <ScanMap className="absolute inset-0" />
          <span className={LABEL}>LEADS</span>
        </>
      ) : built ? (
        <>
          <WorksMap className="absolute inset-0" />
          <span className={LABEL}>{works.picked!.toUpperCase()}</span>
          <button onClick={() => works.pick(null)} className={BUTTON}>
            Back to Earth ↙
          </button>
        </>
      ) : aimed ? (
        <>
          <BeamsMap className="absolute inset-0" />
          <span className={LABEL}>OUR MESSAGES</span>
          <button onClick={() => beams.pick(beams.list, null)} className={BUTTON}>
            Back to Earth ↙
          </button>
        </>
      ) : path === "/reach" ? (
        <>
          <ReachMap className="absolute inset-0" />
          <span className={LABEL}>FROM EARTH</span>
          <button onClick={() => reach.tour()} className={BUTTON}>
            Fly out again ↗
          </button>
        </>
      ) : (
        <Stops />
      )}
      <button
        onClick={() => setTall(!tall)}
        aria-label={tall ? "Show less of the map" : "Show more of the map"}
        aria-expanded={tall}
        className="absolute bottom-0 left-1/2 flex h-5 w-16 -translate-x-1/2 items-end justify-center pb-[5px] wide:hidden"
      >
        <span className="h-1 w-9 rounded-sm bg-faint" />
      </button>
    </div>
  );
}

// The map at its stops. Back from Scan or our messages, it opens on Earth again.
function Stops() {
  const sky = useSky();
  const [stage, setStage] = useState(0);
  const held = useRef<{ x: number; y: number } | null>(null);

  function travel() {
    const next = (stage + 1) % STAGES.length;
    sky?.go(STAGES[next].id);
    setStage(next);
  }

  const press = (e: React.PointerEvent<HTMLDivElement>) => {
    held.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    const from = held.current;
    if (!from) return;
    const { width, height } = e.currentTarget.getBoundingClientRect();
    sky?.turn((e.clientX - from.x) / width, (e.clientY - from.y) / height);
    held.current = { x: e.clientX, y: e.clientY };
  };
  const release = () => (held.current = null);

  return (
    <>
      <SkyArt mode="map" className="absolute inset-0" />
      <div
        onPointerDown={press}
        onPointerMove={drag}
        onPointerUp={release}
        onPointerCancel={release}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      />
      <span className={LABEL}>{STAGES[stage].name}</span>
      <button onClick={travel} className={BUTTON}>
        {STAGES[stage].next}
      </button>
    </>
  );
}
