import { Sources } from "@/components/sources";
import type { Source } from "@/lib/game/sources";

/** A tab's name, and on the right its state, or the ⓘ that opens the real record behind it. */
export function TabHead({ title, right, sources }: { title: string; right?: string; sources?: Source[] }) {
  return (
    <div className="flex items-center justify-between pt-1 pb-1.5 text-[11px] tracking-[.08em] text-muted">
      <span>{title}</span>
      {right && <span className="font-mono">{right}</span>}
      {sources && (
        <span className="-my-2.5 -mr-2.5 flex justify-end">
          <Sources sources={sources} />
        </span>
      )}
    </div>
  );
}
