/**
 * Unit Tests — Reactive Recalculations (DAG)
 * Tests instant recalculations of PV, PM, Defesa/CA, Perícias, and Carga
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDerivedStats,
  calculateDefense,
  calculateSkillBonus,
  getT20TrainingBonus,
  calculateEncumbrance,
  calculateTotalArmorPenalty
} from '../../../src/lib/rules';
import { BaseSheet } from '../../../src/lib/types';

describe('Reactive Sheet Recalculations Unit Tests', () => {
  const baseSheet: BaseSheet = {
    name: 'Keldor',
    system: 'T20',
    level: 2,
    race: 'Humano',
    class: 'Guerreiro',
    attributes: { FOR: 3, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: 0 },
    trainedSkills: ['luta', 'fortitude', 'iniciativa', 'furtividade', 'acrobacia'],
    inventoryWeightSlots: 4,
  };

  it('should reactively recalculate PV and PM when level increases from 2 to 7', () => {
    // Level 2 Guerreiro (CON 2):
    // PV: 20 + 2 + 1 * (5 + 2) = 29
    // PM: 3 + 1 * 3 = 6
    const lvl2Derived = calculateDerivedStats(baseSheet);
    expect(lvl2Derived.pvMax).toBe(29);
    expect(lvl2Derived.pmMax).toBe(6);

    // Increase level to 7:
    // PV: 20 + 2 + 6 * (5 + 2) = 22 + 42 = 64
    // PM: 3 + 6 * 3 = 21
    const lvl7Sheet: BaseSheet = { ...baseSheet, level: 7 };
    const lvl7Derived = calculateDerivedStats(lvl7Sheet);
    expect(lvl7Derived.pvMax).toBe(64);
    expect(lvl7Derived.pmMax).toBe(21);

    // Training bonus at lvl 7 increases from +2 to +4!
    expect(getT20TrainingBonus(2, true)).toBe(2);
    expect(getT20TrainingBonus(7, true)).toBe(4);

    // Luta at lvl 2: half-level 1 + FOR 3 + train 2 = 6
    expect(lvl2Derived.skills.luta.bonus).toBe(6);
    // Luta at lvl 7: half-level 3 + FOR 3 + train 4 = 10
    expect(lvl7Derived.skills.luta.bonus).toBe(10);
  });

  it('should reactively zero DEX on Defense and apply armor check penalty when equipping heavy armor', () => {
    // Unarmored: 10 + DES 2 = 12
    const unarmored = calculateDerivedStats(baseSheet);
    expect(unarmored.defense).toBe(12);
    expect(unarmored.armorPenalty).toBe(0);
    // Furtividade: half-level 1 + DES 2 + train 2 - pen 0 = 5
    expect(unarmored.skills.furtividade.bonus).toBe(5);

    // Equipping Cota de Malha: Armor +6, penalty 2, isHeavy: true
    const armoredSheet: BaseSheet = {
      ...baseSheet,
      armorBonus: 6,
      armorPenalty: 2,
      isHeavyArmor: true,
    };
    const armoredDerived = calculateDerivedStats(armoredSheet);
    // Defesa: 10 + 0 (DEX zeroed!) + 6 = 16
    expect(armoredDerived.defense).toBe(16);
    expect(armoredDerived.armorPenalty).toBe(2);
    // Furtividade suffers penalty: 1 + 2 + 2 - 2 = 3
    expect(armoredDerived.skills.furtividade.bonus).toBe(3);

    // Adding Escudo Pesado: Shield +2, penalty 2
    const withShield: BaseSheet = {
      ...armoredSheet,
      shieldBonus: 2,
      shieldPenalty: 2,
    };
    const shieldDerived = calculateDerivedStats(withShield);
    // Defesa: 10 + 0 + 6 + 2 = 18
    expect(shieldDerived.defense).toBe(18);
    // Total penalty: 2 + 2 = 4
    expect(shieldDerived.armorPenalty).toBe(4);
    // Furtividade: 1 + 2 + 2 - 4 = 1
    expect(shieldDerived.skills.furtividade.bonus).toBe(1);
  });

  it('should reactively recalculate TRPG CA with half-level and maxDexterity cap', () => {
    // Level 4 character in TRPG: half-level is floor(4 / 2) = 2
    // DES score 18 -> mod +4. Armor Cota de Malha: Armor +6, maxDex: +2
    const ca = calculateDefense('TRPG', 4, 18, 6, 0, false, 2);
    // CA: 10 + half-level 2 + cappedDES 2 + armor 6 = 20
    expect(ca).toBe(20);
  });

  it('should reactively update carrying capacity and trigger overload penalty', () => {
    // FOR 3 -> capacity = 3 * 3 = 9 slots
    const normalEnc = calculateEncumbrance(3, 8);
    expect(normalEnc.maxSlots).toBe(9);
    expect(normalEnc.isOverloaded).toBe(false);

    // Carrying 10 slots with FOR 3 -> Overloaded!
    const overloadedEnc = calculateEncumbrance(3, 10);
    expect(overloadedEnc.isOverloaded).toBe(true);

    const totalPen = calculateTotalArmorPenalty(1, 0, overloadedEnc.isOverloaded);
    // Base penalty 1 + overload penalty 2 = 3
    expect(totalPen).toBe(3);

    // Dynamic sheet test
    const overloadedSheet: BaseSheet = {
      ...baseSheet,
      armorBonus: 2,
      armorPenalty: 1,
      inventoryWeightSlots: 10,
    };
    const derived = calculateDerivedStats(overloadedSheet);
    expect(derived.armorPenalty).toBe(3);
    // Acrobacia: half-level 1 + DES 2 + train 2 - pen 3 = 2
    expect(derived.skills.acrobacia.bonus).toBe(2);
  });
});
