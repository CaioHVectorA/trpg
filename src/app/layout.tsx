import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Tormenta RPG Multi-System Platform | T20 & TRPG Clássico',
  description:
    'Plataforma modular para Tormenta 20 e Tormenta RPG clássico: fichas dinâmicas, grid tático VTT, rolador de dados d20 e compêndio de regras interativo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <AppProviders>
          <AppHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Tormenta 20 (Jogo do Ano) &amp; Tormenta RPG Clássico — Plataforma Modular Web</p>
              <p className="text-slate-400">
                Arton high-fantasy rules engine, VTT grid &amp; dados d20 integrados
              </p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
