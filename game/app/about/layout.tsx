import { Outlet } from "react-router";
import { AboutMotion } from "@/components/about/motion";
import { AboutNav } from "@/components/about/nav";
import "./about.css";

// The about pages scroll like a page, not a game: the bar on top, then the page.
export default function AboutLayout() {
  return (
    <AboutMotion nav={<AboutNav />}>
      <Outlet />
    </AboutMotion>
  );
}
