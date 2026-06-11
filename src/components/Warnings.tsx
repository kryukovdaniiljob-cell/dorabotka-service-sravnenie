interface Props {
  error: string | null;
  warnings: string[];
}

export default function Warnings({ error, warnings }: Props) {
  if (!error && warnings.length === 0) return null;
  return (
    <div className="space-y-2.5">
      {error && (
        <div className="rounded-xl border border-orange/50 bg-orange/10 px-4 py-3 text-sm text-orange">
          <span className="font-heading font-semibold">Ошибка: </span>{error}
        </div>
      )}
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-sand bg-surface2 px-4 py-2.5 text-sm text-ink/80">
          <span className="text-orange">⚠</span>
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}
