import SPELLS from 'common/SPELLS';

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  SPELLS.ATONEMENT_HEAL_NON_CRIT.id,
  SPELLS.ATONEMENT_HEAL_CRIT.id,
  SPELLS.POWER_WORD_SHIELD.id,
  SPELLS.POWER_WORD_RADIANCE.id,
  SPELLS.HALO_TALENT.id,
  SPELLS.SHADOW_MEND.id,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.LEECH.id,
];

export const ATONEMENT_DAMAGE_SOURCES = {
  [SPELLS.MAGIC_MELEE.id]: true, // Shadow Fiend Melee
  [SPELLS.LIGHTSPAWN_MELEE.id]: true, // Lightspawn Melee
  [SPELLS.SMITE.id]: true,
  [SPELLS.PENANCE.id]: true,
  [SPELLS.HALO_DAMAGE.id]: true,
  [SPELLS.SHADOW_WORD_PAIN.id]: true,
  [SPELLS.PURGE_THE_WICKED_TALENT.id]: true,
  [SPELLS.PURGE_THE_WICKED_BUFF.id]: true,
  [SPELLS.POWER_WORD_SOLACE_TALENT.id]: true,
  [SPELLS.SCHISM_TALENT.id]: true,
  [SPELLS.DIVINE_STAR_DAMAGE.id]: true,
  [SPELLS.HOLY_NOVA.id]: true,
};

export const ATONEMENT_COEFFICIENT = 0.50;
export const POWER_WORD_RADIANCE_COEFFICIENT = 0.625;

// https://www.wowhead.com/spell=137032/discipline-priest
export const DISC_PRIEST_DAMAGE_REDUCTION = 0.67;
