import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  BookOpen,
  Map,
  Dices,
  Sparkles,
  Flame,
  Swords,
  Scroll,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query counts for persistence confirmation
  let compendiumCount = 0;
  let characterCount = 0;
  let sceneCount = 0;
  let rollCount = 0;
  let canonicalItems: Array<{ id: string; name: string; type: string; system: string }> = [];

  try {
    const [compCount, charCount, scCount, rCount, items] = await Promise.all([
      prisma.compendiumItem.count(),
      prisma.character.count(),
      prisma.scene.count(),
      prisma.rollLog.count(),
      prisma.compendiumItem.findMany({
        take: 12,
        select: { id: true, name: true, type: true, system: true },
      }),
    ]);
    compendiumCount = compCount;
    characterCount = charCount;
    sceneCount = scCount;
    rollCount = rCount;
    canonicalItems = items;
  } catch (error) {
    console.error('Error querying database metrics on home page:', error);
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-red-950/40 p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-parchment-pattern opacity-5 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="arton" className="text-xs flex items-center gap-1.5 py-1 px-3">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              Tormenta 20 (Jogo do Ano)
            </Badge>
            <Badge variant="gold" className="text-xs flex items-center gap-1.5 py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tormenta RPG Clássico (TRPG)
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-amber-100">
            A Lenda de Arton ao seu Alcance
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Plataforma digital integrada com motor de regras oficial, fichas dinâmicas reativas,
            grid tático de combate (1,5m), rolador d20 contextualizado e compêndio completo.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/characters">
              <Button variant="gold" size="lg" className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Criar Ficha de Personagem
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/vtt">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Map className="w-5 h-5 text-amber-400" />
                Abrir Grid Tático (VTT)
              </Button>
            </Link>
            <Link href="/compendium">
              <Button variant="ghost" size="lg" className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Explorar Compêndio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Persistence / Database Health Banner */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="tabletop" className="p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Compêndio</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-amber-200">{compendiumCount}</p>
          <span className="text-[11px] text-slate-500">Entidades canônicas</span>
        </Card>

        <Card variant="tabletop" className="p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fichas Salvas</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-amber-200">{characterCount}</p>
          <span className="text-[11px] text-slate-500">T20 &amp; TRPG</span>
        </Card>

        <Card variant="tabletop" className="p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cenas VTT</span>
            <Map className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-amber-200">{sceneCount}</p>
          <span className="text-[11px] text-slate-500">Grid 1.5m com tokens</span>
        </Card>

        <Card variant="tabletop" className="p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Rolagens d20</span>
            <Dices className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-amber-200">{rollCount}</p>
          <span className="text-[11px] text-slate-500">Histórico persistido</span>
        </Card>
      </section>

      {/* Main Feature Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-200">Módulos da Plataforma</h2>
          <p className="text-sm text-slate-400">
            Arquitetura desacoplada e modular suportando regras híbridas de Tormenta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fichas Dinâmicas */}
          <Card variant="tabletop" className="flex flex-col justify-between hover:border-amber-400/50">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <CardTitle>Construtor de Fichas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300 flex-1">
              <p>
                Cálculo automático de PV, PM, Defesa/CA e perícias com treinamento progressivo (+2,
                +4, +6) ou graduações clássicas. Suporte completo a penalidade de armadura e limite de
                gastos de PM.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Alternância instantânea entre T20 e TRPG
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Modificadores diretos e scores 3-18
                </li>
              </ul>
              <div className="pt-2">
                <Link href="/characters">
                  <Button variant="gold" size="sm" className="w-full">
                    Acessar Fichas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Compêndio Interativo */}
          <Card variant="tabletop" className="flex flex-col justify-between hover:border-amber-400/50">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-300" />
              </div>
              <CardTitle>Compêndio de Regras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300 flex-1">
              <p>
                Catálogo interativo com busca instantânea por raças, classes, magias por círculo,
                poderes de combate e itens de equipamento com regras completas e aprimoramentos.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  12 entidades canônicas pré-instaladas
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Arrastar para ficha ou grid tático
                </li>
              </ul>
              <div className="pt-2">
                <Link href="/compendium">
                  <Button variant="mana" size="sm" className="w-full">
                    Consultar Compêndio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Grid Tático & VTT */}
          <Card variant="tabletop" className="flex flex-col justify-between hover:border-amber-400/50">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
                <Map className="w-5 h-5 text-red-300" />
              </div>
              <CardTitle>Grid Tático (VTT)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300 flex-1">
              <p>
                Mesa virtual com grid quadrado de 1,5m (5 pés), posicionamento e movimentação de
                tokens, medição de distância por faixas de alcance e rastreador de iniciativa.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Métricas Chebyshev e 5/10/5 d20
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Barra de PV e status em tempo real
                </li>
              </ul>
              <div className="pt-2">
                <Link href="/vtt">
                  <Button variant="arton" size="sm" className="w-full">
                    Entrar no Campo de Batalha
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Canonical Seed Dataset Showcase */}
      <section className="space-y-4 rounded-xl border border-amber-500/20 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-500/15 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Banco de Dados &amp; Entidades Canônicas Prontas
            </h3>
            <p className="text-xs text-slate-400">
              12 registros canônicos de regras verificados no SQLite local (`dev.db`), prontos para
              Supabase PostgreSQL.
            </p>
          </div>
          <Badge variant="emerald" className="text-xs">
            Prisma SQLite Conectado
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {canonicalItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-md border border-slate-800 bg-slate-950/60 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>{item.type}</span>
                <span className="text-amber-400/80 font-mono">{item.system}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
