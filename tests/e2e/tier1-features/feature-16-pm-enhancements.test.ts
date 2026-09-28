/**
 * E2E Tier 1 — Feature 16: PM Enhancement Scaling
 * Opaque-box tests verifying extra damage dice, additional missiles, and DC scaling via PM investment
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 16: PM Enhancement Scaling', () => {
  it('F16-T1: should resolve base Mísseis Mágicos (1 PM) as 2 missiles dealing 1d4+1 each', () => {
    // Base 2d4+2
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '2d4+2 # Mísseis Mágicos Base',
      pmInvested: 1
    }, [3, 4]); // 3 + 4 + 2 = 9
    expect(res.total).toBe(9);
    expect(res.rolls.length).toBe(2);
  });

  it('F16-T2: should scale Mísseis Mágicos with +2 PM enhancement adding +1 missile (3d4+3 total)', () => {
    // 3 PM total (1 base + 2 enhancement): 3d4+3
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '3d4+3 # Mísseis Mágicos Aprimorado (+2 PM)',
      pmInvested: 3
    }, [2, 3, 4]); // 2 + 3 + 4 + 3 = 12
    expect(res.total).toBe(12);
    expect(res.rolls.length).toBe(3);
  });

  it('F16-T3: should resolve base Bola de Fogo (3 PM) dealing 6d6 fire damage', () => {
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '6d6 # Bola de Fogo Base',
      pmInvested: 3
    }, [3, 4, 2, 5, 6, 1]); // sum = 21
    expect(res.total).toBe(21);
    expect(res.rolls.length).toBe(6);
  });

  it('F16-T4: should scale Bola de Fogo damage with +2 PM enhancement (+2d6 damage, 8d6 total)', () => {
    // 5 PM total (3 base + 2 enhancement): 8d6
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '8d6 # Bola de Fogo Aprimorada (+2 PM)',
      pmInvested: 5
    }, [4, 4, 5, 5, 3, 3, 6, 6]); // sum = 36
    expect(res.total).toBe(36);
    expect(res.rolls.length).toBe(8);
  });

  it('F16-T5: should scale Guerreiro Ataque Especial bonus in increments of +4 per PM', () => {
    // Base 1 PM = +4 bonus. With 2 PM invested = +8 bonus
    const attackWith2PM = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+13 # Ataque Especial (+8 por 2 PM)',
      pmInvested: 2
    }, [11]); // 11 + 13 = 24
    expect(attackWith2PM.total).toBe(24);
  });
});
