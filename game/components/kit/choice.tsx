import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";

// One of a few, all in view, on ui-sdk's SegmentedControl: the arrow keys move and choose, and a screen reader hears a
// radio group. Four looks, as the game draws them. 2026-11-15.

const LOOK = {
  /** Small type in a settings card: the Mind's model and effort. */
  dial: {
    root: "flex items-center gap-0.5",
    item: (on: boolean) => `rounded-full px-2 py-0.5 transition-colors ${on ? "bg-button text-paper" : "text-page-ink2 hover:text-ink"}`,
  },
  /** Two or three in a framed track: a send's reach and repeat. */
  pair: {
    root: "inline-flex self-start rounded-full border border-frame p-0.5",
    item: (on: boolean) => `rounded-full px-3 py-[5px] text-[12px] ${on ? "bg-faint text-ink" : "text-muted"}`,
  },
  /** Chips over a list, each its own pill: Scan's lenses. */
  lens: {
    root: "flex gap-1.5",
    item: (on: boolean) =>
      `h-7 rounded-full px-3 text-[12.5px] font-medium transition-colors ${on ? "bg-button text-paper" : "border border-faint text-page-ink2 hover:border-muted"}`,
  },
  /** Two halves of one wide track: a switch build's sides. An option's `on` colors it when chosen. */
  switch: {
    root: "grid grid-cols-2 gap-1 rounded-full bg-ink/[.06] p-1",
    item: (on: boolean) => `h-9 rounded-full text-[13.5px] font-medium transition-colors ${on ? "" : "text-page-ink2 hover:text-ink"}`,
  },
} as const;

export type ChoiceLook = keyof typeof LOOK;
export type ChoiceOption = { value: string; label: React.ReactNode; on?: string };

export function Choice({
  label,
  value,
  onChange,
  options,
  look = "pair",
  className = "",
}: {
  /** What the choice is, for a screen reader. */
  label: string;
  value: string;
  onChange(value: string): void;
  options: ChoiceOption[];
  look?: ChoiceLook;
  className?: string;
}) {
  const l = LOOK[look];
  return (
    <SegmentedControl aria-label={label} value={value} onValueChange={(v) => v && onChange(v)} className={`${l.root} ${className}`.trim()}>
      {options.map((o) => (
        <SegmentedControlItem
          key={o.value}
          value={o.value}
          className={({ checked }) => `${l.item(checked)} ${checked ? (o.on ?? (look === "switch" ? "bg-button text-paper" : "")) : ""}`.trim()}
        >
          {o.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
