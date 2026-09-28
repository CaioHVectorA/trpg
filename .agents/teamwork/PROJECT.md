# Project: Tormenta 20 & TRPG Multi-System Web Platform

## Architecture
- **Presentation Layer**: Next.js 14 App Router (`src/app/`) with TypeScript, Tailwind CSS, and Tormenta High-Fantasy Design System (`Arton Ruby`, `Valkyr Gold`, `Mana Sapphire`, `Parchment` theme).
- **Core Pure Rules Engine**: `src/lib/rules/` (pure TypeScript functions, zero DOM/React dependencies) encapsulating T20 (modifiers, PM system, tiered trained skills, defense without half-level) and TRPG (3-18 attributes, BBA, skill ranks, CA with half-level).
- **Dice Engine**: `src/lib/dice/` (d20 grammar parser, contextual modifiers, threat range detection 19-20/x3, damage formulas, PM enhancement scaling, visual log).
- **Tactical VTT Grid**: `src/components/vtt/` & `src/lib/vtt/` (Multi-layer canvas 1.5m / 5ft, token manager, Chebyshev & 5/10/5 range ruler, initiative tracker, compendium drag-and-drop).
- **Sheet Builder**: `src/components/sheet/` & `src/lib/sheet/` (Creation wizard, reactive calculation DAG, real-time PV/PM expenditure, conditions, action click-to-roll).
- **Compendium Engine**: `src/components/compendium/` & `src/lib/compendium/` (Searchable catalog, filterable by edition/type, drag-and-drop to sheet/VTT, canonical seed data).
- **Data Persistence**: Prisma ORM with SQLite local storage (`file:./dev.db`) for immediate zero-friction execution, with universal schema fully compatible with Supabase PostgreSQL migration.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Next.js App Router Scaffold | Setup Next.js 14, TypeScript strict, Tailwind, Lucide icons | M1 | survey_arch_2 |
| 2 | High-Fantasy Design System | Arton theme tokens (Ruby, Gold, Mana, Parchment, dark mode) | M1 | survey_arch_2 |
| 3 | Prisma SQLite & Postgres Schema | Universal schema for Characters, Sheets, Items, Spells, Scenes, Tokens | M1 | survey_arch_2 |
| 4 | Canonical Seed Dataset | 12 canonical entries (Humano, Anão, Guerreiro, Arcanista, spells, items) | M1 | survey_rules_1 |
| 5 | Vitest Test Suite Infrastructure | Automated test setup with runner scripts, coverage, and strict lint | M1 | survey_arch_2 |
| 6 | Polymorphic Attribute System | T20 direct modifiers (-1 to +4) vs TRPG 3-18 scores with floor((Score-10)/2) | M2 | survey_rules_1 |
| 7 | Resource Pools (PV & PM) | Deterministic T20 PV (Base + CON) & PM scaling vs TRPG Hit Dice & slots/PM | M2 | survey_rules_1 |
| 8 | T20 PM Expenditure Limit | Enforce rule: character cannot spend more PM on an ability than level | M2 | survey_rules_1 |
| 9 | Dual-System Defense/CA | T20 Defesa (10+DES+Armor+Shield; heavy armor zeroes DEX) vs TRPG CA | M2 | survey_rules_1 |
| 10 | Dual-System Skills Engine | T20 tiered training (+2/+4/+6) & Somente Treinada vs TRPG ranks & BBA | M2 | survey_rules_1 |
| 11 | Encumbrance & Armor Penalty | Calculate weight capacity and skill check penalties for physical skills | M2 | survey_rules_1 |
| 12 | Status Conditions Engine | State modifiers for Abatido, Cego, Caído, Fatigado, etc. | M2 | survey_vtt_3 |
| 13 | d20 Expression Parser | Parse `1d20+X`, `2d6+Y`, `2d20kh1`, `# tags` with mathematical AST | M3 | survey_rules_1 |
| 14 | Critical & Threat Detection | Configurable threat range (e.g. 19-20/x3), nat 20 auto-hit, nat 1 auto-fail | M3 | survey_rules_1 |
| 15 | Damage Formula Resolution | T20 crit dice multiplication (weapon dice only) vs TRPG flat multiplication | M3 | survey_rules_1 |
| 16 | PM Enhancement Scaling | Extra dice and flat bonus calculations when PM is invested in rolls | M3 | survey_rules_1 |
| 17 | Visual Dice Roller & Log | Interactive roll bar, 3D/visual dice roll result display, detailed breakdown | M3 | survey_rules_1 |
| 18 | Step-by-Step Sheet Creation | Character & Threat creation wizards for T20 and TRPG | M4 | survey_vtt_3 |
| 19 | Reactive Derived Sheet State | Instant DAG recalculation of PV, PM, Defesa, Perícias, Carga on edit | M4 | survey_vtt_3 |
| 20 | Real-Time Combat Trackers | Current/Temp PV, Current/Max PM, damage absorption, status toggles | M4 | survey_vtt_3 |
| 21 | Direct-Click Roll Triggers | Clicking on attacks, skills, or spells triggers contextual dice roll | M4 | survey_vtt_3 |
| 22 | Sheet Persistence & Export | Save/load to Prisma database + JSON import/export | M4 | survey_arch_2 |
| 23 | Tactical Canvas Grid (1.5m) | 5-layer canvas rendering 1.5m / 5ft cells, background map scaling | M5 | survey_vtt_3 |
| 24 | Token Management on VTT | Player/Monster tokens, positioning, snap-to-grid, HP bar & status overlays | M5 | survey_vtt_3 |
| 25 | Dual-Metric Range Ruler | Chebyshev (T20) & 5/10/5 (TRPG), Tormenta range bands (Toque..Longo) | M5 | survey_vtt_3 |
| 26 | Integrated Initiative Tracker | Turn order sorting, round tracking, turn advance, status countdown | M5 | survey_vtt_3 |
| 27 | Searchable Compendium Drawer | Instant search & filtering for races, classes, spells, powers, equipment | M6 | survey_rules_1 |
| 28 | Compendium Drag-and-Drop | Drag items/spells to sheet, drag threats/monsters onto VTT canvas | M6 | survey_vtt_3 |
| 29 | Comprehensive README & Docs | Setup guide, environment configuration, migration to Supabase guide | M6 | survey_arch_2 |
| 30 | Full E2E Test Suite Validation | 100% pass across all 4 tiers of opaque-box acceptance tests | M7 | E2E Testing Track |
| 31 | Adversarial Hardening (Tier 5) | White-box stress tests, boundary conditions, zero build/type warnings | M7 | E2E Testing Track |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Design & generate opaque-box test suites (Tiers 1-4) covering all features -> TEST_READY.md | none | IN_PROGRESS |
| M1 | Foundation & Persistence | Next.js App Router, Tailwind theme, Prisma SQLite schema, seed data, Vitest infra (Features 1-5) | none | DONE (Verified: 219 tests pass, build 0, CLEAN audit) |
| M2 | Rules Engine Core | Pure TS T20 & TRPG rules, attributes, PV/PM, Defense, skills, conditions (Features 6-12) | M1 | IN_PROGRESS |
| M3 | Dice Roller Engine | d20 parser, criticals (19-20/x3), damage formulas, PM enhancements, visual log (Features 13-17) | M1 | IN_PROGRESS |
| M4 | Dynamic Sheet Builder | Character/Threat wizard, reactive DAG, real-time trackers, direct-click rolls, persistence (Features 18-22) | M2, M3 | PLANNED |
| M5 | Tactical VTT Combat Grid | 1.5m grid canvas, token management, range ruler, initiative tracker (Features 23-26) | M2, M3 | PLANNED |
| M6 | Compendium & Drag-and-Drop | Compendium catalog & drawer, drag-to-sheet & drag-to-VTT, README.md (Features 27-29) | M4, M5 | PLANNED |
| M7 | Final E2E Pass & Hardening | Pass 100% E2E tests (Tiers 1-4), adversarial hardening (Tier 5), strict build (Features 30-31) | E2E, M6 | PLANNED |

