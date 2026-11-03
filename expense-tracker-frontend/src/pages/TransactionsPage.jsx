import { useEffect, useMemo, useState } from 'react';
import { transactionsApi } from '../api/transactions';
import { categoriesApi } from '../api/categories';
import { apiErrorMessage } from '../api/client';
import { useToast } from '../components/Toast';
import Money from '../components/Money';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Label, TextInput, Select, PrimaryButton, SecondaryButton, ErrorText } from '../components/FormField';

const blankForm = { amount: '', date: new Date().toISOString().slice(0, 10), description: '', categoryId: '' };

export default function TransactionsPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  // The modal is opened already knowing its type (income or expense) —
  // set by which button the user clicked, never toggled inside the form.
  const [modalType, setModalType] = useState(null); // 'INCOME' | 'EXPENSE' | null (closed)
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      const data = await transactionsApi.search(params);
      setTransactions(data);
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const [income, expense] = await Promise.all([
          categoriesApi.list('INCOME'),
          categoriesApi.list('EXPENSE'),
        ]);
        setCategories([...income, ...expense]);
      } catch (err) {
        toast(apiErrorMessage(err), 'error');
      }
    }
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoriesForType = (type) => categories.filter((c) => c.type === type);

  const openCreate = (type) => {
    setEditing(null);
    setForm(blankForm);
    setFormError('');
    setModalType(type);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      amount: t.amount,
      date: t.date,
      description: t.description || '',
      categoryId: t.categoryId,
    });
    setFormError('');
    setModalType(t.type);
  };

  const closeModal = () => setModalType(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.categoryId) {
      setFormError('Choose a category');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type: modalType,
        amount: Number(form.amount),
        date: form.date,
        description: form.description || null,
        categoryId: Number(form.categoryId),
      };
      if (editing) {
        await transactionsApi.update(editing.id, payload);
        toast('Transaction updated', 'success');
      } else {
        await transactionsApi.create(payload);
        toast(modalType === 'INCOME' ? 'Income logged' : 'Expense logged', 'success');
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await transactionsApi.remove(t.id);
      toast('Transaction deleted', 'success');
      load();
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    }
  };

  const availableCategories = useMemo(
    () => (modalType ? categoriesForType(modalType) : []),
    [categories, modalType]
  );

  const isIncome = modalType === 'INCOME';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ledger-ink">Transactions</h1>
          <p className="text-sm text-ledger-inkFaint mt-1">Personal income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-ledger-rule bg-white text-ledger-ink text-sm px-3 py-2 focus:outline-none focus:border-ledger-primary focus:ring-2 focus:ring-ledger-primaryLight"
          >
            <option value="">All types</option>
            <option value="INCOME">Income only</option>
            <option value="EXPENSE">Expenses only</option>
          </select>
          <button
            onClick={() => openCreate('INCOME')}
            className="bg-ledger-credit text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ledger-creditDark transition-colors"
          >
            + Income
          </button>
          <button
            onClick={() => openCreate('EXPENSE')}
            className="bg-ledger-debit text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ledger-debitDark transition-colors"
          >
            + Expense
          </button>
        </div>
      </div>

      <div className="paper-panel">
        {loading ? (
          <Spinner label="Loading transactions…" />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            hint="Log your first income or expense to see it here."
            action={
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => openCreate('INCOME')}
                  className="bg-ledger-credit text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ledger-creditDark transition-colors"
                >
                  + Income
                </button>
                <button
                  onClick={() => openCreate('EXPENSE')}
                  className="bg-ledger-debit text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ledger-debitDark transition-colors"
                >
                  + Expense
                </button>
              </div>
            }
          />
        ) : (
          <ul className="divide-y divide-ledger-rule/50">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ledger-ink truncate">{t.description || t.categoryName}</p>
                  <p className="text-xs text-ledger-inkFaint mt-0.5">
                    {t.categoryName} · {t.date}
                    {t.groupName ? ` · shared in ${t.groupName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Money value={t.amount} kind={t.type === 'INCOME' ? 'credit' : 'debit'} showSign />
                  {!t.groupId && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-xs text-ledger-inkFaint hover:text-ledger-ink px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="text-xs text-ledger-inkFaint hover:text-ledger-debit px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!modalType}
        onClose={closeModal}
        title={editing ? `Edit ${isIncome ? 'income' : 'expense'}` : isIncome ? 'Add income' : 'Add expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`text-center text-xs font-semibold uppercase tracking-wide rounded-xl py-2 ${
              isIncome ? 'bg-ledger-credit/10 text-ledger-creditDark' : 'bg-ledger-debit/10 text-ledger-debitDark'
            }`}
          >
            {isIncome ? 'Income' : 'Expense'}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <TextInput
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <TextInput
                id="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Choose a category…</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <TextInput
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={isIncome ? 'e.g. Freelance payment' : 'e.g. Weekly groceries'}
            />
          </div>

          <ErrorText>{formError}</ErrorText>

          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton type="button" onClick={closeModal}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : isIncome ? 'Add income' : 'Add expense'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
