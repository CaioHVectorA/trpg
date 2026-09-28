# Tormenta Rules & Dice Systems Specification Report
**Platform**: Tormenta 20 (T20 Jogo do Ano) & Tormenta RPG Clássico (TRPG)  
**Author**: TRPG Rules Spec Miner  
**Target Architecture**: Next.js App Router, TypeScript, Prisma/Supabase, Tailwind CSS  
**Date**: 2026-09-27  

---

## 1. Executive Summary

This report establishes the authoritative specification for the rules engine, character sheet calculations, contextual dice roller, and compendium data schemas for the multi-system TRPG Platform. The platform delivers native dual-system support:
1. **Tormenta 20 (T20)** — Based on the official *Edição Jogo do Ano* rules (direct attribute modifiers, universal PM economy, trained skill tiers (+2/+4/+6), no BBA, defense without level scaling for PCs, modular class/general powers, and streamlined critical hits).
2. **Tormenta RPG Clássico (TRPG)** — Based on the *Edição Revisada* d20 system (traditional 3-18 attributes with $(Score - 10) / 2$, Vancian spells per day or PM option, Base Attack Bonus (BBA), skill ranks (graduações), half-level added to CA and saves, and critical threat confirmation rolls).

---

## 2. Multi-System Rules Engine & Mathematical Modeling (R1 & R2)

### 2.1. Attribute System Comparison

| Parameter | Tormenta 20 (T20) | Tormenta RPG Clássico (TRPG) |
| :--- | :--- | :--- |
| **Attribute Set** | FOR, DES, CON, INT, SAB, CAR (6 attributes) | FOR, DES, CON, INT, SAB, CAR (6 attributes) |
| **Representation** | **Direct Modifier Only** (e.g. `+3`, `0`, `-1`) | **Score (3–18+) + Derived Modifier** |
| **Modifier Formula** | $\text{Mod} = \text{AttributeValue}$ | $\text{Mod} = \lfloor \frac{\text{Score} - 10}{2} \rfloor$ |
| **Point Buy Base** | All attributes start at `0`. Player has 10 points. | All scores start at `8`. Player has 20 points. |
| **Point Buy Costs** | `-1` refund +1 pt (max 1); `+1`: 1; `+2`: 2; `+3`: 4; `+4`: 7 | `9`: 1; `10`: 2; `11`: 3; `12`: 4; `13`: 5; `14`: 6; `15`: 8; `16`: 10; `17`: 13; `18`: 16 |
| **Standard Array** | `+3, +2, +1, +1, 0, -1` | `15, 14, 13, 12, 10, 8` |
| **Racial Modifiers** | Applied directly to modifiers (e.g. Anão: CON +2, SAB +1, DES -1) | Applied to scores (e.g. Anão: CON +4, SAB +2, DES -2) |
| **Level Increase** | Purchased via General Power *Aumento de Atributo* (+1 to one attribute) | +1 point to any attribute score at levels 4, 8, 12, 16, 20 |

#### TypeScript Interface: Attributes
```typescript
export type SystemEdition = 'T20' | 'TRPG';

export type AttributeKey = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export interface AttributeDefinition {
  key: AttributeKey;
  name: string;
  shortDescription: string;
}

export interface CharacterAttributesT20 {
  FOR: number; // e.g. 3
  DES: number; // e.g. 1
  CON: number; // e.g. 2
  INT: number; // e.g. 0
  SAB: number; // e.g. -1
  CAR: number; // e.g. 4
}

export interface CharacterAttributesTRPG {
  FOR: number; // e.g. 16 (Mod +3)
  DES: number; // e.g. 12 (Mod +1)
  CON: number; // e.g. 14 (Mod +2)
  INT: number; // e.g. 10 (Mod 0)
  SAB: number; // e.g. 8  (Mod -1)
  CAR: number; // e.g. 18 (Mod +4)
}

export function calculateTRPGModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getAttributeModifier(
  edition: SystemEdition,
  attributes: CharacterAttributesT20 | CharacterAttributesTRPG,
  key: AttributeKey
): number {
  if (edition === 'T20') {
    return attributes[key];
  }
  return calculateTRPGModifier(attributes[key]);
}
```

---

### 2.2. Resource Pools: Hit Points (PV) & Mana Points (PM)

#### A. Pontos de Vida (PV)

##### 1. Tormenta 20 (T20):
- **Level 1**: $\text{PV}_1 = \text{BasePV}_{\text{classe}} + \text{Mod}_{\text{CON}}$
- **Level $N$ ($N \ge 2$)**: 
  $$\text{PV}_N = \text{PV}_1 + (N - 1) \times \max(1, \text{PerLevelPV}_{\text{classe}} + \text{Mod}_{\text{CON}})$$
  *Note*: In T20 Jogo do Ano, HP per level is deterministic. No dice are rolled on level-up.
- **Class PV Constants**:
  - *Arcanista*: Base 8, PerLevel 2
  - *Bardo, Inventor, Ladino*: Base 12, PerLevel 3
  - *Bucaneiro, Caçador, Cavaleiro, Clérigo, Druida, Nobre*: Base 16, PerLevel 4
  - *Guerreiro, Lutador, Paladino*: Base 20, PerLevel 5
  - *Bárbaro*: Base 24, PerLevel 6
