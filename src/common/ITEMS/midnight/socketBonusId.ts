import { Item as EventItem } from 'parser/core/Events';

const items = {
  13576: {
    id: 13576,
    socket: 1,
  },
  13579: {
    id: 13579,
    socket: 2,
  },
} as const satisfies Record<number, { id: number; socket: number }>;

export default items;

const socketBonusSet = new Set<number>(Object.keys(items).map((key) => Number(key)));

export function eventItemHasGemSocket(item: EventItem): boolean {
  if (!item.bonusIDs) {
    return false;
  }

  if (Array.isArray(item.bonusIDs)) {
    // Check if any bonusID exists in the socketBonusSet
    return item.bonusIDs.some((bonusId) => socketBonusSet.has(bonusId));
  }

  // If bonusIDs is a single number, check directly
  return socketBonusSet.has(item.bonusIDs);
}

export function eventItemGemSocketCount(item: EventItem): number {
  if (!item.bonusIDs) {
    return 0; // No bonusIDs, so no sockets
  }

  if (Array.isArray(item.bonusIDs)) {
    // Find the first matching bonusID and return its socket value
    for (const bonusId of item.bonusIDs) {
      if (socketBonusSet.has(bonusId)) {
        return items[bonusId as keyof typeof items]?.socket ?? 0;
      }
    }
  } else {
    // If bonusIDs is a single number, check directly
    if (socketBonusSet.has(item.bonusIDs)) {
      return items[item.bonusIDs as keyof typeof items]?.socket ?? 0;
    }
  }

  return item.gems?.length ?? 0; // No matching bonusID found, check gem list or just return. this handles items with inherent sockets
}
