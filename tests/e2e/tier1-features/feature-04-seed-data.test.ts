/**
 * E2E Tier 1 — Feature 4: Canonical Seed Dataset
 * Opaque-box tests verifying the presence and integrity of all 12 canonical seed entities
 */

import { describe, it, expect } from 'vitest';
import prisma from '../../../src/lib/db/prisma';

describe('Feature 4: Canonical Seed Dataset (12 Entities)', () => {
  it('F4-T1: should seed all 12 canonical entities into compendium database', async () => {
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
      'threat-bugbear-t20'
    ];

    const items = await prisma.compendiumItem.findMany({
      where: { id: { in: requiredEntityIds } }
    });
    expect(items.length).toBe(12);
  });

  it('F4-T2: should verify canonical races (Humano and Anão) attributes and traits', async () => {
    const humano = await prisma.compendiumItem.findUnique({ where: { id: 'race-humano-t20' } });
    const anao = await prisma.compendiumItem.findUnique({ where: { id: 'race-anao-t20' } });

    expect(humano?.name).toBe('Humano');
    expect(humano?.type).toBe('RACE');

    expect(anao?.name).toBe('Anão');
    expect(anao?.system).toBe('ALL');
    const anaoData = JSON.parse(anao!.dataJson);
    expect(anaoData.attributeModifiersT20.CON).toBe(2);
    expect(anaoData.attributeModifiersT20.SAB).toBe(1);
    expect(anaoData.attributeModifiersT20.DES).toBe(-1);
    expect(anaoData.attributeModifiersTRPG.CON).toBe(4);
  });

  it('F4-T3: should verify canonical classes (Guerreiro and Arcanista) PV/PM progressions', async () => {
    const guerreiro = await prisma.compendiumItem.findUnique({ where: { id: 'class-guerreiro-t20' } });
    const arcanista = await prisma.compendiumItem.findUnique({ where: { id: 'class-arcanista-t20' } });

    const gData = JSON.parse(guerreiro!.dataJson);
    expect(gData.basePV).toBe(20);
    expect(gData.pvPerLevel).toBe(5);
    expect(gData.basePM).toBe(3);

    const aData = JSON.parse(arcanista!.dataJson);
    expect(aData.basePV).toBe(8);
    expect(aData.pvPerLevel).toBe(2);
    expect(aData.basePM).toBe(6);
  });

  it('F4-T4: should verify canonical spells with circles, costs, and enhancements', async () => {
    const misseis = await prisma.compendiumItem.findUnique({ where: { id: 'spell-misseis-magicos-t20' } });
    const bolaDeFogo = await prisma.compendiumItem.findUnique({ where: { id: 'spell-bola-de-fogo-t20' } });
    const curar = await prisma.compendiumItem.findUnique({ where: { id: 'spell-curar-ferimentos-t20' } });

    expect(misseis?.circle).toBe(1);
    expect(bolaDeFogo?.circle).toBe(2);
    expect(curar?.circle).toBe(1);

    const mData = JSON.parse(misseis!.dataJson);
    expect(mData.basePMCost).toBe(1);
    expect(mData.enhancements.length).toBeGreaterThanOrEqual(1);

    const bData = JSON.parse(bolaDeFogo!.dataJson);
    expect(bData.basePMCost).toBe(3);
    expect(bData.damageFormula).toBe('6d6');
  });

  it('F4-T5: should verify equipment, powers, and threat stats in the seed database', async () => {
    const espada = await prisma.compendiumItem.findUnique({ where: { id: 'item-espada-longa' } });
    const cota = await prisma.compendiumItem.findUnique({ where: { id: 'item-cota-de-malha' } });
    const bugbear = await prisma.compendiumItem.findUnique({ where: { id: 'threat-bugbear-t20' } });

    const espadaData = JSON.parse(espada!.dataJson);
    expect(espadaData.damageDice).toBe('1d8');
    expect(espadaData.threatRange).toBe(19);
    expect(espadaData.critMultiplier).toBe(2);

    const cotaData = JSON.parse(cota!.dataJson);
    expect(cotaData.defenseBonus).toBe(6);
    expect(cotaData.armorPenalty).toBe(-2);
    expect(cotaData.isHeavy).toBe(true);

    const bugbearData = JSON.parse(bugbear!.dataJson);
    expect(bugbearData.defense).toBe(16);
    expect(bugbearData.pv).toBe(45);
    expect(bugbearData.challengeRating).toBe(2);
  });
});
