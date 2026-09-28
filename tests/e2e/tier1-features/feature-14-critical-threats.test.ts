/**
 * E2E Tier 1 — Feature 14: Critical & Threat Detection
 * Opaque-box tests verifying threat ranges, Nat 20 auto-hits, Nat 1 auto-fails, and T20 vs TRPG confirmation
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 14: Critical & Threat Detection', () => {
  it('F14-T1: should treat Natural 20 as automatic hit regardless of target Defense', () => {
    // Attack roll Nat 20 with +2 bonus (total 22) against Defense 35
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+2',
      targetDefense: 35,
      threatRange: 20
    }, [20]);

    expect(res.isNatural20).toBe(true);
    expect(res.isHit).toBe(true);
    expect(res.isCriticalHit).toBe(true);
  });

  it('F14-T2: should treat Natural 1 as automatic failure regardless of high bonus', () => {
    // Attack roll Nat 1 with +25 bonus (total 26) against Defense 10
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+25',
      targetDefense: 10
    }, [1]);

    expect(res.isNatural1).toBe(true);
    expect(res.isFumble).toBe(true);
    expect(res.isHit).toBe(false);
  });

  it('F14-T3: should recognize configurable weapon threat margins (e.g. 19-20 for Espada Longa)', () => {
    // Espada Longa threat 19
    const res19 = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+5',
      threatRange: 19,
      targetDefense: 15
    }, [19]); // 19 + 5 = 24 >= 15 -> Critical Hit!

    expect(res19.isCriticalHit).toBe(true);

    const res18 = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+5',
      threatRange: 19,
      targetDefense: 15
    }, [18]); // 18 + 5 = 23 >= 15 -> Hit, but NOT Critical
    expect(res18.isHit).toBe(true);
    expect(res18.isCriticalHit).toBe(false);
  });

  it('F14-T4: should execute immediate critical in T20 without requiring confirmation roll', () => {
    // In T20: if primary d20 >= threat range and total >= defense -> immediate critical
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+7',
      system: 'T20',
      threatRange: 19,
      targetDefense: 20
    }, [19]); // 19 + 7 = 26 >= 20 -> Immediate Critical Hit
    expect(res.isCriticalHit).toBe(true);
  });

  it('F14-T5: should cancel threat if natural roll is in threat range but total misses target Defense', () => {
    // Threat 18-20, rolls 18 with +1 bonus (total 19) against Defense 25
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+1',
      threatRange: 18,
      targetDefense: 25
    }, [18]); // Misses Defense 25!
    expect(res.isHit).toBe(false);
    expect(res.isCriticalHit).toBe(false);
  });
});
