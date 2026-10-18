import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { YEAR_0 } from "@/lib/game/clock";
import { KNOCKS } from "@/lib/game/knocks";
import SKY from "@/lib/game/sky.json";

// The card a shared link shows. On the left, the stars within 50 light-years of Sol, the ones "Where things stand"
// sweeps, each at its right ascension and its true distance. Out from Sol run our aimed messages, each as far as it
// has gone by Year 0: some have arrived, the rest are still on their way. On the right, the question and the game.
export const alt =
  "The stars within 50 light-years of Sol, each at its true distance, and how far our messages to them have gone by 2040. Beside them: Are we alone?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#e6e3db";
const MUTED = "#9c988f";
const FAINT = "#34363a";
const PAPER = "#121314";
const YOU = "#5bb8d6";
const OTHER = "#e0a24a";

const STARS = SKY.stars as [ra: number, ly: number, mag: number][];
const TARGETS = SKY.targets as unknown as Record<string, [ra: number, ly: number]>;

// The map: Sol in the middle, right ascension around it, and 50 light-years at the edge.
const C = 315;
const R = 270;
const EDGE = 50;
const RINGS = [10, 25, 50];
const at = (ra: number, ly: number) => {
  const a = (ra / 24) * 2 * Math.PI;
  const r = (ly / EDGE) * R;
  return [C + r * Math.cos(a), C - r * Math.sin(a)].map((v) => v.toFixed(1));
};

function map() {
  const rings = RINGS.map((ly) => `<circle cx="${C}" cy="${C}" r="${(ly / EDGE) * R}" fill="none" stroke="${FAINT}"/>`);
  // Brighter stars are bigger and whiter. Sirius is near -1.4, the faintest red dwarfs near 20.
  const stars = STARS.map(([ra, ly, mag]) => {
    const [x, y] = at(ra, ly);
    const r = Math.max(0.9, 3.8 - 0.2 * mag).toFixed(2);
    const o = Math.min(1, Math.max(0.3, 1 - mag / 17)).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" opacity="${o}"/>`;
  });
  const beams = KNOCKS.map(([, sent, target, ly]) => {
    const [ra, d] = TARGETS[target];
    const gone = Math.min(1, (YEAR_0 - sent) / ly);
    const [x, y] = at(ra, d * gone);
    const end =
      gone < 1
        ? `<circle cx="${x}" cy="${y}" r="3" fill="${OTHER}"/>`
        : `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${OTHER}" stroke-width="1.5"/>`;
    return `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="${OTHER}" stroke-width="1.5" opacity="0.6"/>${end}`;
  });
  const sol = `<circle cx="${C}" cy="${C}" r="16" fill="${YOU}" opacity="0.18"/><circle cx="${C}" cy="${C}" r="5" fill="${YOU}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${C * 2}" height="${C * 2}">${rings.join("")}${stars.join("")}${beams.join("")}${sol}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** A font the game loads through next/font, fetched from Google Fonts as TrueType for the card. */
async function font(family: string, weight: number) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:wght@${weight}`);
  const src = (await css.text()).match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`Google Fonts sent no TrueType for ${family} ${weight}`);
  return (await fetch(src)).arrayBuffer();
}

const mono = { fontFamily: "Plex Mono", fontSize: 13, letterSpacing: 1.4, color: MUTED } as const;

export default async function Image() {
  const [suse, suseBold, plex, mark] = await Promise.all([
    font("SUSE", 400),
    font("SUSE", 600),
    font("IBM Plex Mono", 400),
    readFile(join(process.cwd(), "app/icon.svg"), "base64"),
  ]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: PAPER, fontFamily: "SUSE", color: INK }}>
        <img src={map()} width={C * 2} height={C * 2} alt="" style={{ position: "absolute", left: 15, top: 0 }} />
        {RINGS.map((ly) => (
          <div key={ly} style={{ ...mono, position: "absolute", left: 15 + C + 6, top: C - (ly / EDGE) * R - 18 }}>
            {`${ly} LY`}
          </div>
        ))}
        <div style={{ ...mono, position: "absolute", left: 15 + C - 14, top: C + 18, color: YOU }}>SOL</div>

        <div
          style={{
            position: "absolute",
            left: 680,
            top: 0,
            width: 460,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={`data:image/svg+xml;base64,${mark}`} width={34} height={34} alt="" />
            <div style={{ ...mono, fontSize: 18, letterSpacing: 5.4, color: INK }}>HOLOS</div>
          </div>
          <div style={{ marginTop: 40, fontSize: 74, fontWeight: 600, lineHeight: 1.05 }}>Are we alone?</div>
          <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.4, opacity: 0.88 }}>
            In 2040, humanity wakes as one Mind, and you are its Will.
          </div>
          <div style={{ marginTop: 16, fontSize: 21, lineHeight: 1.45, color: MUTED }}>
            A hard science fiction game based on real physics and research data.
          </div>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...mono, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: 7, background: INK }} />
              STARS WITHIN 50 LIGHT-YEARS, AT TRUE DISTANCE
            </div>
            <div style={{ ...mono, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: 7, background: OTHER }} />
              {`OUR ${KNOCKS.length} MESSAGES, AS FAR AS THEY HAVE GONE BY ${YEAR_0}`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "SUSE", data: suse, weight: 400 },
        { name: "SUSE", data: suseBold, weight: 600 },
        { name: "Plex Mono", data: plex, weight: 400 },
      ],
    },
  );
}
