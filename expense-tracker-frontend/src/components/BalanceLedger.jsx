import Money from './Money';
import EmptyState from './EmptyState';

export default function BalanceLedger({ balances, onSettle }) {
  const { netBalances, suggestedSettlements } = balances;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ledger-inkFaint mb-3">Net balance</p>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-ledger-rule/50">
            {netBalances.map((b) => (
              <tr key={b.userId}>
                <td className="py-2.5 text-ledger-ink">{b.userName}</td>
                <td className="py-2.5 text-right">
                  <Money value={b.netBalance} kind={b.netBalance >= 0 ? 'credit' : 'debit'} showSign />
                </td>
                <td className="py-2.5 pl-3 text-xs text-ledger-inkFaint w-24 text-right">
                  {b.netBalance > 0.004 ? 'is owed' : b.netBalance < -0.004 ? 'owes' : 'settled up'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-ledger-inkFaint mb-3">Suggested settlements</p>
        {suggestedSettlements.length === 0 ? (
          <EmptyState title="Everyone's settled up" hint="No outstanding transfers needed." />
        ) : (
          <ul className="space-y-2">
            {suggestedSettlements.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-ledger-rule bg-white/40 px-4 py-3"
              >
                <span className="text-sm text-ledger-ink">
                  <strong className="font-medium">{t.fromUserName}</strong>
                  <span className="text-ledger-inkFaint mx-1.5">owes</span>
                  <strong className="font-medium">{t.toUserName}</strong>
                </span>
                <div className="flex items-center gap-3">
                  <Money value={t.amount} kind="debit" />
                  {onSettle && (
                    <button
                      onClick={() => onSettle(t)}
                      className="text-xs px-2.5 py-1.5 rounded-xl border border-ledger-rule text-ledger-ink hover:bg-ledger-paperDark"
                    >
                      Mark settled
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
