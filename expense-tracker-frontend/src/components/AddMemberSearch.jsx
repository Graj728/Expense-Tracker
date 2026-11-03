import { useEffect, useRef, useState } from 'react';
import { usersApi } from '../api/users';
import { apiErrorMessage } from '../api/client';
import { TextInput, ErrorText } from './FormField';

/**
 * Debounced search-as-you-type for finding a user by name or email,
 * so group members can be added without knowing anyone's numeric ID.
 */
export default function AddMemberSearch({ existingMemberIds, onAdd, adding }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await usersApi.search(trimmed);
        setResults(data);
        setError('');
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div>
      <TextInput
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email…"
      />
      <ErrorText>{error}</ErrorText>

      <div className="mt-3 max-h-64 overflow-y-auto">
        {query.trim().length >= 2 && !searching && results.length === 0 && !error && (
          <p className="text-sm text-ledger-inkFaint px-1 py-3">No one found matching "{query.trim()}".</p>
        )}

        {searching && <p className="text-sm text-ledger-inkFaint px-1 py-3">Searching…</p>}

        <ul className="divide-y divide-ledger-rule/50">
          {results.map((u) => {
            const alreadyMember = existingMemberIds.has(u.id);
            return (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ledger-ink truncate">{u.name}</p>
                  <p className="text-xs text-ledger-inkFaint truncate">{u.email}</p>
                </div>
                <button
                  type="button"
                  disabled={alreadyMember || adding}
                  onClick={() => onAdd(u)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-xl border border-ledger-rule text-ledger-ink hover:bg-ledger-paperDark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {alreadyMember ? 'Already in group' : 'Add'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-ledger-inkFaint mt-3">
        Type at least 2 characters of their name or email to find them.
      </p>
    </div>
  );
}
