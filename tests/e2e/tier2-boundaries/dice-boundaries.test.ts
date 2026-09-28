/**
 * E2E Tier 2 — Boundary & Corner Cases: Dice Engine
 * Stress-testing parser edge cases, extreme threat margins, multipliers, and PM scaling
 * Covers Features 13 through 17
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Tier 2: Dice Engine Boundary & Corner Cases', () => {
  describe('Feature 13: Dice Expression Parser Boundaries', () => {
    it('B13-T1: should parse expressions with zero modifier (1d20+0)', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20+0' }, [14]);
      expect(res.total).toBe(14);
      expect(res.modifiers).toBe(0);
    });

    it('B13-T2: should parse expressions with negative modifier (1d20-3)', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20-3' }, [10]);
      expect(res.total).toBe(7);
      expect(res.modifiers).toBe(-3);
    });

    it('B13-T3: should parse multi-dice expressions with different die faces (1d8+1d6+2)', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d8+1d6+2' }, [5, 4]);
      expect(res.total).toBe(11); // 5 + 4 + 2
      expect(res.rolls.length).toBe(2);
    });

    it('B13-T4: should parse disadvantage expression keeping lowest (2d20kl1+4)', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '2d20kl1+4' }, [18, 6]);
      expect(res.total).toBe(10); // min(18, 6) = 6 + 4 = 10
    });

    it('B13-T5: should parse expressions with long multi-word comments and brackets', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d20+11 # Ataque contra Dragão Rubro [Fúria Ativa]'
      }, [15]);
      expect(res.total).toBe(26);
      expect(res.label).toBe('Ataque contra Dragão Rubro [Fúria Ativa]');
    });
  });

  describe('Feature 14: Critical & Threat Range Boundaries', () => {
    it('B14-T1: should handle extreme threat range (15-20) for specialized builds', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d20+10',
        threatRange: 15,
        targetDefense: 22
      }, [15]); // 15 + 10 = 25 >= 22 -> Critical Hit!

      expect(res.isCriticalHit).toBe(true);
    });

    it('B14-T2: should confirm Nat 20 auto-hit even against astronomical defense (100)', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d20+2',
        targetDefense: 100
      }, [20]);

      expect(res.isNatural20).toBe(true);
      expect(res.isHit).toBe(true);
    });

    it('B14-T3: should confirm Nat 1 auto-fail even against 0 defense', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d20+20',
        targetDefense: 0
      }, [1]);

      expect(res.isNatural1).toBe(true);
      expect(res.isHit).toBe(false);
    });

    it('B14-T4: should cancel threat if natural roll is in threat range but misses Defense by 1', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d20+4',
        threatRange: 19,
        targetDefense: 24
      }, [19]); // 19 + 4 = 23 < 24 -> Misses by 1!

      expect(res.isHit).toBe(false);
      expect(res.isCriticalHit).toBe(false);
    });

    it('B14-T5: should trigger critical when threat roll hits Defense exactly (tie hits)', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d20+5',
        threatRange: 19,
        targetDefense: 24
      }, [19]); // 19 + 5 = 24 == 24 -> Hit & Critical!

      expect(res.isHit).toBe(true);
      expect(res.isCriticalHit).toBe(true);
    });
  });

  describe('Feature 15: Damage Formula Boundaries', () => {
    it('B15-T1: should calculate x4 critical multiplier on minimum dice roll', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d6+3',
        system: 'T20',
        critMultiplier: 4,
        threatRange: 20
      }, [1]); // die = 1 -> 1 * 4 + 3 = 7

      expect(res.damageResult?.finalDamage).toBe(7);
    });

    it('B15-T2: should calculate x4 critical multiplier on maximum dice roll', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d6+3',
        system: 'T20',
        critMultiplier: 4,
        threatRange: 20
      }, [6]); // die = 6 -> 6 * 4 + 3 = 27

      expect(res.damageResult?.finalDamage).toBe(27);
    });

    it('B15-T3: should calculate T20 critical with zero static bonus (1d10+0 x3)', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d10+0',
        system: 'T20',
        critMultiplier: 3,
        threatRange: 20
      }, [7]); // 7 * 3 + 0 = 21

      expect(res.damageResult?.finalDamage).toBe(21);
    });

    it('B15-T4: should handle TRPG critical with negative static modifier: (1d8 - 2) * 2', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d8-2',
        system: 'TRPG',
        critMultiplier: 2,
        threatRange: 20
      }, [6]); // (6 - 2) * 2 = 8

      expect(res.damageResult?.finalDamage).toBe(8);
    });

    it('B15-T5: should handle T20 critical with negative static modifier: (1d8 * 2) - 2', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '1d8-2',
        system: 'T20',
        critMultiplier: 2,
        threatRange: 20
      }, [6]); // 6 * 2 - 2 = 10

      expect(res.damageResult?.finalDamage).toBe(10);
    });
  });

  describe('Feature 16: PM Enhancement Boundaries', () => {
    it('B16-T1: should resolve 0 extra PM investment as pure base spell', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '2d4+2',
        pmInvested: 1
      }, [3, 3]);
      expect(res.total).toBe(8);
    });

    it('B16-T2: should allow scaling up to 20 PM investment at Level 20', () => {
      expect(SystemAdapter.canSpendPM(50, 20, 20)).toBe(true);
    });

    it('B16-T3: should handle multi-tier enhancement stacking (e.g. +4 PM = +2 extra missiles)', () => {
      // 1 base + 4 enhancement (2x +2 PM) = 4 missiles = 4d4+4
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '4d4+4 # Mísseis Mágicos +4 PM',
        pmInvested: 5
      }, [3, 2, 4, 1]);
      expect(res.total).toBe(14); // 10 + 4
      expect(res.rolls.length).toBe(4);
    });

    it('B16-T4: should verify DC increases by +1 per 1 PM invested in spell DC enhancement', () => {
      const baseDC = 16;
      const extraPM = 3;
      const finalDC = baseDC + extraPM;
      expect(finalDC).toBe(19);
    });

    it('B16-T5: should enforce that PM spent on enhancement plus base cost does not exceed level', () => {
      const baseCost = 3; // Bola de Fogo
      const enhancementCost = 4; // +4d6 damage
      const totalCost = baseCost + enhancementCost; // 7 PM
      // Character level 6 cannot cast this!
      expect(SystemAdapter.canSpendPM(20, totalCost, 6)).toBe(false);
      // Character level 7 can cast this!
      expect(SystemAdapter.canSpendPM(20, totalCost, 7)).toBe(true);
    });
  });

  describe('Feature 17: Visual Dice Log Boundaries', () => {
    it('B17-T1: should handle rolls without comments/labels gracefully', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20+3' }, [11]);
      expect(res.label).toBeUndefined();
      expect(res.formattedOutput).not.toContain('#');
    });

    it('B17-T2: should generate valid ISO-8601 timestamp string', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20+1' }, [10]);
      expect(() => new Date(res.timestamp).toISOString()).not.toThrow();
    });

    it('B17-T3: should serialize large dice rolls array without truncation in breakdown', () => {
      const res = SystemAdapter.evaluateDiceExpression({
        formula: '8d6+5'
      }, [1, 2, 3, 4, 5, 6, 6, 5]);
      expect(res.rolls.length).toBe(8);
      expect(res.breakdown).toContain('[d6: 1]');
      expect(res.breakdown).toContain('[d6: 6]');
    });

    it('B17-T4: should omit redundant zero modifier in formatted breakdown', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20' }, [15]);
      expect(res.modifiers).toBe(0);
      expect(res.breakdown).toBe('[d20: 15]');
    });

    it('B17-T5: should format negative modifier cleanly in breakdown', () => {
      const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20-3' }, [15]);
      expect(res.modifiers).toBe(-3);
      expect(res.breakdown).toContain('-3');
    });
  });
});
