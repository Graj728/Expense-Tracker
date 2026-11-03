export default function EmptyState({ title, hint, action }) {
  return (
    <div className="text-center py-14 px-6">
      <p className="font-display text-lg text-ledger-ink mb-1">{title}</p>
      {hint && <p className="text-sm text-ledger-inkFaint mb-4">{hint}</p>}
      {action}
    </div>
  );
}
