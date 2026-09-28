# BRIEFING — 2026-09-27T18:00:30Z

## Mission
Investigate and specify UI/UX architecture, state models, and interactive requirements for Dynamic Sheet Builder (R2), Tactical VTT Grid (R4), and Drag-and-Drop Compendium (R5) supporting Tormenta 20 and TRPG Clássico.

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Sheet and VTT Spec Miner, External domain expert (modern-web-guidance)
- Working directory: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3
- Original parent: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- Milestone: Phase 0 - Discovery & Technical Specification

## 🔒 Key Constraints
- Read-only regarding application implementation code; discover and document all features, edge cases, state models, interactive requirements
- Write reports and artifacts strictly in own directory (.agents/teamwork/survey_vtt_3/)
- Prioritize authoritative sources (ORIGINAL_REQUEST.md, Tormenta 20 and Tormenta RPG rulesets, modern web best practices)
- Provide self-contained handoff with 5 components (Observation, Logic Chain, Caveats, Conclusion, Verification Method)

## Current Parent
- Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- Updated: 2026-09-27T18:00:30Z

## Task Summary
- **What to build**: Complete UI/UX architecture, state models, data contracts, interactive specifications for Dynamic Sheet Builder, Tactical VTT Combat Grid, and Compendium Drag-and-Drop.
- **Success criteria**: Detailed, actionable report.md and handoff.md covering step-by-step creation, reactive recalculation, PV/PM adjustments, direct-click rolls, 1.5m grid rendering, token management, distance measurement (Euclidean/Chebyshev/Bands), initiative tracker, compendium integration, edge cases, and feature catalog.
- **Interface contracts**: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
- **Code layout**: [To be established in Phase 1 PROJECT.md]

## Key Decisions Made
- Multi-system architecture: Character and Threat models with discriminated union (`system: 'T20' | 'TRPG'`).
- Tactical VTT using 5-layer Canvas / DOM architecture: Background Map (Layer 1), Grid Mesh (Layer 2), Token Layer (Layer 3), Interactive Ruler / AoE Layer (Layer 4), and HUD / Context Menus (Layer 5).
- State management: Local reactive state (Zustand store with optimistic updates) + Debounced API persistence / WebSocket real-time broadcast.
- Direct-click action integration: Action/Roll payloads dispatched to unified Dice Engine with context (character ID, ability, threat margin, modifiers).
- Compendium Drag-and-Drop: Standardized MIME types `application/x-trpg-*` with specialized drop behaviors on Sheet and VTT Canvas.
- Performance optimization: CSS containment (`content-visibility: auto`) on side panels (Compendium and Sheet Drawers) to guarantee 60 FPS in VTT canvas.

## Artifact Index
- /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/DISPATCH.md — Assignment instructions
- /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/progress.md — Liveness & progress tracker
- /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md — Comprehensive UI/UX and VTT specification report
- /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/handoff.md — 5-component handoff report

## Loaded Skills
- **Source**: /home/usuario/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md
- **Local copy**: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/skills/modern-web-guidance.md
- **Core methodology**: Modern web frontend best practices: UI/Layout, Canvas/DOM rendering, drag-and-drop, performance, state sync
