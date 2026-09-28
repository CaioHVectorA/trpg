import { describe, it, expect } from 'vitest';
import { parseDiceExpression, ParseError } from '@/lib/dice/parser';

describe('Dice AST Parser (tests/unit/dice/parser.test.ts)', () => {
  it('should parse basic NdX formula with positive modifier', () => {
    const ast = parseDiceExpression('1d20+7');
    expect(ast.type).toBe('EXPRESSION');
    expect(ast.terms.length).toBe(2);

    const diceTerm = ast.terms[0];
    expect(diceTerm.type).toBe('DICE');
    if (diceTerm.type === 'DICE') {
      expect(diceTerm.count).toBe(1);
      expect(diceTerm.sides).toBe(20);
      expect(diceTerm.sign).toBe(1);
      expect(diceTerm.keep).toBeUndefined();
    }

    const numTerm = ast.terms[1];
    expect(numTerm.type).toBe('NUMBER');
    if (numTerm.type === 'NUMBER') {
      expect(numTerm.value).toBe(7);
      expect(numTerm.sign).toBe(1);
    }
  });

  it('should parse formula with omitted count (e.g. d20 or d6)', () => {
    const ast = parseDiceExpression('d20+3');
    expect(ast.terms[0].type).toBe('DICE');
    if (ast.terms[0].type === 'DICE') {
      expect(ast.terms[0].count).toBe(1);
      expect(ast.terms[0].sides).toBe(20);
    }
  });

  it('should parse advantage keep highest (2d20kh1)', () => {
    const ast = parseDiceExpression('2d20kh1+5');
    const diceTerm = ast.terms[0];
    expect(diceTerm.type).toBe('DICE');
    if (diceTerm.type === 'DICE') {
      expect(diceTerm.count).toBe(2);
      expect(diceTerm.sides).toBe(20);
      expect(diceTerm.keep).toEqual({ type: 'kh', count: 1 });
    }
  });

  it('should parse disadvantage keep lowest (2d20kl1)', () => {
    const ast = parseDiceExpression('2d20kl1-2');
    const diceTerm = ast.terms[0];
    expect(diceTerm.type).toBe('DICE');
    if (diceTerm.type === 'DICE') {
      expect(diceTerm.count).toBe(2);
      expect(diceTerm.sides).toBe(20);
      expect(diceTerm.keep).toEqual({ type: 'kl', count: 1 });
    }

    const modTerm = ast.terms[1];
    if (modTerm.type === 'NUMBER') {
      expect(modTerm.value).toBe(2);
      expect(modTerm.sign).toBe(-1);
    }
  });

  it('should parse multi-dice expressions (1d8+1d6+4)', () => {
    const ast = parseDiceExpression('1d8+1d6+4');
    expect(ast.terms.length).toBe(3);
    expect(ast.terms[0]).toMatchObject({ type: 'DICE', count: 1, sides: 8, sign: 1 });
    expect(ast.terms[1]).toMatchObject({ type: 'DICE', count: 1, sides: 6, sign: 1 });
    expect(ast.terms[2]).toMatchObject({ type: 'NUMBER', value: 4, sign: 1 });
  });

  it('should extract comments/labels after # correctly', () => {
    const ast = parseDiceExpression('1d20+10 # Ataque Espada Longa');
    expect(ast.label).toBe('Ataque Espada Longa');
    expect(ast.terms.length).toBe(2);
  });

  it('should handle zero and negative modifiers', () => {
    const astZero = parseDiceExpression('1d20+0');
    expect(astZero.terms[1]).toMatchObject({ type: 'NUMBER', value: 0, sign: 1 });

    const astNeg = parseDiceExpression('1d20-4');
    expect(astNeg.terms[1]).toMatchObject({ type: 'NUMBER', value: 4, sign: -1 });
  });

  it('should parse empty formula gracefully', () => {
    const ast = parseDiceExpression('');
    expect(ast.terms).toEqual([]);
    expect(ast.label).toBeUndefined();
  });

  it('should throw ParseError on malformed dice formula', () => {
    expect(() => parseDiceExpression('1d20 + ?')).toThrow(ParseError);
    expect(() => parseDiceExpression('invalid_text')).toThrow(ParseError);
  });
});
