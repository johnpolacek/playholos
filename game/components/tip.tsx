import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";

// A short hint on a control, on ui-sdk's Tooltip since 2026-11-14, in place of the browser's title: it shows on focus
// as well as hover, a tap shows it on a phone, and a screen reader hears it with the control.

/** `trigger` is the element the hint is about. Its props and ref pass through. */
export function Tip({ text, trigger, toggleable }: { text: string; trigger: React.ReactElement<Record<string, unknown>>; toggleable?: boolean }) {
  return (
    <Tooltip toggleable={toggleable}>
      <TooltipTrigger render={trigger} />
      <TooltipContent
        sideOffset={6}
        collisionPadding={8}
        className="hw-panel max-w-[240px] rounded-md border border-faint bg-panel instrument:rounded-[4px] px-2.5 py-1.5 text-[12px] leading-snug text-ink normal-case tracking-normal shadow-lg shadow-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
