# Technical Specification: Dynamic Sheet Builder & Tactical VTT Combat Grid

**System Focus**: Tormenta 20 (T20) & Tormenta RPG Clássico (TRPG)  
**Author**: Sheet and VTT Spec Miner (`survey_vtt_3`)  
**Target File**: `.agents/teamwork/survey_vtt_3/report.md`  
**Date**: 2026-09-27  

---

## Executive Summary

This report establishes the complete user interface, user experience (UI/UX) architecture, reactive state models, data schemas, mathematical calculation pipelines, and real-time interaction protocols for two core modules of the TRPG platform:
1. **Dynamic Sheet Builder & Manager (R2)**: Multi-system character and threat creation, reactive recalculation of derived attributes (PV, PM, Defesa/CA, perícias, carga, penalidade de armadura), real-time adjustments, condition trackers, and direct-click contextual rolls.
2. **Tactical VTT Combat & Scene Grid (R4)**: Layered canvas 1.5m / 5ft square grid engine, map background scaling, token management and movement, multi-mode distance and range ruler, initiative tracker, and compendium drag-and-drop integration.

---

## 1. Dynamic Sheet Builder & Manager (R2)

### 1.1 Dual-System Character Creation Workflows

The platform must support two distinct rule systems via a unified, stepped wizard:

#### Tormenta 20 (T20) Flow
```
[1. Sistema & Identidade] 
       │ (T20, Nome, Divindade, Conceito)
       ▼
[2. Raça & Origem] 
       │ (Humano, Lefou, Qareen, etc. + Origem: 2 perícias ou 1 perícia + 1 poder)
       ▼
[3. Classe] 
       │ (Guerreiro, Arcanista, Ladino, etc. -> PV base, PM base, Proficiências)
       ▼
[4. Atributos Diretos] 
       │ (FOR, DES, CON, INT, SAB, CAR definidos diretamente como modificadores [-1 a +4])
       ▼
[5. Perícias & Poderes Iniciais] 
       │ (Perícias treinadas = Classe + INT; Poderes de Classe e Gerais)
       ▼
[6. Equipamento & Carga] 
       │ (Armas, Armadura, Kit; Cálculo de espaços = FOR x 3)
       ▼
[7. Revisão & Ficha Pronta]
```

#### Tormenta RPG Clássico (TRPG) Flow
```
[1. Sistema & Identidade]
       │ (TRPG, Nome, Tendência L/N/C e B/N/M, Divindade)
       ▼
[2. Raça & Classe Clássica]
       │ (Anão, Elfo, Humano, etc. + BBA Alta/Média/Baixa, DVs d4 a d12, Resistências)
       ▼
[3. Atributos Clássicos (3-18)]
       │ (Scores 3 a 18 -> Modificador = floor((Score - 10) / 2))
       ▼
[4. Graduações de Perícias & Talentos]
       │ (Pontos de Perícia = (Base + INT)*4; Talentos gerais e regionais)
       ▼
[5. Magias Clássicas / Espaços por Círculo]
       │ (1º ao 9º Círculo por dia, ou variante PM do Manual do Arcanista)
       ▼
[6. Equipamento & Carga Clássica (kg)]
       │ (Carga leve, média e pesada em kg baseada no valor de FOR)
       ▼
[7. Revisão & Ficha Pronta]
```

#### Threat & Monster (Ameaças) Creation Flow
A streamlined, quick-creation workflow designed for Game Masters (Mestres):
- **Passo 1: Papel & ND**: Escolha de Nível de Desafio (ND 1/4 a 20, S, S+) e Papel (Lacaio / Bando, Solo, Chefe).
- **Passo 2: Perfil Defensivo**: PV base, Defesa, Resistências (Fortitude, Reflexos, Vontade), Redução de Dano (RD), Imunidades e Vulnerabilidades.
- **Passo 3: Perfil Ofensivo**: Ataques corpo a corpo e à distância (Bônus de teste, Dano com dados e margem de crítico), PM e Magias/Habilidades Especiais.
- **Passo 4: Sentidos & Perícias**: Percepção, Iniciativa, Deslocamento (terrestre, voo, natação, escalada).

---

### 1.2 State Model & Reactive Recalculation Engine

The sheet state is structured as an immutable, reactive data tree. Derived values form a Directed Acyclic Graph (DAG) recalculated synchronously upon any change:

```
                  ┌──────────────────────┐
                  │    Atributos Base    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │  Mod Atrib  │  │   PV Máx    │  │   PM Máx    │
     └──────┬──────┘  └─────────────┘  └─────────────┘
            │
     ┌──────┴────────────────────────┐
     ▼                               ▼
┌─────────────┐               ┌─────────────┐
│  Perícias   │               │   Defesa    │
│  (Bônus)    │               │    / CA     │
└──────┬──────┘               └──────┬──────┘
       │                             │
       │ (aplica penalidade)         │ (aplica limite de DES)
       └──────────────┬──────────────┘
                      ▲
              ┌───────┴───────┐
              │ Equipamento:  │
              │  Armaduras &  │
              │    Escudos    │
              └───────────────┘
```

#### Mathematical Formulas Specification

##### 1. Atributos (Attributes)
- **T20**: Atributos são modificadores numéricos puros (ex: FOR +3, DES +1).
  $$\text{Mod}(A) = A_{\text{base}} + A_{\text{racial}} + A_{\text{poderes}} + A_{\text{temporario}}$$
- **TRPG**: Atributos são pontuações clássicas (3-18).
  $$\text{Mod}(A) = \left\lfloor \frac{A_{\text{score}} + A_{\text{temp}} - 10}{2} \right\rfloor$$

