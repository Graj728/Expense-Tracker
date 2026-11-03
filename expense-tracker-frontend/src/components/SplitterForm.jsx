import { useEffect, useMemo, useState } from 'react';
import { groupExpensesApi } from '../api/groupExpenses';
import { categoriesApi } from '../api/categories';
import { apiErrorMessage } from '../api/client';
import { Label, TextInput, Select, PrimaryButton, SecondaryButton, ErrorText } from './FormField';

const SPLIT_TYPES = [
  { value: 'EQUAL', label: 'Equal' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'EXACT', label: 'Exact amounts' },
];

export default function SplitterForm({ group, onCreated, onCancel }) {
  const members = group.members;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [paidByUserId, setPaidByUserId] = useState(members[0]?.userId ?? '');
  const [splitType, setSplitType] = useState('EQUAL');
  const [participants, setParticipants] = useState(() => new Set(members.map((m) => m.userId)));
  const [shareValues, setShareValues] = useState({}); // userId -> string value, for PERCENTAGE / EXACT
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoriesApi.list('EXPENSE').then(setCategories).catch(() => {});
  }, []);

  const toggleParticipant = (userId) => {
    setParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const setShare = (userId, value) => {
    setShareValues((prev) => ({ ...prev, [userId]: value }));
  };

  // For PERCENTAGE/EXACT, only members with a non-empty share value are counted as participants.
  const activeShareUserIds = useMemo(
    () => members.filter((m) => (shareValues[m.userId] ?? '').trim() !== '').map((m) => m.userId),
    [members, shareValues]
  );

  const percentageTotal = useMemo(() => {
    if (splitType !== 'PERCENTAGE') return 0;
    return activeShareUserIds.reduce((sum, uid) => sum + (Number(shareValues[uid]) || 0), 0);
  }, [splitType, activeShareUserIds, shareValues]);

  const exactTotal = useMemo(() => {
    if (splitType !== 'EXACT') return 0;
    return activeShareUserIds.reduce((sum, uid) => sum + (Number(shareValues[uid]) || 0), 0);
  }, [splitType, activeShareUserIds, shareValues]);

  const amountNum = Number(amount) || 0;
  const exactDiff = Math.round((amountNum - exactTotal) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Choose a category');
      return;
    }
    if (!paidByUserId) {
      setError('Choose who paid');
      return;
    }

    let payload = {
      amount: amountNum,
      date,
      description: description || null,
      categoryId: Number(categoryId),
      paidByUserId: Number(paidByUserId),
      splitType,
    };

    if (splitType === 'EQUAL') {
      const ids = [...participants];
      if (ids.length === 0) {
        setError('Select at least one participant');
        return;
      }
      payload.participantUserIds = ids;
    } else if (splitType === 'PERCENTAGE') {
      if (activeShareUserIds.length === 0) {
        setError('Enter a percentage for at least one member');
        return;
      }
      if (Math.round(percentageTotal * 100) / 100 !== 100) {
        setError(`Percentages must add up to 100 (currently ${percentageTotal.toFixed(2)})`);
        return;
      }
      payload.shares = activeShareUserIds.map((uid) => ({ userId: uid, value: Number(shareValues[uid]) }));
    } else {
      if (activeShareUserIds.length === 0) {
        setError('Enter an amount for at least one member');
        return;
      }
      if (Math.abs(exactDiff) >= 0.01) {
        setError(`Exact shares must add up to the total. Off by ${exactDiff.toFixed(2)}.`);
        return;
      }
      payload.shares = activeShareUserIds.map((uid) => ({ userId: uid, value: Number(shareValues[uid]) }));
    }

    setSaving(true);
    try {
      const created = await groupExpensesApi.create(group.id, payload);
      onCreated(created);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="splitAmount">Total amount</Label>
          <TextInput
            id="splitAmount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="splitDate">Date</Label>
          <TextInput id="splitDate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="splitCategory">Category</Label>
          <Select id="splitCategory" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Choose…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="paidBy">Paid by</Label>
          <Select id="paidBy" required value={paidByUserId} onChange={(e) => setPaidByUserId(e.target.value)}>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="splitDescription">Description (optional)</Label>
        <TextInput
          id="splitDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Dinner at the harbor"
        />
      </div>

      <div>
        <Label>Split method</Label>
        <div className="grid grid-cols-3 gap-2">
          {SPLIT_TYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSplitType(s.value)}
              className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                splitType === s.value
                  ? 'bg-ledger-primary text-white border-ledger-primary'
                  : 'border-ledger-rule text-ledger-inkFaint'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-ledger-rule bg-white/40 p-4">
        <p className="text-xs uppercase tracking-wide text-ledger-inkFaint mb-3">
          {splitType === 'EQUAL' && 'Who is splitting this?'}
          {splitType === 'PERCENTAGE' && 'Percentage per member'}
          {splitType === 'EXACT' && 'Exact amount per member'}
        </p>

        <ul className="space-y-2.5">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-3">
              {splitType === 'EQUAL' ? (
                <label className="flex items-center gap-2.5 text-sm text-ledger-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={participants.has(m.userId)}
                    onChange={() => toggleParticipant(m.userId)}
                    className="h-4 w-4 accent-ledger-primary"
                  />
                  {m.name}
                </label>
              ) : (
                <>
                  <span className="text-sm text-ledger-ink">{m.name}</span>
                  <div className="flex items-center gap-1.5 w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shareValues[m.userId] ?? ''}
                      onChange={(e) => setShare(m.userId, e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-ledger-rule bg-white px-2 py-1 text-sm money text-right focus:border-ledger-primary focus:ring-2 focus:ring-ledger-primaryLight focus:outline-none"
                    />
                    <span className="text-xs text-ledger-inkFaint">{splitType === 'PERCENTAGE' ? '%' : '$'}</span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {splitType === 'PERCENTAGE' && (
          <p className={`text-xs mt-3 ${percentageTotal === 100 ? 'text-ledger-credit' : 'text-ledger-debit'}`}>
            Total: {percentageTotal.toFixed(2)}% {percentageTotal === 100 ? '✓' : '(must equal 100%)'}
          </p>
        )}
        {splitType === 'EXACT' && (
          <p className={`text-xs mt-3 ${Math.abs(exactDiff) < 0.01 ? 'text-ledger-credit' : 'text-ledger-debit'}`}>
            Assigned: ${exactTotal.toFixed(2)} of ${amountNum.toFixed(2)}
            {Math.abs(exactDiff) >= 0.01 ? ` (off by $${exactDiff.toFixed(2)})` : ' ✓'}
          </p>
        )}
      </div>

      <ErrorText>{error}</ErrorText>

      <div className="flex justify-end gap-3 pt-1">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? 'Splitting…' : 'Split expense'}
        </PrimaryButton>
      </div>
    </form>
  );
}
