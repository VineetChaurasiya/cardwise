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
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-[0.18em] mb-4" style={{ color: 'var(--gold)' }}>
          YOUR WALLET
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-base)' }}>
          Which cards do you carry?
        </h1>
        <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
          Select all the credit cards in your wallet. We'll recommend the best one for every payment.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by card name or bank…"
          className="w-full rounded-full pl-11 pr-5 py-3.5 text-sm transition focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            color: 'var(--text-base)',
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
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
          <p className="col-span-full text-center py-8 text-sm" style={{ color: 'var(--text-faint)' }}>
            No cards match "{query}".
          </p>
        )}
      </div>

      <div className="flex items-center justify-between sticky bottom-6">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {selectedIds.size} card{selectedIds.size === 1 ? '' : 's'} selected
        </span>
        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={onContinue}
          className="rounded-full px-7 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'var(--gold)', color: '#0b0f0d' }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
