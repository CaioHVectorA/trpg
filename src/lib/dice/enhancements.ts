/**
 * TRPG Platform — PM Enhancement Scaling
 * Calculates dynamic formulas, additional dice, and flat bonuses when Mana Points (PM)
 * are invested into spells, powers, and attacks in Tormenta 20.
 */

export interface PMEnhancementValidation {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether a character can spend a given amount of PM on an ability or spell.
 * Enforces Tormenta 20 core rule:
 * - Spent PM cannot exceed the character's level.
 * - Spent PM cannot exceed current PM pool.
 */
export function validatePMExpenditure(
  currentPM: number,
  cost: number,
  characterLevel: number
): PMEnhancementValidation {
  if (cost < 0) {
    return { allowed: false, reason: 'O custo de PM não pode ser negativo.' };
  }
  if (cost > characterLevel) {
    return {
      allowed: false,
      reason: `Limite de gastos excedido: máximo ${characterLevel} PM para o nível ${characterLevel} (tentou gastar ${cost} PM).`
    };
  }
  if (cost > currentPM) {
    return {
      allowed: false,
      reason: `PM insuficiente: possui ${currentPM} PM, necessário ${cost} PM.`
    };
  }
  return { allowed: true };
}

/**
 * Scales Mísseis Mágicos (Arcanista):
 * Base (1 PM): 2 dardos de 1d4+1 cada (fórmula "2d4+2").
 * Aprimoramento (+2 PM por dardo): Cada +2 PM adiciona +1 dardo ("+1d4+1").
 */
export function calculateMisseisMagicosFormula(pmInvested: number = 1): {
  formula: string;
  missilesCount: number;
  totalPM: number;
} {
  const basePM = 1;
  const safePM = Math.max(basePM, pmInvested);
  const extraPM = safePM - basePM;
  const extraMissiles = Math.floor(extraPM / 2);
  const totalMissiles = 2 + extraMissiles;
  const diceCount = totalMissiles;
  const flatBonus = totalMissiles;

  return {
    formula: `${diceCount}d4+${flatBonus}`,
    missilesCount: totalMissiles,
    totalPM: basePM + extraMissiles * 2
  };
}

/**
 * Scales Bola de Fogo (Arcanista):
 * Base (3 PM): 6d6 de dano de fogo em área.
 * Aprimoramento (+2 PM): Aumenta o dano em +2d6.
 */
export function calculateBolaDeFogoFormula(pmInvested: number = 3): {
  formula: string;
  diceCount: number;
  totalPM: number;
} {
  const basePM = 3;
  const safePM = Math.max(basePM, pmInvested);
  const extraPM = safePM - basePM;
  const steps = Math.floor(extraPM / 2);
  const diceCount = 6 + steps * 2;

  return {
    formula: `${diceCount}d6`,
    diceCount,
    totalPM: basePM + steps * 2
  };
}

/**
 * Scales Curar Ferimentos (Divina):
 * Base (1 PM): Cura 2d8+2 PV.
 * Aprimoramento (+2 PM): Aumenta a cura em +1d8+1.
 */
export function calculateCurarFerimentosFormula(pmInvested: number = 1): {
  formula: string;
  diceCount: number;
  flatBonus: number;
  totalPM: number;
} {
  const basePM = 1;
  const safePM = Math.max(basePM, pmInvested);
  const extraPM = safePM - basePM;
  const steps = Math.floor(extraPM / 2);
  const diceCount = 2 + steps;
  const flatBonus = 2 + steps;

  return {
    formula: `${diceCount}d8+${flatBonus}`,
    diceCount,
    flatBonus,
    totalPM: basePM + steps * 2
  };
}

/**
 * Scales Guerreiro Ataque Especial:
 * Base (1 PM): +4 no ataque ou +4 no dano.
 * A cada nível adicional investido (+1 PM): +4 bônus para distribuir em ataque ou dano.
 */
export function calculateAtaqueEspecialBonus(
  pmInvested: number,
  attackIncrements: number = 1,
  damageIncrements: number = 0
): {
  attackBonus: number;
  damageBonus: number;
  totalPM: number;
} {
  const safePM = Math.max(1, pmInvested);
  const totalIncrements = attackIncrements + damageIncrements;
  const validIncrements = Math.min(safePM, totalIncrements);

  // If user didn't specify exact distribution, allocate all to attack
  let finalAtkInc = attackIncrements;
  let finalDmgInc = damageIncrements;

  if (totalIncrements === 0 || totalIncrements !== safePM) {
    finalAtkInc = safePM;
    finalDmgInc = 0;
  }

  return {
    attackBonus: finalAtkInc * 4,
    damageBonus: finalDmgInc * 4,
    totalPM: safePM
  };
}
