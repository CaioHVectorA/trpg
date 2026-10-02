'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Shield,
  Swords,
  Flame,
  Sparkles,
  Compass,
  Crown,
  Anchor,
  Crosshair,
  Skull,
  Search,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Bookmark,
  Scale,
  Sun,
  Moon,
  Heart,
  Eye,
  Dice5,
  Coins,
  Feather,
} from 'lucide-react';

// ==========================================
// 1. CANONICAL DATA REPOSITORIES (6 BOOKS + RULES)
// ==========================================

const BOOKS_INFO = [
  {
    id: 'all',
    title: 'Todos os Tomos',
    shortTitle: 'Enciclopédia',
    icon: BookOpen,
    color: 'from-amber-500 to-red-600',
    description: 'Visão unificada dos 6 livros oficiais e compêndio de regras.',
  },
  {
    id: 'malandro',
    title: 'Manual do Malandro',
    shortTitle: 'Malandro',
    icon: Feather,
    color: 'from-emerald-500 to-teal-700',
    description: 'As leis dos becos, truques sujos, guildas criminosas, jogatina e ferramentas ilícitas.',
  },
  {
    id: 'piratas',
    title: 'Piratas e Pistoleiros',
    shortTitle: 'Piratas & Pólvora',
    icon: Anchor,
    color: 'from-cyan-500 to-blue-700',
    description: 'Mares de Arton, código corsário, balística de pólvora negra, manobras e combate naval.',
  },
  {
    id: 'panteao',
    title: 'O Panteão',
    shortTitle: 'Os 20 Deuses',
    icon: Sparkles,
    color: 'from-amber-400 to-yellow-600',
    description: 'Dossiê dos 20 Deuses Maiores, dogmas sagrados, obrigações e poderes divinos concedidos.',
  },
  {
    id: 'moreania',
    title: 'Reinos de Moreania',
    shortTitle: 'Ilha dos Moreau',
    icon: Compass,
    color: 'from-orange-500 to-amber-700',
    description: 'A Ilha dos Moreau, o Culto aos Deuses Irmãos e as 12 heranças totêmicas espirituais.',
  },
  {
    id: 'valkaria',
    title: 'Valkaria, Cidade Sob a Deusa',
    shortTitle: 'Atlas Urbano',
    icon: Crown,
    color: 'from-purple-500 to-indigo-700',
    description: 'A estátua de 100m, o Labirinto do Desafio, bairros metropolitanos e leis imperiais.',
  },
  {
    id: 'arton',
    title: 'Mundo de Arton',
    shortTitle: 'Mundo & Tormenta',
    icon: Flame,
    color: 'from-red-600 to-rose-800',
    description: 'Geografia dos 20 reinos, a corrupção aberrante da Tormenta Rubra e materiais lendários.',
  },
  {
    id: 'regras',
    title: 'Guia Tático & Regras',
    shortTitle: 'Regras & Combate',
    icon: Swords,
    color: 'from-blue-600 to-indigo-800',
    description: 'Economia de ações, tabela completa de condições, alcances, economia de PM e testes d20.',
  },
];

