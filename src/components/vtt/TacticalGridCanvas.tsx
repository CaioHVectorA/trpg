'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDice } from '@/components/dice/DiceContext';
import {
  VttToken,
  InitiativeCombatant,
  GridPosition,
  DistanceMeasurement,
} from '@/lib/types';
import { calculateDistance, DistanceMetric } from '@/lib/vtt/ruler';
import { sortInitiative, advanceTurn, previousTurn } from '@/lib/vtt/initiative';
import { applyTokenHpDelta, toggleCondition, normalizeTokenSize } from '@/lib/vtt/tokens';
import { VttCanvas } from './VttCanvas';
import { VttToolbar } from './VttToolbar';
import { InitiativePanel } from './InitiativePanel';
import {
  Sword,
  Heart,
  Zap,
  Shield,
  Plus,
  Skull,
  History,
  MapPin,
  Sparkles,
  Flame,
  Check,
  RotateCcw,
  Dices,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
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

// Canonical Bestiary Spawner Catalog
const CANONICAL_BESTIARY = [
  {
    name: 'Goblin Salteador',
    size: 'PEQUENO',
    pv: 12,
    color: '#15803D',
    avatarUrl: '/assets/tokens/goblin.svg',
    nd: '1/4',
    bonusAtk: 5,
    dano: '1d4+1',
    system: 'T20',
  },
  {
    name: 'Esqueleto Guardião',
    size: 'MEDIO',
    pv: 16,
    color: '#475569',
    avatarUrl: '/assets/tokens/skeleton.svg',
    nd: '1/2',
    bonusAtk: 6,
    dano: '1d6+2',
    system: 'T20',
  },
  {
    name: 'Bugbear Espreitador',
    size: 'MEDIO',
    pv: 45,
    color: '#DC2626',
    avatarUrl: '/assets/tokens/bugbear.svg',
    nd: '2',
    bonusAtk: 9,
    dano: '1d8+5',
    system: 'T20',
  },
  {
    name: 'Cultista de Aharadak',
    size: 'MEDIO',
    pv: 38,
    color: '#7F1D1D',
    avatarUrl: '/assets/tokens/lefeu.svg',
    nd: '2',
    bonusAtk: 8,
    dano: '1d4+4 + 1d6 ácido',
    system: 'T20',
  },
  {
    name: 'Bugbear Chefe Brutamontes',
    size: 'GRANDE',
    pv: 65,
    color: '#991B1B',
    avatarUrl: '/assets/tokens/bugbear.svg',
    nd: '3',
    bonusAtk: 11,
    dano: '1d12+7',
    system: 'T20',
  },
  {
    name: 'Lefeu Espreitador da Tormenta',
    size: 'GRANDE',
    pv: 95,
    color: '#B91C1C',
    avatarUrl: '/assets/tokens/lefeu.svg',
    nd: '5',
    bonusAtk: 14,
    dano: '2d8+8 + 2d6 ácido',
    system: 'T20',
  },
  {
    name: 'Dragão Vermelho Jovem',
    size: 'ENORME',
    pv: 210,
    color: '#EF4444',
    avatarUrl: '/assets/tokens/dragon.svg',
    nd: '8',
    bonusAtk: 18,
    dano: '3d8+12 + 2d6 fogo',
    system: 'T20',
  },
  {
    name: 'Guarda de Valkaria',
    size: 'MEDIO',
    pv: 26,
    color: '#3B82F6',
    avatarUrl: '/assets/tokens/paladin.svg',
    nd: '1',
    bonusAtk: 7,
    dano: '1d10+4',
    system: 'T20',
  },
  {
    name: 'Pirata Corsário do Mar Negro',
    size: 'MEDIO',
    pv: 32,
    color: '#0284C7',
    avatarUrl: '/assets/tokens/pirate.svg',
    nd: '2',
    bonusAtk: 8,
    dano: '1d8+3 / 2d6 tiro',
    system: 'T20',
  },
  {
    name: 'Fera Espiritual de Moreania',
    size: 'GRANDE',
    pv: 58,
    color: '#059669',
    avatarUrl: '/assets/tokens/moreau.svg',
    nd: '3',
    bonusAtk: 10,
    dano: '2d6+5',
    system: 'T20',
  },
  {
    name: 'Assassino dos Capuzes',
    size: 'MEDIO',
    pv: 54,
    color: '#7E22CE',
    avatarUrl: '/assets/tokens/assassin.svg',
    nd: '4',
    bonusAtk: 12,
    dano: '1d4+6 + 2d6 veneno',
    system: 'T20',
  },
];

const HERO_PRESETS = [
  {
    name: 'Valeros de Valkaria',
    classRole: 'Guerreiro Nv 1',
    size: 'MEDIO',
    pv: 22,
    pm: 3,
    color: '#D4AF37',
    avatarUrl: '/assets/tokens/warrior.svg',
    bonusAtk: 5,
    dano: '1d8+3',
  },
  {
    name: 'Irmã Lyra da Justiça',
    classRole: 'Paladina Nv 2',
    size: 'MEDIO',
    pv: 28,
    pm: 6,
    color: '#EAB308',
    avatarUrl: '/assets/tokens/paladin.svg',
    bonusAtk: 5,
    dano: '1d8+2',
  },
  {
    name: 'Sombra dos Becos',
    classRole: 'Ladino Nv 2',
    size: 'PEQUENO',
    pv: 18,
    pm: 8,
    color: '#38BDF8',
    avatarUrl: '/assets/tokens/rogue.svg',
    bonusAtk: 8,
    dano: '1d4+4',
  },
  {
    name: 'Gromm Olho-de-Rubi',
    classRole: 'Bárbaro Nv 3',
    size: 'MEDIO',
    pv: 42,
    pm: 6,
    color: '#B91C1C',
    avatarUrl: '/assets/tokens/barbarian.svg',
    bonusAtk: 9,
    dano: '3d6+4',
  },
  {
    name: 'Lorien de Lenórienn',
    classRole: 'Mago Nv 1',
    size: 'MEDIO',
    pv: 10,
    pm: 4,
    color: '#2563EB',
    avatarUrl: '/assets/tokens/mage.svg',
    bonusAtk: 2,
    dano: '1d4',
  },
  {
    name: 'Capitão James',
    classRole: 'Bucaneiro Nv 2',
    size: 'MEDIO',
    pv: 24,
    pm: 6,
    color: '#0284C7',
    avatarUrl: '/assets/tokens/pirate.svg',
    bonusAtk: 7,
    dano: '1d8+3 / 2d6 tiro',
  },
  {
    name: 'Kira Olhos-de-Prata',
    classRole: 'Moreau Ladina Nv 2',
    size: 'MEDIO',
    pv: 20,
    pm: 8,
    color: '#10B981',
    avatarUrl: '/assets/tokens/moreau.svg',
    bonusAtk: 8,
    dano: '1d4+4 + 1d6 furtivo',
  },
];

const ALL_CONDITIONS = [
  'Abalado',
  'Caído',
  'Cego',
  'Desprevenido',
  'Fatigado',
  'Imóvel',
  'Inconsciente',
  'Paralisado',
  'Sangrando',
  'Vulnerável',
];

export const TacticalGridCanvas: React.FC<{ initialScenes?: InitialScene[] }> = ({
  initialScenes = [],
}) => {
  const { roll, recentRolls } = useDice();

  // Active scene state
  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => {
    return initialScenes[0]?.id || 'scene-default';
  });

  const currentScene = useMemo(() => {
    return (
      initialScenes.find((s) => s.id === selectedSceneId) ||
      initialScenes[0] || {
        id: 'scene-default',
        name: 'Masmorra de Khalmyr',
        gridWidth: 20,
        gridHeight: 16,
        meterPerSquare: 1.5,
        backgroundUrl: '/maps/dungeon_arena.svg',
        gridColor: 'rgba(245, 158, 11, 0.25)',
        gridOpacity: 0.6,
        tokens: [],
      }
    );
  }, [initialScenes, selectedSceneId]);

  const GRID_COLS = currentScene.gridWidth || 20;
  const GRID_ROWS = currentScene.gridHeight || 16;
  const CELL_SIZE = 48; // px

  // Tab state for the right sidebar
  const [sidebarTab, setSidebarTab] = useState<'initiative' | 'hud' | 'bestiary' | 'chat'>('initiative');

  // Token state
  const [tokens, setTokens] = useState<VttToken[]>(() => {
    if (currentScene?.tokens && currentScene.tokens.length > 0) {
      return currentScene.tokens.map((t) => ({
        id: t.id,
        name: t.name,
        system: 'T20',
        size: normalizeTokenSize(t.size),
        gridX: t.x,
        gridY: t.y,
        color: t.color || '#D4AF37',
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
        name: 'Valeros de Valkaria',
        system: 'T20',
        size: 'MEDIO',
        gridX: 3,
        gridY: 4,
        color: '#D4AF37',
        avatarUrl: '/assets/tokens/warrior.svg',
        pvCurrent: 22,
        pvMax: 22,
        pvTemp: 0,
        pmCurrent: 3,
        pmMax: 3,
        conditions: [],
      },
      {
        id: 't-lyra',
        name: 'Irmã Lyra da Justiça',
        system: 'T20',
        size: 'MEDIO',
        gridX: 3,
        gridY: 5,
        color: '#EAB308',
        avatarUrl: '/assets/tokens/paladin.svg',
        pvCurrent: 28,
        pvMax: 28,
        pvTemp: 0,
        pmCurrent: 6,
        pmMax: 6,
        conditions: [],
      },
      {
        id: 't-bugbear',
        name: 'Bugbear Espreitador',
        system: 'T20',
        size: 'MEDIO',
        gridX: 7,
        gridY: 4,
        color: '#DC2626',
        avatarUrl: '/assets/tokens/bugbear.svg',
        pvCurrent: 45,
        pvMax: 45,
        pvTemp: 0,
        pmCurrent: 10,
        pmMax: 10,
        conditions: ['Desprevenido'],
      },
      {
        id: 't-goblin',
        name: 'Goblin Salteador',
        system: 'T20',
        size: 'PEQUENO',
        gridX: 9,
        gridY: 3,
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
      name: 'Valeros de Valkaria',
      initiativeScore: 18,
      dexModifier: 1,
      isPlayer: true,
      pvCurrent: 22,
      pvMax: 22,
      conditions: [],
    },
    {
      id: 't-bugbear',
      name: 'Bugbear Espreitador',
      initiativeScore: 14,
      dexModifier: 2,
      isPlayer: false,
      pvCurrent: 45,
      pvMax: 45,
      conditions: ['Desprevenido'],
    },
    {
      id: 't-lyra',
      name: 'Irmã Lyra da Justiça',
      initiativeScore: 12,
      dexModifier: 0,
      isPlayer: true,
      pvCurrent: 28,
      pvMax: 28,
      conditions: [],
    },
    {
      id: 't-goblin',
      name: 'Goblin Salteador',
      initiativeScore: 9,
      dexModifier: 4,
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

  // Handle scene switch
  const handleSwitchScene = (newSceneId: string) => {
    setSelectedSceneId(newSceneId);
    const targetScene = initialScenes.find((s) => s.id === newSceneId);
    if (targetScene && targetScene.tokens && targetScene.tokens.length > 0) {
      const mappedTokens: VttToken[] = targetScene.tokens.map((t) => ({
        id: t.id,
        name: t.name,
        system: 'T20',
        size: normalizeTokenSize(t.size),
        gridX: t.x,
        gridY: t.y,
        color: t.color || '#D4AF37',
        avatarUrl: t.avatarUrl || undefined,
        pvCurrent: t.pvCurrent ?? 20,
        pvMax: t.pvMax ?? 20,
        pvTemp: 0,
        pmCurrent: 6,
        pmMax: 6,
        elevation: t.elevation ?? 0,
        conditions: t.conditionsJson ? JSON.parse(t.conditionsJson) : [],
      }));
      setTokens(mappedTokens);
      if (mappedTokens[0]) setSelectedTokenId(mappedTokens[0].id);

      // Rebuild initiative list for target scene
      const mappedCombatants: InitiativeCombatant[] = mappedTokens.map((t, idx) => ({
        id: t.id,
        name: t.name,
        initiativeScore: 15 - idx * 2,
        dexModifier: 1,
        isPlayer: !t.name.toLowerCase().includes('lefeu') && !t.name.toLowerCase().includes('bugbear'),
        pvCurrent: t.pvCurrent,
        pvMax: t.pvMax,
        conditions: t.conditions,
      }));
      setCombatants(sortInitiative(mappedCombatants));
      setCurrentTurnIndex(0);
      setRound(1);
    }
  };

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
      const clicked = tokens.find((t) => t.gridX === x && t.gridY === y);
      if (clicked) {
        setSelectedTokenId(clicked.id);
        return;
      }

      if (selectedTokenId) {
        handleMoveToken(selectedTokenId, x, y);
      }
    }
  };

  // Move token
  const handleMoveToken = (tokenId: string, newX: number, newY: number) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, gridX: newX, gridY: newY } : t))
    );
  };

  // Select token
  const handleSelectToken = (token: VttToken) => {
    setSelectedTokenId(token.id);
  };

  // Turn management
  const handleNextTurn = () => {
    const res = advanceTurn(currentTurnIndex, combatants.length, round);
    setCurrentTurnIndex(res.nextIndex);
    setRound(res.nextRound);

    const nextCombatant = combatants[res.nextIndex];
    if (nextCombatant) {
      setSelectedTokenId(nextCombatant.id);
    }
  };

  const handlePrevTurn = () => {
    const res = previousTurn(currentTurnIndex, combatants.length, round);
    setCurrentTurnIndex(res.prevIndex);
    setRound(res.prevRound);

    const prevCombatant = combatants[res.prevIndex];
    if (prevCombatant) {
      setSelectedTokenId(prevCombatant.id);
    }
  };

  // Roll initiative for all
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

  // Quick HP adjustments
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

  // Spawn monster from bestiary
  const handleSpawnFromBestiary = (beast: (typeof CANONICAL_BESTIARY)[0]) => {
    const newId = `token-beast-${Date.now()}`;
    const freeX = Math.floor(Math.random() * (GRID_COLS - 4)) + 2;
    const freeY = Math.floor(Math.random() * (GRID_ROWS - 4)) + 2;

    const newToken: VttToken = {
      id: newId,
      name: beast.name,
      system: 'T20',
      size: normalizeTokenSize(beast.size),
      gridX: freeX,
      gridY: freeY,
      color: beast.color,
      avatarUrl: beast.avatarUrl,
      pvCurrent: beast.pv,
      pvMax: beast.pv,
      pvTemp: 0,
      pmCurrent: 10,
      pmMax: 10,
      conditions: [],
    };

    setTokens((prev) => [...prev, newToken]);
    setCombatants((prev) => [
      ...prev,
      {
        id: newId,
        name: beast.name,
        initiativeScore: Math.floor(Math.random() * 15) + 5,
        dexModifier: 2,
        isPlayer: false,
        pvCurrent: beast.pv,
        pvMax: beast.pv,
        conditions: [],
      },
    ]);
    setSelectedTokenId(newId);
    setSidebarTab('hud');
  };

  // Spawn hero preset
  const handleSpawnHero = (hero: (typeof HERO_PRESETS)[0]) => {
    const newId = `token-hero-${Date.now()}`;
    const freeX = Math.floor(Math.random() * (GRID_COLS - 4)) + 2;
    const freeY = Math.floor(Math.random() * (GRID_ROWS - 4)) + 2;

    const newToken: VttToken = {
      id: newId,
      name: hero.name,
      system: 'T20',
      size: normalizeTokenSize(hero.size),
      gridX: freeX,
      gridY: freeY,
      color: hero.color,
      avatarUrl: hero.avatarUrl,
      pvCurrent: hero.pv,
      pvMax: hero.pv,
      pvTemp: 0,
      pmCurrent: hero.pm,
      pmMax: hero.pm,
      conditions: [],
    };

    setTokens((prev) => [...prev, newToken]);
    setCombatants((prev) => [
      ...prev,
      {
        id: newId,
        name: hero.name,
        initiativeScore: Math.floor(Math.random() * 15) + 8,
        dexModifier: 2,
        isPlayer: true,
        pvCurrent: hero.pv,
        pvMax: hero.pv,
        conditions: [],
      },
    ]);
    setSelectedTokenId(newId);
    setSidebarTab('hud');
  };

  // Add generic token
  const handleAddToken = () => {
    handleSpawnFromBestiary(CANONICAL_BESTIARY[0]);
  };

  // Save Scene
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
    <div className="space-y-4">
      {/* Scene Switcher Header Bar (Roll20 / Foundry VTT Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#090D18] border border-amber-500/25 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mr-1 flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Cenas:
          </span>

          {initialScenes.map((sc) => {
            const isActive = sc.id === selectedSceneId;
            return (
              <button
                key={sc.id}
                onClick={() => handleSwitchScene(sc.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border',
                  isActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                )}
              >
                <MapPin className={cn('w-3 h-3', isActive ? 'text-amber-400' : 'text-slate-500')} />
                <span>{sc.name}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({sc.gridWidth}×{sc.gridHeight})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-300">
            Escala: 1 célula = 1,5m
          </Badge>
        </div>
      </div>

      {/* VTT Top Controls Toolbar */}
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

      {/* Main Grid & Interactive Side Panel Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Tactical Canvas Area (3 Columns) */}
        <div className="xl:col-span-3 space-y-3">
          {/* Active Ruler Measurement Banner */}
          {activeTool === 'ruler' && (
            <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 flex items-center justify-between text-xs shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-slate-300 font-medium">
                  {!rulerStart
                    ? '1. Clique na célula de origem da medição'
                    : !rulerEnd
                    ? '2. Clique na célula de destino'
                    : 'Distância Medida:'}
                </span>
              </div>

              {distanceInfo && (
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {distanceInfo.meters.toFixed(1)}m ({distanceInfo.cells} quadrados / {distanceInfo.feet} pés)
                  </span>
                  <Badge variant="gold" className="text-xs font-serif font-bold">
                    Faixa: {distanceInfo.rangeBand}
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
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <strong>{currentScene.name}</strong> · {GRID_COLS} × {GRID_ROWS} células (1,5m / 5 pés)
            </span>
            <div className="flex items-center gap-4">
              <span>Mover: Arraste o token</span>
              <span>Régua: Tecla ou botão Régua</span>
              <span>Pan: Alt+Arraste ou Botão Meio</span>
              <span>Zoom: Roda do mouse</span>
            </div>
          </div>
        </div>

        {/* Tabbed Side Panel (Roll20 / Foundry VTT Style) */}
        <div className="space-y-3">
          {/* Tabs Selector Header */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-amber-500/25">
            <button
              onClick={() => setSidebarTab('initiative')}
              className={cn(
                'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                sidebarTab === 'initiative'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Turnos</span>
            </button>

            <button
              onClick={() => setSidebarTab('hud')}
              className={cn(
                'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                sidebarTab === 'hud'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Ficha</span>
            </button>

            <button
              onClick={() => setSidebarTab('bestiary')}
              className={cn(
                'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                sidebarTab === 'bestiary'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Skull className="w-3.5 h-3.5 text-purple-400" />
              <span>Bestiário</span>
            </button>

            <button
              onClick={() => setSidebarTab('chat')}
              className={cn(
                'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                sidebarTab === 'chat'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Log ({recentRolls.length})</span>
            </button>
          </div>

          {/* TAB 1: INITIATIVE & TURNS */}
          {sidebarTab === 'initiative' && (
            <InitiativePanel
              combatants={combatants}
              currentTurnIndex={currentTurnIndex}
              round={round}
              onNextTurn={handleNextTurn}
              onPrevTurn={handlePrevTurn}
              onSelectCombatant={(id) => {
                setSelectedTokenId(id);
                setSidebarTab('hud');
              }}
              onRollAll={handleRollAllInitiative}
              onUpdateCombatantHp={handleUpdateCombatantHp}
              onToggleCondition={handleToggleCondition}
              onResetCombat={() => {
                setRound(1);
                setCurrentTurnIndex(0);
              }}
            />
          )}

          {/* TAB 2: SELECTED TOKEN HUD */}
          {sidebarTab === 'hud' && (
            <>
              {selectedToken ? (
                <Card variant="tabletop" className="p-4 space-y-4 border-amber-500/30">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-3">
                      {selectedToken.avatarUrl ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                          <Image
                            src={selectedToken.avatarUrl}
                            alt={selectedToken.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md"
                          style={{ backgroundColor: selectedToken.color }}
                        >
                          {selectedToken.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-sm font-serif font-bold text-amber-200 truncate max-w-[150px]">
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
                        <span className="flex items-center gap-1 font-bold">
                          <Heart className="w-3 h-3 text-red-400" /> PV
                        </span>
                        {(selectedToken.pvTemp ?? 0) > 0 && (
                          <span className="text-cyan-400 font-mono">+{selectedToken.pvTemp} temp</span>
                        )}
                      </div>
                      <span className="font-mono font-black text-lg text-red-300">
                        {selectedToken.pvCurrent} / {selectedToken.pvMax}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-blue-950/60">
                      <div className="flex items-center justify-between text-[10px] text-blue-400/80 mb-1">
                        <span className="flex items-center gap-1 font-bold">
                          <Zap className="w-3 h-3 text-blue-400" /> PM
                        </span>
                      </div>
                      <span className="font-mono font-black text-lg text-blue-300">
                        {selectedToken.pmCurrent} / {selectedToken.pmMax}
                      </span>
                    </div>
                  </div>

                  {/* Quick HP Adjuster Buttons */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ajuste Rápido de Vida
                    </span>
                    <div className="grid grid-cols-6 gap-1">
                      {[-10, -5, -1, 1, 5, 10].map((delta) => (
                        <button
                          key={delta}
                          onClick={() => handleUpdateCombatantHp(selectedToken.id, delta)}
                          className={cn(
                            'py-1 rounded text-xs font-mono font-bold transition-all border',
                            delta < 0
                              ? 'bg-red-950/60 hover:bg-red-900 border-red-800 text-red-300'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                          )}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditions Selector Toggles */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Condições de Batalha
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ALL_CONDITIONS.map((cond) => {
                        const hasCond = selectedToken.conditions?.includes(cond);
                        return (
                          <button
                            key={cond}
                            onClick={() => handleToggleCondition(selectedToken.id, cond)}
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-semibold transition-all border',
                              hasCond
                                ? 'bg-red-900 border-red-500 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            )}
                          >
                            {cond}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attack Roll Action */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() =>
                        roll({
                          formula: `1d20+8 # Ataque Tático (${selectedToken.name})`,
                          threatRange: 19,
                          system: selectedToken.system,
                        })
                      }
                      className="w-full text-xs font-bold flex items-center justify-center gap-2 shadow"
                    >
                      <Sword className="w-3.5 h-3.5" />
                      Rolar Ataque Principal (1d20+8)
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        roll({
                          formula: `1d8+4 # Dano da Arma (${selectedToken.name})`,
                          system: selectedToken.system,
                        })
                      }
                      className="w-full text-xs border-red-500/40 text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-2"
                    >
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      Rolar Dano da Arma (1d8+4)
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card variant="tabletop" className="p-8 text-center text-xs text-slate-400 italic">
                  Nenhum combatente selecionado. Clique em um token no grid para abrir sua ficha.
                </Card>
              )}
            </>
          )}

          {/* TAB 3: BESTIARY & HERO SPAWNER */}
          {sidebarTab === 'bestiary' && (
            <Card variant="tabletop" className="p-4 space-y-4 border-amber-500/30">
              <div>
                <CardTitle className="text-sm font-serif font-bold text-amber-200 flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-red-400" />
                  Bestiário &amp; Inserção no Grid
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clique para posicionar a criatura instantaneamente no mapa.
                </p>
              </div>

              {/* Monster Threats */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {CANONICAL_BESTIARY.map((beast, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-red-500/60 shrink-0">
                        <Image
                          src={beast.avatarUrl}
                          alt={beast.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate">{beast.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ND {beast.nd} · {beast.pv} PV · {beast.size}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="arton"
                      size="sm"
                      onClick={() => handleSpawnFromBestiary(beast)}
                      className="h-7 px-2 text-[11px] font-bold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Spawn
                    </Button>
                  </div>
                ))}
              </div>

              {/* Heroes Preset */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Heróis Pré-Montados
                </span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {HERO_PRESETS.map((hero, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-200 block truncate">{hero.name}</span>
                        <span className="text-[10px] text-slate-400">{hero.classRole}</span>
                      </div>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => handleSpawnHero(hero)}
                        className="h-6 px-2 text-[10px] font-bold"
                      >
                        + Colocar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: CHAT & DICE ROLL LOG */}
          {sidebarTab === 'chat' && (
            <Card variant="tabletop" className="p-4 space-y-3 border-amber-500/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <CardTitle className="text-sm font-serif font-bold text-amber-200 flex items-center gap-1.5">
                  <Dices className="w-4 h-4 text-amber-400" />
                  Registro de Rolagens
                </CardTitle>
                <span className="text-[10px] text-slate-500 font-mono">
                  {recentRolls.length} rolagens
                </span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {recentRolls.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-500 italic">
                    Nenhuma rolagem feita ainda. Use os botões de ataque ou o rolador flutuante!
                  </p>
                ) : (
                  recentRolls.map((r, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'p-2.5 rounded-lg border text-xs space-y-1',
                        r.isCriticalHit
                          ? 'bg-amber-950/40 border-amber-400/60'
                          : r.isFumble
                          ? 'bg-red-950/40 border-red-500/60'
                          : 'bg-slate-900/80 border-slate-800'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">
                          {r.label || 'Rolagem d20'}
                        </span>
                        {r.isCriticalHit && (
                          <Badge variant="gold" className="text-[9px] py-0 px-1">
                            CRÍTICO!
                          </Badge>
                        )}
                        {r.isFumble && (
                          <Badge variant="arton" className="text-[9px] py-0 px-1">
                            FALHA!
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="font-serif font-black text-xl text-amber-300">
                          {r.total}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {r.breakdown}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TacticalGridCanvas;
