import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from "@ui-sdk/react/drawer";
import type { Source } from "@/lib/game/sources";

// The ⓘ on a memory screen, and the sheet it opens: the real record behind the screen, with canonical links.
// The sheet rises over the whole phone and sinks away on close. On ui-sdk's Drawer since 2026-11-14, our first part
// on it: it keeps focus inside while open, closes on Escape, a press outside or a drag down, and hands focus back to
// the ⓘ. With reduced motion it fades in place of sliding.

/** A small ⓘ that opens the screen's real record. Its tap never hurries the screen's intro. */
export function Sources({ sources }: { sources: Source[] }) {
  const phone = typeof document === "undefined" ? null : document.getElementById("phone");
  return (
    <Drawer>
      <DrawerTrigger
        data-m="kick"
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="The real record"
        className="-ml-2.5 flex h-9 w-9 items-center justify-center text-muted"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="8" cy="8" r="7" />
          <path d="M8 7v4.5M8 4.6v.1" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      </DrawerTrigger>
      <DrawerBackdrop className="bg-black/55" />
      <DrawerContent
        container={phone}
        initialFocus="content"
        className="mx-auto flex max-h-[78dvh] w-full max-w-[560px] flex-col rounded-t-[22px] border-t border-faint bg-paper font-sans tracking-normal text-ink normal-case outline-none sm:border-x"
      >
        <div aria-hidden className="mx-auto mt-2 h-1 w-9 rounded-full bg-faint" />
        <div className="flex items-center justify-between px-5 pt-2 pb-2">
          <DrawerTitle className="font-mono text-[10.5px] font-normal tracking-[.1em] text-muted">THE REAL RECORD</DrawerTitle>
          <DrawerClose aria-label="Close" className="-mr-2 h-9 w-9 text-xl leading-none text-muted">
            ×
          </DrawerClose>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8">
          {sources.map((s) => (
            <div key={s.title} className="flex flex-col gap-1">
              <b className="text-[15px] font-semibold">{s.title}</b>
              <p className="text-[13.5px] leading-[1.45] text-muted">{s.text}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {s.links.map(([label, url]) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-you underline decoration-you/40 underline-offset-2"
                  >
                    {label} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