// 20 Gods Data
const PANTEAO_GODS = [
  {
    name: 'Khalmyr',
    title: 'Deus da Justiça e da Ordem',
    symbol: 'Uma espada de lâmina reta em perfeito equilíbrio sobre uma balança de dois pratos de bronze.',
    weapon: 'Espada Longa',
    beliefs: 'A justiça é a espinha dorsal de Arton. Julgue com imparcialidade e jamais tolere a anarquia ou vingança injustificada.',
    powers: ['Coragem Total', 'Espada Justiceira', 'Ordem Inabalável', 'Reparação Sagrada'],
    restrictions: 'Não mentir conscientemente e não punir inocentes mesmo sob ordens de superiores.',
    holyColor: 'Azul Celeste e Dourado',
  },
  {
    name: 'Valkaria',
    title: 'Deusa da Ambição, da Liberdade e da Aventura',
    symbol: 'A colossal estátua feminina com asas de pedra e braços abertos para os céus infinitos.',
    weapon: 'Chicote / Florete',
    beliefs: 'O limite do mundo é apenas o ponto de partida. Arrisque-se, busque o impossível e nunca se curve à apatia.',
    powers: ['Liberdade Incondicional', 'Armas da Ambição', 'Audácia Infinita', 'Sede de Conquista'],
    restrictions: 'Nunca se acomodar na mesmice ou recusar uma aventura grandiosa por covardia.',
    holyColor: 'Vermelho Carmesim e Dourado',
  },
  {
    name: 'Arsenal',
    title: 'Deus da Guerra e da Supremacia Marcial',
    symbol: 'O martelo lendário Kishin cruzado sobre uma bigorna de ferro negro com elmo de batalha.',
    weapon: 'Martelo de Guerra / Espada Grande',
    beliefs: 'A paz é apenas um interlúdio ilusório entre duas guerras. Apenas a supremacia bélica traz a verdadeira ordem.',
    powers: ['Sangue de Ferro', 'Tática de Cerco Implacável', 'Fúria Bélica dos Exércitos', 'Forja do Massacre'],
    restrictions: 'Nunca fugir de um combate honrado contra um adversário de mesmo ou superior poderio.',
    holyColor: 'Ferro Escuro, Cinza e Sangue Seco',
  },
  {
    name: 'Wynna',
    title: 'Deusa da Magia e dos Mistérios Arcanos',
    symbol: 'Um anel cintilante de energia espiral que muda de cor conforme a essência elemental.',
    weapon: 'Adaga / Cajado de Foco',
    beliefs: 'A magia é o fôlego da própria criação. Deve ser cultivada, ensinada e jamais restringida por preconceitos.',
    powers: ['Bênção da Mana Arcana', 'Teurgo Místico', 'Escudo Arcano Espelhado', 'Transmutação Fluida'],
    restrictions: 'Nunca destruir itens mágicos e conceder abrigo a praticantes da arte arcana.',
    holyColor: 'Violeta Cintilante e Azul Prateado',
  },
  {
    name: 'Nimb',
    title: 'Deus do Caos, da Sorte e do Azar',
    symbol: 'Um dado de seis faces com pontos trocados e números impossíveis girando sobre o ar.',
    weapon: 'Mangual / Adaga Curva',
    beliefs: 'O destino é uma piada cósmica contada aos deuses. Quem tenta controlar o futuro apenas atrai a própria derrocada.',
    powers: ['Sorte dos Loucos', 'Poder Oculto do Caos', 'Dado Viciado', 'Incerteza Protetora'],
    restrictions: 'Tomar pelo menos uma decisão importante por dia baseada exclusivamente na rolagem de uma moeda ou dado.',
    holyColor: 'Mosaico de todas as cores em padrão caótico',
  },
  {
    name: 'Thyatis',
    title: 'Deus da Profecia, da Redenção e da Fênix',
    symbol: 'Uma majestosa fênix de chamas douradas erguendo voo das cinzas incandescentes.',
    weapon: 'Espada Bastarda / Espada Curta',
    beliefs: 'A morte física não é o fim, e nenhuma alma está além da redenção. Sempre conceda a segunda chance aos vencidos.',
    powers: ['Dom da Imortalidade', 'Chama Purificadora', 'Profecia Divina do Destino', 'Aura Restauradora'],
    restrictions: 'Proibido matar qualquer criatura inteligente que se renda e implore por misericórdia.',
    holyColor: 'Fogo Dourado, Laranja e Branco Solar',
  },
  {
    name: 'Lena',
    title: 'Deusa da Vida, da Fertilidade e da Infância',
    symbol: 'Uma lua crescente de prata da qual escorre uma gota de orvalho cristalino gerando brotos.',
    weapon: 'Nenhuma (Ataques Pacifistas)',
    beliefs: 'A vida biológica é sagrada e intocável. A violência física destrói a própria trama da deusa mãe.',
    powers: ['Cura Restauradora Máxima', 'Proteção dos Inocentes', 'Aura de Vitalidade Pura', 'Toque de Alívio'],
    restrictions: 'Jamais causar dano letal a qualquer criatura viva, nem mesmo em legítima defesa (deve usar formas não-letais ou fuga).',
    holyColor: 'Branco Pérola e Prata',
  },
  {
    name: 'Marah',
    title: 'Deusa da Paz, do Amor e da Harmonia',
    symbol: 'Uma pomba alva em pleno voo trazendo no bico uma flor silvestre de pétalas rosadas.',
    weapon: 'Nenhuma (Pacifismo Absoluto)',
    beliefs: 'O amor é a força motriz capaz de desarmar os maiores impérios. A espada só gera mais derramamento de sangue.',
    powers: ['Trégua de Marah', 'Abraço Apaziguador', 'Dom da Harmonia Coletiva', 'Santuário Inviolável'],
    restrictions: 'Não participar de hostilidades bélicas e sempre interceder diplomaticamente antes de qualquer agressão.',
    holyColor: 'Rosa Claro, Branco e Céu Suave',
  },
  {
    name: 'Lin-Wu',
    title: 'Deus da Honra, da Coragem e de Tamu-ra',
    symbol: 'Um dragão serpentino oriental dourado entrelaçado com uma lâmina de katana cerimonial.',
    weapon: 'Katana Ancestral',
    beliefs: 'A honra pessoal e o respeito aos mestres e ancestrais valem mais do que dez mil vidas sem honradez.',
    powers: ['Caminho do Bushido', 'Coragem dos Ancestrais', 'Golpe Perfeito Sem Hesitação', 'Mente de Aço'],
    restrictions: 'Nunca recorrer a trapaças, golpes pelas costas ou desonrar juramentos formalmente selados.',
    holyColor: 'Vermelho e Dourado Imperial',
  },
  {
    name: 'Allihanna',
    title: 'Deusa da Natureza, dos Animais e das Matas',
    symbol: 'Uma árvore colossal milenar ladeada por um lobo branco e um corvo pousado em seu galho.',
    weapon: 'Arco Curto / Maça de Madeira',
    beliefs: 'As florestas e os animais selvagens não são recursos descartáveis dos reinos humanos; são irmãos primordiais da criação.',
    powers: ['Comunhão com a Fauna', 'Garras Selvagens da Fera', 'Forma da Floresta Viva', 'Passos sem Rastros'],
    restrictions: 'Proibido desmatar matas virgens ou caçar por esporte, vaidade ou crueldade.',
    holyColor: 'Verde Musgo e Marrom Terra',
  },
  {
    name: 'Tanna-Toh',
    title: 'Deusa do Conhecimento e da Revelação',
    symbol: 'Um grande tomo iluminado aberto, sobre o qual repousa uma pena de coruja banhada a ouro.',
    weapon: 'Bordão de Erudito / Livro Pesado',
    beliefs: 'A ignorância é a maior prisão da mente. A verdade absoluta deve ser pesquisada, documentada e ensinada livremente.',
    powers: ['Conhecimento Enciclopédico', 'Olhar da Verdade Absoluta', 'Voz da Eloquência Cívica', 'Registro Histórico'],
    restrictions: 'Nunca mentir ou omitir deliberadamente a verdade perante uma pergunta sincera.',
    holyColor: 'Branco Pergaminho e Ouro Velho',
  },
  {
    name: 'Azgher',
    title: 'Deus do Sol, da Vigília e do Fogo Purificador',
    symbol: 'Um sol flamejante de doze pontas com uma máscara funerária de ouro maciço no centro.',
    weapon: 'Cimitarra do Deserto',
    beliefs: 'O sol a tudo vê e dissipa as trevas corruptas. Aqueles que rastejam na escuridão devem ser consumidos pelo fogo sagrado.',
    powers: ['Espada Solar Flamejante', 'Fogo Sagrado dos Céus', 'Véu do Deserto Eterno', 'Inimigo das Sombras'],
    restrictions: 'Manter sempre o rosto coberto por máscara ou turbante na presença de estranhos durante a luz do dia.',
    holyColor: 'Ouro Queimado e Amarelo Solar',
  },
  {
    name: 'Tenebra',
    title: 'Deusa da Noite, dos Segredos e da Escuridão',
    symbol: 'Uma lua negra cercada por uma constelação de estrelas pálidas em forma de teia.',
    weapon: 'Adaga Enfeitiçada / Foice Curta',
    beliefs: 'Na escuridão reside o refúgio das almas esquecidas. O sol queima e expõe, mas a noite acolhe e guarda o saber proibido.',
    powers: ['Manto da Meia-Noite', 'Necromancia da Mãe Noturna', 'Visão na Escuridão Total', 'Carícia das Sombras'],
    restrictions: 'Nunca rejeitar uma criatura das trevas que busque abrigo contra os raios fulgurantes do sol.',
    holyColor: 'Negro Ébano e Violeta Escuro',
  },
  {
    name: 'Hyninn',
    title: 'Deus da Trapaça, dos Ladrões e da Sagacidade',
    symbol: 'Uma raposa vermelha astuta segurando uma adaga com um sorriso sarcástico no focinho.',
    weapon: 'Adaga / Arco Curto',
    beliefs: 'A força bruta é a muleta dos tolos. Quem pensa rápido ganha a partida antes mesmo do bruto desembainhar sua lâmina.',
    powers: ['Forma de Gazela Evasiva', 'Mãos Rápidas do Batedor', 'Máscara da Falsidade Perfeita', 'Golpe Oportunista'],
    restrictions: 'Nunca resolver um desafio pela força bruta se houver uma oportunidade de vencê-lo por engodo ou esperteza.',
    holyColor: 'Marrom Raposa, Preto e Cobre',
  },
  {
    name: 'Kallyadranoch',
    title: 'Deus dos Dragões e do Poder Despótico',
    symbol: 'Um crânio majestoso de dragão com olhos flamejantes emanando os cinco sopros elementais.',
    weapon: 'Lança Pesada / Garras Dracônicas',
    beliefs: 'O poder é a única medida de valor em Arton. Os dragões são os governantes natos e os fracos existem para obedecer aos tiranos.',
    powers: ['Sopro Dracônico Devastador', 'Escamas do Tirano Alado', 'Linhagem de Dragão Soberano', 'Presença Aterrorizante'],
    restrictions: 'Nunca submeter-se voluntariamente à autoridade de quem não tenha provado poder superior ao seu.',
    holyColor: 'Escarlate, Dourado Metálico e Verde Esmeralda',
  },
  {
    name: 'Megalokk',
    title: 'Deus dos Monstros e da Fúria Primitiva',
    symbol: 'Uma garra monstruosa gigantesca dilacerando ossos pré-históricos sobre a terra vermelha.',
    weapon: 'Mordida / Clava Rústica',
    beliefs: 'A civilização é uma mentira que torna os corpos moles. Sobrevive o predador mais feroz; a caça alimenta o ápice biológico.',
    powers: ['Presas Primordiais Afiadas', 'Fúria Bestial Incontrolável', 'Couro Espesso de Monstro', 'Instinto Selvagem Puro'],
    restrictions: 'Não usar armas forjadas por metalurgia avançada nem armaduras de placas manufaturadas.',
    holyColor: 'Marrom Lama e Vermelho Sangue Fresco',
  },
  {
    name: 'Aharadak',
    title: 'Deus da Tormenta e do Anticriação Lefeu',
    symbol: 'Um olho gigante quitinoso e aberrante envolto em espirais de carne rubra e tentáculos sem fim.',
    weapon: 'Espada Aberrante / Garras de Quitina',
    beliefs: 'A criação artoniana é falha, estagnada e finita. A Tormenta absorverá toda a matéria para integrá-la à perfeição estática da colmeia.',
    powers: ['Percepção Temporal Aberrante', 'Anatomia Insana da Tormenta', 'Olhar da Ruína Rubra', 'Imunidade à Dor'],
    restrictions: 'Promover a expansão das Áreas de Tormenta e aceitar a lenta mutação e assimilação do próprio corpo biológico.',
    holyColor: 'Vermelho Sangue Alquímico e Quitina Negra',
  },
  {
    name: 'Sszzaas',
    title: 'Deus da Traição, dos Venenos e da Conspiração',
    symbol: 'Uma serpente verde esmeralda com olhos humanos calculistas pronta para dar o bote letal.',
    weapon: 'Adaga Envenenada',
    beliefs: 'A lealdade é uma fraqueza explorável. Uma mentira bem sussurrada derruba impérios que resistiriam a cem exércitos.',
    powers: ['Veneno Letal Silencioso', 'Mente Dissimulada Impenetrável', 'Peçonha Paralisante', 'Rede de Segredos'],
    restrictions: 'Nunca revelar suas verdadeiras intenções ou identidades reais perante quem não seja membro de sua seita.',
    holyColor: 'Verde Veneno e Preto Carvão',
  },
  {
    name: 'Thwor',
    title: 'Deus dos Goblinoides e da Revolução dos Excluídos',
    symbol: 'Uma machadinha dupla manchada de sangue sobreposta a um broquel de madeira reforçada.',
    weapon: 'Machadinha de Guerra / Clava',
    beliefs: 'A hegemonia dos humanos e elfos acabou. A Aliança Negra une todos os que foram pisoteados para forjar um novo destino.',
    powers: ['Fúria da Aliança dos Povos', 'Resiliência Goblin Inabalável', 'Golpe Coletivo das Tribos', 'Sobrevivência nos Ermos'],
    restrictions: 'Jamais abandonar um irmão goblinoide, ogro ou orc em apuros perante a nobreza opressora do Reinado.',
    holyColor: 'Cinza Ardósia, Vermelho Terra e Marrom',
  },
  {
    name: 'Tauron (Memória & Queda)',
    title: 'Antigo Deus da Força, dos Minotauros e da Proteção aos Fracos',
    symbol: 'Uma cabeça majestosa de touro esculpida em bronze com chifres pontiagudos e labaredas de fogo nos olhos.',
    weapon: 'Machado de Batalha de Duas Mãos',
    beliefs: 'A força máxima deve ser empregada para governar e proteger os mais fracos; aqueles sem poder devem submeter-se voluntariamente aos fortes.',
    powers: ['Fúria Taurina Ancestral', 'Força Titânica Indomável', 'Escudo do Protetor', 'Bênção de Tapista'],
    restrictions: 'Nunca se recusar a proteger os servos leais que tenham prestado juramento formal ao seu comando.',
    holyColor: 'Bronze Queimado e Laranja Flamejante',
  },
];

