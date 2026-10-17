import type { Metadata } from "next";
import { AboutNav } from "@/components/about/nav";
import "./about.css";

export const metadata: Metadata = {
  title: { default: "About · Holos", template: "%s · Holos" },
  description: "A hard science fiction game on real data. Every source, every rule, and how it is built.",
};

// The about pages scroll like a page, not a game: the bar on top, then the page.
export default function AboutLayout({ children }: LayoutProps<"/about">) {
  return (
    <div className="min-h-dvh bg-page">
      <AboutNav />
      {children}
    </div>
  );
}
