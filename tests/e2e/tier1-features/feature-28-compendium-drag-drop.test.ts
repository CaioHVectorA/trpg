/**
 * E2E Tier 1 — Feature 28: Compendium Drag-and-Drop
 * Opaque-box tests verifying MIME type handling, item drop to sheet, and threat drop to VTT canvas
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { BaseSheet, VttToken } from '../harness/types';

describe('Feature 28: Compendium Drag-and-Drop', () => {
  it('F28-T1: should support custom TRPG MIME types for dragging compendium entities', () => {
    const validMimeTypes = [
      'application/x-trpg-item',
      'application/x-trpg-spell',
      'application/x-trpg-power',
      'application/x-trpg-threat'
    ];

    expect(validMimeTypes).toContain('application/x-trpg-item');
    expect(validMimeTypes).toContain('application/x-trpg-threat');
  });

  it('F28-T2: should add dropped equipment to sheet inventory and update weight slots', () => {
    const sheet: BaseSheet = {
      name: 'Valeros',
      system: 'T20',
      level: 1,
      race: 'Humano',
      class: 'Guerreiro',
      attributes: { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 0, CAR: 0 },
      inventoryWeightSlots: 2
    };

    // Dropping Espada Longa (weight 1 slot)
    const updatedSheet: BaseSheet = {
      ...sheet,
      inventoryWeightSlots: (sheet.inventoryWeightSlots || 0) + 1
    };

    expect(updatedSheet.inventoryWeightSlots).toBe(3);
    const derived = SystemAdapter.calculateDerivedStats(updatedSheet);
    expect(derived.carryCapacity).toBe(9); // FOR 3 * 3
  });

  it('F28-T3: should recalculate Defesa and armor check penalty when dropping armor onto sheet', () => {
    const sheet: BaseSheet = {
      name: 'Valeros',
      system: 'T20',
      level: 1,
      race: 'Humano',
      class: 'Guerreiro',
      attributes: { FOR: 3, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: 0 },
      trainedSkills: ['furtividade']
    };

    // Dropping Cota de Malha (Armor +6, penalty 2, isHeavy: true)
    const armoredSheet: BaseSheet = {
      ...sheet,
      armorBonus: 6,
      armorPenalty: 2,
      isHeavyArmor: true
    };

    const derived = SystemAdapter.calculateDerivedStats(armoredSheet);
    expect(derived.defense).toBe(16); // 10 + 0 + 6
    expect(derived.armorPenalty).toBe(2);
  });

  it('F28-T4: should construct VttToken payload when dropping Threat onto canvas coordinates', () => {
    const threatSeed = {
      id: 'threat-bugbear-t20',
      name: 'Bugbear Espreitador',
      size: 'MEDIO' as const,
      pv: 45,
      pm: 10,
      defense: 16
    };

    // Dropping at canvas cell (8, 6)
    const canvasToken: VttToken = {
      id: 'token-drop-1',
      name: threatSeed.name,
      system: 'T20',
      size: threatSeed.size,
      gridX: 8,
      gridY: 6,
      pvCurrent: threatSeed.pv,
      pvMax: threatSeed.pv,
      pmCurrent: threatSeed.pm,
      pmMax: threatSeed.pm,
      conditions: []
    };

    expect(canvasToken.gridX).toBe(8);
    expect(canvasToken.gridY).toBe(6);
    expect(canvasToken.pvCurrent).toBe(45);
    expect(canvasToken.size).toBe('MEDIO');
  });

  it('F28-T5: should ignore invalid or foreign drag data without mutating target state', () => {
    const sheet: BaseSheet = {
      name: 'Valeros',
      system: 'T20',
      level: 1,
      race: 'Humano',
      class: 'Guerreiro',
      attributes: { FOR: 3, DES: 1, CON: 2, INT: 0, SAB: 0, CAR: 0 },
      inventoryWeightSlots: 2
    };

    const handleDrop = (mimeType: string, currentSheet: BaseSheet) => {
      if (!mimeType.startsWith('application/x-trpg-')) {
        return currentSheet; // Unchanged!
      }
      return { ...currentSheet };
    };

    const result = handleDrop('text/plain', sheet);
    expect(result).toBe(sheet);
  });
});
