import { useState } from 'react';
import { ArrowLeft, Gift, IndianRupee, Wallet, Wifi, WifiOff } from 'lucide-react';
import type { Category, PaymentMode, RewardPreference } from '../types';
import { CATEGORY_EMOJIS, CATEGORY_LABELS, getCategoriesForMode } from '../data/cards';

interface Props {
  onBack: () => void;
  onSubmit: (amount: number, category: Category, rewardPreference: RewardPreference, mode: PaymentMode, merchant?: string) => void;
}

const REWARD_OPTIONS: { value: RewardPreference; label: string; description: string; icon: typeof Wallet }[] = [
  { value: 'cashback', label: 'Cashback', description: 'Direct money back — real discount, no redemption needed', icon: Wallet },
  { value: 'points',   label: 'Reward Points', description: 'Redeemable points, shown with their rupee value', icon: Gift },
];

export default function PaymentForm({ onBack, onSubmit }: Props) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PaymentMode | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [merchant, setMerchant] = useState('');
  const [rewardPreference, setRewardPreference] = useState<RewardPreference | null>(null);

  const amountValid = Number(amount) > 0;
  const canSubmit = amountValid && mode && category && rewardPreference;

  function handleModeSelect(m: PaymentMode) {
    setMode(m);
    setCategory(null);
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    color: 'var(--text-base)',
    borderRadius: '0.75rem',
  };

  const selectedChipStyle = {
    background: 'var(--gold)',
    color: '#0b0f0d',
    border: '1px solid transparent',
  };

  const unselectedChipStyle = {
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-14">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-10 transition hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to your cards
      </button>

      <p className="text-xs font-semibold tracking-[0.18em] mb-3" style={{ color: 'var(--gold)' }}>
        PAYMENT DETAILS
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold mb-2 leading-tight" style={{ color: 'var(--text-base)' }}>
        What are you paying for?
      </h1>
      <p className="mb-10 text-base" style={{ color: 'var(--text-muted)' }}>
        We'll match it against your wallet to find the best card.
      </p>

      {/* Amount */}
      <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>AMOUNT</label>
      <div className="relative mb-8">
        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full pl-11 pr-4 py-3.5 text-lg focus:outline-none transition"
          style={{ ...inputStyle, boxShadow: 'none' }}
        />
      </div>

      {/* Online / Offline */}
      <label className="block text-xs font-semibold tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>PAYMENT MODE</label>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {([['online', 'Online', Wifi], ['offline', 'Offline', WifiOff]] as const).map(([val, label, Icon]) => (
          <button
            key={val}
            onClick={() => handleModeSelect(val)}
            className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition hover:opacity-90"
            style={mode === val ? selectedChipStyle : unselectedChipStyle}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Category */}
      {mode && (
        <>
          <label className="block text-xs font-semibold tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>CATEGORY</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
            {getCategoriesForMode(mode).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition hover:opacity-90"
                style={category === cat ? selectedChipStyle : unselectedChipStyle}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Merchant */}
      {mode === 'online' && category && (
        <>
          <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            WEBSITE OR APP <span className="normal-case font-normal tracking-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Amazon, Swiggy, Zomato, Myntra…"
            className="w-full px-4 py-3.5 text-sm mb-8 focus:outline-none transition"
            style={inputStyle}
          />
        </>
      )}

      {/* Reward preference */}
      {category && (
        <>
          <label className="block text-xs font-semibold tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>WHAT MATTERS MORE TO YOU?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            {REWARD_OPTIONS.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setRewardPreference(value)}
                className="flex items-start gap-3 rounded-xl px-4 py-4 text-left transition hover:opacity-90"
                style={rewardPreference === value
                  ? { background: 'var(--gold-bg)', border: '1px solid var(--gold)', color: 'var(--text-base)' }
                  : unselectedChipStyle}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: rewardPreference === value ? 'var(--gold)' : 'var(--text-faint)' }} />
                <span>
                  <span className="block text-sm font-semibold" style={{ color: 'var(--text-base)' }}>{label}</span>
                  <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        disabled={!canSubmit}
        onClick={() => {
          if (mode && category && rewardPreference) {
            onSubmit(Number(amount), category, rewardPreference, mode, merchant || undefined);
          }
        }}
        className="w-full rounded-full px-6 py-3.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: 'var(--gold)', color: '#0b0f0d' }}
      >
        Find my best card →
      </button>
    </div>
  );
}
