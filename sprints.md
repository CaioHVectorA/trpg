# 🚀 PLANEJAMENTO DE SPRINTS — ARTON VTT & TRPG PLATFORM

> **Objetivo Estratégico:**  
> Transformar a plataforma em uma ferramenta de referência para Tormenta 20 e TRPG, com visual **monocromático e limpo**, criação de personagens **super intuitiva para jogadores** e ferramentas táticas com **ampla liberdade e controle para o mestre**.

---

## 📊 Visão Geral do Roadmap de Sprints

| Sprint | Foco Principal | Entregáveis Chave | Impacto para Usuários |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | **UI Monocromática & Responsividade** | Paleta limpa em tons neutros/chumbo, eliminação de neons saturados, layout responsivo mobile/tablet, navegação sem quebras. | Visual profissional, leitura sem fadiga e suporte total a celulares e tablets. |
| **Sprint 2** | **Rolador de Dados em Tabs (Simples & Customizado)** | Tab 1 (Comando rápido + botões d4-d100) e Tab 2 (Qtd, tipo, modificador, **CD alvo com Sucesso/Falha**, vantagem). | Rolagens instantâneas para jogadores e resolução ágil de desafios para o mestre. |
| **Sprint 3** | **16 Classes Canônicas & Forja Intuitiva do Jogador** | Inclusão de todas as 14 classes de T20 + 2 de suplementos; wizard simplificado e guiado com prévia fluida e auto-cálculos. | Criação de personagens rápida, prazerosa e sem dúvidas para iniciantes e veteranos. |
| **Sprint 4** | **Amplitude do Mestre de Mesa (VTT & Ferramentas)** | Painel rápido de combate, aplicação de condições em 1 clique, bestiário por ND no grid e rolagens secretas do narrador. | O mestre gerencia combates complexos com agilidade e amplitude total. |

---

## 🏃 SPRINT 1: UI Monocromática, Minimalismo & Responsividade Global

### 🎯 Objetivo da Sprint
Substituir o visual carregado de cores e efeitos por uma estética monocromática refinada (estilo Foundry VTT / Obsidian / Linear), simplificando a interface e tornando todas as telas (fichas, VTT, enciclopédia) 100% responsivas para celulares, tablets e desktops.

### 📝 Histórias de Usuário & Tarefas
* **US 1.1 — Design System Monocromático:**
  * *Como* usuário da plataforma, *quero* uma interface escura, limpa e com alto contraste, *para* poder ler fichas e tabelas por horas sem cansaço visual.
  * **Tarefas Técnicas:**
    * Substituir acentos excessivos de amarelo, vermelho e ciano por tons neutros (`zinc-950`, `zinc-900`, `zinc-800`, `zinc-400`, `zinc-100`).
    * Refatorar variantes do componente `Badge` e `Button` para estilos monocromáticos sóbrios com bordas sutis.
    * Reduzir sombras difusas e neons volumosos (`blur-3xl`, `shadow-[0_0_50px]`) em favor de sombras de relevo discretas e elegantes.
    * Arquivos: `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/app/globals.css`.
* **US 1.2 — Responsividade do Criador de Fichas:**
  * *Como* jogador em dispositivo móvel, *quero* que o assistente de fichas não tenha partes cortadas ou a tela encoberta pela gaveta flutuante.
  * **Tarefas Técnicas:**
    * Transformar a gaveta flutuante (`Live Hero Preview`) em painel colapsável/sanfonado em telas menores que `lg` (1024px).
    * Ajustar passos e formulários para grade de coluna única em smartphones com padding confortável.
    * Arquivo: `src/components/sheet/SheetCreationWizard.tsx`.
* **US 1.3 — Responsividade do Cabeçalho e Navegação:**
  * *Como* usuário, *quero* navegar entre Início, VTT, Fichas, Grimório e Enciclopédia no celular sem que os botões se sobreponham.
  * **Tarefas Técnicas:**
    * Implementar menu mobile limpo com gaveta ou dropdown minimalista.
    * Arquivos: `src/components/layout/Navigation.tsx`, `src/components/layout/AppHeader.tsx`.
