import type { Rendered } from "@/lib/about/docs";

/** A page's opening: the kicker, the title, a line or two, and its numbers. */
export function PageHead({
  kicker,
  title,
  children,
  stats,
}: {
  kicker: string;
  title?: string;
  children: React.ReactNode;
  stats?: [value: number, label: string][];
}) {
  return (
    <header className="mx-auto max-w-[1180px] px-4 pt-14 pb-10 wide:pt-20">
      <div
        data-a
        className="font-mono text-[10.5px] tracking-[.1em] text-muted"
      >
        {kicker}
      </div>
      {title && (
        <h1
          data-a-title
          className="mt-3 max-w-[18ch] text-[34px] leading-[1.1] font-semibold text-balance wide:text-[46px]"
        >
          {title}
        </h1>
      )}
      <div
        data-a
        className="mt-5 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2"
      >
        {children}
      </div>
      {stats && (
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {stats.map(([value, label]) => (
            <div key={label} data-a>
              <dt className="sr-only">{label}</dt>
              <dd
                data-count={value}
                className="font-mono text-[26px] leading-none tabular-nums"
              >
                {value.toLocaleString("en-US")}
              </dd>
              <div className="mt-1.5 font-mono text-[10.5px] tracking-[.1em] text-muted">
                {label.toUpperCase()}
              </div>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}

/** Contents grouped under a page's own questions: each names doc headings by how they start. */
export type Group = { title: string; href?: string; sections: string[] };

const link = "block py-1 text-muted transition-colors hover:text-ink";

/** One of the design docs, whole: its contents beside it on a wide screen, folded above it on a phone. */
export function DocBody({ doc, groups }: { doc: Rendered; groups?: Group[] }) {
  const item = ({ id, text }: Rendered["toc"][number]) => (
    <li key={id}>
      <a href={`#${id}`} className={link}>
        {text}
      </a>
    </li>
  );
  const contents = groups
    ? (() => {
        const owner = (text: string) =>
          groups.findIndex((g) => g.sections.some((s) => text.startsWith(s)));
        return groups.map((g, i) => {
          const mine = doc.toc.filter((t) => {
            const o = owner(t.text);
            return o === i || (o === -1 && i === groups.length - 1);
          });
          return (
            <li key={g.title} className="mt-4 first:mt-0">
              {g.href ? (
                <a
                  href={g.href}
                  className="block py-1 font-semibold text-ink hover:text-you"
                >
                  {g.title}
                </a>
              ) : (
                <span className="block py-1 font-semibold text-ink">
                  {g.title}
                </span>
              )}
              <ol className="border-l border-faint pl-3">{mine.map(item)}</ol>
            </li>
          );
        });
      })()
    : doc.toc.map(item);
  return (
    <div className="mx-auto grid max-w-[1180px] gap-x-14 px-4 pb-24 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Contents" className="hidden lg:block">
        <div className="sticky top-16 max-h-[calc(100dvh-5rem)] overflow-y-auto pb-8">
          <div
            data-a
            className="mb-2 font-mono text-[10.5px] tracking-[.1em] text-muted"
          >
            CONTENTS
          </div>
          <ol data-a className="text-[13px] leading-[1.35]">
            {contents}
          </ol>
        </div>
      </nav>
      <details
        data-a
        className="mb-6 rounded-xl border border-rowline bg-panel px-4 py-3 lg:hidden"
      >
        <summary className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          CONTENTS · {doc.toc.length}
        </summary>
        <ol className="mt-2 text-[14px] leading-[1.35]">{contents}</ol>
      </details>
      <article
        className="doc max-w-[72ch]"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </div>
  );
}
