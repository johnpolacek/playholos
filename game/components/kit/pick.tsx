import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectLabel, SelectTrigger, SelectValue } from "@ui-sdk/react/select";

// One of many, from a list that opens, on ui-sdk's Select: the arrow keys and typing find an item, and on a small touch
// screen it opens as a sheet. Drawn as the native select it replaced was, a quiet outline, with our panel for its
// list. 2026-11-15. Under the Instrument skin its trigger is a key and its list a panel.

export function Pick({
  label,
  labelClass = "",
  value,
  onChange,
  options,
  className = "",
}: {
  /** Its name, shown before it. */
  label: React.ReactNode;
  labelClass?: string;
  value: string;
  onChange(value: string): void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => v && onChange(v as string)} presentation="auto">
      <span className={`flex items-center gap-3 ${className}`}>
        <SelectLabel className={labelClass}>{label}</SelectLabel>
        <SelectTrigger className="hw-key hw-key-dark inline-flex items-center gap-2 rounded border whitespace-nowrap border-faint px-2 py-1 text-[14px] transition-colors hover:border-muted data-open:border-muted">
          <SelectValue />
          <span aria-hidden className="text-[10px] text-muted">
            ▾
          </span>
        </SelectTrigger>
      </span>
      <SelectContent
        sideOffset={4}
        className="max-h-[min(60dvh,var(--available-height))] min-w-(--anchor-width) hw-panel overflow-y-auto rounded-lg border border-faint bg-panel p-1 text-[14px] text-ink shadow-lg shadow-black/40 outline-none data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:pb-6"
      >
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            className="flex cursor-pointer items-center justify-between gap-4 rounded px-2 py-1.5 outline-none data-highlighted:bg-ink/10"
          >
            {o.label}
            <SelectItemIndicator className="text-you">✓</SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
