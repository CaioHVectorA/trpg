import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getCompendium } from '@/app/api/compendium/route';
import prisma from '@/lib/db/prisma';

describe('Interactive Compendium REST API', () => {
  const createdIds: string[] = [];

  beforeEach(async () => {
    // Seed test compendium items
    const item1 = await prisma.compendiumItem.create({
      data: {
        system: 'T20',
        type: 'SPELL',
        name: 'Mísseis Mágicos de Teste',
        description: 'Dispara dardos de energia arcana',
        category: 'Magia Arcana',
        circle: 1,
        cost: '1 PM',
        tags: 'dano,essencia,arcana',
        dataJson: JSON.stringify({ circle: 1 }),
      },
    });
    createdIds.push(item1.id);

    const item2 = await prisma.compendiumItem.create({
      data: {
        system: 'TRPG',
        type: 'ITEM',
        name: 'Espada de Aço Valiriano',
        description: 'Lâmina afiada lendária',
        category: 'Arma Marcial',
        cost: '1000 T$',
        tags: 'arma,corte,marcial',
        dataJson: JSON.stringify({ damage: '1d10' }),
      },
    });
    createdIds.push(item2.id);
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prisma.compendiumItem.deleteMany({
        where: { id: { in: createdIds } },
      });
      createdIds.length = 0;
    }
  });

  it('GET /api/compendium: should return all compendium items when no filter is applied', async () => {
    const req = new NextRequest('http://localhost:3000/api/compendium');
    const res = await getCompendium(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.items.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/compendium: should filter items by system mode', async () => {
    const req = new NextRequest('http://localhost:3000/api/compendium?system=T20');
    const res = await getCompendium(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.items.some((i: { name: string }) => i.name === 'Mísseis Mágicos de Teste')).toBe(true);
    expect(json.items.some((i: { name: string }) => i.name === 'Espada de Aço Valiriano')).toBe(false);
  });

  it('GET /api/compendium: should filter items by item type', async () => {
    const req = new NextRequest('http://localhost:3000/api/compendium?type=SPELL');
    const res = await getCompendium(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.items.every((i: { type: string }) => i.type === 'SPELL')).toBe(true);
  });

  it('GET /api/compendium: should filter spells by circle', async () => {
    const req = new NextRequest('http://localhost:3000/api/compendium?type=SPELL&circle=1');
    const res = await getCompendium(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.items.some((i: { name: string }) => i.name === 'Mísseis Mágicos de Teste')).toBe(true);
  });

  it('GET /api/compendium: should search by text query', async () => {
    const req = new NextRequest('http://localhost:3000/api/compendium?search=Valiriano');
    const res = await getCompendium(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.items.length).toBe(1);
    expect(json.items[0].name).toBe('Espada de Aço Valiriano');
  });
});
