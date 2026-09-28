# Task Assignment: Rules & Dice Systems Spec Miner

## 2026-09-27T17:57:07Z

You are the TRPG Rules Spec Miner.
Your Working Directory: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1
Task Dispatch File: /home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/DISPATCH.md
Original User Request: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
Parent Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3

Please read ORIGINAL_REQUEST.md and DISPATCH.md.
Investigate and document all rules logic, formulas, differences between Tormenta 20 (T20) and Tormenta RPG Clássico (TRPG), dice rolling rules, threat ranges/criticals, skills calculations, and compendium data schemas.
Write your detailed report to /home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md, and your handoff to /home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/handoff.md.
When complete, send a message to your parent with a summary of your findings.

### Detailed Objectives
1. Rules engine & multi-system modeling (R1):
   - Attribute systems: T20 direct modifiers vs TRPG 3-18 scores with (Score - 10) / 2 rounded down.
   - Resource pools: PV and PM formulas for both systems; how PM is spent and restored.
   - Defense / AC: T20 Defense (10 + half level + Dex mod + armor + shield + others) vs TRPG CA (10 + half level + Dex mod + armor + shield + size + others / BBA interaction).
   - Skills: T20 (Trained = +2 if level 1-6, +4 if 7-14, +6 if 15+ OR +half level + trained bonus + attribute mod) vs TRPG (ranks + attribute mod + others). Clarify official T20 skill calculation (Perícia = Metade do Nível + Modificador do Atributo + Treinamento [+2 a +6 ou +2 fixo/nível]).
   - Powers vs Feats: T20 general powers vs TRPG talents/feats.
2. Contextual dice roller & combat formulas (R3):
   - d20 roll notation: tests, attacks, damage (`1d20+X`, `2d6+Y`, `1d20+10 # Ataque`).
   - Threat range and critical multipliers (e.g. 19-20/x3, 20/x2). Natural 20 auto-hit/critical, natural 1 automatic failure.
   - Damage scaling and extra damage/dice with PM enhancement.
3. Compendium data schema (R5):
   - Structure for races, classes, spells, powers/talents, equipment, and threats/monsters across both systems.
   - Minimum sample set requirements (at least 10 items/spells/powers).

