import { ArrowLeft, CheckCircle2, Info, Loader2, Quote, Sparkles, RotateCcw } from 'lucide-react';
import type { Category, Recommendation } from '../types';
import { CATEGORY_LABELS } from '../data/cards';
import CardVisual from './CardVisual';

interface Props {
  recommendation: Recommendation | null;
  isLoading: boolean;
  error: string | null;
  amount: number;
  category: Category;
  onBack: () => void;
  onRestart: () => void;
}

export default function RecommendationResult({ recommendation, isLoading, error, amount, category, onBack, onRestart }: Props) {
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-8 transition">
        <ArrowLeft className="w-4 h-4" /> Change amount or category
      </button>

      {isLoading ? (
        <div className="text-center py-24">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-fuchsia-400 animate-spin" />
          <p className="text-white/60">Finding your best card…</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-white/60 mb-8">{error}</p>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-white/10 hover:bg-white/20 transition"
          >
            <RotateCcw className="w-4 h-4" /> Start over
          </button>
        </div>
      ) : !recommendation ? (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-white mb-3">No great match found</h1>
          <p className="text-white/60 mb-8">
            None of your selected cards have a standout reward for{' '}
            <span className="text-white">{CATEGORY_LABELS[category]}</span> payments of ₹{amount.toLocaleString('en-IN')}.
          </p>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-white/10 hover:bg-white/20 transition"
          >
            <RotateCcw className="w-4 h-4" /> Start over
          </button>
        </div>
      ) : (
        <>
          {recommendation.rewardsEqual ? (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 px-5 py-4 mb-8 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-sm leading-relaxed">
                All your cards earn the same reward for this payment — you can use any of them.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 text-fuchsia-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Best match for this payment
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
            {recommendation.rewardsEqual ? `Any card works — e.g. ${recommendation.card.name}` : `Use your ${recommendation.card.name}`}
          </h1>
          <p className="text-white/60 mb-8">
            For ₹{amount.toLocaleString('en-IN')} on {CATEGORY_LABELS[category]}
          </p>

          <div className="mb-8">
            <CardVisual card={recommendation.card} />
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm">Reward rate</span>
              <span className="text-white font-bold text-lg">{recommendation.rewardRate}</span>
            </div>
            {recommendation.pointsEarned !== undefined && recommendation.pointsEarned !== null && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm">Points earned</span>
                <span className="text-white font-bold text-lg">
                  {recommendation.pointsEarned.toLocaleString('en-IN')} pts
                  {recommendation.pointValueInr != null && (
                    <span className="text-white/40 font-normal text-sm"> (₹{recommendation.pointValueInr}/pt)</span>
                  )}
                </span>
              </div>
            )}
            {recommendation.estimatedReward ? (
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm">Estimated value</span>
                <span className="text-emerald-400 font-bold text-lg">{recommendation.estimatedReward}</span>
              </div>
            ) : (
              recommendation.pointsEarned !== undefined &&
              recommendation.pointsEarned !== null && (
                <p className="text-white/40 text-xs mb-4">Redemption value not specified in this card's documents.</p>
              )
            )}
            <p className="text-white/50 text-sm leading-relaxed border-t border-white/10 pt-4">
              {recommendation.explanation}
            </p>
            {recommendation.sourceQuote && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-start gap-2">
                  <Quote className="w-4 h-4 text-fuchsia-400/70 shrink-0 mt-0.5" />
                  <p className="text-white/60 text-sm leading-relaxed italic">"{recommendation.sourceQuote}"</p>
                </div>
                <p className="text-white/30 text-xs mt-2 ml-6">From {recommendation.card.name}'s card documents</p>
              </div>
            )}
          </div>

          {recommendation.comparison.length > 1 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">All your cards</h3>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                {recommendation.comparison.map((c, i) => {
                  const isBest = c.cardId === recommendation.card.id;
                  return (
                    <div
                      key={c.cardId}
                      className={`flex items-center justify-between px-4 py-3 gap-4
                        ${i > 0 ? 'border-t border-white/5' : ''}
                        ${isBest ? 'bg-fuchsia-500/10' : 'bg-white/[0.03]'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.gradient} shrink-0`} />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isBest ? 'text-white' : 'text-white/70'}`}>
                            {c.name}
                          </p>
                          <p className="text-xs text-white/30 truncate">{c.issuer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        {c.computedReward ? (
                          <div>
                            <p className={`text-sm font-semibold ${isBest ? 'text-fuchsia-300' : 'text-white/70'}`}>
                              {c.computedReward}
                            </p>
                            {c.rateDescription && (
                              <p className="text-xs text-white/30">{c.rateDescription}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/25 text-xs">No data</span>
                        )}
                        {isBest && <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {recommendation.secondaryCard && recommendation.secondaryNote && (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4 mb-8">
              <div className="flex items-center gap-2 mb-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" /> Also consider
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${recommendation.secondaryCard.gradient} shrink-0`} />
                <span className="text-white font-medium text-sm">{recommendation.secondaryCard.name}</span>
                <span className="text-white/40 text-xs">{recommendation.secondaryCard.issuer}</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{recommendation.secondaryNote}</p>
            </div>
          )}

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white/70 bg-white/5 hover:bg-white/10 transition"
          >
            <RotateCcw className="w-4 h-4" /> Make another payment
          </button>
        </>
      )}
    </div>
  );
}