- **Death & Dying in T20**:
  - When reduced to $0$ PV, the character becomes **Inconsciente e Sangrando** (Unconscious and Bleeding).
  - At the start of their turn, they must roll a **Fortitude check (DC 15)**:
    - *Success*: Character stabilizes (stops bleeding, stays at 0 PV until treated).
    - *Failure*: Loses $1d6$ PV.
  - **Death**: Character dies immediately if their PV reaches a negative value equal to half of their maximum PV ($-\lfloor \frac{\text{PV}_{\text{max}}}{2} \rfloor$).
    - *Example*: Character with 36 PV max dies at $-18$ PV.

##### 2. Tormenta RPG Clássico (TRPG):
- **Level 1**: $\text{PV}_1 = \text{DadoDeVida}_{\text{max}} + \text{Mod}_{\text{CON}}$
- **Level $N$**: $\text{PV}_N = \text{PV}_1 + \sum_{i=2}^N (\text{DadoDeVida}_{\text{médio ou rolado}} + \text{Mod}_{\text{CON}})$
  - Mago/Feiticeiro: d4 (or d6 in revised)
  - Bardo/Ladino/Swashbuckler: d6
  - Clérigo/Druida/Monge/Ranger: d8
  - Guerreiro/Paladino: d10
  - Bárbaro: d12
- **Death in TRPG**: Character dies when negative PV equals their Constitution score or $-10$ (whichever is lower).

#### B. Pontos de Mana (PM)

##### 1. Tormenta 20 (T20):
- Universal resource spent on spells, maneuvers, class powers, and enhancements.
- **Level 1**: $\text{PM}_1 = \text{BasePM}_{\text{classe}} + \text{Mod}_{\text{Atributo-Chave}}$
  - *Arcanista*: 6 + INT (Mago/Bruxo) or CAR (Feiticeiro)
  - *Clérigo*: 5 + SAB
  - *Druida, Bardo, Inventor, Nobre*: 4 + Atributo-Chave (SAB/CAR/INT)
  - *Paladino*: 3 + CAR
  - *Bárbaro, Bucaneiro, Caçador, Cavaleiro, Guerreiro, Ladino, Lutador*: 3 PM (flat)
- **Level $N$ ($N \ge 2$)**: $\text{PM}_N = \text{PM}_1 + (N - 1) \times \text{PerLevelPM}_{\text{classe}}$
  - Arcanista: +6/level
  - Clérigo: +5/level
  - Druida, Bardo, Inventor, Nobre: +4/level
  - Demais classes: +3/level
- **CRITICAL RULE — Mana Spending Limit (Limite de Gastos de PM)**:
  $$\text{Gasto Máximo de PM por Ação/Habilidade} = \text{Nível do Personagem (ou Nível na Classe)}$$
  - *Example*: A 3rd-level Guerreiro cannot spend more than 3 PM on *Ataque Especial* in a single attack.
  - A 5th-level Arcanista casting *Bola de Fogo* (cost 3 PM) can spend at most +2 PM on enhancements (total 5 PM).
- **PM Restoration via Rest (Descanso de 8h)**:
  - *Ruim*: Recovers $1 \times \text{Nível}$ PV & PM with Fortitude DC 15 (or half on failure).
  - *Normal*: Recovers $1 \times \text{Nível}$ PV & PM.
  - *Confortável*: Recovers $2 \times \text{Nível}$ PV & PM.
  - *Luxuoso*: Recovers $3 \times \text{Nível}$ PV & PM.

##### 2. Tormenta RPG Clássico (TRPG):
- **Vancian Mode**: Spells per day per circle (0º to 9º), calculated from Class Level + Bonus spell slots for high attribute:
  $$\text{Slots Bônus Círculo } C \iff \text{Mod}_{\text{Atributo}} \ge C \text{ (progressão clássica d20)}$$
- **Manual do Arcano PM Mode**:
  $$\text{Custo em PM} = 2 \times \text{Círculo} - 1 \quad (\text{para círculos } 1 \text{ a } 9; \text{Truques } 0\text{ PM})$$

---

### 2.3. Defense & Armor Class (Defesa vs CA)

| Component | Tormenta 20 (Defesa) | Tormenta RPG Clássico (CA) |
| :--- | :--- | :--- |
| **Base Value** | **10** | **10** |
| **Half-Level** | **NO** (PCs do NOT add half-level to Defesa!) | **YES** ($\lfloor \frac{\text{Nível}}{2} \rfloor$) |
| **Dexterity** | Added in full for light armor / unarmored. **Zero (+0) for heavy armor**. | Added up to **Destreza Máxima** of the armor. |
| **Armor Bonus** | Added from equipped armor. | Added from equipped armor. |
| **Shield Bonus** | Light (+1), Heavy (+2). | Light (+1), Heavy (+2), Tower (+4). |
| **Size Mod** | Applied only if specified by size category. | Pequeno (+1), Médio (0), Grande (-1), etc. |
| **Formula** | $10 + \text{Mod}_{\text{DES}}^* + \text{Bônus}_{\text{Armadura}} + \text{Bônus}_{\text{Escudo}} + \text{Outros}$ | $10 + \lfloor \frac{\text{Nível}}{2} \rfloor + \min(\text{Mod}_{\text{DES}}, \text{DesMax}) + \text{Armadura} + \text{Escudo} + \text{Tamanho} + \dots$ |
| **Attack vs Target** | Hits if $\text{Ataque} \ge \text{Defesa}$. Tie hits! | Hits if $\text{Ataque} \ge \text{CA}$. Tie hits! |
| **Armor Check Penalty** | Penalizes: **Acrobacia, Furtividade, Ladinagem**. | Penalizes: Acrobacia, Arte da Fuga, Atletismo, Furtividade, Ladinagem, Operar Mecanismo. |

