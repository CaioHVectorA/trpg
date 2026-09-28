# Task Assignment: Milestone M2 Rules Engine Core Worker

- **Role**: Pure Rules Engine Developer
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/m2_worker_1
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Sources**:
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md` (MUST read first)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md` (MUST inspect Section 2 for exact mathematical formulas)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md` (Inspect for condition side-effects)

## File Ownership
- Exclusively owns: `src/lib/rules/`, `tests/unit/rules/`.
- MUST NOT modify files owned by other milestones.

## Environment Notice
- Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` when running node, npm, npx, or vitest.

## Objective
Implement Milestone M2 (Features 6 to 12) in pure, deterministic TypeScript with zero React/DOM/DB dependencies:
1. **Attributes (`src/lib/rules/attributes.ts`)**:
   - T20 direct modifiers (-1 to +4 base) vs TRPG 3-18 scores with modifier calculation `floor((score - 10) / 2)`.
   - Polymorphic conversion and validation.
2. **Resource Pools (`src/lib/rules/pools.ts`)**:
   - T20 deterministic PV = `BasePV + CON_mod` (Level 1) + `(PV_per_level + CON_mod) * (level - 1)`.
   - T20 PM = `BasePM + INT/CAR/SAB_mod` + `PM_per_level * (level - 1)`.
   - TRPG PV (Hit Dice / average) and Spell Slots / Manual do Arcano PM formulas.
   - Golden Rule: `canSpendPM(currentPM, cost, characterLevel)` strictly enforcing that cost cannot exceed character level.
3. **Defense & AC (`src/lib/rules/defense.ts`)**:
   - T20 Defesa: `10 + DES_mod + armorBonus + shieldBonus + otherBonus`.
   - T20 Heavy Armor rule: if equipped armor is heavy, DEX bonus is locked to 0 (+0).
   - Crucial T20 rule: Player Characters DO NOT add half-level to Defesa.
   - TRPG CA: `10 + floor(level / 2) + min(DES_mod, maxDex) + armorBonus + shieldBonus + sizeMod + otherBonus`.
4. **Skills Engine (`src/lib/rules/skills.ts`)**:
   - Canonical 29 T20 skills catalog.
   - T20 formula: `floor(level / 2) + attrMod + trainingBonus - armorPenalty + otherBonus`.
   - Training bonus progression: +2 (levels 1-6), +4 (levels 7-14), +6 (levels 15-20).
   - "Somente Treinada" validation (e.g. Adestramento, Conhecimento, Cura, Guerra, Jogatina, Ladinagem, Misticismo, Nobreza, Pilotagem, Religião cannot be used untrained unless allowed by special feature).
   - TRPG skills: `ranks + attrMod + classSkillBonus(3) - armorPenalty + otherBonus`.
5. **Encumbrance & Armor Penalty (`src/lib/rules/encumbrance.ts`)**:
   - Maximum load calculation and overweight penalization.
   - Armor penalty propagation to physical skills (Acrobacia, Atletismo, Furtividade, Ladinagem).
6. **Conditions Engine (`src/lib/rules/conditions.ts`)**:
   - Catalog of Tormenta conditions (Abatido, Cego, Caído, Fatigado, Indefeso, etc.) with explicit numeric modifiers to Defense, Attacks, and Skills.
7. **Export & Unification (`src/lib/rules/index.ts`)**:
   - Full unified API per `PROJECT.md § Interface Contracts`.
8. **Unit Tests (`tests/unit/rules/`)**:
   - Comprehensive unit test suites verifying all formulas, edge cases, and differences between T20 and TRPG.
   - Verify `npm test` runs and passes 100%.

## 2026-09-27T20:47:19Z
You are the Milestone M2 Rules Engine Core Worker.
Your Working Directory: /home/usuario/develop/trpg-platform/.agents/teamwork/m2_worker_1
Task Dispatch File: /home/usuario/develop/trpg-platform/.agents/teamwork/m2_worker_1/DISPATCH.md
Original User Request: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
Master Project Plan: /home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md
Parent Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3

Please read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md before starting.
Implement Milestone M2 (Features 6 to 12) in pure, deterministic TypeScript in src/lib/rules/ with 100% test coverage in tests/unit/rules/.
Follow all mathematical formulas from survey_rules_1/report.md:
- T20 direct modifiers vs TRPG 3-18 scores.
- Deterministic T20 PV (Base + CON) and PM scaling.
- T20 PM spending limit = character level.
- T20 Defesa (10 + DES + Armor + Shield; NO half-level for PCs; heavy armor zeroes DEX) vs TRPG CA (10 + half-level + DEX + Armor + Shield + Size).
- T20 29 canonical skills with tiered training (+2/+4/+6) and Somente Treinada checks vs TRPG ranks & BBA.
- Encumbrance, armor penalty propagation, and conditions engine.
Remember to prefix commands with:
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"
Run tests and build to verify. Deliver handoff to /home/usuario/develop/trpg-platform/.agents/teamwork/m2_worker_1/handoff.md and notify parent via send_message.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

