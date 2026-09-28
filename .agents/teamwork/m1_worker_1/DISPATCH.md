# Task Assignment: M1 Project Foundation & Persistence Worker

- **Role**: Foundation & Persistence Worker
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/m1_worker_1
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Sources**:
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md` (MUST read before starting)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_arch_2/report.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md`

## File Ownership
- Exclusively owns: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `prisma/`, `src/app/`, `src/components/ui/`, `src/components/layout/`, `src/lib/db/`, `public/`.
- MUST NOT modify `tests/e2e/` (owned by E2E Test Writer).

## Environment Notice
- Node/npm runtime: Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` when executing node/npm/npx/vitest commands in bash.

## Objective
Implement Milestone M1 (Foundation, Next.js Scaffold, Tailwind High-Fantasy Theme, Universal Prisma SQLite/PostgreSQL Database & Seed Dataset):
1. Create `package.json` with Next.js 14.2.15, React 18.3.1, Prisma 5.21.1, Tailwind 3.4.14, `@prisma/client`, `lucide-react`, `clsx`, `tailwind-merge`, and dev dependencies (`typescript`, `vitest`, `@vitejs/plugin-react`, `@types/node`, `@types/react`, `tsx`).
2. Create `tsconfig.json`, `postcss.config.js`, and `tailwind.config.ts` (with Tormenta high-fantasy color palette: `arton-ruby`, `valkyr-gold`, `mana-sapphire`, `parchment`, `slate`, serif and sans fonts).
3. Create `prisma/schema.prisma` with SQLite provider (`file:./dev.db`) designed for seamless Supabase PostgreSQL migration (using cuid IDs, standard types, JSON fields). Include models: `Campaign`, `Character`, `CompendiumItem`, `Scene`, `Token`, `InitiativeEntry`, `RollLog`.
4. Create `src/lib/db/prisma.ts` (global Prisma client singleton for Next.js).
5. Create `prisma/seed.ts` and populate the 12 canonical seed entities from `survey_rules_1/report.md` (Humano, Anão, Guerreiro, Arcanista, Mísseis Mágicos, Bola de Fogo, Curar Ferimentos, Ataque Poderoso, Esquiva, Espada Longa, Cota de Malha, Bugbear Espreitador).
6. Create `src/app/globals.css`, `src/app/layout.tsx`, and `src/app/page.tsx` (an immersive high-fantasy home dashboard with Tormenta styling, quick navigation to Characters, Compendium, and Tactical VTT Grid).
7. Create `vitest.config.ts` configured with `@vitejs/plugin-react` and path alias `@/*`.
8. Execute:
   - `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"`
   - `npm install`
   - `npx prisma db push`
   - `npx tsx prisma/seed.ts`
   - Verify `npm run build` or `npx next build` succeeds.
9. Deliver handoff report in `/home/usuario/develop/trpg-platform/.agents/teamwork/m1_worker_1/handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-27T18:01:45Z
You are the M1 Foundation & Persistence Worker.
Your Working Directory: /home/usuario/develop/trpg-platform/.agents/teamwork/m1_worker_1
Task Dispatch File: /home/usuario/develop/trpg-platform/.agents/teamwork/m1_worker_1/DISPATCH.md
Original User Request: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
Master Project Plan: /home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md
Parent Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3

Please read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md before starting.
Implement Milestone M1: Next.js 14 App Router, TypeScript strict, Tailwind CSS with Tormenta High-Fantasy palette, Prisma SQLite dev.db schema with Supabase migration readiness, seed dataset with 12 canonical entities, vitest setup, and verify build and database generation.
Remember to prefix commands with:
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"
Deliver your handoff report to /home/usuario/develop/trpg-platform/.agents/teamwork/m1_worker_1/handoff.md and notify parent via send_message.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-27T18:30:24Z
**Context**: M1 Foundation & Persistence Worker status check
**Content**: You appear to be idle. Please report the status of `npm install`, `npx prisma db push`, seed execution, and build verification.
**Action**: If completed, generate handoff.md and send completion report; if blocked, explain current blocker.