---

### 2.4. Skills (Perícias)

#### A. Tormenta 20 Skill Formula
In T20, skill points and ranks are completely abolished. Every skill check follows:
$$\text{Bônus Total} = \lfloor \frac{\text{Nível}}{2} \rfloor + \text{Mod}_{\text{Atributo}} + \text{Bônus de Treinamento} + \text{Outros Modificadores} - \text{Penalidade de Armadura}$$

Where:
- **Metade do Nível**: $\lfloor \frac{\text{Nível}}{2} \rfloor$ (Level 1: 0; Level 2-3: 1; Level 4-5: 2; ... Level 20: 10).
- **Bônus de Treinamento**:
  - Se **Não Treinada**: $+0$
  - Se **Treinada**:
    - Nível 1 a 6: **+2**
    - Nível 7 a 14: **+4**
    - Nível 15 a 20: **+6**
- **Canonical Skill List (29 Skills)**:
  1. *Acrobacia* (DES, Penalidade)
  2. *Adestramento* (CAR, Somente Treinada)
  3. *Atletismo* (FOR)
  4. *Atuação* (CAR)
  5. *Cavalgar* (DES)
  6. *Conhecimento* (INT, Somente Treinada)
  7. *Cura* (SAB)
  8. *Diplomacia* (CAR)
  9. *Enganação* (CAR)
  10. *Fortitude* (CON, Resistência)
  11. *Furtividade* (DES, Penalidade)
  12. *Guerra* (INT, Somente Treinada)
  13. *Iniciativa* (DES)
  14. *Intimidação* (CAR)
  15. *Intuição* (SAB)
  16. *Investigação* (INT)
  17. *Jogatina* (CAR, Somente Treinada)
  18. *Ladinagem* (DES, Somente Treinada, Penalidade)
  19. *Luta* (FOR, Perícia de Combate Corpo a Corpo)
  20. *Misticismo* (INT, Somente Treinada)
  21. *Nobreza* (INT, Somente Treinada)
  22. *Ofício* (INT, Somente Treinada)
  23. *Percepção* (SAB)
  24. *Pilotagem* (DES, Somente Treinada)
  25. *Pontaria* (DES, Perícia de Combate à Distância)
  26. *Reflexos* (DES, Resistência)
  27. *Religião* (SAB, Somente Treinada)
  28. *Sobrevivência* (SAB)
  29. *Vontade* (SAB, Resistência)

#### B. Tormenta RPG Clássico Skill Formula
$$\text{Bônus Total} = \text{Graduações} + \text{Mod}_{\text{Atributo}} + \text{Bônus de Raça/Talento} - \text{Penalidade de Armadura}$$
- Ranks Max: $\text{Nível} + 3$ (Class skills) or $\frac{\text{Nível} + 3}{2}$ (Cross-class).
- Skill Points at 1st level: $(\text{BaseClasse} + \text{Mod}_{\text{INT}}) \times 4$.
- Skill Points per level: $\text{BaseClasse} + \text{Mod}_{\text{INT}}$.

---

### 2.5. Attack Rolls & BBA vs Perícias de Combate

#### Tormenta 20:
- BBA does not exist. Attacks are skill checks:
  - **Ataque Corpo a Corpo**: Teste de **Luta** (`1d20 + Luta`).
    $$\text{Luta} = \lfloor \frac{\text{Nível}}{2} \rfloor + \text{Mod}_{\text{FOR}} + \text{Treino} (+2/+4/+6) + \dots$$
    *(Can use $\text{Mod}_{\text{DES}}$ if using light weapon with power Acuidade com Arma).*
  - **Ataque à Distância**: Teste de **Pontaria** (`1d20 + Pontaria`).
    $$\text{Pontaria} = \lfloor \frac{\text{Nível}}{2} \rfloor + \text{Mod}_{\text{DES}} + \text{Treino} (+2/+4/+6) + \dots$$

#### Tormenta RPG Clássico:
- Uses Base Attack Bonus (BBA):
  - High BBA (Guerreiro, Paladino): $+1 \times \text{Nível}$.
  - Medium BBA (Clérigo, Ladino, Bardo): $\lfloor 0.75 \times \text{Nível} \rfloor$.
  - Low BBA (Mago, Feiticeiro): $\lfloor 0.5 \times \text{Nível} \rfloor$.
  - Melee: $1d20 + \text{BBA} + \text{Mod}_{\text{FOR}} + \text{Mod}_{\text{Tamanho}} + \text{Outros}$.
  - Ranged: $1d20 + \text{BBA} + \text{Mod}_{\text{DES}} + \text{Mod}_{\text{Tamanho}} + \text{Outros}$.
  - Multiple Attacks: Iterative attacks when BBA reaches $+6/+1$, $+11/+6/+1$, $+16/+11/+6/+1$ during full attack.

---

## 3. Contextual Dice Roller & Combat Mechanics (R3)

### 3.1. Dice Roller Expression Grammar

The dice engine supports the standard TRPG/d20 syntax with comments and contextual flags:
```text
Expression      := RollTerm (('+' | '-') RollTerm)* ('#' Comment)?
RollTerm        := DiceRoll | Number
DiceRoll        := (Count)? 'd' Sides (DiceKeep)?
DiceKeep        := ('kh' | 'kl') Number
Count           := [1-9][0-9]*
Sides           := [1-9][0-9]*
Number          := [0-9]+
Comment         := AnyText
```

