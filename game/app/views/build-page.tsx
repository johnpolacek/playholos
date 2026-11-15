import { useState } from "react";
import { BackBar } from "@/components/back-bar";
import { BuildFace, QueueFace, SwitchCard } from "@/components/build-page";
import { RailNav, RailTab } from "@/components/rail";
import { TAB_PAGE } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import { BUILDS } from "@/lib/game/plan";

// A build's page, as the game draws it: the Interceptor, queued second, with its switch between armed and standing
// down, the Mind's word on it, what it opens, Close View and the ask. Its place in line and its Year are a fixed
// example; its words are the game's own. 2026-11-15.

const NAME = "Interceptor";

export default function BuildPageView() {
  const [queued, setQueued] = useState(true);
  const [armed, setArmed] = useState(true);
  const [close, setClose] = useState(false);
  return (
    <View code="BP-1" name="Build page" parts={["Back bar", "Build marks", "Button", "Choice", "Mind note", "Tabs"]}>
      <div className="flex h-[720px] flex-col">
        <div className={TAB_PAGE}>
          <BuildFace
            name={NAME}
            queued={queued}
            back={<BackBar to="/ui/build-page" label="All builds" />}
            line={BUILDS.find((b) => b.name === NAME)?.what}
            queueing={
              <QueueFace
                line={queued ? "Queued, second in our order. Done by Year 33.2, 2h 46m after we begin." : "Added to our order, it would be done by Year 41.0, 3h 25m after we begin."}
                queued={queued}
                primary={{ queued, label: queued ? "Remove from Queue" : "Add to Queue", onClick: () => setQueued(!queued) }}
                front={queued ? () => {} : undefined}
              />
            }
            switchCard={<SwitchCard name={NAME} on={armed} onChange={setArmed} />}
            close={{ on: close, toggle: () => setClose(!close) }}
            onAsk={() => {}}
          />
        </div>
        <RailNav>
          <RailTab to="/ui/build-page" label="Scan" on={false} />
          <RailTab to="/ui/build-page" label="Build" on />
          <RailTab to="/ui/build-page" label="Reach" on={false} />
          <RailTab to="/ui/build-page" label="Mind" on={false} />
        </RailNav>
      </div>
    </View>
  );
}
