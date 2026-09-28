# Plataforma Tormenta RPG — Arquitetura de Sistema e Engenharia de Software

> Documentação técnica detalhada sobre a arquitetura do sistema, motor de cálculo reativo (DAG), discriminação multi-sistema (Tormenta 20 JdA vs Tormenta RPG Clássico), modelo de dados e subsistemas VTT.

---

## 📐 1. Visão Geral e Filosofia Arquitetural

A **Plataforma Tormenta RPG** foi concebida como uma aplicação web *all-in-one*, modular e extensível para sessões presenciais e virtuais de RPG de mesa baseadas no universo de Arton. O sistema oferece suporte simultâneo nativo para duas gerações das regras oficiais da Editora Jambô:
1. **Tormenta 20 (Jogo do Ano - JdA)**
2. **Tormenta RPG (Edição Revisada Clássica)**

### Princípios de Design:
- **Zero-Friction Local & Cloud-Ready**: Funciona *out-of-the-box* com SQLite local (`dev.db`), utilizando modelos universais no Prisma compatíveis com PostgreSQL / Supabase para produção em larga escala sem modificação de código.
- **Cálculo Reativo Reentrante (DAG)**: Todos os valores derivados da ficha de personagem (PV Máximo, PM Máximo, Defesa/CA, Bônus de Perícias e Carga) são recalculados instantaneamente via Grafo Acíclico Dirigido (*Directed Acyclic Graph*), eliminando inconsistências ou sincronizações manuais.
- **Componentização Modular**: Separação estrita entre o motor matemático autônomo e puro em `src/lib/` e a camada de renderização React/Next.js em `src/app/` e `src/components/`.

---

## 🛠️ 2. Stack Tecnológica

| Camada | Tecnologia | Propósito / Função |
| :--- | :--- | :--- |
| **Framework Web** | Next.js 14 (App Router) | Renderização híbrida (SSR / CSR), Server Components e Rotas de API REST. |
| **Linguagem** | TypeScript 5.6 | Interface fortemente tipada para contratos de dados e regras do RPG. |
| **Estilização** | Tailwind CSS + Lucide Icons | Design system escuro temático de Arton (*Fantasy UI*). |
| **ORM & Persistence** | Prisma 5.21 | Mapeamento objeto-relacional com suporte transacional. |
| **Banco de Dados** | SQLite / PostgreSQL | Persistência local (`dev.db`) e suporte para produção via PostgreSQL/Supabase. |
| **Testes** | Vitest 2.1 | Suíte de testes unitários e de integração de alta velocidade (55 arquivos, 428+ testes). |

---

## 🏗️ 3. Arquitetura em Camadas

```
+-----------------------------------------------------------------------+
|                            NAVEGADOR / UI                             |
|  (/characters, /vtt, /compendium, DiceRollerBar, TacticalGridCanvas)  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    NEXT.JS APP ROUTER & REACT CONTEXT                 |
|       (DiceContext, State Hooks, API Handlers /api/*)                 |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       MOTOR PURO DE REGRAS                            |
|  (lib/rules/, lib/dice/, lib/vtt/, lib/types/)                       |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                     CAMADA DE PERSISTÊNCIA (PRISMA)                   |
|  (Campaign, Character, Scene, Token, CompendiumItem, RollLog)          |
+-----------------------------------------------------------------------+
```

---

## 🔄 4. Motor de Cálculo Reativo (DAG Engine)

O cálculo de estatísticas derivadas na ficha de personagem segue uma ordem estrita de dependências sem ciclos:

```
[Atributos Base (FOR, DES, CON, INT, SAB, CAR)]
                     │
                     ├────────────► [Modificadores de Atributo]
                     │                       │
                     │                       ├──────► [Perícias Treinadas / Bônus Base]
                     │                       │
[Raça & Classe] ─────┼────────────► [PV Máximo & PM Máximo]
                     │                       │
[Nível do Perfil] ───┴────────────► [Pontos de Mana Limite por Rodada]
                                             │
[Equipamentos / Armaduras] ────────► [Defesa / CA & Penalidade de Carga]
```