// 12 Moreau Totemic Heritages
const MOREAU_HERITAGES = [
  {
    name: 'Moreau Raposa',
    traits: '+1 em Inteligência ou Destreza',
    ability: 'Astúcia Vulpinia',
    description: 'Bônus de +2 em testes de Enganação, Ladinagem e Intuição. Pode usar Destreza no lugar de Carisma para blefar.',
    spiritAnimal: 'Raposa das Brumas',
    lore: 'Nativos de Luncaster, são os negociantes mais perspicazes do arquipélago, capazes de notar uma trapaça antes do primeiro dado rolar.',
  },
  {
    name: 'Moreau Lobo',
    traits: '+1 em Força ou Percepção (Sabedoria)',
    ability: 'Tática da Matilha & Faro',
    description: 'Ganha visão na penumbra, faro apurado (detecta inimigos a até 9m) e +2 de ataque contra alvos flanqueados por aliados.',
    spiritAnimal: 'Lobo Cinzento das Florestas',
    lore: 'Guerreiros que prosperam no combate cooperativo. A lealdade aos companheiros de matilha supera qualquer instinto egoísta.',
  },
  {
    name: 'Moreau Urso',
    traits: '+1 em Constituição ou Força',
    ability: 'Vigor Colossal & Patas Esmagadoras',
    description: 'Recebe +1 PV por nível e Redução de Dano (RD) 2 contra impactos físicos. Seus ataques desarmados causam 1d6 de dano contundente.',
    spiritAnimal: 'Urso Pardo das Colinas',
    lore: 'Habitantes das montanhas de Norra, suportam nevascas intensas e investidas diretas sem recuar sequer um passo.',
  },
  {
    name: 'Moreau Serpente',
    traits: '+1 em Destreza ou Inteligência',
    ability: 'Bote Venenoso & Flexibilidade Óssea',
    description: 'Resistência contra venenos +5 em testes de Fortitude. Seus ataques críticos corporais injetam toxina paralisante (1d6 dano de veneno).',
    spiritAnimal: 'Naja Esmeralda dos Pântanos',
    lore: 'Mestres de espionagem e acupuntura médica, movem-se com graça silenciosa através de frestas e janelas estreitas.',
  },
  {
    name: 'Moreau Gato',
    traits: '+1 em Destreza ou Carisma',
    ability: 'Queda Segura & Furtividade Felina',
    description: 'Ignora até 6 metros de queda sem sofrer dano (cai sempre sobre as patas) e recebe +2 em Acrobacia e Furtividade.',
    spiritAnimal: 'Pantera Noturna',
    lore: 'Especialistas em infiltrações urbanas nos telhados de Brastaw. Nenhuma fechadura ou muralha é intransponível para um Moreau Gato.',
  },
  {
    name: 'Moreau Falcão',
    traits: '+1 em Sabedoria ou Destreza',
    ability: 'Visão de Rapina & Tiro Longo',
    description: 'Visão telescópica que reduz penalidades de distância à metade e bônus de +2 em testes de Percepção visual e Pontaria.',
    spiritAnimal: 'Falcão Peregrino do Zênite',
    lore: 'Vigias e atiradores de elite das torres de guarda costeiras, conseguem avistar velas corsárias antes mesmo que cruzem o horizonte.',
  },
  {
    name: 'Moreau Leão',
    traits: '+1 em Carisma ou Força',
    ability: 'Presença Régia & Rugido Soberano',
    description: 'Pode emitir um rugido aterrador como ação de movimento que impõe a condição Abalado aos inimigos a até 6m (Vontade CD 10 + 1/2 nível).',
    spiritAnimal: 'Leão Dourado das Savanas',
    lore: 'Nascidos para a liderança e a diplomacia. Nobres e paladinos da ilha ostentam com orgulho a juba dourada como símbolo régio.',
  },
  {
    name: 'Moreau Crocodilo',
    traits: '+1 em Constituição ou Força',
    ability: 'Pulmões de Anfíbio & Mordida Trancada',
    description: 'Pode prender a respiração por 4x sua CON em minutos, possui deslocamento de natação 9m e bônus de +2 na manobra Agarrar.',
    spiritAnimal: 'Jacaré Negro dos Mangues',
    lore: 'Habitantes dos estuários fluviais lamacentos de Moreania, letais em emboscadas aquáticas onde arrastam presas para as profundezas.',
  },
  {
    name: 'Moreau Coruja',
    traits: '+1 em Sabedoria ou Inteligência',
    ability: 'Sabedoria Noturna & Percepção Astral',
    description: 'Visão no escuro total (18m), audição aguçada que concede +2 em Percepção e +1 de CD em todas as suas magias divinas ou de adivinhação.',
    spiritAnimal: 'Coruja Branca Astral',
    lore: 'Sacerdotes e xamãs dos Reinos de Moreania que lêem os sinais das estrelas e conversam diretamente com os espíritos dos antepassados.',
  },
  {
    name: 'Moreau Texugo',
    traits: '+1 em Constituição ou Força',
    ability: 'Tenacidade Inabalável',
    description: 'Quando com metade ou menos dos PV máximos, ganha +2 em jogadas de ataque e dano físico e imunidade temporária a efeitos de medo.',
    spiritAnimal: 'Texugo das Cavernas Profundas',
    lore: 'Conhecidos por nunca desistirem de uma briga, lutando com ferocidade feroz mesmo quando superados por dez oponentes.',
  },
  {
    name: 'Moreau Cervo',
    traits: '+1 em Destreza ou Sabedoria',
    ability: 'Passos Ligeiros & Salto Deslumbrante',
    description: 'Deslocamento base aumentado para +3m (12m/8 quadrados) e bônus de +5 em testes de Atletismo para corrida ou saltos de obstáculo.',
    spiritAnimal: 'Cervo Sagrado das Clareiras',
    lore: 'Mensageiros velocíssimos capazes de atravessar a ilha de uma costa a outra em tempo recorde sem deixar pegadas na terra batida.',
  },
  {
    name: 'Moreau Rato',
    traits: '+1 em Destreza ou Constituição',
    ability: 'Sobrevivência Extrema nos Esgotos',
    description: 'Imunidade natural a doenças comuns e venenos fracos. Capaz de se espremer através de qualquer abertura por onde passe sua cabeça.',
    spiritAnimal: 'Rato da Meia-Noite',
    lore: 'Sobreviventes dos becos mais úmidos e fétidos das cidades portuárias, resistem a privações alimentares e toxinas sem vacilar.',
  },
];

