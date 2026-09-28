/**
 * TRPG Platform — Roll Log Persistence API
 * POST /api/rolls - Create a new roll record in the database
 * GET /api/rolls - Retrieve recent roll logs with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { evaluateDiceExpression } from '@/lib/dice';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      expression,
      campaignId,
      characterId,
      senderName = 'Jogador',
      system = 'T20',
      rollType = 'CUSTOM',
      threatMargin = 20,
      label
    } = body;

    if (!expression || typeof expression !== 'string' || !expression.trim()) {
      return NextResponse.json(
        { success: false, error: 'A expressão da rolagem é obrigatória.' },
        { status: 400 }
      );
    }

    let total = body.total;
    let diceBreakdown = body.diceBreakdown;
    let isCrit = body.isCrit;
    let isFumble = body.isFumble;
    let rollLabel = label;

    // If total or diceBreakdown was not provided, evaluate server-side
    if (total === undefined || diceBreakdown === undefined) {
      const evaluated = evaluateDiceExpression({
        formula: expression,
        threatRange: threatMargin,
        system: system as 'T20' | 'TRPG'
      });
      total = evaluated.total;
      diceBreakdown = JSON.stringify(evaluated.rolls);
      isCrit = evaluated.isCriticalHit;
      isFumble = evaluated.isFumble;
      rollLabel = rollLabel || evaluated.label;
    } else if (typeof diceBreakdown !== 'string') {
      diceBreakdown = JSON.stringify(diceBreakdown);
    }

    const rollLog = await prisma.rollLog.create({
      data: {
        campaignId: campaignId || null,
        characterId: characterId || null,
        senderName,
        system,
        rollType,
        expression: expression.trim(),
        diceBreakdown: diceBreakdown || '[]',
        total: Math.round(total),
        isCrit: Boolean(isCrit),
        isFumble: Boolean(isFumble),
        threatMargin: Number(threatMargin) || 20,
        label: rollLabel || null
      }
    });

    return NextResponse.json({ success: true, roll: rollLog }, { status: 201 });
  } catch (error) {
    console.error('Erro ao persistir rolagem:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao registrar rolagem de dados.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    const characterId = searchParams.get('characterId') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100) : 50;

    const rolls = await prisma.rollLog.findMany({
      where: {
        ...(campaignId ? { campaignId } : {}),
        ...(characterId ? { characterId } : {})
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ success: true, rolls });
  } catch (error) {
    console.error('Erro ao buscar histórico de rolagens:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao recuperar histórico de rolagens.' },
      { status: 500 }
    );
  }
}
