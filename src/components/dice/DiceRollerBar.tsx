'use client';

import React, { useState } from 'react';
import { useDice } from './DiceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dices,
  Sparkles,
  AlertTriangle,
  History,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiceLogHistory } from './DiceLogHistory';

export const DiceRollerBar: React.FC = () => {
  const {
    roll,
    lastRoll,
    recentRolls,
    isOpen,
    setIsOpen,
    clearHistory,
    setActiveModalRoll,
    setIsModalOpen
  } = useDice();

  const [formula, setFormula] = useState('1d20+5');
  const [threatRange, setThreatRange] = useState(20);
  const [critMultiplier, setCritMultiplier] = useState(2);
  const [pmInvested, setPmInvested] = useState(0);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [systemMode, setSystemMode] = useState<'T20' | 'TRPG'>('T20');

  const handleRoll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formula.trim()) return;

    let finalFormula = formula.trim();

    // If PM invested is positive and formula doesn't already specify it
    if (pmInvested > 0 && !finalFormula.includes('#')) {
      finalFormula = `${finalFormula} # Gasto de ${pmInvested} PM`;
    }

    roll({
      formula: finalFormula,
      threatRange,
      critMultiplier,
      system: systemMode,
      pmInvested: pmInvested > 0 ? pmInvested : undefined
    });
  };

  const handleQuickDie = (die: number) => {
    roll({
      formula: `1d${die}`,
      system: systemMode
    });
  };

  const openLastRollModal = () => {
    if (lastRoll) {
      setActiveModalRoll(lastRoll);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-gradient-to-r from-red-800 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-500 text-amber-100 px-4 py-2.5 rounded-full shadow-2xl border border-amber-400/50 transition-all transform hover:scale-105 active:scale-95"
          aria-label="Abrir Rolador de Dados"
        >
          <Dices className="w-5 h-5 text-amber-200 animate-spin-slow" />
          <span className="font-serif text-xs font-bold tracking-wider">ROLADOR d20</span>
          {recentRolls.length > 0 && (
            <Badge variant="gold" className="text-[10px] px-1.5 py-0 font-mono">
              {recentRolls.length}
            </Badge>
          )}
        </button>
      )}

      {/* Expanded Dice Drawer / Bar */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[500px] z-50 rounded-t-2xl sm:rounded-2xl border-2 border-amber-500/40 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/30 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900">
            <div className="flex items-center gap-2">
              <Dices className="w-5 h-5 text-amber-400" />
              <span className="font-serif font-bold text-sm text-amber-200 tracking-wide">
                Rolador de Dados Artoniano
              </span>
              <button
                type="button"
                onClick={() => setSystemMode((prev) => (prev === 'T20' ? 'TRPG' : 'T20'))}
                className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors"
                title="Alternar Sistema"
              >
                {systemMode}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHistoryDropdown((prev) => !prev)}
                title="Histórico de rolagens"
                className={cn(
                  'p-1.5 rounded transition-colors',
                  showHistoryDropdown
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800'
                )}
              >
                <History className="w-4 h-4" />
              </button>

              {recentRolls.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  title="Limpar histórico"
                  className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar rolador"
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Dice Row */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border-b border-slate-800 gap-1.5 overflow-x-auto">
            {[4, 6, 8, 10, 12, 20, 100].map((die) => (
              <button
                key={die}
                type="button"
                onClick={() => handleQuickDie(die)}
                className="flex-1 min-w-[42px] py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-800/90 hover:bg-amber-600 hover:text-amber-100 text-slate-200 border border-slate-700/80 shadow-sm transition-all transform active:scale-95 text-center"
              >
                d{die}
              </button>
            ))}
          </div>

          {/* Custom Formula & Settings Form */}
          <form onSubmit={handleRoll} className="p-3 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Ex: 1d20+7, 2d6+4, 1d20+10 # Ataque"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <Button
                variant="gold"
                size="sm"
                type="submit"
                className="font-serif px-4 py-2 font-bold shadow-md"
              >
                Rolar
              </Button>
            </div>

            {/* Tactical Modifiers Bar */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-md px-2 py-1">
                <span>Ameaça:</span>
                <input
                  type="number"
                  min="15"
                  max="20"
                  value={threatRange}
                  onChange={(e) => setThreatRange(Number(e.target.value))}
                  className="w-10 bg-slate-950 border border-slate-700 rounded px-1 text-center text-amber-300 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-md px-2 py-1">
                <span>Crítico:</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-amber-400 font-mono font-bold">x</span>
                  <input
                    type="number"
                    min="2"
                    max="4"
                    value={critMultiplier}
                    onChange={(e) => setCritMultiplier(Number(e.target.value))}
                    className="w-8 bg-slate-950 border border-slate-700 rounded px-1 text-center text-amber-300 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-md px-2 py-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-sky-400" />
                  PM:
                </span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={pmInvested}
                  onChange={(e) => setPmInvested(Number(e.target.value))}
                  className="w-10 bg-slate-950 border border-slate-700 rounded px-1 text-center text-sky-300 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          </form>

          {/* Conditional View: History Dropdown or Last Roll Banner */}
          {showHistoryDropdown ? (
            <div className="flex-1 overflow-hidden p-2 max-h-64">
              <DiceLogHistory className="h-64 border-none shadow-none bg-transparent" />
            </div>
          ) : (
            <>
              {/* Last Roll Display Banner */}
              {lastRoll && (
                <div
                  onClick={openLastRollModal}
                  className={cn(
                    'p-3.5 border-b cursor-pointer transition-all hover:bg-slate-900/70',
                    lastRoll.isCriticalHit
                      ? 'bg-amber-950/40 border-amber-500/50'
                      : lastRoll.isFumble
                      ? 'bg-red-950/40 border-red-500/50'
                      : 'bg-slate-900/50 border-slate-800'
                  )}
                  title="Clique para ver animação de rolagem completa"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {lastRoll.isCriticalHit && (
                          <Badge variant="gold" className="text-[10px] animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1" />
                            ACERTO CRÍTICO!
                          </Badge>
                        )}
                        {lastRoll.isFumble && (
                          <Badge variant="arton" className="text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            FALHA CRÍTICA!
                          </Badge>
                        )}
                        {lastRoll.label && (
                          <span className="text-xs font-semibold text-amber-300">
                            {lastRoll.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-3xl font-black font-serif text-amber-100">
                          {lastRoll.total}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {lastRoll.breakdown}
                        </span>
                      </div>
                    </div>

                    {lastRoll.damageResult && (
                      <div className="text-right bg-slate-950/80 p-2 rounded-lg border border-red-500/30">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">
                          Dano Crítico
                        </span>
                        <span className="text-lg font-bold text-red-400 font-mono">
                          {lastRoll.damageResult.finalDamage}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 italic">
                    Clique no resultado para abrir o modal de revelação
                  </div>
                </div>
              )}

              {/* Quick Compact Recent Rolls Footer */}
              <div className="p-3 bg-slate-950/60 max-h-36 overflow-y-auto space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  <span>Últimas Rolagens</span>
                  <button
                    type="button"
                    onClick={() => setShowHistoryDropdown(true)}
                    className="text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    Ver todas ({recentRolls.length})
                  </button>
                </div>

                {recentRolls.slice(0, 3).map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveModalRoll(r);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-900/40 border border-slate-800/80 text-xs cursor-pointer hover:border-amber-500/40"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-bold text-amber-200 min-w-[20px] font-serif">
                        {r.total}
                      </span>
                      <span className="text-slate-400 truncate text-[11px] font-mono">
                        {r.label ? `[${r.label}] ` : ''}
                        {r.breakdown}
                      </span>
                    </div>
                    {r.isCriticalHit && (
                      <Badge variant="gold" className="text-[8px] py-0 px-1">
                        CRÍTICO
                      </Badge>
                    )}
                    {r.isFumble && (
                      <Badge variant="arton" className="text-[8px] py-0 px-1">
                        FALHA
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
