import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-start md:items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${maxWidth} paper-panel p-6 focus:outline-none`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-ledger-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ledger-inkFaint hover:text-ledger-ink text-xl leading-none px-2 py-1"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
