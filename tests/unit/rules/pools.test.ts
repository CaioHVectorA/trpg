/**
 * Unit Tests — Resource Pools Engine (Features 7 & 8)
 * Deterministic T20 PV and PM scaling, TRPG formulas, PM expenditure limits, instant death, and resting
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePvMax,
  calculatePmMax,
  canSpendPM,
  getInstantDeathThreshold,
  applyDamage,
  applyHealing,
  calculateRestRecovery,
  T20_CLASS_CONSTANTS
} from '../../../src/lib/rules/pools';

describe('Unit Tests: Resource Pools Engine (Features 7 & 8)', () => {
  describe('T20 Deterministic PV Calculation', () => {
    it('should calculate level 1 and higher level PV for all standard classes', () => {
      // Guerreiro: 20 base, 5 per level
      expect(calculatePvMax('T20', 'guerreiro', 1, 2)).toBe(22); // 20 + 2
      expect(calculatePvMax('T20', 'guerreiro', 2, 2)).toBe(29); // 22 + (5 + 2)
      expect(calculatePvMax('T20', 'guerreiro', 5, 2)).toBe(50); // 22 + 4 * 7

      // Arcanista: 8 base, 2 per level
      expect(calculatePvMax('T20', 'arcanista', 1, 0)).toBe(8);
      expect(calculatePvMax('T20', 'arcanista', 3, 0)).toBe(12); // 8 + 2 * 2

      // Bárbaro: 24 base, 6 per level
      expect(calculatePvMax('T20', 'barbaro', 1, 3)).toBe(27);
      expect(calculatePvMax('T20', 'barbaro', 10, 3)).toBe(108); // 27 + 9 * (6 + 3) = 27 + 81
    });

    it('should support class names with diacritics and different casing', () => {
      expect(calculatePvMax('T20', 'Bárbaro', 1, 0)).toBe(24);
      expect(calculatePvMax('T20', 'Clérigo', 1, 2)).toBe(18); // 16 + 2
      expect(calculatePvMax('T20', 'Caçador', 1, 1)).toBe(17); // 16 + 1
    });

    it('should enforce 1 PV minimum gain on level up even with pathological negative CON', () => {
      // Arcanista: base 8, perLevel 2, CON -4
      // Level 1: max(1, 8 - 4) = 4
      expect(calculatePvMax('T20', 'arcanista', 1, -4)).toBe(4);
      // Level 2: 4 + max(1, 2 - 4) = 4 + 1 = 5
      expect(calculatePvMax('T20', 'arcanista', 2, -4)).toBe(5);
      // Level 10: 4 + 9 * 1 = 13
      expect(calculatePvMax('T20', 'arcanista', 10, -4)).toBe(13);
    });

    it('should handle level 1 character with extreme negative CON clamping to 1 PV', () => {
      // Arcanista base 8 with CON -10 -> max(1, 8 - 10) = 1
      expect(calculatePvMax('T20', 'arcanista', 1, -10)).toBe(1);
    });
  });

  describe('T20 Deterministic PM Calculation', () => {
    it('should not add key attribute to PM for martial classes', () => {
      const martialClasses = ['guerreiro', 'barbaro', 'bucaneiro', 'cacador', 'cavaleiro', 'ladino', 'lutador'];
      for (const cls of martialClasses) {
        // At level 1, base PM is 3 and does not scale with key attribute
        expect(calculatePmMax('T20', cls, 1, 4)).toBe(3);
        // At level 4: 3 + 3 * 3 = 12
        expect(calculatePmMax('T20', cls, 4, 4)).toBe(12);
      }
    });

    it('should add key attribute to PM for spellcasters and hybrid classes', () => {
      // Arcanista: base 6, +6/level
      expect(calculatePmMax('T20', 'arcanista', 1, 4)).toBe(10); // 6 + 4
      expect(calculatePmMax('T20', 'arcanista', 5, 4)).toBe(34); // 10 + 4 * 6

      // Clérigo: base 5, +5/level
      expect(calculatePmMax('T20', 'clerigo', 1, 3)).toBe(8); // 5 + 3
      expect(calculatePmMax('T20', 'clerigo', 3, 3)).toBe(18); // 8 + 2 * 5

      // Paladino: base 3, +3/level, adds CAR at 1st level
      expect(calculatePmMax('T20', 'paladino', 1, 2)).toBe(5); // 3 + 2
      expect(calculatePmMax('T20', 'paladino', 2, 2)).toBe(8); // 5 + 3
    });

    it('should clamp minimum PM at level 1 to 0 if key attribute is negative', () => {
      expect(calculatePmMax('T20', 'arcanista', 1, -8)).toBe(0);
      // Level 2 adds 6: 0 + 6 = 6
      expect(calculatePmMax('T20', 'arcanista', 2, -8)).toBe(6);
    });
  });

  describe('TRPG Resource Pool Calculations', () => {
    it('should calculate TRPG PV progression using average hit die', () => {
      // Guerreiro (base 20 / d10 avg 6), CON 14 (+2 mod)
      // Level 1: 20 + 2 = 22
      expect(calculatePvMax('TRPG', 'guerreiro', 1, 14)).toBe(22);
      // Level 3: 22 + 2 * (11 + 2) = 48
      expect(calculatePvMax('TRPG', 'guerreiro', 3, 14)).toBe(48);
    });

    it('should calculate TRPG PM progression for spellcasters', () => {
      // Arcanista (base 6, per level 6), INT 18 (+4 mod)
      // Level 1: 6 + 0 + 4 = 10
      expect(calculatePmMax('TRPG', 'arcanista', 1, 18)).toBe(10);
      // Level 3: 6 + 2 * 6 + 4 = 22
      expect(calculatePmMax('TRPG', 'arcanista', 3, 18)).toBe(22);
    });
  });

  describe('T20 PM Expenditure Limit (canSpendPM)', () => {
    it('should strictly enforce that cost cannot exceed character level', () => {
      expect(canSpendPM(10, 1, 1)).toBe(true);
      expect(canSpendPM(10, 2, 1)).toBe(false); // Level 1 cannot spend 2 PM

      expect(canSpendPM(20, 5, 5)).toBe(true);
      expect(canSpendPM(20, 6, 5)).toBe(false); // Level 5 cannot spend 6 PM

      expect(canSpendPM(50, 20, 20)).toBe(true);
      expect(canSpendPM(50, 21, 20)).toBe(false);
    });

    it('should strictly enforce that cost cannot exceed current available PM', () => {
      expect(canSpendPM(3, 4, 10)).toBe(false);
      expect(canSpendPM(3, 3, 10)).toBe(true);
      expect(canSpendPM(0, 1, 5)).toBe(false);
    });

    it('should reject negative costs', () => {
      expect(canSpendPM(10, -1, 5)).toBe(false);
      expect(canSpendPM(10, -5, 5)).toBe(false);
    });

    it('should allow spending 0 PM at any level', () => {
      expect(canSpendPM(10, 0, 1)).toBe(true);
      expect(canSpendPM(0, 0, 1)).toBe(true);
    });

    it('should allow exact triple boundary expenditure (cost === level === currentPM)', () => {
      expect(canSpendPM(7, 7, 7)).toBe(true);
    });
  });

  describe('Instant Death Threshold', () => {
    it('should calculate T20 instant death threshold as -floor(pvMax / 2)', () => {
      expect(getInstantDeathThreshold('T20', 36)).toBe(-18);
      expect(getInstantDeathThreshold('T20', 35)).toBe(-17);
      expect(getInstantDeathThreshold('T20', 25)).toBe(-12);
      expect(getInstantDeathThreshold('T20', 10)).toBe(-5);
      expect(getInstantDeathThreshold('T20', 1)).toBe(0);
    });

    it('should calculate TRPG instant death threshold as -max(10, conScore)', () => {
      expect(getInstantDeathThreshold('TRPG', 36, 16)).toBe(-16);
      expect(getInstantDeathThreshold('TRPG', 36, 8)).toBe(-10);
      expect(getInstantDeathThreshold('TRPG', 36, 12)).toBe(-12);
    });
  });

  describe('Damage and Healing Application', () => {
    it('should absorb damage with temporary PV before touching current PV', () => {
      // 10 current, 5 temp, 3 damage -> temp absorbs 3, leaves 2 temp, 10 current
      const res1 = applyDamage(10, 5, 3);
      expect(res1.absorbedByTemp).toBe(3);
      expect(res1.newTempPv).toBe(2);
      expect(res1.newPv).toBe(10);
      expect(res1.isUnconscious).toBe(false);

      // 10 current, 5 temp, 7 damage -> temp absorbs 5, 2 touches current -> 8 current
      const res2 = applyDamage(10, 5, 7);
      expect(res2.absorbedByTemp).toBe(5);
      expect(res2.newTempPv).toBe(0);
      expect(res2.newPv).toBe(8);
      expect(res2.isUnconscious).toBe(false);
    });

    it('should correctly flag unconsciousness at <= 0 PV', () => {
      const resZero = applyDamage(10, 0, 10);
      expect(resZero.newPv).toBe(0);
      expect(resZero.isUnconscious).toBe(true);

      const resNeg = applyDamage(10, 0, 12);
      expect(resNeg.newPv).toBe(-2);
      expect(resNeg.isUnconscious).toBe(true);
    });

    it('should detect instant character death when damage exceeds death threshold', () => {
      // Max PV 20 -> death threshold is -10
      // 1 current PV, 12 damage -> -11 PV <= -10 -> Dead!
      const resDead = applyDamage(1, 0, 12, 20);
      expect(resDead.newPv).toBe(-11);
      expect(resDead.isDead).toBe(true);

      // 1 current PV, 10 damage -> -9 PV > -10 -> Not dead, but unconscious
      const resAlive = applyDamage(1, 0, 10, 20);
      expect(resAlive.newPv).toBe(-9);
      expect(resAlive.isDead).toBe(false);
      expect(resAlive.isUnconscious).toBe(true);
    });

    it('should apply healing without exceeding pvMax and record overheal', () => {
      const heal1 = applyHealing(15, 20, 3);
      expect(heal1.newPv).toBe(18);
      expect(heal1.overheal).toBe(0);

      const heal2 = applyHealing(15, 20, 10);
      expect(heal2.newPv).toBe(20);
      expect(heal2.overheal).toBe(5);
    });
  });

  describe('Rest Recovery Calculations', () => {
    it('should calculate recovery based on rest condition tier', () => {
      // Level 5 character with max 50 PV and 20 PM
      const ruim = calculateRestRecovery(5, 'ruim', 50, 20);
      expect(ruim.recoveredPv).toBe(5);
      expect(ruim.recoveredPm).toBe(5);

      const normal = calculateRestRecovery(5, 'normal', 50, 20);
      expect(normal.recoveredPv).toBe(5);
      expect(normal.recoveredPm).toBe(5);

      const confortavel = calculateRestRecovery(5, 'confortavel', 50, 20);
      expect(confortavel.recoveredPv).toBe(10);
      expect(confortavel.recoveredPm).toBe(10);

      const luxuoso = calculateRestRecovery(5, 'luxuoso', 50, 20);
      expect(luxuoso.recoveredPv).toBe(50);
      expect(luxuoso.recoveredPm).toBe(20);
    });
  });
});
