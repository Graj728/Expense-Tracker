import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import { transactionsApi } from '../api/transactions';
import { balancesApi } from '../api/balances';
import { apiErrorMessage } from '../api/client';
import Money from '../components/Money';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function monthBounds(date = new Date()) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export default function DashboardPage() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [myBalance, setMyBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { from, to } = useMemo(() => monthBounds(), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [summaryData, recentData, myBalanceData] = await Promise.all([
          reportsApi.summary(from, to),
          transactionsApi.search({ from, to }),
          balancesApi.myBalance(),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setRecent(recentData.slice(0, 8));
          setMyBalance(myBalanceData);
        }
      } catch (err) {
        toast(apiErrorMessage(err), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.expenseByCategory.map((c) => ({ name: c.categoryName, total: Number(c.total) }));
  }, [summary]);

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ledger-ink">This month's page</h1>
          <p className="text-sm text-ledger-inkFaint mt-1">{monthLabel}</p>
        </div>
        <Link
          to="/transactions"
          className="text-sm text-ledger-inkFaint hover:text-ledger-ink underline underline-offset-2"
        >
          View all transactions →
        </Link>
      </div>

      {loading ? (
        <div className="paper-panel"><Spinner label="Tallying the books…" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Income" value={summary?.totalIncome} kind="credit" />
            <SummaryCard label="Expenses" value={summary?.totalExpense} kind="debit" />
            <SummaryCard label="Net" value={summary?.net} kind={Number(summary?.net) >= 0 ? 'credit' : 'debit'} />
          </div>

          {myBalance && (
            <div className="paper-panel p-6">
              <h2 className="font-display text-lg text-ledger-ink mb-4">Group balances</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <SummaryCard label="Owed to you" value={myBalance.totalOwedToMe} kind="credit" />
                <SummaryCard label="You owe" value={myBalance.totalIOwe} kind="debit" />
                <SummaryCard
                  label="Net"
                  value={myBalance.netBalance}
                  kind={Number(myBalance.netBalance) >= 0 ? 'credit' : 'debit'}
                />
              </div>
              {myBalance.byGroup.length > 0 ? (
                <ul className="divide-y divide-ledger-rule/50">
                  {myBalance.byGroup.map((g) => (
                    <li key={g.groupId} className="flex items-center justify-between py-2.5">
                      <Link to={`/groups/${g.groupId}`} className="text-sm text-ledger-ink hover:underline">
                        {g.groupName}
                      </Link>
                      <Money value={g.netBalance} kind={Number(g.netBalance) >= 0 ? 'credit' : 'debit'} showSign />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="You're settled up" hint="No outstanding balances across any of your groups." />
              )}
            </div>
          )}

          <div className="paper-panel p-6">
            <h2 className="font-display text-lg text-ledger-ink mb-4">Expenses by category</h2>
            {chartData.length === 0 ? (
              <EmptyState title="No expenses recorded this month" hint="Log one from the Transactions page." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E5F0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E3E5F0' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Total']}
                      contentStyle={{ borderRadius: 12, borderColor: '#E3E5F0', fontFamily: 'Inter' }}
                    />
                    <Bar dataKey="total" fill="#F0653E" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="paper-panel p-6">
            <h2 className="font-display text-lg text-ledger-ink mb-4">Recent activity</h2>
            {recent.length === 0 ? (
              <EmptyState title="Nothing logged yet" hint="Your recent income and expenses will show up here." />
            ) : (
              <ul className="divide-y divide-ledger-rule/50">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ledger-ink">{t.description || t.categoryName}</p>
                      <p className="text-xs text-ledger-inkFaint mt-0.5">
                        {t.categoryName} · {t.date}
                        {t.groupName ? ` · ${t.groupName}` : ''}
                      </p>
                    </div>
                    <Money value={t.amount} kind={t.type === 'INCOME' ? 'credit' : 'debit'} showSign />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, kind }) {
  return (
    <div className="paper-panel p-5">
      <p className="text-xs uppercase tracking-wide text-ledger-inkFaint mb-2">{label}</p>
      <Money value={value} kind={kind} className="text-2xl font-semibold" />
    </div>
  );
}
