import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { Label, TextInput, PrimaryButton, ErrorText } from '../components/FormField';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ledger-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-ledger-primary mx-auto flex items-center justify-center font-display font-bold text-white text-2xl mb-4">
            E
          </div>
          <h1 className="font-display text-2xl text-ledger-ink">Get started</h1>
          <p className="text-sm text-ledger-inkFaint mt-1">Track income, expenses, and shared bills</p>
        </div>

        <form onSubmit={handleSubmit} className="paper-panel p-7 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <TextInput
              id="name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jordan Lee"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </div>

          <ErrorText>{error}</ErrorText>

          <PrimaryButton type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </PrimaryButton>

          <p className="text-center text-sm text-ledger-inkFaint pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-ledger-primary font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
