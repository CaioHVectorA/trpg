/**
 * Unit Tests — Sheet Creation Wizard & Point Buy Engine
 * Tests creation flows, point buy budgets, racial modifiers, and class constants
 */

import { describe, it, expect } from 'vitest';
import {
  calculateT20PointBuyCost,
  calculateTRPGPointBuyCost,
  T20_CLASS_CONSTANTS,
  getAttributeModifier,
  calculateDerivedStats
} from '../../../src/lib/rules';
import { AttributeBlock, BaseSheet } from '../../../src/lib/types';

describe('Sheet Creation Wizard Unit Tests', () => {
  describe('Point Buy Budget Calculations', () => {
    it('should correctly calculate T20 standard 10-point buy budget', () => {
      // Standard array: +3 (4 pts), +2 (2 pts), +1 (1 pt), +1 (1 pt), 0 (0 pt), -1 (-1 pt refunded)
      // Total: 4 + 2 + 1 + 1 + 0 - 1 = 7 pts <= 10 pts
      const standardArray: AttributeBlock = {
        FOR: 3,
        DES: 2,
        CON: 1,
        INT: 1,
        SAB: 0,
        CAR: -1,
      };
      const cost = calculateT20PointBuyCost(standardArray);
      expect(cost).toBe(7);
      expect(cost <= 10).toBe(true);

      // Maxed out 10-point distribution:
      // +3 (4 pts), +2 (2 pts), +2 (2 pts), +1 (1 pt), +1 (1 pt), 0 (0 pt) = 10 pts
      const maxedAttrs: AttributeBlock = {
        FOR: 3,
        DES: 2,
        CON: 2,
        INT: 1,
        SAB: 1,
        CAR: 0,
      };
      expect(calculateT20PointBuyCost(maxedAttrs)).toBe(10);
    });

    it('should reject or flag overspent T20 point buy distributions', () => {
      // Trying to buy four +3 attributes (4 * 4 = 16 pts)
      const overspent: AttributeBlock = {
        FOR: 3,
        DES: 3,
        CON: 3,
        INT: 3,
        SAB: 0,
        CAR: 0,
      };
      const cost = calculateT20PointBuyCost(overspent);
      expect(cost).toBe(16);
      expect(cost > 10).toBe(true);
    });

    it('should calculate TRPG 20-point buy budget starting at base 8', () => {
      // Base 8 scores: all cost 0
      const baseScores: AttributeBlock = {
        FOR: 8,
        DES: 8,
        CON: 8,
        INT: 8,
        SAB: 8,
        CAR: 8,
      };
      expect(calculateTRPGPointBuyCost(baseScores)).toBe(0);

      // Standard 20-point allocation: 15 (8 pts), 14 (6 pts), 13 (5 pts), 10 (2 pts), 8 (0 pts), 8 (0 pts) -> 21 pts (over by 1)
      // Legal: 14 (6), 14 (6), 13 (5), 10 (2), 9 (1), 8 (0) = 20 pts
      const legalScores: AttributeBlock = {
        FOR: 14,
        DES: 14,
        CON: 13,
        INT: 10,
        SAB: 9,
        CAR: 8,
      };
      expect(calculateTRPGPointBuyCost(legalScores)).toBe(20);
    });
  });

  describe('Racial Modifiers and Attribute Derivations', () => {
    it('should apply T20 Dwarf racial modifiers (+2 CON, +1 SAB, -1 DES)', () => {
      const base: AttributeBlock = { FOR: 3, DES: 1, CON: 1, INT: 0, SAB: 0, CAR: 0 };
      const dwarfMods = { FOR: 0, DES: -1, CON: 2, INT: 0, SAB: 1, CAR: 0 };

      const finalAttrs: AttributeBlock = {
        FOR: base.FOR + dwarfMods.FOR,
        DES: base.DES + dwarfMods.DES,
        CON: base.CON + dwarfMods.CON,
        INT: base.INT + dwarfMods.INT,
        SAB: base.SAB + dwarfMods.SAB,
        CAR: base.CAR + dwarfMods.CAR,
      };

      expect(finalAttrs.CON).toBe(3);
      expect(finalAttrs.SAB).toBe(1);
      expect(finalAttrs.DES).toBe(0);
      expect(finalAttrs.FOR).toBe(3);

      // Derived modifiers in T20 are direct
      expect(getAttributeModifier('T20', finalAttrs.CON)).toBe(3);
      expect(getAttributeModifier('T20', finalAttrs.DES)).toBe(0);
    });

    it('should apply TRPG Dwarf racial modifiers (+4 CON, +2 SAB, -2 DES) to scores', () => {
      const base: AttributeBlock = { FOR: 14, DES: 12, CON: 14, INT: 10, SAB: 10, CAR: 8 };
      const dwarfMods = { FOR: 0, DES: -2, CON: 4, INT: 0, SAB: 2, CAR: 0 };

      const finalAttrs: AttributeBlock = {
        FOR: base.FOR + dwarfMods.FOR,
        DES: base.DES + dwarfMods.DES,
        CON: base.CON + dwarfMods.CON,
        INT: base.INT + dwarfMods.INT,
        SAB: base.SAB + dwarfMods.SAB,
        CAR: base.CAR + dwarfMods.CAR,
      };

      expect(finalAttrs.CON).toBe(18); // Mod +4
      expect(finalAttrs.DES).toBe(10); // Mod +0
      expect(finalAttrs.SAB).toBe(12); // Mod +1

      expect(getAttributeModifier('TRPG', finalAttrs.CON)).toBe(4);
      expect(getAttributeModifier('TRPG', finalAttrs.DES)).toBe(0);
      expect(getAttributeModifier('TRPG', finalAttrs.SAB)).toBe(1);
    });
  });

  describe('Class Defaults Initialization', () => {
    it('should correctly configure Guerreiro base pools and mandatory skills', () => {
      const g = T20_CLASS_CONSTANTS['guerreiro'];
      expect(g.basePv).toBe(20);
      expect(g.pvPerLevel).toBe(5);
      expect(g.basePm).toBe(3);
      expect(g.pmPerLevel).toBe(3);
      expect(g.keyAttr).toBe('FOR');
    });

    it('should correctly configure Arcanista base pools and mandatory skills', () => {
      const a = T20_CLASS_CONSTANTS['arcanista'];
      expect(a.basePv).toBe(8);
      expect(a.pvPerLevel).toBe(2);
      expect(a.basePm).toBe(6);
      expect(a.pmPerLevel).toBe(6);
      expect(a.keyAttr).toBe('INT');
    });

    it('should correctly calculate initial derived sheet for Level 1 Arcanista', () => {
      const sheet: BaseSheet = {
        name: 'Mago Iniciante',
        system: 'T20',
        level: 1,
        race: 'Elfo',
        class: 'Arcanista',
        attributes: { FOR: 0, DES: 1, CON: 0, INT: 4, SAB: 1, CAR: 0 },
        trainedSkills: ['misticismo', 'vontade', 'conhecimento', 'iniciativa'],
      };

      const derived = calculateDerivedStats(sheet);
      // PV: Arcanista 8 + CON 0 = 8
      expect(derived.pvMax).toBe(8);
      // PM: Arcanista 6 + INT 4 = 10
      expect(derived.pmMax).toBe(10);
      // Defesa: 10 + DES 1 = 11
      expect(derived.defense).toBe(11);
      // Misticismo: half-level 0 + INT 4 + training 2 = 6
      expect(derived.skills.misticismo.bonus).toBe(6);
    });
  });
});
