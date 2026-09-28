/**
 * Unit Tests — Defense & Armor Class Engine (Feature 9)
 * T20 Defesa (no half-level, heavy armor zeroes DEX) vs TRPG CA (half-level, MaxDex)
 */

import { describe, it, expect } from 'vitest';
import { calculateDefense, isAttackHit } from '../../../src/lib/rules/defense';

describe('Unit Tests: Defense & Armor Class Engine (Feature 9)', () => {
  describe('T20 Defesa Calculations', () => {
    it('should calculate T20 Defesa without half-level scaling for player characters', () => {
      // Level 1: 10 + DES 2 = 12
      expect(calculateDefense('T20', 1, 2)).toBe(12);

      // Level 10: 10 + DES 2 = 12 (DOES NOT add half-level 5!)
      expect(calculateDefense('T20', 10, 2)).toBe(12);

      // Level 20: 10 + DES 2 = 12
      expect(calculateDefense('T20', 20, 2)).toBe(12);
    });

    it('should lock Dexterity modifier to 0 (+0) when heavy armor is equipped', () => {
      // DES +3, Armadura Pesada +6: 10 + 0 + 6 = 16 (NOT 19)
      const defHeavy = calculateDefense('T20', 1, 3, 6, 0, true);
      expect(defHeavy).toBe(16);

      // DES +5, Armadura Pesada +8, Escudo +2: 10 + 0 + 8 + 2 = 20
      const defHeavyShield = calculateDefense('T20', 5, 5, 8, 2, true);
      expect(defHeavyShield).toBe(20);
    });

    it('should apply full Dexterity when unarmored or using light armor', () => {
      // Unarmored: DES +4 -> 10 + 4 = 14
      expect(calculateDefense('T20', 1, 4, 0, 0, false)).toBe(14);

      // Light Armor (Couro Batido +3): 10 + 4 + 3 = 17
      expect(calculateDefense('T20', 1, 4, 3, 0, false)).toBe(17);
    });

    it('should apply negative Dexterity modifier in full when unarmored or in light armor', () => {
      // DES -2: 10 - 2 = 8
      expect(calculateDefense('T20', 1, -2, 0, 0, false)).toBe(8);

      // DES -1 with light armor +2: 10 - 1 + 2 = 11
      expect(calculateDefense('T20', 1, -1, 2, 0, false)).toBe(11);
    });

    it('should stack armor, shield, and other bonuses additively', () => {
      // Armor +5, Shield +2, Other (e.g. Esquiva) +1, DES +2: 10 + 2 + 5 + 2 + 1 = 20
      expect(calculateDefense('T20', 3, 2, 5, 2, false, undefined, 1)).toBe(20);
    });
  });

  describe('TRPG Armor Class (CA) Calculations', () => {
    it('should add half-level progression in TRPG', () => {
      // Level 1: floor(1/2) = 0 -> 10 + 0 + DES 16 (+3) = 13
      expect(calculateDefense('TRPG', 1, 16)).toBe(13);

      // Level 2: floor(2/2) = 1 -> 10 + 1 + 3 = 14
      expect(calculateDefense('TRPG', 2, 16)).toBe(14);

      // Level 6: floor(6/2) = 3 -> 10 + 3 + 3 = 16
      expect(calculateDefense('TRPG', 6, 16)).toBe(16);

      // Level 20: floor(20/2) = 10 -> 10 + 10 + 3 = 23
      expect(calculateDefense('TRPG', 20, 16)).toBe(23);
    });

    it('should cap positive Dexterity at maxDexterity in TRPG', () => {
      // DES 18 (+4), maxDex +2, level 4 (half-level 2), armor +5
      // 10 + 2 (half-level) + 2 (capped DES) + 5 = 19
      expect(calculateDefense('TRPG', 4, 18, 5, 0, false, 2)).toBe(19);

      // DES 14 (+2), maxDex +2 (not exceeding)
      expect(calculateDefense('TRPG', 4, 14, 5, 0, false, 2)).toBe(19);

      // DES 12 (+1), maxDex +2 (lower than maxDex)
      expect(calculateDefense('TRPG', 4, 12, 5, 0, false, 2)).toBe(18);
    });

    it('should not cap negative Dexterity with maxDexterity in TRPG', () => {
      // DES 6 (-2), maxDex +2, level 4 (half-level 2), armor +5
      // Negative DES applies in full: 10 + 2 (half-level) - 2 (DES) + 5 = 15
      expect(calculateDefense('TRPG', 4, 6, 5, 0, false, 2)).toBe(15);
    });

    it('should include size modifier in TRPG CA', () => {
      // Level 1, DES 10 (0), Size Pequeno (+1): 10 + 0 + 0 + 0 + 0 + 1 = 11
      expect(calculateDefense('TRPG', 1, 10, 0, 0, false, undefined, 0, 1)).toBe(11);

      // Size Grande (-1): 10 - 1 = 9
      expect(calculateDefense('TRPG', 1, 10, 0, 0, false, undefined, 0, -1)).toBe(9);
    });
  });

  describe('Hit Determination (isAttackHit)', () => {
    it('should determine that an attack total meeting or exceeding Defense/CA is a hit (tie hits)', () => {
      expect(isAttackHit(18, 18)).toBe(true);
      expect(isAttackHit(19, 18)).toBe(true);
      expect(isAttackHit(25, 18)).toBe(true);
    });

    it('should determine that an attack total below Defense/CA is a miss', () => {
      expect(isAttackHit(17, 18)).toBe(false);
      expect(isAttackHit(10, 18)).toBe(false);
      expect(isAttackHit(0, 10)).toBe(false);
    });
  });
});
