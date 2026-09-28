'use client';

import React, { useEffect } from 'react';
import { DiceRollResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, X, ShieldAlert, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DiceRollModalProps {
  roll: DiceRollResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({
  roll,
  isOpen,
  onClose
}) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !roll) return null;

  const isNat20 = roll.isNatural20;
  const isNat1 = roll.isNatural1;
  const isCrit = roll.isCriticalHit;
  const isFumble = roll.isFumble;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl transition-all transform scale-100 flex flex-col items-center text-center',
          isNat20 || isCrit
            ? 'bg-gradient-to-b from-amber-950/90 via-slate-950 to-slate-950 border-amber-500 shadow-amber-500/20'
            : isNat1 || isFumble
            ? 'bg-gradient-to-b from-red-950/90 via-slate-950 to-slate-950 border-red-600 shadow-red-600/20'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-amber-500/30 shadow-black'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-200 transition-colors p-1 rounded-full hover:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Banners */}
        {isNat20 && (
          <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-serif text-xs font-bold tracking-wider animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            20 NATURAL — ACERTO AUTOMÁTICO!
          </div>
        )}

        {!isNat20 && isCrit && (
          <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-serif text-xs font-bold tracking-wider animate-pulse">
            <Award className="w-4 h-4 text-amber-300" />
            ACERTO CRÍTICO!
          </div>
        )}

        {(isNat1 || isFumble) && (
          <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/50 text-red-300 font-serif text-xs font-bold tracking-wider animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            1 NATURAL — FALHA CRÍTICA!
          </div>
        )}

        {/* Optional Action Label / Tag */}
        {roll.label && (
          <h3
            id="dice-modal-title"
            className="text-base font-serif font-bold text-amber-200 mb-1 tracking-wide"
          >
            {roll.label}
          </h3>
        )}

        {/* Big Total Value Display */}
        <div className="my-4 flex flex-col items-center">
          <div
            className={cn(
              'w-28 h-28 rounded-2xl flex items-center justify-center font-serif text-5xl font-black shadow-inner border-2 transition-transform transform hover:scale-105',
              isNat20
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-emerald-500/30'
                : isCrit
                ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-amber-500/30'
                : isNat1 || isFumble
                ? 'bg-red-950/80 border-red-500 text-red-200 shadow-red-500/30'
                : 'bg-slate-900 border-amber-500/40 text-amber-100 shadow-black'
            )}
          >
            {roll.total}
          </div>

          {/* Hit / Miss Status Badge */}
          {roll.isHit !== undefined && (
            <div className="mt-2">
              {roll.isHit ? (
                <Badge variant="gold" className="text-xs">
                  ACERTOU O ALVO
                </Badge>
              ) : (
                <Badge variant="arton" className="text-xs">
                  ERROU O ALVO
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Dice Breakdown */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 my-2 space-y-2 text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Discriminação da Rolagem
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {roll.rolls.map((r, i) => (
              <span
                key={i}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-mono font-bold border',
                  r.die === 20 && r.result === 20
                    ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200'
                    : r.die === 20 && r.result === 1
                    ? 'bg-red-900/60 border-red-500 text-red-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                )}
              >
                d{r.die}: {r.result}
              </span>
            ))}
            {roll.modifiers !== 0 && (
              <span className="text-xs font-mono text-amber-300 font-bold">
                {roll.modifiers > 0 ? `+ ${roll.modifiers}` : `- ${Math.abs(roll.modifiers)}`}
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/80">
            Fórmula: <span className="text-slate-200">{roll.breakdown}</span>
          </div>
        </div>

        {/* Critical Damage Section (if applicable) */}
        {roll.damageResult && (
          <div className="w-full bg-red-950/40 border border-red-500/40 rounded-xl p-3 my-2 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-300 tracking-wider block">
                  Dano Crítico Total
                </span>
                <span className="text-[11px] text-slate-400">
                  {roll.damageResult.formulaUsed}
                </span>
              </div>
              <span className="text-2xl font-serif font-black text-red-400">
                {roll.damageResult.finalDamage}
              </span>
            </div>
          </div>
        )}

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="mt-3 w-full py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-serif font-bold text-sm rounded-xl border border-amber-400/50 shadow-lg transition-transform transform active:scale-95"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};