#### Supported Examples:
- `1d20+7` (Test of skill or attack)
- `1d20+10 # Ataque Espada Longa` (Attack with descriptive tag)
- `2d6+4 # Dano Espada Grande` (Damage roll with tag)
- `2d20kh1+5 # Teste com Vantagem` (Roll two d20s, keep highest)
- `2d20kl1+3 # Teste com Desvantagem` (Roll two d20s, keep lowest)
- `1d8+1d6+4` (Complex multi-die damage)

---

### 3.2. Threat Ranges, Criticals, and Automatic Outcomes

#### A. Natural 20 & Natural 1 Rules

| Roll Result | Attack Roll (T20 & TRPG) | Saving Throw (Resistência) | Skill Check (Perícia) |
| :--- | :--- | :--- | :--- |
| **Natural 20** | **Automatic Hit** (Acerto Automático). Triggers Critical if $\ge$ Threat Range. | **Automatic Success** (Sucesso Automático). | High result ($20 + \text{Bônus}$). (No auto-crit unless heroic house rule). |
| **Natural 1** | **Automatic Failure** (Falha Automática). Misses regardless of bonus. | **Automatic Failure** (Falha Automática). Suffers full effect. | Low result ($1 + \text{Bônus}$). Fails if total $< \text{CD}$. |

#### B. Threat Range (Margem de Ameaça)
- Default: `20`.
- Weapon examples:
  - Adaga: `19-20/x2`
  - Cimitarra: `18-20/x2`
  - Espada Longa: `19-20/x2`
  - Machado de Batalha: `20/x3`
  - Foice: `20/x4`
- Modifiers to Threat Range:
  - Powers like *Ataque Preciso* increase threat range by $+1$ (e.g. 19 becomes 18).
  - Enhancements like *Aço-Rubi* or *Macabro* grant threat range expansion.
- **Critical Hit Confirmation**:
  - **Tormenta 20**: **NO CONFIRMATION ROLL**. If the natural roll is $\ge \text{Margem de Ameaça}$ AND the total attack $\ge \text{Defesa}$, it is an immediate critical hit.
  - **Tormenta RPG**: **REQUIRES CONFIRMATION ROLL**. If natural roll $\ge \text{Margem de Ameaça}$, player must immediately roll a confirmation attack using the exact same modifiers against the target's CA. If the confirmation hits, it is a critical hit; if it misses, it is a normal hit.

#### C. Critical Damage Multiplication
- **Tormenta 20 Rule**:
  Only the weapon's base damage dice are multiplied! Flat numerical bonuses (+Força, +Especialização) and extra precision dice (+Ataque Furtivo) are **NOT** multiplied.
  $$\text{Dano Crítico T20} = (\text{QtdDados} \times \text{Multiplicador})d(\text{Lados}) + \text{Mod}_{\text{Atributo}} + \text{Bônus Estáticos}$$
  - *Example 1*: Espada Longa ($1d8+4$, crit $19/x2$) on critical deals:
    $$2d8 + 4$$
  - *Example 2*: Machado de Guerra ($1d12+5$, crit $20/x3$) on critical deals:
    $$3d12 + 5$$
  - *Example 3*: Foice ($1d6+3$, crit $20/x4$) on critical deals:
    $$4d6 + 3$$
- **Tormenta RPG Rule**:
  Multiplies both dice and flat modifiers by the multiplier, excluding extra elemental/precision dice:
  $$\text{Dano Crítico TRPG} = (1d8 + 4) \times 2 = 2d8 + 8$$

---

### 3.3. Damage Scaling & PM Enhancements

In Tormenta 20, spells and abilities scale by spending additional PM, capped at the character's level:
- **Ataque Especial (Guerreiro)**:
  - Base (1 PM): $+4$ on attack OR $+4$ on damage.
  - Scaling: For each extra $+1$ PM (up to level limit), add $+4$ bonus (can distribute between attack and damage in increments of 4).
- **Mísseis Mágicos (Arcanista)**:
  - Base (1 PM): Fires 2 missiles dealing $1d4+1$ each ($2d4+2$).
  - Aprimoramento (+2 PM): Fires $+1$ missile ($1d4+1$).
- **Bola de Fogo (Arcanista)**:
  - Base (3 PM): $6d6$ fire damage in a 6m radius sphere, Reflex half.
  - Aprimoramento (+2 PM): Increases damage by $+2d6$.
  - Aprimoramento (+1 PM): Increases saving throw DC by $+1$.

---

## 4. Compendium Data Schemas (R5)

To support both T20 and TRPG seamlessly, the compendium data models use polymorphic typing with shared metadata and system-specific payload fields.

### 4.1. TypeScript Schemas

