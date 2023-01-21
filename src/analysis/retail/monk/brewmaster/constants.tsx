import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';

export const BREWS = [
  talents.PURIFYING_BREW_TALENT,
  talents.FORTIFYING_BREW_TALENT,
  talents.BLACK_OX_BREW_TALENT,
  talents.CELESTIAL_BREW_TALENT,
  talents.BONEDUST_BREW_TALENT,
];

// Yes there are 7... The cake is a lie (8 really)
export const GIFT_OF_THE_OX_SPELLS = [
  SPELLS.GIFT_OF_THE_OX_1,
  SPELLS.GIFT_OF_THE_OX_2,
  SPELLS.GIFT_OF_THE_OX_3,
  SPELLS.GIFT_OF_THE_OX_4,
  SPELLS.GIFT_OF_THE_OX_5,
  SPELLS.GIFT_OF_THE_OX_6,
  SPELLS.GIFT_OF_THE_OX_7,
  SPELLS.GIFT_OF_THE_OX_8,
];

export const GIFT_OF_THE_OX_SPELL_IDS = GIFT_OF_THE_OX_SPELLS.map(({ id }) => id);

export const SPELLS_WHICH_REMOVE_BOC = [
  SPELLS.TIGER_PALM,
  talents.BREATH_OF_FIRE_TALENT,
  talents.KEG_SMASH_TALENT,
  talents.CELESTIAL_BREW_TALENT,
  talents.PURIFYING_BREW_TALENT,
];

export const WALK_WITH_THE_OX_DAMAGE_INCREASE = [0, 0.1, 0.2];

// Legendaries
export const STORMSTOUTS_LK_MODIFIER = 0.3;
