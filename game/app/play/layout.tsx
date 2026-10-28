import { Outlet } from "react-router";
import { BeamsProvider } from "@/components/beams";
import { Fate } from "@/components/fate";
import { Crossing } from "@/components/crossing";
import { PreviewProvider } from "@/components/costs";
import { GameProvider } from "@/components/game-provider";
import { Hud } from "@/components/hud";
import { Listening } from "@/components/listening";
import { MapStrip } from "@/components/map-strip";
import { ReachProvider } from "@/components/reach";
import { Rail } from "@/components/rail";
import { ScanProvider } from "@/components/scan";
import { WorksProvider } from "@/components/works";
import { Opening } from "@/components/wake";

// The whole screen at every size. Tall, as on a phone: the top bar, the map, the tab page and the rail, stacked.
// Wide: the top bar across, the map fills the left, and the tab page and rail stand in a column on the right.
export default function PlayLayout() {
  return (
    <GameProvider>
      <Listening />
      <Crossing />
      <Fate />
      <Opening className="flex h-dvh w-full flex-col overflow-hidden bg-paper">
        <ScanProvider>
          <BeamsProvider>
            <WorksProvider>
              <ReachProvider>
                <PreviewProvider>
                <div className="flex min-h-0 grow flex-col wide:grid wide:grid-cols-[minmax(0,1fr)_clamp(340px,32vw,440px)] wide:grid-rows-[auto_minmax(0,1fr)_auto]">
                <Hud />
                <MapStrip />
                <main
                  data-shell="page"
                  className="flex grow flex-col overflow-y-auto bg-panel px-4 pt-3 wide:col-start-2 wide:row-start-2 wide:border-l wide:border-faint"
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
