# 🚀 PLANEJAMENTO DE SPRINTS — ARTON VTT (PARADIGMA ROLL20 & VTT ABERTO)

> **Visão de Execução:**  
> Desenvolvimento ágil estruturado para entregar uma plataforma de RPG de mesa flexível, aberta e poderosa, que apoie jogadores na criação ágil de fichas com **IntelliSense/sugestões dos livros sem engessar regras**, e conceda ao mestre **máxima amplitude no jogo ativo** (Grid tático, Canvas de cenas, mapa com pins dos jogadores, chat em tempo real e módulos de IA).

---

## 📊 Quadro Geral de Sprints

| Sprint | Tema / Foco | Entregáveis Principais | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | **UI Monocromática & Rolador Dual-Tab** | Design escuro neutro (Foundry/Obsidian), layout responsivo com gaveta retrátil mobile, rolador em abas (Simples vs Customizado com CD). | ✅ **Concluída** |
| **Sprint 2** | **Ficha Flexível & IntelliSense (Roll20-Style)** | Ficha 100% editável e extensível (homebrews/custom), auto-complete com dados oficiais dos livros (Magias, Poderes, Raças, Classes), cálculo sugerido com override manual. | 🎯 **Próxima** |
| **Sprint 3** | **Sessões Vivas & Chat em Tempo Real** | Feed de chat sincronizado da mesa, exibição de rolagens com cliques na ficha, comandos `/r` e `/w`, histórico persistente de campanha. | ⏳ **Planejada** |
| **Sprint 4** | **Grid Tático, Canvas de Cenas & Mapa Mundial** | Grid de 1,5m com tokens e auras, painel de iniciativa dinâmico, Canvas do mestre para projeção de cenas/NPCs e aba de mapa com pins dos jogadores. | ⏳ **Planejada** |
| **Sprint 5** | **Módulos AI-Powered (Assistentes do Mestre & Jogador)** | Narrador de cenas por IA, forja rápida de NPCs com IA e oráculo contextual de regras. | ⏳ **Planejada** |

---

## 🏃 SPRINT 1: UI Monocromática & Rolador Dual-Tab ✅ (Concluída)
* **Design System Monocromático:** Transição de gradientes e neons para tons neutros (`zinc-950`/`zinc-900`/`zinc-100`).
* **Responsividade Mobile:** Criador de fichas com barra inferior retrátil em telas pequenas para não bloquear inputs.
* **Rolador de Dados em Tabs:**
  * Aba 1: Comando livre (`1d20+7`) e botões rápidos `d4` a `d100`.
  * Aba 2: Construtor customizado com CD e cálculo de **Sucesso**, **Sucesso Crítico**, **Falha** ou **Falha Crítica**.
* **Validação:** 433/433 testes vitest passando e build de produção no ar na Vercel.

---

## 🧙‍♂️ SPRINT 2: Ficha Flexível & IntelliSense dos Livros (Roll20-Style)

### 🎯 Objetivo
Transformar a ficha de personagem em uma ferramenta totalmente aberta e extensível, onde o jogador pode criar ou modificar qualquer classe, raça ou magia sem travas de regras, contando com um **sistema de auto-complete inteligente (IntelliSense)** alimentado pelo compêndio de Tormenta dos 6 livros para acelerar o preenchimento.

### 📝 Histórias de Usuário & Tarefas
* **US 2.1 — Ficha Aberta e Extensível (Zero Bloqueios):**
  * *Como* jogador usando uma raça ou classe customizada/homebrew, *quero* poder digitar qualquer nome de classe, valores de atributos ou perícias livres na minha ficha.
  * **Tarefas Técnicas:**
    * Permitir edição livre de todos os campos de atributos, defesas, PV, PM e deslocamento.
    * Auto-cálculos atuam como assistência e preenchimento sugerido, mantendo botão de "Override Manual".
* **US 2.2 — Sistema de IntelliSense & Autocomplete do Compêndio:**
  * *Como* jogador preenchendo minhas magias ou poderes, *quero* começar a digitar o nome (ex: *"Bola de Fogo"*, *"Ataque Especial"*, *"Malandragem"*) e ver as opções oficiais dos livros para preenchimento automático.
  * **Tarefas Técnicas:**
    * Componente de campo com autocompletar inteligente consultando o banco do compêndio em tempo real.
    * Ao selecionar uma opção do dropdown, preencher automaticamente: Custo de PM, Dano, Círculo, Alcance e Descrição completa, permitindo edições posteriores.
* **US 2.3 — Catálogo de Magias & Poderes Prontos para Uso:**
  * *Como* jogador ou mestre, *quero* abrir uma gaveta lateral de compêndio e clicar em "Adicionar à Ficha" para importar magias e itens na hora.
  * **Tarefas Técnicas:**
    * Integração entre o navegador do compêndio (`CompendiumBrowser`) e a ficha do herói.
* **US 2.4 — Exportação, Importação e Impressão:**
  * *Como* usuário, *quero* salvar e carregar minhas fichas em JSON ou imprimir em layout limpo.
  * Arquivos: `src/components/sheet/CharacterSheetView.tsx`, `src/components/sheet/SheetCreationWizard.tsx`, `src/components/compendium/CompendiumBrowser.tsx`.

