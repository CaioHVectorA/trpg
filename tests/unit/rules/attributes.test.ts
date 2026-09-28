/**
 * Unit Tests — Attributes Engine (Feature 6)
 * Testing T20 direct modifiers, TRPG 3-18 score conversions, point buy, and validation
 */

import { describe, it, expect } from 'vitest';
import {
  getAttributeModifier,
  calculateTRPGModifier,
  calculateT20PointBuyCost,
  calculateTRPGPointBuyCost,
  convertT20ModToTRPGScore,
  convertTRPGScoreToT20Mod,
  normalizeAttributeBlock,
  validateAttributes,
  STANDARD_ARRAYS,
  ATTRIBUTE_KEYS
} from '../../../src/lib/rules/attributes';

describe('Unit Tests: Attributes Engine (Feature 6)', () => {
  describe('Direct Modifiers vs Classic Score Conversions', () => {
    it('should return direct modifiers in T20 mode without modification', () => {
      expect(getAttributeModifier('T20', 4)).toBe(4);
      expect(getAttributeModifier('T20', 3)).toBe(3);
      expect(getAttributeModifier('T20', 1)).toBe(1);
      expect(getAttributeModifier('T20', 0)).toBe(0);
      expect(getAttributeModifier('T20', -1)).toBe(-1);
      expect(getAttributeModifier('T20', -3)).toBe(-3);
    });

    it('should compute TRPG modifiers using floor((score - 10) / 2)', () => {
      expect(calculateTRPGModifier(10)).toBe(0);
      expect(calculateTRPGModifier(11)).toBe(0);
      expect(calculateTRPGModifier(12)).toBe(1);
      expect(calculateTRPGModifier(13)).toBe(1);
      expect(calculateTRPGModifier(14)).toBe(2);
      expect(calculateTRPGModifier(18)).toBe(4);
      expect(calculateTRPGModifier(20)).toBe(5);
      expect(calculateTRPGModifier(30)).toBe(10);
      expect(calculateTRPGModifier(9)).toBe(-1);
      expect(calculateTRPGModifier(8)).toBe(-1);
      expect(calculateTRPGModifier(7)).toBe(-2);
      expect(calculateTRPGModifier(3)).toBe(-4);
      expect(calculateTRPGModifier(1)).toBe(-5);
    });

    it('should dispatch polymorphically through getAttributeModifier', () => {
      expect(getAttributeModifier('TRPG', 18)).toBe(4);
      expect(getAttributeModifier('TRPG', 10)).toBe(0);
      expect(getAttributeModifier('TRPG', 8)).toBe(-1);
    });
  });

  describe('Point Buy Calculations', () => {
    it('should calculate T20 point buy costs including refunds for -1', () => {
      const standardT20 = {
        FOR: 3, // 4
        DES: 2, // 2
        CON: 1, // 1
        INT: 1, // 1
        SAB: 0, // 0
        CAR: -1 // -1
      };
      expect(calculateT20PointBuyCost(standardT20)).toBe(7);

      const allZeroes = { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 };
      expect(calculateT20PointBuyCost(allZeroes)).toBe(0);

      const maxArray = { FOR: 4, DES: 2, CON: 1, INT: 0, SAB: 0, CAR: 0 };
      // 7 + 2 + 1 + 0 + 0 + 0 = 10 points
      expect(calculateT20PointBuyCost(maxArray)).toBe(10);
    });

    it('should throw an error on invalid T20 attribute value in point buy', () => {
      const invalidT20 = { FOR: 5, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 };
      expect(() => calculateT20PointBuyCost(invalidT20)).toThrow(/Invalid T20 attribute value 5/);

      const negativeTooLow = { FOR: -2, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 };
      expect(() => calculateT20PointBuyCost(negativeTooLow)).toThrow(/Invalid T20 attribute value -2/);
    });

    it('should calculate TRPG point buy costs starting from base 8', () => {
      const base8 = { FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8 };
      expect(calculateTRPGPointBuyCost(base8)).toBe(0);

      const standardTRPG = { FOR: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 };
      // 8 + 6 + 5 + 4 + 2 + 0 = 25 points
      expect(calculateTRPGPointBuyCost(standardTRPG)).toBe(25);

      const max18 = { FOR: 18, DES: 18, CON: 18, INT: 18, SAB: 18, CAR: 18 };
      // 16 * 6 = 96 points
      expect(calculateTRPGPointBuyCost(max18)).toBe(96);
    });

    it('should throw an error on invalid TRPG attribute score in point buy', () => {
      const tooLow = { FOR: 7, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 };
      expect(() => calculateTRPGPointBuyCost(tooLow)).toThrow(/Invalid TRPG attribute score 7/);

      const tooHigh = { FOR: 19, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 };
      expect(() => calculateTRPGPointBuyCost(tooHigh)).toThrow(/Invalid TRPG attribute score 19/);
    });
  });

  describe('Conversions & Utilities', () => {
    it('should convert T20 direct modifier to equivalent TRPG score and vice-versa', () => {
      expect(convertT20ModToTRPGScore(3)).toBe(16);
      expect(convertT20ModToTRPGScore(0)).toBe(10);
      expect(convertT20ModToTRPGScore(-1)).toBe(8);
      expect(convertT20ModToTRPGScore(4)).toBe(18);

      expect(convertTRPGScoreToT20Mod(16)).toBe(3);
      expect(convertTRPGScoreToT20Mod(17)).toBe(3);
      expect(convertTRPGScoreToT20Mod(10)).toBe(0);
      expect(convertTRPGScoreToT20Mod(8)).toBe(-1);
    });

    it('should normalize attribute block accepting both casing styles', () => {
      const lowercase = { for: 3, des: 2, con: 1, int: 0, sab: -1, car: 4 };
      const normalized = normalizeAttributeBlock(lowercase);
      expect(normalized.FOR).toBe(3);
      expect(normalized.DES).toBe(2);
      expect(normalized.CON).toBe(1);
      expect(normalized.INT).toBe(0);
      expect(normalized.SAB).toBe(-1);
      expect(normalized.CAR).toBe(4);
    });

    it('should validate attribute blocks correctly', () => {
      const validT20 = { FOR: 3, DES: 2, CON: 1, INT: 0, SAB: -1, CAR: 4 };
      expect(validateAttributes('T20', validT20).valid).toBe(true);

      const nonIntT20 = { FOR: 2.5, DES: 2, CON: 1, INT: 0, SAB: 0, CAR: 0 };
      const resNonInt = validateAttributes('T20', nonIntT20);
      expect(resNonInt.valid).toBe(false);
      expect(resNonInt.errors[0]).toContain('número inteiro');

      const validTRPG = { FOR: 16, DES: 14, CON: 12, INT: 10, SAB: 8, CAR: 18 };
      expect(validateAttributes('TRPG', validTRPG).valid).toBe(true);

      const invalidTRPG = { FOR: 0, DES: 14, CON: 12, INT: 10, SAB: 8, CAR: 18 };
      const resInvTRPG = validateAttributes('TRPG', invalidTRPG);
      expect(resInvTRPG.valid).toBe(false);
      expect(resInvTRPG.errors[0]).toContain('maior ou igual a 1');
    });

    it('should provide verified standard arrays for both systems', () => {
      expect(STANDARD_ARRAYS.T20).toEqual([3, 2, 1, 1, 0, -1]);
      expect(STANDARD_ARRAYS.TRPG).toEqual([15, 14, 13, 12, 10, 8]);
      expect(ATTRIBUTE_KEYS.length).toBe(6);
    });
  });
});
