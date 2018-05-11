/*
Garg - 28/02/2017
Stat Scaling past ilvl 800:
Primary Stat Formula (includes damage/healing done): `BaseStat * 1.15 ^ ((iLvL - Base iLvL) / 15)`
Secondary Stat Formula for Armor/Weapons/Trinket: `BaseStat * 1.15 ^ ((iLvL - Base iLvL)/15) * 0.994435486 ^ (iLvL - Base iLvL)`
Secondary Stat Formula for Jewelry: `Base Stat * 1.15 ^ ((iLvL - Base iLvL)/15) * 0.996754034 ^ (iLvL - Base iLvL)`
Take the stat of an item at a given iLvL (for example, 300 Crit at 850 iLvL).
To figure out how much crit that would have at 860 iLvL, you'd do: `300 * 1.15 ^ ((860 - 850) / 15) * 0.994435486 ^(860-850)` for 311 Crit.
Once the stat at a given iLvL is found, the only variable that needs to be changed is `iLvL`
*/
// can confirm this formula works if given ilevel/stat other than whatever the "base" is. - kfinch

export function calculatePrimaryStat(baseItemLevel, baseStat, itemLevel) {
  // Blizzard looks to be rounding this up always
  // BaseStat * 1.15 ^ ((iLvL - Base iLvL) / 15)
  return Math.ceil(baseStat * (1.15 ** ((itemLevel - baseItemLevel) / 15)));
}
export function calculateSecondaryStatDefault(baseItemLevel, baseStat, itemLevel) {
  // BaseStat * 1.15 ^ ((iLvL - Base iLvL)/15) * 0.994435486 ^ (iLvL - Base iLvL)
  return Math.ceil(baseStat * (1.15 ** ((itemLevel - baseItemLevel) / 15)) * (0.994435486 ** (itemLevel - baseItemLevel)));
}
export function calculateSecondaryStatJewelry(baseItemLevel, baseStat, itemLevel) {
  // Base Stat * 1.15 ^ ((iLvL - Base iLvL)/15) * 0.996754034 ^ (iLvL - Base iLvL)
  return Math.ceil(baseStat * (1.15 ** ((itemLevel - baseItemLevel) / 15)) * (0.99774 ** (itemLevel - baseItemLevel)));
}