```typescript
// Shared Compendium Item Metadata
export interface BaseCompendiumEntry {
  id: string;
  name: string;
  system: SystemEdition; // 'T20' | 'TRPG'
  description: string;
  source: string; // e.g. "Tormenta 20 - Edição Jogo do Ano, p. 54"
}

// 1. Race Schema
export interface CompendiumRace extends BaseCompendiumEntry {
  type: 'race';
  attributeModifiers: Record<AttributeKey, number>;
  size: 'MINUSCULO' | 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'ENORME' | 'COLOSSAL';
  speedMeters: number; // e.g. 9m (6 squares)
  racialAbilities: Array<{
    name: string;
    description: string;
    pmCost?: number;
  }>;
}

// 2. Class Schema
export interface CompendiumClass extends BaseCompendiumEntry {
  type: 'class';
  basePV: number;
  pvPerLevel: number;
  basePM: number;
  pmPerLevel: number;
  keyAttribute: AttributeKey;
  trainedSkillsCount: number;
  mandatorySkills: string[];
  selectableSkills: string[];
  proficiencies: string[];
  classFeatures: Array<{
    name: string;
    level: number;
    description: string;
    pmCost?: number;
  }>;
}

// 3. Spell Schema
export interface CompendiumSpell extends BaseCompendiumEntry {
  type: 'spell';
  circle: number; // 1 to 5 (T20) or 1 to 9 (TRPG)
  school: 'Abjuração' | 'Adivinhação' | 'Convocação' | 'Encantamento' | 'Evocação' | 'Ilusão' | 'Necromancia' | 'Transmutação';
  executionTime: 'Padrão' | 'Movimento' | 'Livre' | 'Reação' | 'Completa';
  range: 'Pessoal' | 'Toque' | 'Curto' | 'Médio' | 'Longo' | string;
  targetOrArea: string;
  duration: 'Instantânea' | 'Cena' | 'Sustentada' | string;
  savingThrow?: {
    type: 'Fortitude' | 'Reflexos' | 'Vontade';
    effect: 'Anula' | 'Parcial' | 'Metade';
  };
  basePMCost: number;
  enhancements?: Array<{
    pmCost: number;
    description: string;
    isCumulative: boolean;
  }>;
}

// 4. Power / Feat Schema
export interface CompendiumPower extends BaseCompendiumEntry {
  type: 'power'; // T20 Poder or TRPG Talento
  category: 'Combate' | 'Destino' | 'Magia' | 'Concedido' | 'Tormenta' | 'Classe';
  prerequisites: Array<{
    type: 'level' | 'attribute' | 'skill' | 'power' | 'other';
    target: string;
    value: number | string;
  }>;
  pmCost?: number;
  actionType?: 'Passiva' | 'Livre' | 'Padrão' | 'Reação';
}

// 5. Equipment Schema
export type EquipmentCategory = 'Arma' | 'Armadura' | 'Escudo' | 'Item Geral' | 'Item Mágico';

export interface CompendiumEquipment extends BaseCompendiumEntry {
  type: 'equipment';
  category: EquipmentCategory;
  priceGold: number;
  weightSlots: number; // Espaço em T20 ou Peso em kg no TRPG
  weaponData?: {
    damageDice: string; // e.g. "1d8"
    damageType: 'Corte' | 'Perfuração' | 'Impacto' | 'Fogo' | 'Frio' | 'Eletricidade' | 'Ácido' | 'Essência';
    threatRange: number; // e.g. 19 for 19-20
    critMultiplier: number; // e.g. 2 for x2, 3 for x3
    rangeType: 'Corpo a Corpo' | 'Arremesso' | 'Disparo';
    rangeCategory?: 'Curto' | 'Médio' | 'Longo';
    grip: 'Leve' | 'Uma Mão' | 'Duas Mãos';
  };
  armorData?: {
    defenseBonus: number;
    armorPenalty: number;
    isHeavy: boolean;
    maxDexterityBonus?: number; // Only for TRPG
  };
}

// 6. Threat / Monster Schema
export interface CompendiumThreat extends BaseCompendiumEntry {
  type: 'threat';
  challengeRating: number; // ND (0.25, 0.5, 1, 2, 3...)
  creatureType: 'Humanoide' | 'Monstro' | 'Morto-Vivo' | 'Construto' | 'Animal' | 'Espírito' | 'Lefeu';
  size: 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'ENORME' | 'COLOSSAL';
  defense: number;
  pv: number;
  pm: number;
  speedMeters: number;
  attributes: Record<AttributeKey, number>;
  senses: {
    perception: number;
    initiative: number;
    specialVision?: string;
  };
  resistances: string;
  attacks: Array<{
    name: string;
    attackBonus: number;
    damageDice: string;
    damageType: string;
    threatRange: number;
    critMultiplier: number;
    specialEffect?: string;
  }>;
  specialAbilities: Array<{
    name: string;
    description: string;
    pmCost?: number;
  }>;
}
```

---

## 5. Canonical Compendium Dataset (Minimum Sample Set: 12 Entries)

Below is the verified sample set covering both T20 and TRPG across all categories:

### 1. Raça: Humano (T20)
- **ID**: `race-humano-t20`
- **Atributos**: Três atributos diferentes à escolha do jogador recebem $+1$.
- **Tamanho**: Médio (Deslocamento 9m / 6 quadrados).
- **Habilidades de Raça**:
  - *Versátil*: Você se torna treinado em duas perícias à sua escolha (não precisam ser da sua classe) ou ganha um poder geral à sua escolha.

### 2. Raça: Anão (T20 & TRPG)
- **ID**: `race-anao-t20`
- **Atributos (T20)**: CON $+2$, SAB $+1$, DES $-1$.
- **Atributos (TRPG)**: CON $+4$, SAB $+2$, DES $-2$.
- **Tamanho**: Médio (Deslocamento 6m / 4 quadrados, nunca reduzido por uso de armaduras pesadas).
- **Habilidades de Raça**:
  - *Conhecimento das Rochas*: Recebe visão no escuro e $+2$ em testes de Percepção no subterrâneo.
  - *Devagar e Sempre*: Deslocamento base é 6m, mas não é reduzido por carga pesada ou armadura pesada.
  - *Tradição de Heredrimm*: Proficiência com machados e martelos; trata machado de guerra e martelo de guerra como armas marciais.

