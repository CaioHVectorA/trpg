'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Heart,
  Zap,
  Sword,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  Skull,
  Award,
  Package,
  Dices,
  AlertCircle,
  BookOpen,
  Plus,
  Minus,
  Loader2,
  Volume2,
  VolumeX,
  Flame,
  Crosshair,
  Wand2,
  Compass,
  ArrowRight,
  Play,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateDerivedStats,
  calculateT20PointBuyCost,
  calculateTRPGPointBuyCost,
  getAttributeModifier
} from '@/lib/rules';
import { SystemMode, AttributeKey, AttributeBlock, BaseSheet } from '@/lib/types';

export interface CreatedCharacterData {
  name: string;
  system: SystemMode;
  isNpc: boolean;
  race: string;
  class: string;
  level: number;
  alignment?: string;
  deity?: string;
  attributes: AttributeBlock;
  trainedSkills: string[];
  attacks: Array<{
    name: string;
    bonus: number;
    damage: string;
    damageType?: string;
    threatRange: number;
    critMultiplier: number;
  }>;
  spells: Array<{
    name: string;
    circle?: number;
    costPM?: number;
    description?: string;
  }>;
  powers: Array<{
    name: string;
    costPM?: number;
    description?: string;
  }>;
  inventory: Array<{
    name: string;
    weightSlots?: number;
    weightKg?: number;
    quantity: number;
    equipped?: boolean;
    defenseBonus?: number;
    armorPenalty?: number;
    isHeavy?: boolean;
  }>;
  armorBonus: number;
  shieldBonus: number;
  isHeavyArmor: boolean;
  armorPenalty: number;
  shieldPenalty: number;
  inventoryWeightSlots: number;
  pvMax: number;
  pmMax: number;
  defense: number;
  notes?: string;
}

export interface SheetCreationWizardProps {
  onSave: (character: CreatedCharacterData) => void;
  onCancel: () => void;
  initialSystem?: SystemMode;
}

interface CompendiumApiItem {
  id: string;
  system: string;
  type: string;
  name: string;
  description: string;
  category?: string;
  circle?: number;
  cost?: string;
  requirement?: string;
  dataJson: string;
  tags: string;
}

// -----------------------------------------------------------------------------
// Sound Synthesis Engine via Web Audio API (100% Client-Side, Zero External Deps)
// -----------------------------------------------------------------------------
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playStep() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  playDice() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150 + Math.random() * 350, ctx.currentTime + i * 0.04);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.04 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.04);
        osc.stop(ctx.currentTime + i * 0.04 + 0.08);
      }
    } catch {}
  }

  playSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.09 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.28);
      });
    } catch {}
  }
}

const sfx = new SoundFx();

