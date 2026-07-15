import { useEffect, useState } from 'react';
import { LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CardDocument, CreditCard } from '../../types';
import { listDocuments } from '../../lib/api';
import CardVisual from '../CardVisual';
import DocumentUploader from './DocumentUploader';
import CardFormModal from './CardFormModal';
import DeleteCardModal from './DeleteCardModal';

interface Props {
  cards: CreditCard[];
  token: string;
  onCardCreated: (card: CreditCard) => void;
  onCardUpdated: (card: CreditCard) => void;
  onCardDeleted: (cardId: string) => void;
  onLogout: () => void;
}

export default function AdminPanel({ cards, token, onCardCreated, onCardUpdated, onCardDeleted, onLogout }: Props) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [docsByCard, setDocsByCard] = useState<Record<string, CardDocument[]>>({});
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null);

  useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  useEffect(() => {
    if (cards.length === 0) return;
    Promise.all(cards.map((c) => listDocuments(c.id).then((docs) => [c.id, docs] as const))).then(
      (entries) => setDocsByCard((prev) => ({ ...prev, ...Object.fromEntries(entries) })),
    );
  }, [cards]);

  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const cardDocs = selectedCardId ? docsByCard[selectedCardId] ?? [] : [];

  function setDocsForCard(cardId: string, docs: CardDocument[]) {
    setDocsByCard((prev) => ({ ...prev, [cardId]: docs }));
  }

  function handleCardCreated(card: CreditCard) {
    onCardCreated(card);
    setDocsByCard((prev) => ({ ...prev, [card.id]: [] }));
    setSelectedCardId(card.id);
    setShowAddCard(false);
  }

  function handleCardUpdated(card: CreditCard) {
    onCardUpdated(card);
    setEditingCard(null);
  }

  function handleCardDeleted(cardId: string) {
    onCardDeleted(cardId);
    setDocsByCard((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
    setDeletingCard(null);
    setSelectedCardId(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card document manager</h1>
          <p className="text-white/60">Upload T&amp;Cs, brochures, and fee schedules for each card. These power the recommendation engine.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r
              from-fuchsia-500 to-indigo-600 hover:brightness-110 transition shadow-lg shadow-fuchsia-900/30"
          >
            <Plus className="w-4 h-4" /> Add card
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50
              bg-white/5 hover:bg-white/10 hover:text-white/80 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!selectedCard ? (
        <p className="text-white/50">Loading cards…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div>
            <p className="text-sm font-medium text-white/50 mb-3">Select a card</p>
            <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
              {cards.map((card) => {
                const count = docsByCard[card.id]?.length ?? 0;
                const active = card.id === selectedCardId;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition border
                      ${active ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}
                  >
                    <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} shrink-0`} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-white truncate">{card.name}</span>
                      <span className="block text-xs text-white/40 truncate">{card.issuer}</span>
                    </span>
                    {count > 0 && (
                      <span className="text-[11px] font-medium text-white/70 bg-white/10 rounded-full px-2 py-0.5 shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-6 max-w-sm">
              <CardVisual card={selectedCard} />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditingCard(selectedCard)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium
                    text-white/70 bg-white/5 hover:bg-white/10 transition"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeletingCard(selectedCard)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium
                    text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
            <DocumentUploader
              card={selectedCard}
              docs={cardDocs}
              token={token}
              onDocsChange={(docs) => setDocsForCard(selectedCard.id, docs)}
            />
          </div>
        </div>
      )}

      {showAddCard && (
        <CardFormModal token={token} onClose={() => setShowAddCard(false)} onSaved={handleCardCreated} />
      )}

      {editingCard && (
        <CardFormModal token={token} editingCard={editingCard} onClose={() => setEditingCard(null)} onSaved={handleCardUpdated} />
      )}

      {deletingCard && (
        <DeleteCardModal
          token={token}
          card={deletingCard}
          docCount={docsByCard[deletingCard.id]?.length ?? 0}
          onClose={() => setDeletingCard(null)}
          onDeleted={handleCardDeleted}
        />
      )}
    </div>
  );
}
