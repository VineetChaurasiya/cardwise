import { useEffect, useState } from 'react';
import { Shield, User } from 'lucide-react';
import type { Category, CreditCard, PaymentMode, Recommendation, RewardPreference } from './types';
import { createSession, fetchCards, fetchRecommendation, getUserCardIds, setUserCardIds } from './lib/api';
import Onboarding from './components/Onboarding';
import PaymentForm from './components/PaymentForm';
import RecommendationResult from './components/RecommendationResult';
import AdminPanel from './components/admin/AdminPanel';
import AdminLoginModal from './components/admin/AdminLoginModal';

const ADMIN_TOKEN_KEY = 'cardwise_admin_token';

type Step = 'onboarding' | 'payment' | 'result';
type View = 'user' | 'admin';

const SESSION_STORAGE_KEY = 'cardwise_session_id';

async function getOrCreateSessionId(): Promise<string> {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const sessionId = await createSession();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export default function App() {
  const [view, setView] = useState<View>('user');
  const [step, setStep] = useState<Step>('onboarding');
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);

  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<Category>('grocery');
const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sid, cardList] = await Promise.all([getOrCreateSessionId(), fetchCards()]);
        setSessionId(sid);
        setCards(cardList);
        const existingCardIds = await getUserCardIds(sid);
        setSelectedIds(new Set(existingCardIds));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load cards');
      }
    })();
  }, []);

  function toggleCard(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleContinueFromOnboarding() {
    if (sessionId) {
      await setUserCardIds(sessionId, Array.from(selectedIds));
    }
    setStep('payment');
  }

  async function handlePaymentSubmit(amt: number, cat: Category, pref: RewardPreference, mode: PaymentMode, merchant?: string) {
    setAmount(amt);
    setCategory(cat);
    setStep('result');

    if (!sessionId) return;
    setIsRecommending(true);
    setRecommendError(null);
    try {
      const rec = await fetchRecommendation(sessionId, amt, cat, pref, mode, merchant);
      setRecommendation(rec);
    } catch (err) {
      setRecommendError(err instanceof Error ? err.message : 'Failed to get a recommendation');
    } finally {
      setIsRecommending(false);
    }
  }

  return (
    <div className="min-h-svh" style={{ background: 'var(--bg-base)' }}>
      <header className="px-6 py-5 max-w-5xl mx-auto flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--gold)', color: '#0b0f0d' }}>
            C
          </div>
          <span className="font-semibold tracking-tight text-sm" style={{ color: 'var(--text-base)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}>CARDWISE</span>
        </div>

        <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setView('user')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition`}
            style={view === 'user'
              ? { background: 'var(--gold)', color: '#0b0f0d' }
              : { color: 'var(--text-muted)' }}
          >
            <User className="w-3 h-3" /> User
          </button>
          <button
            onClick={() => {
              if (adminToken) {
                setView('admin');
              } else {
                setShowAdminLogin(true);
              }
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition`}
            style={view === 'admin'
              ? { background: 'var(--gold)', color: '#0b0f0d' }
              : { color: 'var(--text-muted)' }}
          >
            <Shield className="w-3 h-3" /> Admin
          </button>
        </div>
      </header>

      {loadError ? (
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <p className="font-semibold mb-2" style={{ color: 'var(--text-base)' }}>Couldn't reach the backend</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{loadError}</p>
        </div>
      ) : view === 'admin' && adminToken ? (
        <AdminPanel
          cards={cards}
          token={adminToken}
          onCardCreated={(card) => setCards((prev) => [...prev, card])}
          onCardUpdated={(card) => setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)))}
          onCardDeleted={(cardId) => {
            setCards((prev) => prev.filter((c) => c.id !== cardId));
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(cardId);
              return next;
            });
          }}
          onLogout={() => {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            setAdminToken(null);
            setView('user');
          }}
        />
      ) : (
        <>
          {step === 'onboarding' && (
            <Onboarding
              cards={cards}
              selectedIds={selectedIds}
              onToggle={toggleCard}
              onContinue={handleContinueFromOnboarding}
            />
          )}

          {step === 'payment' && (
            <PaymentForm onBack={() => setStep('onboarding')} onSubmit={handlePaymentSubmit} />
          )}

          {step === 'result' && (
            <RecommendationResult
              recommendation={recommendation}
              isLoading={isRecommending}
              error={recommendError}
              amount={amount}
              category={category}
              onBack={() => setStep('payment')}
              onRestart={() => setStep('onboarding')}
            />
          )}
        </>
      )}
      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={(token) => {
            localStorage.setItem(ADMIN_TOKEN_KEY, token);
            setAdminToken(token);
            setShowAdminLogin(false);
            setView('admin');
          }}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}
