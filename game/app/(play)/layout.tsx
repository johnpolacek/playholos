import { GameProvider } from "@/components/game-provider";
import { Hud } from "@/components/hud";
import { MapStrip } from "@/components/map-strip";
import { Rail } from "@/components/rail";
import { ScanProvider } from "@/components/scan";
import { Opening } from "@/components/wake";

// The whole screen at every size. Tall, as on a phone: the top bar, the map, the tab page and the rail, stacked.
// Wide: the top bar across, the map fills the left, and the tab page and rail stand in a column on the right.
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <Opening className="flex h-dvh w-full flex-col overflow-hidden bg-paper">
        <ScanProvider>
          <div className="flex min-h-0 grow flex-col wide:grid wide:grid-cols-[minmax(0,1fr)_clamp(340px,32vw,440px)] wide:grid-rows-[auto_minmax(0,1fr)_auto]">
            <Hud />
            <MapStrip />
            <main
              data-shell="page"
              className="flex grow flex-col overflow-y-auto bg-panel px-4 pt-3 wide:col-start-2 wide:row-start-2 wide:border-l wide:border-faint"
            >
              {children}
            </main>
            <Rail />
          </div>
        </ScanProvider>
      </Opening>
    </GameProvider>
  );
}
