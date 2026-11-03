export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wide text-ledger-inkFaint mb-1.5">
      {children}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-ledger-rule bg-white px-3.5 py-2.5 text-sm text-ledger-ink placeholder:text-ledger-inkFaint/60 focus:border-ledger-primary focus:ring-2 focus:ring-ledger-primaryLight focus:outline-none transition-colors ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-ledger-rule bg-white px-3.5 py-2.5 text-sm text-ledger-ink focus:border-ledger-primary focus:ring-2 focus:ring-ledger-primaryLight focus:outline-none transition-colors ${props.className || ''}`}
    />
  );
}

export function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`bg-ledger-primary text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ledger-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`border border-ledger-rule text-ledger-ink text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ledger-paperDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="text-xs text-ledger-debit mt-1">{children}</p>;
}