// Firearms and Illicit Tools Data
const FIREARMS_AND_TOOLS = [
  {
    name: 'Pistola de Pederneira',
    type: 'Arma de Fogo Leve (Uma Mão)',
    damage: '2d6 Impacto/Perfuração',
    crit: '19-20 / x3',
    range: 'Curto (9m / 6q)',
    reload: 'Ação de Movimento (Padrão s/ Saque Rápido)',
    price: '250 TO',
    rules: 'Arma de tiro único. Se rolar 1 natural no ataque, faça teste de Sorte: com falha a arma emperra e exige 1 rodada de manutenção.',
  },
  {
    name: 'Mosquete de Tambor',
    type: 'Arma de Fogo Duas Mãos',
    damage: '2d8 Perfuração Massiva',
    crit: '19-20 / x3',
    range: 'Médio (30m / 20q)',
    reload: 'Ação Padrão (ou Movimento com Rapidez de Recarga)',
    price: '500 TO',
    rules: 'Alcance devastador para emboscadas marítimas e terrestres. O estampido pode ser ouvido a até 500 metros em campo aberto.',
  },
  {
    name: 'Bacamarte de Pederneira',
    type: 'Arma de Fogo de Área',
    damage: '3d6 Estilhaços (Cone de 4,5m)',
    crit: 'x2',
    range: 'Cone de 4,5m (3 quadrados)',
    reload: 'Ação Padrão',
    price: '350 TO',
    rules: 'Não exige teste de pontaria individual contra Defesa: todas as criaturas no cone realizam teste de Reflexos (CD 15 + mod DES) para reduzir à metade.',
  },
  {
    name: 'Canhão Naval de 12 Libras',
    type: 'Artilharia Marítima Fixa',
    damage: '6d8 Impacto + 2d6 Fogo',
    crit: 'x3',
    range: 'Longo (90m / 60q)',
    reload: '2 Rodadas Completas (2 marinheiros)',
    price: '1.200 TO',
    rules: 'Projetado para estraçalhar cascos de naus e muralhas de pedra. Em acertos críticos, derruba mastros ou abre brechas de 3 metros na estrutura.',
  },
  {
    name: 'Gazuas Mestras de Valkaria',
    type: 'Ferramenta Ilícita dos Becos',
    damage: '—',
    crit: '—',
    range: 'Toque',
    reload: '—',
    price: '100 TO',
    rules: 'Feitas de liga de aço temperado com pontas diamantadas. Concedem bônus de +2 em testes de Ladinagem para abrir fechaduras mecânicas ou cofres.',
  },
  {
    name: 'Capa de Lâminas Ocultas',
    type: 'Vestuário Ilícito de Ladino',
    damage: '—',
    crit: '—',
    range: 'Pessoal',
    reload: '—',
    price: '150 TO',
    rules: 'Comporta até 6 adagas ou facas de arremesso escondidas em costuras falsas. Permite sacar uma adaga como ação livre e dá +4 para ocultar armas.',
  },
  {
    name: 'Dados Viciados & Baralho Marcado',
    type: 'Item de Trapaça de Ahlen',
    damage: '—',
    crit: '—',
    range: 'Mesa de Jogo',
    reload: '—',
    price: '50 TO',
    rules: 'Concede +5 em testes de Jogatina. Se um oponente desconfiar e passar em teste de Intuição oposto pela sua Enganação, a trapaça é descoberta!',
  },
  {
    name: 'Veneno: Essência de Belladonna',
    type: 'Substância Tóxica Ilícita',
    damage: '2d12 Veneno + Esgotado',
    crit: '—',
    range: 'Contato ou Ingestão',
    reload: '1 dose (3 ataques)',
    price: '200 TO',
    rules: 'Exige teste de Fortitude CD 18. Se falhar, sofre dano e condição Esgotado por 1 hora; se passar, sofre metade do dano e condição Fatigado.',
  },
];

// Tactical Conditions
const TACTICAL_CONDITIONS = [
  {
    name: 'Abalado',
    type: 'Condição Mental de Medo',
    effect: '-2 em todos os testes de perícia (incluindo ataques) e testes de resistência.',
    cure: 'Fim do efeito, magia de acalmar emoções ou teste bem-sucedido de Vontade.',
  },
  {
    name: 'Caído',
    type: 'Condição Física de Postura',
    effect: '-5 em testes de ataque corpo a corpo e -5 na Defesa contra ataques corpo a corpo; +5 na Defesa contra ataques à distância.',
    cure: 'Gastar uma Ação de Movimento para levantar-se.',
  },
  {
    name: 'Cego',
    type: 'Condição Sensorial Total',
    effect: 'Incapaz de enxergar. Alvos têm Camuflagem Total (50% de chance de erro); sofre -5 na Defesa e deslocamento cai pela metade.',
    cure: 'Magia de cura de cegueira ou restauração.',
  },
  {
    name: 'Desprevenido',
    type: 'Condição Tática de Surpresa',
    effect: '-5 na Defesa e não pode realizar reações (como ataques de oportunidade ou contra-ataques). Alvo propício para Ataque Furtivo.',
    cure: 'Começo do primeiro turno do personagem em combate.',
  },
  {
    name: 'Enfeitiçado',
    type: 'Condição Mental de Ilusão',
    effect: 'Enxerga o conjurador como um amigo próximo e não pode desferir ataques contra ele. Concede +10 em testes sociais ao conjurador.',
    cure: 'Dano direto do conjurador ao enfeitiçado quebra imediatamente a condição.',
  },
  {
    name: 'Enredado',
    type: 'Condição de Contenção Física',
    effect: 'Deslocamento reduzido à metade, não pode correr ou fazer investidas. Sofre -2 em ataques e -2 na Defesa.',
    cure: 'Teste de Acrobacia ou Atletismo (CD variável) como ação completa para se soltar.',
  },
  {
    name: 'Esgotado',
    type: 'Condição Física Extrema',
    effect: 'Sofre -5 em todos os testes de Força e Destreza, Defesa e Reflexos. Deslocamento cai para 3 metros; incapaz de correr ou investir.',
    cure: 'Descanso confortável completo de 8 horas ou cura restauradora maior.',
  },
  {
    name: 'Fascinado',
    type: 'Condição de Atenção Hipnótica',
    effect: 'Incapaz de realizar qualquer ação além de contemplar o efeito fascinante. Sofre -5 em Percepção.',
    cure: 'Ataque ou ameaça evidente desperta a criatura de imediato.',
  },
  {
    name: 'Indefeso',
    type: 'Condição de Vulnerabilidade Crítica',
    effect: 'Desmaiado, amarrado ou paralisado. A Defesa cai para 0 e oponentes adjacentes podem desferir um Golpe de Misericórdia (crítico automático).',
    cure: 'Fim da paralisia ou ação de auxílio de aliado.',
  },
  {
    name: 'Sangrando',
    type: 'Condição de Dano Contínuo',
    effect: 'Sofre 1d6 de dano de sangramento no início de cada um dos seus turnos, ignorando qualquer Redução de Dano (RD).',
    cure: 'Teste de Primeiros Socorros (Cura CD 15) ou qualquer magia que restaure pontos de vida (PV).',
  },
];

