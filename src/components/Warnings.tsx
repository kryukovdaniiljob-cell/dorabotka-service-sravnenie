interface Props {
  error: string | null;
  warnings: string[];
}

export default function Warnings({ error, warnings }: Props) {
  if (!error && warnings.length === 0) return null;
  return (
    <div className="space-y-2.5">
      {error && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-dark">
          <span className="font-heading font-semibold">Ошибка: </span>{error}
        </div>
      )}
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-stone/50 bg-sand/60 px-4 py-2.5 text-sm text-ink/80">
          <span className="text-accent">⚠</span>
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}
