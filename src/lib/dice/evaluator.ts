/**
 * TRPG Platform — Dice Expression Evaluator
 * Evaluates AST expressions with cryptographically secure PRNG,
 * advantage/disadvantage resolution, and critical calculation.
 */

import { parseDiceExpression } from './parser';
import { evaluateCriticalOutcome } from './critical';
import { DiceRollRequest, DiceRollResult } from '../types';

/**
 * Generates an integer die roll between 1 and sides inclusive using crypto.getRandomValues if available.
 */
function rollDie(sides: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return (buffer[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Evaluates a DiceRollRequest using an AST parser and critical outcome evaluator.
 * Allows passing fixedRolls for deterministic test execution.
 */
export function evaluateDiceExpression(
  req: DiceRollRequest,
  fixedRolls?: number[]
): DiceRollResult {
  const ast = parseDiceExpression(req.formula);

  let total = 0;
  let modifiers = 0;
  const rolls: Array<{ die: number; result: number }> = [];
  let fixedRollIndex = 0;

  for (const term of ast.terms) {
    if (term.type === 'DICE') {
      const termRolls: number[] = [];

      for (let i = 0; i < term.count; i++) {
        const val = (fixedRolls && fixedRolls[fixedRollIndex] !== undefined)
          ? fixedRolls[fixedRollIndex++]
          : rollDie(term.sides);

        termRolls.push(val);
        rolls.push({ die: term.sides, result: val });
      }

      let termSum = 0;
      if (term.keep) {
        if (term.keep.type === 'kh') {
          // Keep highest K dice
          const sorted = [...termRolls].sort((a, b) => b - a);
          termSum = sorted.slice(0, term.keep.count).reduce((acc, curr) => acc + curr, 0);
        } else if (term.keep.type === 'kl') {
          // Keep lowest K dice
          const sorted = [...termRolls].sort((a, b) => a - b);
          termSum = sorted.slice(0, term.keep.count).reduce((acc, curr) => acc + curr, 0);
        }
      } else {
        termSum = termRolls.reduce((acc, curr) => acc + curr, 0);
      }

      total += term.sign * termSum;
    } else if (term.type === 'NUMBER') {
      const signedMod = term.sign * term.value;
      modifiers += signedMod;
      total += signedMod;
    }
  }

  // Evaluate Critical & Threat outcomes
  const criticalOutcome = evaluateCriticalOutcome({
    system: req.system,
    threatRange: req.threatRange,
    critMultiplier: req.critMultiplier,
    targetDefense: req.targetDefense,
    rolls,
    total,
    modifiers
  });

  // Construct readable breakdown
  const diceBreakdownParts = rolls.map(r => `[d${r.die}: ${r.result}]`);
  let breakdown = diceBreakdownParts.join(' + ');

  if (modifiers !== 0) {
    breakdown = breakdown
      ? `${breakdown} + (${modifiers})`
      : `(${modifiers})`;
  } else if (!breakdown) {
    breakdown = '0';
  }

  const effectiveDC = req.targetDC !== undefined ? req.targetDC : req.targetDefense;
  let dcOutcome: 'SUCCESS' | 'CRITICAL_SUCCESS' | 'FAILURE' | 'CRITICAL_FAILURE' | undefined = undefined;

  if (effectiveDC !== undefined) {
    if (criticalOutcome.isNatural20) {
      dcOutcome = 'CRITICAL_SUCCESS';
    } else if (criticalOutcome.isNatural1) {
      dcOutcome = 'CRITICAL_FAILURE';
    } else if (total >= effectiveDC) {
      dcOutcome = 'SUCCESS';
    } else {
      dcOutcome = 'FAILURE';
    }
  }

  const label = ast.label;
  const formattedOutput = `${total} (${breakdown})${label ? ` # ${label}` : ''}`;
  const timestamp = new Date().toISOString();

  return {
    total,
    rolls,
    modifiers,
    isNatural20: criticalOutcome.isNatural20,
    isNatural1: criticalOutcome.isNatural1,
    isCriticalHit: criticalOutcome.isCriticalHit,
    isFumble: criticalOutcome.isFumble,
    isHit: criticalOutcome.isHit,
    targetDC: req.targetDC,
    dcOutcome,
    damageResult: criticalOutcome.damageResult,
    formattedOutput,
    breakdown,
    label,
    timestamp
  };
}
