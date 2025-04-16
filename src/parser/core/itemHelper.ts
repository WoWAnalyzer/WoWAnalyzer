import { Item } from 'parser/core/Events';

export class ItemHelper {
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
