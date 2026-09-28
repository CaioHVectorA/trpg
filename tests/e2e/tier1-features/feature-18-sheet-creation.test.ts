/**
 * E2E Tier 1 — Feature 18: Step-by-Step Sheet Creation
 * Opaque-box tests verifying character creation wizard flows, point-buy budgets, and initial stats
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { BaseSheet, AttributeBlock } from '../harness/types';

describe('Feature 18: Step-by-Step Sheet Creation', () => {
  it('F18-T1: should validate point-buy budget allocation during T20 creation wizard', () => {
    // 10 points budget in T20
    const validT20Attrs: AttributeBlock = {
      FOR: 3, // 4 pts
      DES: 1, // 1 pt
      CON: 2, // 2 pts
      INT: 1, // 1 pt
      SAB: 1, // 1 pt
      CAR: 1  // 1 pt -> total 10 pts!
    };
    const cost = SystemAdapter.calculateT20PointBuyCost(validT20Attrs);
    expect(cost).toBe(10);
    expect(cost <= 10).toBe(true);
  });

  it('F18-T2: should initialize T20 Level 1 Dwarf Warrior sheet with correct racial modifiers and class pools', () => {
    // Dwarf: CON +2, SAB +1, DES -1. Base FOR 3, DES 1, CON 1, INT 0, SAB 0, CAR 0.
    // Final attrs: FOR 3, DES 0, CON 3, INT 0, SAB 1, CAR 0.
    const dwarfSheet: BaseSheet = {
      name: 'Thrumbar',
      system: 'T20',
      level: 1,
      race: 'Anão',
      class: 'Guerreiro',
      attributes: { FOR: 3, DES: 0, CON: 3, INT: 0, SAB: 1, CAR: 0 },
      trainedSkills: ['luta', 'fortitude', 'atletismo', 'percepcao']
    };

    const derived = SystemAdapter.calculateDerivedStats(dwarfSheet);
    // PV: Guerreiro 20 + CON 3 = 23
    expect(derived.pvMax).toBe(23);
    // PM: Guerreiro base 3
    expect(derived.pmMax).toBe(3);
    // Defesa: 10 + DES 0 = 10
    expect(derived.defense).toBe(10);
    // Luta: half-level 0 + FOR 3 + training 2 = 5
    expect(derived.skills.luta.bonus).toBe(5);
  });

  it('F18-T3: should initialize TRPG character sheet with classic scores and base attack bonus', () => {
    const trpgSheet: BaseSheet = {
      name: 'Lorien',
      system: 'TRPG',
      level: 1,
      race: 'Elfo',
      class: 'Mago',
      attributes: { FOR: 10, DES: 14, CON: 12, INT: 18, SAB: 12, CAR: 10 }
    };

    const derived = SystemAdapter.calculateDerivedStats(trpgSheet);
    // INT 18 -> mod +4. CON 12 -> mod +1
    expect(SystemAdapter.getAttributeModifier('TRPG', trpgSheet.attributes.INT)).toBe(4);
    expect(SystemAdapter.getAttributeModifier('TRPG', trpgSheet.attributes.CON)).toBe(1);
    expect(derived.defense).toBe(12); // 10 + half-level 0 + DES 2 = 12
  });

  it('F18-T4: should initialize trained skills set according to class mandatory and selected choices', () => {
    const sheet: BaseSheet = {
      name: 'Sir Galen',
      system: 'T20',
      level: 1,
      race: 'Humano',
      class: 'Paladino',
      attributes: { FOR: 3, DES: 0, CON: 2, INT: 0, SAB: 1, CAR: 3 },
      trainedSkills: ['luta', 'vontade', 'diplomacia', 'religiao']
    };

    const derived = SystemAdapter.calculateDerivedStats(sheet);
    expect(derived.skills.luta.trained).toBe(true);
    expect(derived.skills.vontade.trained).toBe(true);
    expect(derived.skills.diplomacia.trained).toBe(true);
    expect(derived.skills.acrobacia.trained).toBe(false);
  });

  it('F18-T5: should calculate initial carrying capacity from strength attribute', () => {
    const sheet: BaseSheet = {
      name: 'Grom',
      system: 'T20',
      level: 1,
      race: 'Humano',
      class: 'Guerreiro',
      attributes: { FOR: 4, DES: 1, CON: 2, INT: 0, SAB: 0, CAR: 0 }
    };

    const derived = SystemAdapter.calculateDerivedStats(sheet);
    expect(derived.carryCapacity).toBe(12); // 4 * 3 slots
  });
});
