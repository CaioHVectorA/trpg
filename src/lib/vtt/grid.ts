/**
 * Tactical VTT Grid Calculations & Transformations
 * Metric: 1 cell = 1.5 meters = 5 feet (Tormenta standard)
 */

import { GridPosition } from '@/lib/types';

export const METERS_PER_CELL = 1.5;
export const FEET_PER_CELL = 5.0;
export const DEFAULT_CELL_SIZE_PX = 48;

export interface ViewportTransform {
  pan: { x: number; y: number };
  zoom: number;
}

/**
 * Validates if coordinates lie within grid boundaries
 */
export function isValidGridCell(
  x: number,
  y: number,
  gridWidth: number,
  gridHeight: number
): boolean {
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    x < gridWidth &&
    y >= 0 &&
    y < gridHeight
  );
}

/**
 * Clamps coordinates within grid boundaries
 */
export function clampGridCell(
  x: number,
  y: number,
  gridWidth: number,
  gridHeight: number
): GridPosition {
  const clampedX = Math.max(0, Math.min(gridWidth - 1, Math.round(x)));
  const clampedY = Math.max(0, Math.min(gridHeight - 1, Math.round(y)));
  return { x: clampedX, y: clampedY };
}

/**
 * Snaps floating or screen coordinates directly to nearest integer grid cell
 */
export function snapToGrid(rawX: number, rawY: number): GridPosition {
  return {
    x: Math.round(rawX),
    y: Math.round(rawY),
  };
}

/**
 * Converts grid cell (x, y) to world pixels (top-left of cell)
 */
export function gridToWorld(
  pos: GridPosition,
  cellSize: number = DEFAULT_CELL_SIZE_PX
): { x: number; y: number } {
  return {
    x: pos.x * cellSize,
    y: pos.y * cellSize,
  };
}

/**
 * Converts grid cell (x, y) to world pixels (center of cell)
 */
export function gridToWorldCenter(
  pos: GridPosition,
  cellSize: number = DEFAULT_CELL_SIZE_PX
): { x: number; y: number } {
  return {
    x: pos.x * cellSize + cellSize / 2,
    y: pos.y * cellSize + cellSize / 2,
  };
}

/**
 * Converts world pixel coordinates to grid cell (using floor)
 */
export function worldToGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number = DEFAULT_CELL_SIZE_PX
): GridPosition {
  return {
    x: Math.floor(pixelX / cellSize),
    y: Math.floor(pixelY / cellSize),
  };
}

/**
 * Converts screen/pointer coordinates (relative to canvas container) to world pixels
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  pan: { x: number; y: number },
  zoom: number
): { x: number; y: number } {
  return {
    x: (screenX - pan.x) / zoom,
    y: (screenY - pan.y) / zoom,
  };
}

/**
 * Converts screen/pointer coordinates directly to snapped grid coordinates
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  pan: { x: number; y: number },
  zoom: number,
  cellSize: number = DEFAULT_CELL_SIZE_PX
): GridPosition {
  const world = screenToWorld(screenX, screenY, pan, zoom);
  return worldToGrid(world.x, world.y, cellSize);
}

/**
 * Converts cell distance into real-world Tormenta metric values
 */
export function cellsToMeters(cells: number): number {
  return cells * METERS_PER_CELL;
}

export function cellsToFeet(cells: number): number {
  return cells * FEET_PER_CELL;
}

export function metersToCells(meters: number): number {
  return meters / METERS_PER_CELL;
}
