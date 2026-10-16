export function TabHead({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex justify-between pt-1 pb-1.5 text-[11px] tracking-[.08em] text-muted">
      <span>{title}</span>
      {right && <span className="font-mono">{right}</span>}
    </div>
  );
}
