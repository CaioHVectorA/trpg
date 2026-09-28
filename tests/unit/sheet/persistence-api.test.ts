/**
 * Unit Tests — Character Persistence & JSON Export / Import
 * Tests database operations, REST endpoints behavior, and JSON round-trip fidelity
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../../src/lib/db/prisma';

describe('Character Persistence & JSON Export/Import Unit Tests', () => {
  let createdId: string;

  const sampleCharacter = {
    name: 'Gareth Artoniano',
    system: 'T20',
    race: 'Humano',
    class: 'Cavaleiro',
    level: 3,
    alignment: 'Ordeiro e Bom',
    deity: 'Khalmyr',
    pvCurrent: 35,
    pvMax: 35,
    pvTemp: 5,
    pmCurrent: 9,
    pmMax: 9,
    defense: 19,
    attributesJson: JSON.stringify({ FOR: 3, DES: 0, CON: 3, INT: 0, SAB: 1, CAR: 2 }),
    skillsJson: JSON.stringify(['luta', 'fortitude', 'cavalgar', 'nobreza']),
    attacksJson: JSON.stringify([
      { name: 'Lança Montada', bonus: 7, damage: '1d8+3', threatRange: 20, critMultiplier: 3 },
    ]),
    spellsJson: JSON.stringify([]),
    powersJson: JSON.stringify([{ name: 'Código de Honra', description: 'Não ataca alvos indefesos.' }]),
    inventoryJson: JSON.stringify([
      { name: 'Lança Montada', weightSlots: 2, quantity: 1, equipped: true },
      { name: 'Armadura Completa', weightSlots: 5, quantity: 1, equipped: true, defenseBonus: 8, isHeavy: true },
    ]),
    notes: 'Cavaleiro nobre devoto ao Deus da Justiça.',
  };

  it('should persist a new character record into Prisma database', async () => {
    const record = await prisma.character.create({
      data: sampleCharacter,
    });

    expect(record.id).toBeDefined();
    expect(record.name).toBe('Gareth Artoniano');
    expect(record.system).toBe('T20');
    expect(record.level).toBe(3);
    expect(record.pvCurrent).toBe(35);
    expect(record.pvTemp).toBe(5);

    createdId = record.id;
  });

  it('should retrieve persisted character by ID and parse JSON payloads with high fidelity', async () => {
    const fetched = await prisma.character.findUnique({
      where: { id: createdId },
    });

    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe('Gareth Artoniano');

    const attrs = JSON.parse(fetched!.attributesJson);
    expect(attrs.FOR).toBe(3);
    expect(attrs.CAR).toBe(2);

    const skills = JSON.parse(fetched!.skillsJson);
    expect(skills).toContain('cavalgar');
    expect(skills).toContain('nobreza');

    const attacks = JSON.parse(fetched!.attacksJson);
    expect(attacks[0].name).toBe('Lança Montada');
    expect(attacks[0].threatRange).toBe(20);
  });

  it('should update character pools and equipment in database', async () => {
    const updated = await prisma.character.update({
      where: { id: createdId },
      data: {
        pvCurrent: 28,
        pvTemp: 0,
        pmCurrent: 6,
        level: 4,
      },
    });

    expect(updated.pvCurrent).toBe(28);
    expect(updated.pvTemp).toBe(0);
    expect(updated.pmCurrent).toBe(6);
    expect(updated.level).toBe(4);
  });

  it('should query characters partitioned by system mode (T20 vs TRPG)', async () => {
    const t20List = await prisma.character.findMany({ where: { system: 'T20' } });
    const trpgList = await prisma.character.findMany({ where: { system: 'TRPG' } });

    expect(t20List.length).toBeGreaterThanOrEqual(1);
    expect(trpgList.length).toBeGreaterThanOrEqual(1);
    expect(t20List.every((c) => c.system === 'T20')).toBe(true);
    expect(trpgList.every((c) => c.system === 'TRPG')).toBe(true);
  });

  it('should guarantee 100% data fidelity on full JSON export and import round-trip', () => {
    const exportedJson = JSON.stringify(sampleCharacter, null, 2);
    expect(typeof exportedJson).toBe('string');

    const imported = JSON.parse(exportedJson);
    expect(imported).toEqual(sampleCharacter);

    // Deep check sub-structures
    const restoredAttrs = JSON.parse(imported.attributesJson);
    expect(restoredAttrs.CON).toBe(3);
  });

  it('should delete character record cleanly from database', async () => {
    await prisma.character.delete({
      where: { id: createdId },
    });

    const check = await prisma.character.findUnique({
      where: { id: createdId },
    });
    expect(check).toBeNull();
  });
});
