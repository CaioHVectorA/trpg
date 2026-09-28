'use client';

import React, { useRef, useState, useEffect } from 'react';
import { GridPosition, DistanceMeasurement, VttToken } from '@/lib/types';
import { screenToGrid, isValidGridCell } from '@/lib/vtt/grid';
import { TokenLayer } from './TokenLayer';
import { RangeRulerLayer } from './RangeRulerLayer';
import { cn } from '@/lib/utils';

interface VttCanvasProps {
  gridCols: number;
  gridRows: number;
  cellSize: number;
  meterPerSquare?: number;
  backgroundUrl?: string;
  gridColor?: string;
  gridOpacity?: number;
  showGridLines?: boolean;
  tokens: VttToken[];
  selectedTokenId: string | null;
  activeCombatantId?: string | null;
  activeTool: 'move' | 'ruler' | 'pan';
  rulerStart: GridPosition | null;
  rulerEnd: GridPosition | null;
  distanceInfo: DistanceMeasurement | null;
  onCellClick: (x: number, y: number) => void;
  onSelectToken: (token: VttToken) => void;
  onMoveToken: (tokenId: string, newX: number, newY: number) => void;
  onTokenDrop?: (tokenData: Partial<VttToken>, x: number, y: number) => void;
  pan: { x: number; y: number };
  zoom: number;
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export const VttCanvas: React.FC<VttCanvasProps> = ({
  gridCols,
  gridRows,
  cellSize,
  backgroundUrl = '/maps/dungeon_arena.svg',
  gridColor = 'rgba(245, 158, 11, 0.25)',
  gridOpacity = 0.5,
  showGridLines = true,
  tokens,
  selectedTokenId,
  activeCombatantId,
  activeTool,
  rulerStart,
  rulerEnd,
  distanceInfo,
  onCellClick,
  onSelectToken,
  onMoveToken,
  onTokenDrop,
  pan,
  zoom,
  setPan,
  setZoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<GridPosition | null>(null);

  const boardWidth = gridCols * cellSize;
  const boardHeight = gridRows * cellSize;

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prevZoom) => {
      const nextZoom = Math.max(0.3, Math.min(3.0, prevZoom * zoomFactor));
      return Number(nextZoom.toFixed(2));
    });
  };

  // Pointer Pan events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click (button === 1) or pan tool or space bar held
    if (e.button === 1 || activeTool === 'pan' || e.altKey) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPoint({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanPoint.x,
        y: e.clientY - startPanPoint.y,
      });
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pointerScreenX = e.clientX - rect.left;
    const pointerScreenY = e.clientY - rect.top;

    const cell = screenToGrid(pointerScreenX, pointerScreenY, pan, zoom, cellSize);
    if (isValidGridCell(cell.x, cell.y, gridCols, gridRows)) {
      setHoveredCell(cell);
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Handle Drag Over / Drop for Tokens
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropScreenX = e.clientX - rect.left;
    const dropScreenY = e.clientY - rect.top;

    const cell = screenToGrid(dropScreenX, dropScreenY, pan, zoom, cellSize);

    // Check if cell is within bounds
    if (!isValidGridCell(cell.x, cell.y, gridCols, gridRows)) return;

    // Check if dragging an existing token ID
    const draggedTokenId = e.dataTransfer.getData('text/plain');
    if (draggedTokenId) {
      onMoveToken(draggedTokenId, cell.x, cell.y);
      return;
    }

    // Check if dragging from compendium
    const compendiumData = e.dataTransfer.getData('application/x-trpg-threat');
    if (compendiumData && onTokenDrop) {
      try {
        const parsed = JSON.parse(compendiumData);
        onTokenDrop(parsed, cell.x, cell.y);
      } catch (err) {
        console.error('Failed to parse dropped threat data:', err);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative w-full h-[620px] rounded-xl overflow-hidden bg-[#070b14] border-2 border-amber-500/30 select-none shadow-2xl',
        isPanning ? 'cursor-grabbing' : activeTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'
      )}
    >
      {/* Viewport Transform Container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: boardWidth,
          height: boardHeight,
        }}
        className="relative transition-transform duration-75 ease-out"
      >
        {/* Layer 1: Background Battlemap Image */}
        {backgroundUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none rounded-lg"
            style={{
              backgroundImage: `url(${backgroundUrl})`,
              width: boardWidth,
              height: boardHeight,
            }}
          />
        )}

        {/* Layer 2: Tactical Grid Overlay */}
        {showGridLines && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: boardWidth,
              height: boardHeight,
              backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              opacity: gridOpacity,
            }}
          />
        )}

        {/* Hovered Cell Highlight */}
        {hoveredCell && (
          <div
            className="absolute pointer-events-none border border-amber-400/80 bg-amber-400/10 rounded-sm z-5 transition-all"
            style={{
              left: hoveredCell.x * cellSize,
              top: hoveredCell.y * cellSize,
              width: cellSize,
              height: cellSize,
            }}
          />
        )}

        {/* Layer 3: Interactive Grid Click Zones */}
        {Array.from({ length: gridRows }).map((_, r) =>
          Array.from({ length: gridCols }).map((_, c) => (
            <div
              key={`cell-${c}-${r}`}
              onClick={(e) => {
                e.stopPropagation();
                onCellClick(c, r);
              }}
              className="absolute cursor-pointer hover:bg-amber-300/10 transition-colors z-5"
              style={{
                left: c * cellSize,
                top: r * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            />
          ))
        )}

        {/* Layer 4: Tokens */}
        <TokenLayer
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          activeCombatantId={activeCombatantId}
          cellSize={cellSize}
          onSelectToken={onSelectToken}
          onMoveToken={onMoveToken}
        />

        {/* Layer 5: Range Ruler */}
        <RangeRulerLayer
          rulerStart={rulerStart}
          rulerEnd={rulerEnd}
          cellSize={cellSize}
          distanceInfo={distanceInfo}
        />
      </div>

      {/* Grid Coordinates HUD in bottom-left */}
      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 pointer-events-none z-30 flex items-center gap-3">
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>
          Célula: {hoveredCell ? `(${hoveredCell.x}, ${hoveredCell.y})` : '--'}
        </span>
        <span>Escala: {gridCols} × {gridRows} (1,5m / 5ft)</span>
      </div>
    </div>
  );
};
