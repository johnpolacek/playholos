// A view on /ui: one of the game's screens as a device, laid out as SPEC-01/HARDWARE lays out its own views. A dot, a
// code and a name over it, the screen drawn by the game's own parts, fed a fixed Earth, and the parts named under it,
// each with its card's number on /ui. 2026-11-15.

/** The /ui pages: the kit's cards, then each view. The bar over them reads this. */
export const VIEWS = [
  { to: "/ui/top-bar", label: "Top bar" },
  { to: "/ui/scan", label: "Scan" },
  { to: "/ui/lead", label: "Lead" },
  { to: "/ui/build", label: "Build" },
  { to: "/ui/build-page", label: "Build page" },
  { to: "/ui/reach", label: "Reach" },
  { to: "/ui/destination", label: "Destination" },
  { to: "/ui/mind", label: "Mind" },
  { to: "/ui/send", label: "Send" },
];

export function View({
  code,
  name,
  parts,
  wide = false,
  children,
}: {
  /** Its model number, as SPEC-01 names its own: TB-1 and the like. */
  code: string;
  name: string;
  /** The kit's parts it is built from, as /ui names them. */
  parts: string[];
  /** As wide as the game on a desktop. Otherwise a phone's width. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto px-4 pt-12 pb-24">
      <section className={`mx-auto rounded-[28px] border border-rowline bg-panel p-4 shadow-[0_30px_60px_-30px_rgb(0_0_0/.8)] ${wide ? "max-w-[1320px]" : "max-w-[440px]"}`}>
        <header className="mb-3 flex items-center gap-2 px-1 font-mono text-[10px] tracking-[.1em] uppercase">
          <i className="size-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-ink">{code}</span>
          <span className="text-muted">{name}</span>
        </header>
        {/* The screen: the game's paper, with its edge. */}
        <div className="overflow-hidden rounded-2xl border border-faint bg-paper">{children}</div>
      </section>
      <p className="mx-auto mt-5 max-w-[60ch] text-center font-mono text-[10.5px] leading-relaxed tracking-[.06em] text-muted uppercase">
        Built from {parts.join(" · ")}
      </p>
    </main>
  );
}
