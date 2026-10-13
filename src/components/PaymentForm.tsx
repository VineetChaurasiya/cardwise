import { useState } from 'react';
import { ArrowLeft, Gift, IndianRupee, Wallet, Wifi, WifiOff } from 'lucide-react';
import type { Category, PaymentMode, RewardPreference } from '../types';
import { CATEGORY_EMOJIS, CATEGORY_LABELS, getCategoriesForMode } from '../data/cards';

interface Props {
  onBack: () => void;
  onSubmit: (amount: number, category: Category, rewardPreference: RewardPreference, mode: PaymentMode, merchant?: string) => void;
}

const REWARD_OPTIONS: { value: RewardPreference; label: string; description: string; icon: typeof Wallet }[] = [
  { value: 'cashback', label: 'Cashback', description: 'Direct money back on your statement', icon: Wallet },
  { value: 'points',   label: 'Reward Points', description: 'Redeemable points, shown with their value', icon: Gift },
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
    setCategory(null); // reset category when mode changes
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-8 transition">
        <ArrowLeft className="w-4 h-4" /> Back to your cards
      </button>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">What are you paying for?</h1>
      <p className="text-white/60 mb-10">We'll match it against your wallet to find the best card.</p>

      {/* Amount */}
      <label className="block text-sm font-medium text-white/70 mb-2">Amount</label>
      <div className="relative mb-8">
        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-lg text-white placeholder:text-white/30
            focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60"
        />
      </div>

      {/* Online / Offline */}
      <label className="block text-sm font-medium text-white/70 mb-3">Payment mode</label>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {([['online', 'Online', Wifi], ['offline', 'Offline', WifiOff]] as const).map(([val, label, Icon]) => (
          <button
            key={val}
            onClick={() => handleModeSelect(val)}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition border
              ${mode === val
                ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white border-transparent shadow-lg shadow-fuchsia-900/30'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Category — shown after mode is selected */}
      {mode && (
        <>
          <label className="block text-sm font-medium text-white/70 mb-3">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {getCategoriesForMode(mode).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition border
                  ${category === cat
                    ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white border-transparent shadow-lg shadow-fuchsia-900/30'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Merchant — shown only for online payments after category selected */}
      {mode === 'online' && category && (
        <>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Website or app <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Amazon, Swiggy, Zomato, Myntra…"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/30
              focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-500/60 mb-8"
          />
        </>
      )}

      {/* Reward preference */}
      {category && (
        <>
          <label className="block text-sm font-medium text-white/70 mb-3">What do you care about more?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            {REWARD_OPTIONS.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setRewardPreference(value)}
                className={`flex items-start gap-3 rounded-xl px-4 py-4 text-left transition border
                  ${rewardPreference === value
                    ? 'bg-gradient-to-br from-fuchsia-500/20 to-indigo-600/20 border-fuchsia-500/60'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${rewardPreference === value ? 'text-fuchsia-400' : 'text-white/50'}`} />
                <span>
                  <span className="block text-sm font-semibold text-white">{label}</span>
                  <span className="block text-xs text-white/50 mt-0.5">{description}</span>
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
        className="w-full rounded-xl px-6 py-3.5 font-semibold text-white bg-gradient-to-r from-fuchsia-500 to-indigo-600
          disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition shadow-lg shadow-fuchsia-900/30"
      >
        Find my best card
      </button>
    </div>
  );
}
