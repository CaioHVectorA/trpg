/**
 * E2E Tier 1 — Feature 8: T20 PM Expenditure Limit
 * Opaque-box tests verifying strict enforcement of the PM spending limit (PM limit = character level)
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 8: T20 PM Expenditure Limit', () => {
  it('F8-T1: should reject PM expenditure exceeding character level at level 1', () => {
    // 1st-level character attempting to spend 2 PM on an ability
    const allowed = SystemAdapter.canSpendPM(10, 2, 1);
    expect(allowed).toBe(false);
  });

  it('F8-T2: should allow PM expenditure up to character level when sufficient PM exists', () => {
    // 5th-level character with 20 PM spending 5 PM
    const allowed5 = SystemAdapter.canSpendPM(20, 5, 5);
    expect(allowed5).toBe(true);

    // 5th-level character attempting 6 PM
    const allowed6 = SystemAdapter.canSpendPM(20, 6, 5);
    expect(allowed6).toBe(false);
  });

  it('F8-T3: should reject PM expenditure if cost exceeds current available PM', () => {
    // 10th-level character with only 3 PM left attempting to spend 4 PM
    const allowed = SystemAdapter.canSpendPM(3, 4, 10);
    expect(allowed).toBe(false);
  });

  it('F8-T4: should reject negative PM expenditure attempts', () => {
    const allowed = SystemAdapter.canSpendPM(10, -2, 5);
    expect(allowed).toBe(false);
  });

  it('F8-T5: should allow exact boundary expenditure (cost == level == currentPM)', () => {
    // Character level 4 with exactly 4 PM spending 4 PM
    const allowed = SystemAdapter.canSpendPM(4, 4, 4);
    expect(allowed).toBe(true);

    // Spending 0 PM is always valid
    const allowedZero = SystemAdapter.canSpendPM(4, 0, 4);
    expect(allowedZero).toBe(true);
  });
});
