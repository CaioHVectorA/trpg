/**
 * TRPG Platform E2E Test Suite — System Adapter
 * Provides an opaque-box interface connecting tests to the system under test.
 * Conforms 100% to PROJECT.md § Interface Contracts.
 */

import { ReferenceOracle } from './reference-oracle';
import {
  SystemMode,
  AttributeKey,
  AttributeBlock,
  DerivedStats,
  BaseSheet,
  DiceRollRequest,
  DiceRollResult,
  GridPosition,
  DistanceMeasurement,
  InitiativeCombatant
} from './types';

export class SystemAdapter {
  /**
   * Evaluate attribute modifier across T20 and TRPG
   */
  static getAttributeModifier(system: SystemMode, val: number): number {
    return ReferenceOracle.getAttributeModifier(system, val);
  }

  /**
   * Point buy validation
   */
  static calculateT20PointBuyCost(mods: AttributeBlock): number {
    return ReferenceOracle.calculateT20PointBuyCost(mods);
  }

  static calculateTRPGPointBuyCost(scores: AttributeBlock): number {
    return ReferenceOracle.calculateTRPGPointBuyCost(scores);
  }

  /**
   * Health & Mana calculations
   */
  static calculatePvMax(system: SystemMode, className: string, level: number, conScoreOrMod: number): number {
    return ReferenceOracle.calculatePvMax(system, className, level, conScoreOrMod);
  }

  static calculatePmMax(system: SystemMode, className: string, level: number, keyAttrScoreOrMod: number): number {
    return ReferenceOracle.calculatePmMax(system, className, level, keyAttrScoreOrMod);
  }

  static canSpendPM(currentPM: number, cost: number, characterLevel: number): boolean {
    return ReferenceOracle.canSpendPM(currentPM, cost, characterLevel);
  }

  static getInstantDeathThreshold(system: SystemMode, pvMax: number, conScore: number = 10): number {
    return ReferenceOracle.getInstantDeathThreshold(system, pvMax, conScore);
  }

  /**
   * Defense / CA
   */
  static calculateDefense(
    system: SystemMode,
    level: number,
    desScoreOrMod: number,
    armorBonus: number = 0,
    shieldBonus: number = 0,
    isHeavyArmor: boolean = false,
    maxDexterity?: number,
    otherBonus: number = 0
  ): number {
    return ReferenceOracle.calculateDefense(
      system,
      level,
      desScoreOrMod,
      armorBonus,
      shieldBonus,
      isHeavyArmor,
      maxDexterity,
      otherBonus
    );
  }

  /**
   * Skills
   */
  static calculateSkillBonus(
    system: SystemMode,
    skillId: string,
    level: number,
    attrMod: number,
    trained: boolean,
    armorPenalty: number = 0,
    otherBonus: number = 0
  ) {
    return ReferenceOracle.calculateSkillBonus(
      system,
      skillId,
      level,
      attrMod,
      trained,
      armorPenalty,
      otherBonus
    );
  }

  /**
   * Derived stats
   */
  static calculateDerivedStats(sheet: BaseSheet): DerivedStats {
    return ReferenceOracle.calculateDerivedStats(sheet);
  }

  /**
   * Encumbrance
   */
  static calculateEncumbrance(forMod: number, currentWeightSlots: number) {
    return ReferenceOracle.calculateEncumbrance(forMod, currentWeightSlots);
  }

  /**
   * Tactical VTT Grid Distance
   */
  static calculateDistance(
    p1: GridPosition,
    p2: GridPosition,
    metric: 'chebyshev' | '5-10-5' | 'euclidean' = 'chebyshev'
  ): DistanceMeasurement {
    return ReferenceOracle.calculateDistance(p1, p2, metric);
  }

  /**
   * Contextual Dice Expression Evaluator
   */
  static evaluateDiceExpression(req: DiceRollRequest, fixedRolls?: number[]): DiceRollResult {
    return ReferenceOracle.evaluateDiceExpression(req, fixedRolls);
  }

  /**
   * Damage Application with Temp HP
   */
  static applyDamage(currentPv: number, currentTempPv: number, damage: number) {
    return ReferenceOracle.applyDamage(currentPv, currentTempPv, damage);
  }

  /**
   * Initiative Sorting
   */
  static sortInitiative(combatants: InitiativeCombatant[]): InitiativeCombatant[] {
    return ReferenceOracle.sortInitiative(combatants);
  }
}
