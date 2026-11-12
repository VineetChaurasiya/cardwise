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
    <div className="max-w-xl mx-auto px-6 py-14">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-10 transition hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" /> Change amount or category
      </button>

      {isLoading ? (
        <div className="text-center py-24">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: 'var(--gold)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Finding your best card…</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-base)' }}>Something went wrong</h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-base)', border: '1px solid var(--border)' }}
          >
            <RotateCcw className="w-4 h-4" /> Start over
          </button>
        </div>
      ) : !recommendation ? (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-base)' }}>No great match found</h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            None of your selected cards have a standout reward for{' '}
            <span style={{ color: 'var(--text-base)' }}>{CATEGORY_LABELS[category]}</span> payments of ₹{amount.toLocaleString('en-IN')}.
          </p>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-base)', border: '1px solid var(--border)' }}
          >
            <RotateCcw className="w-4 h-4" /> Start over
          </button>
        </div>
      ) : (
        <>
          {/* Equal rewards banner */}
          {recommendation.rewardsEqual && (
            <div className="rounded-2xl px-5 py-4 mb-8 flex items-start gap-3"
              style={{ background: 'rgba(210,180,126,0.1)', border: '1px solid rgba(210,180,126,0.3)' }}>
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--gold-light)' }}>
                All your cards earn the same reward for this payment — you can use any of them.
              </p>
            </div>
          )}

          {/* Eyebrow */}
          {!recommendation.rewardsEqual && (
            <p className="text-xs font-semibold tracking-[0.18em] mb-3 flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
              <Sparkles className="w-3 h-3" /> BEST MATCH FOR THIS PAYMENT
            </p>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold mb-1 leading-tight" style={{ color: 'var(--text-base)' }}>
            {recommendation.rewardsEqual
              ? `Any card works — e.g. ${recommendation.card.name}`
              : `Use your ${recommendation.card.name}`}
          </h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            For ₹{amount.toLocaleString('en-IN')} on {CATEGORY_LABELS[category]}
          </p>

          <div className="mb-8">
            <CardVisual card={recommendation.card} />
          </div>

          {/* Reward details */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>REWARD RATE</span>
              <span className="font-bold text-lg" style={{ color: 'var(--text-base)' }}>{recommendation.rewardRate}</span>
            </div>

            {recommendation.pointsEarned !== undefined && recommendation.pointsEarned !== null && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>POINTS EARNED</span>
                <span className="font-bold text-lg" style={{ color: 'var(--text-base)' }}>
                  {recommendation.pointsEarned.toLocaleString('en-IN')} pts
                  {recommendation.pointValueInr != null && (
                    <span className="font-normal text-sm ml-1" style={{ color: 'var(--text-faint)' }}>
                      (₹{recommendation.pointValueInr}/pt)
                    </span>
                  )}
                </span>
              </div>
            )}

            {recommendation.estimatedReward ? (
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>ESTIMATED VALUE</span>
                <span className="font-bold text-lg" style={{ color: 'var(--gold)' }}>{recommendation.estimatedReward}</span>
              </div>
            ) : (
              recommendation.pointsEarned !== undefined && recommendation.pointsEarned !== null && (
                <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
                  Redemption value not specified in this card's documents.
                </p>
              )
            )}

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {recommendation.explanation}
            </p>

            {recommendation.sourceQuote && (
              <div className="mt-4 pt-4 flex items-start gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                <Quote className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)', opacity: 0.6 }} />
                <div>
                  <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
                    "{recommendation.sourceQuote}"
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>
                    From {recommendation.card.name}'s card documents
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card comparison */}
          {recommendation.comparison.length > 1 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold tracking-[0.18em] mb-3" style={{ color: 'var(--text-faint)' }}>
                ALL YOUR CARDS
              </h3>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {recommendation.comparison.map((c, i) => {
                  const isBest = c.cardId === recommendation.card.id;
                  return (
                    <div
                      key={c.cardId}
                      className="flex items-center justify-between px-4 py-3 gap-4"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                        background: isBest ? 'var(--gold-bg)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.gradient} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: isBest ? 'var(--text-base)' : 'var(--text-muted)' }}>
                            {c.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{c.issuer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        {c.computedReward ? (
                          <div>
                            <p className="text-sm font-semibold" style={{ color: isBest ? 'var(--gold)' : 'var(--text-muted)' }}>
                              {c.computedReward}
                            </p>
                            {c.rateDescription && (
                              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{c.rateDescription}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>No data</span>
                        )}
                        {isBest && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Secondary card */}
          {recommendation.secondaryCard && recommendation.secondaryNote && (
            <div className="rounded-2xl px-5 py-4 mb-8"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <Info className="w-3.5 h-3.5" /> ALSO CONSIDER
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${recommendation.secondaryCard.gradient} shrink-0`} />
                <span className="font-medium text-sm" style={{ color: 'var(--text-base)' }}>{recommendation.secondaryCard.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{recommendation.secondaryCard.issuer}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{recommendation.secondaryNote}</p>
            </div>
          )}

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <RotateCcw className="w-4 h-4" /> Make another payment
          </button>
        </>
      )}
    </div>
  );
}
