import { useMemo } from "react";
import { Link } from "react-router";
import { CostLine, previews, usePreview } from "@/components/costs";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildTone } from "@/components/marks";
import { OpensLine } from "@/components/opens";
import { usePlan, useSchedule } from "@/components/picks";
import { Face, ListHead } from "@/components/tab-head";
import { span, tenths } from "@/lib/game/clock";
import { buildSlug, lacks, moves, needs, openAt, orderLater, PAST, takenAt } from "@/lib/game/plan";

// In play, the Catalog: everything open to us and not in our order, under our instruments, each with when it would be
// done if ordered now, last in line, what it would take and slow, what it opens, and Add to Queue on the row itself.
// A tap on the rest of the row opens its page. Replaces “Open to start”, 2026-10-29.
export function Catalog({ className = "" }: { className?: string }) {
  const { year, orderAt } = useGame();
  const { plan, change } = usePlan();
  const { done, scale } = useSchedule();
  const [, preview] = usePreview();
  const at = tenths(year ?? 0);
  // An order lands on Earth a light-time late while the Will lives at a hole.
  const order = orderAt === null ? null : tenths(orderAt);
  const open = useMemo(() => openAt(plan, done, at), [plan, done, at]);
  const by = useMemo(() => Object.fromEntries(open.map((b) => [b.name, moves(plan, scale, b.name, at)])), [open, plan, scale, at]);
  if (!open.length) return null;
  return (
    <>
      <ListHead left={`Catalog · ${open.length}`} right="Done in" className={className} />
      <ul className="mt-1">
        {open.map((b) => {
          const lacking = lacks(plan, b.name);
          return (
            <li key={b.name} className="border-t border-faint">
              <Link to={`/build/${buildSlug(b.name)}`} className="block py-2.5" {...previews(b.name, preview)}>
                <Face
                  mark={<BuildMark name={b.name} />}
                  tone={buildTone(b.name, false)}
                  name={<b className="font-semibold">{b.name}</b>}
                  line={takenAt(plan, b.name) === null ? b.what : `${b.what} Taken back at Year ${takenAt(plan, b.name)}, its work kept.`}
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
                      Add to Queue
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
