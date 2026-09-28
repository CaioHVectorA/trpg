import { describe, it, expect } from 'vitest';
import {
  validatePMExpenditure,
  calculateMisseisMagicosFormula,
  calculateBolaDeFogoFormula,
  calculateCurarFerimentosFormula,
  calculateAtaqueEspecialBonus
} from '@/lib/dice/enhancements';

describe('PM Enhancement Scaling (tests/unit/dice/enhancements.test.ts)', () => {
  describe('validatePMExpenditure', () => {
    it('should allow spending when cost is within level limit and current PM', () => {
      const res = validatePMExpenditure(10, 3, 5);
      expect(res.allowed).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('should reject spending when cost exceeds character level limit', () => {
      const res = validatePMExpenditure(20, 5, 3);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Limite de gastos excedido');
    });

    it('should reject spending when cost exceeds current PM pool', () => {
      const res = validatePMExpenditure(2, 4, 10);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('PM insuficiente');
    });

    it('should reject negative costs', () => {
      const res = validatePMExpenditure(10, -1, 5);
      expect(res.allowed).toBe(false);
    });
  });

  describe('calculateMisseisMagicosFormula', () => {
    it('should return base 2d4+2 for 1 PM', () => {
      const res = calculateMisseisMagicosFormula(1);
      expect(res.formula).toBe('2d4+2');
      expect(res.missilesCount).toBe(2);
      expect(res.totalPM).toBe(1);
    });

    it('should scale to 3d4+3 for 3 PM (+2 PM enhancement)', () => {
      const res = calculateMisseisMagicosFormula(3);
      expect(res.formula).toBe('3d4+3');
      expect(res.missilesCount).toBe(3);
      expect(res.totalPM).toBe(3);
    });

    it('should scale to 4d4+4 for 5 PM (+4 PM enhancement)', () => {
      const res = calculateMisseisMagicosFormula(5);
      expect(res.formula).toBe('4d4+4');
      expect(res.missilesCount).toBe(4);
      expect(res.totalPM).toBe(5);
    });
  });

  describe('calculateBolaDeFogoFormula', () => {
    it('should return base 6d6 for 3 PM', () => {
      const res = calculateBolaDeFogoFormula(3);
      expect(res.formula).toBe('6d6');
      expect(res.diceCount).toBe(6);
      expect(res.totalPM).toBe(3);
    });

    it('should scale to 8d6 for 5 PM (+2 PM enhancement)', () => {
      const res = calculateBolaDeFogoFormula(5);
      expect(res.formula).toBe('8d6');
      expect(res.diceCount).toBe(8);
      expect(res.totalPM).toBe(5);
    });

    it('should scale to 10d6 for 7 PM (+4 PM enhancement)', () => {
      const res = calculateBolaDeFogoFormula(7);
      expect(res.formula).toBe('10d6');
      expect(res.diceCount).toBe(10);
      expect(res.totalPM).toBe(7);
    });
  });

  describe('calculateCurarFerimentosFormula', () => {
    it('should return base 2d8+2 for 1 PM', () => {
      const res = calculateCurarFerimentosFormula(1);
      expect(res.formula).toBe('2d8+2');
      expect(res.diceCount).toBe(2);
      expect(res.flatBonus).toBe(2);
    });

    it('should scale to 3d8+3 for 3 PM (+2 PM enhancement)', () => {
      const res = calculateCurarFerimentosFormula(3);
      expect(res.formula).toBe('3d8+3');
      expect(res.diceCount).toBe(3);
      expect(res.flatBonus).toBe(3);
    });
  });

  describe('calculateAtaqueEspecialBonus', () => {
    it('should allocate +4 on attack by default for 1 PM', () => {
      const res = calculateAtaqueEspecialBonus(1);
      expect(res.attackBonus).toBe(4);
      expect(res.damageBonus).toBe(0);
      expect(res.totalPM).toBe(1);
    });

    it('should allocate +8 on attack for 2 PM if not specified', () => {
      const res = calculateAtaqueEspecialBonus(2);
      expect(res.attackBonus).toBe(8);
      expect(res.damageBonus).toBe(0);
      expect(res.totalPM).toBe(2);
    });

    it('should allow split between attack and damage', () => {
      const res = calculateAtaqueEspecialBonus(2, 1, 1);
      expect(res.attackBonus).toBe(4);
      expect(res.damageBonus).toBe(4);
    });
  });
});
