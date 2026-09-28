# Task Assignment: Milestone M5 Tactical VTT Combat Grid Worker

- **Role**: Tactical VTT Developer
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/m5_worker_1
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Sources**:
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md` (MUST read first)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md` (Section 2 for canvas layering, metrics, initiative)

## File Ownership
- Exclusively owns: `src/lib/vtt/`, `src/components/vtt/`, `src/app/vtt/`, `src/app/api/scenes/`, `src/app/api/tokens/`, `public/`, `tests/unit/vtt/`.
- MUST NOT modify `src/components/sheet/` (owned by M4).

## Environment Notice
- Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` when running any node/npm/npx/vitest commands.

## Objective
Implement Milestone M5 (Features 23 to 26) with interactive canvas, token management, distance ruler, and integrated initiative tracker:
1. **Grid Engine & Multi-Layer Canvas (`src/components/vtt/VttCanvas.tsx`, `src/lib/vtt/grid.ts`)**:
   - Square grid representing 1.5m / 5ft per cell.
   - Background battlemap image rendering (with sample map in `public/maps/dungeon_arena.svg` or `.png`).
   - Zooming, panning, and grid line toggle (size/opacity).
   - Coordinate conversions: World pixels to Grid cells (`x, y`) and snapping.
2. **Token System (`src/components/vtt/TokenLayer.tsx`, `src/lib/vtt/tokens.ts`)**:
   - Player and Monster tokens with sizing (`P` = 1x1 cell, `M` = 1x1, `G` = 2x2, `E` = 3x3).
   - Drag-and-drop movement with immediate snap-to-cell.
   - Token selection, HP bar overlay, and condition badges.
   - SVG avatars for sample tokens in `public/assets/tokens/` (e.g. `warrior.svg`, `mage.svg`, `bugbear.svg`).
3. **Dual-Metric Range Ruler (`src/components/vtt/RangeRulerLayer.tsx`, `src/lib/vtt/ruler.ts`)**:
   - Interactive measuring ruler between cells:
     * Chebyshev metric (T20): diagonals count 1.5m.
     * Alternating 5/10/5 metric (TRPG): 1st diagonal 1.5m, 2nd diagonal 3.0m.
   - Range band classification: Toque (<= 1.5m), Curto (<= 9m / 6 squares), Médio (<= 18m / 12 squares), Longo (<= 36m / 24 squares), Extremo (> 36m).
4. **Initiative Tracker (`src/components/vtt/InitiativePanel.tsx`, `src/lib/vtt/initiative.ts`)**:
   - Order tokens by initiative value (descending).
   - Next turn / Previous turn controls with round counter.
   - Active combatant highlight.
   - Quick HP adjuster and condition toggle within tracker.
5. **Persistence API (`src/app/api/scenes/route.ts`, `src/app/api/tokens/route.ts`)**:
   - Save and load scenes and token positions to Prisma `Scene` and `Token` models.
   - Interactive page under `src/app/vtt/page.tsx` integrating VttCanvas, InitiativePanel, and VttToolbar.
6. **Unit & Integration Tests (`tests/unit/vtt/`)**:
   - Automated tests for coordinate math, Chebyshev vs 5/10/5 distance, range bands, and initiative ordering.
   - Verify `npm test`, `npm run lint`, and `npm run build` all pass 100%.



## 2026-09-27T20:57:15Z
You are the Milestone M5 Tactical VTT Combat Grid Worker.
Your Working Directory: /home/usuario/develop/trpg-platform/.agents/teamwork/m5_worker_1
Task Dispatch File: /home/usuario/develop/trpg-platform/.agents/teamwork/m5_worker_1/DISPATCH.md
Original User Request: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
Master Project Plan: /home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md
Parent Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3

Please read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md before starting.
Implement Milestone M5 (Features 23 to 26) in src/lib/vtt/, src/components/vtt/, src/app/vtt/, and src/app/api/scenes/:
- Tactical grid canvas (1.5m / 5ft per cell), background map rendering (create public/maps/ sample battlemap SVG/PNG), pan/zoom.
- Token management: player/monster tokens (sizes P, M, G, E), snap-to-grid drag & drop, HP bar and conditions overlays, sample token SVGs in public/assets/tokens/.
- Dual-metric range ruler: Chebyshev (T20) and alternating 5/10/5 (TRPG), Tormenta range bands (Toque, Curto 9m, Médio 18m, Longo 36m).
- Initiative Tracker: order sorting, round tracking, turn advance, status indicators.
- API persistence for scenes and tokens.
- Unit tests in tests/unit/vtt/.
Remember to prefix commands with:
export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"
Run tests, lint, and build to verify. Deliver handoff to /home/usuario/develop/trpg-platform/.agents/teamwork/m5_worker_1/handoff.md and notify parent via send_message.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

