import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { CreditCard } from '../types';
import CardVisual from './CardVisual';

interface Props {
  cards: CreditCard[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onContinue: () => void;
}

export default function Onboarding({ cards, selectedIds, onToggle, onContinue }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q),
    );
  }, [cards, query]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Which cards do you carry?</h1>
        <p className="text-white/60">Select all the credit cards in your wallet. We'll recommend the best one for every payment.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by card name or bank…"
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {filtered.map((card) => (
          <CardVisual
            key={card.id}
            card={card}
            compact
            selected={selectedIds.has(card.id)}
            onClick={() => onToggle(card.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-white/40 py-8">No cards match "{query}".</p>
        )}
      </div>

      <div className="flex items-center justify-between sticky bottom-6">
        <span className="text-white/60 text-sm">{selectedIds.size} card{selectedIds.size === 1 ? '' : 's'} selected</span>
        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={onContinue}
          className="rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-fuchsia-500 to-indigo-600
            disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition shadow-lg shadow-fuchsia-900/30"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
