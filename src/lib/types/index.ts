/**
 * TRPG Platform — Universal Types & Interfaces
 * Tormenta 20 (Jogo do Ano) & Tormenta RPG Clássico (TRPG)
 */

export type SystemMode = 'T20' | 'TRPG';

export type AttributeKey = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export interface AttributeBlock {
  FOR: number;
  DES: number;
  CON: number;
  INT: number;
  SAB: number;
  CAR: number;
}

export interface DerivedStats {
  pvMax: number;
  pmMax: number;
  defense: number;
  armorPenalty: number;
  carryCapacity: number;
  skills: Record<string, { bonus: number; trained: boolean; attribute: AttributeKey }>;
}

export interface BaseSheet {
  id?: string;
  name: string;
  system: SystemMode;
  level: number;
  race: string;
  class: string;
  attributes: AttributeBlock;
  trainedSkills?: string[];
  armorBonus?: number;
  shieldBonus?: number;
  isHeavyArmor?: boolean;
  maxDexterity?: number;
  armorPenalty?: number;
  shieldPenalty?: number;
  inventoryWeightSlots?: number;
  tempPv?: number;
  currentPv?: number;
  currentPm?: number;
  conditions?: string[];
}

export interface DiceRollRequest {
  formula: string;              // e.g. "1d20+7", "2d6+4", "1d20+10 # Ataque Espada Longa"
  threatRange?: number;         // e.g. 19 (for 19-20)
  critMultiplier?: number;      // e.g. 2, 3
  system?: SystemMode;
  pmInvested?: number;
  targetDefense?: number;
  targetDC?: number;            // Target Difficulty Class (CD)
  isRangedAttack?: boolean;
}

export interface DiceRollResult {
  total: number;
  rolls: Array<{ die: number; result: number }>;
  modifiers: number;
  isNatural20: boolean;
  isNatural1: boolean;
  isCriticalHit: boolean;
  isFumble: boolean;
  isHit?: boolean;
  targetDC?: number;
  dcOutcome?: 'SUCCESS' | 'CRITICAL_SUCCESS' | 'FAILURE' | 'CRITICAL_FAILURE';
  damageResult?: {
    diceTotal: number;
    staticBonus: number;
    finalDamage: number;
    formulaUsed: string;
  };
  formattedOutput: string;
  breakdown: string;
  label?: string;
  timestamp: string;
}

export interface GridPosition {
  x: number;
  y: number;
}

export type RangeBand = 'Toque' | 'Curto' | 'Médio' | 'Longo' | 'Extremo';

export interface DistanceMeasurement {
  cells: number;
  meters: number;
  feet: number;
  rangeBand: RangeBand;
}

export interface VttToken {
  id: string;
  name: string;
  sheetId?: string;
  system: SystemMode;
  size: 'MINUSCULO' | 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'ENORME' | 'COLOSSAL';
  gridX: number;
  gridY: number;
  color?: string;
  avatarUrl?: string;
  elevation?: number;
  rotation?: number;
  pvCurrent: number;
  pvMax: number;
  pvTemp?: number;
  pmCurrent: number;
  pmMax: number;
  conditions: string[];
}

export interface InitiativeCombatant {
  id: string;
  name: string;
  initiativeScore: number;
  dexModifier: number;
  isPlayer: boolean;
  pvCurrent: number;
  pvMax: number;
  conditions: string[];
}

export interface CompendiumItemData {
  id: string;
  system: SystemMode | 'ALL';
  type: 'RACE' | 'CLASS' | 'SPELL' | 'POWER' | 'TALENT' | 'ITEM' | 'THREAT';
  name: string;
  description: string;
  category?: string;
  circle?: number;
  cost?: string;
  requirement?: string;
  data: Record<string, unknown>;
  tags: string[];
}
