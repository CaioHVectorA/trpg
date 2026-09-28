/**
 * E2E Tier 1 — Feature 19: Reactive Derived Sheet State
 * Opaque-box tests verifying instant DAG recalculation of PV, PM, Defesa, Perícias, and Carga
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { BaseSheet } from '../harness/types';

describe('Feature 19: Reactive Derived Sheet State', () => {
  const baseSheet: BaseSheet = {
    name: 'Valeros',
    system: 'T20',
    level: 3,
    race: 'Humano',
    class: 'Guerreiro',
    attributes: { FOR: 3, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: 0 },
    trainedSkills: ['luta', 'fortitude', 'furtividade', 'acrobacia'],
    inventoryWeightSlots: 4
  };

  it('F19-T1: should recalculate max PV dynamically upon Constitution edit', () => {
    // Level 3 Guerreiro with CON 2: 20 + 2 + 2 * (5 + 2) = 36
    const initial = SystemAdapter.calculateDerivedStats(baseSheet);
    expect(initial.pvMax).toBe(36);

    // Increase CON to 3: 20 + 3 + 2 * (5 + 3) = 39
    const updated = SystemAdapter.calculateDerivedStats({
      ...baseSheet,
      attributes: { ...baseSheet.attributes, CON: 3 }
    });
    expect(updated.pvMax).toBe(39);
  });

  it('F19-T2: should recalculate Defesa and Dexterity-based skills upon Dexterity edit', () => {
    const initial = SystemAdapter.calculateDerivedStats(baseSheet);
    expect(initial.defense).toBe(12); // 10 + 2
    // Furtividade: half-level 1 + DES 2 + training 2 = 5
    expect(initial.skills.furtividade.bonus).toBe(5);

    // Edit DES to 4
    const updated = SystemAdapter.calculateDerivedStats({
      ...baseSheet,
      attributes: { ...baseSheet.attributes, DES: 4 }
    });
    expect(updated.defense).toBe(14); // 10 + 4
    expect(updated.skills.furtividade.bonus).toBe(7); // 1 + 4 + 2 = 7
  });

  it('F19-T3: should zero Dexterity bonus and update armor check penalty when equipping heavy armor', () => {
    // Equipping Cota de Malha: Armor +6, penalty -2, isHeavy: true
    const armoredSheet: BaseSheet = {
      ...baseSheet,
      armorBonus: 6,
      armorPenalty: 2,
      isHeavyArmor: true
    };

    const derived = SystemAdapter.calculateDerivedStats(armoredSheet);
    // Defesa: 10 + 0 (DEX zeroed!) + 6 = 16
    expect(derived.defense).toBe(16);
    expect(derived.armorPenalty).toBe(2);

    // Furtividade: half-level 1 + DES 2 + training 2 - penalty 2 = 3
    expect(derived.skills.furtividade.bonus).toBe(3);
  });

  it('F19-T4: should recalculate carrying capacity upon Strength modification', () => {
    const initial = SystemAdapter.calculateDerivedStats(baseSheet);
    expect(initial.carryCapacity).toBe(9); // FOR 3 * 3 = 9 slots

    const updated = SystemAdapter.calculateDerivedStats({
      ...baseSheet,
      attributes: { ...baseSheet.attributes, FOR: 5 }
    });
    expect(updated.carryCapacity).toBe(15); // FOR 5 * 3 = 15 slots
  });

  it('F19-T5: should dynamically apply overload penalties when inventory weight exceeds capacity', () => {
    // FOR 3 -> capacity 9 slots. Carrying 10 slots -> Overloaded!
    const overloadedSheet: BaseSheet = {
      ...baseSheet,
      inventoryWeightSlots: 10
    };

    const derived = SystemAdapter.calculateDerivedStats(overloadedSheet);
    // Overload adds -2 to armor penalty (total 2)
    expect(derived.armorPenalty).toBe(2);
    // Furtividade suffers overload penalty: 1 + 2 + 2 - 2 = 3
    expect(derived.skills.furtividade.bonus).toBe(3);
  });
});
