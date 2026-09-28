/**
 * TRPG Platform — Defense & Armor Class Engine (Feature 9)
 * T20 Defesa (no half-level, heavy armor zeroes DEX) vs TRPG CA
 */

import { SystemMode } from '../types';
import { getAttributeModifier } from './attributes';

export interface DefenseCalculationOptions {
  armorBonus?: number;
  shieldBonus?: number;
  isHeavyArmor?: boolean;
  maxDexterity?: number;
  otherBonus?: number;
  sizeMod?: number;
}

/**
 * Calculates Defense (T20) or Armor Class (TRPG).
 *
 * T20 Rules:
 * - Base = 10
 * - Player Characters DO NOT add half-level to Defesa.
 * - Heavy Armor: Dexterity modifier is forced to 0 (+0).
 * - Light / No Armor: Full Dexterity modifier applies (positive or negative).
 * - Formula: 10 + effectiveDES + armorBonus + shieldBonus + otherBonus + sizeMod
 *
 * TRPG Rules:
 * - Base = 10
 * - Half-level IS added: floor(level / 2)
 * - Dexterity modifier is capped at maxDexterity if positive. Negative DEX applies in full.
 * - Formula: 10 + floor(level / 2) + cappedDES + armorBonus + shieldBonus + sizeMod + otherBonus
 */
export function calculateDefense(
  system: SystemMode,
  level: number,
  desScoreOrMod: number,
  armorBonus: number = 0,
  shieldBonus: number = 0,
  isHeavyArmor: boolean = false,
  maxDexterity?: number,
  otherBonus: number = 0,
  sizeMod: number = 0
): number {
  const desMod = getAttributeModifier(system, desScoreOrMod);

  if (system === 'T20') {
    const effectiveDes = isHeavyArmor ? 0 : desMod;
    return 10 + effectiveDes + armorBonus + shieldBonus + otherBonus + sizeMod;
  } else {
    const halfLevel = Math.floor(level / 2);
    let effectiveDes = desMod;
    if (maxDexterity !== undefined && desMod > maxDexterity) {
      effectiveDes = maxDexterity;
    }
    return 10 + halfLevel + effectiveDes + armorBonus + shieldBonus + sizeMod + otherBonus;
  }
}

/**
 * Determines whether an attack roll meets or beats the target's Defense/CA.
 * In Tormenta (T20 & TRPG), tie hits the defender!
 */
export function isAttackHit(attackTotal: number, targetDefense: number): boolean {
  return attackTotal >= targetDefense;
}
