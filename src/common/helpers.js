export function calculatePrimaryStat(baseItemLevel, baseStat, itemLevel) {
  return Math.ceil(baseStat * 1.15 ** ((itemLevel - baseItemLevel) / 15)); // Blizzard looks to be rounding this up always
}
