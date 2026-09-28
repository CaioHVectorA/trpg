import React from 'react';
import prisma from '@/lib/db/prisma';
import { TacticalGridCanvas } from '@/components/vtt/TacticalGridCanvas';

export const dynamic = 'force-dynamic';

export default async function VTTPage() {
  const scenes = await prisma.scene.findMany({
    include: {
      tokens: true,
      initiative: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-amber-500/20 pb-4">
        <h1 className="text-3xl font-serif font-black text-amber-200">
          Grid Tático de Combate (VTT)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Ambiente tático baseado em grid quadrado (1,5m / 5 pés) para Tormenta 20 e Tormenta RPG,
          com movimentação de tokens, réguas com faixas de alcance e rastreador de iniciativa.
        </p>
      </div>

      <TacticalGridCanvas initialScenes={scenes} />
    </div>
  );
}
