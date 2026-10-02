import React from 'react';
import prisma from '@/lib/db/prisma';
import { CharacterSheetManager } from '@/components/sheet/CharacterSheetManager';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CharactersPage() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-zinc-300" />
            <span>Fichas de Personagem</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerenciador de fichas vivas para Tormenta 20 e TRPG com rolagens diretas e inventário.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono border-zinc-700 text-zinc-300">
            {characters.length} {characters.length === 1 ? 'personagem' : 'personagens'}
          </Badge>
        </div>
      </div>

      <CharacterSheetManager initialCharacters={characters} />
    </div>
  );
}
