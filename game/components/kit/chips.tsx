import { Toggle, ToggleGroup } from "@ui-sdk/react/toggle";

// A row of small chips under a mono head, one of them lit, on ui-sdk's ToggleGroup: the arrow keys move between them and
// a press lights one. The ideas the Mind has explained on Build, to read again. 2026-11-15. Under the Instrument skin
// each chip is a small key, and the lit one is held down.

export function Chips({
  head,
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  /** The words before the chips, as "IDEAS MET · 3 OF 9". */
  head: React.ReactNode;
  /** What they are, for a screen reader. */
  label: string;
  value: string;
  onChange(value: string): void;
  options: { value: string; label: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-[5px] font-mono text-[9.5px] tracking-[.08em] text-muted ${className}`}>
      <span className="engrave mr-0.5">{head}</span>
      <ToggleGroup aria-label={label} value={[value]} onValueChange={(v) => v[0] && onChange(v[0])} deselectable={false} className="contents">
        {options.map((o) => (
          <Toggle
            key={o.value}
            value={o.value}
            className={({ pressed }) =>
              `rounded-full border px-2 py-[3px] text-[10.5px] tracking-normal hw-key-dark instrument:rounded-[4px] ${pressed ? "border-you/70 text-you instrument:shadow-(--hw-key-down)" : "border-faint text-page-ink2 hover:border-muted instrument:shadow-(--hw-key)"}`
            }
          >
            {o.label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
