# Task Assignment: Sheet Builder & Tactical VTT Spec Miner

- **Role**: Sheet and VTT Spec Miner
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Source**: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md

## Objective
Investigate and specify the UI/UX components, state management, and real-time/interactive requirements for:
1. Dynamic Sheet Builder & Manager (R2):
   - Step-by-step character & threat/monster creation flows.
   - State model: reactive recalculation of derived values (PV, PM, Defesa/CA, pericias, carga/penalidade de armadura).
   - Real-time adjustments: spending PM, taking damage, tracking status conditions (fatigado, atordoado, caido, etc.).
   - Persistence & plug-and-play synchronization (local state + API/database sync).
   - Direct-click action integration (clicking on an attack or skill triggers contextual roll in dice engine).
2. Tactical VTT Combat & Scene Grid (R4):
   - Grid rendering engine: Square grid representing 1.5m / 5ft per cell.
   - Map handling: background image loading, scaling, dimensions, grid overlay toggles/colors.
   - Token system: player and monster tokens, positioning (x, y coordinates), drag-and-drop movement, selection, HP/status overlays.
   - Distance and Range Ruler: Euclidean vs Chebyshev / D&D diagonal measurement (5/10/5 or 1.5m per square), range bands (curto: 9m/6sq, médio: 18m/12sq, longo: 36m/24sq).
   - Initiative Tracker: ordering combatants by initiative roll/value, tracking current turn, advancing rounds, HP/condition indicators.
3. Drag-and-drop & Compendium Integration (R5 into R2 & R4):
   - Dragging spells, powers, and items from compendium drawer into character sheet or VTT scene.

Write a comprehensive report to `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md` and deliver `handoff.md`. Notify parent when done via send_message.

## 2026-09-27T17:57:07Z
You are the Sheet and VTT Spec Miner.
Your Working Directory: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3
Task Dispatch File: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/DISPATCH.md
Original User Request: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
Parent Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3

Please read ORIGINAL_REQUEST.md and DISPATCH.md.
Investigate and specify the UI/UX architecture, state models, interactive requirements for the Dynamic Sheet Builder (derived values, real-time sync, PV/PM adjustments, direct-click rolls) and Tactical VTT Combat Grid (1.5m / 5ft grid, tokens, range ruler, initiative tracker, compendium drag & drop).
Write your detailed report to /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md, and your handoff to /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/handoff.md.
When complete, send a message to your parent with a summary of your findings.
