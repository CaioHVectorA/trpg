import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../src/lib/db/prisma';

describe('Milestone M1 Foundation & Persistence Test Suite', () => {
  it('should successfully connect to Prisma and query the database', async () => {
    const compendiumCount = await prisma.compendiumItem.count();
    expect(compendiumCount).toBeGreaterThanOrEqual(12);
  });

  it('should contain all 12 canonical seed entities with valid attributes and schemas', async () => {
    const requiredEntityIds = [
      'race-humano-t20',
      'race-anao-t20',
      'class-guerreiro-t20',
      'class-arcanista-t20',
      'spell-misseis-magicos-t20',
      'spell-bola-de-fogo-t20',
      'spell-curar-ferimentos-t20',
      'power-ataque-poderoso-t20',
      'power-esquiva-t20',
      'item-espada-longa',
      'item-cota-de-malha',
      'threat-bugbear-t20',
    ];

    const items = await prisma.compendiumItem.findMany({
      where: { id: { in: requiredEntityIds } },
    });

    expect(items.length).toBe(12);

    const itemMap = new Map(items.map((i) => [i.id, i]));

    // 1. Humano
    const humano = itemMap.get('race-humano-t20');
    expect(humano).toBeDefined();
    expect(humano?.type).toBe('RACE');
    expect(humano?.name).toBe('Humano');

    // 2. Anão
    const anao = itemMap.get('race-anao-t20');
    expect(anao).toBeDefined();
    expect(anao?.system).toBe('ALL');

    // 3. Guerreiro
    const guerreiro = itemMap.get('class-guerreiro-t20');
    expect(guerreiro).toBeDefined();
    expect(guerreiro?.type).toBe('CLASS');
    const guerreiroData = JSON.parse(guerreiro!.dataJson);
    expect(guerreiroData.basePV).toBe(20);
    expect(guerreiroData.basePM).toBe(3);

    // 4. Arcanista
    const arcanista = itemMap.get('class-arcanista-t20');
    expect(arcanista).toBeDefined();
    const arcanistaData = JSON.parse(arcanista!.dataJson);
    expect(arcanistaData.basePV).toBe(8);
    expect(arcanistaData.basePM).toBe(6);

    // 5. Mísseis Mágicos
    const misseis = itemMap.get('spell-misseis-magicos-t20');
    expect(misseis).toBeDefined();
    expect(misseis?.circle).toBe(1);

    // 6. Bola de Fogo
    const bolaDeFogo = itemMap.get('spell-bola-de-fogo-t20');
    expect(bolaDeFogo).toBeDefined();
    expect(bolaDeFogo?.circle).toBe(2);

    // 7. Curar Ferimentos
    const curar = itemMap.get('spell-curar-ferimentos-t20');
    expect(curar).toBeDefined();
    expect(curar?.circle).toBe(1);

    // 8. Ataque Poderoso
    const ataquePoderoso = itemMap.get('power-ataque-poderoso-t20');
    expect(ataquePoderoso).toBeDefined();
    expect(ataquePoderoso?.type).toBe('POWER');

    // 9. Esquiva
    const esquiva = itemMap.get('power-esquiva-t20');
    expect(esquiva).toBeDefined();
    expect(esquiva?.type).toBe('POWER');

    // 10. Espada Longa
    const espada = itemMap.get('item-espada-longa');
    expect(espada).toBeDefined();
    expect(espada?.type).toBe('ITEM');
    const espadaData = JSON.parse(espada!.dataJson);
    expect(espadaData.threatRange).toBe(19);

    // 11. Cota de Malha
    const cota = itemMap.get('item-cota-de-malha');
    expect(cota).toBeDefined();
    const cotaData = JSON.parse(cota!.dataJson);
    expect(cotaData.defenseBonus).toBe(6);

    // 12. Bugbear Espreitador
    const bugbear = itemMap.get('threat-bugbear-t20');
    expect(bugbear).toBeDefined();
    expect(bugbear?.type).toBe('THREAT');
    const bugbearData = JSON.parse(bugbear!.dataJson);
    expect(bugbearData.challengeRating).toBe(2);
    expect(bugbearData.pv).toBe(45);
  });

  it('should verify dual-system character records in the database', async () => {
    const characters = await prisma.character.findMany();
    expect(characters.length).toBeGreaterThanOrEqual(2);

    const t20Char = characters.find((c) => c.system === 'T20');
    expect(t20Char).toBeDefined();
    expect(t20Char?.name).toBe('Valeros de Valkaria');
    const t20Attrs = JSON.parse(t20Char!.attributesJson);
    expect(t20Attrs.FOR).toBe(3); // Direct modifier

    const trpgChar = characters.find((c) => c.system === 'TRPG');
    expect(trpgChar).toBeDefined();
    expect(trpgChar?.name).toBe('Lorien de Lenórienn');
    const trpgAttrs = JSON.parse(trpgChar!.attributesJson);
    expect(trpgAttrs.INT).toBe(18); // 3-18 Classic score
  });

  it('should verify tactical VTT scenes, tokens, and initiative records', async () => {
    const scene = await prisma.scene.findFirst({
      where: { isCurrent: true },
      include: { tokens: true, initiative: true },
    });

    expect(scene).toBeDefined();
    expect(scene?.gridWidth).toBe(20);
    expect(scene?.gridHeight).toBe(16);
    expect(scene?.meterPerSquare).toBe(1.5);
    expect(scene?.tokens.length).toBeGreaterThanOrEqual(2);
    expect(scene?.initiative.length).toBeGreaterThanOrEqual(2);
  });
});
