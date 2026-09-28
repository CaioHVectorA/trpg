import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const scene = await prisma.scene.findUnique({
      where: { id: params.id },
      include: {
        tokens: true,
        initiative: true,
      },
    });

    if (!scene) {
      return NextResponse.json(
        { success: false, error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: scene });
  } catch (error) {
    console.error('Error fetching scene:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scene' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json();
    const scene = await prisma.scene.update({
      where: { id: params.id },
      data: {
        name: body.name,
        gridWidth: body.gridWidth,
        gridHeight: body.gridHeight,
        cellSizePx: body.cellSizePx,
        meterPerSquare: body.meterPerSquare,
        backgroundUrl: body.backgroundUrl,
        gridColor: body.gridColor,
        gridOpacity: body.gridOpacity,
        isCurrent: body.isCurrent,
        fogDataJson: body.fogDataJson,
      },
      include: {
        tokens: true,
        initiative: true,
      },
    });

    return NextResponse.json({ success: true, data: scene });
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update scene' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await prisma.scene.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Scene deleted' });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete scene' },
      { status: 500 }
    );
  }
}
