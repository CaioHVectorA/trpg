/**
 * Unit Tests — Derived Stats & RulesEngine Facade
 * Testing full reactive DAG calculation across T20 and TRPG character sheets
 */

import { describe, it, expect } from 'vitest';
import { calculateDerivedStats, RulesEngine } from '../../../src/lib/rules';
import { BaseSheet } from '../../../src/lib/types';

describe('Unit Tests: Derived Stats & RulesEngine Facade', () => {
  const t20Sheet: BaseSheet = {
    name: 'Valeros de Valkaria',
    system: 'T20',
    level: 3,
    race: 'Humano',
    class: 'Guerreiro',
    attributes: { FOR: 3, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: 0 },
    trainedSkills: ['luta', 'fortitude', 'furtividade', 'acrobacia'],
    inventoryWeightSlots: 4,
    armorBonus: 0,
    shieldBonus: 0
  };

  it('should calculate full derived statistics for a baseline T20 character', () => {
    const derived = calculateDerivedStats(t20Sheet);

    // Guerreiro level 3, CON +2: 20 + 2 + 2 * (5 + 2) = 36
    expect(derived.pvMax).toBe(36);

    // Guerreiro level 3 PM: 3 + 2 * 3 = 9
    expect(derived.pmMax).toBe(9);

    // Unarmored Defesa: 10 + DES 2 = 12
    expect(derived.defense).toBe(12);

    // Carry capacity: FOR 3 * 3 = 9 slots
    expect(derived.carryCapacity).toBe(9);

    // Armor penalty: 0
    expect(derived.armorPenalty).toBe(0);

    // Skills
    // Luta: trained at level 3 (half-level 1, training 2, FOR 3) -> 1 + 2 + 3 = 6
    expect(derived.skills.luta.bonus).toBe(6);
    expect(derived.skills.luta.trained).toBe(true);

    // Furtividade: trained at level 3 (half-level 1, training 2, DES 2) -> 1 + 2 + 2 = 5
    expect(derived.skills.furtividade.bonus).toBe(5);

    // Conhecimento: untrained "Somente Treinada" -> 0
    expect(derived.skills.conhecimento.bonus).toBe(0);
    expect(derived.skills.conhecimento.trained).toBe(false);

    // Percepção: untrained open skill -> half-level 1 + SAB 0 = 1
    expect(derived.skills.percepcao.bonus).toBe(1);
    expect(derived.skills.percepcao.trained).toBe(false);
  });

  it('should reactively recalculate PV, Defesa, and Carry Capacity when attributes change', () => {
    const upgradedSheet: BaseSheet = {
      ...t20Sheet,
      attributes: {
        FOR: 4, // 4 * 3 = 12 slots
        DES: 3, // Defesa 10 + 3 = 13
        CON: 3, // PV: 20 + 3 + 2 * (5 + 3) = 39
        INT: 1,
        SAB: 1,
        CAR: 0
      }
    };

    const derived = calculateDerivedStats(upgradedSheet);
    expect(derived.pvMax).toBe(39);
    expect(derived.defense).toBe(13);
    expect(derived.carryCapacity).toBe(12);
    expect(derived.skills.luta.bonus).toBe(7); // 1 + 2 + 4 = 7
  });

  it('should zero Dexterity bonus and apply armor penalty to physical skills when equipping heavy armor', () => {
    const heavySheet: BaseSheet = {
      ...t20Sheet,
      armorBonus: 6, // Cota de Malha
      armorPenalty: 2,
      isHeavyArmor: true
    };

    const derived = calculateDerivedStats(heavySheet);
    // Defesa: 10 + 0 (DEX zeroed) + 6 = 16
    expect(derived.defense).toBe(16);
    expect(derived.armorPenalty).toBe(2);

    // Furtividade: 1 (half-level) + 2 (training) + 2 (DES) - 2 (armor penalty) = 3
    expect(derived.skills.furtividade.bonus).toBe(3);

    // Acrobacia: 1 + 2 + 2 - 2 = 3
    expect(derived.skills.acrobacia.bonus).toBe(3);

    // Fortitude: not penalized by armor: 1 + 2 + 2 = 5
    expect(derived.skills.fortitude.bonus).toBe(5);
  });

  it('should apply overload penalties to physical skills when inventory weight exceeds capacity', () => {
    // Capacity is 9 slots, carrying 10 slots
    const overloadedSheet: BaseSheet = {
      ...t20Sheet,
      inventoryWeightSlots: 10
    };

    const derived = calculateDerivedStats(overloadedSheet);
    // Overload adds 2 to armor penalty
    expect(derived.armorPenalty).toBe(2);

    // Furtividade suffers overload penalty: 1 + 2 + 2 - 2 = 3
    expect(derived.skills.furtividade.bonus).toBe(3);
  });

  it('should calculate derived statistics for a TRPG character sheet', () => {
    const trpgSheet: BaseSheet = {
      name: 'Lorien',
      system: 'TRPG',
      level: 4,
      race: 'Elfo',
      class: 'Arcanista',
      attributes: {
        FOR: 10, // mod 0
        DES: 16, // mod +3
        CON: 12, // mod +1
        INT: 18, // mod +4
        SAB: 14, // mod +2
        CAR: 10  // mod 0
      },
      trainedSkills: ['misticismo', 'conhecimento'],
      armorBonus: 0
    };

    const derived = calculateDerivedStats(trpgSheet);

    // TRPG CA: 10 + floor(4/2) + DES 3 = 15
    expect(derived.defense).toBe(15);

    // Misticismo: INT 4 + (4 + 3) = 11
    expect(derived.skills.misticismo.bonus).toBe(11);
    expect(derived.skills.misticismo.trained).toBe(true);
  });

  it('should verify all RulesEngine static methods match standalone functions', () => {
    expect(RulesEngine.getAttributeModifier('T20', 3)).toBe(3);
    expect(RulesEngine.getAttributeModifier('TRPG', 16)).toBe(3);
    expect(RulesEngine.calculatePvMax('T20', 'guerreiro', 1, 2)).toBe(22);
    expect(RulesEngine.canSpendPM(10, 2, 3)).toBe(true);
    expect(RulesEngine.canSpendPM(10, 5, 3)).toBe(false);
    expect(RulesEngine.calculateDefense('T20', 5, 2, 4, 1, false)).toBe(17);
    expect(RulesEngine.isAttackHit(17, 17)).toBe(true);
  });
});
