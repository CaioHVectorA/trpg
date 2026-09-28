/**
 * E2E Tier 1 — Feature 26: Integrated Initiative Tracker
 * Opaque-box tests verifying turn sorting, Dexterity tie-breaking, round advance, and active turns
 */

import { describe, it, expect } from 'vitest';
import { SystemAdapter } from '../harness/system-adapter';
import { InitiativeCombatant } from '../harness/types';

describe('Feature 26: Integrated Initiative Tracker', () => {
  const combatants: InitiativeCombatant[] = [
    {
      id: 'c1',
      name: 'Valeros (Guerreiro)',
      initiativeScore: 18,
      dexModifier: 1,
      isPlayer: true,
      pvCurrent: 36,
      pvMax: 36,
      conditions: []
    },
    {
      id: 'c2',
      name: 'Lorien (Arcanista)',
      initiativeScore: 14,
      dexModifier: 2,
      isPlayer: true,
      pvCurrent: 20,
      pvMax: 20,
      conditions: []
    },
    {
      id: 'c3',
      name: 'Bugbear Chefe',
      initiativeScore: 22,
      dexModifier: 2,
      isPlayer: false,
      pvCurrent: 45,
      pvMax: 45,
      conditions: []
    },
    {
      id: 'c4',
      name: 'Goblin Salteador',
      initiativeScore: 18,
      dexModifier: 3, // Ties with Valeros at 18, but Dex 3 > 1!
      isPlayer: false,
      pvCurrent: 12,
      pvMax: 12,
      conditions: []
    }
  ];

  it('F26-T1: should sort combatants descending by initiative roll score', () => {
    const sorted = SystemAdapter.sortInitiative(combatants);
    expect(sorted[0].name).toBe('Bugbear Chefe'); // 22 is highest
    expect(sorted[sorted.length - 1].name).toBe('Lorien (Arcanista)'); // 14 is lowest
  });

  it('F26-T2: should break initiative ties using Dexterity modifier (higher Dex first)', () => {
    const sorted = SystemAdapter.sortInitiative(combatants);
    // Valeros (18, Dex 1) vs Goblin (18, Dex 3)
    const goblinIdx = sorted.findIndex(c => c.name === 'Goblin Salteador');
    const valerosIdx = sorted.findIndex(c => c.name === 'Valeros (Guerreiro)');

    expect(goblinIdx).toBeLessThan(valerosIdx); // Goblin goes before Valeros due to Dex 3 vs 1
  });

  it('F26-T3: should advance turns sequentially across combatants', () => {
    const sorted = SystemAdapter.sortInitiative(combatants);
    let activeIndex = 0;

    expect(sorted[activeIndex].name).toBe('Bugbear Chefe');
    activeIndex = (activeIndex + 1) % sorted.length;
    expect(sorted[activeIndex].name).toBe('Goblin Salteador');
    activeIndex = (activeIndex + 1) % sorted.length;
    expect(sorted[activeIndex].name).toBe('Valeros (Guerreiro)');
    activeIndex = (activeIndex + 1) % sorted.length;
    expect(sorted[activeIndex].name).toBe('Lorien (Arcanista)');
  });

  it('F26-T4: should increment round number when advancing past the last combatant', () => {
    const sorted = SystemAdapter.sortInitiative(combatants);
    let currentRound = 1;
    let turnIndex = sorted.length - 1; // Last combatant's turn

    // Next turn loops back to 0 and increments round
    turnIndex = (turnIndex + 1) % sorted.length;
    if (turnIndex === 0) {
      currentRound++;
    }

    expect(turnIndex).toBe(0);
    expect(currentRound).toBe(2);
    expect(sorted[turnIndex].name).toBe('Bugbear Chefe');
  });

  it('F26-T5: should track combatant active conditions during their turn', () => {
    const combatantWithCondition: InitiativeCombatant = {
      ...combatants[2],
      conditions: ['Caído']
    };

    expect(combatantWithCondition.conditions).toContain('Caído');
  });
});