##### 2. Pontos de Vida (PV Máximo)
- **T20**:
  $$\text{PV}_{\text{max}} = \text{PV}_{\text{classe\_1}} + \text{Mod}(\text{CON}) + (\text{Nível} - 1) \times (\text{PV}_{\text{classe\_sub}} + \text{Mod}(\text{CON})) + \text{Bônus}_{\text{extra}}$$
- **TRPG**:
  $$\text{PV}_{\text{max}} = \text{DV}_{\text{max}} + \text{Mod}(\text{CON}) + (\text{Nível} - 1) \times (\text{DV}_{\text{medio/rolado}} + \text{Mod}(\text{CON})) + \text{Bônus}_{\text{extra}}$$

##### 3. Pontos de Mana (PM Máximo)
- **T20**:
  $$\text{PM}_{\text{max}} = \text{PM}_{\text{classe\_1}} + (\text{Nível} - 1) \times \text{PM}_{\text{classe\_sub}} + \text{Bônus}_{\text{extra}}$$
  *Nota*: O limite de PM por ação em T20 é estritamente igual ao nível do personagem ($\text{Limite PM} = \text{Nível}$).
- **TRPG**:
  - Padrão: Slots de magia por círculo (Círculo 1 a 9).
  - Opcional (Manual do Arcanista): Sistema de PM equivalente calculado por tabela de classe.

##### 4. Defesa (T20) / Classe de Armadura (TRPG)
- **T20**:
  $$\text{Defesa} = 10 + \text{Mod}_{\text{DES\_efetivo}} + \text{Bônus}_{\text{Armadura}} + \text{Bônus}_{\text{Escudo}} + \text{Mod}_{\text{Tamanho}} + \text{Outros}$$
  onde:
  $$\text{Mod}_{\text{DES\_efetivo}} = \begin{cases} 
  0 & \text{se Armadura Pesada} \\ 
  \min(\text{Mod}(\text{DES}), \text{Armadura}_{\text{maxDES}}) & \text{se Armadura Leve com Limite} \\
  \text{Mod}(\text{DES}) & \text{se sem armadura ou sem limite} 
  \end{cases}$$
- **TRPG**:
  $$\text{CA} = 10 + \min(\text{Mod}(\text{DES}), \text{Armadura}_{\text{maxDES}}) + \text{Armadura} + \text{Escudo} + \text{Tamanho} + \text{Armadura Natural} + \text{Deflexão} + \text{Outros}$$

##### 5. Penalidade de Armadura & Carga (Encumbrance)
- **T20**:
  - Itens ocupam **espaços** (Arma leve = 1, Arma de duas mãos = 2, Armadura leve = 2, Armadura pesada = 5, etc.).
  - Carga Máxima = $\max(1, \text{Mod}(\text{FOR})) \times 3$ espaços.
  - Se $\text{Carga Atual} > \text{Carga Máxima}$, o personagem está **Sobrecarregado**:
    - Penalidade de Armadura aumenta em $-2$.
    - Deslocamento é reduzido em $-3\text{m}$.
  - Penalidade de Armadura Total:
    $$\text{Penalidade} = \text{Penalidade}_{\text{Armadura}} + \text{Penalidade}_{\text{Escudo}} + (\text{se Sobrecarregado}: 2 \text{ senão } 0)$$
- **TRPG**:
  - Carga calculada em quilogramas ($kg$) com patamares Leve, Média (Penalidade $-3$, DES Máx $+3$, Deslocamento $6\text{m}$) e Pesada (Penalidade $-6$, DES Máx $+1$, Deslocamento $6\text{m}$).

##### 6. Perícias (Skills)
- **T20**:
  - Metade do Nível: $\text{MetadeNível} = \lfloor \text{Nível} / 2 \rfloor$.
  - Bônus de Treinamento:
    $$\text{Treino} = \begin{cases}
    0 & \text{se Não Treinada} \\
    +2 & \text{se Treinada (Níveis 1 a 6)} \\
    +4 & \text{se Treinada (Níveis 7 a 14)} \\
    +6 & \text{se Treinada (Níveis 15 a 20)}
    \end{cases}$$
  - Bônus Total:
    $$\text{TotalPerícia} = \text{MetadeNível} + \text{Treino} + \text{Mod}(\text{AtributoChave}) - (\text{se AfetadaPorArmadura}: \text{Penalidade} \text{ senão } 0) + \text{Outros}$$
- **TRPG**:
  $$\text{TotalPerícia} = \text{Graduações} + \text{Mod}(\text{AtributoChave}) - (\text{se AfetadaPorArmadura}: \text{Penalidade} \text{ senão } 0) + \text{Talentos} + \text{Foco}$$

---

### 1.3 Real-Time Adjustments & Resource Tracking

The sheet provides interactive widgets for dynamic game sessions:
1. **PV Tracker Widget**:
   - Quick $+ / -$ steppers and numeric entry.
   - Quick action buttons: `-1`, `-5`, `-10`, `+1`, `+5`, `+10`.
   - **Dano & PV Temporário**: Se o personagem possuir PV Temporários, qualquer dano reduz os PV temporários primeiro antes de atingir os PV atuais.
   - **Estados de Saúde Críticos**:
     - $\text{PV Atual} > 0$: Normal.
     - $\text{PV Atual} \le 0$: Ativa automaticamente a condição **Inconsciente** e **Sangrando**.
     - $\text{PV Atual} \le -(\text{PV}_{\text{max}} / 2)$ (em T20) ou $-10$ (em TRPG): Ativa condição **Morto**.
2. **PM Tracker Widget**:
   - Barra de progresso interativa com display `Atual / Máximo (Limite por Turno: X)`.
   - Botão "Gastar PM": Abre seletor com pré-validação contra o limite de nível de T20.
   - Descanso Rápido / Normal / Luxuoso:
     - Normal: Recupera $\text{Nível}$ em PV e PM.
     - Confortável: Recupera $2 \times \text{Nível}$ em PV e PM.
     - Luxuoso: Recupera 100% de PV e PM.
