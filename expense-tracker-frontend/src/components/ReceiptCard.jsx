import Money from './Money';

export default function ReceiptCard({ expense, onDelete, canDelete }) {
  return (
    <div className="relative torn-edge-bottom pb-3">
      <div className="paper-panel border border-ledger-rule/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-base text-ledger-ink truncate">
              {expense.description || 'Group expense'}
            </p>
            <p className="text-xs text-ledger-inkFaint mt-0.5">{expense.date}</p>
          </div>
          <Money value={expense.amount} kind="debit" className="text-lg font-semibold shrink-0" />
        </div>

        <div className="mt-4 pt-3 border-t border-dashed border-ledger-rule">
          <p className="text-[11px] uppercase tracking-wide text-ledger-inkFaint mb-2">
            Paid by user #{expense.paidByUserId} · split {expense.splits.length} ways
          </p>
          <ul className="space-y-1.5">
            {expense.splits.map((s) => (
              <li key={s.userId} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ledger-ink">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${s.paid ? 'bg-ledger-credit' : 'bg-ledger-debit'}`}
                    aria-hidden="true"
                  />
                  {s.userName}
                </span>
                <span className="flex items-center gap-2">
                  <Money value={s.shareAmount} className="text-xs" />
                  <span className={`text-[10px] uppercase tracking-wide ${s.paid ? 'text-ledger-credit' : 'text-ledger-debit'}`}>
                    {s.paid ? 'settled' : 'owes'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(expense)}
            className="mt-4 text-xs text-ledger-inkFaint hover:text-ledger-debit"
          >
            Delete expense
          </button>
        )}
      </div>
    </div>
  );
}
