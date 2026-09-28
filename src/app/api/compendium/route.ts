/**
 * TRPG Platform — Interactive Compendium REST API
 * GET /api/compendium - Retrieve compendium items with filtering (search, system, type, circle)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const system = searchParams.get('system')?.trim().toUpperCase();
    const type = searchParams.get('type')?.trim().toUpperCase();
    const circleParam = searchParams.get('circle');

    const whereClause: Record<string, unknown> = {};

    if (system && ['T20', 'TRPG', 'ALL'].includes(system)) {
      whereClause.system = { in: [system, 'ALL'] };
    }

    if (type) {
      whereClause.type = type;
    }

    if (circleParam !== null && circleParam !== undefined) {
      const circleVal = parseInt(circleParam, 10);
      if (!isNaN(circleVal)) {
        whereClause.circle = circleVal;
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const items = await prisma.compendiumItem.findMany({
      where: whereClause,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Erro ao buscar itens do compêndio:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao recuperar itens do compêndio.' },
      { status: 500 }
    );
  }
}
