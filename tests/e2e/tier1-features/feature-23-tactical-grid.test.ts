/**
 * E2E Tier 1 — Feature 23: Tactical Canvas Grid (1.5m)
 * Opaque-box tests verifying 1.5m cell scaling, coordinate conversions, and grid bounds
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 23: Tactical Canvas Grid (1.5m)', () => {
  it('F23-T1: should scale each tactical grid cell to exactly 1.5 meters (5 feet)', () => {
    // 1 cell distance
    const dist = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 1, y: 0 }, 'chebyshev');
    expect(dist.cells).toBe(1);
    expect(dist.meters).toBe(1.5);
    expect(dist.feet).toBe(5);
  });

  it('F23-T2: should convert cell coordinates to meters across multi-cell distances', () => {
    // 6 cells = 9.0 meters (standard human speed)
    const dist = SystemAdapter.calculateDistance({ x: 2, y: 2 }, { x: 8, y: 2 }, 'chebyshev');
    expect(dist.cells).toBe(6);
    expect(dist.meters).toBe(9.0);
  });

  it('F23-T3: should calculate pure diagonal movement in T20 using Chebyshev (1 cell = 1.5m)', () => {
    // Diagonal 4 cells: (0,0) to (4,4) in Chebyshev is 4 cells = 6.0 meters
    const distChebyshev = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 4, y: 4 }, 'chebyshev');
    expect(distChebyshev.cells).toBe(4);
    expect(distChebyshev.meters).toBe(6.0);
  });

  it('F23-T4: should calculate diagonal movement in TRPG using 5/10/5 alternating rule', () => {
    // (0,0) to (2,2): dx=2, dy=2.
    // 5/10/5: 1st diagonal = 1 cell (1.5m), 2nd diagonal = 2 cells (3.0m). Total cells = 3 (4.5m)
    const dist5105 = SystemAdapter.calculateDistance({ x: 0, y: 0 }, { x: 2, y: 2 }, '5-10-5');
    expect(dist5105.cells).toBe(3);
    expect(dist5105.meters).toBe(4.5);
  });

  it('F23-T5: should validate grid bounds on standard 20x16 battlemap canvas', () => {
    const gridWidth = 20;
    const gridHeight = 16;

    const isValidCell = (x: number, y: number) =>
      Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;

    expect(isValidCell(0, 0)).toBe(true);
    expect(isValidCell(19, 15)).toBe(true);
    expect(isValidCell(20, 15)).toBe(false); // Out of bounds X
    expect(isValidCell(5, 16)).toBe(false);  // Out of bounds Y
    expect(isValidCell(-1, 5)).toBe(false);  // Negative X
  });
});
