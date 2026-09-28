/**
 * TRPG Platform — Character Resource Management REST API
 * GET /api/characters/[id] - Fetch a specific character
 * PUT or PATCH /api/characters/[id] - Update character fields and pools
 * DELETE /api/characters/[id] - Remove a character from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { calculateDerivedStats } from '@/lib/rules';
import { SystemMode, AttributeBlock, BaseSheet } from '@/lib/types';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { success: false, error: 'Personagem não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, character });
  } catch (error) {
    console.error('Erro ao buscar personagem por ID:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar personagem.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  return handleUpdate(req, params.id);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  return handleUpdate(req, params.id);
}

async function handleUpdate(req: NextRequest, id: string) {
  try {
    const existing = await prisma.character.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Personagem não encontrado.' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.system !== undefined) updateData.system = body.system === 'TRPG' ? 'TRPG' : 'T20';
    if (body.race !== undefined) updateData.race = String(body.race);
    if (body.class !== undefined) updateData.class = String(body.class);
    if (body.level !== undefined) updateData.level = Math.max(1, Number(body.level) || 1);
    if (body.isNpc !== undefined) updateData.isNpc = Boolean(body.isNpc);
    if (body.alignment !== undefined) updateData.alignment = body.alignment;
    if (body.deity !== undefined) updateData.deity = body.deity;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.campaignId !== undefined) updateData.campaignId = body.campaignId;

    // Attributes update
    let attributes: AttributeBlock | null = null;
    if (body.attributes && typeof body.attributes === 'object') {
      attributes = {
        FOR: Number(body.attributes.FOR) || 0,
        DES: Number(body.attributes.DES) || 0,
        CON: Number(body.attributes.CON) || 0,
        INT: Number(body.attributes.INT) || 0,
        SAB: Number(body.attributes.SAB) || 0,
        CAR: Number(body.attributes.CAR) || 0,
      };
      updateData.attributesJson = JSON.stringify(attributes);
    } else if (body.attributesJson !== undefined) {
      updateData.attributesJson = typeof body.attributesJson === 'string'
        ? body.attributesJson
        : JSON.stringify(body.attributesJson);
      try {
        attributes = JSON.parse(updateData.attributesJson as string);
      } catch {
        // keep existing
      }
    }

    // Skills
    if (Array.isArray(body.trainedSkills)) {
      updateData.skillsJson = JSON.stringify(body.trainedSkills);
    } else if (body.skillsJson !== undefined) {
      updateData.skillsJson = typeof body.skillsJson === 'string'
        ? body.skillsJson
        : JSON.stringify(body.skillsJson);
    }

    // Attacks, Spells, Powers, Inventory
    if (body.attacks !== undefined) {
      updateData.attacksJson = JSON.stringify(body.attacks);
    } else if (body.attacksJson !== undefined) {
      updateData.attacksJson = typeof body.attacksJson === 'string' ? body.attacksJson : JSON.stringify(body.attacksJson);
    }

    if (body.spells !== undefined) {
      updateData.spellsJson = JSON.stringify(body.spells);
    } else if (body.spellsJson !== undefined) {
      updateData.spellsJson = typeof body.spellsJson === 'string' ? body.spellsJson : JSON.stringify(body.spellsJson);
    }

    if (body.powers !== undefined) {
      updateData.powersJson = JSON.stringify(body.powers);
    } else if (body.powersJson !== undefined) {
      updateData.powersJson = typeof body.powersJson === 'string' ? body.powersJson : JSON.stringify(body.powersJson);
    }

    if (body.inventory !== undefined) {
      updateData.inventoryJson = JSON.stringify(body.inventory);
    } else if (body.inventoryJson !== undefined) {
      updateData.inventoryJson = typeof body.inventoryJson === 'string' ? body.inventoryJson : JSON.stringify(body.inventoryJson);
    }

    // Resource pools
    if (body.pvCurrent !== undefined) updateData.pvCurrent = Number(body.pvCurrent);
    if (body.pvMax !== undefined) updateData.pvMax = Number(body.pvMax);
    if (body.pvTemp !== undefined) updateData.pvTemp = Math.max(0, Number(body.pvTemp));
    if (body.pmCurrent !== undefined) updateData.pmCurrent = Math.max(0, Number(body.pmCurrent));
    if (body.pmMax !== undefined) updateData.pmMax = Math.max(0, Number(body.pmMax));
    if (body.defense !== undefined) updateData.defense = Number(body.defense);

    // If attributes, level, or equipment were modified without explicit pool overrides, recalculate
    if (body.recalculateDerived && (attributes || body.level !== undefined || body.class !== undefined)) {
      const activeAttrs: AttributeBlock = attributes || JSON.parse(existing.attributesJson || '{}');
      let activeTrainedSkills: string[] = [];
      try {
        const parsed = JSON.parse((updateData.skillsJson as string) || existing.skillsJson || '[]');
        if (Array.isArray(parsed)) activeTrainedSkills = parsed;
        else if (typeof parsed === 'object') activeTrainedSkills = Object.keys(parsed).filter(k => parsed[k]?.trained);
      } catch {
        activeTrainedSkills = [];
      }

      const sheetForCalc: BaseSheet = {
        name: (updateData.name as string) || existing.name,
        system: ((updateData.system as string) || existing.system) as SystemMode,
        level: (updateData.level as number) || existing.level,
        race: (updateData.race as string) || existing.race,
        class: (updateData.class as string) || existing.class,
        attributes: activeAttrs,
        trainedSkills: activeTrainedSkills,
        armorBonus: Number(body.armorBonus) || 0,
        shieldBonus: Number(body.shieldBonus) || 0,
        isHeavyArmor: Boolean(body.isHeavyArmor),
        maxDexterity: body.maxDexterity !== undefined ? Number(body.maxDexterity) : undefined,
        armorPenalty: Number(body.armorPenalty) || 0,
        shieldPenalty: Number(body.shieldPenalty) || 0,
        inventoryWeightSlots: Number(body.inventoryWeightSlots) || 0,
      };

      const derived = calculateDerivedStats(sheetForCalc);
      if (body.pvMax === undefined) updateData.pvMax = derived.pvMax;
      if (body.pmMax === undefined) updateData.pmMax = derived.pmMax;
      if (body.defense === undefined) updateData.defense = derived.defense;
    }

    const updated = await prisma.character.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, character: updated });
  } catch (error) {
    console.error('Erro ao atualizar personagem:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar personagem.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    const existing = await prisma.character.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Personagem não encontrado.' },
        { status: 404 }
      );
    }

    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Personagem removido com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao remover personagem:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao remover personagem.' },
      { status: 500 }
    );
  }
}
