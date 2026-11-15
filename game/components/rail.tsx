import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useGame } from "@/components/game-provider";
import { useMindUnread } from "@/components/mind-news";
import { heardId, useLeads } from "@/components/scan";

const TABS = [
  { label: "Scan", href: "/play" },
  { label: "Build", href: "/play/build" },
  { label: "Reach", href: "/play/reach" },
  { label: "Mind", href: "/play/mind" },
] as const;

// Build's tab goes back to where Build was left: a player left the strategies to ask the Mind, came back by the tab to
// a plain list, and took the checklist to find the strategies again. Blind playtest 2026-11-07.
let buildAt = "/play/build";

export function Rail() {
  const { pathname: path, search } = useLocation();
  // Only before Begin: once play runs, the tab opens our queue. A blind first-timer came back to the strategies after
  // Begin and looked for the queue. 2026-11-07.
  const began = useGame().year !== null;
  useEffect(() => {
    if (path === "/play/build") buildAt = path + search;
  }, [path, search]);
  // A reading landed and not yet opened marks Scan. A signal from someone else, not yet opened, marks it louder, with
  // their count in their color, 2026-10-29.
  const { fresh, heard } = useLeads();
  const news = fresh.size > 0;
  const calls = heard.filter((h) => !h.ours && fresh.has(heardId(h))).length;
  // The Mind told us something unasked that we haven't read. 2026-10-31.
  const said = useMindUnread() && path !== "/play/mind";
  return (
    <RailNav>
      {TABS.map(({ label, href }) => {
        // A lead's page is part of Scan, and a build's of Build.
        const on =
          path === href || (href === "/play" && path.startsWith("/play/lead/")) || (href === "/play/build" && path.startsWith("/play/build/"));
        return (
          <RailTab
            key={href}
            to={href === "/play/build" && !on && !began ? buildAt : href}
            label={label}
            on={on}
            calls={href === "/play" ? calls : 0}
            dot={(href === "/play" && news) || (href === "/play/mind" && said)}
            aria-label={href === "/play/mind" && said ? `${label}, the Mind told us something` : href === "/play" && calls ? `${label}, ${calls === 1 ? "a signal" : `${calls} signals`} heard` : href === "/play" && news ? `${label}, a new reading` : undefined}
          />
        );
      })}
    </RailNav>
  );
}

/** The rail, drawn: four tabs in a band along the foot of the screen. Rail feeds it the game's tabs, and /ui's views
 *  fixed ones. 2026-11-15. */
export function RailNav({ children }: { children: React.ReactNode }) {
  return (
    <nav data-shell="rail" aria-label="Main" className="hw-panel grid h-16 shrink-0 grid-cols-4 border-t border-faint bg-paper instrument:gap-1.5 instrument:p-2 wide:col-start-2 wide:row-start-3 wide:border-l">
      {children}
    </nav>
  );
}

/** One tab on the rail: its name, lit when we are on it, with a count of signals heard in their color, or a dot for
 *  news. Shared with /ui. 2026-11-14. Under the Instrument skin, 2026-11-15, each tab is a key on the panel, and the
 *  one we are on is held down, with a lamp line lit over its name in place of the line across its top. */
export function RailTab({
  to,
  label,
  on,
  calls = 0,
  dot = false,
  "aria-label": aria,
}: {
  to: string;
  label: string;
  on: boolean;
  calls?: number;
  dot?: boolean;
  "aria-label"?: string;
}) {
  return (
    <Link
      to={to}
      aria-current={on ? "page" : undefined}
      aria-label={aria}
      // The rail's own mark, so a skin can tell a tab from a key drawn on its own. 2026-11-15.
      data-rail
      // A tab with calls waiting is tinted. Under Schematic, 2026-11-15, nothing is filled, so it is hatched, as
      // anything queued is. Under Infrared, the tab we are on is the warm one: its line amber.
      className={`flex items-center justify-center gap-1.5 text-[11px] hw-key-dark instrument:rounded-[7px] instrument:border instrument:font-mono instrument:tracking-[.08em] instrument:uppercase ${on ? "font-semibold text-ink shadow-[inset_0_2px_0_var(--ink)] instrument:shadow-[inset_0_1px_3px_rgb(0_0_0/.7),inset_0_-2px_0_var(--ink)] instrument:bg-none instrument:bg-track infrared:shadow-[inset_0_2px_0_var(--heat-3)]" : "text-muted instrument:shadow-(--hw-key)"} ${calls ? "bg-other/10 schematic:bg-transparent schematic:bg-(image:--hatch)" : ""}`}
    >
      {label}
      {calls > 0 ? (
        <span aria-hidden className="min-w-4 rounded-full bg-other px-1 text-center font-mono text-[10px] leading-4 font-semibold text-page">
          {calls}
        </span>
      ) : (
        dot && <span aria-hidden className="size-1.5 rounded-full bg-you" />
      )}
    </Link>
  );
}