3. **Condition Management Matrix**:
   - Ativação/Desativação com um clique de condições oficiais (Abatido, Abalado, Agarrado, Alquebrado, Amedrontado, Atordoado, Caído, Cego, Confuso, Debilitado, Desprevenido, Enfeitiçado, Enredado, Esmorecido, Exausto, Fascinado, Fatigado, Fraco, Furtivo, Imóvel, Inconsciente, Indefeso, Lento, Ofuscado, Paralisado, Pasmo, Petrificado, Sangrando, Sobrecarregado, Surdo, Surpreendido, Vulnerável).
   - **Side-Effects Reativos Automáticos**:
     - `Caído`: Aplica $-5$ em testes de ataque corpo a corpo e $-5$ na Defesa contra ataques corpo a corpo (+5 contra ataques à distância).
     - `Desprevenido`: $-5$ na Defesa, impede reações e ataques de oportunidade.
     - `Fatigado`: $-2$ em testes de perícias físicas (FOR, DES, CON) e deslocamento reduzido.
     - `Vulnerável`: $-2$ na Defesa.

---

### 1.4 Direct-Click Action Rolls Integration

Every interactive combat element in the sheet (Attacks, Skills, Saving Throws, Abilities, Spells) triggers a direct roll in the Contextual Dice Engine:

```
[Clique em Ataque / Perícia / Magia na Ficha]
                      │
                      ▼
        [Constrói RollPayload Tipado]
                      │
      ┌───────────────┴───────────────┐
      ▼ (Modo Rápido)                 ▼ (Shift+Clique / Modo Tático)
[Dispara Rolagem Imediata]      [Abre Modal de Parâmetros de Ação]
      │                               │ - Investimento de PM
      │                               │ - Bônus Situacionais (Flanco, Carga)
      │                               │ - Modificadores de Postura
      └───────────────┬───────────────┘
                      ▼
      [Envio ao Dice Engine / EventBus]
                      │
                      ▼
      [Log Visual de Rolagens & Toasts]
```

#### Roll Payload Data Contracts (TypeScript)

```typescript
export type RollActionType = 'attack' | 'damage' | 'skill' | 'saving_throw' | 'spell' | 'initiative' | 'custom';

export interface BaseRollPayload {
  id: string;
  timestamp: string;
  characterId: string;
  characterName: string;
  system: 'T20' | 'TRPG';
  actionType: RollActionType;
  label: string; // Ex: "Ataque com Machado de Batalha"
}

export interface AttackRollPayload extends BaseRollPayload {
  actionType: 'attack';
  weaponId: string;
  weaponName: string;
  attackFormula: string; // Ex: "1d20 + 8"
  attackBonus: number;
  critThreat: number; // Ex: 19 para margem 19-20
  critMultiplier: number; // Ex: 3 para x3
  damageFormula: string; // Ex: "1d10 + 4"
  damageType: string; // Ex: "Corte"
  rangeBand: 'toque' | 'curto' | 'medio' | 'longo';
  pmCost?: number;
  situationalBonus?: number;
}

export interface SkillRollPayload extends BaseRollPayload {
  actionType: 'skill';
  skillId: string;
  skillName: string;
  attributeKey: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
  totalBonus: number;
  isTrained: boolean;
  armorPenaltyApplied: number;
}

export interface SpellRollPayload extends BaseRollPayload {
  actionType: 'spell';
  spellId: string;
  spellName: string;
  circle: number;
  pmCost: number;
  resistanceType?: 'Fortitude' | 'Reflexos' | 'Vontade' | 'Nenhum';
  difficultyClass: number; // DC = 10 + MetadeNível + ModAtributo
  effectFormula?: string; // Dano ou Cura, ex: "2d6 + 2"
}
```

---

### 1.5 Persistence & State Synchronization Model

- **Local Optimistic Cache**: Zustand store persistido em `localStorage` ou `IndexedDB` para garantir tempo de resposta $<16\text{ms}$ e funcionamento offline.
- **Debounced Server Sync**: Atualizações em campos de texto, biografia e inventário utilizam debounce de $500\text{ms}$ antes de disparar Server Action / REST API contra o backend Prisma.
- **Instant Server Sync**: Alterações de estado crítico de combate (PV atual, PM atual, Condições ativas) disparam sincronização imediata sem debounce.
- **Multi-Client Broadcast**: Alterações de combate são publicadas via canal WebSocket / Supabase Realtime para que o Mestre e demais jogadores visualizem os dados atualizados em tempo real no VTT.

---

## 2. Tactical VTT Combat & Scene Grid (R4)

### 2.1 Grid Rendering Engine & Coordinates

The grid is engineered on a 5-layer Canvas / DOM architecture designed for 60 FPS performance:

```
┌─────────────────────────────────────────────────────────────┐
│ Camada 5 (Topo): HUD, Menus de Contexto, Caixas de Diálogo  │ (HTML/DOM)
├─────────────────────────────────────────────────────────────┤
│ Camada 4: Régua de Alcance & Gabaritos de Área (AoE)        │ (Canvas Interativo)
├─────────────────────────────────────────────────────────────┤
│ Camada 3: Tokens (Posição, Anéis, Barras de Vida e Ícones)  │ (Canvas / SVG Interativo)
├─────────────────────────────────────────────────────────────┤
│ Camada 2: Grade Tática (Linhas de 1.5m / 5ft, Destaques)    │ (Canvas Otimizado)
├─────────────────────────────────────────────────────────────┤
│ Camada 1 (Fundo): Imagem do Mapa de Batalha (Bitmap Cache)   │ (Canvas com Img Bitmap)
└─────────────────────────────────────────────────────────────┘
```

