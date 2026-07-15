import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CreditCard } from '../../types';
import { deleteCard } from '../../lib/api';

interface Props {
  token: string;
  card: CreditCard;
  docCount: number;
  onClose: () => void;
  onDeleted: (cardId: string) => void;
}

export default function DeleteCardModal({ token, card, docCount, onClose, onDeleted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteCard(card.id, token);
      onDeleted(card.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-[#15131f] border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-white">Delete this card?</h2>
        </div>

        <p className="text-sm text-white/60 mb-6">
          This will permanently delete <span className="text-white font-medium">{card.name}</span> ({card.issuer})
          {docCount > 0 ? (
            <>
              {' '}and its <span className="text-white font-medium">{docCount}</span> uploaded document{docCount === 1 ? '' : 's'}
            </>
          ) : null}
          . This can't be undone.
        </p>

        {error && <p className="text-xs text-rose-400 mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500
              disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
