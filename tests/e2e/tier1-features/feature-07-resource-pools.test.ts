/**
 * E2E Tier 1 — Feature 7: Resource Pools (PV & PM)
 * Opaque-box tests verifying hit point progressions, mana pools, and instant death thresholds
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 7: Resource Pools (PV & PM)', () => {
  it('F7-T1: should calculate deterministic T20 PV progression without rolling dice', () => {
    // Guerreiro level 1 with CON +2: 20 + 2 = 22
    const pv1 = SystemAdapter.calculatePvMax('T20', 'Guerreiro', 1, 2);
    expect(pv1).toBe(22);

    // Guerreiro level 5 with CON +2: 22 + (4 * (5 + 2)) = 22 + 28 = 50
    const pv5 = SystemAdapter.calculatePvMax('T20', 'Guerreiro', 5, 2);
    expect(pv5).toBe(50);
  });

  it('F7-T2: should ensure character gains at least 1 PV per level even with negative Constitution', () => {
    // Arcanista (BasePV 8, PerLevel 2) with CON -3
    // Level 1: max(1, 8 - 3) = 5
    const pv1 = SystemAdapter.calculatePvMax('T20', 'Arcanista', 1, -3);
    expect(pv1).toBe(5);

    // Level 2: 5 + max(1, 2 - 3) = 5 + 1 = 6
    const pv2 = SystemAdapter.calculatePvMax('T20', 'Arcanista', 2, -3);
    expect(pv2).toBe(6);

    // Level 10: 5 + 9 * 1 = 14
    const pv10 = SystemAdapter.calculatePvMax('T20', 'Arcanista', 10, -3);
    expect(pv10).toBe(14);
  });

  it('F7-T3: should calculate T20 PM progression with key attribute applied at level 1', () => {
    // Arcanista level 1 with INT +4: 6 + 4 = 10 PM
    const pm1 = SystemAdapter.calculatePmMax('T20', 'Arcanista', 1, 4);
    expect(pm1).toBe(10);

    // Arcanista level 5: 10 + (4 * 6) = 34 PM
    const pm5 = SystemAdapter.calculatePmMax('T20', 'Arcanista', 5, 4);
    expect(pm5).toBe(34);
  });

  it('F7-T4: should calculate TRPG PV and PM resource pools using classic progression', () => {
    // TRPG Guerreiro (d10, avg die 6) level 3 with CON 14 (+2 mod)
    // Level 1: 20 + 2 = 22. Level 3: 22 + 2 * (11 + 2) or avg die
    const pv3 = SystemAdapter.calculatePvMax('TRPG', 'Guerreiro', 3, 14);
    expect(pv3).toBeGreaterThanOrEqual(30);

    const pm3 = SystemAdapter.calculatePmMax('TRPG', 'Guerreiro', 3, 10);
    expect(pm3).toBeGreaterThan(0);
  });

  it('F7-T5: should enforce instant death threshold (-pvMax/2 for T20 vs -CON for TRPG)', () => {
    // T20: Character with 36 PV Max dies instantly if dropping to -18 PV
    const t20Threshold = SystemAdapter.getInstantDeathThreshold('T20', 36, 2);
    expect(t20Threshold).toBe(-18);

    // TRPG: Character with CON 16 dies if negative PV reaches -16 (or -10)
    const trpgThreshold = SystemAdapter.getInstantDeathThreshold('TRPG', 36, 16);
    expect(trpgThreshold).toBe(-16);
  });
});
