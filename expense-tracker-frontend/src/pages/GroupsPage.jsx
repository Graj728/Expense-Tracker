import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupsApi } from '../api/groups';
import { apiErrorMessage } from '../api/client';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Label, TextInput, PrimaryButton, SecondaryButton, ErrorText } from '../components/FormField';

export default function GroupsPage() {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setGroups(await groupsApi.list());
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await groupsApi.create({ name: form.name, description: form.description || null, memberUserIds: [] });
      toast('Group created', 'success');
      setModalOpen(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ledger-ink">Groups</h1>
          <p className="text-sm text-ledger-inkFaint mt-1">Shared expenses and splits</p>
        </div>
        <PrimaryButton onClick={() => setModalOpen(true)}>+ New group</PrimaryButton>
      </div>

      {loading ? (
        <div className="paper-panel"><Spinner label="Loading groups…" /></div>
      ) : groups.length === 0 ? (
        <div className="paper-panel">
          <EmptyState
            title="No groups yet"
            hint="Create a group for a trip, apartment, or anything you split with others."
            action={<PrimaryButton onClick={() => setModalOpen(true)}>+ New group</PrimaryButton>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="paper-panel p-5 hover:shadow-[0_1px_2px_rgba(30,36,48,0.04),0_16px_32px_-12px_rgba(30,36,48,0.25)] transition-shadow"
            >
              <p className="font-display text-lg text-ledger-ink">{g.name}</p>
              {g.description && <p className="text-sm text-ledger-inkFaint mt-1">{g.description}</p>}
              <div className="flex items-center gap-1.5 mt-4">
                {g.members.slice(0, 5).map((m) => (
                  <span
                    key={m.userId}
                    title={m.name}
                    className="h-7 w-7 rounded-full bg-ledger-primary text-white text-[11px] font-medium flex items-center justify-center border-2 border-white -ml-2 first:ml-0"
                  >
                    {m.name.slice(0, 1).toUpperCase()}
                  </span>
                ))}
                {g.members.length > 5 && (
                  <span className="text-xs text-ledger-inkFaint ml-1">+{g.members.length - 5} more</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New group">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group name</Label>
            <TextInput
              id="groupName"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lisbon Trip"
            />
          </div>
          <div>
            <Label htmlFor="groupDescription">Description (optional)</Label>
            <TextInput
              id="groupDescription"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this group for?"
            />
          </div>
          <ErrorText>{formError}</ErrorText>
          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create group'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
