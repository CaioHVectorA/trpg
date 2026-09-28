/**
 * TRPG Platform — Character Persistence REST API
 * POST /api/characters - Create a new character in the database
 * GET /api/characters - Retrieve characters with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { calculateDerivedStats } from '@/lib/rules';
import { SystemMode, AttributeBlock, BaseSheet } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const system = searchParams.get('system') as SystemMode | null;
    const campaignId = searchParams.get('campaignId') || undefined;
    const isNpcParam = searchParams.get('isNpc');
    const search = searchParams.get('search')?.trim();

    const whereClause: Record<string, unknown> = {};

    if (system && (system === 'T20' || system === 'TRPG')) {
      whereClause.system = system;
    }

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    if (isNpcParam !== null && isNpcParam !== undefined) {
      whereClause.isNpc = isNpcParam === 'true';
    }

    if (search) {
      whereClause.name = {
        contains: search,
      };
    }

    const characters = await prisma.character.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, characters });
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao recuperar lista de personagens.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      system = 'T20',
      race = 'Humano',
      class: characterClass = 'Guerreiro',
      level = 1,
      isNpc = false,
      alignment,
      deity,
      avatarUrl,
      notes,
      campaignId,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'O nome do personagem é obrigatório.' },
        { status: 400 }
      );
    }

    const validSystem: SystemMode = system === 'TRPG' ? 'TRPG' : 'T20';

    // Parse or default attributes
    let attributes: AttributeBlock;
    if (body.attributes && typeof body.attributes === 'object') {
      attributes = {
        FOR: Number(body.attributes.FOR) || 0,
        DES: Number(body.attributes.DES) || 0,
        CON: Number(body.attributes.CON) || 0,
        INT: Number(body.attributes.INT) || 0,
        SAB: Number(body.attributes.SAB) || 0,
        CAR: Number(body.attributes.CAR) || 0,
      };
    } else if (body.attributesJson && typeof body.attributesJson === 'string') {
      try {
        attributes = JSON.parse(body.attributesJson);
      } catch {
        attributes = validSystem === 'T20'
          ? { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 1, CAR: -1 }
          : { FOR: 16, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 8 };
      }
    } else {
      attributes = validSystem === 'T20'
        ? { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 1, CAR: -1 }
        : { FOR: 16, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 8 };
    }

    // Parse trained skills
    let trainedSkills: string[] = [];
    if (Array.isArray(body.trainedSkills)) {
      trainedSkills = body.trainedSkills;
    } else if (body.skillsJson && typeof body.skillsJson === 'string') {
      try {
        const parsed = JSON.parse(body.skillsJson);
        if (Array.isArray(parsed)) {
          trainedSkills = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          trainedSkills = Object.keys(parsed).filter((k) => parsed[k]?.trained);
        }
      } catch {
        trainedSkills = [];
      }
    }

    // Equipment properties for defense and penalty
    const armorBonus = Number(body.armorBonus) || 0;
    const shieldBonus = Number(body.shieldBonus) || 0;
    const isHeavyArmor = Boolean(body.isHeavyArmor);
    const maxDexterity = body.maxDexterity !== undefined ? Number(body.maxDexterity) : undefined;
    const armorPenalty = Number(body.armorPenalty) || 0;
    const shieldPenalty = Number(body.shieldPenalty) || 0;
    const inventoryWeightSlots = Number(body.inventoryWeightSlots) || 0;

    // Calculate derived stats dynamically if not explicitly provided
    const baseSheet: BaseSheet = {
      name: name.trim(),
      system: validSystem,
      level: Math.max(1, Number(level) || 1),
      race,
      class: characterClass,
      attributes,
      trainedSkills,
      armorBonus,
      shieldBonus,
      isHeavyArmor,
      maxDexterity,
      armorPenalty,
      shieldPenalty,
      inventoryWeightSlots,
    };

    const derived = calculateDerivedStats(baseSheet);

    const pvMax = Number(body.pvMax) > 0 ? Number(body.pvMax) : derived.pvMax;
    const pvCurrent = body.pvCurrent !== undefined ? Number(body.pvCurrent) : pvMax;
    const pvTemp = Math.max(0, Number(body.pvTemp) || 0);

    const pmMax = Number(body.pmMax) >= 0 ? Number(body.pmMax) : derived.pmMax;
    const pmCurrent = body.pmCurrent !== undefined ? Number(body.pmCurrent) : pmMax;

    const defense = body.defense !== undefined ? Number(body.defense) : derived.defense;

    // Stringify JSON payloads
    const attributesJson = typeof body.attributesJson === 'string'
      ? body.attributesJson
      : JSON.stringify(attributes);

    const skillsJson = typeof body.skillsJson === 'string'
      ? body.skillsJson
      : JSON.stringify(trainedSkills);

    const attacksJson = typeof body.attacksJson === 'string'
      ? body.attacksJson
      : JSON.stringify(Array.isArray(body.attacks) ? body.attacks : []);

    const spellsJson = typeof body.spellsJson === 'string'
      ? body.spellsJson
      : JSON.stringify(Array.isArray(body.spells) ? body.spells : []);

    const powersJson = typeof body.powersJson === 'string'
      ? body.powersJson
      : JSON.stringify(Array.isArray(body.powers) ? body.powers : []);

    const inventoryJson = typeof body.inventoryJson === 'string'
      ? body.inventoryJson
      : JSON.stringify(Array.isArray(body.inventory) ? body.inventory : []);

    const character = await prisma.character.create({
      data: {
        name: name.trim(),
        system: validSystem,
        race,
        class: characterClass,
        level: Math.max(1, Number(level) || 1),
        isNpc: Boolean(isNpc),
        alignment: alignment || null,
        deity: deity || null,
        avatarUrl: avatarUrl || null,
        notes: notes || null,
        campaignId: campaignId || null,
        pvCurrent,
        pvMax,
        pvTemp,
        pmCurrent,
        pmMax,
        defense,
        attributesJson,
        skillsJson,
        attacksJson,
        spellsJson,
        powersJson,
        inventoryJson,
      },
    });

    return NextResponse.json({ success: true, character }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao criar personagem no banco de dados.' },
      { status: 500 }
    );
  }
}
