import SPELLS from 'common/SPELLS';

export const DISPERSION_BASE_CD = 90;
export const DISPERSION_UPTIME_MS = 6000;

export const SHADOW_WORD_DEATH_EXECUTE_RANGE = 0.2;

export const MINDBENDER_UPTIME_MS = 15000;

export const MS_BUFFER = 100;

export const SPIRIT_DAMAGE_MULTIPLIER = 1.3;
export const SPIRIT_INSANITY_GENERATION = 1;

export const TWIST_OF_FATE_INCREASE = 1.1;

export const VOID_TORRENT_MAX_TIME = 3000;
export const VOID_TORRENT_INSANITY_PER_SECOND = 20;
export const VOID_TORRENT_INSANITY_PER_TICK = 15;

export const FORTRESS_OF_THE_MIND_DAMAGE_INCREASE = 1.2;
export const FORTRESS_OF_THE_MIND_INSANITY_INCREASE = 1.1;

export const VOID_FORM_ACTIVATORS = [
  SPELLS.VOID_ERUPTION.id,
  SPELLS.SURRENDER_TO_MADNESS_TALENT.id,
];

// Abilities that don't show waste in resource gain
export const SHADOW_SPELLS_WITHOUT_WASTE = [
  SPELLS.VOID_TORRENT_TALENT.id,
];

// Shadowlands Conduits
export const DISSONANT_ECHOES_DAMAGE_INCREASE = 1.35;
