'use client';

import React, { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDice } from '@/components/dice/DiceContext';
import {
  VttToken,
  InitiativeCombatant,
  GridPosition,
} from '@/lib/types';
import { calculateDistance, DistanceMetric } from '@/lib/vtt/ruler';
import { sortInitiative, advanceTurn, previousTurn } from '@/lib/vtt/initiative';
import { applyTokenHpDelta, toggleCondition, normalizeTokenSize } from '@/lib/vtt/tokens';
import { VttCanvas } from './VttCanvas';
import { VttToolbar } from './VttToolbar';
import { InitiativePanel } from './InitiativePanel';
import { Sword, Heart, Zap } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface InitialScene {
  id: string;
  name: string;
  gridWidth: number;
  gridHeight: number;
  meterPerSquare: number;
  backgroundUrl?: string | null;
  gridColor?: string;
  gridOpacity?: number;
  tokens: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    size?: string;
    color: string;
    avatarUrl?: string | null;
    pvCurrent: number | null;
    pvMax: number | null;
    elevation?: number;
    rotation?: number;
    conditionsJson?: string;
  }>;
  initiative?: Array<{
    id: string;
    name: string;
    initiativeRoll: number;
    modifier: number;
    isCurrentTurn: boolean;
    roundNumber: number;
  }>;
}

