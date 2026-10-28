import { Link, useLocation } from "react-router";
import { BuildMark, buildTone } from "@/components/marks";
import { Face, ListHead } from "@/components/tab-head";
import { buildSlug, opens, takes } from "@/lib/game/plan";

// What a build opens once it is done. Lists show only what we can start, each with what it opens under its row, and
// a build's page lists them in full. Each opens its own page, which says what it waits on. Chosen 2026-10-20.

/** How long a build takes, short, for a list's right side. */
export function took(name: string) {
  const { years, rock } = takes(name);
  return rock !== undefined ? `${rock / 1000} Mt rock` : years !== undefined ? `${years} Years` : "";
}

/** Under a build's row on a list: what it opens, each a link to its page. */
export function OpensLine({ name }: { name: string }) {
  const later = opens(name);
  if (!later.length) return null;
  return (
    <p className="-mt-1.5 flex flex-wrap items-center gap-x-3 pb-1.5 pl-7 text-[12.5px] leading-snug">
      <span className="font-mono text-[9.5px] tracking-[.08em] text-muted">OPENS</span>
      {later.map((b) => (
        <Link
          key={b.name}
          to={`/build/${buildSlug(b.name)}`}
          className="inline-flex items-center gap-1.5 py-1 text-page-ink2 transition-colors hover:text-ink"
        >
          <span className={buildTone(b.name, false)}>
            <BuildMark name={b.name} size={12} still />
          </span>
          {b.name}
          <span aria-hidden className="text-muted">
            ›
          </span>
        </Link>
      ))}
    </p>
  );
}

/** On a build's page: what it opens once done, in the list's rows, each to its page. */
export function Opens({ name, className = "mt-6" }: { name: string; className?: string }) {
  // The way back a build page came with goes along to the next.
  const state = useLocation().state;
  const later = opens(name);
  if (!later.length) return null;
  return (
    <div className={className}>
      <ListHead left={`Once done, it opens · ${later.length}`} right="Takes" />
      <ul className="mt-1">
        {later.map((b) => (
          <li key={b.name} className="border-t border-faint">
            <Link to={`/build/${buildSlug(b.name)}`} state={state} className="block py-2.5">
              <Face
                mark={<BuildMark name={b.name} />}
                tone={buildTone(b.name, false)}
                name={<b className="font-semibold">{b.name}</b>}
                line={b.what}
                right={took(b.name)}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
