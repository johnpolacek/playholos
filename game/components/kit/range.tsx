import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@ui-sdk/react/slider";
import { useRef } from "react";
import { useSkin } from "@/lib/skin";

// A value along a line, on ui-sdk's Slider, drawn as the native sliders it replaced were: a thin track, the run to the
// thumb in its color, and a round thumb. The thumb holds a hidden native range, so a phone's screen reader adjusts it
// with its own gestures. Since 2026-11-15. Marks under or over the line, as Holos' own setting, go beside it in the
// caller's own box.
// Under the Instrument skin, 2026-11-15, the line is a slot with a fader's cap in it. With `knob`, it is a rotary knob
// there instead, where a dial is one of a bank and its number is read beside it: /sim's dials and the research page's.
// Everywhere else, and always in chalk, it stays a line. Under Log, 2026-11-15, the thumb is an index mark, a
// squared tick in the tone, and the line is squared at its ends. Under Infrared,
// 2026-11-15, the line is a heat bar and the thumb its hottest point, white, blooming when focused. Under Arecibo,
// 2026-11-15, the line is a row of bits, app/globals.css, and the thumb one tall bit, ringed in bits when focused.

type Props = {
  value: number;
  onChange(value: number): void;
  min?: number;
  max?: number;
  step?: number;
  /** What it sets, for a screen reader. */
  label: string;
  /** How the value reads aloud, as "20 ly". */
  valueText?: (value: number) => string;
  /** Its color: a CSS color, as var(--other). */
  tone?: string;
  /** High on the left, as a scale that runs from warm to cold. */
  reverse?: boolean;
  /** Under Instrument, a knob in place of the line. */
  knob?: boolean;
  /** Values marked on the knob's ring, as Holos' own setting. A line's marks stay the caller's. */
  marks?: { at: number; tone?: string }[];
  /** The line's box. A knob keeps its own size, and the caller lays it out beside its words with `instrument:`. */
  className?: string;
};

