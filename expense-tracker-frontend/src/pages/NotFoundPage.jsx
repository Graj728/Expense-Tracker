import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ledger-bg flex items-center justify-center px-4">
      <div className="paper-panel p-10 text-center max-w-sm">
        <p className="font-display text-3xl text-ledger-ink mb-2">Page not found</p>
        <p className="text-sm text-ledger-inkFaint mb-6">This page doesn't exist.</p>
        <Link to="/" className="text-sm font-medium text-ledger-primary underline underline-offset-2">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
