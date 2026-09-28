/**
 * Unit Tests — Encumbrance & Armor Penalty Engine (Feature 11)
 * Testing T20 slot capacity, overload states, penalties, and TRPG load tiers
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEncumbrance,
  calculateTotalArmorPenalty,
  isSkillPenalizedByArmor,
  calculateTRPGEncumbrance
} from '../../../src/lib/rules/encumbrance';

describe('Unit Tests: Encumbrance & Armor Penalty Engine (Feature 11)', () => {
  describe('T20 Slot Capacity & Overload', () => {
    it('should calculate carrying capacity as max(1, FOR_mod) * 3 slots', () => {
      // FOR +3 -> 3 * 3 = 9 slots
      expect(calculateEncumbrance(3, 0).maxSlots).toBe(9);

      // FOR +1 -> 1 * 3 = 3 slots
      expect(calculateEncumbrance(1, 0).maxSlots).toBe(3);

      // FOR 0 -> max(1, 0) * 3 = 3 slots
      expect(calculateEncumbrance(0, 0).maxSlots).toBe(3);

      // Negative FOR (-1, -3) -> floored at 1 -> 3 slots
      expect(calculateEncumbrance(-1, 0).maxSlots).toBe(3);
      expect(calculateEncumbrance(-3, 0).maxSlots).toBe(3);

      // High Strength: FOR +8 -> 24 slots
      expect(calculateEncumbrance(8, 0).maxSlots).toBe(24);
    });

    it('should detect boundary conditions between normal and overloaded states', () => {
      // FOR +2 -> 6 slots
      const exactlyAtLimit = calculateEncumbrance(2, 6);
      expect(exactlyAtLimit.isOverloaded).toBe(false);
      expect(exactlyAtLimit.additionalArmorPenalty).toBe(0);
      expect(exactlyAtLimit.speedReductionMeters).toBe(0);

      const oneOverLimit = calculateEncumbrance(2, 7);
      expect(oneOverLimit.isOverloaded).toBe(true);
      expect(oneOverLimit.additionalArmorPenalty).toBe(2);
      expect(oneOverLimit.speedReductionMeters).toBe(3);

      const fiveUnderLimit = calculateEncumbrance(2, 1);
      expect(fiveUnderLimit.isOverloaded).toBe(false);
    });

    it('should apply uniform speed reduction (3m) regardless of overload amount', () => {
      const slightOverload = calculateEncumbrance(2, 7);
      const severeOverload = calculateEncumbrance(2, 20);
      expect(slightOverload.speedReductionMeters).toBe(3);
      expect(severeOverload.speedReductionMeters).toBe(3);
    });
  });

  describe('Armor Penalty Propagation & Total Calculation', () => {
    it('should calculate total effective armor penalty additively with overload', () => {
      // Armor 2, Shield 1, Not overloaded -> 3
      expect(calculateTotalArmorPenalty(2, 1, false)).toBe(3);

      // Armor 2, Shield 1, Overloaded (+2) -> 5
      expect(calculateTotalArmorPenalty(2, 1, true)).toBe(5);

      // No armor or shield, Overloaded -> 2
      expect(calculateTotalArmorPenalty(0, 0, true)).toBe(2);

      // No armor or shield, Normal -> 0
      expect(calculateTotalArmorPenalty(0, 0, false)).toBe(0);
    });

    it('should verify which skills are subject to armor penalty in T20', () => {
      expect(isSkillPenalizedByArmor('acrobacia', 'T20')).toBe(true);
      expect(isSkillPenalizedByArmor('furtividade', 'T20')).toBe(true);
      expect(isSkillPenalizedByArmor('ladinagem', 'T20')).toBe(true);

      // Unpenalized in T20
      expect(isSkillPenalizedByArmor('atletismo', 'T20')).toBe(false);
      expect(isSkillPenalizedByArmor('percepcao', 'T20')).toBe(false);
      expect(isSkillPenalizedByArmor('iniciativa', 'T20')).toBe(false);
      expect(isSkillPenalizedByArmor('luta', 'T20')).toBe(false);
    });

    it('should verify which skills are subject to armor penalty in TRPG', () => {
      expect(isSkillPenalizedByArmor('acrobacia', 'TRPG')).toBe(true);
      expect(isSkillPenalizedByArmor('atletismo', 'TRPG')).toBe(true);
      expect(isSkillPenalizedByArmor('furtividade', 'TRPG')).toBe(true);
      expect(isSkillPenalizedByArmor('ladinagem', 'TRPG')).toBe(true);
    });
  });

  describe('TRPG Classic Encumbrance', () => {
    it('should calculate light, medium, and heavy load tiers based on score in kg', () => {
      // FOR 10: light ~ 33kg, medium ~ 66kg, heavy ~ 99kg
      const light = calculateTRPGEncumbrance(10, 20);
      expect(light.tier).toBe('leve');
      expect(light.armorPenalty).toBe(0);
      expect(light.speedMeters).toBe(9);

      const medium = calculateTRPGEncumbrance(10, 45);
      expect(medium.tier).toBe('media');
      expect(medium.armorPenalty).toBe(3);
      expect(medium.maxDexterity).toBe(3);
      expect(medium.speedMeters).toBe(6);

      const heavy = calculateTRPGEncumbrance(10, 80);
      expect(heavy.tier).toBe('pesada');
      expect(heavy.armorPenalty).toBe(6);
      expect(heavy.maxDexterity).toBe(1);
      expect(heavy.speedMeters).toBe(6);

      const overloaded = calculateTRPGEncumbrance(10, 120);
      expect(overloaded.tier).toBe('descomunal');
      expect(overloaded.armorPenalty).toBe(9);
      expect(overloaded.speedMeters).toBe(1.5);
    });
  });
});
