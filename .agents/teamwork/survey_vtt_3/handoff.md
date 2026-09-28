# Handoff Report: Sheet Builder & Tactical VTT Specification

**Role**: Sheet and VTT Spec Miner (`survey_vtt_3`)  
**Workspace Directory**: `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3`  
**Parent Conversation ID**: `135ea200-054c-446a-ac5d-f7b1e25b17f3`  
**Target File**: `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/handoff.md`  
**Type**: Hard Handoff (Task Complete)  

---

## 1. Observation

1. **Authoritative Requirements Document**:
   - Inspected `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md`:
     - Line 14: "R1. Motor de Regras e Modelagem Multi-Sistema (T20 e TRPG Clássico)"
     - Line 17: "R2. Construtor e Gerenciador de Fichas Dinâmicas"
     - Line 20: "R3. Motor de Rolagem de Dados Contextualizado"
     - Line 27: "R4. Grid Tático de Combate e Cenas (VTT)"
     - Line 34: "R5. Compêndio de Regras e Consulta Rápida"
     - Line 37: "R6. Arquitetura Técnica Plug-and-Play e Qualidade"
     - Lines 50-68: Acceptance criteria defining:
       - "Criação e alternância funcional de fichas nos modos Tormenta 20 e Tormenta RPG clássico"
       - "Ficha de T20 calcula automaticamente perícias com base em: Treinamento + Metade do Nível + Modificador do Atributo + outros bônus"
       - "Ficha de TRPG clássico respeita atributos clássicos (ex: Força 16 -> Mod +3) e graduações/BBA conforme as regras tradicionais"
       - "Gastos de PM (Pontos de Mana) e alterações de PV refletem imediatamente no estado da ficha"
       - "Execução de rolagens diretas a partir da ficha (clique no ataque, teste de perícia ou dano)"
       - "Grid renderiza células quadradas proporcionais e permite arrastar/soltar tokens de personagens no canvas"
       - "Ferramenta de régua mede distâncias no grid em metros ou quadrados (1,5m / 5ft)"
       - "Painel de iniciativa exibe a lista ordenada de combate, permitindo avançar turnos"
       - "Compêndio interativo permite filtrar e visualizar detalhes de pelo menos 10 itens/magias/poderes de exemplo de T20 e TRPG"
2. **Environment & Runtime Tools**:
   - Ran `which node npm pnpm` in bash:
     - Node v24.12.0 is at `/home/usuario/.nvm/versions/node/v24.12.0/bin/node`
     - pnpm is at `/home/usuario/.nvm/versions/node/v24.12.0/bin/pnpm`
   - Retrieved guidance from `modern-web-guidance`:
     - `interactions-in-complex-layouts` (CSS `content-visibility: auto` and layout containment to preserve 60FPS during drag-and-drop operations).
     - `visually-texture-content` (CSS `mask-image` for high fantasy parchment/leather textures).
     - `navigation-drawer` (Slide-in compendium drawer).
3. **Workspace State**:
   - Confirmed greenfield status in `/home/usuario/develop/trpg-platform` (only `.agents` directory present).
   - Generated comprehensive specification report at `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md`.

---

## 2. Logic Chain

1. **From Acceptance Criteria to Architecture**:
   - The requirement for supporting both Tormenta 20 and Tormenta RPG classico necessitates a discriminated union in the sheet state (`system: 'T20' | 'TRPG'`).
   - T20 direct attributes (`FOR +3`, `DES +1`) vs TRPG scores (`3-18`, with modifier formula `floor((score - 10) / 2)`) must be encapsulated within a unified reactive calculation pipeline so that UI widgets can bind cleanly to `mod(attr)`.
2. **From Calculation Dependencies to DAG State Model**:
   - PV, PM, Defesa/CA, Perícias, and Carga/Penalidade all depend on attributes and equipment.
   - For example, equipping heavy armor in T20 zeroes out the DEX bonus to Defense and applies an armor penalty to physical skills (Acrobacia, Atletismo, Furtividade, Ladinagem).
   - This requires an immutable state model with synchronous derived value recomputation, preventing desynchronization.
3. **From Combat Usability to Direct-Click Action Payloads**:
   - R3 requires direct-click rolls from attacks, skills, and spells.
   - To decouple the sheet UI from the dice evaluation engine, every click emits a strongly-typed `AttackRollPayload`, `SkillRollPayload`, or `SpellRollPayload` containing pre-computed bonuses, formulas, crit threat ranges (e.g. 19-20), and crit multipliers (e.g. x3).
