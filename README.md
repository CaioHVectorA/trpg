# Plataforma Tormenta RPG Multi-Sistema (T20 & TRPG Clássico)

> Plataforma web all-in-one, modular e extensível voltada para **Tormenta 20 (Jogo do Ano)** com suporte e retrocompatibilidade para **Tormenta RPG clássico (Edição Revisada)**, integrando construtor de fichas dinâmico, grid tático de combate (VTT), rolador de dados d20 contextualizado e compêndio de regras interativo.

---

## 📚 Documentação Abrangente do Sistema (`/docs`)

Acesse os manuais técnicos e guias de arquitetura detalhados na pasta [`/docs`](./docs/):

1. 📐 [**Arquitetura do Sistema e DAG (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md)
   - Visão geral, stack tecnológica, motor de cálculo reativo (DAG), discriminação multi-sistema e modelo de dados.
2. 🌐 [**Referência de APIs Públicas REST (`docs/API_REFERENCE.md`)**](./docs/API_REFERENCE.md)
   - Especificação completa dos endpoints `/api/characters`, `/api/scenes`, `/api/tokens`, `/api/rolls` e `/api/compendium`.
3. 🛠️ [**Utilitários e Motor de Regras (`docs/UTILITIES_AND_HELPERS.md`)**](./docs/UTILITIES_AND_HELPERS.md)
   - Documentação interna dos módulos `lib/rules`, `lib/dice`, `lib/vtt` e contratos TypeScript em `lib/types`.
4. 🎯 [**Comparativo VTT (Roll20) e Roadmap Real-Time (`docs/ROLL20_COMPARISON_AND_ROADMAP.md`)**](./docs/ROLL20_COMPARISON_AND_ROADMAP.md)
   - Matriz comparativa com Roll20 e Foundry VTT e arquitetura WebSockets/SSE para sessões de RPG virtuais ao vivo.
5. 🚀 [**Guia de Deploy, Docker e Operações (`docs/DEPLOYMENT_AND_OPERATIONS.md`)**](./docs/DEPLOYMENT_AND_OPERATIONS.md)
   - Execução local zero-friction, deploy em produção na Vercel com Supabase (PostgreSQL) e conteinerização Docker.

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
- API REST pública `/api/compendium` para pesquisas parametrizadas na web e em aplicativos móveis.

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

A aplicação conta com mais de **428 testes automatizados** cobrindo regras de Tormenta, analisador de dados, grid tático e persistência via Vitest.

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

## 📜 Licença e Créditos
Este projeto foi desenvolvido como uma plataforma modular para mesas de RPG baseadas no universo de Tormenta, em conformidade com as regras oficiais de **Tormenta 20** e **Tormenta RPG** da Editora Jambô.