#### Coordinate Spaces & Transformations
- **Escala Canônica**: $1 \text{ célula} = 1.5 \text{ metros} = 5 \text{ pés}$.
- **Tamanho Base de Célula ($C_{\text{px}}$)**: Padrão $64\text{px}$ (configurável de $32\text{px}$ a $128\text{px}$).
- **Espaço de Grade ($G_x, G_y$)**: Coordenadas discretas inteiras na matriz do mapa.
- **Espaço Global do Mundo ($W_x, W_y$)**:
  $$W_x = G_x \times C_{\text{px}}, \quad W_y = G_y \times C_{\text{px}}$$
- **Espaço da Tela do Usuário ($S_x, S_y$)**:
  $$S_x = W_x \times \text{Zoom} + \text{Pan}_x, \quad S_y = W_y \times \text{Zoom} + \text{Pan}_y$$
- **Conversão de Clique de Tela para Grade (com Snap)**:
  $$G_x = \left\lfloor \frac{S_x - \text{Pan}_x}{C_{\text{px}} \times \text{Zoom}} \right\rfloor, \quad G_y = \left\lfloor \frac{S_y - \text{Pan}_y}{C_{\text{px}} \times \text{Zoom}} \right\rfloor$$

---

### 2.2 Map & Scene Handling

- **Formatos de Mapa Suportados**: WebP, PNG, JPEG, SVG e URLs remotas.
- **Parâmetros da Cena**:
  - `columns` e `rows` (ex: $30 \times 20$ células).
  - `gridColor`: Hex string (padrão `#ffffff` ou `#222222`).
  - `gridOpacity`: Float de $0.0$ a $1.0$ (padrão $0.25$).
  - `gridVisible`: Booleano para alternar visibilidade das linhas da grade.
  - `offsetX`, `offsetY`: Ajuste fino em pixels para alinhar a grade da plataforma a mapas que já possuem linhas desenhadas.
- **Navegação & Câmera**:
  - **Pan**: Arrastar com Botão do Meio do mouse ou Tecla `Espaço + Botão Esquerdo`.
  - **Zoom**: Roda do mouse centrada nas coordenadas do cursor ($\text{Zoom}_{\text{min}} = 0.2\times$, $\text{Zoom}_{\text{max}} = 3.0\times$).
  - Suporte completo a gestos touch (pinch-to-zoom e two-finger pan) para tablets e notebooks conversíveis.

---

### 2.3 Token System & Creature Categories

Tokens represent players, allies, and monsters on the tactical map:

#### Categorias de Tamanho de Tormenta
| Categoria de Tamanho | Dimensão em Quadrados | Dimensão em Metros | Modificador de Defesa/Ataque (TRPG) |
|:---|:---:|:---:|:---:|
| **Minúsculo** | $0.5 \times 0.5$ | $0.75\text{m}$ | $+2$ |
| **Pequeno** | $1 \times 1$ | $1.5\text{m}$ | $+1$ |
| **Médio** | $1 \times 1$ | $1.5\text{m}$ | $0$ |
| **Grande** | $2 \times 2$ | $3.0\text{m}$ | $-1$ |
| **Enorme** | $3 \times 3$ | $4.5\text{m}$ | $-2$ |
| **Colossal** | $4 \times 4$ ou maior | $6.0\text{m}+$ | $-4$ ou $-8$ |

#### Token Data Model (TypeScript)

```typescript
export interface VttToken {
  id: string;
  sceneId: string;
  sheetId?: string; // Vínculo com a Ficha de Personagem ou Monstro
  name: string;
  avatarUrl: string;
  sizeCategory: 'MINUSCULO' | 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'ENORME' | 'COLOSSAL';
  gridWidth: number; // 0.5, 1, 2, 3, 4
  gridHeight: number; // 0.5, 1, 2, 3, 4
  x: number; // Posição X na grade
  y: number; // Posição Y na grade
  elevation: number; // Elevação em metros (ex: 0, 1.5, 3.0)
  rotation: number; // Orientação em graus (0 a 360)
  currentHp: number;
  maxHp: number;
  tempHp: number;
  currentPm: number;
  maxPm: number;
  conditions: string[]; // Lista de IDs de condições ativas
  isVisibleToPlayers: boolean; // Controle de visibilidade para o Mestre
  controlledBy: string[]; // IDs de usuários com permissão de mover/editar
  borderColor?: string; // Cor do anel tático (amigável, neutro, hostil)
}
```

#### Token Visual Overlays
- **Anel de Borda**: Verde para personagens de jogadores/aliados, Vermelho para inimigos/ameaças, Amarelo para PNJs neutros.
- **Barra de Vida (PV)**: Exibida no topo do token com coloração dinâmica:
  - Verde: $>50\%$ PV
  - Amarelo: $25\%$ a $50\%$ PV
  - Vermelho: $<25\%$ PV
  - Escudo Azul/Ciano: Camada sobreposta representando PV Temporários.
- **Barra de Mana (PM)**: Barra azul fina posicionada logo abaixo da barra de vida.
- **Badges de Condição**: Micro-ícones de $16\text{px}$ dispostos ao redor da borda (ex: ícone de queda para Caído, gota de sangue para Sangrando, raio para Atordoado).
- **Badge de Elevação**: Selo flutuante informando altura (ex: `+3m`) caso o token esteja voando ou em terreno elevado.

---

### 2.4 Distance & Range Ruler Engine

The distance ruler offers dynamic tactical measurement tailored to the Tormenta system:

