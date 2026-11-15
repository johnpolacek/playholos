import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { TAB_PAGE } from "@/components/tab-head";
import { BeamsProvider } from "@/components/beams";
import { Fate } from "@/components/fate";
import { Crossing } from "@/components/crossing";
import { PreviewProvider } from "@/components/costs";
import { GameProvider } from "@/components/game-provider";
import { Hud } from "@/components/hud";
import { MapStrip } from "@/components/map-strip";
import { MindNews, YearZero } from "@/components/mind-news";
import { GlowOrders } from "@/components/glow-orders";
import { ReachProvider } from "@/components/reach";
import { Rail } from "@/components/rail";
import { ScanProvider } from "@/components/scan";
import { WorksProvider } from "@/components/works";
import { Opening } from "@/components/wake";
import { useLayout } from "@/lib/layout";

// The whole screen at every size. Tall, as on a phone: the top bar, the map, the tab page and the rail, stacked.
// Wide: the top bar across, the map fills the left, and the tab page and rail stand in a column on the right.
export default function PlayLayout() {
  // Each page opens at its top: the panel kept the last page's scroll, so a lead opened mid-way down with Engage and
  // Read its light out of sight, five times in one blind playtest. 2026-11-07.
  const page = useRef<HTMLElement>(null);
  const { pathname, hash } = useLocation();
  // The Light cone layout gives Reach's lanes room: wide, the tab page takes about half the screen. 2026-11-15.
  const cone = useLayout() === "lightcone" && pathname === "/play/reach";
  useEffect(() => {
    // A link to a place on the page, as #close-reading, scrolls there itself. The Mind's talk opens at its latest
    // words, as it scrolls itself: this sent it back to the top, and a note sat cut off below. Blind playtest 2026-11-07.
    if (!hash && pathname !== "/play/mind") page.current?.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return (
    <GameProvider>
      <Crossing />
      <Fate />
      <Opening className="flex h-dvh w-full flex-col overflow-hidden bg-paper">
        <ScanProvider>
          <BeamsProvider>
            <WorksProvider>
              <ReachProvider>
                <PreviewProvider>
                {/* Our standing order to probe each warm glow as we find it. 2026-11-05. */}
                <GlowOrders />
                <div className={`flex min-h-0 grow flex-col wide:grid ${cone ? "wide:grid-cols-[minmax(0,1fr)_clamp(340px,54vw,860px)]" : "wide:grid-cols-[minmax(0,1fr)_clamp(340px,32vw,440px)]"} wide:grid-rows-[auto_minmax(0,1fr)_auto]`}>
                <Hud />
                <MindNews />
                <YearZero />
                <MapStrip />
                <main
                  ref={page}
                  data-shell="page"
                  className={`${TAB_PAGE} wide:col-start-2 wide:row-start-2 wide:border-l wide:border-faint`}
                >
                  <Outlet />
                </main>
                <Rail />
              </div>
                </PreviewProvider>
              </ReachProvider>
            </WorksProvider>
          </BeamsProvider>
        </ScanProvider>
      </Opening>
    </GameProvider>
  );
}
