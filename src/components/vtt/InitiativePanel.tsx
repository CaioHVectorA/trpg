'use client';

import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InitiativeCombatant } from '@/lib/types';
import { toggleCondition } from '@/lib/vtt/tokens';
import {
  Flame,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Dices,
  Skull,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InitiativePanelProps {
  combatants: InitiativeCombatant[];
  currentTurnIndex: number;
  round: number;
  onNextTurn: () => void;
  onPrevTurn: () => void;
  onSelectCombatant: (id: string) => void;
  onRollAll: () => void;
  onUpdateCombatantHp: (id: string, delta: number) => void;
  onToggleCondition: (id: string, condition: string) => void;
  onResetCombat: () => void;
}

const COMMON_CONDITIONS = ['Caído', 'Vulnerável', 'Sangrando', 'Inconsciente'];

export const InitiativePanel: React.FC<InitiativePanelProps> = ({
  combatants,
  currentTurnIndex,
  round,
  onNextTurn,
  onPrevTurn,
  onSelectCombatant,
  onRollAll,
  onUpdateCombatantHp,
  onToggleCondition,
  onResetCombat,
}) => {
  return (
    <Card variant="tabletop" className="p-4 space-y-4">
      {/* Header with Round counter & Turn Navigation */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-serif font-black tracking-wide text-amber-200">
              Iniciativa
            </CardTitle>
            <p className="text-[11px] font-mono text-slate-400">
              Rodada <span className="text-amber-400 font-bold">{round}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevTurn}
            className="px-2 py-1 h-7 text-xs"
            title="Turno anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={onNextTurn}
            className="px-2.5 py-1 h-7 text-xs flex items-center gap-1 shadow-md"
            title="Avançar turno"
          >
            <span>Avançar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Combatant List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {combatants.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            Nenhum combatente na iniciativa.
          </div>
        ) : (
          combatants.map((c, idx) => {
            const isCurrent = idx === currentTurnIndex;
            const isDown = c.pvCurrent <= 0;

            return (
              <div
                key={c.id}
                onClick={() => onSelectCombatant(c.id)}
                className={cn(
                  'p-2.5 rounded-lg border text-xs transition-all cursor-pointer relative overflow-hidden',
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300',
                  isDown && 'opacity-60 border-red-900/50 bg-red-950/20'
                )}
              >
                {/* Active turn indicator stripe */}
                {isCurrent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0',
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-200 truncate" title={c.name}>
                      {c.name}
                    </span>
                    {isDown && <Skull className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      PV: <span className={cn(isDown ? 'text-red-400 font-bold' : 'text-emerald-400')}>{c.pvCurrent}</span>/{c.pvMax}
                    </span>
                    <Badge variant="gold" className="text-[10px] font-mono px-1.5 py-0.5">
                      {c.initiativeScore}
                    </Badge>
                  </div>
                </div>

                {/* Sub-panel: Quick HP adjustments & conditions */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  {/* Quick HP adjusters */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCombatantHp(c.id, -5);
                      }}
                      className="px-1.5 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-mono"
                      title="-5 PV"
                    >
                      -5
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCombatantHp(c.id, -1);
                      }}
                      className="px-1.5 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-mono"
                      title="-1 PV"
                    >
                      -1
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCombatantHp(c.id, 1);
                      }}
                      className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-mono"
                      title="+1 PV"
                    >
                      +1
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCombatantHp(c.id, 5);
                      }}
                      className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-mono"
                      title="+5 PV"
                    >
                      +5
                    </button>
                  </div>

                  {/* Conditions quick toggles */}
                  <div className="flex items-center gap-1">
                    {COMMON_CONDITIONS.map((cond) => {
                      const hasCond = c.conditions?.includes(cond);
                      return (
                        <button
                          key={`${c.id}-${cond}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCondition(c.id, cond);
                          }}
                          className={cn(
                            'px-1 py-0.5 rounded text-[9px] font-medium transition-colors border',
                            hasCond
                              ? 'bg-red-500/30 border-red-500 text-red-200'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          )}
                          title={`Alternar ${cond}`}
                        >
                          {cond[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer controls: Roll all & reset */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRollAll}
          className="flex-1 text-xs flex items-center justify-center gap-1.5"
        >
          <Dices className="w-3.5 h-3.5 text-amber-400" />
          Rolar Todos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetCombat}
          className="text-xs px-2 text-slate-400 hover:text-slate-200"
          title="Reiniciar Rodada e Turno"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
};
