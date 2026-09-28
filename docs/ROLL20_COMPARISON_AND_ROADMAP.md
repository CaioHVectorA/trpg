# Plataforma Tormenta RPG — Comparativo VTT (Roll20) e Roadmap Operacional de Sessão

> Análise comparativa profunda em relação a plataformas VTT consagradas (Roll20 e Foundry VTT) e arquitetura detalhada para transformar a aplicação em uma plataforma de sessões ao vivo multi-jogador com sincronização em tempo real.

---

## 📊 1. Matriz Comparativa de Funcionalidades

| Recursos de Mesa Virtual | Roll20 | Foundry VTT | **Plataforma Tormenta RPG** | Status Atual & Próximos Passos |
| :--- | :---: | :---: | :---: | :--- |
| **Fichas Tormenta 20 (JdA) e TRPG** | Parcial (Community) | Parcial (Community) | **Nativo & Reativo (100%)** | ✅ Implementado com cálculo DAG reativo instantâneo. |
| **Rolador d20 Contextualizado** | Fórmulas básicas | Macros / Módulos | **Nativo (Margem / PMs / Críticos)** | ✅ Detecta 20/1 natural, calcula ampliações por PM. |
| **Grid Tático & Régua de Distância** | Padrão 5/10/5 | Múltiplas | **Chebyshev (T20) e 5/10/5 (TRPG)** | ✅ Suporte nativo a faixas de alcance (*Toque*, *9m*, *18m*, *36m*). |
| **Rastreador de Iniciativa** | Turn Tracker básico | Turn Tracker avançado | **Nativo (Desempate por DES / Rodadas)** | ✅ Atualização automática de turnos e ordem. |
| **Compêndio Canônico Integrado** | Genérico / Pago | Módulos | **Nativo (12 entidades de Arton)** | ✅ Busca instantânea e suporte a drag-and-drop. |
| **Sincronização Multiplayer ao Vivo** | WebSockets | WebSockets | **REST API / SSE (Sincronizado via BD)** | 🚀 Roadmap: Migração para WebSockets/Socket.io. |
| **Névoa de Guerra / Iluminação** | Dinâmica (Pro) | Dinâmica Nativa | **Estatica / Polygon Mask (fogDataJson)** | 🚀 Roadmap: Canvas Masking em tempo real. |
| **Macros & Atalhos de Rolagem** | Linguagem Chat | Macro JS | **Fórmulas Textuais (`1d20+7 # Luta`)** | ✅ Parser flexível em input textual. |
| **Áudio / SFX de Ambiência** | Jukebox | Playlist Audio | **Nativo Web Audio API (Estruturado)** | 🚀 Roadmap: Web Audio API Integration. |

---

## 🎯 2. Análise Detalhada das Experiências de Mesa (Roll20 vs Nossa Plataforma)

### A. Fichas de Personagem e Automação
- **Roll20**: Depende de scripts da comunidade em HTML/CSS/JS mantidos manualmente. Lento na atualização de atributos e propenso a inconsistências quando as regras da editora mudam.
- **Nossa Plataforma**: Motor de regras em TypeScript puro (`lib/rules`), altamente testado (mais de 428 testes), com suporte completo e retrocompatível a T20 (Jogo do Ano) e TRPG Clássico, calculando automaticamente Pontos de Vida, Mana, Defesa/CA e bônus de perícias sem atraso.

### B. Medição de Distância e Grid de Combate
- **Roll20**: Utiliza predominantemente a medição 5/10/5 do D&D 5e.
- **Nossa Plataforma**: Implementa nativamente a **métrica Chebyshev** exigida pelo Tormenta 20 (onde movimentação diagonal possui o mesmo custo da cardinal: 1,5m por quadrado) e alterna para **5/10/5** automaticamente ao selecionar o sistema TRPG Clássico.

### C. Rolador de Dados e Regras de Tormenta
- **Roll20**: Rolador genérico. Para rolar acertos críticos de Tormenta com margem configurável (ex: 19-20/x3) ou aplicar ampliações de PM por rodada, são necessários scripts complexos em API (exige assinatura Pro).
- **Nossa Plataforma**: Rolador **Tailor-Made** para Arton. Reconhece margens de ameaça configuráveis, rolagens abertas, ampliações de magia via gasto de PM limitadas pelo nível e identifica criticidade no log visual flutuante.

---

## 🛠️ 3. Arquitetura de Sincronização Multiplayer em Tempo Real (Roadmap)

Para operar sessões de RPG virtuais idênticas ao Roll20 com múltiplos jogadores e Mestre conectados ao mesmo tempo, a seguinte arquitetura de tempo real está projetada:

```
+-----------------------------------------------------------------------+
|                         MESTRE DA MESA (GM)                           |
|        (Move Tokens, Revela Névoa de Guerra, Altera Turno)            |
+-----------------------------------------------------------------------+
                                   │
                                   ▼ [WebSocket Event: TOKEN_MOVED]
+-----------------------------------------------------------------------+
|                    SERVIDOR DE SESSÃO REAL-TIME                       |
|           (Node.js / WebSockets / Server-Sent Events / Redis)          |
+-----------------------------------------------------------------------+
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼ [Broadcast Event: TOKEN_MOVED]              ▼ [Broadcast Event]
+-----------------------+                      +-----------------------+
|      JOGADOR 1        |                      |      JOGADOR 2        |
| (Renderiza Posição)   |                      | (Renderiza Posição)   |
+-----------------------+                      +-----------------------+
```

### Componentes Técnicos do Roadmap:

1. **Protocolo WebSockets / Server-Sent Events (SSE)**:
   - Eventos emitidos: `TOKEN_MOVED`, `INITIATIVE_ADVANCED`, `RESOURCE_UPDATED` (PV/PM), `DICE_ROLLED`, `FOG_REVEALED`.
2. **Atualização Otimista no Client (Optimistic UI)**:
   - Movimentações de token ou alterações de PV são refletidas instantaneamente na interface local enquanto o evento é enviado ao servidor em segundo plano.
3. **Persistência Transacional em Banco**:
   - Cada evento relevante (fim de turno, dano sofrido, criação de token) é gravado no banco SQLite/PostgreSQL através do Prisma, garantindo recuperação total caso a conexão caia.
4. **Áudio & Vídeo Peer-to-Peer (WebRTC)**:
   - Conexão direta entre os navegadores da mesa para transmissão de voz e vídeo em baixa latência.
