# 📋 BACKLOG & TODO MASTER — ARTON VTT & TRPG PLATFORM

> **Visão Geral do Produto:**  
> Transformar a plataforma em uma ferramenta de RPG de mesa (Tormenta 20 & TRPG) com estética **monocromática, minimalista e profissional**, oferecendo uma experiência de criação de ficha **super intuitiva para os jogadores** e ferramentas táticas de **alta amplitude para o mestre**.

---

## 🧭 Pilares Centrais da Nova Fase

1. **Design Monocromático & Minimalista:** Substituir o visual supercarregado e cores saturadas por uma paleta neutra, elegante e de alto contraste (tons de cinza/zinc/slate escuros, tipografia legível, bordas sutis e foco na informação).
2. **Responsividade Impecável:** Interface 100% fluida em celular, tablet, notebook e monitores ultrawide, sem sobreposição de gavetas ou quebras de layout.
3. **Rolador de Dados em Tabs (Simples vs Customizado):**
   * **Tab 1 (Simples):** Linha de comando direta (`/r 1d20+5`, `2d6+3`), teclado numérico e atalhos de dados canônicos (d4, d6, d8, d10, d12, d20, d100).
   * **Tab 2 (Customizado):** Seletor estruturado de quantidade de dados, tipo de dado, modificador (+/-), **Classe de Dificuldade (CD alvo)** com indicação automática de sucesso/falha, vantagem/desvantagem e tipo de teste/dano.
4. **Catálogo Completo das 16 Classes Canônicas:** Disponibilizar no criador e no compêndio todas as 14 classes de *Tormenta 20 (Jogo do Ano)* + 2 classes dos suplementos (*Pistoleiro* de Portsmouth e *Malandro* dos Becos).
5. **Ficha Super Intuitiva para o Jogador:** Wizard sem fricção, com pré-visualização limpa, auto-cálculos imediatos e explicações transparentes de cada escolha.
6. **Amplitude de Mestrado para o Narrador:** Painel de combate ágil, consulta rápida a monstros/ameaças, condições com 1 clique, verificação de CD nas rolagens e grid tático sem travamentos.

---

## 📌 Checklist Detalhado de Tarefas (Status & Prioridades)

### 🎨 1. UI Monocromática, Limpeza Visual & Design System
- [x] **1.1. Normalização da Paleta de Cores Monocromática:**
  - Substituir gradientes multicores e neons (vermelhos, amarelos e azuis brilhantes juntos) por uma paleta sóbria de pretos, chumbo, cinzas e acentos em branco/off-white de alto contraste (estilo Foundry VTT / Obsidian / Linear).
  - Manter distinção visual funcional apenas em badges de perigo/alerta crítico, sem poluição visual.
- [x] **1.2. Refatoração dos Componentes Base (`src/components/ui`):**
  - Ajustar `Card`, `Button`, `Badge`, `Input` e modais para estética monocromática com bordas sutis (`border-zinc-800` / `border-zinc-700`).
  - Reduzir sombras e brilhos neon volumosos (`shadow-[0_0_50px_...]`) para sombras naturais e discretas de profundidade.
- [x] **1.3. Limpeza Tipográfica e Hierarquia Visual:**
  - Ajustar títulos em fontes serifadas clássicas e texto funcional em sans-serif limpa com entrelinha confortável.
  - Eliminar poluição visual nas páginas iniciais e cabeçalhos.

---

### 📱 2. Responsividade Global (Mobile, Tablet & Desktop)
- [x] **2.1. Responsividade da Forja de Fichas (`SheetCreationWizard`):**
  - Transformar a gaveta flutuante de pré-visualização (`Live Hero Drawer`) em componente retrátil ou sanfonado em telas menores que 1024px para não cobrir o formulário.
  - Reorganizar grids de seleção de raças, classes e atributos para 1 coluna no mobile e 2 a 3 colunas em desktop.
  - Garantir que a barra de passos do wizard quebre a linha suavemente ou use scroll horizontal sem cortes.
- [ ] **2.2. Responsividade da Mesa Virtual (`/vtt`):**
  - Adaptar o painel de iniciativa, ferramentas de régua e biblioteca de tokens para gavetas deslizantes laterais em telas mobile/tablet.
  - Suporte a gestos touch (pinch-to-zoom e drag) no grid tático.
