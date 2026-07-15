import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreditCard } from '../../types';
import { createCard, updateCard } from '../../lib/api';

interface Props {
  token: string;
  editingCard?: CreditCard;
  onClose: () => void;
  onSaved: (card: CreditCard) => void;
}

const NETWORKS: CreditCard['network'][] = ['Visa', 'Mastercard', 'Amex', 'RuPay'];

const GRADIENTS = [
  'from-fuchsia-500 via-purple-600 to-indigo-700',
  'from-sky-500 via-blue-600 to-indigo-800',
  'from-slate-300 via-slate-400 to-slate-600',
  'from-rose-500 via-pink-600 to-red-700',
  'from-amber-400 via-orange-500 to-amber-700',
  'from-yellow-500 via-amber-600 to-yellow-800',
  'from-blue-500 via-cyan-600 to-teal-700',
  'from-emerald-500 via-teal-600 to-cyan-800',
  'from-indigo-500 via-violet-600 to-purple-800',
  'from-red-500 via-rose-600 to-pink-800',
];

export default function CardFormModal({ token, editingCard, onClose, onSaved }: Props) {
  const isEditing = !!editingCard;
  const [issuer, setIssuer] = useState(editingCard?.issuer ?? '');
  const [name, setName] = useState(editingCard?.name ?? '');
  const [network, setNetwork] = useState<CreditCard['network']>(editingCard?.network ?? 'Visa');
  const [annualFee, setAnnualFee] = useState(editingCard?.annualFee ?? '');
  const [gradient, setGradient] = useState(editingCard?.gradient ?? GRADIENTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = issuer.trim() && name.trim() && annualFee.trim();

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const input = { issuer: issuer.trim(), name: name.trim(), network, annualFee: annualFee.trim(), gradient };
      const card = isEditing ? await updateCard(editingCard.id, input, token) : await createCard(input, token);
      onSaved(card);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} card`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-[#15131f] border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{isEditing ? 'Edit card' : 'Add a new card'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Issuer</label>
            <input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30
                focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Card name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Millennia"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30
                focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as CreditCard['network'])}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white
                  focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
              >
                {NETWORKS.map((n) => (
                  <option key={n} value={n} className="bg-[#15131f]">{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Annual fee</label>
              <input
                value={annualFee}
                onChange={(e) => setAnnualFee(e.target.value)}
                placeholder="e.g. ₹1,000"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30
                  focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Card color</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGradient(g)}
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${g} transition
                    ${gradient === g ? 'ring-2 ring-white ring-offset-2 ring-offset-[#15131f]' : 'opacity-70 hover:opacity-100'}`}
                  aria-label={g}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="w-full rounded-lg px-4 py-2.5 font-semibold text-sm text-white bg-gradient-to-r from-fuchsia-500 to-indigo-600
              disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition mt-2"
          >
            {submitting ? (isEditing ? 'Saving…' : 'Creating…') : isEditing ? 'Save changes' : 'Create card'}
          </button>
        </div>
      </div>
    </div>
  );
}
