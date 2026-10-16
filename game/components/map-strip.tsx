// The board: a strip of the map under the top bar. The atlas's Three.js line-art scene mounts here.
export function MapStrip() {
  return (
    <div className="relative h-[195px] shrink-0 overflow-hidden border-b border-faint bg-paper">
      <span className="absolute top-2 left-2.5 rounded-[9px] border border-faint bg-paper px-[7px] py-0.5 font-mono text-[9.5px] tracking-[.06em]">
        SOL · MAP
      </span>
      <span aria-hidden className="absolute bottom-[5px] left-1/2 -ml-[18px] h-1 w-9 rounded-sm bg-faint" />
    </div>
  );
}