#### Modos de Cálculo Métrico
1. **Métrica Chebyshev (Padrão Tormenta 20)**:
   - Em T20, diagonais custam exatamente o mesmo que movimentos ortogonais ($1 \text{ quadrado} = 1.5\text{m}$).
   $$D_{\text{quadrados}} = \max(|\Delta x|, |\Delta y|)$$
   $$\text{Distância}_{\text{metros}} = D_{\text{quadrados}} \times 1.5\text{m}$$
2. **Métrica Alternada 5/10/5 (Padrão TRPG Clássico / D&D 3.5)**:
   - A 1ª diagonal custa $1.5\text{m}$ (1q), a 2ª diagonal custa $3.0\text{m}$ (2q), a 3ª custa $1.5\text{m}$, e assim sucessivamente.
   $$D_{\text{quadrados}} = \max(|\Delta x|, |\Delta y|) + \left\lfloor \frac{\min(|\Delta x|, |\Delta y|)}{2} \right\rfloor$$
   $$\text{Distância}_{\text{metros}} = D_{\text{quadrados}} \times 1.5\text{m}$$
3. **Métrica Euclidiana Direta**:
   $$\text{Distância}_{\text{metros}} = \sqrt{(\Delta x)^2 + (\Delta y)^2} \times 1.5\text{m}$$

#### Faixas de Alcance de Tormenta (Range Bands)
A régua classifica e colore automaticamente o segmento medido conforme as faixas de alcance do sistema:
- **Corpo a Corpo / Toque**: $1.5\text{m}$ (Adjacente, 1 quadrado) — Indicador Ciano.
- **Curto**: Até $9.0\text{m}$ (6 quadrados) — Indicador Verde.
- **Médio**: Até $18.0\text{m}$ (12 quadrados) — Indicador Amarelo.
- **Longo**: Até $36.0\text{m}$ (24 quadrados) — Indicador Laranja.
- **Extremo / Fora de Alcance**: $> 36.0\text{m}$ — Indicador Vermelho.

#### Interação da Régua
- Ativada via tecla de atalho (`Ctrl + Arrastar`) ou botão de ferramenta no HUD.
- Suporte a **Waypoints**: Clicar com o botão esquerdo enquanto arrasta a régua fixa um ponto de virada (permitindo medir curvas ao redor de paredes e obstáculos).
- Exibição de tooltip dinâmico no cursor: `13.5m (9q) | Alcance: Médio`.

---

### 2.5 Initiative Tracker (Rastreador de Iniciativa)

```
┌────────────────────────────────────────────────────────────┐
│ ⚔️ RASTREADOR DE INICIATIVA          [Rodada: 2] [▶ Próx]   │
├────────────────────────────────────────────────────────────┤
│ 1. [✦] Sir Valen (Guerreiro)        [Inic: 22] [PV 34/34]   │ ◄ Turno Ativo (Pulso)
│    Condições: Nenhuma                                      │
├────────────────────────────────────────────────────────────┤
│ 2. [ ] Lefeu Corrompido A           [Inic: 18] [PV 18/25]   │
│    Condições: Sangrando (1 rodada)                         │
├────────────────────────────────────────────────────────────┤
│ 3. [ ] Nina (Arcanista)             [Inic: 15] [PV 14/14]   │
│    Condições: Nenhuma                                      │
├────────────────────────────────────────────────────────────┤
│ 4. [ ] Orc Saqueador B              [Inic: 11] [PV 0/15]    │ 💀 Derrotado
│    Condições: Inconsciente                                 │
└────────────────────────────────────────────────────────────┘
```

#### Protocolo de Ciclo de Turnos
1. **Ordenação**:
   - Ordenado decrescente pelo resultado de Iniciativa ($1\text{d}20 + \text{Iniciativa}$).
   - **Critério de Desempate**: Maior modificador de Destreza. Se persistir, rolagem automática de $1\text{d}20$ oculta no motor.
2. **Avanço de Turno (`Próximo Turno`)**:
   - Transfere o foco para o próximo combatente ativo.
   - Aplica efeitos de fim de turno no combatente anterior (ex: tick de dano contínuo de Sangrando).
   - Destaca o token correspondente no canvas com um anel pulsante animado.
   - Opcional: Câmera centraliza suavemente no token ativo se habilitado pelo usuário.
3. **Virada de Rodada**:
   - Ao avançar do último combatente para o primeiro, o contador de Rodadas incrementa ($\text{Rodada} = \text{Rodada} + 1$).
   - Decrementa a duração de efeitos e magias com contagem de rodadas. Condições expiradas são removidas automaticamente.
4. **Ações Rápidas**:
   - Botão "Rolar Iniciativa de Todos": Rola a iniciativa de todos os NPCs automaticamente.
   - Botão "Rolar Minha Iniciativa": Permite que o jogador role e atualize sua posição instantaneamente.

---

## 3. Drag-and-Drop & Compendium Integration (R5 into R2 & R4)

### 3.1 Data Transfer Architecture & MIME Types

The Compendium drawer functions as an interactive slide-in panel (leveraging modern CSS containment and navigation drawer patterns) capable of initiating drag-and-drop operations across DOM boundaries and onto the VTT canvas:

```typescript
export const COMPENDIUM_MIME_TYPES = {
  ITEM: 'application/x-trpg-item',
  SPELL: 'application/x-trpg-spell',
  POWER: 'application/x-trpg-power',
  THREAT: 'application/x-trpg-threat'
} as const;

export interface DraggedCompendiumPayload {
  mimeType: string;
  sourceSystem: 'T20' | 'TRPG';
  entityId: string;
  entityName: string;
  category: 'arma' | 'armadura' | 'item' | 'magia' | 'poder' | 'ameaca';
  payloadData: Record<string, unknown>;
}
```

### 3.2 Drop Targets on Character Sheet