### 3. Classe: Guerreiro (T20)
- **ID**: `class-guerreiro-t20`
- **PV Inicial**: $20 + \text{Mod CON}$; **PV por Nível**: $5 + \text{Mod CON}$.
- **PM Inicial**: $3$; **PM por Nível**: $3$.
- **Perícias**: Luta ou Pontaria, Fortitude, mais 2 a escolher entre Adestramento, Atletismo, Cavalgar, Iniciativa, Intimidação, Ofício, Percepção, Reflexos.
- **Proficiências**: Armas marciais, armaduras pesadas e escudos.
- **Habilidade Nível 1**: *Ataque Especial* (1 PM): Quando faz um ataque, você pode gastar 1 PM para receber $+4$ no teste de ataque ou $+4$ na rolagem de dano. A cada quatro níveis, pode gastar $+1$ PM para aumentar o bônus em $+4$.

### 4. Classe: Arcanista (T20)
- **ID**: `class-arcanista-t20`
- **PV Inicial**: $8 + \text{Mod CON}$; **PV por Nível**: $2 + \text{Mod CON}$.
- **PM Inicial**: $6 + \text{Mod Chave}$ (INT ou CAR); **PM por Nível**: $6$.
- **Perícias**: Misticismo, Vontade, mais 2 a escolher entre Conhecimento, Iniciativa, Percepção, Ofício, Nobreza.
- **Proficiências**: Armas simples.
- **Caminhos**: Bruxo (Foco arcano), Feiticeiro (Linhagem sobrenatural), Mago (Grimório de magias).

### 5. Magia: Mísseis Mágicos (T20)
- **ID**: `spell-misseis-magicos-t20`
- **Círculo**: 1º (Evocação).
- **Execução**: Ação Padrão. **Alcance**: Médio. **Alvo**: Até 2 criaturas. **Duração**: Instantânea.
- **Custo Base**: 1 PM.
- **Efeito**: Dispara dois dardos de energia mágica pura que acertam automaticamente os alvos escolhidos. Cada dardo causa $1d4+1$ pontos de dano de Essência.
- **Aprimoramentos**:
  - `+2 PM`: Dispara $+1$ dardo adicional ($1d4+1$).
  - `+2 PM`: Muda a duração para sustentada. Uma vez por rodada, como uma ação livre, você pode disparar um dardo adicional.

### 6. Magia: Bola de Fogo (T20)
- **ID**: `spell-bola-de-fogo-t20`
- **Círculo**: 2º (Evocação).
- **Execução**: Ação Padrão. **Alcance**: Médio. **Área**: Esfera de 6m de raio. **Duração**: Instantânea. **Resistência**: Reflexos reduz à metade.
- **Custo Base**: 3 PM.
- **Efeito**: Uma explosão ardente que causa $6d6$ pontos de dano de fogo a todas as criaturas na área.
- **Aprimoramentos**:
  - `+2 PM`: Aumenta o dano em $+2d6$.
  - `+1 PM`: Aumenta a CD do teste de resistência em $+1$.

### 7. Magia: Curar Ferimentos (T20 / TRPG)
- **ID**: `spell-curar-ferimentos-t20`
- **Círculo**: 1º (Evocação/Divina).
- **Execução**: Ação Padrão. **Alcance**: Toque. **Alvo**: 1 criatura. **Duração**: Instantânea.
- **Custo Base**: 1 PM (ou magia de 1º círculo em TRPG).
- **Efeito**: Canaliza energia positiva curando $2d8+2$ PV na criatura tocada (ou causa esse mesmo dano em mortos-vivos com teste de Vontade para metade).
- **Aprimoramentos (T20)**:
  - `+2 PM`: Aumenta a cura em $+1d8+1$.
  - `+1 PM`: Muda o alcance para curto.

### 8. Poder Geral: Ataque Poderoso (T20)
- **ID**: `power-ataque-poderoso-t20`
- **Categoria**: Combate.
- **Pré-requisitos**: FOR 1 (ou FOR 13 em TRPG).
- **Efeito**: Ao declarar um ataque corpo a corpo, você pode sofrer $-2$ no teste de ataque para causar $+5$ na rolagem de dano (ou $+10$ se estiver empunhando uma arma de duas mãos).

### 9. Poder Geral: Esquiva (T20)
- **ID**: `power-esquiva-t20`
- **Categoria**: Combate.
- **Pré-requisitos**: DES 1 (ou DES 13 em TRPG).
- **Efeito**: Você recebe $+1$ na Defesa e $+1$ em Reflexos.

### 10. Equipamento: Espada Longa (T20 / TRPG)
- **ID**: `item-espada-longa`
- **Categoria**: Arma Marcial de Uma Mão.
- **Preço**: 15 T$ (Tibares).
- **Dano**: $1d8$ de Corte.
- **Margem de Ameaça / Crítico**: $19-20 / \times 2$.
- **Espaço / Peso**: 1 espaço (ou 2 kg em TRPG).

### 11. Equipamento: Cota de Malha (T20 / TRPG)
- **ID**: `item-cota-de-malha`
- **Categoria**: Armadura Pesada.
- **Preço**: 150 T$.
- **Bônus de Defesa / CA**: $+6$.
- **Penalidade de Armadura**: $-2$.
- **Restrição de Destreza**: Não permite somar bônus de Destreza na Defesa (T20); Destreza Máxima $+2$ (TRPG).

