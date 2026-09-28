/**
 * E2E Tier 1 — Feature 15: Damage Formula Resolution
 * Opaque-box tests verifying T20 critical dice multiplication (base dice only) vs TRPG flat multiplication
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 15: Damage Formula Resolution', () => {
  it('F15-T1: should multiply only weapon base dice in T20 while keeping static bonuses single', () => {
    // Espada Longa 1d8+4 with x2 crit on Nat 20
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d8+4',
      system: 'T20',
      critMultiplier: 2,
      threatRange: 20
    }, [8]); // Nat max roll

    expect(res.damageResult).toBeDefined();
    // In T20: dice rolled (8) is multiplied by 2 -> 16 + 4 (static) = 20
    expect(res.damageResult?.diceTotal).toBe(8);
    expect(res.damageResult?.staticBonus).toBe(4);
    expect(res.damageResult?.finalDamage).toBe(8 * 2 + 4); // 20
  });

  it('F15-T2: should correctly double multi-dice weapons in T20 (e.g. 2d6 becomes 4d6)', () => {
    // Espada Grande 2d6+3 on critical
    // When evaluating 2d6+3 with multiplier 2: base dice total multiplied by 2 + 3
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '2d6+3',
      system: 'T20',
      critMultiplier: 2,
      threatRange: 20
    }, [4, 5]); // total dice = 9

    expect(res.damageResult?.diceTotal).toBe(9);
    expect(res.damageResult?.staticBonus).toBe(3);
    expect(res.damageResult?.finalDamage).toBe(9 * 2 + 3); // 21
  });

  it('F15-T3: should multiply entire formula including static bonuses in TRPG', () => {
    // TRPG classic critical: (1d8 + 4) * 2 = 2d8 + 8
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d8+4',
      system: 'TRPG',
      critMultiplier: 2,
      threatRange: 20
    }, [6]); // total = 10 -> critical = 20

    expect(res.damageResult?.finalDamage).toBe(20);
    expect(res.damageResult?.formulaUsed).toContain('* 2');
  });

  it('F15-T4: should handle x3 and x4 multipliers accurately across weapon types', () => {
    // Machado de Guerra (x3): 1d12+5 with die roll 10
    const resX3 = SystemAdapter.evaluateDiceExpression({
      formula: '1d12+5',
      system: 'T20',
      critMultiplier: 3,
      threatRange: 20
    }, [10]);
    expect(resX3.damageResult?.finalDamage).toBe(10 * 3 + 5); // 35

    // Foice (x4): 1d6+2 with die roll 5
    const resX4 = SystemAdapter.evaluateDiceExpression({
      formula: '1d6+2',
      system: 'T20',
      critMultiplier: 4,
      threatRange: 20
    }, [5]);
    expect(resX4.damageResult?.finalDamage).toBe(5 * 4 + 2); // 22
  });

  it('F15-T5: should not apply critical multiplier on normal non-critical hits', () => {
    const resNormal = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+4',
      system: 'T20',
      critMultiplier: 2,
      threatRange: 20,
      targetDefense: 10
    }, [15]); // Roll 15 (not nat 20), total 19 >= 10 -> normal hit!

    expect(resNormal.isHit).toBe(true);
    expect(resNormal.isCriticalHit).toBe(false);
    expect(resNormal.damageResult).toBeUndefined();
    expect(resNormal.total).toBe(19);
  });
});
