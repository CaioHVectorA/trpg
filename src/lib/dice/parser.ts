/**
 * TRPG Platform — Dice Expression AST Parser
 * Parses Tormenta d20 expressions into a structured Abstract Syntax Tree (AST).
 * Syntax: RollTerm (('+' | '-') RollTerm)* ('#' Comment)?
 * Examples: "1d20+7", "2d6+4", "2d20kh1+5", "1d20+10 # Ataque Espada Longa"
 */

export interface DiceKeep {
  type: 'kh' | 'kl'; // kh = keep highest, kl = keep lowest
  count: number;
}

export interface DiceTermNode {
  type: 'DICE';
  count: number;
  sides: number;
  keep?: DiceKeep;
  sign: 1 | -1;
  raw: string;
}

export interface NumberTermNode {
  type: 'NUMBER';
  value: number;
  sign: 1 | -1;
  raw: string;
}

export type TermNode = DiceTermNode | NumberTermNode;

export interface DiceExpressionAST {
  type: 'EXPRESSION';
  terms: TermNode[];
  label?: string;
  rawFormula: string;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Tokenizes and parses a dice formula string into an AST.
 */
export function parseDiceExpression(formula: string): DiceExpressionAST {
  const trimmed = (formula || '').trim();
  if (!trimmed) {
    return {
      type: 'EXPRESSION',
      terms: [],
      rawFormula: formula
    };
  }

  // Extract comment / label following '#'
  let exprPart = trimmed;
  let label: string | undefined = undefined;

  const commentIndex = trimmed.indexOf('#');
  if (commentIndex !== -1) {
    exprPart = trimmed.slice(0, commentIndex).trim();
    label = trimmed.slice(commentIndex + 1).trim();
  }

  if (!exprPart) {
    return {
      type: 'EXPRESSION',
      terms: [],
      label,
      rawFormula: formula
    };
  }

  // Regular expression to match signed or unsigned terms:
  // e.g. "+", "-", "1d20", "2d20kh1", "7", "-3"
  const terms: TermNode[] = [];
  
  // Clean spaces around operators for deterministic token extraction
  // Match terms like: [+-]? \s* (\d*d\d+(?:(?:kh|kl)\d+)?|\d+)
  const termRegex = /([+-]?)\s*(\d*d\d+(?:(?:kh|kl)\d+)?|\d+)/gi;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  // Verify that the whole expression matches valid syntax
  // Split by termRegex matches to detect any unexpected characters
  const matchedCharacters: string[] = [];

  while ((match = termRegex.exec(exprPart)) !== null) {
    const rawSign = match[1];
    const rawBody = match[2];
    const fullMatch = match[0];
    
    // Check for gaps (unparsed characters)
    const gap = exprPart.slice(lastIndex, match.index).trim();
    if (gap && gap !== '+') {
      throw new ParseError(`Símbolo inesperado na expressão de dados: "${gap}"`);
    }
    lastIndex = match.index + fullMatch.length;

    const sign: 1 | -1 = rawSign === '-' ? -1 : 1;
    const lowerBody = rawBody.toLowerCase();

    if (lowerBody.includes('d')) {
      // Dice term: (count)?d(sides)((kh|kl)(keepCount))?
      const diceRegex = /^(\d*)d(\d+)(?:(kh|kl)(\d+))?$/i;
      const dMatch = lowerBody.match(diceRegex);
      if (!dMatch) {
        throw new ParseError(`Termo de dado inválido: "${rawBody}"`);
      }

      const countStr = dMatch[1];
      const sidesStr = dMatch[2];
      const keepType = dMatch[3] as 'kh' | 'kl' | undefined;
      const keepCountStr = dMatch[4];

      const count = countStr === '' ? 1 : parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);

      if (isNaN(count) || count < 0) {
        throw new ParseError(`Quantidade de dados inválida: "${countStr}"`);
      }
      if (isNaN(sides) || sides <= 0) {
        throw new ParseError(`Número de faces do dado inválido: "${sidesStr}"`);
      }

      let keep: DiceKeep | undefined = undefined;
      if (keepType) {
        const keepCount = keepCountStr ? parseInt(keepCountStr, 10) : 1;
        keep = {
          type: keepType.toLowerCase() as 'kh' | 'kl',
          count: keepCount
        };
      }

      terms.push({
        type: 'DICE',
        count,
        sides,
        keep,
        sign,
        raw: (sign === -1 ? '-' : '') + rawBody
      });
    } else {
      // Number modifier term
      const val = parseInt(rawBody, 10);
      if (isNaN(val)) {
        throw new ParseError(`Modificador numérico inválido: "${rawBody}"`);
      }
      terms.push({
        type: 'NUMBER',
        value: val,
        sign,
        raw: (sign === -1 ? '-' : '') + rawBody
      });
    }
  }

  const trailing = exprPart.slice(lastIndex).trim();
  if (trailing) {
    throw new ParseError(`Símbolo inesperado ao final da expressão: "${trailing}"`);
  }

  return {
    type: 'EXPRESSION',
    terms,
    label,
    rawFormula: formula
  };
}