### 12. Ameaça: Bugbear Espreitador (T20)
- **ID**: `threat-bugbear-t20`
- **ND**: 2 (Humanoide Médio).
- **Defesa**: 16. **PV**: 45. **PM**: 10. **Deslocamento**: 9m.
- **Atributos**: FOR $+3$, DES $+2$, CON $+2$, INT $-1$, SAB $+1$, CAR $-1$.
- **Percepção**: $+5$, Visão no Escuro. **Iniciativa**: $+6$.
- **Ataque Corpo a Corpo**: Maça Estrela $+9$ ($1d8+5$, $20/\times 3$).
- **Ataque à Distância**: Azagaia $+8$ ($1d6+3$, $20/\times 2$, alcance curto).
- **Habilidades Especiais**:
  - *Emboscador*: Se atacar uma criatura desprevenida na primeira rodada de combate, causa $+2d6$ pontos de dano extra.

---

## 6. Authoritative Tables

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Attribute Engine | T20 Direct Attribute Modifiers | Attributes represent direct integer modifiers (-1 to +4 base). No score-to-modifier conversion needed. | Attribute values (FOR, DES, CON, INT, SAB, CAR) | Direct modifier integers | Rejects non-integer or out-of-bounds generation values | Official T20 Jogo do Ano Chapter 1 |
| 2 | Attribute Engine | TRPG Classic 3-18 Scores | Attributes are 3-18 integers converted via $\lfloor (S-10)/2 \rfloor$. | Scores 1 to 30+ | Calculated modifier $(-5 \dots +10)$ | Negative score disallowed | Tormenta RPG Revisado Chapter 1 |
| 3 | Resource Engine | T20 Fixed PV Progression | PV on level up is deterministic (Base/Class + CON), no rolling. | Level, Class, CON mod | Total max PV | Negative CON cannot reduce level gain below 1 PV | T20 Jogo do Ano Chapter 1 & 2 |
| 4 | Resource Engine | T20 Universal PM Pool | Single mana pool for spells, powers, and maneuvers. | Level, Class, Key Stat mod | Current and Max PM | Spending cannot exceed current character level | T20 Jogo do Ano Chapter 1, 2, 4 |
| 5 | Resource Engine | PM Spending Limit Check | Enforces that no action/power spends more PM than character level. | Character Level, Requested PM expenditure | Boolean allow/deny + clamped max | Throws validation error if `spentPM > characterLevel` | T20 Core Rule "Limite de Gastos de PM" |
| 6 | Defense Engine | T20 Defense Calculation | $10 + \text{DES}^* + \text{Armor} + \text{Shield} + \text{Powers}$. Half level is NOT added for PCs. Heavy armor zeroes DEX. | Armor, Shield, DEX mod, Powers, IsHeavyArmor | Calculated Defense integer | If heavy armor equipped, DEX modifier forced to 0 | T20 Jogo do Ano Chapter 3 |
| 7 | Defense Engine | TRPG Armor Class (CA) | $10 + \lfloor \text{Level}/2 \rfloor + \min(\text{DES}, \text{MaxDex}) + \text{Armor} + \text{Shield} + \text{Size}$. | Level, DEX mod, MaxDex, Armor, Shield, Size | Calculated CA integer | DEX capped at MaxDex if positive; negative DEX applies in full | Tormenta RPG Revisado Chapter 9 |
| 8 | Skill Engine | T20 Tiered Training Bonus | Skills add $\lfloor \text{Level}/2 \rfloor + \text{Attr} + \text{Train} - \text{ArmorPenalty}$. Train bonus is +2 (lvl 1-6), +4 (7-14), +6 (15-20). | Skill Key, Level, Attr Mod, IsTrained, ArmorPenalty | Total skill check modifier | Untrained use of "Somente Treinada" skills blocked | T20 Jogo do Ano Chapter 2 |
| 9 | Skill Engine | TRPG Graduações (Ranks) | Skills add Ranks + Attr Mod + Misc - ArmorPenalty. | Ranks, Level, IsClassSkill, Attr Mod | Total skill modifier | Ranks cannot exceed Level + 3 | Tormenta RPG Revisado Chapter 4 |
| 10 | Combat Engine | T20 Skill Attacks (Luta & Pontaria) | Abolishes BBA. Melee attack uses Luta check; ranged uses Pontaria check. | 1d20 + Luta/Pontaria total bonus | Attack result vs Defense | Ties hit defender | T20 Jogo do Ano Chapter 5 |
| 11 | Combat Engine | TRPG Base Attack Bonus (BBA) | Uses classical High (+1/lvl), Med (+0.75/lvl), Low (+0.5/lvl) BBA. | Level, Class BBA tier | Attack bonus, multiple attack thresholds | Iterative attacks require full attack action | Tormenta RPG Revisado Chapter 9 |
| 12 | Dice Engine | d20 Notation Parser | Parses expressions like `1d20+7`, `2d6+4`, `2d20kh1`, `# label`. | Expression string | Evaluated total, rolled dice list, label | Invalid syntax returns descriptive parse error | Platform R3 Specification |
| 13 | Combat Engine | Threat Range Detection | Identifies critical threat when natural d20 $\ge$ weapon threat range. | Natural d20, Weapon threat range (e.g. 19) | IsCriticalThreat flag (boolean) | Natural 20 is always a threat | T20/TRPG Combat Rules |
| 14 | Combat Engine | T20 Auto-Crit (No Confirmation) | In T20, any attack meeting threat range and hitting defense is critical immediately. | Threat flag, Attack Total, Target Defense | IsCriticalHit boolean | If total misses defense, critical is cancelled (unless Nat 20) | T20 Jogo do Ano Combat Rules |
| 15 | Combat Engine | TRPG Critical Confirmation | In TRPG, threat requires a second attack roll to confirm critical. | Threat flag, Confirmation roll, Target CA | IsCriticalHit boolean | Failed confirmation results in normal hit | Tormenta RPG Revisado Combat Rules |
| 16 | Combat Engine | T20 Critical Dice Multiplication | Multiplies only weapon base damage dice by multiplier ($x2, x3, x4$). Flat modifiers are NOT multiplied. | Damage dice, Multiplier, Flat bonus | Formula: $(\text{Dice} \times \text{Mult}) + \text{Bonus}$ | Precision/elemental extra dice not multiplied | T20 Jogo do Ano Combat Rules |
| 17 | Rest Engine | T20 Rest & Recovery Tiers | Recovers PV and PM according to rest condition: Ruim ($1\times$), Normal ($1\times$), Confortável ($2\times$), Luxuoso ($3\times$). | Rest condition tier, Character Level | Recovered PV and PM values | Cannot exceed max PV and max PM | T20 Jogo do Ano Chapter 5 |
| 18 | Compendium | Unified Dual-System Schema | Polymorphic data models for Races, Classes, Spells, Powers, Items, Threats across T20 & TRPG. | System type ('T20' or 'TRPG'), entity JSON | Validated entity object | Throws validation error if required system fields missing | Platform R5 Specification |