* **US 1.4 — Responsividade das Tabelas da Enciclopédia:**
  * *Como* mestre consultando regras no celular, *quero* navegar facilmente pelas tabelas de armas e condições.
  * **Tarefas Técnicas:**
    * Adicionar contêiner de scroll horizontal suave com indicador de rolagem para tabelas de armas de fogo e materiais.
    * Arquivo: `src/app/knowledge/page.tsx`.

### 🏁 Critérios de Aceite (DoD):
* [ ] Paleta monocromática aplicada em todas as páginas principais.
* [ ] Zero overflow horizontal indesejado em resoluções de 375px (iPhone SE) a 4K.
* [ ] Todos os 433 testes do Vitest passando sem falhas (`npm test`).
* [ ] Build de produção sem avisos de compilação (`npm run build`).

---

## 🎲 SPRINT 2: Rolador de Dados Dual-Tab (Simples vs Customizado com CD)

### 🎯 Objetivo da Sprint
Reformular completamente o drawer do rolador de dados flutuante, introduzindo uma interface dividida em duas abas dedicadas: uma para comandos rápidos e cliques diretos, e outra para construção detalhada de testes táticos com conferência automática contra a Classe de Dificuldade (CD).

### 📝 Histórias de Usuário & Tarefas
* **US 2.1 — Navegação em Tabs no Rolador:**
  * *Como* jogador ou mestre, *quero* alternar rapidamente entre rolagem rápida e rolagem customizada avançada.
  * **Tarefas Técnicas:**
    * Criar seletor de tabs minimalista no topo de `DiceRollerBar.tsx`:
      - `[ Dado Rápido / Comando ]`
      - `[ Construtor Customizado ]`
