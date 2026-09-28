import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const token = await prisma.token.findUnique({
      where: { id: params.id },
      include: {
        initiativeEntry: true,
        character: true,
        scene: true,
      },
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: token });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json();

    const dataToUpdate: Record<string, unknown> = {};
    if (body.x !== undefined) dataToUpdate.x = Math.round(body.x);
    if (body.y !== undefined) dataToUpdate.y = Math.round(body.y);
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.size !== undefined) dataToUpdate.size = body.size;
    if (body.color !== undefined) dataToUpdate.color = body.color;
    if (body.avatarUrl !== undefined) dataToUpdate.avatarUrl = body.avatarUrl;
    if (body.pvCurrent !== undefined) dataToUpdate.pvCurrent = body.pvCurrent;
    if (body.pvMax !== undefined) dataToUpdate.pvMax = body.pvMax;
    if (body.elevation !== undefined) dataToUpdate.elevation = body.elevation;
    if (body.rotation !== undefined) dataToUpdate.rotation = body.rotation;
    if (body.conditionsJson !== undefined) {
      dataToUpdate.conditionsJson =
        typeof body.conditionsJson === 'string'
          ? body.conditionsJson
          : JSON.stringify(body.conditionsJson);
    }

    const token = await prisma.token.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: token });
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update token' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await prisma.token.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Token deleted' });
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete token' },
      { status: 500 }
    );
  }
}
