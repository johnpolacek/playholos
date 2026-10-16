import { Hud } from "@/components/hud";
import { MapStrip } from "@/components/map-strip";
import { Rail } from "@/components/rail";

// One phone: full screen on a phone, a 390 × 844 frame on anything wider.
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:flex sm:min-h-dvh sm:items-center sm:justify-center sm:p-6">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-paper sm:h-[844px] sm:w-[390px] sm:rounded-[28px] sm:shadow-[0_0_0_1px_var(--frame),0_12px_32px_var(--shadow)]">
        <Hud />
        <MapStrip />
        <main className="flex grow flex-col overflow-y-auto bg-panel px-4 pt-3">{children}</main>
        <Rail />
      </div>
    </div>
  );
}
