import { useEffect, useState } from "react";
import { useSkin } from "@/lib/skin";

// Focus under the Schematic skin, 2026-11-15: a crosshair, as a draftsman marks a point. Four construction lines run
// along the focused control's edges, four pixels out, and on past each corner, so its corners are crossed. It follows
// keyboard focus only, as :focus-visible does, and draws nothing in the other skins, where the outline is focus. It
// lies over the page, never takes a press, and a screen reader never hears it. Under reduced motion it moves at once.
// The thin ring under it, in app/globals.css, holds focus where this can't reach, as before the script has loaded.

const PAD = 12;
const OUT = 4;

/** The box a focus shows on. A control's own input can be hidden at a pixel wide, so it shows on what holds it. */
function boxOf(el: Element) {
  let at: Element | null = el;
  while (at && at.getBoundingClientRect().width < 4) at = at.parentElement;
  return (at ?? el).getBoundingClientRect();
}

export function Crosshair() {
  const skin = useSkin();
  const [box, setBox] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (skin !== "schematic") return;
    let el: Element | null = null;
    const place = () => setBox(el?.isConnected ? boxOf(el) : null);
    const on = (e: FocusEvent) => {
      const t = e.target;
      el = t instanceof Element && t.matches(":focus-visible") ? t : null;
      place();
    };
    const off = () => {
      el = null;
      setBox(null);
    };
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", off);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("focusin", on);
      document.removeEventListener("focusout", off);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [skin]);
  if (skin !== "schematic" || !box) return null;
  const at = PAD - OUT;
  const ink = "linear-gradient(var(--ink),var(--ink))";
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[200] transition-[left,top,width,height] duration-150 ease-out motion-reduce:transition-none"
      style={{
        left: box.left - PAD,
        top: box.top - PAD,
        width: box.width + PAD * 2,
        height: box.height + PAD * 2,
        background: [
          `${ink} 0 ${at}px / 100% 1px no-repeat`,
          `${ink} 0 calc(100% - ${at}px) / 100% 1px no-repeat`,
          `${ink} ${at}px 0 / 1px 100% no-repeat`,
          `${ink} calc(100% - ${at}px) 0 / 1px 100% no-repeat`,
        ].join(", "),
      }}
    />
  );
}
