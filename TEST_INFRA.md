# TRPG Platform — Opaque-Box E2E Test Suite Infrastructure

**Platform**: Tormenta 20 (T20 Jogo do Ano) & Tormenta RPG Clássico (TRPG)  
**Author**: E2E Test Writer  
**Status**: ACTIVE TEST INFRASTRUCTURE  
**Target Runner**: Vitest 2.1+ (Node.js 24)  
**Execution Command**:  
```bash
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/
```

---

## 1. Test Architecture & Principles

The E2E test suite validates the entire Tormenta Multi-System Web Platform from an **opaque-box** perspective. It treats the system as a collection of contractual interfaces, mathematical engines, persistence models, and user interaction flows defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

### Core Architectural Principles
1. **Opaque-Box Specification Verification**: Tests interact with domain modules strictly via documented interface contracts (`src/lib/rules`, `src/lib/dice`, `src/lib/vtt`, `src/lib/sheet`, `src/lib/compendium`, and database schemas). Tests assert externally observable behavior, state transitions, and return values without relying on internal private implementation details.
2. **Deterministic Mathematical Oracles**: All expected outcomes are derived from authoritative rulebooks (*Tormenta 20 - Edição Jogo do Ano* and *Tormenta RPG Edição Revisada*), as compiled in `survey_rules_1/report.md` and `survey_vtt_3/report.md`.
3. **No Facades / Genuine Integrity**: Tests contain zero trivial assertions (`expect(true).toBe(true)` is strictly prohibited). Every test exercises actual calculations, state trees, validations, or coordinate transformations.
4. **Progressive Testability & System Adapter**: The test suite employs an adaptive system harness (`tests/e2e/harness/system-adapter.ts`). It executes against production modules in `src/lib/` when present, while verifying conformance against the authoritative rulebook oracle.

---

## 2. Feature Inventory (31 Features)

The 31 platform features defined in `PROJECT.md § Feature Inventory` are organized into 6 functional requirement domains (R1 to R6) and tested across all 4 tiers:

