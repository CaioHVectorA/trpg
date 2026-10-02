'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDice } from '@/components/dice/DiceContext';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Shield,
  Sword,
  Wand2,
  X,
  Plus,
  Skull,
  Flame,
  Zap,
  MapPin,
  ArrowRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompendiumItemProps {
  id: string;
  name: string;
  system: string;
  type: string;
  category?: string | null;
  description: string;
  circle?: number | null;
  cost?: string | null;
  requirement?: string | null;
  dataJson?: string;
  tags: string;
}

export const CompendiumBrowser: React.FC<{ items: CompendiumItemProps[] }> = ({ items }) => {
  const { roll } = useDice();
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedBook, setSelectedBook] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<CompendiumItemProps | null>(null);

  const getBookSource = (tags: string = '', category: string = '') => {
    const combined = (tags + ' ' + (category || '')).toLowerCase();
    if (combined.includes('manual-do-malandro')) return { label: 'Manual do Malandro', color: 'bg-purple-950/80 border-purple-500/50 text-purple-300' };
    if (combined.includes('piratas-e-pistoleiros')) return { label: 'Piratas e Pistoleiros', color: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' };
    if (combined.includes('o-panteao') || combined.includes('valkaria') || combined.includes('khalmyr') || combined.includes('wynna') || combined.includes('nimb') || combined.includes('arsenal') || combined.includes('thyatis') || combined.includes('allihanna') || combined.includes('tauron') || combined.includes('tenebra') || combined.includes('sszzaas') || combined.includes('ragnar') || combined.includes('oceano') || combined.includes('marah') || combined.includes('tanna-toh') || combined.includes('lin-wu') || combined.includes('aharadak')) {
      if (combined.includes('valkaria') && !combined.includes('concedido') && !combined.includes('o-panteao')) {
        return { label: 'Valkaria: Cidade sob a Deusa', color: 'bg-rose-950/80 border-rose-500/50 text-rose-300' };
      }
      return { label: 'O Panteão', color: 'bg-amber-950/80 border-amber-500/50 text-amber-300' };
    }
    if (combined.includes('moreania') || combined.includes('moreau')) return { label: 'Reinos de Moreania', color: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' };
    if (combined.includes('mundo-de-arton') || combined.includes('zakharov') || combined.includes('doherimm') || combined.includes('tollon')) return { label: 'Mundo de Arton', color: 'bg-orange-950/80 border-orange-500/50 text-orange-300' };
    if (combined.includes('valkaria')) return { label: 'Valkaria', color: 'bg-rose-950/80 border-rose-500/50 text-rose-300' };
    return null;
  };

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

      // Book filter
      if (selectedBook !== 'ALL') {
        const combined = (item.tags + ' ' + (item.category || '')).toLowerCase();
        if (selectedBook === 'manual-do-malandro' && !combined.includes('manual-do-malandro')) return false;
        if (selectedBook === 'piratas-e-pistoleiros' && !combined.includes('piratas-e-pistoleiros')) return false;
        if (selectedBook === 'o-panteao' && !(combined.includes('o-panteao') || combined.includes('khalmyr') || combined.includes('wynna') || combined.includes('nimb') || combined.includes('arsenal') || combined.includes('thyatis') || combined.includes('allihanna') || combined.includes('tauron') || combined.includes('tenebra') || combined.includes('sszzaas') || combined.includes('ragnar') || combined.includes('oceano') || combined.includes('marah') || combined.includes('tanna-toh') || combined.includes('lin-wu') || combined.includes('aharadak'))) return false;
        if (selectedBook === 'moreania' && !(combined.includes('moreania') || combined.includes('moreau'))) return false;
        if (selectedBook === 'valkaria' && !combined.includes('valkaria')) return false;
        if (selectedBook === 'mundo-de-arton' && !(combined.includes('mundo-de-arton') || combined.includes('zakharov') || combined.includes('doherimm') || combined.includes('tollon'))) return false;
      }

      // Search text
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchTags = item.tags.toLowerCase().includes(query);
        const matchCategory = item.category?.toLowerCase().includes(query);
        return matchName || matchDesc || matchTags || matchCategory;
      }

      return true;
    });
  }, [items, search, selectedSystem, selectedType, selectedBook]);

  const typeIcons: Record<string, React.ReactNode> = {
    RACE: <Shield className="w-4 h-4 text-amber-400" />,
    CLASS: <Sword className="w-4 h-4 text-red-400" />,
    SPELL: <Wand2 className="w-4 h-4 text-blue-400" />,
    POWER: <Sparkles className="w-4 h-4 text-purple-400" />,
    ITEM: <Shield className="w-4 h-4 text-emerald-400" />,
    THREAT: <Skull className="w-4 h-4 text-rose-500" />,
  };

  const parsedActiveData = useMemo(() => {
    if (!activeItem?.dataJson) return null;
    try {
      return JSON.parse(activeItem.dataJson);
    } catch {
      return null;
    }
  }, [activeItem]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="p-5 rounded-2xl bg-[#090D18] border border-amber-500/25 shadow-2xl space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, magia, criatura, poder, escola ou tag (ex: fogo, dano, evocação, nd)..."
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* System Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1">
              Sistema:
            </span>
            {['ALL', 'T20', 'TRPG'].map((sys) => (
              <button
                key={sys}
                onClick={() => setSelectedSystem(sys)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all border',
                  selectedSystem === sys
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                {sys === 'ALL' ? 'Todos os Sistemas' : sys}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 shrink-0">
              Categoria:
            </span>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'RACE', label: 'Raças' },
              { id: 'CLASS', label: 'Classes' },
              { id: 'SPELL', label: 'Magias' },
              { id: 'POWER', label: 'Poderes' },
              { id: 'ITEM', label: 'Itens' },
              { id: 'THREAT', label: 'Bestiário (Ameaças)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap',
                  selectedType === t.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canonical Book Filter (Based on Tormenta Library from User Drive) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full pt-3 border-t border-slate-800/60">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 shrink-0">
            Livro Canônico:
          </span>
          {[
            { id: 'ALL', label: 'Todos os Livros' },
            { id: 'manual-do-malandro', label: 'Manual do Malandro' },
            { id: 'piratas-e-pistoleiros', label: 'Piratas e Pistoleiros' },
            { id: 'o-panteao', label: 'O Panteão' },
            { id: 'moreania', label: 'Reinos de Moreania' },
            { id: 'valkaria', label: 'Valkaria: Cidade sob a Deusa' },
            { id: 'mundo-de-arton', label: 'Mundo de Arton' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBook(b.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap',
                selectedBook === b.id
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Exibindo <strong className="text-amber-200 font-bold">{filteredItems.length}</strong> de{' '}
          {items.length} entidades canônicas cadastradas
        </span>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          let parsedData: any = null;
          if (item.dataJson) {
            try {
              parsedData = JSON.parse(item.dataJson);
            } catch {}
          }
          const bookSource = getBookSource(item.tags, item.category || '');

          return (
            <Card
              key={item.id}
              variant="tabletop"
              onClick={() => setActiveItem(item)}
              className="flex flex-col justify-between hover:border-amber-400/60 cursor-pointer transition-all duration-200 group p-5 space-y-4 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                      {typeIcons[item.type] || <BookOpen className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <CardTitle className="text-base font-serif font-bold group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </CardTitle>
                      <p className="text-[11px] text-slate-400">{item.category || item.type}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant={item.system === 'T20' ? 'arton' : item.system === 'TRPG' ? 'mana' : 'gold'}
                      className="text-[10px]"
                    >
                      {item.system}
                    </Badge>
                    {bookSource && (
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', bookSource.color)}>
                        {bookSource.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Specific Stat Badges if available */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.circle && (
                    <Badge variant="mana" className="text-[10px] py-0 px-1.5">
                      {item.circle}º Círculo
                    </Badge>
                  )}
                  {item.cost && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-500/40 text-blue-300">
                      {item.cost}
                    </Badge>
                  )}
                  {parsedData?.challengeRating !== undefined && (
                    <Badge variant="arton" className="text-[10px] py-0 px-1.5">
                      ND {parsedData.challengeRating}
                    </Badge>
                  )}
                  {parsedData?.damageDice && (
                    <Badge variant="gold" className="text-[10px] py-0 px-1.5 font-mono">
                      {parsedData.damageDice}
                    </Badge>
                  )}
                  {parsedData?.defenseBonus && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-300">
                      +{parsedData.defenseBonus} Defesa
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-amber-400/80 font-mono text-[10px] truncate max-w-[190px]">
                  {item.tags}
                </span>
                <span className="text-slate-400 group-hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                  Detalhes →
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-[#0B0F19] border-2 border-amber-500/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center">
                  {typeIcons[activeItem.type] || <BookOpen className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                      className="text-xs"
                    >
                      {activeItem.system}
                    </Badge>
                    {activeItem && (() => {
                      const src = getBookSource(activeItem.tags, activeItem.category || '');
                      return src ? (
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide uppercase', src.color)}>
                          {src.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeItem.category || activeItem.type}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-4 text-xs text-slate-200 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 leading-relaxed font-sans text-sm text-slate-300">
                {activeItem.description}
              </div>

              {/* Structured Metadata Badges */}
              {(activeItem.circle || activeItem.cost || activeItem.requirement || parsedActiveData?.challengeRating) && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {activeItem.circle && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-blue-950/60">
                      <span className="text-slate-400 text-[10px] block">Círculo da Magia:</span>
                      <span className="font-bold text-blue-300 text-sm">{activeItem.circle}º Círculo</span>
                    </div>
                  )}

                  {activeItem.cost && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-blue-950/60">
                      <span className="text-slate-400 text-[10px] block">Custo de Mana:</span>
                      <span className="font-bold text-sky-300 text-sm">{activeItem.cost}</span>
                    </div>
                  )}

                  {parsedActiveData?.challengeRating !== undefined && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-red-950/60">
                      <span className="text-slate-400 text-[10px] block">Nível de Desafio:</span>
                      <span className="font-bold text-red-400 text-sm">ND {parsedActiveData.challengeRating}</span>
                    </div>
                  )}

                  {activeItem.requirement && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 col-span-2">
                      <span className="text-slate-400 text-[10px] block">Pré-requisito:</span>
                      <span className="font-bold text-amber-300">{activeItem.requirement}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Enhancements if spell */}
              {parsedActiveData?.enhancements && parsedActiveData.enhancements.length > 0 && (
                <div className="space-y-2 p-3 rounded-xl bg-blue-950/20 border border-blue-900/50">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    Aprimoramentos de Pontos de Mana (PM)
                  </span>
                  <div className="space-y-1.5">
                    {parsedActiveData.enhancements.map((enh: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="font-mono font-bold text-blue-400 shrink-0">
                          +{enh.pmCost} PM:
                        </span>
                        <span>{enh.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monster Attacks if threat */}
              {parsedActiveData?.attacks && parsedActiveData.attacks.length > 0 && (
                <div className="space-y-2 p-3 rounded-xl bg-red-950/20 border border-red-900/50">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-red-400" />
                    Ataques do Monstro
                  </span>
                  <div className="space-y-1.5">
                    {parsedActiveData.attacks.map((atk: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-200 flex items-center justify-between">
                        <span><strong>{atk.name}</strong>: +{atk.attackBonus}</span>
                        <span className="font-mono text-red-300 font-bold">{atk.damageDice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Tags Indexadas:</span>{' '}
                <span className="font-mono text-amber-400/80">{activeItem.tags}</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Link href="/vtt">
                <Button variant="outline" size="sm" className="text-xs border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Abrir no Grid VTT
                </Button>
              </Link>

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
