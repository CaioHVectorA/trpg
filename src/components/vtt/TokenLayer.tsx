'use client';

import React from 'react';
import { VttToken } from '@/lib/types';
import { getTokenDimension, calculateHpPercentage, getHpBarColor } from '@/lib/vtt/tokens';
import { cn } from '@/lib/utils';

import Image from 'next/image';

interface TokenLayerProps {
  tokens: VttToken[];
  selectedTokenId: string | null;
  activeCombatantId?: string | null;
  cellSize: number;
  onSelectToken: (token: VttToken) => void;
  onMoveToken: (tokenId: string, newX: number, newY: number) => void;
}

export const TokenLayer: React.FC<TokenLayerProps> = ({
  tokens,
  selectedTokenId,
  activeCombatantId,
  cellSize,
  onSelectToken,
  onMoveToken: _onMoveToken,
}) => {
  const [draggingTokenId, setDraggingTokenId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, token: VttToken) => {
    e.dataTransfer.setData('text/plain', token.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTokenId(token.id);
    onSelectToken(token);
  };

  const handleDragEnd = () => {
    setDraggingTokenId(null);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {tokens.map((token) => {
        const isSelected = selectedTokenId === token.id;
        const isActiveCombatant = activeCombatantId === token.id;
        const dimensionInCells = getTokenDimension(token.size);
        const tokenPixelSize = dimensionInCells * cellSize;
        const hpPercent = calculateHpPercentage(token.pvCurrent, token.pvMax);
        const hpColor = getHpBarColor(hpPercent);

        return (
          <div
            key={token.id}
            draggable
            onDragStart={(e) => handleDragStart(e, token)}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              onSelectToken(token);
            }}
            className={cn(
              'absolute pointer-events-auto rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 select-none',
              isSelected && 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 z-20',
              isActiveCombatant && 'animate-pulse ring-4 ring-emerald-400 z-30',
              draggingTokenId === token.id && 'opacity-60'
            )}
            style={{
              left: token.gridX * cellSize + 2,
              top: token.gridY * cellSize + 2,
              width: tokenPixelSize - 4,
              height: tokenPixelSize - 4,
              backgroundColor: token.color || '#D4AF37',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            }}
            title={`${token.name} (${token.pvCurrent}/${token.pvMax} PV)`}
          >
            {/* Token Avatar or Initials */}
            {token.avatarUrl ? (
              <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src={token.avatarUrl}
                  alt={token.name}
                  width={tokenPixelSize}
                  height={tokenPixelSize}
                  unoptimized
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                />
              </div>
            ) : (
              <span className="font-serif font-black text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none">
                {token.name.slice(0, 2).toUpperCase()}
              </span>
            )}

            {/* HP Bar Overlay (Top of token) */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[90%] bg-slate-950/90 rounded-full h-2 overflow-hidden border border-slate-700 shadow-sm pointer-events-none flex">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${hpPercent}%`,
                  backgroundColor: hpColor,
                }}
              />
              {/* Temp HP overlay indicator if any */}
              {(token.pvTemp ?? 0) > 0 && (
                <div
                  className="h-full bg-cyan-400 opacity-90 border-l border-white/50"
                  style={{
                    width: `${Math.min(
                      100 - hpPercent,
                      ((token.pvTemp ?? 0) / token.pvMax) * 100
                    )}%`,
                  }}
                  title={`+${token.pvTemp} PV Temporários`}
                />
              )}
            </div>

            {/* Condition Badges (Bottom edge) */}
            {token.conditions && token.conditions.length > 0 && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 pointer-events-none max-w-full overflow-x-hidden">
                {token.conditions.slice(0, 3).map((cond, idx) => (
                  <span
                    key={`${token.id}-cond-${idx}`}
                    className="px-1 py-0.2 bg-red-950/90 border border-red-500/80 text-[9px] font-bold text-red-200 rounded leading-tight shadow"
                    title={cond}
                  >
                    {cond.slice(0, 3)}
                  </span>
                ))}
                {token.conditions.length > 3 && (
                  <span className="px-0.5 bg-slate-900 border border-slate-700 text-[8px] text-slate-300 rounded">
                    +{token.conditions.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Elevation Badge if airborne or subterranean */}
            {token.elevation !== undefined && token.elevation !== 0 && (
              <div className="absolute -top-3 -right-2 bg-blue-900/90 border border-blue-400 text-blue-100 text-[9px] font-mono font-bold px-1 rounded-full shadow">
                {token.elevation > 0 ? `+${token.elevation}m` : `${token.elevation}m`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
