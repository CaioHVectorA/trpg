# BRIEFING — 2026-09-27T20:54:00Z

## Mission
Implement Milestone M3: Contextual Dice Roller Engine (Features 13 to 17), including AST expression parser, evaluator with critical & threat detection, PM enhancement scaling, high-fantasy visual UI components, Prisma RollLog API, and full unit test coverage.

## 🔒 My Identity
- Archetype: Contextual Dice Roller Engine Worker
- Roles: implementer, qa, specialist
- Working directory: /home/usuario/develop/trpg-platform/.agents/teamwork/m3_worker_1
- Original parent: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- Milestone: M3 (Features 13 to 17)

## 🔒 Key Constraints
- Exclusively owns: src/lib/dice/, src/components/dice/, src/app/api/rolls/, tests/unit/dice/
- MUST NOT modify src/lib/rules/ (owned by M2)
- Environment prefix: export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"
- Genuine implementation required (no dummy, facade, or hardcoded cheating)

## Current Parent
- Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- Updated: 2026-09-27T20:54:00Z

## Task Summary
- **What to build**:
  1. AST parser (`src/lib/dice/parser.ts`) for NdX, kh/kl, arithmetic, tags
  2. Evaluator & Critical detection (`src/lib/dice/evaluator.ts`, `src/lib/dice/critical.ts`) with threat ranges, nat 20/1, and T20 vs TRPG damage formulas
  3. PM enhancement scaling (`src/lib/dice/enhancements.ts`)
  4. Visual high-fantasy UI: `DiceRollerBar`, `DiceRollModal`, `DiceLogHistory` (`src/components/dice/`)
  5. RollLog persistence API (`src/app/api/rolls/route.ts`)
  6. Comprehensive unit tests (`tests/unit/dice/`)
- **Success criteria**: 100% tests pass (345/345), build 0, lint 0, genuine real state & calculation
- **Interface contracts**: PROJECT.md § 2 (Dice Engine ↔ Sheet & Actions), types in src/lib/types/index.ts
- **Code layout**: src/lib/dice/, src/components/dice/, src/app/api/rolls/, tests/unit/dice/

## Key Decisions Made
- Modularized dice engine into clean AST representation (ASTNode, Tokenizer, Parser, Evaluator).
- Strictly implemented T20 critical damage rule (only base weapon dice multiplied, flat modifiers single) vs TRPG rule (all flat modifiers multiplied).
- Created secure cryptographic PRNG with fallback for rolling dice.
- Provided REST API route `/api/rolls` supporting automatic server evaluation or client payload persistence to Prisma RollLog.
- Integrated high-fantasy visual design system into `DiceRollerBar`, `DiceRollModal` (with Nat 20 emerald highlight, Nat 1 ruby fumble, critical damage breakdown), and `DiceLogHistory`.

## Artifact Index
- `src/lib/dice/parser.ts` — AST grammar, tokens, and parseDiceExpression
- `src/lib/dice/critical.ts` — Threat margin, Nat 20/1, and T20 vs TRPG damage math
- `src/lib/dice/evaluator.ts` — AST evaluator, PRNG, advantage/disadvantage, formatting
- `src/lib/dice/enhancements.ts` — PM expenditure validation, Mísseis Mágicos, Bola de Fogo, Curar Ferimentos, Ataque Especial
- `src/lib/dice/index.ts` — Unified dice engine exports and DiceEngine static facade
- `src/components/dice/DiceRollModal.tsx` — High-fantasy reveal modal with emerald/ruby highlights
- `src/components/dice/DiceLogHistory.tsx` — Visual roll history panel with filtering and re-roll triggers
- `src/components/dice/DiceRollerBar.tsx` — Interactive rolling bar, quick dice, PM inputs, system toggle
- `src/components/dice/DiceContext.tsx` — Global context with modal controls and API persistence
- `src/components/dice/index.ts` — Component re-export index
- `src/app/api/rolls/route.ts` — REST API for Prisma RollLog persistence
- `tests/unit/dice/parser.test.ts` — 9 unit tests for AST parser
- `tests/unit/dice/evaluator.test.ts` — 6 unit tests for evaluator & PRNG
- `tests/unit/dice/critical.test.ts` — 7 unit tests for criticals & damage
- `tests/unit/dice/enhancements.test.ts` — 15 unit tests for PM enhancements
- `tests/unit/dice/api-rolls.test.ts` — 4 unit tests for RollLog API route

## Change Tracker
- **Files modified**:
  - `src/lib/dice/parser.ts` (created)
  - `src/lib/dice/critical.ts` (created)
  - `src/lib/dice/evaluator.ts` (created)
  - `src/lib/dice/enhancements.ts` (created)
  - `src/lib/dice/index.ts` (updated to modular exports)
  - `src/components/dice/DiceRollModal.tsx` (created)
  - `src/components/dice/DiceLogHistory.tsx` (created)
  - `src/components/dice/DiceRollerBar.tsx` (enhanced with quick dice, PM inputs, history drawer)
  - `src/components/dice/DiceContext.tsx` (enhanced with modal and API persistence)
  - `src/components/dice/index.ts` (created)
  - `src/app/api/rolls/route.ts` (created)
  - `tests/unit/dice/parser.test.ts` (created)
  - `tests/unit/dice/evaluator.test.ts` (created)
  - `tests/unit/dice/critical.test.ts` (created)
  - `tests/unit/dice/enhancements.test.ts` (created)
  - `tests/unit/dice/api-rolls.test.ts` (created)
- **Build status**: Pass (`npm run build` status 0)
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (345/345 tests pass, 46 test files)
- **Lint status**: Clean (0 warnings, 0 errors via `npm run lint`)
- **Tests added/modified**: 41 new unit tests in `tests/unit/dice/`

## Loaded Skills
- None