// Legendary Materials of Arton
const LEGENDARY_MATERIALS = [
  {
    name: 'Aço-Rubi',
    origin: 'Carapaça de monstros e quitina mineralizada extraída das Áreas de Tormenta purificadas.',
    weaponEffect: 'Ignora completamente qualquer Redução de Dano (RD) do alvo e dureza de objetos.',
    armorEffect: 'Concede imunidade a dano adicional de acertos críticos e ataques furtivos.',
    costMod: '+1.500 TO',
  },
  {
    name: 'Mitral',
    origin: 'Minério estelar raríssimo das profundezas de Doherimm e jazidas das Montanhas Uivantes.',
    weaponEffect: 'Arma torna-se extremamente ágil e leve: aumenta a margem de ameaça crítica em +1 (ex: 19 vira 18).',
    armorEffect: 'Reduz o peso pela metade e reduz a penalidade de armadura em 2 pontos (ex: -3 vira -1).',
    costMod: '+1.000 TO',
  },
  {
    name: 'Adamante',
    origin: 'O metal mais resistente conhecido em Arton, extraído de meteoritos cósmicos.',
    weaponEffect: 'Aumenta a categoria de dado de dano em um passo (ex: 1d8 vira 1d10; 2d6 vira 2d8).',
    armorEffect: 'Concede Redução de Dano (RD 5) permanente contra todos os ataques físicos.',
    costMod: '+1.500 TO',
  },
  {
    name: 'Madeira de Tollon',
    origin: 'Troncos das árvores mágicas das florestas outonais do reino de Tollon.',
    weaponEffect: 'Permite canalizar magias através da arma de madeira sem penalidade de empunhadura.',
    armorEffect: 'Armaduras leves ou escudos de Tollon reduzem o custo de magias de druida ou arcanista em 1 PM.',
    costMod: '+800 TO',
  },
  {
    name: 'Gelo Eterno',
    origin: 'Geleiras encantadas dos picos mais gélidos das Montanhas Uivantes governadas pelo dragão Beluhv.',
    weaponEffect: 'Causa +1d6 de dano de frio perpétuo em todos os ataques e apaga fontes de chamas.',
    armorEffect: 'Concede Resistência a Fogo 10 permanente e resfria o corpo em desertos ardentes.',
    costMod: '+1.200 TO',
  },
];

// Districts of Valkaria
const VALKARIA_DISTRICTS = [
  {
    name: 'A Alta de Valkaria',
    vibe: 'Nobreza, Palácios, Jardins e Honra',
    description: 'Bairro aristocrático da capital de Deheon. Abriga o Palácio Imperial dos Reis de Arton, mansões dos conselheiros e a embaixada de outros 15 reinos.',
    landmarks: 'Palácio Imperial do Rei Thormy, Jardins das Orquídeas de Lena, Quartel da Guarda Real.',
    dangerLevel: 'Muito Baixo (Vigiado por patrulhas paladinas de Khalmyr).',
  },
  {
    name: 'A Baixa de Valkaria',
    vibe: 'Cortiços, Tabernas, Becos Escuros e Submundo',
    description: 'O coração pulsante dos malandros e batedores de carteira. Vielas tão estreitas que quase não entra luz do sol, com escadarias e pontilhões de madeira suspensos.',
    landmarks: 'Beco do Cortejo, Taverna do Dente Quebrado, Cassinos Clandestinos de Ahlen.',
    dangerLevel: 'Alto à Noite (A Milícia só entra em esquadrões armados com alabardas).',
  },
  {
    name: 'O Bairro dos Aventureiros',
    vibe: 'Mercenários, Magia, Missões e Troca de Lendas',
    description: 'Ponto de encontro onde bandos de heróis formam grupos. Lojas de poções com caldeirões borbulhantes na calçada, armeiros forjando lâminas e painéis de cartazes de recompensa.',
    landmarks: 'Taverna do Macaco Caolho, Agência de Contratos de Missões, Bazar dos Alquimistas.',
    dangerLevel: 'Médio (Brigas de taverna diárias com socos, canecos voadores e magias menores).',
  },
  {
    name: 'Vila de Lenórienn (Distrito dos Elfos)',
    vibe: 'Refúgio Élfico, Melancolia, Música e Tradição',
    description: 'Comunidade acolhedora onde os elfos sobreviventes das Guerras Táuricas preservam suas tradições, canções e danças com sabre em casas erguidas dentro de árvores gigantes.',
    landmarks: 'Árvore do Canto Sagrado, Academia de Esgrima Élfica, Conservatório de Harpas de Glórienn.',
    dangerLevel: 'Baixo (Comunidade unida e protegida por arqueiros silenciosos no topo da copa das árvores).',
  },
  {
    name: 'A Praça do Panteão',
    vibe: 'Fé Monumental, Peregrinos e Devoção',
    description: 'Uma das maiores praças do mundo, com 20 templos monumentais dedicados aos 20 Deuses Maiores. O aroma de incenso sagrado e o repicar de sinos ecoam dia e noite.',
    landmarks: 'Catedral de Khalmyr com balança de 30m, Obelisco de Azgher, Fonte Cristalina de Marah.',
    dangerLevel: 'Mínimo (Solo sagrado onde o derramamento de sangue é considerado pecado capital).',
  },
  {
    name: 'Distrito Portuário (Porto do Rio dos Deuses)',
    vibe: 'Comércio Fluvial, Marinheiros, Guindastes e Contrabando',
    description: 'Armazéns onde atracam chatas, caravelas fluviais e botes trazendo mercadorias das províncias e do litoral. Mistura o cheiro de peixe seco, piche, tabaco e pólvora.',
    landmarks: 'Doca Imperial dos Galeões, Armazéns da Companhia das Índias Artonianas, Feira dos Pescadores.',
    dangerLevel: 'Médio-Alto (Emboscadas de marinheiros embriagados e contrabandistas no cais escuro).',
  },
];

// ==========================================
// 2. MAIN COMPONENT: KNOWLEDGE HUB
// ==========================================

