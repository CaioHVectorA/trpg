import { describe, it, expect } from 'vitest';
import {
  getRangeBand,
  getRangeBandColor,
  calculateDistance,
  calculateMultiPointDistance,
} from '@/lib/vtt/ruler';

describe('VTT Dual-Metric Range Ruler', () => {
  describe('getRangeBand & colors', () => {
    it('should classify distances into Tormenta range bands', () => {
      expect(getRangeBand(0)).toBe('Toque');
      expect(getRangeBand(1.5)).toBe('Toque');
      expect(getRangeBand(1.6)).toBe('Curto');
      expect(getRangeBand(9.0)).toBe('Curto');
      expect(getRangeBand(9.1)).toBe('Médio');
      expect(getRangeBand(18.0)).toBe('Médio');
      expect(getRangeBand(18.1)).toBe('Longo');
      expect(getRangeBand(36.0)).toBe('Longo');
      expect(getRangeBand(36.1)).toBe('Extremo');
      expect(getRangeBand(100)).toBe('Extremo');
    });

    it('should provide distinct hex colors for each range band', () => {
      expect(getRangeBandColor('Toque')).toBe('#06B6D4');
      expect(getRangeBandColor('Curto')).toBe('#10B981');
      expect(getRangeBandColor('Médio')).toBe('#F59E0B');
      expect(getRangeBandColor('Longo')).toBe('#F97316');
      expect(getRangeBandColor('Extremo')).toBe('#EF4444');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate Chebyshev distance (T20: diagonals count as 1 cell / 1.5m)', () => {
      // (1, 1) to (4, 4): dx=3, dy=3 -> max(3, 3) = 3 cells = 4.5m
      const dist = calculateDistance({ x: 1, y: 1 }, { x: 4, y: 4 }, 'chebyshev');
      expect(dist.cells).toBe(3);
      expect(dist.meters).toBe(4.5);
      expect(dist.feet).toBe(15);
      expect(dist.rangeBand).toBe('Curto');
    });

    it('should calculate 5/10/5 distance (TRPG classic)', () => {
      // (0, 0) to (3, 3): dx=3, dy=3.
      // 1st diag = 1q, 2nd diag = 2q, 3rd diag = 1q -> 4q = 6.0m
      const dist = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 3 }, '5-10-5');
      expect(dist.cells).toBe(4);
      expect(dist.meters).toBe(6.0);
    });

    it('should calculate Euclidean distance for blast areas', () => {
      // dx=3, dy=4 -> 5 cells = 7.5m
      const dist = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 }, 'euclidean');
      expect(dist.cells).toBe(5);
      expect(dist.meters).toBe(7.5);
    });

    it('should handle zero distance when points are identical', () => {
      const dist = calculateDistance({ x: 5, y: 5 }, { x: 5, y: 5 });
      expect(dist.cells).toBe(0);
      expect(dist.meters).toBe(0);
      expect(dist.rangeBand).toBe('Toque');
    });
  });

  describe('calculateMultiPointDistance (Waypoints)', () => {
    it('should accumulate distance across waypoints', () => {
      // (0, 0) -> (0, 4) -> (3, 4)
      // Leg 1: 4 cells. Leg 2: 3 cells. Total = 7 cells = 10.5m -> Médio
      const points = [
        { x: 0, y: 0 },
        { x: 0, y: 4 },
        { x: 3, y: 4 },
      ];

      const res = calculateMultiPointDistance(points, 'chebyshev');
      expect(res.cells).toBe(7);
      expect(res.meters).toBe(10.5);
      expect(res.rangeBand).toBe('Médio');
      expect(res.segments.length).toBe(2);
      expect(res.segments[0].cells).toBe(4);
      expect(res.segments[1].cells).toBe(3);
    });

    it('should handle less than 2 points gracefully', () => {
      const emptyRes = calculateMultiPointDistance([]);
      expect(emptyRes.cells).toBe(0);

      const singleRes = calculateMultiPointDistance([{ x: 2, y: 2 }]);
      expect(singleRes.cells).toBe(0);
    });
  });
});
