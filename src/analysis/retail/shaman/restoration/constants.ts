import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
//import BUFFS from 'src/analysis/retail/shaman/restoration/modules/Buffs'
// You can copy above for easy use

// Event link attribution strings
export enum EVENT_LINKS {
  riptideCast = 'riptideCast',
  riptideBuffApply = 'riptideBuffApply',
  primalTideCoreRiptideOrigin = 'primalTideCoreRiptideOrigin',
  primalTideCoreRiptideProc = 'primalTideCoreRiptideProc',

  healingRainEventLinkHeal = 'healingRainEventLinkHeal',
  healingRainEventLinkCast = 'healingRainEventLinkCast',
  healingRainTargetCounter = 'healingRainTargetCounter',
  overflowingShoresHeal = 'overflowingShoresHeal',
  overflowingShoresOrigin = 'overflowingShoresOrigin',
  downpourHeal = 'downpourHeal',
  downpourCast = 'downpourCast',

  splitstreamHeal = 'splitstreamHeal',

  whirlingAirBuffRemoval = 'whirlingAirBuffRemoval',
  whirlingAirCast = 'whirlingAirCast',
  whirlingEarthBuffRemoval = 'whirlingEarthBuffRemoval',
  whirlingEarthEventCast = 'whirlingEarthEventCast',
  whirlingWaterBuffRemoval = 'whirlingWaterBuffRemoval',
  whirlingWaterCast = 'whirlingWaterCast',

  // Earth Living Tracker & Attribiutors
  earthlivingBuffCycle = 'earthlivingBuffCycle',
  HEALING_WAVE = 'HealingWave',
  HEALING_TIDE_TOTEM_HEAL = 'HealingTideTotemHeal',
  HEALING_STREAM_TOTEM_HEAL = 'HealingStreamTotemHeal',
  STORMSTREAM_TOTEM_HEAL = 'StormstreamTotemHeal',

  chainHealCast = 'chainHealCast',
  chainHealHeal = 'chainHealHeal',

  flowOfTheTidesRemoveBuff = 'flowOfTheTidesRemoveBuff',
  flowOfTheTidesChainHealCast = 'flowOfTheTidesChainHealCast',

  livelyTotemsOrigin = 'livelyTotemsOrigin',
  livelyTotemsChainHealCast = 'livelyTotemsChainHealCast',

  APPLIED_HEAL = 'AppliedHeal',

  unleashLifeCast = 'unleashLifeCast',
  unleashLifeHeal = 'unleashLifeHeal',
  unleashLifeBuffRemove = 'unleashLifeBuffRemove',
  unleashLifeBuffedCast = 'unleashLifeBuffedCast',
  unleashLifeBuffedRiptideCast = 'unleashLifeBuffedRiptideCast',
  unleashLifeBuffedRiptideHeal = 'unleashLifeBuffedRiptideHeal',
  unleashLifeBuffedHealingWaveCast = 'unleashLifeBuffedHealingWaveCast',
  unleashLifeBuffedHealingWaveHeal = 'unleashLifeBuffedHealingWaveHeal',
  unleashLifeBuffedChainHealCast = 'unleashLifeBuffedChainHealCast',
  unleashLifeBuffedChainHealHeal = 'unleashLifeBuffedChainHealHeal',
}

/**
 * Grace-period for checking if a buff is applied to the player.
 * Some buffs have a "pay before you cast"-price tag" and remove the buff before the actuall cast is logged.
 * Examples: Streamingstorm Totem, Ancestral Swiftness, Natures Swiftness
 */
export const ON_CAST_BUFF_REMOVAL_GRACE_MS = 50;
export const SURGING_TOTEM_BUFFER_MS = 85;
export const UNLEASH_LIFE_REMOVE_MS = 400;
export const CAST_BUFFER_MS = 100; // Event link ms settings

// Minimal duration for which you must have tidal waves.
// Prevents it from counting a HS/HW as buffed when you cast a riptide at the end.
export const TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME = 100;

// Spell coefficients
export const CHAIN_HEAL_COEFFICIENT = 2.31;
export const HIGH_TIDE_COEFFICIENT = 2.541;

// Healing increases
export const healingIncreases = {
  UNLEASH_LIFE_HEALING_INCREASE: 0.25,
  FLOW_OF_THE_TIDES_INCREASE: 0.3,
  ANCESTRAL_REACH_INCREASE: 0.08,
  DELUGE_HEALING_INCREASE: 0.15,
  EARTHEN_HARMONY_HEALING_INCREASE: 1.5,
  EARTHEN_HARMONY_DAMAGE_REDUCTION: 0.03,
  OVERSURGE_INCREASE: 0.5,
  PULSE_CAPACITOR_INCREASE: 0.25,
  AMPLIFICATION_CORE_HEALING_INCREASE: 0.03,
  TIDECALLERS_GUARD_HEALING_INCREASE: 0.02,
  EARTHEN_ACCORD_UL_DIRECT_INCREASE: 0.3,
  EARTHEN_ACCORD_BUFF_INCREASE: 0.2,
  EARTHSURGE_HEALING_INCREASE: 0.15,
  UNDERCURRENT_HEALING_INCREASE: [0, 0.005, 0.01],
  COALESCING_WATER_HEALING_INCREASE: 0.3,
};

