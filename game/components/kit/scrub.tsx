import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@ui-sdk/react/slider";

// The Year scrubber, on ui-sdk's Slider: "now" as a handle on the axis of Years, with its Year written over it. The
// arrow keys move it a tenth of a Year, Page Up and Down a leap, Home and End to the ends, and a screen reader hears
// the Year. It looks ahead and back along the axis and changes nothing: the game's clock is its own. 2026-11-15.
// The handle moves with the hand, so there is no motion of its own to still under reduced motion.

export function Scrub({
  value,
  onChange,
  range,
  step = 0.1,
  label = "Now, along the Years",
  format,
  className = "",
}: {
  value: number;
  onChange(value: number): void;
  /** The axis's first and last Year. */
  range: [number, number];
  step?: number;
  label?: string;
  /** How a Year reads, as "Year 41.0". */
  format(year: number): string;
  className?: string;
}) {
  return (
    <Slider value={value} onValueChange={(v) => onChange(v as number)} min={range[0]} max={range[1]} step={step} largeStep={10} format={format} className={`relative ${className}`}>
      <SliderControl className="flex h-9 w-full cursor-ew-resize touch-none items-end pb-2">
        <SliderTrack className="relative h-px w-full bg-faint">
          {/* What is behind us on the axis, in chalk. */}
          <SliderIndicator className="absolute inset-y-0 bg-muted" />
          <SliderThumb
            aria-label={label}
            className="group absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2"
          >
            <i className="absolute inset-0 rotate-45 rounded-[2px] bg-ink shadow-[0_0_0_3px_var(--panel)] transition-shadow group-has-[:focus-visible]:shadow-[0_0_0_3px_var(--panel),0_0_0_5px_var(--ink)] motion-reduce:transition-none" />
            {/* Its Year over the handle. It slides from the handle's right at the axis's start to its left at the
                end, so it never runs off either. */}
            <span
              aria-hidden
              style={{ translate: `${-((value - range[0]) / (range[1] - range[0] || 1)) * 100}%` }}
              className="pointer-events-none absolute bottom-[calc(100%+7px)] left-1/2 font-mono text-[10.5px] tracking-[.04em] whitespace-nowrap text-ink"
            >
              NOW · {format(value)}
            </span>
          </SliderThumb>
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}
