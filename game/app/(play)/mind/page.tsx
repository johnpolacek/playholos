import { MindChat } from "@/components/mind-chat";
import { TabHead } from "@/components/tab-head";
import { Unlock, unlocked } from "@/components/unlock";

// The rest of the game is open. Only the Mind runs on AI, so only the Mind asks for the code.
export default async function Mind({ searchParams }: PageProps<"/mind">) {
  const { wrong } = await searchParams;
  const open = await unlocked();
  return (
    <>
      <TabHead title="MIND" right={open ? "ASKING" : "LOCKED"} />
      {open ? <MindChat /> : <Unlock next="/mind" wrong={!!wrong} />}
    </>
  );
}
