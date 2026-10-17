import { ScreenBar } from "@/components/screen-bar";
import type { Source } from "@/lib/game/sources";

// The layout of every screen before the shell: the bar, then the art and the words. Tall, as on a phone, one column,
// with `head` above the art and the rest below it, kept to a readable width on a tablet. Wide, the art fills the left
// and the words stand beside it, centered top to bottom. When the words outrun a short screen, the art stays in view
// as they scroll. The wrappers vanish when tall, so the column is as it was.
export function Spread({
  sources,
  head,
  art,
  children,
}: {
  sources?: Source[];
  head?: React.ReactNode;
  art: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <ScreenBar sources={sources} />
      <div className="mx-auto flex w-full max-w-xl grow flex-col wide:grid wide:max-w-[1440px] wide:grid-cols-[minmax(0,1fr)_clamp(280px,34vw,400px)] wide:grid-rows-[1fr_auto_auto_1fr] wide:gap-x-[clamp(24px,5vw,80px)] wide:pb-6">
        {head && <div className="contents wide:col-start-2 wide:row-start-2 wide:flex wide:flex-col">{head}</div>}
        <div className="contents wide:sticky wide:top-0 wide:col-start-1 wide:row-span-4 wide:row-start-1 wide:flex wide:h-[calc(100dvh-72px)] wide:items-center wide:justify-center wide:self-start">
          {art}
        </div>
        <div className="contents wide:col-start-2 wide:row-start-3 wide:flex wide:flex-col">{children}</div>
      </div>
    </>
  );
}

/** For art that fills the left of a wide screen, whatever size it takes on a phone. */
export const FILL = "wide:absolute wide:inset-0 wide:m-0 wide:h-full wide:w-full wide:max-w-none";
