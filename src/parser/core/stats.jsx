import multiplierTables from './statsMultiplierTables.generated';
import * as effectTables from './effectMultiplierTables.generated';

function scaleStat(baseItemLevel, baseStat, itemLevel) {
  return Math.round(baseStat * 1.15 ** ((itemLevel - baseItemLevel) / 15));
}
function getMultiplier(multiplierTable, itemLevel) {
  return multiplierTable[itemLevel - 1];
}
function scaleStatViaMultiplierTable(baseItemLevel, baseStat, itemLevel, multiplierTable) {
  const base = baseStat / getMultiplier(multiplierTable, baseItemLevel);
  const scaledBase = scaleStat(baseItemLevel, base, itemLevel);
  return Math.round(scaledBase * getMultiplier(multiplierTable, itemLevel) * 1000) / 1000;
}

export function calculatePrimaryStat(baseItemLevel, baseStat, itemLevel) {
  return scaleStat(baseItemLevel, baseStat, itemLevel);
}
/**
 * @param baseItemLevel number
 * @param baseStat number
 * @param itemLevel number | undefined The item level of the actual item. undefined is allowed for convenience, and will always result in a return value of 0.
 * @returns number
 */
export function calculateSecondaryStatDefault(baseItemLevel, baseStat, itemLevel) {
  if (itemLevel === undefined) {
    return 0;
  }
  return scaleStatViaMultiplierTable(baseItemLevel, baseStat, itemLevel, multiplierTables.general);
}
export function calculateSecondaryStatJewelry(baseItemLevel, baseStat, itemLevel) {
  return scaleStatViaMultiplierTable(baseItemLevel, baseStat, itemLevel, multiplierTables.jewelry);
}

/**
 * Calculate the value of a secondary damage or healing effect. For example: the healing cap on Echoing Tyrstone.
 *
 * This is *almost never* needed since we can just read the logged values. This should only be used when the value is not logged (like Tyrstone) and you should take care to double-check the value produced against **in-game** tooltips!
 */
export function calculateEffectScaling(baseItemLevel, baseValue, itemLevel) {
  return (
    baseValue *
    (effectTables.damageSecondary[itemLevel - 1] / effectTables.damageSecondary[baseItemLevel - 1])
  );
}
