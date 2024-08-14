import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

export const BASE_ESSENCE_REGEN = 0.2;

export const INNATE_MAGIC_REGEN = 0.05;

export const BASE_MAX_ESSENCE = 5;

export const POTENT_MANA_MULTIPLIER = 0.03;

export const BASE_EVOKER_RANGE = 25;

export const CLOBBERING_SWEEP_CDR = 45;
export const HEAVY_WINGBEATS_CDR = 45;

export const EMPOWER_BASE_GCD = 1500;
export const EMPOWER_CANCELED_GCD = 750;
export const EMPOWER_MINIMUM_GCD = 500;
export const EMPOWERS = [
  // Shared
  SPELLS.FIRE_BREATH.id,
  SPELLS.FIRE_BREATH_FONT.id,
  // Devastation
  SPELLS.ETERNITY_SURGE.id,
  SPELLS.ETERNITY_SURGE_FONT.id,
  // Augmentation
  SPELLS.UPHEAVAL.id,
  SPELLS.UPHEAVAL_FONT.id,
  // Preservation
  TALENTS.SPIRITBLOOM_TALENT.id,
  SPELLS.SPIRITBLOOM_FONT.id,
  TALENTS.DREAM_BREATH_TALENT.id,
  SPELLS.DREAM_BREATH_FONT.id,
];

export const EB_BUFF_IDS = [
  SPELLS.ESSENCE_BURST_BUFF.id,
  SPELLS.ESSENCE_BURST_DEV_BUFF.id,
  SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
];

export const PERIODIC_DAMAGE_IDS = [
  SPELLS.ENKINDLE_DOT.id,
  SPELLS.FIRE_BREATH_DOT.id,
  SPELLS.LIVING_FLAME_DAMAGE.id, // Ruby Embers
];

export const PERIODIC_HEALING_IDS = [
  SPELLS.DREAM_BREATH_ECHO.id,
  SPELLS.DREAM_BREATH_FONT.id,
  SPELLS.DREAM_BREATH.id,
  TALENTS.REVERSION_TALENT.id,
  SPELLS.REVERSION_ECHO.id,
  SPELLS.ENKINDLE_HOT.id,
  SPELLS.RENEWING_BLAZE_HEAL.id,
  SPELLS.LIVING_FLAME_HEAL.id, // Ruby Embers
];

export const BLACK_DAMAGE_SPELLS = [
  TALENTS.ERUPTION_TALENT,
  SPELLS.DEEP_BREATH_DAM,
  SPELLS.UPHEAVAL_DAM,
  SPELLS.MELT_ARMOR,
  SPELLS.BOMBARDMENTS_DAMAGE,
];

export const ENGULF_PERIODIC_INCREASE = 0.5;
export const EXPANDED_LUNG_INCREASE = 0.2;
export const FAN_THE_FLAMES_INCREASE = 1;
export const RED_HOT_INCREASE = 0.2;

// Scalecommander changes ID for deep breath
export const DEEP_BREATH_SPELLS = [SPELLS.DEEP_BREATH, SPELLS.DEEP_BREATH_SCALECOMMANDER];
export const DEEP_BREATH_SPELL_IDS = DEEP_BREATH_SPELLS.map((spell) => spell.id);

export const IMMINENT_DESTRUCTION_MULTIPLIER = 0.1;
export const IMMINENT_DESTRUCTION_ESSENCE_REDUCTION = 1;
export const MELT_ARMOR_MULTIPLIER = 0.2;
export const MIGHT_OF_THE_BLACK_DRAGONFLIGHT_MULTIPLIER = 0.2;

export const MASS_DISINTEGRATE_MULTIPLIER_PER_MISSING_TARGET = 0.15;
export const MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET =
  MASS_DISINTEGRATE_MULTIPLIER_PER_MISSING_TARGET;
