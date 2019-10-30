import SPELLS from 'common/SPELLS';

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  SPELLS.HEALING_RAIN_HEAL.id,
  SPELLS.HEALING_SURGE_RESTORATION.id, // ele and resto share the same healing surge
  SPELLS.HEALING_SURGE_ENHANCE.id,
  SPELLS.EARTH_SHIELD_HEAL.id,

  // Azerite Traits
  SPELLS.OVERFLOWING_SHORES_HEAL.id, // theoretically an enhance shaman could benefit from this
  SPELLS.IMPASSIVE_VISAGE_HEAL.id,
  SPELLS.VAMPIRIC_SPEED_HEAL.id,
  SPELLS.SERENE_SPIRIT_HEAL.id,
  SPELLS.PACK_SPIRIT_HEAL.id,

  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.LEECH.id,
];
