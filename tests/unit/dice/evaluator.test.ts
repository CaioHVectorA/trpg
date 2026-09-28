import { describe, it, expect } from 'vitest';
import { evaluateDiceExpression, DiceEngine } from '@/lib/dice';

describe('Dice Evaluator (tests/unit/dice/evaluator.test.ts)', () => {
  it('should evaluate deterministic formula with fixed rolls', () => {
    const res = evaluateDiceExpression({ formula: '1d20+5' }, [14]);
    expect(res.total).toBe(19);
    expect(res.modifiers).toBe(5);
    expect(res.rolls.length).toBe(1);
    expect(res.rolls[0]).toEqual({ die: 20, result: 14 });
    expect(res.breakdown).toBe('[d20: 14] + (5)');
    expect(res.formattedOutput).toBe('19 ([d20: 14] + (5))');
  });

  it('should evaluate advantage (keep highest) correctly', () => {
    const res = evaluateDiceExpression({ formula: '2d20kh1+3' }, [6, 18]);
    expect(res.total).toBe(21); // 18 + 3
    expect(res.rolls.length).toBe(2);
    expect(res.rolls[0].result).toBe(6);
    expect(res.rolls[1].result).toBe(18);
  });

  it('should evaluate disadvantage (keep lowest) correctly', () => {
    const res = evaluateDiceExpression({ formula: '2d20kl1+4' }, [15, 7]);
    expect(res.total).toBe(11); // 7 + 4
    expect(res.rolls.length).toBe(2);
  });

  it('should evaluate multiple dice types in one expression', () => {
    const res = evaluateDiceExpression({ formula: '1d8+2d6+3' }, [5, 4, 3]);
    expect(res.total).toBe(5 + 4 + 3 + 3); // 15
    expect(res.rolls.length).toBe(3);
    expect(res.rolls[0]).toEqual({ die: 8, result: 5 });
    expect(res.rolls[1]).toEqual({ die: 6, result: 4 });
    expect(res.rolls[2]).toEqual({ die: 6, result: 3 });
  });

  it('should evaluate random rolls within valid range without fixed rolls', () => {
    for (let i = 0; i < 20; i++) {
      const res = evaluateDiceExpression({ formula: '1d6+2' });
      expect(res.total).toBeGreaterThanOrEqual(3);
      expect(res.total).toBeLessThanOrEqual(8);
      expect(res.rolls[0].result).toBeGreaterThanOrEqual(1);
      expect(res.rolls[0].result).toBeLessThanOrEqual(6);
    }
  });

  it('should work via static DiceEngine.roll facade', () => {
    const res = DiceEngine.roll({ formula: '1d20+10 # Percepção' }, [12]);
    expect(res.total).toBe(22);
    expect(res.label).toBe('Percepção');
    expect(res.formattedOutput).toContain('# Percepção');
  });
});
