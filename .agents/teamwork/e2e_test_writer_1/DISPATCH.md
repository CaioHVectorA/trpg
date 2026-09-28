# Task Assignment: E2E Testing Suite Author

- **Role**: E2E Test Writer
- **Working Directory**: /home/usuario/develop/trpg-platform/.agents/teamwork/e2e_test_writer_1
- **Parent Conversation ID**: 135ea200-054c-446a-ac5d-f7b1e25b17f3
- **Authoritative Sources**:
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md` (MUST read before starting)
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md`
  - `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md`

## File Ownership
- Exclusively owns: `tests/e2e/`, `TEST_INFRA.md`, `TEST_READY.md`.
- MUST NOT modify files outside `tests/e2e/` and the metadata root documents `TEST_INFRA.md` and `TEST_READY.md`.

## Environment Notice
- Node/npm runtime: Always prepend `export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH"` when executing node/npm/npx/vitest commands in bash.

## Objective
Design and implement the comprehensive opaque-box E2E test suite covering all 31 features in `PROJECT.md § Feature Inventory` using the 4-tier methodology:
1. **Tier 1 - Feature Coverage (>=5 per feature)**:
   - Happy path isolated tests for each feature (R1 to R6).
2. **Tier 2 - Boundary & Corner Cases (>=5 per feature)**:
   - Limits, empty inputs, max-size, negative values, zero attributes, extreme threat margins, edge conditions from `survey_rules_1` and `survey_vtt_3`.
3. **Tier 3 - Cross-Feature Combinations (pairwise coverage)**:
   - Interactions between features (e.g. T20 sheet heavy armor -> Dex 0 -> Defense recalculation -> physical skill penalty applied to stealth roll -> dice roller evaluates roll with penalty).
4. **Tier 4 - Real-World Application Scenarios (>=5 complex scenarios)**:
   - Complete combat round with 3 characters + 1 boss threat on 1.5m tactical grid, initiative roll, movement with distance measurement, action roll with threat check, PM expenditure limit enforcement, damage application to HP with temp HP absorption.

## Deliverables
1. `TEST_INFRA.md` at project root documenting test architecture, feature inventory, methodology, and runner command.
2. Complete executable test files in `tests/e2e/` runnable via Vitest (`export PATH="/home/usuario/.nvm/versions/node/v24.12.0/bin:$PATH" && npx vitest run tests/e2e/`).
3. `TEST_READY.md` at project root summarizing test counts per tier and feature checklist.
4. Handoff report in `/home/usuario/develop/trpg-platform/.agents/teamwork/e2e_test_writer_1/handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-27T18:01:45Z
You are the E2E Test Writer.
Your Working Directory: /home/usuario/develop/trpg-platform/.agents/teamwork/e2e_test_writer_1
Task Dispatch File: /home/usuario/develop/trpg-platform/.agents/teamwork/e2e_test_writer_1/DISPATCH.md
Original User Request: /home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md
Master Project Plan: /home/usuario/develop/trpg-platform/.agents/teamwork/PROJECT.md
Parent Conversation ID: 135ea200-054c-446a-ac5d-f7b1e25b17f3

Please read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md before starting.
Design and implement the comprehensive opaque-box E2E test suite covering all 31 features across Tiers 1 to 4.
Generate TEST_INFRA.md, executable test cases in tests/e2e/, and publish TEST_READY.md when complete.
Deliver your handoff report to /home/usuario/develop/trpg-platform/.agents/teamwork/e2e_test_writer_1/handoff.md and notify parent via send_message.

