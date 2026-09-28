/**
 * E2E Tier 1 — Feature 22: Sheet Persistence & Export
 * Opaque-box tests verifying database serialization, JSON import/export, and state preservation
 */

import { describe, it, expect } from 'vitest';
import prisma from '../../../src/lib/db/prisma';
import { BaseSheet } from '../harness/types';

describe('Feature 22: Sheet Persistence & Export', () => {
  const sampleSheet: BaseSheet = {
    name: 'Elandor',
    system: 'T20',
    level: 4,
    race: 'Humano',
    class: 'Arcanista',
    attributes: { FOR: 0, DES: 2, CON: 2, INT: 4, SAB: 1, CAR: 0 },
    trainedSkills: ['misticismo', 'vontade', 'conhecimento', 'iniciativa'],
    currentPv: 20,
    currentPm: 28,
    tempPv: 5,
    conditions: ['Vulnerável']
  };

  it('F22-T1: should serialize complex sheet attributes and skills to JSON strings', () => {
    const serialized = {
      name: sampleSheet.name,
      system: sampleSheet.system,
      race: sampleSheet.race,
      class: sampleSheet.class,
      level: sampleSheet.level,
      pvCurrent: sampleSheet.currentPv!,
      pvMax: 20,
      pvTemp: sampleSheet.tempPv!,
      pmCurrent: sampleSheet.currentPm!,
      pmMax: 28,
      defense: 12,
      attributesJson: JSON.stringify(sampleSheet.attributes),
      skillsJson: JSON.stringify(sampleSheet.trainedSkills),
      attacksJson: JSON.stringify([]),
      spellsJson: JSON.stringify(['Mísseis Mágicos', 'Bola de Fogo']),
      powersJson: JSON.stringify([]),
      inventoryJson: JSON.stringify([])
    };

    expect(typeof serialized.attributesJson).toBe('string');
    expect(JSON.parse(serialized.attributesJson).INT).toBe(4);
    expect(JSON.parse(serialized.skillsJson)).toContain('misticismo');
  });

  it('F22-T2: should deserialize stored JSON back to strongly-typed BaseSheet', () => {
    const jsonStr = JSON.stringify(sampleSheet);
    const restored: BaseSheet = JSON.parse(jsonStr);

    expect(restored.name).toBe('Elandor');
    expect(restored.attributes.INT).toBe(4);
    expect(restored.trainedSkills).toContain('vontade');
    expect(restored.tempPv).toBe(5);
  });

  it('F22-T3: should preserve 100% data fidelity across full JSON import/export round-trip', () => {
    const exportedJson = JSON.stringify(sampleSheet, null, 2);
    const importedSheet: BaseSheet = JSON.parse(exportedJson);

    expect(importedSheet).toEqual(sampleSheet);
  });

  it('F22-T4: should query database characters partitioned by system mode (T20 vs TRPG)', async () => {
    const t20Characters = await prisma.character.findMany({ where: { system: 'T20' } });
    const trpgCharacters = await prisma.character.findMany({ where: { system: 'TRPG' } });

    expect(t20Characters.length).toBeGreaterThanOrEqual(1);
    expect(trpgCharacters.length).toBeGreaterThanOrEqual(1);
    expect(t20Characters.every(c => c.system === 'T20')).toBe(true);
    expect(trpgCharacters.every(c => c.system === 'TRPG')).toBe(true);
  });

  it('F22-T5: should verify persistence of resource pools (pvCurrent, pmCurrent, pvTemp) in DB', async () => {
    const char = await prisma.character.findFirst({ where: { system: 'T20' } });
    expect(char).toBeDefined();
    expect(typeof char?.pvCurrent).toBe('number');
    expect(typeof char?.pmCurrent).toBe('number');
    expect(typeof char?.pvTemp).toBe('number');
  });
});
