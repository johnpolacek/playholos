"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Source } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// The ⓘ on a memory screen, and the sheet it opens: the real record behind the screen, with canonical links.
// The sheet rises over the whole phone and sinks away on close.

function Sheet({ sources, onClose }: { sources: Source[]; onClose(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo('[data-s="back"]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo('[data-s="panel"]', { yPercent: 100 }, { yPercent: 0, duration: 0.45 }, 0)
        .fromTo('[data-s="item"]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, 0.2);
    },
    { scope: root },
  );

  const close = () =>
    contextSafe(() => {
      if (closing.current) return;
      closing.current = true;
      if (prefersReducedMotion()) return onClose();
      gsap
        .timeline({ defaults: { ease: "power2.in" }, onComplete: onClose })
        .to('[data-s="panel"]', { yPercent: 100, duration: 0.28 })
        .to('[data-s="back"]', { autoAlpha: 0, duration: 0.25 }, 0);
    })();

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal
      aria-label="The real record"
      className="absolute inset-0 z-50 flex flex-col justify-end"
    >
      <div data-s="back" onClick={close} className="absolute inset-0 bg-black/55" />
      <div
        data-s="panel"
        className="relative mx-auto flex max-h-[78%] w-full max-w-[560px] flex-col rounded-t-[22px] border-t border-faint bg-paper text-ink sm:border-x"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="font-mono text-[10.5px] tracking-[.1em] text-muted">THE REAL RECORD</span>
          <button onClick={close} aria-label="Close" className="-mr-2 h-9 w-9 text-xl leading-none text-muted">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-8">
          {sources.map((s) => (
            <div key={s.title} data-s="item" className="flex flex-col gap-1">
              <b className="text-[15px] font-semibold">{s.title}</b>
              <p className="text-[13.5px] leading-[1.45] text-muted">{s.text}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {s.links.map(([label, url]) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-you underline decoration-you/40 underline-offset-2"
                  >
                    {label} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A small ⓘ that opens the screen's real record. Its tap never hurries the screen's intro. */
export function Sources({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  const phone = typeof document === "undefined" ? null : document.getElementById("phone");
  return (
    <>
      <button
        data-m="kick"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(true)}
        aria-label="The real record"
        className="-ml-2.5 flex h-9 w-9 items-center justify-center text-muted"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="8" cy="8" r="7" />
          <path d="M8 7v4.5M8 4.6v.1" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      </button>
      {open && phone && createPortal(<Sheet sources={sources} onClose={() => setOpen(false)} />, phone)}
    </>
  );
}
