import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible";

// A list folded shut under its head, on ui-sdk's Collapsible: the head says what is in it and how many, its chevron
// turns as it opens, and shut, a line says why nothing there needs us. Scan's Quiet leads and past messages. 2026-11-15.

export function Fold({
  label,
  open,
  onOpenChange,
  shut,
  className = "mt-5",
  children,
}: {
  /** Its head, as "Quiet · 9". */
  label: React.ReactNode;
  open: boolean;
  onOpenChange(open: boolean): void;
  /** What shows while it is shut. */
  shut: React.ReactNode;
  className?: string;
  /** The list's rows, each an li. */
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        className={`engrave flex w-full items-baseline justify-between pr-5 text-left font-mono text-[10px] tracking-[.1em] text-muted uppercase hover:text-ink ${className}`}
      >
        <span>{label}</span>
        <span className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}>›</span>
      </CollapsibleTrigger>
      <CollapsiblePanel render={<ul />} className="mt-1 flex flex-col">
        {children}
      </CollapsiblePanel>
      {!open && <p className="mt-1 border-t border-faint py-2.5 text-[13.5px] text-page-ink2">{shut}</p>}
    </Collapsible>
  );
}
