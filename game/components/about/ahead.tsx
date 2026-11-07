import { useMemo, useRef } from "react";
import { monthOf, WATCH, yearOf } from "@/lib/about/updates";
import { color, KICK, useCanvas } from "./dials";

// The road ahead, on /about/updates: today on the left, each result the game waits on along the line by its date. A
// light runs from today to each in turn and the words say what it will settle. The pointer picks one instead. A
// hollow dot is a rough date.

const STEP = 3.2,
  PAD = 14,
  BASE = 0.78,
  LANE = 28;
const END = 2029.5;

export function Ahead() {
  const items = useMemo(
    () =>
      [...WATCH]
        .sort((a, b) => a.when.localeCompare(b.when))
        .map((w) => ({ ...w, year: yearOf(w.when) })),
    [],
  );
  const pointer = useRef<number | null>(null);
  const said = useRef<HTMLParagraphElement>(null);
  const shown = useRef("");
  const now = useMemo(() => {
    const d = new Date();
    return d.getUTCFullYear() + d.getUTCMonth() / 12 + d.getUTCDate() / 365;
  }, []);

  const START = now - 0.04;
  const ref = useCanvas((c, w, h, t) => {
    // Time runs on a square root, so the next months, where most results land, get the room.
    const x = (y: number) =>
      PAD +
      Math.sqrt(Math.max(0, y - START) / (END - START)) * (w - 2 * PAD - 60);
    const base = h * BASE;
    const ink = color("--ink"),
      you = color("--you"),
      other = color("--other"),
      muted = color("--muted");
    const wide = w > 640;
    c.font = "10.5px var(--font-plex-mono), monospace";

    // Lanes: each label takes the lowest lane where it clears the one before it.
    const ends: number[] = [];
    const lane = items.map((it) => {
      const lx = x(it.year),
        lw = wide ? c.measureText(it.name.toUpperCase()).width + 14 : 10;
      let l = 0;
      while ((ends[l] ?? -Infinity) > lx) l++;
      ends[l] = lx + lw;
      return l;
    });

    // Which one is lit: the pointer's nearest, or each in turn.
    const turn = Math.floor(t / STEP) % items.length;
    const lit =
      pointer.current === null
        ? turn
        : items.reduce(
            (best, it, i) =>
              Math.abs(x(it.year) - pointer.current!) <
              Math.abs(x(items[best].year) - pointer.current!)
                ? i
                : best,
            0,
          );

    // The years.
    c.fillStyle = muted;
    c.globalAlpha = 1;
    c.fillRect(x(START), base, x(END) - x(START), 1);
    for (let y = Math.ceil(START); y <= END; y++) {
      c.fillRect(x(y), base, 1, 5);
      c.fillText(`${y}`, x(y) - 14, base + 18);
    }

    // Today, breathing.
    const nx = x(now),
      breath = 0.5 + 0.5 * Math.sin(t * 2);
    c.fillStyle = you;
    c.globalAlpha = 0.2 + 0.25 * breath;
    c.beginPath();
    c.arc(nx, base, 7 + 3 * breath, 0, 2 * Math.PI);
    c.fill();
    c.globalAlpha = 1;
    c.beginPath();
    c.arc(nx, base, 3.5, 0, 2 * Math.PI);
    c.fill();
    c.fillText("TODAY", nx - 16, base + 32);

    // The light running from today to the lit one.
    const tx = x(items[lit].year);
    const run =
      pointer.current === null ? Math.min(1, ((t % STEP) / STEP) * 2.5) : 1;
    const head = nx + (tx - nx) * (1 - (1 - run) ** 3);
    const grad = c.createLinearGradient(nx, 0, head, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, other);
    c.fillStyle = grad;
    c.fillRect(nx, base - 1, Math.max(0, head - nx), 3);

    // Each result: a stem up to its lane, a dot on the line, its name.
    items.forEach((it, i) => {
      const ix = x(it.year),
        top = base - 22 - lane[i] * LANE,
        on = i === lit;
      c.globalAlpha = on ? 1 : 0.45;
      c.fillStyle = on ? other : muted;
      c.fillRect(ix, top, 1, base - top);
      c.strokeStyle = on ? other : ink;
      c.fillStyle = on ? other : ink;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(ix, base, on ? 5 : 3.5, 0, 2 * Math.PI);
      if (it.rough) c.stroke();
      else c.fill();
      if (wide || on) {
        c.fillStyle = on ? ink : muted;
        const label = it.name.toUpperCase(),
          lw = c.measureText(label).width;
        c.fillText(label, Math.min(ix + 5, w - PAD - lw), top + 4);
      }
    });
    c.globalAlpha = 1;

    const line = `${it(items[lit])}`;
    if (said.current && line !== shown.current) {
      said.current.textContent = line;
      shown.current = line;
    }
  });

  const follow = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointer.current = e.clientX - e.currentTarget.getBoundingClientRect().left;
  };

  return (
    <section
      id="ahead"
      aria-label="The road ahead"
      className="mx-auto max-w-[1180px] scroll-mt-16 px-4 pb-16"
    >
      <h2
        data-a
        className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
      >
        What are we waiting on?
      </h2>
      <p
        data-a
        className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        Each of these could change the game. When one lands, we read it, and
        the game moves to match.
      </p>
      <div data-a className="mt-8">
        <canvas
          ref={ref}
          aria-hidden
          onPointerMove={follow}
          onPointerDown={follow}
          onPointerLeave={() => (pointer.current = null)}
          className="h-[280px] w-full cursor-ew-resize touch-pan-y"
        />
        <p
          ref={said}
          aria-live="off"
          className="mt-4 min-h-[3em] max-w-[60ch] text-[15px] leading-[1.55]"
        />
        <ol className="sr-only">
          {items.map((w) => (
            <li key={w.name}>{it(w)}</li>
          ))}
        </ol>
        <div className={`mt-2 ${KICK}`}>HOLLOW DOT · A ROUGH DATE</div>
      </div>
    </section>
  );
}

const it = (w: (typeof WATCH)[number]) =>
  `${w.rough ? "About " : ""}${monthOf(w.when)}, ${w.name}. ${w.settles}`;
