import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

// Accretion
export const ACCRETION_CDR_MS = 1000;

// Ebon Might
export const EBON_MIGHT_BASE_DURATION_MS = 10000;
export const EBON_MIGHT_PERSONAL_DAMAGE_AMP = 0.2;

// Mastery Versatility buff
export const SHIFTING_SANDS_MASTERY_COEFFICIENT = 0.34;
// Mastery aura extension
export const TIMEWALKER_BASE_EXTENSION = 0.04;
export const TIMEWALKER_MASTERY_COEFFICIENT = 0.5;

// Sands of Time
export const ERUPTION_EXTENSION_MS = 1000;
export const EMPOWER_EXTENSION_MS = 2000;
export const BREATH_OF_EONS_EXTENSION_MS = 5000;
export const DREAM_OF_SPRINGS_EXTENSION_MS = 1000;
export const SANDS_OF_TIME_CRIT_MOD = 0.5;

//Close as Clutchmates
export const CLOSE_AS_CLUTCHMATES_MOD = 1.1;

// Prescience
export const PRESCIENCE_BASE_DURATION_MS = 18000;

// Talent multipliers
export const REACTIVE_HIDE_MULTIPLIER = 0.15;
export const RICOCHETING_PYROCLAST_MULTIPLIER = 0.3;
export const RICOCHETING_PYROCLAST_MAX_MULTIPLIER = 1.5;
export const TECTONIC_LOCUS_MULTIPLIER = 0.5;
export const VOLCANISM_ESSENCE_REDUCTION = 1;
export const ANACHRONISM_ESSENCE_CHANCE = 0.35;
export const SYMBIOTIC_HEALING_INCREASE = 0.03;
export const MOLTEN_EMBERS_MULTIPLIER = [0.1, 0.13, 0.2, 0.4];
export const MOLTEN_EMBERS_MULTIPLIER_NO_BLAST_FURNACE = [0.12, 0.17, 0.3, 1.2];
export const MOMENTUM_SHIFT_INTELLECT_PER_STACK = 5;

// Breath of Eons multiplier
export const BREATH_OF_EONS_MULTIPLIER = 0.1;

// Tier
export const VOLCANIC_UPSURGE_MULTIPLIER = 0.3;

// Scalecommander changes ID for breath of eons
export const BREATH_OF_EONS_SPELLS = [
  TALENTS.BREATH_OF_EONS_TALENT,
  SPELLS.BREATH_OF_EONS_SCALECOMMANDER,
];
export const BREATH_OF_EONS_SPELL_IDS = BREATH_OF_EONS_SPELLS.map((spell) => spell.id);
