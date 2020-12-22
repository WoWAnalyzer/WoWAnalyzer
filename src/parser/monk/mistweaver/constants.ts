import SPELLS from 'common/SPELLS';

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  // Spells
  SPELLS.ENVELOPING_MIST.id,
  SPELLS.ESSENCE_FONT.id,
  SPELLS.ESSENCE_FONT_BUFF.id,
  SPELLS.RENEWING_MIST.id,
  SPELLS.RENEWING_MIST_HEAL.id,
  SPELLS.VIVIFY.id,
  SPELLS.SOOTHING_MIST.id,
  SPELLS.GUSTS_OF_MISTS.id,

  // Cooldowns
  SPELLS.REVIVAL.id,

  // Talents
  SPELLS.CHI_BURST_TALENT.id,
  SPELLS.CHI_BURST_HEAL.id,
  SPELLS.CHI_WAVE_TALENT.id,
  SPELLS.REFRESHING_JADE_WIND_TALENT.id,
  SPELLS.REFRESHING_JADE_WIND_HEAL.id,

  // Misc
  SPELLS.LEECH.id,
];

// Core Constants
export const LIFE_COCOON_HEALING_BOOST = .5;
export const TEACHINGS_OF_THE_MONASTERY_DURATION = 20000;

// Talent Constants
export const SPIRIT_OF_THE_CRANE_MANA_RETURN = .0065;

// Conduit scaling
export function conduitScaling(rankOne: number, requiredRank: number) {
  const scalingFactor = rankOne * .1;
  const rankZero = rankOne - scalingFactor;
  const rankRequested = rankZero + scalingFactor * requiredRank;
  return rankRequested;
}

// Rank 1 conduits
export const NOURISHING_CHI_RANK_ONE = .1875;
export const JADE_BOND_RANK_ONE = .0625;
export const RISING_SUN_REVIVAL = .125;

export const LIFECYCLES_MANA_PERC_REDUCTION = 0.25;

