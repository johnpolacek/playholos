import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { useLayoutEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Toggle } from "@ui-sdk/react/toggle";
import { VIEWS } from "@/app/views/frame";
import { musicAway } from "@/lib/music";
import { setSound, useSound } from "@/lib/sound";
import { getSkin, savedSkin, saveSkin, setSkin, SKINS, type Skin, useSkin } from "@/lib/skin";

// The bar over the kit's pages, /ui and /design, as SPEC-01/HARDWARE's sits over its own: the kit's name on the left,
// the pages on the right. The page below takes our blue as --accent. The accent picker left 2026-11-14.
// Since 2026-11-15 the bar picks the skin: every card and view below changes at
// once, so the two can be compared. The pick is kept per viewer, and leaves with the kit's pages: the game's own
// pages keep the skin they had. The game's music stays off here, so the sound key is the only sound: it was the
// controls' clicks alone, and the music went on under it. 2026-11-21.

// Each skin's swatch, drawn as the skin is: chalk flat, Instrument a dark cap with a lamp, Log a square of ruled
// paper, Infrared a hot point cooling to violet, Arecibo a
// square of dithered bits, Hardware a charcoal key with its indigo lamp.
const DOT: Record<Skin, string> = {
  chalk: "rounded-full bg-button",
  instrument: "rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--other)_1.5px,transparent_2px),linear-gradient(#2c2e32,#131416)] shadow-[inset_0_0_0_1px_#000]",
  log: "rounded-[2px] bg-[repeating-linear-gradient(#14130f_0_3px,#7d7566_3px_4px)] shadow-[inset_0_0_0_1px_#7d7566]",
  hardware: "rounded-full bg-[radial-gradient(circle,#818cf8_0_2px,transparent_2.5px),linear-gradient(#36363a,#222224)] shadow-[0_1px_0_#000,inset_0_0_0_1px_#646468]",
  arecibo: "bg-[conic-gradient(#e6e3db_25%,#000_0_50%,#e6e3db_0_75%,#000_0)] bg-[length:4px_4px] shadow-[0_0_0_1px_#e6e3db]",
  infrared: "rounded-full bg-[radial-gradient(circle,#fff2cf_0,#f4a53c_25%,#e2533e_45%,#b9418f_65%,#2a1846_90%)]",
};

const Swatch = ({ id }: { id: Skin }) => <i aria-hidden className={`block size-3.5 shrink-0 ${DOT[id]}`} />;

// The picker, 2026-11-15. It was a row of bare dots, and with four skins a playtest couldn't tell what they were or
// that there were more. Now it names the skin it is in, and opens a list of each, with its swatch and what it draws
// the game as, on ui-sdk's Select: the arrow keys and typing find one, and on a small touch screen it opens as a
// sheet. A screen reader hears "Skin" and the skin's name; the swatches are aria-hidden. The list fades in, or shows
// at once under reduced motion.
function SkinPicker() {
  const skin = useSkin();
  return (
    <Select
      items={SKINS.map((k) => ({ value: k.id, label: k.name }))}
      value={skin}
      onValueChange={(v) => {
        if (!v) return;
        setSkin(v as Skin);
        saveSkin(v as Skin);
      }}
      presentation="auto"
    >
      <span className="flex shrink-0 items-center gap-2">
        <SelectLabel className="engrave font-mono text-[10px] tracking-[.08em] text-muted uppercase max-2xl:sr-only">Skin</SelectLabel>
        <SelectTrigger className="hw-key hw-key-dark inline-flex h-7 items-center gap-2 rounded-full border border-faint pr-2.5 pl-2 font-mono text-[10.5px] tracking-[.08em] text-ink uppercase transition-colors instrument:rounded-[7px] hover:border-muted data-open:border-muted">
          {/* The swatch is drawn from the skin, not ui-sdk's SelectValueIcon: that copies the chosen item's icon only
              once the list has opened, so the trigger grew by a swatch on the first open and the bar shifted.
              2026-11-15. */}
          <Swatch id={skin} />
          {/* On a phone the bar shows the swatch alone, so the sound key beside it fits; the name is still read. */}
          <SelectValue className="max-sm:sr-only" />
          <span aria-hidden className="text-[9px] text-muted">
            ▾
          </span>
        </SelectTrigger>
      </span>
      <SelectContent
        sideOffset={6}
        className="hw-panel min-w-[240px] rounded-lg border border-faint bg-panel p-1 text-ink shadow-lg shadow-black/40 outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:pb-6 motion-reduce:transition-none"
      >
        {SKINS.map((k) => (
          <SelectItem
            key={k.id}
            value={k.id}
            className="flex cursor-pointer items-center gap-3 rounded px-2.5 py-2 outline-none data-highlighted:bg-ink/10"
          >
            <SelectItemIcon>
              <Swatch id={k.id} />
            </SelectItemIcon>
            <span className="flex min-w-0 grow flex-col">
              <SelectItemText className="text-[14px] leading-snug">{k.name}</SelectItemText>
              <span className="text-[12px] leading-snug text-page-ink2">{k.as}</span>
            </span>
            <SelectItemIndicator className="text-you">✓</SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// The sound key, as SPEC-01's bar has: on, every control here clicks as it is touched, lib/sound.ts. A Toggle, so a
// screen reader hears "Sound" and whether it is pressed. 2026-11-16.
function SoundKey() {
  const on = useSound();
  return (
    <Toggle
      aria-label="Sound"
      pressed={on}
      onPressedChange={setSound}
      className="hw-key hw-key-dark inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-faint text-muted transition-colors hover:text-ink data-pressed:text-ink"
    >
      <svg aria-hidden width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" />
        {on ? <path d="M10.5 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.8a6 6 0 0 1 0 8.4" /> : <path d="M10.6 6.2l3.4 3.6M14 6.2l-3.4 3.6" />}
      </svg>
    </Toggle>
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
  useLayoutEffect(() => {
    musicAway(true);
    return () => musicAway(false);
  }, []);
  return (
    <div style={{ "--accent": "var(--you)" } as React.CSSProperties} className="min-h-dvh bg-page pt-2 text-ink">
      <nav className="sticky top-2 z-10 mx-4 flex items-center justify-between gap-4 hw-panel rounded-2xl border border-rowline bg-paper/90 px-4 py-2.5 backdrop-blur sm:mx-auto sm:max-w-6xl">
        <span className="flex items-center gap-4">
          <Link to="/ui" className="engrave font-mono text-[11px] tracking-[.08em] text-ink">
            HOLOS/UI
          </Link>
          <SkinPicker />
          <SoundKey />
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
