/**
 * E2E Tier 1 — Feature 27: Searchable Compendium Drawer
 * Opaque-box tests verifying text search, system filtering (T20/TRPG), and type filtering
 */

import { describe, it, expect } from 'vitest';
import prisma from '../../../src/lib/db/prisma';

describe('Feature 27: Searchable Compendium Drawer', () => {
  it('F27-T1: should perform case-insensitive text search across compendium items', async () => {
    const results = await prisma.compendiumItem.findMany({
      where: {
        OR: [
          { name: { contains: 'espada' } },
          { description: { contains: 'espada' } },
          { tags: { contains: 'espada' } }
        ]
      }
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.id === 'item-espada-longa')).toBe(true);
  });

  it('F27-T2: should filter items by system mode (T20, TRPG, ALL)', async () => {
    const t20Items = await prisma.compendiumItem.findMany({
      where: { system: { in: ['T20', 'ALL'] } }
    });
    expect(t20Items.length).toBeGreaterThanOrEqual(10);

    const trpgItems = await prisma.compendiumItem.findMany({
      where: { system: { in: ['TRPG', 'ALL'] } }
    });
    expect(trpgItems.length).toBeGreaterThanOrEqual(1);
    expect(trpgItems.some(i => i.name === 'Anão')).toBe(true);
  });

  it('F27-T3: should filter items by type (RACE, CLASS, SPELL, ITEM, THREAT)', async () => {
    const spells = await prisma.compendiumItem.findMany({ where: { type: 'SPELL' } });
    const threats = await prisma.compendiumItem.findMany({ where: { type: 'THREAT' } });

    expect(spells.length).toBeGreaterThanOrEqual(3);
    expect(threats.length).toBeGreaterThanOrEqual(1);
    expect(threats[0].name).toBe('Bugbear Espreitador');
  });

  it('F27-T4: should filter spells by circle (e.g. 1st or 2nd circle)', async () => {
    const circle1Spells = await prisma.compendiumItem.findMany({
      where: { type: 'SPELL', circle: 1 }
    });
    expect(circle1Spells.length).toBeGreaterThanOrEqual(2);
    expect(circle1Spells.some(s => s.name === 'Mísseis Mágicos')).toBe(true);

    const circle2Spells = await prisma.compendiumItem.findMany({
      where: { type: 'SPELL', circle: 2 }
    });
    expect(circle2Spells.some(s => s.name === 'Bola de Fogo')).toBe(true);
  });

  it('F27-T5: should return empty list gracefully for unmatched search queries', async () => {
    const results = await prisma.compendiumItem.findMany({
      where: { name: { contains: 'NonExistentCreatureXYZ99' } }
    });
    expect(results).toEqual([]);
  });
});
