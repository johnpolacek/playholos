import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router";
import { loadLayout, PAGES } from "@/app/about/load";
import NotFound from "@/app/not-found";
import PlayLayout from "@/app/play/layout";
import Lead from "@/app/play/lead";
import Mind from "@/app/play/mind";
import BuildTab from "@/app/play/build";
import BuildItem from "@/app/play/build-item";
import Destination from "@/app/play/destination";
import Reach from "@/app/play/reach";
import ScanTab from "@/app/play/scan";

// A page loaded only when it is opened.
const later = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

// Every page of the game, by address. The tabs share the play screen, and the about pages share their bar.
export const router = createBrowserRouter([
  {
    Component: Root,
    children: [
      {
        Component: PlayLayout,
        children: [
          // The landing: the title screen, for everyone, with its ways in. The play screen draws it. 2026-11-04.
          { index: true, Component: () => null },
          {
            path: "play",
            children: [
              { index: true, Component: ScanTab },
              { path: "mind", Component: Mind },
              { path: "build", Component: BuildTab },
              { path: "build/:slug", Component: BuildItem },
              { path: "reach", Component: Reach },
              { path: "reach/:slug", Component: Destination },
              { path: "lead/:slug", Component: Lead },
            ],
          },
        ],
      },
      {
        path: "about",
        lazy: later(loadLayout),
        children: [
          { index: true, lazy: later(PAGES["/about"]) },
          { path: "research", lazy: later(PAGES["/about/research"]) },
          { path: "design", lazy: later(PAGES["/about/design"]) },
        ],
      },
      // Simulation mode: a sky drawn at the odds we set, and a tour through it. No game. 2026-11-01. The universe as we
      // see it at /universe, the flight through the drawn sky at /sim, one page so the sky carries across. 2026-11-04.
      { path: "universe", lazy: later(() => import("@/app/sim")) },
      { path: "sim", lazy: later(() => import("@/app/sim")) },
      // The game's colors, type and shared parts, drawn live. 2026-10-28.
      { path: "design", lazy: later(() => import("@/app/design")) },
      // Godview shows what the player can't see, so only the dev server has it.
      ...(import.meta.env.DEV ? [{ path: "godview", lazy: later(() => import("@/app/godview")) }] : []),
      { path: "*", Component: NotFound },
    ],
  },
]);

// A new page starts at its top, and back returns to where it was. Every full load shares one history key, so a load
// keeps its place by address instead, or one page would open at another's.
function Root() {
  return (
    <>
      <ScrollRestoration getKey={(location) => (location.key === "default" ? location.pathname : location.key)} />
      <Outlet />
    </>
  );
}
