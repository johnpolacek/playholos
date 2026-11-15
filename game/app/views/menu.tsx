import { Button } from "@ui-sdk/react/button";
import { FeedbackFace, MENU_LOOK, MenuFace, NewGameButton } from "@/components/menu";
import { View } from "@/app/views/frame";

// The menu, as the game opens it from the galaxy in the top bar's corner: the drawer from the left over a dimmed game,
// the Mind's key, New game, the pages, a note to the game's maker, and the ways elsewhere. Drawn in place; a note sent
// here goes nowhere. Run locally opens its own sheet. 2026-11-15.

export default function MenuView() {
  return (
    <View code="MN-1" name="Menu" parts={["Galactic year", "Button", "Field", "Sheet"]}>
      <div className="relative flex h-[720px] bg-panel">
        <div aria-hidden className="absolute inset-0 bg-black/55" />
        <nav className={`${MENU_LOOK} relative w-[86%] overflow-y-auto`}>
          <MenuFace
            mind={{
              name: "Anthropic key",
              line: "In use. Each question is billed to it.",
              action: <Button className="-mr-2 h-11 shrink-0 px-2 text-[13px] underline underline-offset-2">Forget</Button>,
            }}
            newGame={<NewGameButton onErase={() => {}} />}
            onPage={(e) => e.preventDefault()}
            feedback={<FeedbackFace onSend={async () => true} />}
          />
        </nav>
      </div>
    </View>
  );
}
