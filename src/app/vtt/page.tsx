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
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="flex-1 py-6 px-3 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full space-y-4">
      <div className="border-b border-amber-500/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-100 flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300">
              Mesa Virtual (VTT)
            </span>
            <span className="text-slate-400 font-sans text-xs sm:text-sm font-normal">
              · Grid Tático de Combate (1,5m)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ambiente tático para Tormenta 20 e Tormenta RPG com seleção de cenas, movimentação de tokens,
            réguas com faixas de alcance e rastreador de turnos integrado.
          </p>
        </div>
      </div>

      <TacticalGridCanvas initialScenes={scenes} />
    </div>
  );
}
