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
  Zap,
  Target,
  Command,
  CheckCircle2,
  XCircle,
  Plus,
  Minus
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

  // Active Tab: 'SIMPLE' | 'CUSTOM'
  const [activeTab, setActiveTab] = useState<'SIMPLE' | 'CUSTOM'>('SIMPLE');

  // Simple Mode State
  const [simpleFormula, setSimpleFormula] = useState('1d20+5');
  const [systemMode, setSystemMode] = useState<'T20' | 'TRPG'>('T20');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Custom Mode State
  const [customDiceCount, setCustomDiceCount] = useState<number>(1);
  const [customDieType, setCustomDieType] = useState<number>(20);
  const [customModifier, setCustomModifier] = useState<number>(5);
  const [customTargetDC, setCustomTargetDC] = useState<string>(''); // Target DC (CD)
  const [customRollMode, setCustomRollMode] = useState<'NORMAL' | 'ADVANTAGE' | 'DISADVANTAGE'>('NORMAL');
  const [threatRange, setThreatRange] = useState<number>(20);
  const [critMultiplier, setCritMultiplier] = useState<number>(2);
  const [pmInvested, setPmInvested] = useState<number>(0);
  const [customLabel, setCustomLabel] = useState<string>('Teste');

  // Handle Simple Roll
  const handleSimpleRoll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simpleFormula.trim()) return;

    let finalFormula = simpleFormula.trim();
    if (finalFormula.startsWith('/r ')) {
      finalFormula = finalFormula.substring(3).trim();
    } else if (finalFormula.startsWith('/roll ')) {
      finalFormula = finalFormula.substring(6).trim();
    }

    roll({
      formula: finalFormula,
      threatRange: 20,
      critMultiplier: 2,
      system: systemMode
    });
  };

  // Quick 1-click single die roll
  const handleQuickDie = (die: number) => {
    roll({
      formula: `1d${die}`,
      system: systemMode
    });
  };

  // Quick modifier adder to simple formula
  const handleAddModifier = (mod: number) => {
    setSimpleFormula((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `1d20${mod >= 0 ? `+${mod}` : mod}`;
      // If it ends with # label, insert before label
      if (trimmed.includes('#')) {
        const [expr, label] = trimmed.split('#');
        return `${expr.trim()}${mod >= 0 ? `+${mod}` : mod} #${label}`;
      }
      return `${trimmed}${mod >= 0 ? `+${mod}` : mod}`;
    });
  };

  // Handle Custom Roll
  const handleCustomRoll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let formulaString = '';

    if (customDieType === 20 && customRollMode === 'ADVANTAGE') {
      formulaString = `2d20kh1`;
    } else if (customDieType === 20 && customRollMode === 'DISADVANTAGE') {
      formulaString = `2d20kl1`;
    } else {
      formulaString = `${customDiceCount}d${customDieType}`;
    }

    if (customModifier > 0) {
      formulaString += `+${customModifier}`;
    } else if (customModifier < 0) {
      formulaString += `${customModifier}`;
    }

    if (pmInvested > 0) {
      formulaString += ` # [${pmInvested} PM]`;
    }

    if (customLabel.trim()) {
      formulaString += formulaString.includes('#')
        ? ` ${customLabel.trim()}`
        : ` # ${customLabel.trim()}`;
    }

    const parsedDC = customTargetDC.trim() ? Number(customTargetDC) : undefined;

    roll({
      formula: formulaString,
      threatRange,
      critMultiplier,
      system: systemMode,
      pmInvested: pmInvested > 0 ? pmInvested : undefined,
      targetDC: !isNaN(Number(parsedDC)) ? parsedDC : undefined
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
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-full shadow-2xl border border-zinc-700 transition-all transform hover:scale-105 active:scale-95"
          aria-label="Abrir Rolador de Dados"
        >
          <Dices className="w-5 h-5 text-zinc-300" />
          <span className="text-xs font-semibold tracking-wide">Rolador de Dados</span>
          {recentRolls.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 font-mono text-zinc-300">
              {recentRolls.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded Dice Drawer / Bar */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[480px] z-50 rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 animate-in slide-in-from-bottom-3 text-zinc-100">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/90">
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-zinc-300" />
              <span className="font-semibold text-xs tracking-wider uppercase text-zinc-200">
                Rolador Artoniano
              </span>
              <button
                type="button"
                onClick={() => setSystemMode((prev) => (prev === 'T20' ? 'TRPG' : 'T20'))}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
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
                  'p-1.5 rounded transition-colors text-xs flex items-center gap-1',
                  showHistoryDropdown
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                )}
              >
                <History className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Histórico</span>
              </button>

              {recentRolls.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  title="Limpar histórico"
                  className="text-zinc-400 hover:text-red-400 p-1.5 rounded hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar rolador"
                className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('SIMPLE');
                setShowHistoryDropdown(false);
              }}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
                activeTab === 'SIMPLE' && !showHistoryDropdown
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              )}
            >
              <Command className="w-3.5 h-3.5" />
              <span>Dado Simples &amp; Comando</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('CUSTOM');
                setShowHistoryDropdown(false);
              }}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
                activeTab === 'CUSTOM' && !showHistoryDropdown
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              )}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Customizado &amp; CD</span>
            </button>
          </div>

          {/* Conditional View: History or Tabs */}
          {showHistoryDropdown ? (
            <div className="flex-1 overflow-hidden p-3 max-h-80">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs text-zinc-400">
                <span>Histórico Completo de Rolagens ({recentRolls.length})</span>
                <button
                  type="button"
                  onClick={() => setShowHistoryDropdown(false)}
                  className="text-zinc-300 hover:underline"
                >
                  Voltar ao rolador
                </button>
              </div>
              <DiceLogHistory className="h-64 border-none shadow-none bg-transparent" />
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {/* TAB 1: SIMPLE / COMMAND */}
              {activeTab === 'SIMPLE' && (
                <div className="space-y-3">
                  {/* Quick 1-click Dice Row */}
                  <div>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">
                      Rolagem Rápida (1 Clique)
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {[4, 6, 8, 10, 12, 20, 100].map((die) => (
                        <button
                          key={die}
                          type="button"
                          onClick={() => handleQuickDie(die)}
                          className="py-1.5 text-xs font-mono font-bold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors active:scale-95"
                        >
                          d{die}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Command Input Form */}
                  <form onSubmit={handleSimpleRoll} className="space-y-2">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                      Comando Livre / Expressão
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={simpleFormula}
                        onChange={(e) => setSimpleFormula(e.target.value)}
                        placeholder="Ex: 1d20+7, 2d6+4, 1d20+8 # Ataque"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-lg border border-zinc-300"
                      >
                        Rolar
                      </Button>
                    </div>

                    {/* Quick Modifier Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-zinc-500 mr-1">Ajustar:</span>
                      {[1, 2, 5].map((val) => (
                        <button
                          key={`plus-${val}`}
                          type="button"
                          onClick={() => handleAddModifier(val)}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                        >
                          +{val}
                        </button>
                      ))}
                      {[-1, -2, -5].map((val) => (
                        <button
                          key={`minus-${val}`}
                          type="button"
                          onClick={() => handleAddModifier(val)}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                        >
                          {val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSimpleFormula('1d20')}
                        className="px-2 py-0.5 text-[10px] rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors ml-auto"
                      >
                        Resetar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: CUSTOM CONSTRUCTOR WITH DC (CD) */}
              {activeTab === 'CUSTOM' && (
                <form onSubmit={handleCustomRoll} className="space-y-3">
                  {/* Dice Count & Die Type Selector */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Quantity Stepper */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Qtd de Dados
                      </label>
                      <div className="flex items-center border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setCustomDiceCount((c) => Math.max(1, c - 1))}
                          className="px-2.5 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="flex-1 text-center font-mono font-bold text-xs text-zinc-100">
                          {customDiceCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomDiceCount((c) => Math.min(20, c + 1))}
                          className="px-2.5 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Die Type Select */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Tipo de Dado
                      </label>
                      <select
                        value={customDieType}
                        onChange={(e) => setCustomDieType(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:border-zinc-600"
                      >
                        {[4, 6, 8, 10, 12, 20, 100].map((d) => (
                          <option key={d} value={d}>
                            d{d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Modifier & Target DC Row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Fixed Modifier */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Modificador (+ / -)
                      </label>
                      <div className="flex items-center border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setCustomModifier((m) => m - 1)}
                          className="px-2 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={customModifier}
                          onChange={(e) => setCustomModifier(Number(e.target.value))}
                          className="w-full bg-transparent text-center font-mono font-bold text-xs text-zinc-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomModifier((m) => m + 1)}
                          className="px-2 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Target DC (CD) */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                        <span>Classe Dificuldade (CD)</span>
                        <span className="text-[9px] text-zinc-500 font-normal">Opcional</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customTargetDC}
                        onChange={(e) => setCustomTargetDC(e.target.value)}
                        placeholder="Ex: 15, 20"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                      />
                    </div>
                  </div>

                  {/* Advantage / Disadvantage (If d20) */}
                  {customDieType === 20 && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Modo de Vantagem (d20)
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setCustomRollMode('NORMAL')}
                          className={cn(
                            'py-1 text-xs rounded border transition-colors',
                            customRollMode === 'NORMAL'
                              ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          )}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomRollMode('ADVANTAGE')}
                          className={cn(
                            'py-1 text-xs rounded border transition-colors',
                            customRollMode === 'ADVANTAGE'
                              ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          )}
                        >
                          Vantagem (2d20kh1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomRollMode('DISADVANTAGE')}
                          className={cn(
                            'py-1 text-xs rounded border transition-colors',
                            customRollMode === 'DISADVANTAGE'
                              ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          )}
                        >
                          Desvantagem (2d20kl1)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Threat, Crit Multiplier & Label */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Margem Ameaça
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="20"
                        value={threatRange}
                        onChange={(e) => setThreatRange(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Multiplicador
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="4"
                        value={critMultiplier}
                        onChange={(e) => setCritMultiplier(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                        Gasto PM
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={pmInvested}
                        onChange={(e) => setPmInvested(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Label / Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                      Descrição do Teste
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="Ex: Ataque com Espada Longa, Teste de Fortitude"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs rounded-lg border border-zinc-300 flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Rolar Teste Customizado</span>
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* LAST ROLL BANNER (MONOCHROMATIC & CLEAR) */}
          {lastRoll && !showHistoryDropdown && (
            <div
              onClick={openLastRollModal}
              className="p-3 border-t border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900 cursor-pointer transition-colors"
              title="Clique para ver animação de rolagem completa"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* DC Outcome Badge */}
                    {lastRoll.dcOutcome && (
                      <span
                        className={cn(
                          'text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1',
                          lastRoll.dcOutcome === 'CRITICAL_SUCCESS' || lastRoll.dcOutcome === 'SUCCESS'
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                            : 'bg-red-950/80 border-red-500/60 text-red-300'
                        )}
                      >
                        {lastRoll.dcOutcome === 'CRITICAL_SUCCESS' && (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
                            <span>Sucesso Crítico</span>
                          </>
                        )}
                        {lastRoll.dcOutcome === 'SUCCESS' && (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Sucesso (CD {lastRoll.targetDC})</span>
                          </>
                        )}
                        {lastRoll.dcOutcome === 'FAILURE' && (
                          <>
                            <XCircle className="w-2.5 h-2.5 text-red-400" />
                            <span>Falha (CD {lastRoll.targetDC})</span>
                          </>
                        )}
                        {lastRoll.dcOutcome === 'CRITICAL_FAILURE' && (
                          <>
                            <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                            <span>Falha Crítica</span>
                          </>
                        )}
                      </span>
                    )}

                    {/* Natural Crit / Fumble Badges */}
                    {lastRoll.isCriticalHit && !lastRoll.dcOutcome && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-zinc-100 uppercase">
                        Acerto Crítico!
                      </span>
                    )}
                    {lastRoll.isFumble && !lastRoll.dcOutcome && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 border border-red-600 text-red-300 uppercase">
                        Falha Crítica!
                      </span>
                    )}

                    {lastRoll.label && (
                      <span className="text-xs font-semibold text-zinc-300">
                        {lastRoll.label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-2xl font-black font-mono text-zinc-100">
                      {lastRoll.total}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 truncate max-w-[260px]">
                      {lastRoll.breakdown}
                    </span>
                  </div>
                </div>

                {lastRoll.damageResult && (
                  <div className="text-right bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-[9px] text-zinc-400 block uppercase font-bold">
                      Dano
                    </span>
                    <span className="text-base font-bold text-zinc-100 font-mono">
                      {lastRoll.damageResult.finalDamage}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Compact Recent Rolls Footer */}
          {!showHistoryDropdown && (
            <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="truncate">
                {recentRolls.length > 0
                  ? `Última: ${recentRolls[0].total} (${recentRolls[0].breakdown})`
                  : 'Nenhuma rolagem recente'}
              </span>
              <button
                type="button"
                onClick={() => setShowHistoryDropdown(true)}
                className="text-zinc-300 hover:text-zinc-100 hover:underline flex-shrink-0 ml-2"
              >
                Ver histórico ({recentRolls.length})
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
