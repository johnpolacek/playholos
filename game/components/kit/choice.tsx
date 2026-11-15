import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { useId } from "react";
import { useSkin } from "@/lib/skin";

// One of a few, all in view, on ui-sdk's SegmentedControl: the arrow keys move and choose, and a screen reader hears a
// radio group. Four looks, as the game draws them. 2026-11-15.
// Under the Instrument skin, 2026-11-15, the track is a well and the chosen one a key standing in it. A switch build's
// two sides are a real switch there, ui-sdk's Switch: a lever between its two names, thrown toward the one that holds.
// Under the Log skin, 2026-11-15, each is squared, and a lens or a switch's side is a stamp, the chosen one inked.

const LOOK = {
  /** Small type in a settings card: the Mind's model and effort. */
  dial: {
    root: "flex items-center gap-0.5 hw-well instrument:rounded-[6px] instrument:p-0.5",
    item: (on: boolean) => `rounded-full px-2 py-0.5 transition-colors instrument:rounded-[4px] ${on ? "bg-button text-paper hw-key" : "text-page-ink2 hover:text-ink"}`,
  },
  /** Two or three in a framed track: a send's reach and repeat. */
  pair: {
    root: "inline-flex self-start rounded-full border border-frame p-0.5 hw-well instrument:rounded-[8px] instrument:p-[3px]",
    item: (on: boolean) => `rounded-full px-3 py-[5px] text-[12px] instrument:rounded-[5px] ${on ? "bg-faint text-ink hw-key" : "text-muted"}`,
  },
  /** Chips over a list, each its own pill: Scan's lenses. */
  lens: {
    root: "flex gap-1.5",
    item: (on: boolean) =>
      `h-7 rounded-full px-3 text-[12.5px] font-medium transition-colors instrument:rounded-[7px] ${on ? "bg-button text-paper hw-key stamp" : "border border-faint text-page-ink2 hover:border-muted hw-key-dark stamp"}`,
  },
  /** Two halves of one wide track: a switch build's sides. An option's `on` colors it when chosen. */
  switch: {
    root: "grid grid-cols-2 gap-1 rounded-full bg-ink/[.06] p-1 log:rounded-[3px]",
    item: (on: boolean) => `h-9 rounded-full text-[13.5px] font-medium transition-colors log:rounded-[2px] ${on ? "stamp" : "text-page-ink2 hover:text-ink"}`,
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
  const skin = useSkin();
  const id = useId();
  // A real switch, for two sides under Instrument. The first option is its on side.
  if (look === "switch" && skin === "instrument" && options.length === 2) {
    const [a, b] = options;
    const on = value === a.value;
    return (
      <Switch
        aria-label={label}
        aria-describedby={`${id}-${on ? "a" : "b"}`}
        checked={on}
        onCheckedChange={(to) => onChange(to ? a.value : b.value)}
        className={`group grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg px-2 py-1.5 text-[13.5px] font-medium ${className}`.trim()}
      >
        {/* The side that holds is lit: on in the build's color, with its lamp, and off in plain chalk. */}
        <span id={`${id}-a`} className="flex items-center justify-end gap-2 text-right text-muted transition-colors group-data-checked:text-[color:var(--c,var(--ink))] motion-reduce:transition-none">
          <i aria-hidden className="size-1.5 shrink-0 rounded-full bg-[var(--lamp-off)] transition-[background-color,box-shadow] group-data-checked:bg-[var(--c,var(--ink))] group-data-checked:shadow-[0_0_5px_color-mix(in_srgb,var(--c,var(--ink))_60%,transparent)] motion-reduce:transition-none" />
          {a.label}
        </span>
        {/* The slot and its lever, with three ridges for a thumb. It slides in a sixth of a second, or at once under
            reduced motion. */}
        <span aria-hidden className="hw-well relative h-[26px] w-[52px] rounded-[7px]">
          <SwitchThumb className="hw-key absolute top-[3px] left-[25px] h-5 w-6 rounded-[5px] bg-[repeating-linear-gradient(90deg,transparent_0_2px,rgb(0_0_0/.45)_2px_3px,transparent_3px_5px),linear-gradient(#3a3c41,#26282c)] bg-[position:center] bg-[size:13px_10px,auto] bg-no-repeat transition-[left] duration-150 ease-out data-checked:left-[3px] motion-reduce:transition-none" />
        </span>
        <span id={`${id}-b`} className="text-left text-ink transition-colors group-data-checked:text-muted motion-reduce:transition-none">
          {b.label}
        </span>
      </Switch>
    );
  }
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
