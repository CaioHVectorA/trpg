import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'ARTON VTT — Mesa Virtual de Tormenta 20 & TRPG',
  description:
    'Plataforma virtual ágil e extensível para Tormenta 20 e Tormenta RPG Clássico: grid tático, fichas vivas reativas, rolador d20 e compêndio integrado.',
  keywords: [
    'Tormenta 20',
    'T20',
    'TRPG',
    'VTT',
    'Virtual Tabletop',
    'Roll20',
    'Foundry VTT',
    'Ficha de Tormenta',
    'Arton',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-zinc-100">
        <AppProviders>
          <AppHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-xs text-zinc-400 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-zinc-200">ARTON VTT</span>
                <span className="text-zinc-600">|</span>
                <p className="text-zinc-400">
                  Compatível com Tormenta 20 (Jogo do Ano) &amp; Tormenta RPG
                </p>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Inspirado na extensibilidade e liberdade de Roll20 e Foundry VTT.
              </p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
