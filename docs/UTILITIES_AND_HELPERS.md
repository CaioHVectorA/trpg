# Plataforma Tormenta RPG — Documentação de Utilitários e Motor Interno

> Guia de módulos internos em `src/lib/` abrangendo o motor de regras de Tormenta, analisador de dados d20, métricas táticas de VTT e definições de tipos TypeScript.

---

## 🛠️ 1. Motor de Regras (`src/lib/rules/`)

O módulo `src/lib/rules` encapsula a matemática e a lógica canônica de Tormenta 20 e Tormenta RPG Clássico.

### Módulos e Funções Principais:

#### A. Atributos (`attributes.ts`)
- `getAttributeModifier(value: number, system: SystemMode): number`
  - T20: Retorna o valor diretamente (modificador direto).
  - TRPG: Calcula `Math.floor((value - 10) / 2)`.
- `formatAttributeScore(value: number, system: SystemMode): string`
  - Retorna a string formatada com sinal explícito (ex: `+3`, `-1`).

#### B. Estatísticas Derivadas (`derivedStats.ts`)
- `calculateDerivedStats(sheet: BaseSheet): DerivedStats`
  - Consolida em um único ponto os cálculos de PV Máximo, PM Máximo, Defesa/CA e Carga Máxima.
- `calculatePV(system, level, characterClass, conModifier)`
  - Aplica as fórmulas de progressão por nível de T20 ou TRPG.
- `calculatePM(system, level, characterClass, keyAttrModifier)`
  - Aplica os Pontos de Mana base da classe mais modificador e ganho por nível.
- `calculateDefense(sheet: BaseSheet): number`
  - Calcula a Defesa (T20) ou Classe de Armadura (TRPG), considerando penalidade de Destreza zerada em armadura pesada (T20) ou adição da metade do nível (TRPG).

#### C. Perícias (`skills.ts`)
- `calculateSkillBonus(skillName, characterLevel, attributeModifier, isTrained, system, extraBonus)`
  - Retorna o bônus final da perícia. Em T20, aplica o valor de treinamento por patamar (`+2` para níveis 1-6, `+4` para 7-14, `+6` para 15-20) e metade do nível arredondado para baixo.

#### D. Recursos e Condições (`pools.ts` e `conditions.ts`)
- `applyResourceDelta(current, max, delta, allowTemp)`
  - Gerencia alteração segura de PV e PM, prevenindo estouro abaixo de 0 ou acima do máximo.
- `getConditionEffects(conditionName: ConditionType)`
  - Retorna as penalidades de atributos/defesa aplicadas por estados de condição (ex: *Abalado*, *Caído*, *Fatigado*, *Sangrando*).

#### E. Carga e Inventário (`encumbrance.ts`)
- `calculateEncumbrance(forModifier, totalSlots, system)`
  - Em T20: Capacidade = `10 + (FOR * 2)` espaços. Sobrecarga aplica penalidade de `-2` em testes de perícias baseadas em Força e Destreza e reduz o deslocamento.

---

## 🎲 2. Motor e Parser de Dados (`src/lib/dice/`)

O módulo `src/lib/dice` converte expressões em texto simples em resoluções matemáticas com suporte a acertos críticos e ampliações de PM.

### Funções Principais:

#### A. Parser e Evaluator (`parser.ts` & `evaluator.ts`)
- `parseDiceExpression(formula: string): ParsedDiceExpression`
  - Aceita fórmulas como `1d20+7 # Luta`, `2d6+4 # Espada Longa`, `3d20kh1` (keep highest).
- `evaluateDiceExpression(options: DiceEvaluationOptions): DiceRollResult`
  - Executa a rolagem pseudo-aleatória, calcula a soma total e identifica se o valor natural atingiu a margem de ameaça crítica configurável ou falha crítica (1 natural).

#### B. Críticos e Ameaça (`critical.ts`)
- `evaluateCriticalHit(naturalRoll: number, threatMargin: number, multiplier: number, baseDamage: string)`
  - Calcula e formata o multiplicador de dano crítico (ex: `19-20/x2` ou `18-20/x3`).

#### C. Ampliações por PM (`enhancements.ts`)
- `applyPMEnhancements(baseFormula: string, pmSpent: number, pmLimit: number)`
  - Garante que o gasto de PM em ampliações não ultrapasse o nível do personagem (limite por rodada de T20) e adiciona os dados extras/bônus correspondentes.

---

## 🗺️ 3. Utilitários de VTT (`src/lib/vtt/`)

#### A. Métrica e Distância (`ruler.ts` & `grid.ts`)
- `calculateDistance(p1: Point, p2: Point, meterPerSquare: number, system: SystemMode): DistanceResult`
  - **T20 (Métrica Chebyshev)**: Distância em diagonal = `Math.max(dx, dy) * 1.5m`.
  - **TRPG (Métrica 5/10/5)**: A primeira diagonal custa 1,5m (5ft), a segunda custa 3m (10ft), alternando sucessivamente.

#### B. Faixas de Alcance (`ruler.ts`)
- `getRangeCategory(distanceMeters: number): RangeCategory`
  - Classifica a distância em faixas oficiais de Tormenta:
    - **Toque / Adjacente**: <= 1,5m
    - **Curto**: <= 9m
    - **Médio**: <= 18m
    - **Longo**: <= 36m
    - **Extremo**: > 36m

#### C. Iniciativa (`initiative.ts`)
- `sortInitiative(entries: InitiativeEntry[]): InitiativeEntry[]`
  - Ordena a fila de turnos por valor total de iniciativa com desempate por modificador de Destreza.

---

## 🏷️ 4. Definições de Tipos TypeScript (`src/lib/types/`)

- `SystemMode`: `'T20' | 'TRPG'`
- `AttributeBlock`: `{ FOR: number; DES: number; CON: number; INT: number; SAB: number; CAR: number }`
- `BaseSheet`: Contrato principal de entrada para o motor reativo de ficha.
- `ParsedDiceExpression`: Objeto contendo contagem de dados, lados, modificador e rótulo.
- `DiceRollResult`: Resultado consolidado com rolagens individuais e sinalizadores de crítico.
- `TokenData` e `SceneData`: Estruturas do VTT.
