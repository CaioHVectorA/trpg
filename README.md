# Plataforma Tormenta RPG Multi-Sistema (T20 & TRPG Clássico)

> Plataforma web all-in-one, modular e extensível voltada para **Tormenta 20 (Jogo do Ano)** com suporte e retrocompatibilidade para **Tormenta RPG clássico (Edição Revisada)**, integrando construtor de fichas dinâmico, grid tático de combate (VTT), rolador de dados d20 contextualizado e compêndio de regras interativo.

---

## 🌟 Principais Recursos

### 1. ⚔️ Motor Multi-Sistema Modular
- **Tormenta 20 (JdA)**: Atributos baseados em modificadores diretos (-1 a +4 no point-buy), Pontos de Mana (PM) para magias e habilidades com limite de gasto por rodada igual ao nível do personagem, treinamento escalonado (+2, +4, +6) e Defesa sem metade do nível para personagens jogadores (armadura pesada zera destreza).
- **Tormenta RPG (TRPG Clássico)**: Atributos clássicos 3 a 18 (`floor((Score - 10) / 2)`), BBA tradicional, graduações de perícia, e Classe de Armadura (CA) com metade do nível.

### 2. 🛡️ Construtor e Gerenciador de Fichas Dinâmicas (`/characters`)
- Criação interativa com alternância instantânea entre T20 e TRPG.
- **Cálculo Reativo Automático (DAG)**: Atualização em tempo real de PV Máximo, PM Máximo, Defesa/CA, Capacidade de Carga e bônus de perícias.
- **Rastreadores de Combate**: Botões rápidos de controle de PV e PM (+/-).
- **Rolagens Diretas (Click-to-Roll)**: Clique em qualquer atributo, perícia ou ataque para rolar o teste imediatamente.

### 3. 🎲 Rolador de Dados Contextualizado d20
- Barra global flutuante acessível em todas as telas com histórico de rolagens.
- Suporte a fórmulas textuais (ex: `1d20+7 # Luta`, `2d6+4 # Espada Longa`, `1d20+10 # Ataque`).
- Detecção nativa de **Acerto Crítico** (20 natural ou margem de ameaça configurável, ex: 19-20/x2) e **Falha Crítica** (1 natural).
- Cálculo automático de multiplicadores de dano e dados extras por investimento de PM.

### 4. 🗺️ Grid Tático de Combate / VTT (`/vtt`)
- Grid quadrado de 1,5m / 5 pés por célula.
- Posicionamento e movimentação de tokens (jogadores e monstros) com barras de PV e status.
- **Régua de Alcance Dinâmica**: Métricas Chebyshev (T20) e 5/10/5 (TRPG), identificando faixas de alcance (*Toque*, *Curto 9m*, *Médio 18m*, *Longo 36m*).
- **Rastreador de Iniciativa**: Ordenação automática com desempate por Destreza, avanço e retrocesso de turnos e contagem de rodadas.

### 5. 📖 Compêndio Canônico de Arton (`/compendium`)
- Catálogo interativo com busca instantânea por nome, tipo, sistema e tags.
- 12 entidades canônicas pré-carregadas (Raças, Classes, Magias, Poderes, Itens e Ameaças).
- Modal com regras completas, círculos e custos de PM.

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
- **Node.js**: v18+ (recomendado v20+)
- **NPM** ou **Yarn**

### 1. Instalação de Dependências
```bash
npm install
```

### 2. Configurar o Banco de Dados (SQLite Plug-and-Play)
Por padrão, o projeto utiliza SQLite local zero-friction (`file:./dev.db`), sem necessidade de instalar ou rodar servidores de banco de dados externos.

```bash
# Gera o cliente tipado do Prisma
npm run prisma:generate

# Sincroniza o schema com o banco local
npm run prisma:push

# Popula o banco com os dados canônicos de Tormenta
npm run prisma:seed
```

### 3. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🧪 Suíte de Testes Automatizados

A aplicação conta com mais de **200 testes automatizados** (Tiers 1 a 4) cobrindo regras de Tormenta, analisador de dados, grid tático e persistência via Vitest.

```bash
# Executa todos os testes
npm test

# Executa os testes em modo watch
npm run test:watch
```

### Verificação de Build de Produção
```bash
npm run build
```

---

## 🐘 Deploy & Migração para PostgreSQL (Vercel / Neon / Supabase)

O esquema Prisma (`prisma/schema.prisma`) foi modelado de forma 100% universal e declarativa.

### Deploy 100% Grátis na Vercel + Neon Postgres (Recomendado)
1. Conecte o repositório na Vercel.
2. Na aba **Storage** do seu projeto Vercel, adicione a integração **Postgres (Neon)** do Vercel Marketplace.
3. A Vercel injetará automaticamente a variável `DATABASE_URL`.
4. No arquivo `prisma/schema.prisma`, certifique-se de que o datasource está configurado para `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
5. Execute `npm run prisma:push` e `npm run prisma:seed` no seu ambiente para sincronizar e popular o banco.

### Migração para Supabase PostgreSQL
1. Obtenha a connection string do seu projeto no Supabase (em *Project Settings -> Database*).
2. No arquivo `.env`, altere:
```env
DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres?schema=public"
```
3. No arquivo `prisma/schema.prisma`, altere o datasource para `postgresql`.
4. Execute `npm run prisma:push` e `npm run prisma:seed`.

---

## 📐 Estrutura do Código

```
trpg-platform/
├── prisma/
│   ├── schema.prisma        # Schema universal de entidades (Campaign, Character, Scene, Token, Compendium)
│   └── seed.ts              # Seed canônica com entidades oficiais de Tormenta
├── src/
│   ├── app/                 # Next.js 14 App Router (/, /characters, /vtt, /compendium)
│   ├── components/
│   │   ├── dice/            # Contexto e barra visual do rolador d20
│   │   ├── sheet/           # Gerenciador e formulário reativo de fichas
│   │   ├── vtt/             # Canvas interativo do grid tático e iniciativa
│   │   ├── compendium/      # Navegador e busca de regras
│   │   ├── layout/          # Header, navegação e tema visual de Arton
│   │   └── ui/              # Componentes de design system (Card, Button, Badge)
│   └── lib/
│       ├── rules/           # Motor puro de regras T20 e TRPG
│       ├── dice/            # Parser de dados e resolução matemática de críticos
│       ├── vtt/             # Métricas de distância e iniciativa
│       └── types/           # Interfaces TypeScript compartilhadas
└── tests/
    ├── e2e/                 # Testes de ponta a ponta organizados em Tiers
    └── unit/                # Testes de fundação e banco de dados
```

---

## 📜 Licença e Créditos
Este projeto foi desenvolvido como uma plataforma modular para mesas de RPG baseadas no universo de Tormenta, em conformidade com as regras oficiais de **Tormenta 20** e **Tormenta RPG** da Editora Jambô.
