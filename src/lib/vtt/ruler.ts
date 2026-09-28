/**
 * Tactical Dual-Metric Range Ruler & Distance Engine
 * Supported Metrics:
 * - Chebyshev (T20): diagonals cost 1.5m (same as orthogonal)
 * - 5/10/5 (TRPG Classic): 1st diagonal 1.5m, 2nd diagonal 3.0m, etc.
 * - Euclidean: direct straight-line distance for blast spheres (e.g. Bola de Fogo)
 *
 * Tormenta Range Bands:
 * - Toque: <= 1.5m (1 square)
 * - Curto: <= 9.0m (6 squares)
 * - Médio: <= 18.0m (12 squares)
 * - Longo: <= 36.0m (24 squares)
 * - Extremo: > 36.0m
 */

import { GridPosition, DistanceMeasurement, RangeBand } from '@/lib/types';
import { METERS_PER_CELL, FEET_PER_CELL } from './grid';

export type DistanceMetric = 'chebyshev' | '5-10-5' | 'euclidean';

export const RANGE_BAND_THRESHOLDS = {
  TOQUE: 1.5,
  CURTO: 9.0,
  MEDIO: 18.0,
  LONGO: 36.0,
} as const;

export const RANGE_BAND_COLORS: Record<RangeBand, string> = {
  Toque: '#06B6D4',   // Cyan
  Curto: '#10B981',   // Emerald Green
  Médio: '#F59E0B',   // Amber Yellow
  Longo: '#F97316',   // Orange
  Extremo: '#EF4444', // Red
};

/**
 * Classifies a distance in meters into the Tormenta range band
 */
export function getRangeBand(meters: number): RangeBand {
  if (meters <= RANGE_BAND_THRESHOLDS.TOQUE) return 'Toque';
  if (meters <= RANGE_BAND_THRESHOLDS.CURTO) return 'Curto';
  if (meters <= RANGE_BAND_THRESHOLDS.MEDIO) return 'Médio';
  if (meters <= RANGE_BAND_THRESHOLDS.LONGO) return 'Longo';
  return 'Extremo';
}

/**
 * Returns hexadecimal color code for range band
 */
export function getRangeBandColor(band: RangeBand): string {
  return RANGE_BAND_COLORS[band] || '#F59E0B';
}

/**
 * Calculates distance between two grid cells
 */
export function calculateDistance(
  p1: GridPosition,
  p2: GridPosition,
  metric: DistanceMetric = 'chebyshev'
): DistanceMeasurement {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);

  let cells = 0;
  if (metric === 'chebyshev') {
    cells = Math.max(dx, dy);
  } else if (metric === '5-10-5') {
    cells = Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2);
  } else {
    cells = Math.sqrt(dx * dx + dy * dy);
  }

  const meters = cells * METERS_PER_CELL;
  const feet = cells * FEET_PER_CELL;
  const rangeBand = getRangeBand(meters);

  return { cells, meters, feet, rangeBand };
}

/**
 * Calculates distance across an ordered series of waypoints
 */
export function calculateMultiPointDistance(
  points: GridPosition[],
  metric: DistanceMetric = 'chebyshev'
): DistanceMeasurement & { segments: DistanceMeasurement[] } {
  if (points.length < 2) {
    return {
      cells: 0,
      meters: 0,
      feet: 0,
      rangeBand: 'Toque',
      segments: [],
    };
  }

  const segments: DistanceMeasurement[] = [];
  let totalCells = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const seg = calculateDistance(points[i], points[i + 1], metric);
    segments.push(seg);
    totalCells += seg.cells;
  }

  const meters = totalCells * METERS_PER_CELL;
  const feet = totalCells * FEET_PER_CELL;
  const rangeBand = getRangeBand(meters);

  return {
    cells: totalCells,
    meters,
    feet,
    rangeBand,
    segments,
  };
}
