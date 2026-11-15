import { CallCard } from "@/components/send-card";
import { Ours } from "@/components/mind-chat";
import { MindNote } from "@/components/mind-note";
import { MindTab } from "@/components/mind-tab";
import { TAB_PAGE } from "@/components/tab-head";
import { View } from "@/app/views/frame";
import type { Draft } from "@/lib/game/sends";

// A call to everyone, as the game draws it: asked of the Mind, answered, and offered as the card we send from. Our
// Galaxy Broadcast Array stands, so the Galaxy is ours to call too. The card's numbers are the game's own physics, from
// lib/sim/messages.ts. Nothing here is sent. 2026-11-15.

const DRAFT: Draft = {
  to: "everywhere",
  travels: "We are here, round a yellow star. We count, we draw, and we listen. If you hear this, answer with anything at all.",
  holds: ["words", "pictures"],
  size: "page",
};

export default function SendView() {
  return (
    <View code="SD-1" name="Send" parts={["Tab head", "Our bubble", "Mind note", "Call card", "Choice", "Button"]}>
      <div className={`${TAB_PAGE} pb-4`}>
        <MindTab>
          <div className="mt-2 flex flex-col gap-2">
            <Ours>Call out to everyone. Say we are here.</Ours>
            <MindNote still className="max-w-[86%] self-start text-[15px] leading-[1.5]">
              We can. A page of words and pictures, sent every way at once. Set how far it reads, and whether it repeats.
            </MindNote>
            <div className="max-w-[92%] self-start pl-3">
              <CallCard draft={DRAFT} canCall onSend={() => {}} onStop={() => {}} />
            </div>
          </div>
        </MindTab>
      </div>
    </View>
  );
}
