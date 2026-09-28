# Plataforma Tormenta RPG — Guia de Extensibilidade, APIs e Arquitetura de Plugins

> Manual completo sobre como estender a plataforma com conteúdo *Homebrew*, criar integrações via Webhooks/REST, adicionar novas regras customizadas, criar overlays de stream (OBS) e desenvolver plugins para o VTT.

---

## 🧩 1. Filosofia de Extensibilidade

A **Plataforma Tormenta RPG** foi arquitetada com desacoplamento estrito entre os modelos de dados e a execução das regras:
1. **JSON Schemas Abertos**: Atributos, perícias, ataques, magias e estatísticas de ameaças usam estruturas JSON flexíveis e schema-free salvas no banco de dados.
2. **Motor de Regras Puro (Purity & Determinism)**: As funções em `src/lib/rules` são puras, recebendo dados e retornando estatísticas calculadas sem efeitos colaterais.
3. **Ponto de Injeção de Conteúdo (Homebrew Ready)**: Qualquer grupo de jogo ou Mestre pode registrar novas raças, classes, magias ou poderes customizados através do Compêndio ou das APIs públicas REST sem recompilar o projeto.

---

## 📖 2. Injeção de Conteúdo Homebrew via Compêndio (`/api/compendium`)

A entidade `CompendiumItem` permite adicionar regras e conteúdos personalizados. O campo `dataJson` armazena a mecânica estendida.

### Exemplo A: Criando uma Raça Customizada (*Homebrew*)

```json
POST /api/compendium
{
  "system": "T20",
  "type": "RACE",
  "name": "Osteon de Arton",
  "description": "Criaturas reanimadas pela energia negativa de Tenebra.",
  "category": "Raça Homebrew",
  "tags": "homebrew,raca,osteon,morto-vivo",
  "dataJson": JSON.stringify({
    "attributeBonuses": { "CON": -1 },
    "flexibleBonusCount": 3,
    "traits": [
      {
        "name": "Natureza Esquelética",
        "description": "Você é um morto-vivo. Recebe RD 5 a corte e perfuração, e vulnerabilidade a impacto."
      },
      {
        "name": "Armadura Óssea",
        "description": "+2 na Defesa."
      }
    ]
  })
}
```

### Exemplo B: Criando uma Magia Customizada com Aprimoramentos de PM

```json
POST /api/compendium
{
  "system": "T20",
  "type": "SPELL",
  "name": "Lança de Tenebra",
  "description": "Dispara um raio de sombras e energia negativa.",
  "category": "Magia Divina 2º Círculo",
  "circle": 2,
  "cost": "3 PM",
  "tags": "homebrew,magia,trevas,divina",
  "dataJson": JSON.stringify({
    "circle": 2,
    "execution": "Padrão",
    "range": "Médio (18m)",
    "target": "1 criatura",
    "duration": "Instantânea",
    "resistance": "Reflexos reduz à metade",
    "baseFormula": "3d8 # Dano de Trevas",
    "enhancements": [
      {
        "pmCost": 2,
        "description": "+1d8 de dano de trevas",
        "formulaDelta": "+1d8"
      },
      {
        "pmCost": 3,
        "description": "Muda o alvo para Área: Esfera de 6m de raio",
        "type": "AREA_UPGRADE"
      }
    ]
  })
}
```

---

## 🎲 3. Extensão do Rolador de Dados e Macros de Atalho

O parser de dados em `src/lib/dice/parser.ts` aceita fórmulas dinâmicas estendidas e macros personalizadas.

### A. Sintaxe de Expressões Aceitas:
- `1d20+7 # Luta`: Teste básico de perícia com rótulo.
- `2d6+1d4+4 # Espada Longa Flamejante`: Múltiplos dados concatenados.
- `1d20+12 # Ataque Crítico [18-20/x3]`: Especificação explícita de margem de ameaça e multiplicador.
- `4d6kh3`: Rola 4 dados de 6 lados e mantém os 3 maiores (*keep highest*).

