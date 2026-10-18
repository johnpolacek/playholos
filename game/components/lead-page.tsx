"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LeadArt } from "@/components/lead-art";
import { useLeads } from "@/components/scan";
import { realTime } from "@/lib/game/clock";
import { ODDS, type Odds } from "@/lib/game/leads";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// One lead, as a report: drawn, then what we measured, what it could be with the Mind's word for each, and what would
// tell us. The map flies to its star while it is open, and back out when we leave. Asking the Mind is the last step.

/** The Mind's word, on its seven-step scale. */
function Scale({ odds }: { odds: Odds }) {
  const at = ODDS.indexOf(odds);
  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="flex gap-[3px]" aria-hidden>
        {ODDS.map((o, i) => (
          <span key={o} className={`h-[7px] w-[7px] rounded-full ${i <= at ? "bg-you" : "bg-track"}`} />
        ))}
      </span>
      <span className="w-[104px] font-mono text-[10.5px] text-ink">{odds}</span>
    </span>
  );
}

const HEAD = "font-mono text-[10px] tracking-[.1em] text-muted uppercase";

export function LeadPage({ slug }: { slug: string }) {
  const { leads, dials } = useLeads();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const i = leads.findIndex((l) => l.slug === slug);
  const lead = leads[i];

  useEffect(() => {
    if (i < 0) return;
    Object.assign(dials, { focus: i + 1 });
    return () => void Object.assign(dials, { focus: 0 });
  }, [dials, i]);

  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && router.push("/");
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [router]);

  useGSAP(
    () => {
      if (!lead || prefersReducedMotion()) return;
      gsap.fromTo("[data-m]", riseFrom, { ...rise, stagger: 0.05 });
    },
    { scope: root, dependencies: [lead?.slug] },
  );

  if (!leads.length) return null;
  if (!lead)
    return (
      <p className="mt-2 text-sm text-muted">
        We have no lead by that name. <Link href="/" className="text-ink underline underline-offset-2">Back to Scan</Link>
      </p>
    );

  return (
    <div ref={root} className="flex flex-col pb-4">
      {/* The way back stays in reach while the page scrolls. */}
      <div className="sticky -top-3 z-10 -mx-4 bg-panel px-4 pt-3 pb-2">
        <Link
          href="/"
          data-m
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink bg-paper pr-4 pl-3 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <span aria-hidden className="text-[18px] leading-none">‹</span>
          All leads
        </Link>
      </div>
      <div data-m className="mt-1 flex items-baseline gap-2.5">
        <span className={`size-2.5 shrink-0 translate-y-[-1px] rounded-full ${lead.reply ? "bg-other" : "bg-you"}`} />
        <h1 className="text-[19px] leading-snug font-medium">{lead.what}</h1>
      </div>
      <p data-m className="mt-0.5 text-[13.5px] text-page-ink2">
        {lead.star} · {lead.ly.toFixed(1)} ly · light takes <span className="font-mono tabular-nums">{realTime(lead.ly)}</span>
      </p>

      <div data-m className="mt-3 rounded-xl border border-faint bg-paper px-2 py-1">
        <LeadArt art={lead.art} />
      </div>

      <h2 data-m className={`mt-5 ${HEAD}`}>What we measured</h2>
      <dl data-m className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px] leading-snug">
        {lead.facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h2 data-m className={`mt-5 ${HEAD}`}>What it could be</h2>
      <ul className="mt-1 flex flex-col">
        {lead.could.map((c) => (
          <li key={c.what} data-m className="border-t border-faint py-2.5 first:border-t-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] leading-snug font-semibold">{c.what}</span>
              <Scale odds={c.odds} />
            </div>
            <p className="mt-0.5 text-[13.5px] leading-snug text-page-ink2">{c.why}</p>
          </li>
        ))}
      </ul>

      <h2 data-m className={`mt-4 ${HEAD}`}>What would tell us</h2>
      {lead.tells.map((t) => (
        <p key={t} data-m className="mt-1.5 text-[13.5px] leading-snug">
          {t}
        </p>
      ))}

      <button
        data-m
        onClick={() => router.push(`/mind?ask=${encodeURIComponent(lead.ask)}`)}
        className="mt-6 h-[46px] shrink-0 rounded-full border border-ink text-[15px] font-medium"
      >
        Ask the Mind about it
      </button>
    </div>
  );
}
