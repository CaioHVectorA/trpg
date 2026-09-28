# Plataforma Tormenta RPG — Referência de APIs Públicas REST

> Guia completo de endpoints REST para integração, gerenciamento de fichas de personagens, mapas táticos de VTT, rolagens de dados e compêndio de regras de Arton.

---

## 🌐 Convenções Gerais

- **Base URL**: `http://localhost:3000/api` (ou a URL do seu deploy em produção).
- **Formato de Dados**: `application/json` em todas as requisições POST, PUT e PATCH.
- **Formato das Respostas**: Padrão unificado contendo o campo booleano `success`.
  - Em caso de sucesso: `{ "success": true, "data": ... }` ou payload correspondente.
  - Em caso de erro: `{ "success": false, "error": "Descrição legível do erro" }`.

---

## 📂 1. API de Personagens (`/api/characters`)

### `GET /api/characters`
Recupera a lista de personagens cadastrados com suporte a filtros.

#### Parâmetros de Query:
| Parâmetro | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `system` | `string` | Filtra por modo de jogo (`T20` ou `TRPG`). | `?system=T20` |
| `campaignId` | `string` | Filtra personagens por ID da campanha. | `?campaignId=c123` |
| `isNpc` | `boolean` | Filtra entre PJ (`false`) ou NPC/Monstro (`true`). | `?isNpc=false` |
| `search` | `string` | Busca textual parcial case-insensitive no nome. | `?search=Valeros` |

#### Resposta (200 OK):
```json
{
  "success": true,
  "characters": [
    {
      "id": "cm21xyz123",
      "system": "T20",
      "name": "Valeros de Valkaria",
      "race": "Humano",
      "class": "Guerreiro",
      "level": 3,
      "isNpc": false,
      "pvCurrent": 35,
      "pvMax": 35,
      "pvTemp": 0,
      "pmCurrent": 9,
      "pmMax": 9,
      "defense": 18,
      "attributesJson": "{\"FOR\":3,\"DES\":2,\"CON\":2,\"INT\":1,\"SAB\":0,\"CAR\":-1}",
      "skillsJson": "[\"Luta\",\"Fortitude\",\"Atletismo\",\"Adestramento\"]",
      "createdAt": "2024-10-24T12:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/characters`
Cria e persiste um novo personagem no banco de dados.

#### Corpo da Requisição (JSON):
```json
{
  "name": "Lorien de Lenórienn",
  "system": "TRPG",
  "race": "Elfo",
  "class": "Mago",
  "level": 5,
  "isNpc": false,
  "attributes": {
    "FOR": 10,
    "DES": 16,
    "CON": 12,
    "INT": 18,
    "SAB": 14,
    "CAR": 10
  },
  "trainedSkills": ["Identificar Magia", "Ofício", "Percepção"],
  "armorBonus": 0,
  "shieldBonus": 0
}
```

#### Resposta (201 Created):
```json
{
  "success": true,
  "character": {
    "id": "cm21abc456",
    "name": "Lorien de Lenórienn",
    "system": "TRPG",
    "pvMax": 18,
    "pvCurrent": 18,
    "pmMax": 25,
    "pmCurrent": 25,
    "defense": 15
  }
}
```

---

### `GET /api/characters/[id]`
Retorna os detalhes completos de um personagem específico pelo ID.

---

### `PUT` / `PATCH /api/characters/[id]`
Atualiza campos, recursos (PV/PM/Temp) ou recarrega cálculos derivados.

#### Corpo da Requisição (Exemplo de Dano / Gasto de PM):
```json
{
  "pvCurrent": 22,
  "pmCurrent": 5,
  "recalculateDerived": true
}
```

---

### `DELETE /api/characters/[id]`
Remove um personagem do banco de dados.

#### Resposta (200 OK):
```json
{
  "success": true,
  "message": "Personagem removido com sucesso."
}
```

---

## 🗺️ 2. API de Cenas e VTT (`/api/scenes`)

### `GET /api/scenes`
Lista todas as cenas/mapas táticos.

#### Query Parameters: `?campaignId=c123`

---

### `POST /api/scenes`
Cria uma nova cena tática para o VTT.

