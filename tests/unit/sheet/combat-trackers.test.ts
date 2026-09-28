/**
 * Unit Tests — Combat Trackers & Status Conditions Matrix
 * Tests PV/Temp PV absorption, PM spending cap, resting, and condition modifiers
 */

import { describe, it, expect } from 'vitest';
import {
  applyDamage,
  applyHealing,
  canSpendPM,
  calculateRestRecovery,
  getInstantDeathThreshold,
  calculateConditionsDefenseModifier,
  calculateConditionsAttackModifier,
  calculateConditionsSkillModifier,
  isActionPrevented
} from '../../../src/lib/rules';

describe('Combat Trackers Unit Tests', () => {
  describe('PV & Temp PV Absorption', () => {
    it('should absorb damage completely using temporary PV when damage <= tempPv', () => {
      // 30 PV, 15 Temp PV, takes 10 damage
      const result = applyDamage(30, 15, 10, 30);
      expect(result.absorbedByTemp).toBe(10);
      expect(result.newTempPv).toBe(5);
      expect(result.newPv).toBe(30);
      expect(result.isUnconscious).toBe(false);
      expect(result.isDead).toBe(false);
    });

    it('should absorb partial damage from temp PV and apply remainder to base PV', () => {
      // 30 PV, 6 Temp PV, takes 14 damage
      const result = applyDamage(30, 6, 14, 30);
      expect(result.absorbedByTemp).toBe(6);
      expect(result.newTempPv).toBe(0);
      expect(result.newPv).toBe(22); // 30 - (14 - 6) = 22
      expect(result.isUnconscious).toBe(false);
    });

    it('should trigger unconscious state when PV drops to 0 or negative', () => {
      const result = applyDamage(8, 0, 10, 20);
      expect(result.newPv).toBe(-2);
      expect(result.isUnconscious).toBe(true);
      expect(result.isDead).toBe(false);
    });

    it('should detect instant death when PV drops to -floor(pvMax / 2) in T20', () => {
      // Max PV 40 -> instant death at -20
      const threshold = getInstantDeathThreshold('T20', 40);
      expect(threshold).toBe(-20);

      const survival = applyDamage(5, 0, 24, 40); // 5 - 24 = -19 > -20
      expect(survival.isDead).toBe(false);

      const fatality = applyDamage(5, 0, 25, 40); // 5 - 25 = -20 <= -20
      expect(fatality.isDead).toBe(true);
    });

    it('should clamp healing at max PV and calculate overheal', () => {
      // 18 PV out of 30, receives 15 healing
      const heal = applyHealing(18, 30, 15);
      expect(heal.newPv).toBe(30);
      expect(heal.overheal).toBe(3);
    });
  });

  describe('PM Spending & Level-Cap Enforcement', () => {
    it('should enforce T20 level-cap rule (cannot spend more PM than character level)', () => {
      const currentPm = 20;
      const level = 3;

      // Legal spends: 1, 2, 3 PM
      expect(canSpendPM(currentPm, 1, level)).toBe(true);
      expect(canSpendPM(currentPm, 2, level)).toBe(true);
      expect(canSpendPM(currentPm, 3, level)).toBe(true);

      // Illegal spends exceeding level limit: 4, 5 PM
      expect(canSpendPM(currentPm, 4, level)).toBe(false);
      expect(canSpendPM(currentPm, 5, level)).toBe(false);
    });

    it('should reject spending more PM than currently available', () => {
      const currentPm = 2;
      const level = 5;

      // Cannot spend 3 PM when only 2 are available
      expect(canSpendPM(currentPm, 3, level)).toBe(false);
      expect(canSpendPM(currentPm, 2, level)).toBe(true);
    });

    it('should calculate rest recovery tiers accurately', () => {
      const level = 5;
      const pvMax = 50;
      const pmMax = 25;

      // Normal: 1x level = 5
      const normal = calculateRestRecovery(level, 'normal', pvMax, pmMax);
      expect(normal.recoveredPv).toBe(5);
      expect(normal.recoveredPm).toBe(5);

      // Confortável: 2x level = 10
      const conf = calculateRestRecovery(level, 'confortavel', pvMax, pmMax);
      expect(conf.recoveredPv).toBe(10);
      expect(conf.recoveredPm).toBe(10);

      // Luxuoso: 100%
      const lux = calculateRestRecovery(level, 'luxuoso', pvMax, pmMax);
      expect(lux.recoveredPv).toBe(pvMax);
      expect(lux.recoveredPm).toBe(pmMax);
    });
  });

  describe('Status Conditions Matrix Modifiers', () => {
    it('should correctly accumulate defense penalties from multiple active conditions', () => {
      // Abatido: -2 Defesa, Desprevenido: -5 Defesa
      const conditions = ['Abatido', 'Desprevenido'];
      const defMod = calculateConditionsDefenseModifier(conditions);
      expect(defMod).toBe(-7);
    });

    it('should apply Caído modifiers differentiating melee from ranged attacks', () => {
      const conditions = ['Caído'];
      // Defesa contra corpo a corpo: -5
      expect(calculateConditionsDefenseModifier(conditions, false)).toBe(-5);
      // Defesa contra projéteis à distância: +5
      expect(calculateConditionsDefenseModifier(conditions, true)).toBe(5);
      // Ataque corpo a corpo: -5
      expect(calculateConditionsAttackModifier(conditions, true)).toBe(-5);
    });

    it('should apply Fatigado penalty only to physical attribute skills (FOR, DES, CON)', () => {
      const conditions = ['Fatigado'];
      // Atletismo (FOR) -> -2
      expect(calculateConditionsSkillModifier(conditions, 'atletismo', 'FOR')).toBe(-2);
      // Furtividade (DES) -> -2
      expect(calculateConditionsSkillModifier(conditions, 'furtividade', 'DES')).toBe(-2);
      // Misticismo (INT) -> 0
      expect(calculateConditionsSkillModifier(conditions, 'misticismo', 'INT')).toBe(0);
      // Vontade (SAB) -> 0
      expect(calculateConditionsSkillModifier(conditions, 'vontade', 'SAB')).toBe(0);
    });

    it('should flag prevented actions when character is Atordoado, Inconsciente, or Paralisado', () => {
      expect(isActionPrevented(['Abatido']).prevented).toBe(false);
      expect(isActionPrevented(['Caído']).prevented).toBe(false);
      expect(isActionPrevented(['Atordoado']).prevented).toBe(true);
      expect(isActionPrevented(['Inconsciente']).prevented).toBe(true);
      expect(isActionPrevented(['Paralisado']).prevented).toBe(true);
    });
  });
});
