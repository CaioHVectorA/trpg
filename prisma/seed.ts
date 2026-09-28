import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initiating TRPG Platform Database Seed ---');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.initiativeEntry.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.rollLog.deleteMany({});
  await prisma.character.deleteMany({});
  await prisma.scene.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.compendiumItem.deleteMany({});

  console.log('Cleared existing records.');

  // 2. Seed 12 Canonical Compendium Entities
  const canonicalItems = [
    // 1. Humano (Raça - T20)
    {
      id: 'race-humano-t20',
      system: 'T20',
      type: 'RACE',
      name: 'Humano',
      description:
        'A raça mais numerosa e adaptável de Arton, abençoada com ambição incessante pela deusa Valkaria.',
      category: 'Raça Básica',
      circle: null,
      cost: null,
      requirement: null,
      dataJson: JSON.stringify({
        attributeModifiers: { FOR: 1, DES: 1, CON: 1, INT: 0, SAB: 0, CAR: 0 },
        attributeRule: '+1 em três atributos diferentes à escolha do jogador.',
        size: 'MEDIO',
        speedMeters: 9,
        speedSquares: 6,
        racialAbilities: [
          {
            name: 'Versátil',
            description:
              'Você se torna treinado em duas perícias à sua escolha (não precisam ser da sua classe) ou ganha um poder geral à sua escolha.',
          },
        ],
      }),
      tags: 'raca,t20,humano,versatil,valkaria',
    },

    // 2. Anão (Raça - T20 & TRPG)
    {
      id: 'race-anao-t20',
      system: 'ALL',
      type: 'RACE',
      name: 'Anão',
      description:
        'Mestres da pedra e forja originários de Doherimm, conhecidos por sua tenacidade inabalável.',
      category: 'Raça Básica',
      circle: null,
      cost: null,
      requirement: null,
      dataJson: JSON.stringify({
        attributeModifiers: { CON: 2, SAB: 1, DES: -1, FOR: 0, INT: 0, CAR: 0 },
        attributeModifiersT20: { FOR: 0, DES: -1, CON: 2, INT: 0, SAB: 1, CAR: 0 },
        attributeModifiersTRPG: { FOR: 0, DES: -2, CON: 4, INT: 0, SAB: 2, CAR: 0 },
        size: 'MEDIO',
        speedMeters: 6,
        speedSquares: 4,
        racialAbilities: [
          {
            name: 'Conhecimento das Rochas',
            description: 'Recebe visão no escuro e +2 em testes de Percepção no subterrâneo.',
          },
          {
            name: 'Devagar e Sempre',
            description:
              'Seu deslocamento base é 6m, mas nunca é reduzido pelo uso de armadura pesada ou excesso de carga.',
          },
          {
            name: 'Tradição de Heredrimm',
            description:
              'Proficiência com machados e martelos. Trata machado de guerra e martelo de guerra como armas marciais.',
          },
        ],
      }),
      tags: 'raca,t20,trpg,anao,doherimm,rochas',
    },

    // 3. Guerreiro (Classe - T20)
    {
      id: 'class-guerreiro-t20',
      system: 'T20',
      type: 'CLASS',
      name: 'Guerreiro',
      description:
        'Especialista em combate armado, táticas de infantaria e domínio completo do campo de batalha.',
      category: 'Classe Combatente',
      circle: null,
      cost: null,
      requirement: null,
      dataJson: JSON.stringify({
        basePV: 20,
        pvPerLevel: 5,
        basePM: 3,
        pmPerLevel: 3,
        keyAttribute: 'FOR',
        mandatorySkills: ['Luta', 'Fortitude'],
        selectableSkills: [
          'Adestramento',
          'Atletismo',
          'Cavalgar',
          'Iniciativa',
          'Intimidação',
          'Ofício',
          'Percepção',
          'Pontaria',
          'Reflexos',
        ],
        proficiencies: ['Armas Marciais', 'Armaduras Pesadas', 'Escudos'],
        classFeatures: [
          {
            name: 'Ataque Especial',
            level: 1,
            pmCost: 1,
            description:
              'Quando faz um ataque, você pode gastar 1 PM para receber +4 no teste de ataque ou +4 na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +4.',
          },
        ],
      }),
      tags: 'classe,combatente,t20,guerreiro,ataque-especial',
    },

    // 4. Arcanista (Classe - T20)
    {
      id: 'class-arcanista-t20',
      system: 'T20',
      type: 'CLASS',
      name: 'Arcanista',
      description:
        'Conjurador arcano que molda a própria trama mágica de Arton por estudo, linhagem ou pacto com foco.',
      category: 'Classe Conjuradora',
      circle: null,
      cost: null,
      requirement: null,
      dataJson: JSON.stringify({
        basePV: 8,
        pvPerLevel: 2,
        basePM: 6,
        pmPerLevel: 6,
        keyAttribute: 'INT', // Feiticeiro uses CAR
        mandatorySkills: ['Misticismo', 'Vontade'],
        selectableSkills: ['Conhecimento', 'Iniciativa', 'Percepção', 'Ofício', 'Nobreza'],
        proficiencies: ['Armas Simples'],
        classPaths: ['Bruxo (Foco Arcano)', 'Feiticeiro (Linhagem)', 'Mago (Grimório)'],
        classFeatures: [
          {
            name: 'Caminho do Arcanista',
            level: 1,
            description:
              'Você escolhe entre Bruxo, Feiticeiro ou Mago para determinar seu foco e atributo-chave de magia.',
          },
          {
            name: 'Magias Arcanas',
            level: 1,
            description:
              'Você lança magias arcanas de 1º círculo gastando Pontos de Mana correspondentes.',
          },
        ],
      }),
      tags: 'classe,conjurador,arcano,t20,arcanista,magia',
    },

    // 5. Mísseis Mágicos (Magia - T20)
    {
      id: 'spell-misseis-magicos-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Mísseis Mágicos',
      description:
        'Dardos de pura energia mística fulgurante disparam das pontas dos dedos do conjurador e acertam infalivelmente seus alvos.',
      category: 'Magia Arcana: Evocação',
      circle: 1,
      cost: '1 PM',
      requirement: 'Arcano 1º Círculo',
      dataJson: JSON.stringify({
        circle: 1,
        school: 'Evocação',
        executionTime: 'Padrão',
        range: 'Médio',
        targetOrArea: 'Até 2 criaturas',
        duration: 'Instantânea',
        savingThrow: 'Nenhum (Acerto Automático)',
        basePMCost: 1,
        baseEffect:
          'Dispara 2 dardos de energia mágica pura que acertam automaticamente. Cada dardo causa 1d4+1 pontos de dano de Essência.',
        enhancements: [
          { pmCost: 2, description: 'Dispara +1 dardo adicional (1d4+1 de Essência).' },
          {
            pmCost: 2,
            description:
              'Muda a duração para sustentada. Uma vez por rodada, como ação livre, dispara um dardo adicional.',
          },
        ],
      }),
      tags: 'magia,arcana,evocacao,essencia,1-circulo,dano',
    },

    // 6. Bola de Fogo (Magia - T20)
    {
      id: 'spell-bola-de-fogo-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Bola de Fogo',
      description:
        'Uma faísca brilhante salta da ponta dos seus dedos e detona em uma explosão ensurdecedora de labaredas rubras.',
      category: 'Magia Arcana: Evocação',
      circle: 2,
      cost: '3 PM',
      requirement: 'Arcano 2º Círculo',
      dataJson: JSON.stringify({
        circle: 2,
        school: 'Evocação',
        executionTime: 'Padrão',
        range: 'Médio',
        targetOrArea: 'Esfera de 6m de raio',
        duration: 'Instantânea',
        savingThrow: 'Reflexos reduz à metade',
        basePMCost: 3,
        damageDice: '6d6',
        damageFormula: '6d6',
        damageType: 'Fogo',
        enhancements: [
          { pmCost: 2, description: 'Aumenta o dano em +2d6 de fogo.' },
          { pmCost: 1, description: 'Aumenta a CD do teste de resistência em +1.' },
        ],
      }),
      tags: 'magia,arcana,evocacao,fogo,area,2-circulo',
    },

    // 7. Curar Ferimentos (Magia - T20 & TRPG)
    {
      id: 'spell-curar-ferimentos-t20',
      system: 'ALL',
      type: 'SPELL',
      name: 'Curar Ferimentos',
      description:
        'Canaliza a energia positiva dos Deuses do Panteão para restaurar a vitalidade e cicatrizar tecidos lacerados.',
      category: 'Magia Divina: Evocação',
      circle: 1,
      cost: '1 PM',
      requirement: 'Divina 1º Círculo',
      dataJson: JSON.stringify({
        circle: 1,
        school: 'Evocação',
        executionTime: 'Padrão',
        range: 'Toque',
        targetOrArea: '1 criatura tocada',
        duration: 'Instantânea',
        savingThrow: 'Vontade anula ou reduz (apenas contra Mortos-Vivos)',
        basePMCost: 1,
        healingFormula: '2d8+2',
        healingType: 'Luz / Positiva',
        enhancements: [
          { pmCost: 2, description: 'Aumenta a cura em +1d8+1 PV.' },
          { pmCost: 1, description: 'Muda o alcance para Curto (9m / 6 quadrados).' },
        ],
      }),
      tags: 'magia,divina,cura,evocacao,1-circulo,vida',
    },

    // 8. Ataque Poderoso (Poder Geral - T20 & TRPG)
    {
      id: 'power-ataque-poderoso-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Ataque Poderoso',
      description:
        'Sacrifica precisão em prol de golpes devastadores carregados com toda a força física do combatente.',
      category: 'Combate',
      circle: null,
      cost: 'Passivo / Ativável',
      requirement: 'FOR 1 (T20) ou FOR 13 (TRPG)',
      dataJson: JSON.stringify({
        type: 'Poder de Combate',
        prerequisite: { FOR: 1 },
        penalty: -2,
        damageBonusOneHand: 5,
        damageBonusTwoHands: 10,
        description:
          'Ao declarar um ataque corpo a corpo, você pode sofrer -2 no teste de ataque para causar +5 na rolagem de dano (ou +10 se estiver empunhando uma arma com as duas mãos).',
      }),
      tags: 'poder,talento,combate,dano,forca',
    },

    // 9. Esquiva (Poder Geral - T20 & TRPG)
    {
      id: 'power-esquiva-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Esquiva',
      description:
        'Reflexos treinados e agilidade para se desvencilhar de lâminas e projéteis inimigos.',
      category: 'Combate',
      circle: null,
      cost: 'Passivo',
      requirement: 'DES 1 (T20) ou DES 13 (TRPG)',
      dataJson: JSON.stringify({
        type: 'Poder de Combate',
        prerequisite: { DES: 1 },
        defenseBonus: 1,
        reflexBonus: 1,
        description: 'Você recebe +1 na Defesa e +1 em testes de Reflexos.',
      }),
      tags: 'poder,talento,combate,defesa,esquiva,reflexos',
    },

    // 10. Espada Longa (Equipamento - T20 & TRPG)
    {
      id: 'item-espada-longa',
      system: 'ALL',
      type: 'ITEM',
      name: 'Espada Longa',
      description:
        'A lâmina padrão de cavaleiros e aventureiros de Arton, balanceada para corte ágil e penetração precisa.',
      category: 'Arma Marcial de Uma Mão',
      circle: null,
      cost: '15 T$',
      requirement: 'Proficiência com Armas Marciais',
      dataJson: JSON.stringify({
        damageDice: '1d8',
        damageType: 'Corte',
        threatRange: 19, // 19-20
        critMultiplier: 2, // x2
        rangeType: 'Corpo a Corpo',
        grip: 'Uma Mão',
        weightSlots: 1,
        weightKg: 1.5,
        priceGold: 15,
      }),
      tags: 'item,equipamento,arma,marcial,espada,corte',
    },

    // 11. Cota de Malha (Equipamento - T20 & TRPG)
    {
      id: 'item-cota-de-malha',
      system: 'ALL',
      type: 'ITEM',
      name: 'Cota de Malha',
      description:
        'Armadura pesada de anéis entrelaçados que cobre o torso e membros, oferecendo proteção maciça contra cortes.',
      category: 'Armadura Pesada',
      circle: null,
      cost: '150 T$',
      requirement: 'Proficiência com Armaduras Pesadas',
      dataJson: JSON.stringify({
        defenseBonus: 6,
        armorPenalty: -2,
        isHeavy: true,
        maxDexterityTRPG: 2,
        dexLimitT20: 0, // In T20 heavy armor grants 0 DEX to defense
        weightSlots: 2,
        weightKg: 20,
        priceGold: 150,
      }),
      tags: 'item,equipamento,armadura,pesada,defesa',
    },

    // 12. Bugbear Espreitador (Ameaça - T20)
    {
      id: 'threat-bugbear-t20',
      system: 'T20',
      type: 'THREAT',
      name: 'Bugbear Espreitador',
      description:
        'Goblinoides brutais e sinistros que caçam nas sombras das florestas de Arton e nas fileiras da Aliança Negra.',
      category: 'Ameaça: Humanoide Médio',
      circle: null,
      cost: null,
      requirement: null,
      dataJson: JSON.stringify({
        challengeRating: 2, // ND 2
        creatureType: 'Humanoide',
        size: 'MEDIO',
        defense: 16,
        pv: 45,
        pm: 10,
        speedMeters: 9,
        attributes: { FOR: 3, DES: 2, CON: 2, INT: -1, SAB: 1, CAR: -1 },
        senses: { perception: 5, initiative: 6, specialVision: 'Visão no Escuro' },
        attacks: [
          {
            name: 'Maça Estrela',
            attackBonus: 9,
            damageDice: '1d8+5',
            damageType: 'Impacto e Perfuração',
            threatRange: 20,
            critMultiplier: 3,
          },
          {
            name: 'Azagaia',
            attackBonus: 8,
            damageDice: '1d6+3',
            damageType: 'Perfuração',
            threatRange: 20,
            critMultiplier: 2,
            rangeCategory: 'Curto',
          },
        ],
        specialAbilities: [
          {
            name: 'Emboscador',
            description:
              'Se atacar uma criatura desprevenida na primeira rodada de combate, causa +2d6 pontos de dano extra.',
          },
        ],
      }),
      tags: 'ameaca,monstro,nd2,goblinóide,bugbear,combate',
    },
  ];

  for (const item of canonicalItems) {
    await prisma.compendiumItem.create({
      data: item,
    });
  }

  console.log(`Seeded ${canonicalItems.length} canonical Compendium items.`);

  // 3. Seed Default Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'A Jornada em Arton',
      description:
        'Campanha introdutória nos reinos de Deheon e Ylden explorando as fronteiras contra a Tempestade Rubra.',
      system: 'T20',
    },
  });

  // 4. Seed Canonical Character (T20 Guerreiro)
  const characterT20 = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'T20',
      isNpc: false,
      name: 'Valeros de Valkaria',
      race: 'Humano',
      class: 'Guerreiro',
      level: 1,
      alignment: 'Neutro e Bom',
      deity: 'Valkaria',
      avatarUrl: '/assets/tokens/warrior-token.svg',
      pvCurrent: 22,
      pvMax: 22,
      pvTemp: 0,
      pmCurrent: 3,
      pmMax: 3,
      defense: 18, // 10 + 6 (Cota de Malha) + 2 (Escudo Pesado) [DEX 0 because of heavy armor]
      attributesJson: JSON.stringify({
        FOR: 3,
        DES: 1,
        CON: 2,
        INT: 0,
        SAB: 0,
        CAR: 0,
      }),
      skillsJson: JSON.stringify({
        Luta: { trained: true, bonus: 5, attribute: 'FOR' }, // 0 (half-lvl) + 3 (FOR) + 2 (train)
        Fortitude: { trained: true, bonus: 4, attribute: 'CON' },
        Iniciativa: { trained: true, bonus: 3, attribute: 'DES' },
        Atletismo: { trained: true, bonus: 5, attribute: 'FOR' },
      }),
      attacksJson: JSON.stringify([
        {
          name: 'Espada Longa',
          bonus: 5,
          damage: '1d8+3',
          damageType: 'Corte',
          threatRange: 19,
          critMultiplier: 2,
        },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        {
          name: 'Ataque Especial',
          costPM: 1,
          description: '+4 no ataque ou +4 no dano.',
        },
        {
          name: 'Ataque Poderoso',
          description: '-2 no ataque para +5 no dano (+10 se com duas mãos).',
        },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Espada Longa', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Cota de Malha', weightSlots: 2, quantity: 1, equipped: true },
        { name: 'Escudo Pesado', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Mochila de Aventureiro', weightSlots: 0, quantity: 1 },
      ]),
      notes: 'Guerreiro leal à deusa da ambição, pronto para enfrentar perigos nos Ermos.',
    },
  });

  // 5. Seed Canonical Character (TRPG Clássico Mago)
  const characterTRPG = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'TRPG',
      isNpc: false,
      name: 'Lorien de Lenórienn',
      race: 'Elfo',
      class: 'Mago',
      level: 1,
      alignment: 'Caótico e Bom',
      deity: 'Wynna',
      avatarUrl: '/assets/tokens/mage-token.svg',
      pvCurrent: 10,
      pvMax: 10,
      pvTemp: 0,
      pmCurrent: 4,
      pmMax: 4,
      defense: 12, // 10 + 2 (DEX Mod 14 -> +2)
      attributesJson: JSON.stringify({
        FOR: 10, // Mod 0
        DES: 14, // Mod +2
        CON: 10, // Mod 0
        INT: 18, // Mod +4
        SAB: 12, // Mod +1
        CAR: 10, // Mod 0
      }),
      skillsJson: JSON.stringify({
        IdentificarMagia: { ranks: 4, bonus: 8, attribute: 'INT' },
        ConhecimentoArcano: { ranks: 4, bonus: 8, attribute: 'INT' },
      }),
      attacksJson: JSON.stringify([
        {
          name: 'Adaga',
          bonus: 2, // BBA 0 + DES 2
          damage: '1d4',
          damageType: 'Perfuração',
          threatRange: 19,
          critMultiplier: 2,
        },
      ]),
      spellsJson: JSON.stringify([
        { name: 'Mísseis Mágicos', circle: 1, costPM: 1 },
      ]),
      powersJson: JSON.stringify([
        { name: 'Magia Primitiva', description: 'Tradição arcana élfica.' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Adaga', weightKg: 1, quantity: 1, equipped: true },
        { name: 'Grimório', weightKg: 2, quantity: 1 },
      ]),
      notes: 'Mago élfico buscando recuperar relíquias de seu reino perdido.',
    },
  });

  // 6. Seed Tactical VTT Scene with Tokens and Initiative
  const scene = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Masmorra de Khalmyr',
      gridWidth: 20,
      gridHeight: 16,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      gridColor: 'rgba(212, 175, 55, 0.2)',
      gridOpacity: 0.6,
      isCurrent: true,
    },
  });

  // Update campaign's active scene
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { activeSceneId: scene.id },
  });

  // 7. Seed Tokens on Scene
  const warriorToken = await prisma.token.create({
    data: {
      sceneId: scene.id,
      characterId: characterT20.id,
      name: characterT20.name,
      x: 3,
      y: 4,
      size: 'MEDIUM',
      color: '#D4AF37',
      pvCurrent: characterT20.pvCurrent,
      pvMax: characterT20.pvMax,
      conditionsJson: JSON.stringify([]),
    },
  });

  const bugbearToken = await prisma.token.create({
    data: {
      sceneId: scene.id,
      characterId: null,
      name: 'Bugbear Espreitador',
      x: 7,
      y: 4,
      size: 'MEDIUM',
      color: '#DC2626',
      pvCurrent: 45,
      pvMax: 45,
      conditionsJson: JSON.stringify(['EMBOSCADA']),
    },
  });

  // 8. Seed Initiative Tracker entries
  await prisma.initiativeEntry.create({
    data: {
      sceneId: scene.id,
      tokenId: warriorToken.id,
      name: warriorToken.name,
      initiativeRoll: 18,
      modifier: 3,
      isCurrentTurn: true,
      roundNumber: 1,
    },
  });

  await prisma.initiativeEntry.create({
    data: {
      sceneId: scene.id,
      tokenId: bugbearToken.id,
      name: bugbearToken.name,
      initiativeRoll: 14,
      modifier: 2,
      isCurrentTurn: false,
      roundNumber: 1,
    },
  });

  // 9. Seed Sample RollLog
  await prisma.rollLog.create({
    data: {
      campaignId: campaign.id,
      characterId: characterT20.id,
      senderName: characterT20.name,
      system: 'T20',
      rollType: 'ATTACK',
      expression: '1d20+5 # Ataque Espada Longa',
      diceBreakdown: JSON.stringify([{ die: 20, result: 19 }]),
      total: 24,
      isCrit: true,
      isFumble: false,
      threatMargin: 19,
      label: 'Ataque Espada Longa',
    },
  });

  console.log('Database seeded successfully:');
  console.log(`- 12 Canonical Compendium items`);
  console.log(`- 1 Campaign ("${campaign.name}")`);
  console.log(`- 2 Characters ("${characterT20.name}" [T20], "${characterTRPG.name}" [TRPG])`);
  console.log(`- 1 Scene ("${scene.name}") with 2 Tokens and Initiative`);
  console.log(`- 1 RollLog`);
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
