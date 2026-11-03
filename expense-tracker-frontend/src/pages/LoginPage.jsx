import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { Label, TextInput, PrimaryButton, ErrorText } from '../components/FormField';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
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
          <h1 className="font-display text-2xl text-ledger-ink">Welcome back</h1>
          <p className="text-sm text-ledger-inkFaint mt-1">Sign in to ExpCome Flow</p>
        </div>

        <form onSubmit={handleSubmit} className="paper-panel p-7 space-y-4">
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
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <ErrorText>{error}</ErrorText>

          <PrimaryButton type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>

          <p className="text-center text-sm text-ledger-inkFaint pt-2">
            New here?{' '}
            <Link to="/register" className="text-ledger-primary font-medium underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
