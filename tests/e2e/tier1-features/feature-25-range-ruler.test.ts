/**
 * E2E Tier 1 — Feature 25: Dual-Metric Range Ruler
 * Opaque-box tests verifying Chebyshev (T20) & 5/10/5 (TRPG) metrics and Tormenta range bands
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 25: Dual-Metric Range Ruler', () => {
  it('F25-T1: should categorize distances into official Tormenta range bands', () => {
    // 1 cell = 1.5m -> Toque
    const toque = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(toque.rangeBand).toBe('Toque');

    // 5 cells = 7.5m -> Curto (<= 9m)
    const curto = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 5, y: 0 });
    expect(curto.rangeBand).toBe('Curto');

    // 10 cells = 15m -> Médio (<= 18m)
    const medio = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 10, y: 0 });
    expect(medio.rangeBand).toBe('Médio');

    // 20 cells = 30m -> Longo (<= 36m)
    const longo = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 20, y: 0 });
    expect(longo.rangeBand).toBe('Longo');

    // 30 cells = 45m -> Extremo (> 36m)
    const extremo = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 30, y: 0 });
    expect(extremo.rangeBand).toBe('Extremo');
  });

  it('F25-T2: should calculate Chebyshev distance (T20) for diagonal and orthogonal movements', () => {
    // (2, 3) to (7, 6): dx = 5, dy = 3 -> Chebyshev cells = max(5, 3) = 5 cells = 7.5m
    const res = SystemAdapter.calculateDistance({ x: 2, y: 3 }, { x: 7, y: 6 }, 'chebyshev');
    expect(res.cells).toBe(5);
    expect(res.meters).toBe(7.5);
  });

  it('F25-T3: should calculate 5/10/5 distance (TRPG) with diagonal penalty', () => {
    // (0, 0) to (3, 3): dx = 3, dy = 3.
    // 5/10/5 formula: max(3, 3) + floor(min(3, 3) / 2) = 3 + 1 = 4 cells = 6.0m
    const res = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 3, y: 3 }, '5-10-5');
    expect(res.cells).toBe(4);
    expect(res.meters).toBe(6.0);
  });

  it('F25-T4: should measure adjacent orthogonal tokens as exactly 1.5m melee range (Toque)', () => {
    const res = SystemAdapter.calculateDistance({ x: 4, y: 5 }, { x: 5, y: 5 });
    expect(res.cells).toBe(1);
    expect(res.meters).toBe(1.5);
    expect(res.rangeBand).toBe('Toque');
  });

  it('F25-T5: should evaluate Euclidean distance for spherical blast areas (e.g. Bola de Fogo 6m radius)', () => {
    // Center at (10, 10). Target at (13, 14): dx=3, dy=4 -> sqrt(3^2 + 4^2) = 5 cells = 7.5m
    const targetOutside = SystemAdapter.calculateDistance({ x: 10, y: 10 }, { x: 13, y: 14 }, 'euclidean');
    expect(targetOutside.cells).toBe(5);
    expect(targetOutside.meters).toBe(7.5);
    expect(targetOutside.meters <= 6.0).toBe(false); // Outside 6m sphere!

    // Target at (12, 12): dx=2, dy=2 -> sqrt(8) = 2.828 cells = 4.24m <= 6.0m -> Inside sphere!
    const targetInside = SystemAdapter.calculateDistance({ x: 10, y: 10 }, { x: 12, y: 12 }, 'euclidean');
    expect(targetInside.meters).toBeLessThan(6.0);
  });
});
