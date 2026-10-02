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
  Sparkles,
  ArrowRight,
  Play,
  Heart,
  Zap,
  Plus,
  Compass,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let compendiumCount = 0;
  let characterCount = 0;
  let sceneCount = 0;
  let characters: any[] = [];
  let scenes: any[] = [];

  try {
    const [compCount, charCount, scCount, chars, scs] = await Promise.all([
      prisma.compendiumItem.count(),
      prisma.character.count(),
      prisma.scene.count(),
      prisma.character.findMany({
        take: 3,
        orderBy: { level: 'desc' },
      }),
      prisma.scene.findMany({
        take: 3,
        include: { tokens: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    compendiumCount = compCount;
    characterCount = charCount;
    sceneCount = scCount;
    characters = chars;
    scenes = scs;
  } catch (error) {
    console.error('Error querying database metrics on home page:', error);
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
      {/* Clean & Spacious Hero Header */}
      <section className="text-center py-6 sm:py-10 space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-zinc-400">
          <span>Tormenta 20 &amp; TRPG</span>
          <span className="text-zinc-600">·</span>
          <Badge variant="arton" className="text-[10px] py-0 px-1.5 font-normal">
            Roll20 Style
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-zinc-100">
          Mesa Virtual de Tormenta
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed max-w-xl mx-auto">
          Mesa aberta, ágil e customizável. Grid tático, fichas com auto-complete do compêndio oficial e rolador de dados com teste de CD.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/vtt">
            <Button
              size="md"
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold px-5 shadow-sm flex items-center gap-2 text-xs sm:text-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Entrar na Mesa</span>
            </Button>
          </Link>

          <Link href="/sheet/new">
            <Button
              variant="outline"
              size="md"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white px-5 flex items-center gap-2 text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Ficha</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 Core Modules (Spacious & Minimal) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: VTT */}
        <Link href="/vtt" className="group">
          <Card className="h-full bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                <Map className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-zinc-100 group-hover:text-white transition-colors">
                  Mesa Virtual (VTT)
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                  Grid tático de 1,5m, movimentação de tokens, iniciativa em turnos, condições de combate e réguas de alcance.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors pt-2 border-t border-zinc-800/60">
              <span>Abrir Mesa</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Module 2: Fichas */}
        <Link href="/characters" className="group">
          <Card className="h-full bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-zinc-100 group-hover:text-white transition-colors">
                  Fichas &amp; Personagens
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                  Criação flexível e sem amarras. Atributos, perícias, inventário e rolagens diretas em um clique.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors pt-2 border-t border-zinc-800/60">
              <span>Gerenciar Fichas ({characterCount})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Module 3: Grimório */}
        <Link href="/compendium" className="group">
          <Card className="h-full bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-zinc-100 group-hover:text-white transition-colors">
                  Grimório &amp; Compêndio
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                  Consulta rápida de magias, poderes concedidos dos 20 deuses, raças, classes e equipamentos de Arton.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors pt-2 border-t border-zinc-800/60">
              <span>Explorar Grimório ({compendiumCount}+)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Quick Launch: Recent Characters */}
      {characters.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              <span>Fichas Recentes</span>
            </h2>
            <Link
              href="/characters"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              Ver todas ({characterCount}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {characters.map((char) => (
              <Link key={char.id} href={`/characters/${char.id}`} className="group">
                <Card className="p-3.5 bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {char.avatarUrl ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-700">
                          <Image
                            src={char.avatarUrl}
                            alt={char.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300">
                          {char.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-xs text-zinc-200 group-hover:text-white transition-colors truncate max-w-[140px]">
                          {char.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {char.race} · {char.class} Nv {char.level}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <span className="flex items-center gap-0.5 text-red-400">
                        <Heart className="w-3 h-3" /> {char.pvCurrent}
                      </span>
                      <span className="flex items-center gap-0.5 text-blue-400">
                        <Zap className="w-3 h-3" /> {char.pmCurrent}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Launch: Battlemaps */}
      {scenes.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-zinc-300" />
              <span>Campos de Batalha Prontos</span>
            </h2>
            <Link
              href="/vtt"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              Abrir VTT →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scenes.map((sc) => {
              const bgImage = sc.backgroundUrl || '/maps/dungeon_arena.svg';
              return (
                <Link key={sc.id} href="/vtt" className="group">
                  <Card className="overflow-hidden bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
                    <div className="relative h-24 w-full bg-zinc-950 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-[11px] font-semibold text-zinc-200">
                        {sc.name}
                      </div>
                      <div className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-zinc-800">
                        {sc.gridWidth}×{sc.gridHeight}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
