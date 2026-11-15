import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@ui-sdk/react/slider";

// A value along a line, on ui-sdk's Slider, drawn as the native sliders it replaced were: a thin track, the run to the
// thumb in its color, and a round thumb. The thumb holds a hidden native range, so a phone's screen reader adjusts it
// with its own gestures. Since 2026-11-15. Marks under or over the line, as Holos' own setting, go beside it in the
// caller's own box.

export function Range({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueText,
  tone = "var(--you)",
  reverse = false,
  className = "",
}: {
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
  className?: string;
}) {
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
        <SliderTrack className="relative h-1 w-full rounded-full bg-track">
          <SliderIndicator className="absolute inset-y-0 rounded-full bg-(--tone)" />
          <SliderThumb
            aria-label={label}
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--tone) shadow-[0_0_0_3px_var(--panel)] transition-shadow has-[:focus-visible]:shadow-[0_0_0_3px_var(--panel),0_0_0_5px_var(--tone)]"
          />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}
