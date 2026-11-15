import "@fontsource-variable/suse";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
// The Log skin's serif, upright and italic. A face loads only once a page uses it, so chalk never fetches it. 2026-11-15.
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./fonts.css";
import "./app/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { animateTab } from "@/components/galactic-year";
import { holdSentenceStarts } from "@/lib/breaks";
import { startMusic } from "@/lib/music";
import { askedSkin, setSkin } from "@/lib/skin";
import { router } from "./routes";

// A playtest's skin, from ?skin= on any address. Before the first paint, so the game never flashes chalk first.
const asked = askedSkin(window.location.search);
if (asked) setSkin(asked);

animateTab();
holdSentenceStarts();
startMusic();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