| # | Feature Name | Domain | Description | Authoritative Source |
|---|--------------|--------|-------------|----------------------|
| 1 | Next.js App Router Scaffold | R6 / Arch | Next.js 14 App Router, routes, server layout, TypeScript strict mode | `PROJECT.md § Architecture` |
| 2 | High-Fantasy Design System | R6 / UI | Arton color palette (`arton-ruby`, `valkyr-gold`, `mana-sapphire`, `parchment`), dark theme | `PROJECT.md § Architecture` |
| 3 | Prisma SQLite & Postgres Schema | R6 / DB | Universal schema for Campaigns, Characters, CompendiumItems, Scenes, Tokens, RollLogs | `prisma/schema.prisma` |
| 4 | Canonical Seed Dataset | R5 / Data | 12 canonical entities (Humano, Anão, Guerreiro, Arcanista, spells, items, Bugbear) | `survey_rules_1 § 5` |
| 5 | Vitest Test Suite Infrastructure | R6 / QA | Automated test execution with path aliases, coverage, and strict assertions | `vitest.config.ts` |
| 6 | Polymorphic Attribute System | R1 / Rules | T20 direct modifiers (-1 to +4) vs TRPG 3-18 scores with $\lfloor (Score-10)/2 \rfloor$ | `survey_rules_1 § 2.1` |
| 7 | Resource Pools (PV & PM) | R1 / Rules | T20 deterministic PV (Base + CON) & PM scaling vs TRPG Hit Dice & slots/PM | `survey_rules_1 § 2.2` |
| 8 | T20 PM Expenditure Limit | R1 / Rules | Character cannot spend more PM on an ability than their current level | `survey_rules_1 § 2.2.B` |
| 9 | Dual-System Defense/CA | R1 / Rules | T20 Defesa (10+DES+Armor+Shield; heavy armor zeroes DEX) vs TRPG CA (with half-level) | `survey_rules_1 § 2.3` |
| 10 | Dual-System Skills Engine | R1 / Rules | T20 tiered training (+2/+4/+6) & Somente Treinada vs TRPG ranks & BBA | `survey_rules_1 § 2.4` |
| 11 | Encumbrance & Armor Penalty | R1 / Rules | T20 slots (FOR $\times 3$), Overloaded penalty (-2 armor penalty, -3m speed), skill penalties | `survey_vtt_3 § 1.2` |
| 12 | Status Conditions Engine | R2 / Rules | State modifiers for Caído, Desprevenido, Fatigado, Vulnerável, Inconsciente, Sangrando | `survey_vtt_3 § 1.3` |
| 13 | d20 Expression Parser | R3 / Dice | Recursive descent AST parser for `1d20+X`, `2d6+Y`, `2d20kh1`, `# tags` | `survey_rules_1 § 3.1` |
| 14 | Critical & Threat Detection | R3 / Dice | Threat margins (e.g. 19-20/x3), Nat 20 auto-hit, Nat 1 auto-fail, T20 vs TRPG confirmation | `survey_rules_1 § 3.2` |
| 15 | Damage Formula Resolution | R3 / Dice | T20 base weapon dice multiplication only vs TRPG flat multiplication | `survey_rules_1 § 3.2.C` |
| 16 | PM Enhancement Scaling | R3 / Dice | Extra damage dice, extra missiles, and DC scaling via PM investment | `survey_rules_1 § 3.3` |
| 17 | Visual Dice Roller & Log | R3 / Dice | Structured roll result object, rolls breakdown, formatted output, timestamps | `PROJECT.md § Interface Contracts` |
| 18 | Step-by-Step Sheet Creation | R2 / Sheet | Character and Threat creation wizards for T20 and TRPG | `survey_vtt_3 § 1.1` |
| 19 | Reactive Derived Sheet State | R2 / Sheet | Synchronous DAG recalculation of PV, PM, Defesa, Perícias, Carga on edit | `survey_vtt_3 § 1.2` |
| 20 | Real-Time Combat Trackers | R2 / Sheet | Current/Temp PV, Current/Max PM, damage absorption to temp HP, critical health states | `survey_vtt_3 § 1.3` |
| 21 | Direct-Click Roll Triggers | R2 / Sheet | Clicking attacks, skills, or spells builds strongly-typed RollPayload | `survey_vtt_3 § 1.4` |
| 22 | Sheet Persistence & Export | R2 / Sheet | JSON import/export, round-trip state preservation, database serialization | `PROJECT.md § Feature Inventory` |
| 23 | Tactical Canvas Grid (1.5m) | R4 / VTT | 1.5m / 5ft per cell, coordinate conversions (World-to-Grid, Grid-to-World) | `survey_vtt_3 § 2.1` |
| 24 | Token Management on VTT | R4 / VTT | Token sizing (Minúsculo 0.5x, Médio 1x, Grande 2x2), HP/PM overlays, conditions | `survey_vtt_3 § 2.3` |
| 25 | Dual-Metric Range Ruler | R4 / VTT | Chebyshev (T20) & 5/10/5 (TRPG), Tormenta range bands (Toque, Curto, Médio, Longo) | `survey_vtt_3 § 2.4` |
| 26 | Integrated Initiative Tracker | R4 / VTT | Initiative sorting descending, DEX tie-breaker, turn advance, round count increment | `survey_vtt_3 § 2.5` |
| 27 | Searchable Compendium Drawer | R5 / Comp | Instant search by text query, system filter (T20/TRPG), category/type filter | `survey_rules_1 § 4` |
| 28 | Compendium Drag-and-Drop | R5 / Comp | MIME types `application/x-trpg-*`, drop item to sheet, drop threat to VTT canvas | `survey_vtt_3 § 3` |
| 29 | Comprehensive README & Docs | R6 / Docs | Complete architecture, setup guide, execution instructions, Supabase migration notes | `ORIGINAL_REQUEST.md R6` |
| 30 | Full E2E Test Suite Validation | R6 / QA | Complete test suite execution verification, zero unhandled errors, full tier coverage | `PROJECT.md § Milestones` |
| 31 | Adversarial Hardening (Tier 5) | R6 / QA | Boundary fuzzing, extreme values, negative resources, malformed inputs, SQL injection tags | `PROJECT.md § Milestones` |

---

## 3. Four-Tier Testing Methodology

The test suite is structured into four distinct, hierarchically escalating tiers:

### Tier 1 — Feature Coverage (>=5 tests per feature)
- **Directory**: `tests/e2e/tier1-features/`
- **Scope**: Dedicated test files for each of the 31 features (`feature-01-scaffold.test.ts` to `feature-31-adversarial-hardening.test.ts`).
- **Target**: Minimum 5 isolated happy-path test cases per feature exercising primary functional behavior.
- **Total Tests**: $\ge 155$ tests.

