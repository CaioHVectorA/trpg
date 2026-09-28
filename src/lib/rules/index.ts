/**
 * TRPG Platform — Pure Rules Engine Unified API
 * Tormenta 20 (Jogo do Ano) & Tormenta RPG Clássico (Edição Revisada)
 * Conforms 100% to PROJECT.md § Interface Contracts.
 */

import {
  SystemMode,
  AttributeKey,
  AttributeBlock,
  DerivedStats,
  BaseSheet
} from '../types';

export * from './attributes';
export * from './pools';
export * from './defense';
export * from './skills';
export * from './encumbrance';
export * from './conditions';

import {
  getAttributeModifier,
  calculateT20PointBuyCost,
  calculateTRPGPointBuyCost,
  normalizeAttributeBlock
} from './attributes';

import {
  T20_CLASS_CONSTANTS,
  calculatePvMax,
  calculatePmMax,
  canSpendPM,
  getInstantDeathThreshold,
  applyDamage,
  applyHealing,
  calculateRestRecovery
} from './pools';

import {
  calculateDefense,
  isAttackHit
} from './defense';

import {
  T20_SKILLS,
  calculateSkillBonus,
  getT20TrainingBonus,
  SkillCalculationResult
} from './skills';

import {
  calculateEncumbrance,
  calculateTotalArmorPenalty,
  isSkillPenalizedByArmor,
  calculateTRPGEncumbrance
} from './encumbrance';

import {
  CONDITIONS_CATALOG,
  calculateConditionsDefenseModifier,
  calculateConditionsAttackModifier,
  calculateConditionsSkillModifier,
  isActionPrevented
} from './conditions';

/**
 * Full Derived Stats calculation from BaseSheet
 * Conforms to PROJECT.md § Interface Contracts:
 * export function calculateDerivedStats(sheet: BaseSheet): DerivedStats;
 */
export function calculateDerivedStats(sheet: BaseSheet): DerivedStats {
  const normAttrs = normalizeAttributeBlock(sheet.attributes);

  const forMod = getAttributeModifier(sheet.system, normAttrs.FOR);
  const desMod = getAttributeModifier(sheet.system, normAttrs.DES);
  const conMod = getAttributeModifier(sheet.system, normAttrs.CON);
  const intMod = getAttributeModifier(sheet.system, normAttrs.INT);
  const sabMod = getAttributeModifier(sheet.system, normAttrs.SAB);
  const carMod = getAttributeModifier(sheet.system, normAttrs.CAR);

  const mods: AttributeBlock = {
    FOR: forMod,
    DES: desMod,
    CON: conMod,
    INT: intMod,
    SAB: sabMod,
    CAR: carMod
  };

  const pvMax = calculatePvMax(sheet.system, sheet.class, sheet.level, normAttrs.CON);

  const normalizedClassName = (sheet.class || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const classData = T20_CLASS_CONSTANTS[normalizedClassName] ||
    T20_CLASS_CONSTANTS[(sheet.class || '').toLowerCase()] ||
    { keyAttr: 'INT' as AttributeKey };

  const keyAttr = classData.keyAttr || 'INT';
  const pmMax = calculatePmMax(sheet.system, sheet.class, sheet.level, normAttrs[keyAttr]);

  const enc = calculateEncumbrance(forMod, sheet.inventoryWeightSlots || 0);
  const totalArmorPenalty = calculateTotalArmorPenalty(
    sheet.armorPenalty || 0,
    sheet.shieldPenalty || 0,
    enc.isOverloaded
  );

  const defense = calculateDefense(
    sheet.system,
    sheet.level,
    normAttrs.DES,
    sheet.armorBonus || 0,
    sheet.shieldBonus || 0,
    sheet.isHeavyArmor || false,
    sheet.maxDexterity
  );

  const trainedSet = new Set((sheet.trainedSkills || []).map((s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  const skillsMap: DerivedStats['skills'] = {};

  for (const [sKey, def] of Object.entries(T20_SKILLS)) {
    const isTrained = trainedSet.has(sKey);
    const res = calculateSkillBonus(
      sheet.system,
      sKey,
      sheet.level,
      mods[def.attribute],
      isTrained,
      totalArmorPenalty
    );
    skillsMap[sKey] = {
      bonus: res.bonus,
      trained: isTrained,
      attribute: def.attribute
    };
  }

  return {
    pvMax,
    pmMax,
    defense,
    armorPenalty: totalArmorPenalty,
    carryCapacity: enc.maxSlots,
    skills: skillsMap
  };
}

/**
 * Unified Facade for existing components and tests
 */
export class RulesEngine {
  static getAttributeModifier = getAttributeModifier;
  static calculateT20PointBuyCost = calculateT20PointBuyCost;
  static calculateTRPGPointBuyCost = calculateTRPGPointBuyCost;
  static calculatePvMax = calculatePvMax;
  static calculatePmMax = calculatePmMax;
  static canSpendPM = canSpendPM;
  static getInstantDeathThreshold = getInstantDeathThreshold;
  static calculateDefense = calculateDefense;
  static isAttackHit = isAttackHit;
  static calculateEncumbrance = calculateEncumbrance;
  static calculateTotalArmorPenalty = calculateTotalArmorPenalty;
  static isSkillPenalizedByArmor = isSkillPenalizedByArmor;
  static calculateSkillBonus = calculateSkillBonus;
  static getT20TrainingBonus = getT20TrainingBonus;
  static calculateDerivedStats = calculateDerivedStats;
  static applyDamage = applyDamage;
  static applyHealing = applyHealing;
  static calculateRestRecovery = calculateRestRecovery;
  static calculateConditionsDefenseModifier = calculateConditionsDefenseModifier;
  static calculateConditionsAttackModifier = calculateConditionsAttackModifier;
  static calculateConditionsSkillModifier = calculateConditionsSkillModifier;
  static isActionPrevented = isActionPrevented;
  static calculateTRPGEncumbrance = calculateTRPGEncumbrance;
}
