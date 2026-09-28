import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('sceneId');

    const tokens = await prisma.token.findMany({
      where: sceneId ? { sceneId } : undefined,
      include: {
        initiativeEntry: true,
        character: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sceneId,
      name,
      characterId,
      x = 0,
      y = 0,
      size = 'MEDIUM',
      color = '#D4AF37',
      avatarUrl,
      pvCurrent = 20,
      pvMax = 20,
      elevation = 0.0,
      rotation = 0,
      conditionsJson = '[]',
    } = body;

    if (!sceneId || !name) {
      return NextResponse.json(
        { success: false, error: 'sceneId and name are required' },
        { status: 400 }
      );
    }

    // Verify scene exists
    const sceneExists = await prisma.scene.findUnique({
      where: { id: sceneId },
    });

    if (!sceneExists) {
      return NextResponse.json(
        { success: false, error: 'Target scene not found' },
        { status: 404 }
      );
    }

    const token = await prisma.token.create({
      data: {
        sceneId,
        characterId,
        name,
        x: Math.round(x),
        y: Math.round(y),
        size,
        color,
        avatarUrl,
        pvCurrent,
        pvMax,
        elevation,
        rotation,
        conditionsJson:
          typeof conditionsJson === 'string'
            ? conditionsJson
            : JSON.stringify(conditionsJson),
      },
    });

    return NextResponse.json({ success: true, data: token }, { status: 201 });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create token' },
      { status: 500 }
    );
  }
}
