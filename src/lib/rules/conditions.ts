/**
 * TRPG Platform — Status Conditions Engine (Feature 12)
 * Tormenta Status Conditions Catalog, Reactive Modifiers to Defense, Attacks, and Skills
 */

import { AttributeKey } from '../types';

export interface ConditionDefinition {
  id: string;
  namePt: string;
  description: string;
  defenseMod?: number | ((isRanged: boolean) => number);
  attackMod?: number | ((isMelee: boolean) => number);
  skillMod?: (skillId: string, attrKey: AttributeKey) => number;
  preventsActions?: boolean;
  speedMultiplier?: number;
  speedReductionMeters?: number;
}

export const CONDITIONS_CATALOG: Record<string, ConditionDefinition> = {
  abatido: {
    id: 'abatido',
    namePt: 'Abatido',
    description: '-2 na Defesa e -2 em testes de perícia.',
    defenseMod: -2,
    skillMod: () => -2
  },
  abalado: {
    id: 'abalado',
    namePt: 'Abalado',
    description: '-2 em testes de perícia.',
    skillMod: () => -2
  },
  agarrado: {
    id: 'agarrado',
    namePt: 'Agarrado',
    description: 'Desprevenido (-5 na Defesa), imóvel e -2 em testes de ataque.',
    defenseMod: -5,
    attackMod: -2,
    speedMultiplier: 0
  },
  alquebrado: {
    id: 'alquebrado',
    namePt: 'Alquebrado',
    description: 'O custo em PM de todas as suas habilidades e magias aumenta em +1.'
  },
  amedrontado: {
    id: 'amedrontado',
    namePt: 'Amedrontado',
    description: '-5 em testes de perícia e deve fugir da fonte do medo.',
    skillMod: () => -5
  },
  atordoado: {
    id: 'atordoado',
    namePt: 'Atordoado',
    description: 'Desprevenido (-5 na Defesa) e não pode realizar ações.',
    defenseMod: -5,
    preventsActions: true
  },
  caido: {
    id: 'caido',
    namePt: 'Caído',
    description: '-5 em ataques corpo a corpo; -5 na Defesa contra ataques corpo a corpo e +5 contra ataques à distância.',
    defenseMod: (isRanged: boolean) => (isRanged ? 5 : -5),
    attackMod: (isMelee: boolean) => (isMelee ? -5 : 0)
  },
  cego: {
    id: 'cego',
    namePt: 'Cego',
    description: 'Desprevenido (-5 na Defesa), -5 em perícias baseadas em FOR ou DES, e velocidade reduzida pela metade.',
    defenseMod: -5,
    speedMultiplier: 0.5,
    skillMod: (_s, attr) => (attr === 'FOR' || attr === 'DES' ? -5 : 0)
  },
  confuso: {
    id: 'confuso',
    namePt: 'Confuso',
    description: 'Comporta-se de maneira aleatória no início de cada turno.'
  },
  debilitado: {
    id: 'debilitado',
    namePt: 'Debilitado',
    description: '-5 em testes de perícias baseadas em atributos físicos (FOR, DES, CON).',
    skillMod: (_s, attr) => (attr === 'FOR' || attr === 'DES' || attr === 'CON' ? -5 : 0)
  },
  desprevenido: {
    id: 'desprevenido',
    namePt: 'Desprevenido',
    description: '-5 na Defesa e -5 em Reflexos. Não pode fazer reações.',
    defenseMod: -5,
    skillMod: (skill) => (skill === 'reflexos' ? -5 : 0)
  },
  enfeiticado: {
    id: 'enfeiticado',
    namePt: 'Enfeitiçado',
    description: 'Trata o conjurador como um amigo próximo.'
  },
  enredado: {
    id: 'enredado',
    namePt: 'Enredado',
    description: '-2 na Defesa, -2 em ataques, e deslocamento reduzido à metade.',
    defenseMod: -2,
    attackMod: -2,
    speedMultiplier: 0.5
  },
  esmorecido: {
    id: 'esmorecido',
    namePt: 'Esmorecido',
    description: '-5 em testes de perícias baseadas em atributos mentais (INT, SAB, CAR).',
    skillMod: (_s, attr) => (attr === 'INT' || attr === 'SAB' || attr === 'CAR' ? -5 : 0)
  },
  exausto: {
    id: 'exausto',
    namePt: 'Exausto',
    description: 'Debilitado (-5 físicas), deslocamento reduzido à metade e não pode correr.',
    speedMultiplier: 0.5,
    skillMod: (_s, attr) => (attr === 'FOR' || attr === 'DES' || attr === 'CON' ? -5 : 0)
  },
  fascinado: {
    id: 'fascinado',
    namePt: 'Fascinado',
    description: '-5 em Percepção e não pode realizar ações além de prestar atenção na fonte.',
    skillMod: (skill) => (skill === 'percepcao' ? -5 : 0),
    preventsActions: true
  },
  fatigado: {
    id: 'fatigado',
    namePt: 'Fatigado',
    description: '-2 em testes de perícias físicas (FOR, DES, CON) e não pode correr.',
    skillMod: (_s, attr) => (attr === 'FOR' || attr === 'DES' || attr === 'CON' ? -2 : 0)
  },
  fraco: {
    id: 'fraco',
    namePt: 'Fraco',
    description: '-2 em testes de perícias físicas (FOR, DES, CON).',
    skillMod: (_s, attr) => (attr === 'FOR' || attr === 'DES' || attr === 'CON' ? -2 : 0)
  },
  furtivo: {
    id: 'furtivo',
    namePt: 'Furtivo',
    description: 'Inimigos não sabem sua localização exata até atacarem ou serem percebidos.'
  },
  imovel: {
    id: 'imovel',
    namePt: 'Imóvel',
    description: 'Deslocamento reduzido a 0.',
    speedMultiplier: 0
  },
  inconsciente: {
    id: 'inconsciente',
    namePt: 'Inconsciente',
    description: 'Indefeso (-10 Defesa), desprevenido, cai no chão e não pode agir.',
    defenseMod: -10,
    preventsActions: true,
    speedMultiplier: 0
  },
  indefeso: {
    id: 'indefeso',
    namePt: 'Indefeso',
    description: '-10 na Defesa (ou modificador de DES zero e -5). Ataques corpo a corpo são golpes de misericórdia.',
    defenseMod: -10
  },
  lento: {
    id: 'lento',
    namePt: 'Lento',
    description: 'Deslocamento reduzido pela metade. Não pode correr ou investir.',
    speedMultiplier: 0.5
  },
  ofuscado: {
    id: 'ofuscado',
    namePt: 'Ofuscado',
    description: '-2 em testes de ataque e -2 em testes de Percepção.',
    attackMod: -2,
    skillMod: (skill) => (skill === 'percepcao' ? -2 : 0)
  },
  paralisado: {
    id: 'paralisado',
    namePt: 'Paralisado',
    description: 'Indefeso (-10 na Defesa), imóvel e não pode agir.',
    defenseMod: -10,
    preventsActions: true,
    speedMultiplier: 0
  },
  pasmo: {
    id: 'pasmo',
    namePt: 'Pasmo',
    description: 'Não pode realizar ações durante o turno.',
    preventsActions: true
  },
  petrificado: {
    id: 'petrificado',
    namePt: 'Petrificado',
    description: 'Inconsciente, imune a dano de veneno/doença, recebe RD 10.',
    defenseMod: -10,
    preventsActions: true,
    speedMultiplier: 0
  },
  sangrando: {
    id: 'sangrando',
    namePt: 'Sangrando',
    description: 'No início do turno deve passar em Fortitude CD 15 ou perde 1d6 PV.'
  },
  sobrecarregado: {
    id: 'sobrecarregado',
    namePt: 'Sobrecarregado',
    description: 'Penalidade de armadura aumenta em 2 e deslocamento reduz em 3m.',
    speedReductionMeters: 3
  },
  surdo: {
    id: 'surdo',
    namePt: 'Surdo',
    description: '-5 em Iniciativa e Percepção auditiva.',
    skillMod: (skill) => (skill === 'iniciativa' || skill === 'percepcao' ? -5 : 0)
  },
  surpreendido: {
    id: 'surpreendido',
    namePt: 'Surpreendido',
    description: 'Desprevenido (-5 na Defesa) e não pode agir na rodada surpresa.',
    defenseMod: -5,
    preventsActions: true
  },
  vulneravel: {
    id: 'vulneravel',
    namePt: 'Vulnerável',
    description: '-2 na Defesa.',
    defenseMod: -2
  }
};

