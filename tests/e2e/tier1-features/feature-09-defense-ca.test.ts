/**
 * E2E Tier 1 — Feature 9: Dual-System Defense/CA
 * Opaque-box tests verifying T20 Defesa (no half-level, heavy armor zeroes DES) vs TRPG CA
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 9: Dual-System Defense/CA', () => {
  it('F9-T1: should calculate T20 Defesa without half-level scaling for player characters', () => {
    // Level 10 character, DES +3, Couraça (Armor +5), Escudo Pesado (+2)
    // Formula: 10 + 3 + 5 + 2 = 20 (NOT 25 with half-level!)
    const def = SystemAdapter.calculateDefense('T20', 10, 3, 5, 2, false);
    expect(def).toBe(20);
  });

  it('F9-T2: should force Dexterity bonus to 0 when T20 character equips heavy armor', () => {
    // DES +4 equips Cota de Malha (Armor +6, isHeavy: true)
    // Effective DES becomes 0. Total = 10 + 0 + 6 = 16.
    const def = SystemAdapter.calculateDefense('T20', 4, 4, 6, 0, true);
    expect(def).toBe(16);

    // If unarmored, DES +4 gives 10 + 4 = 14
    const defUnarmored = SystemAdapter.calculateDefense('T20', 4, 4, 0, 0, false);
    expect(defUnarmored).toBe(14);
  });

  it('F9-T3: should calculate TRPG CA incorporating half-level progression', () => {
    // TRPG Level 6 character (half-level 3), DES 16 (+3), Armadura +4, Escudo +1
    // Formula: 10 + 3 (half-level) + 3 (DES) + 4 + 1 = 21
    const ca = SystemAdapter.calculateDefense('TRPG', 6, 16, 4, 1, false);
    expect(ca).toBe(21);
  });

  it('F9-T4: should enforce TRPG MaxDex on positive Dexterity while applying negative in full', () => {
    // TRPG Level 4 (half-level 2), DES 18 (+4), Armor +5, MaxDex +2
    // Capped DES = +2. CA = 10 + 2 + 2 + 5 = 19
    const caCapped = SystemAdapter.calculateDefense('TRPG', 4, 18, 5, 0, false, 2);
    expect(caCapped).toBe(19);

    // TRPG Level 4 (half-level 2), DES 6 (-2), Armor +5, MaxDex +2
    // Negative DES (-2) applies in full: 10 + 2 - 2 + 5 = 15
    const caNegative = SystemAdapter.calculateDefense('TRPG', 4, 6, 5, 0, false, 2);
    expect(caNegative).toBe(15);
  });

  it('F9-T5: should verify that an attack score meeting or exceeding Defense/CA is a hit', () => {
    const defense = 18;
    const hitExact = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+8',
      targetDefense: defense
    }, [10]); // 10 + 8 = 18 -> Hit!
    expect(hitExact.isHit).toBe(true);

    const missOne = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+8',
      targetDefense: defense
    }, [9]); // 9 + 8 = 17 -> Miss!
    expect(missOne.isHit).toBe(false);
  });
});