---

## Interface Contracts

### 1. Rules Engine ↔ Sheet & VTT (`src/lib/rules/`)
```typescript
export type SystemMode = 'T20' | 'TRPG';

export interface AttributeBlock {
  for: number;
  des: number;
  con: number;
  int: number;
  sab: number;
  car: number;
}

export interface DerivedStats {
  pvMax: number;
  pmMax: number;
  defense: number;
  armorPenalty: number;
  carryCapacity: number;
  skills: Record<string, { bonus: number; trained: boolean; attribute: string }>;
}

export function calculateDerivedStats(sheet: BaseSheet): DerivedStats;
export function calculateSkillBonus(system: SystemMode, skillId: string, level: number, attrMod: number, trained: boolean, armorPenalty: number, otherBonus?: number): number;
export function canSpendPM(currentPM: number, cost: number, characterLevel: number): boolean;
```

### 2. Dice Engine ↔ Sheet & Actions (`src/lib/dice/`)
```typescript
export interface DiceRollRequest {
  formula: string;              // e.g. "1d20+7", "2d6+4", "1d20+10 # Ataque Espada Longa"
  threatRange?: number;         // e.g. 19 (for 19-20)
  critMultiplier?: number;      // e.g. 2, 3
  system?: 'T20' | 'TRPG';
  pmInvested?: number;
}

export interface DiceRollResult {
  total: number;
  rolls: Array<{ die: number; result: number }>;
  isNatural20: boolean;
  isNatural1: boolean;
  isCriticalHit: boolean;
  formattedOutput: string;
  breakdown: string;
  timestamp: string;
}

export function evaluateDiceExpression(req: DiceRollRequest): DiceRollResult;
```

