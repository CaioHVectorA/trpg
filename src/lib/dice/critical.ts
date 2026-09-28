/**
 * TRPG Platform — Critical & Threat Range Mechanics
 * Handles Natural 20 auto-hits, Natural 1 auto-fails, configurable threat margins,
 * and T20 vs TRPG critical damage calculations.
 */

import { SystemMode } from '../types';

export interface CriticalCheckParams {
  system?: SystemMode;
  threatRange?: number;
  critMultiplier?: number;
  targetDefense?: number;
  rolls: Array<{ die: number; result: number }>;
  total: number;
  modifiers: number;
}

export interface CriticalOutcome {
  isNatural20: boolean;
  isNatural1: boolean;
  isThreat: boolean;
  isHit: boolean;
  isCriticalHit: boolean;
  isFumble: boolean;
  damageResult?: {
    diceTotal: number;
    staticBonus: number;
    finalDamage: number;
    formulaUsed: string;
  };
}

/**
 * Evaluates threat detection, automatic hits/fumbles, and critical damage resolution.
 */
export function evaluateCriticalOutcome(params: CriticalCheckParams): CriticalOutcome {
  const {
    system = 'T20',
    threatRange = 20,
    critMultiplier,
    targetDefense,
    rolls,
    total,
    modifiers
  } = params;

  // Find d20 rolls
  const d20Rolls = rolls.filter(r => r.die === 20);
  const hasD20 = d20Rolls.length > 0;
  const primaryD20 = d20Rolls[0]?.result ?? 0;

  // Natural 20 and Natural 1 flags
  // In advantage/disadvantage, check if any evaluated d20 triggered nat 20 / nat 1
  const isNatural20 = d20Rolls.some(r => r.result === 20);
  const isNatural1 = d20Rolls.some(r => r.result === 1);
  const isFumble = isNatural1;

  // Threat range detection
  const isThreat = hasD20 ? primaryD20 >= threatRange : false;

  // Hit determination
  let isHit = true;
  if (hasD20) {
    if (isNatural1) {
      isHit = false; // Nat 1 is always an automatic failure
    } else if (isNatural20) {
      isHit = true;  // Nat 20 is always an automatic hit
    } else if (targetDefense !== undefined) {
      isHit = total >= targetDefense; // Ties hit
    }
  }

  // Critical hit determination
  // In T20 / TRPG:
  // If attack roll (has d20):
  //   - Natural 20 is always a critical hit
  //   - Threat roll is critical hit ONLY if the attack also hits target defense
  // If pure damage roll without d20:
  //   - Triggers critical if critMultiplier > 1 is explicitly passed
  const isCriticalHit = hasD20
    ? (isNatural20 || (isThreat && isHit))
    : (critMultiplier !== undefined && critMultiplier > 1);

  // Critical Damage computation
  let damageResult: CriticalOutcome['damageResult'] = undefined;
  if (critMultiplier && isCriticalHit) {
    const diceTotal = total - modifiers;
    const staticBonus = modifiers;

    if (system === 'TRPG') {
      // TRPG Classic: multiplies entire total (dice + flat static bonus)
      const finalDamage = total * critMultiplier;
      damageResult = {
        diceTotal,
        staticBonus,
        finalDamage,
        formulaUsed: `(Formula) * ${critMultiplier}`
      };
    } else {
      // T20 Jogo do Ano: multiplies ONLY base damage dice; static bonuses are kept single
      const finalDamage = (diceTotal * critMultiplier) + staticBonus;
      damageResult = {
        diceTotal,
        staticBonus,
        finalDamage,
        formulaUsed: `BaseDice * ${critMultiplier} + Mods`
      };
    }
  }

  return {
    isNatural20,
    isNatural1,
    isThreat,
    isHit,
    isCriticalHit,
    isFumble,
    damageResult
  };
}
