/**
 * TRPG Platform — Resource Pools Engine (Features 7 & 8)
 * PV (Hit Points), PM (Mana Points), Spending Limits, and Resting
 */

import { SystemMode, AttributeKey } from '../types';
import { getAttributeModifier } from './attributes';

export interface ClassResourceConstants {
  basePv: number;
  pvPerLevel: number;
  basePm: number;
  pmPerLevel: number;
  keyAttr: AttributeKey;
}

export const T20_CLASS_CONSTANTS: Record<string, ClassResourceConstants> = {
  arcanista: { basePv: 8, pvPerLevel: 2, basePm: 6, pmPerLevel: 6, keyAttr: 'INT' },
  bardo: { basePv: 12, pvPerLevel: 3, basePm: 4, pmPerLevel: 4, keyAttr: 'CAR' },
  inventor: { basePv: 12, pvPerLevel: 3, basePm: 4, pmPerLevel: 4, keyAttr: 'INT' },
  ladino: { basePv: 12, pvPerLevel: 3, basePm: 3, pmPerLevel: 3, keyAttr: 'INT' },
  bucaneiro: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'CAR' },
  cacador: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'SAB' },
  caçador: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'SAB' },
  cavaleiro: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'CAR' },
  clerigo: { basePv: 16, pvPerLevel: 4, basePm: 5, pmPerLevel: 5, keyAttr: 'SAB' },
  clérigo: { basePv: 16, pvPerLevel: 4, basePm: 5, pmPerLevel: 5, keyAttr: 'SAB' },
  druida: { basePv: 16, pvPerLevel: 4, basePm: 4, pmPerLevel: 4, keyAttr: 'SAB' },
  nobre: { basePv: 16, pvPerLevel: 4, basePm: 4, pmPerLevel: 4, keyAttr: 'CAR' },
  guerreiro: { basePv: 20, pvPerLevel: 5, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' },
  lutador: { basePv: 20, pvPerLevel: 5, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' },
  paladino: { basePv: 20, pvPerLevel: 5, basePm: 3, pmPerLevel: 3, keyAttr: 'CAR' },
  barbaro: { basePv: 24, pvPerLevel: 6, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' },
  bárbaro: { basePv: 24, pvPerLevel: 6, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' }
};

export const T20_MARTIAL_CLASSES = new Set([
  'guerreiro',
  'barbaro',
  'bárbaro',
  'bucaneiro',
  'cacador',
  'caçador',
  'cavaleiro',
  'ladino',
  'lutador'
]);

/**
 * Calculates Maximum PV for character.
 * T20: Deterministic!
 *   Level 1: BasePV + CON_mod (min 1)
 *   Level N: PV_1 + (N - 1) * max(1, PerLevelPV + CON_mod)
 * TRPG:
 *   Level 1: BasePV + CON_mod
 *   Level N: PV_1 + (N - 1) * max(1, avgDie + CON_mod)
 */
export function calculatePvMax(
  system: SystemMode,
  className: string,
  level: number,
  conScoreOrMod: number
): number {
  const conMod = getAttributeModifier(system, conScoreOrMod);
  const normalizedClass = className.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const classData = T20_CLASS_CONSTANTS[normalizedClass] ||
    T20_CLASS_CONSTANTS[className.toLowerCase()] ||
    { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' };

  if (system === 'T20') {
    const pv1 = Math.max(1, classData.basePv + conMod);
    if (level <= 1) return pv1;
    const perLevel = Math.max(1, classData.pvPerLevel + conMod);
    return pv1 + (level - 1) * perLevel;
  } else {
    const pv1 = Math.max(1, classData.basePv + conMod);
    if (level <= 1) return pv1;
    const avgDie = Math.floor(classData.basePv / 2) + 1;
    const perLevel = Math.max(1, avgDie + conMod);
    return pv1 + (level - 1) * perLevel;
  }
}

/**
 * Calculates Maximum PM for character.
 * T20:
 *   Level 1: BasePM + (Martial ? 0 : KeyAttr_mod) (clamped min 0)
 *   Level N: PM_1 + (N - 1) * PerLevelPM
 * TRPG:
 *   BasePM + (N - 1) * PerLevelPM + KeyAttr_mod
 */
export function calculatePmMax(
  system: SystemMode,
  className: string,
  level: number,
  keyAttrScoreOrMod: number
): number {
  const keyMod = getAttributeModifier(system, keyAttrScoreOrMod);
  const normalizedClass = className.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const classData = T20_CLASS_CONSTANTS[normalizedClass] ||
    T20_CLASS_CONSTANTS[className.toLowerCase()] ||
    { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'INT' };

  if (system === 'T20') {
    const isMartial = T20_MARTIAL_CLASSES.has(normalizedClass);
    const effectiveKeyMod = isMartial ? 0 : keyMod;
    const pm1 = Math.max(0, classData.basePm + effectiveKeyMod);
    if (level <= 1) return pm1;
    return pm1 + (level - 1) * classData.pmPerLevel;
  } else {
    const total = classData.basePm + (level - 1) * classData.pmPerLevel + keyMod;
    return Math.max(0, total);
  }
}

/**
 * T20 PM Expenditure Limit (Feature 8):
 * A character cannot spend more PM on an action or ability than their character level.
 * Also cannot spend more than current PM, nor negative PM.
 */
export function canSpendPM(currentPM: number, cost: number, characterLevel: number): boolean {
  if (cost < 0) return false;
  if (cost > characterLevel) return false;
  if (cost > currentPM) return false;
  return true;
}

/**
 * Instant Death Threshold:
 * T20: -floor(pvMax / 2)
 * TRPG: -max(10, conScore)
 */
export function getInstantDeathThreshold(
  system: SystemMode,
  pvMax: number,
  conScore: number = 10
): number {
  if (system === 'T20') {
    const threshold = -Math.floor(pvMax / 2);
    return threshold === 0 ? 0 : threshold;
  }
  const threshold = -Math.max(10, conScore);
  return threshold === 0 ? 0 : threshold;
}

export interface DamageResult {
  newPv: number;
  newTempPv: number;
  absorbedByTemp: number;
  isUnconscious: boolean;
  isDead: boolean;
}

/**
 * Applies damage taking temporary PV into account first.
 */
export function applyDamage(
  currentPv: number,
  currentTempPv: number,
  damage: number,
  pvMax?: number,
  conScore: number = 10,
  system: SystemMode = 'T20'
): DamageResult {
  const safeDamage = Math.max(0, damage);
  const absorbedByTemp = Math.min(currentTempPv, safeDamage);
  const newTempPv = currentTempPv - absorbedByTemp;
  const remainingDamage = safeDamage - absorbedByTemp;
  const newPv = currentPv - remainingDamage;

  const isUnconscious = newPv <= 0;
  const isDead = pvMax !== undefined ? newPv <= getInstantDeathThreshold(system, pvMax, conScore) : false;

  return {
    newPv,
    newTempPv,
    absorbedByTemp,
    isUnconscious,
    isDead
  };
}

/**
 * Applies healing up to maximum PV.
 */
export function applyHealing(
  currentPv: number,
  pvMax: number,
  healAmount: number
): { newPv: number; overheal: number } {
  const safeHeal = Math.max(0, healAmount);
  const potentialPv = currentPv + safeHeal;
  const newPv = Math.min(pvMax, potentialPv);
  const overheal = Math.max(0, potentialPv - pvMax);

  return {
    newPv,
    overheal
  };
}

export type RestQuality = 'ruim' | 'normal' | 'confortavel' | 'luxuoso';

/**
 * Calculates PV and PM recovery after 8 hours of rest.
 */
export function calculateRestRecovery(
  level: number,
  quality: RestQuality,
  pvMax: number,
  pmMax: number
): { recoveredPv: number; recoveredPm: number } {
  switch (quality) {
    case 'ruim':
    case 'normal':
      return {
        recoveredPv: Math.min(pvMax, level),
        recoveredPm: Math.min(pmMax, level)
      };
    case 'confortavel':
      return {
        recoveredPv: Math.min(pvMax, level * 2),
        recoveredPm: Math.min(pmMax, level * 2)
      };
    case 'luxuoso':
      return {
        recoveredPv: pvMax,
        recoveredPm: pmMax
      };
  }
}
