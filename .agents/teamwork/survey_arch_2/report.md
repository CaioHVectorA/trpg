# Full-Stack Architecture Blueprint Report
**Project**: Tormenta RPG Multi-System Platform (T20 & TRPG)  
**Author**: Full-Stack Architecture Explorer (`survey_arch_2`)  
**Parent Task ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3  
**Date**: 2026-09-27  
**Status**: APPROVED ARCHITECTURE BLUEPRINT  

---

## 1. Executive Summary & Environment State

### 1.1. Workspace Audit Findings
A full audit of `/home/usuario/develop/trpg-platform` revealed the following environment state:
- **Project Root**: Currently greenfield. Contains only the `.agents/` orchestration metadata directory. No pre-existing `package.json`, `tsconfig.json`, or conflicting framework templates exist.
- **Node.js Environment**:
  - Binary Location: `/home/usuario/.nvm/versions/node/v24.12.0/bin/node`
  - Version: `v24.12.0` (LTS/Current modern Node runtime)
  - Package Manager: `npm 11.6.2` (`/home/usuario/.nvm/versions/node/v24.12.0/bin/npm`)
  - OS / Architecture: `Linux 6.6.137+ x86_64`
- **Shell Environment Caveat**:
  - Non-interactive subshells do not load interactive shell aliases from `~/.bashrc` by default.
  - **Critical Build Requirement**: Any automated build script, execution command, or child process spawned in non-interactive mode must prefix `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` or source `~/.nvm/nvm.sh` to ensure `node`, `npm`, and `npx` resolve instantly without `command not found` exit code 127.

### 1.2. Technology Stack Selection Rationale
To fulfill the project requirements (R1 through R6) with zero friction and maximum reliability:
1. **Next.js 14.2+ (App Router)**:
   - Full server-client component tree with optimized SSR and fast hydration.
   - Server Actions for zero-boilerplate type-safe database mutations (sheet updates, token moves, roll logging).
   - Route Handlers (`src/app/api/...`) for REST endpoints (instant compendium search, scene sync).
2. **TypeScript 5.x (Strict Mode)**:
   - Absolute type safety with discriminated unions (`system: 'T20' | 'TRPG'`).
   - Strict null checks, strong inference across server and client boundaries.
3. **Tailwind CSS 3.4+ & Modern Web Design System**:
   - High-fantasy Tormenta color palette (Arton ruby red, pantheon gold, mana sapphire, parchment backgrounds).
   - Accessible UI primitives with CSS custom properties, backdrop-filter glassmorphism, and responsive tabletop canvas layout.
4. **Prisma ORM (Dual SQLite / Supabase PostgreSQL Readiness)**:
   - **Local Dev / Instant Execution**: SQLite (`file:./dev.db`) requires 0 external server installation. Running `npm install && npx prisma db push` works out of the box in seconds.
   - **Production / Supabase Readiness**: 100% portable schema design. Universal types (`String`, `Int`, `Float`, `Boolean`, `DateTime`, `Json`/stringified JSON) ensuring switching to Supabase PostgreSQL is a single-line provider change in `prisma/schema.prisma`.
5. **Vitest 2.1+ Automated Testing**:
   - Native ESM and TypeScript test runner with zero transpile overhead via esbuild.
   - Blazing fast unit tests for complex math in the rules engine and dice parser.

---

## 2. Complete Project Directory Structure

