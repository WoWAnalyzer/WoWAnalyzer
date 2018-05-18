import multiplierTables from './statsMultiplierTables.generated';

function scaleStat(baseItemLevel, baseStat, itemLevel) {
  return Math.round(baseStat * (1.15 ** ((itemLevel - baseItemLevel) / 15)));
}
function getMultiplier(multipliers, itemLevel) {
  return multipliers[itemLevel - 1];
}
function scaleStatViaTable(baseItemLevel, baseStat, itemLevel, multipliers) {
  const base = baseStat / getMultiplier(multipliers, baseItemLevel);
  const scaledBase = scaleStat(baseItemLevel, base, itemLevel);
  return Math.round(scaledBase * getMultiplier(multipliers, itemLevel));
}

export function calculatePrimaryStat(baseItemLevel, baseStat, itemLevel) {
  return scaleStat(baseItemLevel, baseStat, itemLevel);
}
export function calculateSecondaryStatDefault(baseItemLevel, baseStat, itemLevel) {
  return scaleStatViaTable(baseItemLevel, baseStat, itemLevel, multiplierTables.general);
}
export function calculateSecondaryStatJewelry(baseItemLevel, baseStat, itemLevel) {
  return scaleStatViaTable(baseItemLevel, baseStat, itemLevel, multiplierTables.jewelry);
}
