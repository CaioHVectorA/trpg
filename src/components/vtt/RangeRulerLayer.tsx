'use client';

import React from 'react';
import { GridPosition, DistanceMeasurement } from '@/lib/types';
import { getRangeBandColor } from '@/lib/vtt/ruler';

interface RangeRulerLayerProps {
  rulerStart: GridPosition | null;
  rulerEnd: GridPosition | null;
  waypoints?: GridPosition[];
  cellSize: number;
  distanceInfo: DistanceMeasurement | null;
}

export const RangeRulerLayer: React.FC<RangeRulerLayerProps> = ({
  rulerStart,
  rulerEnd,
  waypoints = [],
  cellSize,
  distanceInfo,
}) => {
  if (!rulerStart || !rulerEnd) return null;

  const allPoints = [rulerStart, ...waypoints, rulerEnd];
  const bandColor = distanceInfo ? getRangeBandColor(distanceInfo.rangeBand) : '#F59E0B';

  const startPixel = {
    x: rulerStart.x * cellSize + cellSize / 2,
    y: rulerStart.y * cellSize + cellSize / 2,
  };

  const endPixel = {
    x: rulerEnd.x * cellSize + cellSize / 2,
    y: rulerEnd.y * cellSize + cellSize / 2,
  };

  // Midpoint for floating badge
  const midPixel = {
    x: (startPixel.x + endPixel.x) / 2,
    y: (startPixel.y + endPixel.y) / 2,
  };

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
      {/* Segment lines */}
      {allPoints.slice(0, -1).map((pt, i) => {
        const next = allPoints[i + 1];
        const x1 = pt.x * cellSize + cellSize / 2;
        const y1 = pt.y * cellSize + cellSize / 2;
        const x2 = next.x * cellSize + cellSize / 2;
        const y2 = next.y * cellSize + cellSize / 2;

        return (
          <g key={`ruler-seg-${i}`}>
            {/* Outline shadow line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#020617"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Main dashed measurement line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={bandColor}
              strokeWidth="3.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* Start anchor circle */}
      <circle
        cx={startPixel.x}
        cy={startPixel.y}
        r="7"
        fill="#EF4444"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <circle
        cx={startPixel.x}
        cy={startPixel.y}
        r="3"
        fill="#FFFFFF"
      />

      {/* Waypoint markers */}
      {waypoints.map((wp, i) => (
        <circle
          key={`wp-${i}`}
          cx={wp.x * cellSize + cellSize / 2}
          cy={wp.y * cellSize + cellSize / 2}
          r="5"
          fill="#F59E0B"
          stroke="#000000"
          strokeWidth="1.5"
        />
      ))}

      {/* Target anchor circle */}
      <circle
        cx={endPixel.x}
        cy={endPixel.y}
        r="7"
        fill="#10B981"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <circle
        cx={endPixel.x}
        cy={endPixel.y}
        r="3"
        fill="#FFFFFF"
      />

      {/* Distance and Range Band Floating Label */}
      {distanceInfo && (
        <g transform={`translate(${midPixel.x}, ${midPixel.y - 18})`}>
          <rect
            x="-70"
            y="-14"
            width="140"
            height="26"
            rx="6"
            fill="#090D16"
            stroke={bandColor}
            strokeWidth="1.5"
            opacity="0.95"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {distanceInfo.meters.toFixed(1)}m ({distanceInfo.cells}q) · {distanceInfo.rangeBand}
          </text>
        </g>
      )}
    </svg>
  );
};
