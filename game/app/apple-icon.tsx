import { mark, png } from "./card.tsx";

// The phone's home screen icon: the tab's mark, drawn from icon.svg, on the game's paper. Drawn as the client is
// built, by vite.config.ts, and served at /apple-touch-icon.png.
const size = { width: 180, height: 180 };

export async function appleIcon() {
  return png(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#121314",
      }}
    >
      {/* Inset, so the phone's rounded corners never reach Sol's orbit. */}
      <img src={await mark()} width={136} height={136} alt="" />
    </div>,
    { ...size, fonts: [] },
  );
}
