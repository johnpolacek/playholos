"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  ["/about/research", "Research"],
  ["/about/design", "Design"],
  ["/about/building", "Building"],
] as const;

// The about pages' top bar: Holos, the three pages, and the way back to the game.
export function AboutNav() {
  const here = usePathname();
  return (
    <nav className="sticky top-0 z-40 border-b border-rowline bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1180px] items-center gap-4 px-4 font-mono text-[10.5px] tracking-[.1em]">
        <Link href="/about" className={`mr-auto ${here === "/about" ? "text-ink" : "text-muted hover:text-ink"}`}>
          HOLOS
        </Link>
        {PAGES.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={here === href ? "page" : undefined}
            className={here === href ? "text-ink" : "text-muted transition-colors hover:text-ink"}
          >
            {label.toUpperCase()}
          </Link>
        ))}
        <Link
          href="/"
          className="ml-1 rounded-full border border-ink/70 px-3 py-1.5 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          PLAY
        </Link>
      </div>
    </nav>
  );
}