1. **Equipamento / Inventário**:
   - Soltar uma **Arma**: Adiciona o item ao inventário e cria automaticamente um perfil de ataque na aba de Combate com a fórmula de dano e margem de crítico pré-configuradas.
   - Soltar uma **Armadura / Escudo**: Adiciona ao equipamento. Se o usuário marcar como "Equipado", o motor recalcula instantaneamente a Defesa/CA, o limite de DES e a Penalidade de Armadura.
   - Soltar um **Item Geral**: Adiciona à lista de itens e recalcula o peso/espaços ocupados.
2. **Grimório / Lista de Magias**:
   - Soltar uma **Magia**: Valida compatibilidade com o sistema da ficha (`T20` vs `TRPG`). Adiciona ao grimório e calcula automaticamente o custo de PM base e a CD do teste de resistência ($\text{CD} = 10 + \text{MetadeNível} + \text{ModChave}$).
3. **Poderes & Talentos**:
   - Soltar um **Poder de Classe / Poder Geral / Talento**: Adiciona à lista de habilidades ativas. Valida pré-requisitos (nível mínimo, perícias, atributos) e exibe um alerta visual caso algum requisito não seja atendido.

### 3.3 Drop Target on VTT Tactical Canvas

When dragging a **Monster / Threat (Ameaça)** from the Compendium directly onto the VTT Canvas:
1. O evento `dragover` rastreia as coordenadas do cursor no canvas e exibe um "Ghost Token" semitransparente encaixado no grid.
2. O evento `drop`:
   - Converte $(S_x, S_y)$ da tela para $(G_x, G_y)$ na grade tática.
   - Cria uma nova instância de `VttToken` populada com os dados do monstro (Nome, Avatar, Tamanho, PV Atual/Máx, PM, Defesa).
   - Se o tamanho for Grande ($2 \times 2$) ou maior, ajusta a ocupação de células no canvas.
   - Persiste o novo token na cena e transmite o evento via WebSocket para todos os participantes da sessão.
   - Insere opcionalmente o monstro no Rastreador de Iniciativa.

---

## 4. Specification Miner Tables

