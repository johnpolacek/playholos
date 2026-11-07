import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { CostLine, previews, usePreview } from "@/components/costs";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildTone } from "@/components/marks";
import { OpensLine } from "@/components/opens";
import { usePlan, useSchedule } from "@/components/picks";
import { Face, ListHead } from "@/components/tab-head";
import { span, tenths } from "@/lib/game/clock";
import { buildSlug, fits, lacks, LATER, moves, needs, openAt, ordered, orderLater, PAST, takenAt } from "@/lib/game/plan";

// In play, the Catalog: everything open to us and not in our order, under our instruments, each with when it would be
// done if ordered now, last in line, what it would take and slow, what it opens, and Add to Queue on the row itself.
// A tap on the rest of the row opens its page. Replaces “Open to start”, 2026-10-29.
export function Catalog({ className = "" }: { className?: string }) {
  const { year, orderAt, save } = useGame();
  // Our strategy's builds first, each marked, as advice. 2026-11-02.
  const strategy = save?.charter?.line;
  const { plan, change } = usePlan();
  const { done, scale } = useSchedule();
  const [, preview] = usePreview();
  const at = tenths(year ?? 0);
  // An order lands on Earth a light-time late while the Will lives at a hole.
  const order = orderAt === null ? null : tenths(orderAt);
  const open = useMemo(
    () => openAt(plan, done, at).map((b, i) => ({ b, i, fit: fits(strategy, b) })).sort((p, q) => Number(q.fit) - Number(p.fit) || p.i - q.i).map(({ b }) => b),
    [plan, done, at, strategy],
  );
  const by = useMemo(() => Object.fromEntries(open.map((b) => [b.name, moves(plan, scale, b.name, at)])), [open, plan, scale, at]);
  // Twenty builds and more, and no way to find one by name: a blind first-timer scrolled the list for the 15 m Mirror.
  // 2026-11-07.
  const [find, setFind] = useState("");
  const q = find.trim().toLowerCase();
  // Names first: "probe" listed the X-Ray Watch, for a word in its line, above the Probe Yard. Blind playtest 2026-11-07.
  const named = (b: (typeof open)[number]) => b.name.toLowerCase().includes(q);
  const shown = q ? [...open.filter(named), ...open.filter((b) => !named(b) && b.what.toLowerCase().includes(q))] : open;
  // One found but not open yet says what opens it.
  const later = q && !shown.length ? LATER.find((b) => b.name.toLowerCase().includes(q) && !ordered(plan).includes(b.name)) : undefined;
  // Once the box scrolls away above and the list still shows, a button at the bottom brings it back: pinned at the top,
  // it covered the compute meter pinned there on wide screens. The Will's call, 2026-11-07.
  const box = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState({ box: false, end: false });
  const many = open.length > 8;
  useEffect(() => {
    if (!many) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        const above = !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0);
        setPast((p) => (e.target === box.current ? { ...p, box: above } : { ...p, end: above }));
      }
    });
    if (box.current) io.observe(box.current);
    if (end.current) io.observe(end.current);
    return () => io.disconnect();
  }, [many]);
  const opens = (after: string) => (after === "A rock found" ? "a rock is found coming" : after === "The watcher found" ? "the watcher is found" : `the ${after} is done`);
  if (!open.length) return null;
  return (
    <>
      {/* The note's "See the Catalog" scrolls here: on Build already, its link went nowhere we could see. 2026-11-07. */}
      <div id="catalog" className="scroll-mt-4" />
      <ListHead left={`Catalog · ${open.length}`} right="Done in" className={className} />
      {many && (
        <input
          ref={box}
          type="search"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Find a build"
          aria-label="Find a build"
          className="mt-2 h-9 w-full rounded-full border border-faint bg-transparent px-4 text-[13px] text-ink placeholder:text-muted focus:border-muted focus:outline-none"
        />
      )}
      {q && !shown.length && (
        <p className="mt-2 text-[13px] text-muted">
          {later
            ? `The ${later.name} isn’t open to us yet. It opens once ${opens(later.after)}.`
            : `No build open to us matches “${find.trim()}”.`}
        </p>
      )}
      <ul className="mt-1">
        {shown.map((b) => {
          const lacking = lacks(plan, b.name);
          return (
            <li key={b.name} className="border-t border-faint">
              <Link to={`/play/build/${buildSlug(b.name)}`} className="block py-2.5" {...previews(b.name, preview)}>
                <Face
                  mark={<BuildMark name={b.name} />}
                  tone={buildTone(b.name, false)}
                  name={
                    <>
                      <b className="font-semibold">{b.name}</b>
                      {fits(strategy, b) && (
                        <span className="ml-2 rounded-full border border-other/50 px-1.5 py-px align-[2px] font-mono text-[9px] tracking-[.08em] text-other uppercase">
                          {strategy}
                        </span>
                      )}
                    </>
                  }
                  line={takenAt(plan, b.name) === null ? b.what : `${b.what} Paused at Year ${takenAt(plan, b.name)}, its work kept.`}
                  right={by[b.name].at == null ? PAST : span(by[b.name].at! - at)}
                />
                <CostLine name={b.name} move={by[b.name]} at={at} />
              </Link>
              <OpensLine name={b.name} />
              <div className="flex justify-end pb-2.5 pl-7">
                {lacking.length ? (
                  <span className="text-xs leading-snug text-muted">Needs {needs(lacking)} in our order first.</span>
                ) : (
                  order !== null && (
                    <button
                      onClick={() => change(orderLater(b.name, order))}
                      className="h-9 shrink-0 rounded-full border border-ink px-4 text-[13px] font-medium transition-colors hover:bg-ink hover:text-paper"
                    >
                      {takenAt(plan, b.name) === null ? "Add to Queue" : "Resume Build"}
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {/* Pinned to the panel's bottom left, clear of each row's Add to Queue on the right. */}
      {many && past.box && !past.end && (
        <div className="pointer-events-none sticky bottom-3 z-20 flex">
          <button
            onClick={() => {
              box.current?.scrollIntoView({ block: "center", behavior: "smooth" });
              box.current?.focus({ preventScroll: true });
            }}
            className="pointer-events-auto h-9 rounded-full border border-faint bg-panel px-4 text-[13px] text-ink shadow-lg hover:border-muted"
          >
            Find a build
          </button>
        </div>
      )}
      <div ref={end} />
    </>
  );
}

/** The build the Mind would start while nothing builds: one that fits our strategy and that we can order now, soonest
 *  done, or else the soonest done of any. Worked out only while `on`, since each is measured against our order. It
 *  only advises: the Will orders. 2026-11-02. */
export function useMindPick(on: boolean) {
  const { year, save } = useGame();
  const { plan } = usePlan();
  const { done, scale } = useSchedule();
  const strategy = save?.charter?.line;
  const at = tenths(year ?? 0);
  return useMemo(() => {
    if (!on) return null;
    const passed = save?.passed ?? [];
    const ready = openAt(plan, done, at).filter((b) => !lacks(plan, b.name).length && !passed.includes(b.name));
    const soon = Object.fromEntries(ready.map((b) => [b.name, moves(plan, scale, b.name, at).at ?? Infinity]));
    const pick = ready.sort((p, q) => Number(fits(strategy, q)) - Number(fits(strategy, p)) || soon[p.name] - soon[q.name])[0];
    return pick ? { build: pick, fit: fits(strategy, pick), strategy } : null;
  }, [on, plan, done, at, scale, strategy, save?.passed]);
}
