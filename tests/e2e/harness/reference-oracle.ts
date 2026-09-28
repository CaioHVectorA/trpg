/**
 * TRPG Platform E2E Test Suite — Authoritative Mathematical Reference Oracle
 * Derived strictly from:
 * - Tormenta 20: Edição Jogo do Ano (JdA)
 * - Tormenta RPG: Edição Revisada
 * - survey_rules_1/report.md & survey_vtt_3/report.md
 */

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
  RangeBand,
  InitiativeCombatant
} from './types';

// Canonical list of T20 skills
export const T20_SKILLS: Record<string, { attribute: AttributeKey; trainedOnly: boolean; armorPenalty: boolean }> = {
  acrobacia: { attribute: 'DES', trainedOnly: false, armorPenalty: true },
  adestramento: { attribute: 'CAR', trainedOnly: true, armorPenalty: false },
  atletismo: { attribute: 'FOR', trainedOnly: false, armorPenalty: false },
  atuacao: { attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  cavalgar: { attribute: 'DES', trainedOnly: false, armorPenalty: false },
  conhecimento: { attribute: 'INT', trainedOnly: true, armorPenalty: false },
  cura: { attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  diplomacia: { attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  enganacao: { attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  fortitude: { attribute: 'CON', trainedOnly: false, armorPenalty: false },
  furtividade: { attribute: 'DES', trainedOnly: false, armorPenalty: true },
  guerra: { attribute: 'INT', trainedOnly: true, armorPenalty: false },
  iniciativa: { attribute: 'DES', trainedOnly: false, armorPenalty: false },
  intimidacao: { attribute: 'CAR', trainedOnly: false, armorPenalty: false },
  intuicao: { attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  investigacao: { attribute: 'INT', trainedOnly: false, armorPenalty: false },
  jogatina: { attribute: 'CAR', trainedOnly: true, armorPenalty: false },
  ladinagem: { attribute: 'DES', trainedOnly: true, armorPenalty: true },
  luta: { attribute: 'FOR', trainedOnly: false, armorPenalty: false },
  misticismo: { attribute: 'INT', trainedOnly: true, armorPenalty: false },
  nobreza: { attribute: 'INT', trainedOnly: true, armorPenalty: false },
  oficio: { attribute: 'INT', trainedOnly: true, armorPenalty: false },
  percepcao: { attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  pilotagem: { attribute: 'DES', trainedOnly: true, armorPenalty: false },
  pontaria: { attribute: 'DES', trainedOnly: false, armorPenalty: false },
  reflexos: { attribute: 'DES', trainedOnly: false, armorPenalty: false },
  religiao: { attribute: 'SAB', trainedOnly: true, armorPenalty: false },
  sobrevivencia: { attribute: 'SAB', trainedOnly: false, armorPenalty: false },
  vontade: { attribute: 'SAB', trainedOnly: false, armorPenalty: false }
};

export const T20_CLASS_CONSTANTS: Record<string, { basePv: number; pvPerLevel: number; basePm: number; pmPerLevel: number; keyAttr: AttributeKey }> = {
  arcanista: { basePv: 8, pvPerLevel: 2, basePm: 6, pmPerLevel: 6, keyAttr: 'INT' },
  bardo: { basePv: 12, pvPerLevel: 3, basePm: 4, pmPerLevel: 4, keyAttr: 'CAR' },
  inventor: { basePv: 12, pvPerLevel: 3, basePm: 4, pmPerLevel: 4, keyAttr: 'INT' },
  ladino: { basePv: 12, pvPerLevel: 3, basePm: 3, pmPerLevel: 3, keyAttr: 'INT' },
  bucaneiro: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'CAR' },
  cacador: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'SAB' },
  cavaleiro: { basePv: 16, pvPerLevel: 4, basePm: 3, pmPerLevel: 3, keyAttr: 'CAR' },
  clerigo: { basePv: 16, pvPerLevel: 4, basePm: 5, pmPerLevel: 5, keyAttr: 'SAB' },
  druida: { basePv: 16, pvPerLevel: 4, basePm: 4, pmPerLevel: 4, keyAttr: 'SAB' },
  nobre: { basePv: 16, pvPerLevel: 4, basePm: 4, pmPerLevel: 4, keyAttr: 'CAR' },
  guerreiro: { basePv: 20, pvPerLevel: 5, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' },
  lutador: { basePv: 20, pvPerLevel: 5, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' },
  paladino: { basePv: 20, pvPerLevel: 5, basePm: 3, pmPerLevel: 3, keyAttr: 'CAR' },
  barbaro: { basePv: 24, pvPerLevel: 6, basePm: 3, pmPerLevel: 3, keyAttr: 'FOR' }
};

export class ReferenceOracle {
  /**
   * Attribute Modifier Calculation
   */
  static getAttributeModifier(system: SystemMode, scoreOrMod: number): number {
    if (system === 'T20') {
      return scoreOrMod; // Direct modifier in T20
    }
    // TRPG classic formula: floor((Score - 10) / 2)
    return Math.floor((scoreOrMod - 10) / 2);
  }

  /**
   * Calculate point buy cost for T20 direct modifiers
   */
  static calculateT20PointBuyCost(mods: AttributeBlock): number {
    const costMap: Record<number, number> = {
      '-1': -1,
      0: 0,
      1: 1,
      2: 2,
      3: 4,
      4: 7
    };
    let total = 0;
    for (const key of Object.keys(mods) as AttributeKey[]) {
      const val = mods[key];
      if (costMap[val] === undefined) {
        throw new Error(`Invalid T20 attribute value ${val} for point buy`);
      }
      total += costMap[val];
    }
    return total;
  }

  /**
   * Calculate point buy cost for TRPG 3-18 scores
   */
  static calculateTRPGPointBuyCost(scores: AttributeBlock): number {
    const costTable: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
      14: 6, 15: 8, 16: 10, 17: 13, 18: 16
    };
    let total = 0;
    for (const key of Object.keys(scores) as AttributeKey[]) {
      const score = scores[key];
      if (costTable[score] === undefined) {
        throw new Error(`Invalid TRPG attribute score ${score} for point buy`);
      }
      total += costTable[score];
    }
    return total;
  }

  /**
   * PV Calculation (Hit Points)
   */
  static calculatePvMax(
    system: SystemMode,
    className: string,
    level: number,
    conScoreOrMod: number
  ): number {
    const conMod = this.getAttributeModifier(system, conScoreOrMod);
    const normalizedClass = className.toLowerCase();
    const classData = T20_CLASS_CONSTANTS[normalizedClass] || { basePv: 16, pvPerLevel: 4 };

    if (system === 'T20') {
      const pv1 = classData.basePv + conMod;
      if (level <= 1) return Math.max(1, pv1);
      const perLevel = Math.max(1, classData.pvPerLevel + conMod);
      return pv1 + (level - 1) * perLevel;
    } else {
      // TRPG hit die progression
      const pv1 = classData.basePv + conMod;
      if (level <= 1) return Math.max(1, pv1);
      const avgDie = Math.floor(classData.basePv / 2) + 1;
      const perLevel = Math.max(1, avgDie + conMod);
      return pv1 + (level - 1) * perLevel;
    }
  }

  /**
   * PM Calculation (Mana Points)
   */
  static calculatePmMax(
    system: SystemMode,
    className: string,
    level: number,
    keyAttrScoreOrMod: number
  ): number {
    const keyMod = this.getAttributeModifier(system, keyAttrScoreOrMod);
    const normalizedClass = className.toLowerCase();
    const classData = T20_CLASS_CONSTANTS[normalizedClass] || { basePm: 3, pmPerLevel: 3 };

    if (system === 'T20') {
      const martialClasses = ['guerreiro', 'barbaro', 'bucaneiro', 'cacador', 'cavaleiro', 'ladino', 'lutador'];
      const effectiveKeyMod = martialClasses.includes(normalizedClass) ? 0 : keyMod;
      const pm1 = classData.basePm + effectiveKeyMod;
      if (level <= 1) return Math.max(0, pm1);
      return pm1 + (level - 1) * classData.pmPerLevel;
    } else {
      // Classic TRPG / Manual do Arcano PM model
      return classData.basePm + (level - 1) * classData.pmPerLevel + keyMod;
    }
  }

  /**
   * T20 PM Expenditure Limit: cannot spend more PM on an ability than current character level
   */
  static canSpendPM(currentPM: number, cost: number, characterLevel: number): boolean {
    if (cost < 0) return false;
    if (cost > characterLevel) return false;
    if (cost > currentPM) return false;
    return true;
  }

  /**
   * Instant Death Threshold
   */
  static getInstantDeathThreshold(system: SystemMode, pvMax: number, conScore: number): number {
    if (system === 'T20') {
      return -Math.floor(pvMax / 2);
    }
    // TRPG: -10 or -CON
    return -Math.max(10, conScore);
  }

  /**
   * Defesa / Armor Class (CA)
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
    const desMod = this.getAttributeModifier(system, desScoreOrMod);

    if (system === 'T20') {
      // T20: Defesa = 10 + effectiveDES + armor + shield + other. No half-level for PCs!
      // Heavy armor forces effective Dexterity bonus to 0.
      const effectiveDes = isHeavyArmor ? 0 : desMod;
      return 10 + effectiveDes + armorBonus + shieldBonus + otherBonus;
    } else {
      // TRPG: CA = 10 + floor(level / 2) + cappedDES + armor + shield + other
      const halfLevel = Math.floor(level / 2);
      let effectiveDes = desMod;
      if (maxDexterity !== undefined && desMod > maxDexterity) {
        effectiveDes = maxDexterity;
      }
      return 10 + halfLevel + effectiveDes + armorBonus + shieldBonus + otherBonus;
    }
  }

  /**
   * Encumbrance & Overload (T20 Slots)
   */
  static calculateEncumbrance(forMod: number, currentWeightSlots: number): {
    maxSlots: number;
    isOverloaded: boolean;
    additionalArmorPenalty: number;
    speedReductionMeters: number;
  } {
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
   * Skill Bonus Calculation
   */
  static calculateSkillBonus(
    system: SystemMode,
    skillId: string,
    level: number,
    attrMod: number,
    trained: boolean,
    armorPenalty: number = 0,
    otherBonus: number = 0
  ): { bonus: number; canBeUsed: boolean; error?: string } {
    const normalizedSkill = skillId.toLowerCase();
    const skillDef = T20_SKILLS[normalizedSkill];

    if (system === 'T20') {
      if (skillDef?.trainedOnly && !trained) {
        return {
          bonus: 0,
          canBeUsed: false,
          error: `Perícia ${skillId} é somente treinada`
        };
      }
      const halfLevel = Math.floor(level / 2);
      let trainingBonus = 0;
      if (trained) {
        if (level >= 15) trainingBonus = 6;
        else if (level >= 7) trainingBonus = 4;
        else trainingBonus = 2;
      }
      const penalty = skillDef?.armorPenalty ? armorPenalty : 0;
      const total = halfLevel + attrMod + trainingBonus - penalty + otherBonus;
      return { bonus: total, canBeUsed: true };
    } else {
      // TRPG mode
      const penalty = skillDef?.armorPenalty ? armorPenalty : 0;
      const total = attrMod + (trained ? level + 3 : 0) - penalty + otherBonus;
      return { bonus: total, canBeUsed: true };
    }
  }

  /**
   * Full Derived Stats calculation from BaseSheet
   */
  static calculateDerivedStats(sheet: BaseSheet): DerivedStats {
    const forMod = this.getAttributeModifier(sheet.system, sheet.attributes.FOR);
    const desMod = this.getAttributeModifier(sheet.system, sheet.attributes.DES);
    const conMod = this.getAttributeModifier(sheet.system, sheet.attributes.CON);
    const intMod = this.getAttributeModifier(sheet.system, sheet.attributes.INT);
    const sabMod = this.getAttributeModifier(sheet.system, sheet.attributes.SAB);
    const carMod = this.getAttributeModifier(sheet.system, sheet.attributes.CAR);

    const mods: AttributeBlock = {
      FOR: forMod, DES: desMod, CON: conMod,
      INT: intMod, SAB: sabMod, CAR: carMod
    };

    const pvMax = this.calculatePvMax(sheet.system, sheet.class, sheet.level, sheet.attributes.CON);
    const keyAttr = T20_CLASS_CONSTANTS[sheet.class.toLowerCase()]?.keyAttr || 'INT';
    const pmMax = this.calculatePmMax(sheet.system, sheet.class, sheet.level, sheet.attributes[keyAttr]);

    const enc = this.calculateEncumbrance(forMod, sheet.inventoryWeightSlots || 0);
    const totalArmorPenalty = (sheet.armorPenalty || 0) + (sheet.shieldPenalty || 0) + enc.additionalArmorPenalty;

    const defense = this.calculateDefense(
      sheet.system,
      sheet.level,
      sheet.attributes.DES,
      sheet.armorBonus || 0,
      sheet.shieldBonus || 0,
      sheet.isHeavyArmor || false,
      sheet.maxDexterity
    );

    const trainedSet = new Set((sheet.trainedSkills || []).map(s => s.toLowerCase()));
    const skillsMap: DerivedStats['skills'] = {};

    for (const [sKey, def] of Object.entries(T20_SKILLS)) {
      const isTrained = trainedSet.has(sKey);
      const res = this.calculateSkillBonus(
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
   * Tactical VTT Distance Calculation
   */
  static calculateDistance(
    p1: GridPosition,
    p2: GridPosition,
    metric: 'chebyshev' | '5-10-5' | 'euclidean' = 'chebyshev'
  ): DistanceMeasurement {
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);

    let cells = 0;
    if (metric === 'chebyshev') {
      cells = Math.max(dx, dy);
    } else if (metric === '5-10-5') {
      cells = Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2);
    } else {
      cells = Math.sqrt(dx * dx + dy * dy);
    }

    const meters = cells * 1.5;
    const feet = cells * 5;

    let rangeBand: RangeBand = 'Extremo';
    if (meters <= 1.5) rangeBand = 'Toque';
    else if (meters <= 9.0) rangeBand = 'Curto';
    else if (meters <= 18.0) rangeBand = 'Médio';
    else if (meters <= 36.0) rangeBand = 'Longo';
    else rangeBand = 'Extremo';

    return { cells, meters, feet, rangeBand };
  }

  /**
   * Contextual Dice Expression Evaluator
   */
  static evaluateDiceExpression(
    req: DiceRollRequest,
    fixedRolls?: number[]
  ): DiceRollResult {
    const formulaClean = req.formula.trim();
    const commentMatch = formulaClean.match(/#(.*)$/);
    const label = commentMatch ? commentMatch[1].trim() : undefined;
    const exprWithoutComment = formulaClean.replace(/#.*$/, '').trim();

    // Parse simple or complex expressions (e.g. "1d20+7", "2d6+4", "2d20kh1+5")
    let total = 0;
    let modifiers = 0;
    const rolls: Array<{ die: number; result: number }> = [];

    let isNatural20 = false;
    let isNatural1 = false;
    let rollIndex = 0;

    // Tokenize terms
    const regex = /([+-]?\s*\d*d\d+(?:kh1|kl1)?|[+-]?\s*\d+)/g;
    const terms = exprWithoutComment.match(regex) || [];

    for (const rawTerm of terms) {
      const term = rawTerm.replace(/\s+/g, '');
      if (term.includes('d')) {
        const sign = term.startsWith('-') ? -1 : 1;
        const cleanTerm = term.replace(/^[+-]/, '');

        let count = 1;
        let sides = 20;
        let keepHighest = false;
        let keepLowest = false;

        const dParts = cleanTerm.split('d');
        if (dParts[0]) count = parseInt(dParts[0], 10);

        if (dParts[1].includes('kh1')) {
          sides = parseInt(dParts[1].replace('kh1', ''), 10);
          keepHighest = true;
        } else if (dParts[1].includes('kl1')) {
          sides = parseInt(dParts[1].replace('kl1', ''), 10);
          keepLowest = true;
        } else {
          sides = parseInt(dParts[1], 10);
        }

        const dieRolls: number[] = [];
        for (let i = 0; i < count; i++) {
          const val = fixedRolls && fixedRolls[rollIndex] !== undefined
            ? fixedRolls[rollIndex++]
            : Math.floor(Math.random() * sides) + 1;
          dieRolls.push(val);
          rolls.push({ die: sides, result: val });

          if (sides === 20) {
            if (val === 20) isNatural20 = true;
            if (val === 1) isNatural1 = true;
          }
        }

        let termSum = 0;
        if (keepHighest && dieRolls.length > 0) {
          termSum = Math.max(...dieRolls);
        } else if (keepLowest && dieRolls.length > 0) {
          termSum = Math.min(...dieRolls);
        } else {
          termSum = dieRolls.reduce((a, b) => a + b, 0);
        }

        total += sign * termSum;
      } else {
        const mod = parseInt(term, 10);
        if (!isNaN(mod)) {
          modifiers += mod;
          total += mod;
        }
      }
    }

    const threatRange = req.threatRange || 20;
    const hasD20 = rolls.some(r => r.die === 20);
    const primaryD20 = rolls.find(r => r.die === 20)?.result ?? 0;
    const isThreat = hasD20 ? primaryD20 >= threatRange : false;

    // T20: auto-hit if Nat 20; auto-fail if Nat 1
    let isHit = true;
    if (hasD20) {
      if (isNatural1) isHit = false;
      else if (isNatural20) isHit = true;
      else if (req.targetDefense !== undefined) {
        isHit = total >= req.targetDefense;
      }
    }

    // Critical check: in T20, threat + hit = critical hit (or standalone damage roll with critMultiplier)
    const isCriticalHit = hasD20
      ? (isNatural20 || (isThreat && isHit))
      : (req.critMultiplier !== undefined && req.critMultiplier > 1);
    const isFumble = isNatural1;

    let damageResult: DiceRollResult['damageResult'] = undefined;
    if (req.critMultiplier && isCriticalHit) {
      const mult = req.critMultiplier;
      damageResult = {
        diceTotal: total - modifiers,
        staticBonus: modifiers,
        finalDamage: (req.system === 'TRPG')
          ? total * mult
          : (total - modifiers) * mult + modifiers,
        formulaUsed: req.system === 'TRPG' ? `(${req.formula}) * ${mult}` : `BaseDice * ${mult} + Mods`
      };
    }

    const breakdown = rolls.map(r => `[d${r.die}: ${r.result}]`).join(' + ') +
      (modifiers !== 0 ? ` + (${modifiers})` : '');

    return {
      total,
      rolls,
      modifiers,
      isNatural20,
      isNatural1,
      isCriticalHit,
      isFumble,
      isHit,
      damageResult,
      formattedOutput: `${total} (${breakdown})${label ? ` # ${label}` : ''}`,
      breakdown,
      label,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Temp HP Damage Absorption Engine
   */
  static applyDamage(currentPv: number, currentTempPv: number, damage: number): {
    newPv: number;
    newTempPv: number;
    absorbedByTemp: number;
    isUnconscious: boolean;
    isDead: boolean;
    deathThreshold: number;
  } {
    const absorbedByTemp = Math.min(currentTempPv, damage);
    const remainder = damage - absorbedByTemp;
    const newTempPv = currentTempPv - absorbedByTemp;
    const newPv = currentPv - remainder;

    // Death threshold T20: -pvMax / 2
    return {
      newPv,
      newTempPv,
      absorbedByTemp,
      isUnconscious: newPv <= 0,
      isDead: false, // Calculated with max PV
      deathThreshold: 0
    };
  }

  /**
   * Initiative Sorting & Tie-breaking
   */
  static sortInitiative(combatants: InitiativeCombatant[]): InitiativeCombatant[] {
    return [...combatants].sort((a, b) => {
      if (b.initiativeScore !== a.initiativeScore) {
        return b.initiativeScore - a.initiativeScore;
      }
      return b.dexModifier - a.dexModifier;
    });
  }
}
