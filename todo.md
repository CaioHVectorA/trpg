# 📋 BACKLOG & TODO MASTER — ARTON VTT & TRPG PLATFORM
> **Visão de Produto (Paradigma Roll20 & VTT Aberto):**  
> Uma plataforma de mesa virtual (VTT) e gerenciador de fichas para Tormenta 20 e TRPG que **não impõe restrições rígidas de regras**, mas oferece **estruturação inteligente, sugestões/IntelliSense, compêndio aberto e liberdade total de customização** para jogadores e mestres. Foco central no *In-Play* (Grid tático, Canvas de cenas/NPCs, chat sincronizado com dados, mapa mundial e ferramentas de IA).

---

## 🧭 Pilares da Arquitetura do VTT Aberto

1. **Liberdade & Extensibilidade Total (Roll20-Style):**
   * A plataforma não bloqueia edições de atributos, perícias, magias ou classes.
   * Compêndio com sugestões inteligentes e auto-complete (IntelliSense) de magias, poderes, raças e equipamentos prontos, permitindo que o jogador/mestre crie homebrews, modifique fórmulas ou insira dados livres a qualquer momento.
2. **Núcleo de Jogo Ativo (In-Play Experience):**
   * **Grid Tático & Tokens:** Grid quadrado (1,5m), réguas de alcance, barras de vida/mana sobre os tokens, auras de alcance e controle de permissões de movimentação (jogador controla seu herói, mestre controla todos).
   * **Canvas de Cenas & NPCs:** Espaço visual para o mestre projetar artes de cenário, retratos de NPCs, handouts de documentos e descrições narrativas imersivas.
   * **Mapa de Viagem & Localização:** Aba de mapa regional/mundial com marcadores dos personagens (pins) controlados pelo narrador para acompanhar viagens por Arton.
3. **Sessões Vivas, Chat & Sincronização em Tempo Real:**
   * Persistência completa do estado da campanha/sessão.
   * Chat integrado onde todas as rolagens (do rolador ou clique direto na ficha), comandos `/r`, sussurros para o mestre (`/w gm`), iniciativas e avisos de condições são transmitidos ao vivo.
4. **Design Monocromático, Limpo & Responsivo:**
   * Estética escura, minimalista, sem poluição visual (tons de zinco/grafite, alto contraste, tipografia nítida).
   * Experiência suave tanto em desktop (telas grandes com múltiplos painéis) quanto no celular/tablet (gavetas retráteis e toque fluido).
5. **Módulos Prontos para Recursos com Inteligência Artificial (AI-Powered):**
   * Arquitetura preparada para integração de IA: Narrador de Cenas, Gerador Rápido de NPCs/Monstros, Assistente de Background de Personagem e Oráculo de Dúvidas de Regras.

---

## 📌 Backlog Estruturado de Tarefas

### 🎨 1. UI Monocromática & Experiência Responsiva
- [x] **1.1. Design System Monocromático Minimalista:**
  - Aplicação de paleta neutra (`zinc-950`, `zinc-900`, `zinc-800`, `zinc-100`) eliminando neons e gradientes excessivos.
  - Componentes base (`Card`, `Badge`, `Button`, `Input`) padronizados com bordas finas e sombras discretas.
- [x] **1.2. Responsividade Mobile-First:**
  - Gaveta retrátil de resumo no mobile (`SheetCreationWizard`) e navegação hambúrguer responsiva.
  - Rolagem horizontal fluida em tabelas de dados.
- [ ] **1.3. Layout Multi-Painel para Telas Grandes (Modo Mesa / Desktop):**
  - Grid com abas redimensionáveis: Canvas Central + Painel Lateral (Chat/Dados/Iniciativa/Notas).

---

### 🎲 2. Motor de Rolagens & Chat em Tempo Real
- [x] **2.1. Rolador Dual-Tab (Simples vs Customizado com CD):**
  - Tab 1: Comandos rápidos (`/r 1d20+7`) e botões diretos de `d4` a `d100`.
  - Tab 2: Construtor customizado com quantidade, modificador, vantagem/desvantagem e verificação automática contra CD.