export function Range(props: Props) {
  const skin = useSkin();
  if (props.knob && skin === "instrument") return <Knob {...props} />;
  const { value, onChange, min = 0, max = 100, step = 1, label, valueText, tone = "var(--you)", reverse = false, className = "" } = props;
  return (
    <Slider
      value={value}
      onValueChange={(v) => onChange(v as number)}
      min={min}
      max={max}
      step={step}
      format={valueText}
      dir={reverse ? "rtl" : undefined}
      style={{ "--tone": tone } as React.CSSProperties}
      className={`relative ${className}`}
    >
      <SliderControl className="flex h-5 w-full cursor-pointer touch-none items-center">
        <SliderTrack className="hw-well relative h-1 w-full rounded-full bg-track instrument:h-1.5">
          <SliderIndicator className="absolute inset-y-0 rounded-full bg-(--tone) log:rounded-[1px] instrument:inset-y-px instrument:opacity-80" />
          {/* The fader's cap, under Instrument: the panel's paint, with one line across it in the dial's color. */}
          <SliderThumb
            aria-label={label}
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--tone) shadow-[0_0_0_3px_var(--panel)] transition-shadow has-[:focus-visible]:shadow-[0_0_0_3px_var(--panel),0_0_0_5px_var(--tone)] instrument:h-5 instrument:w-3 instrument:rounded-[3px] instrument:bg-[linear-gradient(90deg,transparent_5px,var(--tone)_5px_7px,transparent_7px),linear-gradient(#3a3c41,#26282c)] instrument:shadow-(--hw-key) instrument:has-[:focus-visible]:shadow-[var(--hw-key),0_0_0_2px_var(--tone)] log:w-[7px] log:rounded-[1px] infrared:bg-[#fff2cf] infrared:shadow-[0_0_0_3px_var(--panel),0_0_8px_3px_color-mix(in_srgb,var(--heat-3)_55%,transparent)] infrared:has-[:focus-visible]:shadow-[0_0_0_3px_var(--panel),var(--bloom)] arecibo:w-1.5 arecibo:rounded-none arecibo:bg-(--bit) arecibo:shadow-[0_0_0_2px_var(--page)] arecibo:has-[:focus-visible]:shadow-[0_0_0_2px_var(--page),0_0_0_4px_var(--bit)]"
          />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

// The knob turns through 270°, from seven o'clock round to five.
const SWEEP = 270;
const TICKS = 27;
/** How far a drag goes to cross the whole range, in pixels. */
const THROW = 180;

/** A rotary knob: a ring of ticks, lit up to where it stands, round a matte cap with one line on it. A drag up or to
 *  the right turns it up. The keys and a screen reader work ui-sdk's Slider, which sits out of sight beside it, as it
 *  does behind Reach's ruler: its arrow keys step, Page Up and Down leap, Home and End go to the ends. Nothing here
 *  moves by itself, so reduced motion has nothing to still. */
function Knob({ value, onChange, min = 0, max = 100, step = 1, label, valueText, tone = "var(--you)", reverse = false, marks = [] }: Props) {
  const box = useRef<HTMLSpanElement>(null);
  const from = useRef<{ x: number; y: number; value: number } | null>(null);
  const frac = (v: number) => {
    const f = Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
    return reverse ? 1 - f : f;
  };
  const at = frac(value);
  const turn = (f: number) => (f - 0.5) * SWEEP;
  const lit = Math.round(at * TICKS);
  return (
    <span ref={box} style={{ "--tone": tone } as React.CSSProperties} className="group relative inline-block size-14 shrink-0">
      <Slider value={value} onValueChange={(v) => onChange(v as number)} min={min} max={max} step={step} format={valueText} dir={reverse ? "rtl" : undefined} className="sr-only">
        <SliderControl>
          <SliderTrack>
            <SliderThumb aria-label={label} />
          </SliderTrack>
        </SliderControl>
      </Slider>
      <span
        aria-hidden
        className="absolute inset-0 cursor-ns-resize touch-none rounded-full select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          from.current = { x: e.clientX, y: e.clientY, value };
          // The keys follow the hand: after a turn, the arrows step it.
          box.current?.querySelector<HTMLInputElement>('input[type="range"]')?.focus({ preventScroll: true });
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          const f = from.current;
          if (!f) return;
          const by = ((e.clientX - f.x - (e.clientY - f.y)) / THROW) * (reverse ? -1 : 1);
          const to = Math.min(max, Math.max(min, f.value + by * (max - min)));
          const snapped = min + Math.round((to - min) / step) * step;
          if (snapped !== value) onChange(Math.min(max, Math.max(min, snapped)));
        }}
        onPointerUp={() => (from.current = null)}
        onPointerCancel={() => (from.current = null)}
      >
        <svg viewBox="-50 -50 100 100" className="absolute inset-0 size-full overflow-visible">
          {Array.from({ length: TICKS + 1 }, (_, i) => (
            <line
              key={i}
              y1={-49}
              y2={i % 9 === 0 ? -41 : -44}
              transform={`rotate(${turn(i / TICKS)})`}
              strokeWidth={i % 9 === 0 ? 2.4 : 1.6}
              stroke={i <= lit && (lit > 0 || i === 0) ? "var(--tone)" : "var(--lamp-off)"}
              opacity={i <= lit ? 0.9 : 1}
            />
          ))}
          {/* A marked value: a longer tick outside the ring. */}
          {marks.map((m, i) => (
            <line key={`m${i}`} y1={-56} y2={-50} transform={`rotate(${turn(frac(m.at))})`} strokeWidth={2.4} stroke={m.tone ?? "var(--muted)"} />
          ))}
        </svg>
        {/* The cap: matte, lit from above, with its line. The ring round it shows when the keys hold it. */}
        <span
          className="absolute inset-[9px] rounded-full bg-[radial-gradient(circle_at_50%_28%,#34363b,#1d1e21_72%)] shadow-[0_0_0_1px_#050506,inset_0_1px_0_rgb(255_255_255/.09),0_3px_5px_rgb(0_0_0/.6)] group-has-[:focus-visible]:shadow-[0_0_0_1px_#050506,0_0_0_3px_var(--tone),inset_0_1px_0_rgb(255_255_255/.09)]"
        >
          <i style={{ rotate: `${turn(at)}deg` }} className="absolute inset-0 bg-[linear-gradient(var(--tone),var(--tone))] bg-[size:2px_9px] bg-[position:50%_3px] bg-no-repeat" />
        </span>
      </span>
    </span>
  );
}
