/**
 * Tactical VTT Initiative Tracker Engine
 * Turn ordering, Dexterity tiebreaking, round transitions, and combatant state.
 */

import { InitiativeCombatant } from '@/lib/types';

export interface TurnTransitionResult {
  nextIndex: number;
  nextRound: number;
  isNewRound: boolean;
}

export interface TurnReversalResult {
  prevIndex: number;
  prevRound: number;
}

/**
 * Sorts combatants in descending initiative order.
 * Breaks ties using Dexterity modifier (higher Dex acts first).
 * If Dex modifier is also identical, maintains stable ordering by ID.
 */
export function sortInitiative(combatants: InitiativeCombatant[]): InitiativeCombatant[] {
  return [...combatants].sort((a, b) => {
    if (b.initiativeScore !== a.initiativeScore) {
      return b.initiativeScore - a.initiativeScore;
    }
    if (b.dexModifier !== a.dexModifier) {
      return b.dexModifier - a.dexModifier;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Advances the active turn by 1.
 * Increments round number when looping from the last combatant to index 0.
 */
export function advanceTurn(
  currentIndex: number,
  totalCombatants: number,
  currentRound: number
): TurnTransitionResult {
  if (totalCombatants <= 0) {
    return { nextIndex: 0, nextRound: currentRound, isNewRound: false };
  }

  const nextIndex = (currentIndex + 1) % totalCombatants;
  const isNewRound = nextIndex === 0;
  const nextRound = isNewRound ? currentRound + 1 : currentRound;

  return { nextIndex, nextRound, isNewRound };
}

/**
 * Reverses the active turn by 1.
 * Decrements round number if moving back past the first combatant (minimum round 1).
 */
export function previousTurn(
  currentIndex: number,
  totalCombatants: number,
  currentRound: number
): TurnReversalResult {
  if (totalCombatants <= 0) {
    return { prevIndex: 0, prevRound: currentRound };
  }

  if (currentIndex <= 0) {
    const prevRound = Math.max(1, currentRound - 1);
    const prevIndex = totalCombatants - 1;
    return { prevIndex, prevRound };
  }

  return { prevIndex: currentIndex - 1, prevRound: currentRound };
}

/**
 * Rolls initiative for a combatant (1d20 + modifier)
 */
export function rollInitiative(dexModifier: number, dieResult?: number): number {
  const d20 = dieResult !== undefined ? dieResult : Math.floor(Math.random() * 20) + 1;
  return d20 + dexModifier;
}
