'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Zap,
  ShieldAlert,
  Moon,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
  Flame,
  Shield,
  X,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  applyDamage,
  applyHealing,
  canSpendPM,
  calculateRestRecovery,
  CONDITIONS_CATALOG,
  normalizeConditionId,
  calculateConditionsDefenseModifier,
  calculateConditionsAttackModifier,
  isActionPrevented,
  RestQuality
} from '@/lib/rules';
import { SystemMode } from '@/lib/types';

export interface CombatTrackersProps {
  system: SystemMode;
  characterLevel: number;
  conScoreOrMod?: number;
  pvCurrent: number;
  pvMax: number;
  pvTemp: number;
  pmCurrent: number;
  pmMax: number;
  activeConditions: string[];
  onUpdatePv: (newPv: number, newTempPv: number) => void;
  onUpdatePm: (newPm: number) => void;
  onToggleCondition: (conditionId: string) => void;
  onApplyRest?: (quality: RestQuality) => void;
}

export const CombatTrackers: React.FC<CombatTrackersProps> = ({
  system,
  characterLevel,
  conScoreOrMod = 10,
  pvCurrent,
  pvMax,
  pvTemp,
  pmCurrent,
  pmMax,
  activeConditions,
  onUpdatePv,
  onUpdatePm,
  onToggleCondition,
  onApplyRest,
}) => {
  // Local input states for custom damage, heal, temp PV, and PM spend
  const [damageInput, setDamageInput] = useState<string>('');
  const [healInput, setHealInput] = useState<string>('');
  const [tempPvInput, setTempPvInput] = useState<string>('');
  const [pmSpendInput, setPmSpendInput] = useState<string>('');
  const [pmError, setPmError] = useState<string | null>(null);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [conditionSearch, setConditionSearch] = useState('');

  // Handle damage application
  const handleApplyDamage = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    const result = applyDamage(pvCurrent, pvTemp, amount, pvMax, conScoreOrMod, system);
    onUpdatePv(result.newPv, result.newTempPv);
    setDamageInput('');

    // If reduced to 0 or below, trigger unconscious and bleeding if not already present
    if (result.isUnconscious) {
      if (!activeConditions.some((c) => normalizeConditionId(c) === 'inconsciente')) {
        onToggleCondition('inconsciente');
      }
      if (!activeConditions.some((c) => normalizeConditionId(c) === 'sangrando')) {
        onToggleCondition('sangrando');
      }
    }
  };

  // Handle healing application
  const handleApplyHealing = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    const result = applyHealing(pvCurrent, pvMax, amount);
    onUpdatePv(result.newPv, pvTemp);
    setHealInput('');

    // If healed above 0 and previously unconscious, wake up
    if (pvCurrent <= 0 && result.newPv > 0) {
      if (activeConditions.some((c) => normalizeConditionId(c) === 'inconsciente')) {
        onToggleCondition('inconsciente');
      }
      if (activeConditions.some((c) => normalizeConditionId(c) === 'sangrando')) {
        onToggleCondition('sangrando');
      }
    }
  };

  // Handle adding temporary PV
  const handleAddTempPv = (amount: number) => {
    if (isNaN(amount) || amount < 0) return;
    onUpdatePv(pvCurrent, Math.max(0, amount));
    setTempPvInput('');
  };

  // Handle PM spend with level-cap enforcement
  const handleSpendPM = (cost: number) => {
    setPmError(null);
    if (isNaN(cost) || cost <= 0) return;

    if (system === 'T20' && cost > characterLevel) {
      setPmError(`Limite de gastos excedido (Máximo ${characterLevel} PM por ação para nível ${characterLevel}).`);
      return;
    }

    if (cost > pmCurrent) {
      setPmError(`Pontos de Mana insuficientes (Você tem ${pmCurrent} PM).`);
      return;
    }

    onUpdatePm(Math.max(0, pmCurrent - cost));
    setPmSpendInput('');
  };

  // Handle PM restore
  const handleRestorePM = (amount: number) => {
    setPmError(null);
    if (isNaN(amount) || amount <= 0) return;
    onUpdatePm(Math.min(pmMax, pmCurrent + amount));
  };

  // Handle Rest Recovery
  const handleRest = (quality: RestQuality) => {
    if (onApplyRest) {
      onApplyRest(quality);
      return;
    }
    const recovery = calculateRestRecovery(characterLevel, quality, pvMax, pmMax);
    onUpdatePv(Math.min(pvMax, pvCurrent + recovery.recoveredPv), pvTemp);
    onUpdatePm(Math.min(pmMax, pmCurrent + recovery.recoveredPm));
  };

  // Health bar calculations
  const healthPercent = Math.max(0, Math.min(100, Math.round((pvCurrent / pvMax) * 100)));
  const manaPercent = pmMax > 0 ? Math.max(0, Math.min(100, Math.round((pmCurrent / pmMax) * 100))) : 0;

  // Health status badge
  let healthStatus: { label: string; variant: 'emerald' | 'gold' | 'arton' } = {
    label: 'Saudável',
    variant: 'emerald',
  };
  if (pvCurrent <= -Math.floor(pvMax / 2)) {
    healthStatus = { label: 'Morto', variant: 'arton' };
  } else if (pvCurrent <= 0) {
    healthStatus = { label: 'Inconsciente & Sangrando', variant: 'arton' };
  } else if (healthPercent <= 25) {
    healthStatus = { label: 'Em Perigo', variant: 'arton' };
  } else if (healthPercent <= 50) {
    healthStatus = { label: 'Ferido', variant: 'gold' };
  }

  // Active condition impacts
  const netDefMod = calculateConditionsDefenseModifier(activeConditions);
  const netAtkMod = calculateConditionsAttackModifier(activeConditions);
  const actionCheck = isActionPrevented(activeConditions);

  // Available conditions filtered
  const filteredConditions = Object.values(CONDITIONS_CATALOG).filter(
    (c) =>
      c.namePt.toLowerCase().includes(conditionSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(conditionSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Prevention Alert */}
      {actionCheck.prevented && (
        <div className="bg-red-950/80 border border-red-500/60 rounded-lg p-3 text-red-200 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-semibold">{actionCheck.reason}</span>
        </div>
      )}

      {/* Main Trackers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= PV TRACKER ================= */}
        <Card variant="tabletop" className="p-5 border-amber-500/30">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                <Heart className="w-5 h-5 fill-red-500/20" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-amber-100 text-lg">Pontos de Vida (PV)</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={healthStatus.variant} className="text-[10px] py-0">
                    {healthStatus.label}
                  </Badge>
                  {pvTemp > 0 && (
                    <Badge variant="mana" className="text-[10px] py-0 bg-cyan-900/60 text-cyan-300 border-cyan-500/40">
                      +{pvTemp} Temp
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black font-mono tracking-tight text-amber-100">
                {pvCurrent} <span className="text-sm font-normal text-slate-400">/ {pvMax}</span>
              </div>
              {pvTemp > 0 && (
                <span className="text-xs text-cyan-400 font-mono">+{pvTemp} PV Temporário</span>
              )}
            </div>
          </div>

          {/* Health Bar */}
          <div className="relative w-full h-3 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 mb-4">
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                pvCurrent <= 0
                  ? 'bg-red-800'
                  : healthPercent <= 25
                  ? 'bg-red-600'
                  : healthPercent <= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              style={{ width: `${healthPercent}%` }}
            />
            {pvTemp > 0 && (
              <div
                className="absolute top-0 right-0 h-full bg-cyan-400/70"
                style={{ width: `${Math.min(100, Math.round((pvTemp / pvMax) * 100))}%` }}
              />
            )}
          </div>

          {/* Quick PV Actions */}
          <div className="space-y-3">
            {/* Quick Step Buttons */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="arton"
                  onClick={() => handleApplyDamage(10)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Tomar 10 de dano"
                >
                  -10
                </Button>
                <Button
                  size="sm"
                  variant="arton"
                  onClick={() => handleApplyDamage(5)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Tomar 5 de dano"
                >
                  -5
                </Button>
                <Button
                  size="sm"
                  variant="arton"
                  onClick={() => handleApplyDamage(1)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Tomar 1 de dano"
                >
                  -1
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleApplyHealing(1)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Curar 1 PV"
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleApplyHealing(5)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Curar 5 PV"
                >
                  +5
                </Button>
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleApplyHealing(10)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Curar 10 PV"
                >
                  +10
                </Button>
              </div>
            </div>

            {/* Custom Damage & Heal Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Dano"
                  value={damageInput}
                  onChange={(e) => setDamageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyDamage(Number(damageInput));
                  }}
                  className="w-full bg-slate-950 border border-red-500/40 rounded px-2 py-1 text-xs text-red-200 font-mono focus:outline-none focus:border-red-400"
                />
                <Button
                  size="sm"
                  variant="arton"
                  onClick={() => handleApplyDamage(Number(damageInput))}
                  disabled={!damageInput || Number(damageInput) <= 0}
                  className="px-2.5 text-xs shrink-0"
                >
                  Dano
                </Button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Cura"
                  value={healInput}
                  onChange={(e) => setHealInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyHealing(Number(healInput));
                  }}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded px-2 py-1 text-xs text-emerald-200 font-mono focus:outline-none focus:border-emerald-400"
                />
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleApplyHealing(Number(healInput))}
                  disabled={!healInput || Number(healInput) <= 0}
                  className="px-2.5 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white"
                >
                  Curar
                </Button>
              </div>
            </div>

            {/* Temp PV Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder="PV Temporário"
                value={tempPvInput}
                onChange={(e) => setTempPvInput(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/40 rounded px-2 py-1 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddTempPv(Number(tempPvInput))}
                disabled={!tempPvInput || Number(tempPvInput) < 0}
                className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 shrink-0"
              >
                Definir Temp
              </Button>
              {pvTemp > 0 && (
                <button
                  onClick={() => onUpdatePv(pvCurrent, 0)}
                  className="text-slate-400 hover:text-red-400 p-1"
                  title="Zerar PV Temporário"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* ================= PM TRACKER ================= */}
        <Card variant="tabletop" className="p-5 border-amber-500/30">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Zap className="w-5 h-5 fill-blue-500/20" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-amber-100 text-lg">Pontos de Mana (PM)</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="mana" className="text-[10px] py-0">
                    Limite: {characterLevel} PM/ação
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black font-mono tracking-tight text-blue-200">
                {pmCurrent} <span className="text-sm font-normal text-slate-400">/ {pmMax}</span>
              </div>
              <span className="text-xs text-slate-400">Custo máx: {characterLevel} PM</span>
            </div>
          </div>

          {/* Mana Bar */}
          <div className="relative w-full h-3 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 mb-4">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${manaPercent}%` }}
            />
          </div>

          {/* PM Error Feedback */}
          {pmError && (
            <div className="mb-2 p-2 bg-red-950/70 border border-red-500/40 rounded text-[11px] text-red-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{pmError}</span>
            </div>
          )}

          {/* Quick PM Actions */}
          <div className="space-y-3">
            {/* Quick Step Spend & Restore */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="mana"
                  onClick={() => handleSpendPM(1)}
                  disabled={pmCurrent < 1 || (system === 'T20' && 1 > characterLevel)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Gastar 1 PM"
                >
                  -1
                </Button>
                <Button
                  size="sm"
                  variant="mana"
                  onClick={() => handleSpendPM(2)}
                  disabled={pmCurrent < 2 || (system === 'T20' && 2 > characterLevel)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Gastar 2 PM"
                >
                  -2
                </Button>
                <Button
                  size="sm"
                  variant="mana"
                  onClick={() => handleSpendPM(3)}
                  disabled={pmCurrent < 3 || (system === 'T20' && 3 > characterLevel)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Gastar 3 PM"
                >
                  -3
                </Button>
                <Button
                  size="sm"
                  variant="mana"
                  onClick={() => handleSpendPM(5)}
                  disabled={pmCurrent < 5 || (system === 'T20' && 5 > characterLevel)}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Gastar 5 PM"
                >
                  -5
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestorePM(1)}
                  disabled={pmCurrent >= pmMax}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Recuperar 1 PM"
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestorePM(2)}
                  disabled={pmCurrent >= pmMax}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Recuperar 2 PM"
                >
                  +2
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestorePM(5)}
                  disabled={pmCurrent >= pmMax}
                  className="px-2 py-0.5 text-xs font-mono"
                  title="Recuperar 5 PM"
                >
                  +5
                </Button>
              </div>
            </div>

            {/* Custom PM Spend Input */}
            <div className="flex gap-1.5 pt-2 border-t border-slate-800">
              <input
                type="number"
                placeholder={`Gastar PM (máx ${characterLevel})`}
                value={pmSpendInput}
                onChange={(e) => {
                  setPmError(null);
                  setPmSpendInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSpendPM(Number(pmSpendInput));
                }}
                className="w-full bg-slate-950 border border-blue-500/40 rounded px-2 py-1 text-xs text-blue-200 font-mono focus:outline-none focus:border-blue-400"
              />
              <Button
                size="sm"
                variant="mana"
                onClick={() => handleSpendPM(Number(pmSpendInput))}
                disabled={!pmSpendInput || Number(pmSpendInput) <= 0}
                className="px-3 text-xs shrink-0"
              >
                Gastar
              </Button>
            </div>

            {/* Resting Buttons */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Descanso:
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRest('normal')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Normal: Recupera 1x Nível em PV e PM"
                >
                  Normal ({characterLevel})
                </button>
                <button
                  onClick={() => handleRest('confortavel')}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40 transition-colors"
                  title="Confortável: Recupera 2x Nível em PV e PM"
                >
                  Confortável ({characterLevel * 2})
                </button>
                <button
                  onClick={() => handleRest('luxuoso')}
                  className="px-2 py-0.5 rounded text-[10px] bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/50 transition-colors"
                  title="Luxuoso: Recupera 100% de PV e PM"
                >
                  Luxuoso (100%)
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ================= STATUS CONDITIONS SECTION ================= */}
      <Card variant="tabletop" className="p-5 border-amber-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-100 text-base">Condições Ativas</h3>
              <p className="text-[11px] text-slate-400">
                {activeConditions.length === 0
                  ? 'Nenhuma condição debilitante ativa.'
                  : `${activeConditions.length} condição(ões) alterando testes e defesas.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {netDefMod !== 0 && (
              <Badge variant={netDefMod < 0 ? 'arton' : 'emerald'} className="text-[10px]">
                Defesa {netDefMod > 0 ? `+${netDefMod}` : netDefMod}
              </Badge>
            )}
            {netAtkMod !== 0 && (
              <Badge variant={netAtkMod < 0 ? 'arton' : 'emerald'} className="text-[10px]">
                Ataque {netAtkMod > 0 ? `+${netAtkMod}` : netAtkMod}
              </Badge>
            )}
            <Button
              size="sm"
              variant={isConditionsOpen ? 'gold' : 'outline'}
              onClick={() => setIsConditionsOpen(!isConditionsOpen)}
              className="text-xs py-1 px-3"
            >
              {isConditionsOpen ? 'Fechar Catálogo' : '+ Adicionar / Editar'}
            </Button>
          </div>
        </div>

        {/* Active Conditions Badges */}
        <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
          {activeConditions.length === 0 ? (
            <span className="text-xs text-slate-500 italic">Personagem em plenas condições de combate.</span>
          ) : (
            activeConditions.map((cond) => {
              const def = CONDITIONS_CATALOG[normalizeConditionId(cond)];
              return (
                <div
                  key={cond}
                  className="group flex items-center gap-1.5 bg-red-950/60 border border-red-500/40 rounded-full px-3 py-1 text-xs text-red-200 transition-all hover:border-red-400"
                >
                  <span className="font-semibold">{def?.namePt || cond}</span>
                  {def?.description && (
                    <span className="hidden group-hover:inline text-[10px] text-red-300/80 max-w-[200px] truncate">
                      ({def.description})
                    </span>
                  )}
                  <button
                    onClick={() => onToggleCondition(cond)}
                    className="hover:text-white p-0.5 text-red-400"
                    title={`Remover ${def?.namePt || cond}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Expandable Conditions Catalog Picker */}
        {isConditionsOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <input
              type="text"
              placeholder="Buscar condição (ex: Caído, Desprevenido, Cego...)"
              value={conditionSearch}
              onChange={(e) => setConditionSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
              {filteredConditions.map((cond) => {
                const isActive = activeConditions.some(
                  (c) => normalizeConditionId(c) === normalizeConditionId(cond.id)
                );
                return (
                  <button
                    key={cond.id}
                    onClick={() => onToggleCondition(cond.id)}
                    className={cn(
                      'text-left p-2 rounded border transition-all text-xs flex flex-col justify-between',
                      isActive
                        ? 'bg-red-900/30 border-red-500 text-red-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold">{cond.namePt}</span>
                      {isActive && <Badge variant="arton" className="text-[9px] py-0">Ativo</Badge>}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {cond.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