/**
 * Normalizes condition name
 */
export function normalizeConditionId(cond: string): string {
  return cond
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Retrieves condition definition
 */
export function getConditionDefinition(conditionId: string): ConditionDefinition | undefined {
  const norm = normalizeConditionId(conditionId);
  return CONDITIONS_CATALOG[norm];
}

/**
 * Calculates net defense modifier from active conditions
 */
export function calculateConditionsDefenseModifier(
  activeConditions: string[],
  isRangedAttack: boolean = false
): number {
  let netModifier = 0;
  for (const cond of activeConditions) {
    const def = getConditionDefinition(cond);
    if (!def || def.defenseMod === undefined) continue;

    if (typeof def.defenseMod === 'function') {
      netModifier += def.defenseMod(isRangedAttack);
    } else {
      netModifier += def.defenseMod;
    }
  }
  return netModifier;
}

/**
 * Calculates net attack modifier from active conditions
 */
export function calculateConditionsAttackModifier(
  activeConditions: string[],
  isMeleeAttack: boolean = true
): number {
  let netModifier = 0;
  for (const cond of activeConditions) {
    const def = getConditionDefinition(cond);
    if (!def || def.attackMod === undefined) continue;

    if (typeof def.attackMod === 'function') {
      netModifier += def.attackMod(isMeleeAttack);
    } else {
      netModifier += def.attackMod;
    }
  }
  return netModifier;
}

/**
 * Calculates net skill check modifier from active conditions
 */
export function calculateConditionsSkillModifier(
  activeConditions: string[],
  skillId: string,
  attrKey: AttributeKey
): number {
  const normSkill = normalizeConditionId(skillId);
  let netModifier = 0;
  for (const cond of activeConditions) {
    const def = getConditionDefinition(cond);
    if (!def || !def.skillMod) continue;
    netModifier += def.skillMod(normSkill, attrKey);
  }
  return netModifier;
}

/**
 * Checks if active conditions completely prevent character actions
 */
export function isActionPrevented(activeConditions: string[]): { prevented: boolean; reason?: string } {
  for (const cond of activeConditions) {
    const def = getConditionDefinition(cond);
    if (def?.preventsActions) {
      return {
        prevented: true,
        reason: `Ação impedida pela condição ${def.namePt}`
      };
    }
  }
  return { prevented: false };
}