### 3. VTT Grid ↔ Tokens & Initiative (`src/lib/vtt/`)
```typescript
export interface GridPosition {
  x: number; // grid cell column (0-indexed)
  y: number; // grid cell row (0-indexed)
}

export interface VttToken {
  id: string;
  name: string;
  sheetId?: string;
  system: 'T20' | 'TRPG';
  size: 'P' | 'M' | 'G' | 'E';
  gridX: number;
  gridY: number;
  color: string;
  pvCurrent: number;
  pvMax: number;
  conditions: string[];
}

export interface DistanceMeasurement {
  cells: number;
  meters: number;
  feet: number;
  rangeBand: 'Toque' | 'Curto' | 'Médio' | 'Longo' | 'Extremo';
}

export function calculateDistance(p1: GridPosition, p2: GridPosition, metric: 'chebyshev' | '5-10-5'): DistanceMeasurement;
```

---

## Code Layout
```
trpg-platform/
├── prisma/
│   ├── schema.prisma            # Universal schema (SQLite local, PostgreSQL Supabase ready)
│   └── seed.ts                  # Seeds 12 canonical T20/TRPG entities
├── public/
│   └── maps/                    # Sample battlemaps for VTT
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── api/                 # REST endpoints for persistence & compendium
│   │   ├── characters/          # Sheet builder and character manager
│   │   ├── compendium/          # Compendium browser
│   │   ├── vtt/                 # Tactical VTT grid view
│   │   ├── layout.tsx
│   │   └── page.tsx             # Home dashboard
│   ├── components/
│   │   ├── compendium/          # Compendium drawer, card, filters
│   │   ├── dice/                # Dice roller bar, visual dice roll popup, log
│   │   ├── sheet/               # Character sheet widgets, trackers, creator wizard
│   │   ├── ui/                  # Accessible UI primitives (buttons, modals, tooltips)
│   │   └── vtt/                 # Multi-layer canvas, token overlay, ruler, initiative tracker
│   ├── lib/
│   │   ├── compendium/          # Compendium data, search, drag & drop handlers
│   │   ├── db/                  # Prisma client singleton
│   │   ├── dice/                # Dice parser, evaluator, critical logic
│   │   ├── rules/               # Pure calculation functions for T20 and TRPG
│   │   └── vtt/                 # Grid math, range calculations, token state
│   └── types/                   # TypeScript interfaces (Sheet, System, Compendium, VTT)
├── tests/
│   ├── e2e/                     # Opaque-box E2E test suite (Tiers 1-4)
│   └── unit/                    # Unit tests for rules, dice, and state
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```