### 4.1 Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Sheet Builder | Seleção de Sistema (T20 vs TRPG) | Alterna a arquitetura de regras entre Tormenta 20 e Tormenta RPG clássico | Sistema selecionado ('T20' ou 'TRPG') | Estado da ficha adaptado aos campos da edição | Bloqueia campos incompatíveis | ORIGINAL_REQUEST R1, R2 |
| 2 | Sheet Builder | Cálculo Reativo de PV Máximo | Calcula PV baseado em classe, constituição e nível | Nível, Classe, Modificador de CON | PV Máximo atualizado | Se CON negativa no 1º nível, respeita mínimo de 1 PV | ORIGINAL_REQUEST R2 |
| 3 | Sheet Builder | Cálculo Reativo de PM Máximo | Calcula PM baseado na classe e nível (T20: todas as classes; TRPG: conjuradores) | Nível, Classe, Atributo Chave | PM Máximo e Limite de PM por turno | Limite de PM não pode ser ultrapassado | ORIGINAL_REQUEST R1, R2 |
| 4 | Sheet Builder | Cálculo de Defesa / CA | Computa Defesa base (10) + DES + Armadura + Escudo com limite de armadura pesada | Equipamentos equipados, Mod DES | Defesa/CA final e restrições de DES | Armadura pesada zera mod de DES (T20) | ORIGINAL_REQUEST R2 |
| 5 | Sheet Builder | Perícias com Treinamento Escalar (T20) | Bônus escala automaticamente (+2 níveis 1-6, +4 níveis 7-14, +6 níveis 15-20) | Nível, Treinamento (bool), Atributo | Bônus total de perícia | Perícia "Somente Treinada" bloqueia rolagem se não treinada | T20 Livro Básico / R2 |
| 6 | Sheet Builder | Carga e Penalidade de Armadura | Calcula espaços ocupados (T20) ou kg (TRPG) e aplica status Sobrecarregado | Peso dos itens no inventário, Mod FOR | Penalidade de armadura e redução de deslocamento | Alerta de sobrecarga e penalidade de -2 adicional | T20 Livro Básico / R2 |
| 7 | Sheet Combat | Tracker de PV e Dano em Tempo Real | Aplica dano, consome PV temporário primeiro e detecta estados críticos | Valor do dano ou cura | PV atual modificado, status Inconsciente/Sangrando se <=0 | Se PV <= -Metade Max, marca Morto | ORIGINAL_REQUEST R2 |
| 8 | Sheet Combat | Tracker de Gastos de PM | Deduz PM ao usar magias e poderes, checando limite por turno | PM investido | PM atual reduzido | Alerta e bloqueio se PM > Limite de Nível ou > PM Atual | ORIGINAL_REQUEST R2 |
| 9 | Sheet Combat | Matriz de Condições Reativas | Alternância de condições de combate com aplicação automática de penalidades | Checkbox / clique de condição | Modificadores em Defesa, Ataques e Perícias | Remove condições mutuamente exclusivas | ORIGINAL_REQUEST R2 |
| 10 | Sheet Combat | Clique Direto de Ataque | Dispara rolagem de ataque contextual com fórmula e margem de crítico | Clique no botão de ataque da arma | Payload de rolagem enviado ao Dice Engine | Se arma não equipada, avisa o usuário | ORIGINAL_REQUEST R3 |
| 11 | Sheet Combat | Clique Direto de Perícia | Dispara rolagem de teste de perícia com discriminação de bônus | Clique no nome ou bônus da perícia | Rolagem d20 + modificadores com log no chat | Se perícia exige treino e não treinada, avisa | ORIGINAL_REQUEST R2, R3 |
| 12 | VTT Grid | Grade Tática 1.5m / 5ft | Renderiza malha de células quadradas proporcionais em escala métrica | Dimensões do mapa, tamanho de célula (px) | Grid sobreposto com linhas e escala de 1.5m | Degradação suave em zoom extremo | ORIGINAL_REQUEST R4 |
| 13 | VTT Scene | Carregamento de Imagem de Fundo | Carrega e escala mapa de batalha com controle de opacidade e cor de grade | Imagem local/URL, colunas, linhas | Fundo renderizado na camada inferior do canvas | Fallback para grade neutra se imagem falhar | ORIGINAL_REQUEST R4 |
| 14 | VTT Tokens | Posicionamento & Snap-to-Grid | Tokens de jogadores e monstros posicionados com encaixe magnético no grid | Arrastar e soltar token no canvas | Coordenadas inteiras (Gx, Gy) atualizadas | Colisão visual e ajuste suave de coordenadas | ORIGINAL_REQUEST R4 |
| 15 | VTT Tokens | Escala por Categoria de Tamanho | Dimensiona tokens conforme porte (Minúsculo 0.5x, Médio 1x, Grande 2x2, etc.) | Tamanho do personagem/ameaça | Token renderizado ocupando N células corretas | Clipa borda se ultrapassar limites do mapa | T20 / TRPG Regras / R4 |
| 16 | VTT Tokens | Overlays de PV e Condições | Exibe mini barra de vida, barra de mana e ícones de condições sobre o token | Estado do token (PV, PM, Condições) | Gráficos flutuantes sobre o token no canvas | Esconde barra de monstros se opção GM ativa | ORIGINAL_REQUEST R4 |
| 17 | VTT Ruler | Régua de Medição Chebyshev (T20) | Mede distância com diagonais iguais a movimentos ortogonais (1q = 1.5m) | Ponto inicial e ponto final do cursor | Linha com distância total em metros e quadrados | Trata divisão por zero se mesmo ponto | ORIGINAL_REQUEST R4 |
| 18 | VTT Ruler | Régua 5/10/5 Clássica (TRPG) | Mede diagonais alternadas (1ª = 1.5m, 2ª = 3.0m, 3ª = 1.5m) | Ponto inicial e final | Distância correta conforme regras clássicas | Exibe valor correto em metros | TRPG Clássico / R4 |
| 19 | VTT Ruler | Indicador Dinâmico de Faixa de Alcance | Classifica distância em faixas de Tormenta (Toque, Curto, Médio, Longo) | Distância em metros | Cor e rótulo de alcance dinâmico na régua | Marca "Fora de Alcance" se > 36m | T20 / TRPG Regras / R4 |
| 20 | VTT Ruler | Waypoints de Medição | Permite adicionar nós na régua para contornar paredes e cantos | Cliques durante o arrasto da régua | Linha poligonal com soma acumulada de distâncias | Limita histórico de nós para evitar estouro | Análise de UX VTT |
| 21 | VTT Initiative | Rastreador Ordenado de Combate | Ordena combatentes por iniciativa com desempate por Modificador de DES | Valores de iniciativa de tokens/fichas | Lista ordenada com indicador de turno ativo | Se empate de DES, desempate aleatório d20 | ORIGINAL_REQUEST R4 |
| 22 | VTT Initiative | Ciclo de Rodadas & Contador | Avança turnos, incrementa rodadas e emite eventos de fim/início de turno | Botão de próximo turno | Atualização de rodada e anel pulsante no token ativo | Bloqueia avanço se lista vazia | ORIGINAL_REQUEST R4 |
| 23 | Compendium DnD | Arrastar Item para Ficha | Drag & drop de arma, armadura ou item para a ficha de personagem | Item arrastado do drawer para o inventário | Item adicionado e perfil de ataque gerado | Rejeita item se formato inválido | ORIGINAL_REQUEST R5 |
| 24 | Compendium DnD | Arrastar Magia para Ficha | Drag & drop de magia do compêndio para o grimório da ficha | Magia arrastada para a aba de magias | Magia registrada com CD e custo de PM calculados | Alerta se magia for de círculo superior ao permitido | ORIGINAL_REQUEST R5 |
| 25 | Compendium DnD | Arrastar Monstro para VTT | Drag & drop de monstro do compêndio diretamente sobre o grid do VTT | Monstro arrastado sobre a tela do mapa | Novo token instanciado nas coordenadas do cursor | Bloqueia drop fora da área visível da cena | ORIGINAL_REQUEST R4, R5 |

---

