import SPELLS from 'common/SPELLS/evoker';
import TALENTS, { TALENTS_EVOKER } from 'common/TALENTS/evoker';

export const BASE_ESSENCE_REGEN = 0.2;

export const INNATE_MAGIC_REGEN = 0.05;

export const BASE_MAX_ESSENCE = 5;

export const POTENT_MANA_MULTIPLIER = 0.03;

export const BASE_EVOKER_RANGE = 25;

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
  TALENTS_EVOKER.RUBY_EMBERS_TALENT.id,
  TALENTS_EVOKER.FIRESTORM_TALENT.id,
];

export const PERIODIC_HEALING_IDS = [
  SPELLS.DREAM_BREATH_ECHO.id,
  SPELLS.DREAM_BREATH_FONT.id,
  SPELLS.DREAM_BREATH.id,
  TALENTS.REVERSION_TALENT.id,
  SPELLS.REVERSION_ECHO.id,
  SPELLS.ENKINDLE_HOT.id,
  SPELLS.RENEWING_BLAZE_HEAL.id,
  TALENTS_EVOKER.REWIND_TALENT.id,
];

export const ENGULF_PERIODIC_INCREASE = 0.5;
export const EXPANDED_LUNG_INCREASE = 0.2;
