import { Link, useLocation } from "react-router";
import { heardId, useLeads } from "@/components/scan";

const TABS = [
  { label: "Scan", href: "/" },
  { label: "Build", href: "/build" },
  { label: "Reach", href: "/reach" },
  { label: "Mind", href: "/mind" },
] as const;

export function Rail() {
  const path = useLocation().pathname;
  // A reading landed and not yet opened marks Scan. A signal from someone else, not yet opened, marks it louder, with
  // their count in their color, 2026-10-29.
  const { fresh, heard } = useLeads();
  const news = fresh.size > 0;
  const calls = heard.filter((h) => !h.ours && fresh.has(heardId(h))).length;
  return (
    <nav data-shell="rail" aria-label="Main" className="grid h-16 shrink-0 grid-cols-4 border-t border-faint bg-paper wide:col-start-2 wide:row-start-3 wide:border-l">
      {TABS.map(({ label, href }) => {
        // A lead's page is part of Scan, and a build's of Build.
        const on =
          path === href || (href === "/" && path.startsWith("/lead/")) || (href === "/build" && path.startsWith("/build/"));
        return (
          <Link
            key={href}
            to={href}
            aria-current={on ? "page" : undefined}
            aria-label={href === "/" && calls ? `${label}, ${calls === 1 ? "a signal" : `${calls} signals`} heard` : href === "/" && news ? `${label}, a new reading` : undefined}
            className={`flex items-center justify-center gap-1.5 text-[11px] ${on ? "font-semibold text-ink shadow-[inset_0_2px_0_var(--ink)]" : "text-muted"} ${href === "/" && calls ? "bg-other/10" : ""}`}
          >
            {label}
            {href === "/" && calls > 0 ? (
              <span aria-hidden className="min-w-4 rounded-full bg-other px-1 text-center font-mono text-[10px] leading-4 font-semibold text-page">
                {calls}
              </span>
            ) : (
              href === "/" && news && <span aria-hidden className="size-1.5 rounded-full bg-you" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
