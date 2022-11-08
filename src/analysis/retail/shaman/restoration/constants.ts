import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';

export const RESTORATION_COLORS = {
  CHAIN_HEAL: '#203755',
  HEALING_WAVE: '#146585',
  HEALING_SURGE: '#40b3bf',
  RIPTIDE: '#a3dbce',
  UNUSED: '#CC3D20',
};

// Spell Coefficients
export const CHAIN_HEAL_COEFFICIENT = 2.1;
export const HEALING_WAVE_COEFFICIENT = 3;
export const HEALING_SURGE_COEFFICIENT = 2.48;
export const HIGH_TIDE_COEFFICIENT = 2.31;
export const HEALING_WAVE_CAST_TIME = 2.5;

// Conduit Ranks
export const SWIRLING_CURRENTS_RANKS = [20, 21, 23, 24, 26, 28, 29, 30, 31, 33, 34, 36, 37, 39, 40];
export const HEAVY_RAINFALL_RANKS = [
  75,
  80,
  85,
  90,
  95,
  100,
  105,
  110,
  115,
  120,
  125,
  130,
  135,
  140,
  145,
];
export const EMBRACE_OF_EARTH_RANKS = [
  5,
  5.5,
  6,
  6.5,
  7,
  7.5,
  8,
  8.5,
  9,
  9.5,
  10,
  10.5,
  11,
  11.5,
  12,
];
export const NATURES_FOCUS_RANKS = [
  10,
  10.66,
  11.33,
  12,
  12.66,
  13.33,
  14,
  15,
  16,
  16.66,
  17.33,
  18,
  18.66,
  19.33,
  20,
];

// Your normal healing toolkit, default spells and talents
// TODO: Check all these lists again, maybe restructure to remove repeats
// TODO: Create list for Ancestral Guidance (should be all BASE + Ascendance + CBT)
const SHAMAN_BASE_ABILITIES = [
  SPELLS.HEALING_SURGE,
  SPELLS.CHAIN_HARVEST_HEAL,
  SPELLS.PRIMORDIAL_WAVE_HEAL,

  TALENTS.HEALING_WAVE_TALENT,
  TALENTS.CHAIN_HEAL_TALENT,
  SPELLS.HEALING_SURGE,
  TALENTS.RIPTIDE_TALENT,
  SPELLS.HEALING_RAIN_HEAL,
  SPELLS.WELLSPRING_HEAL,
  TALENTS.UNLEASH_LIFE_TALENT,
  SPELLS.EARTH_SHIELD_HEAL,
  TALENTS.DOWNPOUR_TALENT,
  SPELLS.ASCENDANCE_INITIAL_HEAL,
  SPELLS.NATURES_GUARDIAN_HEAL, // double check
  SPELLS.WELLSPRING_HEAL,
  SPELLS.OVERFLOWING_SHORES_HEAL,
  SPELLS.EARTHLIVING_WEAPON_HEAL,
];

// These often need special handling as the shaman is not the source
const SHAMAN_PET_ABILITIES = [
  SPELLS.HEALING_TIDE_TOTEM_HEAL,
  SPELLS.HEALING_STREAM_TOTEM_HEAL,
];

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  ...SHAMAN_BASE_ABILITIES,
  ...SHAMAN_PET_ABILITIES,

  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.ANCESTRAL_AWAKENING_HEAL, // double check interactions
  SPELLS.ANCESTRAL_GUIDANCE_HEAL,
  SPELLS.CLOUDBURST_TOTEM_HEAL,
  SPELLS.ASCENDANCE_HEAL,
  SPELLS.LEECH,
];

export const BASE_ABILITIES_AFFECTED_BY_MASTERY = [
  ...SHAMAN_BASE_ABILITIES,
  ...SHAMAN_PET_ABILITIES,
];

export const ABILITIES_AFFECTED_BY_MASTERY = [
  ...BASE_ABILITIES_AFFECTED_BY_MASTERY,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.ANCESTRAL_AWAKENING_HEAL,
  SPELLS.ANCESTRAL_GUIDANCE_HEAL,
  SPELLS.CLOUDBURST_TOTEM_HEAL,
  SPELLS.ASCENDANCE_HEAL,
  SPELLS.LEECH,
];

export const ABILITIES_FEEDING_INTO_CBT = [
  ...SHAMAN_BASE_ABILITIES,
];

export const ABILITIES_NOT_FEEDING_INTO_ASCENDANCE = [
  SPELLS.HEALING_TIDE_TOTEM_HEAL,
  SPELLS.HEALING_STREAM_TOTEM_HEAL,
  SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE,
  SPELLS.LEECH,
  SPELLS.ASCENDANCE_HEAL,
  SPELLS.CLOUDBURST_TOTEM_HEAL,
  SPELLS.ASCENDANCE_INITIAL_HEAL,
  SPELLS.ANCESTRAL_GUIDANCE_HEAL,
];

export const FLASH_FLOOD_CAST_SPEED_MODIFIER = 0.1;
