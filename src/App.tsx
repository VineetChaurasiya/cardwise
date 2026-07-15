import { useEffect, useState } from 'react';
import { Shield, User } from 'lucide-react';
import type { Category, CreditCard, Recommendation, RewardPreference } from './types';
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
  const [, setRewardPreference] = useState<RewardPreference>('cashback');

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

  async function handlePaymentSubmit(amt: number, cat: Category, pref: RewardPreference) {
    setAmount(amt);
    setCategory(cat);
    setRewardPreference(pref);
    setStep('result');

    if (!sessionId) return;
    setIsRecommending(true);
    setRecommendError(null);
    try {
      const rec = await fetchRecommendation(sessionId, amt, cat, pref);
      setRecommendation(rec);
    } catch (err) {
      setRecommendError(err instanceof Error ? err.message : 'Failed to get a recommendation');
    } finally {
      setIsRecommending(false);
    }
  }

  return (
    <div className="min-h-svh bg-[#0b0a14] bg-[radial-gradient(ellipse_at_top,_rgba(139,69,255,0.18),_transparent_60%)]">
      <header className="px-6 py-5 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600" />
          <span className="text-white font-semibold tracking-tight">CardWise</span>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
          <button
            onClick={() => setView('user')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition
              ${view === 'user' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            <User className="w-3.5 h-3.5" /> User
          </button>
          <button
            onClick={() => {
              if (adminToken) {
                setView('admin');
              } else {
                setShowAdminLogin(true);
              }
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition
              ${view === 'admin' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>
      </header>

      {loadError ? (
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <p className="text-white font-semibold mb-2">Couldn't reach the backend</p>
          <p className="text-white/50 text-sm">{loadError}</p>
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