export const TacticalGridCanvas: React.FC<{ initialScenes?: InitialScene[] }> = ({
  initialScenes = [],
}) => {
  const { roll } = useDice();

  const currentScene = initialScenes[0];
  const GRID_COLS = currentScene?.gridWidth || 20;
  const GRID_ROWS = currentScene?.gridHeight || 16;
  const CELL_SIZE = 48; // px

  // Initial Tokens
  const [tokens, setTokens] = useState<VttToken[]>(() => {
    if (currentScene?.tokens && currentScene.tokens.length > 0) {
      return currentScene.tokens.map((t) => ({
        id: t.id,
        name: t.name,
        system: 'T20',
        size: normalizeTokenSize(t.size),
        gridX: t.x,
        gridY: t.y,
        color: t.color || '#DC2626',
        avatarUrl: t.avatarUrl || undefined,
        pvCurrent: t.pvCurrent ?? 20,
        pvMax: t.pvMax ?? 20,
        pvTemp: 0,
        pmCurrent: 6,
        pmMax: 6,
        elevation: t.elevation ?? 0,
        conditions: t.conditionsJson ? JSON.parse(t.conditionsJson) : [],
      }));
    }

    return [
      {
        id: 't-warrior',
        name: 'Sir Rodrick (Guerreiro)',
        system: 'T20',
        size: 'MEDIO',
        gridX: 4,
        gridY: 5,
        color: '#DC2626',
        avatarUrl: '/assets/tokens/warrior.svg',
        pvCurrent: 28,
        pvMax: 28,
        pvTemp: 5,
        pmCurrent: 6,
        pmMax: 6,
        conditions: [],
      },
      {
        id: 't-mage',
        name: 'Maelis (Arcanista)',
        system: 'T20',
        size: 'MEDIO',
        gridX: 3,
        gridY: 7,
        color: '#2563EB',
        avatarUrl: '/assets/tokens/mage.svg',
        pvCurrent: 14,
        pvMax: 14,
        pvTemp: 0,
        pmCurrent: 18,
        pmMax: 18,
        conditions: [],
      },
      {
        id: 't-bugbear',
        name: 'Bugbear Chefe',
        system: 'T20',
        size: 'GRANDE',
        gridX: 12,
        gridY: 5,
        color: '#991B1B',
        avatarUrl: '/assets/tokens/bugbear.svg',
        pvCurrent: 45,
        pvMax: 45,
        pvTemp: 0,
        pmCurrent: 12,
        pmMax: 12,
        conditions: [],
      },
      {
        id: 't-goblin',
        name: 'Goblin Salteador',
        system: 'T20',
        size: 'PEQUENO',
        gridX: 10,
        gridY: 4,
        color: '#15803D',
        avatarUrl: '/assets/tokens/goblin.svg',
        pvCurrent: 12,
        pvMax: 12,
        pvTemp: 0,
        pmCurrent: 0,
        pmMax: 0,
        conditions: [],
      },
    ];
  });

  // State management
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>('t-warrior');
  const [activeTool, setActiveTool] = useState<'move' | 'ruler' | 'pan'>('move');
  const [metricMode, setMetricMode] = useState<DistanceMetric>('chebyshev');
  const [showGridLines, setShowGridLines] = useState<boolean>(true);

  // Ruler state
  const [rulerStart, setRulerStart] = useState<GridPosition | null>(null);
  const [rulerEnd, setRulerEnd] = useState<GridPosition | null>(null);

  // Canvas Viewport transform
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isSaving, setIsSaving] = useState(false);

  // Initiative Tracker State
  const [round, setRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [combatants, setCombatants] = useState<InitiativeCombatant[]>([
    {
      id: 't-warrior',
      name: 'Sir Rodrick',
      initiativeScore: 18,
      dexModifier: 1,
      isPlayer: true,
      pvCurrent: 28,
      pvMax: 28,
      conditions: [],
    },
    {
      id: 't-bugbear',
      name: 'Bugbear Chefe',
      initiativeScore: 16,
      dexModifier: 2,
      isPlayer: false,
      pvCurrent: 45,
      pvMax: 45,
      conditions: [],
    },
    {
      id: 't-mage',
      name: 'Maelis',
      initiativeScore: 12,
      dexModifier: 2,
      isPlayer: true,
      pvCurrent: 14,
      pvMax: 14,
      conditions: [],
    },
    {
      id: 't-goblin',
      name: 'Goblin Salteador',
      initiativeScore: 9,
      dexModifier: 3,
      isPlayer: false,
      pvCurrent: 12,
      pvMax: 12,
      conditions: [],
    },
  ]);

  // Selected token
  const selectedToken = tokens.find((t) => t.id === selectedTokenId);
  const activeCombatant = combatants[currentTurnIndex];

  // Dynamic Distance info
  const distanceInfo =
    rulerStart && rulerEnd
      ? calculateDistance(rulerStart, rulerEnd, metricMode)
      : null;

  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    if (activeTool === 'ruler') {
      if (!rulerStart || (rulerStart && rulerEnd)) {
        setRulerStart({ x, y });
        setRulerEnd(null);
      } else {
        setRulerEnd({ x, y });
      }
      return;
    }

    if (activeTool === 'move') {
      // Check if clicking existing token
      const clicked = tokens.find((t) => t.gridX === x && t.gridY === y);
      if (clicked) {
        setSelectedTokenId(clicked.id);
        return;
      }

      // Move selected token to new cell
      if (selectedTokenId) {
        handleMoveToken(selectedTokenId, x, y);
      }
    }
  };

  // Move token and sync
  const handleMoveToken = (tokenId: string, newX: number, newY: number) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, gridX: newX, gridY: newY } : t))
    );
  };

  // Select token
  const handleSelectToken = (token: VttToken) => {
    setSelectedTokenId(token.id);
  };

  // Advance turn
  const handleNextTurn = () => {
    const res = advanceTurn(currentTurnIndex, combatants.length, round);
    setCurrentTurnIndex(res.nextIndex);
    setRound(res.nextRound);

    // Auto-select active combatant
    const nextCombatant = combatants[res.nextIndex];
    if (nextCombatant) {
      setSelectedTokenId(nextCombatant.id);
    }
  };

  // Previous turn
  const handlePrevTurn = () => {
    const res = previousTurn(currentTurnIndex, combatants.length, round);
    setCurrentTurnIndex(res.prevIndex);
    setRound(res.prevRound);

    const prevCombatant = combatants[res.prevIndex];
    if (prevCombatant) {
      setSelectedTokenId(prevCombatant.id);
    }
  };

  // Roll initiative for all combatants
  const handleRollAllInitiative = () => {
    const updated = combatants.map((c) => {
      const d20 = Math.floor(Math.random() * 20) + 1;
      return {
        ...c,
        initiativeScore: d20 + c.dexModifier,
      };
    });

    const sorted = sortInitiative(updated);
    setCombatants(sorted);
    setCurrentTurnIndex(0);
    setRound(1);

    roll({
      formula: `1d20+Iniciativa # Iniciativa Geral da Rodada`,
      system: 'T20',
    });
  };

  // Quick HP adjuster for a combatant/token
  const handleUpdateCombatantHp = (id: string, delta: number) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newHp = Math.max(0, Math.min(c.pvMax, c.pvCurrent + delta));
        let conds = [...c.conditions];
        if (newHp <= 0 && !conds.includes('Inconsciente')) conds.push('Inconsciente');
        if (newHp > 0) conds = conds.filter((item) => item !== 'Inconsciente');
        return { ...c, pvCurrent: newHp, conditions: conds };
      })
    );

    setTokens((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const { updatedToken } = applyTokenHpDelta(t, delta);
        return updatedToken;
      })
    );
  };

  // Toggle condition
  const handleToggleCondition = (id: string, conditionName: string) => {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          conditions: toggleCondition(c.conditions, conditionName),
        };
      })
    );

    setTokens((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          conditions: toggleCondition(t.conditions, conditionName),
        };
      })
    );
  };

  // Add creature / monster
  const handleAddToken = () => {
    const newId = `token-${Date.now()}`;
    const count = tokens.length + 1;
    const isBig = count % 3 === 0;

    const newToken: VttToken = {
      id: newId,
      name: `Criatura ${count}`,
      system: 'T20',
      size: isBig ? 'GRANDE' : 'MEDIO',
      gridX: Math.floor(Math.random() * (GRID_COLS - 4)) + 2,
      gridY: Math.floor(Math.random() * (GRID_ROWS - 4)) + 2,
      color: isBig ? '#991B1B' : '#EA580C',
      avatarUrl: isBig ? '/assets/tokens/bugbear.svg' : '/assets/tokens/goblin.svg',
      pvCurrent: isBig ? 45 : 15,
      pvMax: isBig ? 45 : 15,
      pvTemp: 0,
      pmCurrent: 0,
      pmMax: 0,
      conditions: [],
    };

    setTokens((prev) => [...prev, newToken]);
    setCombatants((prev) => [
      ...prev,
      {
        id: newId,
        name: newToken.name,
        initiativeScore: Math.floor(Math.random() * 15) + 5,
        dexModifier: 1,
        isPlayer: false,
        pvCurrent: newToken.pvCurrent,
        pvMax: newToken.pvMax,
        conditions: [],
      },
    ]);
    setSelectedTokenId(newId);
  };

  // Save Scene and token state to backend
  const handleSaveScene = async () => {
    setIsSaving(true);
    try {
      if (currentScene?.id) {
        await fetch(`/api/scenes/${currentScene.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentScene.name,
            gridWidth: GRID_COLS,
            gridHeight: GRID_ROWS,
          }),
        });
      }
    } catch (err) {
      console.error('Failed to save scene:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* VTT Top Toolbar */}
      <VttToolbar
        activeTool={activeTool}
        setActiveTool={(tool) => {
          setActiveTool(tool);
          if (tool !== 'ruler') {
            setRulerStart(null);
            setRulerEnd(null);
          }
        }}
        metricMode={metricMode}
        setMetricMode={setMetricMode}
        showGridLines={showGridLines}
        setShowGridLines={setShowGridLines}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3.0, Number((z + 0.15).toFixed(2))))}
        onZoomOut={() => setZoom((z) => Math.max(0.3, Number((z - 0.15).toFixed(2))))}
        onZoomReset={() => {
          setZoom(1.0);
          setPan({ x: 20, y: 20 });
        }}
        onAddToken={handleAddToken}
        onSaveScene={handleSaveScene}
        isSaving={isSaving}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tactical Canvas Area (3 Columns) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Active Ruler Measurement Banner */}
          {activeTool === 'ruler' && (
            <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 flex items-center justify-between text-xs shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-slate-300">
                  {!rulerStart
                    ? '1. Clique no ponto de origem'
                    : !rulerEnd
                    ? '2. Clique no ponto de destino'
                    : 'Medição Concluída:'}
                </span>
              </div>

              {distanceInfo && (
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {distanceInfo.meters.toFixed(1)}m ({distanceInfo.cells} quadrados / {distanceInfo.feet} pés)
                  </span>
                  <Badge variant="gold" className="text-xs font-serif font-bold">
                    Alcance: {distanceInfo.rangeBand}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* VTT Interactive Multi-Layer Canvas */}
          <VttCanvas
            gridCols={GRID_COLS}
            gridRows={GRID_ROWS}
            cellSize={CELL_SIZE}
            backgroundUrl={currentScene?.backgroundUrl || '/maps/dungeon_arena.svg'}
            gridColor={currentScene?.gridColor || 'rgba(245, 158, 11, 0.25)'}
            gridOpacity={currentScene?.gridOpacity ?? 0.5}
            showGridLines={showGridLines}
            tokens={tokens}
            selectedTokenId={selectedTokenId}
            activeCombatantId={activeCombatant?.id}
            activeTool={activeTool}
            rulerStart={rulerStart}
            rulerEnd={rulerEnd}
            distanceInfo={distanceInfo}
            onCellClick={handleCellClick}
            onSelectToken={handleSelectToken}
            onMoveToken={handleMoveToken}
            pan={pan}
            zoom={zoom}
            setPan={setPan}
            setZoom={setZoom}
          />

          {/* Help Info Footer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span>
              Dimensões: {GRID_COLS} × {GRID_ROWS} células · 1 célula = 1,5m (5 pés)
            </span>
            <div className="flex items-center gap-3">
              <span>Mover: Arraste o token ou selecione e clique no grid</span>
              <span>Zoom: Scroll do mouse</span>
              <span>Pan: Arraste com Botão do Meio ou Alt+Clique</span>
            </div>
          </div>
        </div>

        {/* Tactical Side Panel (Initiative & Token Details) */}
        <div className="space-y-6">
          {/* Initiative Tracker Panel */}
          <InitiativePanel
            combatants={combatants}
            currentTurnIndex={currentTurnIndex}
            round={round}
            onNextTurn={handleNextTurn}
            onPrevTurn={handlePrevTurn}
            onSelectCombatant={(id) => setSelectedTokenId(id)}
            onRollAll={handleRollAllInitiative}
            onUpdateCombatantHp={handleUpdateCombatantHp}
            onToggleCondition={handleToggleCondition}
            onResetCombat={() => {
              setRound(1);
              setCurrentTurnIndex(0);
            }}
          />

          {/* Selected Token Tactical HUD Card */}
          {selectedToken ? (
            <Card variant="tabletop" className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  {selectedToken.avatarUrl ? (
                    <Image
                      src={selectedToken.avatarUrl}
                      alt={selectedToken.name}
                      width={32}
                      height={32}
                      unoptimized
                      className="w-8 h-8 rounded-full border border-amber-500 object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: selectedToken.color }}
                    >
                      {selectedToken.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xs font-bold text-amber-200 truncate max-w-[130px]">
                      {selectedToken.name}
                    </CardTitle>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Porte: {selectedToken.size} · ({selectedToken.gridX}, {selectedToken.gridY})
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                  {selectedToken.system}
                </Badge>
              </div>

              {/* Resource Bars */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-red-950/60">
                  <div className="flex items-center justify-between text-[10px] text-red-400/80 mb-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" /> PV
                    </span>
                    {(selectedToken.pvTemp ?? 0) > 0 && (
                      <span className="text-cyan-400">+{selectedToken.pvTemp} temp</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-base text-red-300">
                    {selectedToken.pvCurrent} / {selectedToken.pvMax}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-blue-950/60">
                  <div className="flex items-center justify-between text-[10px] text-blue-400/80 mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-400" /> PM
                    </span>
                  </div>
                  <span className="font-mono font-bold text-base text-blue-300">
                    {selectedToken.pmCurrent} / {selectedToken.pmMax}
                  </span>
                </div>
              </div>

              {/* Conditions Active List */}
              {selectedToken.conditions && selectedToken.conditions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium">Condições Ativas:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedToken.conditions.map((cond) => (
                      <Badge
                        key={cond}
                        variant="slate"
                        className="text-[10px] bg-red-950/80 text-red-200 border-red-800"
                      >
                        {cond}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contextual Roll Action Button */}
              <Button
                variant="gold"
                size="sm"
                onClick={() =>
                  roll({
                    formula: `1d20+8 # Ataque (${selectedToken.name})`,
                    threatRange: 19,
                    system: selectedToken.system,
                  })
                }
                className="w-full text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Sword className="w-3.5 h-3.5" />
                Rolar Ataque Tático
              </Button>
            </Card>
          ) : (
            <Card variant="tabletop" className="p-6 text-center text-xs text-slate-500 italic">
              Nenhum token selecionado. Clique em um combatente no grid.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TacticalGridCanvas;
