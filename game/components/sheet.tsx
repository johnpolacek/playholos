import { useRef, useState } from "react";

// A ui-sdk Dialog or Drawer that plays its own GSAP exit before it closes, so a sheet keeps the motion it had as a
// native dialog. 2026-11-14. ui-sdk holds focus inside, closes on Escape or a press outside, and hands focus back to
// the trigger; a close it asks for is held while `exit` plays, then lets go.
//
//   const sheet = useSheet();
//   <Dialog open={sheet.open} onOpenChange={sheet.onOpenChange}> … </Dialog>
//
// The panel inside hands `sheet.exits` its leaving timeline, which calls `done` at its end.

export type Sheet = ReturnType<typeof useSheet>;

export function useSheet() {
  const [open, setOpen] = useState(false);
  const exit = useRef<((done: () => void) => void) | undefined>(undefined);
  const leaving = useRef(false);
  /** Plays the exit and closes. `then` runs once the sheet is gone, outside its animations. */
  const close = (then?: () => void) => {
    if (leaving.current) return;
    leaving.current = true;
    const gone = () => {
      leaving.current = false;
      setOpen(false);
      if (then) setTimeout(then);
    };
    if (exit.current) exit.current(gone);
    else gone();
  };
  const onOpenChange = (next: boolean, details: { cancel(): void }) => {
    if (next) return setOpen(true);
    details.cancel();
    close();
  };
  /** The panel's leaving timeline, which calls `done` at its end. */
  const exits = (play: (done: () => void) => void) => {
    exit.current = play;
  };
  return { open, setOpen, close, exits, onOpenChange };
}

/** A sheet's panel: from the bottom when tall, a card in the middle when wide. Width on wide is the caller's. */
export const SHEET =
  "fixed inset-x-0 top-auto bottom-0 mx-auto flex max-h-dvh w-full max-w-xl flex-col overflow-y-auto rounded-t-2xl border border-b-0 border-faint bg-paper px-5 pt-4 pb-5 text-left text-ink outline-none wide:inset-0 wide:my-auto wide:h-fit wide:max-h-[calc(100dvh-48px)] wide:rounded-2xl wide:border-b";

/** Whether a page's own keys should stand aside: a sheet is open over it, or ui-sdk has already used the key, as on the
 *  Escape that closed one. */
export const overlaid = (e: KeyboardEvent) => e.defaultPrevented || !!document.querySelector('[role="dialog"][aria-modal="true"]');