### 4.2 Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Recálculo de PV | Personagem com Modificador de CON negativo no 1º nível | O cálculo deve garantir no mínimo 1 PV por nível, impedindo que modificadores negativos reduzam os PVs ganhos a zero ou menos. |
| 2 | Gastos de PM (T20) | Personagem de nível 3 tenta gastar 5 PM em um único golpe | O sistema emite aviso de bloqueio de regra: o limite de PM por ação em Tormenta 20 é restrito ao nível do personagem (máximo 3 PM). |
| 3 | Morte de Personagem | Personagem com 20 PV Máximo sofre 31 pontos de dano enquanto estava com 1 PV | PV atual vai para -30. Como $-30 \le -(\text{PV}_{\text{max}} / 2) = -10$, a condição "Morto" é aplicada imediatamente sem passar por estabilização. |
| 4 | PV Temporários | Personagem tem 10 PV atuais, 5 PV Temporários e sofre 7 de dano | Os 5 PV temporários são consumidos integralmente, e os 2 pontos de dano restantes são subtraídos do PV atual, resultando em 8 PV atuais e 0 temporários. |
| 5 | Penalidade de Armadura | Personagem com armadura pesada (penalidade -4) realiza teste de Acrobacia | O bônus total de Acrobacia tem a penalidade de -4 deduzida automaticamente da rolagem final. |
| 6 | Sobrepeso (T20) | Personagem com FOR +1 (limite 3 espaços) carrega 5 espaços de itens | O sistema ativa automaticamente a condição "Sobrecarregado": aplica $-2$ adicional na penalidade de armadura e reduz o deslocamento em $3\text{m}$. |
| 7 | Perícia Somente Treinada | Jogador clica para rolar Ladinagem ou Misticismo sem possuir treinamento | O sistema exibe um diálogo de aviso informando que a perícia exige treinamento formal para ser testada, impedindo a rolagem por engano. |
| 8 | Margem de Crítico | Arma com margem 19-20/x3 obtém 19 no d20 de ataque | O motor de dados identifica o acerto crítico no 19, destaca o resultado visualmente com moldura dourada e prepara a fórmula de dano multiplicando os dados por 3. |
| 9 | Margem de Falha Crítica | Ataque com modificador +15 obtém 1 natural no d20 | O motor de dados detecta falha crítica automática independente da Defesa do alvo, destacando o resultado com moldura vermelha. |
| 10 | Régua Diagonal 5/10/5 | Jogador traça movimento de 3 diagonais no modo TRPG | O primeiro quadrado soma 1.5m, o segundo soma 3.0m e o terceiro soma 1.5m, totalizando 6.0m (4 quadrados de movimento). |
| 11 | Token de Criatura Grande | Mestre arrasta monstro de tamanho Grande ($2 \times 2$) para o mapa | O token é centralizado na interseção de $2 \times 2$ células, ocupando precisamente $3.0\text{m} \times 3.0\text{m}$ de área tática. |
| 12 | Token Minúsculo | Mestre posiciona criatura Minúscula ($0.5 \times 0.5$) | O token é renderizado centralizado dentro de 1/4 da célula, permitindo compartilhamento de espaço com outras criaturas conforme regras de enxame/minúsculos. |
| 13 | Drop de Monstro Fora da Grade | Usuário solta o card de monstro fora dos limites visíveis do canvas | O evento de drop é descartado silenciosamente com animação de retorno sem instanciar tokens órfãos no banco de dados. |
| 14 | Zoom Máximo e Mínimo | Usuário roda o scroll do mouse continuamente | O zoom é limitado rigidamente entre $0.2\times$ e $3.0\times$, prevenindo coordenadas inválidas (NaN) e inversão de matriz gráfica. |
| 15 | Desempate de Iniciativa | Dois combatentes rolam exatamente 17 na iniciativa | O rastreador compara os modificadores de Destreza. Se um tiver DES +3 e o outro DES +1, o de DES +3 assume a dianteira automaticamente. |
| 16 | Queda de Conexão no VTT | Usuário move um token durante instabilidade de rede | O token move-se localmente (otimista). Se a requisição falhar após timeout, o token retorna suavemente à posição original com toast de erro. |

---

## 5. UI/UX Architecture & Layout Specifications

### 5.1 Screen Layout & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: [Logo TRPG] [Sessão: Fim dos Tempos] [T20/TRPG] [Bandeja Dados]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────────────────┐  ┌─────────────────────────────┐   │
│   │ VTT TACTICAL CANVAS           │  │ COMPENDIUM / FICHA DRAWER   │   │
│   │ - Grid 1.5m                   │  │ (content-visibility: auto)  │   │
│   │ - Map Background              │  │                             │   │
│   │ - Tokens & HP bars            │  │ [Abas: Ataque / Magias /    │   │
│   │ - Range Ruler & AoE Templates │  │        Itens / Poderes]     │   │
│   │                               │  │                             │   │
│   │ [HUD Ferramentas: Sel/Régua]  │  │ [Itens com draggable="true"]│   │
│   │ [Iniciativa Tracker Overlay]  │  │                             │   │
│   └───────────────────────────────┘  └─────────────────────────────┘   │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ FOOTER / TRAY: [Token Selecionado: PV, PM, Ações Rápidas] [Log Rolagem]│
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Performance & Rendering Optimizations

1. **CSS Containment (`content-visibility: auto`)**:
   - Conforme documentado no guia `interactions-in-complex-layouts`, os painéis laterais de Ficha e Compêndio utilizam `content-visibility: auto` com `contain-intrinsic-size` para isolar recálculos de layout durante operações de drag-and-drop, garantindo que o canvas do VTT mantenha $60\text{ FPS}$ constantes.
2. **Layered Canvas Architecture**:
   - O mapa de fundo (geralmente uma imagem pesada de alta resolução) é renderizado em um canvas independente e só é redesenhado quando a câmera sofre Pan ou Zoom.
   - Os tokens e a régua de medição residem em camadas superiores leves, permitindo atualizações de posição em $<1\text{ms}$.
3. **Parchment & High Fantasy Theme Textures**:
   - Conforme o guia `visually-texture-content`, elementos temáticos de pergaminho e couro utilizam `mask-image` com padrões sutis e gradientes de opacidade para imergir o usuário na estética de alta fantasia de Tormenta sem penalidades de desempenho.

---

## 6. Recommendations for Architecture & Implementation Tracks

1. **State Store**: Adotar **Zustand** com middleware de persistência para o estado da Ficha e do VTT, viabilizando seletores granulares e prevenindo re-renderizações desnecessárias.
2. **Canvas Controller**: Implementar um controlador Canvas baseado em Web APIs padrão (2D Context) com suporte a `devicePixelRatio` para nitidez em telas Retina/HiDPI.
3. **Data Transfer Protocol**: Utilizar os tipos MIME customizados `application/x-trpg-*` para transferências seguras e tipadas de dados entre Compêndio, Ficha e Grid.
4. **Dice Integration**: Padronizar todos os botões de ação para emitirem `RollPayload` tipados que trafegam diretamente pelo Dice Roller central.

---
*Relatório concluído com sucesso pela equipe de Survey VTT & Fichas.*
