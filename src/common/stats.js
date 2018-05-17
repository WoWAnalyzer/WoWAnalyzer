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
  // I admit I guessed the part with the constant, but it seems to fit... https://docs.google.com/spreadsheets/d/1bEvECv9IU5w_sh7hXnaI1Bv2XOvi1REAp1GfIQjNA0Y/edit#gid=1190535451
  // Based on the info from Blizz: "Starting from 280 item level, which is the gear that we will obtain in Battle for Azeroth from quests, dungeons, and raids, secondary stats increase at a rate of around ~9% more secondaries per 15 item level. However, that amount starts decreasing from that point onwards. Starting at 280 item level, all the way to almost 500 item level (which Battle for Azeroth gear probably won't reach), your secondary stats will grow linearly, meaning you receive a fixed amount of secondary stats for a certain item level difference."
  // ROUND(BaseStat * (1.085 ^ ((ItemLevel - BaseItemLevel) / 15)) ^ (0.99804 ^ (ItemLevel - 280)))
  return Math.round(baseStat * Math.pow((1.085 ** ((itemLevel - baseItemLevel) / 15)), (0.99804 ** (itemLevel - 280))));
}
export function calculateSecondaryStatJewelry(baseItemLevel, baseStat, itemLevel) {
  // They're the same now
  return calculateSecondaryStatDefault(baseItemLevel, baseStat, itemLevel);
}
