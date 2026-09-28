/**
 * E2E Tier 1 — Feature 17: Visual Dice Roller & Log
 * Opaque-box tests verifying structured roll result objects, formatting, and RollLog persistence schema
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 17: Visual Dice Roller & Log', () => {
  it('F17-T1: should return a complete structured roll result object matching contracts', () => {
    const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20+6' }, [14]);
    expect(res).toHaveProperty('total', 20);
    expect(res).toHaveProperty('rolls');
    expect(res).toHaveProperty('modifiers', 6);
    expect(res).toHaveProperty('isNatural20', false);
    expect(res).toHaveProperty('isNatural1', false);
    expect(res).toHaveProperty('isCriticalHit');
    expect(res).toHaveProperty('isFumble', false);
    expect(res).toHaveProperty('formattedOutput');
    expect(res).toHaveProperty('breakdown');
    expect(res).toHaveProperty('timestamp');
  });

  it('F17-T2: should format readable output string with expression breakdown and tags', () => {
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+8 # Ataque Especial'
    }, [18]);
    expect(res.formattedOutput).toContain('26');
    expect(res.formattedOutput).toContain('[d20: 18]');
    expect(res.formattedOutput).toContain('(8)');
    expect(res.formattedOutput).toContain('# Ataque Especial');
  });

  it('F17-T3: should structure roll records for database persistence into RollLog schema', () => {
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+7 # Iniciativa',
      system: 'T20'
    }, [12]);

    const logRecord = {
      senderName: 'Guerreiro de Valkaria',
      system: 'T20',
      rollType: 'INITIATIVE',
      expression: '1d20+7 # Iniciativa',
      diceBreakdown: JSON.stringify(res.rolls),
      total: res.total,
      isCrit: res.isCriticalHit,
      isFumble: res.isFumble,
      label: res.label
    };

    expect(logRecord.total).toBe(19);
    expect(logRecord.rollType).toBe('INITIATIVE');
    expect(JSON.parse(logRecord.diceBreakdown)[0].result).toBe(12);
  });

  it('F17-T4: should properly flag critical hits in roll log metadata', () => {
    const resCrit = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+5',
      threatRange: 19,
      targetDefense: 15
    }, [19]); // Threat 19 hits defense 15 -> Critical!
    expect(resCrit.isCriticalHit).toBe(true);
    expect(resCrit.isFumble).toBe(false);
  });

  it('F17-T5: should properly flag fumbles (Natural 1) in roll log metadata', () => {
    const resFumble = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+12'
    }, [1]);
    expect(resFumble.isNatural1).toBe(true);
    expect(resFumble.isFumble).toBe(true);
    expect(resFumble.isCriticalHit).toBe(false);
  });
});