* **US 2.2 — Tab 1: Dado Simples & Comando Rápido:**
  * *Como* jogador, *quero* digitar um comando livre como `1d20+7` ou clicar num `d20` para rolar imediatamente.
  * **Tarefas Técnicas:**
    * Campo de input com atalho de teclado `Enter` e histórico de comandos recentes.
    * Botões rápidos monocromáticos de dados canônicos: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`.
    * Botões de soma rápida: `+1`, `+2`, `+5`, `-1`, `-2` e `Limpar`.
* **US 2.3 — Tab 2: Construtor Customizado com Teste contra CD:**
  * *Como* mestre ou jogador fazendo teste de resistência ou ataque, *quero* definir a CD alvo e ver na hora se passei ou falhei.
  * **Tarefas Técnicas:**
    * Seletores estruturados:
      - Quantidade de dados (stepper numérico de 1 a 20).
      - Tipo de dado (`d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`).
      - Modificador (+ / - campo numérico).
      - **Campo de Classe de Dificuldade (CD Alvo):** ex: CD 15, CD 20.
      - **Vantagem / Desvantagem:** Opção para rolar 2d20 e manter o melhor (`kh1`) ou o pior (`kl1`).
      - **Margem de Ameaça e Multiplicador de Crítico:** ex: 19-20 / x3.
      - **Rótulo do Teste:** ex: "Iniciativa", "Ataque", "Reflexos contra Bola de Fogo".
    * Avaliação automática do resultado exibida em destaque:
      - ✅ **Sucesso** (Total ≥ CD)
      - 🌟 **Sucesso Crítico** (20 natural ou crítico atendendo à CD)
      - ❌ **Falha** (Total < CD)
      - 💀 **Falha Crítica** (1 natural no d20)
* **US 2.4 — Histórico e Notificação Sonora Sutil:**
  * *Como* usuário, *quero* ver no histórico o resultado do teste comparado com a CD estipulada.
  * Arquivos: `src/components/dice/DiceRollerBar.tsx`, `src/components/dice/DiceLogHistory.tsx`, `src/lib/dice/evaluator.ts`.

### 🏁 Critérios de Aceite (DoD):
* [ ] Aba Simples executa comandos de texto e botões rápidos em menos de 100ms.
* [ ] Aba Customizada calcula acerto/falha contra a CD configurada com feedback visual claro.
* [ ] Compatibilidade total mantida com o `DiceContext` e o motor `DiceEngine`.
* [ ] 100% dos testes unitários de dados continuam verdes.

---

## ⚔️ SPRINT 3: O Panteão Completo das 16 Classes & Forja Intuitiva do Jogador

### 🎯 Objetivo da Sprint
Resolver a ausência das classes canônicas, implementando as 14 classes oficiais do livro básico de *Tormenta 20 (Jogo do Ano)* mais as 2 classes dos suplementos de Tormenta (*Pistoleiro* e *Malandro*). Transformar a criação de ficha em um fluxo guiado, transparente e sem bloqueios técnicos.

### 📝 Histórias de Usuário & Tarefas
* **US 3.1 — Catálogo Completo das 16 Classes:**
  * *Como* jogador de Tormenta, *quero* poder criar qualquer uma das classes oficiais do sistema sem estar limitado a apenas algumas opções.
  * **As 14 Classes de T20 (Jogo do Ano):**
    1. `Arcanista` (Mago, Bruxo, Feiticeiro)
    2. `Bárbaro` (Fúria selvagem, combatente de alta vitalidade)
    3. `Bardo` (Inspiração, canções e magia versátil)
    4. `Bucaneiro` (Especialista acrobático com florete e pistola)
    5. `Caçador` (Rastreador letal com marca da presa)
    6. `Cavaleiro` (Tanque blindado focado em honra e desafio)
    7. `Clérigo` (Canalizador divino dos 20 Deuses)
    8. `Druida` (Guardião da natureza e mestre da forma selvagem)
    9. `Guerreiro` (Mestre tático de armas marciais)
    10. `Inventor` (Gênio de engenhocas, armas de fogo e poções)
    11. `Ladino` (Especialista em furtividade e ataque furtivo)
    12. `Lutador` (Combatente corpo-a-corpo e artes marciais)
    13. `Nobre` (Líder diplomático da corte com autoconfiança)
    14. `Paladino` (Campeão sagrado da luz e da justiça)
  * **As 2 Classes de Suplementos Canônicos:**
    15. `Pistoleiro` (*Piratas e Pistoleiros*)
    16. `Malandro` (*Manual do Malandro*)
  * **Tarefas Técnicas:**
    * Inserir as novas classes no `prisma/seed.ts` preservando os IDs exigidos por testes legados (`class-guerreiro-t20` e `class-arcanista-t20`).
    * Configurar atributos-chave, PV inicial, PV por nível, PM inicial, PM por nível, perícias obrigatórias, perícias de escolha e proficiências de armadura/arma para cada uma das 16 classes.
    * Atualizar `EXPANDED_CLASSES` em `SheetCreationWizard.tsx`.
* **US 3.2 — Fluxo de Criação Super Intuitivo:**
  * *Como* jogador iniciante, *quero* que o assistente me guie passo a passo com explicações práticas de cada escolha.
  * **Tarefas Técnicas:**
    * Indicação clara de quantos pontos/perícias faltam selecionar em tempo real.
    * Explicações resumidas em tooltip/card sobre as habilidades de classe e raça.
    * Botão "Preenchimento Automático Inteligente" para jogadores que desejam gerar uma ficha pronta com 1 clique para jogar na hora.
* **US 3.3 — Pré-visualização Dinâmica e Exportação Limpa:**
  * *Como* jogador, *quero* ver meus PV, PM, Defesa e ataques se atualizarem imediatamente e poder exportar minha ficha em JSON ou imprimir/copiar com facilidade.
  * Arquivos: `src/components/sheet/SheetCreationWizard.tsx`, `prisma/seed.ts`, `src/lib/types/index.ts`.

### 🏁 Critérios de Aceite (DoD):
* [ ] Todas as 16 classes selecionáveis no criador de personagens e no compêndio.
* [ ] Cálculos de PV e PM de todas as classes validados rigorosamente com as regras oficiais de T20.
* [ ] Jogador consegue criar uma ficha completa em menos de 2 minutos pelo fluxo rápido ou passo a passo.
* [ ] 433/433 testes vitest aprovados sem quebra de contrato.

---

## 👑 SPRINT 4: Amplitude do Mestre de Mesa (VTT Tático & Painel do Narrador)

### 🎯 Objetivo da Sprint
Municiar o mestre de mesa com ferramentas ágeis que ampliem sua capacidade de conduzir sessões imersivas e sem atrito: aplicação instantânea de condições de combate, ajuste rápido de tokens no mapa tático, catálogo de monstros por Nível de Desafio (ND) e rolagens com controle de visibilidade.

### 📝 Histórias de Usuário & Tarefas
* **US 4.1 — Painel Tático Rápido do Mestre no VTT:**
  * *Como* mestre em combate, *quero* alterar PV, PM e aplicar condições aos combatentes com 1 clique sem abrir menus pesados.
  * **Tarefas Técnicas:**
    * Menu de contexto rápido nos tokens com botões `+5/-5 PV`, `+1/-1 PM`.
    * Seletor de condições rápidas (*Abalado, Caído, Cego, Desprevenido, etc.*) que exibe o ícone monocromático sobre o token e ajusta automaticamente a Defesa ou ataque da criatura.
* **US 4.2 — Biblioteca Rápida de Ameaças & Monstros por ND:**
  * *Como* narrador preparando um encontro, *quero* arrastar monstros diretamente da gaveta lateral para o grid com ficha resumida.
  * **Tarefas Técnicas:**
    * Filtro ágil por ND (ex: ND 1/4 até ND 20) e bioma (Masmorra, Ermos, Cidade, Tormenta).
    * Spawn de token com nome, PV e iniciativa já configurados no grid.
* **US 4.3 — Rolagens do Mestre (Públicas ou Secretas):**
  * *Como* mestre, *quero* escolher se uma rolagem é exibida para todos os jogadores ou apenas para mim.
  * **Tarefas Técnicas:**
    * Toggle "Rolagem Secreta do Mestre" no rolador de dados.
* **US 4.4 — Integração da CD no Chat da Mesa:**
  * *Como* narrador anunciando um desafio ("Façam um teste de Atletismo CD 18!"), *quero* que o rolador compare o resultado do jogador com a CD anunciada.
  * Arquivos: `src/components/vtt/TacticalGridCanvas.tsx`, `src/components/vtt/InitiativePanel.tsx`, `src/components/compendium/CompendiumBrowser.tsx`.

### 🏁 Critérios de Aceite (DoD):
* [ ] O mestre consegue posicionar ameaças e iniciar combate em menos de 30 segundos.
* [ ] Condições afetam as estatísticas dos tokens de forma reativa.
* [ ] O VTT opera a 60 FPS com grid tático e réguas de alcance sem engasgos.
* [ ] Sistema 100% funcional em modo offline/local e pronto para deploy em produção.

---

## 🛡️ Gestão de Riscos & Garantias Técnicas

1. **Risco de Quebra dos Testes E2E (Vitest):**
   * *Mitigação:* As 12 entidades canônicas essenciais do `seed.ts` (como `race-humano-t20`, `class-guerreiro-t20`, `class-arcanista-t20`) são protegidas e nunca alteradas em seus IDs ou estruturas essenciais. Novas classes recebem IDs padronizados complementares.
2. **Risco de Incompatibilidade de Banco (SQLite vs Postgres):**
   * *Mitigação:* O script `scripts/prepare-prisma.js` garante transição transparente entre o SQLite de desenvolvimento e o PostgreSQL na nuvem (Vercel).
3. **Risco de Sobrecarga Visual:**
   * *Mitigação:* Cada nova tela ou componente passa pelo filtro de design monocromático: tons de cinza neutros, sem gradientes chamativos e com foco na tipografia e nos dados da partida.