// -----------------------------------------------------------------------------
// Canonical Races (Core + Google Drive Books: Moreania, Valkaria, etc.)
// -----------------------------------------------------------------------------
export const EXPANDED_RACES = [
  {
    name: 'Humano',
    book: 'Valkaria & Livro Básico',
    description: '+1 em três atributos diferentes à escolha. Duas perícias treinadas ou um poder geral extra.',
    modsT20: { FOR: 1, DES: 1, CON: 1, INT: 0, SAB: 0, CAR: 0 },
    modsTRPG: { FOR: 2, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    speed: 9,
    avatar: '/assets/tokens/paladin.svg',
    traits: ['Versátil (+2 Perícias)', 'Ambição da Deusa Valkaria'],
  },
  {
    name: 'Anão',
    book: 'Doherimm & Mundo de Arton',
    description: 'Resistência pétrea, visão no escuro, tradição de Heredrimm com machados e martelos.',
    modsT20: { FOR: 0, DES: -1, CON: 2, INT: 0, SAB: 1, CAR: 0 },
    modsTRPG: { FOR: 0, DES: -2, CON: 4, INT: 0, SAB: 2, CAR: 0 },
    speed: 6,
    avatar: '/assets/tokens/skeleton.svg',
    traits: ['Conhecimento das Rochas', 'Devagar e Sempre (Sem perda de carga)'],
  },
  {
    name: 'Elfo',
    book: 'Lenórienn & Livro Básico',
    description: 'Graça sobrenatural, sentidos aguçados, herança mágica de Glórienn e deslocamento veloz.',
    modsT20: { FOR: 0, DES: 1, CON: -1, INT: 2, SAB: 0, CAR: 0 },
    modsTRPG: { FOR: 0, DES: 2, CON: -2, INT: 2, SAB: 0, CAR: 0 },
    speed: 12,
    avatar: '/assets/tokens/mage.svg',
    traits: ['Sangue Mágico (+1 PM/Nível)', 'Deslocamento 12m'],
  },
  {
    name: 'Moreau (Raposa)',
    book: 'Reinos de Moreania',
    description: 'Povo abençoado pelos Deuses da Ilha com astúcia, agilidade vulpina e sentidos da mata.',
    modsT20: { FOR: 0, DES: 2, CON: 0, INT: 1, SAB: 0, CAR: 1 },
    modsTRPG: { FOR: 0, DES: 2, CON: 0, INT: 2, SAB: 0, CAR: 2 },
    speed: 9,
    avatar: '/assets/tokens/moreau.svg',
    traits: ['Herança da Raposa (+2 Enganação/Ladinagem)', 'Sentidos da Ilha'],
  },
  {
    name: 'Moreau (Lobo)',
    book: 'Reinos de Moreania',
    description: 'Guerreiro totêmico com instinto de matilha feroz, faro apurado e mordida letal.',
    modsT20: { FOR: 1, DES: 1, CON: 1, INT: 0, SAB: 1, CAR: -1 },
    modsTRPG: { FOR: 2, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: -2 },
    speed: 9,
    avatar: '/assets/tokens/moreau.svg',
    traits: ['Ataque em Bando (+2 em Flanco)', 'Faro e Mordida Feral'],
  },
  {
    name: 'Moreau (Urso)',
    book: 'Reinos de Moreania',
    description: 'Vigor colossal da floresta sagrada, garras devastadoras e constituição indomável.',
    modsT20: { FOR: 2, DES: -1, CON: 2, INT: -1, SAB: 1, CAR: 0 },
    modsTRPG: { FOR: 4, DES: -2, CON: 4, INT: 0, SAB: 0, CAR: 0 },
    speed: 9,
    avatar: '/assets/tokens/moreau.svg',
    traits: ['Garras de Urso (1d6 dano)', 'Vigor da Ilha (+2 Fortitude)'],
  },
  {
    name: 'Qareen',
    book: 'Wynlla & O Panteão',
    description: 'Meio-gênios hospitaleiros tocados pelos planos elementais e abençoados por Wynna.',
    modsT20: { FOR: 0, DES: 0, CON: 0, INT: 1, SAB: -1, CAR: 2 },
    modsTRPG: { FOR: 0, DES: 0, CON: 0, INT: 2, SAB: -2, CAR: 4 },
    speed: 9,
    avatar: '/assets/tokens/cleric.svg',
    traits: ['Desejos (-1 PM para aliados)', 'Resistência Elemental 10'],
  },
  {
    name: 'Lefou',
    book: 'Área de Tormenta',
    description: 'Humanoides tocados pela Tempestade Rubra, com deformidades aberrantes e olhos rubros.',
    modsT20: { FOR: 1, DES: 1, CON: 1, INT: 0, SAB: 0, CAR: -1 },
    modsTRPG: { FOR: 2, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: -2 },
    speed: 9,
    avatar: '/assets/tokens/barbarian.svg',
    traits: ['Cria da Tormenta (Imunidade)', 'Deformidade Aberrante'],
  },
  {
    name: 'Goblin',
    book: 'Mundo de Arton & Manual do Malandro',
    description: 'Pequenos, ágeis, engenhosos e resistentes, mestres da sobrevivência e da ladinagem.',
    modsT20: { FOR: 0, DES: 2, CON: 0, INT: 1, SAB: 0, CAR: -1 },
    modsTRPG: { FOR: -2, DES: 4, CON: 2, INT: 0, SAB: 0, CAR: -2 },
    speed: 9,
    avatar: '/assets/tokens/rogue.svg',
    traits: ['Rato de Esgoto (+2 Fortitude)', 'Engenhoso sem penalidade'],
  },
  {
    name: 'Minotauro',
    book: 'Tapista & O Panteão',
    description: 'Guerreiros taurinos honrados e disciplinados dotados de força hercúlea e chifres afiados.',
    modsT20: { FOR: 2, DES: -1, CON: 1, INT: 0, SAB: 0, CAR: 0 },
    modsTRPG: { FOR: 4, DES: -2, CON: 2, INT: 0, SAB: 0, CAR: 0 },
    speed: 9,
    avatar: '/assets/tokens/barbarian.svg',
    traits: ['Chifres (1d6 perfuração)', 'Couro Rígido (+1 Defesa)'],
  },
];

// -----------------------------------------------------------------------------
// Canonical Classes (Core + Google Drive Books: Piratas, Malandro, Valkaria)
// -----------------------------------------------------------------------------
export const EXPANDED_CLASSES = [
  {
    name: 'Bucaneiro',
    book: 'Piratas e Pistoleiros',
    role: 'Especialista & Combatente Audaz',
    description: 'O espadachim acrobático dos mares de Arton e Portsmouth, mesclando bravata, florete e pistola.',
    mandatory: ['acrobacia', 'reflexos'],
    selectable: ['atletismo', 'enganacao', 'iniciativa', 'jogatina', 'luta', 'percepcao', 'pilotagem', 'pontaria'],
    picks: 4,
    armorProf: 'Armaduras Leves',
    avatar: '/assets/tokens/pirate.svg',
    features: ['Audácia (Carisma em Perícias)', 'Insolência (Carisma na Defesa)', 'Panache (Recupera PM no Crítico)'],
  },
  {
    name: 'Malandro',
    book: 'Manual do Malandro',
    role: 'Especialista em Trapaças',
    description: 'Sobrevivente nato dos becos de Valkaria, perito em lábia, dados viciados, areia nos olhos e golpes baixos.',
    mandatory: ['enganacao', 'ladinagem'],
    selectable: ['acrobacia', 'atletismo', 'furtividade', 'iniciativa', 'intimidacao', 'jogatina', 'luta', 'percepcao', 'reflexos'],
    picks: 4,
    armorProf: 'Armaduras Leves',
    avatar: '/assets/tokens/rogue.svg',
    features: ['Golpe Baixo (Atordoa inimigo)', 'Sorte do Trapaceiro (Rola de novo 1s)', 'Ataque Furtivo'],
  },
  {
    name: 'Pistoleiro',
    book: 'Piratas e Pistoleiros',
    role: 'Atirador de Elite',
    description: 'Atirador de infantaria treinado nos feudos de Portsmouth, mestre absoluto em recarga relâmpago e disparos fatais.',
    mandatory: ['iniciativa', 'pontaria'],
    selectable: ['acrobacia', 'atletismo', 'furtividade', 'intimidacao', 'oficio', 'percepcao', 'reflexos', 'sobrevivencia'],
    picks: 3,
    armorProf: 'Armaduras Leves',
    avatar: '/assets/tokens/pirate.svg',
    features: ['Mira Fulminante', 'Recarga Tática Rápida', 'Duelo ao Meio-Dia'],
  },
  {
    name: 'Guerreiro',
    book: 'Tormenta 20',
    role: 'Combatente Vanguarda',
    description: 'Especialista em armas marciais, controle tático do campo de batalha e pancadas devastadoras.',
    mandatory: ['luta', 'fortitude'],
    selectable: ['adestramento', 'atletismo', 'cavalgar', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'pontaria', 'reflexos'],
    picks: 2,
    armorProf: 'Armaduras Pesadas e Escudos',
    avatar: '/assets/tokens/warrior.svg',
    features: ['Ataque Especial (+4 atk/+4 dano)', 'Durabilidade Marcial'],
  },
  {
    name: 'Arcanista',
    book: 'Tormenta 20',
    role: 'Conjurador Arcano',
    description: 'Moldador da trama mágica por estudo (Mago), pacto (Bruxo) ou linhagem sobrenatural (Feiticeiro).',
    mandatory: ['misticismo', 'vontade'],
    selectable: ['conhecimento', 'iniciativa', 'percepcao', 'oficio', 'nobreza'],
    picks: 2,
    armorProf: 'Nenhuma',
    avatar: '/assets/tokens/mage.svg',
    features: ['Magias Arcanas de 1º Círculo', 'Foco Arcano / Grimório'],
  },
  {
    name: 'Paladino',
    book: 'O Panteão',
    role: 'Campeão Sagrado',
    description: 'Guerreiro sagrado blindado pela fé inabalável em Khalmyr, Valkaria ou Thyatis, punindo o mal.',
    mandatory: ['luta', 'vontade'],
    selectable: ['adestramento', 'atletismo', 'cavalgar', 'cura', 'diplomacia', 'fortitude', 'iniciativa', 'nobreza', 'percepcao', 'religiao'],
    picks: 2,
    armorProf: 'Armaduras Pesadas e Escudos',
    avatar: '/assets/tokens/paladin.svg',
    features: ['Golpe Divino (+1d8 luz)', 'Cura pelas Mãos', 'Aura Sagrada'],
  },
  {
    name: 'Clérigo',
    book: 'O Panteão',
    role: 'Conjurador Divino',
    description: 'Arauto dos Deuses de Arton canalizando milagres divinos, preces curativas e julgamento celestial.',
    mandatory: ['religiao', 'vontade'],
    selectable: ['conhecimento', 'cura', 'diplomacia', 'fortitude', 'iniciativa', 'intuicao', 'luta', 'misticismo', 'nobreza', 'oficio', 'percepcao'],
    picks: 2,
    armorProf: 'Armaduras Pesadas e Escudos',
    avatar: '/assets/tokens/cleric.svg',
    features: ['Canalizar Energia (Cura/Dano em Área)', 'Devoto Fiel dos Deuses'],
  },
  {
    name: 'Bárbaro',
    book: 'Tormenta 20',
    role: 'Combatente Primal',
    description: 'Combatente selvagem guiado por fúria incontrolável capaz de absorver dano físico colossal.',
    mandatory: ['luta', 'fortitude'],
    selectable: ['adestramento', 'atletismo', 'cavalgar', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'pontaria', 'sobrevivencia'],
    picks: 4,
    armorProf: 'Armaduras Leves e Escudos',
    avatar: '/assets/tokens/barbarian.svg',
    features: ['Fúria Primal (+2 atk/dano, RD 2)', 'Resistência a Dano'],
  },
  {
    name: 'Nobre',
    book: 'Valkaria: Cidade sob a Deusa',
    role: 'Líder & Diplomata',
    description: 'Líder carismático da alta corte do Reinado, capaz de inspirar aliados e intimidar rivais.',
    mandatory: ['diplomacia', 'nobreza', 'vontade'],
    selectable: ['atuacao', 'cavalgar', 'conhecimento', 'enganacao', 'iniciativa', 'intimidacao', 'intuicao', 'investigacao', 'jogatina', 'luta', 'percepcao'],
    picks: 3,
    armorProf: 'Armaduras Leves e Escudos',
    avatar: '/assets/tokens/paladin.svg',
    features: ['Autoconfiança (Carisma na Defesa)', 'Comandar (Ação extra para aliados)'],
  },
  {
    name: 'Ladino',
    book: 'Tormenta 20',
    role: 'Especialista Furtivo',
    description: 'Mestre em emboscadas, perícias minuciosas, desarmar armadilhas e ataque furtivo nas sombras.',
    mandatory: ['ladinagem', 'reflexos'],
    selectable: ['acrobacia', 'atletismo', 'atuacao', 'diplomacia', 'enganacao', 'furtividade', 'iniciativa', 'intimidacao', 'investigacao', 'jogatina', 'luta', 'percepcao', 'pontaria'],
    picks: 4,
    armorProf: 'Armaduras Leves',
    avatar: '/assets/tokens/rogue.svg',
    features: ['Ataque Furtivo (+1d6)', 'Evasão (Dano zero em Reflexos)'],
  },
];

// -----------------------------------------------------------------------------
// Canonical Deities (O Panteão)
// -----------------------------------------------------------------------------
export const EXPANDED_DEITIES = [
  { name: 'Valkaria', domain: 'Ambição, Liberdade, Aventura', symbol: 'Rosa prateada sob algemas rompidas', power: 'Liberdade Incondicional & Armas da Ambição' },
  { name: 'Khalmyr', domain: 'Justiça, Ordem, Lei', symbol: 'Espada sobre a balança de prata', power: 'Espada Justiceira & Coragem Total' },
  { name: 'Wynna', domain: 'Magia Arcana, Elementos', symbol: 'Espiral multicolorida de pura mana', power: 'Bênção da Magia & Centelha Mágica' },
  { name: 'Nimb', domain: 'Sorte, Caos, Destino', symbol: 'Dado de 6 faces com interrogações', power: 'Sorte dos Loucos & Poder Oculto' },
  { name: 'Arsenal', domain: 'Guerra, Conquista, Armas', symbol: 'Martelo colossal cruzado com espada', power: 'Sangue de Ferro & Fúria Guerreira' },
  { name: 'Thyatis', domain: 'Ressurreição, Profecia, Fênix', symbol: 'Fênix dourada em chamas sagradas', power: 'Dom da Ressurreição & Chama Imortal' },
  { name: 'Allihanna', domain: 'Natureza, Animais, Bosques', symbol: 'Flor silvestre e pegada lupina', power: 'Comunhão com Animais & Dedo Verde' },
  { name: 'Tanna-Toh', domain: 'Conhecimento, Verdade, Artes', symbol: 'Papiro desenrolado com pena de ganso', power: 'Voz da Civilização & Mente Analítica' },
  { name: 'Marah', domain: 'Amor, Paz, Concórdia', symbol: 'Pomba branca com ramo de oliveira', power: 'Palavras de Paz & Aura de Amor' },
  { name: 'Lin-Wu', domain: 'Honra Samurai, Tradição', symbol: 'Dragão de jade oriental com katana', power: 'Golpe Honrado & Coragem Samurai' },
  { name: 'Tauron', domain: 'Força, Proteção dos Fracos', symbol: 'Cabeça de touro cinzento de ferro', power: 'Fúria Taurina & Couro Rígido' },
  { name: 'Tenebra', domain: 'Noite, Escuridão, Mistério', symbol: 'Lua cheia escura envolta em névoa', power: 'Visão nas Trevas & Carícia Sombria' },
  { name: 'Sszzaas', domain: 'Traição, Veneno, Intriga', symbol: 'Serpente verde de duas cabeças', power: 'Sangue Venenoso & Olhar Hipnótico' },
  { name: 'Ragnar', domain: 'Morte, Ferocidade Goblinóide', symbol: 'Crânio humanoide cravado em lança', power: 'Fúria da Morte & Necrose' },
  { name: 'Oceano', domain: 'Mares, Profundezas, Tormentas', symbol: 'Onda gigante cristalina', power: 'Mestre das Ondas & Fôlego do Mar' },
  { name: 'Aharadak', domain: 'A Tempestade Rubra, Lefeu', symbol: 'Olho de rubi com espirais aberrantes', power: 'Rejeição Aberrante & Afinidade Rubra' },
  { name: 'Nenhum (Panteão Universal)', domain: 'Aventureiro Independente', symbol: 'Símbolo da Liberdade', power: 'Sem poderes concedidos específicos' },
];

// -----------------------------------------------------------------------------
// Canonical Weapons & Equipment
// -----------------------------------------------------------------------------
export const EXPANDED_WEAPONS = [
  { name: 'Pistola de Pederneira', damage: '2d6', damageType: 'Perfuração', threatRange: 19, critMultiplier: 3, weight: 1, ranged: true, book: 'Piratas e Pistoleiros' },
  { name: 'Mosquete de Infantaria', damage: '2d8', damageType: 'Perfuração', threatRange: 19, critMultiplier: 3, weight: 2, ranged: true, book: 'Piratas e Pistoleiros' },
  { name: 'Bacamarte Naval', damage: '3d6', damageType: 'Perfuração', threatRange: 20, critMultiplier: 2, weight: 2, ranged: true, book: 'Piratas e Pistoleiros' },
  { name: 'Sabre de Corsário', damage: '1d8', damageType: 'Corte', threatRange: 18, critMultiplier: 2, weight: 1, book: 'Piratas e Pistoleiros' },
  { name: 'Adaga Retrátil de Manga', damage: '1d4', damageType: 'Perfuração', threatRange: 19, critMultiplier: 2, weight: 1, book: 'Manual do Malandro' },
  { name: 'Espada Bastarda de Aço-Rubi', damage: '1d10', damageType: 'Corte', threatRange: 19, critMultiplier: 2, weight: 1, book: 'Mundo de Arton' },
  { name: 'Espada Longa', damage: '1d8', damageType: 'Corte', threatRange: 19, critMultiplier: 2, weight: 1, book: 'Tormenta 20' },
  { name: 'Espada Grande (Montante)', damage: '2d6', damageType: 'Corte', threatRange: 19, critMultiplier: 2, weight: 2, book: 'Tormenta 20' },
  { name: 'Machado Taurino de Guerra', damage: '3d6', damageType: 'Corte', threatRange: 20, critMultiplier: 3, weight: 3, book: 'Tormenta 20' },
  { name: 'Arco Longo Élfico', damage: '1d8', damageType: 'Perfuração', threatRange: 20, critMultiplier: 3, weight: 2, ranged: true, book: 'Tormenta 20' },
];

export const EXPANDED_ARMORS = [
  { name: 'Nenhuma (Sem Armadura)', bonus: 0, penalty: 0, heavy: false, weight: 0 },
  { name: 'Armadura de Couro', bonus: 2, penalty: 0, heavy: false, weight: 2 },
  { name: 'Couro Batido de Pirata', bonus: 3, penalty: -1, heavy: false, weight: 2 },
  { name: 'Brunea de Cavalaria', bonus: 5, penalty: -2, heavy: false, weight: 2 },
  { name: 'Cota de Malha', bonus: 6, penalty: -2, heavy: true, weight: 2 },
  { name: 'Armadura Completa de Placas', bonus: 10, penalty: -5, heavy: true, weight: 5 },
  { name: 'Escudo de Mitral de Doherimm', bonus: 2, penalty: 0, heavy: false, weight: 1 },
];

export const EXPANDED_SHIELDS = [
  { name: 'Nenhum', bonus: 0, penalty: 0, weight: 0 },
  { name: 'Escudo Leve', bonus: 1, penalty: -1, weight: 1 },
  { name: 'Escudo Pesado de Khalmyr', bonus: 2, penalty: -2, weight: 1 },
];

// -----------------------------------------------------------------------------
// Legendary Archetypes (1-Click Instant Templates)
// -----------------------------------------------------------------------------
const LEGENDARY_ARCHETYPES = [
  {
    id: 'bucaneiro-piratas',
    title: 'Capitão Bucaneiro',
    subtitle: 'Piratas e Pistoleiros',
    icon: '🏴‍☠️',
    system: 'T20' as SystemMode,
    raceName: 'Humano',
    className: 'Bucaneiro',
    deity: 'Nimb',
    weaponName: 'Pistola de Pederneira',
    armorName: 'Couro Batido de Pirata',
    shieldName: 'Nenhum',
    skills: ['acrobacia', 'reflexos', 'pontaria', 'enganacao', 'iniciativa'],
    attrsT20: { FOR: 1, DES: 3, CON: 1, INT: 1, SAB: 0, CAR: 3 },
    name: 'Capitão James',
    color: 'from-cyan-900/60 to-blue-950/80 border-cyan-500/40 text-cyan-200',
  },
  {
    id: 'malandro-valkaria',
    title: 'Malandro dos Becos',
    subtitle: 'Manual do Malandro',
    icon: '🗡️',
    system: 'T20' as SystemMode,
    raceName: 'Goblin',
    className: 'Malandro',
    deity: 'Valkaria',
    weaponName: 'Adaga Retrátil de Manga',
    armorName: 'Armadura de Couro',
    shieldName: 'Nenhum',
    skills: ['enganacao', 'ladinagem', 'furtividade', 'iniciativa', 'jogatina', 'acrobacia'],
    attrsT20: { FOR: -1, DES: 4, CON: 1, INT: 2, SAB: 0, CAR: 2 },
    name: 'Kiko Sombra-da-Noite',
    color: 'from-purple-900/60 to-slate-950/80 border-purple-500/40 text-purple-200',
  },
  {
    id: 'moreau-raposa',
    title: 'Herdeira da Raposa',
    subtitle: 'Reinos de Moreania',
    icon: '🦊',
    system: 'T20' as SystemMode,
    raceName: 'Moreau (Raposa)',
    className: 'Ladino',
    deity: 'Valkaria',
    weaponName: 'Adaga Retrátil de Manga',
    armorName: 'Armadura de Couro',
    shieldName: 'Nenhum',
    skills: ['ladinagem', 'reflexos', 'furtividade', 'enganacao', 'percepcao', 'jogatina'],
    attrsT20: { FOR: 0, DES: 4, CON: 1, INT: 2, SAB: 1, CAR: 2 },
    name: 'Kira Olhos-de-Prata',
    color: 'from-emerald-900/60 to-teal-950/80 border-emerald-500/40 text-emerald-200',
  },
  {
    id: 'paladino-khalmyr',
    title: 'Campeão da Justiça',
    subtitle: 'O Panteão',
    icon: '🛡️',
    system: 'T20' as SystemMode,
    raceName: 'Humano',
    className: 'Paladino',
    deity: 'Khalmyr',
    weaponName: 'Espada Longa',
    armorName: 'Cota de Malha',
    shieldName: 'Escudo Pesado de Khalmyr',
    skills: ['luta', 'vontade', 'religiao', 'diplomacia', 'fortitude'],
    attrsT20: { FOR: 3, DES: 0, CON: 2, INT: 0, SAB: 1, CAR: 3 },
    name: 'Sir Loran da Justiça',
    color: 'from-amber-900/60 to-yellow-950/80 border-amber-500/40 text-amber-200',
  },
  {
    id: 'mago-wynna',
    title: 'Mago dos Elementos',
    subtitle: 'Tormenta 20',
    icon: '🔮',
    system: 'T20' as SystemMode,
    raceName: 'Elfo',
    className: 'Arcanista',
    deity: 'Wynna',
    weaponName: 'Espada Longa',
    armorName: 'Nenhuma (Sem Armadura)',
    shieldName: 'Nenhum',
    skills: ['misticismo', 'vontade', 'conhecimento', 'iniciativa', 'percepcao'],
    attrsT20: { FOR: -1, DES: 2, CON: 1, INT: 4, SAB: 1, CAR: 0 },
    name: 'Lorien de Lenórienn',
    color: 'from-blue-900/60 to-indigo-950/80 border-blue-500/40 text-blue-200',
  },
  {
    id: 'barbaro-tormenta',
    title: 'Fúria da Tormenta',
    subtitle: 'Mundo de Arton',
    icon: '🪓',
    system: 'T20' as SystemMode,
    raceName: 'Lefou',
    className: 'Bárbaro',
    deity: 'Arsenal',
    weaponName: 'Machado Taurino de Guerra',
    armorName: 'Armadura de Couro',
    shieldName: 'Nenhum',
    skills: ['luta', 'fortitude', 'atletismo', 'intimidacao', 'iniciativa'],
    attrsT20: { FOR: 4, DES: 1, CON: 3, INT: -1, SAB: 0, CAR: -1 },
    name: 'Gromm Sangue-Rubro',
    color: 'from-red-900/60 to-rose-950/80 border-red-500/40 text-red-200',
  },
];

// -----------------------------------------------------------------------------
// SheetCreationWizard Main Component
// -----------------------------------------------------------------------------
export const SheetCreationWizard: React.FC<SheetCreationWizardProps> = ({
  onSave,
  onCancel,
  initialSystem = 'T20',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Step 1: System & Identity
  const [isNpc, setIsNpc] = useState(false);
  const [system, setSystem] = useState<SystemMode>(initialSystem);
  const [name, setName] = useState('');
  const [deity, setDeity] = useState('Valkaria');
  const [alignment, setAlignment] = useState('Neutro e Bom');
  const [threatRole, setThreatRole] = useState<'Lacaio' | 'Solo' | 'Chefe'>('Solo');
  const [threatNd, setThreatNd] = useState('1');

  // Step 2: Race
  const [selectedRace, setSelectedRace] = useState(EXPANDED_RACES[0]);

  // Step 3: Class & Level
  const [selectedClass, setSelectedClass] = useState(EXPANDED_CLASSES[0]);
  const [level, setLevel] = useState(1);

  // Step 4: Attributes Mode (Point Buy, 4d6 Roll, Standard Array)
  const [attrMode, setAttrMode] = useState<'POINT_BUY' | 'ROLL_4D6' | 'STANDARD'>('POINT_BUY');
  const [baseAttrs, setBaseAttrs] = useState<AttributeBlock>(
    system === 'T20'
      ? { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 1, CAR: -1 }
      : { FOR: 16, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 8 }
  );

  // Dice roll states
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceBreakdown, setDiceBreakdown] = useState<Record<string, number[]>>({});

  // Step 5: Skills
  const [trainedSkills, setTrainedSkills] = useState<string[]>([
    'acrobacia',
    'reflexos',
    'pontaria',
    'iniciativa',
  ]);

  // Step 6: Spells & Powers (Pulled from API)
  const [compendiumItems, setCompendiumItems] = useState<CompendiumApiItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [selectedSpells, setSelectedSpells] = useState<Array<{ name: string; circle?: number; costPM?: number; description?: string }>>([]);
  const [selectedPowers, setSelectedPowers] = useState<Array<{ name: string; costPM?: number; description?: string }>>([]);

  // Step 7: Equipment
  const [selectedWeapon, setSelectedWeapon] = useState(EXPANDED_WEAPONS[0]);
  const [selectedArmor, setSelectedArmor] = useState(EXPANDED_ARMORS[2]);
  const [selectedShield, setSelectedShield] = useState(EXPANDED_SHIELDS[0]);

  // Flash / Toast alert for Archetype selection
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sound toggle helper
  const triggerSfx = useCallback((type: 'step' | 'dice' | 'select' | 'fanfare') => {
    if (!audioEnabled) return;
    if (type === 'step') sfx.playStep();
    if (type === 'dice') sfx.playDice();
    if (type === 'select') sfx.playSelect();
    if (type === 'fanfare') sfx.playFanfare();
  }, [audioEnabled]);

  // Dynamic API Fetching from Compendium
  useEffect(() => {
    async function fetchCompendiumData() {
      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/compendium?system=${system}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.items)) {
            setCompendiumItems(json.items);
          }
        }
      } catch (e) {
        console.error('Erro ao buscar compêndio para o criador:', e);
      } finally {
        setIsLoadingApi(false);
      }
    }
    fetchCompendiumData();
  }, [system]);

  // Sync attributes format when system changes
  const handleSystemSwitch = (newSys: SystemMode) => {
    setSystem(newSys);
    triggerSfx('select');
    if (newSys === 'T20') {
      setBaseAttrs({ FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 1, CAR: -1 });
    } else {
      setBaseAttrs({ FOR: 16, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 8 });
    }
  };

  // Compute final attributes including racial modifiers
  const finalAttrs = useMemo<AttributeBlock>(() => {
    const raceMods = system === 'T20' ? selectedRace.modsT20 : selectedRace.modsTRPG;
    return {
      FOR: baseAttrs.FOR + (raceMods.FOR || 0),
      DES: baseAttrs.DES + (raceMods.DES || 0),
      CON: baseAttrs.CON + (raceMods.CON || 0),
      INT: baseAttrs.INT + (raceMods.INT || 0),
      SAB: baseAttrs.SAB + (raceMods.SAB || 0),
      CAR: baseAttrs.CAR + (raceMods.CAR || 0),
    };
  }, [baseAttrs, selectedRace, system]);

  // Calculate Point Buy budget
  const pointBuyCost = useMemo(() => {
    if (system === 'T20') {
      return calculateT20PointBuyCost(baseAttrs);
    }
    return calculateTRPGPointBuyCost(baseAttrs);
  }, [baseAttrs, system]);

  const pointBuyBudget = system === 'T20' ? 10 : 20;
  const isBudgetValid = pointBuyCost <= pointBuyBudget;

  // Total inventory weight
  const totalWeightSlots = selectedWeapon.weight + selectedArmor.weight + selectedShield.weight;

  // Compute full derived preview
  const derivedPreview = useMemo(() => {
    const sheet: BaseSheet = {
      name: name || 'Novo Personagem',
      system,
      level,
      race: selectedRace.name,
      class: selectedClass.name,
      attributes: finalAttrs,
      trainedSkills,
      armorBonus: selectedArmor.bonus,
      shieldBonus: selectedShield.bonus,
      isHeavyArmor: selectedArmor.heavy,
      armorPenalty: Math.abs(selectedArmor.penalty),
      shieldPenalty: Math.abs(selectedShield.penalty),
      inventoryWeightSlots: totalWeightSlots,
    };
    return calculateDerivedStats(sheet);
  }, [
    name,
    system,
    level,
    selectedRace,
    selectedClass,
    finalAttrs,
    trainedSkills,
    selectedArmor,
    selectedShield,
    totalWeightSlots,
  ]);

  // Attack bonus for weapon
  const weaponBonus = useMemo(() => {
    const isRanged = (selectedWeapon as { ranged?: boolean }).ranged;
    const skillKey = isRanged ? 'pontaria' : 'luta';
    return derivedPreview.skills[skillKey]?.bonus || 0;
  }, [derivedPreview, selectedWeapon]);

  // 1-Click Instant Archetype Populator
  const handleApplyArchetype = (arch: typeof LEGENDARY_ARCHETYPES[0]) => {
    triggerSfx('fanfare');
    setName(arch.name);
    setSystem(arch.system);
    const matchedRace = EXPANDED_RACES.find((r) => r.name === arch.raceName) || selectedRace;
    const matchedClass = EXPANDED_CLASSES.find((c) => c.name === arch.className) || selectedClass;
    const matchedWeapon = EXPANDED_WEAPONS.find((w) => w.name === arch.weaponName) || selectedWeapon;
    const matchedArmor = EXPANDED_ARMORS.find((a) => a.name === arch.armorName) || selectedArmor;
    const matchedShield = EXPANDED_SHIELDS.find((s) => s.name === arch.shieldName) || selectedShield;

    setSelectedRace(matchedRace);
    setSelectedClass(matchedClass);
    setDeity(arch.deity);
    setSelectedWeapon(matchedWeapon);
    setSelectedArmor(matchedArmor);
    setSelectedShield(matchedShield);
    setBaseAttrs(arch.attrsT20);
    setTrainedSkills(arch.skills);

    setToastMessage(`✨ Arquétipo "${arch.title}" aplicado com sucesso!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Roll 4d6 (drop lowest) for all 6 attributes with animation
  const handleRoll4d6 = () => {
    setIsRollingDice(true);
    triggerSfx('dice');

    setTimeout(() => {
      const keys: AttributeKey[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
      const newBreakdown: Record<string, number[]> = {};
      const newBase: Partial<AttributeBlock> = {};

      keys.forEach((k) => {
        const rolls = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ].sort((a, b) => b - a);

        newBreakdown[k] = rolls;
        const sumTop3 = rolls[0] + rolls[1] + rolls[2];

        if (system === 'T20') {
          // In T20 convert total 3..18 to modifier -3..+4
          const mod = Math.floor((sumTop3 - 10) / 2);
          newBase[k] = Math.max(-2, Math.min(4, mod));
        } else {
          newBase[k] = sumTop3;
        }
      });

      setDiceBreakdown(newBreakdown);
      setBaseAttrs(newBase as AttributeBlock);
      setIsRollingDice(false);
      triggerSfx('select');
    }, 600);
  };

  // Apply Standard Array
  const handleApplyStandardArray = () => {
    triggerSfx('select');
    if (system === 'T20') {
      setBaseAttrs({ FOR: 3, DES: 2, CON: 1, INT: 1, SAB: 0, CAR: -1 });
    } else {
      setBaseAttrs({ FOR: 16, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 });
    }
  };

  // Step advancement with sfx
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((p) => p + 1);
      triggerSfx('step');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      triggerSfx('step');
    }
  };

  // Toggle skill selection
  const handleToggleSkill = (skillKey: string) => {
    triggerSfx('select');
    if (selectedClass.mandatory.includes(skillKey)) return;
    setTrainedSkills((prev) =>
      prev.includes(skillKey) ? prev.filter((s) => s !== skillKey) : [...prev, skillKey]
    );
  };

  // Toggle Spell selection from API
  const handleToggleSpell = (item: CompendiumApiItem) => {
    triggerSfx('select');
    setSelectedSpells((prev) => {
      const exists = prev.some((s) => s.name === item.name);
      if (exists) return prev.filter((s) => s.name !== item.name);
      return [
        ...prev,
        {
          name: item.name,
          circle: item.circle || 1,
          costPM: item.cost ? parseInt(item.cost) || 1 : 1,
          description: item.description,
        },
      ];
    });
  };

  // Toggle Power selection from API
  const handleTogglePower = (item: CompendiumApiItem) => {
    triggerSfx('select');
    setSelectedPowers((prev) => {
      const exists = prev.some((p) => p.name === item.name);
      if (exists) return prev.filter((p) => p.name !== item.name);
      return [
        ...prev,
        {
          name: item.name,
          costPM: item.cost ? parseInt(item.cost) || 0 : 0,
          description: item.description,
        },
      ];
    });
  };

  // Final creation payload
  const handleFinalize = () => {
    triggerSfx('fanfare');
    const charName = name.trim() || (isNpc ? `Ameaça ND ${threatNd}` : 'Herói de Arton');

    const createdData: CreatedCharacterData = {
      name: charName,
      system,
      isNpc,
      race: selectedRace.name,
      class: isNpc ? `Ameaça (${threatRole})` : selectedClass.name,
      level,
      alignment,
      deity,
      attributes: finalAttrs,
      trainedSkills,
      attacks: [
        {
          name: selectedWeapon.name,
          bonus: weaponBonus,
          damage: `${selectedWeapon.damage}+${getAttributeModifier(system, finalAttrs.FOR)}`,
          damageType: selectedWeapon.damageType,
          threatRange: selectedWeapon.threatRange,
          critMultiplier: selectedWeapon.critMultiplier,
        },
      ],
      spells: selectedSpells,
      powers: selectedPowers,
      inventory: [
        { name: selectedWeapon.name, weightSlots: selectedWeapon.weight, quantity: 1, equipped: true },
        {
          name: selectedArmor.name,
          weightSlots: selectedArmor.weight,
          quantity: 1,
          equipped: true,
          defenseBonus: selectedArmor.bonus,
          armorPenalty: selectedArmor.penalty,
          isHeavy: selectedArmor.heavy,
        },
        ...(selectedShield.name !== 'Nenhum'
          ? [
              {
                name: selectedShield.name,
                weightSlots: selectedShield.weight,
                quantity: 1,
                equipped: true,
                defenseBonus: selectedShield.bonus,
                armorPenalty: selectedShield.penalty,
              },
            ]
          : []),
      ],
      armorBonus: selectedArmor.bonus,
      shieldBonus: selectedShield.bonus,
      isHeavyArmor: selectedArmor.heavy,
      armorPenalty: Math.abs(selectedArmor.penalty),
      shieldPenalty: Math.abs(selectedShield.penalty),
      inventoryWeightSlots: totalWeightSlots,
      pvMax: derivedPreview.pvMax,
      pmMax: derivedPreview.pmMax,
      defense: derivedPreview.defense,
      notes: isNpc ? `Ameaça de Tormenta ND ${threatNd} - Papel: ${threatRole}` : `Herói criado com o Construtor Dinâmico de Arton.`,
    };

    onSave(createdData);
  };

  const availableSpells = compendiumItems.filter((i) => i.type === 'SPELL');
  const availablePowers = compendiumItems.filter((i) => i.type === 'POWER' || i.type === 'TALENT');

  return (
    <div className="space-y-6">
      {/* Toast Notification for Preset Auto-fill */}
      {toastMessage && (
        <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 rounded-xl text-amber-200 text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Archetypes Fast-Fill Carousel Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0C1120] via-[#090D18] to-[#120808] border border-amber-500/30 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Construtor Instantâneo de Personagem
              </span>
            </div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-slate-100">
              Quer criar rápido? Escolha um Arquétipo Lendário dos Livros ou customize passo a passo:
            </h3>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                sfx.enabled = !audioEnabled;
              }}
              className="text-[11px] h-7 border-slate-700 text-slate-300 hover:text-amber-300 flex items-center gap-1.5"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span>{audioEnabled ? 'Áudio Ativo' : 'Mudo'}</span>
            </Button>
          </div>
        </div>

        {/* Archetypes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {LEGENDARY_ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              onClick={() => handleApplyArchetype(arch)}
              className={cn(
                'p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 group bg-slate-950/70 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
                arch.color
              )}
            >
              <div>
                <div className="flex items-center justify-between text-base mb-1">
                  <span>{arch.icon}</span>
                  <span className="text-[9px] font-mono font-bold uppercase opacity-80">{arch.system}</span>
                </div>
                <p className="font-serif font-bold text-xs text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {arch.title}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{arch.subtitle}</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-amber-400 opacity-90 group-hover:opacity-100">
                <span>1-Clique</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Work Area: Left Stepper & Right Live Preview Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Wizard Form Card (8 cols) */}
        <Card variant="tabletop" className="lg:col-span-8 border-slate-800 shadow-2xl bg-[#090D18] overflow-hidden">
          {/* Header & Steps Breadcrumb */}
          <div className="bg-[#050811] border-b border-amber-500/20 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-black text-slate-100">
                    {isNpc ? 'Forjar Ameaça / Monstro' : 'Forjar Herói de Arton'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Passo {currentStep} de {totalSteps}:{' '}
                  <span className="font-bold text-amber-300">
                    {currentStep === 1 && 'Identidade, Sistema & Papel'}
                    {currentStep === 2 && 'Raça & Linhagens Canônicas'}
                    {currentStep === 3 && 'Classe, Nível & Caminho'}
                    {currentStep === 4 && 'Atributos & Distribuição (Point Buy / 4d6)'}
                    {currentStep === 5 && 'Perícias Treinadas'}
                    {currentStep === 6 && 'Magias & Poderes de Compêndio'}
                    {currentStep === 7 && 'Armamento, Armadura & Carga'}
                    {currentStep === 8 && 'Forja Heroica & Conclusão'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Badge variant={system === 'T20' ? 'arton' : 'mana'} className="text-xs">
                  {system === 'T20' ? 'Tormenta 20 (JdA)' : 'TRPG Clássico'}
                </Badge>
                <Button size="sm" variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white h-7 px-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Visual Step Stepper with Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 h-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>

              {/* Stepper Bubbles */}
              <div className="flex items-center justify-between overflow-x-auto gap-1 py-1">
                {[
                  { n: 1, label: 'Identidade' },
                  { n: 2, label: 'Raça' },
                  { n: 3, label: 'Classe' },
                  { n: 4, label: 'Atributos' },
                  { n: 5, label: 'Perícias' },
                  { n: 6, label: 'Magias' },
                  { n: 7, label: 'Equip' },
                  { n: 8, label: 'Finalizar' },
                ].map((s) => {
                  const isDone = s.n < currentStep;
                  const isCur = s.n === currentStep;

                  return (
                    <button
                      key={s.n}
                      onClick={() => {
                        setCurrentStep(s.n);
                        triggerSfx('step');
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
                        isCur
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105'
                          : isDone
                          ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold font-mono',
                          isCur
                            ? 'bg-amber-400 text-slate-950'
                            : isDone
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {isDone ? '✓' : s.n}
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Step Content with Smooth Entrance Animation */}
          <CardContent className="p-5 sm:p-6 space-y-6 min-h-[460px]">
            {/* STEP 1: IDENTIDADE & SISTEMA */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* System Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Sistema de Regras:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSystemSwitch('T20')}
                        className={cn(
                          'p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1',
                          system === 'T20'
                            ? 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        <Flame className="w-4 h-4 text-red-400" />
                        <span>Tormenta 20 (JdA)</span>
                        <span className="text-[10px] text-slate-500 font-normal">Modificadores diretos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSystemSwitch('TRPG')}
                        className={cn(
                          'p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1',
                          system === 'TRPG'
                            ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>TRPG Clássico</span>
                        <span className="text-[10px] text-slate-500 font-normal">Escala 3 a 18</span>
                      </button>
                    </div>
                  </div>

                  {/* Character Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Tipo de Entidade:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNpc(false);
                          triggerSfx('select');
                        }}
                        className={cn(
                          'p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1',
                          !isNpc
                            ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        <span>Personagem Jogador (PJ)</span>
                        <span className="text-[10px] text-slate-500 font-normal">Herói aventureiro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsNpc(true);
                          triggerSfx('select');
                        }}
                        className={cn(
                          'p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1',
                          isNpc
                            ? 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        <Skull className="w-4 h-4 text-rose-400" />
                        <span>Ameaça / Monstro (NPC)</span>
                        <span className="text-[10px] text-slate-500 font-normal">Bestiário com ND</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name & Deity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Nome do Herói / Título:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Valeros de Valkaria, Capitão James..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Divindade Padroeira (O Panteão):
                    </label>
                    <select
                      value={deity}
                      onChange={(e) => {
                        setDeity(e.target.value);
                        triggerSfx('select');
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                    >
                      {EXPANDED_DEITIES.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} — {d.domain}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alignment / Trend */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Alinhamento / Postura Moral:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Leal e Bom', 'Neutro e Bom', 'Caótico e Bom', 'Leal e Neutro', 'Neutro', 'Caótico e Neutro'].map((al) => (
                      <button
                        key={al}
                        type="button"
                        onClick={() => {
                          setAlignment(al);
                          triggerSfx('select');
                        }}
                        className={cn(
                          'p-2 rounded-lg border text-xs font-semibold transition-all',
                          alignment === al
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        )}
                      >
                        {al}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: RAÇA & LINHAGEM */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>Escolha uma raça canônica oficial de Arton:</span>
                  <span className="text-amber-300 font-bold">{EXPANDED_RACES.length} Raças Disponíveis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {EXPANDED_RACES.map((rc) => {
                    const isSelected = selectedRace.name === rc.name;
                    const mods = system === 'T20' ? rc.modsT20 : rc.modsTRPG;

                    return (
                      <div
                        key={rc.name}
                        onClick={() => {
                          setSelectedRace(rc);
                          triggerSfx('select');
                        }}
                        className={cn(
                          'p-3.5 rounded-xl border cursor-pointer transition-all duration-200 space-y-2 flex flex-col justify-between group',
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.01]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                              {rc.name}
                            </h4>
                            <span className="text-[10px] text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                              {rc.book}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{rc.description}</p>
                        </div>

                        {/* Modifiers Pill & Traits */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono flex-wrap">
                            {Object.entries(mods)
                              .filter(([_, val]) => val !== 0)
                              .map(([attr, val]) => (
                                <span
                                  key={attr}
                                  className={cn(
                                    'px-1.5 py-0.5 rounded font-bold',
                                    (val as number) > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-300 border border-red-500/30'
                                  )}
                                >
                                  {attr} {(val as number) > 0 ? `+${val}` : val}
                                </span>
                              ))}
                            <span className="text-slate-400 text-[10px] font-sans">· Desloc. {rc.speed}m</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            {rc.traits.map((tr) => (
                              <span key={tr} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {tr}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: CLASSE & NÍVEL */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800">
                  <div className="text-xs text-slate-400">
                    Selecione a vocação marcial, arcana ou furtiva do seu aventureiro:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Nível Inicial:</span>
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                      {[1, 2, 3, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setLevel(lvl);
                            triggerSfx('select');
                          }}
                          className={cn(
                            'px-2 py-0.5 text-xs font-bold rounded',
                            level === lvl ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          )}
                        >
                          Nv {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {EXPANDED_CLASSES.map((cls) => {
                    const isSelected = selectedClass.name === cls.name;

                    return (
                      <div
                        key={cls.name}
                        onClick={() => {
                          setSelectedClass(cls);
                          triggerSfx('select');
                        }}
                        className={cn(
                          'p-3.5 rounded-xl border cursor-pointer transition-all duration-200 space-y-2 flex flex-col justify-between group',
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.01]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                              {cls.name}
                            </h4>
                            <span className="text-[10px] text-cyan-400 font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                              {cls.book}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-300/80 font-semibold">{cls.role}</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{cls.description}</p>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-slate-800/80 text-[10px]">
                          <div className="text-slate-400">
                            <strong>Armaduras:</strong> {cls.armorProf}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {cls.features.map((feat) => (
                              <span key={feat} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: ATRIBUTOS & COMPRA DE PONTOS / 4D6 */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
                {/* Mode Selector Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Método:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttrMode('POINT_BUY');
                        triggerSfx('select');
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                        attrMode === 'POINT_BUY' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      Compra de Pontos ({pointBuyBudget} pts)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttrMode('ROLL_4D6');
                        triggerSfx('select');
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1',
                        attrMode === 'ROLL_4D6' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Dices className="w-3.5 h-3.5" />
                      Rolar 4d6
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttrMode('STANDARD');
                        handleApplyStandardArray();
                      }}
                      className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                        attrMode === 'STANDARD' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      Array Padrão
                    </button>
                  </div>

                  {attrMode === 'POINT_BUY' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Gasto:</span>
                      <Badge
                        variant={isBudgetValid ? 'gold' : 'arton'}
                        className="text-xs font-mono font-bold px-2 py-0.5"
                      >
                        {pointBuyCost} / {pointBuyBudget} pts
                      </Badge>
                    </div>
                  )}

                  {attrMode === 'ROLL_4D6' && (
                    <Button
                      size="sm"
                      variant="arton"
                      disabled={isRollingDice}
                      onClick={handleRoll4d6}
                      className="text-xs h-7 px-3 flex items-center gap-1.5"
                    >
                      {isRollingDice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Rolar Todos os Atributos</span>
                    </Button>
                  )}
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AttributeKey[]).map((attr) => {
                    const baseVal = baseAttrs[attr];
                    const raceMod = (system === 'T20' ? selectedRace.modsT20 : selectedRace.modsTRPG)[attr] || 0;
                    const finalVal = baseVal + raceMod;
                    const rolls = diceBreakdown[attr];

                    return (
                      <div
                        key={attr}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-black text-sm text-amber-200">{attr}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Racial: {raceMod > 0 ? `+${raceMod}` : raceMod}
                          </span>
                        </div>

                        {/* Interactive Value Adjuster */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-2xl font-black font-mono text-slate-100">
                              {system === 'T20' ? (finalVal > 0 ? `+${finalVal}` : finalVal) : finalVal}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              Base: {baseVal}
                            </span>
                          </div>

                          {attrMode === 'POINT_BUY' && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setBaseAttrs((prev) => ({
                                    ...prev,
                                    [attr]: system === 'T20' ? Math.max(-2, prev[attr] - 1) : Math.max(8, prev[attr] - 1),
                                  }));
                                  triggerSfx('select');
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBaseAttrs((prev) => ({
                                    ...prev,
                                    [attr]: system === 'T20' ? Math.min(4, prev[attr] + 1) : Math.min(18, prev[attr] + 1),
                                  }));
                                  triggerSfx('select');
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white flex items-center justify-center font-bold"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 4d6 Roll Breakdown Visual */}
                        {rolls && rolls.length === 4 && (
                          <div className="pt-1.5 border-t border-slate-900 text-[10px] flex items-center justify-between font-mono text-slate-400">
                            <span>Dados:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-amber-300 font-bold">{rolls[0]}</span>
                              <span className="text-amber-300 font-bold">+{rolls[1]}</span>
                              <span className="text-amber-300 font-bold">+{rolls[2]}</span>
                              <span className="text-slate-600 line-through">({rolls[3]})</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: PERÍCIAS TREINADAS */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800 text-xs text-slate-400">
                  <div>
                    Perícias obrigatórias de <strong className="text-amber-300">{selectedClass.name}</strong> já marcadas. Escolha suas perícias de treino:
                  </div>
                  <Badge variant="gold" className="text-xs">
                    {trainedSkills.length} Perícias Selecionadas
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    'acrobacia', 'adestramento', 'atletismo', 'atuacao', 'cavalgar', 'conhecimento', 'cura',
                    'diplomacia', 'enganacao', 'fortitude', 'furtividade', 'guerra', 'iniciativa', 'intimidacao',
                    'intuicao', 'investigacao', 'jogatina', 'ladinagem', 'luta', 'misticismo', 'nobreza',
                    'oficio', 'percepcao', 'pilotagem', 'pontaria', 'reflexos', 'religiao', 'sobrevivencia', 'vontade'
                  ].map((skill) => {
                    const isMandatory = selectedClass.mandatory.includes(skill);
                    const isSelectable = selectedClass.selectable.includes(skill);
                    const isSelected = trainedSkills.includes(skill);

                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all duration-150',
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : isSelectable
                            ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-2 capitalize font-semibold">
                          <div
                            className={cn(
                              'w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold',
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-600'
                            )}
                          >
                            {isSelected ? '✓' : ''}
                          </div>
                          <span>{skill}</span>
                        </div>
                        {isMandatory && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-1 rounded">
                            Classe
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: MAGIAS & PODERES */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                  <span>Adicione magias e poderes gerais ou concedidos dos livros ao seu grimório:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 font-bold">{selectedSpells.length} Magias</span>
                    <span>·</span>
                    <span className="text-purple-300 font-bold">{selectedPowers.length} Poderes</span>
                  </div>
                </div>

                {isLoadingApi ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-3">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-400">Carregando catálogo do Compêndio Oficial...</span>
                  </div>
                ) : (
                  <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
                    {/* Spells Selection */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                        Magias Canônicas de Arton:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableSpells.map((sp) => {
                          const isPicked = selectedSpells.some((s) => s.name === sp.name);
                          return (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => handleToggleSpell(sp)}
                              className={cn(
                                'p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 text-xs transition-all',
                                isPicked
                                  ? 'bg-blue-950/60 border-blue-400 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              )}
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>{sp.name}</span>
                                  {sp.circle && <span className="text-[10px] text-blue-400 font-mono">({sp.circle}º Círculo)</span>}
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2">{sp.description}</p>
                              </div>
                              <span className="text-xs font-bold text-blue-400 shrink-0">
                                {isPicked ? '✓' : '+'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Powers Selection */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Poderes Gerais &amp; Concedidos:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availablePowers.map((pw) => {
                          const isPicked = selectedPowers.some((p) => p.name === pw.name);
                          return (
                            <button
                              key={pw.id}
                              type="button"
                              onClick={() => handleTogglePower(pw)}
                              className={cn(
                                'p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 text-xs transition-all',
                                isPicked
                                  ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              )}
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>{pw.name}</span>
                                  {pw.category && <span className="text-[10px] text-purple-400">({pw.category})</span>}
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2">{pw.description}</p>
                              </div>
                              <span className="text-xs font-bold text-purple-400 shrink-0">
                                {isPicked ? '✓' : '+'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 7: EQUIPAMENTO INICIAL */}
            {currentStep === 7 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
                {/* Weapons Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Sword className="w-3.5 h-3.5 text-amber-400" />
                      Arma Principal:
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Dano Base: {selectedWeapon.damage} ({selectedWeapon.damageType})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EXPANDED_WEAPONS.map((wp) => {
                      const isSel = selectedWeapon.name === wp.name;
                      return (
                        <button
                          key={wp.name}
                          type="button"
                          onClick={() => {
                            setSelectedWeapon(wp);
                            triggerSfx('select');
                          }}
                          className={cn(
                            'p-2.5 rounded-xl border text-left flex flex-col justify-between text-xs transition-all',
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          )}
                        >
                          <span className="font-bold line-clamp-1">{wp.name}</span>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                            <span>{wp.damage}</span>
                            <span>{wp.threatRange}-20/x{wp.critMultiplier}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Armors Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      Armadura &amp; Proteção:
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Bônus: +{selectedArmor.bonus} Defesa · Penalidade: {selectedArmor.penalty}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EXPANDED_ARMORS.map((arm) => {
                      const isSel = selectedArmor.name === arm.name;
                      return (
                        <button
                          key={arm.name}
                          type="button"
                          onClick={() => {
                            setSelectedArmor(arm);
                            triggerSfx('select');
                          }}
                          className={cn(
                            'p-2.5 rounded-xl border text-left flex flex-col justify-between text-xs transition-all',
                            isSel
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          )}
                        >
                          <span className="font-bold line-clamp-1">{arm.name}</span>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                            <span>+{arm.bonus} Defesa</span>
                            <span>Pen. {arm.penalty}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shield Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Escudo Complementar:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPANDED_SHIELDS.map((shld) => {
                      const isSel = selectedShield.name === shld.name;
                      return (
                        <button
                          key={shld.name}
                          type="button"
                          onClick={() => {
                            setSelectedShield(shld);
                            triggerSfx('select');
                          }}
                          className={cn(
                            'p-2 rounded-lg border text-center text-xs font-semibold transition-all',
                            isSel
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          )}
                        >
                          {shld.name} {shld.bonus > 0 && `(+${shld.bonus})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: REVISÃO & FORJA HEROICA */}
            {currentStep === 8 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border-2 border-amber-400/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-black text-slate-100">
                        {name || 'Herói de Arton'} — Pronto para Combate!
                      </h3>
                      <p className="text-xs text-amber-200/90 font-sans">
                        {selectedRace.name} · {selectedClass.name} Nv {level} · Devoto de {deity}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="arton"
                    size="lg"
                    onClick={handleFinalize}
                    className="font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_35px_rgba(220,38,38,0.8)] transform hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Concluir &amp; Forjar Herói</span>
                  </Button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-red-900/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pontos de Vida</span>
                    <span className="text-xl font-black font-mono text-red-400">{derivedPreview.pvMax} PV</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pontos de Mana</span>
                    <span className="text-xl font-black font-mono text-sky-400">{derivedPreview.pmMax} PM</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Defesa Total</span>
                    <span className="text-xl font-black font-mono text-amber-300">{derivedPreview.defense} Defesa</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/50">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ataque Principal</span>
                    <span className="text-base font-black font-mono text-emerald-400 truncate block">
                      +{weaponBonus} ({selectedWeapon.damage}+{getAttributeModifier(system, finalAttrs.FOR)})
                    </span>
                  </div>
                </div>

                {/* Detailed Summary Lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-300 uppercase tracking-wide block">
                      Perícias ({trainedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {trainedSkills.map((sk) => (
                        <span key={sk} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300 capitalize text-[11px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-cyan-300 uppercase tracking-wide block">
                      Equipamento &amp; Carga
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Arma: {selectedWeapon.name} ({selectedWeapon.damage})</li>
                      <li>• Armadura: {selectedArmor.name} (+{selectedArmor.bonus} Defesa)</li>
                      {selectedShield.name !== 'Nenhum' && <li>• Escudo: {selectedShield.name} (+{selectedShield.bonus})</li>}
                      <li>• Espaços de Carga: {totalWeightSlots} slots</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Stepper Footer Controls */}
          <div className="p-4 sm:p-5 bg-[#050811] border-t border-slate-800 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              className="border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <span className="text-xs text-slate-500 font-mono font-bold">
              Passo {currentStep} / {totalSteps}
            </span>

            {currentStep < totalSteps ? (
              <Button
                variant="gold"
                size="sm"
                onClick={handleNextStep}
                className="font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <span>Próximo Passo</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="arton"
                size="sm"
                onClick={handleFinalize}
                className="font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Ficha</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Live Hero Preview - Desktop Sticky Card (4 cols) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-6 space-y-4">
          <Card variant="tabletop" className="p-4 sm:p-5 border-zinc-800 bg-zinc-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Resumo do Herói
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-zinc-400 border-zinc-700">
                {system}
              </Badge>
            </div>

            {/* Hero Card Header with Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow flex items-center justify-center shrink-0">
                <img
                  src={selectedClass.avatar || '/assets/tokens/paladin.svg'}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-zinc-100 truncate">
                  {name || 'Herói Sem Nome'}
                </h3>
                <p className="text-xs text-zinc-400 truncate">
                  {selectedRace.name} · {selectedClass.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  Nível {level} · Devoto de {deity}
                </p>
              </div>
            </div>

            {/* Vital Pools Bars */}
            <div className="space-y-2 pt-1 border-t border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400 fill-current" />
                    PV (Pontos de Vida)
                  </span>
                  <span className="font-mono text-zinc-200">{derivedPreview.pvMax} / {derivedPreview.pvMax}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                  <div className="h-full bg-red-500 w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-sky-400 fill-current" />
                    PM (Pontos de Mana)
                  </span>
                  <span className="font-mono text-zinc-200">{derivedPreview.pmMax} / {derivedPreview.pmMax}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                  <div className="h-full bg-sky-500 w-full" />
                </div>
              </div>
            </div>

            {/* Quick Combat Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Defesa</span>
                <span className="text-base font-bold font-mono text-zinc-100">
                  {derivedPreview.defense}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Deslocamento</span>
                <span className="text-base font-bold font-mono text-zinc-100">
                  {selectedRace.speed}m ({Math.round(selectedRace.speed / 1.5)}q)
                </span>
              </div>
            </div>

            {/* Attributes Grid Preview */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Atributos Finais:
              </span>
              <div className="grid grid-cols-3 gap-1 font-mono text-center text-xs">
                {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AttributeKey[]).map((k) => {
                  const val = finalAttrs[k];
                  return (
                    <div key={k} className="p-1 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block font-semibold">{k}</span>
                      <span className="text-zinc-200 font-bold">
                        {system === 'T20' ? (val > 0 ? `+${val}` : val) : val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weapon & Attack preview */}
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-0.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-zinc-200 flex items-center gap-1">
                  <Sword className="w-3 h-3 text-zinc-400" />
                  {selectedWeapon.name}
                </span>
                <span className="text-zinc-300 font-mono">+{weaponBonus} Ataque</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                {selectedWeapon.damage} + {getAttributeModifier(system, finalAttrs.FOR)} {selectedWeapon.damageType} (Crit {selectedWeapon.threatRange}-20/x{selectedWeapon.critMultiplier})
              </p>
            </div>
          </Card>
        </div>

        {/* Live Hero Preview - Mobile Collapsible Bottom Drawer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 p-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                <img
                  src={selectedClass.avatar || '/assets/tokens/paladin.svg'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-zinc-200 truncate">{name || 'Herói Sem Nome'}</div>
                <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="text-red-400 font-bold">{derivedPreview.pvMax} PV</span>
                  <span>·</span>
                  <span className="text-sky-400 font-bold">{derivedPreview.pmMax} PM</span>
                  <span>·</span>
                  <span>Def {derivedPreview.defense}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobilePreviewOpen((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold border border-zinc-800 flex items-center gap-1 shrink-0 ml-2"
            >
              <span>{isMobilePreviewOpen ? 'Fechar' : 'Resumo'}</span>
              {isMobilePreviewOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expanded Mobile Drawer */}
          {isMobilePreviewOpen && (
            <div className="mt-2.5 max-h-[60vh] overflow-y-auto space-y-3 pt-2 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Raça / Classe</span>
                  <span className="text-zinc-200 font-bold text-xs">{selectedRace.name} · {selectedClass.name}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Deslocamento</span>
                  <span className="text-zinc-200 font-bold text-xs">{selectedRace.speed}m</span>
                </div>
              </div>

              {/* Attributes in mobile */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 block uppercase">Atributos:</span>
                <div className="grid grid-cols-6 gap-1 font-mono text-center text-xs">
                  {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AttributeKey[]).map((k) => (
                    <div key={k} className="p-1 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block font-semibold">{k}</span>
                      <span className="text-zinc-200 font-bold">
                        {system === 'T20' ? (finalAttrs[k] > 0 ? `+${finalAttrs[k]}` : finalAttrs[k]) : finalAttrs[k]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weapon preview */}
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-between">
                <span className="text-zinc-200 font-medium">{selectedWeapon.name}</span>
                <span className="text-zinc-400 font-mono">+{weaponBonus} ({selectedWeapon.damage})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
