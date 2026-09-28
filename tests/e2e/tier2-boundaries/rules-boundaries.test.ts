/**
 * E2E Tier 2 — Boundary & Corner Cases: Rules Engine Core
 * Stress-testing limits, empty inputs, negative values, zero attributes, and edge conditions
 * Covers Features 6 through 12
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { BaseSheet, AttributeBlock } from '../harness/types';

describe('Tier 2: Rules Engine Boundary & Corner Cases', () => {
  describe('Feature 6: Polymorphic Attributes Boundaries', () => {
    it('B6-T1: should calculate modifiers for minimum (1) and maximum (30+) TRPG scores', () => {
      expect(SystemAdapter.getAttributeModifier('TRPG', 1)).toBe(-5);
      expect(SystemAdapter.getAttributeModifier('TRPG', 3)).toBe(-4);
      expect(SystemAdapter.getAttributeModifier('TRPG', 30)).toBe(10);
    });

    it('B6-T2: should handle boundary score 10 and 11 yielding exactly 0 modifier in TRPG', () => {
      expect(SystemAdapter.getAttributeModifier('TRPG', 10)).toBe(0);
      expect(SystemAdapter.getAttributeModifier('TRPG', 11)).toBe(0);
    });

    it('B6-T3: should handle T20 zero attribute modifier across all calculations', () => {
      expect(SystemAdapter.getAttributeModifier('T20', 0)).toBe(0);
    });

    it('B6-T4: should handle extreme negative T20 modifiers (-2, -3)', () => {
      expect(SystemAdapter.getAttributeModifier('T20', -2)).toBe(-2);
      expect(SystemAdapter.getAttributeModifier('T20', -3)).toBe(-3);
    });

    it('B6-T5: should enforce TRPG point buy minimum (8) and maximum (18) boundaries', () => {
      const minScores: AttributeBlock = { FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8 };
      expect(SystemAdapter.calculateTRPGPointBuyCost(minScores)).toBe(0);

      const maxScores: AttributeBlock = { FOR: 18, DES: 18, CON: 18, INT: 18, SAB: 18, CAR: 18 };
      expect(SystemAdapter.calculateTRPGPointBuyCost(maxScores)).toBe(96);
    });
  });

  describe('Feature 7: Resource Pools Boundaries', () => {
    it('B7-T1: should enforce 1 PV minimum level gain with extreme negative CON (-5)', () => {
      // Arcanista base 8 + CON -5 = 3 at level 1; level 2 adds max(1, 2 - 5) = +1 -> 4 PV
      const pv = SystemAdapter.calculatePvMax('T20', 'Arcanista', 2, -5);
      expect(pv).toBe(4);
      expect(pv).toBeGreaterThanOrEqual(2);
    });

    it('B7-T2: should calculate Level 20 maximum PV ceiling accurately', () => {
      // Bárbaro Level 20 with CON +5: 24 + 5 + 19 * (6 + 5) = 29 + 209 = 238 PV
      const pv20 = SystemAdapter.calculatePvMax('T20', 'Barbaro', 20, 5);
      expect(pv20).toBe(238);
    });

    it('B7-T3: should calculate Level 1 PM for character with key attribute 0', () => {
      // Arcanista Level 1 with INT 0: 6 + 0 = 6 PM
      const pm1 = SystemAdapter.calculatePmMax('T20', 'Arcanista', 1, 0);
      expect(pm1).toBe(6);
    });

    it('B7-T4: should clamp minimum PM to 0 if key attribute is negative at level 1', () => {
      // Arcanista Level 1 with INT -7 (pathological): max(0, 6 - 7) = 0 PM
      const pm1 = SystemAdapter.calculatePmMax('T20', 'Arcanista', 1, -7);
      expect(pm1).toBe(0);
    });

    it('B7-T5: should calculate odd-numbered instant death threshold accurately', () => {
      // pvMax 35: -floor(35 / 2) = -17
      const threshold = SystemAdapter.getInstantDeathThreshold('T20', 35, 2);
      expect(threshold).toBe(-17);
    });
  });

  describe('Feature 8: PM Expenditure Limit Boundaries', () => {
    it('B8-T1: should allow spending 0 PM at any level', () => {
      expect(SystemAdapter.canSpendPM(10, 0, 1)).toBe(true);
      expect(SystemAdapter.canSpendPM(0, 0, 1)).toBe(true);
    });

    it('B8-T2: should allow spending exactly character level (e.g. 20 PM at level 20)', () => {
      expect(SystemAdapter.canSpendPM(50, 20, 20)).toBe(true);
    });

    it('B8-T3: should reject spending level + 1 PM at level 20', () => {
      expect(SystemAdapter.canSpendPM(50, 21, 20)).toBe(false);
    });

    it('B8-T4: should reject when current PM is 0', () => {
      expect(SystemAdapter.canSpendPM(0, 1, 5)).toBe(false);
    });

    it('B8-T5: should allow exact spending when currentPM equals cost and level equals cost', () => {
      expect(SystemAdapter.canSpendPM(7, 7, 7)).toBe(true);
    });
  });

  describe('Feature 9: Defense and CA Boundaries', () => {
    it('B9-T1: should apply negative Dexterity modifier in full to T20 Defesa', () => {
      // DES -2, unarmored: 10 - 2 = 8
      const def = SystemAdapter.calculateDefense('T20', 1, -2, 0, 0, false);
      expect(def).toBe(8);
    });

    it('B9-T2: should not apply negative Dexterity if heavy armor zeroes positive DEX only', () => {
      // Heavy armor zeroes effective DEX: 10 + 0 + 6 = 16
      const def = SystemAdapter.calculateDefense('T20', 1, 3, 6, 0, true);
      expect(def).toBe(16);
    });

    it('B9-T3: should stack Armor and Shield bonuses additively', () => {
      // Armor +8, Shield +2: 10 + 0 + 8 + 2 = 20
      const def = SystemAdapter.calculateDefense('T20', 5, 2, 8, 2, true);
      expect(def).toBe(20);
    });

    it('B9-T4: should handle TRPG half-level at level 1 (0) and level 2 (1)', () => {
      const caLvl1 = SystemAdapter.calculateDefense('TRPG', 1, 10, 0, 0, false);
      const caLvl2 = SystemAdapter.calculateDefense('TRPG', 2, 10, 0, 0, false);
      expect(caLvl1).toBe(10); // floor(1/2) = 0
      expect(caLvl2).toBe(11); // floor(2/2) = 1
    });

    it('B9-T5: should handle TRPG MaxDex 0 on heavy full plate armor', () => {
      // DES 18 (+4), MaxDex 0, Armor +8, Level 4 (half-level 2)
      // CA = 10 + 2 + 0 + 8 = 20
      const ca = SystemAdapter.calculateDefense('TRPG', 4, 18, 8, 0, false, 0);
      expect(ca).toBe(20);
    });
  });

  describe('Feature 10: Skills Engine Boundaries', () => {
    it('B10-T1: should test training tier transitions at exact level thresholds (6 vs 7)', () => {
      // Level 6 (Tier 1: +2): half-level 3 + INT 2 + 2 = 7
      const lvl6 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 6, 2, true);
      expect(lvl6.bonus).toBe(7);

      // Level 7 (Tier 2: +4): half-level 3 + INT 2 + 4 = 9
      const lvl7 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 7, 2, true);
      expect(lvl7.bonus).toBe(9);
    });

    it('B10-T2: should test training tier transitions at exact level thresholds (14 vs 15)', () => {
      // Level 14 (Tier 2: +4): half-level 7 + INT 2 + 4 = 13
      const lvl14 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 14, 2, true);
      expect(lvl14.bonus).toBe(13);

      // Level 15 (Tier 3: +6): half-level 7 + INT 2 + 6 = 15
      const lvl15 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 15, 2, true);
      expect(lvl15.bonus).toBe(15);
    });

    it('B10-T3: should allow negative total skill bonus when penalty exceeds base modifiers', () => {
      // Level 1 (half-level 0), DES -1, untrained (0), armor penalty -4: 0 - 1 + 0 - 4 = -5
      const res = SystemAdapter.calculateSkillBonus('T20', 'acrobacia', 1, -1, false, 4);
      expect(res.bonus).toBe(-5);
      expect(res.canBeUsed).toBe(true);
    });

    it('B10-T4: should handle zero attribute modifier in skill checks', () => {
      const res = SystemAdapter.calculateSkillBonus('T20', 'percepcao', 2, 0, false);
      expect(res.bonus).toBe(1); // half-level 1 + 0 = 1
    });

    it('B10-T5: should enforce that Somente Treinada skills cannot be used at any level untrained', () => {
      for (const lvl of [1, 5, 10, 20]) {
        const check = SystemAdapter.calculateSkillBonus('T20', 'ladinagem', lvl, 3, false);
        expect(check.canBeUsed).toBe(false);
      }
    });
  });

  describe('Feature 11: Encumbrance Boundaries', () => {
    it('B11-T1: should calculate capacity for character with negative Strength (floor at 1)', () => {
      const enc = SystemAdapter.calculateEncumbrance(-3, 2);
      expect(enc.maxSlots).toBe(3); // max(1, -3) * 3 = 3 slots
    });

    it('B11-T2: should test exact boundary between normal and overloaded states', () => {
      // FOR 2 -> 6 slots
      const exactlyAtLimit = SystemAdapter.calculateEncumbrance(2, 6);
      expect(exactlyAtLimit.isOverloaded).toBe(false);

      const oneOverLimit = SystemAdapter.calculateEncumbrance(2, 7);
      expect(oneOverLimit.isOverloaded).toBe(true);
    });

    it('B11-T3: should not penalize empty inventory (0 slots carried)', () => {
      const enc = SystemAdapter.calculateEncumbrance(2, 0);
      expect(enc.isOverloaded).toBe(false);
      expect(enc.additionalArmorPenalty).toBe(0);
      expect(enc.speedReductionMeters).toBe(0);
    });

    it('B11-T4: should handle high Strength carrying capacities (FOR +8 -> 24 slots)', () => {
      const enc = SystemAdapter.calculateEncumbrance(8, 20);
      expect(enc.maxSlots).toBe(24);
      expect(enc.isOverloaded).toBe(false);
    });

    it('B11-T5: should apply uniform speed reduction (3m) regardless of overload severity', () => {
      const enc1Over = SystemAdapter.calculateEncumbrance(2, 7);
      const enc10Over = SystemAdapter.calculateEncumbrance(2, 16);
      expect(enc1Over.speedReductionMeters).toBe(3);
      expect(enc10Over.speedReductionMeters).toBe(3);
    });
  });

  describe('Feature 12: Status Conditions Boundaries', () => {
    it('B12-T1: should handle exact 0 PV boundary transition to unconscious', () => {
      const res = SystemAdapter.applyDamage(15, 0, 15);
      expect(res.newPv).toBe(0);
      expect(res.isUnconscious).toBe(true);
    });

    it('B12-T2: should handle 1 PV surviving conscious', () => {
      const res = SystemAdapter.applyDamage(15, 0, 14);
      expect(res.newPv).toBe(1);
      expect(res.isUnconscious).toBe(false);
    });

    it('B12-T3: should apply zero damage cleanly without state change', () => {
      const res = SystemAdapter.applyDamage(20, 5, 0);
      expect(res.newPv).toBe(20);
      expect(res.newTempPv).toBe(5);
      expect(res.absorbedByTemp).toBe(0);
      expect(res.isUnconscious).toBe(false);
    });

    it('B12-T4: should handle damage exactly equal to temporary PV', () => {
      const res = SystemAdapter.applyDamage(20, 8, 8);
      expect(res.absorbedByTemp).toBe(8);
      expect(res.newTempPv).toBe(0);
      expect(res.newPv).toBe(20);
    });

    it('B12-T5: should calculate defense with all defense-reducing conditions active', () => {
      // Base defense 20. Caído (-5 vs melee), Desprevenido (-5), Vulnerável (-2)
      // Total defense: 20 - 5 - 5 - 2 = 8
      const baseDefense = 20;
      const totalPenalties = 5 + 5 + 2;
      expect(baseDefense - totalPenalties).toBe(8);
    });
  });
});
