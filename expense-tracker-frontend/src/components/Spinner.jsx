export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-ledger-inkFaint py-8 justify-center">
      <span
        className="inline-block h-4 w-4 rounded-full border-2 border-ledger-rule border-t-ledger-primary animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm font-body">{label}</span>
    </div>
  );
}
