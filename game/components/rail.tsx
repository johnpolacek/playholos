"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLeads } from "@/components/scan";

const TABS = [
  { label: "Scan", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Reach", href: "/reach" },
  { label: "Mind", href: "/mind" },
] as const;

export function Rail() {
  const path = usePathname();
  // A reading landed and not yet opened marks Scan.
  const news = useLeads().fresh.size > 0;
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
            aria-label={href === "/" && news ? `${label}, a new reading` : undefined}
            className={`flex items-center justify-center gap-1.5 text-[11px] ${on ? "font-semibold text-ink shadow-[inset_0_2px_0_var(--ink)]" : "text-muted"}`}
          >
            {label}
            {href === "/" && news && <span aria-hidden className="size-1.5 rounded-full bg-you" />}
          </Link>
        );
      })}
    </nav>
  );
}
