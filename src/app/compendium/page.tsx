import React from 'react';
import prisma from '@/lib/db/prisma';
import { CompendiumBrowser } from '@/components/compendium/CompendiumBrowser';

export const dynamic = 'force-dynamic';

export default async function CompendiumPage() {
  const items = await prisma.compendiumItem.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-amber-500/20 pb-4">
        <h1 className="text-3xl font-serif font-black text-amber-200">
          Compêndio de Regras e Conteúdos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Catálogo canônico unificado para Tormenta 20 (Jogo do Ano) e Tormenta RPG Clássico.
          Consulte raças, classes, magias, poderes, itens e ameaças de Arton com busca instantânea.
        </p>
      </div>

      <CompendiumBrowser items={items} />
    </div>
  );
}
