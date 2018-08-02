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

// Constants for azerite effect scaling
//
// The base ilvl and budget are only used to perform scaling.
// Historically, logs gave a "rank" that was 0 at ilvl 251, which is why
// this particular value is used. Presently, any ilvl could be
// substituted as long as the *unrounded* budget is changed as well.
const AZ_BASE_ILVL = 251;
const AZ_BASE_BUDGET = 179.2;

const AZ_SCALE_PRIMARY = -1;
const AZ_SCALE_SECONDARY = -7;
const AZ_SCALE_UNK8 = -8;

function calculateScalingAzPrimary(ilvl) {
  const SCALE = 17.3;
  return Math.floor(SCALE * (1.15**(ilvl/15)));
}
function calculateScalingUnk8(ilvl) {
  const SCALE = 4.325;
  return Math.floor(SCALE * (1.15**(ilvl/15)));
}

// Calculate the values of each (scaling) effect associated with an
// azerite trait. Note that *effects that do not scale are not present!*
//
// Effects will always be returned in ascending order of effect ID.
export function calculateAzeriteEffects(spellId, rank) {
  const spell = AZERITE_SCALING[spellId];

  let budget = calculateScalingAzPrimary(rank);
  switch(spell.scaling_type) {
    case AZ_SCALE_PRIMARY:
      break; // nothing to do
    case AZ_SCALE_SECONDARY:
      budget *= getMultiplier(multiplierTables.general, rank);
      break;
    case AZ_SCALE_UNK8:
      budget = calculateScalingUnk8(rank);
      break;
    default:
      throw Error(`Unknown scaling type: ${spell.scaling_type}`);
      break;
  }

  return spell.effect_list.map(id => spell.effects[id])
    .filter(({avg}) => avg > 0)
    .map(({avg}) => Math.round(avg * budget));
}
