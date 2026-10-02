import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Shield,
  BookOpen,
  Map,
  Dices,
  Sparkles,
  Flame,
  ArrowRight,
  Database,
  CheckCircle2,
  Swords,
  Play,
  Heart,
  Zap,
  Crosshair,
  Skull,
  User,
  Wand2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query platform entities and metrics
  let compendiumCount = 0;
  let characterCount = 0;
  let sceneCount = 0;
  let rollCount = 0;
  let characters: any[] = [];
  let scenes: any[] = [];

  try {
    const [compCount, charCount, scCount, rCount, chars, scs] = await Promise.all([
      prisma.compendiumItem.count(),
      prisma.character.count(),
      prisma.scene.count(),
      prisma.rollLog.count(),
      prisma.character.findMany({
        take: 5,
        orderBy: { level: 'desc' },
      }),
      prisma.scene.findMany({
        take: 4,
        include: { tokens: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    compendiumCount = compCount;
    characterCount = charCount;
    sceneCount = scCount;
    rollCount = rCount;
    characters = chars;
    scenes = scs;
  } catch (error) {
    console.error('Error querying database metrics on home page:', error);
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      {/* Hero Section - Monochromatic & Minimalist */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono text-zinc-300 border-zinc-700">
              Tormenta 20 (Jogo do Ano) &amp; TRPG
            </Badge>
            <Badge variant="arton" className="text-xs font-mono text-zinc-300 border-zinc-800 bg-zinc-900">
              Mesa Virtual Integrada
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-zinc-100 leading-tight">
            A Mesa Virtual de{' '}
            <span className="text-white underline decoration-zinc-700 underline-offset-8">
              Tormenta
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-2xl">
            Projetada para mestres e jogadores viverem as maiores sagas de Arton. Grid tático oficial (1,5m),
            fichas dinâmicas com motor de regras automatizado, rolador d20 com verificação de CD e
            compêndio oficial com raças, classes, magias e monstros.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <Link href="/vtt">
              <Button
                size="md"
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-zinc-300 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Entrar no VTT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Link href="/characters">
              <Button
                variant="outline"
                size="md"
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border-zinc-700"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Criar Fichas</span>
              </Button>
            </Link>

            <Link href="/compendium">
              <Button
                variant="outline"
                size="md"
                className="flex items-center gap-2 text-xs sm:text-sm border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              >
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span>Grimório &amp; Bestiário</span>
              </Button>
            </Link>

            <Link href="/knowledge">
              <Button
                variant="outline"
                size="md"
                className="flex items-center gap-2 text-xs sm:text-sm border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Enciclopédia (6 Livros)</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Battlemaps Showcase / Cenários Prontos */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Map className="w-4 h-4" />
              Campos de Batalha Prontos
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Escolha seu Cenário de Combate
            </h2>
          </div>
          <Link href="/vtt" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
            Abrir Mesa Completa →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenes.map((sc, index) => {
            const bgImage = sc.backgroundUrl || '/maps/dungeon_arena.svg';
            const tokenCount = sc.tokens?.length || 0;

            return (
              <Link key={sc.id} href="/vtt" className="group">
                <Card
                  variant="tabletop"
                  className="overflow-hidden border-slate-800 hover:border-amber-400/60 transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col h-full"
                >
                  <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="gold" className="text-[10px]">
                        {sc.gridWidth} × {sc.gridHeight} (1,5m)
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{tokenCount} Combatentes</span>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                        {sc.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {sc.name.includes('Khalmyr') && 'Cripta subterrânea sob a luz dourada do Deus da Justiça.'}
                        {sc.name.includes('Tempestade') && 'Céu rubro, quitina e espirais aberrantes da Tempestade Rubra.'}
                        {sc.name.includes('Taverna') && 'Taverna agitada em Valkaria com mesas, balcão e barris.'}
                        {sc.name.includes('Allihanna') && 'Monólitos sagrados e círculo druídico no coração da floresta.'}
                        {sc.name.includes('Valkaria') && 'Praça circular monumental aos pés da colossal estátua da Deusa da Ambição.'}
                        {sc.name.includes('Bucaneiros') && 'Conveses de madeira, conveses balançantes e barris de pólvora em Portsmouth.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-amber-400 font-semibold">
                      <span>Jogar agora</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ready-to-Play Canonical Heroes Showcase */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Shield className="w-4 h-4" />
              Heróis Prontos para a Aventura
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Fichas Canônicas Automatizadas
            </h2>
          </div>
          <Link href="/characters" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
            Ver Todas as Fichas ({characterCount}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => {
            return (
              <Card
                key={char.id}
                variant="tabletop"
                className="p-4 border-slate-800 hover:border-amber-400/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {char.avatarUrl ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                          <Image
                            src={char.avatarUrl}
                            alt={char.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-red-900 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-200">
                          {char.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-serif font-bold text-base text-slate-100 truncate max-w-[170px]">
                          {char.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-sans">
                          {char.race} · {char.class} Nv {char.level}
                        </p>
                      </div>
                    </div>

                    <Badge variant={char.system === 'T20' ? 'arton' : 'mana'} className="text-[10px]">
                      {char.system}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-950 p-2 rounded-lg border border-red-950/60">
                      <span className="text-[10px] text-red-400/80 flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" /> PV
                      </span>
                      <span className="font-mono font-bold text-sm text-red-200">
                        {char.pvCurrent}/{char.pvMax}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-lg border border-blue-950/60">
                      <span className="text-[10px] text-blue-400/80 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-blue-400" /> PM
                      </span>
                      <span className="font-mono font-bold text-sm text-blue-200">
                        {char.pmCurrent}/{char.pmMax}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-lg border border-amber-950/60">
                      <span className="text-[10px] text-amber-400/80 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400" /> DEF
                      </span>
                      <span className="font-mono font-bold text-sm text-amber-200">
                        {char.defense}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 mt-3">
                  <Link href={`/characters/${char.id}`} className="flex-1">
                    <Button variant="gold" size="sm" className="w-full text-xs font-bold">
                      Abrir Ficha
                    </Button>
                  </Link>
                  <Link href="/vtt">
                    <Button variant="outline" size="sm" className="text-xs border-amber-500/40 text-amber-300">
                      No VTT
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Canonical Tormenta Source Books Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <BookOpen className="w-4 h-4" />
              Biblioteca Canônica Oficial
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Baseado Estritamente nos Manuais de Tormenta
            </h2>
          </div>
          <Link href="/compendium" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
            Explorar todo o Compêndio →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Manual do Malandro',
              badge: 'Ladinagem & Truques',
              desc: 'Gatunos, Malandros, golpes baixos, areia nos olhos, kits de ladinagem obscura e dados viciados de Nimb para sobreviver nos becos.',
              color: 'border-purple-500/30 bg-purple-950/10 text-purple-300',
              badgeVariant: 'mana',
              filter: 'manual-do-malandro',
            },
            {
              title: 'Piratas e Pistoleiros',
              badge: 'Pólvora & Alto-Mar',
              desc: 'Bucaneiros destemidos, pistoleiros de Portsmouth, armas de fogo artonianas (pistola, bacamarte, mosquete), recarga tática e combate naval.',
              color: 'border-cyan-500/30 bg-cyan-950/10 text-cyan-300',
              badgeVariant: 'arton',
              filter: 'piratas-e-pistoleiros',
            },
            {
              title: 'O Panteão',
              badge: 'Os 20 Deuses Maiores',
              desc: 'Poderes concedidos canônicos de Khalmyr, Valkaria, Wynna, Nimb, Arsenal, Thyatis, Allihanna, Tauron, Sszzaas, Tenebra e Aharadak.',
              color: 'border-amber-500/30 bg-amber-950/10 text-amber-300',
              badgeVariant: 'gold',
              filter: 'o-panteao',
            },
            {
              title: 'Reinos de Moreania',
              badge: 'Herdeiros dos Animais',
              desc: 'A Ilha dos Moreau, o povo abençoado com heranças totêmicas de Lobo, Urso, Raposa, Serpente e poderes de mordida e sentidos selvagens.',
              color: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-300',
              badgeVariant: 'tabletop',
              filter: 'moreania',
            },
            {
              title: 'Valkaria, Cidade Sob a Deusa',
              badge: 'Metrópole & Guildas',
              desc: 'A capital do Reinado, patrulha da milícia urbana, a colossal estátua da deusa, a Baixa de Valkaria e guildas clandestinas de ladrões.',
              color: 'border-rose-500/30 bg-rose-950/10 text-rose-300',
              badgeVariant: 'arton',
              filter: 'valkaria',
            },
            {
              title: 'Mundo de Arton',
              badge: 'Geografia & Forjas',
              desc: 'O Reinado e além: ligas de aço-rubi que ignoram redução de dano, escudos de mitral anão de Doherimm e madeira nobre de Tollon.',
              color: 'border-orange-500/30 bg-orange-950/10 text-orange-300',
              badgeVariant: 'gold',
              filter: 'mundo-de-arton',
            },
          ].map((bk) => (
            <Card
              key={bk.title}
              variant="tabletop"
              className={cn('p-5 flex flex-col justify-between hover:border-amber-400/60 transition-all group', bk.color)}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {bk.title}
                  </h3>
                  <Badge variant={bk.badgeVariant as any} className="text-[10px]">
                    {bk.badge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {bk.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
                <Link href={`/compendium`} className="flex items-center gap-1 hover:text-amber-300 transition-colors">
                  <span>Ver Entidades Canônicas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Feature Pillars */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">
            Tudo o que Você Precisa para Jogar Online
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arquitetura de alto desempenho inspirada nas melhores plataformas de VTT mundiais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Grid Tático VTT */}
          <Card variant="tabletop" className="flex flex-col justify-between border-slate-800 p-6 space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Map className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle className="text-xl">Mesa Virtual &amp; Grid Tático (1,5m)</CardTitle>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Grid quadrado com réguas de alcance Tormenta (Chebyshev e 5/10/5), posicionamento e
                arraste suave de tokens com portes de Pequeno a Colossal, auras visuais, barras de vida
                e rastreador de turnos e rodadas.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Múltiplos mapas e cenários prontos com iluminação
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Faixas de alcance automáticas (Curto, Médio, Longo)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Painel de iniciativa com desempate por DES
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/vtt">
                <Button variant="arton" size="md" className="w-full font-bold">
                  Explorar Mesa Virtual
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: Fichas Dinâmicas */}
          <Card variant="tabletop" className="flex flex-col justify-between border-slate-800 p-6 space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <CardTitle className="text-xl">Fichas Vivas Automatizadas</CardTitle>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Cálculo em tempo real de PV, PM, Defesa/CA, penalidade de armadura em perícias físicas e
                limite de gastos de PM por nível. Rolagens com um clique em ataques, perícias ou magias.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Motor duplo: Tormenta 20 e TRPG Clássico
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Exportação e importação instantânea em JSON
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Ajuste rápido de dano e descanso automático
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/characters">
                <Button variant="gold" size="md" className="w-full font-bold">
                  Criar Personagem
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 3: Grimório & Compêndio */}
          <Card variant="tabletop" className="flex flex-col justify-between border-slate-800 p-6 space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-xl">Grimório &amp; Bestiário Canônico</CardTitle>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Catálogo interativo com busca instantânea por raças, classes, magias por círculo com
                aprimoramentos de PM, poderes concedidos dos Deuses do Panteão e ameaças com ND equilibrado.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {compendiumCount}+ entidades canônicas cadastradas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Filtros por escola de magia, círculo e deuses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Arraste ameaças direto para o grid do VTT
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/compendium">
                <Button variant="mana" size="md" className="w-full font-bold">
                  Consultar Grimório
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 4: Enciclopédia & 6 Livros */}
          <Card variant="tabletop" className="flex flex-col justify-between border-slate-800 p-6 space-y-4 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Enciclopédia (6 Livros)</CardTitle>
                <Badge variant="arton" className="text-[10px]">Oficial</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Documentação interativa baseada nos livros: Manual do Malandro, Piratas &amp; Pistoleiros,
                O Panteão, Reinos de Moreania, Valkaria e Mundo de Arton.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dossiê completo dos 20 Deuses Maiores
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  12 Heranças Moreau &amp; Armas de Pólvora
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Guia tático de combate, condições e PM
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/knowledge">
                <Button variant="gold" size="md" className="w-full font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  Abrir Enciclopédia
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Platform Metrics Highlights Banner */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl border border-amber-500/25 bg-[#0B0F19]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Compêndio</span>
          </div>
          <p className="text-3xl font-black font-serif text-slate-100">{compendiumCount}</p>
          <p className="text-[11px] text-slate-500">Raças, Magias, Poderes &amp; Monstros</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Heróis Salvos</span>
          </div>
          <p className="text-3xl font-black font-serif text-slate-100">{characterCount}</p>
          <p className="text-[11px] text-slate-500">Fichas prontas para combate</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Map className="w-4 h-4 text-amber-400" />
            <span>Campos de Batalha</span>
          </div>
          <p className="text-3xl font-black font-serif text-slate-100">{sceneCount}</p>
          <p className="text-[11px] text-slate-500">Mapas com grid de 1,5m e tokens</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Dices className="w-4 h-4 text-amber-400" />
            <span>Rolagens no Histórico</span>
          </div>
          <p className="text-3xl font-black font-serif text-slate-100">{rollCount}</p>
          <p className="text-[11px] text-slate-500">Ataques, testes e magias auditados</p>
        </div>
      </section>
    </div>
  );
}
