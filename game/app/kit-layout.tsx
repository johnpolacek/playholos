import { Link, Outlet, useLocation } from "react-router";

// The bar over the kit's pages, /ui and /design, as SPEC-01/HARDWARE's sits over its own: the kit's name on the left,
// the pages on the right. The page below takes our blue as --accent. The accent picker left 2026-11-14.

const PAGES = [
  { label: "Components", to: "/ui" },
  { label: "Design", to: "/design" },
];

export default function KitLayout() {
  const { pathname } = useLocation();
  return (
    <div style={{ "--accent": "var(--you)" } as React.CSSProperties} className="min-h-dvh bg-page pt-2 text-ink">
      <nav className="sticky top-2 z-10 mx-4 flex items-center justify-between gap-4 rounded-2xl border border-rowline bg-paper/90 px-4 py-2.5 backdrop-blur sm:mx-auto sm:max-w-5xl">
        <Link to="/ui" className="font-mono text-[11px] tracking-[.08em] text-ink">
          HOLOS/UI
        </Link>
        <div className="flex gap-4 font-mono text-[10px] tracking-[.08em] uppercase">
          {PAGES.map((p) => {
            const on = pathname === p.to;
            return (
              <Link
                key={p.to}
                to={p.to}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-1.5 ${on ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <i className={`size-1.5 rounded-full ${on ? "bg-[var(--accent)]" : "bg-faint"}`} />
                {p.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
