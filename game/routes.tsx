import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router";
import NotFound from "@/app/not-found";
import PlayLayout from "@/app/play/layout";
import Lead from "@/app/play/lead";
import Mind from "@/app/play/mind";
import Projects from "@/app/play/projects";
import Reach from "@/app/play/reach";
import ScanTab from "@/app/play/scan";

// A page loaded only when it is opened. The about pages carry the docs and their motion, which the game never needs.
const later = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

// Every page of the game, by address. The tabs share the play screen, and the about pages share their bar.
export const router = createBrowserRouter([
  {
    Component: Root,
    children: [
      {
        Component: PlayLayout,
        children: [
          { index: true, Component: ScanTab },
          { path: "mind", Component: Mind },
          { path: "projects", Component: Projects },
          { path: "reach", Component: Reach },
          { path: "lead/:slug", Component: Lead },
        ],
      },
      {
        path: "about",
        lazy: later(() => import("@/app/about/layout")),
        children: [
          { index: true, lazy: later(() => import("@/app/about")) },
          { path: "research", lazy: later(() => import("@/app/about/research")) },
          { path: "design", lazy: later(() => import("@/app/about/design")) },
          { path: "building", lazy: later(() => import("@/app/about/building")) },
        ],
      },
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
