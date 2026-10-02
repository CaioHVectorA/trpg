import React from 'react';
import prisma from '@/lib/db/prisma';
import { CharacterSheetManager } from '@/components/sheet/CharacterSheetManager';
import { Badge } from '@/components/ui/badge';
import { Shield, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CharactersPage() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-amber-500/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-100 flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-amber-400" />
            <span>Fichas de Personagem &amp; Heróis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crie, edite e jogue com personagens de Tormenta 20 e Tormenta RPG Clássico.
            Cálculo automático de PV, PM, Defesa, penalidades de armadura e rolagens diretas em 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {characters.length} Heróis Prontos
          </Badge>
        </div>
      </div>

      <CharacterSheetManager initialCharacters={characters} />
    </div>
  );
}
