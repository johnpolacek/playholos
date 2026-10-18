import { createContext, use } from "react";

// The way out of the game, as to the about pages. The opening gives it, and links call it with where to go.
export const LeaveFor = createContext<(href: string) => void>((href) => location.assign(href));
export const useLeaveFor = () => use(LeaveFor);

/** A click a link may take over: the main button, no keys held. The others open tabs and windows as usual. */
export const plainClick = (e: React.MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
