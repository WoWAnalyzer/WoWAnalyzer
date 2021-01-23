import multiplierTables from './statsMultiplierTables.generated';

function scaleStat(baseItemLevel, baseStat, itemLevel) {
  return Math.round(baseStat * (1.15 ** ((itemLevel - baseItemLevel) / 15)));
}
function getMultiplier(multiplierTable, itemLevel) {
  return multiplierTable[itemLevel - 1];
}
function scaleStatViaMultiplierTable(baseItemLevel, baseStat, itemLevel, multiplierTable) {
  const base = baseStat / getMultiplier(multiplierTable, baseItemLevel);
  const scaledBase = scaleStat(baseItemLevel, base, itemLevel);
  return Math.round(scaledBase * getMultiplier(multiplierTable, itemLevel));
}

export function calculatePrimaryStat(baseItemLevel, baseStat, itemLevel) {
  return scaleStat(baseItemLevel, baseStat, itemLevel);
}
export function calculateSecondaryStatDefault(baseItemLevel, baseStat, itemLevel) {
  return scaleStatViaMultiplierTable(baseItemLevel, baseStat, itemLevel, multiplierTables.general);
}
export function calculateSecondaryStatJewelry(baseItemLevel, baseStat, itemLevel) {
  return scaleStatViaMultiplierTable(baseItemLevel, baseStat, itemLevel, multiplierTables.jewelry);
}