### Tier 2 — Boundary & Corner Cases (>=5 tests per feature)
- **Directory**: `tests/e2e/tier2-boundaries/`
- **Scope**: Rigorous stress testing of extreme limits, empty inputs, negative modifiers, zero attributes, extreme threat margins, boundary levels (1 and 20), encumbrance limits, and unusual rule combinations.
- **Target**: Minimum 5 edge-case tests per feature.
- **Total Tests**: $\ge 155$ tests.

### Tier 3 — Cross-Feature Combinations (Pairwise Coverage)
- **Directory**: `tests/e2e/tier3-pairwise/`
- **Scope**: Multi-module interactions where an output of one feature cascades into another:
  1. *Heavy Armor $\to$ Defesa (Dex 0) $\to$ Skills (Stealth penalty) $\to$ Dice Roller execution*.
  2. *VTT Canvas Grid $\to$ Dual-Metric Range Ruler $\to$ Weapon Range Band verification $\to$ Attack roll*.
  3. *Character Sheet PM investment $\to$ Level Limit Check $\to$ Spell Damage Scaling $\to$ Resource reduction*.
  4. *Target Token $\to$ Damage application $\to$ Temp HP absorption $\to$ Current HP reduction $\to$ Unconscious/Dying status*.
  5. *Compendium Drag-and-Drop $\to$ Sheet Inventory $\to$ Attack Profile Generation $\to$ Defesa recalculation*.
  6. *Initiative Tracker round advance $\to$ Condition duration decrement $\to$ Continuous bleeding tick*.
- **Total Tests**: $\ge 20$ interaction tests.

### Tier 4 — Real-World Application Scenarios (>=5 Complex Scenarios)
- **Directory**: `tests/e2e/tier4-scenarios/`
- **Scope**: End-to-end, multi-actor, multi-turn tabletop gaming scenarios simulating authentic game sessions:
  1. **Scenario 1 — Complete Boss Combat Round**: 3 player characters (Guerreiro, Arcanista, Clérigo) + 1 Boss Threat (Bugbear Chefe) on a 1.5m tactical grid with initiative, tactical movement, ranged/melee attacks, critical hits, PM expenditure limits, and damage absorption.
  2. **Scenario 2 — Character Creation to Dungeon Exploration**: Step-by-step creation of a Level 1 Dwarf Warrior, point buy attributes, equipment drag-and-drop, reactive DAG calculations, placement on VTT canvas, and skill checks with armor check penalties.
  3. **Scenario 3 — Dual-System Comparative Benchmark**: Side-by-side execution of an identical character concept in Tormenta 20 vs Tormenta RPG Clássico, verifying the exact mathematical divergence across Defesa/CA, BBA vs Luta, critical confirmation, and damage multiplication.
  4. **Scenario 4 — Arcane Spellcasting & Resource Attrition**: 5th-level Arcanista spellcasting lifecycle, PM enhancement scaling, DC calculation, trap damage, temp HP shield buffer, and short/long rest recovery tiers.
  5. **Scenario 5 — VTT Tactical Skirmish & Status Conditions**: Tactical maneuvering on a 30x20 grid, Chebyshev vs 5/10/5 movement, obstacle waypoints, token size scaling (Large 2x2 vs Medium 1x1), active condition toggles (Caído, Desprevenido, Vulnerável), and round cycling.
- **Total Tests**: $\ge 5$ comprehensive end-to-end scenarios (containing multiple assertions each).

---

## 4. Test Execution & Runner Guide

### Environment Prerequisite
Ensure the Node.js 24 environment is active:
```bash
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"
```

### Running the Entire E2E Suite
```bash
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/
```

### Running Specific Tiers
- **Tier 1 (Feature Coverage)**:
  ```bash
  export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/tier1-features/
  ```
- **Tier 2 (Boundary & Corner Cases)**:
  ```bash
  export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/tier2-boundaries/
  ```
- **Tier 3 (Cross-Feature Combinations)**:
  ```bash
  export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/tier3-pairwise/
  ```
- **Tier 4 (Real-World Scenarios)**:
  ```bash
  export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/tier4-scenarios/
  ```

### Coverage Reporting
```bash
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/ --coverage
```