---

## 💬 SPRINT 3: Sessões Vivas, Chat Integrado & Feed de Rolagens

### 🎯 Objetivo
Construir a espinha dorsal de comunicação da mesa de jogo: um chat persistente onde todas as ações dos jogadores (mensagens, rolagens de dados com clique na ficha, magias, comandos manuais e sussurros) aparecem formatados de forma rica e sincronizada.

### 📝 Histórias de Usuário & Tarefas
* **US 3.1 — Chat da Mesa em Tempo Real (Roll20-Style):**
  * *Como* jogador ou mestre, *quero* enviar mensagens de chat e ver as rolagens de todos em tempo real.
  * **Tarefas Técnicas:**
    * Feed de chat unificado com suporte a Markdown básico e nomes dos personagens.
    * Comandos de chat suportados:
      - `/r [fórmula]` ou `/roll [fórmula]` (ex: `/r 1d20+8 # Ataque`).
      - `/w [gm|jogador] [mensagem]` (sussurros privados).
      - `/desc [texto]` (descrições narrativas de cena sem identificador de personagem).
      - `/init [bônus]` (rolagem automática para entrar no painel de iniciativa).
* **US 3.2 — Clique Direto da Ficha para o Chat:**
  * *Como* jogador, *quero* clicar no meu ataque de espada, teste de perícia ou magia na ficha e ver o card com o resultado aparecer imediatamente no chat para todos.
  * **Tarefas Técnicas:**
    * Integração de gatilhos de clique na ficha despachando payloads para o chat e histórico da sessão.
* **US 3.3 — Persistência de Histórico de Sessão:**
  * *Como* mestre, *quero* que o log de mensagens e rolagens da campanha fique salvo para consulta em sessões posteriores.
  * Arquivos: `src/components/vtt/TacticalGridCanvas.tsx`, `src/components/dice/DiceContext.tsx`, `src/app/api/rolls/route.ts`.

---

## 🗺️ SPRINT 4: Grid Tático, Canvas de Cenas, NPCs & Mapa com Marcadores

### 🎯 Objetivo
Consolidar a experiência in-play do mestre e dos jogadores: grid de combate com tokens interativos, painel de projeção de cenas/handouts, rastreador de turnos e mapa de viagem com marcadores dos personagens.

### 📝 Histórias de Usuário & Tarefas
* **US 4.1 — Grid Tático de Combate & Permissões:**
  * *Como* mestre e jogador, *quero* mover tokens no grid com réguas de alcance e visualização de barras de PV/PM sobre a miniatura.
  * **Tarefas Técnicas:**
    * Tokens com auras de alcance (Curto 9m, Médio 30m, etc.) e badges de condições (*Abalado, Caído, Cego*).
    * Sistema de controle: o jogador só pode mover o token vinculado à sua ficha; o mestre tem controle total.
* **US 4.2 — Painel de Iniciativa & Rastreador de Rodadas:**
  * *Como* mestre, *quero* gerenciar os turnos dos combatentes com botão de avançar rodada que avisa o próximo jogador no chat.
* **US 4.3 — Canvas de Cenas & Handouts do Narrador:**
  * *Como* mestre, *quero* trocar o modo de exibição de "Grid de Batalha" para "Cena Narrativa", projetando a arte de uma taverna, ruína ou retrato de NPC para os jogadores.
* **US 4.4 — Aba de Mapa Mundial com Marcadores dos Jogadores:**
  * *Como* narrador, *quero* uma aba de mapa (Arton, Valkaria, Moreania) onde posso posicionar e mover os marcadores dos jogadores durante as viagens entre reinos.
  * Arquivos: `src/components/vtt/TacticalGridCanvas.tsx`, `src/components/vtt/InitiativePanel.tsx`.

---

## 🤖 SPRINT 5: Recursos com Inteligência Artificial (AI-Powered)

### 🎯 Objetivo
Integrar ferramentas generativas assistidas por IA para acelerar a preparação de sessões do mestre e enriquecer a criação de conceitos dos jogadores.

### 📝 Histórias de Usuário & Tarefas
* **US 5.1 — Narrador de Cenas & Ambientes (AI Scene Narrator):**
  * *Como* mestre em jogo ativo, *quero* pedir uma descrição atmosférica com 1 clique (ex: *"Descreva uma cripta de Khalmyr abandonada com cheiro de incenso antigo e poeira mágica"*).
* **US 5.2 — Forja Rápida de NPCs & Ameaças por IA:**
  * *Como* narrador pego de surpresa pelos jogadores, *quero* gerar em segundos um NPC com nome, objetivo, personalidade e estatísticas básicas de Tormenta.
* **US 5.3 — Oráculo de Regras por IA:**
  * *Como* mestre ou jogador com dúvida tática, *quero* perguntar sobre uma manobra ou interação de poderes e receber uma resposta concisa baseada nas regras oficiais.

---

## 🔒 Critérios de Qualidade e Não-Regressão
1. **433/433 Testes Vitest:** Todos os testes unitários e de integração de regras permanecem 100% aprovados.
2. **Sem Travas de Regras:** A plataforma atua como assistente/facilitador, nunca como limitador.
3. **Performance Visual:** Animações e renderização do grid operando a 60 FPS.