// max HP increases
export const ANCESTRAL_VIGOR_INCREASED_MAX_HEALTH = 0.1;
export const DOWNPOUR_INCREASED_MAX_HEALTH = 0.1;

// base targets & target increases
export const HEALING_RAIN_TARGETS = 5;
export const DOWNPOUR_TARGETS = 5;
export const CHAIN_HEAL_TARGETS = 4; //1 OG Target + 3 Jumps
export const ANCESTRAL_REACH_TARGET = 1;
export const FLOW_OF_THE_TIDES_TARGET = 1;
export const OVERFLOWING_SHORES_RANGE_INCREASE = 400;
export const ANCENDANCE_TARGET = 3;

// Fake haste
export const FLASH_FLOOD_CAST_SPEED_MODIFIER = 0.1; // per rank

export const SPELL_DURATIONS = {
  HEALING_RAIN_DURATION: 18000,
  RIPTIDE_BASE_DURATION: 18000,
  WAVESPEAKERS_BLESSING: 3000,
  HEALING_STREAM_TOTEM_DURATION: 15000,
  TOTEMIC_FOCUS_HEALING_TOTEM_DURATION: 3000,
  SURGING_TOTEM_DURATION: 25000,
  EARTHLIVING_BASE_DURATION: 6000,
  IMBUEMENT_MASTERY_DURATION: 3000,
  ENHANCED_IMBUES_MODIFIER: 1.2,
  TIDECALLERS_GUARD_DURATION_EXTENSION: 3000,
} as const;

// mana saves
export const MANA_REGENERATION_PER_SECOND = 2000;
export const WATER_SHIELD_MANA_REGENERATION_PER_SECOND = 142.8;
export const RESURGENCE_SPELLS = {
  [SPELLS.HEALING_WAVE.id]: 0.008,
  [TALENTS.RIPTIDE_TALENT.id]: 0.0048,
  [TALENTS.CHAIN_HEAL_TALENT.id]: 0.002,
};

// Your normal healing toolkit, default spells and talents
export const SHAMAN_BASE_ABILITIES = [
  SPELLS.HEALING_WAVE,
  TALENTS.CHAIN_HEAL_TALENT,
  TALENTS.RIPTIDE_TALENT,
  SPELLS.HEALING_RAIN_HEAL,
  TALENTS.UNLEASH_LIFE_TALENT,
  SPELLS.EARTH_SHIELD_HEAL,
  TALENTS.DOWNPOUR_TALENT,
  SPELLS.ASCENDANCE_INITIAL_HEAL,
  SPELLS.OVERFLOWING_SHORES_HEAL,
  SPELLS.EARTHLIVING_WEAPON_HEAL,
];

// These often need special handling as the shaman is not the source
export const SHAMAN_PET_ABILITIES = [
  SPELLS.HEALING_TIDE_TOTEM_HEAL,
  SPELLS.HEALING_STREAM_TOTEM_HEAL,
  SPELLS.STORMSTREAM_TOTEM_HEAL,
  SPELLS.STORMSWELL_HEAL,
  //Do we want to add SLT here given the possible HEAL from TALENTS.SPOUTING_SPIRITS ?
];

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  ...SHAMAN_BASE_ABILITIES,
  ...SHAMAN_PET_ABILITIES,

  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.ANCESTRAL_AWAKENING_HEAL, // double check interactions
  SPELLS.ASCENDANCE_HEAL,
];

export const BASE_ABILITIES_AFFECTED_BY_MASTERY = [
  ...SHAMAN_BASE_ABILITIES,
  ...SHAMAN_PET_ABILITIES,
];

export const ABILITIES_AFFECTED_BY_MASTERY = [
  ...BASE_ABILITIES_AFFECTED_BY_MASTERY,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.ANCESTRAL_AWAKENING_HEAL,
  SPELLS.ASCENDANCE_HEAL,
];

// Hero Talents
// Totemic

// Whirling elements
export const WHIRLING_ELEMENTS_MOTES = [
  SPELLS.WHIRLING_AIR,
  SPELLS.WHIRLING_EARTH,
  SPELLS.WHIRLING_WATER,
];

// Hero Talents
// Farseer

// UI
export const RESTORATION_COLORS = {
  CHAIN_HEAL: '#203755',
  HEALING_WAVE: '#146585',
  HEALING_SURGE: '#40b3bf',
  HEALING_STREAM_TOTEM: '#40b3bf',
  HEALING_TIDE_TOTEM: '#041dffff',
  STORMSTREAM_TOTEM: '#fbff00ff',
  RIPTIDE: '#a3dbce',
  HEALING_RAIN: '#21a2d5',
  OVERFLOWING_SHORES: '#0376a3',
  UNLEASH_LIFE: '#1ba691',
  DOWNPOUR: '#3b6760',
  UNUSED: '#CC3D20',
};
