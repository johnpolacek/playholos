import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";
import { useLayoutEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { VIEWS } from "@/app/views/frame";
import { getSkin, savedSkin, saveSkin, setSkin, SKINS, type Skin, useSkin } from "@/lib/skin";

// The bar over the kit's pages, /ui and /design, as SPEC-01/HARDWARE's sits over its own: the kit's name on the left,
// the pages on the right. The page below takes our blue as --accent. The accent picker left 2026-11-14.
// Since 2026-11-15 the bar picks the skin, as SPEC-01's dots pick its accent: every card and view below changes at
// once, so the two can be compared. The pick is kept per viewer, and leaves with the kit's pages: the game's own
// pages keep the skin they had.

// Each skin's dot, drawn as the skin is: chalk flat, Instrument a dark cap with a lamp, Log a square of ruled paper, Schematic a
// crosshair drawn in a line.
const DOT: Record<Skin, string> = {
  chalk: "bg-button",
  instrument: "bg-[radial-gradient(circle_at_50%_50%,var(--other)_1.5px,transparent_2px),linear-gradient(#2c2e32,#131416)] shadow-[inset_0_0_0_1px_#000]",
  schematic: "rounded-none! bg-[linear-gradient(#bfe6f7,#bfe6f7)_center/100%_1px_no-repeat,linear-gradient(#bfe6f7,#bfe6f7)_center/1px_100%_no-repeat]",
  log: "rounded-[2px]! bg-[repeating-linear-gradient(#14130f_0_3px,#7d7566_3px_4px)] shadow-[inset_0_0_0_1px_#7d7566]",
};

function SkinPicker() {
  const skin = useSkin();
  return (
    <SegmentedControl
      aria-label="Skin"
      value={skin}
      onValueChange={(v) => {
        if (!v) return;
        setSkin(v as Skin);
        saveSkin(v as Skin);
      }}
      className="flex shrink-0 items-center gap-2"
    >
      {SKINS.map((k) => (
        <SegmentedControlItem
          key={k.id}
          value={k.id}
          aria-label={k.name}
          title={k.name}
          className={({ checked }) =>
            `size-3.5 rounded-full outline-offset-4 ${DOT[k.id]} ${checked ? "ring-1 ring-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100"}`
          }
        />
      ))}
    </SegmentedControl>
  );
}

const PAGES = [{ label: "Components", to: "/ui" }, ...VIEWS, { label: "Design", to: "/design" }];

export default function KitLayout() {
  const { pathname } = useLocation();
  // Before the first paint, so a viewer who picked Instrument never sees chalk flash.
  useLayoutEffect(() => {
    const was = getSkin();
    setSkin(savedSkin());
    return () => setSkin(was);
  }, []);
  return (
    <div style={{ "--accent": "var(--you)" } as React.CSSProperties} className="min-h-dvh bg-page pt-2 text-ink">
      <nav className="sticky top-2 z-10 mx-4 flex items-center justify-between gap-4 hw-panel rounded-2xl border border-rowline bg-paper/90 px-4 py-2.5 backdrop-blur sm:mx-auto sm:max-w-6xl">
        <span className="flex items-center gap-4">
          <Link to="/ui" className="engrave font-mono text-[11px] tracking-[.08em] text-ink">
            HOLOS/UI
          </Link>
          <SkinPicker />
        </span>
        <div className="engrave flex flex-wrap justify-end gap-x-4 gap-y-1 font-mono text-[10px] tracking-[.08em] uppercase">
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