- [ ] **2.2. Chat Unificado da Sessão (Roll20-Style):**
  - Feed de mensagens em tempo real integrando rolagens de dados, mensagens de texto dos jogadores e narrativas do mestre.
  - Comandos de barra: `/r [fórmula]`, `/w [jogador/gm] [mensagem]`, `/desc [texto de cena]`, `/init [bônus]`.
  - Exibição de cards ricos de ataques e magias acionados direto da ficha.
- [ ] **2.3. Sincronização e Persistência de Sessão:**
  - Persistência das mensagens, rolagens e histórico da campanha no banco de dados.

---

### 🧙‍♂️ 3. Ficha Flexível & IntelliSense (Sem Bloqueios de Livro)
- [ ] **3.1. Modo Ficha Livre & Extensível:**
  - Permitir que o jogador edite livremente qualquer campo (nome da raça, classe inventada, valores de atributos, perícias personalizadas).
  - Cálculos automáticos como *sugestão* (PV, PM, Defesa), mas com opção de sobreposição manual (override) pelo jogador ou mestre.
- [ ] **3.2. IntelliSense & Auto-Complete do Compêndio:**
  - Ao digitar o nome de uma Magia, Poder, Arma ou Equipamento, exibir dropdown de autocompletar com dados canônicos dos livros de Tormenta.
  - Botão "Inserir Dados Oficiais": preenche automaticamente custo de PM, círculo, alcance, dano e descrição, mantendo os campos editáveis.
- [ ] **3.3. Compêndio Aberto de Magias & Poderes (Prontos para Arrastar/Copiar):**
  - Catálogo completo das magias e poderes dos livros (T20, TRPG, Malandro, Piratas, Moreania) com busca instantânea e botão de 1 clique para adicionar à ficha.
- [ ] **3.4. Exportação & Importação Universal:**
  - Exportação e importação instantânea em JSON e impressão limpa da ficha.

---

### 🗺️ 4. Mesa Virtual (VTT), Grid Tático & Canvas de Cenas
- [ ] **4.1. Grid Tático com Controle de Tokens:**
  - Arraste suave de tokens em grid de 1,5m com réguas de alcance (Chebyshev, Euclidiana, Faixas de Alcance T20).
  - Barras de PV/PM integradas sobre o token, indicadores de condições (Abalado, Caído, Cego, etc.) e auras visuais.
  - Permissões de controle: Jogador move apenas seu token; Mestre move qualquer combatente.
- [ ] **4.2. Painel de Iniciativa & Turn Tracker Dinâmico:**
  - Lista de turnos ordenada com desempate por Destreza.
  - Botão "Avançar Turno/Rodada" que notifica no chat e sincroniza efeitos com duração em rodadas.
- [ ] **4.3. Canvas de Cenas & Handouts do Narrador:**
  - Painel onde o mestre pode projetar imagens de ambiente, artes de tavernas/ruínas e retratos de NPCs para todos os jogadores.
  - Bloco de notas narrativo da cena compartilhado ou secreto do mestre.
- [ ] **4.4. Aba de Mapa Regional com Localização dos Jogadores:**
  - Visualizador de mapa do mundo (Arton / Moreania / Valkaria) com pins dos personagens que o mestre pode arrastar para indicar a rota da comitiva.

---

### 🤖 5. Módulos Preparatórios para Recursos de IA (AI-Powered)
- [ ] **5.1. IA Narradora de Cenas & Ambientes (Prompt & Context Helper):**
  - Gerador de descrições sensoriais de salas, clima, clima de combate e aromas para o mestre narrar com riqueza de detalhes.
- [ ] **5.2. Forja de NPCs & Ameaças por IA:**
  - Geração instantânea de fichas rápidas de bandidos, monstros e cidadãos com personalidade, táticas de combate e itens.
- [ ] **5.3. Oráculo de Regras com IA:**
  - Consulta contextual de regras de combate e manobras para dirimir dúvidas da mesa sem pausar a sessão.

---

## 🛡️ Diretrizes de Manutenção Técnica
* **100% dos Testes Preservados:** Manter todos os testes unitários e de integração verdes (`npm test`).
* **Compilação e Deploy Contínuo:** Build limpo sem erros de tipo no Next.js (`npm run build`).
* **Multi-Database Agnostic:** Compatibilidade com SQLite (dev) e PostgreSQL (Vercel).