4. **From VTT Tactical Grid to Multi-Layer Canvas**:
   - Rendering high-resolution battlemaps together with dynamic grid lines, tokens, range rulers, and AoE templates on a single canvas causes excessive repaints and frame drops.
   - Partitioning into 5 specialized layers (Background Map, Grid Mesh, Token Layer, Interactive Ruler/AoE Layer, and HTML DOM HUD) guarantees 60 FPS during token dragging and camera panning.
5. **From Scale to Distance Metrics**:
   - Standard scale is $1 \text{ cell} = 1.5\text{m} = 5\text{ft}$.
   - Tormenta 20 uses the Chebyshev metric (diagonals equal orthogonals, $1\text{q} = 1.5\text{m}$), whereas TRPG classico uses the alternating 5/10/5 diagonal metric ($1\text{st} = 1.5\text{m}, 2\text{nd} = 3.0\text{m}$).
   - The Range Ruler must support both modes and dynamically evaluate Tormenta range bands (Toque $\le 1.5\text{m}$, Curto $\le 9\text{m}$, Médio $\le 18\text{m}$, Longo $\le 36\text{m}$, Extremo $> 36\text{m}$).
6. **From Compendium Drag-and-Drop to MIME Data Transfer**:
   - Compendium items dragged into character sheets or VTT canvases need specific drop behaviors:
     - Weapon drop -> adds item + generates attack macro.
     - Armor drop -> adds item + equips + updates AC and penalty.
     - Threat drop on VTT -> spawns `VttToken` at the snapped grid coordinate $(G_x, G_y)$.
   - Custom MIME types (`application/x-trpg-*`) provide explicit schema validation during drag-and-drop.

---

## 3. Caveats

1. **WebGL / Canvas 2D Choice**: The specification recommends standard HTML5 Canvas 2D context with multi-layering as it avoids heavy WebGL engine dependencies (like PixiJS or Babylon) and easily achieves 60 FPS for 2D grids under 200 tokens. If dynamic 3D lighting or complex dynamic shadows are desired in the future, a WebGL renderer may be introduced without changing the token state model.
2. **Audio / SFX**: Sound effects for dice rolls and token movement are not strictly requested in R1-R6, so they are marked as optional polish.
3. **Fog of War Depth**: Basic GM fog of war (hidden tokens) is fully specified; dynamic raycasting line-of-sight is documented as an advanced enhancement.

---

## 4. Conclusion

The specification for the **Dynamic Sheet Builder & Manager (R2)** and **Tactical VTT Combat Grid (R4)** is fully designed, documented, and verified against all criteria of `ORIGINAL_REQUEST.md`.
The complete architectural blueprint, TypeScript interfaces, reactive calculation formulas, range ruler math, initiative lifecycle, and compendium drag-and-drop mechanisms are recorded in `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md`.
This provides the implementation and architecture tracks with an unambiguous, complete reference to build upon in Phase 1 and Phase 2.

---

## 5. Verification Method

1. **Verify Report Existence and Structure**:
   ```bash
   cat /home/usuario/develop/trpg-platform/.agents/teamwork/survey_vtt_3/report.md | head -n 40
   ```
   Check that Sections 1 to 6 are present, including the Features Discovered table (25 features) and Edge Cases table (16 edge cases).
2. **Verify Acceptance Criteria Coverage**:
   Inspect `report.md` against `ORIGINAL_REQUEST.md` lines 50-68:
   - T20 & TRPG sheet creation & reactive recalculations (Sections 1.1 & 1.2).
   - Real-time PV/PM adjustments and status conditions (Section 1.3).
   - Direct-click action roll payloads (Section 1.4).
   - 1.5m / 5ft tactical grid and coordinate conversions (Section 2.1).
   - Token sizing, overlays, and movement (Section 2.3).
   - Chebyshev vs 5/10/5 distance ruler and range bands (Section 2.4).
   - Initiative tracker ordering, ties, and round counter (Section 2.5).
   - Compendium drag-and-drop to sheet and VTT canvas (Section 3).
3. **Invalidation Conditions**:
   - The specification is invalidated if Tormenta 20 rules change the 1.5m cell scale or the trained skill bonus progression (+2/+4/+6).
   - The specification is invalidated if the project drops the dual-system requirement (T20 + TRPG).