- [x] **2.3. Responsividade da Enciclopédia & Compêndio (`/knowledge` e `/compendium`):**
  - Adicionar scroll horizontal suave com indicação visual para tabelas de armas de fogo, materiais e condições.
  - Menu de navegação por tomos com seletor drop-down ou carrossel deslizante em smartphones.
- [x] **2.4. Navegação Geral (`Navigation.tsx` e `AppHeader.tsx`):**
  - Menu hambúrguer limpo e acessível em mobile, exibindo Início, VTT, Fichas, Compêndio e Docs sem quebrar a barra superior.

---

### 🎲 3. Rolador de Dados em Tabs (Simples & Customizado com CD)
- [x] **3.1. Reestruturação do Drawer do Rolador (`DiceRollerBar.tsx`):**
  - Adicionar controle de tabs com design monocromático no topo do painel: `[ Rápido / Comando ]` e `[ Construtor Customizado ]`.
- [x] **3.2. Tab 1: Dado Simples & Comando Rápido:**
  - Input minimalista para comandos de texto (ex: `1d20+7`, `3d6+2`, `/r 1d20+12 # Teste de Atletismo`).
  - Barra de botões de dados rápidos de 1 clique: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`.
  - Botões auxiliares de modificadores imediatos: `+1`, `+2`, `+5`, `-1`, `-2` e botão de limpar.
  - Atalho de teclado (tecla `Enter`) e foco automático no input.
- [x] **3.3. Tab 2: Construtor Customizado com CD & Opções:**
  - **Quantidade de Dados:** Seletor numérico de 1 a 20 dados.
  - **Tipo de Dado:** Dropdown/botões para d4, d6, d8, d10, d12, d20, d100.
  - **Modificador Fixo:** Campo numérico para bônus/penalidades (+/-).
  - **Classe de Dificuldade (CD Alvo):** Campo para inserir a CD da tarefa ou da Defesa inimiga (ex: CD 15).
    - Cálculo automático exibido no resultado: **Sucesso**, **Sucesso Crítico**, **Falha** ou **Falha Crítica**.
  - **Vantagem / Desvantagem:** Opção para rolar 2d20 e ficar com o maior (`kh1`) ou menor (`kl1`).
  - **Margem de Ameaça e Multiplicador de Crítico:** Ajuste de crítico (ex: 19-20 / x3).
  - **Rótulo & Tipo de Dano:** Campo de descrição do teste (ex: "Ataque com Espada", "Misticismo", "Bola de Fogo").
- [x] **3.4. Histórico e Modal de Detalhes:**
  - Exibição limpa em lista monocromática com detalhes dos dados individuais rolados, modificador e status contra a CD.

---

### ⚔️ 4. Catálogo das 16 Classes Canônicas
- [ ] **4.1. Diagnóstico do "Só tem duas classes?":**
  - O banco de dados inicial foi criado com apenas 2 classes canônicas no contrato mínimo dos testes unitários legados (`Guerreiro` e `Arcanista`), e embora 10 tivessem sido adicionadas no wizard, faltavam classes centrais do livro básico.
- [ ] **4.2. Implementação das 14 Classes Oficiais de Tormenta 20 (Jogo do Ano):**
  1. `Arcanista` (Mago, Bruxo, Feiticeiro) — Magia Arcana, PV 8+CON, PM 6.
  2. `Bárbaro` — Fúria, Instinto Selvagem, PV 24+CON, PM 3.
  3. `Bardo` — Inspiração, Magia Híbrida, Perícias Variadas, PV 12+CON, PM 4.
  4. `Bucaneiro` — Audácia, Insolência, Evasão, PV 16+CON, PM 3.
  5. `Caçador` — Marca da Presa, Rastreador, Estilo de Disparo/Duas Armas, PV 16+CON, PM 4.
  6. `Cavaleiro` — Baluarte, Código de Honra, Armaduras Pesadas, PV 20+CON, PM 3.
  7. `Clérigo` — Canalizar Energia, Devoção aos Deuses, PV 16+CON, PM 5.
  8. `Druida` — Forma Selvagem, Força da Natureza, PV 16+CON, PM 4.
  9. `Guerreiro` — Ataque Especial, Durabilidade, PV 20+CON, PM 3.
  10. `Inventor` — Engenhosidade, Protótipos, Alquimia & Balística, PV 12+CON, PM 4.
  11. `Ladino` — Ataque Furtivo, Evasão, Especialista em Perícias, PV 12+CON, PM 4.
  12. `Lutador` — Briga desarmada, Golpe Relâmpago, Voadora, PV 20+CON, PM 3.
  13. `Nobre` — Autoconfiança, Orgulho, Comandar, Riqueza, PV 16+CON, PM 4.
  14. `Paladino` — Golpe Divino, Cura pelas Mãos, Aura Sagrada, PV 20+CON, PM 3.
- [ ] **4.3. Implementação das 2 Classes Canônicas de Suplementos:**
  15. `Pistoleiro` (*Piratas e Pistoleiros*) — Especialista em armas de fogo, recarga rápida e duelo de pederneira.
  16. `Malandro` (*Manual do Malandro*) — Sobrevivente das ruas de Valkaria, golpes baixos e trapaças.
- [ ] **4.4. Sincronização Completa:**
  - Atualizar `EXPANDED_CLASSES` no `SheetCreationWizard.tsx`.
  - Atualizar banco de dados via `prisma/seed.ts` mantendo rigorosamente os IDs canônicos exigidos pelos testes existentes (`class-guerreiro-t20` e `class-arcanista-t20`).
  - Atualizar filtros no Compêndio (`/compendium`) para exibir todas as 16 classes categorizadas por função (Combatente, Conjurador, Especialista).

---

### 🧙‍♂️ 5. Forja de Fichas Super Intuitiva para Jogadores
- [ ] **5.1. Fluxo Passo-a-Passo Guiado com Explicações Claras:**
  - Passo 1: Conceito & Arquétipo (ou personalização do zero).
  - Passo 2: Raça & Modificadores visuais imediatos.
  - Passo 3: Classe & Papel de combate explicado com linguagem simples.
  - Passo 4: Atributos com modo guiado (Point Buy com chips visuais ou 4d6 animado).
  - Passo 5: Perícias automáticas + escolha guiada das restantes.
  - Passo 6: Magias & Poderes com descrição inline sem termos confusos.
  - Passo 7: Equipamento inicial inteligente (kits prontos por classe).
  - Passo 8: Revisão e criação com 1 clique.
- [ ] **5.2. Modo "Criador Rápido" (1-Click Archetypes):**
  - Expandir os arquétipos prontos para cobrir as principais vocações com equipamentos, perícias e atributos já distribuídos de forma equilibrada.
- [ ] **5.3. Validações sem Bloqueios Frustrantes:**
  - Alertas suaves para escolhas incompletas em vez de modais intrusivos.
  - Opção de auto-preencher itens restantes se o jogador quiser ir direto para a partida.

---

### 👑 6. Ferramentas de Amplitude para o Mestre de Mesa
- [ ] **6.1. Painel de Controle Rápido do Mestre no VTT:**
  - Gaveta de combate com lista rápida de iniciativa, alteração de PV/PM com botões de +/- instantâneos.
  - Aplicação de condições de batalha (*Abalado, Caído, Cego, Desprevenido, etc.*) em tokens com 1 clique, refletindo no cálculo de ataque/defesa.
- [ ] **6.2. Testes de CD & Dificuldade Integrados:**
  - O mestre pode anunciar uma CD no chat ou no rolador, e todas as rolagens comparam o total contra a CD em tempo real.
- [ ] **6.3. Catálogo Rápido de Ameaças & Bestiário:**
  - Busca rápida de monstros por Nível de Desafio (ND) no VTT para arrastar tokens prontos diretamente para o mapa.
- [ ] **6.4. Histórico Auditável de Rolagens do Mestre:**
  - Opção de rolagens públicas ou secretas para o mestre.

---

## 🔒 Regras de Não-Regressão e Garantia Técnica
* **Preservação de Testes:** Manter 100% dos 433 testes vitest aprovados em todas as execuções (`npm test`).
* **Preservação do Script de Teste:** O script `"test"` no `package.json` deve permanecer estritamente `"vitest run"`.
* **Prisma Provider Dinâmico:** Preservar `scripts/prepare-prisma.js` para alternar entre SQLite local e PostgreSQL em produção sem quebras.
* **Build de Produção Limpo:** Garantir compilação com saída limpa (`npm run build` com exit code 0).
