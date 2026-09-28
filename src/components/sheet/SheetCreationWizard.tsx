'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateDerivedStats,
  calculateT20PointBuyCost,
  calculateTRPGPointBuyCost,
  T20_CLASS_CONSTANTS,
  T20_SKILLS,
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

// Canonical Races with Modifiers
const RACES = [
  {
    name: 'Humano',
    description: '+1 em três atributos diferentes à escolha. Duas perícias treinadas extras.',
    modsT20: { FOR: 1, DES: 1, CON: 1, INT: 0, SAB: 0, CAR: 0 },
    modsTRPG: { FOR: 2, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    speed: 9,
  },
  {
    name: 'Anão',
    description: 'Conhecimento das rochas, devagar e sempre, tradição de Heredrimm.',
    modsT20: { FOR: 0, DES: -1, CON: 2, INT: 0, SAB: 1, CAR: 0 },
    modsTRPG: { FOR: 0, DES: -2, CON: 4, INT: 0, SAB: 2, CAR: 0 },
    speed: 6,
  },
  {
    name: 'Elfo',
    description: 'Sentidos aguçados, herança mágica, deslocamento veloz.',
    modsT20: { FOR: 0, DES: 1, CON: -1, INT: 2, SAB: 0, CAR: 0 },
    modsTRPG: { FOR: 0, DES: 2, CON: -2, INT: 2, SAB: 0, CAR: 0 },
    speed: 12,
  },
  {
    name: 'Qareen',
    description: 'Desejos sobrenaturais, resistência elemental.',
    modsT20: { FOR: 0, DES: 0, CON: 0, INT: 1, SAB: -1, CAR: 2 },
    modsTRPG: { FOR: 0, DES: 0, CON: 0, INT: 2, SAB: -2, CAR: 4 },
    speed: 9,
  },
  {
    name: 'Lefou',
    description: 'Cria da Tormenta, deformidade aberrante e visão no escuro.',
    modsT20: { FOR: 1, DES: 1, CON: 1, INT: 0, SAB: 0, CAR: -1 },
    modsTRPG: { FOR: 2, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: -2 },
    speed: 9,
  },
  {
    name: 'Goblin',
    description: 'Engenhoso, furtivo, rato de esgoto e tamanho pequeno.',
    modsT20: { FOR: 0, DES: 2, CON: 0, INT: 1, SAB: 0, CAR: -1 },
    modsTRPG: { FOR: -2, DES: 4, CON: 2, INT: 0, SAB: 0, CAR: -2 },
    speed: 9,
  },
  {
    name: 'Minotauro',
    description: 'Chifres intimidadores, faro aguçado e medo de altura.',
    modsT20: { FOR: 2, DES: -1, CON: 1, INT: 0, SAB: 0, CAR: 0 },
    modsTRPG: { FOR: 4, DES: -2, CON: 2, INT: 0, SAB: 0, CAR: 0 },
    speed: 9,
  },
];

// Classes available
const CLASSES = [
  {
    name: 'Guerreiro',
    mandatory: ['luta', 'fortitude'],
    selectable: ['adestramento', 'atletismo', 'cavalgar', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'pontaria', 'reflexos'],
    picks: 2,
    armorProf: 'Armaduras Pesadas e Escudos',
  },
  {
    name: 'Arcanista',
    mandatory: ['misticismo', 'vontade'],
    selectable: ['conhecimento', 'iniciativa', 'percepcao', 'oficio', 'nobreza'],
    picks: 2,
    armorProf: 'Nenhuma',
  },
  {
    name: 'Ladino',
    mandatory: ['ladinagem', 'reflexos'],
    selectable: ['acrobacia', 'atletismo', 'atuacao', 'cavalgar', 'diplomacia', 'enganacao', 'furtividade', 'iniciativa', 'intimidacao', 'intuicao', 'investigacao', 'jogatina', 'luta', 'oficio', 'percepcao', 'pilotagem', 'pontaria'],
    picks: 4,
    armorProf: 'Armaduras Leves',
  },
  {
    name: 'Clérigo',
    mandatory: ['religiao', 'vontade'],
    selectable: ['conhecimento', 'cura', 'diplomacia', 'fortitude', 'iniciativa', 'intuicao', 'luta', 'misticismo', 'nobreza', 'oficio', 'percepcao'],
    picks: 2,
    armorProf: 'Armaduras Pesadas e Escudos',
  },
  {
    name: 'Paladino',
    mandatory: ['luta', 'vontade'],
    selectable: ['adestramento', 'atletismo', 'cavalgar', 'cura', 'diplomacia', 'fortitude', 'iniciativa', 'intuicao', 'nobreza', 'percepcao', 'religiao'],
    picks: 2,
    armorProf: 'Armaduras Pesadas e Escudos',
  },
  {
    name: 'Bárbaro',
    mandatory: ['luta', 'fortitude'],
    selectable: ['adestramento', 'atletismo', 'cavalgar', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'pontaria', 'sobrevivencia'],
    picks: 4,
    armorProf: 'Armaduras Leves e Escudos',
  },
  {
    name: 'Bardo',
    mandatory: ['atuacao', 'reflexos'],
    selectable: ['acrobacia', 'cavalgar', 'conhecimento', 'diplomacia', 'enganacao', 'furtividade', 'iniciativa', 'intuicao', 'investigacao', 'jogatina', 'ladinagem', 'luta', 'misticismo', 'nobreza', 'percepcao', 'pontaria', 'vontade'],
    picks: 6,
    armorProf: 'Armaduras Leves',
  },
];

// Presets
const WEAPONS_PRESET = [
  { name: 'Espada Longa', damage: '1d8', damageType: 'Corte', threatRange: 19, critMultiplier: 2, weight: 1 },
  { name: 'Machado de Batalha', damage: '1d8', damageType: 'Corte', threatRange: 20, critMultiplier: 3, weight: 1 },
  { name: 'Arco Curto', damage: '1d6', damageType: 'Perfuração', threatRange: 20, critMultiplier: 3, weight: 1, ranged: true },
  { name: 'Adaga', damage: '1d4', damageType: 'Perfuração', threatRange: 19, critMultiplier: 2, weight: 1 },
  { name: 'Espada Grande', damage: '2d6', damageType: 'Corte', threatRange: 19, critMultiplier: 2, weight: 2 },
];

const ARMORS_PRESET = [
  { name: 'Nenhuma', bonus: 0, penalty: 0, heavy: false, weight: 0 },
  { name: 'Armadura de Couro', bonus: 2, penalty: 0, heavy: false, weight: 2 },
  { name: 'Couro Batido', bonus: 3, penalty: -1, heavy: false, weight: 2 },
  { name: 'Brunea', bonus: 5, penalty: -2, heavy: false, weight: 2 },
  { name: 'Cota de Malha', bonus: 6, penalty: -2, heavy: true, weight: 2 },
  { name: 'Armadura Completa', bonus: 8, penalty: -5, heavy: true, weight: 5 },
];

const SHIELDS_PRESET = [
  { name: 'Nenhum', bonus: 0, penalty: 0, weight: 0 },
  { name: 'Escudo Leve', bonus: 1, penalty: -1, weight: 1 },
  { name: 'Escudo Pesado', bonus: 2, penalty: -2, weight: 1 },
];

export const SheetCreationWizard: React.FC<SheetCreationWizardProps> = ({
  onSave,
  onCancel,
  initialSystem = 'T20',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8; // Step 1: Identidade, Step 2: Raça, Step 3: Classe, Step 4: Atributos, Step 5: Perícias, Step 6: Magias & Poderes, Step 7: Equipamento, Step 8: Revisão

  // Step 1: System & Identity
  const [isNpc, setIsNpc] = useState(false);
  const [system, setSystem] = useState<SystemMode>(initialSystem);
  const [name, setName] = useState('');
  const [deity, setDeity] = useState('Valkaria');
  const [alignment, setAlignment] = useState('Neutro e Bom');
  const [threatRole, setThreatRole] = useState<'Lacaio' | 'Solo' | 'Chefe'>('Solo');
  const [threatNd, setThreatNd] = useState('1');

  // Step 2: Race
  const [selectedRace, setSelectedRace] = useState(RACES[0]);

  // Step 3: Class & Level
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [level, setLevel] = useState(1);

  // Step 4: Attributes & Point Buy
  const [baseAttrs, setBaseAttrs] = useState<AttributeBlock>(
    system === 'T20'
      ? { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 1, CAR: -1 }
      : { FOR: 16, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 8 }
  );

  // Step 5: Skills
  const [trainedSkills, setTrainedSkills] = useState<string[]>([
    'luta',
    'fortitude',
    'atletismo',
    'iniciativa',
  ]);

  // Step 6: Spells & Powers (Pulled from API)
  const [compendiumItems, setCompendiumItems] = useState<CompendiumApiItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [selectedSpells, setSelectedSpells] = useState<Array<{ name: string; circle?: number; costPM?: number; description?: string }>>([]);
  const [selectedPowers, setSelectedPowers] = useState<Array<{ name: string; costPM?: number; description?: string }>>([]);

  // Step 7: Equipment
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS_PRESET[0]);
  const [selectedArmor, setSelectedArmor] = useState(ARMORS_PRESET[4]);
  const [selectedShield, setSelectedShield] = useState(SHIELDS_PRESET[2]);

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
        console.error('Erro ao buscar itens do compêndio para o criador:', e);
      } finally {
        setIsLoadingApi(false);
      }
    }
    fetchCompendiumData();
  }, [system]);

  // Sync attributes format when system changes
  const handleSystemSwitch = (newSys: SystemMode) => {
    setSystem(newSys);
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

  // Toggle skill selection
  const handleToggleSkill = (skillKey: string) => {
    if (selectedClass.mandatory.includes(skillKey)) return;
    setTrainedSkills((prev) =>
      prev.includes(skillKey) ? prev.filter((s) => s !== skillKey) : [...prev, skillKey]
    );
  };

  // Toggle Spell selection from API
  const handleToggleSpell = (item: CompendiumApiItem) => {
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
      notes: isNpc ? `Ameaça de Tormenta ND ${threatNd} - Papel: ${threatRole}` : 'Personagem criado pelo Construtor Multistep.',
    };

    onSave(createdData);
  };

  // Filtered compendium spells & powers
  const availableSpells = compendiumItems.filter((i) => i.type === 'SPELL');
  const availablePowers = compendiumItems.filter((i) => i.type === 'POWER' || i.type === 'TALENT');

  return (
    <Card variant="tabletop" className="max-w-4xl mx-auto border-zinc-800 shadow-xl overflow-hidden bg-zinc-950">
      {/* Header & Steps Breadcrumb */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-sans font-bold text-zinc-100">
                Criador Multistep — {isNpc ? 'Ameaça / Monstro' : 'Personagem Jogador'}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Passo {currentStep} de {totalSteps}:{' '}
              {currentStep === 1 && 'Identidade'}
              {currentStep === 2 && 'Raça & Linhagem'}
              {currentStep === 3 && 'Classe & Nível'}
              {currentStep === 4 && 'Atributos & Modificadores'}
              {currentStep === 5 && 'Perícias Treinadas'}
              {currentStep === 6 && 'Magias & Poderes (Compêndio)'}
              {currentStep === 7 && 'Equipamento & Defesa'}
              {currentStep === 8 && 'Revisão Final'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={system === 'T20' ? 'arton' : 'mana'}>
              {system === 'T20' ? 'Tormenta 20' : 'TRPG Clássico'}
            </Badge>
            <Button size="sm" variant="ghost" onClick={onCancel} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-between mt-4 max-w-full overflow-x-auto gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <button
                key={stepNum}
                onClick={() => setCurrentStep(stepNum)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all',
                  isCurrent
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : isDone
                    ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700'
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-400'
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{stepNum}</span>}
                <span className="hidden sm:inline">
                  {stepNum === 1 && 'Identidade'}
                  {stepNum === 2 && 'Raça'}
                  {stepNum === 3 && 'Classe'}
                  {stepNum === 4 && 'Atributos'}
                  {stepNum === 5 && 'Perícias'}
                  {stepNum === 6 && 'Magias'}
                  {stepNum === 7 && 'Equipamento'}
                  {stepNum === 8 && 'Revisão'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="p-6">
        {/* ================= STEP 1: SISTEMA & IDENTIDADE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PC vs NPC */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-200">Tipo de Ficha</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNpc(false)}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-1 text-xs font-bold transition-all',
                      !isNpc
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    <User className="w-5 h-5 text-amber-400" />
                    <span>Personagem (PC)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNpc(true)}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col items-center gap-1 text-xs font-bold transition-all',
                      isNpc
                        ? 'bg-red-500/10 border-red-500 text-red-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    <Skull className="w-5 h-5 text-red-400" />
                    <span>Ameaça / Monstro</span>
                  </button>
                </div>
              </div>

              {/* System Switch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-200">Sistema de Regras</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSystemSwitch('T20')}
                    className={cn(
                      'p-3 rounded-lg border text-left text-xs font-bold transition-all',
                      system === 'T20'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    <div className="font-bold">Tormenta 20</div>
                    <div className="text-[10px] font-sans text-zinc-400 font-normal">
                      Modificadores diretos, PM universal, defesas sem 1/2 nível.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSystemSwitch('TRPG')}
                    className={cn(
                      'p-3 rounded-lg border text-left text-xs font-bold transition-all',
                      system === 'TRPG'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    <div className="font-bold">TRPG Clássico</div>
                    <div className="text-[10px] font-sans text-zinc-400 font-normal">
                      Atributos 3-18, BBA, graduações de perícia, CA com 1/2 nível.
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Name, Deity, Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-300">
                  Nome {isNpc ? 'da Ameaça' : 'do Personagem'} *
                </label>
                <input
                  type="text"
                  placeholder={isNpc ? 'Ex: Bugbear Espreitador' : 'Ex: Valeros de Valkaria'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {!isNpc ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Divindade Padroeira</label>
                  <select
                    value={deity}
                    onChange={(e) => setDeity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Valkaria">Valkaria (Ambição & Liberdade)</option>
                    <option value="Khalmyr">Khalmyr (Justiça & Ordem)</option>
                    <option value="Wynna">Wynna (Magia)</option>
                    <option value="Arsenal">Arsenal (Guerra)</option>
                    <option value="Marah">Marah (Paz)</option>
                    <option value="Tanna-Toh">Tanna-Toh (Conhecimento)</option>
                    <option value="Thyatis">Thyatis (Ressurreição & Profecia)</option>
                    <option value="Nenhum">Devoto de Nenhum Deus</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Nível de Desafio (ND)</label>
                  <select
                    value={threatNd}
                    onChange={(e) => setThreatNd(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="1/4">ND 1/4</option>
                    <option value="1/2">ND 1/2</option>
                    <option value="1">ND 1</option>
                    <option value="2">ND 2</option>
                    <option value="3">ND 3</option>
                    <option value="5">ND 5</option>
                    <option value="10">ND 10</option>
                    <option value="20">ND 20 (S+)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 2: RAÇA & ORIGEM ================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Escolha a raça do personagem. Os bônus raciais são aplicados automaticamente aos atributos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {RACES.map((race) => {
                const isSelected = selectedRace.name === race.name;
                const mods = system === 'T20' ? race.modsT20 : race.modsTRPG;
                return (
                  <button
                    key={race.name}
                    type="button"
                    onClick={() => setSelectedRace(race)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all flex flex-col justify-between',
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-100 text-sm">{race.name}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {race.speed}m
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{race.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800 flex flex-wrap gap-1">
                      {Object.entries(mods).map(([attr, val]) => {
                        if (val === 0) return null;
                        return (
                          <span
                            key={attr}
                            className={cn(
                              'text-[10px] font-mono px-1.5 py-0.5 rounded',
                              val > 0
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-950/60 text-red-300 border border-red-500/30'
                            )}
                          >
                            {attr} {val > 0 ? `+${val}` : val}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: CLASSE & NÍVEL ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Nível do Personagem:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLevel(Math.max(1, level - 1))}
                  disabled={level <= 1}
                  className="px-2 py-0.5"
                >
                  -1
                </Button>
                <span className="text-base font-bold font-mono text-amber-400 w-8 text-center">{level}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLevel(Math.min(20, level + 1))}
                  disabled={level >= 20}
                  className="px-2 py-0.5"
                >
                  +1
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CLASSES.map((cls) => {
                const isSelected = selectedClass.name === cls.name;
                const normalized = cls.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const classData = T20_CLASS_CONSTANTS[normalized] || { basePv: 16, basePm: 3, keyAttr: 'FOR' };
                return (
                  <button
                    key={cls.name}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls);
                      setTrainedSkills((prev) => Array.from(new Set([...cls.mandatory, ...prev.slice(0, 2)])));
                    }}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all flex flex-col justify-between',
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-100 text-sm">{cls.name}</span>
                        <Badge variant="gold" className="text-[9px]">
                          {classData.keyAttr}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-zinc-300 font-mono">
                        <span className="text-red-400">PV: {classData.basePv} + CON</span>
                        <span className="text-blue-400">PM: {classData.basePm}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
                      Proficiências: {cls.armorProf}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: DISTRIBUIÇÃO DE ATRIBUTOS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-zinc-100 text-base">Atributos Base</h3>
                <p className="text-xs text-zinc-400">
                  {system === 'T20'
                    ? 'Em Tormenta 20, você compra diretamente os modificadores (-1 a +4).'
                    : 'Em TRPG, os atributos começam em 8 e variam até 18.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Pontos:</span>
                <Badge variant={isBudgetValid ? 'gold' : 'arton'} className="font-mono text-xs">
                  {pointBuyCost} / {pointBuyBudget} pts
                </Badge>
              </div>
            </div>

            {!isBudgetValid && (
              <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-2.5 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Orçamento excedido! Você ultrapassou os {pointBuyBudget} pontos.</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AttributeKey[]).map((attr) => {
                const baseVal = baseAttrs[attr];
                const raceMods = system === 'T20' ? selectedRace.modsT20 : selectedRace.modsTRPG;
                const raceBonus = raceMods[attr] || 0;
                const finalVal = baseVal + raceBonus;
                const finalMod = getAttributeModifier(system, finalVal);

                return (
                  <Card key={attr} variant="tabletop" className="p-3 text-center border-zinc-800 bg-zinc-900">
                    <span className="text-xs font-bold text-amber-400">{attr}</span>

                    <div className="my-2">
                      <div className="text-2xl font-bold font-mono text-zinc-100">
                        {system === 'T20' ? (finalVal >= 0 ? `+${finalVal}` : finalVal) : finalVal}
                      </div>
                      {system === 'TRPG' && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Mod: {finalMod >= 0 ? `+${finalMod}` : finalMod}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBaseAttrs((prev) => ({
                            ...prev,
                            [attr]: prev[attr] - 1,
                          }));
                        }}
                        className="px-2 py-0 text-xs"
                      >
                        -
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBaseAttrs((prev) => ({
                            ...prev,
                            [attr]: prev[attr] + 1,
                          }));
                        }}
                        className="px-2 py-0 text-xs"
                      >
                        +
                      </Button>
                    </div>

                    {raceBonus !== 0 && (
                      <span className="text-[9px] text-emerald-400 block mt-1">
                        Raça {raceBonus > 0 ? `+${raceBonus}` : raceBonus}
                      </span>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 5: PERÍCIAS ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-100 text-base">Perícias Treinadas</h3>
                <p className="text-xs text-zinc-400">
                  Perícias treinadas recebem bônus progressivo do sistema Tormenta.
                </p>
              </div>
              <Badge variant="gold" className="text-xs">
                {trainedSkills.length} Treinada(s)
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {Object.entries(T20_SKILLS).map(([key, def]) => {
                const isMandatory = selectedClass.mandatory.includes(key);
                const isTrained = trainedSkills.includes(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleSkill(key)}
                    className={cn(
                      'p-2 rounded border text-left text-xs transition-all flex items-center justify-between',
                      isMandatory
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 cursor-default'
                        : isTrained
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    <div>
                      <div className="font-semibold">{def.namePt}</div>
                      <span className="text-[9px] text-zinc-500">{def.attribute}</span>
                    </div>

                    {isMandatory ? (
                      <Badge variant="gold" className="text-[8px] py-0 px-1">Obrigatória</Badge>
                    ) : isTrained ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 6: MAGIAS & PODERES DO COMPÊNDIO ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-zinc-100 text-base">Magias & Poderes de Classe</h3>
                <p className="text-xs text-zinc-400">
                  Itens carregados em tempo real da API do Compêndio Oficial de Tormenta.
                </p>
              </div>
              {isLoadingApi && (
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sincronizando API...</span>
                </div>
              )}
            </div>

            {/* Spells Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Magias Disponíveis ({selectedSpells.length} selecionada(s))
                </span>
              </div>

              {availableSpells.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableSpells.map((spell) => {
                    const isSelected = selectedSpells.some((s) => s.name === spell.name);
                    return (
                      <button
                        key={spell.id}
                        type="button"
                        onClick={() => handleToggleSpell(spell)}
                        className={cn(
                          'p-2.5 rounded border text-left text-xs transition-all flex items-start justify-between',
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        )}
                      >
                        <div>
                          <div className="font-bold text-zinc-100">{spell.name}</div>
                          <div className="text-[10px] text-zinc-400 line-clamp-1">{spell.description}</div>
                          <div className="text-[9px] text-blue-400 font-mono mt-1">
                            {spell.circle ? `${spell.circle}º Círculo` : 'Magia'} • Custo: {spell.cost || '1 PM'}
                          </div>
                        </div>

                        {isSelected ? <Check className="w-4 h-4 text-blue-400 shrink-0" /> : <Plus className="w-4 h-4 text-zinc-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
                  Nenhuma magia encontrada no compêndio para este sistema.
                </div>
              )}
            </div>

            {/* Powers Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Poderes & Habilidades ({selectedPowers.length} selecionado(s))
                </span>
              </div>

              {availablePowers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availablePowers.map((power) => {
                    const isSelected = selectedPowers.some((p) => p.name === power.name);
                    return (
                      <button
                        key={power.id}
                        type="button"
                        onClick={() => handleTogglePower(power)}
                        className={cn(
                          'p-2.5 rounded border text-left text-xs transition-all flex items-start justify-between',
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        )}
                      >
                        <div>
                          <div className="font-bold text-zinc-100">{power.name}</div>
                          <div className="text-[10px] text-zinc-400 line-clamp-1">{power.description}</div>
                        </div>

                        {isSelected ? <Check className="w-4 h-4 text-amber-400 shrink-0" /> : <Plus className="w-4 h-4 text-zinc-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
                  Nenhum poder específico retornado do compêndio.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 7: EQUIPAMENTO INICIAL ================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Weapons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400">Arma Principal</label>
                <div className="space-y-1.5">
                  {WEAPONS_PRESET.map((w) => (
                    <button
                      key={w.name}
                      type="button"
                      onClick={() => setSelectedWeapon(w)}
                      className={cn(
                        'w-full p-2.5 rounded border text-left text-xs transition-all',
                        selectedWeapon.name === w.name
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      <div className="font-bold text-zinc-100">{w.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        {w.damage} {w.damageType} (Crítico: {w.threatRange}-20/x{w.critMultiplier})
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Armors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400">Armadura</label>
                <div className="space-y-1.5">
                  {ARMORS_PRESET.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => setSelectedArmor(a)}
                      className={cn(
                        'w-full p-2.5 rounded border text-left text-xs transition-all',
                        selectedArmor.name === a.name
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      <div className="font-bold text-zinc-100">{a.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        Defesa +{a.bonus} | Pen: {a.penalty} {a.heavy ? '| Pesada' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shields */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400">Escudo</label>
                <div className="space-y-1.5">
                  {SHIELDS_PRESET.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedShield(s)}
                      className={cn(
                        'w-full p-2.5 rounded border text-left text-xs transition-all',
                        selectedShield.name === s.name
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      <div className="font-bold text-zinc-100">{s.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        Defesa +{s.bonus} | Pen: {s.penalty}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Encumbrance & Defense summary preview */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 block font-sans">Defesa Calculada</span>
                <span className="text-xl font-bold text-amber-400">{derivedPreview.defense}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-sans">Penalidade</span>
                <span className="text-xl font-bold text-red-400">
                  {derivedPreview.armorPenalty > 0 ? `-${derivedPreview.armorPenalty}` : '0'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-sans">Carga</span>
                <span className="text-xl font-bold text-zinc-100">
                  {totalWeightSlots} / {derivedPreview.carryCapacity} slots
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 8: REVISÃO FINAL ================= */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">
                    {name.trim() || (isNpc ? `Ameaça ND ${threatNd}` : 'Herói de Arton')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {selectedRace.name} • {selectedClass.name} Nível {level} ({system})
                  </p>
                </div>
                <Badge variant={system === 'T20' ? 'arton' : 'mana'}>{system}</Badge>
              </div>

              {/* Core Combat Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <span className="text-xs text-red-400 font-bold">Pontos de Vida</span>
                  <div className="text-2xl font-bold text-red-200 font-mono">{derivedPreview.pvMax}</div>
                </div>

                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                  <span className="text-xs text-blue-400 font-bold">Pontos de Mana</span>
                  <div className="text-2xl font-bold text-blue-200 font-mono">{derivedPreview.pmMax}</div>
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                  <span className="text-xs text-amber-400 font-bold">Defesa</span>
                  <div className="text-2xl font-bold text-amber-200 font-mono">{derivedPreview.defense}</div>
                </div>

                <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <span className="text-xs text-zinc-300 font-bold">Ataque {selectedWeapon.name}</span>
                  <div className="text-2xl font-bold text-zinc-100 font-mono">
                    {weaponBonus >= 0 ? `+${weaponBonus}` : weaponBonus}
                  </div>
                </div>
              </div>

              {/* Attributes Snapshot */}
              <div className="grid grid-cols-6 gap-2 text-center pt-2">
                {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AttributeKey[]).map((a) => (
                  <div key={a} className="p-1.5 bg-zinc-950 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">{a}</span>
                    <span className="text-sm font-bold font-mono text-amber-400">
                      {finalAttrs[a] >= 0 ? `+${finalAttrs[a]}` : finalAttrs[a]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="gold"
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              className="flex items-center gap-1 text-xs font-semibold"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              onClick={handleFinalize}
              className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950"
            >
              <Check className="w-4 h-4" />
              Concluir & Salvar Personagem
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
