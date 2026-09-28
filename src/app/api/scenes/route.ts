import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    const scenes = await prisma.scene.findMany({
      where: campaignId ? { campaignId } : undefined,
      include: {
        tokens: true,
        initiative: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: scenes });
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      campaignId,
      gridWidth = 20,
      gridHeight = 20,
      cellSizePx = 50,
      meterPerSquare = 1.5,
      backgroundUrl = '/maps/dungeon_arena.svg',
      gridColor = 'rgba(255,255,255,0.15)',
      gridOpacity = 0.5,
      isCurrent = false,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Scene name is required' },
        { status: 400 }
      );
    }

    const scene = await prisma.scene.create({
      data: {
        name,
        campaignId,
        gridWidth,
        gridHeight,
        cellSizePx,
        meterPerSquare,
        backgroundUrl,
        gridColor,
        gridOpacity,
        isCurrent,
      },
      include: {
        tokens: true,
        initiative: true,
      },
    });

    return NextResponse.json({ success: true, data: scene }, { status: 201 });
  } catch (error) {
    console.error('Error creating scene:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create scene' },
      { status: 500 }
    );
  }
}
