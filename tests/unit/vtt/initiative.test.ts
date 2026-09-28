import { describe, it, expect } from 'vitest';
import {
  sortInitiative,
  advanceTurn,
  previousTurn,
  rollInitiative,
} from '@/lib/vtt/initiative';
import { InitiativeCombatant } from '@/lib/types';

describe('VTT Initiative Tracker', () => {
  const sampleCombatants: InitiativeCombatant[] = [
    {
      id: 'c1',
      name: 'Guerreiro',
      initiativeScore: 15,
      dexModifier: 1,
      isPlayer: true,
      pvCurrent: 30,
      pvMax: 30,
      conditions: [],
    },
    {
      id: 'c2',
      name: 'Ladino',
      initiativeScore: 18,
      dexModifier: 4,
      isPlayer: true,
      pvCurrent: 20,
      pvMax: 20,
      conditions: [],
    },
    {
      id: 'c3',
      name: 'Arcanista',
      initiativeScore: 15,
      dexModifier: 3, // Ties with Guerreiro at 15, but Dex 3 > 1!
      isPlayer: true,
      pvCurrent: 14,
      pvMax: 14,
      conditions: [],
    },
    {
      id: 'c4',
      name: 'Ogro Chefe',
      initiativeScore: 22,
      dexModifier: 0,
      isPlayer: false,
      pvCurrent: 60,
      pvMax: 60,
      conditions: [],
    },
  ];

  describe('sortInitiative', () => {
    it('should sort in descending order of initiative score', () => {
      const sorted = sortInitiative(sampleCombatants);
      expect(sorted[0].name).toBe('Ogro Chefe'); // 22
      expect(sorted[1].name).toBe('Ladino');     // 18
    });

    it('should break ties using Dexterity modifier', () => {
      const sorted = sortInitiative(sampleCombatants);
      // Arcanista (15, Dex 3) vs Guerreiro (15, Dex 1)
      const arcanistaIdx = sorted.findIndex((c) => c.name === 'Arcanista');
      const guerreiroIdx = sorted.findIndex((c) => c.name === 'Guerreiro');
      expect(arcanistaIdx).toBeLessThan(guerreiroIdx);
    });

    it('should maintain stable ordering when score and Dex modifier are identical', () => {
      const twins: InitiativeCombatant[] = [
        {
          id: 'twin-b',
          name: 'Goblin B',
          initiativeScore: 12,
          dexModifier: 2,
          isPlayer: false,
          pvCurrent: 10,
          pvMax: 10,
          conditions: [],
        },
        {
          id: 'twin-a',
          name: 'Goblin A',
          initiativeScore: 12,
          dexModifier: 2,
          isPlayer: false,
          pvCurrent: 10,
          pvMax: 10,
          conditions: [],
        },
      ];

      const sorted = sortInitiative(twins);
      expect(sorted[0].id).toBe('twin-a');
      expect(sorted[1].id).toBe('twin-b');
    });
  });

  describe('advanceTurn & previousTurn', () => {
    it('should advance turns sequentially', () => {
      const { nextIndex, nextRound, isNewRound } = advanceTurn(0, 4, 1);
      expect(nextIndex).toBe(1);
      expect(nextRound).toBe(1);
      expect(isNewRound).toBe(false);
    });

    it('should increment round when completing the cycle', () => {
      const { nextIndex, nextRound, isNewRound } = advanceTurn(3, 4, 1);
      expect(nextIndex).toBe(0);
      expect(nextRound).toBe(2);
      expect(isNewRound).toBe(true);
    });

    it('should move back to previous turn', () => {
      const { prevIndex, prevRound } = previousTurn(2, 4, 2);
      expect(prevIndex).toBe(1);
      expect(prevRound).toBe(2);
    });

    it('should decrement round when wrapping backward to end of list', () => {
      const { prevIndex, prevRound } = previousTurn(0, 4, 3);
      expect(prevIndex).toBe(3);
      expect(prevRound).toBe(2);
    });

    it('should not decrement round below 1', () => {
      const { prevIndex, prevRound } = previousTurn(0, 4, 1);
      expect(prevIndex).toBe(3);
      expect(prevRound).toBe(1);
    });

    it('should handle empty combatants list gracefully', () => {
      const fwd = advanceTurn(0, 0, 1);
      expect(fwd.nextIndex).toBe(0);

      const back = previousTurn(0, 0, 1);
      expect(back.prevIndex).toBe(0);
    });
  });

  describe('rollInitiative', () => {
    it('should calculate d20 + modifier correctly with fixed roll', () => {
      expect(rollInitiative(3, 17)).toBe(20);
      expect(rollInitiative(-1, 10)).toBe(9);
    });

    it('should roll within valid d20 range (1-20 + mod) with random roll', () => {
      const result = rollInitiative(2);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(22);
    });
  });
});
