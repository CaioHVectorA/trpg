import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'ARTON VTT — A Mesa Virtual Definitiva de Tormenta 20 & TRPG',
  description:
    'A plataforma virtual definitiva para Tormenta 20 (Jogo do Ano) e Tormenta RPG Clássico: grid tático de 1,5m estilo Roll20/Foundry, fichas vivas reativas, rolador d20 cinematográfico e compêndio canônico completo.',
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
    'RPG de Mesa',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#070A12] text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <AppProviders>
          <AppHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-amber-500/20 bg-[#05080F] py-6 text-xs text-slate-400 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-amber-200">ARTON VTT</span>
                <span className="text-slate-500">|</span>
                <p className="text-slate-400">
                  Compatível com Tormenta 20 (Jogo do Ano) &amp; Tormenta RPG Clássico
                </p>
              </div>
              <p className="text-slate-500 text-[11px]">
                Inspirado nas melhores experiências de Roll20, Foundry VTT e D&amp;D Beyond.
              </p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
