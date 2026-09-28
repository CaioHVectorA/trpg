/**
 * E2E Tier 1 — Feature 11: Encumbrance & Armor Penalty
 * Opaque-box tests verifying T20 slot encumbrance, overload penalties, and speed reductions
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 11: Encumbrance & Armor Penalty', () => {
  it('F11-T1: should calculate T20 carrying capacity as max(1, FOR) * 3 slots', () => {
    // FOR +3 -> 3 * 3 = 9 slots
    const encFor3 = SystemAdapter.calculateEncumbrance(3, 5);
    expect(encFor3.maxSlots).toBe(9);

    // FOR 0 -> max(1, 0) * 3 = 3 slots
    const encFor0 = SystemAdapter.calculateEncumbrance(0, 2);
    expect(encFor0.maxSlots).toBe(3);

    // FOR -2 -> max(1, -2) * 3 = 3 slots
    const encForNeg = SystemAdapter.calculateEncumbrance(-2, 1);
    expect(encForNeg.maxSlots).toBe(3);
  });

  it('F11-T2: should flag isOverloaded when inventory weight slots exceed maximum capacity', () => {
    // FOR +2 (max 6 slots) carrying 7 slots -> Overloaded!
    const encOver = SystemAdapter.calculateEncumbrance(2, 7);
    expect(encOver.isOverloaded).toBe(true);

    // Carrying 6 slots -> Not overloaded
    const encExact = SystemAdapter.calculateEncumbrance(2, 6);
    expect(encExact.isOverloaded).toBe(false);
  });

  it('F11-T3: should enforce an additional -2 armor penalty when overloaded', () => {
    const encOver = SystemAdapter.calculateEncumbrance(2, 8);
    expect(encOver.additionalArmorPenalty).toBe(2);

    const encNormal = SystemAdapter.calculateEncumbrance(2, 4);
    expect(encNormal.additionalArmorPenalty).toBe(0);
  });

  it('F11-T4: should enforce a 3-meter movement speed reduction when overloaded', () => {
    const encOver = SystemAdapter.calculateEncumbrance(2, 8);
    expect(encOver.speedReductionMeters).toBe(3);

    const encNormal = SystemAdapter.calculateEncumbrance(2, 4);
    expect(encNormal.speedReductionMeters).toBe(0);
  });

  it('F11-T5: should verify normal encumbrance preserves base statistics without penalties', () => {
    const enc = SystemAdapter.calculateEncumbrance(4, 10);
    expect(enc.maxSlots).toBe(12);
    expect(enc.isOverloaded).toBe(false);
    expect(enc.additionalArmorPenalty).toBe(0);
    expect(enc.speedReductionMeters).toBe(0);
  });
});
