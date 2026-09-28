# BRIEFING — 2026-09-27T17:59:00Z

## Mission
Implement Milestone M4 (Features 18 to 22): Creation wizard for T20 & TRPG, reactive recalculations, real-time combat trackers, direct-click rolls, Prisma persistence & JSON import/export, and unit tests.

## 🔒 My Identity
- Archetype: Dynamic Sheet Builder Developer
- Roles: implementer, qa, specialist
- Working directory: /home/usuario/develop/trpg-platform/.agents/teamwork/m4_worker_1
- Original parent: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- Milestone: M4 Dynamic Sheet Builder & Persistence

## 🔒 Key Constraints
- Exclusively owns: `src/components/sheet/`, `src/app/characters/`, `src/app/api/characters/`, `tests/unit/sheet/`
- MUST NOT modify `src/lib/vtt/` or `src/components/vtt/` (owned by M5)
- Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"`
- Mandatory Integrity: Genuine logic, real state transitions, no hardcoding, no facades

## Current Parent
- Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- Updated: not yet

## Task Summary
- **What to build**:
  1. Creation wizard for T20 and TRPG characters and threats (`src/components/sheet/SheetCreationWizard.tsx`).
  2. Reactive recalculation view (`src/components/sheet/CharacterSheetView.tsx`) integrating `src/lib/rules/`.
  3. Real-time combat trackers (`src/components/sheet/CombatTrackers.tsx`) with PV, Temp PV absorption, PM spending limit, status conditions matrix.
  4. Direct-click roll triggers connecting to `DiceContext`.
  5. Character persistence in Prisma database (`src/app/api/characters/route.ts` & `[id]/route.ts`) + JSON import/export + interactive character pages.
  6. Unit tests in `tests/unit/sheet/`.
- **Success criteria**: 100% tests pass (`npm test`), lint clean (`npm run lint`), build success (`npm run build`).
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Initial baseline test run launched to verify environment.

## Artifact Index
- `.agents/teamwork/m4_worker_1/DISPATCH.md` — Assignment instructions
- `.agents/teamwork/m4_worker_1/BRIEFING.md` — Active state memory
- `.agents/teamwork/m4_worker_1/progress.md` — Liveness heartbeat

## Change Tracker
- **Files modified**: None yet (analysis phase)
- **Build status**: In progress
- **Pending issues**: None

## Quality Status
- **Build/test result**: Baseline testing running
- **Lint status**: Pending
- **Tests added/modified**: None yet

## Loaded Skills
- None required.
