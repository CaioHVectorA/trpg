import { describe, it, expect } from 'vitest';
import {
  normalizeTokenSize,
  getTokenDimension,
  calculateHpPercentage,
  getHpBarColor,
  parseConditions,
  toggleCondition,
  applyTokenHpDelta,
} from '@/lib/vtt/tokens';
import { VttToken } from '@/lib/types';

describe('VTT Token System', () => {
  describe('normalizeTokenSize & getTokenDimension', () => {
    it('should normalize shorthand P, M, G, E sizes to Tormenta categories', () => {
      expect(normalizeTokenSize('P')).toBe('PEQUENO');
      expect(normalizeTokenSize('M')).toBe('MEDIO');
      expect(normalizeTokenSize('G')).toBe('GRANDE');
      expect(normalizeTokenSize('E')).toBe('ENORME');
      expect(normalizeTokenSize('COL')).toBe('COLOSSAL');
      expect(normalizeTokenSize('MIN')).toBe('MINUSCULO');
    });

    it('should normalize full names in Portuguese and English', () => {
      expect(normalizeTokenSize('pequeno')).toBe('PEQUENO');
      expect(normalizeTokenSize('médio')).toBe('MEDIO');
      expect(normalizeTokenSize('medio')).toBe('MEDIO');
      expect(normalizeTokenSize('grande')).toBe('GRANDE');
      expect(normalizeTokenSize('enorme')).toBe('ENORME');
      expect(normalizeTokenSize('colossal')).toBe('COLOSSAL');
      expect(normalizeTokenSize('huge')).toBe('ENORME');
      expect(normalizeTokenSize('small')).toBe('PEQUENO');
    });

    it('should map sizes to cell dimensions', () => {
      expect(getTokenDimension('MINUSCULO')).toBe(0.5);
      expect(getTokenDimension('P')).toBe(1);
      expect(getTokenDimension('M')).toBe(1);
      expect(getTokenDimension('G')).toBe(2);
      expect(getTokenDimension('E')).toBe(3);
      expect(getTokenDimension('COLOSSAL')).toBe(4);
    });
  });

  describe('calculateHpPercentage & getHpBarColor', () => {
    it('should calculate clamped percentage correctly', () => {
      expect(calculateHpPercentage(50, 100)).toBe(50);
      expect(calculateHpPercentage(25, 100)).toBe(25);
      expect(calculateHpPercentage(0, 100)).toBe(0);
      expect(calculateHpPercentage(-10, 100)).toBe(0);
      expect(calculateHpPercentage(150, 100)).toBe(100);
      expect(calculateHpPercentage(10, 0)).toBe(0);
    });

    it('should return appropriate color based on health threshold', () => {
      expect(getHpBarColor(75)).toBe('#10B981'); // Green (>50%)
      expect(getHpBarColor(51)).toBe('#10B981');
      expect(getHpBarColor(50)).toBe('#F59E0B'); // Amber (25-50%)
      expect(getHpBarColor(25)).toBe('#F59E0B');
      expect(getHpBarColor(24)).toBe('#EF4444'); // Red (<25%)
      expect(getHpBarColor(0)).toBe('#EF4444');
    });
  });

  describe('parseConditions & toggleCondition', () => {
    it('should parse condition arrays or JSON string representation', () => {
      expect(parseConditions(['Caído', 'Cego'])).toEqual(['Caído', 'Cego']);
      expect(parseConditions('["Caído", "Vulnerável"]')).toEqual(['Caído', 'Vulnerável']);
      expect(parseConditions(null)).toEqual([]);
      expect(parseConditions('invalid json')).toEqual([]);
    });

    it('should toggle conditions on and off', () => {
      const initial = ['Caído'];
      const added = toggleCondition(initial, 'Vulnerável');
      expect(added).toEqual(['Caído', 'Vulnerável']);

      const removed = toggleCondition(added, 'Caído');
      expect(removed).toEqual(['Vulnerável']);
    });
  });

  describe('applyTokenHpDelta', () => {
    const baseToken: VttToken = {
      id: 'token-1',
      name: 'Guerreiro',
      system: 'T20',
      size: 'MEDIO',
      gridX: 2,
      gridY: 3,
      pvCurrent: 30,
      pvMax: 30,
      pvTemp: 10,
      pmCurrent: 5,
      pmMax: 5,
      conditions: [],
    };

    it('should absorb damage with temporary HP first', () => {
      const { updatedToken, effectiveDamage, tempHpAbsorbed } = applyTokenHpDelta(baseToken, -6);
      expect(tempHpAbsorbed).toBe(6);
      expect(effectiveDamage).toBe(0);
      expect(updatedToken.pvTemp).toBe(4);
      expect(updatedToken.pvCurrent).toBe(30);
    });

    it('should overflow damage to current HP when temporary HP is exhausted', () => {
      const { updatedToken, effectiveDamage, tempHpAbsorbed } = applyTokenHpDelta(baseToken, -15);
      expect(tempHpAbsorbed).toBe(10);
      expect(effectiveDamage).toBe(5);
      expect(updatedToken.pvTemp).toBe(0);
      expect(updatedToken.pvCurrent).toBe(25);
    });

    it('should automatically apply Inconsciente and Sangrando when HP drops <= 0', () => {
      const { updatedToken } = applyTokenHpDelta(baseToken, -45);
      expect(updatedToken.pvCurrent).toBe(-5);
      expect(updatedToken.conditions).toContain('Inconsciente');
      expect(updatedToken.conditions).toContain('Sangrando');
    });

    it('should clear Inconsciente and Sangrando when healed above 0', () => {
      const downToken: VttToken = {
        ...baseToken,
        pvCurrent: -5,
        pvTemp: 0,
        conditions: ['Inconsciente', 'Sangrando', 'Caído'],
      };

      const { updatedToken } = applyTokenHpDelta(downToken, 10);
      expect(updatedToken.pvCurrent).toBe(5);
      expect(updatedToken.conditions).not.toContain('Inconsciente');
      expect(updatedToken.conditions).not.toContain('Sangrando');
      expect(updatedToken.conditions).toContain('Caído'); // Retains other conditions
    });

    it('should not heal beyond max HP', () => {
      const { updatedToken } = applyTokenHpDelta(baseToken, 20);
      expect(updatedToken.pvCurrent).toBe(30);
    });
  });
});