```
/home/usuario/develop/trpg-platform/
├── .env.example                          # Environment variable template
├── .env.local                            # Local development environment (DATABASE_URL="file:./dev.db")
├── .gitignore                            # Standard Node, Next.js, SQLite, and IDE ignores
├── next.config.mjs                       # Next.js compiler & asset optimization config
├── package.json                          # Dependencies, scripts, and project metadata
├── postcss.config.mjs                    # PostCSS config with Tailwind CSS & Autoprefixer
├── tailwind.config.ts                    # High-fantasy theme tokens, colors, typography
├── tsconfig.json                         # Strict TypeScript configuration with `@/*` aliases
├── vitest.config.ts                      # Vitest test suite configuration
├── README.md                             # Setup, execution, and architecture guide
├── prisma/
│   ├── schema.prisma                     # Universal SQLite & PostgreSQL compatible schema
│   └── seed.ts                           # Seed script with 12+ canonical T20/TRPG entities
├── public/
│   ├── assets/
│   │   ├── parchment-texture.webp        # Subtle parchment background for character sheet
│   │   ├── grid-patterns.svg             # Procedural grid overlay for VTT
│   │   └── default-tokens/               # Default circular token frames (warrior, mage, monster)
│   └── favicon.ico
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── globals.css                   # Tailwind directives, CSS variables, fantasy scrollbars
│   │   ├── layout.tsx                    # Root layout: High fantasy header/nav & global dice tray
│   │   ├── page.tsx                      # Dashboard / Home: quick links to Sheets, VTT, Compendium
│   │   ├── sheets/
│   │   │   ├── page.tsx                  # Character list, filter by T20/TRPG, "New Character" wizard
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Interactive dynamic sheet (T20 / TRPG responsive view)
│   │   ├── vtt/
│   │   │   ├── page.tsx                  # Scene selection & battlemap management
│   │   │   └── [sceneId]/
│   │   │       └── page.tsx              # Tactical grid canvas, token manager, initiative tracker
│   │   ├── compendium/
│   │   │   └── page.tsx                  # Instant filterable compendium (spells, classes, items, monsters)
│   │   └── api/
│   │       ├── sheets/
│   │       │   ├── route.ts              # GET (list characters), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts          # GET (fetch), PUT/PATCH (update), DELETE
│   │       ├── compendium/
│   │       │   └── route.ts              # Search compendium by query, system, type
│   │       ├── rolls/
│   │       │   └── route.ts              # GET (history), POST (log roll)
│   │       └── scenes/
│   │           ├── route.ts              # GET / POST scenes
│   │           └── [sceneId]/
│   │               └── tokens/
│   │                   └── route.ts      # GET / POST / PATCH tokens on canvas
│   ├── components/
│   │   ├── ui/                           # Reusable atomic UI components (Radix / Tailwind)
│   │   │   ├── button.tsx                # Fantasy styled button (primary gold, crimson, ghost)
│   │   │   ├── card.tsx                  # Tabletop card with gold border and dark backdrop
│   │   │   ├── dialog.tsx                # Accessible modal dialog with backdrop blur
│   │   │   ├── input.tsx                 # Themed form inputs and number steppers
│   │   │   ├── badge.tsx                 # Status, system (T20/TRPG), and type indicators
│   │   │   ├── tabs.tsx                  # Fantasy tabbed navigation (Stats, Combat, Spells, Inventory)
│   │   │   ├── slider.tsx                # Range input for zoom and grid opacity
│   │   │   └── tooltip.tsx               # Contextual rules hover explanations
│   │   ├── layout/                       # Application shell layout
│   │   │   ├── AppHeader.tsx             # Fantasy branding, system selector, navigation links
│   │   │   ├── Navigation.tsx            # Desktop / Mobile navigation bar
│   │   │   └── GlobalDiceTray.tsx        # Collapsible bottom/side dice tray with live feed
│   │   ├── sheets/                       # Character Sheet Builder & Interactive UI
│   │   │   ├── SheetContainer.tsx        # Top-level state coordinator (Zustand or local state)
│   │   │   ├── SheetHeader.tsx           # Name, Race, Class, Level, System badge, Rest actions
│   │   │   ├── AttributeBlock.tsx        # FOR, DES, CON, INT, SAB, CAR with direct click rolls
│   │   │   ├── ResourceBars.tsx          # Real-time PV, PM, and Temp PV stepper bars
│   │   │   ├── DefenseBox.tsx            # Defesa (T20) or CA (TRPG) with equipment breakdown
│   │   │   ├── SkillsTable.tsx           # 29 T20 skills vs TRPG skill ranks with armor penalties
│   │   │   ├── AttacksSection.tsx        # Weapon attacks, threat margins, damage formulas
│   │   │   ├── SpellsGrimoire.tsx        # Spells list, circles, PM costs, enhancements
│   │   │   ├── PowersTalentsList.tsx     # General powers (T20) or Talents/Feats (TRPG)
│   │   │   ├── InventorySection.tsx      # Equipment list, weight/slots calculation, wealth (T$)
│   │   │   └── SheetCreationWizard.tsx   # Step-by-step guided character builder
│   │   ├── vtt/                          # Tactical Battlemap & Combat VTT
│   │   │   ├── VTTStage.tsx              # Multi-layer canvas container (pan, zoom, drag)
│   │   │   ├── GridCanvas.tsx            # Canvas layer rendering 1.5m / 5ft square grid
│   │   │   ├── TokenLayer.tsx            # Token elements (drag-drop, health indicators, sizing)
│   │   │   ├── RulerOverlay.tsx          # Measuring tool (Euclidean, Chebyshev, Tormenta range bands)
│   │   │   ├── InitiativeTracker.tsx     # Turn order, round count, active token highlight
│   │   │   └── VTTToolbar.tsx            # Select, Move, Ruler, Ping, Clear, Spawn Token
│   │   ├── dice/                         # Contextual Dice Roller UI
│   │   │   ├── DiceRollerModal.tsx       # Quick roller dialog with dice polyhedrals (d4..d100)
│   │   │   ├── RollResultCard.tsx        # Visual roll card (Nat 20 crit gold, Nat 1 fumble red)
│   │   │   ├── DiceFormulaInput.tsx      # CLI-style formula input (`1d20+7 # Ataque Espada`)
│   │   │   └── RollHistoryList.tsx       # Live feed of recent rolls
│   │   └── compendium/                   # Compendium & Drag-and-Drop
│   │       ├── CompendiumBrowser.tsx     # Search bar, category filters (T20 vs TRPG)
│   │       ├── CompendiumCard.tsx        # Draggable item card for quick drop on sheet or VTT
│   │       └── CompendiumDetailModal.tsx # Full rulebook entry with stats and descriptions
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts                 # Global PrismaClient singleton (prevents dev leaks)
│   │   ├── rules/                        # Pure Functional Rules Engine (Zero React/DOM/DB)
│   │   │   ├── index.ts                  # Engine facade
│   │   │   ├── types.ts                  # Discriminated unions (T20Character, TRPGCharacter)
│   │   │   ├── t20/
│   │   │   │   ├── attributes.ts         # Direct modifier model
│   │   │   │   ├── derived.ts            # PV, PM, Defesa, Perícias (+2/+4/+6 tiered training)
│   │   │   │   └── combat.ts             # Luta, Pontaria, threat margins, critical rules
│   │   │   ├── trpg/
│   │   │   │   ├── attributes.ts         # 3-18 scores to floor((score-10)/2)
│   │   │   │   ├── derived.ts            # PV, CA (with half-level), Graduações, Saving Throws
│   │   │   │   ├── bba.ts                # Class BBA progressions (Good/Med/Poor)
│   │   │   │   └── combat.ts             # Melee, Ranged, Crit confirmation rolls
│   │   │   └── validation.ts             # Zod validation schemas for character inputs
│   │   ├── dice/                         # Pure Dice Lexer, Parser & Context Evaluator
│   │   │   ├── lexer.ts                  # Tokenizer for dice expressions (`NdX`, `+`, `-`, `*`, `#`)
│   │   │   ├── parser.ts                 # Recursive descent AST builder
│   │   │   ├── evaluator.ts              # Evaluates AST, checks natural 20/1, threat margins
│   │   │   └── types.ts                  # DiceAST, RollRequest, RollResult interfaces
│   │   └── utils/
│   │       ├── cn.ts                     # Classnames & Tailwind merge utility
│   │       ├── distance.ts               # 1.5m grid distance, Euclidean, Chebyshev, range bands
│   │       └── storage.ts                # LocalStorage fallback & offline caching helper
│   ├── server/                           # Next.js Server Actions & Backend Services
│   │   ├── actions/
│   │   │   ├── characters.ts             # saveCharacterSheet, createCharacter, deleteCharacter
│   │   │   ├── rolls.ts                  # executeAndLogRoll, getRecentRolls
│   │   │   ├── scenes.ts                 # updateTokenPosition, updateInitiative, saveScene
│   │   │   └── compendium.ts             # searchCompendiumAction, getCompendiumItemAction
│   │   └── services/
│   │       ├── characterService.ts       # Database operations with Prisma
│   │       ├── rollService.ts            # Roll persistence and broadcasting
│   │       └── compendiumService.ts      # Indexed compendium querying
│   └── types/                            # Universal TypeScript Contracts
│       ├── character.ts                  # Full character schema & sheet state
│       ├── compendium.ts                 # Compendium entity types
│       ├── vtt.ts                        # Scene, Token, Grid, and Initiative types
│       └── dice.ts                       # Roll request, breakdown, and log interfaces
└── tests/                                # Automated Test Suites (Vitest)
    ├── fixtures/
    │   ├── t20-characters.ts             # Canonical T20 test characters (Guerreiro, Arcanista)
    │   └── trpg-characters.ts            # Canonical TRPG test characters (Guerreiro, Mago)
    ├── unit/
    │   ├── rules-t20.test.ts             # T20 formulas, PV/PM, skills, defense, mana limits
    │   ├── rules-trpg.test.ts            # TRPG formulas, attributes 3-18, CA, BBA, saving throws
    │   ├── dice-parser.test.ts           # Dice syntax, operations, threat detection, comments
    │   └── vtt-distance.test.ts          # Grid distance calculations and Tormenta range bands
    └── integration/
        ├── sheet-persistence.test.ts     # Character creation, update, and recalculation
        └── compendium-search.test.ts     # Querying compendium items and tags
```

---

## 3. High-Fantasy / Tormenta Design System & Tailwind CSS Setup

### 3.1. Visual Identity of Tormenta
Tormenta has a distinct tabletop high-fantasy aesthetic inspired by the crimson corruption of the Tormenta storm, the golden majesty of the Pantheon of 20 gods, parchment adventurer scrolls, and glowing arcane mana crystals.

#### Color Palette Tokens
| Token | Hex Value | Semantic RPG Purpose |
|:---|:---|:---|
| **`arton-ruby`** | `#991B1B` (Base: `#B91C1C`, Dark: `#7F1D1D`) | Tormenta corruption, health pools, critical failures, lethal warnings |
| **`valkyr-gold`** | `#D4AF37` (Light: `#F59E0B`, Dark: `#92400E`) | Pantheon divine gold, primary interactive buttons, active turn borders |
| **`mana-sapphire`** | `#2563EB` (Glow: `#38BDF8`, Deep: `#1E3A8A`) | Pontos de Mana (PM), arcane spell circles, grimoire highlights |
| **`parchment-base`** | `#FDFBF7` (Dark Parchment: `#EADBBA`, Inset: `#D5C4A1`) | Character sheet surface, compendium item cards, light stat blocks |
| **`tabletop-slate`**| `#0F172A` (Card: `#1E293B`, Deep: `#090D16`) | Default dark tabletop canvas, sidebar backdrops, modal containers |
| **`nat20-emerald`** | `#16A34A` (Glow: `#4ADE80`) | Natural 20 critical hit highlight, successful checks |
| **`nat1-fumble`**   | `#DC2626` (Glow: `#F87171`) | Natural 1 fumble indicator, unconscious condition |

### 3.2. `tailwind.config.ts` Configuration
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arton: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D4AF37', // Valkyr Gold
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        mana: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        parchment: {
          light: '#FDFBF7',
          DEFAULT: '#F7F2E7',
          dark: '#EADBBA',
          border: '#D5C4A1',
        },
        tabletop: {
          50: '#F8FAFC',
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'fantasy-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.25)',
        'fantasy-active': '0 0 15px 2px rgba(212, 175, 55, 0.45)',
        'crit-glow': '0 0 16px 2px rgba(34, 197, 94, 0.5)',
        'fumble-glow': '0 0 16px 2px rgba(239, 68, 68, 0.5)',
      },
      backgroundImage: {
        'parchment-pattern': 'radial-gradient(#e2d5bc 1px, transparent 1px)',
        'vtt-grid': 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3.3. Global Styles & Modern CSS Best Practices (`src/app/globals.css`)
Adhering to the modern web guidance rules:
1. **Glassmorphism with Progressive Degradation**:
   `backdrop-filter: blur(12px)` paired with `bg-tabletop-900/80` for smooth card depths.
2. **Accessible Animations**:
   `@media (prefers-reduced-motion: reduce)` avoids disorienting screen shakes during critical hits.
3. **Tabletop Custom Scrollbars**:
   Custom brass/gold styled scrollbar for inventory, grimoire, and dice log.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 15 23 42;
    --foreground: 248 250 252;
    color-scheme: dark;
  }

  body {
    @apply bg-tabletop-950 text-slate-100 font-sans antialiased min-h-screen selection:bg-gold-600/30 selection:text-gold-200;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-serif tracking-wide text-amber-100;
  }
}

@layer components {
  /* High-Fantasy Card Primitive */
  .fantasy-card {
    @apply bg-tabletop-900/85 backdrop-blur-md border border-gold-600/30 rounded-lg shadow-fantasy-card transition-all duration-150;
  }

  .fantasy-card:hover {
    @apply border-gold-600/50;
  }

  /* Parchment Variant for Character Sheets */
  .parchment-card {
    @apply bg-parchment text-slate-900 border border-parchment-border rounded shadow-md;
  }

  /* Fantasy Button Styles */
  .btn-gold {
    @apply bg-gradient-to-b from-gold-500 to-gold-700 text-slate-950 font-semibold px-4 py-2 rounded border border-gold-400 shadow hover:brightness-110 active:brightness-95 transition-all focus-visible:outline-2 focus-visible:outline-gold-400;
  }

  .btn-arton {
    @apply bg-gradient-to-b from-arton-600 to-arton-800 text-white font-semibold px-4 py-2 rounded border border-arton-500 shadow hover:brightness-110 active:brightness-95 transition-all;
  }

  .btn-mana {
    @apply bg-gradient-to-b from-mana-600 to-mana-800 text-white font-semibold px-4 py-2 rounded border border-mana-400 shadow hover:brightness-110 active:brightness-95 transition-all;
  }

  /* Custom Fantasy Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #090D16;
  }
  ::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
    border: 1px solid #1E293B;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #D4AF37;
  }
}
```

---

## 4. Database & Persistence Layer: Prisma (SQLite + Supabase PG Readiness)

### 4.1. The Zero-Friction SQLite to Supabase Migration Strategy
The architecture guarantees instant local zero-dependency onboarding via SQLite (`file:./dev.db`), while remaining 100% prepared for production deployment on Supabase PostgreSQL.

#### How Dual Compatibility is Achieved:
1. **Identifier Strategy**:
   All models use `String @id @default(cuid())`. CUIDs are valid alphanumeric strings in both SQLite and PostgreSQL. No database-level UUID extensions (like `gen_random_uuid()` or `pgcrypto`) are mandated.
2. **Data Types**:
   All database columns utilize universal primitives: `String`, `Int`, `Float`, `Boolean`, and `DateTime @default(now())`.
3. **Complex JSON Polymorphism**:
   Complex or divergent multi-system data structures (such as T20 vs TRPG attributes, trained skill lists, spell circle modifiers, token condition arrays) are stored in structured columns where identical, and inside `String` JSON columns with strict Zod TypeScript parsing helpers at the service layer (`JSON.stringify` / `JSON.parse`).
   *When migrating to Supabase PostgreSQL*, these fields can either remain `String` (100% backward compatible) or be mapped to `Json` with no application code changes.
4. **Enums**:
   Enums are defined at the TypeScript application layer (`'T20' | 'TRPG'`, `'ATTACK' | 'SKILL' | 'DAMAGE'`) and stored as `String` in the Prisma schema, avoiding SQLite's lack of native enum support while allowing easy mapping to PostgreSQL native enums if desired.

### 4.2. Complete Prisma Schema (`prisma/schema.prisma`)
```prisma
// This is your Prisma schema file.
// Learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // For local dev. Change to "postgresql" for Supabase.
  url      = env("DATABASE_URL")
}

// ==========================================
// 1. Campaign / Room Model
// ==========================================
model Campaign {
  id          String      @id @default(cuid())
  name        String
  description String?
  system      String      @default("T20") // "T20" | "TRPG" | "BOTH"
  activeSceneId String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  characters  Character[]
  scenes      Scene[]
  rollLogs    RollLog[]

  @@map("campaigns")
}

// ==========================================
// 2. Character Sheet Model (T20 & TRPG)
// ==========================================
model Character {
  id             String    @id @default(cuid())
  campaignId     String?
  campaign       Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  
  // System Discriminator (R1)
  system         String    // "T20" | "TRPG"
  isNpc          Boolean   @default(false)

  // Identity & Core Info
  name           String
  race           String
  class          String
  level          Int       @default(1)
  alignment      String?   // Classic TRPG (e.g. "Caótico e Bom") or T20 Deity/Role
  deity          String?   // God of Arton (e.g. "Valkaria", "Khalmyr", "Arsenal")
  avatarUrl      String?

  // Primary Resource Pools (R2)
  pvCurrent      Int
  pvMax          Int
  pvTemp         Int       @default(0)
  pmCurrent      Int
  pmMax          Int
  defense        Int       // Defesa (T20) or CA (TRPG)

  // Mathematical System Payloads (Stored as JSON Strings for 100% SQLite/PG compatibility)
  // attributes: T20 { FOR: 3, DES: 1, ... } vs TRPG { FOR: 16, DES: 12, ... }
  attributesJson String
  // skills: T20 trained array vs TRPG ranks & modifiers
  skillsJson     String
  // attacks: Weapons, damage dice, threat ranges (e.g. 19-20/x2)
  attacksJson    String
  // spells: Spells list, circles, PM costs, enhancements
  spellsJson     String
  // powers: T20 General Powers vs TRPG Feats/Talents
  powersJson     String
  // inventory: Items, weight/slots, currency (T$)
  inventoryJson  String
  // notes: Backstory, appearance, temporary status conditions
  notes          String?

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  tokens         Token[]
  rollLogs       RollLog[]

  @@index([system])
  @@index([campaignId])
  @@map("characters")
}

// ==========================================
// 3. Interactive Compendium Model (R5)
// ==========================================
model CompendiumItem {
  id             String    @id @default(cuid())
  system         String    // "T20" | "TRPG" | "ALL"
  type           String    // "RACE" | "CLASS" | "SPELL" | "POWER" | "TALENT" | "ITEM" | "THREAT"
  name           String
  description    String
  
  // Categorization & Querying
  category       String?   // e.g. "Arma Marcial", "Magia Divina", "Poder Geral: Combate"
  circle         Int?      // Spell circle (1..5 in T20, 0..9 in TRPG)
  cost           String?   // Price in T$ or PM cost
  requirement    String?   // e.g. "FOR 1", "Nível 5"
  
  // System Specific Structured Stats (JSON string)
  dataJson       String    // Damage, defense bonus, duration, enhancements, etc.
  tags           String    // Comma-separated tags: "dano,fogo,area,evocacao"

  createdAt      DateTime  @default(now())

  @@index([system, type])
  @@index([name])
  @@map("compendium_items")
}

// ==========================================
// 4. Tactical VTT Scene / Battlemap (R4)
// ==========================================
model Scene {
  id             String      @id @default(cuid())
  campaignId     String?
  campaign       Campaign?   @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  name           String
  gridWidth      Int         @default(20)  // Number of 1.5m squares horizontally
  gridHeight     Int         @default(20)  // Number of 1.5m squares vertically
  cellSizePx     Int         @default(50)  // Pixel size per cell on base 100% zoom
  meterPerSquare Float       @default(1.5) // Standard 1.5m / 5ft per Tormenta cell

  backgroundUrl  String?
  gridColor      String      @default("rgba(255,255,255,0.15)")
  gridOpacity    Float       @default(0.5)
  fogDataJson    String?     // Stored fog of war revelation polygons/masks
  isCurrent      Boolean     @default(false)

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  tokens         Token[]
  initiative     InitiativeEntry[]

  @@map("scenes")
}

// ==========================================
// 5. Tactical VTT Token (R4)
// ==========================================
model Token {
  id             String      @id @default(cuid())
  sceneId        String
  scene          Scene       @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  
  characterId    String?
  character      Character?  @relation(fields: [characterId], references: [id], onDelete: SetNull)

  name           String
  x              Int         @default(0)   // Grid cell X coordinate (0-indexed)
  y              Int         @default(0)   // Grid cell Y coordinate (0-indexed)
  size           String      @default("MEDIUM") // "SMALL", "MEDIUM", "LARGE" (2x2), "HUGE" (3x3), "COLOSSAL" (4x4)
  color          String      @default("#D4AF37")
  avatarUrl      String?

  pvCurrent      Int?
  pvMax          Int?
  elevation      Float       @default(0.0) // Height in meters for aerial/subterranean combat
  rotation       Int         @default(0)   // Degrees (0, 90, 180, 270)
  
  // Status conditions array: ["ABALADO", "CEGO", "IMOBILIZADO", "SANGRANDO"]
  conditionsJson String      @default("[]")

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  initiativeEntry InitiativeEntry?

  @@index([sceneId])
  @@map("tokens")
}

// ==========================================
// 6. Tactical Initiative Tracker (R4)
// ==========================================
model InitiativeEntry {
  id             String    @id @default(cuid())
  sceneId        String
  scene          Scene     @relation(fields: [sceneId], references: [id], onDelete: Cascade)

  tokenId        String?   @unique
  token          Token?    @relation(fields: [tokenId], references: [id], onDelete: Cascade)

  name           String
  initiativeRoll Int       // Total initiative result (1d20 + Iniciativa)
  modifier       Int       @default(0) // Dexterity / tiebreaker modifier
  isCurrentTurn  Boolean   @default(false)
  roundNumber    Int       @default(1)

  createdAt      DateTime  @default(now())

  @@index([sceneId, initiativeRoll])
  @@map("initiative_entries")
}

// ==========================================
// 7. Contextual Roll History (R3)
// ==========================================
model RollLog {
  id             String     @id @default(cuid())
  campaignId     String?
  campaign       Campaign?  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  characterId    String?
  character      Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)

  senderName     String
  system         String     @default("T20") // "T20" | "TRPG"
  rollType       String     // "ATTACK" | "SKILL" | "DAMAGE" | "INITIATIVE" | "CUSTOM"
  
  expression     String     // e.g. "1d20+7 # Ataque Espada Longa"
  diceBreakdown  String     // JSON: [{ die: 20, value: 19 }, { die: 6, value: 4 }]
  total          Int
  
  isCrit         Boolean    @default(false) // Natural 20 or threat margin hit
  isFumble       Boolean    @default(false) // Natural 1
  threatMargin   Int        @default(20)    // Configured threat margin (e.g. 19)
  label          String?    // "# Ataque", "# Furtividade"

  timestamp      DateTime   @default(now())

  @@index([campaignId])
  @@index([timestamp])
  @@map("roll_logs")
}
```

### 4.3. Compendium Initial Seed Script (`prisma/seed.ts`)
To satisfy Acceptance Criterion R5 (at least 10 canonical compendium items ready out of the box), the seed script seeds 12 rich entries from `survey_rules_1` across T20 and TRPG:
1. `race-humano-t20`: Humano (+1 in three attributes, Versátil power).
2. `race-anao-t20`: Anão (CON +2, SAB +1, DES -1, 6m speed without heavy armor reduction).
3. `class-guerreiro-t20`: Guerreiro (PV 20+CON, PM 3, Ataque Especial).
4. `class-arcanista-t20`: Arcanista (PV 8+CON, PM 6+Key, Mago/Bruxo/Feiticeiro).
5. `spell-misseis-magicos-t20`: Mísseis Mágicos (1 PM, 2 dardos 1d4+1, Essência).
6. `spell-bola-de-fogo-t20`: Bola de Fogo (3 PM, 6d6 fogo, área 6m).
7. `spell-curar-ferimentos-t20`: Curar Ferimentos (1 PM, 2d8+2 cura toque).
8. `power-ataque-poderoso-t20`: Ataque Poderoso (-2 ataque, +5 dano ou +10 duas mãos).
9. `power-esquiva-t20`: Esquiva (+1 Defesa, +1 Reflexos).
10. `item-espada-longa`: Espada Longa (15 T$, 1d8 corte, 19-20/x2).
11. `item-cota-de-malha`: Cota de Malha (150 T$, +6 Defesa/CA, -2 penalidade).
12. `threat-bugbear-t20`: Bugbear Espreitador (ND 2, PV 45, Defesa 16, Emboscador).

---

## 5. Pure Functional Rules & Dice Engine Architecture

To ensure tests execute in milliseconds and business logic is never coupled to React re-renders or database latency:

### 5.1. Rules Engine Module (`src/lib/rules/`)
- Zero dependencies on React, Next.js, or Prisma.
- Operates on pure TypeScript input objects and returns recalculated values.

```typescript
// src/lib/rules/types.ts
export type SystemEdition = 'T20' | 'TRPG';

export interface T20Attributes {
  FOR: number;
  DES: number;
  CON: number;
  INT: number;
  SAB: number;
  CAR: number;
}

export interface TRPGAttributes {
  FOR: number;
  DES: number;
  CON: number;
  INT: number;
  SAB: number;
  CAR: number;
}

export interface DerivedStats {
  pvMax: number;
  pmMax: number;
  defense: number;
  skills: Record<string, number>;
  armorPenalty: number;
}

// src/lib/rules/engine.ts
export function calculateT20Derived(
  level: number,
  baseClassPv: number,
  pvPerLevel: number,
  baseClassPm: number,
  pmPerLevel: number,
  keyAttrMod: number,
  attrs: T20Attributes,
  armorBonus: number,
  shieldBonus: number,
  isHeavyArmor: boolean,
  trainedSkills: string[]
): DerivedStats {
  const conMod = attrs.CON;
  const desMod = attrs.DES;

  // PV Formula (T20 Jogo do Ano)
  const pvMax = (baseClassPv + conMod) + (level - 1) * Math.max(1, pvPerLevel + conMod);

  // PM Formula (T20 Jogo do Ano)
  const pmMax = (baseClassPm + keyAttrMod) + (level - 1) * pmPerLevel;

  // Defense Formula (T20: No half-level for PCs; Heavy armor ignores DEX)
  const effectiveDes = isHeavyArmor ? 0 : desMod;
  const defense = 10 + effectiveDes + armorBonus + shieldBonus;

  // Skills Calculation: Half-level + Attr + Training (+2, +4, +6) - ArmorPenalty
  const halfLevel = Math.floor(level / 2);
  const trainingBonus = level >= 15 ? 6 : level >= 7 ? 4 : 2;

  // Calculate skills map...
  return { pvMax, pmMax, defense, skills: {}, armorPenalty: 0 };
}
```

### 5.2. Contextual Dice Engine (`src/lib/dice/`)
Supports the full dice grammar required by R3:
- Grammatical notation: `1d20+7`, `2d6+4`, `1d20+10 # Ataque Espada Longa`.
- Context parameters: `{ threatMargin: 19, critMultiplier: 2, targetDefense: 18 }`.
- Output:
  ```typescript
  export interface RollExecutionResult {
    expression: string;
    total: number;
    rolls: Array<{ die: number; value: number }>;
    modifiers: number;
    isNat20: boolean;
    isNat1: boolean;
    isCrit: boolean;
    isFumble: boolean;
    label?: string;
    formattedText: string;
  }
  ```

---

## 6. API Routes & Server Actions Specification

### 6.1. Server Actions (`src/server/actions/`)
Used for reactive, optimistic client operations with type-safe mutation:

1. `saveCharacterSheet(characterData: CharacterInput): Promise<CharacterOutput>`
   - Validates input payload using Zod.
   - Computes server-side verification of derived values to prevent client tampering.
   - Updates `Character` record in SQLite/PostgreSQL.
   - Revalidates path `/sheets/[id]`.

2. `executeAndLogRoll(request: RollRequest): Promise<RollExecutionResult>`
   - Evaluates dice expression securely.
   - Flags critical hits against weapon threat margin and target defense.
   - Persists entry into `RollLog`.
   - Returns full dice breakdown to the caller.

3. `updateTokenPosition(tokenId: string, x: number, y: number): Promise<Token>`
   - Clamps coordinates within scene grid bounds (`0 <= x < gridWidth`, `0 <= y < gridHeight`).
   - Persists new token position.

4. `updateInitiativeOrder(sceneId: string, activeTokenId: string, roundNumber: number): Promise<void>`
   - Updates active turn and advances round counter.

### 6.2. REST Route Handlers (`src/app/api/`)
1. `GET /api/sheets`: Return list of characters filtered by `system` or `campaignId`.
2. `POST /api/sheets`: Create new character sheet.
3. `GET /api/compendium?system=T20&query=fogo&type=SPELL`: Fast instant search for compendium browser.
4. `GET /api/rolls?campaignId=xxx&limit=30`: Polling or initial fetch of recent roll log.

---

## 7. Testing & Build Strategy

### 7.1. Vitest Configuration (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 7.2. Test Suites Mapping to Acceptance Criteria
1. `tests/unit/rules-t20.test.ts`:
   - [x] T20 Character creation: Level 1 Guerreiro with CON +2 calculates 22 PV, 3 PM, Defesa 16.
   - [x] T20 Level-up scaling: Level 5 Guerreiro calculates $22 + 4 \times (5 + 2) = 50$ PV, $3 + 4 \times 3 = 15$ PM.
   - [x] Negative CON safety: Level-up always yields at least 1 PV ($\max(1, 2 + (-3)) = 1$).
   - [x] Trained skill bonus tiers: +2 at level 1-6; +4 at level 7-14; +6 at level 15-20.
   - [x] Heavy armor effect: Sets effective Dexterity modifier to 0 on Defesa.
   - [x] PM spending limit: Rejects action when spent PM exceeds character level.
2. `tests/unit/rules-trpg.test.ts`:
   - [x] Classic attributes: Score 16 -> Mod +3; Score 9 -> Mod -1.
   - [x] Armor Class (CA): Adds $\lfloor \text{Level} / 2 \rfloor$ and caps DEX by MaxDex of armor.
   - [x] BBA matrix progression: High (+1/lvl), Medium (+0.75/lvl), Low (+0.5/lvl).
   - [x] Saving throws: Fortitude, Reflexos, Vontade classic progressions.
3. `tests/unit/dice-parser.test.ts`:
   - [x] Expression evaluation: `1d20+7`, `2d6+4`, `1d20+10 # Ataque Espada`.
   - [x] Threat range detection: Weapon with threat 19 flags critical on 19 and 20.
   - [x] Natural 1 fumble detection.
   - [x] Critical damage multiplication (multiplies base weapon dice).
4. `tests/unit/vtt-distance.test.ts`:
   - [x] Distance calculation in 1.5m squares.
   - [x] Tormenta range bands: Toque (adjacent), Curto (<= 9m), Médio (<= 18m), Longo (<= 36m).
5. `tests/integration/sheet-persistence.test.ts`:
   - [x] Creating, retrieving, and updating character in SQLite.
   - [x] Recalculating derived stats upon attribute modification.

---

## 8. Build, Lint, and Execution Setup

### 8.1. `package.json` Specification
```json
{
  "name": "trpg-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.21.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.453.0",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4",
    "zod": "^3.23.8",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.7.5",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.15",
    "postcss": "^8.4.47",
    "prisma": "^5.21.1",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3",
    "vitest": "^2.1.3"
  }
}
```

### 8.2. `tsconfig.json` Specification
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 8.3. `.env.example`
```env
# Local SQLite Database (Instant Execution, Zero External Dependencies)
DATABASE_URL="file:./dev.db"

# Production Supabase PostgreSQL (When Migrating to Cloud)
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

---

## 9. Verification & Acceptance Criteria Matrix

| Criterion | Requirement Reference | Architectural Solution | Verification Method |
|:---|:---|:---|:---|
| **Multi-System Engine (T20 & TRPG)** | R1 | Pure functional rules module with `system: 'T20' \| 'TRPG'` discriminated union | Unit tests in `tests/unit/rules-t20.test.ts` & `tests/unit/rules-trpg.test.ts` |
| **Dynamic Sheet Recalculation** | R2 | Derived calculation pipeline (PV, PM, Defesa/CA, Skills) triggered on any state modification | Reactive Zustand store + Server verification action |
| **Contextual Dice Roller** | R3 | Pure AST parser supporting NdX, arithmetic, threat ranges, Nat 20/1 detection, and comments | Unit tests in `tests/unit/dice-parser.test.ts` |
| **Tactical Grid VTT** | R4 | Multi-layer canvas with 1.5m / 5ft coordinate system, ruler tool, and initiative tracker | Unit tests for distance formulas; Token canvas render |
| **Compendium Search & Drag-Drop** | R5 | Universal `CompendiumItem` schema seeded with 12 canonical entries; HTML5 drag & drop | Seed validation test and search API endpoint |
| **Plug-and-Play Dev Execution** | R6 | SQLite `file:./dev.db` with `prisma db push`; Node 24 compatibility; Next.js App Router | `npm install && npx prisma db push && npm test && npm run build` |
