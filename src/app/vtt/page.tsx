import React from 'react';
import prisma from '@/lib/db/prisma';
import { TacticalGridCanvas } from '@/components/vtt/TacticalGridCanvas';
import { Map } from 'lucide-react';

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
    <div className="flex-1 py-4 px-3 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full space-y-4">
      <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Map className="w-5 h-5 text-zinc-300" />
            <span>Mesa Virtual (VTT)</span>
            <span className="text-zinc-400 font-sans text-xs sm:text-sm font-normal">
              · Grid Tático 1,5m
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Movimentação de tokens, iniciativa em turnos e réguas de alcance de combate.
          </p>
        </div>
      </div>

      <TacticalGridCanvas initialScenes={scenes} />
    </div>
  );
}