### B. Integração com Chat & Comandos de Atalho:
Novos comandos de chat podem ser adicionados em `src/lib/dice/evaluator.ts`:

| Comando | Descrição | Exemplo de Saída |
| :--- | :--- | :--- |
| `/roll <fórmula>` | Executa rolagem pública visível a todos. | `Valeros rola 1d20+8 # Ataque => Total: 23` |
| `/gmroll <fórmula>` | Rolagem secreta para o Mestre. | `[Mestre] Rolagem Secreta: 1d20+15 => Total: 31` |
| `/damage <fórmula>` | Rola dano com cálculo de acerto crítico. | `Dano de Machado: 3d12+9 => Total: 28 (CRÍTICO x3)` |

---

## 🖥️ 4. Overlays para Streamers (OBS / Twitch) e Widgets Externos

Devido às APIs REST puras e reativas, a plataforma permite a criação de widgets e overlays em tempo real para transmissões ao vivo.

### A. Overlay de Ficha em Tempo Real (URL para OBS Browser Source):
Crie uma página leve (ex: `/overlay/character/[id]`) que consome `GET /api/characters/[id]` e atualiza barras de PV e PM na tela da stream:

```tsx
// Exemplo de componente para OBS Overlay
export function OBSCharacterOverlay({ characterId }: { characterId: string }) {
  const { data: character } = useSWR(`/api/characters/${characterId}`, fetcher, {
    refreshInterval: 1000 // Polling de 1 segundo para atualização ao vivo na stream
  });

  if (!character) return null;

  return (
    <div className="bg-slate-900/90 text-white p-3 rounded-lg border border-amber-500/40 w-64">
      <h3 className="font-bold text-amber-300">{character.name}</h3>
      <div className="flex justify-between text-xs my-1">
        <span>PV: {character.pvCurrent} / {character.pvMax}</span>
        <span>PM: {character.pmCurrent} / {character.pmMax}</span>
      </div>
      <div className="w-full bg-slate-700 h-2 rounded overflow-hidden">
        <div
          className="bg-red-500 h-full transition-all duration-300"
          style={{ width: `${(character.pvCurrent / character.pvMax) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

### B. Overlay de Logs de Dados Rolados no Chat da Stream:
Acesse `GET /api/rolls?limit=5` para exibir os dados rolados recentemente pelos jogadores com animação na tela da transmissão.

---

## ⚡ 5. Webhooks e Eventos de Integração (Discord / BOTS)

Para integrar com bots de Discord (ex: aviso de rolagem de dado, aviso de morte de personagem ou início de combate):

### Payload Padrão do Evento de Rolagem (`roll.created`):
```json
{
  "event": "roll.created",
  "timestamp": "2024-10-24T12:00:00.000Z",
  "data": {
    "characterName": "Valeros de Valkaria",
    "expression": "1d20+8 # Ataque Espada Longa",
    "total": 28,
    "isCrit": true,
    "isFumble": false,
    "diceBreakdown": [{"die": 20, "value": 20}]
  }
}
```

---

## 🎨 6. Extensibilidade de Camadas no VTT (Custom Canvas Layers)

O VTT foi projetado com camadas independentes compostas no React (`VttCanvas.tsx`):

```tsx
<VttCanvas>
  <TacticalGridCanvas />  {/* Camada 1: Grid e Terreno */}
  <CustomMapOverlay />    {/* Camada 2: Desenhos do Mestre / Texturas */}
  <TokenLayer />          {/* Camada 3: Tokens de Personagens e Monstros */}
  <RangeRulerLayer />     {/* Camada 4: Régua de Alcance Dinâmica */}
  <FogOfWarLayer />       {/* Camada 5: Máscara de Névoa de Guerra */}
  <CustomEffectLayer />   {/* Camada 6: Animações de Magia e Efeitos FX */}
</VttCanvas>
```

Através desse modelo, desenvolvedores podem criar novos componentes de camada (ex: efeitos de clima como chuva/neve, cones de visão dinâmica, marcadores de efeito de área circular ou cônico) simplesmente adicionando um novo componente React sobre o Canvas principal.
