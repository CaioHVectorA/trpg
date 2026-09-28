# Task Assignment: Milestone M3 Contextual Dice Roller Engine Worker

## 2026-09-27T20:47:19Z

- **Role**: Dice Engine & UI Developer
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/m3_worker_1
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Sources**:
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md` (MUST read first)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md` (Section 3 for dice grammar & critical math)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md` (Section 1.4 for roll payloads)

## File Ownership
- Exclusively owns: `src/lib/dice/`, `src/components/dice/`, `src/app/api/rolls/`, `tests/unit/dice/`.
- MUST NOT modify `src/lib/rules/` (owned by M2).

## Environment Notice
- Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` when running node, npm, npx, or vitest.

## Objective
Implement Milestone M3 (Features 13 to 17) complete with AST parser, evaluator, and high-fantasy visual UI components:
1. **Dice Expression AST Parser (`src/lib/dice/parser.ts`)**:
   - Tokenize and parse expressions like `1d20+7`, `2d6+4`, `1d20+10 # Ataque Espada Longa`, `2d20kh1+5` (vantagem), `2d20kl1+3` (desvantagem), complex arithmetic `1d8+1d6+3`.
   - Support labels / tags (`# Ataque`, `# Dano Fogo`).
2. **Evaluator & Critical Detection (`src/lib/dice/evaluator.ts`, `src/lib/dice/critical.ts`)**:
   - Roll execution with PRNG / crypto random.
   - Natural 20 automatic success detection.
   - Natural 1 automatic failure detection.
   - Configurable Threat Range: e.g. 19-20, 18-20, 20.
   - Configurable Critical Multipliers: e.g. x2, x3, x4.
   - T20 critical damage rule: only weapon base damage dice are multiplied (e.g. `1d8+4` with x2 becomes `2d8+4`), while flat modifiers are not multiplied. In TRPG, flat modifiers are multiplied.
3. **PM Enhancement Scaling (`src/lib/dice/enhancements.ts`)**:
   - Calculation of extra dice and flat bonuses when PM is invested into attack or spell rolls.
4. **Visual UI Components (`src/components/dice/`)**:
   - `DiceRollerBar.tsx`: Floating or header bar to type custom formulas or click quick dice buttons (d4, d6, d8, d10, d12, d20, d100), with history dropdown.
   - `DiceRollModal.tsx`: Visual roll reveal with animation, dice breakdown (`[18] + 7 = 25`), Nat 20 emerald highlight, Nat 1 ruby fumble highlight, critical banner.
   - `DiceLogHistory.tsx`: History list showing recent rolls with timestamp, formula, result, and tag.
5. **Roll Persistence API (`src/app/api/rolls/route.ts`)**:
   - POST `/api/rolls` to record roll result into Prisma `RollLog` model.
   - GET `/api/rolls` to fetch roll history.
6. **Unit Tests (`tests/unit/dice/`)**:
   - Tests for parser, evaluator, criticals, PM enhancements, and API route.
   - Verify `npm test` runs and passes 100%.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
