import { Button } from "@ui-sdk/react/button";
import { COUNT, StepsTo } from "@/components/begin";
import { GalacticYear } from "@/components/galactic-year";
import { JumpPill, Meter, TopBar } from "@/components/hud";
import { View } from "@/app/views/frame";
import { CATALOG } from "@/lib/sim/works";

// The top bar, as the game draws it, twice: before Begin, with the steps still open, and in play, with the Deuterium
// Works done and the next thing a jump away. The numbers are a fixed Earth, not a save. 2026-11-15.

const corner = (
  <Button aria-label="Menu" className="-my-2 -ml-2 flex size-12 items-center justify-center text-ink">
    <GalacticYear size={40} />
  </Button>
);

export default function TopBarView() {
  return (
    <View code="TB-1" name="Top bar" wide parts={["Top bar", "Meter", "Steps to Begin", "Jump", "Tooltip", "Galactic year"]}>
      <TopBar
        corner={corner}
        year="Year 0.00"
        status={
          <Button className={COUNT}>
            <StepsTo done={[true, true, false, false]} next="How we reach" />
          </Button>
        }
        count={3}
        meters={
          <>
            <Meter label="ENERGY" at={0.05} value="5%" sub="of the grid" />
            <Meter label="MATTER" value="20 kt" sub="in orbit" />
            <Meter label="COMPUTE" at={1} value="100% at work" sub="none idle" />
          </>
        }
      />
      <div className="h-6 border-b border-faint bg-panel" />
      <TopBar
        corner={corner}
        year="Year 41.37"
        status={<JumpPill why="a probe’s word home" onJump={() => {}} />}
        count={4}
        meters={
          <>
            <Meter label="ENERGY" at={0.31} to={0.62} value="31%" sub="62% by Year 58" />
            <Meter label="MATTER" value="1,240 kt" sub="in orbit" />
            <Meter label="DEUTERIUM" at={0.4} value="38 kt" sub={`+${Math.round(CATALOG.deuterium.perYear)} kt a Year`} />
            <Meter label="COMPUTE" at={0.86} value="86% at work" sub="14% searching" />
          </>
        }
      />
    </View>
  );
}
