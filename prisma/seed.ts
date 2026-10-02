import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initiating TRPG Platform Database Seed ---');

  // Check if database is already initialized in production
  const existingCount = await prisma.compendiumItem.count();
  if (existingCount > 0 && process.env.NODE_ENV === 'production' && !process.env.FORCE_RESEED) {
    console.log(`Database already initialized with ${existingCount} items. Skipping wipe in production.`);
    return;
  }

  // 1. Clean existing records (in reverse dependency order)
  await prisma.initiativeEntry.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.rollLog.deleteMany({});
  await prisma.character.deleteMany({});
  await prisma.scene.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.compendiumItem.deleteMany({});

  console.log('Cleared existing records.');

  // 2. Seed 12 Canonical Compendium Entities (Strict preservation for test contracts)
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
    await prisma.compendiumItem.create({ data: item });
  }

  // 3. Expansive Tormenta 20 / TRPG Compendium Entities (Enriched from Drive Books)
  const expandedItems = [
    // -------------------------------------------------------------------------
    // RAÇAS (T20, TRPG & REINOS DE MOREANIA)
    // -------------------------------------------------------------------------
    {
      id: 'race-elfo-t20',
      system: 'ALL',
      type: 'RACE',
      name: 'Elfo',
      description: 'Filhos de Glórienn, altos e esguios, com graça sobrenatural e herança arcana refinada.',
      category: 'Raça Básica',
      dataJson: JSON.stringify({
        attributeModifiers: { INT: 2, DES: 1, CON: -1, FOR: 0, SAB: 0, CAR: 0 },
        size: 'MEDIO',
        speedMeters: 12,
        racialAbilities: [
          { name: 'Graça de Glórienn', description: 'Deslocamento 12m (8 quadrados).' },
          { name: 'Sangue Mágico', description: '+1 PM por nível de personagem.' },
          { name: 'Sentidos Élficos', description: 'Visão na penumbra e +2 em Percepção.' },
        ],
      }),
      tags: 'raca,t20,trpg,elfo,glorienn,magia,deslocamento',
    },
    {
      id: 'race-qareen-t20',
      system: 'T20',
      type: 'RACE',
      name: 'Qareen',
      description: 'Meio-gênios de Wynlla tocados pelos planos elementais, hospitaleiros e plenos de encanto.',
      category: 'Raça Básica',
      dataJson: JSON.stringify({
        attributeModifiers: { CAR: 2, INT: 1, SAB: -1, FOR: 0, DES: 0, CON: 0 },
        size: 'MEDIO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Desejos', description: 'Se lançar uma magia a pedido de um aliado, o custo em PM é reduzido em -1 PM.' },
          { name: 'Resistência Elemental', description: 'Resistência 10 contra um elemento à escolha (Fogo, Frio, Eletricidade ou Ácido).' },
        ],
      }),
      tags: 'raca,t20,qareen,genio,desejos,wynna',
    },
    {
      id: 'race-lefou-t20',
      system: 'T20',
      type: 'RACE',
      name: 'Lefou',
      description: 'Tocados pela Tempestade Rubra, humanoides com deformidades aberrantes que canalizam o poder da Tormenta.',
      category: 'Raça Exótica',
      dataJson: JSON.stringify({
        attributeModifiers: { FOR: 1, DES: 1, CON: 1, CAR: -1, INT: 0, SAB: 0 },
        size: 'MEDIO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Cria da Tormenta', description: 'Monstro tipo Lefeu. Visão no escuro e imunidade a efeitos da Tormenta.' },
          { name: 'Deformidade Aberrante', description: 'Escolha 2 poderes da Tormenta adicionais sem custo inicial de perda de Carisma.' },
        ],
      }),
      tags: 'raca,t20,lefou,tormenta,aberracao,aharadak',
    },
    {
      id: 'race-goblin-t20',
      system: 'ALL',
      type: 'RACE',
      name: 'Goblin',
      description: 'Pequenos, velozes, resilientes e extremamente engenhosos, sobreviventes natos de Arton.',
      category: 'Raça Básica',
      dataJson: JSON.stringify({
        attributeModifiers: { DES: 2, INT: 1, CAR: -1, FOR: 0, CON: 0, SAB: 0 },
        size: 'PEQUENO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Rato de Esgoto', description: '+2 em Fortitude contra venenos e doenças.' },
          { name: 'Engenhoso', description: 'Não sofre penalidade por usar ferramentas improvisadas de Ofício e Ladinagem.' },
        ],
      }),
      tags: 'raca,t20,trpg,goblin,pequeno,ladinagem',
    },
    {
      id: 'race-minotauro-t20',
      system: 'ALL',
      type: 'RACE',
      name: 'Minotauro',
      description: 'Filhos de Tauron, guerreiros honrados e disciplinados dotados de força hercúlea e chifres afiados.',
      category: 'Raça Básica',
      dataJson: JSON.stringify({
        attributeModifiers: { FOR: 2, CON: 1, DES: -1, INT: 0, SAB: 0, CAR: 0 },
        size: 'MEDIO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Chifres', description: 'Ataque desarmado com chifres causando 1d6 de dano perfurante.' },
          { name: 'Couro Rígido', description: '+1 na Defesa.' },
          { name: 'Faro', description: 'Detecta criaturas a até 9m e ignora camuflagem.' },
        ],
      }),
      tags: 'raca,t20,trpg,minotauro,tauron,forca,chifres',
    },
    {
      id: 'race-moreau-t20',
      system: 'ALL',
      type: 'RACE',
      name: 'Moreau (Herdeiro dos Animais)',
      description: 'Habitantes dos Reinos de Moreania abençoados pelos Deuses da Ilha com traços totêmicos como Lobo, Urso, Raposa e Serpente.',
      category: 'Raça Exótica: Moreania',
      dataJson: JSON.stringify({
        attributeModifiers: { DES: 1, CON: 1, SAB: 1, FOR: 0, INT: 0, CAR: 0 },
        size: 'MEDIO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Herança Totêmica', description: 'Escolha uma Herança (Lobo: Faro e ataque em bando; Urso: +2 Força e garras; Raposa: +2 Ladinagem e Enganação; Serpente: Mordida venenosa).' },
          { name: 'Espírito da Ilha', description: '+2 em Sobrevivência e imunidade a sono mágico.' },
        ],
      }),
      tags: 'raca,moreania,reinos-de-moreania,trpg,t20,moreau,totem,feral',
    },
    {
      id: 'race-kliren-t20',
      system: 'T20',
      type: 'RACE',
      name: 'Kliren',
      description: 'Gnomos artonianos nascidos em Vectora e Zakharov, dotados de curiosidade explosiva e engenhosidade técnica incomparável.',
      category: 'Raça Básica',
      dataJson: JSON.stringify({
        attributeModifiers: { INT: 2, DES: 1, FOR: -1, CON: 0, SAB: 0, CAR: 0 },
        size: 'PEQUENO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Engenhosidade', description: 'Gasta 1 PM para somar o bônus de Inteligência em qualquer teste de perícia.' },
          { name: 'Vanguardista', description: 'Recebe proficiência com armas de fogo e engenhocas tecnológicas.' },
        ],
      }),
      tags: 'raca,t20,kliren,engenharia,inteligencia,polvora',
    },
    {
      id: 'race-dahllan-t20',
      system: 'T20',
      type: 'RACE',
      name: 'Dahllan',
      description: 'Meio-dríades protegidas por Allihanna, com flores e folhas crescendo em seus cabelos e união íntima com a terra.',
      category: 'Raça Básica',
      dataJson: JSON.stringify({
        attributeModifiers: { SAB: 2, DES: 1, INT: -1, FOR: 0, CON: 0, CAR: 0 },
        size: 'MEDIO',
        speedMeters: 9,
        racialAbilities: [
          { name: 'Amiga das Plantas', description: 'Pode lançar a magia Controlar Plantas por 1 PM.' },
          { name: 'Casca Grossa Floral', description: 'Armadura natural de casca vegetal concedendo +2 na Defesa.' },
        ],
      }),
      tags: 'raca,t20,dahllan,natureza,allihanna,planta',
    },

    // -------------------------------------------------------------------------
    // CLASSES (MANUAL DO MALANDRO, PIRATAS E PISTOLEIROS & T20)
    // -------------------------------------------------------------------------
    {
      id: 'class-ladino-t20',
      system: 'T20',
      type: 'CLASS',
      name: 'Ladino',
      description: 'Mestre da furtividade, venenos, truques sujos e ataques cirúrgicos nas sombras.',
      category: 'Classe Especialista',
      dataJson: JSON.stringify({
        basePV: 12,
        pvPerLevel: 3,
        basePM: 4,
        pmPerLevel: 4,
        keyAttribute: 'DES',
        mandatorySkills: ['Ladinagem', 'Reflexos'],
        classFeatures: [
          { name: 'Ataque Furtivo', description: '+1d6 de dano contra alvos desprevenidos ou flanqueados (escala a cada 2 níveis).' },
          { name: 'Evasão', description: 'Se passar em teste de Reflexos para reduzir dano à metade, não sofre dano.' },
        ],
      }),
      tags: 'classe,t20,ladino,furtivo,especialista,manual-do-malandro',
    },
    {
      id: 'class-bucaneiro-t20',
      system: 'ALL',
      type: 'CLASS',
      name: 'Bucaneiro',
      description: 'O espadachim audaz dos mares de Arton e Portsmouth, acrobata da mastreação que mescla bravata, florete e pistola.',
      category: 'Classe Especialista & Combatente',
      dataJson: JSON.stringify({
        basePV: 16,
        pvPerLevel: 4,
        basePM: 4,
        pmPerLevel: 4,
        keyAttribute: 'DES',
        mandatorySkills: ['Acrobacia', 'Reflexos'],
        proficiencies: ['Armas Marciais', 'Armas de Fogo', 'Armaduras Leves'],
        classFeatures: [
          { name: 'Audácia', description: 'Gasta 1 PM para somar Carisma em qualquer teste de perícia ou manobra de combate.' },
          { name: 'Insolência', description: 'Soma seu Carisma diretamente na Defesa quando não estiver usando armadura pesada.' },
          { name: 'Panache', description: 'Recupera 1 PM ao acertar um acerto crítico com florete, sabre ou arma de fogo.' },
        ],
      }),
      tags: 'classe,piratas-e-pistoleiros,t20,trpg,bucaneiro,pirata,espadachim,audacia',
    },
    {
      id: 'class-pistoleiro-trpg',
      system: 'TRPG',
      type: 'CLASS',
      name: 'Pistoleiro de Portsmouth',
      description: 'Atirador de elite treinado nos feudos sombrios de Portsmouth, mestre absoluto em recarga relâmpago e disparos fatais.',
      category: 'Classe Combatente à Distância',
      dataJson: JSON.stringify({
        basePV: 16,
        pvPerLevel: 4,
        basePM: 3,
        pmPerLevel: 3,
        keyAttribute: 'DES',
        mandatorySkills: ['Iniciativa', 'Pontaria', 'Ofício'],
        proficiencies: ['Armas Simples', 'Armas de Fogo', 'Armaduras Leves'],
        classFeatures: [
          { name: 'Mira Fulminante', description: 'Adiciona bônus de Inteligência e Destreza ao dano com armas de fogo.' },
          { name: 'Recarga Tática', description: 'Recarrega pistolas como ação livre gastando 1 PM.' },
          { name: 'Tiro no Olho', description: 'Aumenta a margem de ameaça de armas de fogo em +2.' },
        ],
      }),
      tags: 'classe,piratas-e-pistoleiros,trpg,pistoleiro,tiro,polvora,portsmouth',
    },
    {
      id: 'class-malandro-t20',
      system: 'ALL',
      type: 'CLASS',
      name: 'Malandro dos Becos',
      description: 'Sobrevivente nato das vielas de Valkaria e Ahlen, que sobrevive de lábia, truques baixos, dados viciados e esperteza.',
      category: 'Classe Especialista Social & Trapaceiro',
      dataJson: JSON.stringify({
        basePV: 14,
        pvPerLevel: 3,
        basePM: 5,
        pmPerLevel: 5,
        keyAttribute: 'CAR',
        mandatorySkills: ['Enganação', 'Jogatina', 'Ladinagem'],
        classFeatures: [
          { name: 'Golpe Baixo', description: 'Gasta 1 PM ao atacar para deixar o alvo Atordoado ou Cego com terra, areia ou chute.' },
          { name: 'Sorte do Trapaceiro', description: 'Pode rolar novamente qualquer teste de perícia tirado 1 no d20 gastando 1 PM.' },
        ],
      }),
      tags: 'classe,manual-do-malandro,trpg,t20,malandro,ladino,trapaca,valkaria',
    },
    {
      id: 'class-clerigo-t20',
      system: 'ALL',
      type: 'CLASS',
      name: 'Clérigo',
      description: 'O arauto dos Deuses de Arton, canalizando milagres divinos, curas milagrosas e ira sagrada.',
      category: 'Classe Conjuradora Divina',
      dataJson: JSON.stringify({
        basePV: 16,
        pvPerLevel: 4,
        basePM: 5,
        pmPerLevel: 5,
        keyAttribute: 'SAB',
        mandatorySkills: ['Religião', 'Vontade'],
        classFeatures: [
          { name: 'Devoto Fiel', description: 'Canaliza o poder de sua divindade padroeira recebendo poderes concedidos.' },
          { name: 'Canalizar Energia', description: 'Gasta 1 PM para curar ou causar 1d6 de dano em área.' },
        ],
      }),
      tags: 'classe,t20,trpg,clerigo,divino,cura,fe,o-panteao',
    },
    {
      id: 'class-paladino-t20',
      system: 'ALL',
      type: 'CLASS',
      name: 'Paladino',
      description: 'Campeão sagrado da justiça, blindado pela fé inabalável em Khalmyr, Valkaria ou Thyatis.',
      category: 'Classe Combatente Sagrado',
      dataJson: JSON.stringify({
        basePV: 20,
        pvPerLevel: 5,
        basePM: 3,
        pmPerLevel: 3,
        keyAttribute: 'CAR',
        mandatorySkills: ['Luta', 'Vontade'],
        classFeatures: [
          { name: 'Golpe Divino', description: 'Gasta 1 PM para desferir +1d8 de dano sagrado contra o mal.' },
          { name: 'Cura pelas Mãos', description: 'Gasta 1 PM para curar 1d8+1 PV com um toque.' },
          { name: 'Aura Sagrada', description: '+2 em todos os testes de resistência para aliados próximos.' },
        ],
      }),
      tags: 'classe,t20,trpg,paladino,sagrado,golpe-divino,o-panteao',
    },
    {
      id: 'class-barbaro-t20',
      system: 'ALL',
      type: 'CLASS',
      name: 'Bárbaro',
      description: 'Guerreiro primal impulsionado por fúria indomável, capaz de absorver golpes brutais e despedaçar inimigos.',
      category: 'Classe Combatente Primal',
      dataJson: JSON.stringify({
        basePV: 24,
        pvPerLevel: 6,
        basePM: 2,
        pmPerLevel: 2,
        keyAttribute: 'CON',
        mandatorySkills: ['Luta', 'Fortitude'],
        classFeatures: [
          { name: 'Fúria Primal', description: 'Gasta 2 PM para entrar em Fúria: +2 em ataque e dano corpo a corpo, RD 2.' },
          { name: 'Resistência a Dano', description: 'Reduz todo dano físico sofrido em 2 pontos.' },
        ],
      }),
      tags: 'classe,t20,trpg,barbaro,furia,combate',
    },
    {
      id: 'class-nobre-t20',
      system: 'T20',
      type: 'CLASS',
      name: 'Nobre da Corte de Valkaria',
      description: 'Líder carismático com sangue azul do Reinado, capaz de comandar exércitos e inspirar companheiros à glória.',
      category: 'Classe Social & Suporte',
      dataJson: JSON.stringify({
        basePV: 16,
        pvPerLevel: 4,
        basePM: 4,
        pmPerLevel: 4,
        keyAttribute: 'CAR',
        mandatorySkills: ['Diplomacia', 'Nobreza', 'Vontade'],
        classFeatures: [
          { name: 'Autoconfiança', description: 'Soma seu Carisma na Defesa.' },
          { name: 'Comandar', description: 'Gasta 1 PM para conceder uma ação extra para um aliado em alcance curto.' },
        ],
      }),
      tags: 'classe,valkaria,t20,nobre,lideranca,carisma',
    },

    // -------------------------------------------------------------------------
    // ARMAS, ARMADURAS E ITENS (PIRATAS E PISTOLEIROS, MALANDRO, MUNDO DE ARTON)
    // -------------------------------------------------------------------------
    {
      id: 'item-pistola-artoniana',
      system: 'ALL',
      type: 'ITEM',
      name: 'Pistola de Pederneira Artoniana',
      description: 'Arma de fogo portátil de um tiro forjada em Portsmouth. Dispara bagas de chumbo impulsionadas por pó de fumaça.',
      category: 'Arma de Fogo de Uma Mão',
      cost: '250 T$',
      requirement: 'Proficiência com Armas de Fogo',
      dataJson: JSON.stringify({
        damageDice: '2d6',
        damageType: 'Perfuração',
        threatRange: 19,
        critMultiplier: 3,
        rangeCategory: 'Curto (9m)',
        weightSlots: 1,
        reloadAction: 'Padrão',
      }),
      tags: 'item,arma,fogo,pistola,piratas-e-pistoleiros,polvora,critico',
    },
    {
      id: 'item-mosquete-de-pederneira',
      system: 'ALL',
      type: 'ITEM',
      name: 'Mosquete de Infantaria de Portsmouth',
      description: 'Arma de fogo de cano longo com culatra reforçada. Projétil supersônico capaz de perfurar couraças de cavaleiros.',
      category: 'Arma de Fogo de Duas Mãos',
      cost: '500 T$',
      requirement: 'Proficiência com Armas de Fogo',
      dataJson: JSON.stringify({
        damageDice: '2d8',
        damageType: 'Perfuração',
        threatRange: 19,
        critMultiplier: 3,
        rangeCategory: 'Médio (30m)',
        weightSlots: 2,
        reloadAction: 'Completa',
      }),
      tags: 'item,arma,fogo,mosquete,piratas-e-pistoleiros,polvora,tiro-longo',
    },
    {
      id: 'item-bacamarte-naval',
      system: 'ALL',
      type: 'ITEM',
      name: 'Bacamarte de Conveses Naval',
      description: 'Arma de cano em sino que dispara estilhaços e pregos em um cone de dispersão devastador para combate a bordo.',
      category: 'Arma de Fogo Exótica',
      cost: '350 T$',
      dataJson: JSON.stringify({
        damageDice: '3d6',
        damageType: 'Perfuração e Corte',
        threatRange: 20,
        critMultiplier: 2,
        rangeCategory: 'Cone de 6m',
        weightSlots: 2,
      }),
      tags: 'item,arma,fogo,bacamarte,piratas-e-pistoleiros,dispersao,area',
    },
    {
      id: 'item-bandoleira-de-pistolas',
      system: 'ALL',
      type: 'ITEM',
      name: 'Bandoleira de Pistolas de Corsário',
      description: 'Faixa de couro curtido no peito com suportes de saque rápido para até 4 pistolas carregadas.',
      category: 'Equipamento de Aventura',
      cost: '50 T$',
      dataJson: JSON.stringify({
        benefit: 'Permite sacar uma arma de fogo como ação livre em vez de ação de movimento.',
        weightSlots: 1,
      }),
      tags: 'item,equipamento,piratas-e-pistoleiros,bandoleira,pistola,saque',
    },
    {
      id: 'item-sabre-de-corsario',
      system: 'ALL',
      type: 'ITEM',
      name: 'Sabre Naval de Corsário',
      description: 'Lâmina curva de gume afiadíssimo e empunhadura em concha, a arma favorita dos bucaneiros do Mar Negro.',
      category: 'Arma Marcial de Uma Mão',
      cost: '20 T$',
      dataJson: JSON.stringify({
        damageDice: '1d8',
        damageType: 'Corte',
        threatRange: 18,
        critMultiplier: 2,
        weightSlots: 1,
      }),
      tags: 'item,arma,marcial,sabre,piratas-e-pistoleiros,critico,corte',
    },
    {
      id: 'item-polvora-e-balas',
      system: 'ALL',
      type: 'ITEM',
      name: 'Cartucheira com Pólvora e Balas de Chumbo (20 un.)',
      description: 'Frasco de chifre com pó de fumaça refinado e 20 esferas de chumbo calibradas.',
      category: 'Munição',
      cost: '20 T$',
      dataJson: JSON.stringify({
        charges: 20,
        weightSlots: 1,
      }),
      tags: 'item,municao,polvora,balas,piratas-e-pistoleiros',
    },
    {
      id: 'item-dados-viciados-nimb',
      system: 'ALL',
      type: 'ITEM',
      name: 'Dados Viciados de Nimb',
      description: 'Par de dados de marfim entalhado com pesos de mercúrio ocultos. Concede vantagem em apostas e mesas de taverna.',
      category: 'Item de Malandragem',
      cost: '30 T$',
      dataJson: JSON.stringify({
        benefit: '+5 em testes de Jogatina e Enganação. Em caso de falha crítica (1 no d20), a trapaça é descoberta!',
        weightSlots: 0,
      }),
      tags: 'item,manual-do-malandro,nimb,dados,jogatina,trapaca',
    },
    {
      id: 'item-kit-ladinagem-obscura',
      system: 'ALL',
      type: 'ITEM',
      name: 'Kit de Ladinagem Obscura de Valkaria',
      description: 'Estojo aveludado com gazuas mestras de aço flexível, arames finos, espelho com haste e pó de giz.',
      category: 'Ferramenta de Perícia',
      cost: '75 T$',
      dataJson: JSON.stringify({
        benefit: '+2 em testes de Ladinagem para abrir fechaduras e desarmar armadilhas.',
        weightSlots: 1,
      }),
      tags: 'item,manual-do-malandro,valkaria,ladinagem,gazua,arrombamento',
    },
    {
      id: 'item-capa-bolsos-secretos',
      system: 'ALL',
      type: 'ITEM',
      name: 'Capa com Bolsos Secretos',
      description: 'Capa escura forrada com costuras duplas e compartimentos térmicos invisíveis a olhos desatentos.',
      category: 'Vestuário de Aventura',
      cost: '40 T$',
      dataJson: JSON.stringify({
        benefit: '+5 em testes de Furtividade para ocultar armas pequenas, venenos e joias roubadas.',
        weightSlots: 1,
      }),
      tags: 'item,manual-do-malandro,vestuario,ocultacao,bolsos',
    },
    {
      id: 'item-adaga-de-manga',
      system: 'ALL',
      type: 'ITEM',
      name: 'Adaga Retrátil de Manga',
      description: 'Lâmina fina montada sobre molas num bracelete de couro que salta diretamente para a palma com um estalar de dedos.',
      category: 'Arma Exótica Oculta',
      cost: '80 T$',
      dataJson: JSON.stringify({
        damageDice: '1d4',
        damageType: 'Perfuração',
        threatRange: 19,
        critMultiplier: 2,
        benefit: 'Pode ser sacada como ação livre sem alertar oponentes. Alvo fica desprevenido no primeiro golpe.',
        weightSlots: 1,
      }),
      tags: 'item,manual-do-malandro,adaga,manga,surpresa,assassino',
    },
    {
      id: 'item-espada-aco-rubi',
      system: 'ALL',
      type: 'ITEM',
      name: 'Espada Bastarda de Aço-Rubi de Zakharov',
      description: 'Lâmina vermelha translúcida temperada com matéria da Tormenta nas forjas sagradas de Zakharov. Ignora toda resistência a dano.',
      category: 'Arma Superior de Zakharov',
      cost: '3.000 T$',
      dataJson: JSON.stringify({
        damageDice: '1d10/1d12',
        damageType: 'Corte',
        threatRange: 19,
        critMultiplier: 2,
        specialProperty: 'Aço-Rubi: Ignora qualquer Redução de Dano (RD) de qualquer alvo, incluindo Lefeu e construtos.',
        weightSlots: 1,
      }),
      tags: 'item,mundo-de-arton,zakharov,aco-rubi,superior,rd-ignora',
    },
    {
      id: 'item-escudo-mitral-doherimm',
      system: 'ALL',
      type: 'ITEM',
      name: 'Escudo Leve de Mitral de Doherimm',
      description: 'Escudo forjado nas profundezas do reino anão em mitral puro. Prateado, reluzente, tão leve quanto uma pluma.',
      category: 'Escudo Superior Anão',
      cost: '1.200 T$',
      dataJson: JSON.stringify({
        defenseBonus: 2,
        armorPenalty: 0,
        specialProperty: 'Mitral: Penalidade de armadura reduzida a 0. Deixa a mão livre para segurar itens pequenos.',
        weightSlots: 1,
      }),
      tags: 'item,mundo-de-arton,doherimm,mitral,escudo,anao',
    },
    {
      id: 'item-arco-de-tollon',
      system: 'ALL',
      type: 'ITEM',
      name: 'Arco Composto de Madeira de Tollon',
      description: 'Arco entalhado na sagrada madeira verde de Tollon, que responde à força física do atirador amplificando o disparo.',
      category: 'Arma Superior de Distância',
      cost: '600 T$',
      dataJson: JSON.stringify({
        damageDice: '1d8',
        damageType: 'Perfuração',
        threatRange: 20,
        critMultiplier: 3,
        specialProperty: 'Madeira de Tollon: Soma o modificador de Força às rolagens de dano à distância.',
        weightSlots: 2,
      }),
      tags: 'item,mundo-de-arton,tollon,arco,composto,madeira',
    },
    {
      id: 'item-espada-grande',
      system: 'ALL',
      type: 'ITEM',
      name: 'Espada Grande (Montante)',
      description: 'Uma espada maciça de duas mãos capaz de cortar um cavaleiro e sua montaria em dois.',
      category: 'Arma Marcial de Duas Mãos',
      cost: '50 T$',
      dataJson: JSON.stringify({
        damageDice: '2d6',
        damageType: 'Corte',
        threatRange: 19,
        critMultiplier: 2,
        weightSlots: 2,
        grip: 'Duas Mãos',
      }),
      tags: 'item,arma,marcial,espada-grande,corte,duas-maos',
    },
    {
      id: 'item-machado-taurino',
      system: 'T20',
      type: 'ITEM',
      name: 'Machado Taurino de Guerra',
      description: 'Lâmina devastadora forjada nas forjas de Tiberus para os campeões minotauros.',
      category: 'Arma Exótica de Duas Mãos',
      cost: '100 T$',
      dataJson: JSON.stringify({
        damageDice: '3d6',
        damageType: 'Corte',
        threatRange: 20,
        critMultiplier: 3,
        weightSlots: 3,
        grip: 'Duas Mãos',
      }),
      tags: 'item,arma,exotica,minotauro,machado,critico,tauron',
    },
    {
      id: 'item-arco-longo',
      system: 'ALL',
      type: 'ITEM',
      name: 'Arco Longo Élfico',
      description: 'Arco curvado entalhado em madeira de Lenórienn, disparando flechas com alcance devastador.',
      category: 'Arma Marcial à Distância',
      cost: '100 T$',
      dataJson: JSON.stringify({
        damageDice: '1d8',
        damageType: 'Perfuração',
        threatRange: 20,
        critMultiplier: 3,
        rangeCategory: 'Longo',
        weightSlots: 2,
      }),
      tags: 'item,arma,marcial,distancia,arco-longo,elfo',
    },
    {
      id: 'item-armadura-completa',
      system: 'ALL',
      type: 'ITEM',
      name: 'Armadura Completa (Placas)',
      description: 'Placas de aço polido cobrindo o corpo inteiro com malha articulada e elmo fechado.',
      category: 'Armadura Pesada',
      cost: '1.000 T$',
      dataJson: JSON.stringify({
        defenseBonus: 10,
        armorPenalty: -5,
        isHeavy: true,
        weightSlots: 5,
        priceGold: 1000,
      }),
      tags: 'item,armadura,pesada,placas,defesa',
    },
    {
      id: 'item-pocao-de-cura-maior',
      system: 'ALL',
      type: 'ITEM',
      name: 'Poção de Cura Maior',
      description: 'Frasco de cristal com líquido dourado efervescente que restaura vigor vital imediato.',
      category: 'Item Mágico Consumível',
      cost: '150 T$',
      dataJson: JSON.stringify({
        healingFormula: '4d8+4',
        weightSlots: 1,
      }),
      tags: 'item,pocao,cura,magico,vida',
    },
    {
      id: 'item-pocao-de-mana',
      system: 'T20',
      type: 'ITEM',
      name: 'Poção de Essência de Mana',
      description: 'Elixir místico safira que recarrega a energia mística da alma.',
      category: 'Item Mágico Consumível',
      cost: '100 T$',
      dataJson: JSON.stringify({
        manaRestored: 5,
        weightSlots: 1,
      }),
      tags: 'item,pocao,mana,pm,magico',
    },

    // -------------------------------------------------------------------------
    // MAGIAS (O PANTEÃO, PIRATAS, MALANDRO & T20)
    // -------------------------------------------------------------------------
    {
      id: 'spell-armadura-arcana-t20',
      system: 'ALL',
      type: 'SPELL',
      name: 'Armadura Arcana',
      description: 'Uma barreira translúcida de energia mística envolve seu corpo, desviando lâminas e projéteis.',
      category: 'Magia Arcana: Abjuração',
      circle: 1,
      cost: '1 PM',
      requirement: 'Arcano 1º Círculo',
      dataJson: JSON.stringify({
        school: 'Abjuração',
        circle: 1,
        range: 'Pessoal',
        duration: 'Cena',
        basePMCost: 1,
        baseEffect: 'Você recebe +5 na Defesa.',
        enhancements: [
          { pmCost: 2, description: 'Aumenta o bônus de Defesa em +2.' },
          { pmCost: 2, description: 'Muda o alcance para Toque e o alvo para 1 criatura.' },
        ],
      }),
      tags: 'magia,arcana,abjuracao,defesa,1-circulo',
    },
    {
      id: 'spell-primor-atletico-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Primor Atlético',
      description: 'Energia mágica corre pelos seus músculos, ampliando saltos, velocidade e força física.',
      category: 'Magia Arcana: Transmutação',
      circle: 1,
      cost: '1 PM',
      requirement: 'Arcano 1º Círculo',
      dataJson: JSON.stringify({
        school: 'Transmutação',
        circle: 1,
        range: 'Pessoal',
        duration: 'Cena',
        basePMCost: 1,
        baseEffect: '+9m de deslocamento e +5 em testes de Atletismo e Acrobacia.',
      }),
      tags: 'magia,arcana,transmutacao,mobilidade,1-circulo',
    },
    {
      id: 'spell-toque-chocante-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Toque Chocante',
      description: 'Faíscas elétricas azuis saltam dos seus dedos penetrando até as armaduras mais espessas.',
      category: 'Magia Arcana: Evocação',
      circle: 1,
      cost: '1 PM',
      requirement: 'Arcano 1º Círculo',
      dataJson: JSON.stringify({
        school: 'Evocação',
        circle: 1,
        range: 'Toque',
        damageDice: '2d8+2',
        damageType: 'Eletricidade',
        basePMCost: 1,
        enhancements: [
          { pmCost: 2, description: 'Aumenta o dano em +1d8+1 de eletricidade.' },
          { pmCost: 1, description: 'Se o alvo estiver usando armadura metálica, ignora 5 pontos de Defesa.' },
        ],
      }),
      tags: 'magia,arcana,evocacao,eletricidade,dano,1-circulo',
    },
    {
      id: 'spell-soco-de-arsenal-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Soco de Arsenal',
      description: 'Um punho gigantesco de pura energia bélica esmaga e projeta o alvo para longe.',
      category: 'Magia Divina: Convocação',
      circle: 2,
      cost: '3 PM',
      requirement: 'Divina 2º Círculo',
      dataJson: JSON.stringify({
        school: 'Convocação',
        circle: 2,
        range: 'Curto',
        damageDice: '4d8+4',
        damageType: 'Impacto',
        basePMCost: 3,
        enhancements: [
          { pmCost: 2, description: 'Empurra o alvo 3m para trás e o derruba.' },
        ],
      }),
      tags: 'magia,divina,arsenal,impacto,2-circulo,o-panteao',
    },
    {
      id: 'spell-velocidade-t20',
      system: 'ALL',
      type: 'SPELL',
      name: 'Velocidade',
      description: 'O tempo parece desacelerar ao redor do alvo, concedendo uma ação padrão adicional a cada rodada.',
      category: 'Magia Arcana: Transmutação',
      circle: 3,
      cost: '6 PM',
      requirement: 'Arcano 3º Círculo',
      dataJson: JSON.stringify({
        school: 'Transmutação',
        circle: 3,
        range: 'Curto',
        duration: 'Sustentada',
        basePMCost: 6,
        baseEffect: 'O alvo ganha uma ação padrão extra por rodada e +2 na Defesa.',
      }),
      tags: 'magia,arcana,velocidade,transmutacao,3-circulo,buff',
    },
    {
      id: 'spell-colera-divina-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Cólera Divina',
      description: 'Um pilar colossal de fogo sagrado irrompe dos céus de Arton incinerando os ímpios.',
      category: 'Magia Divina: Evocação',
      circle: 3,
      cost: '6 PM',
      requirement: 'Divina 3º Círculo',
      dataJson: JSON.stringify({
        school: 'Evocação',
        circle: 3,
        range: 'Médio',
        damageDice: '8d6',
        damageType: 'Luz e Fogo Sagrado',
        basePMCost: 6,
      }),
      tags: 'magia,divina,luz,fogo,area,3-circulo,o-panteao',
    },
    {
      id: 'spell-teia-de-wynna-t20',
      system: 'ALL',
      type: 'SPELL',
      name: 'Teia de Wynna',
      description: 'Fios iridescentes de magia pura prendem os alvos, amortecendo impactos e impedindo conjurações hostis.',
      category: 'Magia Divina/Arcana: Convocação',
      circle: 2,
      cost: '3 PM',
      requirement: 'Devoto de Wynna ou Arcano 2º Círculo',
      dataJson: JSON.stringify({
        school: 'Convocação',
        circle: 2,
        range: 'Médio',
        area: 'Cubo de 6m',
        duration: 'Cena',
        baseEffect: 'Criaturas na área ficam Imóveis e Enredadas. Teste de Reflexos para escapar.',
      }),
      tags: 'magia,wynna,o-panteao,teia,controle,2-circulo',
    },
    {
      id: 'spell-chama-imortal-thyatis-t20',
      system: 'T20',
      type: 'SPELL',
      name: 'Chama Imortal de Thyatis',
      description: 'Uma labareda dourada que não queima a carne dos justos, mas cicatriza instantaneamente ferimentos mortais.',
      category: 'Magia Divina: Evocação',
      circle: 3,
      cost: '6 PM',
      requirement: 'Devoto de Thyatis',
      dataJson: JSON.stringify({
        school: 'Evocação',
        circle: 3,
        range: 'Curto',
        healingDice: '6d8+6',
        duration: 'Instantânea',
        baseEffect: 'Cura 6d8+6 PV e remove qualquer condição de Paralisia ou Veneno.',
      }),
      tags: 'magia,divina,thyatis,o-panteao,cura,ressurreicao,3-circulo',
    },
    {
      id: 'spell-nevoa-dos-corsarios-t20',
      system: 'ALL',
      type: 'SPELL',
      name: 'Névoa Espessa dos Corsários',
      description: 'Brumas marítimas densas engolfam o convés ou campo de batalha, obscurecendo a visão a mais de 1,5m.',
      category: 'Magia Arcana: Ilusão',
      circle: 1,
      cost: '1 PM',
      requirement: 'Arcano 1º Círculo',
      dataJson: JSON.stringify({
        school: 'Ilusão',
        circle: 1,
        range: 'Curto',
        area: 'Esfera de 6m',
        duration: 'Cena',
        baseEffect: 'Concede Camuflagem Total para quem estiver além de 1,5m. Tiros à distância sofrem 50% de chance de erro.',
      }),
      tags: 'magia,piratas-e-pistoleiros,nevoa,ilusao,camuflagem,1-circulo',
    },
    {
      id: 'spell-salto-do-gato-t20',
      system: 'ALL',
      type: 'SPELL',
      name: 'Salto do Gato de Valkaria',
      description: 'Mágica urbana sutil que dobra os reflexos do conjurador para amortecer quedas de telhados e escalar muros verticais.',
      category: 'Magia Arcana: Transmutação',
      circle: 1,
      cost: '1 PM',
      requirement: 'Arcano 1º Círculo',
      dataJson: JSON.stringify({
        school: 'Transmutação',
        circle: 1,
        range: 'Pessoal',
        duration: 'Cena',
        baseEffect: 'Ignora até 12m de dano de queda e concede +10 em testes de Atletismo para escalar.',
      }),
      tags: 'magia,manual-do-malandro,valkaria,queda,mobilidade,1-circulo',
    },

    // -------------------------------------------------------------------------
    // PODERES E TALENTOS (O PANTEÃO, PIRATAS E PISTOLEIROS, MALANDRO, MOREANIA)
    // -------------------------------------------------------------------------
    {
      id: 'power-vitalidade-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Vitalidade',
      description: 'Sua constituição férrea concede vigor inesgotável para suportar ferimentos atrozes.',
      category: 'Destino',
      requirement: 'CON 1',
      dataJson: JSON.stringify({
        description: 'Você recebe +1 PV por nível de personagem e +2 em testes de Fortitude.',
      }),
      tags: 'poder,geral,vitalidade,pv,fortitude',
    },
    {
      id: 'power-surto-heroico-t20',
      system: 'T20',
      type: 'POWER',
      name: 'Surto Heróico',
      description: 'Uma explosão repentina de adrenalina permite realizar um feito sobre-humano num instante crítico.',
      category: 'Destino',
      cost: '5 PM',
      requirement: 'Nível 5',
      dataJson: JSON.stringify({
        description: 'Uma vez por rodada, gaste 5 PM para realizar uma ação padrão ou de movimento adicional.',
      }),
      tags: 'poder,geral,surto-heroico,acao-extra,turno',
    },
    {
      id: 'power-disparo-certeiro-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Disparo Certeiro',
      description: 'Olhos de águia e mira impecável com armas de disparo ou arremesso.',
      category: 'Combate',
      requirement: 'DES 1',
      dataJson: JSON.stringify({
        description: 'Você recebe +2 em testes de Pontaria e rolagens de dano com armas de ataque à distância.',
      }),
      tags: 'poder,combate,pontaria,distancia,arco,tiro',
    },

    // Manual do Malandro: Talentos & Truques Sujos
    {
      id: 'power-golpe-baixo-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Golpe Baixo',
      description: 'Um chute certeiro na virilha, joelhada ou cotovelada inesperada que desestabiliza o oponente.',
      category: 'Talento da Malandragem',
      cost: '1 PM',
      requirement: 'Manual do Malandro / Ladino',
      dataJson: JSON.stringify({
        description: 'Ao atingir um ataque corpo a corpo, gaste 1 PM para deixar o alvo Atordoado por 1 rodada (Fortitude CD 15 anula).',
      }),
      tags: 'poder,talento,manual-do-malandro,golpe-baixo,atordoado,ladino',
    },
    {
      id: 'power-areia-nos-olhos-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Areia nos Olhos',
      description: 'Joga terra, cinzas ou pó nos olhos de um oponente corpo a corpo para cegá-lo instantaneamente.',
      category: 'Talento da Malandragem',
      cost: '1 PM',
      requirement: 'Manual do Malandro',
      dataJson: JSON.stringify({
        description: 'Como ação de movimento, jogue sujeira nos olhos de um inimigo adjacente. Ele deve passar em Reflexos ou fica Cego por 1 rodada.',
      }),
      tags: 'poder,talento,manual-do-malandro,areia,cegueira,truque-sujo',
    },
    {
      id: 'power-finta-desconcertante-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Finta Desconcertante',
      description: 'Um floreio enganador com capa ou olhar falso que faz o oponente abrir a guarda completamente.',
      category: 'Talento da Malandragem',
      cost: '1 PM',
      requirement: 'Treinado em Enganação',
      dataJson: JSON.stringify({
        description: 'Faça um teste de Enganação oposto à Percepção do alvo. Se vencer, ele fica Desprevenido contra seu próximo ataque.',
      }),
      tags: 'poder,talento,manual-do-malandro,finta,desprevenido,enganacao',
    },
    {
      id: 'power-ladrao-de-magia-t20',
      system: 'ALL',
      type: 'POWER',
      name: 'Ladrão de Magia',
      description: 'Ao desferir um ataque furtivo num conjurador, você drena sua reserva mística para alimentar seus próprios truques.',
      category: 'Talento da Malandragem',
      requirement: 'Ladino Nível 4',
      dataJson: JSON.stringify({
        description: 'Quando atinge um ataque furtivo contra um conjurador, ele perde 2 PM e você recupera 1 PM.',
      }),
      tags: 'poder,talento,manual-do-malandro,ladrao,magia,mana,dreno',
    },

    // Piratas e Pistoleiros: Talentos Navais & Pólvora
    {
      id: 'power-recarga-rapida-polvora',
      system: 'ALL',
      type: 'POWER',
      name: 'Recarga Rápida com Pólvora',
      description: 'Dedos ágeis capazes de socar pólvora e chumbo na culatra sob tiroteio intenso.',
      category: 'Talento de Piratas e Pistoleiros',
      requirement: 'Proficiência com Armas de Fogo',
      dataJson: JSON.stringify({
        description: 'Reduz o tempo de recarga de pistolas de ação padrão para ação de movimento, e de mosquetes de completa para padrão.',
      }),
      tags: 'poder,talento,piratas-e-pistoleiros,recarga,polvora,pistola,mosquete',
    },
    {
      id: 'power-disparo-queima-roupa',
      system: 'ALL',
      type: 'POWER',
      name: 'Disparo à Queima-Roupa',
      description: 'Encosta o cano fumegante da pistola diretamente contra o peito do oponente sem hesitação.',
      category: 'Talento de Piratas e Pistoleiros',
      requirement: 'Bucaneiro ou Pistoleiro',
      dataJson: JSON.stringify({
        description: 'Você pode disparar armas de fogo em combate corpo a corpo sem sofrer penalidade e sem provocar ataques de oportunidade.',
      }),
      tags: 'poder,talento,piratas-e-pistoleiros,tiro,queima-roupa,combate',
    },
    {
      id: 'power-pernas-de-marinheiro',
      system: 'ALL',
      type: 'POWER',
      name: 'Pernas de Marinheiro',
      description: 'Equilíbrio inabalável desenvolvido ao longo de anos enfrentando tempestades e conveses escorregadios.',
      category: 'Talento de Piratas e Pistoleiros',
      requirement: 'Acrobacia ou Atletismo',
      dataJson: JSON.stringify({
        description: '+4 em testes de equilíbrio e acrobacia. Ignora terreno difícil em navios, pontes e cordas suspensas.',
      }),
      tags: 'poder,talento,piratas-e-pistoleiros,equilibrio,marinheiro,acrobacia',
    },
    {
      id: 'power-duelo-ao-meio-dia',
      system: 'ALL',
      type: 'POWER',
      name: 'Duelo ao Meio-Dia',
      description: 'A serenidade mortal de um atirador antes do primeiro estampido de pólvora.',
      category: 'Talento de Piratas e Pistoleiros',
      requirement: 'Pistoleiro / Bucaneiro',
      dataJson: JSON.stringify({
        description: 'Você soma seu Carisma ou Inteligência em testes de Iniciativa. Na primeira rodada, seu ataque de arma de fogo causa crítico em 18-20.',
      }),
      tags: 'poder,talento,piratas-e-pistoleiros,duelo,iniciativa,critico',
    },

    // O Panteão: Poderes Concedidos dos 20 Deuses Maiores de Arton
    {
      id: 'power-deity-liberdade-valkaria',
      system: 'ALL',
      type: 'POWER',
      name: 'Liberdade Incondicional (Valkaria)',
      description: 'A bênção da Deusa da Humanidade e Ambição quebra quaisquer grilhões ou amarras que ousem prendê-lo.',
      category: 'Poder Concedido: Valkaria',
      cost: '2 PM',
      requirement: 'Devoto de Valkaria',
      dataJson: JSON.stringify({
        description: 'Gaste 2 PM para se livrar instantaneamente de qualquer condição de paralisia, imobilização ou agarro.',
      }),
      tags: 'poder,concedido,valkaria,liberdade,o-panteao',
    },
    {
      id: 'power-deity-armas-ambicao-valkaria',
      system: 'ALL',
      type: 'POWER',
      name: 'Armas da Ambição (Valkaria)',
      description: 'A chama da ambição humana guia suas armas para atingir metas impossíveis.',
      category: 'Poder Concedido: Valkaria',
      requirement: 'Devoto de Valkaria',
      dataJson: JSON.stringify({
        description: 'Você recebe +1 em testes de ataque e na margem de ameaça de acerto crítico com sua arma favorita.',
      }),
      tags: 'poder,concedido,valkaria,ambicao,ataque,o-panteao',
    },
    {
      id: 'power-deity-justica-khalmyr',
      system: 'ALL',
      type: 'POWER',
      name: 'Espada Justiceira (Khalmyr)',
      description: 'A espada do Deus da Justiça guia sua lâmina com retidão implacável.',
      category: 'Poder Concedido: Khalmyr',
      cost: '1 PM',
      requirement: 'Devoto de Khalmyr',
      dataJson: JSON.stringify({
        description: 'Gaste 1 PM ao atacar para aumentar o passo de dano da sua espada em uma categoria e somar Sabedoria no dano.',
      }),
      tags: 'poder,concedido,khalmyr,justica,dano,o-panteao',
    },
    {
      id: 'power-deity-coragem-total-khalmyr',
      system: 'ALL',
      type: 'POWER',
      name: 'Coragem Total (Khalmyr)',
      description: 'A firmeza do líder dos deuses protege seu coração contra qualquer pavor ou covardia.',
      category: 'Poder Concedido: Khalmyr',
      requirement: 'Devoto de Khalmyr',
      dataJson: JSON.stringify({
        description: 'Você é imune a medo. Aliados a até 9m recebem +2 em testes de Vontade contra efeitos de medo.',
      }),
      tags: 'poder,concedido,khalmyr,coragem,imunidade,o-panteao',
    },
    {
      id: 'power-deity-wynna-bencao',
      system: 'ALL',
      type: 'POWER',
      name: 'Bênção da Magia (Wynna)',
      description: 'A Deusa da Magia sorri para você, infundindo um poder arcano sem precedentes.',
      category: 'Poder Concedido: Wynna',
      requirement: 'Devoto de Wynna',
      dataJson: JSON.stringify({
        description: 'Você aprende uma magia arcana ou divina de 1º círculo de sua escolha, e recebe +1 PM por nível.',
      }),
      tags: 'poder,concedido,wynna,magia,arcano,o-panteao',
    },
    {
      id: 'power-deity-wynna-centelha',
      system: 'ALL',
      type: 'POWER',
      name: 'Centelha Mágica (Wynna)',
      description: 'Você pode transformar mana bruta em feixes de energia colorida para auxiliar aliados.',
      category: 'Poder Concedido: Wynna',
      cost: '1 PM',
      requirement: 'Devoto de Wynna',
      dataJson: JSON.stringify({
        description: 'Gaste 1 PM para reduzir o custo da próxima magia de um aliado adjacente em 1 PM.',
      }),
      tags: 'poder,concedido,wynna,centelha,suporte,o-panteao',
    },
    {
      id: 'power-deity-nimb-sorte',
      system: 'ALL',
      type: 'POWER',
      name: 'Sorte dos Loucos (Nimb)',
      description: 'O Deus do Caos e da Sorte ri das probabilidades e vira o destino ao seu favor.',
      category: 'Poder Concedido: Nimb',
      cost: '1 PM',
      requirement: 'Devoto de Nimb',
      dataJson: JSON.stringify({
        description: 'Role 1d6 ao falhar num teste de d20: em resultado 4, 5 ou 6, o teste é transformado em um sucesso imediato!',
      }),
      tags: 'poder,concedido,nimb,sorte,caos,o-panteao',
    },
    {
      id: 'power-deity-nimb-poder-oculto',
      system: 'ALL',
      type: 'POWER',
      name: 'Poder Oculto (Nimb)',
      description: 'Canaliza a loucura primordial para manifestar bônus imprevisíveis durante o combate.',
      category: 'Poder Concedido: Nimb',
      cost: '2 PM',
      requirement: 'Devoto de Nimb',
      dataJson: JSON.stringify({
        description: 'Gaste 2 PM e role 1d6: 1=+2 em Ataque, 2=+2 em Defesa, 3=+2 em Dano, 4=+5m Movimento, 5=+1d8 Cura, 6=Todos os bônus anteriores juntos!',
      }),
      tags: 'poder,concedido,nimb,poder-oculto,roleta,o-panteao',
    },
    {
      id: 'power-deity-arsenal-sangue',
      system: 'ALL',
      type: 'POWER',
      name: 'Sangue de Ferro (Arsenal)',
      description: 'A armadura de ferro e fogo do Deus da Guerra corre por suas próprias veias.',
      category: 'Poder Concedido: Arsenal',
      requirement: 'Devoto de Arsenal',
      dataJson: JSON.stringify({
        description: 'Você recebe Redução de Dano 2 contra armas cortantes, perfurantes e de impacto.',
      }),
      tags: 'poder,concedido,arsenal,keen,guerra,rd,o-panteao',
    },
    {
      id: 'power-deity-arsenal-furia',
      system: 'ALL',
      type: 'POWER',
      name: 'Fúria Guerreira (Arsenal)',
      description: 'O clamor da batalha eleva seus golpes a potências devastadoras.',
      category: 'Poder Concedido: Arsenal',
      cost: '2 PM',
      requirement: 'Devoto de Arsenal',
      dataJson: JSON.stringify({
        description: 'Gaste 2 PM ao atacar para causar +1d10 pontos de dano bélico extra com armas de metal.',
      }),
      tags: 'poder,concedido,arsenal,furia,combate,o-panteao',
    },
    {
      id: 'power-deity-thyatis-dom',
      system: 'ALL',
      type: 'POWER',
      name: 'Dom da Ressurreição (Thyatis)',
      description: 'O Deus da Profecia e da Ressurreição jamais permite que seus escolhidos pereçam permanentemente sem cumprir seu destino.',
      category: 'Poder Concedido: Thyatis',
      requirement: 'Devoto de Thyatis',
      dataJson: JSON.stringify({
        description: 'Se for reduzido a 0 PV ou morrer, uma labareda dourada o ressurge imediatamente com 50% dos seus PV máximos (1x por aventura).',
      }),
      tags: 'poder,concedido,thyatis,ressurreicao,fenix,imortal,o-panteao',
    },
    {
      id: 'power-deity-allihanna-comunhao',
      system: 'ALL',
      type: 'POWER',
      name: 'Comunhão com Animais (Allihanna)',
      description: 'A Deusa da Natureza confere o dom de falar, acalmar e liderar as feras selvagens de Arton.',
      category: 'Poder Concedido: Allihanna',
      requirement: 'Devoto de Allihanna',
      dataJson: JSON.stringify({
        description: 'Você pode se comunicar livremente com qualquer animal e recebe +4 em testes de Adestramento e Sobrevivência.',
      }),
      tags: 'poder,concedido,allihanna,natureza,animais,o-panteao',
    },
    {
      id: 'power-deity-tanna-toh-voz',
      system: 'ALL',
      type: 'POWER',
      name: 'Voz da Civilização (Tanna-Toh)',
      description: 'A Deusa do Conhecimento concede a compreensão de todos os idiomas e dialetos conhecidos.',
      category: 'Poder Concedido: Tanna-Toh',
      requirement: 'Devoto de Tanna-Toh',
      dataJson: JSON.stringify({
        description: 'Você fala e compreende todas as línguas de Arton e nunca pode mentir ou ocultar a verdade factual.',
      }),
      tags: 'poder,concedido,tanna-toh,conhecimento,idiomas,o-panteao',
    },
    {
      id: 'power-deity-marah-palavras',
      system: 'ALL',
      type: 'POWER',
      name: 'Palavras de Paz (Marah)',
      description: 'A graça da Deusa do Amor e da Paz desarmona a fúria nos corações mais cruéis.',
      category: 'Poder Concedido: Marah',
      cost: '1 PM',
      requirement: 'Devoto de Marah',
      dataJson: JSON.stringify({
        description: 'Gaste 1 PM para fazer um teste de Diplomacia: oponentes que falharem em Vontade recusam-se a iniciar hostilidades.',
      }),
      tags: 'poder,concedido,marah,paz,diplomacia,o-panteao',
    },
    {
      id: 'power-deity-lin-wu-honra',
      system: 'ALL',
      type: 'POWER',
      name: 'Golpe Honrado (Lin-Wu)',
      description: 'O Deus-Dragão da Honra e da Tradição de Tamu-ra guia cortes desferidos com virtude samurai.',
      category: 'Poder Concedido: Lin-Wu',
      cost: '1 PM',
      requirement: 'Devoto de Lin-Wu',
      dataJson: JSON.stringify({
        description: 'Gaste 1 PM ao atacar um oponente frente a frente em combate honrado para somar Sabedoria no teste de ataque e na Defesa.',
      }),
      tags: 'poder,concedido,lin-wu,honra,samurai,tamura,o-panteao',
    },
    {
      id: 'power-deity-tauron-furia',
      system: 'ALL',
      type: 'POWER',
      name: 'Fúria Taurina (Tauron)',
      description: 'A força suprema de Tauron, o ex-líder do Panteão, fortalece o vigor dos que protegem os fracos.',
      category: 'Poder Concedido: Tauron',
      requirement: 'Devoto de Tauron',
      dataJson: JSON.stringify({
        description: '+2 em Força e +2 na Defesa enquanto estiver empunhando uma arma marcial ou protegendo um aliado adjacente.',
      }),
      tags: 'poder,concedido,tauron,forca,minotauro,o-panteao',
    },
    {
      id: 'power-deity-tenebra-caricia',
      system: 'ALL',
      type: 'POWER',
      name: 'Carícia Sombria (Tenebra)',
      description: 'A Mãe da Noite acolhe seus devotos na escuridão eterna das profundezas.',
      category: 'Poder Concedido: Tenebra',
      requirement: 'Devoto de Tenebra',
      dataJson: JSON.stringify({
        description: 'Recebe Visão no Escuro perfeita e pode canalizar energia negativa para curar mortos-vivos ou causar dano de trevas.',
      }),
      tags: 'poder,concedido,tenebra,noite,trevas,o-panteao',
    },
    {
      id: 'power-deity-sszzaas-veneno',
      system: 'ALL',
      type: 'POWER',
      name: 'Sangue Venenoso (Sszzaas)',
      description: 'O Grande Corruptor infunde suas veias com a peçonha mais letal dos pântanos artonianos.',
      category: 'Poder Concedido: Sszzaas',
      requirement: 'Devoto de Sszzaas',
      dataJson: JSON.stringify({
        description: 'Imunidade completa a venenos. Seus ataques com lâminas podem aplicar veneno que causa 2d6 de dano de ácido extra.',
      }),
      tags: 'poder,concedido,sszzaas,veneno,traicao,serpente,o-panteao',
    },
    {
      id: 'power-deity-ragnar-morte',
      system: 'ALL',
      type: 'POWER',
      name: 'Fúria da Morte (Ragnar)',
      description: 'O Deus da Morte Goblinóide se regozija com o massacre dos inimigos caídos.',
      category: 'Poder Concedido: Ragnar',
      cost: '1 PM',
      requirement: 'Devoto de Ragnar',
      dataJson: JSON.stringify({
        description: 'Quando você reduz um inimigo a 0 PV, recupera 2 PM instantaneamente e ganha um ataque extra.',
      }),
      tags: 'poder,concedido,ragnar,morte,necrose,o-panteao',
    },
    {
      id: 'power-deity-oceano-ondas',
      system: 'ALL',
      type: 'POWER',
      name: 'Mestre das Ondas (Oceano)',
      description: 'O Soberano dos Mares concede o fôlego aquático e a agilidade dos peixes nas águas profundas.',
      category: 'Poder Concedido: Oceano',
      requirement: 'Devoto de Oceano',
      dataJson: JSON.stringify({
        description: 'Você pode respirar embaixo d’água e possui deslocamento de natação igual ao seu deslocamento terrestre.',
      }),
      tags: 'poder,concedido,oceano,mar,agua,natacao,o-panteao',
    },
    {
      id: 'power-deity-aharadak-rejeicao',
      system: 'ALL',
      type: 'POWER',
      name: 'Rejeição Aberrante (Aharadak)',
      description: 'O Deus da Tormenta torna sua anatomia grotesca e inumana, imune às leis normais da biologia.',
      category: 'Poder Concedido: Aharadak',
      requirement: 'Devoto de Aharadak',
      dataJson: JSON.stringify({
        description: 'Você se torna imune a acertos críticos e ataques furtivos. Recebe +2 em todas as resistências dentro de Áreas de Tormenta.',
      }),
      tags: 'poder,concedido,aharadak,tormenta,aberracao,o-panteao',
    },

    // Reinos de Moreania: Poderes Totêmicos
    {
      id: 'power-mordida-feral-moreau',
      system: 'ALL',
      type: 'POWER',
      name: 'Mordida Feral Moreau',
      description: 'Instinto predador ancestral dos Moreau da Ilha que se manifesta em dentes cerrados.',
      category: 'Poder Totêmico: Moreania',
      requirement: 'Raça Moreau',
      dataJson: JSON.stringify({
        description: 'Você ganha um ataque desarmado secundário de Mordida (1d6 perfuração) utilizável junto com seus ataques normais.',
      }),
      tags: 'poder,moreania,moreau,mordida,feral,totem',
    },
    {
      id: 'power-sentidos-da-ilha',
      system: 'ALL',
      type: 'POWER',
      name: 'Sentidos da Ilha de Moreania',
      description: 'Conexão visceral com o ambiente selvagem permitindo pressentir emboscadas e caçadores.',
      category: 'Poder Totêmico: Moreania',
      requirement: 'Raça Moreau',
      dataJson: JSON.stringify({
        description: '+4 em Percepção e Iniciativa. Nunca é considerado desprevenido na primeira rodada de combate.',
      }),
      tags: 'poder,moreania,moreau,sentidos,percepcao,iniciativa',
    },

    // -------------------------------------------------------------------------
    // AMEAÇAS & BESTIÁRIO (VALKARIA, PIRATAS, MOREANIA & T20)
    // -------------------------------------------------------------------------
    {
      id: 'threat-goblin-salteador-t20',
      system: 'T20',
      type: 'THREAT',
      name: 'Goblin Salteador',
      description: 'Pequeno batedor astuto armado com adaga envenenada e funda nas matas de Arton.',
      category: 'Ameaça: Humanoide Pequeno',
      dataJson: JSON.stringify({
        challengeRating: 0.25, // ND 1/4
        defense: 14,
        pv: 12,
        speedMeters: 9,
        attacks: [
          { name: 'Adaga Curta', attackBonus: 5, damageDice: '1d4+1', threatRange: 19, critMultiplier: 2 },
          { name: 'Funda', attackBonus: 6, damageDice: '1d4', threatRange: 20, critMultiplier: 2 },
        ],
      }),
      tags: 'ameaca,nd1-4,goblin,lacaio,monstro',
    },
    {
      id: 'threat-esqueleto-guardiao-t20',
      system: 'ALL',
      type: 'THREAT',
      name: 'Esqueleto Guardião',
      description: 'Ossos reanimados por magia profana empunhando espada enferrujada nas catacumbas.',
      category: 'Ameaça: Morto-Vivo Médio',
      dataJson: JSON.stringify({
        challengeRating: 0.5, // ND 1/2
        defense: 15,
        pv: 16,
        speedMeters: 9,
        attacks: [
          { name: 'Cimitarra Enferrujada', attackBonus: 6, damageDice: '1d6+2', threatRange: 18, critMultiplier: 2 },
        ],
      }),
      tags: 'ameaca,nd1-2,esqueleto,morto-vivo,masmorra',
    },
    {
      id: 'threat-cultista-tormenta-t20',
      system: 'T20',
      type: 'THREAT',
      name: 'Cultista de Aharadak',
      description: 'Fanático corrompido pela Tempestade Rubra, conjurando raios de ácido e espinhos quitinosos.',
      category: 'Ameaça: Humanoide Médio',
      dataJson: JSON.stringify({
        challengeRating: 2, // ND 2
        defense: 16,
        pv: 38,
        pm: 12,
        speedMeters: 9,
        attacks: [
          { name: 'Adaga Sacrificial Rubra', attackBonus: 8, damageDice: '1d4+4 mais 1d6 ácido', threatRange: 19, critMultiplier: 2 },
        ],
        specialAbilities: [
          { name: 'Olhar da Tormenta', description: 'Causa condição Abalado em área com teste de Vontade CD 16.' },
        ],
      }),
      tags: 'ameaca,nd2,cultista,tormenta,aharadak,acido',
    },
    {
      id: 'threat-lefeu-tormenta-t20',
      system: 'T20',
      type: 'THREAT',
      name: 'Lefeu Espreitador da Tormenta',
      description: 'Monstruosidade aberrante de quitina rubra e garras de lâmina saída diretamente da Tempestade Rubra.',
      category: 'Ameaça: Monstro Grande',
      dataJson: JSON.stringify({
        challengeRating: 5, // ND 5
        defense: 22,
        pv: 95,
        pm: 20,
        speedMeters: 12,
        attacks: [
          { name: 'Pinça Quitinosa Devastadora', attackBonus: 14, damageDice: '2d8+8 mais 2d6 ácido', threatRange: 19, critMultiplier: 3 },
          { name: 'Ferrão Rubro', attackBonus: 14, damageDice: '1d10+6 mais veneno', threatRange: 20, critMultiplier: 2 },
        ],
        specialAbilities: [
          { name: 'Matéria Vermelha', description: 'Redução de Dano 10. Imunidade a acertos críticos e ácido.' },
        ],
      }),
      tags: 'ameaca,nd5,lefeu,chefe,tormenta,aberracao,morte',
    },
    {
      id: 'threat-dragao-vermelho-t20',
      system: 'ALL',
      type: 'THREAT',
      name: 'Dragão Vermelho Jovem de Arton',
      description: 'O ápice dos predadores dracônicos de Arton, soberano dos céus e cuspidor de labaredas colossais.',
      category: 'Ameaça: Dragão Enorme',
      dataJson: JSON.stringify({
        challengeRating: 8, // ND 8
        defense: 28,
        pv: 210,
        pm: 35,
        speedMeters: 18,
        attacks: [
          { name: 'Mordida Titânica', attackBonus: 18, damageDice: '3d8+12 mais 2d6 fogo', threatRange: 19, critMultiplier: 2 },
          { name: 'Garras Gêmeas', attackBonus: 18, damageDice: '2d6+10', threatRange: 20, critMultiplier: 2 },
          { name: 'Sopro de Labaredas', attackBonus: 0, damageDice: '10d6 fogo em cone de 12m', threatRange: 20, critMultiplier: 2 },
        ],
      }),
      tags: 'ameaca,nd8,dragao,boss,epico,fogo,soberano',
    },
    {
      id: 'threat-guarda-valkaria-t20',
      system: 'ALL',
      type: 'THREAT',
      name: 'Guarda da Milícia de Valkaria',
      description: 'Soldado disciplinado da patrulha urbana da capital, trajando libré azul e ouro e armado com alabarda.',
      category: 'Ameaça: Humanoide Médio',
      dataJson: JSON.stringify({
        challengeRating: 1, // ND 1
        defense: 17,
        pv: 26,
        speedMeters: 9,
        attacks: [
          { name: 'Alabarda da Guarda', attackBonus: 7, damageDice: '1d10+4', threatRange: 20, critMultiplier: 3 },
          { name: 'Besta Pesada', attackBonus: 6, damageDice: '1d12+2', threatRange: 19, critMultiplier: 2 },
        ],
      }),
      tags: 'ameaca,valkaria,milicia,soldado,guarda,nd1,cidade-sob-a-deusa',
    },
    {
      id: 'threat-assassino-capuz-t20',
      system: 'ALL',
      type: 'THREAT',
      name: 'Assassino da Guilda dos Capuzes',
      description: 'Sicário impiedoso dos becos escuros da Baixa de Valkaria, perito em veneno letal e emboscadas.',
      category: 'Ameaça: Humanoide Médio',
      dataJson: JSON.stringify({
        challengeRating: 4, // ND 4
        defense: 20,
        pv: 54,
        speedMeters: 12,
        attacks: [
          { name: 'Adaga com Peçonha de Serpente', attackBonus: 12, damageDice: '1d4+6 mais 2d6 veneno', threatRange: 18, critMultiplier: 2 },
        ],
        specialAbilities: [
          { name: 'Ataque Furtivo Mortal', description: '+3d6 de dano se o alvo estiver desprevenido ou flanqueado.' },
          { name: 'Desaparecer nas Sombras', description: 'Como reação ao sofrer dano, joga bomba de fumaça e fica invisível até o próximo turno.' },
        ],
      }),
      tags: 'ameaca,manual-do-malandro,valkaria,assassino,guilda,veneno,nd4',
    },
    {
      id: 'threat-pirata-corsario-t20',
      system: 'ALL',
      type: 'THREAT',
      name: 'Pirata Corsário do Mar Negro',
      description: 'Ladrão dos mares endurecido pelo sal e pólvora, armado com sabre enferrujado e bacamarte curto.',
      category: 'Ameaça: Humanoide Médio',
      dataJson: JSON.stringify({
        challengeRating: 2, // ND 2
        defense: 16,
        pv: 32,
        speedMeters: 9,
        attacks: [
          { name: 'Sabre de Bordo', attackBonus: 8, damageDice: '1d8+3', threatRange: 18, critMultiplier: 2 },
          { name: 'Pistola de Pólvora', attackBonus: 8, damageDice: '2d6', threatRange: 19, critMultiplier: 3 },
        ],
      }),
      tags: 'ameaca,piratas-e-pistoleiros,pirata,corsario,mar-negro,polvora,nd2',
    },
    {
      id: 'threat-fera-espiritual-moreau',
      system: 'ALL',
      type: 'THREAT',
      name: 'Fera Espiritual de Moreania',
      description: 'Guardião primal imbuído pela alma das florestas ancestrais da Ilha dos Moreau, com olhos dourados e garras reluzentes.',
      category: 'Ameaça: Monstro Grande',
      dataJson: JSON.stringify({
        challengeRating: 3, // ND 3
        defense: 18,
        pv: 58,
        speedMeters: 12,
        attacks: [
          { name: 'Garras Espirituais', attackBonus: 10, damageDice: '2d6+5', threatRange: 19, critMultiplier: 2 },
          { name: 'Mordida Titânica', attackBonus: 10, damageDice: '1d10+5', threatRange: 20, critMultiplier: 2 },
        ],
      }),
      tags: 'ameaca,moreania,reinos-de-moreania,fera,totem,espirito,nd3',
    },
    {
      id: 'threat-trombadinha-valkaria',
      system: 'ALL',
      type: 'THREAT',
      name: 'Trombadinha do Bairro dos Aventureiros',
      description: 'Jovem ladrão veloz que corta bolsas e some pelos telhados labirínticos de Valkaria em segundos.',
      category: 'Ameaça: Humanoide Pequeno',
      dataJson: JSON.stringify({
        challengeRating: 0.5, // ND 1/2
        defense: 15,
        pv: 14,
        speedMeters: 12,
        attacks: [
          { name: 'Canivete Rápido', attackBonus: 6, damageDice: '1d4+2', threatRange: 19, critMultiplier: 2 },
        ],
      }),
      tags: 'ameaca,manual-do-malandro,valkaria,trombadinha,ladino,nd1-2',
    },
  ];

  for (const item of expandedItems) {
    await prisma.compendiumItem.create({ data: item });
  }

  console.log(`Seeded ${canonicalItems.length + expandedItems.length} total Compendium items.`);

  // 4. Seed Canonical Campaign & 6 Interactive Scenes
  const campaign = await prisma.campaign.create({
    data: {
      name: 'A Jornada em Arton',
      description:
        'Campanha épica atravessando os reinos de Deheon, Valkaria, Portsmouth e as fronteiras contra a Tempestade Rubra.',
      system: 'T20',
    },
  });

  // Scene 1: Masmorra de Khalmyr (Dungeon)
  const sceneDungeon = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Masmorra de Khalmyr',
      gridWidth: 20,
      gridHeight: 16,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      backgroundUrl: '/maps/dungeon_arena.svg',
      gridColor: 'rgba(212, 175, 55, 0.25)',
      gridOpacity: 0.6,
      isCurrent: true,
    },
  });

  // Scene 2: Ermos da Tempestade Rubra (Tormenta Wasteland)
  const sceneTormenta = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Ermos da Tempestade Rubra',
      gridWidth: 24,
      gridHeight: 18,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      backgroundUrl: '/maps/tormenta_wasteland.svg',
      gridColor: 'rgba(239, 68, 68, 0.3)',
      gridOpacity: 0.65,
      isCurrent: false,
    },
  });

  // Scene 3: Taverna do Macaco Caolho
  const sceneTavern = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Taverna do Macaco Caolho',
      gridWidth: 20,
      gridHeight: 15,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      backgroundUrl: '/maps/tavern_arena.svg',
      gridColor: 'rgba(245, 158, 11, 0.2)',
      gridOpacity: 0.5,
      isCurrent: false,
    },
  });

  // Scene 4: Clareira Sagrada de Allihanna
  const sceneForest = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Clareira Sagrada de Allihanna',
      gridWidth: 22,
      gridHeight: 16,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      backgroundUrl: '/maps/forest_shrine.svg',
      gridColor: 'rgba(34, 197, 94, 0.25)',
      gridOpacity: 0.55,
      isCurrent: false,
    },
  });

  // Scene 5: Praça da Estátua de Valkaria (Valkaria, Cidade Sob a Deusa)
  const sceneValkaria = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Praça da Estátua de Valkaria',
      gridWidth: 24,
      gridHeight: 18,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      backgroundUrl: '/maps/valkaria_plaza.svg',
      gridColor: 'rgba(245, 158, 11, 0.3)',
      gridOpacity: 0.6,
      isCurrent: false,
    },
  });

  // Scene 6: Cais dos Bucaneiros de Portsmouth (Piratas e Pistoleiros)
  const scenePirate = await prisma.scene.create({
    data: {
      campaignId: campaign.id,
      name: 'Cais dos Bucaneiros de Portsmouth',
      gridWidth: 24,
      gridHeight: 18,
      cellSizePx: 50,
      meterPerSquare: 1.5,
      backgroundUrl: '/maps/pirate_cove.svg',
      gridColor: 'rgba(14, 165, 233, 0.3)',
      gridOpacity: 0.6,
      isCurrent: false,
    },
  });

  // Set active scene
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { activeSceneId: sceneDungeon.id },
  });

  // ---------------------------------------------------------------------------
  // 5. Seed 7 Canonical Characters Ready to Play
  // ---------------------------------------------------------------------------

  // Character 1: Valeros (Guerreiro Humano Nv 1)
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
      avatarUrl: '/assets/tokens/warrior.svg',
      pvCurrent: 22,
      pvMax: 22,
      pvTemp: 0,
      pmCurrent: 3,
      pmMax: 3,
      defense: 18,
      attributesJson: JSON.stringify({ FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 0, CAR: 0 }),
      skillsJson: JSON.stringify({
        Luta: { trained: true, bonus: 5, attribute: 'FOR' },
        Fortitude: { trained: true, bonus: 4, attribute: 'CON' },
        Iniciativa: { trained: true, bonus: 3, attribute: 'DES' },
        Atletismo: { trained: true, bonus: 5, attribute: 'FOR' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Espada Longa', bonus: 5, damage: '1d8+3', damageType: 'Corte', threatRange: 19, critMultiplier: 2 },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        { name: 'Ataque Especial', costPM: 1, description: '+4 no ataque ou +4 no dano.' },
        { name: 'Ataque Poderoso', description: '-2 no ataque para +5 no dano (+10 se com duas mãos).' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Espada Longa', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Cota de Malha', weightSlots: 2, quantity: 1, equipped: true },
        { name: 'Escudo Pesado', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Mochila de Aventureiro', weightSlots: 0, quantity: 1 },
      ]),
      notes: 'Guerreiro nobre leal à deusa da ambição, pronto para liderar a vanguarda contra as trevas.',
    },
  });

  // Character 2: Lorien (Mago Elfo TRPG Nv 1)
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
      avatarUrl: '/assets/tokens/mage.svg',
      pvCurrent: 10,
      pvMax: 10,
      pvTemp: 0,
      pmCurrent: 4,
      pmMax: 4,
      defense: 12,
      attributesJson: JSON.stringify({ FOR: 10, DES: 14, CON: 10, INT: 18, SAB: 12, CAR: 10 }),
      skillsJson: JSON.stringify({
        IdentificarMagia: { ranks: 4, bonus: 8, attribute: 'INT' },
        ConhecimentoArcano: { ranks: 4, bonus: 8, attribute: 'INT' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Adaga', bonus: 2, damage: '1d4', damageType: 'Perfuração', threatRange: 19, critMultiplier: 2 },
      ]),
      spellsJson: JSON.stringify([
        { name: 'Mísseis Mágicos', circle: 1, costPM: 1, damageFormula: '2d4+2' },
      ]),
      powersJson: JSON.stringify([{ name: 'Magia Primitiva', description: 'Tradição arcana élfica ancestral.' }]),
      inventoryJson: JSON.stringify([
        { name: 'Adaga', weightKg: 1, quantity: 1, equipped: true },
        { name: 'Grimório', weightKg: 2, quantity: 1 },
      ]),
      notes: 'Mago élfico buscando recuperar relíquias de seu reino perdido.',
    },
  });

  // Character 3: Irmã Lyra (Paladina Humana T20 Nv 2)
  const characterLyra = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'T20',
      isNpc: false,
      name: 'Irmã Lyra da Justiça',
      race: 'Humano',
      class: 'Paladino',
      level: 2,
      alignment: 'Leal e Bom',
      deity: 'Khalmyr',
      avatarUrl: '/assets/tokens/paladin.svg',
      pvCurrent: 28,
      pvMax: 28,
      pvTemp: 0,
      pmCurrent: 6,
      pmMax: 6,
      defense: 19,
      attributesJson: JSON.stringify({ FOR: 2, DES: 0, CON: 2, INT: 0, SAB: 1, CAR: 3 }),
      skillsJson: JSON.stringify({
        Luta: { trained: true, bonus: 5, attribute: 'FOR' },
        Vontade: { trained: true, bonus: 4, attribute: 'SAB' },
        Religião: { trained: true, bonus: 4, attribute: 'SAB' },
        Diplomacia: { trained: true, bonus: 6, attribute: 'CAR' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Espada Longa Abençoada', bonus: 5, damage: '1d8+2', damageType: 'Corte', threatRange: 19, critMultiplier: 2 },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        { name: 'Golpe Divino', costPM: 1, description: '+1d8 de dano sagrado contra inimigos.' },
        { name: 'Cura pelas Mãos', costPM: 1, description: 'Restaura 1d8+1 PV com um toque sagrado.' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Espada Longa', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Brunea', weightSlots: 2, quantity: 1, equipped: true, defenseBonus: 5, armorPenalty: -2 },
        { name: 'Escudo Pesado', weightSlots: 1, quantity: 1, equipped: true, defenseBonus: 2, armorPenalty: -2 },
      ]),
      notes: 'Defensora da balança de Khalmyr, punindo tiranos e socorrendo os aflitos.',
    },
  });

  // Character 4: Sombra dos Becos (Ladino Goblin T20 Nv 2)
  const characterSombra = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'T20',
      isNpc: false,
      name: 'Sombra dos Becos',
      race: 'Goblin',
      class: 'Ladino',
      level: 2,
      alignment: 'Caótico e Neutro',
      deity: 'Nenhum',
      avatarUrl: '/assets/tokens/rogue.svg',
      pvCurrent: 18,
      pvMax: 18,
      pvTemp: 0,
      pmCurrent: 8,
      pmMax: 8,
      defense: 16,
      attributesJson: JSON.stringify({ FOR: -1, DES: 4, CON: 1, INT: 2, SAB: 0, CAR: 0 }),
      skillsJson: JSON.stringify({
        Ladinagem: { trained: true, bonus: 8, attribute: 'DES' },
        Furtividade: { trained: true, bonus: 8, attribute: 'DES' },
        Reflexos: { trained: true, bonus: 8, attribute: 'DES' },
        Pontaria: { trained: true, bonus: 8, attribute: 'DES' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Adaga Oculta', bonus: 8, damage: '1d4+4 mais 1d6 Furtivo', damageType: 'Perfuração', threatRange: 19, critMultiplier: 2 },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        { name: 'Ataque Furtivo', description: '+1d6 de dano contra desprevenidos.' },
        { name: 'Evasão', description: 'Nenhum dano em Reflexos bem-sucedidos.' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Adaga', weightSlots: 1, quantity: 2, equipped: true },
        { name: 'Armadura de Couro', weightSlots: 2, quantity: 1, equipped: true, defenseBonus: 2 },
        { name: 'Kit de Ladinagem', weightSlots: 1, quantity: 1 },
      ]),
      notes: 'Mestre das sombras de Valkaria, perito em arrombamento e emboscadas.',
    },
  });

  // Character 5: Gromm Olho-de-Rubi (Bárbaro Lefou T20 Nv 3)
  const characterGromm = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'T20',
      isNpc: false,
      name: 'Gromm Olho-de-Rubi',
      race: 'Lefou',
      class: 'Bárbaro',
      level: 3,
      alignment: 'Caótico e Neutro',
      deity: 'Arsenal',
      avatarUrl: '/assets/tokens/barbarian.svg',
      pvCurrent: 42,
      pvMax: 42,
      pvTemp: 0,
      pmCurrent: 6,
      pmMax: 6,
      defense: 17,
      attributesJson: JSON.stringify({ FOR: 4, DES: 1, CON: 3, INT: -1, SAB: 0, CAR: -1 }),
      skillsJson: JSON.stringify({
        Luta: { trained: true, bonus: 9, attribute: 'FOR' },
        Fortitude: { trained: true, bonus: 8, attribute: 'CON' },
        Atletismo: { trained: true, bonus: 9, attribute: 'FOR' },
        Intimidação: { trained: true, bonus: 6, attribute: 'FOR' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Machado Taurino Brutal', bonus: 9, damage: '3d6+4', damageType: 'Corte', threatRange: 20, critMultiplier: 3 },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        { name: 'Fúria Primal', costPM: 2, description: '+2 ataque e dano, RD 2.' },
        { name: 'Ataque Poderoso', description: '-2 no ataque para +10 no dano com machado.' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Machado Taurino de Guerra', weightSlots: 3, quantity: 1, equipped: true },
        { name: 'Gibão de Peles', weightSlots: 2, quantity: 1, equipped: true, defenseBonus: 4, armorPenalty: -1 },
      ]),
      notes: 'Guerreiro mutado pela Tormenta que encontrou na fúria de Arsenal sua redenção sangrenta.',
    },
  });

  // Character 6: Capitão James "Garganta-de-Aço" (Bucaneiro Humano Nv 2 - Piratas e Pistoleiros)
  const characterJames = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'T20',
      isNpc: false,
      name: 'Capitão James Garganta-de-Aço',
      race: 'Humano',
      class: 'Bucaneiro',
      level: 2,
      alignment: 'Caótico e Bom',
      deity: 'Nimb',
      avatarUrl: '/assets/tokens/pirate.svg',
      pvCurrent: 24,
      pvMax: 24,
      pvTemp: 0,
      pmCurrent: 6,
      pmMax: 6,
      defense: 17,
      attributesJson: JSON.stringify({ FOR: 1, DES: 3, CON: 1, INT: 1, SAB: 0, CAR: 3 }),
      skillsJson: JSON.stringify({
        Acrobacia: { trained: true, bonus: 7, attribute: 'DES' },
        Pontaria: { trained: true, bonus: 7, attribute: 'DES' },
        Luta: { trained: true, bonus: 5, attribute: 'FOR' },
        Enganação: { trained: true, bonus: 7, attribute: 'CAR' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Sabre Naval de Corsário', bonus: 7, damage: '1d8+3', damageType: 'Corte', threatRange: 18, critMultiplier: 2 },
        { name: 'Pistola de Pederneira', bonus: 7, damage: '2d6', damageType: 'Perfuração', threatRange: 19, critMultiplier: 3 },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        { name: 'Audácia', costPM: 1, description: 'Soma Carisma (+3) em perícias e manobras.' },
        { name: 'Insolência', description: 'Soma Carisma na Defesa.' },
        { name: 'Panache', description: 'Recupera 1 PM ao acertar acerto crítico.' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Sabre Naval de Corsário', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Pistola de Pederneira Artoniana', weightSlots: 1, quantity: 2, equipped: true },
        { name: 'Bandoleira de Pistolas', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Cartucheira com Pólvora e Balas', weightSlots: 1, quantity: 1 },
      ]),
      notes: 'Corsário dos mares de Portsmouth, temido por capitães da milícia e amado pelos despossuídos.',
    },
  });

  // Character 7: Kira Olhos-de-Prata (Ladina Moreau Raposa Nv 2 - Reinos de Moreania & Manual do Malandro)
  const characterKira = await prisma.character.create({
    data: {
      campaignId: campaign.id,
      system: 'T20',
      isNpc: false,
      name: 'Kira Olhos-de-Prata',
      race: 'Moreau (Raposa)',
      class: 'Ladino',
      level: 2,
      alignment: 'Caótico e Neutro',
      deity: 'Valkaria',
      avatarUrl: '/assets/tokens/moreau.svg',
      pvCurrent: 20,
      pvMax: 20,
      pvTemp: 0,
      pmCurrent: 8,
      pmMax: 8,
      defense: 17,
      attributesJson: JSON.stringify({ FOR: 0, DES: 4, CON: 1, INT: 2, SAB: 1, CAR: 2 }),
      skillsJson: JSON.stringify({
        Ladinagem: { trained: true, bonus: 8, attribute: 'DES' },
        Furtividade: { trained: true, bonus: 8, attribute: 'DES' },
        Enganação: { trained: true, bonus: 6, attribute: 'CAR' },
        Jogatina: { trained: true, bonus: 6, attribute: 'CAR' },
      }),
      attacksJson: JSON.stringify([
        { name: 'Adaga Retrátil de Manga', bonus: 8, damage: '1d4+4 mais 1d6 Furtivo', damageType: 'Perfuração', threatRange: 19, critMultiplier: 2 },
      ]),
      spellsJson: JSON.stringify([]),
      powersJson: JSON.stringify([
        { name: 'Herança da Raposa', description: '+2 em Enganação e Ladinagem dos Moreau.' },
        { name: 'Golpe Baixo', costPM: 1, description: 'Deixa o alvo atordoado ou cego com truque sujo.' },
        { name: 'Ataque Furtivo', description: '+1d6 de dano contra alvos desprevenidos.' },
      ]),
      inventoryJson: JSON.stringify([
        { name: 'Adaga Retrátil de Manga', weightSlots: 1, quantity: 1, equipped: true },
        { name: 'Dados Viciados de Nimb', weightSlots: 0, quantity: 1 },
        { name: 'Kit de Ladinagem Obscura', weightSlots: 1, quantity: 1 },
        { name: 'Capa com Bolsos Secretos', weightSlots: 1, quantity: 1, equipped: true },
      ]),
      notes: 'Espiã e jogadora nativa de Moreania que fez fortuna rápida nos cassinos da Baixa de Valkaria.',
    },
  });

  // ---------------------------------------------------------------------------
  // 6. Tactical Tokens on Scenes
  // ---------------------------------------------------------------------------

  // Scene 1 Tokens: Masmorra de Khalmyr
  const valerosToken = await prisma.token.create({
    data: {
      sceneId: sceneDungeon.id,
      characterId: characterT20.id,
      name: characterT20.name,
      x: 3,
      y: 4,
      size: 'MEDIUM',
      color: '#D4AF37',
      avatarUrl: '/assets/tokens/warrior.svg',
      pvCurrent: characterT20.pvCurrent,
      pvMax: characterT20.pvMax,
      conditionsJson: JSON.stringify([]),
    },
  });

  const lyraToken = await prisma.token.create({
    data: {
      sceneId: sceneDungeon.id,
      characterId: characterLyra.id,
      name: characterLyra.name,
      x: 3,
      y: 5,
      size: 'MEDIUM',
      color: '#EAB308',
      avatarUrl: '/assets/tokens/paladin.svg',
      pvCurrent: characterLyra.pvCurrent,
      pvMax: characterLyra.pvMax,
      conditionsJson: JSON.stringify([]),
    },
  });

  const bugbearToken = await prisma.token.create({
    data: {
      sceneId: sceneDungeon.id,
      characterId: null,
      name: 'Bugbear Espreitador',
      x: 7,
      y: 4,
      size: 'MEDIUM',
      color: '#DC2626',
      avatarUrl: '/assets/tokens/bugbear.svg',
      pvCurrent: 45,
      pvMax: 45,
      conditionsJson: JSON.stringify(['EMBOSCADA']),
    },
  });

  const goblinToken = await prisma.token.create({
    data: {
      sceneId: sceneDungeon.id,
      characterId: null,
      name: 'Goblin Salteador',
      x: 9,
      y: 3,
      size: 'SMALL',
      color: '#15803D',
      avatarUrl: '/assets/tokens/goblin.svg',
      pvCurrent: 12,
      pvMax: 12,
      conditionsJson: JSON.stringify([]),
    },
  });

  // Scene 2 Tokens: Ermos da Tempestade Rubra
  await prisma.token.create({
    data: {
      sceneId: sceneTormenta.id,
      characterId: characterGromm.id,
      name: characterGromm.name,
      x: 4,
      y: 6,
      size: 'MEDIUM',
      color: '#B91C1C',
      avatarUrl: '/assets/tokens/barbarian.svg',
      pvCurrent: 42,
      pvMax: 42,
    },
  });

  await prisma.token.create({
    data: {
      sceneId: sceneTormenta.id,
      characterId: null,
      name: 'Lefeu Espreitador da Tormenta',
      x: 12,
      y: 6,
      size: 'LARGE',
      color: '#991B1B',
      avatarUrl: '/assets/tokens/lefeu.svg',
      pvCurrent: 95,
      pvMax: 95,
    },
  });

  // Scene 5 Tokens: Praça da Estátua de Valkaria
  await prisma.token.create({
    data: {
      sceneId: sceneValkaria.id,
      characterId: characterKira.id,
      name: characterKira.name,
      x: 5,
      y: 8,
      size: 'MEDIUM',
      color: '#10B981',
      avatarUrl: '/assets/tokens/moreau.svg',
      pvCurrent: 20,
      pvMax: 20,
    },
  });

  await prisma.token.create({
    data: {
      sceneId: sceneValkaria.id,
      characterId: null,
      name: 'Guarda da Milícia de Valkaria',
      x: 10,
      y: 8,
      size: 'MEDIUM',
      color: '#3B82F6',
      avatarUrl: '/assets/tokens/paladin.svg',
      pvCurrent: 26,
      pvMax: 26,
    },
  });

  await prisma.token.create({
    data: {
      sceneId: sceneValkaria.id,
      characterId: null,
      name: 'Assassino da Guilda dos Capuzes',
      x: 14,
      y: 5,
      size: 'MEDIUM',
      color: '#7E22CE',
      avatarUrl: '/assets/tokens/assassin.svg',
      pvCurrent: 54,
      pvMax: 54,
      conditionsJson: JSON.stringify(['INVISIVEL']),
    },
  });

  // Scene 6 Tokens: Cais dos Bucaneiros de Portsmouth
  await prisma.token.create({
    data: {
      sceneId: scenePirate.id,
      characterId: characterJames.id,
      name: characterJames.name,
      x: 6,
      y: 6,
      size: 'MEDIUM',
      color: '#0284C7',
      avatarUrl: '/assets/tokens/pirate.svg',
      pvCurrent: 24,
      pvMax: 24,
    },
  });

  await prisma.token.create({
    data: {
      sceneId: scenePirate.id,
      characterId: null,
      name: 'Pirata Corsário do Mar Negro',
      x: 14,
      y: 6,
      size: 'MEDIUM',
      color: '#B45309',
      avatarUrl: '/assets/tokens/pirate.svg',
      pvCurrent: 32,
      pvMax: 32,
    },
  });

  // ---------------------------------------------------------------------------
  // 7. Seed Initiative Tracker entries for active scene
  // ---------------------------------------------------------------------------
  await prisma.initiativeEntry.create({
    data: {
      sceneId: sceneDungeon.id,
      tokenId: valerosToken.id,
      name: valerosToken.name,
      initiativeRoll: 18,
      modifier: 3,
      isCurrentTurn: true,
      roundNumber: 1,
    },
  });

  await prisma.initiativeEntry.create({
    data: {
      sceneId: sceneDungeon.id,
      tokenId: bugbearToken.id,
      name: bugbearToken.name,
      initiativeRoll: 14,
      modifier: 2,
      isCurrentTurn: false,
      roundNumber: 1,
    },
  });

  await prisma.initiativeEntry.create({
    data: {
      sceneId: sceneDungeon.id,
      tokenId: lyraToken.id,
      name: lyraToken.name,
      initiativeRoll: 12,
      modifier: 0,
      isCurrentTurn: false,
      roundNumber: 1,
    },
  });

  await prisma.initiativeEntry.create({
    data: {
      sceneId: sceneDungeon.id,
      tokenId: goblinToken.id,
      name: goblinToken.name,
      initiativeRoll: 9,
      modifier: 4,
      isCurrentTurn: false,
      roundNumber: 1,
    },
  });

  // ---------------------------------------------------------------------------
  // 8. Seed Sample RollLog
  // ---------------------------------------------------------------------------
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

  console.log('Database seeded successfully with rich Tormenta canonical dataset:');
  console.log(`- ${canonicalItems.length + expandedItems.length} Compendium entities (canonical + Drive reference books)`);
  console.log(`- 1 Campaign ("${campaign.name}")`);
  console.log(`- 6 Battlemap Scenes (Masmorra, Tormenta, Taverna, Clareira, Valkaria, Portsmouth)`);
  console.log(`- 7 Hero Characters ready to play`);
  console.log(`- Tactical tokens and initiative tracker across active battlemaps`);
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
