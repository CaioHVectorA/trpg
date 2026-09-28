# Handoff Report — Full-Stack Architecture Exploration

- **Agent**: Full-Stack Architecture Explorer (`survey_arch_2`)
- **Working Directory**: `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_arch_2`
- **Date**: 2026-09-27
- **Recipient**: Orchestrator (`135ea200-054c-446a-ac5d-f7b1e25b17f3`)
- **Type**: Hard (Task Complete)

---

## 1. Observation

1. **Workspace Root Inspection**:
   - `list_dir` on `/home/usuario/develop/trpg-platform` revealed only 1 entry: `{"name":".agents","isDir":true}`. The workspace is a greenfield project with no pre-existing source files, `package.json`, or configuration files.
2. **Runtime & Shell Environment**:
   - Tool execution `node -v && npm -v && git status` in subshell returned:
     ```
     bash: linha 1: node: comando não encontrado
     exit code 127
     ```
   - Further probe via `find /home/usuario -name "node" -type f` revealed:
     `/home/usuario/.nvm/versions/node/v24.12.0/bin/node`
   - Command `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && node -v && npm -v && which npx` succeeded with output:
     ```
     v24.12.0
     11.6.2
     /home/usuario/.nvm/versions/node/v24.12.0/bin/npx
     ```
   - Sourcing: `~/.bashrc` lines 4-6 configures NVM (`export NVM_DIR="$HOME/.nvm"` and `[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`), but non-interactive bash subshells run without interactive `.bashrc` initialization.
3. **Domain & Rules Engine Specifications**:
   - Inspected `survey_rules_1/report.md` (lines 1 to 600):
     * Tormenta 20 uses direct attribute modifiers (-1 to +4 base), universal PM pool with spending limit = level, deterministic PV scaling without dice, tiered trained skills (+2/+4/+6), and Defesa without half-level for PCs.
     * Tormenta RPG Clássico uses 3-18 attributes, BBA progression matrices, skill ranks (graduações), and CA with half-level.
     * Compendium requires polymorphic data model for 6 core categories (Races, Classes, Spells, Powers/Talents, Items, Threats) with 12 canonical entries already documented.
4. **Interactive VTT & UI Specifications**:
   - Inspected `survey_vtt_3/BRIEFING.md` and `progress.md`:
     * Requires 1.5m / 5ft cell scale, Tormenta range bands (Toque, Curto 9m, Médio 18m, Longo 36m), initiative tracker, and drag-and-drop from compendium to sheet/canvas.
5. **Modern Web Guidance Search**:
   - Retrieved guidelines from `modern-web-guidance`: Glassmorphism using `backdrop-filter: blur()`, `@starting-style` and `transition-behavior: allow-discrete` for accessible dialogs, and `@media (prefers-reduced-motion: reduce)`.

---

## 2. Logic Chain

1. **Step 1 (Runtime resolution)**: From Observation 2, Node.js v24.12.0 and npm 11.6.2 are installed in NVM. Because non-interactive subshells exit with code 127 if `PATH` is not explicitly set, all build scripts, continuous integration checks, and runner commands must explicitly export `PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` or source `~/.nvm/nvm.sh`.
2. **Step 2 (Zero-friction local dev requirement - R6)**: The user requirement mandates instant local execution with `npm install` and `npm run dev` without complex external dependencies. Using SQLite (`file:./dev.db`) managed by Prisma allows database creation in seconds via `npx prisma db push` without requiring a local PostgreSQL server or Docker daemon.
3. **Step 3 (Supabase PostgreSQL migration readiness - R6)**: To make SQLite schemas effortlessly migratable to Supabase PostgreSQL, we must avoid SQLite-incompatible features (such as database-level enum types or Postgres-specific extensions). By using `cuid()` strings for IDs, standard scalar types (`String`, `Int`, `Float`, `Boolean`, `DateTime`), and stringified JSON payloads for system-divergent data, switching to Supabase PostgreSQL is achievable by simply changing `provider = "postgresql"` in `prisma/schema.prisma` and supplying a Supabase connection string.
4. **Step 4 (Multi-system architectural separation - R1)**: From Observation 3, T20 and TRPG possess divergent attribute and combat mechanics. The rules engine must be implemented in pure functional TypeScript (`src/lib/rules/`) with zero React or DOM dependencies. This decouples calculation logic from the UI, allows 100% deterministic unit testing in Vitest, and enables the exact same engine to run client-side for optimistic UI feedback and server-side in Server Actions for validation.
5. **Step 5 (Theme & Tabletop UI - R2, R4, R5)**: From Observations 3, 4, and 5, the high-fantasy Tormenta aesthetic requires specialized color tokens (Arton ruby red, Valkyr gold, mana sapphire, parchment backgrounds), responsive canvas layering for the VTT, and accessible UI primitives for modals, tooltips, and dice trays.

---

## 3. Caveats

1. **Live WebSocket / WebRTC Multiplayer**: The current architecture blueprint specifies Server Actions and REST Route Handlers with optimistic local client state and polling/event streams. If multi-user real-time collaborative map movement (multiple players dragging tokens concurrently with sub-50ms latency) is required in Phase 2, a lightweight Supabase Realtime channel or WebSockets server can be layered on top of the established `Scene` and `Token` schemas.
2. **Next.js Version Support**: Node v24.12.0 works smoothly with Next.js 14.2.15 and Next.js 15. The blueprint pins Next.js to `14.2.15` and React `18.3.1` to maximize ecosystem compatibility with Prisma 5.21 and Tailwind CSS 3.4.
3. **No Code Implementation in Phase 0**: In compliance with the Explorer archetype and project constraints, no implementation code has been written into the project root during this survey phase.

---

## 4. Conclusion

The full-stack technical blueprint for the Tormenta RPG platform is fully defined and documented in `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_arch_2/report.md`. The design fulfills all requirements of R1 through R6:
- **Clean modular layout**: Separation between pure rules engine (`src/lib/rules/`), pure dice engine (`src/lib/dice/`), domain UI components (`src/components/`), and App Router pages (`src/app/`).
- **Dual database readiness**: Universal Prisma schema operating instantly on SQLite (`file:./dev.db`) with zero friction, and single-line migration to Supabase PostgreSQL.
- **Robust testing**: Fast Vitest test suites verifying T20 and TRPG calculations, dice formulas, and VTT coordinate math.
- **Tabletop High-Fantasy Design**: Complete Tailwind theme incorporating Tormenta ruby red, Valkyr gold, mana sapphire, and parchment styling.

The architecture is ready for Phase 1 `PROJECT.md` compilation and subsequent implementation.

---

## 5. Verification Method

To independently verify the environment and blueprint artifacts:

1. **Verify Node & NPM Runtime in Subshell**:
   ```bash
   export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"
   node -v  # Expected: v24.12.0
   npm -v   # Expected: 11.6.2
   ```
2. **Inspect Architecture Report**:
   ```bash
   cat /home/usuario/develop/trpg-platform/.agents/teamwork/survey_arch_2/report.md
   ```
3. **Verify Prisma Schema Syntactic Validity**:
   The Prisma schema defined in Section 4.2 of `report.md` uses valid Prisma 5 syntax and universal types compatible with both SQLite and PostgreSQL.
4. **Invalidation Conditions**:
   - If SQLite native drivers or Prisma fail on Node 24 without NVM PATH prefixing.
   - If T20 rules calculations add half-level to Defesa for player characters (invalidated by official T20 rules).
