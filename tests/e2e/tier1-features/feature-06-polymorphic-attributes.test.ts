/**
 * E2E Tier 1 — Feature 6: Polymorphic Attribute System
 * Opaque-box tests verifying T20 direct modifiers vs TRPG classic scores and point-buy conversions
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { AttributeBlock } from '../harness/types';

describe('Feature 6: Polymorphic Attribute System', () => {
  it('F6-T1: should treat T20 attributes as direct modifiers without score conversion', () => {
    expect(SystemAdapter.getAttributeModifier('T20', 3)).toBe(3);
    expect(SystemAdapter.getAttributeModifier('T20', 0)).toBe(0);
    expect(SystemAdapter.getAttributeModifier('T20', -1)).toBe(-1);
    expect(SystemAdapter.getAttributeModifier('T20', 4)).toBe(4);
  });

  it('F6-T2: should calculate TRPG attribute modifiers using classic floor((Score - 10) / 2)', () => {
    expect(SystemAdapter.getAttributeModifier('TRPG', 10)).toBe(0);
    expect(SystemAdapter.getAttributeModifier('TRPG', 11)).toBe(0);
    expect(SystemAdapter.getAttributeModifier('TRPG', 12)).toBe(1);
    expect(SystemAdapter.getAttributeModifier('TRPG', 18)).toBe(4);
    expect(SystemAdapter.getAttributeModifier('TRPG', 9)).toBe(-1);
    expect(SystemAdapter.getAttributeModifier('TRPG', 8)).toBe(-1);
    expect(SystemAdapter.getAttributeModifier('TRPG', 7)).toBe(-2);
  });

  it('F6-T3: should calculate T20 point-buy costs with refund for -1', () => {
    const standardBlock: AttributeBlock = {
      FOR: 3, // cost 4
      DES: 2, // cost 2
      CON: 1, // cost 1
      INT: 1, // cost 1
      SAB: 0, // cost 0
      CAR: -1 // cost -1 (refund)
    };
    // 4 + 2 + 1 + 1 + 0 - 1 = 7 points spent out of 10
    const cost = SystemAdapter.calculateT20PointBuyCost(standardBlock);
    expect(cost).toBe(7);
  });

  it('F6-T4: should calculate TRPG point-buy costs from base 8', () => {
    const scores: AttributeBlock = {
      FOR: 16, // cost 10
      DES: 14, // cost 6
      CON: 12, // cost 4
      INT: 10, // cost 2
      SAB: 8,  // cost 0
      CAR: 8   // cost 0
    };
    // 10 + 6 + 4 + 2 + 0 + 0 = 22 points
    const cost = SystemAdapter.calculateTRPGPointBuyCost(scores);
    expect(cost).toBe(22);
  });

  it('F6-T5: should handle dual-system racial adjustments accurately', () => {
    // Dwarf in T20: CON +2, SAB +1, DES -1 applied to modifiers
    const t20BaseCON = 1;
    const t20DwarfCON = t20BaseCON + 2;
    expect(SystemAdapter.getAttributeModifier('T20', t20DwarfCON)).toBe(3);

    // Dwarf in TRPG: CON +4, SAB +2, DES -2 applied to scores
    const trpgBaseCON = 14;
    const trpgDwarfCON = trpgBaseCON + 4; // 18
    expect(SystemAdapter.getAttributeModifier('TRPG', trpgDwarfCON)).toBe(4);
  });
});
