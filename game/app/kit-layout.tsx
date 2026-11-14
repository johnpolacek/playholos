import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

// The bar over the kit's pages, /ui and /design, as SPEC-01/HARDWARE's sits over its own: the accents on the left,
// the pages on the right. The accent it sets carries to the page below as --accent. 2026-11-14.

const ACCENTS = ["you", "other", "think", "see", "lift", "reach", "keep"] as const;

const PAGES = [
  { label: "Components", to: "/ui" },
  { label: "Design", to: "/design" },
];

export default function KitLayout() {
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>("you");
  const { pathname } = useLocation();
  return (
    <div style={{ "--accent": `var(--${accent})` } as React.CSSProperties} className="min-h-dvh bg-page pt-2 text-ink">
      <nav className="sticky top-2 z-10 mx-4 flex items-center justify-between gap-4 rounded-2xl border border-rowline bg-paper/90 px-4 py-2.5 backdrop-blur sm:mx-auto sm:max-w-5xl">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Accent">
          {ACCENTS.map((a) => (
            <button
              key={a}
              role="radio"
              aria-checked={a === accent}
              aria-label={a}
              onClick={() => setAccent(a)}
              className={`size-4 rounded-full ${a === accent ? "ring-2 ring-ink/70 ring-offset-2 ring-offset-paper" : ""}`}
              style={{ background: `var(--${a})` }}
            />
          ))}
        </div>
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
