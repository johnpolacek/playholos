import { useMemo, useRef } from "react";
import {
  ages,
  BIN,
  EARTH,
  earthThen,
  PEER_SHARE,
  SOURCES,
  SPAN,
} from "@/lib/about/ages";
import { round } from "@/lib/about/dials";
import { color, KICK, Sources, useCanvas } from "./dials";

// How old are they, on /about/research: when every mind woke, set against Earth's own past. A line sweeps from 7
// billion years ago to now, lighting the minds already awake, and the words say what Earth was then.

const SWEEP = 14,
  REST = 2.5;
const TOP = 26,
  FLOOR = 0.62,
  PAD = 12;

function Timeline() {
  const a = useMemo(() => ages(), []);
  const peak = Math.max(...a.bins);
  const pointer = useRef<number | null>(null);
  const said = useRef<HTMLParagraphElement>(null);
  const shown = useRef("");
  const ref = useCanvas((c, w, h, t) => {
    const x = (gyr: number) => PAD + (1 - gyr / SPAN) * (w - 2 * PAD);
    const base = h * FLOOR;
    const ink = color("--ink"),
      other = color("--other"),
      you = color("--you"),
      muted = color("--muted");
    // Where the line stands: the pointer's time, or the sweep's, or the typical mind's when nothing moves.
    const loop = t % (SWEEP + REST);
    const at =
      pointer.current ??
      (t === 0 ? a.median : SPAN * Math.max(0, 1 - loop / SWEEP));
    // The middle two thirds, and the typical mind.
    c.fillStyle = muted;
    c.globalAlpha = 0.08;
    c.fillRect(x(a.hi), TOP, x(a.lo) - x(a.hi), base - TOP);
    c.globalAlpha = 0.7;
    c.fillRect(x(a.median), TOP - 4, 1, base - TOP + 4);
    c.font = "10.5px var(--font-plex-mono), monospace";
    c.fillText(
      `TYPICAL, ${a.median.toFixed(1)} BILLION YEARS`,
      x(a.median) + 6,
      TOP + 6,
    );
    // Each bin of minds: lit once awake.
    const bw = Math.max(1, x(0) - x(BIN) - 1.5);
    a.bins.forEach((share, i) => {
      const gyr = (i + 0.5) * BIN,
        bh = (share / peak) * (base - TOP - 20);
      c.fillStyle = gyr >= at ? ink : muted;
      c.globalAlpha = gyr >= at ? 0.85 : 0.22;
      c.fillRect(x(gyr) - bw / 2, base - bh, bw, bh);
    });
    // Billions of years ago.
    c.globalAlpha = 1;
    c.fillStyle = muted;
    c.fillRect(x(SPAN), base, x(0) - x(SPAN), 1);
    for (let g = 0; g <= SPAN; g++) {
      c.fillRect(x(g), base, 1, 4);
      c.fillText(
        g === 0 ? "NOW" : `${g}`,
        x(g) - (g === 0 ? 10 : 3),
        base + 16,
      );
    }
    c.fillText("BILLION YEARS AGO", x(SPAN), base + 30);
    // Earth's own past, beneath.
    const row = base + 52;
    c.fillRect(x(EARTH[0].gyr), row, x(0) - x(EARTH[0].gyr), 1);
    EARTH.forEach((e, i) => {
      const ex = x(e.gyr),
        up = i % 2 === 0;
      c.fillStyle = e.gyr === 0 ? you : ink;
      c.beginPath();
      c.arc(ex, row, 3, 0, 2 * Math.PI);
      c.fill();
      c.fillStyle = e.gyr === 0 ? you : muted;
      const label = e.label.toUpperCase(),
        lw = c.measureText(label).width;
      c.fillText(
        label,
        Math.min(ex - lw / 2, w - PAD - lw),
        up ? row + 18 : row + 32,
      );
    });
    // The line.
    c.fillStyle = other;
    c.fillRect(x(at), TOP - 10, 1.5, row - TOP + 10);
    c.beginPath();
    c.arc(x(at), row, 4, 0, 2 * Math.PI);
    c.fill();
    // The words, only when they change.
    const line = `${at.toFixed(1)} billion years ago, ${Math.round(a.awakeBy(at) * 100)}% of the minds awake now were already awake. ${earthThen(at)}.`;
    if (said.current && line !== shown.current) {
      said.current.textContent = line;
      shown.current = line;
    }
  });
  const follow = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - box.left - PAD) / (box.width - 2 * PAD);
    pointer.current = Math.min(SPAN, Math.max(0, (1 - f) * SPAN));
  };
  return (
    <div data-a>
      <canvas
        ref={ref}
        aria-hidden
        onPointerMove={follow}
        onPointerDown={follow}
        onPointerLeave={() => (pointer.current = null)}
        className="h-[300px] w-full cursor-ew-resize touch-pan-y"
      />
      <p
        ref={said}
        className="mt-4 min-h-[3em] max-w-[60ch] text-[15px] leading-[1.55]"
      />
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-mono text-[26px] leading-none tabular-nums">
        {value}
      </dd>
      <dt className={`mt-1.5 ${KICK}`}>{label.toUpperCase()}</dt>
    </div>
  );
}

export function Ages() {
  const a = useMemo(() => ages(), []);
  return (
    <section
      id="ages"
      aria-label="How old are they"
      className="mx-auto max-w-[1180px] scroll-mt-16 px-4 pb-16"
    >
      <h2
        data-a
        className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
      >
        How old are they?
      </h2>
      <p
        data-a
        className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        Most worlds like ours are older than Earth, so nearly every mind we
        could meet woke long before us.
      </p>
      <dl data-a className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
        <Stat
          value={`${a.median.toFixed(1)} billion`}
          label="Years ahead, the typical mind"
        />
        <Stat
          value={`${a.lo.toFixed(1)} to ${a.hi.toFixed(1)}`}
          label="Billion years, two thirds of them"
        />
        <Stat
          value={`1 in ${round(1 / PEER_SHARE)}`}
          label="Woke within 100,000 years of us"
        />
      </dl>
      <div className="mt-8">
        <Timeline />
        <Sources list={SOURCES} />
      </div>
    </section>
  );
}
