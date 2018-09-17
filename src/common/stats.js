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


// different kinds of (known) scaling for azerite traits
const AZ_SCALE_PRIMARY = -1;
const AZ_SCALE_SECONDARY = -7;
// unlike the previous two, this scale type doesn't have a clear
// semantic meaning that we know of (yet)
const AZ_SCALE_UNK8 = -8;

const AZ_SCALE_FUNCTIONS = {
  // this function was given by @Atonement, and has matched
  // everything tested against
  [AZ_SCALE_PRIMARY]: ilvl => {
    const SCALE = 17.3;
    return Math.floor(SCALE * (1.15**(ilvl/15)));
  },
  [AZ_SCALE_SECONDARY]: ilvl => AZ_SCALE_FUNCTIONS[AZ_SCALE_PRIMARY](ilvl) * getMultiplier(multiplierTables.general, ilvl),
  // this function was given by @Atonement, and has matched
  // everything tested against
  [AZ_SCALE_UNK8]: ilvl => {
    const SCALE = 4.325;
    return Math.floor(SCALE * (1.15**(ilvl/15)));
  },
};

// Calculate the values of each (scaling) effect associated with an
// azerite trait. Note that *effects that do not scale are not present!*
//
// Effects will always be returned in ascending order of effect ID.
export function calculateAzeriteEffects(spellId, rank, scalingTypeOverride) {
  const spell = AZERITE_SCALING[spellId];
  const scalingType = scalingTypeOverride ? scalingTypeOverride : spell.scaling_type;

  if(AZ_SCALE_FUNCTIONS[scalingType] === undefined) {
    throw Error(`Unknown scaling type: ${scalingType}`);
  }
  const budget = AZ_SCALE_FUNCTIONS[scalingType](rank);

  return spell.effect_list.map(id => spell.effects[id])
    .filter(({avg}) => avg > 0)
    .map(({avg}) => Math.round(avg * budget));
}
