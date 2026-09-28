'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Shield,
  Sword,
  Wand2,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompendiumItemProps {
  id: string;
  name: string;
  system: string;
  type: string;
  category?: string | null;
  description: string;
  circle?: number | null;
  cost?: string | null;
  requirement?: string | null;
  tags: string;
}

export const CompendiumBrowser: React.FC<{ items: CompendiumItemProps[] }> = ({ items }) => {
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<CompendiumItemProps | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // System filter
      if (selectedSystem !== 'ALL' && item.system !== selectedSystem && item.system !== 'ALL') {
        return false;
      }

      // Type filter
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      // Search text
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchTags = item.tags.toLowerCase().includes(query);
        return matchName || matchDesc || matchTags;
      }

      return true;
    });
  }, [items, search, selectedSystem, selectedType]);

  const typeIcons: Record<string, React.ReactNode> = {
    RACE: <Shield className="w-3.5 h-3.5 text-amber-400" />,
    CLASS: <Sword className="w-3.5 h-3.5 text-red-400" />,
    SPELL: <Wand2 className="w-3.5 h-3.5 text-blue-400" />,
    POWER: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    ITEM: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 shadow-lg space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, descrição, magia, poder ou tag (ex: fogo, dano, evocação)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* System Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Sistema:</span>
            {['ALL', 'T20', 'TRPG'].map((sys) => (
              <button
                key={sys}
                onClick={() => setSelectedSystem(sys)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border',
                  selectedSystem === sys
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                {sys === 'ALL' ? 'Todos os Sistemas' : sys}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Tipo:</span>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'RACE', label: 'Raças' },
              { id: 'CLASS', label: 'Classes' },
              { id: 'SPELL', label: 'Magias' },
              { id: 'POWER', label: 'Poderes' },
              { id: 'ITEM', label: 'Itens' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border whitespace-nowrap',
                  selectedType === t.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Exibindo <strong className="text-amber-200">{filteredItems.length}</strong> de {items.length} entidades
        </span>
      </div>

      {/* Grid of Compendium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            variant="tabletop"
            onClick={() => setActiveItem(item)}
            className="flex flex-col justify-between hover:border-amber-400/50 cursor-pointer transition-all duration-150 group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                {typeIcons[item.type] || <BookOpen className="w-3.5 h-3.5 text-amber-400" />}
                <div>
                  <CardTitle className="text-base group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </CardTitle>
                  <p className="text-[11px] text-slate-400">{item.category || item.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Badge
                  variant={item.system === 'T20' ? 'arton' : item.system === 'TRPG' ? 'mana' : 'gold'}
                  className="text-[10px]"
                >
                  {item.system}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-amber-400/80 font-mono truncate max-w-[200px]">
                  {item.tags}
                </span>
                <span className="text-slate-500 group-hover:text-amber-300 transition-colors">
                  Ver detalhes →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-amber-500/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-amber-100">
                    {activeItem.name}
                  </h3>
                  <Badge
                    variant={
                      activeItem.system === 'T20'
                        ? 'arton'
                        : activeItem.system === 'TRPG'
                        ? 'mana'
                        : 'gold'
                    }
                  >
                    {activeItem.system}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Tipo: {activeItem.type} {activeItem.category ? `· ${activeItem.category}` : ''}
                </p>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-200 leading-relaxed">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 whitespace-pre-wrap">
                {activeItem.description}
              </div>

              {(activeItem.circle || activeItem.cost || activeItem.requirement) && (
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {activeItem.circle && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Círculo:</span>
                      <span className="font-bold text-amber-300">{activeItem.circle}º Círculo</span>
                    </div>
                  )}
                  {activeItem.cost && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Custo de Mana:</span>
                      <span className="font-bold text-blue-300">{activeItem.cost}</span>
                    </div>
                  )}
                  {activeItem.requirement && (
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 col-span-2">
                      <span className="text-slate-400 block">Pré-requisito:</span>
                      <span className="font-bold text-amber-300">{activeItem.requirement}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Tags do Compêndio:</span>{' '}
                <span className="font-mono text-amber-400/80">{activeItem.tags}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="gold" size="sm" onClick={() => setActiveItem(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
