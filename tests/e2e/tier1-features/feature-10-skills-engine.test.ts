/**
 * E2E Tier 1 — Feature 10: Dual-System Skills Engine
 * Opaque-box tests verifying T20 tiered training (+2/+4/+6) & Somente Treinada vs TRPG skill mechanics
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';

describe('Feature 10: Dual-System Skills Engine', () => {
  it('F10-T1: should scale T20 training bonus across the 3 tiers (+2, +4, +6)', () => {
    // Level 3 (Tier 1: +2): half-level 1 + INT 3 + 2 = 6
    const resLvl3 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 3, 3, true);
    expect(resLvl3.bonus).toBe(6);

    // Level 8 (Tier 2: +4): half-level 4 + INT 3 + 4 = 11
    const resLvl8 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 8, 3, true);
    expect(resLvl8.bonus).toBe(11);

    // Level 16 (Tier 3: +6): half-level 8 + INT 3 + 6 = 17
    const resLvl16 = SystemAdapter.calculateSkillBonus('T20', 'conhecimento', 16, 3, true);
    expect(resLvl16.bonus).toBe(17);
  });

  it('F10-T2: should disallow untrained checks for "Somente Treinada" skills in T20', () => {
    const ladinagem = SystemAdapter.calculateSkillBonus('T20', 'ladinagem', 2, 3, false);
    expect(ladinagem.canBeUsed).toBe(false);
    expect(ladinagem.error).toContain('somente treinada');

    const misticismo = SystemAdapter.calculateSkillBonus('T20', 'misticismo', 2, 3, false);
    expect(misticismo.canBeUsed).toBe(false);
  });

  it('F10-T3: should allow untrained checks for non-restricted skills in T20 using half-level and stat', () => {
    // Percepção is not trained-only. Level 4 (half-level 2) with SAB +2 untrained: 2 + 2 = 4
    const percepcao = SystemAdapter.calculateSkillBonus('T20', 'percepcao', 4, 2, false);
    expect(percepcao.canBeUsed).toBe(true);
    expect(percepcao.bonus).toBe(4);
  });

  it('F10-T4: should deduct armor check penalty from physical skills (Acrobacia, Furtividade, Ladinagem)', () => {
    // Furtividade with DES +3, trained at level 2 (half-level 1, training +2), Armor penalty -2
    // Expected: 1 + 3 + 2 - 2 = 4
    const furtividade = SystemAdapter.calculateSkillBonus('T20', 'furtividade', 2, 3, true, 2);
    expect(furtividade.bonus).toBe(4);

    // Percepção is NOT affected by armor penalty
    const percepcao = SystemAdapter.calculateSkillBonus('T20', 'percepcao', 2, 3, true, 2);
    expect(percepcao.bonus).toBe(6); // 1 + 3 + 2 = 6
  });

  it('F10-T5: should calculate TRPG skill bonus using rank progression and armor penalty', () => {
    // TRPG Level 3 character trained in skill with DES 16 (+3): 3 (attr) + (3 + 3) - 2 (armor) = 7
    const trpgSkill = SystemAdapter.calculateSkillBonus('TRPG', 'furtividade', 3, 3, true, 2);
    expect(trpgSkill.canBeUsed).toBe(true);
    expect(trpgSkill.bonus).toBe(7);
  });
});
