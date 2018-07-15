import multiplierTables from './statsMultiplierTables.generated';
import AZERITE_SCALING from './AZERITE_SCALING.generated';

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

const AZ_BASE_ILVL = 251;
const AZ_BASE_BUDGET = 179.2;
// note: add + 5 to rank if the item has been fully upgraded (this will
// be automatic in the future)
export function calculateAzeriteEffects(spellId, rank) {
  const spell = AZERITE_SCALING[spellId];

  let budget = calculatePrimaryStat(AZ_BASE_ILVL, AZ_BASE_BUDGET, rank);
  if(spell.secondary) {
    budget *= getMultiplier(multiplierTables.general, rank);
  } 

  return Object.values(spell.effects).filter(({avg}) => avg > 0).map(({avg}) => Math.round(avg * budget));
}
