import { Wifi } from 'lucide-react';
import type { CreditCard } from '../types';

interface Props {
  card: CreditCard;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function CardVisual({ card, selected, compact, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full ${compact ? 'aspect-[1.8/1]' : 'aspect-[1.586/1]'} rounded-2xl p-5 text-left bg-gradient-to-br ${card.gradient}
        shadow-lg shadow-black/30 transition-all duration-200 overflow-hidden
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : 'cursor-default'}
        ${selected ? 'ring-4 ring-white/80 scale-[1.02]' : 'ring-1 ring-white/10'}`}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex flex-col h-full justify-between text-white">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium tracking-wide opacity-80">{card.issuer}</span>
          <Wifi className="w-5 h-5 opacity-80 rotate-90" />
        </div>

        <div>
          <p className="text-lg font-semibold leading-tight">{card.name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] opacity-75">{card.annualFee} annual fee</span>
            <span className="text-xs font-bold tracking-widest opacity-90">{card.network.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-black">
          ✓
        </div>
      )}
    </button>
  );
}
