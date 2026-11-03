export default function Money({ value, kind = 'neutral', showSign = false, className = '' }) {
  const num = Number(value ?? 0);
  const colorClass =
    kind === 'credit' ? 'text-ledger-credit' : kind === 'debit' ? 'text-ledger-debit' : 'text-ledger-ink';

  const sign = showSign && num > 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(num));

  const display = num < 0 ? `-${formatted}` : `${sign}${formatted}`;

  return <span className={`money ${colorClass} ${className}`}>{display}</span>;
}
