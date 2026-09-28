'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SheetCreationWizard, CreatedCharacterData } from './SheetCreationWizard';
import { CharacterSheetView } from './CharacterSheetView';
import { SystemMode } from '@/lib/types';
import {
  Shield,
  UserPlus,
  Search,
  Upload,
  User,
  Skull,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InitialCharacter {
  id: string;
  name: string;
  system: string;
  race: string;
  class: string;
  level: number;
  attributesJson: string;
  pvCurrent: number;
  pvMax: number;
  pvTemp: number;
  pmCurrent: number;
  pmMax: number;
  defense: number;
  skillsJson: string;
  attacksJson: string;
  spellsJson: string;
  powersJson: string;
  inventoryJson: string;
  deity?: string | null;
  alignment?: string | null;
  avatarUrl?: string | null;
  notes?: string | null;
  isNpc?: boolean;
}

export interface CharacterSheetManagerProps {
  initialCharacters: InitialCharacter[];
}

export const CharacterSheetManager: React.FC<CharacterSheetManagerProps> = ({
  initialCharacters,
}) => {
  const [characters, setCharacters] = useState<InitialCharacter[]>(initialCharacters);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(
    initialCharacters[0]?.id || null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [filterSystem, setFilterSystem] = useState<'ALL' | 'T20' | 'TRPG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const selectedChar = characters.find((c) => c.id === selectedCharId) || null;

  // Filtered characters list
  const filteredCharacters = characters.filter((char) => {
    if (filterSystem !== 'ALL' && char.system !== filterSystem) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        char.name.toLowerCase().includes(q) ||
        char.race.toLowerCase().includes(q) ||
        char.class.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Character Created in Wizard
  const handleSaveCreated = async (created: CreatedCharacterData) => {
    try {
      const payload = {
        name: created.name,
        system: created.system,
        race: created.race,
        class: created.class,
        level: created.level,
        isNpc: created.isNpc,
        alignment: created.alignment,
        deity: created.deity,
        attributes: created.attributes,
        trainedSkills: created.trainedSkills,
        attacks: created.attacks,
        spells: created.spells,
        powers: created.powers,
        inventory: created.inventory,
        pvMax: created.pvMax,
        pvCurrent: created.pvMax,
        pvTemp: 0,
        pmMax: created.pmMax,
        pmCurrent: created.pmMax,
        defense: created.defense,
        notes: created.notes,
      };

      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Falha ao salvar personagem no servidor.');
      }

      const resJson = await res.json();
      const newChar = resJson.character;

      setCharacters((prev) => [newChar, ...prev]);
      setSelectedCharId(newChar.id);
      setIsCreating(false);
    } catch (err: any) {
      console.error(err);
      // Fallback local memory creation
      const localChar: InitialCharacter = {
        id: `local-${Date.now()}`,
        name: created.name,
        system: created.system,
        race: created.race,
        class: created.class,
        level: created.level,
        isNpc: created.isNpc,
        alignment: created.alignment,
        deity: created.deity,
        attributesJson: JSON.stringify(created.attributes),
        skillsJson: JSON.stringify(created.trainedSkills),
        attacksJson: JSON.stringify(created.attacks),
        spellsJson: JSON.stringify(created.spells),
        powersJson: JSON.stringify(created.powers),
        inventoryJson: JSON.stringify(created.inventory),
        pvCurrent: created.pvMax,
        pvMax: created.pvMax,
        pvTemp: 0,
        pmCurrent: created.pmMax,
        pmMax: created.pmMax,
        defense: created.defense,
        notes: created.notes,
      };
      setCharacters((prev) => [localChar, ...prev]);
      setSelectedCharId(localChar.id);
      setIsCreating(false);
    }
  };

  // Handle Character Delete
  const handleDeleteCharacter = async (id: string) => {
    try {
      await fetch(`/api/characters/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Erro ao deletar no servidor:', err);
    }

    setCharacters((prev) => prev.filter((c) => c.id !== id));
    if (selectedCharId === id) {
      setSelectedCharId(characters.find((c) => c.id !== id)?.id || null);
    }
  };

  // Handle Global JSON Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.name) throw new Error('Nome do personagem ausente.');

        const res = await fetch('/api/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const resJson = await res.json();
          setCharacters((prev) => [resJson.character, ...prev]);
          setSelectedCharId(resJson.character.id);
          alert(`Personagem "${data.name}" importado e salvo com sucesso!`);
        } else {
          // Add locally
          const localChar: InitialCharacter = {
            id: `imported-${Date.now()}`,
            name: data.name,
            system: data.system || 'T20',
            race: data.race || 'Humano',
            class: data.class || 'Guerreiro',
            level: data.level || 1,
            pvCurrent: data.pvCurrent || data.pvMax || 20,
            pvMax: data.pvMax || 20,
            pvTemp: data.pvTemp || 0,
            pmCurrent: data.pmCurrent || data.pmMax || 3,
            pmMax: data.pmMax || 3,
            defense: data.defense || 10,
            attributesJson: typeof data.attributes === 'object' ? JSON.stringify(data.attributes) : data.attributesJson || '{}',
            skillsJson: typeof data.trainedSkills === 'object' ? JSON.stringify(data.trainedSkills) : data.skillsJson || '[]',
            attacksJson: typeof data.attacks === 'object' ? JSON.stringify(data.attacks) : data.attacksJson || '[]',
            spellsJson: typeof data.spells === 'object' ? JSON.stringify(data.spells) : data.spellsJson || '[]',
            powersJson: typeof data.powers === 'object' ? JSON.stringify(data.powers) : data.powersJson || '[]',
            inventoryJson: typeof data.inventory === 'object' ? JSON.stringify(data.inventory) : data.inventoryJson || '[]',
            notes: data.notes || '',
          };
          setCharacters((prev) => [localChar, ...prev]);
          setSelectedCharId(localChar.id);
          alert(`Personagem "${data.name}" importado localmente!`);
        }
      } catch (err: any) {
        alert(`Erro na importação: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Creation Wizard Modal / Overlay */}
      {isCreating ? (
        <SheetCreationWizard
          onSave={handleSaveCreated}
          onCancel={() => setIsCreating(false)}
          initialSystem={filterSystem === 'TRPG' ? 'TRPG' : 'T20'}
        />
      ) : (
        <>
          {/* Top Control Bar: Selector, Filter, Search, New Character */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-950/70 p-4 rounded-lg border border-amber-500/20">
            {/* System Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFilterSystem('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all',
                  filterSystem === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                )}
              >
                Todas ({characters.length})
              </button>
              <button
                onClick={() => setFilterSystem('T20')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all flex items-center gap-1',
                  filterSystem === 'T20'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                )}
              >
                <span>T20</span>
                <span className="text-[10px] opacity-75">
                  ({characters.filter((c) => c.system === 'T20').length})
                </span>
              </button>
              <button
                onClick={() => setFilterSystem('TRPG')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all flex items-center gap-1',
                  filterSystem === 'TRPG'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                )}
              >
                <span>TRPG</span>
                <span className="text-[10px] opacity-75">
                  ({characters.filter((c) => c.system === 'TRPG').length})
                </span>
              </button>
            </div>

            {/* Search Input & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar personagem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => importInputRef.current?.click()}
                className="text-xs flex items-center gap-1.5 border-amber-500/30 text-amber-300"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
              </Button>

              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nova Ficha</span>
              </Button>
            </div>
          </div>

          {/* Character Selection Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredCharacters.map((char) => {
              const isSelected = selectedChar?.id === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg border text-left transition-all shrink-0 min-w-[200px] flex items-center justify-between gap-3',
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  )}
                >
                  <div className="truncate">
                    <div className="font-serif font-bold text-xs truncate">{char.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {char.race} • {char.class} {char.level}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={char.system === 'T20' ? 'arton' : 'mana'} className="text-[9px] py-0 px-1">
                      {char.system}
                    </Badge>
                  </div>
                </button>
              );
            })}

            {filteredCharacters.length === 0 && (
              <div className="py-3 px-4 text-xs text-slate-500 italic">
                Nenhum personagem encontrado. Clique em &quot;Nova Ficha&quot; para criar um.
              </div>
            )}
          </div>

          {/* Active Character Sheet View */}
          {selectedChar ? (
            <CharacterSheetView
              key={selectedChar.id}
              initialCharacter={selectedChar}
              onSave={async (updated) => {
                setCharacters((prev) =>
                  prev.map((c) => (c.id === selectedChar.id ? { ...c, ...updated } : c))
                );
              }}
              onDelete={handleDeleteCharacter}
            />
          ) : (
            <Card variant="tabletop" className="p-12 text-center border-dashed border-slate-800">
              <Shield className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-amber-200 text-lg">Nenhum personagem selecionado</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Selecione uma ficha na barra superior ou inicie o assistente de criação passo a passo.
              </p>
              <Button variant="gold" size="sm" onClick={() => setIsCreating(true)}>
                Criar Primeiro Personagem
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