### Regras Matemáticas e Algoritmos:

#### A. Atributos:
- **Tormenta 20**: Atributo é o próprio modificador direto (ex: FOR +3, CAR -1).
- **Tormenta RPG Clássico**: Valor base de 3 a 18. Modificador = `Math.floor((Valor - 10) / 2)`.

#### B. Pontos de Vida (PV Máximo):
- **T20**: `PV_Base_Classe + Mod_CON + ((Nível - 1) * (PV_Por_Nivel + Mod_CON))`.
- **TRPG**: `Dado_de_Vida_Max + Mod_CON + ((Nível - 1) * (Dado_de_Vida_Medio + Mod_CON))`.

#### C. Pontos de Mana (PM Máximo):
- **T20**: `PM_Base_Classe + Mod_Atributo_Chave + ((Nível - 1) * PM_Por_Nível)`.
- **TRPG**: Baseado no nível de conjurador e tabela da classe.

#### D. Defesa / Classe de Armadura (CA):
- **T20**: `10 + Mod_DES + Bônus_Armadura + Bônus_Escudo + Outros`.
  - *Armadura Pesada em T20*: Ignora o modificador de Destreza (Mod_DES = 0).
- **TRPG**: `10 + Math.floor(Nível / 2) + Mod_DES + Bônus_Armadura + Bônus_Escudo`.

#### E. Treinamento de Perícias em T20:
- Nível 1 a 6: Bônus de Treinamento = `+2`
- Nível 7 a 14: Bônus de Treinamento = `+4`
- Nível 15 a 20: Bônus de Treinamento = `+6`
- Total da Perícia T20 = `Math.floor(Nível / 2) + Mod_Atributo + Bônus_Treinamento + Outros_Bônus`.

---

## 📊 5. Modelo de Dados Relacional (Prisma Schema)

### Entidades Principais:

1. **`Campaign`**: Representa a sala de jogo ou campanha de RPG, vinculando personagens, mapas de VTT e histórico de rolagens.
2. **`Character`**: Armazena a ficha do personagem. Atributos, perícias, ataques, magias, poderes e inventário são mantidos em colunas do tipo string JSON para máxima portabilidade entre motores de banco de dados.
3. **`CompendiumItem`**: Entidade universal do compêndio para Raças, Classes, Magias, Poderes, Talentos, Itens e Ameaças.
4. **`Scene`**: O campo de batalha ou mapa tático do VTT, contendo dimensões em células de 1.5m, textura de fundo e névoa de guerra (*fogDataJson*).
5. **`Token`**: Representação gráfica dos personagens ou monstros no grid do VTT, registrando posição `(x, y)`, tamanho, barras de PV e estados de condição (*conditionsJson*).
6. **`InitiativeEntry`**: Ordem de combate do VTT ordenada por valor de iniciativa e desempate por modificador de Destreza.
7. **`RollLog`**: Registros detalhados de cada dado rolado na sessão, identificando acertos críticos, falhas críticas, remetente e fórmula expandida.

---

## 🎲 6. Subsistema de VTT (Virtual Tabletop)

O VTT em `src/components/vtt/` opera através de um Canvas interativo e camadas em overlay:

1. **`TacticalGridCanvas`**: Renderização do grid quadrado de 1,5m / 5 pés.
2. **`TokenLayer`**: Posição e arraste interativo dos tokens dos personagens e inimigos.
3. **`RangeRulerLayer`**: Régua de alcance dinâmica que calcula a distância exata em metros entre dois pontos utilizando métrica Chebyshev em T20 e métrica 5/10/5 (1.5m / 3m / 1.5m) em TRPG.
4. **`InitiativePanel`**: Painel lateral de controle de rodadas e turnos ativos.
