import SPELLS from 'common/SPELLS';

export const BREWS = [SPELLS.PURIFYING_BREW, SPELLS.FORTIFYING_BREW, SPELLS.BLACK_OX_BREW_TALENT];

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

export const SPELLS_WHICH_REMOVE_BOC = [SPELLS.TIGER_PALM, SPELLS.BREATH_OF_FIRE, SPELLS.KEG_SMASH];

export const BASE_AGI = 1468;

// Conduits
export const WALK_WITH_THE_OX_DAMAGE_INCREASE = [
  0,
  0.25,
  0.275,
  0.3,
  0.325,
  0.35,
  0.375,
  0.4,
  0.425,
  0.45,
  0.475,
  0.5,
  0.525,
  0.55,
  0.575,
  0.6,
];
export const CELESTIAL_EFFERVESCENCE_HEALING_INCREASE = [
  0,
  0.188,
  0.206,
  0.225,
  0.244,
  0.263,
  0.281,
  0.3,
  0.319,
  0.338,
  0.356,
  0.375,
  0.394,
  0.413,
  0.431,
  0.45,
];

// Legendaries
export const STORMSTOUTS_LK_MODIFIER = 0.3;
