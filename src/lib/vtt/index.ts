/**
 * TRPG Platform — VTT & Tactical Grid Engine
 * Chebyshev (T20 default) & 5/10/5 (TRPG classic) metrics, range bands, and initiative tracking.
 */

import {
  GridPosition,
  DistanceMeasurement,
  RangeBand,
  InitiativeCombatant
} from '../types';
import { calculateDistance, DistanceMetric } from './ruler';
import { sortInitiative } from './initiative';

export * from './grid';
export * from './tokens';
export * from './ruler';
export * from './initiative';

/**
 * Unified VttEngine class for backward compatibility
 */
export class VttEngine {
  /**
   * Tactical VTT Distance Calculation
   */
  static calculateDistance(
    p1: GridPosition,
    p2: GridPosition,
    metric: DistanceMetric = 'chebyshev'
  ): DistanceMeasurement {
    return calculateDistance(p1, p2, metric);
  }

  /**
   * Sort initiative combatants in descending score order with dexterity tie-break
   */
  static sortInitiative(combatants: InitiativeCombatant[]): InitiativeCombatant[] {
    return sortInitiative(combatants);
  }
}
