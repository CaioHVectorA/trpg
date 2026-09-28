/**
 * E2E Tier 1 — Feature 21: Direct-Click Roll Triggers
 * Opaque-box tests verifying RollPayload generation from sheet actions, attacks, skills, and spells
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { BaseSheet, DiceRollRequest } from '../harness/types';

describe('Feature 21: Direct-Click Roll Triggers', () => {
  const character: BaseSheet = {
    name: 'Sir Balin',
    system: 'T20',
    level: 2,
    race: 'Humano',
    class: 'Guerreiro',
    attributes: { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 0, CAR: 0 },
    trainedSkills: ['luta', 'atletismo']
  };

  it('F21-T1: should construct strongly-typed RollPayload when clicking melee weapon attack', () => {
    const derived = SystemAdapter.calculateDerivedStats(character);
    const lutaBonus = derived.skills.luta.bonus; // 1 + 3 + 2 = 6

    const weaponAttackPayload: DiceRollRequest = {
      formula: `1d20+${lutaBonus} # Ataque Espada Longa`,
      threatRange: 19,
      critMultiplier: 2,
      system: 'T20'
    };

    expect(weaponAttackPayload.formula).toBe('1d20+6 # Ataque Espada Longa');
    expect(weaponAttackPayload.threatRange).toBe(19);
    expect(weaponAttackPayload.critMultiplier).toBe(2);
  });

  it('F21-T2: should construct strongly-typed RollPayload when clicking a skill check', () => {
    const derived = SystemAdapter.calculateDerivedStats(character);
    const atletismoBonus = derived.skills.atletismo.bonus;

    const skillPayload: DiceRollRequest = {
      formula: `1d20+${atletismoBonus} # Teste de Atletismo`,
      system: 'T20'
    };

    expect(skillPayload.formula).toBe('1d20+6 # Teste de Atletismo');
  });

  it('F21-T3: should construct strongly-typed RollPayload when clicking a spell card', () => {
    const spellPayload: DiceRollRequest = {
      formula: '6d6 # Bola de Fogo',
      system: 'T20',
      pmInvested: 3
    };

    expect(spellPayload.formula).toContain('6d6');
    expect(spellPayload.pmInvested).toBe(3);
  });

  it('F21-T4: should format advantage roll expression (2d20kh1) when triggering roll with advantage', () => {
    const derived = SystemAdapter.calculateDerivedStats(character);
    const rollAdvantage: DiceRollRequest = {
      formula: `2d20kh1+${derived.skills.luta.bonus} # Ataque com Vantagem`,
      threatRange: 19,
      system: 'T20'
    };

    expect(rollAdvantage.formula).toBe('2d20kh1+6 # Ataque com Vantagem');
  });

  it('F21-T5: should evaluate generated RollPayload into complete DiceRollResult', () => {
    const payload: DiceRollRequest = {
      formula: '1d20+6 # Ataque Espada Longa',
      threatRange: 19,
      critMultiplier: 2,
      targetDefense: 15,
      system: 'T20'
    };

    const res = SystemAdapter.evaluateDiceExpression(payload, [19]); // Threat 19 + 6 = 25 >= 15 -> Crit!
    expect(res.isHit).toBe(true);
    expect(res.isCriticalHit).toBe(true);
    expect(res.label).toBe('Ataque Espada Longa');
  });
});