#### Corpo da Requisição (JSON):
```json
{
  "name": "Masmorra de Khalmyr",
  "gridWidth": 20,
  "gridHeight": 20,
  "cellSizePx": 50,
  "meterPerSquare": 1.5,
  "backgroundUrl": "/maps/dungeon_arena.svg"
}
```

---

### `GET` / `PUT` / `DELETE /api/scenes/[id]`
Operações CRUD individuais para gerenciamento de mapas táticos do VTT.

---

## ♟️ 3. API de Tokens (`/api/tokens`)

### `GET /api/tokens`
Lista tokens no mapa. Query recomendada: `?sceneId=scene_id_here`.

---

### `POST /api/tokens`
Adiciona um token de personagem ou monstro à cena.

#### Corpo da Requisição (JSON):
```json
{
  "sceneId": "cm21scene123",
  "characterId": "cm21abc456",
  "name": "Guerreiro de Valkaria",
  "x": 5,
  "y": 8,
  "size": "MEDIUM",
  "color": "#DC2626",
  "pvCurrent": 35,
  "pvMax": 35
}
```

---

### `PUT /api/tokens/[id]`
Atualiza a posição do token `(x, y)`, rotação, elevação ou estados de condição.

```json
{
  "x": 6,
  "y": 8,
  "conditionsJson": ["Caído", "Sangrando"]
}
```

---

### `DELETE /api/tokens/[id]`
Remove o token da cena.

---

## 🎲 4. API de Rolagens (`/api/rolls`)

### `POST /api/rolls`
Executa e/ou registra uma rolagem de dados no histórico global.

#### Corpo da Requisição (JSON):
```json
{
  "expression": "1d20+8 # Ataque com Espada Longa",
  "senderName": "Valeros",
  "system": "T20",
  "rollType": "ATTACK",
  "threatMargin": 19
}
```

#### Resposta (201 Created):
```json
{
  "success": true,
  "roll": {
    "id": "cm21roll789",
    "expression": "1d20+8 # Ataque com Espada Longa",
    "total": 27,
    "isCrit": true,
    "isFumble": false,
    "diceBreakdown": "[{\"die\":20,\"value\":19}]",
    "label": "Ataque com Espada Longa",
    "timestamp": "2024-10-24T12:05:00.000Z"
  }
}
```

---

### `GET /api/rolls`
Recupera os últimos logs de rolagens de dados.

#### Parâmetros de Query:
- `limit`: Quantidade máxima de registros (1 a 100, padrão 50).
- `campaignId`: Filtro por campanha.
- `characterId`: Filtro por personagem.

---

## 📖 5. API de Compêndio (`/api/compendium`)

### `GET /api/compendium`
Consulta interativa do compêndio canônico de Arton.

#### Parâmetros de Query:
| Parâmetro | Tipo | Opções / Descrição |
| :--- | :--- | :--- |
| `search` | `string` | Busca textual em nome, descrição, categoria e tags. |
| `system` | `string` | `T20`, `TRPG` ou `ALL`. |
| `type` | `string` | `RACE`, `CLASS`, `SPELL`, `POWER`, `ITEM`, `THREAT`. |
| `circle` | `number` | Círculo da magia (1, 2, 3, etc). |

#### Resposta (200 OK):
```json
{
  "success": true,
  "count": 1,
  "items": [
    {
      "id": "spell-misseeis-magicos",
      "system": "T20",
      "type": "SPELL",
      "name": "Mísseis Mágicos",
      "description": "Você dispara dardos de energia que atingem infalivelmente seus alvos.",
      "category": "Magia Arcana 1º Círculo",
      "circle": 1,
      "cost": "1 PM",
      "dataJson": "{\"circle\":1,\"execution\":\"Padrão\",\"range\":\"Curto (9m)\"}",
      "tags": "dano,essencia,arcana,evocacao"
    }
  ]
}
```

---

## 🧩 6. Extensibilidade & Plugins
Para detalhes sobre injeção de conteúdos *Homebrew*, macros de atalho, overlays de transmissão (OBS) e webhooks para Discord/bots, consulte o [**Guia de Extensibilidade e Plugins (`docs/EXTENSIBILITY_AND_PLUGINS.md`)**](./EXTENSIBILITY_AND_PLUGINS.md).
