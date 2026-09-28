'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDice } from '@/components/dice/DiceContext';
import { CombatTrackers } from './CombatTrackers';
import {
  calculateDerivedStats,
  T20_SKILLS,
  getAttributeModifier,
  calculateConditionsDefenseModifier,
  calculateConditionsSkillModifier,
  calculateConditionsAttackModifier,
  canSpendPM,
  RestQuality,
  calculateRestRecovery
} from '@/lib/rules';
import { SystemMode, AttributeKey, AttributeBlock, BaseSheet } from '@/lib/types';
import {
  Shield,
  Heart,
  Zap,
  Sword,
  Dices,
  Sparkles,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Edit2,
  Check,
  X,
  Package,
  BookOpen,
  Backpack,
  AlertTriangle,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CharacterSheetViewProps {
  initialCharacter: {
    id: string;
    name: string;
    system: string;
    race: string;
    class: string;
    level: number;
    alignment?: string | null;
    deity?: string | null;
    avatarUrl?: string | null;
    pvCurrent: number;
    pvMax: number;
    pvTemp: number;
    pmCurrent: number;
    pmMax: number;
    defense: number;
    attributesJson: string;
    skillsJson: string;
    attacksJson: string;
    spellsJson: string;
    powersJson: string;
    inventoryJson: string;
    notes?: string | null;
    isNpc?: boolean;
  };
  onSave?: (char: any) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  initialCharacter,
  onSave,
  onDelete,
}) => {
  const { roll } = useDice();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse initial payloads
  const parseJsonSafe = <T,>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  // Mutable state
  const [name, setName] = useState(initialCharacter.name);
  const [system, setSystem] = useState<SystemMode>(
    initialCharacter.system === 'TRPG' ? 'TRPG' : 'T20'
  );
  const [level, setLevel] = useState(initialCharacter.level || 1);
  const [race, setRace] = useState(initialCharacter.race);
  const [characterClass, setCharacterClass] = useState(initialCharacter.class);
  const [deity, setDeity] = useState(initialCharacter.deity || 'Valkaria');
  const [alignment, setAlignment] = useState(initialCharacter.alignment || '');
  const [notes, setNotes] = useState(initialCharacter.notes || '');

  // Attributes
  const [attributes, setAttributes] = useState<AttributeBlock>(() => {
    const parsed = parseJsonSafe<AttributeBlock>(
      initialCharacter.attributesJson,
      initialCharacter.system === 'T20'
        ? { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 1, CAR: -1 }
        : { FOR: 16, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 8 }
    );
    return parsed;
  });

  // Trained skills
  const [trainedSkills, setTrainedSkills] = useState<string[]>(() => {
    const parsed = parseJsonSafe<any>(initialCharacter.skillsJson, []);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.keys(parsed).filter((k) => parsed[k]?.trained);
    }
    return ['luta', 'fortitude', 'atletismo', 'iniciativa'];
  });

  // Resource Pools
  const [pvCurrent, setPvCurrent] = useState(initialCharacter.pvCurrent);
  const [pvTemp, setPvTemp] = useState(initialCharacter.pvTemp || 0);
  const [pmCurrent, setPmCurrent] = useState(initialCharacter.pmCurrent);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);

  // Attacks
  const [attacks, setAttacks] = useState<
    Array<{
      name: string;
      bonus: number;
      damage: string;
      damageType?: string;
      threatRange?: number;
      critMultiplier?: number;
    }>
  >(() => {
    return parseJsonSafe(initialCharacter.attacksJson, [
      {
        name: 'Espada Longa',
        bonus: 5,
        damage: '1d8+3',
        damageType: 'Corte',
        threatRange: 19,
        critMultiplier: 2,
      },
    ]);
  });

  // Spells
  const [spells, setSpells] = useState<
    Array<{
      name: string;
      circle?: number;
      costPM?: number;
      description?: string;
      damageFormula?: string;
    }>
  >(() => {
    return parseJsonSafe(initialCharacter.spellsJson, []);
  });

  // Powers
  const [powers, setPowers] = useState<
    Array<{
      name: string;
      costPM?: number;
      description?: string;
    }>
  >(() => {
    return parseJsonSafe(initialCharacter.powersJson, []);
  });

  // Inventory
  const [inventory, setInventory] = useState<
    Array<{
      name: string;
      weightSlots?: number;
      weightKg?: number;
      quantity: number;
      equipped?: boolean;
      defenseBonus?: number;
      armorPenalty?: number;
      isHeavy?: boolean;
    }>
  >(() => {
    return parseJsonSafe(initialCharacter.inventoryJson, [
      { name: 'Espada Longa', weightSlots: 1, quantity: 1, equipped: true },
      { name: 'Cota de Malha', weightSlots: 2, quantity: 1, equipped: true, defenseBonus: 6, armorPenalty: -2, isHeavy: true },
      { name: 'Escudo Pesado', weightSlots: 1, quantity: 1, equipped: true, defenseBonus: 2, armorPenalty: -2 },
    ]);
  });

  // Roll Mode State (Normal, Advantage, Disadvantage)
  const [rollMode, setRollMode] = useState<'normal' | 'kh1' | 'kl1'>('normal');
  const [skillFilter, setSkillFilter] = useState<'all' | 'trained' | 'physical'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Compute equipped armor and shield stats
  const armorStats = useMemo(() => {
    let armorBonus = 0;
    let shieldBonus = 0;
    let isHeavyArmor = false;
    let armorPenalty = 0;
    let shieldPenalty = 0;

    for (const item of inventory) {
      if (!item.equipped) continue;
      if (item.name.toLowerCase().includes('escudo')) {
        shieldBonus += item.defenseBonus || 0;
        shieldPenalty += Math.abs(item.armorPenalty || 0);
      } else if (item.defenseBonus) {
        armorBonus += item.defenseBonus;
        armorPenalty += Math.abs(item.armorPenalty || 0);
        if (item.isHeavy) isHeavyArmor = true;
      }
    }

    return { armorBonus, shieldBonus, isHeavyArmor, armorPenalty, shieldPenalty };
  }, [inventory]);

  // Total inventory weight
  const totalInventorySlots = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.weightSlots || 0) * (item.quantity || 1), 0);
  }, [inventory]);

  // Reactive Derived Calculation (DAG)
  const derived = useMemo(() => {
    const sheet: BaseSheet = {
      name,
      system,
      level,
      race,
      class: characterClass,
      attributes,
      trainedSkills,
      armorBonus: armorStats.armorBonus,
      shieldBonus: armorStats.shieldBonus,
      isHeavyArmor: armorStats.isHeavyArmor,
      armorPenalty: armorStats.armorPenalty,
      shieldPenalty: armorStats.shieldPenalty,
      inventoryWeightSlots: totalInventorySlots,
    };
    return calculateDerivedStats(sheet);
  }, [
    name,
    system,
    level,
    race,
    characterClass,
    attributes,
    trainedSkills,
    armorStats,
    totalInventorySlots,
  ]);

  // Active conditions impacts
  const netConditionDef = calculateConditionsDefenseModifier(activeConditions);
  const finalDefense = Math.max(0, derived.defense + netConditionDef);

  // Toggling condition
  const handleToggleCondition = (conditionId: string) => {
    setActiveConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((c) => c !== conditionId)
        : [...prev, conditionId]
    );
  };

  // Toggle item equipped
  const handleToggleEquipped = (index: number) => {
    setInventory((prev) =>
      prev.map((item, i) => (i === index ? { ...item, equipped: !item.equipped } : item))
    );
  };

  // Roll Attribute
  const handleRollAttribute = (attrKey: AttributeKey) => {
    const mod = getAttributeModifier(system, attributes[attrKey]);
    const dicePrefix = rollMode === 'kh1' ? '2d20kh1' : rollMode === 'kl1' ? '2d20kl1' : '1d20';
    const sign = mod >= 0 ? `+${mod}` : `${mod}`;
    const modeLabel = rollMode === 'kh1' ? ' [Vantagem]' : rollMode === 'kl1' ? ' [Desvantagem]' : '';

    roll({
      formula: `${dicePrefix}${sign} # Teste de ${attrKey}${modeLabel} (${name})`,
      threatRange: 20,
      system,
    });
  };

  // Roll Skill
  const handleRollSkill = (skillKey: string) => {
    const skillData = derived.skills[skillKey];
    if (!skillData) return;

    const condMod = calculateConditionsSkillModifier(activeConditions, skillKey, skillData.attribute);
    const totalBonus = skillData.bonus + condMod;
    const skillName = T20_SKILLS[skillKey]?.namePt || skillKey;

    const dicePrefix = rollMode === 'kh1' ? '2d20kh1' : rollMode === 'kl1' ? '2d20kl1' : '1d20';
    const sign = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;
    const modeLabel = rollMode === 'kh1' ? ' [Vantagem]' : rollMode === 'kl1' ? ' [Desvantagem]' : '';

    roll({
      formula: `${dicePrefix}${sign} # Teste de ${skillName}${modeLabel} (${name})`,
      threatRange: 20,
      system,
    });
  };

  // Roll Attack
  const handleRollAttack = (attack: (typeof attacks)[0]) => {
    const netAtkMod = calculateConditionsAttackModifier(activeConditions, true);
    const totalBonus = attack.bonus + netAtkMod;
    const dicePrefix = rollMode === 'kh1' ? '2d20kh1' : rollMode === 'kl1' ? '2d20kl1' : '1d20';
    const sign = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;
    const modeLabel = rollMode === 'kh1' ? ' [Vantagem]' : rollMode === 'kl1' ? ' [Desvantagem]' : '';

    roll({
      formula: `${dicePrefix}${sign} # Ataque ${attack.name}${modeLabel} (${name})`,
      threatRange: attack.threatRange || 20,
      critMultiplier: attack.critMultiplier || 2,
      system,
    });
  };

  // Roll Damage
  const handleRollDamage = (attack: (typeof attacks)[0]) => {
    roll({
      formula: `${attack.damage} # Dano ${attack.name} (${name})`,
      system,
    });
  };

  // Cast Spell
  const handleCastSpell = (spell: (typeof spells)[0]) => {
    const cost = spell.costPM || 1;
    if (system === 'T20' && !canSpendPM(pmCurrent, cost, level)) {
      alert(`Não é possível lançar: custo de ${cost} PM excede o limite de nível (${level}) ou PM atual (${pmCurrent}).`);
      return;
    }
    setPmCurrent((prev) => Math.max(0, prev - cost));

    if (spell.damageFormula) {
      roll({
        formula: `${spell.damageFormula} # Magia ${spell.name} (${name})`,
        system,
        pmInvested: cost,
      });
    } else {
      roll({
        formula: `1d20 # Conjuração ${spell.name} (${name})`,
        system,
        pmInvested: cost,
      });
    }
  };

  // Apply Rest
  const handleApplyRest = (quality: RestQuality) => {
    const recovery = calculateRestRecovery(level, quality, derived.pvMax, derived.pmMax);
    setPvCurrent((prev) => Math.min(derived.pvMax, prev + recovery.recoveredPv));
    setPmCurrent((prev) => Math.min(derived.pmMax, prev + recovery.recoveredPm));
  };

  // Save changes to database
  const handleSaveSheet = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        name,
        system,
        race,
        class: characterClass,
        level,
        alignment,
        deity,
        attributes,
        trainedSkills,
        pvCurrent,
        pvMax: derived.pvMax,
        pvTemp,
        pmCurrent,
        pmMax: derived.pmMax,
        defense: finalDefense,
        attacks,
        spells,
        powers,
        inventory,
        notes,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const res = await fetch(`/api/characters/${initialCharacter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Falha ao salvar ficha no servidor.');
      }

      setSaveMessage('Ficha salva com sucesso!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const sheetData = {
      name,
      system,
      race,
      class: characterClass,
      level,
      alignment,
      deity,
      attributes,
      trainedSkills,
      pvCurrent,
      pvMax: derived.pvMax,
      pvTemp,
      pmCurrent,
      pmMax: derived.pmMax,
      defense: finalDefense,
      attacks,
      spells,
      powers,
      inventory,
      conditions: activeConditions,
      notes,
    };

    const blob = new Blob([JSON.stringify(sheetData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.toLowerCase().replace(/\s+/g, '_')}_ficha.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.name) setName(data.name);
        if (data.system) setSystem(data.system);
        if (data.race) setRace(data.race);
        if (data.class) setCharacterClass(data.class);
        if (data.level) setLevel(data.level);
        if (data.alignment) setAlignment(data.alignment);
        if (data.deity) setDeity(data.deity);
        if (data.attributes) setAttributes(data.attributes);
        if (data.trainedSkills) setTrainedSkills(data.trainedSkills);
        if (data.pvCurrent !== undefined) setPvCurrent(data.pvCurrent);
        if (data.pvTemp !== undefined) setPvTemp(data.pvTemp);
        if (data.pmCurrent !== undefined) setPmCurrent(data.pmCurrent);
        if (data.attacks) setAttacks(data.attacks);
        if (data.spells) setSpells(data.spells);
        if (data.powers) setPowers(data.powers);
        if (data.inventory) setInventory(data.inventory);
        if (data.conditions) setActiveConditions(data.conditions);
        if (data.notes) setNotes(data.notes);
        alert('Ficha importada com sucesso!');
      } catch (err) {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  // Filter skills
  const visibleSkills = useMemo(() => {
    return Object.entries(T20_SKILLS).filter(([key, def]) => {
      if (skillFilter === 'trained') return trainedSkills.includes(key);
      if (skillFilter === 'physical') return def.attribute === 'FOR' || def.attribute === 'DES' || def.attribute === 'CON';
      return true;
    });
  }, [skillFilter, trainedSkills]);

  return (
    <div className="space-y-6">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Header Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/80 p-4 rounded-lg border border-amber-500/20">
        <div className="flex items-center gap-3">
          <Badge variant={system === 'T20' ? 'arton' : 'mana'}>
            {system === 'T20' ? 'Tormenta 20' : 'TRPG Clássico'}
          </Badge>

          {/* Roll Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded p-0.5">
            <button
              onClick={() => setRollMode('normal')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
                rollMode === 'normal' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Normal (1d20)
            </button>
            <button
              onClick={() => setRollMode('kh1')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
                rollMode === 'kh1' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Vantagem (2d20)
            </button>
            <button
              onClick={() => setRollMode('kl1')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-semibold transition-colors',
                rollMode === 'kl1' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Desvantagem
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveMessage && (
            <span
              className={cn(
                'text-xs font-semibold px-2 py-1 rounded border',
                saveMessage.startsWith('Erro')
                  ? 'bg-red-950 border-red-500 text-red-300'
                  : 'bg-emerald-950 border-emerald-500 text-emerald-300'
              )}
            >
              {saveMessage}
            </span>
          )}

          <Button
            size="sm"
            variant="gold"
            onClick={handleSaveSheet}
            disabled={isSaving}
            className="flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Ficha'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 text-amber-300 border-amber-500/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar JSON</span>
          </Button>

          {onDelete && (
            <Button
              size="sm"
              variant="arton"
              onClick={() => {
                if (confirm(`Deseja realmente remover o personagem "${name}"?`)) {
                  onDelete(initialCharacter.id);
                }
              }}
              className="px-2"
              title="Excluir Personagem"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Sheet Card */}
      <Card variant="tabletop" className="p-6 border-amber-500/30 shadow-2xl space-y-6">
        {/* Header: Name, Race, Class, Level */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl sm:text-3xl font-serif font-black text-amber-100 bg-transparent border-b border-transparent hover:border-amber-500/40 focus:border-amber-400 focus:outline-none transition-colors"
                title="Clique para editar o nome"
              />
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{race}</span>
              <span>•</span>
              <span>{characterClass}</span>
              <span>•</span>
              <span className="text-amber-300">{deity ? `Devoto de ${deity}` : 'Sem Divindade'}</span>
              {alignment && (
                <>
                  <span>•</span>
                  <span>{alignment}</span>
                </>
              )}
            </div>
          </div>

          {/* Level Stepper */}
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-xs font-serif font-bold text-slate-300">Nível</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLevel(Math.max(1, level - 1))}
                disabled={level <= 1}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 text-xs font-bold"
              >
                -
              </button>
              <span className="text-lg font-black font-mono text-amber-200 w-8 text-center">{level}</span>
              <button
                onClick={() => setLevel(Math.min(20, level + 1))}
                disabled={level >= 20}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Combat Trackers (PV, Temp PV, PM, Conditions) */}
        <CombatTrackers
          system={system}
          characterLevel={level}
          conScoreOrMod={attributes.CON}
          pvCurrent={pvCurrent}
          pvMax={derived.pvMax}
          pvTemp={pvTemp}
          pmCurrent={pmCurrent}
          pmMax={derived.pmMax}
          activeConditions={activeConditions}
          onUpdatePv={(newPv, newTemp) => {
            setPvCurrent(newPv);
            setPvTemp(newTemp);
          }}
          onUpdatePm={(newPm) => setPmCurrent(newPm)}
          onToggleCondition={handleToggleCondition}
          onApplyRest={handleApplyRest}
        />

        {/* Core Attributes & Defense Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Attributes Grid (Cols 1-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-1.5">
              <Dices className="w-4 h-4 text-amber-400" />
              Atributos (Clique para Rolar Teste)
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AttributeKey[]).map((attr) => {
                const val = attributes[attr];
                const mod = getAttributeModifier(system, val);

                return (
                  <button
                    key={attr}
                    type="button"
                    onClick={() => handleRollAttribute(attr)}
                    className="group p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-400/60 text-center transition-all hover:shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                    title={`Rolar teste de ${attr}`}
                  >
                    <span className="text-xs font-serif font-bold text-amber-300 block">{attr}</span>
                    <div className="my-1.5">
                      <span className="text-2xl font-black font-mono text-amber-100 group-hover:text-amber-300">
                        {mod >= 0 ? `+${mod}` : mod}
                      </span>
                    </div>
                    {system === 'TRPG' && (
                      <span className="text-[10px] text-slate-400 font-mono block">Valor: {val}</span>
                    )}
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1 group-hover:text-amber-400">
                      Rolar
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Defense & Encumbrance Summary (Col 4) */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Defesa & Carga
            </h3>

            <Card variant="tabletop" className="p-4 space-y-3 border-slate-800">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-xs text-slate-300">Defesa Total</span>
                <span className="text-2xl font-black font-mono text-amber-200">{finalDefense}</span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Base:</span>
                  <span>10</span>
                </div>
                <div className="flex justify-between">
                  <span>DES efetivo:</span>
                  <span>{armorStats.isHeavyArmor && system === 'T20' ? '0 (Pesada)' : getAttributeModifier(system, attributes.DES)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Armadura / Escudo:</span>
                  <span>+{armorStats.armorBonus + armorStats.shieldBonus}</span>
                </div>
                {netConditionDef !== 0 && (
                  <div className="flex justify-between text-red-300">
                    <span>Condições:</span>
                    <span>{netConditionDef > 0 ? `+${netConditionDef}` : netConditionDef}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Penalidade Armadura:</span>
                  <span className="font-mono font-bold text-red-300">
                    {derived.armorPenalty > 0 ? `-${derived.armorPenalty}` : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Carga:</span>
                  <span className="font-mono text-slate-200">
                    {totalInventorySlots} / {derived.carryCapacity} slots
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Combat Attacks Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-1.5">
              <Sword className="w-4 h-4 text-amber-400" />
              Ataques & Armas
            </h3>
            <span className="text-xs text-slate-400">Clique para rolar ataque ou dano</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attacks.map((atk, index) => {
              const netAtkMod = calculateConditionsAttackModifier(activeConditions, true);
              const totalAtk = atk.bonus + netAtkMod;

              return (
                <Card
                  key={index}
                  variant="tabletop"
                  className="p-3.5 border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-amber-100 text-sm">{atk.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Dano: {atk.damage} ({atk.damageType || 'Corte'}) | Crítico: {atk.threatRange || 20}-20/x{atk.critMultiplier || 2}
                      </p>
                    </div>

                    <Badge variant="gold" className="font-mono text-xs">
                      {totalAtk >= 0 ? `+${totalAtk}` : totalAtk}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => handleRollAttack(atk)}
                      className="flex-1 text-xs py-1 flex items-center justify-center gap-1.5"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Rolar Ataque</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="arton"
                      onClick={() => handleRollDamage(atk)}
                      className="flex-1 text-xs py-1 flex items-center justify-center gap-1.5"
                    >
                      <Sword className="w-3.5 h-3.5" />
                      <span>Rolar Dano</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Skills Section with Training and Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Perícias ({trainedSkills.length} Treinadas)
            </h3>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setSkillFilter('all')}
                className={cn(
                  'px-2 py-0.5 rounded transition-colors',
                  skillFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                Todas
              </button>
              <button
                onClick={() => setSkillFilter('trained')}
                className={cn(
                  'px-2 py-0.5 rounded transition-colors',
                  skillFilter === 'trained' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                Treinadas
              </button>
              <button
                onClick={() => setSkillFilter('physical')}
                className={cn(
                  'px-2 py-0.5 rounded transition-colors',
                  skillFilter === 'physical' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                Físicas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
            {visibleSkills.map(([skillKey, def]) => {
              const skillData = derived.skills[skillKey];
              const isTrained = trainedSkills.includes(skillKey);
              const condMod = calculateConditionsSkillModifier(activeConditions, skillKey, def.attribute);
              const totalBonus = (skillData?.bonus || 0) + condMod;

              return (
                <div
                  key={skillKey}
                  className={cn(
                    'p-2.5 rounded border transition-all flex items-center justify-between text-xs',
                    isTrained
                      ? 'bg-slate-900/80 border-amber-500/30 text-amber-100'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isTrained}
                      onChange={() => {
                        setTrainedSkills((prev) =>
                          prev.includes(skillKey) ? prev.filter((s) => s !== skillKey) : [...prev, skillKey]
                        );
                      }}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      title="Marcar como treinada"
                    />

                    <div>
                      <button
                        onClick={() => handleRollSkill(skillKey)}
                        className="font-semibold text-left hover:text-amber-300 transition-colors"
                      >
                        {def.namePt}
                      </button>
                      <span className="text-[10px] text-slate-500 block">
                        {def.attribute} {def.armorPenalty ? '• Pen. Armadura' : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRollSkill(skillKey)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-400 font-mono font-bold text-amber-200 text-xs"
                    title={`Rolar ${def.namePt}`}
                  >
                    <span>{totalBonus >= 0 ? `+${totalBonus}` : totalBonus}</span>
                    <Dices className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spells & Powers */}
        {(spells.length > 0 || powers.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            {/* Spells */}
            {spells.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Magias Conhecidas
                </h3>

                <div className="space-y-2">
                  {spells.map((spell, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-serif font-bold text-amber-100 text-xs">{spell.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {spell.circle ? `${spell.circle}º Círculo • ` : ''}Custo: {spell.costPM || 1} PM
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="mana"
                        onClick={() => handleCastSpell(spell)}
                        className="text-xs px-2.5 py-1 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Lançar</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Powers */}
            {powers.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Habilidades & Poderes
                </h3>

                <div className="space-y-2">
                  {powers.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-bold text-amber-100 text-xs">{p.name}</span>
                        {p.costPM && (
                          <Badge variant="mana" className="text-[9px] py-0">
                            {p.costPM} PM
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inventory & Equipment */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-1.5">
              <Backpack className="w-4 h-4 text-amber-400" />
              Equipamento & Inventário ({totalInventorySlots} / {derived.carryCapacity} slots)
            </h3>
            {totalInventorySlots > derived.carryCapacity && (
              <Badge variant="arton" className="text-[10px]">
                Sobrecarregado (-2 Pen. Armadura)
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {inventory.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-2.5 rounded border text-xs flex justify-between items-center transition-all',
                  item.equipped
                    ? 'bg-amber-500/10 border-amber-400/40 text-amber-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                )}
              >
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Qtd: {item.quantity} • {item.weightSlots || 0} slots
                    {item.defenseBonus ? ` • Defesa +${item.defenseBonus}` : ''}
                  </div>
                </div>

                {item.defenseBonus !== undefined ? (
                  <button
                    onClick={() => handleToggleEquipped(idx)}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-semibold border',
                      item.equipped
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    )}
                  >
                    {item.equipped ? 'Equipado' : 'Guardado'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
