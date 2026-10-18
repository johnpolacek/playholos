import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The phone's home screen icon: the tab's mark, drawn from icon.svg, on the game's paper.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const mark = await readFile(join(process.cwd(), "app/icon.svg"), "base64");
  return new ImageResponse(
    (
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
        {/* Inset, so the phone's rounded corners don't clip the ring's ends. */}
        <img src={`data:image/svg+xml;base64,${mark}`} width={136} height={136} alt="" />
      </div>
    ),
    size,
  );
}
