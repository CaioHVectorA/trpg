/**
 * Unit Tests — Status Conditions Engine (Feature 12)
 * Conditions catalog, defense modifiers, attack penalties, skill modifiers, and action prevention
 */

import { describe, it, expect } from 'vitest';
import {
  CONDITIONS_CATALOG,
  getConditionDefinition,
  calculateConditionsDefenseModifier,
  calculateConditionsAttackModifier,
  calculateConditionsSkillModifier,
  isActionPrevented,
  normalizeConditionId
} from '../../../src/lib/rules/conditions';

describe('Unit Tests: Status Conditions Engine (Feature 12)', () => {
  describe('Conditions Catalog', () => {
    it('should contain all major Tormenta conditions', () => {
      const keys = Object.keys(CONDITIONS_CATALOG);
      expect(keys.length).toBeGreaterThanOrEqual(25);
      expect(CONDITIONS_CATALOG.caido).toBeDefined();
      expect(CONDITIONS_CATALOG.desprevenido).toBeDefined();
      expect(CONDITIONS_CATALOG.vulneravel).toBeDefined();
      expect(CONDITIONS_CATALOG.inconsciente).toBeDefined();
      expect(CONDITIONS_CATALOG.sangrando).toBeDefined();
      expect(CONDITIONS_CATALOG.fatigado).toBeDefined();
      expect(CONDITIONS_CATALOG.debilitado).toBeDefined();
      expect(CONDITIONS_CATALOG.esmorecido).toBeDefined();
      expect(CONDITIONS_CATALOG.indefeso).toBeDefined();
    });

    it('should retrieve condition definition with normalized name', () => {
      expect(getConditionDefinition('Caído')?.id).toBe('caido');
      expect(getConditionDefinition('VULNERÁVEL')?.id).toBe('vulneravel');
      expect(getConditionDefinition('imóvel')?.id).toBe('imovel');
      expect(getConditionDefinition('Inexistente')).toBeUndefined();
    });
  });

  describe('Defense Modifiers from Conditions', () => {
    it('should calculate Caído defense modifier based on melee vs ranged attacker', () => {
      // Melee attacker: -5 defense
      expect(calculateConditionsDefenseModifier(['caido'], false)).toBe(-5);
      // Ranged attacker: +5 defense
      expect(calculateConditionsDefenseModifier(['caido'], true)).toBe(5);
    });

    it('should calculate Desprevenido and Vulnerável defense penalties', () => {
      expect(calculateConditionsDefenseModifier(['desprevenido'])).toBe(-5);
      expect(calculateConditionsDefenseModifier(['vulneravel'])).toBe(-2);
    });

    it('should stack multiple defense-reducing conditions additively', () => {
      // Desprevenido (-5) + Vulnerável (-2) + Abatido (-2) = -9
      expect(calculateConditionsDefenseModifier(['desprevenido', 'vulneravel', 'abatido'])).toBe(-9);

      // Caído (-5 melee) + Desprevenido (-5) = -10
      expect(calculateConditionsDefenseModifier(['caido', 'desprevenido'], false)).toBe(-10);

      // Caído (+5 ranged) + Desprevenido (-5) = 0
      expect(calculateConditionsDefenseModifier(['caido', 'desprevenido'], true)).toBe(0);
    });
  });

  describe('Attack Modifiers from Conditions', () => {
    it('should penalize melee attacks when Caído (-5)', () => {
      expect(calculateConditionsAttackModifier(['caido'], true)).toBe(-5);
      // Ranged attacks are not penalized by Caído
      expect(calculateConditionsAttackModifier(['caido'], false)).toBe(0);
    });

    it('should apply attack penalties for Agarrado, Enredado, and Ofuscado', () => {
      expect(calculateConditionsAttackModifier(['agarrado'])).toBe(-2);
      expect(calculateConditionsAttackModifier(['enredado'])).toBe(-2);
      expect(calculateConditionsAttackModifier(['ofuscado'])).toBe(-2);
    });

    it('should combine multiple attack penalties', () => {
      // Caído (-5 melee) + Ofuscado (-2) = -7
      expect(calculateConditionsAttackModifier(['caido', 'ofuscado'], true)).toBe(-7);
    });
  });

  describe('Skill Check Modifiers from Conditions', () => {
    it('should penalize Reflexos when Desprevenido (-5)', () => {
      expect(calculateConditionsSkillModifier(['desprevenido'], 'reflexos', 'DES')).toBe(-5);
      // Other skills not penalized by Desprevenido directly
      expect(calculateConditionsSkillModifier(['desprevenido'], 'atletismo', 'FOR')).toBe(0);
    });

    it('should penalize physical skills when Fatigado (-2), Fraco (-2), or Debilitado (-5)', () => {
      // Physical: FOR, DES, CON
      expect(calculateConditionsSkillModifier(['fatigado'], 'atletismo', 'FOR')).toBe(-2);
      expect(calculateConditionsSkillModifier(['fatigado'], 'acrobacia', 'DES')).toBe(-2);
      expect(calculateConditionsSkillModifier(['fatigado'], 'fortitude', 'CON')).toBe(-2);
      expect(calculateConditionsSkillModifier(['fatigado'], 'percepcao', 'SAB')).toBe(0); // Mental skill not penalized

      expect(calculateConditionsSkillModifier(['debilitado'], 'atletismo', 'FOR')).toBe(-5);
      expect(calculateConditionsSkillModifier(['debilitado'], 'percepcao', 'SAB')).toBe(0);
    });

    it('should penalize mental skills when Esmorecido (-5)', () => {
      // Mental: INT, SAB, CAR
      expect(calculateConditionsSkillModifier(['esmorecido'], 'misticismo', 'INT')).toBe(-5);
      expect(calculateConditionsSkillModifier(['esmorecido'], 'percepcao', 'SAB')).toBe(-5);
      expect(calculateConditionsSkillModifier(['esmorecido'], 'diplomacia', 'CAR')).toBe(-5);
      expect(calculateConditionsSkillModifier(['esmorecido'], 'atletismo', 'FOR')).toBe(0); // Physical skill not penalized
    });

    it('should penalize all skills when Abalado (-2) or Amedrontado (-5)', () => {
      expect(calculateConditionsSkillModifier(['abalado'], 'atletismo', 'FOR')).toBe(-2);
      expect(calculateConditionsSkillModifier(['abalado'], 'misticismo', 'INT')).toBe(-2);

      expect(calculateConditionsSkillModifier(['amedrontado'], 'atletismo', 'FOR')).toBe(-5);
      expect(calculateConditionsSkillModifier(['amedrontado'], 'misticismo', 'INT')).toBe(-5);
    });

    it('should penalize Percepção specifically when Fascinado (-5) or Ofuscado (-2)', () => {
      expect(calculateConditionsSkillModifier(['fascinado'], 'percepcao', 'SAB')).toBe(-5);
      expect(calculateConditionsSkillModifier(['ofuscado'], 'percepcao', 'SAB')).toBe(-2);
    });
  });

  describe('Action Prevention', () => {
    it('should detect conditions that prevent actions', () => {
      expect(isActionPrevented(['inconsciente']).prevented).toBe(true);
      expect(isActionPrevented(['paralisado']).prevented).toBe(true);
      expect(isActionPrevented(['atordoado']).prevented).toBe(true);
      expect(isActionPrevented(['pasmo']).prevented).toBe(true);
      expect(isActionPrevented(['petrificado']).prevented).toBe(true);
    });

    it('should allow actions when no blocking condition is active', () => {
      expect(isActionPrevented(['caido', 'vulneravel', 'fatigado']).prevented).toBe(false);
      expect(isActionPrevented([]).prevented).toBe(false);
    });
  });
});
