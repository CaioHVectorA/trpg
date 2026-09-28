'use client';

import React, { useState } from 'react';
import { useDice } from './DiceContext';
import { DiceRollResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { History, Search, RefreshCw, Trash2, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DiceLogHistoryProps {
  className?: string;
  onSelectRoll?: (roll: DiceRollResult) => void;
}

export const DiceLogHistory: React.FC<DiceLogHistoryProps> = ({
  className,
  onSelectRoll
}) => {
  const { recentRolls, clearHistory, roll, setActiveModalRoll, setIsModalOpen } = useDice();
  const [filterText, setFilterText] = useState('');

  const filteredRolls = recentRolls.filter((r) => {
    if (!filterText.trim()) return true;
    const term = filterText.toLowerCase();
    const hasLabel = r.label?.toLowerCase().includes(term);
    const hasBreakdown = r.breakdown.toLowerCase().includes(term);
    const hasOutput = r.formattedOutput.toLowerCase().includes(term);
    return hasLabel || hasBreakdown || hasOutput;
  });

  const handleReroll = (item: DiceRollResult, e: React.MouseEvent) => {
    e.stopPropagation();
    // Re-roll the same formula
    roll({
      formula: item.formattedOutput.replace(/^.*?\(.*?\)/, '').trim() || item.breakdown,
      threatRange: 20,
      system: 'T20'
    });
  };

  const handleCardClick = (item: DiceRollResult) => {
    if (onSelectRoll) {
      onSelectRoll(item);
    } else {
      setActiveModalRoll(item);
      setIsModalOpen(true);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-slate-950/90 border border-amber-500/20 rounded-xl overflow-hidden shadow-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <span className="font-serif font-bold text-sm text-amber-200">
            Histórico de Rolagens
          </span>
          <Badge variant="gold" className="text-[10px] px-1.5 py-0">
            {recentRolls.length}
          </Badge>
        </div>

        {recentRolls.length > 0 && (
          <button
            onClick={clearHistory}
            title="Limpar histórico"
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-900/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar por etiqueta ou fórmula..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Rolls List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {recentRolls.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="text-xs italic">Nenhuma rolagem registrada ainda.</p>
          </div>
        ) : filteredRolls.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            Nenhuma rolagem coincide com o filtro &ldquo;{filterText}&rdquo;.
          </p>
        ) : (
          filteredRolls.map((item, index) => {
            const timeStr = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              : '';

            return (
              <div
                key={index}
                onClick={() => handleCardClick(item)}
                className={cn(
                  'group p-3 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.01] hover:border-amber-400/50',
                  item.isCriticalHit
                    ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                    : item.isFumble
                    ? 'bg-red-950/30 border-red-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {item.label ? (
                        <span className="font-serif font-bold text-amber-300 truncate">
                          {item.label}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">
                          Rolagem #{recentRolls.length - index}
                        </span>
                      )}

                      {item.isCriticalHit && (
                        <Badge variant="gold" className="text-[9px] py-0 px-1">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5 inline" />
                          CRÍTICO
                        </Badge>
                      )}

                      {item.isFumble && (
                        <Badge variant="arton" className="text-[9px] py-0 px-1">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5 inline" />
                          FALHA
                        </Badge>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {item.breakdown}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={cn(
                        'text-lg font-black font-serif',
                        item.isCriticalHit
                          ? 'text-amber-300'
                          : item.isFumble
                          ? 'text-red-400'
                          : 'text-amber-100'
                      )}
                    >
                      {item.total}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{timeStr}</span>
                  </div>
                </div>

                {item.damageResult && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Dano Crítico:</span>
                    <span className="font-bold text-red-400 font-mono">
                      {item.damageResult.finalDamage}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
