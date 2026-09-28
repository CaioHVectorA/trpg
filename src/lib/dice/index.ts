/**
 * TRPG Platform — Contextual Dice Engine
 * Comprehensive d20 AST parser, critical & threat evaluator, PM enhancement scaling, and log engine.
 */

import { DiceRollRequest, DiceRollResult } from '../types';
import { evaluateDiceExpression } from './evaluator';

export * from './parser';
export * from './critical';
export * from './evaluator';
export * from './enhancements';

/**
 * Static facade class matching platform conventions.
 */
export class DiceEngine {
  /**
   * Evaluates a dice formula string with support for comments, criticals, advantages, and PM enhancements.
   */
  static roll(req: DiceRollRequest, fixedRolls?: number[]): DiceRollResult {
    return evaluateDiceExpression(req, fixedRolls);
  }
}

export default DiceEngine;
