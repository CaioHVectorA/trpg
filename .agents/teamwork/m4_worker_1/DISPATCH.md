# Task Assignment: Milestone M4 Dynamic Sheet Builder & Persistence Worker

- **Role**: Dynamic Sheet Builder Developer
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/m4_worker_1
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Sources**:
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md` (MUST read first)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md` (Section 1 for state schemas & reactive DAG)

## File Ownership
- Exclusively owns: `src/components/sheet/`, `src/app/characters/`, `src/app/api/characters/`, `tests/unit/sheet/`.
- MUST NOT modify `src/lib/vtt/` or `src/components/vtt/` (owned by M5).

## Environment Notice
- Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` when running any node/npm/npx/vitest commands.

## Objective
Implement Milestone M4 (Features 18 to 22) complete with interactive UI, reactive recalculations, real-time combat trackers, direct-click rolls, and Prisma database persistence:
1. **Creation Wizard (`src/components/sheet/SheetCreationWizard.tsx`)**:
   - Step-by-step creation flow for Tormenta 20 and Tormenta RPG Clássico characters and threats.
   - Race selection (e.g. Humano, Anão), Class selection (e.g. Guerreiro, Arcanista), attribute distribution (point buy or direct), initial equipment.
2. **Reactive Derived Sheet State (`src/components/sheet/CharacterSheetView.tsx`)**:
   - Integrates pure rules from `src/lib/rules/` (`calculateDerivedStats`, `calculateDefense`, `calculateSkillBonus`, `canSpendPM`).
   - Editing attributes, equipping armor, changing level, or toggling trained skills instantly recalculates PV, PM, Defesa/CA, Perícias, and Carga/Penalidade.
3. **Real-Time Combat Trackers (`src/components/sheet/CombatTrackers.tsx`)**:
   - Current PV, Max PV, Temporary PV (damage absorbed first from Temp PV before reducing Current PV).
   - Current PM, Max PM with spend buttons enforcing the T20 level-cap rule.
   - Status conditions checklist (Abatido, Caído, Fatigado, etc.) updating defense and skill bonuses.
4. **Direct-Click Roll Triggers**:
   - Clicking on an attack (e.g. Espada Longa 1d8+3, ameaça 19-20/x2) opens `DiceRollModal` via `DiceContext` or evaluates contextual roll with attack roll + damage roll.
   - Clicking on any skill (e.g. Luta +5, Percepção +3) rolls `1d20 + bonus` with tag `# Teste de Perícia`.
5. **Sheet Persistence & Export**:
   - REST API (`src/app/api/characters/route.ts` and `[id]/route.ts`) to create, update, delete, and list characters from Prisma `Character` model.
   - JSON export and import buttons to download or upload character sheets.
   - Interactive character list and detail pages under `src/app/characters/`.
6. **Unit & Component Tests (`tests/unit/sheet/`)**:
   - Automated tests verifying creation, reactive calculations, combat tracker state transitions, and API routes.
   - Verify `npm test`, `npm run lint`, and `npm run build` all pass 100%.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
