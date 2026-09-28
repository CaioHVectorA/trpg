import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { CharacterSheetView } from '@/components/sheet/CharacterSheetView';
import { ArrowLeft, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CharacterDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const character = await prisma.character.findUnique({
    where: { id: params.id },
  });

  if (!character) {
    notFound();
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/characters"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-amber-200">
              {character.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {character.race} • {character.class} Nível {character.level} ({character.system})
            </p>
          </div>
        </div>
      </div>

      <CharacterSheetView initialCharacter={character} />
    </div>
  );
}
