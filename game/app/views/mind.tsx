import { useState } from "react";
import { AskBox, KeyRow, Ours, SettingsCard } from "@/components/mind-chat";
import { MindNote } from "@/components/mind-note";
import { MindTab } from "@/components/mind-tab";
import { RailNav, RailTab } from "@/components/rail";
import { TAB_PAGE } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import { MIND_MODELS, type MindModel } from "@/lib/access";

// The Mind tab, as the game draws it: its head and the dials that fold its settings open, a question we asked and the
// Mind's answer, the ask box, and the rail. The talk and its cost are a fixed example. Open the dials to see the
// settings. 2026-11-15.

export default function MindView() {
  const [model, setModel] = useState<string>("claude-sonnet-5-5");
  const [effort, setEffort] = useState("medium");
  return (
    <View code="MD-1" name="Mind" parts={["Tab head", "Collapsible", "Choice", "Our bubble", "Mind note", "Field", "Tabs"]}>
      <div className="flex h-[640px] flex-col">
        <div className={TAB_PAGE}>
          <MindTab
            settings={
              <SettingsCard
                models={(Object.keys(MIND_MODELS) as MindModel[]).map((m) => ({ value: m, label: MIND_MODELS[m].name }))}
                model={model}
                onModel={setModel}
                effort={effort}
                onEffort={setEffort}
                spent="4,812 tokens, $0.031"
                keyRow={<KeyRow onClear={() => {}} />}
              />
            }
          >
            <div className="mt-2 flex flex-col gap-2 pb-3">
              <Ours>Are we alone?</Ours>
              <MindNote className="max-w-[86%] self-start text-[15px] leading-[1.5]">
                We can’t say yet. We have heard nothing we cannot explain, and we have looked hard at only a few stars. A Close
                Reading of a warm glow would tell us more than anything else we could order now.
              </MindNote>
              <Ours>Which glow first?</Ours>
              <MindNote still className="max-w-[86%] self-start text-[15px] leading-[1.5]">
                The nearest we have ranged. Its light is the brightest we will get, so the reading comes back clearest.
              </MindNote>
            </div>
            <AskBox busy={false} onAsk={() => {}} className="sticky bottom-0 mt-auto bg-panel pb-3" />
          </MindTab>
        </div>
        <RailNav>
          <RailTab to="/ui/mind" label="Scan" on={false} calls={1} />
          <RailTab to="/ui/mind" label="Build" on={false} />
          <RailTab to="/ui/mind" label="Reach" on={false} />
          <RailTab to="/ui/mind" label="Mind" on />
        </RailNav>
      </div>
    </View>
  );
}
