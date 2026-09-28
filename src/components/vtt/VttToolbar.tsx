'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DistanceMetric } from '@/lib/vtt/ruler';
import {
  Crosshair,
  Ruler,
  Hand,
  ZoomIn,
  ZoomOut,
  Grid,
  Plus,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VttToolbarProps {
  activeTool: 'move' | 'ruler' | 'pan';
  setActiveTool: (tool: 'move' | 'ruler' | 'pan') => void;
  metricMode: DistanceMetric;
  setMetricMode: (mode: DistanceMetric) => void;
  showGridLines: boolean;
  setShowGridLines: React.Dispatch<React.SetStateAction<boolean>>;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onAddToken: () => void;
  onSaveScene?: () => void;
  isSaving?: boolean;
}

export const VttToolbar: React.FC<VttToolbarProps> = ({
  activeTool,
  setActiveTool,
  metricMode,
  setMetricMode,
  showGridLines,
  setShowGridLines,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onAddToken,
  onSaveScene,
  isSaving,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-amber-500/25 shadow-xl backdrop-blur-md">
      {/* Primary Tool Buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          variant={activeTool === 'move' ? 'gold' : 'ghost'}
          size="sm"
          onClick={() => setActiveTool('move')}
          className="flex items-center gap-1.5 h-8 text-xs font-semibold"
          title="Modo Seleção e Movimentação"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Mover</span>
        </Button>

        <Button
          variant={activeTool === 'ruler' ? 'gold' : 'ghost'}
          size="sm"
          onClick={() => setActiveTool('ruler')}
          className="flex items-center gap-1.5 h-8 text-xs font-semibold"
          title="Régua de Alcance Tático"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Régua</span>
        </Button>

        <Button
          variant={activeTool === 'pan' ? 'gold' : 'ghost'}
          size="sm"
          onClick={() => setActiveTool('pan')}
          className="flex items-center gap-1.5 h-8 text-xs font-semibold"
          title="Navegação e Pan no Mapa"
        >
          <Hand className="w-3.5 h-3.5" />
          <span>Arrastar</span>
        </Button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Metric Selector (T20 Chebyshev vs TRPG 5/10/5) */}
        <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMetricMode('chebyshev')}
            className={cn(
              'px-2 py-1 rounded text-[11px] font-medium transition-colors',
              metricMode === 'chebyshev'
                ? 'bg-amber-500/30 text-amber-200 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Métrica T20: diagonais custam 1,5m"
          >
            T20 (Chebyshev)
          </button>
          <button
            onClick={() => setMetricMode('5-10-5')}
            className={cn(
              'px-2 py-1 rounded text-[11px] font-medium transition-colors',
              metricMode === '5-10-5'
                ? 'bg-amber-500/30 text-amber-200 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Métrica TRPG: diagonais alternadas 1,5m / 3,0m"
          >
            TRPG (5/10/5)
          </button>
        </div>
      </div>

      {/* Secondary Controls: Grid, Zoom, Add Token, Save */}
      <div className="flex items-center gap-2">
        {/* Toggle Grid Lines */}
        <Button
          variant={showGridLines ? 'outline' : 'ghost'}
          size="sm"
          onClick={() => setShowGridLines((v) => !v)}
          className="h-8 px-2 text-xs text-slate-300"
          title="Alternar visibilidade das linhas da grade"
        >
          <Grid className="w-3.5 h-3.5" />
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <button
            onClick={onZoomReset}
            className="px-2 text-[11px] font-mono text-slate-400 hover:text-amber-300"
            title="Resetar Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Add Token / Creature Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddToken}
          className="h-8 text-xs flex items-center gap-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Criatura</span>
        </Button>

        {/* Save Scene Button if handler provided */}
        {onSaveScene && (
          <Button
            variant="gold"
            size="sm"
            onClick={onSaveScene}
            disabled={isSaving}
            className="h-8 text-xs flex items-center gap-1 shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
