import React from 'react';
import prisma from '@/lib/db/prisma';
import { CharacterSheetManager } from '@/components/sheet/CharacterSheetManager';

export const dynamic = 'force-dynamic';

export default async function CharactersPage() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-amber-500/20 pb-4">
        <h1 className="text-3xl font-serif font-black text-amber-200">
          Fichas de Personagem
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Crie, edite e gerencie personagens para Tormenta 20 e Tormenta RPG Clássico com cálculos
          automáticos de regras e rolagens diretas de atributos e perícias.
        </p>
      </div>

      <CharacterSheetManager initialCharacters={characters} />
    </div>
  );
}
