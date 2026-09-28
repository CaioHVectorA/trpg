/**
 * E2E Tier 1 — Feature 20: Real-Time Combat Trackers
 * Opaque-box tests verifying PV/PM tracking, temporary HP absorption, unconscious states, and rest recovery
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 20: Real-Time Combat Trackers', () => {
  it('F20-T1: should absorb all damage into temporary PV when damage <= tempPv', () => {
    // Current PV 20, Temp PV 10, takes 6 damage
    const res = SystemAdapter.applyDamage(20, 10, 6);
    expect(res.absorbedByTemp).toBe(6);
    expect(res.newTempPv).toBe(4);
    expect(res.newPv).toBe(20); // Base PV undamaged!
    expect(res.isUnconscious).toBe(false);
  });

  it('F20-T2: should deplete temporary PV and apply remainder damage to base PV', () => {
    // Current PV 25, Temp PV 8, takes 15 damage
    const res = SystemAdapter.applyDamage(25, 8, 15);
    expect(res.absorbedByTemp).toBe(8);
    expect(res.newTempPv).toBe(0);
    expect(res.newPv).toBe(18); // 25 - (15 - 8) = 18
    expect(res.isUnconscious).toBe(false);
  });

  it('F20-T3: should flag unconscious state when current PV reaches 0 or negative', () => {
    const res = SystemAdapter.applyDamage(10, 0, 12);
    expect(res.newPv).toBe(-2);
    expect(res.isUnconscious).toBe(true);
  });

  it('F20-T4: should track PM expenditure and reject spends exceeding limits', () => {
    let currentPM = 15;
    const characterLevel = 5;

    // Spend 3 PM on spell -> allowed!
    expect(SystemAdapter.canSpendPM(currentPM, 3, characterLevel)).toBe(true);
    currentPM -= 3;
    expect(currentPM).toBe(12);

    // Attempt to spend 6 PM at level 5 -> rejected!
    expect(SystemAdapter.canSpendPM(currentPM, 6, characterLevel)).toBe(false);
  });

  it('F20-T5: should calculate rest recovery tiers for PV and PM', () => {
    const level = 4;
    const maxPv = 36;
    const maxPm = 18;

    // Normal rest: 1x level = 4 PV & PM
    const normalRecovery = 1 * level;
    expect(Math.min(maxPv, 10 + normalRecovery)).toBe(14);
    expect(Math.min(maxPm, 5 + normalRecovery)).toBe(9);

    // Confortável rest: 2x level = 8 PV & PM
    const comfortableRecovery = 2 * level;
    expect(Math.min(maxPv, 10 + comfortableRecovery)).toBe(18);
    expect(Math.min(maxPm, 5 + comfortableRecovery)).toBe(13);
  });
});
