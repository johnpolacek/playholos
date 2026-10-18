"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Scan", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Reach", href: "/reach" },
  { label: "Mind", href: "/mind" },
] as const;

export function Rail() {
  const path = usePathname();
  return (
    <nav data-shell="rail" aria-label="Main" className="grid h-16 shrink-0 grid-cols-4 border-t border-faint bg-paper wide:col-start-2 wide:row-start-3 wide:border-l">
      {TABS.map(({ label, href }) => {
        // A lead's page is part of Scan.
        const on = path === href || (href === "/" && path.startsWith("/lead/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex items-center justify-center text-[11px] ${on ? "font-semibold text-ink shadow-[inset_0_2px_0_var(--ink)]" : "text-muted"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
