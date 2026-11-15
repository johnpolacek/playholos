import { Button } from "@ui-sdk/react/button";

// The game's buttons, on ui-sdk's Button: a size and a fill, the patterns the screens had written out by hand, named
// once. 2026-11-15. Add margins and layout with className; the look stays here. `btn()` gives the same classes to a
// Link or a trigger that must render as something else.
// Under the Instrument skin, 2026-11-15, a button is a key: squared, standing off the panel, and down under a press.
// The one move is a chalk key, ours and theirs keep their colors, and a second or quiet move is in the panel's paint.

const SIZE = {
  /** The column's main buttons, full width under a page. */
  page: "h-[46px] text-[15px] font-medium",
  /** A walk's steps and a build page's choices. */
  step: "h-11 text-[15px] font-medium",
  /** A button in a row or a card. */
  row: "h-8 px-3.5 text-[13px] font-medium",
  /** A small chip. */
  small: "h-7 px-3 text-[12.5px] font-medium",
} as const;

const FILL = {
  /** The one move: chalk on the dark. */
  solid: "bg-button text-paper hw-key",
  /** A second move beside it. */
  line: "border border-ink hw-key hw-key-dark",
  /** A quiet one. */
  faint: "border border-faint hw-key-dark",
  /** Ours to send. */
  you: "bg-you text-paper transition-[filter] hover:brightness-110 hw-key",
  /** The other minds' color, for what touches them. */
  other: "bg-other text-paper transition-[filter] hover:brightness-110 hw-key",
} as const;

export type BtnSize = keyof typeof SIZE;
export type BtnFill = keyof typeof FILL;

export const btn = (size: BtnSize = "row", fill: BtnFill = "solid") => `rounded-full instrument:rounded-[7px] ${SIZE[size]} ${FILL[fill]}`;

export function Btn({
  size = "row",
  fill = "solid",
  className = "",
  ...rest
}: React.ComponentProps<typeof Button> & { size?: BtnSize; fill?: BtnFill; className?: string }) {
  return <Button {...rest} className={`${btn(size, fill)} ${className}`.trim()} />;
}

/** A small pill over the map, on its paper, with an icon before its words: Close View, Pull Back, Back to Earth. */
export const PILL = "inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper pr-3 pl-2.5 text-xs hw-key hw-key-dark instrument:rounded-[7px]";

export function MapPill({ className = "", ...rest }: React.ComponentProps<typeof Button> & { className?: string }) {
  return <Button {...rest} className={`${PILL} ${className}`.trim()} />;
}
