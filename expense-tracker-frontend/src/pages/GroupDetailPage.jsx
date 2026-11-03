import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsApi } from '../api/groups';
import { groupExpensesApi } from '../api/groupExpenses';
import { balancesApi } from '../api/balances';
import { settlementsApi } from '../api/settlements';
import { apiErrorMessage } from '../api/client';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ReceiptCard from '../components/ReceiptCard';
import SplitterForm from '../components/SplitterForm';
import BalanceLedger from '../components/BalanceLedger';
import AddMemberSearch from '../components/AddMemberSearch';
import Money from '../components/Money';
import { Label, TextInput, PrimaryButton, SecondaryButton, ErrorText } from '../components/FormField';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'balances', label: 'Balances' },
  { key: 'settlements', label: 'Settlement history' },
];

export default function GroupDetailPage() {
  const { id } = useParams();
  const groupId = Number(id);
  const toast = useToast();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [splitterOpen, setSplitterOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleForm, setSettleForm] = useState({ paidByUserId: '', paidToUserId: '', amount: '', note: '' });
  const [settleError, setSettleError] = useState('');
  const [settling, setSettling] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [groupData, expenseData, balanceData, settlementData] = await Promise.all([
        groupsApi.getOne(groupId),
        groupExpensesApi.list(groupId),
        balancesApi.get(groupId),
        settlementsApi.list(groupId),
      ]);
      setGroup(groupData);
      setExpenses(expenseData);
      setBalances(balanceData);
      setSettlements(settlementData);
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const myNetBalance = useMemo(() => {
    if (!balances || !user) return 0;
    return balances.netBalances.find((b) => b.userId === user.id)?.netBalance ?? 0;
  }, [balances, user]);

  const totalGroupSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const myOpenTransfers = useMemo(() => {
    if (!balances || !user) return [];
    return balances.suggestedSettlements.filter(
      (t) => t.fromUserId === user.id || t.toUserId === user.id
    );
  }, [balances, user]);

  const refreshBalancesAndExpenses = async () => {
    try {
      const [expenseData, balanceData] = await Promise.all([
        groupExpensesApi.list(groupId),
        balancesApi.get(groupId),
      ]);
      setExpenses(expenseData);
      setBalances(balanceData);
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    }
  };

  const handleExpenseCreated = () => {
    setSplitterOpen(false);
    toast('Expense split among group', 'success');
    refreshBalancesAndExpenses();
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm('Delete this expense? Balances will be recalculated.')) return;
    try {
      await groupExpensesApi.remove(groupId, expense.transactionId);
      toast('Expense deleted', 'success');
      refreshBalancesAndExpenses();
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    }
  };

  const handleAddMember = async (user) => {
    setAddingMember(true);
    try {
      const updated = await groupsApi.addMember(groupId, user.id);
      setGroup(updated);
      toast(`${user.name} added to the group`, 'success');
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setAddingMember(false);
    }
  };

  const openSettleFor = (transfer) => {
    setSettleForm({
      paidByUserId: String(transfer.fromUserId),
      paidToUserId: String(transfer.toUserId),
      amount: String(transfer.amount),
      note: '',
    });
    setSettleError('');
    setSettleModalOpen(true);
  };

  const openSettleBlank = () => {
    setSettleForm({ paidByUserId: '', paidToUserId: '', amount: '', note: '' });
    setSettleError('');
    setSettleModalOpen(true);
  };

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    setSettleError('');
    if (settleForm.paidByUserId === settleForm.paidToUserId) {
      setSettleError('Choose two different members');
      return;
    }
    setSettling(true);
    try {
      await settlementsApi.create(groupId, {
        paidByUserId: Number(settleForm.paidByUserId),
        paidToUserId: Number(settleForm.paidToUserId),
        amount: Number(settleForm.amount),
        note: settleForm.note || null,
      });
      toast('Settlement recorded', 'success');
      setSettleModalOpen(false);
      const [balanceData, settlementData] = await Promise.all([
        balancesApi.get(groupId),
        settlementsApi.list(groupId),
      ]);
      setBalances(balanceData);
      setSettlements(settlementData);
    } catch (err) {
      setSettleError(apiErrorMessage(err));
    } finally {
      setSettling(false);
    }
  };

  if (loading) {
    return <div className="paper-panel"><Spinner label="Opening the group ledger…" /></div>;
  }

  if (!group) {
    return <EmptyState title="Group not found" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/groups" className="text-sm text-ledger-inkFaint hover:text-ledger-ink">
          ← All groups
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-ledger-ink">{group.name}</h1>
            {group.description && <p className="text-sm text-ledger-inkFaint mt-1">{group.description}</p>}
          </div>
          <PrimaryButton onClick={() => setSplitterOpen(true)}>+ Split an expense</PrimaryButton>
        </div>
      </div>

      <div className="paper-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wide text-ledger-inkFaint">
            Members ({group.members.length})
          </p>
          <button
            onClick={() => setMemberModalOpen(true)}
            className="text-xs text-ledger-ink underline underline-offset-2"
          >
            + Add member
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.members.map((m) => (
            <span
              key={m.userId}
              className="inline-flex items-center gap-1.5 text-sm bg-ledger-paperDark rounded-full pl-1 pr-3 py-1"
            >
              <span className="h-6 w-6 rounded-full bg-ledger-primary text-white text-[11px] flex items-center justify-center">
                {m.name.slice(0, 1).toUpperCase()}
              </span>
              {m.name}
              {m.role === 'ADMIN' && <span className="text-[10px] text-ledger-gold uppercase">admin</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 border-b border-ledger-rule">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-ledger-primary text-ledger-ink'
                : 'border-transparent text-ledger-inkFaint hover:text-ledger-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Your balance here" value={myNetBalance} kind={myNetBalance >= 0 ? 'credit' : 'debit'} />
            <SummaryCard label="Total group spend" value={totalGroupSpent} kind="debit" />
            <SummaryCard label="Members" value={group.members.length} plain />
          </div>

          {myOpenTransfers.length > 0 && (
            <div className="paper-panel p-6">
              <h2 className="font-display text-lg text-ledger-ink mb-4">You need to settle</h2>
              <ul className="space-y-2">
                {myOpenTransfers.map((t, i) => {
                  const iOwe = t.fromUserId === user?.id;
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ledger-rule bg-white/40 px-4 py-3"
                    >
                      <span className="text-sm text-ledger-ink">
                        {iOwe ? (
                          <>
                            You owe <strong className="font-medium">{t.toUserName}</strong>
                          </>
                        ) : (
                          <>
                            <strong className="font-medium">{t.fromUserName}</strong> owes you
                          </>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        <Money value={t.amount} kind={iOwe ? 'debit' : 'credit'} showSign />
                        <button
                          onClick={() => openSettleFor(t)}
                          className="text-xs px-2.5 py-1.5 rounded-xl border border-ledger-rule text-ledger-ink hover:bg-ledger-paperDark"
                        >
                          Mark settled
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="paper-panel p-6">
            <h2 className="font-display text-lg text-ledger-ink mb-4">Recent group expenses</h2>
            {expenses.length === 0 ? (
              <EmptyState title="No shared expenses yet" hint="Split your first bill among the group." />
            ) : (
              <ul className="divide-y divide-ledger-rule/50">
                {expenses.slice(0, 5).map((exp) => (
                  <li key={exp.transactionId} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-ledger-ink">{exp.description || 'Group expense'}</p>
                      <p className="text-xs text-ledger-inkFaint mt-0.5">{exp.date}</p>
                    </div>
                    <Money value={exp.amount} kind="debit" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div>
          {expenses.length === 0 ? (
            <div className="paper-panel">
              <EmptyState
                title="No shared expenses yet"
                hint="Split your first bill among the group."
                action={<PrimaryButton onClick={() => setSplitterOpen(true)}>+ Split an expense</PrimaryButton>}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {expenses.map((exp) => (
                <ReceiptCard key={exp.transactionId} expense={exp} onDelete={handleDeleteExpense} canDelete />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'balances' && balances && (
        <div className="paper-panel p-6">
          <div className="flex justify-end mb-2">
            <button onClick={openSettleBlank} className="text-xs text-ledger-ink underline underline-offset-2">
              + Record a settlement manually
            </button>
          </div>
          <BalanceLedger balances={balances} onSettle={openSettleFor} />
        </div>
      )}

      {tab === 'settlements' && (
        <div className="paper-panel p-6">
          {settlements.length === 0 ? (
            <EmptyState title="No settlements recorded" hint="Payments between members will show up here." />
          ) : (
            <ul className="divide-y divide-ledger-rule/50">
              {settlements.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="text-ledger-ink">
                      <strong className="font-medium">{s.paidByName}</strong> paid{' '}
                      <strong className="font-medium">{s.paidToName}</strong>
                    </span>
                    <p className="text-xs text-ledger-inkFaint mt-0.5">
                      {new Date(s.settledAt).toLocaleString()} {s.note ? `· ${s.note}` : ''}
                    </p>
                  </div>
                  <Money value={s.amount} kind="credit" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Modal open={splitterOpen} onClose={() => setSplitterOpen(false)} title="Split an expense" maxWidth="max-w-2xl">
        <SplitterForm group={group} onCreated={handleExpenseCreated} onCancel={() => setSplitterOpen(false)} />
      </Modal>

      <Modal open={memberModalOpen} onClose={() => setMemberModalOpen(false)} title="Add a member">
        <AddMemberSearch
          existingMemberIds={new Set(group.members.map((m) => m.userId))}
          onAdd={handleAddMember}
          adding={addingMember}
        />
      </Modal>

      <Modal open={settleModalOpen} onClose={() => setSettleModalOpen(false)} title="Record a settlement">
        <form onSubmit={handleSettleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="paidByUser">Paid by</Label>
              <select
                id="paidByUser"
                required
                value={settleForm.paidByUserId}
                onChange={(e) => setSettleForm({ ...settleForm, paidByUserId: e.target.value })}
                className="w-full rounded-xl border border-ledger-rule bg-white/60 px-3 py-2 text-sm focus:border-ledger-primary focus:ring-2 focus:ring-ledger-primaryLight focus:outline-none"
              >
                <option value="">Choose…</option>
                {group.members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="paidToUser">Paid to</Label>
              <select
                id="paidToUser"
                required
                value={settleForm.paidToUserId}
                onChange={(e) => setSettleForm({ ...settleForm, paidToUserId: e.target.value })}
                className="w-full rounded-xl border border-ledger-rule bg-white/60 px-3 py-2 text-sm focus:border-ledger-primary focus:ring-2 focus:ring-ledger-primaryLight focus:outline-none"
              >
                <option value="">Choose…</option>
                {group.members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="settleAmount">Amount</Label>
            <TextInput
              id="settleAmount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={settleForm.amount}
              onChange={(e) => setSettleForm({ ...settleForm, amount: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="settleNote">Note (optional)</Label>
            <TextInput
              id="settleNote"
              value={settleForm.note}
              onChange={(e) => setSettleForm({ ...settleForm, note: e.target.value })}
              placeholder="e.g. Venmo transfer"
            />
          </div>
          <ErrorText>{settleError}</ErrorText>
          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton type="button" onClick={() => setSettleModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={settling}>
              {settling ? 'Recording…' : 'Record settlement'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value, kind, plain }) {
  return (
    <div className="paper-panel p-5">
      <p className="text-xs uppercase tracking-wide text-ledger-inkFaint mb-2">{label}</p>
      {plain ? (
        <p className="text-2xl font-semibold text-ledger-ink">{value}</p>
      ) : (
        <Money value={value} kind={kind} className="text-2xl font-semibold" showSign />
      )}
    </div>
  );
}
