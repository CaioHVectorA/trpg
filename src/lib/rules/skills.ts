/**
 * TRPG Platform — Skills Engine (Feature 10)
 * Canonical 29 T20 Skills, Tiered Training Bonuses (+2/+4/+6), Armor Penalty Propagation, and TRPG Ranks
 */

import { SystemMode, AttributeKey } from '../types';

export interface SkillDefinition {
  id: string;
  namePt: string;
  attribute: AttributeKey;
  trainedOnly: boolean;
  armorPenalty: boolean;
  isCombatSkill?: boolean;
  isSavingThrow?: boolean;
}

export const T20_SKILLS: Record<string, SkillDefinition> = {
  acrobacia: { id: 'acrobacia', namePt: 'Acrobacia', attribute: 'DES', trainedOnly: false, armorPenalty: true },
  adestramento: { id: 'adestramento', namePt: 'Adestramento', attribute: 'CAR', trainedOnly: true, armorPenalty: false },
  atletismo: { id: 'atletismo', namePt: 'Atletismo', attribute: 'FOR', trainedOnly: false, armorPenalty: false },
  atuacao: { id: 'atuacao', namePt: 'Atuação', attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  cavalgar: { id: 'cavalgar', namePt: 'Cavalgar', attribute: 'DES', trainedOnly: false, armorPenalty: false },
  conhecimento: { id: 'conhecimento', namePt: 'Conhecimento', attribute: 'INT', trainedOnly: true, armorPenalty: false },
  cura: { id: 'cura', namePt: 'Cura', attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  diplomacia: { id: 'diplomacia', namePt: 'Diplomacia', attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  enganacao: { id: 'enganacao', namePt: 'Enganação', attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  fortitude: { id: 'fortitude', namePt: 'Fortitude', attribute: 'CON', trainedOnly: false, armorPenalty: false, isSavingThrow: true },
  furtividade: { id: 'furtividade', namePt: 'Furtividade', attribute: 'DES', trainedOnly: false, armorPenalty: true },
  guerra: { id: 'guerra', namePt: 'Guerra', attribute: 'INT', trainedOnly: true, armorPenalty: false },
  iniciativa: { id: 'iniciativa', namePt: 'Iniciativa', attribute: 'DES', trainedOnly: false, armorPenalty: false },
  intimidacao: { id: 'intimidacao', namePt: 'Intimidação', attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  intuicao: { id: 'intuicao', namePt: 'Intuição', attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  investigacao: { id: 'investigacao', namePt: 'Investigação', attribute: 'INT', trainedOnly: false, armorPenalty: false },
  jogatina: { id: 'jogatina', namePt: 'Jogatina', attribute: 'CAR', trainedOnly: true, armorPenalty: false },
  ladinagem: { id: 'ladinagem', namePt: 'Ladinagem', attribute: 'DES', trainedOnly: true, armorPenalty: true },
  luta: { id: 'luta', namePt: 'Luta', attribute: 'FOR', trainedOnly: false, armorPenalty: false, isCombatSkill: true },
  misticismo: { id: 'misticismo', namePt: 'Misticismo', attribute: 'INT', trainedOnly: true, armorPenalty: false },
  nobreza: { id: 'nobreza', namePt: 'Nobreza', attribute: 'INT', trainedOnly: true, armorPenalty: false },
  oficio: { id: 'oficio', namePt: 'Ofício', attribute: 'INT', trainedOnly: true, armorPenalty: false },
  percepcao: { id: 'percepcao', namePt: 'Percepção', attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  pilotagem: { id: 'pilotagem', namePt: 'Pilotagem', attribute: 'DES', trainedOnly: true, armorPenalty: false },
  pontaria: { id: 'pontaria', namePt: 'Pontaria', attribute: 'DES', trainedOnly: false, armorPenalty: false, isCombatSkill: true },
  reflexos: { id: 'reflexos', namePt: 'Reflexos', attribute: 'DES', trainedOnly: false, armorPenalty: false, isSavingThrow: true },
  religiao: { id: 'religiao', namePt: 'Religião', attribute: 'SAB', trainedOnly: true, armorPenalty: false },
  sobrevivencia: { id: 'sobrevivencia', namePt: 'Sobrevivência', attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  vontade: { id: 'vontade', namePt: 'Vontade', attribute: 'SAB', trainedOnly: false, armorPenalty: false, isSavingThrow: true }
};

/**
 * T20 Tiered Training Bonus:
 * - Untrained: 0
 * - Level 1 to 6: +2
 * - Level 7 to 14: +4
 * - Level 15 to 20+: +6
 */
export function getT20TrainingBonus(level: number, trained: boolean): number {
  if (!trained) return 0;
  if (level >= 15) return 6;
  if (level >= 7) return 4;
  return 2;
}

export interface SkillCalculationResult {
  bonus: number;
  canBeUsed: boolean;
  error?: string;
  halfLevel?: number;
  trainingBonus?: number;
  attributeMod?: number;
  armorPenaltyApplied?: number;
  valueOf(): number;
}

/**
 * Normalizes skill key removing diacritics and lowercasing
 */
export function normalizeSkillId(skillId: string): string {
  return skillId
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculates Skill Check Modifier for T20 or TRPG.
 *
 * T20 Formula:
 *   Total = floor(level / 2) + attrMod + trainingBonus (+2/+4/+6) - armorPenalty + otherBonus
 *   If skill is "Somente Treinada" and trained is false: canBeUsed = false.
 *
 * TRPG Formula:
 *   Total = attrMod + (trained ? level + 3 : 0) - armorPenalty + otherBonus
 */
export function calculateSkillBonus(
  system: SystemMode,
  skillId: string,
  level: number,
  attrMod: number,
  trained: boolean,
  armorPenalty: number = 0,
  otherBonus: number = 0
): SkillCalculationResult {
  const normKey = normalizeSkillId(skillId);
  const skillDef = T20_SKILLS[normKey] || T20_SKILLS[skillId.toLowerCase()];

  if (system === 'T20') {
    if (skillDef?.trainedOnly && !trained) {
      const resultObj: SkillCalculationResult = {
        bonus: 0,
        canBeUsed: false,
        error: `Perícia ${skillId} é somente treinada`,
        halfLevel: Math.floor(level / 2),
        trainingBonus: 0,
        attributeMod: attrMod,
        armorPenaltyApplied: 0,
        valueOf() {
          return 0;
        }
      };
      return resultObj;
    }

    const halfLevel = Math.floor(level / 2);
    const trainingBonus = getT20TrainingBonus(level, trained);
    const penaltyApplied = skillDef?.armorPenalty ? armorPenalty : 0;
    const total = halfLevel + attrMod + trainingBonus - penaltyApplied + otherBonus;

    const resultObj: SkillCalculationResult = {
      bonus: total,
      canBeUsed: true,
      halfLevel,
      trainingBonus,
      attributeMod: attrMod,
      armorPenaltyApplied: penaltyApplied,
      valueOf() {
        return total;
      }
    };
    return resultObj;
  } else {
    // TRPG
    const penaltyApplied = skillDef?.armorPenalty ? armorPenalty : 0;
    const trainingRanks = trained ? level + 3 : 0;
    const total = attrMod + trainingRanks - penaltyApplied + otherBonus;

    const resultObj: SkillCalculationResult = {
      bonus: total,
      canBeUsed: true,
      trainingBonus: trainingRanks,
      attributeMod: attrMod,
      armorPenaltyApplied: penaltyApplied,
      valueOf() {
        return total;
      }
    };
    return resultObj;
  }
}
