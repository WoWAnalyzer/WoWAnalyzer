import randPoints from './statsMultiplierTables/rand-points.generated.json' with { type: 'json' };
import effectPoints from './statsMultiplierTables/effect-points.generated.json' with { type: 'json' };
import crMultipliers from './statsMultiplierTables/combat-rating-multipliers.generated.json' with { type: 'json' };

enum ItemType {
  Armor = 'Armor',
  Weapon = 'Weapon',
  Trinket = 'Trinket',
  Jewelry = 'Jewelry',
}

function scaleStat(baseItemLevel: number, baseStat: number, itemLevel: number, itemType: ItemType) {
  const coefficient =
    baseStat / (randPoints[baseItemLevel] * (crMultipliers[itemType][baseItemLevel] ?? 1));
  return Math.round(
    randPoints[itemLevel] * (crMultipliers[itemType][itemLevel] ?? 1) * coefficient,
  );
}

export function calculatePrimaryStat(baseItemLevel: number, baseStat: number, itemLevel: number) {
  // primary stat does not use the CR multipliers. CR = secondary
  const coefficient = baseStat / randPoints[baseItemLevel];
  return Math.round(randPoints[itemLevel] * coefficient);
}
/**
 * @param baseItemLevel number
 * @param baseStat number
 * @param itemLevel number | undefined The item level of the actual item. undefined is allowed for convenience, and will always result in a return value of 0.
 * @returns number
 */
export function calculateSecondaryStatDefault(
  baseItemLevel: number,
  baseStat: number,
  itemLevel: number | undefined,
) {
  if (itemLevel === undefined) {
    return 0;
  }
  return scaleStat(baseItemLevel, baseStat, itemLevel, ItemType.Armor);
}
export function calculateSecondaryStatJewelry(
  baseItemLevel: number,
  baseStat: number,
  itemLevel: number,
) {
  return scaleStat(baseItemLevel, baseStat, itemLevel, ItemType.Jewelry);
}

/**
 * Calculate the value of a secondary damage or healing effect. For example: the healing cap on Echoing Tyrstone.
 *
 * This is *almost never* needed since we can just read the logged values. This should only be used when the value is not logged (like Tyrstone) and you should take care to double-check the value produced against **in-game** tooltips!
 */
export function calculateEffectScaling(
  baseItemLevel: number,
  baseValue: number,
  itemLevel: number,
) {
  return (baseValue * effectPoints[itemLevel]) / effectPoints[baseItemLevel];
}
