/**
 * TRPG Platform — Attributes Engine (Feature 6)
 * Tormenta 20 (Jogo do Ano) & Tormenta RPG Clássico (Edição Revisada)
 */

import { SystemMode, AttributeKey, AttributeBlock } from '../types';

export const ATTRIBUTE_KEYS: AttributeKey[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

export const ATTRIBUTE_NAMES: Record<AttributeKey, { pt: string; en: string }> = {
  FOR: { pt: 'Força', en: 'Strength' },
  DES: { pt: 'Destreza', en: 'Dexterity' },
  CON: { pt: 'Constituição', en: 'Constitution' },
  INT: { pt: 'Inteligência', en: 'Intelligence' },
  SAB: { pt: 'Sabedoria', en: 'Wisdom' },
  CAR: { pt: 'Carisma', en: 'Charisma' }
};

/**
 * T20 Point Buy Cost Table:
 * -1: -1 (refund)
 *  0:  0
 *  1:  1
 *  2:  2
 *  3:  4
 *  4:  7
 */
export const T20_POINT_BUY_COSTS: Record<number, number> = {
  '-1': -1,
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 7
};

/**
 * TRPG Point Buy Cost Table (scores 8-18 starting from 8):
 * 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
 * 14: 6, 15: 8, 16: 10, 17: 13, 18: 16
 */
export const TRPG_POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 6,
  15: 8,
  16: 10,
  17: 13,
  18: 16
};

/**
 * Standard arrays for quick character generation
 */
export const STANDARD_ARRAYS = {
  T20: [3, 2, 1, 1, 0, -1] as const,
  TRPG: [15, 14, 13, 12, 10, 8] as const
};

/**
 * Calculate TRPG modifier from classic score: floor((score - 10) / 2)
 */
export function calculateTRPGModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Get attribute modifier polymorphic for T20 (direct modifier) vs TRPG (calculated from score)
 */
export function getAttributeModifier(system: SystemMode, scoreOrMod: number): number {
  if (system === 'T20') {
    return scoreOrMod; // Direct modifier in T20
  }
  return calculateTRPGModifier(scoreOrMod);
}

/**
 * Calculate point buy cost for T20 attributes
 */
export function calculateT20PointBuyCost(mods: AttributeBlock | Record<string, number>): number {
  let total = 0;
  for (const key of ATTRIBUTE_KEYS) {
    const val = (mods as any)[key] ?? (mods as any)[key.toLowerCase()];
    if (val === undefined || T20_POINT_BUY_COSTS[val] === undefined) {
      throw new Error(`Invalid T20 attribute value ${val} for point buy`);
    }
    total += T20_POINT_BUY_COSTS[val];
  }
  return total;
}

/**
 * Calculate point buy cost for TRPG attribute scores
 */
export function calculateTRPGPointBuyCost(scores: AttributeBlock | Record<string, number>): number {
  let total = 0;
  for (const key of ATTRIBUTE_KEYS) {
    const score = (scores as any)[key] ?? (scores as any)[key.toLowerCase()];
    if (score === undefined || TRPG_POINT_BUY_COSTS[score] === undefined) {
      throw new Error(`Invalid TRPG attribute score ${score} for point buy`);
    }
    total += TRPG_POINT_BUY_COSTS[score];
  }
  return total;
}

/**
 * Convert a T20 direct modifier to an equivalent TRPG score:
 * Base 10 + 2 * mod
 */
export function convertT20ModToTRPGScore(mod: number): number {
  return 10 + 2 * mod;
}

/**
 * Convert a TRPG score to a T20 direct modifier
 */
export function convertTRPGScoreToT20Mod(score: number): number {
  return calculateTRPGModifier(score);
}

/**
 * Normalize an AttributeBlock ensuring all uppercase keys are populated
 */
export function normalizeAttributeBlock(
  input: AttributeBlock | Partial<AttributeBlock> | Record<string, number>
): AttributeBlock {
  const obj = input as Record<string, number>;
  return {
    FOR: obj.FOR ?? (obj as any).for ?? 0,
    DES: obj.DES ?? (obj as any).des ?? 0,
    CON: obj.CON ?? (obj as any).con ?? 0,
    INT: obj.INT ?? (obj as any).int ?? 0,
    SAB: obj.SAB ?? (obj as any).sab ?? 0,
    CAR: obj.CAR ?? (obj as any).car ?? 0
  };
}

/**
 * Validate an AttributeBlock against system expectations
 */
export function validateAttributes(
  system: SystemMode,
  attrs: Record<string, number>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const key of ATTRIBUTE_KEYS) {
    const val = attrs[key] ?? attrs[key.toLowerCase()];
    if (val === undefined || typeof val !== 'number' || Number.isNaN(val)) {
      errors.push(`Atributo ${key} está ausente ou não é um número válido.`);
      continue;
    }

    if (system === 'T20') {
      if (!Number.isInteger(val)) {
        errors.push(`Atributo T20 ${key} deve ser um número inteiro.`);
      }
    } else {
      if (!Number.isInteger(val) || val < 1) {
        errors.push(`Atributo TRPG ${key} deve ser um número inteiro positivo maior ou igual a 1.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
