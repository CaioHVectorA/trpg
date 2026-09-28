/**
 * TRPG Platform — Encumbrance & Armor Penalty Engine (Feature 11)
 * Weight Capacity (T20 slots & TRPG kg), Overload Penalties, and Speed Reductions
 */

export interface EncumbranceResult {
  maxSlots: number;
  isOverloaded: boolean;
  additionalArmorPenalty: number;
  speedReductionMeters: number;
}

/**
 * Calculates T20 carrying capacity and overload state.
 *
 * Rules:
 * - Max Slots = max(1, FOR_mod) * 3
 * - If currentWeightSlots > maxSlots:
 *   - Character is Overloaded (Sobrecarregado).
 *   - Additional armor penalty: +2 (applies as -2 to checks).
 *   - Movement speed reduction: 3 meters (uniform regardless of excess).
 */
export function calculateEncumbrance(
  forMod: number,
  currentWeightSlots: number
): EncumbranceResult {
  const maxSlots = Math.max(1, forMod) * 3;
  const isOverloaded = currentWeightSlots > maxSlots;

  return {
    maxSlots,
    isOverloaded,
    additionalArmorPenalty: isOverloaded ? 2 : 0,
    speedReductionMeters: isOverloaded ? 3 : 0
  };
}

/**
 * Physical skills that suffer Armor Penalty in T20:
 * - Acrobacia (DES)
 * - Furtividade (DES)
 * - Ladinagem (DES)
 */
export const T20_ARMOR_PENALTY_SKILLS = new Set([
  'acrobacia',
  'furtividade',
  'ladinagem'
]);

/**
 * Physical skills that suffer Armor Penalty in TRPG:
 * - Acrobacia, Arte da Fuga, Atletismo, Furtividade, Ladinagem, Operar Mecanismo
 */
export const TRPG_ARMOR_PENALTY_SKILLS = new Set([
  'acrobacia',
  'artedafuga',
  'atletismo',
  'furtividade',
  'ladinagem',
  'operarmecanismo'
]);

/**
 * Determines whether a skill is subject to armor check penalty
 */
export function isSkillPenalizedByArmor(skillId: string, system: 'T20' | 'TRPG' = 'T20'): boolean {
  const norm = skillId.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (system === 'T20') {
    return T20_ARMOR_PENALTY_SKILLS.has(norm);
  }
  return TRPG_ARMOR_PENALTY_SKILLS.has(norm);
}

/**
 * Computes total effective armor penalty including equipped armor, shield, and overload
 */
export function calculateTotalArmorPenalty(
  armorPenalty: number = 0,
  shieldPenalty: number = 0,
  isOverloaded: boolean = false
): number {
  return armorPenalty + shieldPenalty + (isOverloaded ? 2 : 0);
}

export type TRPGLoadTier = 'leve' | 'media' | 'pesada' | 'descomunal';

export interface TRPGEncumbranceResult {
  lightMaxKg: number;
  mediumMaxKg: number;
  heavyMaxKg: number;
  tier: TRPGLoadTier;
  armorPenalty: number;
  maxDexterity?: number;
  speedMeters: number;
}

/**
 * Standard TRPG weight capacity table (based on classic d20 / 3.5 rules)
 */
export function calculateTRPGEncumbrance(
  forScore: number,
  currentKg: number
): TRPGEncumbranceResult {
  // Approximate standard d20 capacity scaling:
  // Base light load ~ FOR * 3.3 kg, medium ~ 2x light, heavy ~ 3x light
  const baseWeight = Math.max(1, forScore);
  const lightMax = Math.round(baseWeight * 3.3);
  const mediumMax = Math.round(lightMax * 2);
  const heavyMax = Math.round(lightMax * 3);

  let tier: TRPGLoadTier = 'leve';
  let armorPenalty = 0;
  let maxDexterity: number | undefined = undefined;
  let speedMeters = 9;

  if (currentKg <= lightMax) {
    tier = 'leve';
    armorPenalty = 0;
    speedMeters = 9;
  } else if (currentKg <= mediumMax) {
    tier = 'media';
    armorPenalty = 3;
    maxDexterity = 3;
    speedMeters = 6;
  } else if (currentKg <= heavyMax) {
    tier = 'pesada';
    armorPenalty = 6;
    maxDexterity = 1;
    speedMeters = 6;
  } else {
    tier = 'descomunal';
    armorPenalty = 9;
    maxDexterity = 0;
    speedMeters = 1.5;
  }

  return {
    lightMaxKg: lightMax,
    mediumMaxKg: mediumMax,
    heavyMaxKg: heavyMax,
    tier,
    armorPenalty,
    maxDexterity,
    speedMeters
  };
}
