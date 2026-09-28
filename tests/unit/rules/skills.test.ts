/**
 * Unit Tests — Skills Engine (Feature 10)
 * 29 Canonical T20 Skills, Tiered Training (+2/+4/+6), Somente Treinada checks, and TRPG Ranks
 */

import { describe, it, expect } from 'vitest';
import {
  T20_SKILLS,
  calculateSkillBonus,
  getT20TrainingBonus,
  normalizeSkillId
} from '../../../src/lib/rules/skills';

describe('Unit Tests: Skills Engine (Feature 10)', () => {
  describe('Canonical T20 Skills Catalog', () => {
    it('should contain all 29 canonical skills', () => {
      const skillsCount = Object.keys(T20_SKILLS).length;
      expect(skillsCount).toBe(29);
    });

    it('should have correct key attributes and flags for key skills', () => {
      // Physical & Armor Penalty
      expect(T20_SKILLS.acrobacia.attribute).toBe('DES');
      expect(T20_SKILLS.acrobacia.armorPenalty).toBe(true);
      expect(T20_SKILLS.acrobacia.trainedOnly).toBe(false);

      expect(T20_SKILLS.furtividade.attribute).toBe('DES');
      expect(T20_SKILLS.furtividade.armorPenalty).toBe(true);
      expect(T20_SKILLS.furtividade.trainedOnly).toBe(false);

      expect(T20_SKILLS.ladinagem.attribute).toBe('DES');
      expect(T20_SKILLS.ladinagem.armorPenalty).toBe(true);
      expect(T20_SKILLS.ladinagem.trainedOnly).toBe(true);

      // Somente Treinada
      expect(T20_SKILLS.conhecimento.trainedOnly).toBe(true);
      expect(T20_SKILLS.misticismo.trainedOnly).toBe(true);
      expect(T20_SKILLS.guerra.trainedOnly).toBe(true);
      expect(T20_SKILLS.pilotagem.trainedOnly).toBe(true);
      expect(T20_SKILLS.religiao.trainedOnly).toBe(true);
      expect(T20_SKILLS.adestramento.trainedOnly).toBe(true);
      expect(T20_SKILLS.jogatina.trainedOnly).toBe(true);
      expect(T20_SKILLS.nobreza.trainedOnly).toBe(true);
      expect(T20_SKILLS.oficio.trainedOnly).toBe(true);

      // Combat skills
      expect(T20_SKILLS.luta.isCombatSkill).toBe(true);
      expect(T20_SKILLS.pontaria.isCombatSkill).toBe(true);

      // Saving throws
      expect(T20_SKILLS.fortitude.isSavingThrow).toBe(true);
      expect(T20_SKILLS.reflexos.isSavingThrow).toBe(true);
      expect(T20_SKILLS.vontade.isSavingThrow).toBe(true);
    });
  });

  describe('T20 Training Bonus Progression', () => {
    it('should return 0 when not trained', () => {
      expect(getT20TrainingBonus(1, false)).toBe(0);
      expect(getT20TrainingBonus(10, false)).toBe(0);
      expect(getT20TrainingBonus(20, false)).toBe(0);
    });

    it('should award +2 at levels 1 to 6', () => {
      for (let lvl = 1; lvl <= 6; lvl++) {
        expect(getT20TrainingBonus(lvl, true)).toBe(2);
      }
    });

    it('should award +4 at levels 7 to 14', () => {
      for (let lvl = 7; lvl <= 14; lvl++) {
        expect(getT20TrainingBonus(lvl, true)).toBe(4);
      }
    });

    it('should award +6 at levels 15 to 20', () => {
      for (let lvl = 15; lvl <= 20; lvl++) {
        expect(getT20TrainingBonus(lvl, true)).toBe(6);
      }
    });
  });

  describe('T20 Skill Check Calculations', () => {
    it('should calculate untrained open skill checks: floor(level/2) + attrMod', () => {
      // Percepção, SAB +2, untrained:
      // Level 1: 0 + 2 = 2
      const lvl1 = calculateSkillBonus('T20', 'percepcao', 1, 2, false);
      expect(lvl1.canBeUsed).toBe(true);
      expect(lvl1.bonus).toBe(2);

      // Level 4: 2 + 2 = 4
      const lvl4 = calculateSkillBonus('T20', 'percepcao', 4, 2, false);
      expect(lvl4.canBeUsed).toBe(true);
      expect(lvl4.bonus).toBe(4);

      // Level 10: 5 + 2 = 7
      const lvl10 = calculateSkillBonus('T20', 'percepcao', 10, 2, false);
      expect(lvl10.canBeUsed).toBe(true);
      expect(lvl10.bonus).toBe(7);
    });

    it('should disallow untrained checks for "Somente Treinada" skills in T20', () => {
      const untrainedSkills = [
        'adestramento',
        'conhecimento',
        'guerra',
        'jogatina',
        'ladinagem',
        'misticismo',
        'nobreza',
        'oficio',
        'pilotagem',
        'religiao'
      ];

      for (const skill of untrainedSkills) {
        const res = calculateSkillBonus('T20', skill, 3, 2, false);
        expect(res.canBeUsed).toBe(false);
        expect(res.bonus).toBe(0);
        expect(res.error).toContain('somente treinada');
      }
    });

    it('should allow trained checks for "Somente Treinada" skills with correct bonuses', () => {
      // Conhecimento, INT +3, Level 3: half-level 1 + INT 3 + training 2 = 6
      const res = calculateSkillBonus('T20', 'conhecimento', 3, 3, true);
      expect(res.canBeUsed).toBe(true);
      expect(res.bonus).toBe(6);

      // Level 8: half-level 4 + INT 3 + training 4 = 11
      const res8 = calculateSkillBonus('T20', 'conhecimento', 8, 3, true);
      expect(res8.canBeUsed).toBe(true);
      expect(res8.bonus).toBe(11);

      // Level 16: half-level 8 + INT 3 + training 6 = 17
      const res16 = calculateSkillBonus('T20', 'conhecimento', 16, 3, true);
      expect(res16.canBeUsed).toBe(true);
      expect(res16.bonus).toBe(17);
    });

    it('should deduct armor penalty only from affected physical skills', () => {
      // Furtividade is penalized: level 2 (half-level 1), DES +3, trained (+2), penalty 2
      // 1 + 3 + 2 - 2 = 4
      const furtividade = calculateSkillBonus('T20', 'furtividade', 2, 3, true, 2);
      expect(furtividade.bonus).toBe(4);
      expect(furtividade.armorPenaltyApplied).toBe(2);

      // Acrobacia is penalized:
      const acrobacia = calculateSkillBonus('T20', 'acrobacia', 2, 3, true, 2);
      expect(acrobacia.bonus).toBe(4);

      // Percepção is NOT penalized:
      const percepcao = calculateSkillBonus('T20', 'percepcao', 2, 3, true, 2);
      expect(percepcao.bonus).toBe(6);
      expect(percepcao.armorPenaltyApplied).toBe(0);
    });

    it('should allow negative total skill bonus when penalty exceeds base modifiers', () => {
      // Level 1 (half-level 0), DES -1, untrained (0), armor penalty -4: 0 - 1 - 4 = -5
      const res = calculateSkillBonus('T20', 'acrobacia', 1, -1, false, 4);
      expect(res.canBeUsed).toBe(true);
      expect(res.bonus).toBe(-5);
    });

    it('should implement valueOf so results coerce cleanly to numbers if accessed as primitives', () => {
      const res = calculateSkillBonus('T20', 'luta', 4, 3, true);
      // half-level 2 + 3 + 2 = 7
      expect(res.bonus).toBe(7);
      expect(Number(res)).toBe(7);
      expect(+res).toBe(7);
    });
  });

  describe('TRPG Skill Check Calculations', () => {
    it('should calculate TRPG skill bonus: attrMod + ranks (level+3) - penalty', () => {
      // Level 3, trained in Furtividade with DES 16 (+3), armor penalty 2
      // 3 (attr) + (3 + 3) (ranks) - 2 (armor) = 7
      const trpgTrained = calculateSkillBonus('TRPG', 'furtividade', 3, 3, true, 2);
      expect(trpgTrained.canBeUsed).toBe(true);
      expect(trpgTrained.bonus).toBe(7);

      // Untrained: 3 (attr) + 0 - 2 = 1
      const trpgUntrained = calculateSkillBonus('TRPG', 'furtividade', 3, 3, false, 2);
      expect(trpgUntrained.canBeUsed).toBe(true);
      expect(trpgUntrained.bonus).toBe(1);
    });
  });

  describe('Normalization', () => {
    it('should normalize skill IDs handling uppercase and accents', () => {
      expect(normalizeSkillId('Acrobacia')).toBe('acrobacia');
      expect(normalizeSkillId('Intuição')).toBe('intuicao');
      expect(normalizeSkillId('Percepção')).toBe('percepcao');
      expect(normalizeSkillId('Sobrevivência')).toBe('sobrevivencia');
    });
  });
});
