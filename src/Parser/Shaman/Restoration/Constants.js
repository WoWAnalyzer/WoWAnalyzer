import SPELLS from 'common/SPELLS';

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  SPELLS.HEALING_WAVE.id,
  SPELLS.CHAIN_HEAL.id,
  SPELLS.HEALING_SURGE_RESTORATION.id,
  SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
  SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
  SPELLS.RIPTIDE.id,
  SPELLS.HEALING_RAIN_HEAL.id,
  SPELLS.WELLSPRING_HEAL.id,
  SPELLS.UNLEASH_LIFE_TALENT.id,
  SPELLS.EARTH_SHIELD_HEAL.id,
  SPELLS.DOWNPOUR_TALENT.id,
  SPELLS.RAINFALL.id,
  SPELLS.DOWNPOUR.id,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.CLOUDBURST_TOTEM_HEAL.id,
  SPELLS.ASCENDANCE_HEAL.id,
  SPELLS.LEECH.id,
];

export const ABILITIES_AFFECTED_BY_MASTERY = [
  SPELLS.WELLSPRING_HEAL.id,
  SPELLS.CHAIN_HEAL.id,
  SPELLS.HEALING_WAVE.id,
  SPELLS.RIPTIDE.id,
  SPELLS.HEALING_SURGE_RESTORATION.id,
  SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
  SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
  SPELLS.HEALING_RAIN_HEAL.id,
  SPELLS.UNLEASH_LIFE_TALENT.id,
  SPELLS.EARTH_SHIELD_HEAL.id,
  //SPELLS.DOWNPOUR_TALENT.id, Not yet, but expected to get fixed
  SPELLS.DOWNPOUR.id,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.CLOUDBURST_TOTEM_HEAL.id,
  SPELLS.ASCENDANCE_HEAL.id,
  SPELLS.LEECH.id,
];

export const ABILITIES_NOT_FEEDING_INTO_CBT = [
  SPELLS.CLOUDBURST_TOTEM_HEAL.id,
  SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
  SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
  SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id,
  SPELLS.VELENS_FUTURE_SIGHT_HEAL.id,
  SPELLS.LEECH.id,
];

export const ABILITIES_NOT_FEEDING_INTO_ASCENDANCE = [
  SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
  SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
  SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id,
  SPELLS.VELENS_FUTURE_SIGHT_HEAL.id,
  SPELLS.LEECH.id,
  SPELLS.ASCENDANCE_HEAL.id,
  SPELLS.CLOUDBURST_TOTEM_HEAL.id,
];
