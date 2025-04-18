import { Item } from 'parser/core/Events';

/**
 * Helper class for item-related operations that do not fit into the other classes.
 */
export class ItemHelper {
  static SINGLE_GEM_BONUS_ID = 10878;
  static DOUBLE_GEM_BONUS_ID = 10879;
  static TRIPLE_GEM_BONUS_ID = 10880;

  /**
   * Check if the item has a specific bonusId.
   * @param item The item to check.
   * @param bonusId The bonus ID to check for.
   * @returns True if the item has the bonusId, false otherwise.
   */
  static hasBonusId(item: Item, bonusId: number): boolean {
    if (!item.bonusIDs) {
      return false;
    }
    if (Array.isArray(item.bonusIDs)) {
      return item.bonusIDs.includes(bonusId);
    }
    return item.bonusIDs === bonusId;
  }
}
