import type { Metadata } from "next";
import { AboutMotion } from "@/components/about/motion";
import { AboutNav } from "@/components/about/nav";
import { BOOT } from "@/lib/about/boot";
import "./about.css";

export const metadata: Metadata = {
  title: { default: "About · Holos", template: "%s · Holos" },
  description: "A hard science fiction game on real data. Every source, every rule, and how it is built.",
};

// The about pages scroll like a page, not a game: the bar on top, then the page. The boot script comes first, so it
// runs before anything below it paints.
export default function AboutLayout({ children }: LayoutProps<"/about">) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <AboutMotion nav={<AboutNav />}>{children}</AboutMotion>
    </>
  );
}