export default function KnowledgePage() {
  const [selectedBook, setSelectedBook] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGodIndex, setActiveGodIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered gods
  const filteredGods = useMemo(() => {
    if (!searchQuery) return PANTEAO_GODS;
    const q = searchQuery.toLowerCase();
    return PANTEAO_GODS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.beliefs.toLowerCase().includes(q) ||
        g.weapon.toLowerCase().includes(q) ||
        g.powers.some((p) => p.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Filtered Moreau
  const filteredMoreau = useMemo(() => {
    if (!searchQuery) return MOREAU_HERITAGES;
    const q = searchQuery.toLowerCase();
    return MOREAU_HERITAGES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.ability.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.spiritAnimal.toLowerCase().includes(q) ||
        m.lore.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Firearms and Tools
  const filteredFirearms = useMemo(() => {
    if (!searchQuery) return FIREARMS_AND_TOOLS;
    const q = searchQuery.toLowerCase();
    return FIREARMS_AND_TOOLS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.rules.toLowerCase().includes(q) ||
        f.damage.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Conditions
  const filteredConditions = useMemo(() => {
    if (!searchQuery) return TACTICAL_CONDITIONS;
    const q = searchQuery.toLowerCase();
    return TACTICAL_CONDITIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.effect.toLowerCase().includes(q) ||
        c.cure.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return LEGENDARY_MATERIALS;
    const q = searchQuery.toLowerCase();
    return LEGENDARY_MATERIALS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.origin.toLowerCase().includes(q) ||
        m.weaponEffect.toLowerCase().includes(q) ||
        m.armorEffect.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Valkaria Districts
  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return VALKARIA_DISTRICTS;
    const q = searchQuery.toLowerCase();
    return VALKARIA_DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.vibe.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.landmarks.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeGod = PANTEAO_GODS[activeGodIndex] || PANTEAO_GODS[0];

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      {/* Page Header */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-[#151D30] via-[#0C111E] to-[#070A12] p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="arton" className="text-xs flex items-center gap-1.5 py-1 px-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Tomos Canônicos de Arton
            </Badge>
            <Badge variant="gold" className="text-xs py-1 px-3">
              Tormenta 20 &amp; TRPG
            </Badge>
            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-300 py-1 px-3">
              Base de Conhecimento Oficial dos 6 Livros
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-100">
            Enciclopédia de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300">
              Tormenta
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl">
            A mais completa documentação interativa para mestres e jogadores. Compilada diretamente dos livros canônicos:{' '}
            <strong className="text-amber-200">Manual do Malandro</strong>,{' '}
            <strong className="text-amber-200">Piratas e Pistoleiros</strong>,{' '}
            <strong className="text-amber-200">O Panteão</strong>,{' '}
            <strong className="text-amber-200">Reinos de Moreania</strong>,{' '}
            <strong className="text-amber-200">Valkaria (Cidade Sob a Deusa)</strong> e{' '}
            <strong className="text-amber-200">Mundo de Arton</strong>, incluindo manual tático de combate e regras oficiais.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por deus, regra, arma de fogo, condição, totem moreau..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Limpar
                </button>
              )}
            </div>

            <Link href="/characters/new" className="w-full sm:w-auto">
              <Button variant="arton" className="w-full sm:w-auto font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                <Shield className="w-4 h-4" />
                Forjar Personagem
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Book Tabs Navigation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Layers className="w-4 h-4" />
            Navegue pelos Tomos da Biblioteca
          </div>
          <span className="text-xs text-slate-400">Clique para filtrar capítulos temáticos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {BOOKS_INFO.map((book) => {
            const Icon = book.icon;
            const isSelected = selectedBook === book.id;

            return (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book.id)}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 group',
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.02]'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:border-amber-500/40 hover:text-slate-200 hover:bg-slate-900/60'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors',
                    isSelected ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800/80 text-slate-400 group-hover:text-amber-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-serif font-bold line-clamp-1">{book.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHAPTER 1: MANUAL DO MALANDRO                                             */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'malandro') && (
        <section id="malandro" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Feather className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 text-[10px] mb-1">
                  Manual do Malandro • Submundo &amp; Trapaça
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo I: Leis dos Becos &amp; Malandragem
                </h2>
              </div>
            </div>
            <Link href="/characters/new">
              <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs">
                Criar Malandro dos Becos →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* The Unwritten Laws */}
            <Card variant="tabletop" className="p-5 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                <Scale className="w-4 h-4" />
                As 3 Leis Não-Escritas dos Becos
              </div>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">1. Nunca roube de quem paga assassinos melhores:</strong>
                  Evite barões de Ahlen e nobres de Valkaria sem uma rota de fuga marítima traçada de antemão.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">2. A honra dura até o tilintar do ouro:</strong>
                  Alianças no submundo duram enquanto a fatia de cada comparsa estiver segura no bornal.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">3. Conheça a mão do guarda:</strong>
                  Mão aberta de miliciano pede prata; mão fechada em punho significa correr pelos telhados.
                </li>
              </ul>
            </Card>

            {/* Guilds & Factions */}
            <Card variant="tabletop" className="p-5 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                <Crown className="w-4 h-4" />
                Guildas Clandestinas do Submundo
              </div>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">A Guilda das Sombras de Valkaria:</strong>
                  Rede de catacumbas sob a Estátua da Deusa, controlando os batedores e o contrabando fluvial.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">O Sindicato dos Trapaceiros de Ahlen:</strong>
                  Mestres do blefe aristocrático, agiotagem disfarçada e manipulação dos cassinos de alta roda.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">A Irmandade dos Olhos Cinzentos:</strong>
                  Especialistas em receptação de relíquias roubadas e matéria prima da Tempestade Rubra.
                </li>
              </ul>
            </Card>

            {/* Dirty Tricks */}
            <Card variant="tabletop" className="p-5 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                <Swords className="w-4 h-4" />
                Truques Sujos &amp; Golpes Baixos
              </div>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">Areia nos Olhos (Ação Padrão):</strong>
                  Teste oposto de Ladinagem vs Reflexos. Em sucesso, o alvo fica Cego por 1 rodada.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">Chute Baixo (1 PM):</strong>
                  Ao acertar um ataque leve, o alvo deve superar Fortitude ou cair imediatamente Caído.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-emerald-300 block mb-0.5">Finta Espalhafatosa (Ação Movimento):</strong>
                  Enganação vs Percepção do alvo. Se vencer, ele fica Desprevenido contra seu próximo golpe.
                </li>
              </ul>
            </Card>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 2: PIRATAS E PISTOLEIROS                                          */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'piratas') && (
        <section id="piratas" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <Anchor className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-blue-500/40 text-blue-300 text-[10px] mb-1">
                  Piratas e Pistoleiros • Balística Naval &amp; Pólvora
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo II: Mares de Arton &amp; Balística de Pólvora
                </h2>
              </div>
            </div>
            <Link href="/characters/new">
              <Button size="sm" variant="outline" className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10 text-xs">
                Criar Bucaneiro ou Pistoleiro →
              </Button>
            </Link>
          </div>

          {/* Firearms & Weapons Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wide">
                <Crosshair className="w-4 h-4" />
                Arsenal Canônico de Armas de Fogo e Ferramentas Ilícitas
              </div>
              <span className="text-xs text-slate-400">Total: {filteredFirearms.length} itens</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B0F19]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-amber-200 border-b border-slate-800 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Arma / Equipamento</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Dano</th>
                    <th className="p-3">Crítico</th>
                    <th className="p-3">Alcance</th>
                    <th className="p-3">Recarga</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Efeito Especial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredFirearms.map((item) => (
                    <tr key={item.name} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-serif font-bold text-slate-100 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{item.type}</td>
                      <td className="p-3 font-mono font-bold text-amber-300 whitespace-nowrap">{item.damage}</td>
                      <td className="p-3 font-mono text-red-300 whitespace-nowrap">{item.crit}</td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{item.range}</td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{item.reload}</td>
                      <td className="p-3 font-mono text-yellow-400 whitespace-nowrap">{item.price}</td>
                      <td className="p-3 text-slate-300 min-w-[280px] leading-relaxed">{item.rules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Naval Code & Powder Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card variant="tabletop" className="p-5 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wide">
                <Anchor className="w-4 h-4" />
                O Código Corsário dos Mares
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todo corsário dos Mares de Arton respeita os artigos selados no mastro principal. A carta de corso
                concede imunidade oficial concedida pela Coroa de Deheon ou Portsmouth para atacar navios de reinos rivais.
              </p>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div>• <strong className="text-slate-200">Partilha de Presas:</strong> 2 fatias para o Capitão, 1.5 para o Imediato, 1 para marinheiros.</div>
                <div>• <strong className="text-slate-200">Compensação por Ferimentos:</strong> Perda de olho/mão concede pensão de 100 TO dos despojos da viagem.</div>
                <div>• <strong className="text-slate-200">Motim e Traição:</strong> Pena de abandono em ilha deserta sem água e com uma pistola de tiro único.</div>
              </div>
            </Card>

            <Card variant="tabletop" className="p-5 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wide">
                <Flame className="w-4 h-4" />
                Regras de Pólvora &amp; Falhas Críticas
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A pólvora artoniana é instável perante chuva e água salgada. Um atirador descuidado pode transformar seu
                cano de aço em uma granada caseira.
              </p>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div>• <strong className="text-red-300">Pólvora Molhada:</strong> Sob chuva moderada ou mar agitado, 50% de chance de tiro cego.</div>
                <div>• <strong className="text-red-300">Falha Crítica (1 Natural):</strong> Role 1d6. Em 1, o cano explode causando o dano da arma no atirador!</div>
                <div>• <strong className="text-red-300">Abordagem com Arpéu:</strong> Teste de Atletismo CD 15 para balançar em cordames até o convés com +2 de Ataque.</div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 3: O PANTEÃO                                                      */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'panteao') && (
        <section id="panteao" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-[10px] mb-1">
                  O Panteão • Cosmologia Divina &amp; Dogmas
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo III: Os 20 Deuses Maiores de Arton
                </h2>
              </div>
            </div>
            <Link href="/characters/new">
              <Button size="sm" variant="gold" className="font-bold text-xs">
                Criar Clérigo ou Paladino →
              </Button>
            </Link>
          </div>

          {/* Gods Grid Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {filteredGods.map((god, idx) => {
              const isSelected = activeGod.name === god.name;
              return (
                <button
                  key={god.name}
                  onClick={() => setActiveGodIndex(PANTEAO_GODS.findIndex((g) => g.name === god.name))}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-20',
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-amber-500/40 hover:bg-slate-900'
                  )}
                >
                  <div className="font-serif font-bold text-xs truncate">{god.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{god.title}</div>
                  <div className="text-[9px] text-amber-400/80 font-mono mt-0.5">{god.weapon}</div>
                </button>
              );
            })}
          </div>

          {/* Active God Dossier Card */}
          {activeGod && (
            <Card variant="tabletop" className="border-amber-500/30 p-6 space-y-6 bg-gradient-to-b from-[#131A2B] to-[#0A0E18]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-amber-200">
                      {activeGod.name}
                    </h3>
                    <Badge variant="arton" className="text-xs">
                      Deus Maior
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-400 font-medium tracking-wide mt-0.5">
                    {activeGod.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCopy(
                        `${activeGod.name} (${activeGod.title}) - Arma: ${activeGod.weapon}. Poderes: ${activeGod.powers.join(', ')}. Dogma: ${activeGod.beliefs}`,
                        'god-copy'
                      )
                    }
                    className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 flex items-center gap-1.5"
                  >
                    {copiedKey === 'god-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'god-copy' ? 'Copiado!' : 'Copiar Dossiê'}</span>
                  </Button>

                  <Link href={`/characters/new`}>
                    <Button size="sm" variant="arton" className="text-xs font-bold">
                      Devoto de {activeGod.name}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                      Símbolo Sagrado
                    </span>
                    <p className="text-slate-300">{activeGod.symbol}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                      Arma Predileta &amp; Cores Sagradas
                    </span>
                    <p className="text-slate-200">
                      <strong className="text-amber-300">Arma:</strong> {activeGod.weapon} •{' '}
                      <strong className="text-amber-300">Cores:</strong> {activeGod.holyColor}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                      Crenças &amp; Dogmas Sagrados
                    </span>
                    <p className="text-slate-300">{activeGod.beliefs}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                      Poderes Concedidos Oficiais
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeGod.powers.map((pow) => (
                        <span
                          key={pow}
                          className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium text-[11px]"
                        >
                          ✦ {pow}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
                    <span className="text-red-400 font-bold uppercase tracking-wider text-[10px] block">
                      Obrigações &amp; Restrições de Devoção
                    </span>
                    <p className="text-red-200/90">{activeGod.restrictions}</p>
                  </div>

                  <div className="text-[11px] text-slate-400 italic">
                    Devotos de {activeGod.name} ganham 1 poder concedido adicional ao escolher a divindade no nível 1 da ficha.
                  </div>
                </div>
              </div>
            </Card>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 4: REINOS DE MOREANIA                                             */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'moreania') && (
        <section id="moreania" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-orange-950/40 to-slate-950 border border-orange-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <Compass className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-orange-500/40 text-orange-300 text-[10px] mb-1">
                  Reinos de Moreania • A Ilha dos Moreau
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo IV: As 12 Heranças Totêmicas dos Moreau
                </h2>
              </div>
            </div>
            <Link href="/characters/new">
              <Button size="sm" variant="outline" className="border-orange-500/40 text-orange-300 hover:bg-orange-500/10 text-xs">
                Criar Personagem Moreau →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMoreau.map((moreau) => (
              <Card
                key={moreau.name}
                variant="tabletop"
                className="p-4 border-slate-800 hover:border-orange-400/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-slate-100">{moreau.name}</h4>
                      <Badge variant="gold" className="text-[9px] mt-0.5">
                        {moreau.traits}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/30">
                      {moreau.spiritAnimal}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-300 block mb-0.5">Poder: {moreau.ability}</strong>
                    <p>{moreau.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                  {moreau.lore}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 5: VALKARIA, CIDADE SOB A DEUSA                                    */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'valkaria') && (
        <section id="valkaria" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-950/40 to-slate-950 border border-purple-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-purple-500/40 text-purple-300 text-[10px] mb-1">
                  Valkaria, Cidade Sob a Deusa • Metrópole Imperial
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo V: Atlas Urbano &amp; Bairros da Capital
                </h2>
              </div>
            </div>
            <Link href="/vtt">
              <Button size="sm" variant="outline" className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-xs">
                Explorar Valkaria no VTT →
              </Button>
            </Link>
          </div>

          {/* Colossal Statue Callout */}
          <div className="p-6 rounded-2xl border border-purple-500/30 bg-[#0C0F1D] flex flex-col md:flex-row items-center gap-6 shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/15 border-2 border-purple-500/40 flex items-center justify-center flex-shrink-0">
              <Crown className="w-10 h-10 text-purple-300" />
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <h3 className="text-lg font-serif font-bold text-purple-200">
                A Estátua Monumental de 100 Metros &amp; O Labirinto do Desafio
              </h3>
              <p>
                No centro exato de Valkaria ergue-se a colossal deusa de pedra viva de cem metros de altura. Em seu
                interior repousa o <strong className="text-purple-300">Labirinto do Desafio</strong>, uma masmorra
                dimensional esculpida por Khalmyr onde aventureiros de todo o mundo arriscam suas vidas buscando os
                artefatos sagrados e a bênção da deusa da ambição.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-200 font-mono">
                  População: 1.000.000+ habitantes
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-200 font-mono">
                  Soberana: Rainha Shivara Sharpblade
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-200 font-mono">
                  Moeda Padrão: Tibar de Ouro (TO)
                </span>
              </div>
            </div>
          </div>

          {/* Districts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDistricts.map((district) => (
              <Card
                key={district.name}
                variant="tabletop"
                className="p-5 border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-serif font-bold text-base text-slate-100">{district.name}</h4>
                    <span className="text-[10px] text-purple-300 font-mono">{district.vibe}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{district.description}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px]">
                  <div className="text-slate-400">
                    <strong className="text-amber-400">Pontos de Interesse:</strong> {district.landmarks}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-red-400">Nível de Perigo:</strong> {district.dangerLevel}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 6: MUNDO DE ARTON                                                 */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'arton') && (
        <section id="arton" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-red-950/40 to-slate-950 border border-red-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-red-500/40 text-red-300 text-[10px] mb-1">
                  Mundo de Arton • Geografia &amp; Ameaça da Tormenta
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo VI: Reinos de Arton &amp; Materiais Lendários
                </h2>
              </div>
            </div>
            <Link href="/compendium">
              <Button size="sm" variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs">
                Ver Bestiário de Ameaças →
              </Button>
            </Link>
          </div>

          {/* Legendary Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                Metais &amp; Materiais Especiais de Forja
              </div>
              <span className="text-xs text-slate-400">Total: {filteredMaterials.length} materiais</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((mat) => (
                <Card
                  key={mat.name}
                  variant="tabletop"
                  className="p-5 border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-base text-amber-200">{mat.name}</h4>
                      <Badge variant="gold" className="text-[10px] font-mono">
                        {mat.costMod}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">{mat.origin}</p>
                    <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                      <div>
                        <strong className="text-red-300">Em Armas:</strong> {mat.weaponEffect}
                      </div>
                      <div>
                        <strong className="text-blue-300">Em Armaduras/Escudos:</strong> {mat.armorEffect}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* The Tormenta Breakdown */}
          <div className="p-6 rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-[#12080D] to-[#0A0710] space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wide">
              <Skull className="w-5 h-5 animate-pulse" />
              A Corrupção da Tempestade Rubra (Anticriação Lefeu)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vinda de outra realidade alienígena, a Tormenta não visa conquistar Arton, mas devorar e reescrever sua
              própria existência biológica. Chuvas de sangue ácido, cristais rubros rasgando o solo e odores de carne
              queimada anunciam a proximidade de uma Área de Tormenta.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/20 space-y-1">
                <strong className="text-red-300 block">Insanidade &amp; Corrupção:</strong>
                <p className="text-slate-400">Exposição prolongada gera aberrações anatômicas e perda contínua de Sanidade.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/20 space-y-1">
                <strong className="text-red-300 block">Imunidades dos Lefeu:</strong>
                <p className="text-slate-400">Criaturas da Tormenta são imunes a acertos críticos e magias de ilusão ou encantamento.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/20 space-y-1">
                <strong className="text-red-300 block">Matéria Vermelha:</strong>
                <p className="text-slate-400">Armas forjadas com quitina rubra ignoram a dureza comum, mas envenenam o usuário.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 7: GUIA TÁTICO & REGRAS OFICIAIS                                  */}
      {/* ========================================================================= */}
      {(selectedBook === 'all' || selectedBook === 'regras') && (
        <section id="regras" className="space-y-6 pt-4 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-500/30 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <Swords className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-[10px] mb-1">
                  Guia Tático Oficial • Mecânica d20 &amp; Combate
                </Badge>
                <h2 className="text-2xl font-serif font-black text-slate-100">
                  Capítulo VII: Economia de Ações, Condições &amp; Mana
                </h2>
              </div>
            </div>
            <Link href="/vtt">
              <Button size="sm" variant="arton" className="font-bold text-xs">
                Testar no Grid do VTT →
              </Button>
            </Link>
          </div>

          {/* Action Economy Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="tabletop" className="p-4 border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                <Zap className="w-4 h-4" />
                Ação Padrão (1x / turno)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Desferir um ataque armado, conjurar uma magia padrão, usar um poder tático, prestar primeiros socorros ou
                tentar uma manobra de combate (Derrubar, Agarrar, Desarmar).
              </p>
            </Card>

            <Card variant="tabletop" className="p-4 border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
                <ArrowRight className="w-4 h-4" />
                Ação de Movimento (1x / turno)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deslocar-se até seu deslocamento base (9m / 6 quadrados), sacar ou embainhar uma arma (com Saque Rápido
                vira livre), levantar-se do chão ou recarregar pistola.
              </p>
            </Card>

            <Card variant="tabletop" className="p-4 border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                <Flame className="w-4 h-4" />
                Ação Completa (Consome o Turno)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Corrida a toda velocidade (3x deslocamento em linha reta), investida marcial (+2 no ataque com penalidade
                de Defesa) ou conjurar rituais de grande porte.
              </p>
            </Card>

            <Card variant="tabletop" className="p-4 border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase">
                <Sparkles className="w-4 h-4" />
                Ação Livre &amp; Reação
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Largar um objeto, falar ordens breves aos aliados, contra-ataque de oportunidade quando oponente sai de
                alcance corporal ou teste de Reflexos para esquiva.
              </p>
            </Card>
          </div>

          {/* Tactical Conditions Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wide">
                <Shield className="w-4 h-4" />
                Tabela Canônica de Condições de Batalha
              </div>
              <span className="text-xs text-slate-400">Total: {filteredConditions.length} condições catalogadas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredConditions.map((cond) => (
                <div
                  key={cond.name}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0B0F19] hover:border-indigo-500/40 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-amber-200">{cond.name}</span>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                      {cond.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-red-300">Efeito:</strong> {cond.effect}
                  </p>
                  <div className="text-[11px] text-slate-400 italic">
                    <strong className="text-emerald-400">Como Curar:</strong> {cond.cure}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PM Economy Rules */}
          <div className="p-6 rounded-2xl border border-blue-500/30 bg-[#0B101D] space-y-3">
            <h3 className="text-lg font-serif font-bold text-blue-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              A Regra de Ouro dos Pontos de Mana (PM)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O limite de Pontos de Mana que um personagem pode gastar em uma mesma habilidade, magia ou golpe é igual
              ao seu <strong className="text-blue-300">Nível de Personagem</strong>. No nível 5, por exemplo, o guerreiro
              pode gastar até 5 PM em seu Ataque Especial e o arcanista pode adicionar até 4 PM em aprimoramentos para
              uma magia de 1º círculo.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-blue-300">
              <span className="px-2.5 py-1 rounded bg-blue-950/70 border border-blue-500/30">
                Limite por Turno = Nível
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-950/70 border border-blue-500/30">
                Sustentação = 1 PM / rodada
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-950/70 border border-blue-500/30">
                Descanso Normal = Recupera Nível em PV &amp; PM
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Footer */}
      <section className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-red-950/60 via-[#101626] to-[#0A0D17] p-8 text-center space-y-4 shadow-2xl">
        <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
          Pronto para Colocar o Conhecimento em Prática?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Crie agora mesmo sua ficha dinâmica com o novo forjador interativo com arquétipos lendários ou abra o VTT
          para iniciar sua campanha em Arton.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/characters/new">
            <Button variant="arton" size="lg" className="font-bold flex items-center gap-2 shadow-lg">
              <Shield className="w-4 h-4" />
              Criar Personagem Agora
            </Button>
          </Link>
          <Link href="/vtt">
            <Button variant="gold" size="lg" className="font-bold flex items-center gap-2 shadow-lg">
              <Swords className="w-4 h-4" />
              Entrar na Mesa Virtual (VTT)
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
