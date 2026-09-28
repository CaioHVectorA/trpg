/**
 * E2E Tier 1 — Feature 13: d20 Expression Parser
 * Opaque-box tests verifying AST parsing of expressions like 1d20+X, 2d6+Y, 2d20kh1, and # tags
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 13: d20 Expression Parser', () => {
  it('F13-T1: should parse simple 1d20+modifier expression correctly', () => {
    const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20+7' }, [12]);
    expect(res.total).toBe(19);
    expect(res.modifiers).toBe(7);
    expect(res.rolls.length).toBe(1);
    expect(res.rolls[0].die).toBe(20);
    expect(res.rolls[0].result).toBe(12);
  });

  it('F13-T2: should parse multi-dice expressions (e.g. 2d6+4)', () => {
    const res = SystemAdapter.evaluateDiceExpression({ formula: '2d6+4' }, [3, 5]);
    expect(res.total).toBe(12); // 3 + 5 + 4
    expect(res.modifiers).toBe(4);
    expect(res.rolls.length).toBe(2);
  });

  it('F13-T3: should support advantage expressions (keep highest: 2d20kh1)', () => {
    const res = SystemAdapter.evaluateDiceExpression({ formula: '2d20kh1+5' }, [8, 17]);
    // Keeps 17 + 5 = 22
    expect(res.total).toBe(22);
  });

  it('F13-T4: should extract comments and descriptive tags following #', () => {
    const res = SystemAdapter.evaluateDiceExpression({
      formula: '1d20+9 # Ataque Espada Longa'
    }, [14]);
    expect(res.total).toBe(23);
    expect(res.label).toBe('Ataque Espada Longa');
    expect(res.formattedOutput).toContain('# Ataque Espada Longa');
  });

  it('F13-T5: should generate detailed rolls breakdown string and timestamp', () => {
    const res = SystemAdapter.evaluateDiceExpression({ formula: '1d20+4' }, [15]);
    expect(res.breakdown).toContain('[d20: 15]');
    expect(res.breakdown).toContain('4');
    expect(res.timestamp).toBeDefined();
    expect(new Date(res.timestamp).getTime()).not.toBeNaN();
  });
});
