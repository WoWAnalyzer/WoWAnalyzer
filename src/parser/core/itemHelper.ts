import { Item } from 'parser/core/Events';

export const SINGLE_GEM_BONUS_ID = 10878;
export const DOUBLE_GEM_BONUS_ID = 10879;
export const TRIPLE_GEM_BONUS_ID = 10880;

/**
 * Check if the item has a specific bonusId.
 * @param item The item to check.
 * @param bonusId The bonus ID to check for.
 * @returns True if the item has the bonusId, false otherwise.
 */
export function hasBonusId(item: Item, bonusId: number): boolean {
  if (!item.bonusIDs) {
    return false;
  }
  if (Array.isArray(item.bonusIDs)) {
    return item.bonusIDs.includes(bonusId);
  }
  return item.bonusIDs === bonusId;
}
