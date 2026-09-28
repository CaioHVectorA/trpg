/**
 * Tactical VTT Token Management System
 * Supports Tormenta size categories (Minúsculo to Colossal) and shorthand (P, M, G, E),
 * HP/PM overlays, and conditions management.
 */

import { VttToken } from '@/lib/types';

export type TokenSizeCategory =
  | 'MINUSCULO'
  | 'PEQUENO'
  | 'MEDIO'
  | 'GRANDE'
  | 'ENORME'
  | 'COLOSSAL';

export type TokenSizeShorthand = 'MIN' | 'P' | 'M' | 'G' | 'E' | 'COL';

export const SIZE_TO_CELL_DIMENSION: Record<TokenSizeCategory, number> = {
  MINUSCULO: 0.5,
  PEQUENO: 1,
  MEDIO: 1,
  GRANDE: 2,
  ENORME: 3,
  COLOSSAL: 4,
};

/**
 * Normalizes any size representation (P/M/G/E or canonical English/Portuguese)
 * to standard TokenSizeCategory
 */
export function normalizeTokenSize(size: string | undefined): TokenSizeCategory {
  if (!size) return 'MEDIO';
  const s = size.toUpperCase().trim();

  switch (s) {
    case 'MIN':
    case 'MINUSCULO':
    case 'MINÚSCULO':
    case 'TINY':
      return 'MINUSCULO';

    case 'P':
    case 'PEQUENO':
    case 'SMALL':
      return 'PEQUENO';

    case 'M':
    case 'MEDIO':
    case 'MÉDIO':
    case 'MEDIUM':
      return 'MEDIO';

    case 'G':
    case 'GRANDE':
    case 'LARGE':
      return 'GRANDE';

    case 'E':
    case 'ENORME':
    case 'HUGE':
      return 'ENORME';

    case 'COL':
    case 'COLOSSAL':
    case 'GARGANTUAN':
      return 'COLOSSAL';

    default:
      return 'MEDIO';
  }
}

/**
 * Returns grid cell footprint dimension (e.g. 1, 2, 3, 4, 0.5)
 */
export function getTokenDimension(size: string | undefined): number {
  const normalized = normalizeTokenSize(size);
  return SIZE_TO_CELL_DIMENSION[normalized];
}

/**
 * Computes HP percentage clamped between 0 and 100
 */
export function calculateHpPercentage(pvCurrent: number, pvMax: number): number {
  if (pvMax <= 0) return 0;
  const pct = (pvCurrent / pvMax) * 100;
  return Math.max(0, Math.min(100, pct));
}

/**
 * Returns color hex for HP status (Green >50%, Amber 25-50%, Red <25%)
 */
export function getHpBarColor(percentage: number): string {
  if (percentage > 50) return '#10B981'; // emerald-500
  if (percentage >= 25) return '#F59E0B'; // amber-500
  return '#EF4444'; // red-500
}

/**
 * Safely parses condition arrays or JSON string representation
 */
export function parseConditions(input: string | string[] | undefined | null): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Toggles a condition in the active list
 */
export function toggleCondition(conditions: string[], conditionName: string): string[] {
  if (conditions.includes(conditionName)) {
    return conditions.filter((c) => c !== conditionName);
  }
  return [...conditions, conditionName];
}

/**
 * Applies HP damage or healing to a token with temporary HP absorption
 */
export function applyTokenHpDelta(
  token: VttToken,
  delta: number
): {
  updatedToken: VttToken;
  effectiveDamage: number;
  tempHpAbsorbed: number;
} {
  let pvCurrent = token.pvCurrent;
  let pvTemp = token.pvTemp ?? 0;
  let conditions = [...token.conditions];
  let tempHpAbsorbed = 0;
  let effectiveDamage = 0;

  if (delta < 0) {
    // Damage
    const damage = Math.abs(delta);
    if (pvTemp > 0) {
      if (pvTemp >= damage) {
        tempHpAbsorbed = damage;
        pvTemp -= damage;
      } else {
        tempHpAbsorbed = pvTemp;
        const remainder = damage - pvTemp;
        pvTemp = 0;
        pvCurrent -= remainder;
        effectiveDamage = remainder;
      }
    } else {
      pvCurrent -= damage;
      effectiveDamage = damage;
    }

    // Auto-conditions for critical health
    if (pvCurrent <= 0 && !conditions.includes('Inconsciente')) {
      conditions.push('Inconsciente');
    }
    if (pvCurrent <= 0 && !conditions.includes('Sangrando')) {
      conditions.push('Sangrando');
    }
  } else if (delta > 0) {
    // Healing
    pvCurrent = Math.min(token.pvMax, pvCurrent + delta);
    // If brought above 0, clear Inconsciente and Sangrando
    if (pvCurrent > 0) {
      conditions = conditions.filter(
        (c) => c !== 'Inconsciente' && c !== 'Sangrando'
      );
    }
  }

  return {
    updatedToken: {
      ...token,
      pvCurrent,
      pvTemp,
      conditions,
    },
    effectiveDamage,
    tempHpAbsorbed,
  };
}
