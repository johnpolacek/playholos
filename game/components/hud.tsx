// Placeholder values: the mock's screen before Year 0. The game clock and resources replace them.
const BEFORE_YEAR_0 = { energy: 1, matter: "20 kt", compute: 0 };

function Meter({ label, pct }: { label: string; pct: number }) {
  return (
    <span className="flex flex-col gap-[3px] text-[10px] tracking-[.08em] text-muted">
      {label}
      <b className="h-1 bg-track">
        <s className="block h-1 bg-fill2" style={{ width: `${pct}%` }} />
      </b>
    </span>
  );
}

export function Hud() {
  const { energy, matter, compute } = BEFORE_YEAR_0;
  return (
    <header className="flex h-[104px] shrink-0 flex-col gap-1.5 border-b border-faint px-4 pt-4 pb-3">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-xl font-semibold">
          <i className="size-2.5 rounded-full bg-you" />
          Earth
        </span>
        <span className="text-[15px] font-medium">Before Year 0</span>
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>Sol</span>
        <span>The clock starts when you begin</span>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2.5">
        <Meter label="ENERGY" pct={energy} />
        <span className="flex flex-col gap-[3px] text-[10px] tracking-[.08em] text-muted">
          MATTER
          <em className="font-mono text-xs leading-none font-semibold text-ink not-italic">{matter}</em>
        </span>
        <Meter label="COMPUTE" pct={compute} />
      </div>
    </header>
  );
}
