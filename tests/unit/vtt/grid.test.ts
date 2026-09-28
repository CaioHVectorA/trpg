import { describe, it, expect } from 'vitest';
import {
  METERS_PER_CELL,
  FEET_PER_CELL,
  DEFAULT_CELL_SIZE_PX,
  isValidGridCell,
  clampGridCell,
  snapToGrid,
  gridToWorld,
  gridToWorldCenter,
  worldToGrid,
  screenToWorld,
  screenToGrid,
  cellsToMeters,
  cellsToFeet,
  metersToCells,
} from '@/lib/vtt/grid';

describe('VTT Grid Engine', () => {
  it('should verify standard Tormenta scaling constants', () => {
    expect(METERS_PER_CELL).toBe(1.5);
    expect(FEET_PER_CELL).toBe(5.0);
    expect(DEFAULT_CELL_SIZE_PX).toBe(48);
  });

  describe('isValidGridCell', () => {
    const W = 20;
    const H = 16;

    it('should return true for valid integer coordinates inside boundaries', () => {
      expect(isValidGridCell(0, 0, W, H)).toBe(true);
      expect(isValidGridCell(19, 15, W, H)).toBe(true);
      expect(isValidGridCell(10, 8, W, H)).toBe(true);
    });

    it('should return false for out-of-bounds coordinates', () => {
      expect(isValidGridCell(20, 15, W, H)).toBe(false);
      expect(isValidGridCell(19, 16, W, H)).toBe(false);
      expect(isValidGridCell(-1, 5, W, H)).toBe(false);
      expect(isValidGridCell(5, -1, W, H)).toBe(false);
    });

    it('should return false for non-integer coordinates', () => {
      expect(isValidGridCell(4.5, 6, W, H)).toBe(false);
      expect(isValidGridCell(4, 6.2, W, H)).toBe(false);
    });
  });

  describe('clampGridCell', () => {
    it('should clamp coordinates within grid boundaries', () => {
      expect(clampGridCell(-5, 10, 20, 16)).toEqual({ x: 0, y: 10 });
      expect(clampGridCell(25, 20, 20, 16)).toEqual({ x: 19, y: 15 });
      expect(clampGridCell(5.2, 7.8, 20, 16)).toEqual({ x: 5, y: 8 });
    });
  });

  describe('snapToGrid', () => {
    it('should snap float coordinates to nearest integer cell', () => {
      expect(snapToGrid(4.2, 7.8)).toEqual({ x: 4, y: 8 });
      expect(snapToGrid(0.49, 0.51)).toEqual({ x: 0, y: 1 });
      expect(snapToGrid(12.0, 3.0)).toEqual({ x: 12, y: 3 });
    });
  });

  describe('Coordinate conversions', () => {
    const cellSize = 50;

    it('should convert grid cells to world pixel coordinates', () => {
      expect(gridToWorld({ x: 2, y: 3 }, cellSize)).toEqual({ x: 100, y: 150 });
      expect(gridToWorldCenter({ x: 2, y: 3 }, cellSize)).toEqual({ x: 125, y: 175 });
    });

    it('should convert world pixel coordinates to grid cells', () => {
      expect(worldToGrid(110, 165, cellSize)).toEqual({ x: 2, y: 3 });
      expect(worldToGrid(0, 0, cellSize)).toEqual({ x: 0, y: 0 });
      expect(worldToGrid(49.9, 49.9, cellSize)).toEqual({ x: 0, y: 0 });
      expect(worldToGrid(50, 50, cellSize)).toEqual({ x: 1, y: 1 });
    });

    it('should convert screen coordinates with pan and zoom to world coordinates', () => {
      const pan = { x: 50, y: 100 };
      const zoom = 2.0;

      // screen = world * zoom + pan -> world = (screen - pan) / zoom
      // screen = (250, 300) -> world = (250 - 50)/2 = 100, (300 - 100)/2 = 100
      expect(screenToWorld(250, 300, pan, zoom)).toEqual({ x: 100, y: 100 });
    });

    it('should convert screen coordinates directly to snapped grid cells', () => {
      const pan = { x: 0, y: 0 };
      const zoom = 1.0;
      // world (110, 160) / 50 -> grid (2, 3)
      expect(screenToGrid(110, 160, pan, zoom, cellSize)).toEqual({ x: 2, y: 3 });
    });
  });

  describe('Metric unit helpers', () => {
    it('should convert between cells, meters, and feet accurately', () => {
      expect(cellsToMeters(1)).toBe(1.5);
      expect(cellsToMeters(6)).toBe(9.0);
      expect(cellsToFeet(1)).toBe(5.0);
      expect(cellsToFeet(6)).toBe(30.0);
      expect(metersToCells(9.0)).toBe(6);
      expect(metersToCells(1.5)).toBe(1);
    });
  });
});
