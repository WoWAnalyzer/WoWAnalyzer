import { Item as EventItem, Gem as EventGem } from 'parser/core/EventsItems';
import { GemmableSlotConfig } from 'parser/shared/modules/items/GemChecker';
import ITEMS from 'common/ITEMS';
import { eventItemGemSocketCount } from 'common/ITEMS/thewarwithin/socketBonusId';

/**
 * Constructs an array of gem objects for an event item, ensuring the number of gems
 * matches the actual socket count of the item. If the item has fewer gems than the
 * socket count, empty gem sockets are added to fill the remaining slots.
 *
 * @param item - The event item for which to build the gem array.
 * @returns An array of objects, each containing a gem. If the item has fewer gems
 * than the socket count, the array will include placeholders for empty gem sockets.
 * @remarks This function will add just the empty gem sockets. Does not do colored empty gem sockets.
 */
export function buildEventItemGems(item: EventItem): { gem: EventGem }[] {
  const actualSocketCount: number = eventItemGemSocketCount(item);

  //Initialize with the gems we have.
  const result: { gem: EventGem }[] = (item.gems ?? []).map((gem) => ({ gem }));

  let i: number = item.gems?.length ?? 0;

  for (; i < actualSocketCount; i += 1) {
    result.push({
      gem: {
        id: ITEMS.EMPTY_GEM_SOCKET.id,
        icon: ITEMS.EMPTY_GEM_SOCKET.icon,
        itemLevel: -1,
      },
    });
  }

  return result;
}

/**
 * Builds an array of gem placeholders for an event item, this differs from buildEventItemGems in that will also add the the gemmable Slot item.
 *
 * @param item - The event item for which to build the gem placeholders.
 * @param gemmableSlotConfig - The configuration for gemmable slots, which includes
 * information about the maximum socket count and item used to make the new socket.
 * @returns An array of objects, each containing a gem. If the item has fewer gems
 * than the maximum socket count, the array will include placeholders for additional
 * gem slots.
 * @remarks This function will add the empty gem sockets and the items used to add a gem socket. Does not do colored empty gem sockets.
 */
export function buildEventItemGemPlaceholders(
  item: EventItem,
  gemmableSlotConfig: GemmableSlotConfig | undefined,
): { gem: EventGem }[] {
  const result = buildEventItemGems(item);
  const maxSockets: number = maxSocketCountForGemmableSlotConfig(gemmableSlotConfig, true);

  for (let i = result?.length ?? 0; i < maxSockets; i += 1) {
    result.push({
      gem: {
        id: gemmableSlotConfig?.socketingItemId ?? 0,
        icon: gemmableSlotConfig?.socketingItemId
          ? ITEMS[gemmableSlotConfig?.socketingItemId].icon
          : 'inv_misc_questionmark',
        itemLevel: -1,
      },
    });
  }

  return result;
}

export function maxSocketCountForGemmableSlotConfig(
  gemmableSlotConfig: GemmableSlotConfig | undefined,
  ignoreTimeGates = false,
): number {
  if (!gemmableSlotConfig) {
    return 0;
  }

  return !gemmableSlotConfig.timeGated || ignoreTimeGates ? gemmableSlotConfig.maxSockets : 0;
}
