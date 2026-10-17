import { MindChat } from "@/components/mind-chat";
import { TabHead } from "@/components/tab-head";
import { Unlock, unlocked } from "@/components/unlock";

// The rest of the game is open. Only the Mind runs on AI, so only the Mind asks for the code. `ask` is a question from
// Meeting the Mind, sent once the chat opens, and kept through the code.
export default async function Mind({ searchParams }: PageProps<"/mind">) {
  const { wrong, ask } = await searchParams;
  const question = typeof ask === "string" ? ask.slice(0, 200) : undefined;
  const open = await unlocked();
  return (
    <>
      <TabHead title="MIND" right={open ? "ASKING" : "LOCKED"} />
      {open ? (
        <MindChat ask={question} />
      ) : (
        <Unlock next={question ? `/mind?ask=${encodeURIComponent(question)}` : "/mind"} wrong={!!wrong} />
      )}
    </>
  );
}
