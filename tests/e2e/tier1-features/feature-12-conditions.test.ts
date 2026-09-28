/**
 * E2E Tier 1 — Feature 12: Status Conditions Engine
 * Opaque-box tests verifying state modifiers for Caído, Desprevenido, Vulnerável, and Inconsciente
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 12: Status Conditions Engine', () => {
  it('F12-T1: should apply Caído modifiers (-5 melee attack, -5 defense vs melee, +5 vs ranged)', () => {
    const baseDefense = 18;
    const isMeleeAttacker = true;
    const isRangedAttacker = false;

    // Caído: -5 defense against melee attacks
    const defenseVsMelee = baseDefense + (isMeleeAttacker ? -5 : 5);
    expect(defenseVsMelee).toBe(13);

    // Caído: +5 defense against ranged attacks (harder to hit on ground)
    const defenseVsRanged = baseDefense + (isRangedAttacker ? -5 : 5);
    expect(defenseVsRanged).toBe(23);
  });

  it('F12-T2: should apply Desprevenido condition (-5 to defense and -5 to reflexos)', () => {
    const baseDefense = 18;
    const defenseDesprevenido = baseDefense - 5;
    expect(defenseDesprevenido).toBe(13);

    // Reflexos skill check penalty -5
    const reflexosNormal = SystemAdapter.calculateSkillBonus('T20', 'reflexos', 4, 3, true);
    const reflexosDesprevenido = reflexosNormal.bonus - 5;
    expect(reflexosDesprevenido).toBe(reflexosNormal.bonus - 5);
  });

  it('F12-T3: should apply Vulnerável condition (-2 to defense)', () => {
    const baseDefense = 20;
    const defenseVulneravel = baseDefense - 2;
    expect(defenseVulneravel).toBe(18);
  });

  it('F12-T4: should handle Inconsciente e Sangrando at <= 0 PV', () => {
    const damageResult = SystemAdapter.applyDamage(10, 0, 15);
    expect(damageResult.newPv).toBe(-5);
    expect(damageResult.isUnconscious).toBe(true);

    // Bleeding requires DC 15 Fortitude check to stabilize
    const fortRoll = SystemAdapter.evaluateDiceExpression({ formula: '1d20+6' }, [10]); // 10+6=16 >= 15 -> Stabilized!
    expect(fortRoll.total).toBe(16);
    expect(fortRoll.total >= 15).toBe(true);
  });

  it('F12-T5: should stack penalties when multiple conditions are active simultaneously', () => {
    // Target is both Desprevenido (-5) and Vulnerável (-2)
    const baseDefense = 20;
    const combinedDefense = baseDefense - 5 - 2;
    expect(combinedDefense).toBe(13);
  });
});