---

### Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | T20 PM Spending Limit | Level 2 character attempts to spend 4 PM on *Ataque Especial* | System must reject the action or clamp spending to 2 PM, logging: "Limite de gastos excedido (Máximo 2 PM para nível 2)". |
| 2 | T20 PV Level Gain with Negative CON | Arcanista (Base 2 PV/lvl) with CON modifier -3 | Formula is $\max(1, 2 + (-3)) = 1$. Character always gains at least 1 PV on level up; never loses HP. |
| 3 | T20 Heavy Armor DEX Bonus | Character with DEX +4 equips Armadura Completa (Heavy Armor, Defesa +8) | Dexterity bonus to Defense becomes $+0$. Total Defense is $10 + 0 + 8 = 18$. (Dex still applies to Reflexos and Initiative). |
| 4 | TRPG Negative DEX with MaxDex Armor | Character with DEX -2 equips Cota de Malha (MaxDex +2) | MaxDex only caps positive dexterity. Negative dexterity applies in full: $-2$ penalty to CA is enforced ($10 - 2 + \text{Armor}$). |
| 5 | T20 Untrained Check on "Somente Treinada" | Untrained character attempts check on *Misticismo* or *Ladinagem* | Check is disallowed or evaluates to automatic failure, returning: "Perícia somente treinada não pode ser usada sem treino". |
| 6 | Natural 20 vs Extreme Defense | Attack roll natural 20 with $+4$ bonus (total 24) against target with Defesa 35 | Natural 20 is an **Automatic Hit** regardless of total score; deals normal or critical damage. |
| 7 | Natural 1 vs Low Defense | Attack roll natural 1 with $+22$ bonus (total 23) against target with Defesa 12 | Natural 1 is an **Automatic Failure**; attack misses unconditionally. |
| 8 | Critical Threat with Total Miss | Weapon with threat 18-20 rolls natural 18 with total 19 against target with Defesa 25 | Threat is cancelled because the attack did not hit target Defense. Result is a MISS. (Only natural 20 guarantees a hit). |
| 9 | T20 Damage Dice Multiplication for 2d6 weapon | Espada Grande ($2d6$, crit $x2$) scores a critical hit | Damage dice count doubles: $2d6 \times 2 = 4d6$ rolled. Flat strength modifier remains single. |
| 10 | Dying & Bleeding Stabilization | Character at -5 PV rolls Fortitude DC 15 and scores 16 | Bleeding stops. Character remains unconscious at -5 PV until healed, avoiding further 1d6 damage per round. |
| 11 | Instant Death Threshold | Character with 25 Max PV takes massive damage dropping to -13 PV | $-\lfloor 25 / 2 \rfloor = -12$. Current PV (-13) is $\le -12$, triggering instant character death. |
| 12 | Dual System Switch on Character Sheet | User toggles sheet edition from T20 to TRPG | System preserves base attributes, maps T20 direct modifier to equivalent score ($Score = 10 + 2 \times Mod$), converts Luta/Pontaria to BBA, and switches Defense to CA with half-level. |

---

## 7. Concrete Next Steps for Implementation Team

1. **Rules Engine (`src/lib/rules/`)**:
   - `attributes.ts`: Pure functions for modifier calculations and attribute generation algorithms.
   - `resources.ts`: Exact PV/PM calculation functions with class constants and level scaling.
   - `defense.ts`: Defesa (T20) and CA (TRPG) calculators taking armor, shields, and penalties into account.
   - `skills.ts`: 29 canonical T20 skills registry with training bonuses (+2/+4/+6) and TRPG rank calculators.
2. **Contextual Dice Roller (`src/lib/dice/`)**:
   - `parser.ts`: Lexer and parser for expressions (`1d20+7`, `2d6+4`, `2d20kh1`, `# comment`).
   - `roller.ts`: Contextual evaluator for attack rolls (with Nat 20/Nat 1, threat detection, defense comparison) and damage rolls (with critical dice doubling).
3. **Compendium & Persistence (`src/lib/compendium/` & Prisma)**:
   - Implement the TypeScript schemas above and seed the 12 verified canonical entries into JSON / SQLite.
   - Set up API routes / Server Actions to query and filter compendium entries by system ('T20' | 'TRPG').
