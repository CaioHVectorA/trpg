import { describe, it, expect } from 'vitest';
import { evaluateCriticalOutcome, evaluateDiceExpression } from '@/lib/dice';

describe('Critical & Threat Mechanics (tests/unit/dice/critical.test.ts)', () => {
  it('should detect Natural 20 as automatic hit even against high defense', () => {
    const outcome = evaluateCriticalOutcome({
      rolls: [{ die: 20, result: 20 }],
      total: 22,
      modifiers: 2,
      targetDefense: 40,
      threatRange: 20
    });

    expect(outcome.isNatural20).toBe(true);
    expect(outcome.isHit).toBe(true);
    expect(outcome.isCriticalHit).toBe(true);
    expect(outcome.isFumble).toBe(false);
  });

  it('should detect Natural 1 as automatic failure even against low defense', () => {
    const outcome = evaluateCriticalOutcome({
      rolls: [{ die: 20, result: 1 }],
      total: 30,
      modifiers: 29,
      targetDefense: 10
    });

    expect(outcome.isNatural1).toBe(true);
    expect(outcome.isHit).toBe(false);
    expect(outcome.isFumble).toBe(true);
    expect(outcome.isCriticalHit).toBe(false);
  });

  it('should trigger critical on configurable threat margins (19-20, 18-20)', () => {
    const resThreat19 = evaluateDiceExpression({
      formula: '1d20+6',
      threatRange: 19,
      targetDefense: 20
    }, [19]); // 19 + 6 = 25 >= 20
    expect(resThreat19.isCriticalHit).toBe(true);

    const resThreat18 = evaluateDiceExpression({
      formula: '1d20+6',
      threatRange: 18,
      targetDefense: 20
    }, [18]); // 18 + 6 = 24 >= 20
    expect(resThreat18.isCriticalHit).toBe(true);

    const resBelowThreat = evaluateDiceExpression({
      formula: '1d20+6',
      threatRange: 19,
      targetDefense: 20
    }, [18]); // 18 is not >= 19
    expect(resBelowThreat.isCriticalHit).toBe(false);
    expect(resBelowThreat.isHit).toBe(true);
  });

  it('should cancel critical if threat roll misses target defense', () => {
    const resMiss = evaluateDiceExpression({
      formula: '1d20+2',
      threatRange: 19,
      targetDefense: 25
    }, [19]); // 19 + 2 = 21 < 25
    expect(resMiss.isHit).toBe(false);
    expect(resMiss.isCriticalHit).toBe(false);
  });

  it('should multiply ONLY base dice in T20 critical damage', () => {
    // Espada Longa 1d8+4 with x2 crit
    const res = evaluateDiceExpression({
      formula: '1d8+4',
      system: 'T20',
      critMultiplier: 2,
      threatRange: 20
    }, [7]); // roll 7

    expect(res.damageResult).toBeDefined();
    // T20: dice rolled (7) * 2 + 4 = 18
    expect(res.damageResult?.diceTotal).toBe(7);
    expect(res.damageResult?.staticBonus).toBe(4);
    expect(res.damageResult?.finalDamage).toBe(7 * 2 + 4);
    expect(res.damageResult?.formulaUsed).toContain('BaseDice * 2');
  });

  it('should multiply entire formula (dice + static bonus) in TRPG critical damage', () => {
    // TRPG 1d8+4 with x2 crit
    const res = evaluateDiceExpression({
      formula: '1d8+4',
      system: 'TRPG',
      critMultiplier: 2,
      threatRange: 20
    }, [7]); // (7 + 4) * 2 = 22

    expect(res.damageResult).toBeDefined();
    expect(res.damageResult?.finalDamage).toBe((7 + 4) * 2);
    expect(res.damageResult?.formulaUsed).toContain('* 2');
  });

  it('should calculate x3 and x4 multipliers accurately', () => {
    // x3
    const resX3 = evaluateDiceExpression({
      formula: '1d12+3',
      system: 'T20',
      critMultiplier: 3
    }, [8]);
    expect(resX3.damageResult?.finalDamage).toBe(8 * 3 + 3); // 27

    // x4
    const resX4 = evaluateDiceExpression({
      formula: '1d6+2',
      system: 'T20',
      critMultiplier: 4
    }, [5]);
    expect(resX4.damageResult?.finalDamage).toBe(5 * 4 + 2); // 22
  });
});
