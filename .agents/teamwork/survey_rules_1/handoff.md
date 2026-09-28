# Handoff Report: TRPG Rules & Dice Systems Spec Miner

**Role**: TRPG Rules Spec Miner  
**Working Directory**: `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1`  
**Handoff Type**: Hard (Task Complete)  
**Parent Conversation ID**: `135ea200-054c-446a-ac5d-f7b1e25b17f3`  

---

## 1. Observation
- Inspected `/home/usuario/develop/trpg-platform/.agents/teamwork/ORIGINAL_REQUEST.md`:
  - Lines 14–15 (R1): "Implementar uma arquitetura de regras modular e declarativa que encapsule as diferenças entre Tormenta 20 (atributos baseados em modificadores diretos, sistema de Pontos de Mana para habilidades e magias, perícias treinadas por nível, poderes gerais) e Tormenta RPG clássico (atributos 3-18 com modificadores clássicos d20, magias por nível/círculo tradicional, bônus base de ataque e graduações de perícia)..."
  - Lines 20–25 (R3): "Mecanismo integrado de resolução de dados com suporte à notação d20 do sistema Tormenta: Testes de atributos e perícias com cálculo automático de margem de sucesso; Detecção nativa de Acertos Críticos (19-20/x3) e Falhas Críticas (1 natural); Fórmulas de dano com multiplicadores e dados extras..."
  - Lines 34–35 (R5): "Compêndio de regras interativo com dados básicos pré-carregados de exemplo (raças, classes, magias fundamentais, poderes e itens de T20/TRPG)..."
  - Lines 49–54 (Acceptance Criteria): "Ficha de T20 calcula automaticamente perícias com base em: Treinamento + Metade do Nível + Modificador do Atributo + outros bônus; Ficha de TRPG clássico respeita atributos clássicos (ex: Força 16 -> Mod +3) e graduações/BBA..."
- Inspected `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/DISPATCH.md`:
  - Defined explicit scope covering attribute systems, resource pools (PV/PM), defense/CA, skills calculations, powers vs feats, dice roller notation, criticals, and compendium data schemas with minimum 10 items.
- Generated comprehensive report at `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md` (668 lines) containing formal math models, TypeScript interfaces, 18 discovered features, 12 edge cases, and 12 canonical sample items across both editions.

---

## 2. Logic Chain
1. **Multi-System Differentiation**:
   - In Tormenta 20 (Edição Jogo do Ano), character attributes are direct modifiers (typically -1 to +4 base) and the 3-18 scores no longer exist. In contrast, Tormenta RPG Clássico preserves the 3-18 score scale and derives modifiers via $\lfloor (Score - 10) / 2 \rfloor$.
   - A unified schema must allow polymorphic attribute storage: T20 stores raw modifiers directly, whereas TRPG stores integer scores and exposes a pure calculation function for modifiers.
2. **Resource Pools (PV and PM)**:
   - T20 eliminates randomized HP on level up: every level gives a fixed amount based on class plus Constitution modifier ($\max(1, \text{Base} + \text{CON})$).
   - T20 unifies all magic and abilities under Pontos de Mana (PM), constrained strictly by the "Limite de Gastos de PM" rule: a character cannot spend more PM on any single ability/spell than their character level.
   - TRPG uses hit dice (or average hit dice) and either traditional Vancian spell slots (9 circles + bonus slots for high attributes) or the *Manual do Arcano* PM formula ($\text{PM} = 2 \times \text{Círculo} - 1$).
3. **Defense and Attack Resolution**:
   - In T20, player characters do NOT add half-level to Defesa. Defesa is $10 + \text{DES} + \text{Armor} + \text{Shield} + \text{Powers}$. Equipping heavy armor sets the Dex bonus to zero (+0).
   - In TRPG, CA is $10 + \lfloor \frac{\text{Level}}{2} \rfloor + \text{DES (capped by MaxDex)} + \text{Armor} + \text{Shield} + \text{Size}$.
   - T20 has NO Base Attack Bonus (BBA); attacks are skill checks using *Luta* (melee) or *Pontaria* (ranged). TRPG retains standard d20 BBA (Good, Medium, Poor progressions).
4. **Skills Modeling**:
   - T20 eliminates skill ranks and skill points. Every skill bonus is $\lfloor \frac{\text{Level}}{2} \rfloor + \text{Attr Mod} + \text{Training Bonus} - \text{Armor Penalty}$. Training bonus is tiered: $+2$ (levels 1-6), $+4$ (levels 7-14), and $+6$ (levels 15-20). 10 of the 29 canonical skills are "Somente Treinada" (disallowed if untrained).
   - TRPG uses classic skill points and graduações (max $\text{Level} + 3$ for class skills).
5. **Dice Roller & Criticals**:
   - In T20, there is no critical confirmation roll. Any attack with a natural roll $\ge \text{Margem de Ameaça}$ that hits target Defense is an automatic critical hit.
   - In T20 critical damage, only the weapon damage dice are multiplied (e.g., $1d8+4$ with crit $x2$ rolls $2d8+4$). In TRPG, flat modifiers are multiplied alongside dice.
6. **Compendium Data Schema**:
   - Designed 6 core entities: `Race`, `Class`, `Spell`, `Power/Feat`, `Equipment`, `Threat`.
   - Seeded 12 full canonical items (Humano, Anão, Guerreiro, Arcanista, Mísseis Mágicos, Bola de Fogo, Curar Ferimentos, Ataque Poderoso, Esquiva, Espada Longa, Cota de Malha, Bugbear Espreitador) satisfying R5 and providing test vectors for the engineering track.

---

## 3. Caveats
- Optional or expanded rule supplements (e.g., *Ameaças de Arton*, *Deuses de Arton*, *Manual do Malandro*) introduce additional specific powers, subclasses, and deities; the report focuses strictly on core canonical rules (*Tormenta 20 Edição Jogo do Ano* and *Tormenta RPG Edição Revisada*), which form the authoritative baseline.
- For TRPG, both Vancian slots and Manual do Arcano PM rules are documented, allowing the implementation team to offer either or both without ambiguity.

---

## 4. Conclusion
The mathematical rules formulas, dual-system modeling, dice roller grammar, critical hit mechanics, and compendium data structures have been completely probed and specified. The resulting documentation in `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md` is exhaustive, unambiguous, and ready for immediate architectural consumption and code generation.

---

## 5. Verification Method
- **Inspect Specification File**:
  - View `/home/usuario/develop/trpg-platform/.agents/teamwork/survey_rules_1/report.md`.
  - Check Section 2 for exact formulas (Attributes, PV/PM, Defense, Skills).
  - Check Section 3 for dice roller grammar and critical multiplier logic.
  - Check Section 4 for complete TypeScript interface definitions.
  - Check Section 5 for the 12 canonical seed items.
  - Check Section 6 for the 18 Features Discovered and 12 Edge Cases.
- **Rule Formula Invalidation Conditions**:
  - If T20 skills are calculated with flat ranks instead of tiered training bonus (+2/+4/+6), this would violate official T20 rules.
  - If T20 Defense adds half-level to player characters, this would violate T20 rules.
  - If T20 PM spending allows exceeding character level on an ability, this would violate T20 rules.
