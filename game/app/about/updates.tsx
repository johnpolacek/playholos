import { Ahead } from "@/components/about/ahead";
import { KICK } from "@/components/about/dials";
import { PageHead } from "@/components/about/doc-page";
import { ROUNDS, WATCH } from "@/lib/about/updates";

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// Research moves, so the game does: what is coming, then each recheck and what it changed.
export default function Updates() {
  return (
    <main>
      <title>Updates · Holos</title>
      <PageHead
        kicker="THE UPDATES"
        title="The science moves, and the game moves with it"
        stats={[
          [ROUNDS.length, "rechecks"],
          [ROUNDS.reduce((n, r) => n + r.changed.length, 0), "changes found"],
          [WATCH.length, "results ahead"],
        ]}
      >
        Every month we recheck the research the game rests on. When a newer
        result changes a number, the game changes too, and the older answer
        stays in the research log, marked superseded.
      </PageHead>
      <Ahead />
      <section
        aria-label="Rechecks"
        className="mx-auto max-w-[1180px] px-4 pb-24"
      >
        <h2
          data-a
          className="text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]"
        >
          What changed
        </h2>
        {ROUNDS.map((r) => (
          <article key={r.date} className="mt-8 border-t border-rowline pt-5">
            <div data-a className={KICK}>
              {day(r.date).toUpperCase()} · {r.checked} SOURCES CHECKED
            </div>
            <ol className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {r.changed.map((c) => (
                <li key={c.what} data-a className="border-l border-faint pl-4">
                  <p className="text-[15px] leading-[1.55]">{c.what}</p>
                  {c.game && (
                    <p className="mt-1.5 text-[14px] leading-[1.5] text-page-ink2">
                      <span className={KICK}>IN THE GAME · </span>
                      {c.game}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </main>
  );
}
