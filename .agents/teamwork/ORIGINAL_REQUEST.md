# Original User Request

## Initial Request — 2026-09-27T17:55:29Z

Dois especialistas atuando em conjunto: Especialista em Tormenta / Game Designer de RPG & Desenvolvedor Full-Stack Sênior (Next.js + Supabase)

Plataforma web all-in-one, modular e extensível voltada para Tormenta 20 (T20) com suporte e retrocompatibilidade para Tormenta RPG clássico (TRPG), integrando construtor de fichas dinâmico com cálculo de regras, grid tático para combates/cenas, rolador de dados com fórmulas do sistema e compêndio de regras interativo.

Working directory: /home/usuario/develop/trpg-platform
Integrity mode: development

## Requirements

### R1. Motor de Regras e Modelagem Multi-Sistema (T20 e TRPG Clássico)
Implementar uma arquitetura de regras modular e declarativa que encapsule as diferenças entre Tormenta 20 (atributos baseados em modificadores diretos, sistema de Pontos de Mana para habilidades e magias, perícias treinadas por nível, poderes gerais) e Tormenta RPG clássico (atributos 3-18 com modificadores clássicos d20, magias por nível/círculo tradicional, bônus base de ataque e graduações de perícia), permitindo que fichas, rolagens e compêndio operem no modo da edição selecionada.

### R2. Construtor e Gerenciador de Fichas Dinâmicas
Interface intuitiva de criação passo a passo e edição de fichas de personagens e ameaças/monstros. O motor deve computar automaticamente valores derivados (Pontos de Vida, Pontos de Mana, Defesa/CA, bônus de perícias com treino/atributos, penalidade de carga/armadura) e permitir persistência e sincronização de dados de forma plug-and-play.

### R3. Motor de Rolagem de Dados Contextualizado
Mecanismo integrado de resolução de dados com suporte à notação d20 do sistema Tormenta:
- Testes de atributos e perícias com cálculo automático de margem de sucesso.
- Detecção nativa de Acertos Críticos (respeitando margem de ameaça configurável na arma/habilidade, ex: 19-20/x3) e Falhas Críticas (1 natural).
- Fórmulas de dano com multiplicadores e dados extras por atributos ou PM investido.
- Log visual das rolagens com discriminação detalhada dos modificadores aplicados.

### R4. Grid Tático de Combate e Cenas (VTT)
Ambiente de mapa interativo baseado em grid quadrado (5 pés / 1,5m por célula) que permita:
- Carregamento e renderização de mapa de fundo.
- Posicionamento, movimentação e seleção de tokens (jogadores e monstros).
- Medição dinâmica de distância e alcance (curto, médio, longo).
- Rastreador de iniciativa integrado para gerenciamento de turnos e rodadas de combate.

### R5. Compêndio de Regras e Consulta Rápida
Mecanismo de busca instantânea e consulta com dados básicos pré-carregados de exemplo (raças, classes, magias fundamentais, poderes e itens de T20/TRPG), permitindo arrastar ou aplicar itens e magias diretamente para a ficha de personagem.

### R6. Arquitetura Técnica Plug-and-Play e Qualidade
A aplicação deve ser desenvolvida em Next.js (App Router, TypeScript, Tailwind CSS), com persistência de dados de fácil inicialização e execução imediata (Prisma/SQLite com compatibilidade e migração pronta para Supabase PostgreSQL). O projeto deve inicializar sem dependências externas complexas não resolvidas (`npm install`, `npm run dev`) e incluir suíte de testes automatizados.

## Verification Resources

- Testes de regras de sistema comparando cálculos esperados de Tormenta 20 vs Tormenta RPG clássico (fórmulas de perícias, cálculo de PV/PM e margens de crítico).
- Testes unitários do analisador de expressões de dados (dice roller parser).
- Verificação de renderização e movimentação de tokens no grid tático.
- Script de build e checagem de tipos estrita (`npm run lint`, `npm test`, `npm run build`).

## Acceptance Criteria

### Compatibilidade e Regras dos Sistemas
- [ ] Criação e alternância funcional de fichas nos modos Tormenta 20 e Tormenta RPG clássico.
- [ ] Ficha de T20 calcula automaticamente perícias com base em: Treinamento + Metade do Nível + Modificador do Atributo + outros bônus.
- [ ] Ficha de TRPG clássico respeita atributos clássicos (ex: Força 16 -> Mod +3) e graduações/BBA conforme as regras tradicionais da edição.
- [ ] Gastos de PM (Pontos de Mana) e alterações de PV refletem imediatamente no estado da ficha.

### Rolagem de Dados
- [ ] Execução de rolagens diretas a partir da ficha (clique no ataque, teste de perícia ou dano).
- [ ] Destaque visual diferenciado para 20 natural (acerto crítico) e 1 natural (falha crítica).
- [ ] Rolador aceita comandos de texto com operadores (ex: `1d20+7`, `2d6+4`, `1d20+10 # Ataque Espada Longa`).

### Grid Tático e VTT
- [ ] Grid renderiza células quadradas proporcionais e permite arrastar/soltar tokens de personagens no canvas.
- [ ] Ferramenta de régua mede distâncias no grid em metros ou quadrados (1,5m / 5ft).
- [ ] Painel de iniciativa exibe a lista ordenada de combate, permitindo avançar turnos.

### Compêndio e Experiência do Usuário
- [ ] Interface responsiva com tema visual alinhado ao estilo de alta fantasia e RPG de mesa.
- [ ] Compêndio interativo permite filtrar e visualizar detalhes de pelo menos 10 itens/magias/poderes de exemplo de T20 e TRPG.

### Estabilidade e Execução
- [ ] O projeto compila sem erros de tipagem TypeScript (`npm run build` conclui com status 0).
- [ ] Testes automatizados executam e passam com sucesso via `npm test`.
- [ ] Instruções claras e funcionais no README.md para iniciar o projeto em modo desenvolvimento (`npm run dev`).
